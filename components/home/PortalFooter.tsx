"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CavenderLogo } from "@/components/brand/CavenderLogo";
import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FooterNavGroups } from "@/components/navigation/FooterNavGroups";
import { usePortalNavigation } from "@/components/navigation/NavigationProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { useOptionalDiscovery } from "@/components/portal/DiscoveryContext";
import { BRAND_NAME } from "@/lib/brand";
import { btnAccentMd, btnOnDarkMd } from "@/lib/buttonClasses";
import type { Store } from "@/lib/types";

interface PortalFooterProps {
  stores: Store[];
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function PortalFooter({ stores }: PortalFooterProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();
  const { footer } = usePortalNavigation();
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

        {stores.length > 0 ? (
          <div id="locations-contact" className="mt-14 border-t border-white/10 pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {t("footer.locationsContact")}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <p className="font-semibold">{store.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {[store.city, store.state].filter(Boolean).join(", ") ||
                      "—"}
                  </p>
                  {store.phone ? (
                    <a
                      href={phoneHref(store.phone)}
                      className="mt-2 inline-block text-sm text-[var(--gold-soft)] transition hover:text-white"
                    >
                      {store.phone}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterNavGroups navigation={footer} />
        </div>

        <p className="mt-12 text-[11px] text-white/25">
          © {new Date().getFullYear()} {BRAND_NAME}. {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
