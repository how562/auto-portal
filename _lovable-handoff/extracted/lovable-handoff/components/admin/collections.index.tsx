import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Trash2, Sparkles, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/collections/")({
  component: CollectionsPage,
});

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  dealer_group_id: string | null;
  store_id: string | null;
  created_at: string;
  rule_count?: number;
  dealer_groups?: { name: string } | null;
  stores?: { name: string } | null;
};

type SeedRule = { field: string; operator: string; value: string };
const SEEDS: { name: string; slug: string; description: string; rules: SeedRule[] }[] = [
  { name: "Best Deals Under 30k", slug: "best-deals-under-30k", description: "Active inventory priced below $30,000.", rules: [{ field: "internet_price", operator: "less_than", value: "30000" }] },
  { name: "Trucks", slug: "trucks", description: "All pickup trucks in stock.", rules: [{ field: "body_style", operator: "contains", value: "truck" }] },
  { name: "Luxury SUVs", slug: "luxury-suvs", description: "Premium SUVs over $50k.", rules: [{ field: "body_style", operator: "equals", value: "SUV" }, { field: "internet_price", operator: "greater_than", value: "50000" }] },
  { name: "Fresh Trade-Ins", slug: "fresh-trade-ins", description: "Recently acquired used inventory.", rules: [{ field: "days_in_stock", operator: "less_than", value: "14" }, { field: "condition", operator: "equals", value: "used" }] },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CollectionsPage() {
  const qc = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ["dealer_groups_list"],
    queryFn: async () => { const { data } = await supabase.from("dealer_groups").select("id, name").order("name"); return data ?? []; },
  });
  const { data: stores } = useQuery({
    queryKey: ["stores_list"],
    queryFn: async () => { const { data } = await supabase.from("stores").select("id, name").order("name"); return data ?? []; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("collections")
        .select("*, dealer_groups(name), stores(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: ruleRows } = await supabase.from("collection_rules").select("collection_id");
      const counts = new Map<string, number>();
      ruleRows?.forEach((r: any) => counts.set(r.collection_id, (counts.get(r.collection_id) ?? 0) + 1));
      return (rows ?? []).map((c: any) => ({ ...c, rule_count: counts.get(c.id) ?? 0 })) as Collection[];
    },
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dealerGroupId, setDealerGroupId] = useState<string>("none");
  const [storeId, setStoreId] = useState<string>("none");

  function openCreate() {
    setName(""); setSlug(""); setDescription(""); setDealerGroupId("none"); setStoreId("none");
    setOpen(true);
  }

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("collections").insert({
        name,
        slug: slug || slugify(name),
        description: description || null,
        dealer_group_id: dealerGroupId === "none" ? null : dealerGroupId,
        store_id: storeId === "none" ? null : storeId,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Collection created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("collections").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["collections"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const seed = useMutation({
    mutationFn: async (s: typeof SEEDS[number]) => {
      const { data: c, error } = await supabase.from("collections")
        .insert({ name: s.name, slug: s.slug, description: s.description, is_active: true })
        .select("id").single();
      if (error) throw error;
      const { error: rErr } = await supabase.from("collection_rules")
        .insert(s.rules.map((r) => ({ ...r, collection_id: c.id })));
      if (rErr) throw rErr;
    },
    onSuccess: (_d, s) => { toast.success(`Created "${s.name}"`); qc.invalidateQueries({ queryKey: ["collections"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Smart Collections"
        description="Dynamic inventory groups defined by rules. Use them for homepage sections, SEO pages, and featured inventory."
        action={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Example collections</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SEEDS.map((s) => (
                  <DropdownMenuItem key={s.slug} onClick={() => seed.mutate(s)}>{s.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Collection</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New collection</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} placeholder="e.g. Best Deals Under 30k" />
                  </div>
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="best-deals-under-30k" />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button disabled={!name || create.isPending} onClick={() => create.mutate()}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !data?.length ? <EmptyState title="No collections yet" hint="Create one, or seed an example from the menu above." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Scope</th>
                <th className="px-4 py-2">Rules</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">
                    <Link to="/collections/$id" params={{ id: c.id }} className="hover:underline">{c.name}</Link>
                    {c.description && <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {c.stores?.name ? `Store: ${c.stores.name}` : c.dealer_groups?.name ? `Group: ${c.dealer_groups.name}` : "All"}
                  </td>
                  <td className="px-4 py-2"><Badge variant="outline">{c.rule_count}</Badge></td>
                  <td className="px-4 py-2">
                    <Switch checked={c.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: c.id, is_active: v })} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="icon" asChild><Link to="/collections/$id" params={{ id: c.id }}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
