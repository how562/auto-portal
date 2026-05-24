import Link from "next/link";
import { MatchReasonChips } from "@/components/match/MatchReasonChips";
import { VehicleHighlightBadge } from "@/components/match/VehicleHighlightBadge";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import {
  formatConditionLabel,
  formatMileage,
  formatPrice,
  formatVehiclePrice,
  formatVehicleTitle,
  getEffectiveVehiclePrice,
  getVehicleSavingsAmount,
  NO_PRICE_LABEL,
} from "@/lib/format";
import type { Vehicle } from "@/lib/types";

/** Premium inventory card shell — hover lift + controlled glow. */
export const vehicleListingShell =
  "group/card flex flex-col overflow-hidden rounded-lg border border-[var(--line-dark)]/90 bg-white shadow-[var(--shadow-tight)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)]/40 hover:shadow-[0_14px_44px_-14px_rgba(21,42,71,0.2)]";

export const vehicleListingShellRail =
  `${vehicleListingShell} rail-card w-[min(82vw,320px)] shrink-0`;

export const vehicleListingShellRow =
  "group/card flex flex-col gap-4 overflow-hidden rounded-lg border border-[var(--line-dark)]/90 bg-white p-4 shadow-[var(--shadow-tight)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)]/35 hover:shadow-[0_12px_36px_-12px_rgba(21,42,71,0.18)] sm:flex-row sm:items-stretch sm:p-5";

export const vehicleListingImageFrame =
  "relative block overflow-hidden bg-[var(--cream-dark)]";

export const vehicleListingImageHover =
  "h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]";

const imageGradient =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100";

type ImageSize = "sm" | "md" | "lg" | "hero";

interface VehicleListingImageLinkProps {
  vehicle: Vehicle;
  href: string;
  aspectClass: string;
  placeholderSize: ImageSize;
  fetchPriority?: "high" | "low" | "auto";
  highlightBadge?: BadgeKind | null;
  highlightBadgeLabel?: string;
  matchLabel?: string;
  badgeClassName?: string;
  className?: string;
}

export function VehicleListingImageLink({
  vehicle,
  href,
  aspectClass,
  placeholderSize,
  fetchPriority,
  highlightBadge,
  highlightBadgeLabel,
  matchLabel,
  badgeClassName,
  className = "",
}: VehicleListingImageLinkProps) {
  return (
    <Link
      href={href}
      className={`${vehicleListingImageFrame} ${aspectClass} ${className}`.trim()}
    >
      <VehicleImage
        vehicle={vehicle}
        placeholderSize={placeholderSize}
        fetchPriority={fetchPriority}
        className={vehicleListingImageHover}
      />
      <span className={imageGradient} aria-hidden />
      {highlightBadge && highlightBadgeLabel ? (
        <VehicleHighlightBadge
          badge={highlightBadge}
          label={highlightBadgeLabel}
          className={badgeClassName}
        />
      ) : matchLabel ? (
        <span className="absolute left-3 top-3 z-[1] rounded-full border border-white/20 bg-[var(--ink)]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {matchLabel}
        </span>
      ) : null}
    </Link>
  );
}

type HeadingSize = "sm" | "md" | "lg";

interface VehicleListingHeadingProps {
  vehicle: Vehicle;
  href: string;
  size?: HeadingSize;
  matchChips?: string[];
  microcopy?: string;
  className?: string;
}

const titleSize: Record<HeadingSize, string> = {
  sm: "text-base sm:text-[1.05rem]",
  md: "text-lg tracking-tight",
  lg: "headline-stack text-3xl sm:text-4xl",
};

export function VehicleListingHeading({
  vehicle,
  href,
  size = "md",
  matchChips,
  microcopy,
  className = "",
}: VehicleListingHeadingProps) {
  const title = formatVehicleTitle(vehicle);

  return (
    <div className={className}>
      <Link href={href} className="block transition hover:opacity-90">
        <h3
          className={`font-semibold leading-snug text-[var(--ink)] ${titleSize[size]}`}
        >
          {title}
        </h3>
        {vehicle.trim ? (
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--muted)]">
            {vehicle.trim}
          </p>
        ) : null}
      </Link>
      {matchChips && matchChips.length > 0 ? (
        <MatchReasonChips chips={matchChips} className="mt-2" variant="subtle" />
      ) : microcopy ? (
        <p className="mt-1.5 text-xs leading-snug text-[var(--muted)]">{microcopy}</p>
      ) : null}
    </div>
  );
}

type PriceSize = "sm" | "md" | "lg";

interface VehicleListingPriceProps {
  vehicle: Vehicle;
  size?: PriceSize;
  className?: string;
}

const priceSize: Record<PriceSize, string> = {
  sm: "text-lg",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
};

export function VehicleListingPrice({
  vehicle,
  size = "md",
  className = "",
}: VehicleListingPriceProps) {
  const effective = getEffectiveVehiclePrice(vehicle);
  const savings = getVehicleSavingsAmount(vehicle);
  const isCallForPrice = effective.amount === null;

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 ${className}`.trim()}
    >
      <p
        className={`font-semibold leading-none tracking-tight ${
          isCallForPrice
            ? "text-base font-medium text-[var(--muted)]"
            : `${priceSize[size]} text-[var(--ink)]`
        }`}
      >
        {isCallForPrice ? NO_PRICE_LABEL : formatVehiclePrice(vehicle)}
      </p>
      {savings != null ? (
        <span className="inline-flex items-center rounded-full bg-[var(--gold)]/12 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink)] ring-1 ring-[var(--gold)]/25">
          Save {formatPrice(savings)}
        </span>
      ) : null}
    </div>
  );
}

interface VehicleListingMetaProps {
  vehicle: Vehicle;
  className?: string;
  /** Include dealer name (spotlight / list optional). */
  showDealer?: boolean;
}

export function VehicleListingMeta({
  vehicle,
  className = "",
  showDealer = false,
}: VehicleListingMetaProps) {
  const items: string[] = [
    formatMileage(vehicle.mileage),
    formatConditionLabel(vehicle.condition),
  ];
  if (vehicle.stock_number?.trim()) {
    items.push(`#${vehicle.stock_number.trim()}`);
  }
  if (showDealer && vehicle.dealer_name?.trim()) {
    items.push(vehicle.dealer_name.trim());
  }

  return (
    <p
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug text-[var(--muted)] ${className}`.trim()}
    >
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span className="text-[var(--line-dark)]" aria-hidden>
              ·
            </span>
          ) : null}
          <span>{item}</span>
        </span>
      ))}
    </p>
  );
}

interface VehicleListingVinProps {
  vehicle: Vehicle;
  className?: string;
}

export function VehicleListingVin({ vehicle, className = "" }: VehicleListingVinProps) {
  if (!vehicle.vin) return null;
  return (
    <p
      className={`select-text font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]/80 ${className}`.trim()}
      title={vehicle.vin}
    >
      VIN {vehicle.vin}
    </p>
  );
}
