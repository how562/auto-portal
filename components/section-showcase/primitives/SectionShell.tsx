import { DevSectionLabel } from "./DevSectionLabel";

export function SectionShell({
  children,
  className = "",
  dark = false,
  fullBleed = false,
  devLabel,
  pad = "default",
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  fullBleed?: boolean;
  devLabel?: string;
  pad?: "default" | "tight" | "hero" | "none";
}) {
  const padClass =
    pad === "hero"
      ? "py-20 sm:py-24 lg:py-28"
      : pad === "tight"
        ? "section-pad-tight"
        : pad === "none"
          ? ""
          : "section-pad";

  const inner = fullBleed ? children : <div className="portal-container">{children}</div>;

  return (
    <section
      className={`relative ${padClass} ${dark ? "bg-[var(--charcoal)] text-white" : ""} ${className}`.trim()}
    >
      {devLabel ? <DevSectionLabel label={devLabel} /> : null}
      {inner}
    </section>
  );
}
