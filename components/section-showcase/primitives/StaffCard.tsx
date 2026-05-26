import type { StaffMember } from "@/components/cms/presets/staff/types";
import { StaffAvatar } from "./StaffAvatar";

export function StaffCard({
  member,
  variant = "grid",
}: {
  member: StaffMember;
  variant?: "grid" | "compact" | "spotlight";
}) {
  const initials = member.photoLabel ?? member.name.slice(0, 2).toUpperCase();

  if (variant === "compact") {
    return (
      <article className="flex gap-4 border-b border-[var(--line)] py-5 last:border-0 sm:gap-5">
        <StaffAvatar label={initials} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold tracking-tight text-[var(--ink)]">{member.name}</h3>
          <p className="text-sm text-[var(--gold)]">{member.role}</p>
          {member.location ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{member.location}</p>
          ) : null}
          {member.email ? (
            <p className="mt-2 text-xs text-[var(--muted)]">{member.email}</p>
          ) : null}
        </div>
      </article>
    );
  }

  if (variant === "spotlight") {
    return (
      <article className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <StaffAvatar label={initials} size="lg" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            {member.department}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            {member.name}
          </h3>
          <p className="mt-1 text-base font-medium text-[var(--muted)]">{member.role}</p>
          {member.location ? (
            <p className="mt-2 text-sm text-[var(--muted)]">{member.location}</p>
          ) : null}
          {member.bio ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              {member.bio}
            </p>
          ) : null}
          {(member.email || member.phone) && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--ink)]">
              {member.email ? <span>{member.email}</span> : null}
              {member.phone ? <span>{member.phone}</span> : null}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--line-dark)] bg-white p-5 shadow-[var(--shadow-tight)] sm:p-6">
      <StaffAvatar label={initials} />
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--ink)]">{member.name}</h3>
      <p className="mt-1 text-sm font-medium text-[var(--gold)]">{member.role}</p>
      {member.location ? (
        <p className="mt-2 text-xs text-[var(--muted)]">{member.location}</p>
      ) : null}
      {member.bio ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
          {member.bio}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      {member.email ? (
        <p className="mt-4 truncate text-xs text-[var(--muted)]">{member.email}</p>
      ) : null}
    </article>
  );
}
