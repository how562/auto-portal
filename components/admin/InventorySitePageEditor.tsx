"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SitePage } from "@/lib/cmsTypes";
import {
  describeInventoryPreset,
  type InventoryPagePreset,
} from "@/lib/inventorySitePages";
import type {
  InventoryBodyStyle,
  InventoryBudget,
  InventoryCondition,
  InventoryLifestyle,
} from "@/lib/inventorySearch";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";
import { getSitePageLiveHref } from "@/lib/sitePagesListUtils";

interface InventorySitePageEditorProps {
  page: SitePage;
}

const CONDITION_OPTIONS: { value: InventoryCondition; label: string }[] = [
  { value: "all", label: "Any condition" },
  { value: "new", label: "New" },
  { value: "used", label: "Pre-owned" },
  { value: "cpo", label: "CPO" },
];

const BUDGET_OPTIONS: { value: InventoryBudget; label: string }[] = [
  { value: "all", label: "Any price" },
  { value: "under-25k", label: "Under $25k" },
  { value: "under-30k", label: "Under $30k" },
  { value: "under-40k", label: "Under $40k" },
  { value: "30-50k", label: "$30k–$50k" },
  { value: "50k-plus", label: "$50k+" },
];

const BODY_OPTIONS: { value: InventoryBodyStyle; label: string }[] = [
  { value: "all", label: "Any body" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "sedan", label: "Sedan" },
  { value: "coupe", label: "Coupe" },
  { value: "van", label: "Van" },
];

const LIFESTYLE_OPTIONS: { value: InventoryLifestyle; label: string }[] = [
  { value: "all", label: "Any lifestyle" },
  { value: "family", label: "Family" },
  { value: "work", label: "Work" },
  { value: "luxury", label: "Luxury" },
  { value: "budget", label: "Budget" },
  { value: "first-vehicle", label: "First vehicle" },
  { value: "fuel-efficient", label: "Fuel efficient" },
  { value: "weekend-ready", label: "Weekend ready" },
  { value: "everyday-drive", label: "Everyday drive" },
];

function presetFromForm(state: {
  condition: InventoryCondition;
  budget: InventoryBudget;
  bodyStyle: InventoryBodyStyle;
  lifestyle: InventoryLifestyle;
}): InventoryPagePreset {
  const preset: InventoryPagePreset = {};
  if (state.condition !== "all") preset.condition = state.condition;
  if (state.budget !== "all") preset.budget = state.budget;
  if (state.bodyStyle !== "all") preset.bodyStyle = state.bodyStyle;
  if (state.lifestyle !== "all") preset.lifestyle = state.lifestyle;
  return preset;
}

export function InventorySitePageEditor({ page }: InventorySitePageEditorProps) {
  const router = useRouter();
  const initial = page.inventory_preset ?? {};

  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaDescription, setMetaDescription] = useState(page.meta_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    page.status === "published" ? "published" : "draft",
  );
  const [condition, setCondition] = useState<InventoryCondition>(
    initial.condition ?? "all",
  );
  const [budget, setBudget] = useState<InventoryBudget>(initial.budget ?? "all");
  const [bodyStyle, setBodyStyle] = useState<InventoryBodyStyle>(
    initial.bodyStyle ?? "all",
  );
  const [lifestyle, setLifestyle] = useState<InventoryLifestyle>(
    initial.lifestyle ?? "all",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const liveHref = getSitePageLiveHref({ slug: page.slug });
  const previewPreset = presetFromForm({ condition, budget, bodyStyle, lifestyle });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const inventory_preset = presetFromForm({
        condition,
        budget,
        bodyStyle,
        lifestyle,
      });

      const res = await fetch(`/api/admin/site-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          meta_description: metaDescription.trim() || null,
          status,
          inventory_preset,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSavedMessage("Saved.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Inventory listing page
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Shoppers see the full inventory experience at{" "}
          <code className="rounded bg-[var(--cream)] px-1">{liveHref}</code> with
          filters locked to your preset. Link it from{" "}
          <Link href="/admin/navigation" className="font-medium text-[var(--ink)] underline">
            Navigation
          </Link>{" "}
          after publishing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Page details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Slug</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value === "published" ? "published" : "draft")
                }
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">
                Meta description
              </span>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Locked inventory filters
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Choose at least one dimension. Shoppers can refine further (sort, make/model,
            search) but cannot change locked filters.
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--ink)]">
            Preview: {describeInventoryPreset(previewPreset)}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as InventoryCondition)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Budget</span>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value as InventoryBudget)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Body style</span>
              <select
                value={bodyStyle}
                onChange={(e) => setBodyStyle(e.target.value as InventoryBodyStyle)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                {BODY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Lifestyle</span>
              <select
                value={lifestyle}
                onChange={(e) => setLifestyle(e.target.value as InventoryLifestyle)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                {LIFESTYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {saving ? "Saving…" : "Save page"}
          </button>
          <Link href="/admin/pages" className={btnSecondaryMd}>
            Back to pages
          </Link>
          {status === "published" ? (
            <Link href={liveHref} className={btnSecondaryMd} target="_blank" rel="noreferrer">
              View live
            </Link>
          ) : null}
        </div>

        {savedMessage ? (
          <p className="text-sm text-emerald-700">{savedMessage}</p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
