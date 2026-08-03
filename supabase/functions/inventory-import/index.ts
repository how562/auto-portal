/**
 * Auto Portal inventory-import Edge Function
 *
 * Portal-owned (this Supabase project only — never GEO).
 *
 * Runtime note
 * ------------
 * The canonical multi-store importer lives in Next.js:
 *   lib/import/vautoImport.ts → GET/POST /api/import-vauto
 * because feed_file_mappings, vehicleUpsert, and HomeNet-parity logging already
 * run on Node with ssh2-sftp-client.
 *
 * This Edge Function is a cron-compatible entry that:
 *   1. Preferentially proxies to PORTAL_IMPORT_URL /api/import-vauto (no logic dup)
 *   2. Falls back to an embedded single-store inline/SFTP upsert when
 *      PORTAL_IMPORT_URL is unset (storeId required)
 *
 * Auth: IMPORT_SECRET or IMPORT_CRON_SECRET / CRON_SECRET
 *   Header: x-import-secret | Authorization: Bearer | x-cron-secret
 *
 * Body (POST JSON):
 *   { csvContent?, fileName?, storeId?, mode?: "sftp" | "inline" }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import SftpClient from "npm:ssh2-sftp-client@11.0.0";
import {
  isInventoryFileName,
  mapRowToCanonical,
  parseInventoryFile,
  type CanonicalEdgeRow,
} from "../_shared/vautoCsv.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-import-secret, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readAuthSecrets(): string[] {
  return [
    Deno.env.get("IMPORT_SECRET")?.trim(),
    Deno.env.get("IMPORT_CRON_SECRET")?.trim(),
    Deno.env.get("CRON_SECRET")?.trim(),
  ].filter((v): v is string => Boolean(v));
}

function isAuthorized(req: Request): boolean {
  const secrets = readAuthSecrets();
  if (secrets.length === 0) return false;
  const provided =
    req.headers.get("x-import-secret")?.trim() ||
    req.headers.get("x-cron-secret")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return Boolean(provided && secrets.includes(provided));
}

async function proxyToNextJs(
  req: Request,
  body: Record<string, unknown>,
): Promise<Response> {
  const base = Deno.env.get("PORTAL_IMPORT_URL")?.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("PORTAL_IMPORT_URL is not set");
  }
  const secret =
    req.headers.get("x-import-secret")?.trim() ||
    req.headers.get("x-cron-secret")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    readAuthSecrets()[0];

  const hasInline = Boolean(
    typeof body.csvContent === "string" && body.csvContent.trim(),
  );
  const url = `${base}/api/import-vauto`;
  const upstream = await fetch(url, {
    method: hasInline || body.mode === "inline" ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "x-import-secret": secret ?? "",
    },
    body:
      hasInline || body.mode === "inline"
        ? JSON.stringify({
            csvContent: body.csvContent,
            fileName: body.fileName,
            storeId: body.storeId,
          })
        : undefined,
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type SftpEnv = {
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath: string;
};

function readSftpEnv(): SftpEnv {
  const strip = (v: string) => v.trim().replace(/^["']|["']$/g, "");
  const host = strip(Deno.env.get("VAUTO_SFTP_HOST") || "");
  const username = strip(Deno.env.get("VAUTO_SFTP_USER") || "");
  const password = strip(Deno.env.get("VAUTO_SFTP_PASSWORD") || "");
  const remotePath = strip(Deno.env.get("VAUTO_SFTP_PATH") || "") || "/vauto";
  const port = Number(strip(Deno.env.get("VAUTO_SFTP_PORT") || "") || 22);
  if (!host || !username || !password) {
    throw new Error(
      "Set VAUTO_SFTP_HOST, VAUTO_SFTP_USER, and VAUTO_SFTP_PASSWORD secrets.",
    );
  }
  return { host, port, username, password, remotePath };
}

async function downloadSftpFiles(): Promise<
  Array<{ fileName: string; remotePath: string; content: string }>
> {
  const config = readSftpEnv();
  const client = new SftpClient();
  await client.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
  });
  try {
    const listing = await client.list(config.remotePath);
    const files = listing.filter(
      (e) => e.type === "-" && isInventoryFileName(e.name),
    );
    if (files.length === 0) {
      throw new Error(`No CSV/TXT files in ${config.remotePath}`);
    }
    const out: Array<{ fileName: string; remotePath: string; content: string }> =
      [];
    for (const entry of files) {
      const remotePath = `${config.remotePath.replace(/\/+$/, "")}/${entry.name}`;
      const buf = await client.get(remotePath);
      const content =
        typeof buf === "string"
          ? buf
          : new TextDecoder().decode(
              buf instanceof Uint8Array
                ? buf
                : new Uint8Array(buf as ArrayBuffer),
            );
      out.push({ fileName: entry.name, remotePath, content });
      // Do not delete SFTP files.
    }
    return out;
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

async function upsertRows(
  admin: ReturnType<typeof createClient>,
  rows: CanonicalEdgeRow[],
): Promise<{ upserted: number; errors: number; seenVins: string[] }> {
  let upserted = 0;
  let errors = 0;
  const seenVins: string[] = [];

  for (const row of rows) {
    try {
      if (row.vin) {
        const { data: existing } = await admin
          .from("vehicles")
          .select("id")
          .eq("store_id", row.store_id)
          .eq("vin", row.vin)
          .eq("inventory_provider", "vauto")
          .maybeSingle();

        if (existing?.id) {
          const { error } = await admin
            .from("vehicles")
            .update({
              stock_number: row.stock_number,
              dealer_name: row.dealer_name,
              year: row.year,
              make: row.make,
              model: row.model,
              trim: row.trim,
              condition: row.condition,
              body_style: row.body_style,
              exterior_color: row.exterior_color,
              interior_color: row.interior_color,
              mileage: row.mileage,
              internet_price: row.internet_price,
              msrp: row.msrp,
              sale_price: row.sale_price,
              primary_image_url: row.primary_image_url,
              image_urls: row.image_urls,
              image_count: row.image_count,
              has_images: row.has_images,
              data_quality_score: row.data_quality_score,
              status: row.status,
              source_raw: row.source_raw,
              import_source: row.import_source,
              import_key: row.import_key,
              imported_at: row.imported_at,
              last_seen_at: row.last_seen_at,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await admin.from("vehicles").insert(row);
          if (error) throw error;
        }
        seenVins.push(row.vin);
        upserted += 1;
      } else if (row.stock_number) {
        const { data: existing } = await admin
          .from("vehicles")
          .select("id")
          .eq("store_id", row.store_id)
          .eq("stock_number", row.stock_number)
          .eq("inventory_provider", "vauto")
          .is("vin", null)
          .maybeSingle();
        if (existing?.id) {
          const { error } = await admin
            .from("vehicles")
            .update({
              ...row,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await admin.from("vehicles").insert(row);
          if (error) throw error;
        }
        upserted += 1;
      }
    } catch {
      errors += 1;
    }
  }
  return { upserted, errors, seenVins };
}

async function softDeactivate(
  admin: ReturnType<typeof createClient>,
  storeId: string,
  seenVins: string[],
): Promise<number> {
  const seen = new Set(seenVins.map((v) => v.toUpperCase()));
  const { data: active, error } = await admin
    .from("vehicles")
    .select("id, vin")
    .eq("store_id", storeId)
    .eq("inventory_provider", "vauto")
    .eq("status", "active");
  if (error) throw error;

  const ids = (active ?? [])
    .filter((row) => {
      const vin = ((row.vin as string | null) ?? "").toUpperCase();
      if (!vin) return false; // stock-only: leave alone
      return !seen.has(vin);
    })
    .map((r) => r.id as string);

  if (ids.length === 0) return 0;
  const { error: updateError } = await admin
    .from("vehicles")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("inventory_provider", "vauto");
  if (updateError) throw updateError;
  return ids.length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (readAuthSecrets().length === 0) {
    return jsonResponse(
      { error: "IMPORT_SECRET / IMPORT_CRON_SECRET not configured" },
      500,
    );
  }
  if (!isAuthorized(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Preferred: proxy to Next.js shared importer (no duplicated multi-store logic).
  if (Deno.env.get("PORTAL_IMPORT_URL")?.trim()) {
    try {
      return await proxyToNextJs(req, body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Proxy failed";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }

  // Fallback: single-store Edge upsert (storeId required).
  const storeId =
    typeof body.storeId === "string" ? body.storeId.trim() : "";
  if (!storeId) {
    return jsonResponse(
      {
        error:
          "storeId is required when PORTAL_IMPORT_URL is unset (single-store Edge fallback).",
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const inline =
      typeof body.csvContent === "string" ? body.csvContent.trim() : "";
    const files = inline
      ? [
          {
            fileName:
              (typeof body.fileName === "string" && body.fileName.trim()) ||
              "inline-upload.csv",
            remotePath: "inline",
            content: inline,
          },
        ]
      : await downloadSftpFiles();

    let rowsUpserted = 0;
    let errorCount = 0;
    const allSeen: string[] = [];

    for (const file of files) {
      const parsed = parseInventoryFile(file.content);
      const mapped: CanonicalEdgeRow[] = [];
      for (const raw of parsed.rows) {
        const row = mapRowToCanonical(raw, storeId);
        if (row) mapped.push(row);
        else errorCount += 1;
      }
      const result = await upsertRows(admin, mapped);
      rowsUpserted += result.upserted;
      errorCount += result.errors;
      allSeen.push(...result.seenVins);
    }

    const deactivated = await softDeactivate(admin, storeId, allSeen);

    await admin
      .from("inventory_feed_sources")
      .update({
        last_import_at: new Date().toISOString(),
        last_vehicle_count: rowsUpserted,
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", storeId)
      .eq("provider", "vauto");

    return jsonResponse({
      ok: rowsUpserted > 0,
      mode: inline ? "inline" : "sftp",
      runtime: "edge-fallback",
      storeId,
      rowsUpserted,
      rowsDeactivated: deactivated,
      errorCount,
      note:
        "Set PORTAL_IMPORT_URL to proxy to the canonical Next.js importer for multi-store mapping.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
