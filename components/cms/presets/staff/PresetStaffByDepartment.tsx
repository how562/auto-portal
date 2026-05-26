/**
 * @preset staff_by_department — groups staff_members[] by department field
 */
import { StaffCard } from "@/components/section-showcase/primitives/StaffCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_STAFF_MEMBERS, staffByDepartment } from "@/lib/staffShowcaseData";
import { StaffSectionHeader } from "./StaffSectionHeader";
import type { StaffMember, StaffSectionCopy } from "./types";

export function PresetStaffByDepartment({
  members = SHOWCASE_STAFF_MEMBERS,
  copy = {
    eyebrow: "By department",
    headline: "Experts across every lane",
    body: "Automatically groups repeater items by the department field — ideal for store org charts.",
  },
  devLabel = "Staff 02 — Dynamic by department",
}: {
  members?: StaffMember[];
  copy?: StaffSectionCopy;
  devLabel?: string;
}) {
  const groups = staffByDepartment(members);

  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <StaffSectionHeader copy={copy} />
      <div className="space-y-14 sm:space-y-16">
        {groups.map((group) => (
          <section key={group.department}>
            <h3 className="border-b border-[var(--line)] pb-3 text-xl font-semibold tracking-tight text-[var(--ink)]">
              {group.department}
              <span className="ml-2 text-sm font-medium text-[var(--muted)]">
                ({group.members.length})
              </span>
            </h3>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.members.map((member) => (
                <li key={member.id}>
                  <StaffCard member={member} variant="grid" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SectionShell>
  );
}
