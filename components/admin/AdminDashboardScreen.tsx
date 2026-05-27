import Link from "next/link";
import type { AdminWorkspaceSnapshot } from "@/lib/adminDashboard";

function StatusLamp({ light }: { light: "green" | "red" }) {
  const isGreen = light === "green";
  return (
    <span
      className={`relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
        isGreen ? "bg-emerald-500" : "bg-red-500"
      }`}
      aria-hidden
    >
      <span
        className={`absolute inset-0 rounded-full ${
          isGreen
            ? "bg-emerald-400/50 blur-[6px]"
            : "bg-red-400/50 blur-[6px]"
        }`}
      />
      <span className="relative h-3 w-3 rounded-full bg-white/25" />
    </span>
  );
}

function StatusCard({
  item,
}: {
  item: AdminWorkspaceSnapshot["items"][number];
}) {
  return (
    <Link
      href={item.href}
      className="group flex gap-4 rounded-xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-tight)] transition hover:border-[var(--line-dark)] hover:shadow-[var(--shadow-card)]"
    >
      <div className="pt-0.5">
        <StatusLamp light={item.light} />
        <span className="sr-only">
          {item.light === "green" ? "Good" : "Needs attention"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {item.label}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--ink)]">
          {item.summary}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          {item.detail}
        </p>
        <p className="mt-3 text-xs font-semibold text-[var(--ink)] opacity-0 transition group-hover:opacity-100">
          Open →
        </p>
      </div>
    </Link>
  );
}

interface AdminDashboardScreenProps {
  snapshot: AdminWorkspaceSnapshot;
}

export function AdminDashboardScreen({ snapshot }: AdminDashboardScreenProps) {
  const checkedLabel = new Date(snapshot.checkedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Webmaster check-in
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          A quick read on whether feeds, inventory, and content look healthy. Open
          any row for detail — this is not an alert board.
        </p>
      </div>

      <div
        className={`flex items-start gap-4 rounded-xl border px-5 py-4 ${
          snapshot.allClear
            ? "border-emerald-200/80 bg-emerald-50/80"
            : "border-red-200/80 bg-red-50/60"
        }`}
      >
        <StatusLamp light={snapshot.allClear ? "green" : "red"} />
        <div>
          <p className="font-semibold text-[var(--ink)]">
            {snapshot.allClear
              ? "Green light — everything looks good."
              : "Red light — something needs a look."}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Checked {checkedLabel}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {snapshot.items.map((item) => (
          <StatusCard key={item.id} item={item} />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--cream)]/50 px-5 py-4">
        <p className="text-sm font-medium text-[var(--ink)]">Shortcuts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Inventory sources", href: "/admin/inventory-sources" },
            { label: "Feed imports", href: "/admin/feeds" },
            { label: "Feed mapping", href: "/admin/feed-mapping" },
            { label: "Pages", href: "/admin/pages" },
            { label: "Branding", href: "/admin/branding" },
            { label: "View site", href: "/" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
