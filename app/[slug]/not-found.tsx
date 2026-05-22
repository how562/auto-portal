"use client";

import Link from "next/link";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { btnPrimaryMd } from "@/lib/buttonClasses";

export default function CMSNotFound() {
  const { t } = useLanguage();

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <PortalHeader />
        <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-4 pt-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            {t("notFound.cms.eyebrow")}
          </p>
          <h1 className="mt-4 headline-stack text-4xl">
            {t("notFound.cms.title")}
          </h1>
          <p className="mt-4 max-w-md text-[var(--muted)]">
            {t("notFound.cms.body")}
          </p>
          <Link href="/" className={`mt-8 ${btnPrimaryMd}`}>
            {t("notFound.backHome")}
          </Link>
        </main>
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
