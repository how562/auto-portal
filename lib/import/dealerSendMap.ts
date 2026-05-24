import { computeVehicleQuality } from "@/lib/vehicleQuality";

export interface HomenetVehicleRow {
  import_key: string;
  vin: string | null;
  stock_number: string | null;
  store_id: string | null;
  dealer_name: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  condition: string | null;
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  mileage: number | null;
  /**
   * Customer-facing price. Never 0 — `parseUsablePrice` collapses
   * 0/blank/non-positive HomeNet values to `null` so the UI can fall
   * back to MSRP and ultimately "Call for Price".
   */
  internet_price: number | null;
  /** Manufacturer suggested retail price, mapped separately. */
  msrp: number | null;
  /** Dealer's quoted selling price, useful for incentive analytics. */
  sale_price: number | null;
  primary_image_url: string | null;
  image_urls: string[] | null;
  image_count: number;
  has_images: boolean;
  data_quality_score: number;
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
  // HomeNet DealerSend uses `Miles`; other feeds use `Mileage` / `Odometer`.
  mileage: ["mileage", "odometer", "miles", "Mileage", "Odometer", "Miles"],
  internet_price: [
    "internetprice",
    "price",
    "InternetPrice",
    "Price",
    "DealerPrice",
  ],
  selling_price: ["sellingprice", "SellingPrice"],
  msrp: ["msrp", "MSRP", "originalmsrp", "OriginalMSRP"],
  exterior_color: ["exteriorcolor", "extcolor", "color", "ExteriorColor", "ExtColor"],
  interior_color: ["interiorcolor", "intcolor", "InteriorColor", "IntColor"],
  // HomeNet DealerSend uses `ImageList` (comma-separated absolute URLs).
  primary_image_url: [
    "imagelist",
    "ImageList",
    "photourl",
    "imageurl",
    "primaryimageurl",
    "photo1",
    "PhotoURL",
    "ImageURL",
    "PrimaryImageURL",
    "MainPhoto",
    "PhotoUrls",
    "Photos",
    "Images",
  ],
  store_id: ["storeid", "dealerid", "rooftopid", "ilotid", "StoreID", "DealerID", "ILotID"],
  dealer_name: ["dealername", "DealerName", "dealershipname", "DealershipName"],
  description: [
    "description",
    "Description",
    "comment1",
    "Comment1",
    "vehiclecomments",
    "VehicleComments",
  ],
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

/**
 * Parse a HomeNet price-like field. 0, blank, missing, and `NaN` all
 * collapse to `null` — every call site treats those as "no price".
 */
function parseUsablePrice(value: string): number | null {
  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Walk every alias for a HomeNet field and return the first
 * positive parsed value. Critically, this iterates each alias so
 * `MSRP="0"` falls through to `OriginalMSRP` instead of stopping
 * at the first non-empty value (which `pickField` would do).
 */
function firstUsablePrice(
  lookup: Map<string, string>,
  field: string,
): number | null {
  const aliases = HEADER_ALIASES[field] ?? [field];
  for (const alias of aliases) {
    const raw = lookup.get(normalizeHeaderKey(alias));
    if (!raw) continue;
    const price = parseUsablePrice(raw);
    if (price !== null) return price;
  }
  return null;
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

function isLikelyImageUrl(value: string): boolean {
  return value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//");
}

/**
 * Split HomeNet `ImageList` / `Photos` payloads into an ordered list of URLs.
 * Accepts comma, pipe, or semicolon separators and drops blanks / non-URLs.
 */
function parseImageUrls(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/[|,;\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && isLikelyImageUrl(part));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/** Read store-identifying fields from a raw feed row (for file-level mapping). */
export function readRowStoreHints(raw: Record<string, string>): {
  storeIdFromFeed: string | null;
  dealerName: string | null;
} {
  const lookup = buildHeaderLookup(raw);
  const storeFromFile = pickField(lookup, "store_id");
  const dealerName = pickField(lookup, "dealer_name") || null;
  return {
    storeIdFromFeed:
      storeFromFile && isUuid(storeFromFile) ? storeFromFile : null,
    dealerName,
  };
}

export function buildImportKey(vin: string, stockNumber: string): string | null {
  const v = vin.trim().toLowerCase();
  const s = stockNumber.trim().toLowerCase();
  if (!v && !s) return null;
  return `${v}|${s}`;
}

export interface MapDealerSendRowOptions {
  defaultStoreId?: string | null;
  importSource?: string;
  /**
   * When set, every row in the file uses this store — prevents cross-store mixing
   * during multi-dealer SFTP imports.
   */
  forcedStoreId?: string | null;
  /**
   * Optional lookup keyed by lowercased dealer name. When `DealerName` matches
   * an entry, that store_id is preferred over `defaultStoreId`.
   */
  storeIdByDealerName?: Map<string, string>;
}

export function mapDealerSendRow(
  raw: Record<string, string>,
  options: MapDealerSendRowOptions = {},
): HomenetVehicleRow | null {
  const lookup = buildHeaderLookup(raw);
  const vin = pickField(lookup, "vin") || null;
  const stock_number = pickField(lookup, "stock_number") || null;
  const import_key = buildImportKey(vin ?? "", stock_number ?? "");

  if (!import_key) {
    return null;
  }

  const storeFromFile = pickField(lookup, "store_id");
  const dealerName = pickField(lookup, "dealer_name");
  const dealerLookupId = dealerName
    ? options.storeIdByDealerName?.get(dealerName.trim().toLowerCase()) ?? null
    : null;
  const store_id =
    options.forcedStoreId ??
    ((storeFromFile && isUuid(storeFromFile) ? storeFromFile : null) ||
      dealerLookupId ||
      options.defaultStoreId ||
      null);

  const statusRaw = pickField(lookup, "status");
  const status =
    statusRaw && /sold|delete|inactive|removed/i.test(statusRaw)
      ? "inactive"
      : "active";

  const imageList = parseImageUrls(pickField(lookup, "primary_image_url"));
  const primaryImageUrl = imageList[0] ?? null;
  const imageUrls = imageList.length > 0 ? imageList : null;

  const trim = pickField(lookup, "trim") || null;
  const exterior_color = pickField(lookup, "exterior_color") || null;
  const interior_color = pickField(lookup, "interior_color") || null;
  const mileage = parseIntegerField(pickField(lookup, "mileage"));

  // Map each HomeNet price field to its own column. HomeNet routinely
  // sends Internet_Price=0 on new vehicles where the real number lives
  // under SellingPrice or MSRP, so the rules below treat 0 as missing
  // and fall back through the chain — never writing $0 to the DB.
  const sale_price = firstUsablePrice(lookup, "selling_price");
  const msrp = firstUsablePrice(lookup, "msrp");
  const internet_price =
    firstUsablePrice(lookup, "internet_price") ?? sale_price ?? null;
  const description = pickField(lookup, "description") || null;

  const quality = computeVehicleQuality({
    image_urls: imageUrls,
    internet_price,
    msrp,
    mileage,
    trim,
    exterior_color,
    interior_color,
    description,
  });

  return {
    import_key,
    vin: vin || null,
    stock_number: stock_number || null,
    store_id,
    dealer_name: dealerName || null,
    year: parseIntegerField(pickField(lookup, "year")),
    make: pickField(lookup, "make") || null,
    model: pickField(lookup, "model") || null,
    trim,
    condition: normalizeCondition(pickField(lookup, "condition")),
    body_style: pickField(lookup, "body_style") || null,
    exterior_color,
    interior_color,
    mileage,
    internet_price,
    msrp,
    sale_price,
    primary_image_url: primaryImageUrl,
    image_urls: imageUrls,
    image_count: quality.image_count,
    has_images: quality.has_images,
    data_quality_score: quality.data_quality_score,
    status,
    source_raw: raw,
    import_source: options.importSource ?? "homenet_dealer_send",
    imported_at: new Date().toISOString(),
  };
}
