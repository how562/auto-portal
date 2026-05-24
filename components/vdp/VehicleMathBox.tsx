"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { buildPricingMathbox } from "@/lib/buildPricingMathbox";
import { NO_PRICE_LABEL } from "@/lib/format";
import type {
  PricingMathboxConfigRow,
  ResolvedMathboxGroup,
  ResolvedMathboxLine,
} from "@/lib/pricingMathboxTypes";
import type { VehicleDetail } from "@/lib/types";

interface VehicleMathBoxProps {
  vehicle: VehicleDetail;
  mathboxConfig: PricingMathboxConfigRow[];
}

function lineValueClass(lineType: ResolvedMathboxLine["lineType"]): string {
  if (lineType === "discount") return "text-emerald-700";
  if (lineType === "charge") return "text-[var(--muted)]";
  if (lineType === "final") return "text-[var(--ink)]";
  return "text-[var(--muted)]";
}

function PricingRow({
  line,
  resolveText,
}: {
  line: ResolvedMathboxLine;
  resolveText: (line: ResolvedMathboxLine) => string;
}) {
  if (line.lineType === "info" && !line.label) {
    const text = resolveText(line);
    if (!text) return null;
    return (
      <p className="py-2.5 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
    );
  }

  const bold = line.lineType === "final" || line.lineType === "subtotal";

  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span
        className={`text-sm ${bold ? "font-semibold text-[var(--ink)]" : "text-[var(--muted)]"}`}
      >
        {line.label}
      </span>
      <span
        className={`text-sm tabular-nums ${bold ? "text-lg font-bold" : "font-semibold"} ${lineValueClass(line.lineType)}`}
      >
        {line.displayValue}
      </span>
    </div>
  );
}

function ConditionalGroup({
  group,
  resolveText,
}: {
  group: ResolvedMathboxGroup;
  resolveText: (line: ResolvedMathboxLine) => string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(!group.collapseByDefault);

  const infoLine = group.lines.find((line) => line.lineType === "info");
  const incentiveLines = group.lines.filter((line) => line.lineType !== "info");

  if (infoLine && incentiveLines.length === 0) {
    const text = resolveText(infoLine);
    if (!text) return null;
    return (
      <div className="border-t border-[var(--line)] py-3">
        <p className="text-sm text-[var(--muted)]">{text}</p>
      </div>
    );
  }

  if (incentiveLines.length === 0) return null;

  return (
    <div className="border-t border-[var(--line)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:text-[var(--ink)]"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--ink)]">
          {t("vdp.math.conditionalOffers", "Conditional Offers")}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open ? (
        <ul className="space-y-2 pb-3">
          {incentiveLines.map((line) => (
            <li
              key={line.lineKey}
              className="flex items-start justify-between gap-3 rounded-md bg-[var(--cream)] px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-[var(--ink)]">{line.label}</span>
                {line.description ? (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{line.description}</p>
                ) : null}
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-emerald-700">
                {line.displayValue}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MathboxGroupSection({
  group,
  resolveText,
}: {
  group: ResolvedMathboxGroup;
  resolveText: (line: ResolvedMathboxLine) => string;
}) {
  if (group.groupName === "conditional") {
    return <ConditionalGroup group={group} resolveText={resolveText} />;
  }

  return (
    <>
      {group.lines.map((line) => (
        <PricingRow key={line.lineKey} line={line} resolveText={resolveText} />
      ))}
    </>
  );
}

export function VehicleMathBox({ vehicle, mathboxConfig }: VehicleMathBoxProps) {
  const { t, locale } = useLanguage();

  const result = useMemo(
    () => buildPricingMathbox(vehicle, mathboxConfig, locale),
    [vehicle, mathboxConfig, locale],
  );

  function resolveLineText(line: ResolvedMathboxLine): string {
    if (line.disclaimerText?.trim()) return line.disclaimerText.trim();
    if (line.disclaimerKey) {
      return t(line.disclaimerKey as Parameters<typeof t>[0]);
    }
    return line.displayValue;
  }

  if (!result.hasPrice) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)]/60 p-4">
        <p className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {NO_PRICE_LABEL}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {t("vdp.math.callForPriceBody")}
        </p>
      </div>
    );
  }

  const bodyGroups = result.groups.filter((g) => g.groupName !== "final");
  const finalGroups = result.groups.filter((g) => g.groupName === "final");

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)]/40 p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
        {t("vdp.math.eyebrow", "Price breakdown")}
      </p>

      <div className="mt-3 divide-y divide-[var(--line)]">
        {bodyGroups.map((group) => (
          <div key={group.groupName}>
            <MathboxGroupSection group={group} resolveText={resolveLineText} />
          </div>
        ))}
      </div>

      {finalGroups.length > 0 ? (
        <div className="mt-1 divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {finalGroups.map((group) => (
            <div key={group.groupName}>
              <MathboxGroupSection group={group} resolveText={resolveLineText} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
