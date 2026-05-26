import type { StaffMember } from "@/components/cms/presets/staff/types";

/** Placeholder roster — simulates CMS `staff_members[]` repeater. */
export const SHOWCASE_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "1",
    name: "Jordan Ellis",
    role: "General Manager",
    department: "Leadership",
    location: "Coastal flagship",
    bio: "Fifteen years guiding multi-store operations and guest experience standards.",
    email: "j.ellis@example.com",
    phone: "(555) 201-1100",
    photoLabel: "JE",
  },
  {
    id: "2",
    name: "Morgan Chen",
    role: "Sales Director",
    department: "Sales",
    location: "Region-wide",
    bio: "Focused on transparent pricing and lifestyle-first vehicle matching.",
    email: "m.chen@example.com",
    photoLabel: "MC",
  },
  {
    id: "3",
    name: "Alex Rivera",
    role: "Senior Product Specialist",
    department: "Sales",
    location: "Downtown store",
    email: "a.rivera@example.com",
    photoLabel: "AR",
  },
  {
    id: "4",
    name: "Sam Okonkwo",
    role: "Service Manager",
    department: "Service",
    location: "Inland service center",
    bio: "ASE-certified team lead for maintenance and warranty workflows.",
    email: "s.okonkwo@example.com",
    phone: "(555) 201-1142",
    photoLabel: "SO",
  },
  {
    id: "5",
    name: "Taylor Brooks",
    role: "Master Technician",
    department: "Service",
    location: "Inland service center",
    photoLabel: "TB",
  },
  {
    id: "6",
    name: "Riley Park",
    role: "Client Experience Lead",
    department: "Guest experience",
    location: "Coastal flagship",
    bio: "Coordinates test drives, delivery, and post-sale follow-up.",
    email: "r.park@example.com",
    photoLabel: "RP",
  },
];

export function staffByDepartment(
  members: StaffMember[],
): { department: string; members: StaffMember[] }[] {
  const map = new Map<string, StaffMember[]>();
  for (const m of members) {
    const list = map.get(m.department) ?? [];
    list.push(m);
    map.set(m.department, list);
  }
  return Array.from(map.entries()).map(([department, deptMembers]) => ({
    department,
    members: deptMembers,
  }));
}
