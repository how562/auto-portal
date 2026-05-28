/**
 * vAuto feed parser — isolated from HomeNet and core inventory layer.
 */
export {
  inspectVautoFeedContent,
  parseVautoFeedFile,
  type VautoParsedFeed,
} from "@/lib/import/providers/vauto/vautoParse";
export {
  mapVautoRow,
  mapVautoRowsToCanonical,
  type MapVautoRowOptions,
} from "@/lib/import/providers/vauto/vautoMap";
