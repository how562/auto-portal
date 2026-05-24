import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/homepage-sections/")({
  component: HomepageSectionsPage,
});

type Section = {
  id: string;
  title: string | null;
  subtitle: string | null;
  section_type: "collection" | "banner" | "static";
  collection_id: string | null;
  sort_order: number;
  is_active: boolean;
  collections?: { name: string; slug: string } | null;
};

function HomepageSectionsPage() {
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["homepage_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*, collections(name, slug)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Section[];
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections_list"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState<"collection" | "banner" | "static">("collection");
  const [collectionId, setCollectionId] = useState<string>("none");

  function openCreate() {
    setTitle(""); setSubtitle(""); setType("collection"); setCollectionId("none");
    setOpen(true);
  }

  const create = useMutation({
    mutationFn: async () => {
      const nextOrder = (data?.[data.length - 1]?.sort_order ?? 0) + 10;
      const { data: row, error } = await supabase.from("homepage_sections").insert({
        title: title || null,
        subtitle: subtitle || null,
        section_type: type,
        collection_id: type === "collection" && collectionId !== "none" ? collectionId : null,
        sort_order: nextOrder,
        is_active: true,
      }).select("id").single();
      if (error) throw error;
      return row.id as string;
    },
    onSuccess: (id) => {
      toast.success("Section created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["homepage_sections"] });
      nav({ to: "/homepage-sections/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("homepage_sections").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage_sections"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["homepage_sections"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const swap = useMutation({
    mutationFn: async ({ a, b }: { a: Section; b: Section }) => {
      // Two-step swap to avoid potential unique constraint clashes if added later
      const { error: e1 } = await supabase.from("homepage_sections").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("homepage_sections").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage_sections"] }),
    onError: (e: any) => toast.error(e.message),
  });

  function move(i: number, dir: -1 | 1) {
    if (!data) return;
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    swap.mutate({ a: data[i], b: data[j] });
  }

  return (
    <div>
      <PageHeader
        title="Homepage Sections"
        description="Define what shows on the public homepage. Sections render in order — toggle active to control visibility."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Section</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New homepage section</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Featured Deals" />
                </div>
                <div className="space-y-1">
                  <Label>Subtitle</Label>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collection">Collection</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {type === "collection" && (
                  <div className="space-y-1">
                    <Label>Collection</Label>
                    <Select value={collectionId} onValueChange={setCollectionId}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {(collections ?? []).map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => create.mutate()} disabled={create.isPending}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
       !data?.length ? <EmptyState title="No sections yet" hint="Create one to control what shows on the homepage." /> : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 w-24">Order</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Collection</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" disabled={i === data.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                      <span className="text-xs text-muted-foreground tabular-nums">{s.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <Link to="/homepage-sections/$id" params={{ id: s.id }} className="hover:underline">
                      {s.title || <span className="text-muted-foreground italic">Untitled</span>}
                    </Link>
                    {s.subtitle && <div className="text-xs text-muted-foreground line-clamp-1">{s.subtitle}</div>}
                  </td>
                  <td className="px-3 py-2"><Badge variant="outline" className="uppercase text-xs">{s.section_type}</Badge></td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {s.collections?.name ?? (s.section_type === "collection" ? <span className="text-destructive">— not set —</span> : "—")}
                  </td>
                  <td className="px-3 py-2">
                    <Switch checked={s.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: s.id, is_active: v })} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="icon" asChild><Link to="/homepage-sections/$id" params={{ id: s.id }}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this section?")) del.mutate(s.id); }}><Trash2 className="h-4 w-4" /></Button>
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
