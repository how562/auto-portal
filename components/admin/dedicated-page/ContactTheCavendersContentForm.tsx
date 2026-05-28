"use client";

import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

const HERO_HINT = "Recommended: 1920×720";
const PORTRAIT_HINT = "Recommended: 1200×1400 portrait or larger";

export function ContactTheCavendersContentForm({
  content,
  onChange,
}: {
  content: ContactTheCavendersPageContent;
  onChange: (content: ContactTheCavendersPageContent) => void;
}) {
  function patch<K extends keyof ContactTheCavendersPageContent>(
    key: K,
    value: ContactTheCavendersPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Edit hero, intro copy, leadership portrait, form labels, success messages, and quote.
        Form submissions are stored in Supabase (
        <code className="text-xs">contact_the_cavenders_submissions</code>). Location options are
        fixed in code to match validation.
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
        />
        <TextAreaField
          label="Supporting text"
          value={content.hero.supportingText}
          onChange={(supportingText) => patch("hero", { ...content.hero, supportingText })}
          className="sm:col-span-2"
          rows={3}
        />
        <TextField
          label={`Background image URL · ${HERO_HINT}`}
          value={content.hero.backgroundImageUrl}
          onChange={(backgroundImageUrl) =>
            patch("hero", { ...content.hero, backgroundImageUrl })
          }
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Intro (left column)">
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
          label={`Leadership image URL · ${PORTRAIT_HINT}`}
          value={content.intro.leadershipImageUrl}
          onChange={(leadershipImageUrl) =>
            patch("intro", { ...content.intro, leadershipImageUrl })
          }
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Leadership image alt text"
          value={content.intro.leadershipImageAlt}
          onChange={(leadershipImageAlt) =>
            patch("intro", { ...content.intro, leadershipImageAlt })
          }
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="Form card copy">
        <TextField
          label="Card heading"
          value={content.form.cardHeading}
          onChange={(cardHeading) => patch("form", { ...content.form, cardHeading })}
        />
        <TextField
          label="Submit button label"
          value={content.form.submitLabel}
          onChange={(submitLabel) => patch("form", { ...content.form, submitLabel })}
        />
        <TextAreaField
          label="Trust note (below button)"
          value={content.form.trustNote}
          onChange={(trustNote) => patch("form", { ...content.form, trustNote })}
          className="sm:col-span-2"
          rows={2}
        />
        <TextField
          label="Success title"
          value={content.form.successTitle}
          onChange={(successTitle) => patch("form", { ...content.form, successTitle })}
        />
        <TextAreaField
          label="Success message"
          value={content.form.successMessage}
          onChange={(successMessage) => patch("form", { ...content.form, successMessage })}
          className="sm:col-span-2"
          rows={2}
        />
      </FormSection>

      <FormSection title="Quote (footer)">
        <TextField
          label="Quote text"
          value={content.quote.text}
          onChange={(text) => patch("quote", { ...content.quote, text })}
          className="sm:col-span-2"
        />
        <TextField
          label="Attribution"
          value={content.quote.attribution}
          onChange={(attribution) => patch("quote", { ...content.quote, attribution })}
          className="sm:col-span-2"
        />
      </FormSection>
    </div>
  );
}
