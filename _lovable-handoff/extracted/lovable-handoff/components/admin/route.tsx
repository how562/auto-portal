import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">Inventory Admin</div>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 ${isAdmin ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}>
                {isAdmin ? "Admin" : "Read-only (no admin role)"}
              </span>
            </div>
          </header>
          <main className="flex-1 p-6">
            {!isAdmin && (
              <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                Your account doesn't have the <code>admin</code> role. Most writes will fail under RLS.
                The first account to sign up is automatically promoted to admin.
              </div>
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
