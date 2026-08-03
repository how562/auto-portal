import { readRowStoreHints } from "./dealerSendMap";
import {
  buildHeaderLookup,
  normalizeDealerToken,
  pickField,
} from "@/lib/import/providers/vauto/vautoFieldUtils";

export type StoreMappingSource =
  | "feed_file_mappings"
  | "env_file_map"
  | "filename_store_name"
  | "feed_store_id"
  | "feed_dealer_name";

export interface StoreRecord {
  id: string;
  name: string | null;
}

export interface StoreLookupTables {
  /** Lowercased dealer name → store id (from stores.name). */
  storeIdByDealerName: Map<string, string>;
  /** Normalized store name token → store id. */
  storeIdByNormalizedName: Map<string, string>;
  storeNameById: Map<string, string>;
  /** Normalized filename key → store id (from HOMENET_STORE_FILE_MAP). */
  fileMap: Map<string, string>;
  /** Normalized filename key → store id (from feed_file_mappings, active rows). */
  dbFileMap: Map<string, string>;
}

export interface ResolvedStoreMapping {
  storeId: string;
  storeName: string;
  source: StoreMappingSource;
}

export interface UnresolvedStoreMapping {
  reason: string;
}

export type StoreMappingResult = ResolvedStoreMapping | UnresolvedStoreMapping;

export function isResolvedStoreMapping(
  result: StoreMappingResult,
): result is ResolvedStoreMapping {
  return "storeId" in result;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function normalizeMappingToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function fileBaseName(fileName: string): string {
  return fileName.replace(/\.(csv|txt)$/i, "");
}

function parseStoreFileMapJson(raw: string | undefined): Map<string, string> {
  if (!raw?.trim()) return new Map();
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const map = new Map<string, string>();
    for (const [key, value] of Object.entries(parsed)) {
      const normalizedKey = normalizeMappingToken(key);
      if (normalizedKey && value && isUuid(value.trim())) {
        map.set(normalizedKey, value.trim());
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

/** HomeNet filename token → store UUID map (`HOMENET_STORE_FILE_MAP`). */
export function readStoreFileMapFromEnv(): Map<string, string> {
  return parseStoreFileMapJson(process.env.HOMENET_STORE_FILE_MAP);
}

/**
 * vAuto filename / dealer-id token → store UUID map (`VAUTO_STORE_FILE_MAP`).
 * Merged with HomeNet map when building lookup tables for vAuto imports.
 */
export function readVautoStoreFileMapFromEnv(): Map<string, string> {
  return parseStoreFileMapJson(process.env.VAUTO_STORE_FILE_MAP);
}

/** Merge env file maps (later keys win). */
export function mergeStoreFileMaps(
  ...maps: Array<Map<string, string>>
): Map<string, string> {
  const merged = new Map<string, string>();
  for (const map of maps) {
    for (const [key, value] of Array.from(map.entries())) {
      merged.set(key, value);
    }
  }
  return merged;
}

export function buildStoreLookupTables(
  stores: StoreRecord[],
  dbFileMap: Map<string, string> = new Map(),
  options: { includeVautoEnvMap?: boolean } = {},
): StoreLookupTables {
  const storeIdByDealerName = new Map<string, string>();
  const storeIdByNormalizedName = new Map<string, string>();
  const storeNameById = new Map<string, string>();

  for (const store of stores) {
    const name = store.name?.trim();
    if (!name || !store.id) continue;

    storeNameById.set(store.id, name);

    const lowerName = name.toLowerCase();
    if (!storeIdByDealerName.has(lowerName)) {
      storeIdByDealerName.set(lowerName, store.id);
    }

    const normalized = normalizeMappingToken(name);
    if (normalized && !storeIdByNormalizedName.has(normalized)) {
      storeIdByNormalizedName.set(normalized, store.id);
    }
  }

  const fileMap = options.includeVautoEnvMap
    ? mergeStoreFileMaps(
        readStoreFileMapFromEnv(),
        readVautoStoreFileMapFromEnv(),
      )
    : readStoreFileMapFromEnv();

  return {
    storeIdByDealerName,
    storeIdByNormalizedName,
    storeNameById,
    fileMap,
    dbFileMap,
  };
}

function resolveFromPatternFileMap(
  fileName: string,
  fileMap: Map<string, string>,
  source: StoreMappingSource,
): ResolvedStoreMapping | null {
  const normalizedFile = normalizeMappingToken(fileBaseName(fileName));
  if (!normalizedFile) return null;

  if (fileMap.has(normalizedFile)) {
    const storeId = fileMap.get(normalizedFile)!;
    return {
      storeId,
      storeName: "",
      source,
    };
  }

  for (const [key, storeId] of Array.from(fileMap.entries())) {
    if (normalizedFile.includes(key) || key.includes(normalizedFile)) {
      return {
        storeId,
        storeName: "",
        source,
      };
    }
  }

  return null;
}

function resolveFromEnvFileMap(
  fileName: string,
  fileMap: Map<string, string>,
): ResolvedStoreMapping | null {
  return resolveFromPatternFileMap(fileName, fileMap, "env_file_map");
}

function resolveFromDbFileMap(
  fileName: string,
  dbFileMap: Map<string, string>,
): ResolvedStoreMapping | null {
  return resolveFromPatternFileMap(fileName, dbFileMap, "feed_file_mappings");
}

function filenameMatchesStoreName(fileName: string, storeName: string): boolean {
  const base = fileBaseName(fileName);
  const fileNorm = normalizeMappingToken(base);
  const storeNorm = normalizeMappingToken(storeName);
  if (!fileNorm || !storeNorm) return false;

  if (fileNorm.includes(storeNorm) || storeNorm.includes(fileNorm)) {
    return true;
  }

  const words = storeName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);

  if (words.length === 0) return false;
  const baseLower = base.toLowerCase();
  return words.every((word) => baseLower.includes(word));
}

function resolveFromFilenameStoreName(
  fileName: string,
  lookup: StoreLookupTables,
): ResolvedStoreMapping | null {
  for (const [storeId, storeName] of Array.from(lookup.storeNameById.entries())) {
    if (filenameMatchesStoreName(fileName, storeName)) {
      return {
        storeId,
        storeName,
        source: "filename_store_name",
      };
    }
  }

  const normalizedFile = normalizeMappingToken(fileBaseName(fileName));
  if (normalizedFile && lookup.storeIdByNormalizedName.has(normalizedFile)) {
    const storeId = lookup.storeIdByNormalizedName.get(normalizedFile)!;
    return {
      storeId,
      storeName: lookup.storeNameById.get(storeId) ?? "",
      source: "filename_store_name",
    };
  }

  return null;
}

function resolveFromFeedRows(
  rows: Record<string, string>[],
  lookup: StoreLookupTables,
): ResolvedStoreMapping | UnresolvedStoreMapping | null {
  const storeIds = new Set<string>();
  const dealerNames = new Set<string>();
  const dealerIdentifiers = new Set<string>();

  for (const row of rows.slice(0, 25)) {
    const hints = readRowStoreHints(row);
    if (hints.storeIdFromFeed && isUuid(hints.storeIdFromFeed)) {
      storeIds.add(hints.storeIdFromFeed);
    }
    if (hints.dealerName) {
      dealerNames.add(hints.dealerName.trim().toLowerCase());
    }

    const lookupHeaders = buildHeaderLookup(row);
    const dealerId = pickField(lookupHeaders, "dealer_identifier");
    if (dealerId && !isUuid(dealerId)) {
      dealerIdentifiers.add(normalizeDealerToken(dealerId));
    }
  }

  if (storeIds.size > 1) {
    return {
      reason:
        "Feed contains multiple StoreID values — file skipped to avoid mixing stores",
    };
  }

  if (storeIds.size === 1) {
    const storeId = Array.from(storeIds)[0];
    return {
      storeId,
      storeName: lookup.storeNameById.get(storeId) ?? "",
      source: "feed_store_id",
    };
  }

  if (dealerIdentifiers.size > 1) {
    return {
      reason:
        "Feed contains multiple DealerId values — file skipped to avoid mixing stores",
    };
  }

  if (dealerIdentifiers.size === 1) {
    const token = Array.from(dealerIdentifiers)[0];
    const storeId = lookup.fileMap.get(token) ?? lookup.dbFileMap.get(token);
    if (storeId) {
      return {
        storeId,
        storeName: lookup.storeNameById.get(storeId) ?? "",
        source: "env_file_map",
      };
    }
  }

  if (dealerNames.size > 1) {
    return {
      reason:
        "Feed contains multiple DealerName values — file skipped to avoid mixing stores",
    };
  }

  if (dealerNames.size === 1) {
    const dealerName = Array.from(dealerNames)[0];
    const storeId = lookup.storeIdByDealerName.get(dealerName);
    if (!storeId) {
      return {
        reason: `Unknown DealerName in feed: "${dealerName}" — add a store, feed_file_mappings row, or VAUTO_STORE_FILE_MAP / HOMENET_STORE_FILE_MAP entry`,
      };
    }
    return {
      storeId,
      storeName: lookup.storeNameById.get(storeId) ?? dealerName,
      source: "feed_dealer_name",
    };
  }

  return null;
}

/**
 * Resolve which store a feed file belongs to.
 * Order: feed_file_mappings → env map → filename heuristic → feed columns.
 */
export function resolveStoreForFile(
  fileName: string,
  rows: Record<string, string>[],
  lookup: StoreLookupTables,
): StoreMappingResult {
  const fromDb = resolveFromDbFileMap(fileName, lookup.dbFileMap);
  if (fromDb) {
    return {
      ...fromDb,
      storeName:
        fromDb.storeName || lookup.storeNameById.get(fromDb.storeId) || "",
    };
  }

  const fromEnv = resolveFromEnvFileMap(fileName, lookup.fileMap);
  if (fromEnv) {
    return {
      ...fromEnv,
      storeName:
        fromEnv.storeName || lookup.storeNameById.get(fromEnv.storeId) || "",
    };
  }

  const fromFilename = resolveFromFilenameStoreName(fileName, lookup);
  if (fromFilename) {
    return fromFilename;
  }

  const fromFeed = resolveFromFeedRows(rows, lookup);
  if (fromFeed) {
    return fromFeed;
  }

  return {
    reason: `Could not map "${fileName}" to a store — add an active feed_file_mappings row, HOMENET_STORE_FILE_MAP entry, or ensure DealerName/StoreID is present in the feed`,
  };
}
