"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FooterNavigation } from "@/lib/navigationTypes";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { homeHashHref, scrollTargetId } from "@/lib/navigationUtils";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

interface FooterNavGroupsProps {
  navigation: FooterNavigation;
  variant?: "dark" | "light";
}

export function FooterNavGroups({ navigation, variant = "dark" }: FooterNavGroupsProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLight = variant === "light";

  return (
    <>
      {navigation.groups.map((group) => (
        <div key={group.title}>
          <p
            className={
              isLight
                ? "text-sm font-bold text-[var(--ink)]"
                : "text-xs font-semibold uppercase tracking-wider text-white/40"
            }
          >
            {group.title}
          </p>
          <ul
            className={
              isLight
                ? "mt-3 space-y-2.5 text-sm text-[var(--ink)]"
                : "mt-3 space-y-2 text-sm text-white/30"
            }
          >
            {group.items.map((item) => (
              <li key={item.id}>
                <FooterNavLink item={item} isHome={isHome} variant={variant} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function FooterNavLink({
  item,
  isHome,
  variant = "dark",
}: {
  item: FooterNavigation["groups"][number]["items"][number];
  isHome: boolean;
  variant?: "dark" | "light";
}) {
  const { openLead } = useLeadCapture();
  const href = item.href?.trim();
  const linkClass =
    variant === "light"
      ? "text-left transition hover:text-[var(--muted)]"
      : "transition hover:text-white/50";

  if (item.action) {
    return (
      <button
        type="button"
        onClick={() =>
          openLead({
            action: item.action!,
            shopperIntent: `Footer: ${item.label}`,
          })
        }
        className={linkClass}
      >
        {item.label}
      </button>
    );
  }

  if (!href) {
    return <span>{item.label}</span>;
  }

  if (item.linkKind === "hash") {
    const targetId = scrollTargetId(href);
    if (isHome) {
      return (
        <button
          type="button"
          onClick={() => scrollToId(targetId)}
          className={linkClass}
        >
          {item.label}
        </button>
      );
    }
    return (
      <Link href={homeHashHref(href)} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  if (item.linkKind === "external") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {item.label}
    </Link>
  );
}
