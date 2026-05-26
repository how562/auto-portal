/** @preset timeline_vertical — timeline_events[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import {
  SHOWCASE_TIMELINE,
  type TimelineEventItem,
} from "@/lib/showcaseProcessTimelineData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetTimelineVertical({
  events = SHOWCASE_TIMELINE,
  copy = {
    eyebrow: "Our history",
    headline: "Milestones that shaped the group",
    body: "Vertical timeline for heritage, expansion, or campaign chronology.",
  },
  devLabel = "Timeline 01 — Vertical",
}: {
  events?: TimelineEventItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-[var(--cream-dark)]/30" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ol className="relative mx-auto max-w-2xl border-l-2 border-[var(--line-dark)] pl-8 sm:pl-10">
        {events.map((event) => (
          <li key={event.id} className="relative pb-10 last:pb-0">
            <span
              className="absolute -left-[2.35rem] top-1.5 flex h-4 w-4 rounded-full border-2 border-[var(--ink)] bg-white sm:-left-[2.6rem]"
              aria-hidden
            />
            <time className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
              {event.date}
            </time>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
              {event.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{event.body}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
