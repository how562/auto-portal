import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import { computeVehicleQuality } from "@/lib/vehicleQuality";
import { buildImportKey } from "@/lib/import/dealerSendMap";

/**
 * Real vAuto export columns (production DigitalOcean CSV feeds).
 * Validated against the live header layout used by Cavender dealership exports:
 * DealerId, Dealer Name, VIN, Stock #, New/Used, Year, Make, Model, …
 * Photo Url List, Colour, Odometer, MSRP, Price, Certified, Disposition, etc.
 */
const HEADER_ALIASES: Record<string, string[]> = {
  vin: ["vin", "vehiclevin", "vehicle_vin"],
  stock_number: [
    "stock#",
    "stock",
    "stocknumber",
    "stock_number",
    "stockno",
    "stock_no",
  ],
  year: ["year", "modelyear", "model_year"],
  make: ["make", "vehicle_make"],
  model: ["model", "vehicle_model"],
  trim: [
    "series",
    "seriesdetail",
    "series_detail",
    "trim",
    "trimlevel",
    "trim_level",
  ],
  body_style: ["body", "bodystyle", "body_style", "bodytype", "body_type"],
  condition: ["newused", "new_used", "condition", "type", "vehicletype"],
  certified: ["certified"],
  mileage: ["odometer", "mileage", "miles", "odometerreading"],
  internet_price: [
    "price",
    "sellingprice",
    "selling_price",
    "internetprice",
    "internet_price",
    "saleprice",
    "ourprice",
  ],
  msrp: ["msrp", "retailprice", "retail_price", "listprice"],
  exterior_color: [
    "colour",
    "color",
    "exteriorcolor",
    "exterior_color",
    "extcolor",
    "exterior",
  ],
  interior_color: [
    "interiorcolor",
    "interior_color",
    "intcolor",
    "int_color",
    "interior",
  ],
  primary_image_url: [
    "photourllist",
    "photo_url_list",
    "photourls",
    "photo_urls",
    "imagelist",
    "image_list",
    "images",
    "photos",
    "photourl",
    "imageurl",
  ],
  dealer_id: [
    "dealerid",
    "dealer_id",
    "dealercode",
    "dealer_code",
    "storecode",
    "store_code",
  ],
  dealer_name: [
    "dealername",
    "dealer_name",
    "dealer",
    "storename",
    "store_name",
  ],
  description: [
    "description",
    "comments",
    "vehicledescription",
    "vehicle_description",
  ],
  disposition: ["disposition"],
  status: ["status", "inventorystatus"],
};

export interface MapVautoRowOptions {
  forcedStoreId?: string | null;
  importSource?: string;
  storeIdByDealerName?: Map<string, string>;
  /** Normalized DealerId / filename token → store UUID. */
  storeIdByDealerId?: Map<string, string>;
}

/** Strip to alphanumeric so "New/Used", "Stock #", "Photo Url List" all match aliases. */
function normalizeHeaderKey(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildHeaderLookup(raw: Record<string, string>): Map<string, string> {
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

function parseIntegerField(value: string): number | null {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function parseUsablePrice(value: string): number | null {
  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

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

function isTruthyFlag(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v === "1" ||
    v === "y" ||
    v === "yes" ||
    v === "true" ||
    v === "t" ||
    v === "certified" ||
    v === "cpo"
  );
}

function normalizeCondition(
  newUsed: string,
  certified: string,
): string | null {
  const v = newUsed.trim().toLowerCase();
  if (!v && !certified.trim()) return null;

  let base: string | null = null;
  if (v === "n" || v === "new" || (v.includes("new") && !v.includes("used"))) {
    base = "new";
  } else if (
    v === "u" ||
    v === "used" ||
    v.includes("used") ||
    v.includes("pre")
  ) {
    base = "used";
  } else if (v.includes("cert") || v === "cpo") {
    base = "cpo";
  } else if (v) {
    base = v;
  }

  if (base === "used" && isTruthyFlag(certified)) return "cpo";
  if (!base && isTruthyFlag(certified)) return "cpo";
  return base;
}

function isLikelyImageUrl(value: string): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  );
}

/** Split Photo Url List only after CSV field extraction. */
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

function normalizeDealerToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isInactiveDisposition(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return /sold|delete|inactive|removed|wholesale|auction|shipped/.test(v);
}

/** Read store-identifying fields from a raw vAuto row. */
export function readVautoRowStoreHints(raw: Record<string, string>): {
  storeIdFromFeed: string | null;
  dealerName: string | null;
  dealerId: string | null;
} {
  const lookup = buildHeaderLookup(raw);
  const storeFromFile = pickField(lookup, "dealer_id");
  const dealerName = pickField(lookup, "dealer_name") || null;
  const dealerId = storeFromFile || null;
  return {
    storeIdFromFeed:
      storeFromFile && isUuid(storeFromFile) ? storeFromFile : null,
    dealerName,
    dealerId,
  };
}

/**
 * Map a vAuto feed row to canonical inventory.
 * Skips rows missing VIN+stock or missing make/model (admin junk rows).
 */
export function mapVautoRow(
  raw: Record<string, string>,
  options: MapVautoRowOptions = {},
): CanonicalVehicleRow | null {
  const lookup = buildHeaderLookup(raw);
  const vin = pickField(lookup, "vin") || null;
  const stock_number = pickField(lookup, "stock_number") || null;
  const import_key = buildImportKey(vin ?? "", stock_number ?? "");

  if (!import_key) {
    return null;
  }

  const make = pickField(lookup, "make") || null;
  const model = pickField(lookup, "model") || null;
  if (!make || !model) {
    return null;
  }

  const dealerIdRaw = pickField(lookup, "dealer_id");
  const dealerName = pickField(lookup, "dealer_name");
  const dealerIdToken = dealerIdRaw ? normalizeDealerToken(dealerIdRaw) : "";
  const dealerLookupId = dealerName
    ? options.storeIdByDealerName?.get(dealerName.trim().toLowerCase()) ?? null
    : null;
  const dealerIdLookup =
    dealerIdToken && options.storeIdByDealerId?.get(dealerIdToken)
      ? options.storeIdByDealerId.get(dealerIdToken)!
      : null;

  const store_id =
    options.forcedStoreId ??
    ((dealerIdRaw && isUuid(dealerIdRaw) ? dealerIdRaw : null) ||
      dealerIdLookup ||
      dealerLookupId ||
      null);

  const statusRaw = pickField(lookup, "status");
  const disposition = pickField(lookup, "disposition");
  const status =
    (statusRaw && /sold|delete|inactive|removed/i.test(statusRaw)) ||
    isInactiveDisposition(disposition)
      ? "inactive"
      : "active";

  const imageList = parseImageUrls(pickField(lookup, "primary_image_url"));
  const primaryImageUrl = imageList[0] ?? null;
  const imageUrls = imageList.length > 0 ? imageList : null;

  const trim = pickField(lookup, "trim") || null;
  const exterior_color = pickField(lookup, "exterior_color") || null;
  const interior_color = pickField(lookup, "interior_color") || null;
  const mileage = parseIntegerField(pickField(lookup, "mileage"));
  const msrp = firstUsablePrice(lookup, "msrp");
  const sale_price = firstUsablePrice(lookup, "internet_price");
  const internet_price = sale_price ?? null;
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
    stock_number,
    store_id,
    dealer_name: dealerName || dealerIdRaw || null,
    year: parseIntegerField(pickField(lookup, "year")),
    make,
    model,
    trim,
    condition: normalizeCondition(
      pickField(lookup, "condition"),
      pickField(lookup, "certified"),
    ),
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
    import_source: options.importSource ?? "vauto",
    inventory_provider: "vauto",
    imported_at: new Date().toISOString(),
  };
}

export function mapVautoRowsToCanonical(
  rows: Record<string, string>[],
  options: MapVautoRowOptions = {},
): CanonicalVehicleRow[] {
  const result: CanonicalVehicleRow[] = [];
  for (const raw of rows) {
    const mapped = mapVautoRow(raw, options);
    if (mapped) result.push(mapped);
  }
  return result;
}

export { normalizeHeaderKey as normalizeVautoHeaderKey };
