"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  slugifyCollectionName,
  type CollectionDetailRow,
  type CollectionRuleInput,
} from "@/lib/collectionsAdmin";
import type { AdminStoreOption } from "@/lib/storesAdmin";

const RULE_FIELDS = [
  "internet_price",
  "condition",
  "make",
  "model",
  "body_style",
  "year",
  "mileage",
];

const OPERATORS = [
  "equals",
  "not_equals",
  "contains",
  "less_than",
  "greater_than",
  "less_than_or_equal",
  "greater_than_or_equal",
];

interface CollectionDetailFormProps {
  collection: CollectionDetailRow;
  stores: AdminStoreOption[];
}

export function CollectionDetailForm({
  collection: initial,
  stores,
}: CollectionDetailFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description ?? "");
  const [storeId, setStoreId] = useState(initial.store_id ?? "");
  const [sortOrder, setSortOrder] = useState(initial.sort_order);
  const [isActive, setIsActive] = useState(initial.is_active);
  const [rules, setRules] = useState<CollectionRuleInput[]>(
    initial.rules.map((r) => ({
      field: r.field,
      operator: r.operator,
      value: r.value,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRule(index: number, patch: Partial<CollectionRuleInput>) {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  async function save() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/collections/${initial.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || slugifyCollectionName(name),
        description: description || null,
        store_id: storeId || null,
        sort_order: sortOrder,
        is_active: isActive,
        rules,
      }),
    });

    const data = (await res.json()) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/collections"
        className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
      >
        ← Back to collections
      </Link>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Details
          </h2>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Store
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            >
              <option value="">Any / unset</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Sort order
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active (public read when wired)
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Rules (AND)
            </h2>
            <button
              type="button"
              onClick={() =>
                setRules((prev) => [
                  ...prev,
                  { field: "internet_price", operator: "less_than", value: "" },
                ])
              }
              className="text-xs font-semibold text-[var(--ink)]"
            >
              + Add rule
            </button>
          </div>
          {rules.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No rules — all active vehicles for the store may match.
            </p>
          ) : (
            <ul className="space-y-3">
              {rules.map((rule, index) => (
                <li
                  key={index}
                  className="grid gap-2 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(index, { field: e.target.value })}
                    className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs"
                  >
                    {RULE_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(index, { operator: e.target.value })
                    }
                    className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <input
                    value={rule.value}
                    onChange={(e) => updateRule(index, { value: e.target.value })}
                    className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRules((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-xs text-[var(--muted)]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving || !name.trim()}
        className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save collection"}
      </button>
    </div>
  );
}
