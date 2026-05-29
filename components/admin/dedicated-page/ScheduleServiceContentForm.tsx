"use client";

import type { ScheduleServicePageContent } from "@/lib/serviceSchedulingTypes";
import { DealershipDirectoryForm } from "@/components/admin/dedicated-page/DealershipDirectoryForm";
import {
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

export function ScheduleServiceContentForm({
  content,
  onChange,
}: {
  content: ScheduleServicePageContent;
  onChange: (content: ScheduleServicePageContent) => void;
}) {
  function patch<K extends keyof ScheduleServicePageContent>(
    key: K,
    value: ScheduleServicePageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Edit page copy, feature band, and dealership images plus sales, service, and parts
        contact numbers and CTA links. Blank fields fall back to store data.
      </p>

      <FormSection title="Hero">
        <TextField
          label="Kicker"
          value={content.hero.kicker}
          onChange={(kicker) => patch("hero", { ...content.hero, kicker })}
          className="sm:col-span-2"
        />
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(title) => patch("hero", { ...content.hero, title })}
        />
        <TextField
          label="Tagline"
          value={content.hero.tagline}
          onChange={(tagline) => patch("hero", { ...content.hero, tagline })}
        />
        <TextField
          label="Hero image URL"
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Intro">
        <TextField
          label="Headline"
          value={content.intro.headline}
          onChange={(headline) => patch("intro", { ...content.intro, headline })}
        />
        <TextField
          label="Subheadline"
          value={content.intro.subheadline}
          onChange={(subheadline) => patch("intro", { ...content.intro, subheadline })}
        />
      </FormSection>

      <FormSection title="Features">
        {content.features.map((feature, index) => (
          <div key={feature.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Feature {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={feature.title}
                onChange={(title) => {
                  const features = [...content.features];
                  features[index] = { ...feature, title };
                  patch("features", features);
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={feature.icon}
                  onChange={(e) => {
                    const features = [...content.features];
                    features[index] = {
                      ...feature,
                      icon: e.target.value as typeof feature.icon,
                    };
                    patch("features", features);
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="calendar">Calendar</option>
                  <option value="techs">Techs</option>
                  <option value="quality">Quality</option>
                  <option value="time">Time</option>
                  <option value="support">Support</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={feature.description}
                onChange={(description) => {
                  const features = [...content.features];
                  features[index] = { ...feature, description };
                  patch("features", features);
                }}
                className="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </FormSection>

      <DealershipDirectoryForm
        dealerships={content.dealerships}
        onChange={(dealerships) => patch("dealerships", dealerships)}
      />
    </div>
  );
}
