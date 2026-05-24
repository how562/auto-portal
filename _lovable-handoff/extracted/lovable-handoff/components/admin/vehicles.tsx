import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vehicles")({
  component: VehiclesPage,
});

function VehiclesPage() {
  const [q, setQ] = useState("");
  const [storeId, setStoreId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [condition, setCondition] = useState<string>("all");

  const { data: stores } = useQuery({
    queryKey: ["stores_list_active"],
    queryFn: async () => { const { data } = await supabase.from("stores").select("id, name").eq("is_active", true).order("name"); return data ?? []; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", { q, storeId, status, condition }],
    queryFn: async () => {
      let qb = supabase.from("vehicles")
        .select("id, vin, stock_number, year, make, model, trim, mileage, internet_price, status, condition, primary_image_url, stores!inner(name, is_active)")
        .eq("stores.is_active", true)
        .order("updated_at", { ascending: false })
        .limit(200);
      if (storeId !== "all") qb = qb.eq("store_id", storeId);
      if (status !== "all") qb = qb.eq("status", status);
      if (condition !== "all") qb = qb.eq("condition", condition);
      if (q) qb = qb.or(`vin.ilike.%${q}%,stock_number.ilike.%${q}%`);
      const { data, error } = await qb;
      if (error) throw error; return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Vehicles" description="Normalized inventory written by the external feed worker." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-72">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search VIN or stock #" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <FilterSelect value={storeId} onChange={setStoreId} placeholder="All stores"
          options={[{ value: "all", label: "All stores" }, ...(stores ?? []).map((s: any) => ({ value: s.id, label: s.name }))]} />
        <FilterSelect value={status} onChange={setStatus} placeholder="Status"
          options={[{value:"all",label:"All status"},{value:"active",label:"Active"},{value:"missing",label:"Missing"},{value:"sold",label:"Sold"}]} />
        <FilterSelect value={condition} onChange={setCondition} placeholder="Condition"
          options={[{value:"all",label:"All conditions"},{value:"new",label:"New"},{value:"used",label:"Used"},{value:"cpo",label:"CPO"}]} />
      </div>

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !data?.length ? <EmptyState title="No vehicles found" hint="Adjust filters, or wait for the worker to import inventory." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2">VIN</th>
                <th className="px-3 py-2">Stock #</th>
                <th className="px-3 py-2">Vehicle</th>
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2">Mileage</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Cond.</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v: any) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link to="/vehicles/$id" params={{ id: v.id }}>
                      {v.primary_image_url
                        ? <img src={v.primary_image_url} alt="" className="h-10 w-14 rounded object-cover" loading="lazy" />
                        : <div className="h-10 w-14 rounded bg-muted" />}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs"><Link to="/vehicles/$id" params={{ id: v.id }} className="hover:underline">{v.vin}</Link></td>
                  <td className="px-3 py-2 text-xs">{v.stock_number ?? "—"}</td>
                  <td className="px-3 py-2">{[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ")}</td>
                  <td className="px-3 py-2 text-muted-foreground">{v.stores?.name ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{v.mileage?.toLocaleString() ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{v.internet_price ? `$${Number(v.internet_price).toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2 uppercase text-xs">{v.condition ?? "—"}</td>
                  <td className="px-3 py-2"><StatusPill status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "active" ? "bg-success/15 text-success border-success/30"
    : status === "missing" ? "bg-warning/15 text-warning-foreground border-warning/30"
    : "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={cls}>{status}</Badge>;
}
