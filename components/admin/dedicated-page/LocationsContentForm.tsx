"use client";

import type { LocationsPageContent } from "@/lib/locationsPageTypes";
import {
  FormSection,
  TextAreaField,
  TextField,
  linesFromTextarea,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";

export function LocationsContentForm({
  content,
  onChange,
}: {
  content: LocationsPageContent;
  onChange: (content: LocationsPageContent) => void;
}) {
  function patch<K extends keyof LocationsPageContent>(
    key: K,
    value: LocationsPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Dealership cards and map markers still come from store data in the database.
        Edit page copy and imagery here.
      </p>

      <FormSection title="Hero">
        <TextField
          label="Kicker"
          value={content.hero.kicker}
          onChange={(kicker) => patch("hero", { ...content.hero, kicker })}
        />
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(title) => patch("hero", { ...content.hero, title })}
        />
        <TextField
          label="Tagline (fallback when no stores loaded)"
          value={content.hero.tagline}
          onChange={(tagline) => patch("hero", { ...content.hero, tagline })}
          className="sm:col-span-2"
        />
        <TextField
          label="Hero image URL"
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Map section">
        <TextField
          label="Eyebrow"
          value={content.map.eyebrow}
          onChange={(eyebrow) => patch("map", { ...content.map, eyebrow })}
        />
        <TextField
          label="Headline"
          value={content.map.headline}
          onChange={(headline) => patch("map", { ...content.map, headline })}
        />
        <TextAreaField
          label="Paragraphs (one per line)"
          value={textareaFromLines(content.map.paragraphs)}
          onChange={(text) =>
            patch("map", { ...content.map, paragraphs: linesFromTextarea(text) })
          }
          className="sm:col-span-2"
          rows={4}
        />
        <TextField
          label="CTA label"
          value={content.map.ctaLabel}
          onChange={(ctaLabel) => patch("map", { ...content.map, ctaLabel })}
        />
      </FormSection>

      <FormSection title="Help band">
        <TextField
          label="Headline"
          value={content.help.headline}
          onChange={(headline) => patch("help", { ...content.help, headline })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Body"
          value={content.help.body}
          onChange={(body) => patch("help", { ...content.help, body })}
          className="sm:col-span-2"
        />
        {content.help.features.map((feature, index) => (
          <div key={feature.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Feature {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={feature.title}
                onChange={(title) => {
                  const features = [...content.help.features];
                  features[index] = { ...feature, title };
                  patch("help", { ...content.help, features });
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={feature.icon}
                  onChange={(e) => {
                    const features = [...content.help.features];
                    features[index] = {
                      ...feature,
                      icon: e.target.value as typeof feature.icon,
                    };
                    patch("help", { ...content.help, features });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="pin">Pin</option>
                  <option value="clock">Clock</option>
                  <option value="handshake">Handshake</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={feature.description}
                onChange={(description) => {
                  const features = [...content.help.features];
                  features[index] = { ...feature, description };
                  patch("help", { ...content.help, features });
                }}
                className="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </FormSection>
    </div>
  );
}
