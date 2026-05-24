import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Rss, Car, CheckCircle2, AlertTriangle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, tone = "default" }: { label: string; value: number | string; icon: any; tone?: string }) {
  const toneCls =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning-foreground" :
    tone === "destructive" ? "text-destructive" : "text-primary";
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${toneCls}`} />
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [stores, feeds, vehiclesAll, active, missing, sold, runs] = await Promise.all([
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("feed_sources").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "missing"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("feed_import_runs").select("*, feed_sources(name)").order("created_at", { ascending: false }).limit(10),
      ]);
      return {
        stores: stores.count ?? 0,
        feeds: feeds.count ?? 0,
        vehicles: vehiclesAll.count ?? 0,
        active: active.count ?? 0,
        missing: missing.count ?? 0,
        sold: sold.count ?? 0,
        runs: runs.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live snapshot of feed and inventory health.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total Stores" value={isLoading ? "…" : data!.stores} icon={Store} />
        <Stat label="Active Feed Sources" value={isLoading ? "…" : data!.feeds} icon={Rss} />
        <Stat label="Total Vehicles" value={isLoading ? "…" : data!.vehicles} icon={Car} />
        <Stat label="Active" value={isLoading ? "…" : data!.active} icon={CheckCircle2} tone="success" />
        <Stat label="Missing" value={isLoading ? "…" : data!.missing} icon={AlertTriangle} tone="warning" />
        <Stat label="Sold" value={isLoading ? "…" : data!.sold} icon={Tag} tone="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Import Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : data!.runs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No import runs yet. The external worker hasn't written anything here.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Feed</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">New</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2 pr-4">Removed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data!.runs.map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{format(new Date(r.created_at), "MMM d, HH:mm")}</td>
                      <td className="py-2 pr-4">{r.feed_sources?.name ?? "—"}</td>
                      <td className="py-2 pr-4"><StatusBadge status={r.status} /></td>
                      <td className="py-2 pr-4 tabular-nums">{r.total_records}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.new_records}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.updated_records}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.removed_records}</td>
                      <td className="py-2"><Link to="/imports/$id" params={{ id: r.id }} className="text-primary hover:underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-success/15 text-success border-success/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
  };
  return <Badge variant="outline" className={map[status] ?? ""}>{status}</Badge>;
}
