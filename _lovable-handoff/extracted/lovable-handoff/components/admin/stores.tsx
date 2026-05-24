import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/stores")({
  component: StoresPage,
});

type Store = {
  id: string; name: string; dealer_group_id: string | null;
  city: string | null; state: string | null; phone: string | null; website: string | null;
  is_active: boolean;
  dealer_groups?: { name: string } | null;
};

const emptyForm = { name: "", dealer_group_id: "", city: "", state: "", phone: "", website: "", is_active: true };

function StoresPage() {
  const qc = useQueryClient();
  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores").select("*, dealer_groups(name)").order("name");
      if (error) throw error; return data as Store[];
    },
  });
  const { data: groups } = useQuery({
    queryKey: ["dealer_groups_list"],
    queryFn: async () => {
      const { data } = await supabase.from("dealer_groups").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(s: Store) {
    setEditing(s);
    setForm({
      name: s.name, dealer_group_id: s.dealer_group_id ?? "",
      city: s.city ?? "", state: s.state ?? "", phone: s.phone ?? "", website: s.website ?? "",
      is_active: s.is_active ?? true,
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, dealer_group_id: form.dealer_group_id || null };
      if (editing) {
        const { error } = await supabase.from("stores").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stores").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["stores"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("stores").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.is_active ? "Store enabled" : "Store hidden");
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("stores").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["stores"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Stores"
        description="Physical dealerships under a dealer group. Toggle visibility to hide a store's inventory without deleting data."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Store</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit store" : "New store"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" full><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Dealer group" full>
                  <Select value={form.dealer_group_id} onValueChange={(v) => setForm({ ...form, dealer_group_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                    <SelectContent>
                      {groups?.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                <Field label="State"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
                <Field label="Active (visible to customers)" full>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <span className="text-sm text-muted-foreground">
                      {form.is_active ? "Store is visible — vehicles are shown." : "Store is hidden — vehicles will not be shown."}
                    </span>
                  </div>
                </Field>
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
       !stores?.length ? <EmptyState title="No stores yet" hint="Add a store to start configuring feeds." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Name</th><th className="px-4 py-2">Group</th>
                <th className="px-4 py-2">Location</th><th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Website</th><th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className={`border-b last:border-0 ${s.is_active ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.is_active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: s.id, is_active: v })}
                      />
                      {!s.is_active && <Badge variant="outline" className="bg-muted text-muted-foreground">Hidden</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.dealer_groups?.name ?? "—"}</td>
                  <td className="px-4 py-2">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-2">{s.phone ?? "—"}</td>
                  <td className="px-4 py-2">
                    {s.website ? <a className="text-primary hover:underline" href={s.website} target="_blank" rel="noreferrer">{s.website}</a> : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${s.name}"?`)) del.mutate(s.id); }}><Trash2 className="h-4 w-4" /></Button>
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

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label>{label}</Label>{children}
    </div>
  );
}
