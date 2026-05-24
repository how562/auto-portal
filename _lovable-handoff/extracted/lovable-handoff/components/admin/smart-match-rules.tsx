import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/smart-match-rules")({
  component: SmartMatchRulesPage,
});

type Rule = {
  id: string;
  key: string | null;
  label_en: string | null;
  label_es: string | null;
  body_styles: string[] | null;
  makes: string[] | null;
  model_keywords: string[] | null;
  trim_keywords: string[] | null;
  min_price: number | null;
  max_price: number | null;
  condition: string | null;
  priority: number | null;
  is_active: boolean | null;
};

const CONDITIONS = ["any", "new", "used", "certified"];

function toCsv(arr: string[] | null | undefined): string {
  return (arr ?? []).join(", ");
}
function fromCsv(s: string): string[] {
  return s.split(",").map((v) => v.trim()).filter(Boolean);
}

function SmartMatchRulesPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Rule | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["smart_match_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smart_match_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Rule[];
    },
  });

  const rows = useMemo(() => data ?? [], [data]);

  const save = useMutation({
    mutationFn: async (input: Partial<Rule> & { id: string }) => {
      const { id, ...rest } = input;
      const { error } = await supabase
        .from("smart_match_rules")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["smart_match_rules"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (input: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("smart_match_rules")
        .update({ is_active: input.is_active })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["smart_match_rules"] }),
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Smart Match Rules" />
        <EmptyState title="Admin only" hint="You need the admin role to manage smart match rules." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Smart Match Rules"
        description="Tune which vehicles surface for each lifestyle (Family, Work, Luxury, Budget, First Vehicle, Efficient)."
      />

      {error ? (
        <EmptyState title="Failed to load" hint={(error as Error).message} />
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No rules" hint="The smart_match_rules table is empty." />
      ) : (
        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Label (EN)</th>
                <th className="px-4 py-2 text-left">Label (ES)</th>
                <th className="px-4 py-2 text-left">Body styles</th>
                <th className="px-4 py-2 text-left">Makes</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Condition</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="w-12 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">{r.key ?? "—"}</td>
                  <td className="px-4 py-2">{r.label_en || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.label_es || "—"}</td>
                  <td className="px-4 py-2 text-xs">{toCsv(r.body_styles) || "—"}</td>
                  <td className="px-4 py-2 text-xs">{toCsv(r.makes) || "—"}</td>
                  <td className="px-4 py-2 text-xs">
                    {r.min_price ?? "—"} – {r.max_price ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-xs">{r.condition ?? "any"}</td>
                  <td className="px-4 py-2">{r.priority ?? 0}</td>
                  <td className="px-4 py-2">
                    <Switch
                      checked={!!r.is_active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: r.id, is_active: v })}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(r)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSave={(v) => save.mutate(v)}
        saving={save.isPending}
      />
    </div>
  );
}

function EditDialog({
  row,
  onClose,
  onSave,
  saving,
}: {
  row: Rule | null;
  onClose: () => void;
  onSave: (v: Partial<Rule> & { id: string }) => void;
  saving: boolean;
}) {
  const [labelEn, setLabelEn] = useState("");
  const [labelEs, setLabelEs] = useState("");
  const [bodyStyles, setBodyStyles] = useState("");
  const [makes, setMakes] = useState("");
  const [modelKeywords, setModelKeywords] = useState("");
  const [trimKeywords, setTrimKeywords] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("any");
  const [priority, setPriority] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!row) return;
    setLabelEn(row.label_en ?? "");
    setLabelEs(row.label_es ?? "");
    setBodyStyles(toCsv(row.body_styles));
    setMakes(toCsv(row.makes));
    setModelKeywords(toCsv(row.model_keywords));
    setTrimKeywords(toCsv(row.trim_keywords));
    setMinPrice(row.min_price?.toString() ?? "");
    setMaxPrice(row.max_price?.toString() ?? "");
    setCondition(row.condition ?? "any");
    setPriority(row.priority?.toString() ?? "0");
    setIsActive(!!row.is_active);
  }, [row?.id]);

  const handleSave = () => {
    if (!row) return;
    onSave({
      id: row.id,
      label_en: labelEn,
      label_es: labelEs,
      body_styles: fromCsv(bodyStyles),
      makes: fromCsv(makes),
      model_keywords: fromCsv(modelKeywords),
      trim_keywords: fromCsv(trimKeywords),
      min_price: minPrice ? Number(minPrice) : null,
      max_price: maxPrice ? Number(maxPrice) : null,
      condition,
      priority: Number(priority) || 0,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit smart match rule</DialogTitle>
        </DialogHeader>
        {row && (
          <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-2 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-xs">Key</Label>
              <Input value={row.key ?? ""} disabled className="font-mono text-xs" />
            </div>
            <div>
              <Label className="text-xs">Label (English)</Label>
              <Input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Label (Spanish)</Label>
              <Input value={labelEs} onChange={(e) => setLabelEs(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Body styles (comma-separated)</Label>
              <Input value={bodyStyles} onChange={(e) => setBodyStyles(e.target.value)} placeholder="SUV, Truck, Sedan" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Makes (comma-separated)</Label>
              <Input value={makes} onChange={(e) => setMakes(e.target.value)} placeholder="Ford, Chevrolet, Toyota" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Model keywords (comma-separated)</Label>
              <Input value={modelKeywords} onChange={(e) => setModelKeywords(e.target.value)} placeholder="Explorer, Tahoe" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Trim keywords (comma-separated)</Label>
              <Input value={trimKeywords} onChange={(e) => setTrimKeywords(e.target.value)} placeholder="Limited, Platinum" />
            </div>
            <div>
              <Label className="text-xs">Min price</Label>
              <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Max price</Label>
              <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="is_active" />
              <Label htmlFor="is_active" className="text-xs">Active</Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
