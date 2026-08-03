/**
 * Shared vAuto field helpers (aliases, normalization, image URL parsing).
 * Adapted from GEO inventoryCsv patterns for Auto Portal canonical rows.
 */

export function normalizeHeaderKey(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export const VAUTO_FIELD_ALIASES: Record<string, string[]> = {
  vin: ["vin", "vehiclevin", "vehicle_vin"],
  stock_number: [
    "stock",
    "stocknumber",
    "stock_number",
    "stockno",
    "stock_no",
    "stock#",
  ],
  year: ["year", "modelyear", "model_year"],
  make: ["make", "vehicle_make"],
  model: ["model", "vehicle_model"],
  trim: [
    "trim",
    "trimlevel",
    "trim_level",
    "series",
    "seriesdetail",
    "series_detail",
  ],
  condition: [
    "condition",
    "type",
    "vehicletype",
    "vehicle_type",
    "newused",
    "new_used",
  ],
  mileage: ["mileage", "odometer", "miles", "odometerreading"],
  internet_price: [
    "price",
    "sellingprice",
    "selling_price",
    "internetprice",
    "internet_price",
    "saleprice",
    "sale_price",
    "ourprice",
  ],
  sale_price: ["sellingprice", "selling_price", "saleprice", "sale_price"],
  msrp: ["msrp", "retailprice", "retail_price", "listprice", "originalmsrp"],
  exterior_color: [
    "exteriorcolor",
    "exterior_color",
    "extcolor",
    "ext_color",
    "color",
    "colour",
    "exterior",
  ],
  interior_color: [
    "interiorcolor",
    "interior_color",
    "intcolor",
    "int_color",
    "interior",
  ],
  body_style: [
    "bodystyle",
    "body_style",
    "bodytype",
    "body_type",
    "body",
    "style",
  ],
  description: [
    "description",
    "comments",
    "vehicledescription",
    "vehicle_description",
  ],
  dealer_name: [
    "dealername",
    "dealer_name",
    "dealer",
    "storename",
    "store_name",
  ],
  dealer_identifier: [
    "dealerid",
    "dealer_id",
    "dealeridentifier",
    "dealer_identifier",
    "dealercode",
    "dealer_code",
    "storecode",
    "store_code",
    "locationcode",
    "location_code",
    "storeid",
    "store_id",
  ],
  status: ["status", "inventorystatus", "disposition"],
};

export const VAUTO_IMAGE_ALIASES = [
  "photourllist",
  "photo_url_list",
  "images",
  "image",
  "photos",
  "photo",
  "photo_urls",
  "photourls",
  "photourl",
  "image_urls",
  "imageurls",
  "imagelist",
  "image_list",
  "primaryimage",
  "primary_image",
  "thumbnail",
];

export function buildHeaderLookup(
  raw: Record<string, string>,
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [header, value] of Object.entries(raw)) {
    lookup.set(normalizeHeaderKey(header), value);
  }
  return lookup;
}

export function pickField(
  lookup: Map<string, string>,
  fieldOrAliases: string | string[],
): string {
  const aliases = Array.isArray(fieldOrAliases)
    ? fieldOrAliases
    : (VAUTO_FIELD_ALIASES[fieldOrAliases] ?? [fieldOrAliases]);
  for (const alias of aliases) {
    const value = lookup.get(normalizeHeaderKey(alias));
    if (value != null && value.trim() !== "") return value.trim();
  }
  return "";
}

/** Parse integer columns (year, mileage). */
export function parseIntegerField(value: string): number | null {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

/** Parse price; 0 / blank / non-positive → null. */
export function parseUsablePrice(value: string): number | null {
  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function firstUsablePrice(
  lookup: Map<string, string>,
  field: string,
): number | null {
  const aliases = VAUTO_FIELD_ALIASES[field] ?? [field];
  for (const alias of aliases) {
    const raw = lookup.get(normalizeHeaderKey(alias));
    if (!raw) continue;
    const price = parseUsablePrice(raw);
    if (price !== null) return price;
  }
  return null;
}

/** Normalize vAuto N/U and common free-text condition values. */
export function normalizeCondition(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v === "n" || v === "new" || (v.includes("new") && !v.includes("used"))) {
    return "new";
  }
  if (v.includes("cert") || v === "cpo") return "cpo";
  if (
    v === "u" ||
    v === "used" ||
    v.includes("used") ||
    v.includes("pre-owned") ||
    v.includes("preowned") ||
    v.includes("pre owned")
  ) {
    return "used";
  }
  return value.trim();
}

function isLikelyHttpUrl(value: string): boolean {
  if (value.startsWith("//")) {
    try {
      const u = new URL(`https:${value}`);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Split photo fields into an ordered list of remote HTTP(S) URLs.
 * First URL is primary. Non-http values are dropped (no Storage download).
 */
export function parseImageUrls(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/[|,;\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && isLikelyHttpUrl(part))
    .map((url) => (url.startsWith("//") ? `https:${url}` : url));
}

export function buildImportKey(vin: string, stockNumber: string): string | null {
  const v = vin.trim().toLowerCase();
  const s = stockNumber.trim().toLowerCase();
  if (!v && !s) return null;
  return `${v}|${s}`;
}

export function normalizeDealerToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function fileMatchesDealerIdentifier(
  fileName: string,
  dealerIdentifier: string,
): boolean {
  const fileToken = normalizeDealerToken(fileName.replace(/\.(csv|txt)$/i, ""));
  const dealerToken = normalizeDealerToken(dealerIdentifier);
  if (!dealerToken) return false;
  return fileToken.includes(dealerToken) || dealerToken.includes(fileToken);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
