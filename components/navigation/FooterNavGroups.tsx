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
}

export function FooterNavGroups({ navigation }: FooterNavGroupsProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {navigation.groups.map((group) => (
        <div key={group.title}>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {group.title}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/30">
            {group.items.map((item) => (
              <li key={item.id}>
                <FooterNavLink item={item} isHome={isHome} />
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
}: {
  item: FooterNavigation["groups"][number]["items"][number];
  isHome: boolean;
}) {
  const { openLead } = useLeadCapture();
  const href = item.href?.trim();
  const linkClass = "transition hover:text-white/50";

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
