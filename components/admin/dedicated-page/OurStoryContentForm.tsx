"use client";

import type {
  OurStoryMilestone,
  OurStoryPageContent,
} from "@/lib/ourStoryPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

const HERO_HINT = "Recommended: 1920×720";
const POSTER_HINT = "Recommended: 1280×720";
const MILESTONE_HINT = "Recommended: 1200×800 — use a landscape crop for best results on mobile";

export function OurStoryContentForm({
  content,
  onChange,
}: {
  content: OurStoryPageContent;
  onChange: (content: OurStoryPageContent) => void;
}) {
  function patch<K extends keyof OurStoryPageContent>(
    key: K,
    value: OurStoryPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  function patchMilestone(index: number, updates: Partial<OurStoryMilestone>) {
    const milestones = [...content.timeline.milestones];
    milestones[index] = { ...milestones[index], ...updates };
    patch("timeline", { ...content.timeline, milestones });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Flagship history page with scroll-driven horizontal timeline on desktop. Mobile
        and reduced-motion visitors see a vertical timeline. All copy, media, and CTA
        links are editable below.
      </p>

      <FormSection title="Hero">
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(title) => patch("hero", { ...content.hero, title })}
        />
        <TextField
          label="Subtitle"
          value={content.hero.subtitle}
          onChange={(subtitle) => patch("hero", { ...content.hero, subtitle })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Supporting line"
          value={content.hero.supportingLine}
          onChange={(supportingLine) =>
            patch("hero", { ...content.hero, supportingLine })
          }
          className="sm:col-span-2"
          rows={2}
        />
        <TextField
          label={`Hero image URL · ${HERO_HINT}`}
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="History video">
        <TextField
          label="Section heading"
          value={content.video.heading}
          onChange={(heading) => patch("video", { ...content.video, heading })}
        />
        <TextField
          label="Video title (accessibility)"
          value={content.video.title}
          onChange={(title) => patch("video", { ...content.video, title })}
        />
        <TextAreaField
          label="Description"
          value={content.video.description}
          onChange={(description) => patch("video", { ...content.video, description })}
          className="sm:col-span-2"
          rows={2}
        />
        <TextField
          label="Video URL (YouTube, Vimeo, or direct .mp4)"
          value={content.video.videoUrl}
          onChange={(videoUrl) => patch("video", { ...content.video, videoUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label={`Poster image URL · ${POSTER_HINT}`}
          value={content.video.posterImage}
          onChange={(posterImage) => patch("video", { ...content.video, posterImage })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Timeline section header">
        <TextField
          label="Eyebrow"
          value={content.timeline.eyebrow}
          onChange={(eyebrow) => patch("timeline", { ...content.timeline, eyebrow })}
        />
        <TextField
          label="Title"
          value={content.timeline.title}
          onChange={(title) => patch("timeline", { ...content.timeline, title })}
        />
        <TextAreaField
          label="Intro paragraph"
          value={content.timeline.intro ?? ""}
          onChange={(intro) => patch("timeline", { ...content.timeline, intro })}
          className="sm:col-span-2"
          rows={2}
        />
        <TextField
          label="Closing tagline (e.g. Confidence Is Cavender)"
          value={content.timeline.finaleTagline ?? ""}
          onChange={(finaleTagline) =>
            patch("timeline", { ...content.timeline, finaleTagline })
          }
          className="sm:col-span-2"
        />
      </FormSection>

      {content.timeline.milestones.map((milestone, index) => (
        <FormSection key={milestone.id} title={`Timeline · ${milestone.title}`}>
          <TextField
            label="Display year / era"
            value={milestone.year}
            onChange={(year) => patchMilestone(index, { year })}
          />
          <TextField
            label="Nav short label"
            value={milestone.shortLabel ?? ""}
            onChange={(shortLabel) => patchMilestone(index, { shortLabel })}
          />
          <TextField
            label="Generation label (optional)"
            value={milestone.generation ?? ""}
            onChange={(generation) => patchMilestone(index, { generation })}
          />
          <TextField
            label="Eyebrow / chapter"
            value={milestone.eyebrow}
            onChange={(eyebrow) => patchMilestone(index, { eyebrow })}
          />
          <TextField
            label="Title"
            value={milestone.title}
            onChange={(title) => patchMilestone(index, { title })}
            className="sm:col-span-2"
          />
          <TextAreaField
            label="Description"
            value={milestone.description}
            onChange={(description) => patchMilestone(index, { description })}
            className="sm:col-span-2"
            rows={3}
          />
          <TextField
            label={`Image URL · ${MILESTONE_HINT}`}
            value={milestone.imageUrl}
            onChange={(imageUrl) => patchMilestone(index, { imageUrl })}
            className="sm:col-span-2"
            mono
          />
          <TextField
            label="Image alt text"
            value={milestone.imageAlt}
            onChange={(imageAlt) => patchMilestone(index, { imageAlt })}
          />
          <TextField
            label="Optional link label"
            value={milestone.linkLabel}
            onChange={(linkLabel) => patchMilestone(index, { linkLabel })}
          />
          <TextField
            label="Optional link URL"
            value={milestone.linkUrl}
            onChange={(linkUrl) => patchMilestone(index, { linkUrl })}
            mono
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={milestone.variant === "finale"}
              onChange={(e) =>
                patchMilestone(index, {
                  variant: e.target.checked ? "finale" : "default",
                })
              }
            />
            Finale milestone (emphasized closing card)
          </label>
        </FormSection>
      ))}

      <FormSection title="Legacy / values">
        <TextField
          label="Heading"
          value={content.legacy.heading}
          onChange={(heading) => patch("legacy", { ...content.legacy, heading })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Body"
          value={content.legacy.body}
          onChange={(body) => patch("legacy", { ...content.legacy, body })}
          className="sm:col-span-2"
          rows={3}
        />
        {content.legacy.values.map((value, index) => (
          <div
            key={value.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Value {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={value.title}
                onChange={(title) => {
                  const values = [...content.legacy.values];
                  values[index] = { ...value, title };
                  patch("legacy", { ...content.legacy, values });
                }}
              />
              <TextAreaField
                label="Description"
                value={value.description}
                onChange={(description) => {
                  const values = [...content.legacy.values];
                  values[index] = { ...value, description };
                  patch("legacy", { ...content.legacy, values });
                }}
                rows={2}
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="CTA band">
        <TextField
          label="Heading"
          value={content.cta.heading}
          onChange={(heading) => patch("cta", { ...content.cta, heading })}
          className="sm:col-span-2"
        />
        {content.cta.buttons.map((button, index) => (
          <div
            key={button.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Button {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Label"
                value={button.label}
                onChange={(label) => {
                  const buttons = [...content.cta.buttons];
                  buttons[index] = { ...button, label };
                  patch("cta", { ...content.cta, buttons });
                }}
              />
              <TextField
                label="URL"
                value={button.href}
                onChange={(href) => {
                  const buttons = [...content.cta.buttons];
                  buttons[index] = { ...button, href };
                  patch("cta", { ...content.cta, buttons });
                }}
                mono
              />
            </div>
          </div>
        ))}
      </FormSection>
    </div>
  );
}
