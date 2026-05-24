import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/imports/")({
  component: ImportsPage,
});

function ImportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_import_runs")
        .select("*, feed_sources(name, stores(name))")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Import Runs" description="Read-only history written by the external feed worker." />
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !data?.length ? <EmptyState title="No imports yet" hint="The external worker hasn't logged any runs." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Feed</th>
                <th className="px-4 py-2">Store</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">New</th>
                <th className="px-4 py-2 text-right">Updated</th>
                <th className="px-4 py-2 text-right">Removed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap">{format(new Date(r.created_at), "MMM d yyyy, HH:mm")}</td>
                  <td className="px-4 py-2">{r.feed_sources?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.feed_sources?.stores?.name ?? "—"}</td>
                  <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.total_records}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-success">{r.new_records}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.updated_records}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-destructive">{r.removed_records}</td>
                  <td className="px-4 py-2"><Link to="/imports/$id" params={{ id: r.id }} className="text-primary hover:underline">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "success" ? "bg-success/15 text-success border-success/30" :
    status === "failed" ? "bg-destructive/15 text-destructive border-destructive/30" :
    "bg-warning/15 text-warning-foreground border-warning/30";
  return <Badge variant="outline" className={cls}>{status}</Badge>;
}
