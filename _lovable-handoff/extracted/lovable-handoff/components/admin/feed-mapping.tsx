import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/feed-mapping")({
  component: FeedMappingPage,
});

type Mapping = {
  id: string;
  file_pattern: string;
  store_id: string;
  is_active: boolean;
  notes: string | null;
  stores?: { name: string } | null;
};

const emptyForm = { file_pattern: "", store_id: "", is_active: true, notes: "" };

function FeedMappingPage() {
  const qc = useQueryClient();

  const { data: mappings, isLoading } = useQuery({
    queryKey: ["feed_file_mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_file_mappings")
        .select("id, file_pattern, store_id, is_active, notes, stores(name)")
        .order("file_pattern");
      if (error) throw error;
      return (data ?? []) as unknown as Mapping[];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores_list_all"],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mapping | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(m: Mapping) {
    setEditing(m);
    setForm({
      file_pattern: m.file_pattern,
      store_id: m.store_id,
      is_active: m.is_active,
      notes: m.notes ?? "",
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        file_pattern: form.file_pattern.trim(),
        store_id: form.store_id,
        is_active: form.is_active,
        notes: form.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (!payload.file_pattern || !payload.store_id) throw new Error("Pattern and store are required.");
      if (editing) {
        const { error } = await supabase.from("feed_file_mappings").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("feed_file_mappings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["feed_file_mappings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("feed_file_mappings").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed_file_mappings"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feed_file_mappings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["feed_file_mappings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Feed Mapping"
        description="Route incoming HomeNet files to a store by filename pattern. Mapping only — no vehicle data is edited here."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Mapping</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit mapping" : "New mapping"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>File pattern</Label>
                  <Input
                    placeholder="e.g. *cavender_chevrolet*.csv"
                    value={form.file_pattern}
                    onChange={(e) => setForm({ ...form, file_pattern: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Glob-style. Use <code>*</code> to match any text in the file name.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Store</Label>
                  <Select value={form.store_id} onValueChange={(v) => setForm({ ...form, store_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                    <SelectContent>
                      {stores?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Internal notes (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!form.file_pattern || !form.store_id || save.isPending} onClick={() => save.mutate()}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !mappings?.length ? <EmptyState title="No mappings yet" hint="Add a pattern to route incoming files to a store." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">File Pattern</th>
                <th className="px-4 py-2">Store</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} className={`border-b last:border-0 ${m.is_active ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.is_active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: m.id, is_active: v })}
                      />
                      {!m.is_active && <Badge variant="outline" className="bg-muted text-muted-foreground">Off</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{m.file_pattern}</td>
                  <td className="px-4 py-2">{m.stores?.name ?? "—"}</td>
                  <td className="px-4 py-2 max-w-[360px] truncate text-muted-foreground" title={m.notes ?? ""}>{m.notes ?? "—"}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete pattern "${m.file_pattern}"?`)) del.mutate(m.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
