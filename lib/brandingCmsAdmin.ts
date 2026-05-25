import { getBrandingCmsFallbackBundle, getBrandingCmsSeedPayloads } from "@/lib/brandingCmsFallback";
import type {
  BrandingCmsBundle,
  BrandingCmsResource,
  BrandingColorRow,
  BrandingDealerReferenceRow,
  BrandingDisclaimerRow,
  BrandingLogoRow,
  BrandingMessagingRow,
  BrandingTypographyRow,
} from "@/lib/brandingCmsTypes";
import { hexToRgb, normalizeHex } from "@/lib/brandingCmsUtils";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function ts(): string {
  return new Date().toISOString();
}

async function tableCount(table: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function seedBrandingCmsIfEmpty(): Promise<boolean> {
  const tables = [
    "branding_logos",
    "branding_colors",
    "branding_typography",
    "branding_messaging",
    "branding_disclaimers",
    "branding_dealer_references",
  ] as const;
  for (const table of tables) {
    if ((await tableCount(table)) > 0) return false;
  }
  const payloads = getBrandingCmsSeedPayloads();
  const supabase = getSupabaseAdmin();
  const inserts: { table: string; rows: Record<string, unknown>[] }[] = [
    { table: "branding_logos", rows: payloads.logos },
    { table: "branding_colors", rows: payloads.colors },
    { table: "branding_typography", rows: payloads.typography },
    { table: "branding_messaging", rows: payloads.messaging },
    { table: "branding_disclaimers", rows: payloads.disclaimers },
    { table: "branding_dealer_references", rows: payloads.dealerReferences },
  ];
  for (const { table, rows } of inserts) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`Seed ${table} failed: ${error.message}`);
  }
  return true;
}

export async function loadBrandingCmsBundle(
  options?: { autoSeed?: boolean },
): Promise<BrandingCmsBundle> {
  const supabase = getSupabaseAdmin();
  const [logos, colors, typography, messaging, disclaimers, dealers] =
    await Promise.all([
      supabase.from("branding_logos").select("*").order("sort_order").order("name"),
      supabase.from("branding_colors").select("*").order("sort_order").order("name"),
      supabase.from("branding_typography").select("*").order("sort_order").order("font_role"),
      supabase.from("branding_messaging").select("*").order("sort_order").order("title"),
      supabase.from("branding_disclaimers").select("*").order("sort_order").order("title"),
      supabase
        .from("branding_dealer_references")
        .select("*")
        .order("sort_order")
        .order("store_name"),
    ]);

  const errors = [
    logos.error,
    colors.error,
    typography.error,
    messaging.error,
    disclaimers.error,
    dealers.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e!.message).join("; "));
  }

  const total =
    (logos.data?.length ?? 0) +
    (colors.data?.length ?? 0) +
    (typography.data?.length ?? 0) +
    (messaging.data?.length ?? 0) +
    (disclaimers.data?.length ?? 0) +
    (dealers.data?.length ?? 0);

  if (total === 0 && options?.autoSeed) {
    await seedBrandingCmsIfEmpty();
    return loadBrandingCmsBundle({ autoSeed: false });
  }

  if (total === 0) {
    return getBrandingCmsFallbackBundle();
  }

  return {
    source: "database",
    logos: (logos.data ?? []) as BrandingLogoRow[],
    colors: (colors.data ?? []) as BrandingColorRow[],
    typography: (typography.data ?? []) as BrandingTypographyRow[],
    messaging: (messaging.data ?? []) as BrandingMessagingRow[],
    disclaimers: (disclaimers.data ?? []) as BrandingDisclaimerRow[],
    dealerReferences: (dealers.data ?? []) as BrandingDealerReferenceRow[],
  };
}

export async function listBrandingResource(
  resource: BrandingCmsResource,
): Promise<unknown[]> {
  const bundle = await loadBrandingCmsBundle();
  switch (resource) {
    case "logos":
      return bundle.logos;
    case "colors":
      return bundle.colors;
    case "typography":
      return bundle.typography;
    case "messaging":
      return bundle.messaging;
    case "disclaimers":
      return bundle.disclaimers;
    case "dealer-references":
      return bundle.dealerReferences;
  }
}

export async function createBrandingResource(
  resource: BrandingCmsResource,
  input: Record<string, unknown>,
): Promise<unknown> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = { ...input, updated_at: ts() };

  if (resource === "colors" && typeof input.hex === "string") {
    const hex = normalizeHex(input.hex);
    payload.hex = hex;
    payload.rgb = hexToRgb(hex);
  }

  const table = resourceTable(resource);
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBrandingResource(
  resource: BrandingCmsResource,
  id: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = { ...input, updated_at: ts() };

  if (resource === "colors" && typeof input.hex === "string") {
    const hex = normalizeHex(input.hex);
    payload.hex = hex;
    payload.rgb = hexToRgb(hex);
  }

  const { data, error } = await supabase
    .from(resourceTable(resource))
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBrandingResource(
  resource: BrandingCmsResource,
  id: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(resourceTable(resource)).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function resourceTable(resource: BrandingCmsResource): string {
  switch (resource) {
    case "logos":
      return "branding_logos";
    case "colors":
      return "branding_colors";
    case "typography":
      return "branding_typography";
    case "messaging":
      return "branding_messaging";
    case "disclaimers":
      return "branding_disclaimers";
    case "dealer-references":
      return "branding_dealer_references";
    default:
      return "branding_logos";
  }
}
