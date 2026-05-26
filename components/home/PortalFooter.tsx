"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FooterSocialLinks } from "@/components/home/FooterSocialLinks";
import { FooterNavGroups } from "@/components/navigation/FooterNavGroups";
import { usePortalNavigation } from "@/components/navigation/NavigationProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import type { FooterNavLink } from "@/lib/navigationTypes";
import {
  filterFooterNavigation,
  homeHashHref,
  scrollTargetId,
} from "@/lib/navigationUtils";

const LEGAL_GROUP_TITLE = "legal";

export function PortalFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();
  const { footer } = usePortalNavigation();
  const { openLead } = useLeadCapture();
  const footerNav = useMemo(() => filterFooterNavigation(footer), [footer]);

  const { mainNav, legalLinks } = useMemo(() => {
    const legalGroup = footerNav.groups.find(
      (g) => g.title.trim().toLowerCase() === LEGAL_GROUP_TITLE,
    );
    const mainGroups = footerNav.groups.filter(
      (g) => g.title.trim().toLowerCase() !== LEGAL_GROUP_TITLE,
    );
    return {
      mainNav: { groups: mainGroups },
      legalLinks: legalGroup?.items ?? [],
    };
  }, [footerNav]);

  const hasMainNav = mainNav.groups.some((g) => g.items.length > 0);
  const hasLegal = legalLinks.length > 0;

  return (
    <footer className="homepage-footer text-[var(--ink)]">
      <div className="portal-container">
        {/* Collapsible site navigation */}
        {hasMainNav ? (
          <section className="border-b border-[var(--line)]">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:text-[var(--muted)] [&::-webkit-details-marker]:hidden">
                <span>{t("footer.navToggle")}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-8 sm:grid-cols-3 lg:grid-cols-4">
                <FooterNavGroups navigation={mainNav} variant="light" />
              </div>
            </details>
          </section>
        ) : null}

        {/* Legal & copyright */}
        <section className="py-6 sm:py-8">
          {hasLegal ? (
            <nav
              className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[var(--muted)] sm:text-[13px]"
              aria-label="Legal"
            >
              {legalLinks.map((item, index) => (
                <span key={item.id} className="inline-flex items-center">
                  {index > 0 ? (
                    <span className="mx-2 text-[var(--line-dark)]" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <FooterLegalLink item={item} isHome={isHome} openLead={openLead} />
                </span>
              ))}
            </nav>
          ) : null}

          <div
            className={`homepage-footer-bar flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${
              hasLegal ? "mt-6" : ""
            }`}
          >
            <div className="homepage-footer-copyright flex min-h-9 shrink-0 items-end">
              <p
                className="text-xs leading-none text-[var(--muted)] sm:text-[13px]"
                onDoubleClick={() => router.push("/admin/login")}
              >
                Copyright © {new Date().getFullYear()} {BRAND_NAME}
              </p>
            </div>

            <div className="homepage-footer-social ml-auto flex min-h-9 flex-wrap items-end justify-end gap-x-3 gap-y-2">
              <p className="shrink-0 text-xs font-semibold leading-none tracking-tight text-[var(--ink)] sm:text-[13px]">
                {t("footer.connectWithUs")}
              </p>
              <FooterSocialLinks compact />
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}

function FooterLegalLink({
  item,
  isHome,
  openLead,
}: {
  item: FooterNavLink;
  isHome: boolean;
  openLead: ReturnType<typeof useLeadCapture>["openLead"];
}) {
  const href = item.href?.trim();
  const linkClass = "transition hover:text-[var(--ink)]";

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
          onClick={() =>
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
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
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}
