import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Copy, Check, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StatusBadge } from "./imports.index";

type ItemAction = "created" | "updated" | "missing" | "failed";
const ACTIONS: ItemAction[] = ["created", "updated", "missing", "failed"];
const PAGE_SIZE = 50;

export const Route = createFileRoute("/_authenticated/imports/$id")({
  component: ImportDetail,
});

function ImportDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["import", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_import_runs")
        .select("*, feed_sources(id, name, stores(name, dealer_groups(name)))")
        .eq("id", id).maybeSingle();
      if (error) { console.error("[imports.$id] load failed", error); throw error; }
      return data;
    },
  });


  const feedId = data?.feed_source_id;
  const createdAt = data?.created_at;

  const { data: prevRun } = useQuery({
    queryKey: ["import-prev", feedId, createdAt],
    enabled: !!feedId && !!createdAt,
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_import_runs")
        .select("id")
        .eq("feed_source_id", feedId)
        .lt("created_at", createdAt)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      return data;
    },
  });

  const { data: nextRun } = useQuery({
    queryKey: ["import-next", feedId, createdAt],
    enabled: !!feedId && !!createdAt,
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_import_runs")
        .select("id")
        .eq("feed_source_id", feedId)
        .gt("created_at", createdAt)
        .order("created_at", { ascending: true })
        .limit(1).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading import run…</div>;
  if (error) return (
    <div className="p-4">
      <Button variant="ghost" size="sm" asChild className="mb-3">
        <Link to="/imports"><ArrowLeft className="mr-1 h-4 w-4" /> Back to imports</Link>
      </Button>
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load import run: {(error as Error).message}
      </div>
    </div>
  );
  if (!data) return (
    <div className="p-4">
      <Button variant="ghost" size="sm" asChild className="mb-3">
        <Link to="/imports"><ArrowLeft className="mr-1 h-4 w-4" /> Back to imports</Link>
      </Button>
      <div className="rounded-md border bg-card p-6 text-center">
        <div className="font-medium">Import run not found</div>
        <div className="mt-1 text-sm text-muted-foreground">No run exists with id <code className="font-mono">{id}</code>.</div>
      </div>
    </div>
  );

  const feed = data.feed_sources;
  const storeName = feed?.stores?.name;
  const dealerGroupName = feed?.stores?.dealer_groups?.name;

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-3">
        <Link to="/imports"><ArrowLeft className="mr-1 h-4 w-4" /> Back to imports</Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <PageHeader title="Import Run" description={format(new Date(data.created_at), "PPpp")} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">ID:</span>
              <code className="text-xs font-mono">{data.id}</code>
              <CopyButton value={data.id} label="Run ID" />
            </div>
            <div><span className="text-muted-foreground">Feed: </span><span className="font-medium">{feed?.name ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Store: </span><span className="font-medium">{storeName ?? "—"}</span></div>
            {dealerGroupName && (
              <div><span className="text-muted-foreground">Group: </span><span className="font-medium">{dealerGroupName}</span></div>
            )}
            <StatusBadge status={data.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!prevRun}
            onClick={() => prevRun && navigate({ to: "/imports/$id", params: { id: prevRun.id } })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={!nextRun}
            onClick={() => nextRun && navigate({ to: "/imports/$id", params: { id: nextRun.id } })}>
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-4">
        <StatCard label="Total" value={data.total_records} />
        <StatCard label="New" value={data.new_records} tone="success" />
        <StatCard label="Updated" value={data.updated_records} />
        <StatCard label="Removed" value={data.removed_records} tone="destructive" />
        <StatCard label="Status" value={data.status} isText />
      </div>

      <ErrorLogCard errorLog={data.error_log} status={data.status} />

      <div className="mt-6">
        <AffectedVehicles runId={data.id} />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, isText }: { label: string; value: any; tone?: "success" | "destructive"; isText?: boolean }) {
  const toneCls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`mt-1 font-semibold tabular-nums ${isText ? "text-lg capitalize" : "text-2xl"} ${toneCls}`}>{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

function ErrorLogCard({ errorLog, status }: { errorLog: string | null; status: string }) {
  const [expanded, setExpanded] = useState(false);

  const { display, isJson } = useMemo(() => {
    if (!errorLog) return { display: "", isJson: false };
    const trimmed = errorLog.trim();
    if ((trimmed.startsWith("{") || trimmed.startsWith("["))) {
      try {
        return { display: JSON.stringify(JSON.parse(trimmed), null, 2), isJson: true };
      } catch { /* fall through */ }
    }
    return { display: errorLog, isJson: false };
  }, [errorLog]);

  if (!errorLog) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Errors</CardTitle></CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Import completed successfully with no errors reported.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No errors reported.</div>
          )}
        </CardContent>
      </Card>
    );
  }

  const lineCount = display.split("\n").length;
  const isLong = lineCount > 20 || display.length > 2000;
  const shown = !isLong || expanded ? display : display.split("\n").slice(0, 20).join("\n");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Error Log {isJson && <span className="ml-2 text-xs font-normal text-muted-foreground">(JSON)</span>}
        </CardTitle>
        <CopyButton value={display} label="Error log" />
      </CardHeader>
      <CardContent>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap font-mono">{shown}</pre>
        {isLong && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><ChevronUp className="mr-1 h-4 w-4" /> Collapse</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show all {lineCount} lines</>}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function AffectedVehicles({ runId }: { runId: string }) {
  const [tab, setTab] = useState<ItemAction>("created");

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["import-run-item-counts", runId],
    queryFn: async () => {
      const result: Record<ItemAction, number> = { created: 0, updated: 0, missing: 0, failed: 0 };
      await Promise.all(
        ACTIONS.map(async (action) => {
          const { count } = await supabase
            .from("feed_import_run_items")
            .select("id", { count: "exact", head: true })
            .eq("import_run_id", runId)
            .eq("action", action);
          result[action] = count ?? 0;
        }),
      );
      return result;
    },
  });

  const total = counts ? counts.created + counts.updated + counts.missing + counts.failed : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Affected Vehicles</CardTitle>
        {counts && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="default">Created: {counts.created}</Badge>
            <Badge variant="secondary">Updated: {counts.updated}</Badge>
            {counts.missing > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Missing: {counts.missing}
              </Badge>
            ) : (
              <Badge variant="outline">Missing: 0</Badge>
            )}
            <Badge variant={counts.failed > 0 ? "destructive" : "outline"}>Failed: {counts.failed}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {countsLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : total === 0 ? (
          <div className="text-sm text-muted-foreground">
            No per-vehicle details recorded for this run yet.
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as ItemAction)}>
            <TabsList>
              {ACTIONS.map((a) => (
                <TabsTrigger key={a} value={a} className="capitalize">
                  {a} ({counts?.[a] ?? 0})
                </TabsTrigger>
              ))}
            </TabsList>
            {ACTIONS.map((a) => (
              <TabsContent key={a} value={a} className="mt-4">
                <ItemsTable runId={runId} action={a} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function ItemsTable({ runId, action }: { runId: string; action: ItemAction }) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = useQuery({
    queryKey: ["import-run-items", runId, action, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_import_run_items")
        .select("id, vehicle_id, vin, stock_number, action, message, created_at")
        .eq("import_run_id", runId)
        .eq("action", action)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No {action} vehicles in this run.</div>;
  }

  return (
    <>
      {action === "missing" && (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These vehicles were in inventory but no longer appear in the feed.
          </AlertDescription>
        </Alert>
      )}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock #</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">Vehicle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className={action === "missing" ? "bg-destructive/5" : undefined}>
                <TableCell>{item.stock_number ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{item.vin ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={actionVariant(item.action as ItemAction)} className="capitalize">
                    {item.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[320px] truncate" title={item.message ?? ""}>
                  {item.message ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "PP p")}
                </TableCell>
                <TableCell className="text-right">
                  {item.vehicle_id ? (
                    <Button variant="ghost" size="sm" asChild className="h-7">
                      <Link to="/vehicles/$id" params={{ id: item.vehicle_id }}>
                        Open <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length === limit && (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Load more
        </Button>
      )}
    </>
  );
}

function actionVariant(action: ItemAction): "default" | "secondary" | "destructive" | "outline" {
  switch (action) {
    case "created": return "default";
    case "updated": return "secondary";
    case "missing": return "destructive";
    case "failed": return "destructive";
  }
}
