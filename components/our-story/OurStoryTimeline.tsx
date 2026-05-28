"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { OurStoryMilestone } from "@/lib/ourStoryPageContent";
import { OurStoryMilestoneCard } from "@/components/our-story/OurStoryMilestoneCard";
import { OurStoryTimelineVertical } from "@/components/our-story/OurStoryTimelineVertical";

const MOBILE_MAX = 767;

interface OurStoryTimelineProps {
  eyebrow: string;
  title: string;
  intro?: string;
  finaleTagline?: string;
  milestones: OurStoryMilestone[];
}

export function OurStoryTimeline({
  eyebrow,
  title,
  intro,
  finaleTagline,
  milestones,
}: OurStoryTimelineProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const skipTargetId = useId().replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [useVertical, setUseVertical] = useState<boolean | null>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const count = milestones.length;
  const lastIndex = Math.max(count - 1, 0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const viewportWidth = window.innerWidth;
    const trackWidth = track.scrollWidth;
    setMaxTranslate(Math.max(trackWidth - viewportWidth, 0));
  }, []);

  useLayoutEffect(() => {
    const mobileMq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setUseVertical(mobileMq.matches || motionMq.matches);
    };

    updateMode();
    mobileMq.addEventListener("change", updateMode);
    motionMq.addEventListener("change", updateMode);
    return () => {
      mobileMq.removeEventListener("change", updateMode);
      motionMq.removeEventListener("change", updateMode);
    };
  }, []);

  useEffect(() => {
    if (useVertical !== false) return;
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [useVertical, measure, count]);

  useEffect(() => {
    if (useVertical !== false) return;

    const zone = zoneRef.current;
    const track = trackRef.current;
    if (!zone || !track) return;

    const onScroll = () => {
      const rect = zone.getBoundingClientRect();
      const scrollable = zone.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 1));
      const ratio = scrollable > 0 ? scrolled / scrollable : 0;
      const translate = ratio * maxTranslate;

      track.style.transform = `translate3d(-${translate}px, 0, 0)`;
      setProgressPct(ratio * 100);

      const index =
        lastIndex === 0 ? 0 : Math.min(lastIndex, Math.round(ratio * lastIndex));
      setActiveIndex(index);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [useVertical, maxTranslate, lastIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const zone = zoneRef.current;
      if (!zone || useVertical !== false) return;

      const clamped = Math.min(Math.max(index, 0), lastIndex);
      const scrollable = zone.offsetHeight - window.innerHeight;
      const ratio = lastIndex === 0 ? 0 : clamped / lastIndex;
      const top = zone.offsetTop + ratio * Math.max(scrollable, 0);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      setActiveIndex(clamped);
    },
    [lastIndex, useVertical],
  );

  useEffect(() => {
    if (useVertical !== false) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const zone = zoneRef.current;
      if (!zone) return;

      const rect = zone.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      event.preventDefault();
      if (event.key === "ArrowLeft") scrollToIndex(activeIndex - 1);
      if (event.key === "ArrowRight") scrollToIndex(activeIndex + 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, scrollToIndex, useVertical]);

  return (
    <div className="story-timeline-stage">
      <div className="story-timeline-intro">
        <div className="portal-container">
          <p className="story-timeline-intro__eyebrow">{eyebrow}</p>
          <h2 className="story-timeline-intro__title">{title}</h2>
          {intro ? <p className="story-timeline-intro__lead">{intro}</p> : null}
          {useVertical === false ? (
            <a href={`#${skipTargetId}`} className="story-timeline-skip">
              Skip timeline
            </a>
          ) : null}
        </div>
      </div>

      {useVertical === false ? (
        <div
          ref={zoneRef}
          className="story-timeline-zone"
          style={{ height: `${Math.max(count, 1) * 100}vh` }}
          aria-label="Company history timeline"
        >
          <div className="story-timeline-sticky">
            <div className="story-timeline-chrome">
              <div
                className="story-timeline-progress"
                role="tablist"
                aria-label="Timeline years"
              >
                {milestones.map((milestone, index) => (
                  <button
                    key={milestone.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`${milestone.year}, ${milestone.title}`}
                    className={`story-timeline-progress__year ${
                      index === activeIndex ? "is-active" : ""
                    }`}
                    onClick={() => scrollToIndex(index)}
                  >
                    {milestone.shortLabel ?? milestone.year}
                  </button>
                ))}
              </div>
              <div className="story-timeline-nav" aria-label="Timeline navigation">
                <button
                  type="button"
                  className="story-timeline-nav__btn"
                  aria-label="Previous milestone"
                  disabled={activeIndex <= 0}
                  onClick={() => scrollToIndex(activeIndex - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="story-timeline-nav__btn"
                  aria-label="Next milestone"
                  disabled={activeIndex >= lastIndex}
                  onClick={() => scrollToIndex(activeIndex + 1)}
                >
                  →
                </button>
              </div>
            </div>

            <div className="story-timeline-viewport">
              <div ref={trackRef} className="story-timeline-track">
                {milestones.map((milestone, index) => (
                  <OurStoryMilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    reverse={index % 2 === 1}
                  />
                ))}
              </div>
              <div
                className="story-timeline-bar"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      ) : useVertical === true ? (
        <OurStoryTimelineVertical
          milestones={milestones}
          finaleTagline={finaleTagline}
        />
      ) : null}

      {useVertical === false && finaleTagline ? (
        <div className="story-timeline-horizon-finale portal-container">
          <p className="story-timeline-horizon-finale__tagline">{finaleTagline}</p>
        </div>
      ) : null}

      <div id={skipTargetId} tabIndex={-1} className="sr-only">
        End of timeline
      </div>
    </div>
  );
}
