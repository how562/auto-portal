import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Store, Rss, History, Car, LogOut, Layers, LayoutTemplate, FileText, StickyNote, FileInput, Menu as MenuIcon, MousePointerClick, Type, Sparkles, Link2, Wand2, SlidersHorizontal, Activity, GitBranch, Calculator } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Dealer Groups", url: "/dealer-groups", icon: Users },
  { title: "Stores", url: "/stores", icon: Store },
  { title: "Feed Sources", url: "/feed-sources", icon: Rss },
  { title: "Imports", url: "/imports", icon: History },
  { title: "Feed Monitor", url: "/feeds", icon: Activity },
  { title: "Feed Mapping", url: "/feed-mapping", icon: GitBranch },
  { title: "Vehicles", url: "/vehicles", icon: Car },
  { title: "Inventory Merchandising", url: "/inventory-merchandising", icon: Wand2 },
  { title: "Collections", url: "/collections", icon: Layers },
  { title: "Homepage Sections", url: "/homepage-sections", icon: LayoutTemplate },
  { title: "Pages", url: "/pages", icon: FileText },
  { title: "Import Page", url: "/pages/import", icon: FileInput },
  { title: "Navigation", url: "/navigation", icon: MenuIcon },
  { title: "Link Control Panel", url: "/link-control-panel", icon: Link2 },
  { title: "CTA Settings", url: "/cta-settings", icon: MousePointerClick },
  { title: "VDP Controls", url: "/vdp-controls", icon: SlidersHorizontal },
  { title: "Math Box Settings", url: "/mathbox-settings", icon: Calculator },
  { title: "Text Settings", url: "/text-settings", icon: Type },
  { title: "Smart Match Rules", url: "/smart-match-rules", icon: Sparkles },
  { title: "Notes", url: "/notes", icon: StickyNote },
];


export function AppSidebar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Car className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Inventory Admin</span>
            <span className="text-xs text-muted-foreground">Feed Control Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url || path.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 py-1 text-xs">
          <span className="truncate text-muted-foreground">{user?.email}</span>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            onClick={async () => { await signOut(); nav({ to: "/login" }); }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
