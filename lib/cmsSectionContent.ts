/**
 * @deprecated Import from cmsSectionDisplay instead.
 */
export {
  getSectionCopy,
  localizeCMSSection,
  localizeCMSSections,
  resolveImageTextMediaSide,
  sectionHasVisibleCopy,
  type SectionCopy,
} from "./cmsSectionDisplay";

import { getSectionCopy } from "./cmsSectionDisplay";
import type { CMSSection } from "./cmsSectionModel";

/** @deprecated Use getSectionCopy(section).headline */
export function resolveSectionTitle(section: CMSSection): string {
  return getSectionCopy(section).headline;
}

/** @deprecated Use getSectionCopy(section).subheadline */
export function resolveSectionSubtitle(section: CMSSection): string {
  return getSectionCopy(section).subheadline;
}

/** @deprecated Use getSectionCopy(section).body */
export function resolveSectionBody(section: CMSSection): string {
  return getSectionCopy(section).body;
}

/** @deprecated Use getSectionCopy(section).eyebrow */
export function resolveSectionEyebrow(section: CMSSection): string {
  return getSectionCopy(section).eyebrow;
}

/** @deprecated Use getSectionCopy(section).imageUrl */
export function resolveSectionImageUrl(section: CMSSection): string {
  return getSectionCopy(section).imageUrl;
}
