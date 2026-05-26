import type { PageBlueprint, PageBlueprintSection } from "./cmsPageBlueprint";
import { sanitizeCmsHtml } from "./sanitizeHtml";

function stripHtmlToPlainText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePlainField(value: string | null | undefined): string | null {
  if (value == null) return null;
  const stripped = stripHtmlToPlainText(value);
  return stripped || null;
}

function sanitizeSection(section: PageBlueprintSection): PageBlueprintSection {
  const next: PageBlueprintSection = { ...section };

  if (section.section_type === "custom_html") {
    const settings = { ...(section.settings ?? {}) };
    const rawHtml =
      typeof settings.html === "string"
        ? settings.html
        : section.body ?? null;
    const safe = sanitizeCmsHtml(rawHtml);
    if (safe) {
      settings.html = safe;
    } else {
      delete settings.html;
    }
    next.settings = settings;
    next.body = sanitizePlainField(section.body);
    next.headline = sanitizePlainField(section.headline);
    next.subheadline = sanitizePlainField(section.subheadline);
    next.cta_text = sanitizePlainField(section.cta_text);
    return next;
  }

  next.headline = sanitizePlainField(section.headline);
  next.subheadline = sanitizePlainField(section.subheadline);
  next.body = sanitizePlainField(section.body);
  next.cta_text = sanitizePlainField(section.cta_text);
  next.cta_url = sanitizePlainField(section.cta_url);
  next.image_url = sanitizePlainField(section.image_url);

  const settings = { ...(section.settings ?? {}) };
  if ("html" in settings) {
    delete settings.html;
  }
  next.settings = settings;

  return next;
}

/** Strip unsafe HTML from blueprint fields before create/import. */
export function sanitizePageBlueprint(blueprint: PageBlueprint): PageBlueprint {
  return {
    ...blueprint,
    status: "draft",
    title: stripHtmlToPlainText(blueprint.title),
    slug: blueprint.slug,
    meta_description: blueprint.meta_description
      ? stripHtmlToPlainText(blueprint.meta_description)
      : null,
    sections: blueprint.sections.map(sanitizeSection),
  };
}
