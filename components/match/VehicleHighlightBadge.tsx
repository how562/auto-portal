import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";

interface VehicleHighlightBadgeProps {
  badge: BadgeKind;
  label: string;
  className?: string;
}

export function VehicleHighlightBadge({
  badge,
  label,
  className = "",
}: VehicleHighlightBadgeProps) {
  const isTop = badge === "top-match";

  return (
    <span
      className={`absolute left-3 top-3 z-[1] rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        isTop
          ? "bg-[var(--gold)] text-white"
          : "border border-[var(--line-dark)] bg-white text-[var(--ink)]"
      } ${className}`.trim()}
    >
      {label}
    </span>
  );
}
