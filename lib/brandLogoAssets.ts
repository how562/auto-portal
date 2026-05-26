/**
 * Homepage / store logos live in public/brand as hplogo_{storeAbrv}.jpg
 * (legacy Cavender naming: store abbreviation suffix).
 */

export type BrandStoreAbrv =
  | "bgn"
  | "bgw"
  | "cad"
  | "cbm"
  | "cgf"
  | "chv"
  | "coll"
  | "jlr"
  | "nrw"
  | "nsm";

export function brandLogoPath(storeAbrv: BrandStoreAbrv | string): string {
  return `/brand/hplogo_${storeAbrv}.jpg`;
}
