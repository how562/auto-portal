"use client";

import { useState } from "react";
import { CommunityHeroImageSlots } from "@/components/admin/CommunityHeroImageSlots";
import { getHeroImageUrls } from "@/lib/communityHeroAdmin";
import { HERO_IMAGE_POSITIONS } from "@/lib/communityHeroTypes";
import {
  SectionEditorField,
  SectionTextInput,
} from "@/components/admin/SectionContentEditor";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";
import type { PageSection } from "@/lib/cmsTypes";

interface HeroHomepageSectionEditorProps {
  initial: CommunityHeroContent;
  sectionId: string;
  onSave: (content: CommunityHeroContent) => Promise<void>;
  onCancel: () => void;
}

export function HeroHomepageSectionEditor({
  initial,
  sectionId,
  onSave,
  onCancel,
}: HeroHomepageSectionEditorProps) {
  const [content, setContent] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings =
    (content.pageSection?.settings as Record<string, unknown> | undefined) ??
    {};

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
      <SectionEditorField label="Eyebrow label">
        <SectionTextInput
          value={content.eyebrow.label}
          onChange={(label) =>
            setContent((c) => ({ ...c, eyebrow: { ...c.eyebrow, label } }))
          }
        />
      </SectionEditorField>
      <SectionEditorField label="Eyebrow link URL">
        <SectionTextInput
          value={content.eyebrow.url}
          onChange={(url) =>
            setContent((c) => ({ ...c, eyebrow: { ...c.eyebrow, url } }))
          }
          placeholder="/inventory or https://…"
        />
      </SectionEditorField>

      <SectionEditorField
        label="Headline"
        hint="One line per row. The last line of three or more is styled muted automatically."
      >
        <SectionTextInput
          multiline
          value={content.headlineLines.map((l) => l.text).join("\n")}
          onChange={(text) => {
            const lines = text
              .split(/\n+/)
              .map((line) => line.trim())
              .filter(Boolean);
            setContent((c) => ({
              ...c,
              headlineLines: lines.map((line, index) => ({
                text: line,
                muted: lines.length >= 3 && index === lines.length - 1,
              })),
            }));
          }}
        />
      </SectionEditorField>

      <SectionEditorField label="Subheadline">
        <SectionTextInput
          value={content.subheadline}
          onChange={(subheadline) => setContent((c) => ({ ...c, subheadline }))}
        />
      </SectionEditorField>

      <SectionEditorField label="Body">
        <SectionTextInput
          multiline
          value={content.body}
          onChange={(body) => setContent((c) => ({ ...c, body }))}
        />
      </SectionEditorField>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionEditorField label="Primary button label">
          <SectionTextInput
            value={content.buttons[0]?.label ?? ""}
            onChange={(label) => {
              const buttons = [...content.buttons];
              const first = buttons[0] ?? {
                label: "",
                url: "",
                variant: "primary" as const,
              };
              buttons[0] = { ...first, label, variant: "primary" };
              setContent((c) => ({ ...c, buttons }));
            }}
          />
        </SectionEditorField>
        <SectionEditorField label="Primary button URL">
          <SectionTextInput
            value={content.buttons[0]?.url ?? ""}
            onChange={(url) => {
              const buttons = [...content.buttons];
              const first = buttons[0] ?? {
                label: "",
                url: "",
                variant: "primary" as const,
              };
              buttons[0] = { ...first, url, variant: "primary" };
              setContent((c) => ({ ...c, buttons }));
            }}
          />
        </SectionEditorField>
        <SectionEditorField label="Secondary button label">
          <SectionTextInput
            value={content.buttons[1]?.label ?? ""}
            onChange={(label) => {
              const buttons = [...content.buttons];
              const second = buttons[1] ?? {
                label: "",
                url: "",
                variant: "secondary" as const,
              };
              buttons[1] = { ...second, label, variant: "secondary" };
              setContent((c) => ({ ...c, buttons }));
            }}
          />
        </SectionEditorField>
        <SectionEditorField label="Secondary button URL">
          <SectionTextInput
            value={content.buttons[1]?.url ?? ""}
            onChange={(url) => {
              const buttons = [...content.buttons];
              const second = buttons[1] ?? {
                label: "",
                url: "",
                variant: "secondary" as const,
              };
              buttons[1] = { ...second, url, variant: "secondary" };
              setContent((c) => ({ ...c, buttons }));
            }}
          />
        </SectionEditorField>
      </div>

      <CommunityHeroImageSlots
        sectionId={sectionId}
        settings={settings}
        onSettingsSaved={(nextSettings, section) => {
          const urls = getHeroImageUrls(nextSettings);
          setContent((c) => ({
            ...c,
            images: HERO_IMAGE_POSITIONS.map((position) => ({
              position,
              url: urls[position] || undefined,
            })),
            pageSection: section
              ? ({ ...c.pageSection, settings: nextSettings } as PageSection)
              : c.pageSection,
          }));
        }}
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
