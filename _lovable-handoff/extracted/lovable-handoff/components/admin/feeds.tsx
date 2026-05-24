import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/feeds")({
  component: FeedsPage,
});

type Row = {
  id: string;
  created_at: string;
  status: string;
  total_records: number | null;
  updated_records: number | null;
  new_records: number | null;
  removed_records: number | null;
  error_log: string | null;
  feed_sources: {
    name: string | null;
    source_url: string | null;
    stores: { name: string | null } | null;
  } | null;
};

function FeedsPage() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["feeds-monitor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_import_runs")
        .select("id, created_at, status, total_records, new_records, updated_records, removed_records, error_log, feed_sources(name, source_url, stores(name))")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const filtered = (data ?? []).filter((r) => {
    if (!q) return true;
    const hay = [
      r.feed_sources?.stores?.name,
      r.feed_sources?.name,
      r.feed_sources?.source_url,
      r.status,
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  // Group: latest run per (store + feed)
  const seen = new Set<string>();
  const latest: Row[] = [];
  for (const r of filtered) {
    const key = `${r.feed_sources?.stores?.name ?? ""}|${r.feed_sources?.name ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    latest.push(r);
  }

  return (
    <div>
      <PageHeader title="HomeNet Feed Monitor" description="Latest import run per store / feed. Admin-only." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-80">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search store, feed, or status" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="text-xs text-muted-foreground">{latest.length} feed{latest.length === 1 ? "" : "s"}</div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : !latest.length ? (
        <EmptyState title="No feed runs yet" hint="The HomeNet importer hasn't logged any runs." />
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2">File / Feed</th>
                <th className="px-3 py-2">Last Import</th>
                <th className="px-3 py-2 text-right">Processed</th>
                <th className="px-3 py-2 text-right">Updated</th>
                <th className="px-3 py-2 text-right">Skipped</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Error</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {latest.map((r) => {
                const processed = r.total_records ?? 0;
                const updated = (r.updated_records ?? 0) + (r.new_records ?? 0);
                const skipped = Math.max(0, processed - updated - (r.removed_records ?? 0));
                const fileName = deriveFileName(r.feed_sources?.source_url) ?? r.feed_sources?.name ?? "—";
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 align-top">
                    <td className="px-3 py-2 font-medium">{r.feed_sources?.stores?.name ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs">{fileName}</div>
                      {r.feed_sources?.name && fileName !== r.feed_sources.name && (
                        <div className="text-xs text-muted-foreground">{r.feed_sources.name}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{format(new Date(r.created_at), "MMM d yyyy, HH:mm")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{processed.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-success">{updated.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{skipped.toLocaleString()}</td>
                    <td className="px-3 py-2"><FeedStatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 max-w-[280px]">
                      {r.error_log ? (
                        <div className="text-xs text-destructive truncate" title={r.error_log}>{firstLine(r.error_log)}</div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link to="/imports/$id" params={{ id: r.id }} className="text-primary text-xs hover:underline">Details</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function deriveFileName(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || u.hostname;
  } catch {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? url;
  }
}

function firstLine(s: string) {
  const line = s.trim().split("\n")[0];
  return line.length > 120 ? line.slice(0, 120) + "…" : line;
}

function FeedStatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const tone =
    s === "success" || s === "succeeded" ? "bg-success/15 text-success border-success/30"
    : s === "failed" || s === "error" ? "bg-destructive/15 text-destructive border-destructive/30"
    : s === "warning" || s === "partial" ? "bg-warning/15 text-warning-foreground border-warning/30"
    : "bg-muted text-muted-foreground";
  const label =
    s === "success" || s === "succeeded" ? "Success"
    : s === "failed" || s === "error" ? "Failed"
    : s === "warning" || s === "partial" ? "Warning"
    : status || "—";
  return <Badge variant="outline" className={tone}>{label}</Badge>;
}
