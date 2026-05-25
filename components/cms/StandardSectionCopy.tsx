import type { SectionCopy } from "@/lib/cmsSectionDisplay";

export function SectionBodyText({
  body,
  className = "mt-6",
}: {
  body: string;
  className?: string;
}) {
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length === 0) return null;

  return (
    <div
      className={`${className} space-y-4 text-base leading-relaxed text-[var(--muted)]`}
    >
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph.trim()}
        </p>
      ))}
    </div>
  );
}

interface StandardSectionCopyProps {
  copy: SectionCopy;
  headingLevel?: "h1" | "h2";
  align?: "left" | "center";
  subheadlineClassName?: string;
}

/** Defensive: always render canonical headline/body when present. */
export function StandardSectionCopy({
  copy,
  headingLevel = "h2",
  align = "left",
  subheadlineClassName = "mt-3 text-[var(--muted)]",
}: StandardSectionCopyProps) {
  const Heading = headingLevel;
  const alignClass = align === "center" ? "text-center" : "";

  return (
    <div className={alignClass}>
      {copy.eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          {copy.eyebrow}
        </p>
      ) : null}
      {copy.headline ? (
        <Heading
          className={`${copy.eyebrow ? "mt-4" : ""} headline-stack text-3xl sm:text-4xl`}
        >
          {copy.headline}
        </Heading>
      ) : null}
      {copy.subheadline ? (
        <p className={subheadlineClassName}>{copy.subheadline}</p>
      ) : null}
      {copy.body ? <SectionBodyText body={copy.body} /> : null}
    </div>
  );
}
