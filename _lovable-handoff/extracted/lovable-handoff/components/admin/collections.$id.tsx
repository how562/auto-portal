import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchCollectionPreview, NUMERIC_FIELDS } from "@/lib/collection-preview";

export const Route = createFileRoute("/_authenticated/collections/$id")({
  component: CollectionDetailPage,
});

type Rule = { id?: string; field: string; operator: string; value: string };

const ENUM_VALUES: Record<string, string[]> = {
  condition: ["new", "used", "cpo"],
  status: ["active", "missing", "sold"],
};
const FIELDS: { value: string; label: string }[] = [
  { value: "internet_price", label: "Price" },
  { value: "msrp", label: "MSRP" },
  { value: "sale_price", label: "Sale price" },
  { value: "condition", label: "Condition" },
  { value: "status", label: "Status" },
  { value: "make", label: "Make" },
  { value: "model", label: "Model" },
  { value: "trim", label: "Trim" },
  { value: "year", label: "Year" },
  { value: "mileage", label: "Mileage" },
  { value: "body_style", label: "Body style" },
  { value: "exterior_color", label: "Exterior color" },
  { value: "days_in_stock", label: "Days in stock" },
];
const TEXT_OPS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
];
const NUM_OPS = [
  { value: "equals", label: "=" },
  { value: "not_equals", label: "≠" },
  { value: "less_than", label: "<" },
  { value: "less_than_or_equal", label: "≤" },
  { value: "greater_than", label: ">" },
  { value: "greater_than_or_equal", label: "≥" },
];

function CollectionDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ["dealer_groups_list"],
    queryFn: async () => { const { data } = await supabase.from("dealer_groups").select("id, name").order("name"); return data ?? []; },
  });
  const { data: stores } = useQuery({
    queryKey: ["stores_list"],
    queryFn: async () => { const { data } = await supabase.from("stores").select("id, name").order("name"); return data ?? []; },
  });

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: initialRules } = useQuery({
    queryKey: ["collection_rules", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("collection_rules").select("*").eq("collection_id", id).order("created_at");
      if (error) throw error;
      return data as Rule[];
    },
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dealerGroupId, setDealerGroupId] = useState("none");
  const [storeId, setStoreId] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    if (collection) {
      setName(collection.name ?? "");
      setSlug(collection.slug ?? "");
      setDescription(collection.description ?? "");
      setDealerGroupId(collection.dealer_group_id ?? "none");
      setStoreId(collection.store_id ?? "none");
      setIsActive(collection.is_active ?? true);
    }
  }, [collection]);

  useEffect(() => { if (initialRules) setRules(initialRules.map((r) => ({ ...r }))); }, [initialRules]);

  // Debounced rules for preview
  const [previewRules, setPreviewRules] = useState<Rule[]>([]);
  const [previewStore, setPreviewStore] = useState("none");
  useEffect(() => {
    const t = setTimeout(() => { setPreviewRules(rules); setPreviewStore(storeId); }, 300);
    return () => clearTimeout(t);
  }, [rules, storeId]);

  const previewKey = useMemo(() => JSON.stringify({ previewRules, previewStore }), [previewRules, previewStore]);

  const { data: preview, isFetching: previewLoading } = useQuery({
    queryKey: ["collection_preview", id, previewKey],
    queryFn: () =>
      fetchCollectionPreview({
        rules: previewRules.filter((r) => r.field && r.operator && r.value !== ""),
        storeId: previewStore !== "none" ? previewStore : null,
        limit: 20,
      }),
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error: uErr } = await supabase.from("collections").update({
        name, slug, description: description || null,
        dealer_group_id: dealerGroupId === "none" ? null : dealerGroupId,
        store_id: storeId === "none" ? null : storeId,
        is_active: isActive,
      }).eq("id", id);
      if (uErr) throw uErr;
      const { error: dErr } = await supabase.from("collection_rules").delete().eq("collection_id", id);
      if (dErr) throw dErr;
      const clean = rules.filter((r) => r.field && r.operator && r.value !== "");
      if (clean.length) {
        const { error: iErr } = await supabase.from("collection_rules")
          .insert(clean.map((r) => ({ collection_id: id, field: r.field, operator: r.operator, value: r.value })));
        if (iErr) throw iErr;
      }
    },
    onSuccess: () => {
      toast.success("Collection saved");
      qc.invalidateQueries({ queryKey: ["collection", id] });
      qc.invalidateQueries({ queryKey: ["collection_rules", id] });
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function updateRule(i: number, patch: Partial<Rule>) {
    setRules((rs) => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRule() { setRules((rs) => [...rs, { field: "internet_price", operator: "less_than", value: "" }]); }
  function removeRule(i: number) { setRules((rs) => rs.filter((_, idx) => idx !== i)); }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link to="/collections"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Collections</Link>
        </Button>
        <PageHeader
          title={name || "Collection"}
          description="Define rules to dynamically group vehicles. All rules are combined with AND."
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
              </div>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !name}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Details">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Dealer group</Label>
                <Select value={dealerGroupId} onValueChange={setDealerGroupId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All groups</SelectItem>
                    {(groups ?? []).map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Store</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All stores</SelectItem>
                    {(stores ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Rules"
          action={<Button size="sm" variant="outline" onClick={addRule}><Plus className="mr-1 h-3 w-3" /> Add rule</Button>}
        >
          {rules.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No rules yet. Without rules, this collection matches all active vehicles in scope.
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((r, i) => {
                const isNum = NUMERIC_FIELDS.has(r.field);
                const ops = isNum ? NUM_OPS : TEXT_OPS;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Select value={r.field} onValueChange={(v) => updateRule(i, { field: v, operator: NUMERIC_FIELDS.has(v) ? "less_than" : "equals" })}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={r.operator} onValueChange={(v) => updateRule(i, { operator: v })}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{ops.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {ENUM_VALUES[r.field] ? (
                      <Select value={r.value} onValueChange={(v) => updateRule(i, { value: v })}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="value" /></SelectTrigger>
                        <SelectContent>
                          {ENUM_VALUES[r.field].map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input className="flex-1" type={isNum ? "number" : "text"} value={r.value} onChange={(e) => updateRule(i, { value: e.target.value })} placeholder="value" />
                    )}
                    <Button variant="ghost" size="icon" onClick={() => removeRule(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Live preview"
        action={<Badge variant="outline">{previewLoading ? "…" : `${preview?.count ?? 0} matching`}</Badge>}
      >
        {!preview?.rows.length ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No vehicles match these rules.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 w-16">Image</th>
                  <th className="px-2 py-2">Stock #</th>
                  <th className="px-2 py-2">VIN</th>
                  <th className="px-2 py-2">Year</th>
                  <th className="px-2 py-2">Make</th>
                  <th className="px-2 py-2">Model</th>
                  <th className="px-2 py-2">Trim</th>
                  <th className="px-2 py-2">Price</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((v: any) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-2 py-2">
                      {v.primary_image_url ? (
                        <img src={v.primary_image_url} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" />
                      ) : (
                        <div className="h-10 w-16 rounded bg-muted" />
                      )}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{v.stock_number ?? "—"}</td>
                    <td className="px-2 py-2 font-mono text-xs">{v.vin}</td>
                    <td className="px-2 py-2 tabular-nums">{v.year ?? "—"}</td>
                    <td className="px-2 py-2">{v.make ?? "—"}</td>
                    <td className="px-2 py-2">{v.model ?? "—"}</td>
                    <td className="px-2 py-2 text-muted-foreground">{v.trim ?? "—"}</td>
                    <td className="px-2 py-2 tabular-nums">{v.internet_price ? `$${Number(v.internet_price).toLocaleString()}` : "—"}</td>
                    <td className="px-2 py-2"><Badge variant={v.status === "active" ? "default" : "outline"} className="uppercase text-xs">{v.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(preview?.count ?? 0) > preview.rows.length && (
              <div className="px-2 py-2 text-xs text-muted-foreground">Showing first {preview.rows.length} of {preview.count}.</div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
