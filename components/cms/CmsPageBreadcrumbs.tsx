"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface CmsPageBreadcrumbsProps {
  pageTitle: string;
}

export function CmsPageBreadcrumbs({ pageTitle }: CmsPageBreadcrumbsProps) {
  const { t } = useLanguage();

  return (
    <nav
      className="cms-page-breadcrumbs flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="transition hover:text-[var(--ink)]">
        {t("vdp.home")}
      </Link>
      <span aria-hidden className="text-[var(--line-dark)]">
        /
      </span>
      <span className="font-medium text-[var(--ink)]">{pageTitle}</span>
    </nav>
  );
}
