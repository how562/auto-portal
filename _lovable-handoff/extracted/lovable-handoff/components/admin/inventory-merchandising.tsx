import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, AlertTriangle, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inventory-merchandising")({
  component: MerchPage,
});

// Internal admin tool. Labels here are NEVER shown to customers.
type View = "best" | "photos" | "attention" | "newest";

const PAGE_SIZE = 50;

function MerchPage() {
  const [view, setView] = useState<View>("best");
  const [storeId, setStoreId] = useState<string>("all");

  const { data: stores } = useQuery({
    queryKey: ["stores_list_merch"],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").order("name");
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader
        title="Inventory Merchandising"
        description="Internal admin tools. These labels are not shown to customers."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="All stores" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {(stores ?? []).map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList>
          <TabsTrigger value="best"><Sparkles className="mr-1 h-3.5 w-3.5" />Best Merchandised</TabsTrigger>
          <TabsTrigger value="photos"><Camera className="mr-1 h-3.5 w-3.5" />Most Photos</TabsTrigger>
          <TabsTrigger value="attention"><AlertTriangle className="mr-1 h-3.5 w-3.5" />Needs Attention</TabsTrigger>
          <TabsTrigger value="newest"><Clock className="mr-1 h-3.5 w-3.5" />Newest Added</TabsTrigger>
        </TabsList>

        <TabsContent value="best"><BestMerchandised storeId={storeId} /></TabsContent>
        <TabsContent value="photos"><MostPhotos storeId={storeId} /></TabsContent>
        <TabsContent value="attention"><NeedsAttention storeId={storeId} /></TabsContent>
        <TabsContent value="newest"><NewestAdded storeId={storeId} /></TabsContent>
      </Tabs>
    </div>
  );
}

const SELECT =
  "id, vin, stock_number, year, make, model, trim, internet_price, msrp, status, primary_image_url, created_at, stores(name), vehicle_images(count)";

function applyStore(q: any, storeId: string) {
  return storeId === "all" ? q : q.eq("store_id", storeId);
}

function photoCount(v: any): number {
  const vi = v?.vehicle_images;
  if (Array.isArray(vi)) return vi[0]?.count ?? 0;
  return vi?.count ?? 0;
}

function scoreBest(v: any): number {
  let s = 0;
  s += Math.min(photoCount(v), 40); // up to 40 pts for photos
  if (v.internet_price && Number(v.internet_price) > 0) s += 20;
  if (v.primary_image_url) s += 10;
  if (v.trim) s += 5;
  if (v.stock_number) s += 5;
  if (v.msrp && Number(v.msrp) > 0) s += 5;
  return s;
}

function issues(v: any): string[] {
  const list: string[] = [];
  if (!v.internet_price || Number(v.internet_price) <= 0) list.push("No price");
  if (photoCount(v) === 0) list.push("No photos");
  else if (photoCount(v) < 5) list.push("Few photos");
  if (!v.primary_image_url) list.push("No hero image");
  if (!v.stock_number) list.push("No stock #");
  if (!v.trim) list.push("Missing trim");
  return list;
}

function useVehicles(storeId: string, opts?: { activeOnly?: boolean }) {
  return useQuery({
    queryKey: ["merch_vehicles", storeId, opts?.activeOnly ?? true],
    queryFn: async () => {
      let q = supabase.from("vehicles").select(SELECT).limit(500);
      q = applyStore(q, storeId);
      if (opts?.activeOnly !== false) q = q.eq("status", "active");
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

function Row({ v, right }: { v: any; right?: React.ReactNode }) {
  return (
    <Link
      to="/vehicles/$id"
      params={{ id: v.id }}
      className="flex items-center gap-3 rounded-md border bg-card p-3 transition hover:bg-accent/40"
    >
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
        {v.primary_image_url ? (
          <img src={v.primary_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {v.year} {v.make} {v.model} {v.trim ?? ""}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {v.stores?.name ?? "—"} · VIN {v.vin} · Stock {v.stock_number ?? "—"}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs">{right}</div>
    </Link>
  );
}

function ListWrap({ items, empty }: { items: any[]; empty: string }) {
  if (!items.length) return <EmptyState title={empty} />;
  return <div className="flex flex-col gap-2">{items.slice(0, PAGE_SIZE)}</div>;
}

function BestMerchandised({ storeId }: { storeId: string }) {
  const { data, isLoading } = useVehicles(storeId);
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const ranked = (data ?? [])
    .map((v) => ({ v, score: scoreBest(v) }))
    .sort((a, b) => b.score - a.score);
  return (
    <ListWrap
      empty="No vehicles to rank."
      items={ranked.map(({ v, score }) => (
        <Row
          key={v.id}
          v={v}
          right={
            <>
              <Badge variant="secondary">Score {score}</Badge>
              <Badge variant="outline">{photoCount(v)} photos</Badge>
            </>
          }
        />
      ))}
    />
  );
}

function MostPhotos({ storeId }: { storeId: string }) {
  const { data, isLoading } = useVehicles(storeId);
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const ranked = (data ?? []).slice().sort((a, b) => photoCount(b) - photoCount(a));
  return (
    <ListWrap
      empty="No vehicles found."
      items={ranked.map((v) => (
        <Row key={v.id} v={v} right={<Badge variant="secondary">{photoCount(v)} photos</Badge>} />
      ))}
    />
  );
}

function NeedsAttention({ storeId }: { storeId: string }) {
  const { data, isLoading } = useVehicles(storeId);
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const flagged = (data ?? [])
    .map((v) => ({ v, issues: issues(v) }))
    .filter((x) => x.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length);
  return (
    <ListWrap
      empty="Nothing needs attention. Nice."
      items={flagged.map(({ v, issues }) => (
        <Row
          key={v.id}
          v={v}
          right={
            <>
              {issues.slice(0, 3).map((i) => (
                <Badge key={i} variant="destructive">{i}</Badge>
              ))}
              {issues.length > 3 && <Badge variant="outline">+{issues.length - 3}</Badge>}
            </>
          }
        />
      ))}
    />
  );
}

function NewestAdded({ storeId }: { storeId: string }) {
  const { data, isLoading } = useVehicles(storeId, { activeOnly: false });
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const sorted = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return (
    <ListWrap
      empty="No vehicles found."
      items={sorted.map((v) => (
        <Row
          key={v.id}
          v={v}
          right={
            <>
              <Badge variant="outline">{new Date(v.created_at).toLocaleDateString()}</Badge>
              {v.status !== "active" && <Badge variant="secondary">{v.status}</Badge>}
            </>
          }
        />
      ))}
    />
  );
}
