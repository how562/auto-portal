import {
  getPlaceholderLabel,
  getPlaceholderTheme,
  type PlaceholderTheme,
} from "@/lib/vehicleImage";

export type VehicleImagePlaceholderSize = "sm" | "md" | "lg" | "hero";

const SIZE_STYLES: Record<
  VehicleImagePlaceholderSize,
  { silhouette: string; year: string; title: string; badge: string }
> = {
  sm: {
    silhouette: "h-[42%] w-[72%]",
    year: "text-[10px]",
    title: "text-sm",
    badge: "text-[9px] px-2 py-1",
  },
  md: {
    silhouette: "h-[48%] w-[76%]",
    year: "text-[11px]",
    title: "text-base sm:text-lg",
    badge: "text-[9px] px-2.5 py-1",
  },
  lg: {
    silhouette: "h-[52%] w-[78%]",
    year: "text-xs",
    title: "text-lg sm:text-xl",
    badge: "text-[10px] px-3 py-1.5",
  },
  hero: {
    silhouette: "h-[54%] w-[80%]",
    year: "text-xs sm:text-sm",
    title: "text-xl sm:text-2xl",
    badge: "text-[10px] px-3 py-1.5",
  },
};

const THEME_STYLES: Record<
  PlaceholderTheme,
  { gradient: string; accent: string; line: string; text: string; badge: string }
> = {
  truck: {
    gradient: "from-[#2e2a26] via-[#1f1c19] to-[#121110]",
    accent: "bg-stone-500/25",
    line: "bg-stone-400/20",
    text: "text-stone-100",
    badge: "bg-stone-900/50 text-stone-200 ring-stone-500/30",
  },
  suv: {
    gradient: "from-[#4a3f32] via-[#352c22] to-[#1f1a15]",
    accent: "bg-amber-600/20",
    line: "bg-amber-200/15",
    text: "text-amber-50",
    badge: "bg-black/35 text-amber-100 ring-amber-400/25",
  },
  sedan: {
    gradient: "from-[#2a3542] via-[#1e2833] to-[#121820]",
    accent: "bg-sky-400/15",
    line: "bg-sky-200/12",
    text: "text-sky-50",
    badge: "bg-black/35 text-sky-100 ring-sky-300/20",
  },
  luxury: {
    gradient: "from-[#2a2824] via-[#1a1917] to-[#0c0c0c]",
    accent: "bg-[var(--gold)]/25",
    line: "bg-[var(--gold-soft)]/20",
    text: "text-[var(--gold-soft)]",
    badge: "bg-black/40 text-[var(--gold-soft)] ring-[var(--gold)]/35",
  },
  default: {
    gradient: "from-[var(--cream-dark)] via-[#ddd6cb] to-[var(--charcoal-soft)]",
    accent: "bg-[var(--ink)]/8",
    line: "bg-[var(--ink)]/6",
    text: "text-[var(--ink)]",
    badge: "bg-white/80 text-[var(--muted)] ring-[var(--line-dark)]",
  },
};

function VehicleSilhouette({ theme }: { theme: PlaceholderTheme }) {
  const stroke =
    theme === "default" ? "rgba(12,12,12,0.18)" : "rgba(255,255,255,0.22)";

  return (
    <svg
      viewBox="0 0 200 80"
      className="h-full w-full"
      aria-hidden
      fill="none"
    >
      <path
        d="M28 52h144l-10-22H38l-10 22zm12-22l8-14h96l8 14M52 52a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm96 0a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 38h112"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export interface VehicleImagePlaceholderProps {
  make?: string | null;
  model?: string | null;
  bodyStyle?: string | null;
  year?: number | null;
  className?: string;
  size?: VehicleImagePlaceholderSize;
}

export function VehicleImagePlaceholder({
  make,
  model,
  bodyStyle,
  year,
  className = "",
  size = "md",
}: VehicleImagePlaceholderProps) {
  const theme = getPlaceholderTheme(bodyStyle, make, model);
  const styles = THEME_STYLES[theme];
  const sizeStyles = SIZE_STYLES[size];
  const label = getPlaceholderLabel(year, make, model);
  const showYear = year != null && String(year).trim() !== "";
  const titleLine = [make, model].filter(Boolean).join(" ") || "Vehicle";

  return (
    <div
      role="img"
      aria-label={`${label} — image coming soon`}
      className={`relative h-full w-full min-h-[140px] overflow-hidden bg-gradient-to-br ${styles.gradient} ${className}`.trim()}
    >
      <div
        className={`pointer-events-none absolute -right-8 top-8 h-32 w-32 rounded-full ${styles.accent} blur-2xl`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-6 bottom-12 h-24 w-24 rounded-full ${styles.accent} blur-xl`}
        aria-hidden
      />

      <div className="absolute inset-0 opacity-60" aria-hidden>
        <div
          className={`absolute left-[8%] top-[18%] h-px w-[55%] ${styles.line}`}
        />
        <div
          className={`absolute right-[10%] top-[32%] h-px w-[40%] ${styles.line}`}
        />
        <div
          className={`absolute left-[15%] bottom-[28%] h-px w-[50%] ${styles.line}`}
        />
      </div>

      <div
        className={`absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center ${sizeStyles.silhouette}`}
        aria-hidden
      >
        <VehicleSilhouette theme={theme} />
      </div>

      <div className="absolute left-4 right-4 bottom-4 z-10 sm:left-5 sm:bottom-5">
        {showYear ? (
          <p
            className={`font-semibold uppercase tracking-[0.2em] opacity-70 ${sizeStyles.year} ${styles.text}`}
          >
            {year}
          </p>
        ) : null}
        <p className={`mt-1 font-semibold tracking-tight ${sizeStyles.title} ${styles.text}`}>
          {titleLine}
        </p>
      </div>

      <span
        className={`absolute right-3 top-3 z-10 rounded-full font-semibold uppercase tracking-[0.18em] ring-1 backdrop-blur-sm ${sizeStyles.badge} ${styles.badge}`}
      >
        Image coming soon
      </span>
    </div>
  );
}
