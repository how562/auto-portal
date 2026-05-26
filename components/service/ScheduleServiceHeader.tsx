import type { ScheduleServicePageContent } from "@/lib/serviceSchedulingTypes";

export function ScheduleServiceHeader({ content }: { content: ScheduleServicePageContent }) {
  return (
    <header className="border-b border-[var(--line)] bg-gradient-to-b from-[var(--cream-dark)] to-[var(--cream)]">
      <div className="portal-container py-10 sm:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          {content.eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
          {content.headline}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {content.body}
        </p>
      </div>
    </header>
  );
}
