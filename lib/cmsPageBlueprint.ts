import type { CMSSection } from "./cmsSectionModel";
import { CMS_SECTION_REGISTRY } from "./cmsSectionRegistry";
import { CMS_SECTION_TYPES, type CMSSectionType, type SitePage } from "./cmsTypes";

export function slugifyBlueprintSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface PageBlueprintSection {
  section_type: CMSSectionType;
  headline?: string | null;
  subheadline?: string | null;
  body?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  settings?: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export interface PageBlueprint {
  title: string;
  slug: string;
  meta_description: string | null;
  status: "draft" | "published";
  sections: PageBlueprintSection[];
}

export interface BlueprintValidationResult {
  ok: boolean;
  blueprint?: PageBlueprint;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function isSupportedSectionType(type: string): type is CMSSectionType {
  if (!(CMS_SECTION_TYPES as readonly string[]).includes(type)) return false;
  return CMS_SECTION_REGISTRY[type as CMSSectionType].supported;
}

export function validatePageBlueprint(input: unknown): BlueprintValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["Blueprint must be a JSON object"] };
  }

  const title = optionalString(input.title);
  if (!title) errors.push("title is required");

  const slugRaw = optionalString(input.slug) ?? (title ? slugifyBlueprintSlug(title) : "");
  const slug = slugifyBlueprintSlug(slugRaw);
  if (!slug) errors.push("slug is required (or provide a title to auto-generate)");

  const meta_description = optionalString(input.meta_description);
  const statusRaw = optionalString(input.status) ?? "draft";
  const status = statusRaw === "published" ? "published" : "draft";
  if (statusRaw !== "draft" && statusRaw !== "published") {
    errors.push('status must be "draft" or "published"');
  }

  if (!Array.isArray(input.sections)) {
    errors.push("sections must be an array");
    return { ok: false, errors };
  }

  if (input.sections.length === 0) {
    errors.push("sections must include at least one section");
  }

  const sections: PageBlueprintSection[] = [];

  input.sections.forEach((raw, index) => {
    const prefix = `sections[${index}]`;
    if (!isRecord(raw)) {
      errors.push(`${prefix} must be an object`);
      return;
    }

    if ("title" in raw || "content" in raw) {
      errors.push(`${prefix}: use headline and body instead of title/content`);
    }

    const sectionType = optionalString(raw.section_type);
    if (!sectionType) {
      errors.push(`${prefix}.section_type is required`);
      return;
    }
    if (!isSupportedSectionType(sectionType)) {
      errors.push(
        `${prefix}.section_type "${sectionType}" is not supported. Allowed: ${CMS_SECTION_TYPES.filter((t) => CMS_SECTION_REGISTRY[t].supported).join(", ")}`,
      );
      return;
    }

    const sort_order =
      typeof raw.sort_order === "number" && Number.isFinite(raw.sort_order)
        ? raw.sort_order
        : (index + 1) * 10;

    const is_active =
      typeof raw.is_active === "boolean" ? raw.is_active : true;

    let settings: Record<string, unknown> = {};
    if (raw.settings !== undefined) {
      if (!isRecord(raw.settings)) {
        errors.push(`${prefix}.settings must be an object`);
        return;
      }
      settings = raw.settings;
    }

    sections.push({
      section_type: sectionType,
      headline: optionalString(raw.headline),
      subheadline: optionalString(raw.subheadline),
      body: optionalString(raw.body),
      image_url: optionalString(raw.image_url),
      cta_text: optionalString(raw.cta_text),
      cta_url: optionalString(raw.cta_url),
      settings,
      sort_order,
      is_active,
    });
  });

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    blueprint: {
      title: title!,
      slug,
      meta_description,
      status,
      sections: sections.sort((a, b) => a.sort_order - b.sort_order),
    },
    errors: [],
  };
}

export function pageBlueprintFromSitePage(
  page: SitePage,
  sections: CMSSection[],
): PageBlueprint {
  return {
    title: page.title,
    slug: page.slug,
    meta_description: page.meta_description,
    status: page.status === "published" ? "published" : "draft",
    sections: sections
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((section) => ({
        section_type: section.section_type,
        headline: section.headline,
        subheadline: section.subheadline,
        body: section.body,
        image_url: section.image_url,
        cta_text: section.cta_text,
        cta_url: section.cta_url,
        settings: section.settings ?? {},
        sort_order: section.sort_order,
        is_active: section.is_active,
      })),
  };
}

export function blueprintJsonString(blueprint: PageBlueprint): string {
  return JSON.stringify(blueprint, null, 2);
}

/** Example blueprint for the import UI placeholder. */
export const BLUEPRINT_JSON_EXAMPLE = `{
  "title": "My Page",
  "slug": "my-page",
  "meta_description": "Optional SEO description",
  "status": "draft",
  "sections": [
    {
      "section_type": "hero",
      "headline": "Welcome",
      "subheadline": "Supporting line",
      "sort_order": 10,
      "is_active": true,
      "settings": { "variant": "dark" }
    }
  ]
}`;

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlNullableString(value: string | null | undefined): string {
  if (value == null || value === "") return "NULL";
  return `'${escapeSqlString(value)}'`;
}

function sqlJson(value: Record<string, unknown>): string {
  return `'${escapeSqlString(JSON.stringify(value ?? {}))}'::jsonb`;
}

function sqlBool(value: boolean): string {
  return value ? "true" : "false";
}

/**
 * One-shot SQL for Supabase SQL editor (backup/migration). Inserts page + sections in a transaction.
 */
export function generateBlueprintSql(blueprint: PageBlueprint): string {
  const pageValues = [
    sqlNullableString(blueprint.title),
    sqlNullableString(blueprint.slug),
    sqlNullableString(blueprint.meta_description),
    sqlNullableString(blueprint.status),
    "now()",
  ].join(", ");

  const sectionRows = blueprint.sections
    .map((section) => {
      const cols = [
        sqlNullableString(section.section_type),
        String(section.sort_order),
        sqlBool(section.is_active),
        sqlNullableString(section.headline),
        sqlNullableString(section.subheadline),
        sqlNullableString(section.body),
        sqlNullableString(section.image_url),
        sqlNullableString(section.cta_text),
        sqlNullableString(section.cta_url),
        sqlJson(section.settings ?? {}),
        "now()",
      ];
      return `    (${cols.join(", ")})`;
    })
    .join(",\n");

  return `-- Cavender CMS blueprint SQL (backup/migration only)
-- Page: ${blueprint.title} (/${blueprint.slug})
BEGIN;

WITH new_page AS (
  INSERT INTO site_pages (title, slug, meta_description, status, updated_at)
  VALUES (${pageValues})
  RETURNING id
)
INSERT INTO page_sections (
  page_id,
  section_type,
  sort_order,
  is_active,
  headline,
  subheadline,
  body,
  image_url,
  cta_text,
  cta_url,
  settings,
  updated_at,
  title,
  subtitle,
  content
)
SELECT
  np.id,
  v.section_type,
  v.sort_order,
  v.is_active,
  v.headline,
  v.subheadline,
  v.body,
  v.image_url,
  v.cta_text,
  v.cta_url,
  v.settings,
  v.updated_at,
  NULL::text,
  NULL::text,
  NULL::text
FROM new_page np
CROSS JOIN (
  VALUES
${sectionRows}
) AS v(
  section_type,
  sort_order,
  is_active,
  headline,
  subheadline,
  body,
  image_url,
  cta_text,
  cta_url,
  settings,
  updated_at
);

COMMIT;
`;
}
