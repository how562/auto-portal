/**
 * vAuto feed parser — isolated from HomeNet and core inventory layer.
 */
export {
  inspectVautoFeedContent,
  isVautoInventoryFileName,
  parseVautoFeedFile,
  type VautoParsedFeed,
} from "@/lib/import/providers/vauto/vautoParse";
export {
  mapVautoRow,
  mapVautoRowsDetailed,
  mapVautoRowsToCanonical,
  type MapVautoRowOptions,
  type MapVautoRowsResult,
  type VautoMapSkipCounts,
  type VautoMapSkipReason,
} from "@/lib/import/providers/vauto/vautoMap";
export {
  buildImportKey,
  fileMatchesDealerIdentifier,
  normalizeCondition,
  normalizeDealerToken,
  parseImageUrls,
  parseUsablePrice,
} from "@/lib/import/providers/vauto/vautoFieldUtils";
