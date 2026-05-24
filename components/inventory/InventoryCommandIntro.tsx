"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface InventoryCommandIntroProps {
  vehicleCount: number;
  lifeTitle?: string | null;
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line-dark)] bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] shadow-tight">
      {children}
    </span>
  );
}

export function InventoryCommandIntro({
  vehicleCount,
  lifeTitle,
}: InventoryCommandIntroProps) {
  const { t } = useLanguage();
  const countLabel =
    vehicleCount === 1
      ? t("inventory.command.vehicleSingular")
      : t("inventory.command.vehiclePlural");

  return (
    <header className="space-y-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <li>
            <Link
              href="/"
              className="transition hover:text-[var(--ink)]"
            >
              {t("vdp.home")}
            </Link>
          </li>
          <li aria-hidden className="text-[var(--line-dark)]">
            /
          </li>
          <li className="font-medium text-[var(--ink)]">
            {t("vdp.inventory")}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="headline-stack text-2xl sm:text-3xl lg:text-4xl">
            {lifeTitle ?? t("inventory.command.title")}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
            {t("inventory.command.subtitle")}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--ink)]">
          <span className="text-xl sm:text-2xl">{vehicleCount.toLocaleString()}</span>{" "}
          <span className="font-normal text-[var(--muted)]">{countLabel}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge>{t("inventory.command.badgeLive")}</StatusBadge>
        <StatusBadge>{t("inventory.command.badgeUpdated")}</StatusBadge>
        <StatusBadge>{t("inventory.command.badgePrioritized")}</StatusBadge>
      </div>
    </header>
  );
}
