import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Loader2, Search, Pencil, Plus, AlertTriangle, HelpCircle, CircleSlash, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/link-control-panel")({
  component: LinkControlPanel,
});

type Location = "header" | "footer" | "homepage" | "inventory" | "vdp";
type LinkType = "route" | "scroll" | "modal" | "external";
type LinkStatus = "ok" | "broken" | "missing" | "needs_decision";

type ManagedLink = {
  id: string;
  label: string;
  location: Location;
  link_type: LinkType;
  destination: string | null;
  action_key: string | null;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
  status: LinkStatus;
  created_at: string;
  updated_at: string;
};

const LOCATIONS: { key: Location; label: string }[] = [
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "homepage", label: "Homepage Sections" },
  { key: "inventory", label: "Inventory" },
  { key: "vdp", label: "VDP" },
];

const LINK_TYPES: { key: LinkType; label: string; hint: string }[] = [
  { key: "route", label: "Route", hint: "/path or /nested/path" },
  { key: "scroll", label: "Scroll", hint: "#section-id" },
  { key: "modal", label: "Modal", hint: "modal-action-key" },
  { key: "external", label: "External", hint: "https://…" },
];

function LinkControlPanel() {
  const { isAdmin, loading } = useAuth();
  const [location, setLocation] = useState<Location>("header");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LinkStatus>("all");
  const [editing, setEditing] = useState<ManagedLink | null>(null);
  const [creating, setCreating] = useState(false);

  const q = useQuery({
    queryKey: ["managed_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_links")
        .select("*")
        .order("location", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ManagedLink[];
    },
  });

  const rows = q.data ?? [];
  const counts = useMemo(() => {
    const c: Record<Location, { total: number; issues: number }> = {
      header: { total: 0, issues: 0 },
      footer: { total: 0, issues: 0 },
      homepage: { total: 0, issues: 0 },
      inventory: { total: 0, issues: 0 },
      vdp: { total: 0, issues: 0 },
    };
    for (const r of rows) {
      c[r.location].total++;
      if (r.status !== "ok") c[r.location].issues++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => r.location === location)
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          r.label.toLowerCase().includes(s) ||
          (r.destination ?? "").toLowerCase().includes(s) ||
          (r.action_key ?? "").toLowerCase().includes(s) ||
          r.link_type.toLowerCase().includes(s)
        );
      });
  }, [rows, location, statusFilter, search]);

  const totalIssues = useMemo(() => rows.filter((r) => r.status !== "ok").length, [rows]);

  if (loading) {
    return <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="p-6">
        <PageHeader title="Link Control Panel" description="Admin only." />
        <div className="rounded-md border bg-muted/30 p-6 text-sm text-muted-foreground">
          You need admin access to view this page.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Link Control Panel"
        description="Source of truth for every UI link/button. Edits are stored in managed_links."
        action={
          <div className="flex items-center gap-2">
            {totalIssues > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {totalIssues} issue{totalIssues === 1 ? "" : "s"}
              </Badge>
            )}
            <Button variant="outline" asChild>
              <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      <Tabs value={location} onValueChange={(v) => setLocation(v as Location)}>
        <TabsList>
          {LOCATIONS.map((g) => (
            <TabsTrigger key={g.key} value={g.key} className="gap-2">
              {g.label}
              {counts[g.key].issues > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{counts[g.key].issues}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCATIONS.map((g) => (
          <TabsContent key={g.key} value={g.key} className="pt-4">
            <SectionCard
              title={`${g.label} links`}
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search label, destination, action…"
                      className="h-8 w-64 pl-7"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="broken">Broken</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                      <SelectItem value="needs_decision">Needs decision</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add link
                  </Button>
                </div>
              }
            >
              {q.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="rounded-md border bg-muted/30 p-6 text-sm text-muted-foreground">No links match.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination / Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id} className={rowClass(r.status)}>
                        <TableCell className="font-medium">
                          {r.label}
                          {!r.is_active && <Badge variant="secondary" className="ml-2">inactive</Badge>}
                        </TableCell>
                        <TableCell><TypeBadge type={r.link_type} /></TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.link_type === "modal"
                            ? (r.action_key ? r.action_key : <span className="text-muted-foreground italic">—</span>)
                            : (r.destination ? r.destination : <span className="text-muted-foreground italic">—</span>)}
                        </TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          <span className={r.is_active ? "text-emerald-600" : "text-muted-foreground"}>
                            {r.is_active ? "yes" : "no"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>

      <EditDialog row={editing} onClose={() => setEditing(null)} />
      <CreateDialog open={creating} location={location} onClose={() => setCreating(false)} />
    </div>
  );
}

function rowClass(status: LinkStatus) {
  switch (status) {
    case "broken": return "bg-destructive/5";
    case "missing": return "bg-amber-500/5";
    case "needs_decision": return "bg-blue-500/5";
    default: return "";
  }
}

function TypeBadge({ type }: { type: LinkType }) {
  const map: Record<LinkType, string> = {
    route: "bg-primary/10 text-primary",
    scroll: "bg-purple-500/10 text-purple-600",
    modal: "bg-orange-500/10 text-orange-600",
    external: "bg-emerald-500/10 text-emerald-700",
  };
  return <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>{type}</span>;
}

function StatusBadge({ status }: { status: LinkStatus }) {
  if (status === "ok") return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> OK</Badge>;
  if (status === "broken") return <Badge variant="destructive" className="gap-1"><CircleSlash className="h-3 w-3" /> Broken</Badge>;
  if (status === "missing") return <Badge className="gap-1 bg-amber-500 hover:bg-amber-500/90"><AlertTriangle className="h-3 w-3" /> Missing</Badge>;
  return <Badge className="gap-1 bg-blue-500 hover:bg-blue-500/90"><HelpCircle className="h-3 w-3" /> Needs decision</Badge>;
}

type FormState = {
  label: string;
  link_type: LinkType;
  destination: string;
  action_key: string;
  status: LinkStatus;
  notes: string;
  is_active: boolean;
  sort_order: number;
};

const emptyForm: FormState = {
  label: "", link_type: "route", destination: "", action_key: "",
  status: "ok", notes: "", is_active: true, sort_order: 0,
};

function LinkFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const hint = LINK_TYPES.find((t) => t.key === form.link_type)?.hint ?? "";
  const isModal = form.link_type === "modal";
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Label</Label>
        <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={form.link_type} onValueChange={(v) => setForm({ ...form, link_type: v as LinkType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LINK_TYPES.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LinkStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="broken">Broken</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
              <SelectItem value="needs_decision">Needs decision</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isModal ? (
        <div className="space-y-1">
          <Label>Action key</Label>
          <Input
            value={form.action_key}
            onChange={(e) => setForm({ ...form, action_key: e.target.value })}
            placeholder={hint}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">Identifier the frontend uses to trigger this modal/action.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <Label>Destination</Label>
          <Input
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder={hint}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">Format: {hint}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-end gap-2">
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          <Label className="text-sm">Active</Label>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Optional context" />
      </div>
    </div>
  );
}

function toPayload(form: FormState) {
  const isModal = form.link_type === "modal";
  return {
    label: form.label.trim(),
    link_type: form.link_type,
    destination: isModal ? null : (form.destination.trim() || null),
    action_key: isModal ? (form.action_key.trim() || null) : null,
    status: form.status,
    notes: form.notes.trim() || null,
    is_active: form.is_active,
    sort_order: form.sort_order,
  };
}

function EditDialog({ row, onClose }: { row: ManagedLink | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (row) {
      setForm({
        label: row.label,
        link_type: row.link_type,
        destination: row.destination ?? "",
        action_key: row.action_key ?? "",
        status: row.status,
        notes: row.notes ?? "",
        is_active: row.is_active,
        sort_order: row.sort_order,
      });
    }
  }, [row?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async () => {
      if (!row) return;
      const { error } = await supabase
        .from("managed_links")
        .update(toPayload(form))
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed_links"] });
      toast.success("Link updated");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit link</DialogTitle></DialogHeader>
        <LinkFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.label.trim()}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateDialog({ open, location, onClose }: { open: boolean; location: Location; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => { if (open) setForm(emptyForm); }, [open]);

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("managed_links")
        .insert({ ...toPayload(form), location });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed_links"] });
      toast.success("Link created");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add link to {location}</DialogTitle>
        </DialogHeader>
        <LinkFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !form.label.trim()}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
