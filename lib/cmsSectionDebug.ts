import type { CMSSection } from "./cmsSectionModel";
import { getRegistryEntry, registryHasDedicatedRenderer } from "./cmsSectionRegistry";
import { getSectionCopy, sectionHasVisibleCopy } from "./cmsSectionDisplay";

export interface CMSSectionFieldStatus {
  key: string;
  populated: boolean;
  preview: string;
}

export interface CMSSectionDebugInfo {
  id: string;
  section_type: string;
  sort_order: number;
  is_active: boolean;
  registryLabel: string;
  hasDedicatedRenderer: boolean;
  supported: boolean;
  hasVisibleCopy: boolean;
  fields: CMSSectionFieldStatus[];
}

function preview(value: string | null | undefined, max = 48): string {
  if (!value?.trim()) return "—";
  const t = value.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function inspectCMSSection(section: CMSSection): CMSSectionDebugInfo {
  const entry = getRegistryEntry(section.section_type);
  const copy = getSectionCopy(section);

  const fields: CMSSectionFieldStatus[] = [
    { key: "eyebrow", populated: Boolean(section.eyebrow?.trim()), preview: preview(section.eyebrow) },
    { key: "headline", populated: Boolean(section.headline?.trim()), preview: preview(section.headline) },
    {
      key: "subheadline",
      populated: Boolean(section.subheadline?.trim()),
      preview: preview(section.subheadline),
    },
    { key: "body", populated: Boolean(section.body?.trim()), preview: preview(section.body, 80) },
    { key: "image_url", populated: Boolean(section.image_url?.trim()), preview: preview(section.image_url) },
    { key: "cta_text", populated: Boolean(section.cta_text?.trim()), preview: preview(section.cta_text) },
    { key: "cta_url", populated: Boolean(section.cta_url?.trim()), preview: preview(section.cta_url) },
    {
      key: "headline_es",
      populated: Boolean(section.headline_es?.trim()),
      preview: preview(section.headline_es),
    },
    {
      key: "body_es",
      populated: Boolean(section.body_es?.trim()),
      preview: preview(section.body_es, 80),
    },
    {
      key: "settings",
      populated: Object.keys(section.settings ?? {}).length > 0,
      preview: `${Object.keys(section.settings ?? {}).length} keys`,
    },
  ];

  return {
    id: section.id,
    section_type: section.section_type,
    sort_order: section.sort_order,
    is_active: section.is_active,
    registryLabel: entry.label,
    hasDedicatedRenderer: registryHasDedicatedRenderer(section.section_type),
    supported: entry.supported,
    hasVisibleCopy: sectionHasVisibleCopy(copy),
    fields,
  };
}

export function inspectCMSSections(sections: CMSSection[]): CMSSectionDebugInfo[] {
  return sections.map(inspectCMSSection);
}
