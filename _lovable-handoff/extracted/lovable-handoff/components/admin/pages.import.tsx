import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, ArrowRight, Loader2, Plus, Trash2, ChevronUp, ChevronDown,
  Globe, ClipboardPaste, AlertTriangle, Code2, Image as ImageIcon, Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  draftFromText, draftFromScrape, newDraft,
  LAYOUT_VARIANTS,
  type SectionDraft, type SectionType, type ScrapeResult,
} from "@/lib/page-importer";
import { parseHtml } from "@/lib/html-extract";

export const Route = createFileRoute("/_authenticated/pages/import")({
  component: ImportPage,
});

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "text_block", label: "Text Block" },
  { value: "image_text", label: "Image + Text" },
  { value: "split_feature", label: "Split Feature" },
  { value: "cta_band", label: "CTA Band" },
  { value: "faq", label: "FAQ" },
  { value: "stats", label: "Stats" },
  { value: "card_grid", label: "Card Grid" },
  { value: "inventory_collection", label: "Inventory Collection" },
  { value: "form", label: "Form" },
  { value: "locations", label: "Locations" },
  { value: "custom_html", label: "Custom HTML" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Step = 1 | 2 | 3;
type Mode = "scrape" | "html" | "screenshot";

function ImportPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);

  const [mode, setMode] = useState<Mode>("scrape");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [notes, setNotes] = useState("");
  const [rawHtml, setRawHtml] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeData, setScrapeData] = useState<ScrapeResult | null>(null);
  const [htmlParsed, setHtmlParsed] = useState<ScrapeResult | null>(null);

  const [drafts, setDrafts] = useState<SectionDraft[]>([]);

  const scrape = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/import-page-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error || "Scrape failed");
      return j.data as ScrapeResult;
    },
    onSuccess: (d) => {
      setScrapeData(d);
      setScrapeError(null);
      if (!pageTitle && d.title) {
        setPageTitle(d.title);
        if (!slug) setSlug(slugify(d.title));
      }
      toast.success("Page scraped");
    },
    onError: (e: any) => { setScrapeError(e.message); setScrapeData(null); },
  });

  function parseRawHtml() {
    if (!rawHtml.trim()) return;
    try {
      const parsed = parseHtml(rawHtml, sourceUrl || undefined);
      setHtmlParsed(parsed);
      if (!pageTitle && parsed.title) {
        setPageTitle(parsed.title);
        if (!slug) setSlug(slugify(parsed.title));
      }
      toast.success("HTML parsed");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to parse HTML");
    }
  }

  const uploadScreenshot = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() || "png";
      const path = `imports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("import-screenshots")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("import-screenshots").getPublicUrl(path);
      return data.publicUrl;
    },
    onSuccess: (url) => { setScreenshotUrl(url); toast.success("Screenshot uploaded"); },
    onError: (e: any) => toast.error(e.message ?? "Upload failed"),
  });

  function goToReview() {
    if (!pageTitle.trim()) return toast.error("Page title is required");
    const finalSlug = slug || slugify(pageTitle);
    if (!finalSlug) return toast.error("Slug is required");
    setSlug(finalSlug);

    let built: SectionDraft[] = [];
    if (mode === "scrape" && scrapeData) built = draftFromScrape(scrapeData);
    if (mode === "html" && htmlParsed) built = draftFromScrape(htmlParsed);
    if (mode === "screenshot") {
      built = draftFromText(notes, { screenshotUrl: screenshotUrl || undefined });
    } else if (notes.trim()) {
      const extra = draftFromText(notes).map((d, i) => ({
        ...d, sort_order: (built.length + i + 1) * 10,
      }));
      built = [...built, ...extra];
    }
    if (!built.length) built = [newDraft(10, "hero")];

    if (sourceUrl && built[0]) {
      built[0].settings = { ...built[0].settings, source_url: sourceUrl };
    }
    if (screenshotUrl && built[0]) {
      built[0].settings = { ...built[0].settings, screenshot_ref: screenshotUrl };
    }
    setDrafts(renumber(built));
    setStep(2);
  }

  const create = useMutation({
    mutationFn: async () => {
      const { data: page, error } = await supabase
        .from("site_pages")
        .insert({
          title: pageTitle.trim(),
          slug: slug || slugify(pageTitle),
          status: "draft",
          meta_description:
            scrapeData?.metaDescription ?? htmlParsed?.metaDescription ?? null,
        })
        .select("id").single();
      if (error) throw error;

      const rows = drafts.map((d) => ({
        page_id: page.id,
        section_type: d.section_type,
        layout_variant: d.layout_variant ?? null,
        eyebrow: d.eyebrow || null,
        headline: d.headline || null,
        subheadline: d.subheadline || null,
        body: d.body || null,
        image_url: d.image_url || null,
        cta_text: d.cta_text || null,
        cta_url: d.cta_url || null,
        sort_order: d.sort_order,
        settings: {
          ...(d.settings ?? {}),
          ...(sourceUrl ? { source_url: sourceUrl } : {}),
          ...(screenshotUrl ? { screenshot_ref: screenshotUrl } : {}),
        },
      }));
      if (rows.length) {
        const { error: e2 } = await supabase.from("page_sections").insert(rows);
        if (e2) throw e2;
      }
      return page.id as string;
    },
    onSuccess: (id) => {
      toast.success("Page created as draft");
      nav({ to: "/pages/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Import Page"
        description="Visual Structure Importer — translate an old page into Frontier-styled sections. Imports are saved as drafts."
        action={
          <Button variant="outline" asChild>
            <Link to="/pages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages</Link>
          </Button>
        }
      />

      <Stepper step={step} />

      {step === 1 && (
        <Step1
          mode={mode} setMode={setMode}
          sourceUrl={sourceUrl} setSourceUrl={setSourceUrl}
          pageTitle={pageTitle}
          setPageTitle={(v) => { setPageTitle(v); if (!slug) setSlug(slugify(v)); }}
          slug={slug} setSlug={setSlug}
          notes={notes} setNotes={setNotes}
          rawHtml={rawHtml} setRawHtml={setRawHtml}
          onParseHtml={parseRawHtml} htmlParsed={htmlParsed}
          screenshotUrl={screenshotUrl} setScreenshotUrl={setScreenshotUrl}
          onUploadScreenshot={(f) => uploadScreenshot.mutate(f)}
          uploadingShot={uploadScreenshot.isPending}
          onScrape={() => scrape.mutate()}
          scraping={scrape.isPending}
          scrapeError={scrapeError} scrapeData={scrapeData}
          onNext={goToReview}
        />
      )}

      {step === 2 && (
        <Step2
          drafts={drafts} setDrafts={setDrafts}
          onBack={() => setStep(1)} onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3
          pageTitle={pageTitle} slug={slug} drafts={drafts}
          sourceUrl={sourceUrl} screenshotUrl={screenshotUrl}
          onBack={() => setStep(2)}
          onCreate={() => create.mutate()}
          creating={create.isPending}
        />
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Source" },
    { n: 2, label: "Review Sections" },
    { n: 3, label: "Create Page" },
  ];
  return (
    <ol className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.n} className="flex items-center gap-2">
          <div className={
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold " +
            (step === s.n ? "bg-primary text-primary-foreground"
              : step > s.n ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground")
          }>{s.n}</div>
          <span className={"text-sm " + (step === s.n ? "font-semibold" : "text-muted-foreground")}>{s.label}</span>
          {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function Step1(props: {
  mode: Mode; setMode: (m: Mode) => void;
  sourceUrl: string; setSourceUrl: (v: string) => void;
  pageTitle: string; setPageTitle: (v: string) => void;
  slug: string; setSlug: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  rawHtml: string; setRawHtml: (v: string) => void;
  onParseHtml: () => void; htmlParsed: ScrapeResult | null;
  screenshotUrl: string; setScreenshotUrl: (v: string) => void;
  onUploadScreenshot: (f: File) => void; uploadingShot: boolean;
  onScrape: () => void; scraping: boolean;
  scrapeError: string | null; scrapeData: ScrapeResult | null;
  onNext: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-4">
      <SectionCard title="Page details">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Page Title</Label>
            <Input value={props.pageTitle} onChange={(e) => props.setPageTitle(e.target.value)} placeholder="About Us" />
          </div>
          <div className="space-y-1">
            <Label>Desired Slug</Label>
            <Input value={props.slug} onChange={(e) => props.setSlug(slugify(e.target.value))} placeholder="about-us" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Import method">
        <Tabs value={props.mode} onValueChange={(v) => props.setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="scrape"><Globe className="mr-2 h-4 w-4" /> URL scrape</TabsTrigger>
            <TabsTrigger value="html"><Code2 className="mr-2 h-4 w-4" /> Raw HTML paste</TabsTrigger>
            <TabsTrigger value="screenshot"><ImageIcon className="mr-2 h-4 w-4" /> Screenshot + notes</TabsTrigger>
          </TabsList>

          {/* URL SCRAPE */}
          <TabsContent value="scrape" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label>Source URL</Label>
              <div className="flex gap-2">
                <Input value={props.sourceUrl} onChange={(e) => props.setSourceUrl(e.target.value)} placeholder="https://example.com/about" />
                <Button onClick={props.onScrape} disabled={!props.sourceUrl || props.scraping}>
                  {props.scraping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                  Scrape
                </Button>
              </div>
            </div>
            {props.scrapeError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <div>
                  <div className="font-medium">Couldn't scrape this URL</div>
                  <div className="text-muted-foreground">{props.scrapeError}</div>
                  <div className="mt-1 text-xs">Try <b>Raw HTML paste</b> (open the page, View Source, paste) or <b>Screenshot + notes</b>.</div>
                </div>
              </div>
            )}
            {props.scrapeData && <ScrapeSummary data={props.scrapeData} />}
            <div className="space-y-1">
              <Label>Extra notes (optional)</Label>
              <Textarea value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="Append additional copy after scraped content…" className="min-h-[100px]" />
            </div>
          </TabsContent>

          {/* RAW HTML */}
          <TabsContent value="html" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label>Source URL (optional)</Label>
              <Input value={props.sourceUrl} onChange={(e) => props.setSourceUrl(e.target.value)} placeholder="https://example.com/about — used to resolve image paths" />
            </div>
            <div className="space-y-1">
              <Label>Paste raw HTML</Label>
              <Textarea value={props.rawHtml} onChange={(e) => props.setRawHtml(e.target.value)} placeholder="View page source, copy &lt;html&gt;…&lt;/html&gt;, paste here." className="min-h-[220px] font-mono text-xs" />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={props.onParseHtml} disabled={!props.rawHtml.trim()}>
                  <Code2 className="mr-2 h-4 w-4" /> Parse HTML
                </Button>
                {props.htmlParsed && <span className="text-xs text-muted-foreground">Parsed ✓</span>}
              </div>
            </div>
            {props.htmlParsed && <ScrapeSummary data={props.htmlParsed} />}
          </TabsContent>

          {/* SCREENSHOT */}
          <TabsContent value="screenshot" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label>Screenshot</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef} type="file" accept="image/*" hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) props.onUploadScreenshot(f);
                    e.target.value = "";
                  }}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={props.uploadingShot}>
                  {props.uploadingShot ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload screenshot
                </Button>
                <Input value={props.screenshotUrl} onChange={(e) => props.setScreenshotUrl(e.target.value)} placeholder="…or paste an image URL" />
              </div>
              {props.screenshotUrl && (
                <div className="mt-2 overflow-hidden rounded-md border bg-muted/30">
                  <img src={props.screenshotUrl} alt="Screenshot reference" className="max-h-72 w-full object-contain" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">The screenshot is stored on the import draft for reference. (Phase 3: AI will read the layout directly.)</p>
            </div>
            <div className="space-y-1">
              <Label>Layout notes & copy</Label>
              <Textarea
                value={props.notes}
                onChange={(e) => props.setNotes(e.target.value)}
                placeholder={"Describe the layout top→bottom. First line becomes the hero headline.\n\ne.g.\nFamily-Owned Since 1939\nFour generations serving South Texas\nIntegrity: We do the right thing every time\nQuality: We never compromise on inspection\nDo you offer financing? Yes, all credit considered.\n3805 W Highway 90, Hondo, TX 78861"}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Section suggestions are built from your notes + screenshot reference (image_background hero).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={props.onNext}>
          Next: Review Sections <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ScrapeSummary({ data }: { data: ScrapeResult }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs">
      <div className="mb-1 font-semibold text-sm">Parsed preview</div>
      <div><b>Title:</b> {data.title || "—"}</div>
      <div><b>H1:</b> {data.h1.length} • <b>H2:</b> {data.h2.length} • <b>H3:</b> {data.h3.length}</div>
      <div><b>Paragraphs:</b> {data.paragraphs.length} • <b>Images:</b> {data.images.length} • <b>Links:</b> {data.links.length}</div>
    </div>
  );
}

function renumber(list: SectionDraft[]): SectionDraft[] {
  return list.map((d, i) => ({ ...d, sort_order: (i + 1) * 10 }));
}

function Step2({
  drafts, setDrafts, onBack, onNext,
}: {
  drafts: SectionDraft[]; setDrafts: (d: SectionDraft[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function update(key: string, patch: Partial<SectionDraft>) {
    setDrafts(drafts.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }
  function move(key: string, dir: -1 | 1) {
    const idx = drafts.findIndex((d) => d.key === key);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= drafts.length) return;
    const next = [...drafts];
    [next[idx], next[j]] = [next[j], next[idx]];
    setDrafts(renumber(next));
  }
  function remove(key: string) { setDrafts(renumber(drafts.filter((d) => d.key !== key))); }
  function add() { setDrafts(renumber([...drafts, newDraft((drafts.length + 1) * 10)])); }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        Each suggestion below is a Frontier section draft. Change type, swap layout variant, edit copy, reorder, or delete. Nothing is saved until Step 3.
      </div>

      <div className="space-y-4">
        {drafts.map((d, i) => (
          <DraftCard
            key={d.key}
            draft={d} index={i} total={drafts.length}
            onChange={(patch) => update(d.key, patch)}
            onMoveUp={() => move(d.key, -1)}
            onMoveDown={() => move(d.key, 1)}
            onDelete={() => remove(d.key)}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" /> Add Section</Button>
          <Button onClick={onNext} disabled={!drafts.length}>
            Next: Create Page <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DraftCard({
  draft, index, total, onChange, onMoveUp, onMoveDown, onDelete,
}: {
  draft: SectionDraft;
  index: number; total: number;
  onChange: (patch: Partial<SectionDraft>) => void;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
}) {
  const variants = LAYOUT_VARIANTS[draft.section_type] ?? [];
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <Badge variant="outline" className="font-mono">{index + 1}</Badge>
        <Select
          value={draft.section_type}
          onValueChange={(v) => {
            const t = v as SectionType;
            const def = LAYOUT_VARIANTS[t]?.[0];
            onChange({ section_type: t, layout_variant: def });
          }}
        >
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {variants.length > 0 && (
          <Select
            value={draft.layout_variant ?? variants[0]}
            onValueChange={(v) => onChange({ layout_variant: v })}
          >
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Layout variant" /></SelectTrigger>
            <SelectContent>
              {variants.map((v) => <SelectItem key={v} value={v}>{v.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={index === total - 1}><ChevronDown className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Visual Frontier-styled preview */}
      <SectionPreview draft={draft} />

      {/* Inline editor */}
      <div className="grid gap-2 border-t p-3 md:grid-cols-2">
        <Field label="Eyebrow"><Input value={draft.eyebrow ?? ""} onChange={(e) => onChange({ eyebrow: e.target.value })} /></Field>
        <Field label="Headline"><Input value={draft.headline ?? ""} onChange={(e) => onChange({ headline: e.target.value })} /></Field>
        <Field label="Subheadline" className="md:col-span-2"><Input value={draft.subheadline ?? ""} onChange={(e) => onChange({ subheadline: e.target.value })} /></Field>
        <Field label="Body" className="md:col-span-2"><Textarea rows={3} value={draft.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} /></Field>
        <Field label="Image URL"><Input value={draft.image_url ?? ""} onChange={(e) => onChange({ image_url: e.target.value })} placeholder="https://…" /></Field>
        <Field label="CTA Text"><Input value={draft.cta_text ?? ""} onChange={(e) => onChange({ cta_text: e.target.value })} /></Field>
        <Field label="CTA URL" className="md:col-span-2"><Input value={draft.cta_url ?? ""} onChange={(e) => onChange({ cta_url: e.target.value })} placeholder="/inventory" /></Field>
        <SettingsField draft={draft} onChange={onChange} />
      </div>
    </div>
  );
}

function SettingsField({
  draft, onChange,
}: { draft: SectionDraft; onChange: (patch: Partial<SectionDraft>) => void }) {
  const [text, setText] = useState(() => JSON.stringify(draft.settings ?? {}, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <Field label="Settings (JSON)" className="md:col-span-2">
      <Textarea
        rows={4} className="font-mono text-xs" value={text}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange({ settings: JSON.parse(e.target.value || "{}") }); setErr(null); }
          catch (er: any) { setErr(er.message); }
        }}
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
    </Field>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1 " + (className ?? "")}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ---------- Frontier-styled section previews ----------

function SectionPreview({ draft }: { draft: SectionDraft }) {
  const s = draft.settings ?? {};
  switch (draft.section_type) {
    case "hero":
      return <HeroPreview draft={draft} />;
    case "image_text":
    case "split_feature":
      return <ImageTextPreview draft={draft} />;
    case "card_grid":
      return <CardGridPreview draft={draft} cards={Array.isArray(s.cards) ? s.cards : []} />;
    case "cta_band":
      return <CtaPreview draft={draft} />;
    case "faq":
      return <FaqPreview items={Array.isArray(s.items) ? s.items : []} headline={draft.headline} />;
    case "locations":
      return <LocationsPreview locations={Array.isArray(s.locations) ? s.locations : []} headline={draft.headline} />;
    case "stats":
      return <div className="p-6 text-center text-sm text-muted-foreground">Stats section preview</div>;
    default:
      return <TextBlockPreview draft={draft} />;
  }
}

function HeroPreview({ draft }: { draft: SectionDraft }) {
  const variant = draft.layout_variant ?? "centered";
  if (variant === "image_background") {
    return (
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        {draft.image_url && <img src={draft.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
          {draft.eyebrow && <div className="text-xs uppercase tracking-widest opacity-80">{draft.eyebrow}</div>}
          <div className="text-2xl font-semibold">{draft.headline || "Hero headline"}</div>
          {draft.subheadline && <div className="mt-1 max-w-2xl text-sm opacity-90">{draft.subheadline}</div>}
        </div>
      </div>
    );
  }
  if (variant === "split") {
    return (
      <div className="grid grid-cols-2 gap-0">
        <div className="space-y-2 bg-background p-6">
          {draft.eyebrow && <div className="text-xs uppercase tracking-widest text-primary">{draft.eyebrow}</div>}
          <div className="text-2xl font-semibold">{draft.headline || "Hero headline"}</div>
          {draft.subheadline && <div className="text-sm text-muted-foreground">{draft.subheadline}</div>}
        </div>
        <div className="bg-muted">
          {draft.image_url
            ? <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">image</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 bg-background p-8 text-center">
      {draft.eyebrow && <div className="text-xs uppercase tracking-widest text-primary">{draft.eyebrow}</div>}
      <div className="text-3xl font-semibold">{draft.headline || "Hero headline"}</div>
      {draft.subheadline && <div className="mx-auto max-w-2xl text-sm text-muted-foreground">{draft.subheadline}</div>}
    </div>
  );
}

function ImageTextPreview({ draft }: { draft: SectionDraft }) {
  const right = draft.layout_variant === "image_right" || draft.layout_variant === "video_right";
  const Img = (
    <div className="bg-muted">
      {draft.image_url
        ? <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
        : <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">image</div>}
    </div>
  );
  const Txt = (
    <div className="space-y-2 p-6">
      {draft.eyebrow && <div className="text-xs uppercase tracking-widest text-primary">{draft.eyebrow}</div>}
      <div className="text-xl font-semibold">{draft.headline || "Section headline"}</div>
      {draft.body && <p className="line-clamp-4 text-sm text-muted-foreground">{draft.body}</p>}
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {right ? <>{Txt}{Img}</> : <>{Img}{Txt}</>}
    </div>
  );
}

function TextBlockPreview({ draft }: { draft: SectionDraft }) {
  const centered = (draft.layout_variant ?? "centered") === "centered";
  return (
    <div className={"space-y-2 p-6 " + (centered ? "text-center" : "")}>
      {draft.headline && <div className="text-xl font-semibold">{draft.headline}</div>}
      {draft.body && <p className={"text-sm text-muted-foreground " + (centered ? "mx-auto max-w-2xl" : "max-w-2xl")}>{draft.body}</p>}
      {!draft.headline && !draft.body && <div className="text-xs text-muted-foreground">Empty text block</div>}
    </div>
  );
}

function CardGridPreview({
  draft, cards,
}: { draft: SectionDraft; cards: Array<{ title?: string; description?: string }> }) {
  const v = draft.layout_variant ?? "feature_cards";
  return (
    <div className="space-y-3 p-6">
      {draft.headline && <div className="text-center text-xl font-semibold">{draft.headline}</div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {(cards.length ? cards : [{ title: "Card 1" }, { title: "Card 2" }, { title: "Card 3" }]).slice(0, 6).map((c, i) => (
          <div key={i} className={
            "rounded-md border p-3 " +
            (v === "values" ? "bg-primary/5" : v === "icon_cards" ? "text-center" : "bg-card")
          }>
            <div className="text-sm font-semibold">{c.title || `Card ${i + 1}`}</div>
            {c.description && <div className="mt-1 line-clamp-3 text-xs text-muted-foreground">{c.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaPreview({ draft }: { draft: SectionDraft }) {
  const v = draft.layout_variant ?? "centered";
  const dark = v === "dark_band";
  return (
    <div className={
      "flex flex-col items-center gap-3 p-6 text-center " +
      (dark ? "bg-foreground text-background" : "bg-primary/5")
    }>
      <div className="text-xl font-semibold">{draft.headline || "Ready to get started?"}</div>
      {draft.subheadline && <div className="text-sm opacity-80">{draft.subheadline}</div>}
      {draft.cta_text && (
        <div className={
          "rounded-md px-4 py-2 text-sm font-medium " +
          (dark ? "bg-background text-foreground" : "bg-primary text-primary-foreground")
        }>{draft.cta_text}</div>
      )}
    </div>
  );
}

function FaqPreview({ items, headline }: { items: Array<{ question: string; answer: string }>; headline?: string }) {
  return (
    <div className="space-y-3 p-6">
      {headline && <div className="text-xl font-semibold">{headline}</div>}
      <div className="divide-y rounded-md border">
        {(items.length ? items : [{ question: "Question?", answer: "Answer." }]).slice(0, 4).map((it, i) => (
          <div key={i} className="p-3">
            <div className="text-sm font-medium">{it.question}</div>
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationsPreview({ locations, headline }: { locations: Array<{ address?: string; name?: string }>; headline?: string }) {
  return (
    <div className="space-y-3 p-6">
      {headline && <div className="text-xl font-semibold">{headline}</div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(locations.length ? locations : [{ address: "123 Main St, City, ST 00000" }]).slice(0, 4).map((l, i) => (
          <div key={i} className="rounded-md border p-3">
            {l.name && <div className="text-sm font-semibold">{l.name}</div>}
            <div className="text-xs text-muted-foreground">{l.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3({
  pageTitle, slug, drafts, sourceUrl, screenshotUrl, onBack, onCreate, creating,
}: {
  pageTitle: string; slug: string; drafts: SectionDraft[];
  sourceUrl: string; screenshotUrl: string;
  onBack: () => void; onCreate: () => void; creating: boolean;
}) {
  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    drafts.forEach((d) => {
      const k = d.layout_variant ? `${d.section_type}/${d.layout_variant}` : d.section_type;
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return counts;
  }, [drafts]);

  return (
    <div className="space-y-4">
      <SectionCard title="Ready to create">
        <div className="grid gap-2 text-sm">
          <div><b>Title:</b> {pageTitle}</div>
          <div><b>Slug:</b> <code className="text-xs">/{slug}</code></div>
          {sourceUrl && <div><b>Source:</b> <span className="text-xs text-muted-foreground">{sourceUrl}</span></div>}
          {screenshotUrl && <div><b>Screenshot:</b> <a className="text-xs text-primary underline" href={screenshotUrl} target="_blank" rel="noreferrer">view</a></div>}
          <div><b>Status:</b> <Badge variant="outline">DRAFT</Badge> <span className="text-xs text-muted-foreground">(imported pages never auto-publish)</span></div>
          <div className="flex flex-wrap gap-1 pt-2">
            {Object.entries(summary).map(([t, c]) => (
              <Badge key={t} variant="secondary">{t} × {c}</Badge>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={creating}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onCreate} disabled={creating}>
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Page as Draft
        </Button>
      </div>
    </div>
  );
}
