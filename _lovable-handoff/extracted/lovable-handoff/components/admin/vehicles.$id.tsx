import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/vehicles/$id")({
  component: VehicleDetail,
});

const TEXT_FIELDS = ["vin","stock_number","make","model","trim","body_style","exterior_color","interior_color","primary_image_url"] as const;
const NUM_FIELDS = ["year","mileage","msrp","internet_price","sale_price","days_in_stock"] as const;

function VehicleDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*, stores(name)").eq("id", id).single();
      if (error) throw error; return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["vehicle_images", id],
    queryFn: async () => {
      const { data } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", id).order("sort_order");
      return data ?? [];
    },
  });

  const { data: pricing } = useQuery({
    queryKey: ["vehicle_pricing", id],
    queryFn: async () => {
      const { data } = await supabase.from("vehicle_pricing_history").select("*").eq("vehicle_id", id).order("changed_at", { ascending: false });
      return data ?? [];
    },
  });

  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => { if (vehicle) setForm(vehicle); }, [vehicle]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {};
      TEXT_FIELDS.forEach((f) => payload[f] = form[f] ?? null);
      NUM_FIELDS.forEach((f) => payload[f] = form[f] === "" || form[f] == null ? null : Number(form[f]));
      payload.condition = form.condition || null;
      payload.status = form.status || "active";
      const { error } = await supabase.from("vehicles").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Vehicle saved"); qc.invalidateQueries({ queryKey: ["vehicle", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading || !vehicle) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-3"><Link to="/vehicles"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link></Button>
      <PageHeader
        title={[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ") || "Vehicle"}
        description={`VIN ${vehicle.vin} · ${vehicle.stores?.name ?? "—"}`}
        action={<Button onClick={() => save.mutate()} disabled={save.isPending}>Save changes</Button>}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing history</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="raw">Raw data</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card><CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {TEXT_FIELDS.map((f) => (
                <Field key={f} label={f.replace(/_/g, " ")}>
                  <Input value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                </Field>
              ))}
              {NUM_FIELDS.map((f) => (
                <Field key={f} label={f.replace(/_/g, " ")}>
                  <Input type="number" value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                </Field>
              ))}
              <Field label="condition">
                <Select value={form.condition ?? ""} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">new</SelectItem>
                    <SelectItem value="used">used</SelectItem>
                    <SelectItem value="cpo">cpo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="status">
                <Select value={form.status ?? "active"} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="missing">missing</SelectItem>
                    <SelectItem value="sold">sold</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card><CardContent className="pt-6">
            {!pricing?.length ? <div className="text-sm text-muted-foreground">No price changes recorded.</div> : (
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">When</th><th className="py-2">Old</th><th className="py-2">New</th><th className="py-2">Change</th></tr>
                </thead>
                <tbody>
                  {pricing.map((p: any) => {
                    const delta = (p.new_price ?? 0) - (p.old_price ?? 0);
                    return (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2">{format(new Date(p.changed_at), "MMM d yyyy, HH:mm")}</td>
                        <td className="py-2 tabular-nums">{p.old_price != null ? `$${Number(p.old_price).toLocaleString()}` : "—"}</td>
                        <td className="py-2 tabular-nums">{p.new_price != null ? `$${Number(p.new_price).toLocaleString()}` : "—"}</td>
                        <td className={`py-2 tabular-nums ${delta < 0 ? "text-success" : delta > 0 ? "text-destructive" : ""}`}>
                          {delta ? `${delta > 0 ? "+" : ""}$${delta.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="images">
          <Card><CardContent className="pt-6">
            {!images?.length ? <div className="text-sm text-muted-foreground">No images attached.</div> : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {images.map((img: any) => (
                  <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer" className="group">
                    <img src={img.image_url} alt="" className="aspect-[4/3] w-full rounded-md object-cover transition group-hover:opacity-90" loading="lazy" />
                  </a>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card><CardContent className="pt-6">
            <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(vehicle.raw_data ?? {}, null, 2)}
            </pre>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="capitalize text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
