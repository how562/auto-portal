import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Pencil, Trash2, Globe, FileEdit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pages/")({
  component: PagesListPage,
});

type SitePage = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  store_id: string | null;
  updated_at: string;
  stores?: { name: string } | null;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PagesListPage() {
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["site_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("id, title, slug, status, store_id, updated_at, stores(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SitePage[];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores_list"],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [storeId, setStoreId] = useState<string>("none");

  function openCreate() {
    setTitle(""); setSlug(""); setStoreId("none"); setOpen(true);
  }

  const create = useMutation({
    mutationFn: async () => {
      const finalSlug = slug || slugify(title);
      if (!title.trim()) throw new Error("Title is required");
      if (!finalSlug) throw new Error("Slug is required");
      const { data: row, error } = await supabase.from("site_pages").insert({
        title: title.trim(),
        slug: finalSlug,
        status: "draft",
        store_id: storeId === "none" ? null : storeId,
      }).select("id").single();
      if (error) throw error;
      return row.id as string;
    },
    onSuccess: (id) => {
      toast.success("Page created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["site_pages"] });
      nav({ to: "/pages/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" }) => {
      const { error } = await supabase.from("site_pages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_pages"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["site_pages"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Build and manage non-inventory pages with reusable sections."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/pages/import">Import Page</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Page</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New page</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug) setSlug(slugify(e.target.value));
                    }}
                    placeholder="About Us"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="about-us" />
                </div>
                <div className="space-y-1">
                  <Label>Store (optional)</Label>
                  <Select value={storeId} onValueChange={setStoreId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All stores</SelectItem>
                      {(stores ?? []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => create.mutate()} disabled={create.isPending}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        }
      />

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
        !data?.length ? <EmptyState title="No pages yet" hint="Create your first page to start adding sections." /> : (
          <div className="rounded-md border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Store</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">
                      <Link to="/pages/$id" params={{ id: p.id }} className="hover:underline">{p.title}</Link>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">/{p.slug}</td>
                    <td className="px-3 py-2">
                      <Badge variant={p.status === "published" ? "default" : "outline"} className="uppercase text-xs">{p.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{p.stores?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{new Date(p.updated_at).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      {p.status === "published" ? (
                        <Button variant="ghost" size="icon" title="Unpublish" onClick={() => setStatus.mutate({ id: p.id, status: "draft" })}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" title="Publish" onClick={() => setStatus.mutate({ id: p.id, status: "published" })}>
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild><Link to="/pages/$id" params={{ id: p.id }}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this page?")) del.mutate(p.id); }}>
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
