/**
 * @deprecated Prefer `@/lib/feedSourceRaw` — HomeNet-named module retained for
 * existing imports during the vAuto cutover. Will be removed after HomeNet
 * importer retirement.
 */
export {
  FEED_DOC_FEE_KEY_HINTS as HOMENET_DOC_FEE_KEY_HINTS,
  FEED_INCENTIVE_KEY_HINTS as HOMENET_INCENTIVE_KEY_HINTS,
  FEED_PRICE_KEYS as HOMENET_PRICE_KEYS,
  normalizeSourceRaw,
  readDocFeeFromSourceRaw,
  readFeedIncentivesFromSourceRaw,
  readFeedPricesFromSourceRaw,
  readHomenetPricesFromSourceRaw,
  type FeedIncentiveLine,
} from "./feedSourceRaw";
