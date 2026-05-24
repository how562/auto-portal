import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vdp-controls")({
  component: VdpControlsPage,
});

const ACTION_TYPES = [
  "lead_form","call","text","finance","schedule","trade","external",
];

function VdpControlsPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="VDP Controls" />
        <EmptyState title="Admin only" hint="You need the admin role to manage VDP controls." />
      </div>
    );
  }
  return (
    <div>
      <PageHeader
        title="VDP Controls"
        description="Presentation only. Vehicle values (price, specs) always come from feeds."
      />
      <Tabs defaultValue="ctas">
        <TabsList>
          <TabsTrigger value="ctas">CTAs</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Config</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="badges">Trust Badges</TabsTrigger>
        </TabsList>
        <TabsContent value="ctas"><CtasTab /></TabsContent>
        <TabsContent value="pricing"><PricingTab /></TabsContent>
        <TabsContent value="sections"><SectionsTab /></TabsContent>
        <TabsContent value="badges"><BadgesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------------------- CTAs ------------------------------ */
type Cta = {
  id: string; label: string; action_type: string;
  applies_to: "new"|"used"|"all"; is_primary: boolean;
  sort_order: number; is_active: boolean;
};

function CtasTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portal_vdp_ctas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_vdp_ctas")
        .select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Cta[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Partial<Cta> & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase.from("portal_vdp_ctas")
          .update(row).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portal_vdp_ctas").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["portal_vdp_ctas"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portal_vdp_ctas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_vdp_ctas"] }),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card><CardContent className="pt-6 space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => save.mutate({
          label: "New CTA", action_type: "lead_form",
          applies_to: "all", is_primary: false, sort_order: (data?.length ?? 0) * 10, is_active: true,
        })}><Plus className="mr-1 h-4 w-4" /> Add CTA</Button>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-left">Label</th>
                <th className="px-2 py-2 text-left">Action</th>
                <th className="px-2 py-2 text-left">Applies to</th>
                <th className="px-2 py-2 text-left">Primary</th>
                <th className="px-2 py-2 text-left">Order</th>
                <th className="px-2 py-2 text-left">Active</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-2 py-1"><Input defaultValue={c.label}
                    onBlur={(e) => e.target.value !== c.label && save.mutate({ id: c.id, label: e.target.value })} /></td>
                  <td className="px-2 py-1">
                    <Select value={c.action_type} onValueChange={(v) => save.mutate({ id: c.id, action_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1">
                    <Select value={c.applies_to} onValueChange={(v) => save.mutate({ id: c.id, applies_to: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">all</SelectItem>
                        <SelectItem value="new">new</SelectItem>
                        <SelectItem value="used">used</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1"><Switch checked={c.is_primary}
                    onCheckedChange={(v) => save.mutate({ id: c.id, is_primary: v })} /></td>
                  <td className="px-2 py-1 w-20"><Input type="number" defaultValue={c.sort_order}
                    onBlur={(e) => Number(e.target.value) !== c.sort_order &&
                      save.mutate({ id: c.id, sort_order: Number(e.target.value) })} /></td>
                  <td className="px-2 py-1"><Switch checked={c.is_active}
                    onCheckedChange={(v) => save.mutate({ id: c.id, is_active: v })} /></td>
                  <td className="px-2 py-1 text-right">
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent></Card>
  );
}

/* --------------------------- Pricing ----------------------------- */
type Pricing = {
  id: string;
  show_msrp: boolean; show_discount: boolean; show_doc_fee: boolean;
  doc_fee_label: string; price_label: string;
  disclaimer_text: string | null; show_conditional_offers: boolean;
};

function PricingTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portal_pricing_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_pricing_config")
        .select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as Pricing | null;
    },
  });

  const [form, setForm] = useState<Pricing | null>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      const { error } = await supabase.from("portal_pricing_config")
        .update({
          show_msrp: form.show_msrp,
          show_discount: form.show_discount,
          show_doc_fee: form.show_doc_fee,
          doc_fee_label: form.doc_fee_label,
          price_label: form.price_label,
          disclaimer_text: form.disclaimer_text,
          show_conditional_offers: form.show_conditional_offers,
        })
        .eq("id", form.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["portal_pricing_config"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading || !form) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const toggle = (k: keyof Pricing) => (v: boolean) => setForm({ ...form, [k]: v });

  return (
    <Card><CardContent className="pt-6 space-y-4 max-w-2xl">
      <p className="text-xs text-muted-foreground">
        Pricing values (MSRP, internet price, discount) always come from the feed.
        These controls only change labels and what is shown.
      </p>
      <Row label="Show MSRP"><Switch checked={form.show_msrp} onCheckedChange={toggle("show_msrp")} /></Row>
      <Row label="Show discount line"><Switch checked={form.show_discount} onCheckedChange={toggle("show_discount")} /></Row>
      <Row label="Show doc fee"><Switch checked={form.show_doc_fee} onCheckedChange={toggle("show_doc_fee")} /></Row>
      <Row label="Show conditional offers"><Switch checked={form.show_conditional_offers} onCheckedChange={toggle("show_conditional_offers")} /></Row>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Price label</Label>
          <Input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} /></div>
        <div><Label className="text-xs">Doc fee label</Label>
          <Input value={form.doc_fee_label} onChange={(e) => setForm({ ...form, doc_fee_label: e.target.value })} /></div>
      </div>
      <div>
        <Label className="text-xs">Disclaimer text</Label>
        <Textarea rows={3} value={form.disclaimer_text ?? ""}
          onChange={(e) => setForm({ ...form, disclaimer_text: e.target.value })} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
      </div>
    </CardContent></Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <span className="text-sm">{label}</span>{children}
    </div>
  );
}

/* --------------------------- Sections ---------------------------- */
type Section = { id: string; section_key: string; label: string | null; is_active: boolean; sort_order: number };

function SectionsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portal_vdp_sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_vdp_sections")
        .select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Section[];
    },
  });
  const save = useMutation({
    mutationFn: async (row: Partial<Section> & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase.from("portal_vdp_sections").update(row).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portal_vdp_sections").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_vdp_sections"] }),
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portal_vdp_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_vdp_sections"] }),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card><CardContent className="pt-6 space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => save.mutate({
          section_key: `section_${Date.now()}`, label: "New section",
          is_active: true, sort_order: (data?.length ?? 0) * 10,
        })}><Plus className="mr-1 h-4 w-4" /> Add Section</Button>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">Key</th>
              <th className="px-2 py-2 text-left">Label</th>
              <th className="px-2 py-2 text-left">Order</th>
              <th className="px-2 py-2 text-left">Active</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((s) => (
              <tr key={s.id}>
                <td className="px-2 py-1 font-mono text-xs">{s.section_key}</td>
                <td className="px-2 py-1"><Input defaultValue={s.label ?? ""}
                  onBlur={(e) => e.target.value !== (s.label ?? "") && save.mutate({ id: s.id, label: e.target.value })} /></td>
                <td className="px-2 py-1 w-20"><Input type="number" defaultValue={s.sort_order}
                  onBlur={(e) => Number(e.target.value) !== s.sort_order &&
                    save.mutate({ id: s.id, sort_order: Number(e.target.value) })} /></td>
                <td className="px-2 py-1"><Switch checked={s.is_active}
                  onCheckedChange={(v) => save.mutate({ id: s.id, is_active: v })} /></td>
                <td className="px-2 py-1 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </CardContent></Card>
  );
}

/* --------------------------- Badges ------------------------------ */
type Badge = { id: string; label: string; icon: string | null; sort_order: number; is_active: boolean };

function BadgesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portal_trust_badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_trust_badges")
        .select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Badge[];
    },
  });
  const save = useMutation({
    mutationFn: async (row: Partial<Badge> & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase.from("portal_trust_badges").update(row).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portal_trust_badges").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_trust_badges"] }),
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portal_trust_badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal_trust_badges"] }),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card><CardContent className="pt-6 space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => save.mutate({
          label: "New badge", icon: "ShieldCheck",
          sort_order: (data?.length ?? 0) * 10, is_active: true,
        })}><Plus className="mr-1 h-4 w-4" /> Add Badge</Button>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">Label</th>
              <th className="px-2 py-2 text-left">Icon</th>
              <th className="px-2 py-2 text-left">Order</th>
              <th className="px-2 py-2 text-left">Active</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((b) => (
              <tr key={b.id}>
                <td className="px-2 py-1"><Input defaultValue={b.label}
                  onBlur={(e) => e.target.value !== b.label && save.mutate({ id: b.id, label: e.target.value })} /></td>
                <td className="px-2 py-1"><Input defaultValue={b.icon ?? ""} placeholder="lucide icon or URL"
                  onBlur={(e) => e.target.value !== (b.icon ?? "") && save.mutate({ id: b.id, icon: e.target.value })} /></td>
                <td className="px-2 py-1 w-20"><Input type="number" defaultValue={b.sort_order}
                  onBlur={(e) => Number(e.target.value) !== b.sort_order &&
                    save.mutate({ id: b.id, sort_order: Number(e.target.value) })} /></td>
                <td className="px-2 py-1"><Switch checked={b.is_active}
                  onCheckedChange={(v) => save.mutate({ id: b.id, is_active: v })} /></td>
                <td className="px-2 py-1 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </CardContent></Card>
  );
}
