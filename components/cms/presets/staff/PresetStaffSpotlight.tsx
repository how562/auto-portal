/**
 * @preset staff_spotlight — featured_member_id + staff_members[] for remainder grid
 */
import { StaffCard } from "@/components/section-showcase/primitives/StaffCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_STAFF_MEMBERS } from "@/lib/staffShowcaseData";
import { StaffSectionHeader } from "./StaffSectionHeader";
import type { StaffMember, StaffSectionCopy } from "./types";

export function PresetStaffSpotlight({
  members = SHOWCASE_STAFF_MEMBERS,
  featuredId = "1",
  copy = {
    eyebrow: "Leadership",
    headline: "Spotlight & team",
    body: "Pin one featured profile, then render the remaining repeater items in a supporting grid.",
  },
  devLabel = "Staff 03 — Spotlight + grid",
}: {
  members?: StaffMember[];
  featuredId?: string;
  copy?: StaffSectionCopy;
  devLabel?: string;
}) {
  const featured = members.find((m) => m.id === featuredId) ?? members[0];
  const rest = members.filter((m) => m.id !== featured?.id);

  if (!featured) return null;

  return (
    <SectionShell devLabel={devLabel}>
      <StaffSectionHeader copy={copy} />
      <div className="rounded-md border border-[var(--line-dark)] bg-white p-6 sm:p-8 lg:p-10">
        <StaffCard member={featured} variant="spotlight" />
      </div>
      {rest.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((member) => (
            <li key={member.id}>
              <StaffCard member={member} variant="grid" />
            </li>
          ))}
        </ul>
      ) : null}
    </SectionShell>
  );
}
