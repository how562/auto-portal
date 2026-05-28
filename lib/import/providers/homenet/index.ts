/**
 * HomeNet DealerSend feed parser — isolated from core inventory and vAuto.
 */
export { parseDealerSendFile } from "@/lib/import/dealerSendParse";
export {
  mapDealerSendRow,
  readRowStoreHints,
  buildImportKey,
  type MapDealerSendRowOptions,
} from "@/lib/import/dealerSendMap";
export { mapDealerSendRowsToCanonical } from "@/lib/import/providers/homenet/mapToCanonical";
