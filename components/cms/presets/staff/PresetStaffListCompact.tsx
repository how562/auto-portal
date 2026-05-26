/**
 * @preset staff_list_compact — dense list for large rosters
 */
import { StaffCard } from "@/components/section-showcase/primitives/StaffCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_STAFF_MEMBERS } from "@/lib/staffShowcaseData";
import { cardMemoNarrow } from "@/lib/cardClasses";
import { StaffSectionHeader } from "./StaffSectionHeader";
import type { StaffMember, StaffSectionCopy } from "./types";

export function PresetStaffListCompact({
  members = SHOWCASE_STAFF_MEMBERS,
  copy = {
    eyebrow: "Directory",
    headline: "Store contacts",
    body: "Compact rows scale to long staff lists — filterable by location in CMS later.",
  },
  devLabel = "Staff 04 — Dynamic compact list",
}: {
  members?: StaffMember[];
  copy?: StaffSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <StaffSectionHeader copy={copy} />
      <div className={cardMemoNarrow}>
        {members.map((member) => (
          <StaffCard key={member.id} member={member} variant="compact" />
        ))}
      </div>
    </SectionShell>
  );
}
