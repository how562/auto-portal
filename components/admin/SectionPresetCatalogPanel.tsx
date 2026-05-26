"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  PRESET_CLEANUP_SUMMARY,
  PRESET_LIBRARY_CATEGORIES,
  SECTION_PRESET_CATALOG,
  type PresetLibraryCategory,
  type PresetLibraryVisibility,
  type SectionPresetCatalogEntry,
} from "@/lib/sectionPresetCatalog";

const VISIBILITY_LABEL: Record<PresetLibraryVisibility, string> = {
  promoted: "Promoted",
  standard: "Standard",
  hidden: "Hidden (showcase)",
  merge_into: "Merge into…",
};

const ACTION_CLASS: Record<string, string> = {
  keep: "text-emerald-800 bg-emerald-50",
  merge: "text-amber-900 bg-amber-50",
  hide: "text-[var(--muted)] bg-[var(--cream-dark)]",
  rename: "text-blue-900 bg-blue-50",
};

function ReadinessDots({ entry }: { entry: SectionPresetCatalogEntry }) {
  const r = entry.readiness;
  const items = [
    ["Preview", r.showcase_preview],
    ["Starter", r.page_builder_starter],
    ["Schema", r.admin_field_schema],
    ["Images", r.image_size_guidance],
    ["Responsive", r.responsive_layout],
    ["Mobile gap", !r.mobile_admin_preview],
  ] as const;

  return (
    <div className="grid min-w-[13.5rem] grid-cols-3 gap-1.5">
      {items.map(([label, ok]) => (
        <span
          key={label}
          title={`${label}: ${ok ? "yes" : "no / gap"}`}
          className={`inline-flex justify-center whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] ${
            ok ? "bg-emerald-100 text-emerald-900" : "bg-[var(--line)] text-[var(--muted)]"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function SectionPresetCatalogPanel() {
  const [category, setCategory] = useState<PresetLibraryCategory | "all">("all");
  const [visibility, setVisibility] = useState<PresetLibraryVisibility | "all">("all");

  const filtered = useMemo(() => {
    return SECTION_PRESET_CATALOG.filter((p) => {
      if (category !== "all" && p.library_category !== category) return false;
      if (visibility !== "all" && p.library_visibility !== visibility) return false;
      return true;
    });
  }, [category, visibility]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Preset catalog</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {PRESET_CLEANUP_SUMMARY.showcase_total} presets organized into{" "}
          {PRESET_LIBRARY_CATEGORIES.length} library categories.{" "}
          <strong className="text-[var(--ink)]">{PRESET_CLEANUP_SUMMARY.picker_visible}</strong>{" "}
          recommended for the add-section picker;{" "}
          <strong className="text-[var(--ink)]">{PRESET_CLEANUP_SUMMARY.hide}</strong> hidden;
          <strong className="text-[var(--ink)]"> {PRESET_CLEANUP_SUMMARY.merge}</strong> to merge
          into another preset.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Readiness tags: Preview = /section-showcase · Starter = page builder type starter ·
          Schema = dedicated admin editor · Mobile gap = no mobile preview in admin yet.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/section-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Visual preview ↗
          </Link>
          <Link
            href="/admin/section-library"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:underline"
          >
            Legacy type library (11 types)
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PresetLibraryCategory | "all")}
          className="ui-input text-sm"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {PRESET_LIBRARY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as PresetLibraryVisibility | "all")}
          className="ui-input text-sm"
          aria-label="Filter by visibility"
        >
          <option value="all">All visibility</option>
          {(Object.keys(VISIBILITY_LABEL) as PresetLibraryVisibility[]).map((v) => (
            <option key={v} value={v}>
              {VISIBILITY_LABEL[v]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white pb-1">
        <table className="w-max min-w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: "10.5rem" }} />
            <col style={{ width: "12rem" }} />
            <col style={{ width: "8.5rem" }} />
            <col style={{ width: "13rem" }} />
            <col style={{ width: "7.5rem" }} />
            <col style={{ width: "7rem" }} />
            <col style={{ width: "15rem" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--cream)]/80 text-xs uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 font-semibold">Preset key</th>
              <th className="px-4 py-3 font-semibold">Display name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Best use</th>
              <th className="px-4 py-3 font-semibold">Visibility</th>
              <th className="px-4 py-3 font-semibold">Audit</th>
              <th className="min-w-[15rem] px-4 py-3 font-semibold">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const catLabel =
                PRESET_LIBRARY_CATEGORIES.find((c) => c.id === p.library_category)?.label ??
                p.library_category;
              return (
                <tr key={p.preset_key} className="border-b border-[var(--line)]/80 align-top">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {p.preset_key}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--ink)]">{p.display_name}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{catLabel}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
                    {p.best_use_case}
                  </td>
                  <td className="px-4 py-3 text-xs">{VISIBILITY_LABEL[p.library_visibility]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${ACTION_CLASS[p.audit_action] ?? ""}`}
                    >
                      {p.audit_action}
                    </span>
                    {p.merge_into_preset_key ? (
                      <span className="mt-1 block font-mono text-[10px] text-[var(--muted)]">
                        → {p.merge_into_preset_key}
                      </span>
                    ) : null}
                  </td>
                  <td className="min-w-[15rem] px-4 py-3">
                    <ReadinessDots entry={p} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
          Full field & settings reference ({filtered.length} shown)
        </summary>
        <ul className="mt-4 space-y-4">
          {filtered.map((p) => (
            <li
              key={p.preset_key}
              className="border-t border-[var(--line)] pt-4 text-xs first:border-0 first:pt-0"
            >
              <p className="font-mono font-semibold text-[var(--ink)]">{p.preset_key}</p>
              <p className="mt-1 text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">Fields:</span>{" "}
                {p.supported_fields.join(" · ")}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">Settings:</span>{" "}
                {p.editable_settings.join(" · ")}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">Images:</span>{" "}
                {p.recommended_image_size ?? "None"}
              </p>
              {p.audit_note ? (
                <p className="mt-1 text-amber-900">{p.audit_note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
