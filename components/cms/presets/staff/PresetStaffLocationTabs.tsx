"use client";

/**
 * @preset staff_location_tabs — client-side filter demo for location field (CMS-driven later)
 */
import { useMemo, useState } from "react";
import { StaffCard } from "@/components/section-showcase/primitives/StaffCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_STAFF_MEMBERS } from "@/lib/staffShowcaseData";
import { StaffSectionHeader } from "./StaffSectionHeader";
import type { StaffMember, StaffSectionCopy } from "./types";

function uniqueLocations(members: StaffMember[]): string[] {
  const set = new Set<string>();
  for (const m of members) {
    if (m.location) set.add(m.location);
  }
  return ["All locations", ...Array.from(set).sort()];
}

export function PresetStaffLocationTabs({
  members = SHOWCASE_STAFF_MEMBERS,
  copy = {
    eyebrow: "Find your specialist",
    headline: "Staff by location",
    body: "Interactive filter on the location field — wire to CMS store IDs or slugs in production.",
  },
  devLabel = "Staff 05 — Dynamic location filter",
}: {
  members?: StaffMember[];
  copy?: StaffSectionCopy;
  devLabel?: string;
}) {
  const locations = useMemo(() => uniqueLocations(members), [members]);
  const [active, setActive] = useState(locations[0] ?? "All locations");

  const filtered =
    active === "All locations"
      ? members
      : members.filter((m) => m.location === active);

  return (
    <SectionShell className="bg-[var(--cream-dark)]/25" devLabel={devLabel}>
      <StaffSectionHeader copy={copy} />
      <div
        className="mb-8 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Filter by location"
      >
        {locations.map((loc) => {
          const selected = active === loc;
          return (
            <button
              key={loc}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(loc)}
              className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                selected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line-dark)] bg-white text-[var(--ink)] hover:border-[var(--ink)]/35"
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <li key={member.id}>
            <StaffCard member={member} variant="grid" />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted)]">No staff for this location.</p>
      ) : null}
    </SectionShell>
  );
}
