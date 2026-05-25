"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { CavenderLogo } from "@/components/brand/CavenderLogo";
import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FooterNavGroups } from "@/components/navigation/FooterNavGroups";
import { usePortalNavigation } from "@/components/navigation/NavigationProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { useOptionalDiscovery } from "@/components/portal/DiscoveryContext";
import { BRAND_NAME } from "@/lib/brand";
import { btnAccentMd, btnOnDarkMd } from "@/lib/buttonClasses";
import { filterFooterNavigation } from "@/lib/navigationUtils";

export function PortalFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();
  const { footer } = usePortalNavigation();
  const footerNav = useMemo(() => filterFooterNavigation(footer), [footer]);
  const { openLead } = useLeadCapture();
  const discovery = useOptionalDiscovery();
  const scrollToGuided = discovery?.scrollToGuided;
  const footerShortlist = useCta("footer_shortlist");
  const footerDiscovery = useCta("footer_discovery_primary");
  const discoveryHref = footerDiscovery.url ?? "/#guided-discovery";

  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] text-white">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[32%] select-none opacity-[0.06]"
        aria-hidden
      >
        <CavenderLogo size="watermark" variant="light" />
      </div>

      <div className="portal-container relative py-20 sm:py-28">
        <Link href="/" className="mb-10 inline-block">
          <CavenderLogo size="footer" variant="light" />
        </Link>
        <div className="max-w-2xl">
          <h2 className="headline-stack text-3xl sm:text-5xl">
            {t("footer.headline")}
          </h2>
          <p className="mt-4 text-sm text-white/45">{t("footer.body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "general-shortlist",
                  shopperIntent: "Footer: Get my shortlist",
                })
              }
              className={btnAccentMd}
            >
              {footerShortlist.label}
            </button>
            {isHome && scrollToGuided ? (
              <button type="button" onClick={scrollToGuided} className={btnOnDarkMd}>
                {footerDiscovery.label}
              </button>
            ) : (
              <Link href={discoveryHref} className={btnOnDarkMd}>
                {footerDiscovery.label}
              </Link>
            )}
          </div>
          <p className="mt-6 text-xs text-white/35">{t("footer.trust")}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterNavGroups navigation={footerNav} />
        </div>

        <p
          className="mt-12 select-none text-[11px] text-white/25"
          onDoubleClick={() => router.push("/admin/login")}
        >
          © {new Date().getFullYear()} {BRAND_NAME}. {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
