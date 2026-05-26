import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import type { StaffSectionCopy } from "./types";

export function StaffSectionHeader({ copy }: { copy: StaffSectionCopy }) {
  if (!copy.eyebrow && !copy.headline && !copy.body) return null;

  return (
    <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
      {copy.eyebrow ? <SectionEyebrow className="mb-4">{copy.eyebrow}</SectionEyebrow> : null}
      {copy.headline ? (
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          {copy.headline}
        </h2>
      ) : null}
      {copy.body ? (
        <p className="mt-5 text-base leading-relaxed text-[var(--muted)]">{copy.body}</p>
      ) : null}
    </header>
  );
}
