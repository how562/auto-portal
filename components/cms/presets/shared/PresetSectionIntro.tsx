import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";

export interface PresetSectionCopy {
  eyebrow?: string;
  headline?: string;
  body?: string;
}

export function PresetSectionIntro({
  copy,
  align = "center",
  onDark = false,
  className = "",
}: {
  copy: PresetSectionCopy;
  align?: "center" | "left";
  onDark?: boolean;
  className?: string;
}) {
  if (!copy.eyebrow && !copy.headline && !copy.body) return null;

  return (
    <header
      className={`mb-10 sm:mb-12 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`.trim()}
    >
      {copy.eyebrow ? (
        <SectionEyebrow onDark={onDark} className="mb-4">
          {copy.eyebrow}
        </SectionEyebrow>
      ) : null}
      {copy.headline ? (
        <h2
          className={`text-balance text-3xl font-semibold tracking-tight sm:text-4xl ${
            onDark ? "text-white" : "text-[var(--ink)]"
          }`}
        >
          {copy.headline}
        </h2>
      ) : null}
      {copy.body ? (
        <p
          className={`mt-5 text-base leading-relaxed ${onDark ? "text-white/75" : "text-[var(--muted)]"}`}
        >
          {copy.body}
        </p>
      ) : null}
    </header>
  );
}
