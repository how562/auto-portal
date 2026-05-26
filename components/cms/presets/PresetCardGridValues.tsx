/** @preset card_grid_values — saved */
import { CardGrid } from "@/components/section-showcase/primitives/CardGrid";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

const CARDS = [
  { iconLabel: "01", title: "Transparent pricing", body: "Clear numbers up front — no surprise fees at signing." },
  { iconLabel: "02", title: "Certified technicians", body: "Factory-trained teams across every service lane." },
  { iconLabel: "03", title: "Local ownership", body: "Decisions made here, invested back into our communities." },
  { iconLabel: "04", title: "Guided discovery", body: "Match lifestyle, budget, and timing before you visit." },
];

export function PresetCardGridValues({
  devLabel = "Section 07 — Card Grid / Values",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <CardGrid
        eyebrow="Our promises"
        headline="Values that scale across every store"
        cards={CARDS}
        columns={4}
      />
    </SectionShell>
  );
}
