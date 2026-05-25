"use client";

import { useEffect, useState } from "react";
import { CommunityHeroImageSlots } from "@/components/admin/CommunityHeroImageSlots";
import { CmsImageField } from "@/components/admin/CmsImageField";
import type { CMSSectionType, PageSection } from "@/lib/cmsTypes";
import { parseSettings, settingString } from "@/lib/cmsSettings";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

export interface CollectionOption {
  id: string;
  name: string;
}

interface PageSectionCardProps {
  section: PageSection;
  isFirst: boolean;
  isLast: boolean;
  collections: CollectionOption[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSaved: (section: PageSection) => void;
}

function sectionPatch(local: PageSection): Record<string, unknown> {
  return {
    eyebrow: local.eyebrow,
    headline: local.headline,
    subheadline: local.subheadline,
    body: local.body,
    headline_es: local.headline_es,
    subheadline_es: local.subheadline_es,
    body_es: local.body_es,
    cta_text_es: local.cta_text_es,
    image_url: local.image_url,
    image_url_es: local.image_url_es,
    cta_text: local.cta_text,
    cta_url: local.cta_url,
    cta_url_es: local.cta_url_es,
    layout_variant: local.layout_variant,
    is_active: local.is_active,
    settings: local.settings,
  };
}

export function PageSectionCard({
  section: initial,
  isFirst,
  isLast,
  collections,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSaved,
}: PageSectionCardProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  const t = local.section_type;
  const settings = local.settings ?? {};
  const isCommunityHero = t === "community_hero";
  const showImage =
    t !== "custom_html" && t !== "locations" && t !== "form";
  const showCTA =
    t !== "custom_html" &&
    t !== "locations" &&
    t !== "form" &&
    t !== "faq" &&
    t !== "stats";
  const showBody =
    t !== "custom_html" &&
    t !== "locations" &&
    t !== "form" &&
    t !== "inventory_collection";
  const showHeadline = t !== "custom_html";

  function setField<K extends keyof PageSection>(k: K, v: PageSection[K]) {
    setLocal((prev) => ({ ...prev, [k]: v }));
  }

  function setSetting(key: string, value: unknown) {
    setLocal((prev) => ({
      ...prev,
      settings: { ...(prev.settings ?? {}), [key]: value },
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/page-sections/${local.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sectionPatch(local)),
      });
      const data = (await res.json()) as { section?: PageSection; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      if (data.section) {
        setLocal(data.section);
        onSaved(data.section);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirty = JSON.stringify(local) !== JSON.stringify(initial);

  return (
    <article className="rounded-md border border-[var(--line-dark)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="text-[var(--muted)]">{open ? "▼" : "▶"}</span>
          <span className="rounded bg-[var(--cream-dark)] px-2 py-0.5 text-xs font-semibold uppercase">
            {t}
          </span>
          <span className="truncate text-sm font-medium">
            {local.headline || local.eyebrow || "Untitled section"}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className={`${btnSecondaryMd} px-2 py-1 text-xs disabled:opacity-40`}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className={`${btnSecondaryMd} px-2 py-1 text-xs disabled:opacity-40`}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={`${btnSecondaryMd} px-2 py-1 text-xs text-red-700`}
          >
            Delete
          </button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-[var(--line)] p-4 sm:p-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={local.is_active}
              onChange={(e) => setField("is_active", e.target.checked)}
            />
            Active on page
          </label>

          {isCommunityHero ? (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Eyebrow
                </span>
                <input
                  value={local.eyebrow ?? ""}
                  onChange={(e) => setField("eyebrow", e.target.value || null)}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                />
              </label>
              <LangTabs lang={lang} setLang={setLang} onCopyEs={() => copyEnToEs(local, setLocal)} />
              {lang === "en" ? (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Headline
                  </span>
                  <textarea
                    rows={3}
                    value={local.headline ?? ""}
                    onChange={(e) => setField("headline", e.target.value || null)}
                    className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                  />
                </label>
              ) : (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Headline (ES)
                  </span>
                  <textarea
                    rows={3}
                    value={local.headline_es ?? ""}
                    onChange={(e) => setField("headline_es", e.target.value || null)}
                    className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                  />
                </label>
              )}
              <CommunityHeroImageSlots
                sectionId={local.id}
                settings={settings}
                onSettingsSaved={(nextSettings, updatedSection) => {
                  if (updatedSection) {
                    setLocal(updatedSection);
                    onSaved(updatedSection);
                  } else {
                    setField("settings", nextSettings);
                  }
                }}
              />
            </>
          ) : (
            <>
              {showHeadline ? (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Eyebrow (shared)
                  </span>
                  <input
                    value={local.eyebrow ?? ""}
                    onChange={(e) => setField("eyebrow", e.target.value || null)}
                    className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                  />
                </label>
              ) : null}

              <LangTabs lang={lang} setLang={setLang} onCopyEs={() => copyEnToEs(local, setLocal)} />

              {lang === "en" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {showHeadline ? (
                    <>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                          Headline
                        </span>
                        <input
                          value={local.headline ?? ""}
                          onChange={(e) => setField("headline", e.target.value || null)}
                          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                          Subheadline
                        </span>
                        <input
                          value={local.subheadline ?? ""}
                          onChange={(e) =>
                            setField("subheadline", e.target.value || null)
                          }
                          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                        />
                      </label>
                    </>
                  ) : null}
                  {showBody ? (
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Body
                      </span>
                      <textarea
                        rows={4}
                        value={local.body ?? ""}
                        onChange={(e) => setField("body", e.target.value || null)}
                        className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                      />
                    </label>
                  ) : null}
                  {showCTA ? (
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        CTA text
                      </span>
                      <input
                        value={local.cta_text ?? ""}
                        onChange={(e) => setField("cta_text", e.target.value || null)}
                        className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                      />
                    </label>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {showHeadline ? (
                    <>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                          Headline (ES)
                        </span>
                        <input
                          value={local.headline_es ?? ""}
                          onChange={(e) =>
                            setField("headline_es", e.target.value || null)
                          }
                          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                          Subheadline (ES)
                        </span>
                        <input
                          value={local.subheadline_es ?? ""}
                          onChange={(e) =>
                            setField("subheadline_es", e.target.value || null)
                          }
                          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                        />
                      </label>
                    </>
                  ) : null}
                  {showBody ? (
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Body (ES)
                      </span>
                      <textarea
                        rows={4}
                        value={local.body_es ?? ""}
                        onChange={(e) => setField("body_es", e.target.value || null)}
                        className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                      />
                    </label>
                  ) : null}
                  {showCTA ? (
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        CTA text (ES)
                      </span>
                      <input
                        value={local.cta_text_es ?? ""}
                        onChange={(e) =>
                          setField("cta_text_es", e.target.value || null)
                        }
                        className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                      />
                    </label>
                  ) : null}
                </div>
              )}

              {showImage ? (
                <CmsImageField
                  label="Image URL"
                  value={local.image_url ?? ""}
                  onChange={(url) => setField("image_url", url || null)}
                />
              ) : null}

              {showCTA ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      CTA URL
                    </span>
                    <input
                      value={local.cta_url ?? ""}
                      onChange={(e) => setField("cta_url", e.target.value || null)}
                      className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                    />
                  </label>
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      CTA URL (ES, optional)
                    </span>
                    <input
                      value={local.cta_url_es ?? ""}
                      onChange={(e) => setField("cta_url_es", e.target.value || null)}
                      className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                    />
                  </label>
                </div>
              ) : null}

              <TypeSettingsFields
                sectionType={t}
                settings={settings}
                collections={collections}
                setSetting={setSetting}
              />
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => setLocal(initial)}
              className={`${btnSecondaryMd} disabled:opacity-40`}
            >
              Reset
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className={`${btnPrimaryMd} disabled:opacity-60`}
            >
              {saving ? "Saving…" : "Save section"}
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function LangTabs({
  lang,
  setLang,
  onCopyEs,
}: {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  onCopyEs: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-lg px-3 py-1 text-sm ${lang === "en" ? "bg-[var(--ink)] text-white" : "bg-[var(--cream-dark)]"}`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`rounded-lg px-3 py-1 text-sm ${lang === "es" ? "bg-[var(--ink)] text-white" : "bg-[var(--cream-dark)]"}`}
      >
        Spanish
      </button>
      <button type="button" onClick={onCopyEs} className={`${btnSecondaryMd} text-xs`}>
        Copy EN → ES
      </button>
    </div>
  );
}

function copyEnToEs(
  local: PageSection,
  setLocal: React.Dispatch<React.SetStateAction<PageSection>>,
) {
  setLocal((prev) => ({
    ...prev,
    headline_es: prev.headline_es || prev.headline,
    subheadline_es: prev.subheadline_es || prev.subheadline,
    body_es: prev.body_es || prev.body,
    cta_text_es: prev.cta_text_es || prev.cta_text,
  }));
}

function TypeSettingsFields({
  sectionType,
  settings,
  collections,
  setSetting,
}: {
  sectionType: CMSSectionType;
  settings: Record<string, unknown>;
  collections: CollectionOption[];
  setSetting: (key: string, value: unknown) => void;
}) {
  const s = parseSettings(settings);

  if (sectionType === "inventory_collection") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Collection
          </span>
          <select
            value={settingString(s, "collection_id")}
            onChange={(e) => setSetting("collection_id", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            <option value="">— Select —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Limit
          </span>
          <input
            type="number"
            min={1}
            max={24}
            value={String(s.limit ?? 8)}
            onChange={(e) => setSetting("limit", Number(e.target.value) || 8)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      </div>
    );
  }

  if (sectionType === "custom_html") {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          HTML (settings.html)
        </span>
        <textarea
          rows={8}
          value={settingString(s, "html")}
          onChange={(e) => setSetting("html", e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-xs"
        />
      </label>
    );
  }

  if (sectionType === "form") {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Form type
        </span>
        <input
          value={settingString(s, "form_type", "contact")}
          onChange={(e) => setSetting("form_type", e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          placeholder="contact"
        />
      </label>
    );
  }

  if (sectionType === "faq") {
    const items = Array.isArray(s.items) ? s.items : [];
    return (
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          FAQ items (JSON array: question, answer)
        </span>
        <textarea
          rows={6}
          value={JSON.stringify(items, null, 2)}
          onChange={(e) => {
            try {
              setSetting("items", JSON.parse(e.target.value));
            } catch {
              /* ignore invalid JSON while typing */
            }
          }}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-xs"
        />
      </label>
    );
  }

  return null;
}
