/** @preset timeline_horizontal */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import {
  SHOWCASE_TIMELINE,
  type TimelineEventItem,
} from "@/lib/showcaseProcessTimelineData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetTimelineHorizontal({
  events = SHOWCASE_TIMELINE,
  copy = {
    eyebrow: "Timeline",
    headline: "Growth at a glance",
    body: "Horizontal layout for desktop; scrolls cleanly on smaller screens.",
  },
  devLabel = "Timeline 02 — Horizontal",
}: {
  events?: TimelineEventItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <div className="relative overflow-x-auto pb-4 scrollbar-none">
        <ol className="flex min-w-[48rem] gap-0 px-1">
          {events.map((event, index) => (
            <li
              key={event.id}
              className="relative flex-1 px-4 first:pl-0 last:pr-0"
            >
              {index < events.length - 1 ? (
                <span
                  className="absolute left-1/2 top-3 h-px w-full bg-[var(--line-dark)]"
                  aria-hidden
                />
              ) : null}
              <div className="relative flex flex-col items-center text-center">
                <span className="relative z-10 mb-4 flex h-6 w-6 rounded-full border-2 border-[var(--ink)] bg-white" />
                <time className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                  {event.date}
                </time>
                <h3 className="mt-2 text-base font-semibold text-[var(--ink)]">{event.title}</h3>
                <p className="mt-2 max-w-[12rem] text-xs leading-relaxed text-[var(--muted)]">
                  {event.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
