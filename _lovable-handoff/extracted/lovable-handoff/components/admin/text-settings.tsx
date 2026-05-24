import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/text-settings")({
  component: TextSettingsPage,
});

type TextSetting = {
  id: string;
  text_key: string;
  label_en: string | null;
  label_es: string | null;
  category: string | null;
};

function TextSettingsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<TextSetting | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal_text_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_text_settings")
        .select("id, text_key, label_en, label_es, category")
        .order("category", { ascending: true })
        .order("text_key", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TextSetting[];
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of data ?? []) set.add((r.category ?? "uncategorized").toLowerCase());
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      const cat = (r.category ?? "uncategorized").toLowerCase();
      if (category !== "all" && cat !== category) return false;
      if (!q) return true;
      return (
        r.text_key?.toLowerCase().includes(q) ||
        r.label_en?.toLowerCase().includes(q) ||
        r.label_es?.toLowerCase().includes(q)
      );
    });
  }, [data, search, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, TextSetting[]>();
    for (const r of filtered) {
      const k = (r.category ?? "uncategorized").toLowerCase();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return new Map(Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)));
  }, [filtered]);

  const save = useMutation({
    mutationFn: async (input: { id: string; label_en: string; label_es: string }) => {
      const { error } = await supabase
        .from("portal_text_settings")
        .update({ label_en: input.label_en, label_es: input.label_es })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["portal_text_settings"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Text Settings" />
        <EmptyState title="Admin only" hint="You need the admin role to manage text settings." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Portal Text Settings"
        description="Manage bilingual text labels used throughout the portal."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by key or label…"
            className="pl-8"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <EmptyState title="Failed to load" hint={(error as Error).message} />
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No text settings" hint="The portal_text_settings table is empty." />
      ) : (
        <Accordion
          type="multiple"
          defaultValue={Array.from(grouped.keys())}
          className="rounded-md border bg-card"
        >
          {Array.from(grouped.entries()).map(([groupKey, rows]) => (
            <AccordionItem key={groupKey} value={groupKey} className="border-b last:border-b-0">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {groupKey}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {rows.length}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Key</th>
                        <th className="px-4 py-2 text-left">English</th>
                        <th className="px-4 py-2 text-left">Spanish</th>
                        <th className="w-12 px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs">{r.text_key}</td>
                          <td className="px-4 py-2">{r.label_en || <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-2 text-muted-foreground">{r.label_es || "—"}</td>
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
  row: TextSetting | null;
  onClose: () => void;
  onSave: (v: { id: string; label_en: string; label_es: string }) => void;
  saving: boolean;
}) {
  const [en, setEn] = useState("");
  const [es, setEs] = useState("");

  useEffect(() => {
    setEn(row?.label_en ?? "");
    setEs(row?.label_es ?? "");
  }, [row?.id]);

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit text</DialogTitle>
        </DialogHeader>
        {row && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Key</Label>
              <Input value={row.text_key} disabled className="font-mono text-xs" />
              <p className="mt-1 text-xs text-muted-foreground">text_key cannot be changed.</p>
            </div>
            <div>
              <Label className="text-xs">Label (English)</Label>
              <Textarea value={en} onChange={(e) => setEn(e.target.value)} rows={3} />
            </div>
            <div>
              <Label className="text-xs">Label (Spanish)</Label>
              <Textarea value={es} onChange={(e) => setEs(e.target.value)} rows={3} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => row && onSave({ id: row.id, label_en: en, label_es: es })}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
