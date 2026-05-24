import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchCollectionPreview, fetchCollectionRules } from "@/lib/collection-preview";

export const Route = createFileRoute("/_authenticated/homepage-sections/$id")({
  component: HomepageSectionDetailPage,
});

function HomepageSectionDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: section, isLoading } = useQuery({
    queryKey: ["homepage_section", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections_list"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id, name, slug, is_active").order("name");
      return data ?? [];
    },
  });

  const { data: groups } = useQuery({
    queryKey: ["dealer_groups_list"],
    queryFn: async () => { const { data } = await supabase.from("dealer_groups").select("id, name").order("name"); return data ?? []; },
  });

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState<"collection" | "banner" | "static">("collection");
  const [collectionId, setCollectionId] = useState<string>("none");
  const [dealerGroupId, setDealerGroupId] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (section) {
      setTitle(section.title ?? "");
      setSubtitle(section.subtitle ?? "");
      setType(section.section_type ?? "collection");
      setCollectionId(section.collection_id ?? "none");
      setDealerGroupId(section.dealer_group_id ?? "none");
      setSortOrder(section.sort_order ?? 0);
      setIsActive(section.is_active ?? true);
    }
  }, [section]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("homepage_sections").update({
        title: title || null,
        subtitle: subtitle || null,
        section_type: type,
        collection_id: type === "collection" && collectionId !== "none" ? collectionId : null,
        dealer_group_id: dealerGroupId === "none" ? null : dealerGroupId,
        sort_order: sortOrder,
        is_active: isActive,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section saved");
      qc.invalidateQueries({ queryKey: ["homepage_section", id] });
      qc.invalidateQueries({ queryKey: ["homepage_sections"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ---- Preview: use the SAME helper Smart Collections uses ----
  const previewCollectionId = type === "collection" && collectionId !== "none" ? collectionId : null;

  // Load the collection itself so we inherit its store_id / dealer_group_id scope.
  const { data: previewCollection } = useQuery({
    queryKey: ["collection_scope", previewCollectionId],
    enabled: !!previewCollectionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, store_id, dealer_group_id")
        .eq("id", previewCollectionId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: rules } = useQuery({
    queryKey: ["collection_rules", previewCollectionId],
    enabled: !!previewCollectionId,
    queryFn: () => fetchCollectionRules(previewCollectionId!),
  });

  const ruleKey = useMemo(() => JSON.stringify(rules ?? []), [rules]);
  // Section-level dealer group override still wins over the collection's own scope.
  const effectiveDealerGroupId =
    (dealerGroupId !== "none" ? dealerGroupId : previewCollection?.dealer_group_id) ?? null;
  const effectiveStoreId = previewCollection?.store_id ?? null;

  const { data: preview, isFetching: previewLoading, error: previewError } = useQuery({
    queryKey: [
      "homepage_section_preview",
      previewCollectionId,
      ruleKey,
      effectiveStoreId,
      effectiveDealerGroupId,
    ],
    enabled: !!previewCollectionId && !!rules,
    queryFn: () =>
      fetchCollectionPreview({
        rules: rules ?? [],
        storeId: effectiveStoreId,
        dealerGroupId: effectiveDealerGroupId,
        limit: 12,
      }),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!section) {
    return (
      <div className="rounded-md border border-card bg-card p-6">
        <p className="mb-3 text-sm">Homepage section not found.</p>
        <Button asChild variant="outline" size="sm"><Link to="/homepage-sections"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link to="/homepage-sections"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Homepage Sections</Link>
        </Button>
        <PageHeader
          title={title || "Section"}
          description="Configure how this section appears on the public homepage."
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
              </div>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
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
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-1">
                <Label>Sort order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
              </div>
            </div>
            {type === "collection" && (
              <div className="space-y-1">
                <Label>Collection</Label>
                <Select value={collectionId} onValueChange={setCollectionId}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {(collections ?? []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.is_active ? "" : " (inactive)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Dealer group (optional)</Label>
              <Select value={dealerGroupId} onValueChange={setDealerGroupId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All groups</SelectItem>
                  {(groups ?? []).map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Preview"
          action={
            type === "collection" && previewCollectionId ? (
              <Badge variant="outline">{previewLoading ? "…" : `${preview?.count ?? 0} matching`}</Badge>
            ) : null
          }
        >
          {type !== "collection" ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Preview is only available for collection-type sections.
            </div>
          ) : !previewCollectionId ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Select a collection to preview matching vehicles.
            </div>
          ) : previewError ? (
            <div className="text-sm text-destructive py-6 text-center">
              Preview failed: {(previewError as Error).message}
            </div>
          ) : previewLoading && !preview ? (
            <div className="text-sm text-muted-foreground py-6 text-center">Loading preview…</div>
          ) : !preview?.rows.length ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No vehicles match this collection's rules.
              {(rules?.length ?? 0) === 0 && " (This collection has no rules yet — add rules in Smart Collections.)"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 w-16">Image</th>
                    <th className="px-2 py-2">Stock #</th>
                    <th className="px-2 py-2">Year</th>
                    <th className="px-2 py-2">Make / Model</th>
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
                      <td className="px-2 py-2 tabular-nums">{v.year ?? "—"}</td>
                      <td className="px-2 py-2">
                        <div>{v.make ?? "—"} {v.model ?? ""}</div>
                        {v.trim && <div className="text-xs text-muted-foreground">{v.trim}</div>}
                      </td>
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
    </div>
  );
}
