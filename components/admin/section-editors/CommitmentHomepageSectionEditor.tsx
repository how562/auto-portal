"use client";

import { useState } from "react";
import {
  SectionEditorField,
  SectionImageUrlField,
  SectionTextInput,
} from "@/components/admin/SectionContentEditor";
import type { CommitmentSectionFormState } from "@/lib/homepageSectionContentAdmin";
import { COMMITMENT_VALUE_ORDER } from "@/lib/cavenderCommitmentTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface CommitmentHomepageSectionEditorProps {
  initial: CommitmentSectionFormState;
  onSave: (form: CommitmentSectionFormState) => Promise<void>;
  onCancel: () => void;
}

export function CommitmentHomepageSectionEditor({
  initial,
  onSave,
  onCancel,
}: CommitmentHomepageSectionEditorProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionEditorField label="Headline">
        <SectionTextInput
          value={form.headline}
          onChange={(headline) => setForm((f) => ({ ...f, headline }))}
        />
      </SectionEditorField>
      <SectionEditorField label="Body">
        <SectionTextInput
          multiline
          value={form.body}
          onChange={(body) => setForm((f) => ({ ...f, body }))}
        />
      </SectionEditorField>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionImageUrlField
          label="Left image"
          imageHintKey="commitmentSide"
          value={form.leftImageUrl}
          onChange={(leftImageUrl) => setForm((f) => ({ ...f, leftImageUrl }))}
        />
        <SectionImageUrlField
          label="Right image"
          imageHintKey="commitmentSide"
          value={form.rightImageUrl}
          onChange={(rightImageUrl) => setForm((f) => ({ ...f, rightImageUrl }))}
        />
        <SectionEditorField label="Left image alt text">
          <SectionTextInput
            value={form.leftImageAlt}
            onChange={(leftImageAlt) => setForm((f) => ({ ...f, leftImageAlt }))}
          />
        </SectionEditorField>
        <SectionEditorField label="Right image alt text">
          <SectionTextInput
            value={form.rightImageAlt}
            onChange={(rightImageAlt) => setForm((f) => ({ ...f, rightImageAlt }))}
          />
        </SectionEditorField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionEditorField label="Primary button URL">
          <SectionTextInput
            value={form.primaryCtaHref}
            onChange={(primaryCtaHref) => setForm((f) => ({ ...f, primaryCtaHref }))}
            placeholder="/cavender-commitment"
          />
        </SectionEditorField>
        <SectionEditorField label="Secondary button URL">
          <SectionTextInput
            value={form.secondaryCtaHref}
            onChange={(secondaryCtaHref) =>
              setForm((f) => ({ ...f, secondaryCtaHref }))
            }
          />
        </SectionEditorField>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Value cards
        </p>
        {COMMITMENT_VALUE_ORDER.map((id) => {
          const row = form.values.find((v) => v.id === id) ?? {
            id,
            title: "",
            description: "",
          };
          return (
            <div
              key={id}
              className="rounded-lg border border-[var(--line)] bg-[var(--cream)]/40 p-4 space-y-2"
            >
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">{id}</p>
              <SectionTextInput
                value={row.title}
                onChange={(title) =>
                  setForm((f) => ({
                    ...f,
                    values: f.values.some((v) => v.id === id)
                      ? f.values.map((v) => (v.id === id ? { ...v, title } : v))
                      : [...f.values, { ...row, title }],
                  }))
                }
                placeholder="Title"
              />
              <SectionTextInput
                multiline
                value={row.description}
                onChange={(description) =>
                  setForm((f) => ({
                    ...f,
                    values: f.values.some((v) => v.id === id)
                      ? f.values.map((v) =>
                          v.id === id ? { ...v, description } : v,
                        )
                      : [...f.values, { ...row, description }],
                  }))
                }
                placeholder="Description"
              />
            </div>
          );
        })}
      </div>

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
