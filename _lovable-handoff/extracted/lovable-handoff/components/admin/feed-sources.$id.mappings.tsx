import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin-ui";
import { Plus, Trash2, ArrowLeft, Save, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/feed-sources/$id/mappings")({
  component: MappingsPage,
});

// Normalized vehicle fields that Smart Collections / inventory queries read from.
const NORMALIZED_FIELDS: { value: string; label: string; hint?: string }[] = [
  { value: "vin", label: "vin" },
  { value: "stock_number", label: "stock_number" },
  { value: "condition", label: "condition", hint: "new, used, cpo" },
  { value: "year", label: "year" },
  { value: "make", label: "make" },
  { value: "model", label: "model" },
  { value: "trim", label: "trim" },
  { value: "body_style", label: "body_style", hint: "SUV, Truck, Sedan, Coupe, etc." },
  { value: "exterior_color", label: "exterior_color" },
  { value: "interior_color", label: "interior_color" },
  { value: "mileage", label: "mileage" },
  { value: "msrp", label: "msrp", hint: "Manufacturer sticker price" },
  { value: "internet_price", label: "internet_price", hint: "Advertised / online selling price" },
  { value: "sale_price", label: "sale_price", hint: "Discounted / special sale price" },
  { value: "days_in_stock", label: "days_in_stock" },
  { value: "primary_image_url", label: "primary_image_url" },
];

// Common CSV headers → normalized field. Pure UI hints; saved mappings are still manual.
const SUGGESTED_MAPPINGS: { source: string; target: string }[] = [
  { source: "VIN", target: "vin" },
  { source: "Stock #", target: "stock_number" },
  { source: "New/Used", target: "condition" },
  { source: "Selling Price / Internet Price / Web Price", target: "internet_price" },
  { source: "MSRP / Sticker", target: "msrp" },
  { source: "Odometer / Mileage", target: "mileage" },
  { source: "Body / Style", target: "body_style" },
  { source: "Photo URL / Image URL", target: "primary_image_url" },
];

function MappingsPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: feed } = useQuery({
    queryKey: ["feed_source", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feed_sources").select("*, stores(name)").eq("id", id).single();
      if (error) throw error; return data;
    },
  });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["mappings", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feed_field_mappings")
        .select("*").eq("feed_source_id", id).order("created_at");
      if (error) throw error;
      return data as { id: string; source_field: string; mapped_field: string }[];
    },
  });

  const [draft, setDraft] = useState<{ source: string; mapped: string }>({ source: "", mapped: "" });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feed_field_mappings").insert({
        feed_source_id: id, source_field: draft.source.trim(), mapped_field: draft.mapped,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Mapping added"); setDraft({ source: "", mapped: "" }); qc.invalidateQueries({ queryKey: ["mappings", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (m: { id: string; source_field: string; mapped_field: string }) => {
      const { error } = await supabase.from("feed_field_mappings")
        .update({ source_field: m.source_field, mapped_field: m.mapped_field }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["mappings", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (rowId: string) => { const { error } = await supabase.from("feed_field_mappings").delete().eq("id", rowId); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["mappings", id] }); },
  });

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-3"><Link to="/feed-sources"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link></Button>
      <PageHeader
        title={`Field Mappings${feed ? ` — ${feed.name}` : ""}`}
        description="Map source feed columns to normalized vehicle fields. Mappings are saved here; the external worker reads them during import."
      />

      {/* Suggested mappings cheat-sheet */}
      <div className="mb-4 rounded-md border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Suggested mappings
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Common CSV headers and the normalized field they usually map to. Click a suggestion to prefill the row below.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTED_MAPPINGS.map((s) => (
            <button
              key={s.source}
              type="button"
              onClick={() => setDraft({ source: s.source.split(" / ")[0], mapped: s.target })}
              className="flex items-center justify-between rounded border bg-background px-3 py-2 text-left text-xs hover:bg-accent"
            >
              <span className="text-muted-foreground">{s.source}</span>
              <span className="ml-3 font-mono text-foreground">→ {s.target}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 w-1/2">Source field (from feed)</th>
              <th className="px-4 py-2 w-1/2">Mapped field (normalized)</th>
              <th className="px-4 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={3} className="px-4 py-6 text-muted-foreground">Loading…</td></tr> :
              rows?.map((r) => <MappingRow key={r.id} row={r} onSave={(n) => update.mutate({ id: r.id, ...n })} onDelete={() => del.mutate(r.id)} />)}
            <tr className="bg-muted/20">
              <td className="px-4 py-2">
                <Input
                  placeholder='Type exact CSV header (e.g. "Stock #")'
                  value={draft.source}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Type it exactly as it appears in your feed.</p>
              </td>
              <td className="px-4 py-2">
                <Select value={draft.mapped} onValueChange={(v) => setDraft({ ...draft, mapped: v })}>
                  <SelectTrigger><SelectValue placeholder="Select target field" /></SelectTrigger>
                  <SelectContent>
                    {NORMALIZED_FIELDS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{f.label}</span>
                          {f.hint && <span className="text-[11px] text-muted-foreground">{f.hint}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2">
                <Button size="icon" disabled={!draft.source.trim() || !draft.mapped || add.isPending} onClick={() => add.mutate()}><Plus className="h-4 w-4" /></Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Mappings are stored in <code>feed_field_mappings</code>. Feeds are processed by the external worker — nothing is imported from this page.
      </p>
    </div>
  );
}

function MappingRow({ row, onSave, onDelete }: { row: { id: string; source_field: string; mapped_field: string }; onSave: (n: { source_field: string; mapped_field: string }) => void; onDelete: () => void }) {
  const [source, setSource] = useState(row.source_field);
  const [mapped, setMapped] = useState(row.mapped_field);
  const dirty = source !== row.source_field || mapped !== row.mapped_field;
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-2"><Input value={source} onChange={(e) => setSource(e.target.value)} /></td>
      <td className="px-4 py-2">
        <Select value={mapped} onValueChange={setMapped}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {NORMALIZED_FIELDS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                <div className="flex flex-col">
                  <span className="font-mono text-xs">{f.label}</span>
                  {f.hint && <span className="text-[11px] text-muted-foreground">{f.hint}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {dirty && <Button size="icon" variant="ghost" onClick={() => onSave({ source_field: source, mapped_field: mapped })}><Save className="h-4 w-4" /></Button>}
        <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </td>
    </tr>
  );
}
