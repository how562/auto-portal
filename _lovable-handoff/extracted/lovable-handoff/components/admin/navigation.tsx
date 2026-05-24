import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/admin-ui";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Loader2, ExternalLink, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/navigation")({
  component: NavigationAdmin,
});

type Location = "header" | "footer" | "utility";

type Menu = {
  id: string;
  name: string;
  location: Location;
  is_active: boolean;
};

type CtaStyle = "none" | "primary" | "secondary";
type DropdownBehavior = "hover" | "click";

type Item = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string;
  page_id: string | null;
  sort_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
  column_group: string | null;
  cta_style: CtaStyle;
  dropdown_behavior: DropdownBehavior;
};

type PageOption = { id: string; title: string; slug: string; status: string };

function NavigationAdmin() {
  const [location, setLocation] = useState<Location>("header");

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Manage header, footer, and utility menus. Public site reads active items only."
        action={
          <Button variant="outline" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      <Tabs value={location} onValueChange={(v) => setLocation(v as Location)}>
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="utility">Utility</TabsTrigger>
        </TabsList>
        {(["header", "footer", "utility"] as Location[]).map((loc) => (
          <TabsContent key={loc} value={loc} className="pt-4">
            <MenusForLocation location={loc} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MenusForLocation({ location }: { location: Location }) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const menusQ = useQuery({
    queryKey: ["navigation_menus", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_menus")
        .select("*")
        .eq("location", location)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Menu[];
    },
  });

  const activeMenu = useMemo(() => {
    const list = menusQ.data ?? [];
    return list.find((m) => m.id === selectedId) ?? list[0] ?? null;
  }, [menusQ.data, selectedId]);

  const createMenu = useMutation({
    mutationFn: async () => {
      const name = newName.trim() || `${location[0].toUpperCase()}${location.slice(1)} Menu`;
      const { data, error } = await supabase
        .from("navigation_menus")
        .insert({ name, location })
        .select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      setNewName("");
      setSelectedId(id);
      qc.invalidateQueries({ queryKey: ["navigation_menus", location] });
      toast.success("Menu created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMenu = useMutation({
    mutationFn: async (patch: Partial<Menu> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await supabase.from("navigation_menus").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation_menus", location] }),
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMenu = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("navigation_menus").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["navigation_menus", location] });
      toast.success("Menu deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (menusQ.isLoading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading menus…</div>;
  }

  return (
    <div className="space-y-4">
      <SectionCard title={`${location[0].toUpperCase()}${location.slice(1)} menus`}>
        <div className="flex flex-wrap items-center gap-2">
          {(menusQ.data ?? []).map((m) => {
            const isActive = activeMenu?.id === m.id;
            return (
              <Button
                key={m.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedId(m.id)}
              >
                {m.name}
                {!m.is_active && <Badge variant="secondary" className="ml-2">off</Badge>}
              </Button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`New ${location} menu name`}
              className="w-56"
            />
            <Button size="sm" onClick={() => createMenu.mutate()} disabled={createMenu.isPending}>
              {createMenu.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Menu
            </Button>
          </div>
        </div>
      </SectionCard>

      {!activeMenu && (
        <div className="rounded-md border bg-muted/30 p-6 text-sm text-muted-foreground">
          No menus yet for this location. Create one above.
        </div>
      )}

      {activeMenu && (
        <>
          <SectionCard title="Menu details">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  defaultValue={activeMenu.name}
                  onBlur={(e) => {
                    if (e.target.value !== activeMenu.name) {
                      updateMenu.mutate({ id: activeMenu.id, name: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={activeMenu.is_active}
                    onCheckedChange={(v) => updateMenu.mutate({ id: activeMenu.id, is_active: v })}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete menu "${activeMenu.name}" and all its items?`)) {
                      deleteMenu.mutate(activeMenu.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete menu
                </Button>
              </div>
            </div>
          </SectionCard>

          <MenuItemsEditor menu={activeMenu} />
        </>
      )}
    </div>
  );
}

function MenuItemsEditor({ menu }: { menu: Menu }) {
  const qc = useQueryClient();
  const itemsQ = useQuery({
    queryKey: ["navigation_items", menu.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("menu_id", menu.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Item[];
    },
  });

  const pagesQ = useQuery({
    queryKey: ["site_pages_for_nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("id,title,slug,status")
        .order("title", { ascending: true });
      if (error) throw error;
      return data as PageOption[];
    },
  });
  const pages = pagesQ.data ?? [];

  const insert = useMutation({
    mutationFn: async (input: Partial<Item>) => {
      const { error } = await supabase.from("navigation_items").insert({
        menu_id: menu.id,
        label: input.label ?? "New item",
        url: input.url ?? "/",
        parent_id: input.parent_id ?? null,
        sort_order: input.sort_order ?? 0,
        column_group: input.column_group ?? null,
        opens_new_tab: input.opens_new_tab ?? false,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation_items", menu.id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Item> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await supabase.from("navigation_items").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation_items", menu.id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("navigation_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation_items", menu.id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const swap = useMutation({
    mutationFn: async ({ a, b }: { a: Item; b: Item }) => {
      const { error: e1 } = await supabase.from("navigation_items").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("navigation_items").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation_items", menu.id] }),
    onError: (e: any) => toast.error(e.message),
  });

  if (itemsQ.isLoading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading items…</div>;
  }

  const items = itemsQ.data ?? [];
  const roots = items.filter((i) => !i.parent_id);
  const childrenOf = (id: string) => items.filter((i) => i.parent_id === id).sort((a, b) => a.sort_order - b.sort_order);

  // For footer: group root items by column_group
  const groups = menu.location === "footer"
    ? Array.from(new Set(roots.map((r) => r.column_group || "Ungrouped")))
    : null;

  function moveItem(item: Item, dir: -1 | 1) {
    const siblings = items
      .filter((i) =>
        i.parent_id === item.parent_id &&
        (menu.location !== "footer" || (i.column_group ?? null) === (item.column_group ?? null)),
      )
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex((s) => s.id === item.id);
    const target = siblings[idx + dir];
    if (!target) return;
    swap.mutate({ a: item, b: target });
  }

  function nextSort(parentId: string | null, columnGroup?: string | null) {
    const sibs = items.filter((i) =>
      i.parent_id === parentId &&
      (menu.location !== "footer" || (i.column_group ?? null) === (columnGroup ?? null)),
    );
    return (sibs.reduce((m, s) => Math.max(m, s.sort_order), 0) + 10);
  }

  return (
    <SectionCard
      title="Menu items"
      action={
        menu.location !== "footer" ? (
          <Button size="sm" onClick={() => insert.mutate({ sort_order: nextSort(null) })}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        ) : null
      }
    >
      {menu.location === "footer" && groups ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <FooterGroup
              key={g}
              groupName={g}
              items={roots.filter((r) => (r.column_group || "Ungrouped") === g).sort((a, b) => a.sort_order - b.sort_order)}
              childrenOf={childrenOf}
              pages={pages}
              onMove={moveItem}
              onUpdate={(patch) => update.mutate(patch)}
              onAddChild={(parent) => insert.mutate({ parent_id: parent.id, sort_order: nextSort(parent.id), column_group: parent.column_group })}
              onAddInGroup={() => insert.mutate({ sort_order: nextSort(null, g), column_group: g === "Ungrouped" ? null : g })}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Add new footer column:</span>
            {["About", "Finance", "Shop", "Service"].filter((g) => !(groups ?? []).includes(g)).map((g) => (
              <Button key={g} variant="outline" size="sm" onClick={() => insert.mutate({ sort_order: 10, column_group: g, label: g, url: "#" })}>
                <Plus className="mr-2 h-3 w-3" /> {g}
              </Button>
            ))}
            <NewGroupAdder onAdd={(g) => insert.mutate({ sort_order: 10, column_group: g, label: g, url: "#" })} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {roots.length === 0 && (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">No items yet.</div>
          )}
          {roots
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((r, i, arr) => (
              <ItemRow
                key={r.id}
                item={r}
                pages={pages}
                isFirst={i === 0}
                isLast={i === arr.length - 1}
                onMoveUp={() => moveItem(r, -1)}
                onMoveDown={() => moveItem(r, 1)}
                onUpdate={(patch) => update.mutate({ id: r.id, ...patch })}
                onDelete={() => remove.mutate(r.id)}
                onAddChild={() => insert.mutate({ parent_id: r.id, sort_order: nextSort(r.id) })}
                level={0}
                childrenItems={childrenOf(r.id)}
                allChildrenOf={childrenOf}
                onMoveChild={moveItem}
                onUpdateChild={(patch) => update.mutate(patch)}
                onDeleteChild={(id) => remove.mutate(id)}
              />
            ))}
        </div>
      )}
    </SectionCard>
  );
}

function NewGroupAdder({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-1">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Custom column" className="h-8 w-40" />
      <Button size="sm" variant="outline" disabled={!name.trim()} onClick={() => { onAdd(name.trim()); setName(""); }}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

function FooterGroup({
  groupName, items, childrenOf, pages, onMove, onUpdate, onAddChild, onAddInGroup, onDelete,
}: {
  groupName: string;
  items: Item[];
  childrenOf: (id: string) => Item[];
  pages: PageOption[];
  onMove: (item: Item, dir: -1 | 1) => void;
  onUpdate: (patch: Partial<Item> & { id: string }) => void;
  onAddChild: (parent: Item) => void;
  onAddInGroup: () => void;
  onDelete: (id: string) => void;
}) {
  const allIds = items.flatMap((r) => [r.id, ...childrenOf(r.id).map((c) => c.id)]);
  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            defaultValue={groupName === "Ungrouped" ? "" : groupName}
            placeholder="Column name"
            className="h-8 w-44 text-sm font-semibold"
            onBlur={(e) => {
              const next = e.target.value.trim() || null;
              const current = groupName === "Ungrouped" ? null : groupName;
              if (next === current) return;
              items.forEach((r) => onUpdate({ id: r.id, column_group: next }));
            }}
          />
          <Badge variant="secondary">{items.length} item{items.length === 1 ? "" : "s"}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onAddInGroup}>
            <Plus className="mr-2 h-4 w-4" /> Add item
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (allIds.length === 0) return;
              if (confirm(`Delete column "${groupName}" and its ${allIds.length} item(s)?`)) {
                allIds.forEach((id) => onDelete(id));
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove column
          </Button>
        </div>
      </div>
      <div className="space-y-2 p-3">
        {items.length === 0 && <div className="text-xs text-muted-foreground">No items in this column.</div>}
        {items.map((r, i, arr) => (
          <ItemRow
            key={r.id}
            item={r}
            pages={pages}
            isFirst={i === 0}
            isLast={i === arr.length - 1}
            onMoveUp={() => onMove(r, -1)}
            onMoveDown={() => onMove(r, 1)}
            onUpdate={(patch) => onUpdate({ id: r.id, ...patch })}
            onDelete={() => onDelete(r.id)}
            onAddChild={() => onAddChild(r)}
            level={0}
            childrenItems={childrenOf(r.id)}
            allChildrenOf={childrenOf}
            onMoveChild={onMove}
            onUpdateChild={(patch) => onUpdate(patch)}
            onDeleteChild={(id) => onDelete(id)}
          />
        ))}
      </div>
    </div>
  );
}

function ItemRow({
  item, pages, isFirst, isLast, onMoveUp, onMoveDown, onUpdate, onDelete, onAddChild,
  level, childrenItems, allChildrenOf, onMoveChild, onUpdateChild, onDeleteChild,
  showColumnGroup,
}: {
  item: Item;
  pages: PageOption[];
  isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void;
  onUpdate: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onAddChild: () => void;
  level: number;
  childrenItems: Item[];
  allChildrenOf: (id: string) => Item[];
  onMoveChild: (item: Item, dir: -1 | 1) => void;
  onUpdateChild: (patch: Partial<Item> & { id: string }) => void;
  onDeleteChild: (id: string) => void;
  showColumnGroup?: boolean;
}) {
  const linkType: "page" | "custom" = item.page_id ? "page" : "custom";
  return (
    <div className="rounded-md border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-2" style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}>
        <Input
          defaultValue={item.label}
          onBlur={(e) => e.target.value !== item.label && onUpdate({ label: e.target.value })}
          className="h-8 w-44"
          placeholder="Label"
        />
        <Select
          value={linkType}
          onValueChange={(v) => {
            if (v === "custom") onUpdate({ page_id: null });
            // switching to "page" requires selecting a page below; do nothing here
          }}
        >
          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="custom">Custom link</SelectItem>
          </SelectContent>
        </Select>
        {linkType === "page" ? (
          <Select
            value={item.page_id ?? ""}
            onValueChange={(v) => onUpdate({ page_id: v })}
          >
            <SelectTrigger className="h-8 w-64"><SelectValue placeholder="Select a page…" /></SelectTrigger>
            <SelectContent>
              {pages.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No pages yet</div>
              )}
              {pages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title} <span className="text-muted-foreground">/{p.slug}</span>
                  {p.status === "draft" && " · draft"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            defaultValue={item.url}
            onBlur={(e) => e.target.value !== item.url && onUpdate({ url: e.target.value })}
            className="h-8 w-64 font-mono text-xs"
            placeholder="/path or https://…"
          />
        )}
        {showColumnGroup && (
          <Input
            defaultValue={item.column_group ?? ""}
            onBlur={(e) => (e.target.value || null) !== item.column_group && onUpdate({ column_group: e.target.value || null })}
            className="h-8 w-28"
            placeholder="Column"
          />
        )}
        <div className="flex items-center gap-1 text-xs">
          <Switch checked={item.is_active} onCheckedChange={(v) => onUpdate({ is_active: v })} />
          <span className="text-muted-foreground">active</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Switch checked={item.opens_new_tab} onCheckedChange={(v) => onUpdate({ opens_new_tab: v })} />
          <span className="text-muted-foreground"><ExternalLink className="inline h-3 w-3" /> new tab</span>
        </div>
        {level === 0 && (
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">CTA</Label>
            <Select
              value={item.cta_style ?? "none"}
              onValueChange={(v) => onUpdate({ cta_style: v as CtaStyle })}
            >
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
            {item.cta_style === "primary" && <Badge>Primary</Badge>}
            {item.cta_style === "secondary" && <Badge variant="secondary">Secondary</Badge>}
          </div>
        )}
        {level === 0 && childrenItems.length > 0 && (
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Dropdown</Label>
            <Select
              value={item.dropdown_behavior ?? "hover"}
              onValueChange={(v) => onUpdate({ dropdown_behavior: v as DropdownBehavior })}
            >
              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hover">Hover</SelectItem>
                <SelectItem value="click">Click</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isFirst}><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isLast}><ChevronDown className="h-4 w-4" /></Button>
          {level === 0 && (
            <Button variant="outline" size="sm" onClick={onAddChild}>
              <Plus className="mr-1 h-3 w-3" /> Child
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {childrenItems.length > 0 && (
        <div className="space-y-2 border-t bg-muted/20 p-2">
          {childrenItems.map((c, i, arr) => (
            <ItemRow
              key={c.id}
              item={c}
              pages={pages}
              isFirst={i === 0}
              isLast={i === arr.length - 1}
              onMoveUp={() => onMoveChild(c, -1)}
              onMoveDown={() => onMoveChild(c, 1)}
              onUpdate={(patch) => onUpdateChild({ id: c.id, ...patch })}
              onDelete={() => onDeleteChild(c.id)}
              onAddChild={() => {}}
              level={level + 1}
              childrenItems={allChildrenOf(c.id)}
              allChildrenOf={allChildrenOf}
              onMoveChild={onMoveChild}
              onUpdateChild={onUpdateChild}
              onDeleteChild={onDeleteChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
