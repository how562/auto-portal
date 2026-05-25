import { parsePageSectionFromDb, PAGE_SECTION_SELECT } from "./cmsSectionFromDb";
import type { CMSSection } from "./cmsSectionModel";

export { PAGE_SECTION_SELECT };

/** @deprecated Use parsePageSectionFromDb */
export function normalizePageSectionRow(
  row: Record<string, unknown>,
): CMSSection | null {
  return parsePageSectionFromDb(row);
}
