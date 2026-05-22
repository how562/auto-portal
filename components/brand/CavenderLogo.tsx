import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

const LOGO_SRC = "/brand/cavender-auto-group.png";

type CavenderLogoSize = "header" | "footer" | "hero" | "watermark";

const SIZE_CLASS: Record<CavenderLogoSize, string> = {
  header: "h-7 w-[148px] sm:h-8 sm:w-[168px]",
  footer: "h-9 w-[180px]",
  hero: "h-10 w-[200px] sm:h-11 sm:w-[220px]",
  watermark: "h-24 w-[min(90vw,28rem)] sm:h-32",
};

interface CavenderLogoProps {
  /**
   * dark = logo on light backgrounds (cream header); mask renders ink wordmark, no black plate.
   * light = logo on dark backgrounds (footer, hero panel); PNG as provided.
   */
  variant?: "dark" | "light";
  size?: CavenderLogoSize;
  className?: string;
  href?: string;
  priority?: boolean;
}

function LogoOnLight({ size, className }: { size: CavenderLogoSize; className: string }) {
  return (
    <span
      role="img"
      aria-label={BRAND_NAME}
      className={[
        "block shrink-0 bg-[var(--ink)]",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        WebkitMaskImage: `url(${LOGO_SRC})`,
        maskImage: `url(${LOGO_SRC})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}

function LogoOnDark({
  size,
  className,
  priority,
}: {
  size: CavenderLogoSize;
  className: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={420}
      height={52}
      fetchPriority={priority ? "high" : undefined}
      className={[
        "block max-w-none object-contain object-left",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function CavenderLogo({
  variant = "dark",
  size = "header",
  className = "",
  href,
  priority = false,
}: CavenderLogoProps) {
  const onLight = variant === "dark";
  const mark = onLight ? (
    <LogoOnLight size={size} className={className} />
  ) : (
    <LogoOnDark size={size} className={className} priority={priority} />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {mark}
      </Link>
    );
  }

  return mark;
}
