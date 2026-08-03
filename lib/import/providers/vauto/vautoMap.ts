import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import { computeVehicleQuality } from "@/lib/vehicleQuality";
import {
  buildHeaderLookup,
  buildImportKey,
  firstUsablePrice,
  isUuid,
  normalizeCondition,
  parseImageUrls,
  parseIntegerField,
  pickField,
  VAUTO_IMAGE_ALIASES,
} from "@/lib/import/providers/vauto/vautoFieldUtils";

export interface MapVautoRowOptions {
  /** Force every row in the file onto this store (multi-dealer safety). */
  forcedStoreId?: string | null;
  importSource?: string;
  /** Lowercased dealer name → store UUID. */
  storeIdByDealerName?: Map<string, string>;
  /**
   * Normalized dealer identifier (DealerId / store code) → store UUID.
   * Used when feed rows carry DealerId rather than UUID StoreID.
   */
  storeIdByDealerIdentifier?: Map<string, string>;
}

export type VautoMapSkipReason = "missing_key" | "missing_make_or_model";

export interface VautoMapSkipCounts {
  missingKey: number;
  missingMakeOrModel: number;
}

export interface MapVautoRowsResult {
  mapped: CanonicalVehicleRow[];
  skipped: number;
  skipCounts: VautoMapSkipCounts;
  /** Parallel to input rows: null when mapped, else skip reason. */
  skipReasons: Array<VautoMapSkipReason | null>;
}

function classifySkip(lookup: Map<string, string>): VautoMapSkipReason {
  const vin = pickField(lookup, "vin");
  const stock = pickField(lookup, "stock_number");
  if (!vin && !stock) return "missing_key";
  return "missing_make_or_model";
}

function resolveStoreId(
  lookup: Map<string, string>,
  options: MapVautoRowOptions,
): string | null {
  if (options.forcedStoreId) return options.forcedStoreId;

  const storeFromFile = pickField(lookup, "dealer_identifier");
  if (storeFromFile && isUuid(storeFromFile)) return storeFromFile;

  if (storeFromFile && options.storeIdByDealerIdentifier) {
    const byId =
      options.storeIdByDealerIdentifier.get(
        storeFromFile.trim().toLowerCase(),
      ) ??
      options.storeIdByDealerIdentifier.get(
        storeFromFile.toLowerCase().replace(/[^a-z0-9]+/g, ""),
      );
    if (byId) return byId;
  }

  const dealerName = pickField(lookup, "dealer_name");
  if (dealerName && options.storeIdByDealerName) {
    const byName = options.storeIdByDealerName.get(
      dealerName.trim().toLowerCase(),
    );
    if (byName) return byName;
  }

  return null;
}

/**
 * Map a vAuto feed row to canonical inventory.
 * Requires VIN or stock, and make + model. Sets inventory_provider='vauto'.
 */
export function mapVautoRow(
  raw: Record<string, string>,
  options: MapVautoRowOptions = {},
): CanonicalVehicleRow | null {
  const lookup = buildHeaderLookup(raw);
  const vin = pickField(lookup, "vin") || null;
  const stock_number = pickField(lookup, "stock_number") || null;
  const import_key = buildImportKey(vin ?? "", stock_number ?? "");
  if (!import_key) return null;

  const make = pickField(lookup, "make") || null;
  const model = pickField(lookup, "model") || null;
  if (!make || !model) return null;

  const dealerName = pickField(lookup, "dealer_name") || null;
  const store_id = resolveStoreId(lookup, options);

  const statusRaw = pickField(lookup, "status");
  const status =
    statusRaw && /sold|delete|inactive|removed|wholesale/i.test(statusRaw)
      ? "inactive"
      : "active";

  const imageList = parseImageUrls(pickField(lookup, VAUTO_IMAGE_ALIASES));
  const primaryImageUrl = imageList[0] ?? null;
  const imageUrls = imageList.length > 0 ? imageList : null;

  const trim = pickField(lookup, "trim") || null;
  const exterior_color = pickField(lookup, "exterior_color") || null;
  const interior_color = pickField(lookup, "interior_color") || null;
  const mileage = parseIntegerField(pickField(lookup, "mileage"));

  const sale_price = firstUsablePrice(lookup, "sale_price");
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

  const now = new Date().toISOString();

  return {
    import_key,
    vin: vin || null,
    stock_number: stock_number || null,
    store_id,
    dealer_name: dealerName,
    year: parseIntegerField(pickField(lookup, "year")),
    make,
    model,
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
    import_source: options.importSource ?? "vauto",
    inventory_provider: "vauto",
    imported_at: now,
    last_seen_at: now,
  };
}

export function mapVautoRowsToCanonical(
  rows: Record<string, string>[],
  options: MapVautoRowOptions = {},
): CanonicalVehicleRow[] {
  return mapVautoRowsDetailed(rows, options).mapped;
}

/** Map rows with skip counters (for import logging). */
export function mapVautoRowsDetailed(
  rows: Record<string, string>[],
  options: MapVautoRowOptions = {},
): MapVautoRowsResult {
  const mapped: CanonicalVehicleRow[] = [];
  const skipCounts: VautoMapSkipCounts = {
    missingKey: 0,
    missingMakeOrModel: 0,
  };
  const skipReasons: Array<VautoMapSkipReason | null> = [];

  for (const raw of rows) {
    const result = mapVautoRow(raw, options);
    if (result) {
      mapped.push(result);
      skipReasons.push(null);
      continue;
    }
    const reason = classifySkip(buildHeaderLookup(raw));
    if (reason === "missing_key") skipCounts.missingKey += 1;
    else skipCounts.missingMakeOrModel += 1;
    skipReasons.push(reason);
  }

  return {
    mapped,
    skipped: skipCounts.missingKey + skipCounts.missingMakeOrModel,
    skipCounts,
    skipReasons,
  };
}
