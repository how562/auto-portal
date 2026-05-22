"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 useOptionalLeadCapture,
 type OpenLeadOptions,
} from "@/components/portal/LeadCaptureContext";
import type { HeaderNavItem } from "@/lib/navigationTypes";
import { homeHashHref, scrollTargetId } from "@/lib/navigationUtils";

const navLinkClass =
 "text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]";
const navActiveClass = "text-[13px] font-medium text-[var(--ink)]";
const navEmphasisClass =
 "text-[13px] font-medium text-[var(--ink)] transition hover:text-[var(--gold)]";
const mobileLinkClass =
 "text-sm text-[var(--muted)] transition hover:text-[var(--ink)]";
const mobileActiveClass = "text-sm font-medium text-[var(--ink)]";

function scrollToId(id: string) {
 document.getElementById(id)?.scrollIntoView({
 behavior: "smooth",
 block: "start",
 });
}

interface HeaderNavItemsProps {
 items: HeaderNavItem[];
 variant?: "desktop" | "mobile";
 onNavigate?: () => void;
}

export function HeaderNavItems({
 items,
 variant = "desktop",
 onNavigate,
}: HeaderNavItemsProps) {
 const pathname = usePathname();
 const isHome = pathname === "/";
 const openLead = useOptionalLeadCapture();

 if (variant === "mobile") {
 return (
 <div className="flex flex-col">
 {items.map((item) => (
 <HeaderNavMobileNode
 key={item.id}
 item={item}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 onNavigate={onNavigate}
 />
 ))}
 </div>
 );
 }

 return (
 <>
 {items.map((item) => (
 <HeaderNavNode
 key={item.id}
 item={item}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 />
 ))}
 </>
 );
}

function HeaderNavMobileNode({
 item,
 isHome,
 pathname,
 openLead,
 onNavigate,
}: {
 item: HeaderNavItem;
 isHome: boolean;
 pathname: string;
 openLead?: (options: OpenLeadOptions) => void;
 onNavigate?: () => void;
}) {
 if (item.children && item.children.length > 0) {
 return (
 <details className="group border-b border-[var(--line)]/80 last:border-0">
 <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-medium text-[var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
 {item.label}
 <span className="text-[10px] text-[var(--muted)] transition group-open:rotate-180">
 ▾
 </span>
 </summary>
 <div className="flex flex-col gap-0.5 border-l border-[var(--line)] pb-3 pl-4">
 {item.children.map((child) => (
 <HeaderNavLeaf
 key={child.id}
 item={child}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 variant="mobile"
 className="block w-full py-2.5 text-left"
 onNavigate={onNavigate}
 />
 ))}
 </div>
 </details>
 );
 }

 return (
 <div className="border-b border-[var(--line)]/80 last:border-0">
 <HeaderNavLeaf
 item={item}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 variant="mobile"
 className="block w-full py-3.5 text-left"
 onNavigate={onNavigate}
 />
 </div>
 );
}

function HeaderNavNode({
 item,
 isHome,
 pathname,
 openLead,
}: {
 item: HeaderNavItem;
 isHome: boolean;
 pathname: string;
 openLead?: (options: OpenLeadOptions) => void;
}) {
 if (item.children && item.children.length > 0) {
 return (
 <div className="group relative">
 <button
 type="button"
 className={`${navLinkClass} inline-flex items-center gap-1`}
 aria-haspopup="true"
 aria-expanded="false"
 >
 {item.label}
 <span className="text-[10px] opacity-60" aria-hidden>
 ▾
 </span>
 </button>
 <div className="pointer-events-none absolute left-0 top-full z-50 min-w-[12rem] pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
 <div className="rounded-xl border border-[var(--line)] bg-[var(--cream)] py-2 shadow-lg">
 {item.children.map((child) => (
 <div key={child.id} className="px-1">
 <HeaderNavLeaf
 item={child}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 className="block w-full rounded-lg px-3 py-2 text-left"
 />
 </div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <HeaderNavLeaf
 item={item}
 isHome={isHome}
 pathname={pathname}
 openLead={openLead}
 />
 );
}

function HeaderNavLeaf({
 item,
 isHome,
 pathname,
 openLead,
 variant = "desktop",
 className = "",
 onNavigate,
}: {
 item: HeaderNavItem;
 isHome: boolean;
 pathname: string;
 openLead?: (options: OpenLeadOptions) => void;
 variant?: "desktop" | "mobile";
 className?: string;
 onNavigate?: () => void;
}) {
 const linkClass = variant === "mobile" ? mobileLinkClass : navLinkClass;
 const activeClass = variant === "mobile" ? mobileActiveClass : navActiveClass;
 const emphasisClass =
 variant === "mobile"
 ? "text-sm font-medium text-[var(--ink)]"
 : navEmphasisClass;

 const afterClick = () => onNavigate?.();

 if (item.action) {
 const emphasis = item.action === "general-shortlist";
 return (
 <button
 type="button"
 onClick={() => {
 openLead?.({
 action: item.action!,
 shopperIntent: `Navigation: ${item.label}`,
 });
 afterClick();
 }}
 className={`${emphasis ? emphasisClass : linkClass} ${className}`}
 >
 {item.label}
 </button>
 );
 }

 const href = item.href;
 if (!href) {
 return (
 <span className={`${linkClass} ${className}`}>{item.label}</span>
 );
 }

 const isRouteActive =
 item.linkKind === "route" &&
 (pathname === href || (href !== "/" && pathname.startsWith(href)));

 if (isRouteActive) {
 return (
 <span className={`${activeClass} ${className}`}>{item.label}</span>
 );
 }

 if (item.linkKind === "hash") {
 const targetId = scrollTargetId(href);
 if (isHome) {
 return (
 <button
 type="button"
 onClick={() => {
 scrollToId(targetId);
 afterClick();
 }}
 className={`${linkClass} ${className}`}
 >
 {item.label}
 </button>
 );
 }
 return (
 <Link
 href={homeHashHref(href)}
 className={`${linkClass} ${className}`}
 onClick={afterClick}
 >
 {item.label}
 </Link>
 );
 }

 if (item.linkKind === "external" || item.opensInNewTab) {
 return (
 <a
 href={href}
 target="_blank"
 rel="noopener noreferrer"
 className={`${linkClass} ${className}`}
 onClick={afterClick}
 >
 {item.label}
 </a>
 );
 }

 return (
 <Link href={href} className={`${linkClass} ${className}`} onClick={afterClick}>
 {item.label}
 </Link>
 );
}
