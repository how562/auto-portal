/**
 * Shared vAuto CSV helpers for the Deno Edge Function.
 * Keep in sync with lib/import/providers/vauto/vautoFieldUtils.ts + vautoMap.ts.
 * Portal Next.js importer remains the canonical multi-store implementation.
 */

export type ParsedInventoryFile = {
  delimiter: string;
  headers: string[];
  rows: Record<string, string>[];
};

export type CanonicalEdgeRow = {
  import_key: string;
  vin: string | null;
  stock_number: string | null;
  store_id: string;
  dealer_name: string | null;
  year: number | null;
  make: string;
  model: string;
  trim: string | null;
  condition: string | null;
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  mileage: number | null;
  internet_price: number | null;
  msrp: number | null;
  sale_price: number | null;
  primary_image_url: string | null;
  image_urls: string[] | null;
  image_count: number;
  has_images: boolean;
  data_quality_score: number;
  status: string;
  source_raw: Record<string, string>;
  import_source: string;
  inventory_provider: "vauto";
  imported_at: string;
  last_seen_at: string;
};

const FIELD_ALIASES: Record<string, string[]> = {
  vin: ["vin", "vehiclevin"],
  stock_number: ["stock", "stocknumber", "stockno", "stock#"],
  year: ["year", "modelyear"],
  make: ["make"],
  model: ["model"],
  trim: ["trim", "series", "seriesdetail"],
  condition: ["condition", "newused", "type"],
  mileage: ["mileage", "odometer", "miles"],
  internet_price: [
    "price",
    "sellingprice",
    "internetprice",
    "saleprice",
    "ourprice",
  ],
  msrp: ["msrp", "retailprice", "listprice"],
  exterior_color: ["exteriorcolor", "extcolor", "color", "colour"],
  interior_color: ["interiorcolor", "intcolor", "interior"],
  body_style: ["bodystyle", "body", "bodytype"],
  dealer_name: ["dealername", "dealer", "storename"],
  status: ["status", "disposition"],
};

const IMAGE_ALIASES = [
  "photourllist",
  "photos",
  "photourls",
  "imagelist",
  "images",
  "imageurls",
];

export function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\ufeff/, "")
    .replace(/[^a-z0-9]+/g, "");
}

function countDelimiter(line: string, delimiter: string): number {
  return line.split(delimiter).length - 1;
}

export function detectDelimiter(headerLine: string): "|" | "\t" | "," {
  const pipe = countDelimiter(headerLine, "|");
  const tab = countDelimiter(headerLine, "\t");
  const comma = countDelimiter(headerLine, ",");
  if (pipe >= tab && pipe >= comma && pipe > 0) return "|";
  if (tab >= comma && tab > 0) return "\t";
  return ",";
}

function parseCsvDocument(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === ",") {
      row.push(current.trim());
      current = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    current += char;
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }
  return rows;
}

export function parseInventoryFile(content: string): ParsedInventoryFile {
  const trimmed = content.replace(/^\ufeff/, "");
  const lowerStart = trimmed.trimStart().slice(0, 200).toLowerCase();
  if (lowerStart.startsWith("<?xml") || lowerStart.startsWith("<")) {
    throw new Error("XML inventory feeds are not supported. Export CSV or TXT.");
  }
  if (lowerStart.startsWith("{") || lowerStart.startsWith("[")) {
    throw new Error("JSON inventory feeds are not supported. Export CSV or TXT.");
  }

  const firstNonEmpty =
    trimmed.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
  if (!firstNonEmpty) {
    throw new Error("Inventory file must include a header row.");
  }

  const delimiter = detectDelimiter(firstNonEmpty);
  let matrix: string[][];
  if (delimiter === ",") {
    matrix = parseCsvDocument(trimmed);
  } else {
    matrix = trimmed
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(delimiter).map((c) => c.trim()));
  }

  if (matrix.length < 2) {
    throw new Error("Inventory file must include a header and at least one data row.");
  }

  const headers = matrix[0].map(normalizeHeader);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < matrix.length; i += 1) {
    const values = matrix[i];
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      row[header] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return { delimiter, headers, rows };
}

function pickField(lookup: Map<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = lookup.get(normalizeHeader(alias));
    if (value != null && value.trim() !== "") return value.trim();
  }
  return "";
}

function parseIntegerField(raw: string): number | null {
  if (!raw?.trim()) return null;
  const n = parseInt(String(raw).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function parseNumberField(raw: string): number | null {
  if (!raw?.trim()) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n) || n === 0) return null;
  return n;
}

export function parseImageUrls(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/[|,;\s]+/)
    .map((part) => part.trim())
    .filter((part) => {
      try {
        const u = new URL(part.startsWith("//") ? `https:${part}` : part);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    })
    .map((url) => (url.startsWith("//") ? `https:${url}` : url));
}

export function normalizeCondition(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (v === "n" || v === "new" || (v.includes("new") && !v.includes("used"))) {
    return "new";
  }
  if (v.includes("cert") || v === "cpo") return "cpo";
  if (v === "u" || v === "used" || v.includes("used") || v.includes("pre")) {
    return "used";
  }
  return raw.trim();
}

export function mapRowToCanonical(
  raw: Record<string, string>,
  storeId: string,
): CanonicalEdgeRow | null {
  const lookup = new Map<string, string>();
  for (const [k, v] of Object.entries(raw)) {
    lookup.set(normalizeHeader(k), v);
  }

  const vin = pickField(lookup, FIELD_ALIASES.vin) || null;
  const stock_number = pickField(lookup, FIELD_ALIASES.stock_number) || null;
  if (!vin && !stock_number) return null;

  const make = pickField(lookup, FIELD_ALIASES.make);
  const model = pickField(lookup, FIELD_ALIASES.model);
  if (!make || !model) return null;

  const imageUrls = parseImageUrls(pickField(lookup, IMAGE_ALIASES));
  const internet_price = parseNumberField(
    pickField(lookup, FIELD_ALIASES.internet_price),
  );
  const msrp = parseNumberField(pickField(lookup, FIELD_ALIASES.msrp));
  const statusRaw = pickField(lookup, FIELD_ALIASES.status);
  const status =
    statusRaw && /sold|delete|inactive|removed|wholesale/i.test(statusRaw)
      ? "inactive"
      : "active";
  const now = new Date().toISOString();
  const import_key = `${(vin ?? "").toLowerCase()}|${(stock_number ?? "").toLowerCase()}`;

  return {
    import_key,
    vin,
    stock_number,
    store_id: storeId,
    dealer_name: pickField(lookup, FIELD_ALIASES.dealer_name) || null,
    year: parseIntegerField(pickField(lookup, FIELD_ALIASES.year)),
    make,
    model,
    trim: pickField(lookup, FIELD_ALIASES.trim) || null,
    condition: normalizeCondition(pickField(lookup, FIELD_ALIASES.condition)),
    body_style: pickField(lookup, FIELD_ALIASES.body_style) || null,
    exterior_color: pickField(lookup, FIELD_ALIASES.exterior_color) || null,
    interior_color: pickField(lookup, FIELD_ALIASES.interior_color) || null,
    mileage: parseIntegerField(pickField(lookup, FIELD_ALIASES.mileage)),
    internet_price,
    msrp,
    sale_price: internet_price,
    primary_image_url: imageUrls[0] ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    image_count: imageUrls.length,
    has_images: imageUrls.length > 0,
    data_quality_score: Math.min(100, imageUrls.length * 10 + (internet_price ? 20 : 0)),
    status,
    source_raw: raw,
    import_source: "vauto",
    inventory_provider: "vauto",
    imported_at: now,
    last_seen_at: now,
  };
}

export function isInventoryFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".csv") || lower.endsWith(".txt");
}
