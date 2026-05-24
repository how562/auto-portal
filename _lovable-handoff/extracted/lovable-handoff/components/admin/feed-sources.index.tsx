import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/feed-sources/")({
  component: FeedSourcesPage,
});

type Feed = {
  id: string; name: string; feed_type: "csv"|"xml"|"api"; feed_url: string | null;
  is_active: boolean; store_id: string | null;
  stores?: { name: string } | null;
  last_run?: { status: string; created_at: string } | null;
};

const emptyForm = { name: "", store_id: "", feed_type: "csv" as "csv"|"xml"|"api", feed_url: "", is_active: true };

function FeedSourcesPage() {
  const qc = useQueryClient();

  const { data: feeds, isLoading } = useQuery({
    queryKey: ["feed_sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_sources").select("*, stores(name)").order("name");
      if (error) throw error;
      const { data: runs } = await supabase
        .from("feed_import_runs").select("feed_source_id, status, created_at").order("created_at", { ascending: false });
      const last = new Map<string, any>();
      runs?.forEach((r: any) => { if (!last.has(r.feed_source_id)) last.set(r.feed_source_id, r); });
      return (data ?? []).map((f: any) => ({ ...f, last_run: last.get(f.id) ?? null })) as Feed[];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores_list"],
    queryFn: async () => { const { data } = await supabase.from("stores").select("id, name").order("name"); return data ?? []; },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Feed | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(f: Feed) {
    setEditing(f);
    setForm({
      name: f.name, store_id: f.store_id ?? "", feed_type: f.feed_type,
      feed_url: f.feed_url ?? "", is_active: f.is_active,
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, store_id: form.store_id || null, feed_url: form.feed_url || null };
      if (editing) {
        const { error } = await supabase.from("feed_sources").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("feed_sources").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["feed_sources"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("feed_sources").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["feed_sources"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Feed Sources"
        description="Feeds the external worker pulls into Supabase."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Feed Source</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit feed source" : "New feed source"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5">
                  <Label>Store</Label>
                  <Select value={form.store_id} onValueChange={(v) => setForm({ ...form, store_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                    <SelectContent>{stores?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.feed_type} onValueChange={(v: any) => setForm({ ...form, feed_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Feed URL</Label><Input value={form.feed_url} onChange={(e) => setForm({ ...form, feed_url: e.target.value })} placeholder="https://…" /></div>
                <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!form.name || save.isPending} onClick={() => save.mutate()}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !feeds?.length ? <EmptyState title="No feed sources yet" hint="Configure a feed for a store to begin importing inventory." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th><th className="px-4 py-2">Store</th>
                <th className="px-4 py-2">Type</th><th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">Status</th><th className="px-4 py-2">Last Import</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{f.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{f.stores?.name ?? "—"}</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="uppercase">{f.feed_type}</Badge></td>
                  <td className="px-4 py-2 max-w-xs truncate text-xs text-muted-foreground" title={f.feed_url ?? ""}>{f.feed_url ?? "—"}</td>
                  <td className="px-4 py-2">{f.is_active ? <Badge className="bg-success/15 text-success border-success/30" variant="outline">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</td>
                  <td className="px-4 py-2 text-xs">{f.last_run ? `${f.last_run.status} · ${format(new Date(f.last_run.created_at), "MMM d HH:mm")}` : "—"}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" asChild title="Field mappings">
                      <Link to="/feed-sources/$id/mappings" params={{ id: f.id }}><Settings2 className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${f.name}"?`)) del.mutate(f.id); }}><Trash2 className="h-4 w-4" /></Button>
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
