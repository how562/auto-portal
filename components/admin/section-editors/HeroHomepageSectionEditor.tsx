"use client";

import { useState } from "react";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { CommunityHeroImageSlots } from "@/components/admin/CommunityHeroImageSlots";
import { getHeroImageUrls } from "@/lib/communityHeroAdmin";
import { HERO_IMAGE_POSITIONS } from "@/lib/communityHeroTypes";
import type { HomepageHeroLayout } from "@/lib/communityHeroTypes";
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

  const isVideoLayout = content.video.heroLayout === "video_fullscreen";

  function patchVideo(
    patch: Partial<CommunityHeroContent["video"]>,
  ) {
    setContent((c) => ({ ...c, video: { ...c.video, ...patch } }));
  }

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
      <SectionEditorField
        label="Hero layout"
        hint="Current keeps the editorial collage hero. Fullscreen video uses a cinematic above-the-fold band."
      >
        <select
          value={content.video.heroLayout}
          onChange={(e) =>
            patchVideo({ heroLayout: e.target.value as HomepageHeroLayout })
          }
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
        >
          <option value="current">Current (editorial collage)</option>
          <option value="video_fullscreen">Fullscreen video</option>
        </select>
      </SectionEditorField>

      {isVideoLayout ? (
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)]/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Video hero
          </p>
          <SectionEditorField label="Background video URL" hint="MP4 or WebM. Leave empty to use poster only.">
            <SectionTextInput
              value={content.video.videoUrl}
              onChange={(videoUrl) => patchVideo({ videoUrl })}
              placeholder="https://…/hero.mp4"
            />
          </SectionEditorField>
          <CmsImageField
            label="Poster / fallback image"
            value={content.video.posterImage}
            onChange={(posterImage) => patchVideo({ posterImage })}
            hint="Shown on mobile, when video is unavailable, or if no video URL is set."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionEditorField label="Overlay">
              <select
                value={content.video.overlayColor}
                onChange={(e) =>
                  patchVideo({
                    overlayColor: e.target.value as "dark" | "light",
                  })
                }
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </SectionEditorField>
            <SectionEditorField
              label={`Overlay opacity (${Math.round(content.video.overlayOpacity * 100)}%)`}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(content.video.overlayOpacity * 100)}
                onChange={(e) =>
                  patchVideo({ overlayOpacity: Number(e.target.value) / 100 })
                }
                className="w-full"
              />
            </SectionEditorField>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={content.video.showInventorySearchBar}
              onChange={(e) =>
                patchVideo({ showInventorySearchBar: e.target.checked })
              }
              className="rounded border-[var(--line)]"
            />
            <span className="text-sm text-[var(--ink)]">
              Show inventory search bar in hero
            </span>
          </label>
        </div>
      ) : null}

      <SectionEditorField label="Eyebrow">
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
        hint={
          isVideoLayout
            ? "Displayed as one line on the video hero."
            : "One line per row. The last line of three or more is styled muted automatically."
        }
      >
        <SectionTextInput
          multiline={!isVideoLayout}
          value={content.headlineLines.map((l) => l.text).join(isVideoLayout ? " " : "\n")}
          onChange={(text) => {
            const lines = isVideoLayout
              ? text.trim()
                  ? [{ text: text.trim(), muted: false }]
                  : []
              : text
                  .split(/\n+/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, index, arr) => ({
                    text: line,
                    muted: arr.length >= 3 && index === arr.length - 1,
                  }));
            setContent((c) => ({ ...c, headlineLines: lines }));
          }}
        />
      </SectionEditorField>

      <SectionEditorField label="Subcopy">
        <SectionTextInput
          multiline
          value={content.subheadline}
          onChange={(subheadline) => setContent((c) => ({ ...c, subheadline }))}
        />
      </SectionEditorField>

      {!isVideoLayout ? (
        <SectionEditorField label="Body">
          <SectionTextInput
            multiline
            value={content.body}
            onChange={(body) => setContent((c) => ({ ...c, body }))}
          />
        </SectionEditorField>
      ) : null}

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

      {!isVideoLayout ? (
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
      ) : null}

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
