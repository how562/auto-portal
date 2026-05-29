"use client";

import type { ValueYourTradePageContent } from "@/lib/valueYourTradePageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
  linesFromTextarea,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";

export function ValueYourTradeContentForm({
  content,
  onChange,
}: {
  content: ValueYourTradePageContent;
  onChange: (content: ValueYourTradePageContent) => void;
}) {
  function patch<K extends keyof ValueYourTradePageContent>(
    key: K,
    value: ValueYourTradePageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        The page shows a utility intro band, a full-width divider, and a partner iframe below.
        Hero image URL is not used on the public layout.
      </p>

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

      <FormSection title="Partner iframe">
        <TextField
          label="Iframe URL"
          value={content.iframe.src}
          onChange={(src) => patch("iframe", { ...content.iframe, src })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Height (pixels)"
          value={String(content.iframe.height)}
          onChange={(raw) => {
            const height = Math.max(400, parseInt(raw, 10) || 2000);
            patch("iframe", { ...content.iframe, height });
          }}
        />
        <TextField
          label="Accessible title (screen readers)"
          value={content.iframe.title}
          onChange={(title) => patch("iframe", { ...content.iframe, title })}
        />
      </FormSection>
    </div>
  );
}
