"use client";

import { useCallback, useEffect, useState } from "react";
import { CommitmentHomepageSectionEditor } from "@/components/admin/section-editors/CommitmentHomepageSectionEditor";
import { HeroHomepageSectionEditor } from "@/components/admin/section-editors/HeroHomepageSectionEditor";
import { NotEditableHomepageSectionPanel } from "@/components/admin/section-editors/NotEditableHomepageSectionPanel";
import { SocialFeedHomepageSectionEditor } from "@/components/admin/section-editors/SocialFeedHomepageSectionEditor";
import {
  commitmentFormFromSection,
  type HomepageSectionAdminPayload,
} from "@/lib/homepageSectionContentAdmin";
import { getHomepageSectionEditorMeta } from "@/lib/homepageSectionEditorMeta";
import {
  getHomepageLayoutSectionDef,
  type HomepageLayoutSectionId,
} from "@/lib/homepageLayoutRegistry";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CommitmentSectionFormState } from "@/lib/homepageSectionContentAdmin";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";

interface HomepageSectionEditDrawerProps {
  layoutSectionId: HomepageLayoutSectionId | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function HomepageSectionEditDrawer({
  layoutSectionId,
  onClose,
  onSaved,
}: HomepageSectionEditDrawerProps) {
  const [payload, setPayload] = useState<HomepageSectionAdminPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const def = layoutSectionId ? getHomepageLayoutSectionDef(layoutSectionId) : null;
  const meta = layoutSectionId ? getHomepageSectionEditorMeta(layoutSectionId) : null;

  const load = useCallback(async () => {
    if (!layoutSectionId) return;
    setLoading(true);
    setLoadError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `/api/admin/homepage-sections/${encodeURIComponent(layoutSectionId)}`,
        { credentials: "include" },
      );
      const data = (await res.json()) as HomepageSectionAdminPayload & {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load section");
      setPayload(data);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [layoutSectionId]);

  useEffect(() => {
    if (layoutSectionId) void load();
    else setPayload(null);
  }, [layoutSectionId, load]);

  async function save(
    body:
      | { kind: "hero"; content: CommunityHeroContent }
      | { kind: "commitment"; form: CommitmentSectionFormState }
      | { kind: "social_feed"; content: SocialFeedCmsContent },
  ) {
    if (!layoutSectionId) return;
    const res = await fetch(
      `/api/admin/homepage-sections/${encodeURIComponent(layoutSectionId)}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = (await res.json()) as HomepageSectionAdminPayload & {
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Save failed");
    setPayload(data);
    setSuccess("Saved — refresh the public homepage to confirm.");
    onSaved?.();
  }

  if (!layoutSectionId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-[var(--line)] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="homepage-section-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Edit section content
            </p>
            <h2
              id="homepage-section-editor-title"
              className="mt-1 text-lg font-semibold text-[var(--ink)]"
            >
              {def?.label ?? layoutSectionId}
            </h2>
            {meta ? (
              <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                {meta.layoutSectionId} · {meta.dataSource} · Editable:{" "}
                {meta.editable ? "yes" : "no"}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label="Close editor"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading section…</p>
          ) : null}
          {loadError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {loadError}
            </p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </p>
          ) : null}

          {!loading && payload && meta && !meta.editable ? (
            <NotEditableHomepageSectionPanel
              reason={meta.notEditableReason ?? "Not editable"}
              dataSource={meta.dataSource}
              onClose={onClose}
            />
          ) : null}

          {!loading && payload?.hero && payload.sectionId ? (
            <HeroHomepageSectionEditor
              key={payload.sectionId}
              initial={payload.hero}
              sectionId={payload.sectionId}
              onCancel={onClose}
              onSave={async (content) => {
                await save({ kind: "hero", content });
              }}
            />
          ) : null}

          {!loading && payload?.section && meta?.editorKind === "commitment" ? (
            <CommitmentHomepageSectionEditor
              key={payload.sectionId}
              initial={commitmentFormFromSection(payload.section)}
              onCancel={onClose}
              onSave={async (form) => {
                await save({ kind: "commitment", form });
              }}
            />
          ) : null}

          {!loading && payload?.socialFeed ? (
            <SocialFeedHomepageSectionEditor
              key={payload.sectionId}
              initial={payload.socialFeed}
              onCancel={onClose}
              onSave={async (content) => {
                await save({ kind: "social_feed", content });
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
