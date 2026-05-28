"use client";

import { useState } from "react";
import { SocialFeedPostsEditor } from "@/components/admin/SocialFeedPostsEditor";
import {
  SectionEditorField,
  SectionTextInput,
} from "@/components/admin/SectionContentEditor";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SocialFeedHomepageSectionEditorProps {
  initial: SocialFeedCmsContent;
  onSave: (content: SocialFeedCmsContent) => Promise<void>;
  onCancel: () => void;
}

export function SocialFeedHomepageSectionEditor({
  initial,
  onSave,
  onCancel,
}: SocialFeedHomepageSectionEditorProps) {
  const [content, setContent] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Backup posts display when the live Meta feed is unavailable. Live feed toggles
        remain in environment configuration.
      </p>

      <SectionEditorField label="Eyebrow">
        <SectionTextInput
          value={content.eyebrow}
          onChange={(eyebrow) => setContent((c) => ({ ...c, eyebrow }))}
        />
      </SectionEditorField>
      <SectionEditorField label="Headline">
        <SectionTextInput
          value={content.headline}
          onChange={(headline) => setContent((c) => ({ ...c, headline }))}
        />
      </SectionEditorField>
      <SectionEditorField label="Description">
        <SectionTextInput
          multiline
          value={content.description}
          onChange={(description) => setContent((c) => ({ ...c, description }))}
        />
      </SectionEditorField>

      <SocialFeedPostsEditor
        posts={content.posts}
        onChange={(posts) => setContent((c) => ({ ...c, posts }))}
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
        <button type="button" onClick={onCancel} className={btnSecondaryMd}>
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className={`${btnPrimaryMd} disabled:opacity-50`}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
