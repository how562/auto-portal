"use client";

import type { AboutUsPageContent, AboutUsPillar } from "@/lib/aboutUsPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
  linesFromTextarea,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";

const PILLAR_ICONS: AboutUsPillar["icon"][] = [
  "local_roots",
  "our_people",
  "our_promise",
];

export function AboutUsContentForm({
  content,
  onChange,
}: {
  content: AboutUsPageContent;
  onChange: (content: AboutUsPageContent) => void;
}) {
  function patch<K extends keyof AboutUsPageContent>(
    key: K,
    value: AboutUsPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  const pillars =
    content.whoWeAre.pillars?.length >= 3
      ? content.whoWeAre.pillars
      : content.whoWeAre.pillars ?? [];

  return (
    <div className="space-y-6">
      <FormSection title="Hero (50/50 header)">
        <TextField
          label="Title line 1"
          value={content.hero.titleLine1 ?? ""}
          onChange={(titleLine1) => patch("hero", { ...content.hero, titleLine1 })}
        />
        <TextField
          label="Title line 2 (brush accent)"
          value={content.hero.titleLine2 ?? ""}
          onChange={(titleLine2) => patch("hero", { ...content.hero, titleLine2 })}
        />
        <TextField
          label="Signature"
          value={content.hero.signature ?? ""}
          onChange={(signature) => patch("hero", { ...content.hero, signature })}
        />
        <TextAreaField
          label="Intro paragraphs (one per line)"
          value={textareaFromLines(content.hero.introParagraphs ?? content.hero.tagline ?? [])}
          onChange={(text) =>
            patch("hero", {
              ...content.hero,
              introParagraphs: linesFromTextarea(text),
            })
          }
          className="sm:col-span-2"
          rows={4}
        />
        <TextField
          label="Hero image URL"
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Hero image alt"
          value={content.hero.imageAlt ?? ""}
          onChange={(imageAlt) => patch("hero", { ...content.hero, imageAlt })}
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="Who we are">
        <TextField
          label="Eyebrow"
          value={content.whoWeAre.eyebrow}
          onChange={(eyebrow) => patch("whoWeAre", { ...content.whoWeAre, eyebrow })}
        />
        <TextField
          label="Headline"
          value={content.whoWeAre.headline}
          onChange={(headline) => patch("whoWeAre", { ...content.whoWeAre, headline })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Paragraphs (one per line)"
          value={textareaFromLines(content.whoWeAre.paragraphs)}
          onChange={(text) =>
            patch("whoWeAre", {
              ...content.whoWeAre,
              paragraphs: linesFromTextarea(text),
            })
          }
          className="sm:col-span-2"
          rows={4}
        />
        <TextField
          label="Image URL"
          value={content.whoWeAre.imageUrl}
          onChange={(imageUrl) => patch("whoWeAre", { ...content.whoWeAre, imageUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Image alt"
          value={content.whoWeAre.imageAlt ?? ""}
          onChange={(imageAlt) => patch("whoWeAre", { ...content.whoWeAre, imageAlt })}
          className="sm:col-span-2"
        />
        {pillars.map((pillar, index) => (
          <div key={pillar.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Pillar {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={pillar.title}
                onChange={(title) => {
                  const next = [...pillars];
                  next[index] = { ...pillar, title };
                  patch("whoWeAre", { ...content.whoWeAre, pillars: next });
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={pillar.icon}
                  onChange={(e) => {
                    const next = [...pillars];
                    next[index] = {
                      ...pillar,
                      icon: e.target.value as AboutUsPillar["icon"],
                    };
                    patch("whoWeAre", { ...content.whoWeAre, pillars: next });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  {PILLAR_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={pillar.description}
                onChange={(description) => {
                  const next = [...pillars];
                  next[index] = { ...pillar, description };
                  patch("whoWeAre", { ...content.whoWeAre, pillars: next });
                }}
                className="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="Our approach">
        <TextField
          label="Eyebrow"
          value={content.ourApproach.eyebrow}
          onChange={(eyebrow) => patch("ourApproach", { ...content.ourApproach, eyebrow })}
        />
        <TextField
          label="Headline line 1"
          value={content.ourApproach.headline}
          onChange={(headline) => patch("ourApproach", { ...content.ourApproach, headline })}
        />
        <TextField
          label="Headline line 2 (brush accent)"
          value={content.ourApproach.headlineAccent}
          onChange={(headlineAccent) =>
            patch("ourApproach", { ...content.ourApproach, headlineAccent })
          }
        />
        <TextField
          label="Image URL"
          value={content.ourApproach.imageUrl}
          onChange={(imageUrl) => patch("ourApproach", { ...content.ourApproach, imageUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Image alt"
          value={content.ourApproach.imageAlt ?? ""}
          onChange={(imageAlt) => patch("ourApproach", { ...content.ourApproach, imageAlt })}
          className="sm:col-span-2"
        />
        {content.ourApproach.features.map((feature, index) => (
          <div key={feature.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Feature {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={feature.title}
                onChange={(title) => {
                  const features = [...content.ourApproach.features];
                  features[index] = { ...feature, title };
                  patch("ourApproach", { ...content.ourApproach, features });
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={feature.icon}
                  onChange={(e) => {
                    const features = [...content.ourApproach.features];
                    features[index] = {
                      ...feature,
                      icon: e.target.value as typeof feature.icon,
                    };
                    patch("ourApproach", { ...content.ourApproach, features });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="honesty">Honesty</option>
                  <option value="customer">Customer</option>
                  <option value="quality">Quality</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={feature.description}
                onChange={(description) => {
                  const features = [...content.ourApproach.features];
                  features[index] = { ...feature, description };
                  patch("ourApproach", { ...content.ourApproach, features });
                }}
                className="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="Our values">
        <TextField
          label="Eyebrow"
          value={content.ourValues.eyebrow}
          onChange={(eyebrow) => patch("ourValues", { ...content.ourValues, eyebrow })}
          className="sm:col-span-2"
        />
        {content.ourValues.items.map((item, index) => (
          <div key={item.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Value {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={item.title}
                onChange={(title) => {
                  const items = [...content.ourValues.items];
                  items[index] = { ...item, title };
                  patch("ourValues", { ...content.ourValues, items });
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={item.icon}
                  onChange={(e) => {
                    const items = [...content.ourValues.items];
                    items[index] = { ...item, icon: e.target.value as typeof item.icon };
                    patch("ourValues", { ...content.ourValues, items });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="integrity">Integrity</option>
                  <option value="respect">Respect</option>
                  <option value="excellence">Excellence</option>
                  <option value="passion">Passion</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const items = [...content.ourValues.items];
                  items[index] = { ...item, description };
                  patch("ourValues", { ...content.ourValues, items });
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
