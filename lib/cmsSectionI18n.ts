import type { Locale } from "./i18n/types";
import type { CMSSection } from "./cmsSectionModel";

function parseSettings(
  settings: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!settings || typeof settings !== "object") return {};
  return settings;
}

export function pickLocalizedString(
  spanish: string | null | undefined,
  english: string | null | undefined,
): string | null | undefined {
  const es = spanish?.trim();
  if (es) return es;
  return english ?? null;
}

function localizeRecord(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.endsWith("_es")) continue;

    let resolved = value;
    const esKey = `${key}_es`;
    const esValue = obj[esKey];

    if (typeof value === "string" && typeof esValue === "string") {
      const es = esValue.trim();
      if (es) resolved = es;
    }

    result[key] = localizeSettingsValue(resolved);
  }

  return result;
}

function localizeSettingsValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item !== null && typeof item === "object" && !Array.isArray(item)
        ? localizeRecord(item as Record<string, unknown>)
        : item,
    );
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return localizeRecord(value as Record<string, unknown>);
  }
  return value;
}

export function localizeSettings(
  settings: Record<string, unknown> | null | undefined,
  locale: Locale,
): Record<string, unknown> {
  if (locale !== "es") {
    return parseSettings(settings);
  }
  return localizeRecord(parseSettings(settings));
}

/** @deprecated Use localizeCMSSection from cmsSectionDisplay */
export function localizePageSection<T extends CMSSection>(section: T, locale: Locale): T {
  if (locale !== "es") return section;

  const headline = pickLocalizedString(section.headline_es, section.headline);
  const subheadline = pickLocalizedString(
    section.subheadline_es,
    section.subheadline,
  );
  const body = pickLocalizedString(section.body_es, section.body);
  const cta_text = pickLocalizedString(section.cta_text_es, section.cta_text);
  const settings = localizeSettings(section.settings, locale);

  return {
    ...section,
    headline: headline ?? section.headline,
    subheadline: subheadline ?? section.subheadline,
    body: body ?? section.body,
    cta_text: cta_text ?? section.cta_text,
    settings,
  };
}

/** @deprecated Use localizeCMSSections from cmsSectionDisplay */
export function localizePageSections<T extends CMSSection>(
  sections: T[],
  locale: Locale,
): T[] {
  return sections.map((section) => localizePageSection(section, locale));
}
