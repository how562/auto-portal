"use client";

import type { ExecutiveTeamPageContent } from "@/lib/executiveTeamPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
  linesFromTextarea,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";
import { btnSecondaryMd } from "@/lib/buttonClasses";

export function ExecutiveTeamContentForm({
  content,
  onChange,
}: {
  content: ExecutiveTeamPageContent;
  onChange: (content: ExecutiveTeamPageContent) => void;
}) {
  function patch<K extends keyof ExecutiveTeamPageContent>(
    key: K,
    value: ExecutiveTeamPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <FormSection title="Hero">
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(title) => patch("hero", { ...content.hero, title })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Tagline (one line per row)"
          value={textareaFromLines(content.hero.tagline)}
          onChange={(text) =>
            patch("hero", { ...content.hero, tagline: linesFromTextarea(text) })
          }
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

      <FormSection title="Intro">
        <TextField
          label="Eyebrow"
          value={content.intro.eyebrow}
          onChange={(eyebrow) => patch("intro", { ...content.intro, eyebrow })}
        />
        <TextField
          label="Headline"
          value={content.intro.headline}
          onChange={(headline) => patch("intro", { ...content.intro, headline })}
        />
        <TextAreaField
          label="Paragraph"
          value={content.intro.paragraph}
          onChange={(paragraph) => patch("intro", { ...content.intro, paragraph })}
          className="sm:col-span-2"
        />
      </FormSection>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Executives
          </h2>
          <button
            type="button"
            className={btnSecondaryMd}
            onClick={() => {
              const id = `exec-${Date.now().toString(36)}`;
              patch("executives", [
                ...content.executives,
                {
                  id,
                  name: "Executive Name",
                  title: "Title",
                  image: "/images/hero/dealership.jpg",
                },
              ]);
            }}
          >
            Add executive
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {content.executives.map((executive, index) => (
            <div key={executive.id} className="rounded-xl border border-[var(--line)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Executive {index + 1}
                </p>
                <button
                  type="button"
                  className="text-xs text-red-700 hover:underline"
                  onClick={() => {
                    patch(
                      "executives",
                      content.executives.filter((e) => e.id !== executive.id),
                    );
                  }}
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Name"
                  value={executive.name}
                  onChange={(name) => {
                    const executives = [...content.executives];
                    executives[index] = { ...executive, name };
                    patch("executives", executives);
                  }}
                />
                <TextField
                  label="Title"
                  value={executive.title}
                  onChange={(title) => {
                    const executives = [...content.executives];
                    executives[index] = { ...executive, title };
                    patch("executives", executives);
                  }}
                />
                <TextField
                  label="Portrait image URL"
                  value={executive.image}
                  onChange={(image) => {
                    const executives = [...content.executives];
                    executives[index] = { ...executive, image };
                    patch("executives", executives);
                  }}
                  className="sm:col-span-2"
                  mono
                />
                <TextField
                  label="Email"
                  value={executive.email ?? ""}
                  onChange={(email) => {
                    const executives = [...content.executives];
                    executives[index] = {
                      ...executive,
                      email: email.trim() || undefined,
                    };
                    patch("executives", executives);
                  }}
                />
                <TextField
                  label="Phone"
                  value={executive.phone ?? ""}
                  onChange={(phone) => {
                    const executives = [...content.executives];
                    executives[index] = {
                      ...executive,
                      phone: phone.trim() || undefined,
                    };
                    patch("executives", executives);
                  }}
                />
                <TextField
                  label="LinkedIn URL"
                  value={executive.linkedinUrl ?? ""}
                  onChange={(linkedinUrl) => {
                    const executives = [...content.executives];
                    executives[index] = {
                      ...executive,
                      linkedinUrl: linkedinUrl.trim() || undefined,
                    };
                    patch("executives", executives);
                  }}
                  className="sm:col-span-2"
                  mono
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <FormSection title="Leadership message">
        <TextField
          label="Eyebrow"
          value={content.leadershipMessage.eyebrow}
          onChange={(eyebrow) =>
            patch("leadershipMessage", { ...content.leadershipMessage, eyebrow })
          }
        />
        <TextField
          label="Headline"
          value={content.leadershipMessage.headline}
          onChange={(headline) =>
            patch("leadershipMessage", { ...content.leadershipMessage, headline })
          }
        />
        <TextAreaField
          label="Body"
          value={content.leadershipMessage.body}
          onChange={(body) =>
            patch("leadershipMessage", { ...content.leadershipMessage, body })
          }
          className="sm:col-span-2"
        />
        {content.leadershipMessage.values.map((value, index) => (
          <div key={value.id} className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Value {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={value.title}
                onChange={(title) => {
                  const values = [...content.leadershipMessage.values];
                  values[index] = { ...value, title };
                  patch("leadershipMessage", { ...content.leadershipMessage, values });
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={value.icon}
                  onChange={(e) => {
                    const values = [...content.leadershipMessage.values];
                    values[index] = {
                      ...value,
                      icon: e.target.value as typeof value.icon,
                    };
                    patch("leadershipMessage", { ...content.leadershipMessage, values });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="integrity">Integrity</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="excellence">Excellence</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={value.description}
                onChange={(description) => {
                  const values = [...content.leadershipMessage.values];
                  values[index] = { ...value, description };
                  patch("leadershipMessage", { ...content.leadershipMessage, values });
                }}
                className="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="CTA">
        <TextField
          label="Primary button label"
          value={content.cta.primaryLabel}
          onChange={(primaryLabel) => patch("cta", { ...content.cta, primaryLabel })}
        />
        <TextField
          label="Primary button URL"
          value={content.cta.primaryHref}
          onChange={(primaryHref) => patch("cta", { ...content.cta, primaryHref })}
          mono
        />
        <TextField
          label="Secondary button label"
          value={content.cta.secondaryLabel}
          onChange={(secondaryLabel) => patch("cta", { ...content.cta, secondaryLabel })}
        />
        <TextField
          label="Secondary button URL"
          value={content.cta.secondaryHref}
          onChange={(secondaryHref) => patch("cta", { ...content.cta, secondaryHref })}
          mono
        />
      </FormSection>
    </div>
  );
}
