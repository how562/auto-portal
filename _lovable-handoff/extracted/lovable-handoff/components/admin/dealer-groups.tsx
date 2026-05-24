import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dealer-groups")({
  component: DealerGroupsPage,
});

type Group = { id: string; name: string; created_at: string; store_count?: number };

function DealerGroupsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dealer_groups"],
    queryFn: async () => {
      const { data: groups, error } = await supabase
        .from("dealer_groups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const { data: stores } = await supabase.from("stores").select("dealer_group_id");
      const counts = new Map<string, number>();
      stores?.forEach((s: any) => counts.set(s.dealer_group_id, (counts.get(s.dealer_group_id) ?? 0) + 1));
      return (groups ?? []).map((g) => ({ ...g, store_count: counts.get(g.id) ?? 0 })) as Group[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [name, setName] = useState("");

  function openCreate() { setEditing(null); setName(""); setOpen(true); }
  function openEdit(g: Group) { setEditing(g); setName(g.name); setOpen(true); }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("dealer_groups").update({ name }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dealer_groups").insert({ name });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Group updated" : "Group created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["dealer_groups"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dealer_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["dealer_groups"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Dealer Groups"
        description="Top-level organization of stores."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit group" : "New dealer group"}</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunrise Auto Holdings" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!name || save.isPending} onClick={() => save.mutate()}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !data?.length ? <EmptyState title="No dealer groups yet" hint="Create your first group to organize stores." /> : (
        <div className="rounded-md border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Stores</th><th className="px-4 py-2">Created</th><th className="px-4 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {data.map((g) => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{g.name}</td>
                  <td className="px-4 py-2 tabular-nums">{g.store_count}</td>
                  <td className="px-4 py-2">{format(new Date(g.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${g.name}"?`)) del.mutate(g.id); }}><Trash2 className="h-4 w-4" /></Button>
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
