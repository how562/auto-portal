"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  INVENTORY_PROVIDER_LABELS,
  type InventoryProvider,
} from "@/lib/inventoryProviders";
import type { StoreInventorySourcesBundle } from "@/lib/inventoryFeedSourcesAdmin";

const SWITCH_WARNING =
  "Switching inventory sources will update displayed inventory counts, vehicle data, and widgets using live inventory. This does not delete inactive feed data. You can switch back to HomeNet for rollback until every dealership is validated.";

function formatWhen(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function InventoryFeedSourcesScreen() {
  const [bundles, setBundles] = useState<StoreInventorySourcesBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    storeId: string;
    feedSourceId: string;
    provider: InventoryProvider;
    storeName: string;
    currentProvider: InventoryProvider;
    dramaticMismatch: boolean;
    requiresCutoverAck: boolean;
    homenetCount: number;
    vautoCount: number;
    zeroVautoWarning: boolean;
  } | null>(null);
  const [acknowledgeMismatch, setAcknowledgeMismatch] = useState(false);
  const [acknowledgeCutover, setAcknowledgeCutover] = useState(false);
  const [activating, setActivating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory-feed-sources", {
        credentials: "include",
      });
      const json = (await res.json()) as {
        bundles?: StoreInventorySourcesBundle[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load");
      }
      setBundles(json.bundles ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmActivate() {
    if (!pending) return;
    setActivating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory-feed-sources", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: pending.storeId,
          feedSourceId: pending.feedSourceId,
          acknowledgeMismatch:
            acknowledgeMismatch || !pending.dramaticMismatch,
          acknowledgeCutover:
            acknowledgeCutover || !pending.requiresCutoverAck,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to switch source");
      }
      setPending(null);
      setAcknowledgeMismatch(false);
      setAcknowledgeCutover(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to switch source");
    } finally {
      setActivating(false);
    }
  }

  const storesWithZeroVauto = bundles.filter(
    (b) => b.comparison.zeroVautoWarning,
  );
  const storesWithMismatch = bundles.filter(
    (b) => b.comparison.dramaticMismatch,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Inventory feed sources
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Cut over dealership-by-dealership to vAuto after a successful import.
          HomeNet remains available for rollback. Exactly one active source
          powers public inventory, widgets, and counts — providers are never
          merged. See{" "}
          <Link
            href="/admin/feeds"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Feed import history
          </Link>
          {" · "}
          <Link
            href="/admin/feed-mapping"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            File mapping
          </Link>
          .
        </p>
      </div>

      {storesWithZeroVauto.length > 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span className="font-medium">
            {storesWithZeroVauto.length} dealership
            {storesWithZeroVauto.length === 1 ? "" : "s"}
          </span>{" "}
          still show zero vAuto vehicles. Do not switch those stores to vAuto
          until a successful import populates counts.
        </p>
      ) : null}

      {storesWithMismatch.length > 0 ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <span className="font-medium">
            {storesWithMismatch.length} dealership
            {storesWithMismatch.length === 1 ? "" : "s"}
          </span>{" "}
          have a material HomeNet vs vAuto count mismatch. Review before cutover.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading feed sources…</p>
      ) : bundles.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-white px-4 py-6 text-sm text-[var(--muted)]">
          No stores found. Add stores in Supabase, then refresh this page.
        </p>
      ) : (
        <div className="space-y-6">
          {bundles.map((bundle) => (
            <section
              key={bundle.storeId}
              className={`rounded-xl border bg-white shadow-sm ${
                bundle.isInventoryPool
                  ? "border-amber-300 ring-1 ring-amber-200"
                  : "border-[var(--line)]"
              }`}
            >
              <div className="border-b border-[var(--line)] px-5 py-4">
                <h2 className="text-lg font-semibold text-[var(--ink)]">
                  {bundle.storeName}
                </h2>
                {bundle.isInventoryPool ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800">
                    Internal inventory owner — not a public dealership
                  </p>
                ) : null}
                {bundle.audienceCounts && bundle.audienceCounts.length > 0 ? (
                  <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
                    {bundle.audienceCounts.map((row) => (
                      <li key={row.key}>
                        Audience {row.label}: {row.count} active
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Live inventory uses{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {INVENTORY_PROVIDER_LABELS[bundle.activeProvider]}
                  </span>
                </p>
                {bundle.comparison.zeroVautoWarning &&
                bundle.activeProvider !== "vauto" ? (
                  <p className="mt-2 text-xs font-medium text-amber-800">
                    vAuto count is 0 — import required before cutover.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 border-b border-[var(--line)] bg-[var(--cream)]/50 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                <ComparisonStat
                  label="HomeNet vehicles"
                  value={bundle.comparison.homenetCount}
                />
                <ComparisonStat
                  label="vAuto vehicles"
                  value={bundle.comparison.vautoCount}
                />
                <ComparisonStat
                  label="Difference"
                  value={bundle.comparison.difference}
                />
                <div className="text-sm">
                  <p className="text-[var(--muted)]">Cutover health</p>
                  {bundle.comparison.dramaticMismatch ? (
                    <p className="mt-0.5 font-medium text-red-800">
                      Large gap — confirm before switching
                    </p>
                  ) : bundle.comparison.zeroVautoWarning ? (
                    <p className="mt-0.5 font-medium text-amber-800">
                      No vAuto stock yet
                    </p>
                  ) : bundle.comparison.mismatchWarning ? (
                    <p className="mt-0.5 font-medium text-amber-800">
                      Counts differ — review before switching
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[var(--ink)]">Ready to compare</p>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                      <th className="px-5 py-3 font-medium">Provider</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Last import</th>
                      <th className="px-5 py-3 font-medium">Last success</th>
                      <th className="px-5 py-3 font-medium">Last file</th>
                      <th className="px-5 py-3 font-medium">Errors</th>
                      <th className="px-5 py-3 font-medium tabular-nums">
                        Vehicles
                      </th>
                      <th className="px-5 py-3 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.sources.map((source) => {
                      const isActive =
                        bundle.activeFeedSourceId === source.id;
                      return (
                        <tr
                          key={source.id}
                          className="border-b border-[var(--line)] last:border-0"
                        >
                          <td className="px-5 py-3 font-medium text-[var(--ink)]">
                            {INVENTORY_PROVIDER_LABELS[source.provider]}
                            {source.provider === "homenet" ? (
                              <span className="mt-0.5 block text-[10px] font-normal text-[var(--muted)]">
                                Rollback available
                              </span>
                            ) : null}
                          </td>
                          <td className="px-5 py-3 capitalize text-[var(--muted)]">
                            {source.status}
                          </td>
                          <td className="px-5 py-3 text-[var(--muted)]">
                            {formatWhen(source.last_import_at)}
                            {source.last_intake_at &&
                            source.provider === "vauto" ? (
                              <span className="mt-0.5 block text-[10px]">
                                Intake {formatWhen(source.last_intake_at)}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-5 py-3 text-[var(--muted)]">
                            {formatWhen(source.health.lastSuccessfulImportAt)}
                            {source.health.lastRunKind ? (
                              <span className="mt-0.5 block text-[10px] capitalize">
                                {source.health.lastRunKind}
                                {source.health.lastRunStatus
                                  ? ` · ${source.health.lastRunStatus}`
                                  : ""}
                              </span>
                            ) : null}
                          </td>
                          <td className="max-w-[10rem] truncate px-5 py-3 font-mono text-xs text-[var(--muted)]">
                            {source.health.lastFileName ?? "—"}
                          </td>
                          <td className="max-w-[12rem] px-5 py-3 text-xs text-[var(--muted)]">
                            {source.last_error_message ? (
                              <span
                                className="line-clamp-2 text-red-800"
                                title={source.last_error_message}
                              >
                                {source.last_error_message}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-5 py-3 tabular-nums">
                            {source.last_vehicle_count.toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            {isActive ? (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={
                                  source.provider === "vauto" &&
                                  source.last_vehicle_count === 0 &&
                                  bundle.comparison.vautoCount === 0
                                }
                                title={
                                  source.provider === "vauto" &&
                                  bundle.comparison.vautoCount === 0
                                    ? "Run a successful vAuto import before activating"
                                    : undefined
                                }
                                onClick={() => {
                                  setAcknowledgeMismatch(false);
                                  setAcknowledgeCutover(false);
                                  setPending({
                                    storeId: bundle.storeId,
                                    feedSourceId: source.id,
                                    provider: source.provider,
                                    storeName: bundle.storeName,
                                    currentProvider: bundle.activeProvider,
                                    dramaticMismatch:
                                      bundle.comparison.dramaticMismatch,
                                    requiresCutoverAck:
                                      source.provider === "vauto" &&
                                      bundle.activeProvider !== "vauto",
                                    homenetCount: bundle.comparison.homenetCount,
                                    vautoCount: bundle.comparison.vautoCount,
                                    zeroVautoWarning:
                                      bundle.comparison.zeroVautoWarning,
                                  });
                                }}
                              >
                                {source.provider === "homenet"
                                  ? "Switch back"
                                  : "Set active"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {pending ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-source-title"
        >
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3
              id="switch-source-title"
              className="text-lg font-semibold text-[var(--ink)]"
            >
              Switch active inventory source?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              <span className="font-medium text-[var(--ink)]">
                {pending.storeName}
              </span>{" "}
              will use{" "}
              <span className="font-medium text-[var(--ink)]">
                {INVENTORY_PROVIDER_LABELS[pending.provider]}
              </span>{" "}
              for all public inventory
              {pending.currentProvider !== pending.provider
                ? ` (currently ${INVENTORY_PROVIDER_LABELS[pending.currentProvider]})`
                : ""}
              .
            </p>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {SWITCH_WARNING}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              HomeNet: {pending.homenetCount.toLocaleString()} vehicles · vAuto:{" "}
              {pending.vautoCount.toLocaleString()} vehicles (stored separately, not
              merged).
            </p>
            {pending.zeroVautoWarning && pending.provider === "vauto" ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
                vAuto vehicle count is zero for this dealership. Import must
                succeed before cutover.
              </p>
            ) : null}
            {pending.requiresCutoverAck ? (
              <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                <input
                  type="checkbox"
                  checked={acknowledgeCutover}
                  onChange={(e) => setAcknowledgeCutover(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I confirm the HomeNet → vAuto cutover for this dealership after
                  reviewing import health and counts.
                </span>
              </label>
            ) : null}
            {pending.dramaticMismatch ? (
              <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
                <input
                  type="checkbox"
                  checked={acknowledgeMismatch}
                  onChange={(e) => setAcknowledgeMismatch(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I have compared HomeNet and vAuto counts and accept switching live
                  inventory to {INVENTORY_PROVIDER_LABELS[pending.provider]}.
                </span>
              </label>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                disabled={activating}
                onClick={() => {
                  setPending(null);
                  setAcknowledgeMismatch(false);
                  setAcknowledgeCutover(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={
                  activating ||
                  (pending.requiresCutoverAck && !acknowledgeCutover) ||
                  (pending.dramaticMismatch && !acknowledgeMismatch)
                }
                onClick={() => void confirmActivate()}
              >
                {activating ? "Switching…" : "Switch source"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComparisonStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--ink)]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
