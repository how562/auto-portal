"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  blueprintJsonString,
  type PageBlueprint,
} from "@/lib/cmsPageBlueprint";
import { CMS_SECTION_REGISTRY } from "@/lib/cmsSectionRegistry";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface BlueprintPreviewPanelProps {
  blueprint: PageBlueprint;
  onBlueprintChange: (blueprint: PageBlueprint | null) => void;
  onBack: () => void;
  backLabel?: string;
  warnings?: string[];
}

export function BlueprintPreviewPanel({
  blueprint: initialBlueprint,
  onBlueprintChange,
  onBack,
  backLabel = "Back",
  warnings = [],
}: BlueprintPreviewPanelProps) {
  const router = useRouter();
  const [blueprint, setBlueprint] = useState(initialBlueprint);
  const [editJson, setEditJson] = useState(() => blueprintJsonString(initialBlueprint));
  const [errors, setErrors] = useState<string[]>([]);
  const [sql, setSql] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [generatingSql, setGeneratingSql] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setBlueprint(initialBlueprint);
    setEditJson(blueprintJsonString(initialBlueprint));
  }, [initialBlueprint]);

  function updateBlueprint(next: PageBlueprint) {
    setBlueprint(next);
    setEditJson(blueprintJsonString(next));
    onBlueprintChange(next);
  }

  async function applyJsonEdits() {
    setValidating(true);
    setErrors([]);
    setSql(null);
    try {
      const parsed = JSON.parse(editJson) as unknown;
      const res = await fetch("/api/admin/page-blueprints/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        blueprint?: PageBlueprint;
        errors?: string[];
        error?: string;
      };
      if (!res.ok || !data.ok || !data.blueprint) {
        setErrors(data.errors ?? [data.error ?? "Validation failed"]);
        return;
      }
      updateBlueprint(data.blueprint);
    } catch (err: unknown) {
      setErrors([
        err instanceof SyntaxError
          ? "Invalid JSON — check commas and quotes"
          : err instanceof Error
            ? err.message
            : "Validation failed",
      ]);
    } finally {
      setValidating(false);
    }
  }

  async function importBlueprint() {
    setImporting(true);
    setErrors([]);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/page-blueprints/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(blueprint),
      });
      const data = (await res.json()) as {
        page?: { id: string; slug?: string };
        slugAdjusted?: boolean;
        message?: string;
        errors?: string[];
        error?: string;
      };
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "Import failed"]);
        return;
      }
      if (data.slugAdjusted && data.message) {
        setNotice(data.message);
      }
      if (data.page?.id) {
        router.push(`/admin/pages/${data.page.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : "Import failed"]);
    } finally {
      setImporting(false);
    }
  }

  async function generateSql() {
    setGeneratingSql(true);
    setErrors([]);
    try {
      const res = await fetch("/api/admin/page-blueprints/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(blueprint),
      });
      const data = (await res.json()) as { sql?: string; errors?: string[]; error?: string };
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "SQL generation failed"]);
        return;
      }
      setSql(data.sql ?? null);
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : "SQL generation failed"]);
    } finally {
      setGeneratingSql(false);
    }
  }

  async function exportJson() {
    try {
      await navigator.clipboard.writeText(blueprintJsonString(blueprint));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setErrors(["Could not copy JSON to clipboard"]);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{blueprint.title}</h2>
          <p className="text-sm text-[var(--muted)]">
            /{blueprint.slug} · {blueprint.sections.length} sections · saves as draft only
          </p>
        </div>
        <button type="button" className={btnSecondaryMd} onClick={onBack}>
          {backLabel}
        </button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </p>
      ) : null}

      {warnings.length ? (
        <ul className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warnings.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}

      <ol className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
        {blueprint.sections.map((section, index) => (
          <li
            key={`${section.section_type}-${section.sort_order}-${index}`}
            className="px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">
                {CMS_SECTION_REGISTRY[section.section_type].label}
              </span>
              <span className="text-xs text-[var(--muted)]">
                order {section.sort_order}
                {section.is_active ? "" : " · inactive"}
              </span>
            </div>
            {section.headline ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{section.headline}</p>
            ) : null}
            {section.subheadline ? (
              <p className="mt-0.5 text-xs text-[var(--muted)]">{section.subheadline}</p>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Edit blueprint JSON
        </p>
        <textarea
          rows={12}
          value={editJson}
          onChange={(e) => setEditJson(e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-3 font-mono text-xs"
          spellCheck={false}
        />
        <button
          type="button"
          disabled={validating}
          onClick={applyJsonEdits}
          className={`${btnSecondaryMd} disabled:opacity-60`}
        >
          {validating ? "Validating…" : "Apply JSON changes"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={importing}
          onClick={importBlueprint}
          className={`${btnPrimaryMd} disabled:opacity-60`}
        >
          {importing ? "Creating…" : "Create draft page"}
        </button>
        <button type="button" onClick={exportJson} className={btnSecondaryMd}>
          {jsonCopied ? "JSON copied" : "Export JSON"}
        </button>
        <button
          type="button"
          disabled={generatingSql}
          onClick={generateSql}
          className={`${btnSecondaryMd} disabled:opacity-60`}
        >
          {generatingSql ? "Generating…" : "Generate SQL"}
        </button>
      </div>

      {sql ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Supabase SQL (backup/migration)
            </p>
            <button
              type="button"
              className={btnSecondaryMd}
              onClick={() => navigator.clipboard.writeText(sql)}
            >
              Copy SQL
            </button>
          </div>
          <pre className="max-h-80 overflow-auto rounded-xl border border-[var(--line)] bg-[var(--cream)] p-4 text-xs">
            {sql}
          </pre>
        </div>
      ) : null}

      {errors.length ? (
        <ul className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
