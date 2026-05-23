export interface HomenetVehicleRow {
  import_key: string;
  vin: string | null;
  stock_number: string | null;
  store_id: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  condition: string | null;
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  mileage: number | null;
  internet_price: number | null;
  primary_image_url: string | null;
  status: string;
  source_raw: Record<string, string>;
  import_source: string;
  imported_at: string;
}

const HEADER_ALIASES: Record<string, string[]> = {
  vin: ["vin", "VIN", "VehicleVIN"],
  stock_number: [
    "stocknumber",
    "stockno",
    "stock",
    "stock_number",
    "StockNumber",
    "StockNo",
  ],
  year: ["year", "modelyear", "Year", "ModelYear"],
  make: ["make", "Make"],
  model: ["model", "Model"],
  trim: ["trim", "Trim", "style", "Style", "series", "Series"],
  body_style: ["bodystyle", "body", "BodyStyle", "Body", "vehicletype", "VehicleType"],
  condition: [
    "condition",
    "newused",
    "type",
    "Condition",
    "NewUsed",
    "VehicleCondition",
  ],
  mileage: ["mileage", "odometer", "Mileage", "Odometer"],
  internet_price: [
    "internetprice",
    "price",
    "sellingprice",
    "msrp",
    "InternetPrice",
    "Price",
    "SellingPrice",
    "MSRP",
    "DealerPrice",
  ],
  exterior_color: ["exteriorcolor", "extcolor", "color", "ExteriorColor", "ExtColor"],
  interior_color: ["interiorcolor", "intcolor", "InteriorColor", "IntColor"],
  primary_image_url: [
    "photourl",
    "imageurl",
    "primaryimageurl",
    "photo1",
    "PhotoURL",
    "ImageURL",
    "PrimaryImageURL",
    "MainPhoto",
    "PhotoUrls",
  ],
  store_id: ["storeid", "dealerid", "rooftopid", "ilotid", "StoreID", "DealerID", "ILotID"],
  status: ["status", "inventorystatus", "Status", "InventoryStatus"],
};

function normalizeHeaderKey(header: string): string {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function buildHeaderLookup(
  raw: Record<string, string>,
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [header, value] of Object.entries(raw)) {
    lookup.set(normalizeHeaderKey(header), value);
  }
  return lookup;
}

function pickField(lookup: Map<string, string>, field: string): string {
  const aliases = HEADER_ALIASES[field] ?? [field];
  for (const alias of aliases) {
    const value = lookup.get(normalizeHeaderKey(alias));
    if (value?.trim()) return value.trim();
  }
  return "";
}

/** Parse integer columns (year, mileage); rounds decimals instead of truncating. */
function parseIntegerField(value: string): number | null {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalizeCondition(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v === "n" || v === "new" || v.startsWith("new")) return "new";
  if (v === "u" || v === "used" || v.startsWith("used") || v.includes("pre")) {
    return "used";
  }
  if (v.includes("cert") || v === "cpo") return "cpo";
  return v;
}

function firstImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const first = trimmed.split(/[|,;]/)[0]?.trim();
  return first && (first.startsWith("http") || first.startsWith("//"))
    ? first
    : trimmed.startsWith("http")
      ? trimmed
      : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function buildImportKey(vin: string, stockNumber: string): string | null {
  const v = vin.trim().toLowerCase();
  const s = stockNumber.trim().toLowerCase();
  if (!v && !s) return null;
  return `${v}|${s}`;
}

export function mapDealerSendRow(
  raw: Record<string, string>,
  options: {
    defaultStoreId?: string | null;
    importSource?: string;
  } = {},
): HomenetVehicleRow | null {
  const lookup = buildHeaderLookup(raw);
  const vin = pickField(lookup, "vin") || null;
  const stock_number = pickField(lookup, "stock_number") || null;
  const import_key = buildImportKey(vin ?? "", stock_number ?? "");

  if (!import_key) {
    return null;
  }

  const storeFromFile = pickField(lookup, "store_id");
  const store_id =
    storeFromFile && isUuid(storeFromFile)
      ? storeFromFile
      : options.defaultStoreId || null;
  const statusRaw = pickField(lookup, "status");
  const status =
    statusRaw && /sold|delete|inactive|removed/i.test(statusRaw)
      ? "inactive"
      : "active";

  return {
    import_key,
    vin: vin || null,
    stock_number: stock_number || null,
    store_id,
    year: parseIntegerField(pickField(lookup, "year")),
    make: pickField(lookup, "make") || null,
    model: pickField(lookup, "model") || null,
    trim: pickField(lookup, "trim") || null,
    condition: normalizeCondition(pickField(lookup, "condition")),
    body_style: pickField(lookup, "body_style") || null,
    exterior_color: pickField(lookup, "exterior_color") || null,
    interior_color: pickField(lookup, "interior_color") || null,
    mileage: parseIntegerField(pickField(lookup, "mileage")),
    internet_price: parsePrice(pickField(lookup, "internet_price")),
    primary_image_url: firstImageUrl(pickField(lookup, "primary_image_url")),
    status,
    source_raw: raw,
    import_source: options.importSource ?? "homenet_dealer_send",
    imported_at: new Date().toISOString(),
  };
}
