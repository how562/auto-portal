/** @preset feature_band — saved */
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

const HIGHLIGHTS = [
  { title: "12 locations", body: "Coastal and inland stores across the region." },
  { title: "4.9 service rating", body: "Consistent care from certified technicians." },
  { title: "30+ years", body: "Family-owned group with deep community roots." },
];

export function PresetFeatureBand({
  devLabel = "Section 05 — Full-Width Feature Band",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell dark fullBleed devLabel={devLabel}>
      <div className="portal-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow onDark className="mb-4">
            Why drivers choose us
          </SectionEyebrow>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            Confidence at every step of the journey
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75">
            Full-width brand bands anchor a page with headline, supporting copy, and highlight
            cards — no photography required.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {HIGHLIGHTS.map((item) => (
            <li
              key={item.title}
              className="rounded-md border border-white/15 bg-white/5 px-6 py-8 backdrop-blur-sm"
            >
              <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {item.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
