"use client";

import { useEffect, useState } from "react";
import { CmsSectionEditorGuidance } from "@/components/admin/CmsSectionEditorGuidance";
import { CmsSectionEditorPreview } from "@/components/admin/CmsSectionEditorPreview";
import { SectionDesignControls } from "@/components/admin/SectionDesignControls";
import { CardGridItemsEditor } from "@/components/admin/section-editors/CardGridItemsEditor";
import { CtaButtonsEditor } from "@/components/admin/section-editors/CtaButtonsEditor";
import { FaqItemsEditor } from "@/components/admin/section-editors/FaqItemsEditor";
import { StatsItemsEditor } from "@/components/admin/section-editors/StatsItemsEditor";
import { CommunityHeroImageSlots } from "@/components/admin/CommunityHeroImageSlots";
import { CmsImageField } from "@/components/admin/CmsImageField";
import type { CMSSection } from "@/lib/cmsSectionModel";
import type { CMSCanonicalFieldKey } from "@/lib/cmsSectionModel";
import { getRegistryEntry } from "@/lib/cmsSectionRegistry";
import { parseSettings, settingString } from "@/lib/cmsSettings";
import { getPresetKeyFromSettings } from "@/lib/presetSectionStarters";
import { getPresetByKey } from "@/lib/savedSectionPresets";
import type { Store } from "@/lib/types";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

export interface CollectionOption {
  id: string;
  name: string;
}

interface CmsSectionEditorCardProps {
  section: CMSSection;
  isFirst: boolean;
  isLast: boolean;
  collections: CollectionOption[];
  stores?: Store[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSaved: (section: CMSSection) => void;
}

function canonicalPatch(local: CMSSection): Record<string, unknown> {
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

function fieldEnabled(
  fields: CMSCanonicalFieldKey[],
  key: CMSCanonicalFieldKey,
): boolean {
  return fields.includes(key);
}

export function CmsSectionEditorCard({
  section: initial,
  isFirst,
  isLast,
  collections,
  stores = [],
  onMoveUp,
  onMoveDown,
  onDelete,
  onSaved,
}: CmsSectionEditorCardProps) {
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"preview" | "edit">("preview");
  const [local, setLocal] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  const entry = getRegistryEntry(local.section_type);
  const settings = local.settings ?? {};
  const presetKey = getPresetKeyFromSettings(settings);
  const presetEntry = presetKey ? getPresetByKey(presetKey) : undefined;
  const isCommunityHero = local.section_type === "community_hero";

  function setField<K extends keyof CMSSection>(k: K, v: CMSSection[K]) {
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
        body: JSON.stringify(canonicalPatch(local)),
      });
      const data = (await res.json()) as { section?: CMSSection; error?: string };
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
  const enFields = entry.editorFields.filter((f) => !f.endsWith("_es"));
  const esFields = entry.editorFields.filter((f) => f.endsWith("_es"));

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
            {presetEntry?.display_name ?? entry.label}
          </span>
          {presetEntry ? (
            <span className="font-mono text-[10px] text-[var(--muted)]">{presetKey}</span>
          ) : null}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg border border-[var(--line)] p-0.5">
              <button
                type="button"
                onClick={() => setPanelMode("preview")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  panelMode === "preview"
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setPanelMode("edit")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  panelMode === "edit"
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                Edit
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={local.is_active}
                onChange={(e) => setField("is_active", e.target.checked)}
              />
              Active
            </label>
          </div>

          {panelMode === "preview" ? (
            <CmsSectionEditorPreview section={local} stores={stores} />
          ) : (
            <div className="space-y-4">
              <CmsSectionEditorGuidance sectionType={local.section_type} />

              <SectionDesignControls
                section={local}
                setSetting={setSetting}
                setLayoutVariant={(v) => setField("layout_variant", v)}
              />

              {isCommunityHero ? (
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
              ) : null}

              <div className="flex flex-wrap gap-2">
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
              </div>

              {lang === "en" ? (
                <CanonicalFieldsForm
                  section={local}
                  fields={enFields}
                  setField={setField}
                  sectionType={local.section_type}
                />
              ) : (
                <CanonicalFieldsForm
                  section={local}
                  fields={esFields}
                  setField={setField}
                  es
                  sectionType={local.section_type}
                />
              )}

              <TypeSettingsFields
                section={local}
                collections={collections}
                setSetting={setSetting}
              />

              <AdvancedSettingsPanel section={local} setSetting={setSetting} />
            </div>
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

function CanonicalFieldsForm({
  section,
  fields,
  setField,
  es = false,
  sectionType,
}: {
  section: CMSSection;
  fields: CMSCanonicalFieldKey[];
  setField: <K extends keyof CMSSection>(k: K, v: CMSSection[K]) => void;
  es?: boolean;
  sectionType: CMSSection["section_type"];
}) {
  const label = (name: string) => (es ? `${name} (ES)` : name);
  const fieldLabel = (field: "headline" | "subheadline" | "body") => {
    if (sectionType === "half_half") {
      if (field === "headline") return label("Title line 1");
      if (field === "subheadline") return label("Title line 2 (brush accent)");
      if (field === "body") return label("Intro paragraphs");
    }
    if (field === "headline") return label("Headline");
    if (field === "subheadline") return label("Subheadline");
    return label("Body");
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fieldEnabled(fields, "eyebrow") && !es ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Eyebrow
          </span>
          <input
            value={section.eyebrow ?? ""}
            onChange={(e) => setField("eyebrow", e.target.value || null)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
      {fieldEnabled(fields, es ? "headline_es" : "headline") ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {fieldLabel("headline")}
          </span>
          <input
            value={(es ? section.headline_es : section.headline) ?? ""}
            onChange={(e) =>
              setField(
                es ? "headline_es" : "headline",
                e.target.value || null,
              )
            }
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
      {fieldEnabled(fields, es ? "subheadline_es" : "subheadline") ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {fieldLabel("subheadline")}
          </span>
          <input
            value={(es ? section.subheadline_es : section.subheadline) ?? ""}
            onChange={(e) =>
              setField(
                es ? "subheadline_es" : "subheadline",
                e.target.value || null,
              )
            }
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
      {fieldEnabled(fields, es ? "body_es" : "body") ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {fieldLabel("body")}
          </span>
          <textarea
            rows={5}
            value={(es ? section.body_es : section.body) ?? ""}
            onChange={(e) =>
              setField(es ? "body_es" : "body", e.target.value || null)
            }
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
      {fieldEnabled(fields, es ? "image_url_es" : "image_url") && !es ? (
        <div className="sm:col-span-2">
          <CmsImageField
            label="Image URL"
            value={section.image_url ?? ""}
            onChange={(url) => setField("image_url", url || null)}
          />
        </div>
      ) : null}
      {fieldEnabled(fields, es ? "cta_text_es" : "cta_text") ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label("CTA text")}
          </span>
          <input
            value={(es ? section.cta_text_es : section.cta_text) ?? ""}
            onChange={(e) =>
              setField(es ? "cta_text_es" : "cta_text", e.target.value || null)
            }
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
      {fieldEnabled(fields, es ? "cta_url_es" : "cta_url") && !es ? (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            CTA URL
          </span>
          <input
            value={section.cta_url ?? ""}
            onChange={(e) => setField("cta_url", e.target.value || null)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      ) : null}
    </div>
  );
}

function TypeSettingsFields({
  section,
  collections,
  setSetting,
}: {
  section: CMSSection;
  collections: CollectionOption[];
  setSetting: (key: string, value: unknown) => void;
}) {
  const s = parseSettings(section.settings);
  const t = section.section_type;

  if (t === "inventory_collection") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Collection (settings)
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
      </div>
    );
  }

  if (t === "custom_html") {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          HTML (settings.html)
        </span>
        <textarea
          rows={6}
          value={settingString(s, "html")}
          onChange={(e) => setSetting("html", e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-xs"
        />
      </label>
    );
  }

  if (t === "faq") {
    const items = Array.isArray(s.items) ? (s.items as { question?: string; answer?: string }[]) : [];
    return (
      <FaqItemsEditor
        items={items}
        onChange={(next) => setSetting("items", next)}
      />
    );
  }

  if (t === "stats") {
    const items = Array.isArray(s.items) ? (s.items as { value?: string; label?: string }[]) : [];
    return (
      <StatsItemsEditor
        items={items}
        onChange={(next) => setSetting("items", next)}
      />
    );
  }

  if (t === "card_grid") {
    const cards = Array.isArray(s.cards)
      ? (s.cards as {
          title?: string;
          body?: string;
          image_url?: string;
          link_label?: string;
          link_href?: string;
        }[])
      : [];
    return (
      <CardGridItemsEditor cards={cards} onChange={(next) => setSetting("cards", next)} />
    );
  }

  if (t === "cta_band") {
    const buttons = Array.isArray(s.buttons)
      ? (s.buttons as { label?: string; url?: string }[])
      : [];
    return (
      <CtaButtonsEditor
        buttons={buttons}
        onChange={(next) => setSetting("buttons", next)}
      />
    );
  }

  if (t === "image_text") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Image position
          </span>
          <select
            value={settingString(s, "image_position", "right")}
            onChange={(e) => setSetting("image_position", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            <option value="right">Image right</option>
            <option value="left">Image left</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Media type
          </span>
          <select
            value={settingString(s, "media_type", "image")}
            onChange={(e) => setSetting("media_type", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video placeholder</option>
          </select>
        </label>
      </div>
    );
  }

  if (t === "text_block") {
    return (
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Alignment
        </span>
        <select
          value={settingString(s, "alignment", "left")}
          onChange={(e) => setSetting("alignment", e.target.value)}
          className="w-full max-w-xs rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
        </select>
      </label>
    );
  }

  if (t === "hero") {
    return (
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Variant
        </span>
        <select
          value={settingString(s, "variant", "light")}
          onChange={(e) => setSetting("variant", e.target.value)}
          className="w-full max-w-xs rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
        >
          <option value="light">Light card</option>
          <option value="dark">Dark band</option>
        </select>
      </label>
    );
  }

  if (t === "half_half") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Signature (handwritten)
          </span>
          <input
            value={settingString(s, "signature_text")}
            onChange={(e) => setSetting("signature_text", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Signature (ES)
          </span>
          <input
            value={settingString(s, "signature_text_es")}
            onChange={(e) => setSetting("signature_text_es", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Image alt text
          </span>
          <input
            value={settingString(s, "image_alt")}
            onChange={(e) => setSetting("image_alt", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Image position
          </span>
          <select
            value={settingString(s, "image_position", "right")}
            onChange={(e) => setSetting("image_position", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            <option value="right">Right (copy left)</option>
            <option value="left">Left (copy right)</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Layout variant
          </span>
          <select
            value={settingString(s, "variant", "compact")}
            onChange={(e) => setSetting("variant", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            <option value="compact">Compact (full-bleed photo)</option>
            <option value="default">Default (padded photo)</option>
          </select>
        </label>
      </div>
    );
  }

  if (t === "split_feature") {
    return (
      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Left title
          </span>
          <input
            value={settingString(s, "left_title")}
            onChange={(e) => setSetting("left_title", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Right title
          </span>
          <input
            value={settingString(s, "right_title")}
            onChange={(e) => setSetting("right_title", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Left body
          </span>
          <textarea
            rows={3}
            value={settingString(s, "left_body")}
            onChange={(e) => setSetting("left_body", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Right body
          </span>
          <textarea
            rows={3}
            value={settingString(s, "right_body")}
            onChange={(e) => setSetting("right_body", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </label>
      </div>
    );
  }

  return null;
}

function AdvancedSettingsPanel({
  section,
  setSetting,
}: {
  section: CMSSection;
  setSetting: (key: string, value: unknown) => void;
}) {
  const s = section.settings ?? {};
  const t = section.section_type;
  const jsonKeys: string[] = [];
  if (t === "faq") jsonKeys.push("items");
  if (t === "stats") jsonKeys.push("items");
  if (t === "card_grid") jsonKeys.push("cards");
  if (t === "cta_band") jsonKeys.push("buttons");
  if (t === "custom_html") jsonKeys.push("html");

  if (jsonKeys.length === 0) return null;

  return (
    <details className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/30">
      <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Advanced (raw JSON)
      </summary>
      <div className="space-y-3 border-t border-[var(--line)] p-4">
        {jsonKeys.map((key) => (
          <label key={key} className="block space-y-1">
            <span className="font-mono text-[10px] text-[var(--muted)]">
              settings.{key}
            </span>
            <textarea
              rows={6}
              value={JSON.stringify(s[key] ?? (key === "html" ? "" : []), null, 2)}
              onChange={(e) => {
                try {
                  setSetting(
                    key,
                    key === "html" ? e.target.value : JSON.parse(e.target.value),
                  );
                } catch {
                  /* ignore while typing */
                }
              }}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-xs"
            />
          </label>
        ))}
      </div>
    </details>
  );
}
