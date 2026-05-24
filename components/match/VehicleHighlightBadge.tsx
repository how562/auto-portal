import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";

interface VehicleHighlightBadgeProps {
  badge: BadgeKind;
  label: string;
  className?: string;
  /** When true, badge flows in document (e.g. hero overlay) instead of absolute on image. */
  inline?: boolean;
}

export function VehicleHighlightBadge({
  badge,
  label,
  className = "",
  inline = false,
}: VehicleHighlightBadgeProps) {
  const isTop = badge === "top-match";

  return (
    <span
      className={`${inline ? "relative" : "absolute left-3 top-3 z-[1]"} rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] shadow-sm backdrop-blur-sm ${
        isTop
          ? "bg-[var(--gold)]/95 text-white ring-1 ring-white/20"
          : "border border-white/30 bg-white/90 text-[var(--ink)]"
      } ${className}`.trim()}
    >
      {label}
    </span>
  );
}
