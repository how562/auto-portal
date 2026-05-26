import { CMS_SECTION_REGISTRY } from "./cmsSectionRegistry";
import { CMS_SECTION_TYPES, type CMSSectionType } from "./cmsTypes";
import { SECTION_SHOWCASE_PRESET_DEFS } from "./sectionShowcasePresetData";

const SCREENSHOT_PREFERRED_TYPES: CMSSectionType[] = [
  "hero",
  "image_text",
  "text_block",
  "cta_band",
  "card_grid",
  "faq",
  "stats",
  "form",
  "locations",
  "split_feature",
  "inventory_collection",
  "custom_html",
];

function supportedTypes(): CMSSectionType[] {
  return CMS_SECTION_TYPES.filter((t) => CMS_SECTION_REGISTRY[t].supported);
}

function registrySummary(): string {
  return supportedTypes()
    .map((type) => {
      const entry = CMS_SECTION_REGISTRY[type];
      return `- ${type}: ${entry.label} — ${entry.description}. settings keys: [${entry.settingsKeys.join(", ") || "none"}]`;
    })
    .join("\n");
}

function presetExamples(): string {
  const seen = new Set<CMSSectionType>();
  const lines: string[] = [];

  for (const preset of SECTION_SHOWCASE_PRESET_DEFS) {
    if (!CMS_SECTION_REGISTRY[preset.section_type]?.supported) continue;
    if (seen.has(preset.section_type) && seen.size > 12) continue;
    seen.add(preset.section_type);

    const settings = preset.fields.settings ?? {};
    lines.push(
      `  ${preset.section_type} (${preset.variantLabel}): headline="${preset.fields.headline ?? ""}", settings=${JSON.stringify(settings)}`,
    );
    if (lines.length >= 14) break;
  }

  return lines.join("\n");
}

export function buildScreenshotBlueprintSystemPrompt(): string {
  const allowed = supportedTypes().join(", ");
  const preferred = SCREENSHOT_PREFERRED_TYPES.filter((t) =>
    supportedTypes().includes(t),
  ).join(", ");

  return `You are a Cavender Auto Group CMS architect. You analyze webpage screenshots and output a JSON page blueprint ONLY — never React, HTML components, or code.

ALLOWED section_type values (use ONLY these exact strings):
${allowed}

Prefer mapping visual regions to these types (in order): ${preferred}.
Use community_hero, top_picks, or cavender_commitment ONLY when the screenshot clearly matches those homepage-specific patterns.
Use custom_html ONLY when no other section type can represent the content (legal fine print, odd markup). Do not default to custom_html.

Section registry:
${registrySummary()}

Preset library examples (reuse settings patterns when similar):
${presetExamples()}

Blueprint JSON schema (return exactly this shape):
{
  "title": "string",
  "slug": "kebab-case-string",
  "meta_description": "string or null",
  "status": "draft",
  "sections": [
    {
      "section_type": "one of allowed types",
      "headline": "string or null",
      "subheadline": "string or null",
      "body": "plain text or null — no HTML except custom_html via settings.html",
      "image_url": "path like /hero/dealership.jpg or null — no external URLs",
      "cta_text": "string or null",
      "cta_url": "relative path like /inventory or null",
      "settings": {},
      "sort_order": 10,
      "is_active": true
    }
  ]
}

Rules:
- status MUST be "draft".
- sort_order gaps of 10 (10, 20, 30…).
- Extract visible copy from the screenshot; do not invent lorem ipsum.
- Plain text in headline/subheadline/body — no HTML tags unless section_type is custom_html (then put safe HTML in settings.html only).
- Map hero banners → hero; split image+copy → image_text; paragraphs → text_block; button rows → cta_band; card grids → card_grid; FAQ accordions → faq with settings.items; stat columns → stats with settings.items; forms → form; store lists → locations; vehicle grids → inventory_collection with settings.limit.
- Never invent unsupported section_type values.
- Output valid JSON only.`;
}

export interface ScreenshotBlueprintNotes {
  pageTitle?: string;
  slug?: string;
  tone?: string;
  sectionNotes?: string;
}

export function buildScreenshotBlueprintUserText(notes: ScreenshotBlueprintNotes): string {
  const parts = [
    "Analyze the attached webpage screenshot and produce a CMS page blueprint JSON.",
    "Map each visible section top-to-bottom into supported section_type values.",
  ];

  if (notes.pageTitle?.trim()) {
    parts.push(`Preferred page title: ${notes.pageTitle.trim()}`);
  }
  if (notes.slug?.trim()) {
    parts.push(`Preferred slug: ${notes.slug.trim()}`);
  }
  if (notes.tone?.trim()) {
    parts.push(`Tone/voice for copy: ${notes.tone.trim()}`);
  }
  if (notes.sectionNotes?.trim()) {
    parts.push(`Section guidance (include/omit): ${notes.sectionNotes.trim()}`);
  }

  return parts.join("\n");
}
