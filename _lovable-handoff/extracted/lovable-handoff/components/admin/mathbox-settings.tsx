import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mathbox-settings")({
  component: MathBoxSettingsPage,
});

type Group = "standard" | "discounts" | "conditional" | "fees" | "final";
type LineType = "charge" | "discount" | "subtotal" | "final" | "info";
type AppliesTo = "new" | "used" | "all";

type Line = {
  id: string;
  line_key: string;
  label: string;
  group_name: Group;
  line_type: LineType;
  sort_order: number;
  is_active: boolean;
  is_conditional: boolean;
  applies_to: AppliesTo;
  disclaimer: string | null;
};

const GROUPS: Group[] = ["standard", "discounts", "conditional", "fees", "final"];
const TYPES: LineType[] = ["charge", "discount", "subtotal", "final", "info"];
const APPLIES: AppliesTo[] = ["new", "used", "all"];

const emptyForm = {
  line_key: "",
  label: "",
  group_name: "standard" as Group,
  line_type: "charge" as LineType,
  sort_order: 0,
  is_active: true,
  is_conditional: false,
  applies_to: "all" as AppliesTo,
  disclaimer: "",
};

function MathBoxSettingsPage() {
  const qc = useQueryClient();

  const { data: lines, isLoading } = useQuery({
    queryKey: ["portal_pricing_mathbox_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_pricing_mathbox_config")
        .select("*")
        .order("group_name")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Line[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Line | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    const maxOrder = Math.max(0, ...(lines?.map((l) => l.sort_order) ?? [0]));
    setForm({ ...emptyForm, sort_order: maxOrder + 10 });
    setOpen(true);
  }
  function openEdit(l: Line) {
    setEditing(l);
    setForm({
      line_key: l.line_key,
      label: l.label,
      group_name: l.group_name,
      line_type: l.line_type,
      sort_order: l.sort_order,
      is_active: l.is_active,
      is_conditional: l.is_conditional,
      applies_to: l.applies_to,
      disclaimer: l.disclaimer ?? "",
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        line_key: form.line_key.trim(),
        label: form.label.trim(),
        group_name: form.group_name,
        line_type: form.line_type,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        is_conditional: form.is_conditional,
        applies_to: form.applies_to,
        disclaimer: form.disclaimer.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (!payload.line_key || !payload.label) throw new Error("Key and label required.");
      if (editing) {
        const { error } = await supabase
          .from("portal_pricing_mathbox_config").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portal_pricing_mathbox_config").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["portal_pricing_mathbox_config"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Line> }) => {
      const { error } = await supabase
        .from("portal_pricing_mathbox_config").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_pricing_mathbox_config"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const swap = useMutation({
    mutationFn: async ({ a, b }: { a: Line; b: Line }) => {
      const { error: e1 } = await supabase
        .from("portal_pricing_mathbox_config")
        .update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("portal_pricing_mathbox_config")
        .update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_pricing_mathbox_config"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portal_pricing_mathbox_config").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["portal_pricing_mathbox_config"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sorted = useMemo(
    () => [...(lines ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [lines]
  );

  function moveLine(line: Line, dir: -1 | 1) {
    const i = sorted.findIndex((l) => l.id === line.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    swap.mutate({ a: line, b: sorted[j] });
  }

  return (
    <div>
      <PageHeader
        title="Math Box Settings"
        description="Control how VDP pricing lines are presented. Labels, order, grouping, and visibility only."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> New Line
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit line" : "New line"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Line key</Label>
                  <Input
                    placeholder="e.g. dealer_discount"
                    value={form.line_key}
                    onChange={(e) => setForm({ ...form, line_key: e.target.value })}
                    disabled={!!editing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Stable internal id mapped to the feed value. Cannot change after creation.
                  </p>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Display label</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Group</Label>
                  <Select value={form.group_name} onValueChange={(v) => setForm({ ...form, group_name: v as Group })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Line type</Label>
                  <Select value={form.line_type} onValueChange={(v) => setForm({ ...form, line_type: v as LineType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Applies to</Label>
                  <Select value={form.applies_to} onValueChange={(v) => setForm({ ...form, applies_to: v as AppliesTo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPLIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3 col-span-1">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-3 col-span-1">
                  <Switch checked={form.is_conditional} onCheckedChange={(v) => setForm({ ...form, is_conditional: v })} />
                  <Label>Conditional</Label>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Disclaimer</Label>
                  <Textarea
                    rows={2}
                    value={form.disclaimer}
                    onChange={(e) => setForm({ ...form, disclaimer: e.target.value })}
                    placeholder="Shown beneath this line on the VDP (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={save.isPending} onClick={() => save.mutate()}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p>
          Values are feed-controlled. This panel only changes labels, order, visibility, and disclaimers.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : !sorted.length ? (
            <EmptyState title="No math box lines yet" hint="Add a line to control how a price row appears on the VDP." />
          ) : (
            <div className="rounded-md border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 w-16">Order</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Key</th>
                    <th className="px-3 py-2">Group</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Applies</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2">Cond.</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((l, i) => (
                    <tr key={l.id} className={`border-b last:border-0 ${l.is_active ? "" : "bg-muted/20"}`}>
                      <td className="px-2 py-2">
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => moveLine(l, -1)}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === sorted.length - 1} onClick={() => moveLine(l, 1)}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium">{l.label}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{l.line_key}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{l.group_name}</Badge></td>
                      <td className="px-3 py-2"><Badge variant="outline">{l.line_type}</Badge></td>
                      <td className="px-3 py-2"><Badge variant="outline">{l.applies_to}</Badge></td>
                      <td className="px-3 py-2">
                        <Switch
                          checked={l.is_active}
                          onCheckedChange={(v) => patch.mutate({ id: l.id, values: { is_active: v } })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Switch
                          checked={l.is_conditional}
                          onCheckedChange={(v) => patch.mutate({ id: l.id, values: { is_conditional: v } })}
                        />
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${l.label}"?`)) del.mutate(l.id); }}>
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

        <MathBoxPreview lines={sorted} />
      </div>
    </div>
  );
}

function MathBoxPreview({ lines }: { lines: Line[] }) {
  const visible = lines.filter((l) => l.is_active);
  const byGroup = GROUPS.map((g) => ({ g, items: visible.filter((l) => l.group_name === g) }));

  return (
    <aside className="rounded-md border bg-card p-4 h-fit sticky top-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Preview</h3>
        <p className="text-xs text-muted-foreground">Approximate VDP math box layout. Values are placeholders.</p>
      </div>
      <div className="space-y-3 text-sm">
        {byGroup.map(({ g, items }) =>
          items.length === 0 ? null : (
            <div key={g} className="space-y-1">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{g}</div>
              {items.map((l) => (
                <div key={l.id} className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`truncate ${l.line_type === "final" ? "font-semibold" : ""}`}>
                      {l.label}
                    </span>
                    {l.is_conditional && (
                      <Badge variant="outline" className="text-[10px]">if eligible</Badge>
                    )}
                  </div>
                  <span className={`font-mono tabular-nums ${
                    l.line_type === "discount" ? "text-emerald-600 dark:text-emerald-400"
                    : l.line_type === "final" ? "font-semibold"
                    : l.line_type === "info" ? "text-muted-foreground" : ""
                  }`}>
                    {l.line_type === "discount" ? "−$0,000" : l.line_type === "info" ? "—" : "$00,000"}
                  </span>
                </div>
              ))}
              {g !== "final" && <div className="border-b" />}
            </div>
          )
        )}
        {!visible.length && <div className="text-muted-foreground text-xs">No active lines to preview.</div>}
      </div>
    </aside>
  );
}
