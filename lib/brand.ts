export const BRAND_NAME = "Cavender Auto Group";
export const BRAND_TITLE_SUFFIX = "Cavender Auto Group";

export function brandPageTitle(page: string): string {
  return `${page} | ${BRAND_TITLE_SUFFIX}`;
}
