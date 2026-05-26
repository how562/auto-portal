/**
 * @preset staff_grid — dynamic staff_members[] repeater, card grid
 */
import { StaffCard } from "@/components/section-showcase/primitives/StaffCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_STAFF_MEMBERS } from "@/lib/staffShowcaseData";
import { StaffSectionHeader } from "./StaffSectionHeader";
import type { StaffMember, StaffSectionCopy } from "./types";

export function PresetStaffGrid({
  members = SHOWCASE_STAFF_MEMBERS,
  copy = {
    eyebrow: "Our people",
    headline: "Meet the team",
    body: "Roster driven by a CMS repeater — add, remove, or reorder staff without redeploying.",
  },
  devLabel = "Staff 01 — Dynamic card grid",
}: {
  members?: StaffMember[];
  copy?: StaffSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <StaffSectionHeader copy={copy} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <li key={member.id}>
            <StaffCard member={member} variant="grid" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
