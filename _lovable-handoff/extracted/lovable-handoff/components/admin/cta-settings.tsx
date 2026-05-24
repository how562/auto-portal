import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/_authenticated/cta-settings")({
  component: CtaSettingsPage,
});

type Cta = {
  id: string;
  cta_key: string;
  label: string | null;
  sublabel: string | null;
  url: string | null;
  category: string | null;
};

const CATEGORIES = [
  { key: "discovery", label: "Discovery" },
  { key: "vehicle", label: "Vehicle" },
  { key: "finance", label: "Finance" },
  { key: "contact", label: "Contact" },
  { key: "header_footer", label: "Header/Footer", aliases: ["header", "footer", "header/footer"] },
] as const;

function categorize(value: string | null): string {
  const v = (value ?? "").toLowerCase().trim();
  if (!v) return "uncategorized";
  for (const c of CATEGORIES) {
    if (c.key === v) return c.key;
    if ("aliases" in c && (c.aliases as readonly string[]).includes(v)) return c.key;
  }
  return v;
}

function CtaSettingsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Cta | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal_cta_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_cta_settings")
        .select("id, cta_key, label, sublabel, url, category")
        .order("category", { ascending: true })
        .order("cta_key", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Cta[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((c) =>
      !q ? true : c.cta_key?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Cta[]>();
    for (const c of filtered) {
      const k = categorize(c.category);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    return map;
  }, [filtered]);

  const save = useMutation({
    mutationFn: async (input: { id: string; label: string; sublabel: string; url: string }) => {
      const { error } = await supabase
        .from("portal_cta_settings")
        .update({
          label: input.label,
          sublabel: input.sublabel,
          url: input.url,
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["portal_cta_settings"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="CTA Settings" />
        <EmptyState
          title="Admin only"
          hint="You need the admin role to manage CTA settings."
        />
      </div>
    );
  }

  const knownKeys = new Set<string>(CATEGORIES.map((c) => c.key));
  const extraGroups = Array.from(grouped.keys()).filter((k) => !knownKeys.has(k));
  const orderedGroups: { key: string; label: string }[] = [
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
    ...extraGroups.map((k) => ({ key: k, label: k === "uncategorized" ? "Uncategorized" : k })),
  ];

  return (
    <div>
      <PageHeader
        title="CTA Settings"
        description="Manage call-to-action labels and links across the portal."
      />

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cta_key…"
            className="pl-8"
          />
        </div>
      </div>

      {error ? (
        <EmptyState title="Failed to load" hint={(error as Error).message} />
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No CTA settings" hint="The portal_cta_settings table is empty." />
      ) : (
        <Accordion
          type="multiple"
          defaultValue={orderedGroups.map((g) => g.key)}
          className="rounded-md border bg-card"
        >
          {orderedGroups.map((group) => {
            const rows = grouped.get(group.key) ?? [];
            return (
              <AccordionItem key={group.key} value={group.key} className="border-b last:border-b-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {group.label}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                      {rows.length}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  {rows.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">No matches.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2 text-left">Key</th>
                            <th className="px-4 py-2 text-left">Label</th>
                            <th className="px-4 py-2 text-left">Sublabel</th>
                            <th className="px-4 py-2 text-left">URL</th>
                            <th className="w-12 px-4 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {rows.map((c) => (
                            <tr key={c.id} className="hover:bg-muted/30">
                              <td className="px-4 py-2 font-mono text-xs">{c.cta_key}</td>
                              <td className="px-4 py-2">{c.label || <span className="text-muted-foreground">—</span>}</td>
                              <td className="px-4 py-2 text-muted-foreground">{c.sublabel || "—"}</td>
                              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{c.url || "—"}</td>
                              <td className="px-4 py-2 text-right">
                                <Button size="icon" variant="ghost" onClick={() => setEditing(c)} title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <EditDialog
        cta={editing}
        onClose={() => setEditing(null)}
        onSave={(v) => save.mutate(v)}
        saving={save.isPending}
      />
    </div>
  );
}

function EditDialog({
  cta,
  onClose,
  onSave,
  saving,
}: {
  cta: Cta | null;
  onClose: () => void;
  onSave: (v: { id: string; label: string; sublabel: string; url: string }) => void;
  saving: boolean;
}) {
  const [label, setLabel] = useState("");
  const [sublabel, setSublabel] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setLabel(cta?.label ?? "");
    setSublabel(cta?.sublabel ?? "");
    setUrl(cta?.url ?? "");
  }, [cta?.id]);

  return (
    <Dialog open={!!cta} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit CTA</DialogTitle>
        </DialogHeader>
        {cta && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Key</Label>
              <Input value={cta.cta_key} disabled className="font-mono text-xs" />
              <p className="mt-1 text-xs text-muted-foreground">cta_key cannot be changed.</p>
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Sublabel</Label>
              <Input value={sublabel} onChange={(e) => setSublabel(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => cta && onSave({ id: cta.id, label, sublabel, url })}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
