import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Globe, FileEdit, ChevronDown, ChevronRight, Languages } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pages/$id")({
  component: PageEditorPage,
});

const SECTION_TYPES = [
  "hero", "text_block", "image_text", "split_feature", "cta_band", "faq",
  "stats", "card_grid", "inventory_collection", "form", "locations", "custom_html",
] as const;
type SectionType = (typeof SECTION_TYPES)[number];

type PageSection = {
  id: string;
  page_id: string;
  section_type: SectionType;
  eyebrow: string | null;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  headline_es: string | null;
  subheadline_es: string | null;
  body_es: string | null;
  cta_text_es: string | null;
  sort_order: number;
  settings: Record<string, any>;
};

function PageEditorPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ["site_page", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_pages").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: sections } = useQuery({
    queryKey: ["page_sections", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections").select("*").eq("page_id", id).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as PageSection[];
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections_list"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    if (page) {
      setTitle(page.title ?? "");
      setSlug(page.slug ?? "");
      setMetaDescription(page.meta_description ?? "");
      setStatus(page.status ?? "draft");
    }
  }, [page]);

  const savePage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_pages").update({
        title: title.trim(),
        slug: slug.trim(),
        meta_description: metaDescription || null,
        status,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Page saved");
      qc.invalidateQueries({ queryKey: ["site_page", id] });
      qc.invalidateQueries({ queryKey: ["site_pages"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addSection = useMutation({
    mutationFn: async (section_type: SectionType) => {
      const next = (sections?.[sections.length - 1]?.sort_order ?? 0) + 10;
      const { error } = await supabase.from("page_sections").insert({
        page_id: id, section_type, sort_order: next, settings: {},
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_sections", id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const updateSection = useMutation({
    mutationFn: async ({ sectionId, patch }: { sectionId: string; patch: Partial<PageSection> }) => {
      const { error } = await supabase.from("page_sections").update(patch).eq("id", sectionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_sections", id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      const { error } = await supabase.from("page_sections").delete().eq("id", sectionId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Section deleted"); qc.invalidateQueries({ queryKey: ["page_sections", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const swapSections = useMutation({
    mutationFn: async ({ a, b }: { a: PageSection; b: PageSection }) => {
      const { error: e1 } = await supabase.from("page_sections").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("page_sections").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_sections", id] }),
    onError: (e: any) => toast.error(e.message),
  });

  function move(i: number, dir: -1 | 1) {
    if (!sections) return;
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    swapSections.mutate({ a: sections[i], b: sections[j] });
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!page) {
    return (
      <div className="rounded-md border bg-card p-6">
        <p className="mb-3 text-sm">Page not found.</p>
        <Button asChild variant="outline" size="sm"><Link to="/pages"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link to="/pages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages</Link>
        </Button>
        <PageHeader
          title={title || "Page"}
          description="Edit page details and assemble sections."
          action={
            <div className="flex items-center gap-2">
              <Badge variant={status === "published" ? "default" : "outline"} className="uppercase text-xs">{status}</Badge>
              {status === "published" ? (
                <Button variant="outline" onClick={() => { setStatus("draft"); }}>
                  <FileEdit className="mr-2 h-4 w-4" /> Set draft
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { setStatus("published"); }}>
                  <Globe className="mr-2 h-4 w-4" /> Set published
                </Button>
              )}
              <Button onClick={() => savePage.mutate()} disabled={savePage.isPending}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          }
        />
      </div>

      <SectionCard title="Details">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Meta description</Label>
            <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Sections"
        action={
          <div className="flex items-center gap-2">
            <AddSectionPicker onAdd={(t) => addSection.mutate(t)} />
          </div>
        }
      >
        {!sections?.length ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No sections yet. Use “Add section” to start building this page.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((s, i) => (
              <SectionEditor
                key={s.id}
                section={s}
                isFirst={i === 0}
                isLast={i === sections.length - 1}
                collections={collections ?? []}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onDelete={() => { if (confirm("Delete this section?")) deleteSection.mutate(s.id); }}
                onSave={(patch) => updateSection.mutate({ sectionId: s.id, patch })}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function AddSectionPicker({ onAdd }: { onAdd: (t: SectionType) => void }) {
  const [t, setT] = useState<SectionType>("hero");
  return (
    <div className="flex items-center gap-2">
      <Select value={t} onValueChange={(v) => setT(v as SectionType)}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {SECTION_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={() => onAdd(t)}><Plus className="mr-2 h-4 w-4" /> Add section</Button>
    </div>
  );
}

function SectionEditor({
  section, isFirst, isLast, collections, onMoveUp, onMoveDown, onDelete, onSave,
}: {
  section: PageSection;
  isFirst: boolean;
  isLast: boolean;
  collections: { id: string; name: string }[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSave: (patch: Partial<PageSection>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PageSection>(section);
  useEffect(() => setLocal(section), [section]);

  function field<K extends keyof PageSection>(k: K, v: PageSection[K]) {
    setLocal((prev) => ({ ...prev, [k]: v }));
  }
  function settingsField(k: string, v: any) {
    setLocal((prev) => ({ ...prev, settings: { ...(prev.settings ?? {}), [k]: v } }));
  }

  const dirty = JSON.stringify(local) !== JSON.stringify(section);

  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <Badge variant="outline" className="uppercase text-xs">{section.section_type}</Badge>
          <span className="truncate text-sm font-medium">
            {section.headline || section.eyebrow || <span className="text-muted-foreground italic">Untitled</span>}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={isFirst} onClick={onMoveUp}><ArrowUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" disabled={isLast} onClick={onMoveDown}><ArrowDown className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {open && (
        <div className="border-t p-4 space-y-4">
          <CommonFields section={local} setField={field} setSetting={settingsField} />
          <TypeFields
            section={local}
            setField={field}
            setSetting={settingsField}
            collections={collections}
          />
          <SectionPreview section={local} collections={collections} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" disabled={!dirty} onClick={() => setLocal(section)}>Reset</Button>
            <Button size="sm" disabled={!dirty} onClick={() => onSave({
              eyebrow: local.eyebrow, headline: local.headline, subheadline: local.subheadline,
              body: local.body, image_url: local.image_url, cta_text: local.cta_text, cta_url: local.cta_url,
              headline_es: local.headline_es, subheadline_es: local.subheadline_es,
              body_es: local.body_es, cta_text_es: local.cta_text_es,
              settings: local.settings,
            })}>
              <Save className="mr-2 h-4 w-4" /> Save section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommonFields({
  section, setField, setSetting,
}: {
  section: PageSection;
  setField: <K extends keyof PageSection>(k: K, v: PageSection[K]) => void;
  setSetting: (k: string, v: any) => void;
}) {
  const t = section.section_type;
  // Allow image + CTA on all text-bearing sections so admins can always add visuals.
  const showImage = t !== "custom_html" && t !== "locations" && t !== "form";
  const showCTA = t !== "custom_html" && t !== "locations" && t !== "form" && t !== "faq" && t !== "stats";
  const showBody = t !== "custom_html" && t !== "locations" && t !== "form" && t !== "inventory_collection";
  const showHeadline = t !== "custom_html";
  const s = section.settings ?? {};
  return (
    <div className="space-y-4">
      {showHeadline && (
        <div className="space-y-1">
          <Label>Eyebrow</Label>
          <Input value={section.eyebrow ?? ""} onChange={(e) => setField("eyebrow", e.target.value || null)} />
          <p className="text-xs text-muted-foreground">Shared across languages.</p>
        </div>
      )}

      <Tabs defaultValue="en" className="w-full">
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="en"><Languages className="mr-2 h-3.5 w-3.5" /> English</TabsTrigger>
            <TabsTrigger value="es"><Languages className="mr-2 h-3.5 w-3.5" /> Spanish</TabsTrigger>
          </TabsList>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (section.headline) setField("headline_es", section.headline);
              if (section.subheadline) setField("subheadline_es", section.subheadline);
              if (section.body) setField("body_es", section.body);
              if (section.cta_text) setField("cta_text_es", section.cta_text);
            }}
          >
            Copy English → Spanish
          </Button>
        </div>

        <TabsContent value="en" className="mt-3">
          <div className="grid gap-3 md:grid-cols-2">
            {showHeadline && (
              <>
                <div className="space-y-1 md:col-span-2">
                  <Label>Headline</Label>
                  <Input value={section.headline ?? ""} onChange={(e) => setField("headline", e.target.value || null)} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Subheadline</Label>
                  <Input value={section.subheadline ?? ""} onChange={(e) => setField("subheadline", e.target.value || null)} />
                </div>
              </>
            )}
            {showBody && (
              <div className="space-y-1 md:col-span-2">
                <Label>Body</Label>
                <Textarea rows={4} value={section.body ?? ""} onChange={(e) => setField("body", e.target.value || null)} />
              </div>
            )}
            {showCTA && (
              <div className="space-y-1 md:col-span-2">
                <Label>CTA text</Label>
                <Input value={section.cta_text ?? ""} onChange={(e) => setField("cta_text", e.target.value || null)} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="es" className="mt-3">
          <div className="grid gap-3 md:grid-cols-2">
            {showHeadline && (
              <>
                <div className="space-y-1 md:col-span-2">
                  <Label>Titular (ES)</Label>
                  <Input value={section.headline_es ?? ""} onChange={(e) => setField("headline_es", e.target.value || null)} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Subtítulo (ES)</Label>
                  <Input value={section.subheadline_es ?? ""} onChange={(e) => setField("subheadline_es", e.target.value || null)} />
                </div>
              </>
            )}
            {showBody && (
              <div className="space-y-1 md:col-span-2">
                <Label>Cuerpo (ES)</Label>
                <Textarea rows={4} value={section.body_es ?? ""} onChange={(e) => setField("body_es", e.target.value || null)} />
              </div>
            )}
            {showCTA && (
              <div className="space-y-1 md:col-span-2">
                <Label>Texto del CTA (ES)</Label>
                <Input value={section.cta_text_es ?? ""} onChange={(e) => setField("cta_text_es", e.target.value || null)} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2">
        {showImage && (
          <div className="space-y-1 md:col-span-2">
            <Label>Image URL</Label>
            <Input value={section.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value || null)} placeholder="https://…" />
          </div>
        )}
        {showCTA && (
          <div className="space-y-1 md:col-span-2">
            <Label>CTA URL</Label>
            <Input value={section.cta_url ?? ""} onChange={(e) => setField("cta_url", e.target.value || null)} />
            <p className="text-xs text-muted-foreground">Shared across languages.</p>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-muted/30 p-3 space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Section style</div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Background color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                className="h-9 w-12 p-1"
                value={s.background_color ?? "#ffffff"}
                onChange={(e) => setSetting("background_color", e.target.value)}
              />
              <Input
                placeholder="#ffffff"
                value={s.background_color ?? ""}
                onChange={(e) => setSetting("background_color", e.target.value || null)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Text color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                className="h-9 w-12 p-1"
                value={s.text_color ?? "#0f172a"}
                onChange={(e) => setSetting("text_color", e.target.value)}
              />
              <Input
                placeholder="#0f172a"
                value={s.text_color ?? ""}
                onChange={(e) => setSetting("text_color", e.target.value || null)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Background image URL</Label>
            <Input
              placeholder="https://…"
              value={s.background_image_url ?? ""}
              onChange={(e) => setSetting("background_image_url", e.target.value || null)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Applied to the whole section band on the public site. Leave blank to inherit the site theme.
        </p>
      </div>
    </div>
  );
}

function TypeFields({
  section, setField, setSetting, collections,
}: {
  section: PageSection;
  setField: <K extends keyof PageSection>(k: K, v: PageSection[K]) => void;
  setSetting: (k: string, v: any) => void;
  collections: { id: string; name: string }[];
}) {
  const s = section.settings ?? {};

  switch (section.section_type) {
    case "image_text": {
      return (
        <div className="grid gap-3 md:grid-cols-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label>Layout</Label>
            <Select value={s.layout ?? "image_right"} onValueChange={(v) => setSetting("layout", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image_left">Image left</SelectItem>
                <SelectItem value="image_right">Image right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Media type</Label>
            <Select value={s.media_type ?? "image"} onValueChange={(v) => setSetting("media_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
    case "cta_band": {
      return (
        <div className="grid gap-3 md:grid-cols-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label>Secondary CTA text</Label>
            <Input value={s.secondary_cta_text ?? ""} onChange={(e) => setSetting("secondary_cta_text", e.target.value || null)} />
          </div>
          <div className="space-y-1">
            <Label>Secondary CTA URL</Label>
            <Input value={s.secondary_cta_url ?? ""} onChange={(e) => setSetting("secondary_cta_url", e.target.value || null)} />
          </div>
          <div className="space-y-1">
            <Label>Tertiary CTA text</Label>
            <Input value={s.tertiary_cta_text ?? ""} onChange={(e) => setSetting("tertiary_cta_text", e.target.value || null)} />
          </div>
          <div className="space-y-1">
            <Label>Tertiary CTA URL</Label>
            <Input value={s.tertiary_cta_url ?? ""} onChange={(e) => setSetting("tertiary_cta_url", e.target.value || null)} />
          </div>
        </div>
      );
    }
    case "inventory_collection": {
      const collectionId: string = s.collection_id ?? "none";
      const limit: number = Number(s.limit ?? 8);
      return (
        <div className="grid gap-3 md:grid-cols-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label>Smart Collection</Label>
            <Select value={collectionId} onValueChange={(v) => setSetting("collection_id", v === "none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Max vehicles</Label>
            <Input type="number" value={limit} onChange={(e) => setSetting("limit", Number(e.target.value) || 8)} />
          </div>
        </div>
      );
    }
    case "faq": {
      const items: { question: string; answer: string }[] = Array.isArray(s.items) ? s.items : [];
      return (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <Label>FAQ items</Label>
          {items.map((it, idx) => (
            <div key={idx} className="rounded border bg-background p-2 space-y-2">
              <Input
                placeholder="Question"
                value={it.question}
                onChange={(e) => setSetting("items", items.map((x, i) => i === idx ? { ...x, question: e.target.value } : x))}
              />
              <Textarea
                placeholder="Answer"
                rows={2}
                value={it.answer}
                onChange={(e) => setSetting("items", items.map((x, i) => i === idx ? { ...x, answer: e.target.value } : x))}
              />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setSetting("items", items.filter((_, i) => i !== idx))}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSetting("items", [...items, { question: "", answer: "" }])}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </div>
      );
    }
    case "card_grid": {
      const cards: { title: string; description: string; image_url: string; link: string }[] =
        Array.isArray(s.cards) ? s.cards : [];
      return (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <Label>Cards</Label>
          {cards.map((c, idx) => (
            <div key={idx} className="rounded border bg-background p-2 grid gap-2 md:grid-cols-2">
              <Input placeholder="Title" value={c.title}
                onChange={(e) => setSetting("cards", cards.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
              <Input placeholder="Image URL" value={c.image_url}
                onChange={(e) => setSetting("cards", cards.map((x, i) => i === idx ? { ...x, image_url: e.target.value } : x))} />
              <Textarea className="md:col-span-2" rows={2} placeholder="Description" value={c.description}
                onChange={(e) => setSetting("cards", cards.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
              <Input className="md:col-span-2" placeholder="Link URL" value={c.link}
                onChange={(e) => setSetting("cards", cards.map((x, i) => i === idx ? { ...x, link: e.target.value } : x))} />
              <div className="md:col-span-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setSetting("cards", cards.filter((_, i) => i !== idx))}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm"
            onClick={() => setSetting("cards", [...cards, { title: "", description: "", image_url: "", link: "" }])}>
            <Plus className="mr-2 h-4 w-4" /> Add card
          </Button>
        </div>
      );
    }
    case "stats": {
      const stats: { value: string; label: string }[] = Array.isArray(s.stats) ? s.stats : [];
      return (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <Label>Stats</Label>
          {stats.map((st, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
              <Input placeholder="Value" value={st.value}
                onChange={(e) => setSetting("stats", stats.map((x, i) => i === idx ? { ...x, value: e.target.value } : x))} />
              <Input placeholder="Label" value={st.label}
                onChange={(e) => setSetting("stats", stats.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} />
              <Button variant="ghost" size="icon" onClick={() => setSetting("stats", stats.filter((_, i) => i !== idx))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSetting("stats", [...stats, { value: "", label: "" }])}>
            <Plus className="mr-2 h-4 w-4" /> Add stat
          </Button>
        </div>
      );
    }
    case "form": {
      return (
        <div className="grid gap-3 md:grid-cols-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label>Form type</Label>
            <Select value={s.form_type ?? "contact"} onValueChange={(v) => setSetting("form_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="lead">Lead capture</SelectItem>
                <SelectItem value="trade_in">Trade-in</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Submit label</Label>
            <Input value={s.submit_label ?? ""} onChange={(e) => setSetting("submit_label", e.target.value)} placeholder="Send" />
          </div>
        </div>
      );
    }
    case "locations": {
      return (
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Will render all stores for this dealer group on the public site. No extra config needed.
        </div>
      );
    }
    case "custom_html": {
      return (
        <div className="rounded-md border bg-muted/30 p-3 space-y-1">
          <Label>Custom HTML</Label>
          <Textarea rows={8} className="font-mono text-xs"
            value={s.html ?? ""} onChange={(e) => setSetting("html", e.target.value)} />
          <p className="text-xs text-muted-foreground">Rendered as-is on the public site. Sanitize before publishing.</p>
        </div>
      );
    }
    default:
      return null;
  }
}

function SectionPreview({
  section, collections,
}: { section: PageSection; collections: { id: string; name: string }[] }) {
  const s = section.settings ?? {};
  const bgImage: string | undefined = s.background_image_url || undefined;
  const bgColor: string | undefined = s.background_color || undefined;
  const textColor: string | undefined = s.text_color || undefined;

  const style: React.CSSProperties = {
    backgroundColor: bgColor,
    color: textColor,
    backgroundImage: bgImage ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url("${bgImage}")` : undefined,
    backgroundSize: bgImage ? "cover" : undefined,
    backgroundPosition: bgImage ? "center" : undefined,
  };

  const hasAnyText =
    section.eyebrow || section.headline || section.subheadline || section.body || section.cta_text;

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="px-3 py-1.5 text-xs uppercase text-muted-foreground bg-muted/40 border-b">Preview</div>
      <div className="p-6 min-h-[120px]" style={style}>
        <div className="space-y-2">
          {section.eyebrow && (
            <div className="text-xs uppercase tracking-wide opacity-80">{section.eyebrow}</div>
          )}
          {section.headline && <div className="text-2xl font-semibold">{section.headline}</div>}
          {section.subheadline && <div className="text-sm opacity-80">{section.subheadline}</div>}
          {section.body && <p className="text-sm whitespace-pre-wrap leading-relaxed">{section.body}</p>}
          {section.image_url && (
            <img src={section.image_url} alt="" className="max-h-48 rounded object-cover mt-2" />
          )}
          {section.cta_text && (
            <div className="pt-1">
              <Badge variant="default">
                {section.cta_text}{section.cta_url ? ` → ${section.cta_url}` : ""}
              </Badge>
            </div>
          )}
          {!hasAnyText && !section.image_url && (
            <div className="text-xs italic opacity-70">
              No content yet — add a headline, body, or image above.
            </div>
          )}

          {section.section_type === "inventory_collection" && (
            <div className="text-xs opacity-80 pt-2">
              Collection: {collections.find((c) => c.id === s.collection_id)?.name ?? <em>not set</em>}
              {" · "}Max: {s.limit ?? 8}
            </div>
          )}
          {section.section_type === "faq" && Array.isArray(s.items) && s.items.length > 0 && (
            <ul className="text-sm list-disc pl-5 space-y-1 pt-2">
              {s.items.map((it: any, i: number) => (
                <li key={i}><strong>{it.question || "—"}</strong>: {it.answer}</li>
              ))}
            </ul>
          )}
          {section.section_type === "card_grid" && Array.isArray(s.cards) && s.cards.length > 0 && (
            <div className="grid gap-2 md:grid-cols-3 pt-2">
              {s.cards.map((c: any, i: number) => (
                <div key={i} className="rounded border bg-background/90 text-foreground p-2 text-xs">
                  {c.image_url && (
                    <img src={c.image_url} alt="" className="h-20 w-full rounded object-cover mb-1" />
                  )}
                  <div className="font-medium">{c.title || "—"}</div>
                  <div className="text-muted-foreground line-clamp-2">{c.description}</div>
                </div>
              ))}
            </div>
          )}
          {section.section_type === "stats" && Array.isArray(s.stats) && s.stats.length > 0 && (
            <div className="flex flex-wrap gap-6 pt-2">
              {s.stats.map((st: any, i: number) => (
                <div key={i}>
                  <div className="text-2xl font-semibold">{st.value}</div>
                  <div className="text-xs opacity-80">{st.label}</div>
                </div>
              ))}
            </div>
          )}
          {section.section_type === "custom_html" && (
            <pre className="text-xs whitespace-pre-wrap break-all bg-background/90 text-foreground rounded p-2 max-h-40 overflow-auto">
              {s.html ?? ""}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
