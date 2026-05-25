"use client";

import { useCallback, useState } from "react";
import type {
  FeedImportRunItemRow,
  FeedImportRunRow,
} from "@/lib/feedImportRunsAdmin";

interface FeedImportRunsPanelProps {
  initialRuns: FeedImportRunRow[];
  initialLatest: FeedImportRunRow | null;
  initialItems: FeedImportRunItemRow[];
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "failed":
      return "border-red-200 bg-red-50 text-red-800";
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "running":
      return "border-blue-200 bg-blue-50 text-blue-900";
    default:
      return "border-[var(--line-dark)] bg-[var(--cream)] text-[var(--muted)]";
  }
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function FeedImportRunsPanel({
  initialRuns,
  initialLatest,
  initialItems,
}: FeedImportRunsPanelProps) {
  const [runs, setRuns] = useState(initialRuns);
  const [latest, setLatest] = useState(initialLatest);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    initialLatest?.id ?? initialRuns[0]?.id ?? null,
  );
  const [items, setItems] = useState(initialItems);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRunDetail = useCallback(async (runId: string) => {
    setLoadingDetail(true);
    setError(null);
    setSelectedRunId(runId);

    const res = await fetch(
      `/api/admin/feed-import-runs?runId=${encodeURIComponent(runId)}`,
      { credentials: "include" },
    );
    const data = (await res.json()) as {
      run?: FeedImportRunRow;
      items?: FeedImportRunItemRow[];
      error?: string;
    };
    setLoadingDetail(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to load run detail");
      return;
    }

    setItems(data.items ?? []);
  }, []);

  async function refreshRuns() {
    setError(null);
    const res = await fetch("/api/admin/feed-import-runs?limit=25", {
      credentials: "include",
    });
    const data = (await res.json()) as {
      runs?: FeedImportRunRow[];
      latest?: FeedImportRunRow | null;
      error?: string;
    };

    if (!res.ok) {
      setError(data.error ?? "Refresh failed");
      return;
    }

    setRuns(data.runs ?? []);
    setLatest(data.latest ?? null);
    const nextId = data.latest?.id ?? data.runs?.[0]?.id ?? null;
    if (nextId) {
      void loadRunDetail(nextId);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Latest import</h2>
          {latest ? (
            <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(latest.status)}`}
                >
                  {latest.status}
                </span>
                <span className="text-sm text-[var(--muted)]">
                  {formatWhen(latest.started_at)}
                  {latest.completed_at
                    ? ` → ${formatWhen(latest.completed_at)}`
                    : ""}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-[var(--muted)]">Files</dt>
                  <dd className="font-semibold tabular-nums">
                    {latest.files_processed} processed · {latest.files_succeeded}{" "}
                    ok · {latest.files_failed} failed · {latest.files_skipped}{" "}
                    skipped
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Upserted</dt>
                  <dd className="font-semibold tabular-nums">
                    {latest.total_upserted.toLocaleString()}
                  </dd>
                </div>
              </dl>
              {latest.error_message ? (
                <p className="mt-3 text-sm text-red-800">{latest.error_message}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              No import runs logged yet. Trigger{" "}
              <code className="rounded bg-[var(--cream)] px-1 text-xs">
                /api/import-homenet
              </code>{" "}
              to record the first run.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refreshRuns()}
          className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm font-semibold hover:bg-[var(--cream-dark)]"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Recent runs
          </h2>
          {runs.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No runs yet.</p>
          ) : (
            <ul className="space-y-1">
              {runs.map((run) => (
                <li key={run.id}>
                  <button
                    type="button"
                    onClick={() => void loadRunDetail(run.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedRunId === run.id
                        ? "border-[var(--ink)] bg-[var(--cream-dark)]"
                        : "border-[var(--line)] bg-white hover:bg-[var(--cream)]"
                    }`}
                  >
                    <span
                      className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClass(run.status)}`}
                    >
                      {run.status}
                    </span>
                    <span className="text-[var(--muted)]">
                      {formatWhen(run.started_at)}
                    </span>
                    <span className="mt-1 block tabular-nums text-xs text-[var(--muted)]">
                      {run.files_processed} files · {run.total_upserted} upserted
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Per-file summary
          </h2>
          {loadingDetail ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              Select a run to view file-level results.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                    <th className="px-4 py-3 font-semibold">File</th>
                    <th className="px-4 py-3 font-semibold">Store</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Rows</th>
                    <th className="px-4 py-3 font-semibold">Upserted</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.file_name}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {item.store_name ?? item.store_id ?? "—"}
                        {item.store_mapping_source ? (
                          <span className="mt-0.5 block text-[10px] text-[var(--muted)]">
                            via {item.store_mapping_source}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {item.rows_processed}
                        {item.skipped > 0 ? (
                          <span className="text-[var(--muted)]">
                            {" "}
                            ({item.skipped} skipped)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{item.upserted}</td>
                      <td className="max-w-[200px] px-4 py-3 text-xs text-[var(--muted)]">
                        {item.skip_reason ??
                          item.error_message ??
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
