"use client";

import type {
  CavenderCaresGalleryImage,
  CavenderCaresPageContent,
} from "@/lib/cavenderCaresPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";

const HERO_IMAGE_HINT = "Recommended: 1920×620";
const INTRO_IMAGE_HINT = "Recommended: 900×700";
const GALLERY_IMAGE_HINT = "Recommended: 900×600 or larger";
const LOGO_HINT = "Partner logos: transparent PNG or SVG preferred";

export function CavenderCaresContentForm({
  content,
  onChange,
}: {
  content: CavenderCaresPageContent;
  onChange: (content: CavenderCaresPageContent) => void;
}) {
  function patch<K extends keyof CavenderCaresPageContent>(
    key: K,
    value: CavenderCaresPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  function patchGalleryImage(
    row: "topRow" | "bottomRow",
    index: number,
    updates: Partial<CavenderCaresGalleryImage>,
  ) {
    const images = [...content.gallery[row]];
    images[index] = { ...images[index], ...updates };
    patch("gallery", { ...content.gallery, [row]: images });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Edit Cavender Cares copy and images. Layout matches the live page — hero, intro,
        impact numbers, partners, gallery, closing story, and contact line only.
      </p>

      <FormSection title="Hero / header">
        <TextField
          label="Cavender Cares logo URL (optional)"
          value={content.hero.logoUrl}
          onChange={(logoUrl) => patch("hero", { ...content.hero, logoUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Logo alt / brand label (when no logo image)"
          value={content.hero.logoAlt}
          onChange={(logoAlt) => patch("hero", { ...content.hero, logoAlt })}
        />
        <TextAreaField
          label="Headline"
          value={content.hero.headline}
          onChange={(headline) => patch("hero", { ...content.hero, headline })}
          className="sm:col-span-2"
          rows={3}
        />
        <TextField
          label={`Background image URL · ${HERO_IMAGE_HINT}`}
          value={content.hero.backgroundImageUrl}
          onChange={(backgroundImageUrl) =>
            patch("hero", { ...content.hero, backgroundImageUrl })
          }
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Intro (two-column)">
        <TextField
          label="Heading"
          value={content.intro.heading}
          onChange={(heading) => patch("intro", { ...content.intro, heading })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Body (blank line between paragraphs)"
          value={content.intro.body}
          onChange={(body) => patch("intro", { ...content.intro, body })}
          className="sm:col-span-2"
          rows={8}
        />
        <TextField
          label={`Main image URL · ${INTRO_IMAGE_HINT}`}
          value={content.intro.imageUrl}
          onChange={(imageUrl) => patch("intro", { ...content.intro, imageUrl })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Impact / numbers row">
        {content.impact.map((stat, index) => (
          <div
            key={stat.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Stat {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Value"
                value={stat.value}
                onChange={(value) => {
                  const impact = [...content.impact];
                  impact[index] = { ...stat, value };
                  patch("impact", impact);
                }}
              />
              <TextField
                label="Label"
                value={stat.label}
                onChange={(label) => {
                  const impact = [...content.impact];
                  impact[index] = { ...stat, label };
                  patch("impact", impact);
                }}
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="Partner logos">
        {content.partners.map((partner, index) => (
          <div
            key={partner.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Partner {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Name (placeholder if no logo)"
                value={partner.name}
                onChange={(name) => {
                  const partners = [...content.partners];
                  partners[index] = { ...partner, name };
                  patch("partners", partners);
                }}
              />
              <TextField
                label={`Logo URL · ${LOGO_HINT}`}
                value={partner.logoUrl}
                onChange={(logoUrl) => {
                  const partners = [...content.partners];
                  partners[index] = { ...partner, logoUrl };
                  patch("partners", partners);
                }}
                mono
              />
            </div>
          </div>
        ))}
        <TextField
          label="“And many more” line"
          value={content.partnersMoreLabel}
          onChange={(partnersMoreLabel) => patch("partnersMoreLabel", partnersMoreLabel)}
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="Gallery">
        <TextField
          label="Section heading"
          value={content.gallery.heading}
          onChange={(heading) =>
            patch("gallery", { ...content.gallery, heading })
          }
          className="sm:col-span-2"
        />
        <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Top row (3 images)
        </p>
        {content.gallery.topRow.map((image, index) => (
          <div
            key={image.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs text-[var(--muted)]">
              Top {index + 1} · {GALLERY_IMAGE_HINT}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Image URL"
                value={image.imageUrl}
                onChange={(imageUrl) => patchGalleryImage("topRow", index, { imageUrl })}
                mono
              />
              <TextField
                label="Alt text"
                value={image.alt}
                onChange={(alt) => patchGalleryImage("topRow", index, { alt })}
              />
            </div>
          </div>
        ))}
        <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Bottom row (2 larger images)
        </p>
        {content.gallery.bottomRow.map((image, index) => (
          <div
            key={image.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs text-[var(--muted)]">
              Bottom {index + 1} · {GALLERY_IMAGE_HINT}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Image URL"
                value={image.imageUrl}
                onChange={(imageUrl) =>
                  patchGalleryImage("bottomRow", index, { imageUrl })
                }
                mono
              />
              <TextField
                label="Alt text"
                value={image.alt}
                onChange={(alt) => patchGalleryImage("bottomRow", index, { alt })}
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="Closing story">
        <TextAreaField
          label="Paragraphs (one per line)"
          value={textareaFromLines(content.closing.paragraphs)}
          onChange={(text) =>
            patch("closing", {
              paragraphs: text
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
          className="sm:col-span-2"
          rows={12}
          hint="Each line becomes a paragraph on the live page."
        />
      </FormSection>

      <FormSection title="Contact line">
        <TextField
          label="Contact line"
          value={content.contact.line}
          onChange={(line) => patch("contact", { line })}
          className="sm:col-span-2"
        />
      </FormSection>
    </div>
  );
}
