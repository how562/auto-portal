"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SocialPlatformBadge } from "@/components/home/SocialPlatformBadge";
import type { SocialFeedPost } from "@/lib/socialFeedPosts";

const AUTO_SCROLL_MS = 7000;
const CARD_SCROLL_GAP = 16;

interface SocialFeedCarouselProps {
  posts: SocialFeedPost[];
}

export function SocialFeedCarousel({ posts }: SocialFeedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [entered, setEntered] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el || posts.length === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);

    const cards = el.querySelectorAll<HTMLElement>("[data-social-card]");
    if (cards.length === 0) return;

    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, index) => {
      const dist = Math.abs(card.offsetLeft - scrollLeft - 4);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }, [posts.length]);

  useEffect(() => {
    setEntered(true);
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, posts]);

  useEffect(() => {
    if (paused || posts.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;

      const firstCard = el.querySelector<HTMLElement>("[data-social-card]");
      const step = (firstCard?.offsetWidth ?? 280) + CARD_SCROLL_GAP;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - step * 0.5;

      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [paused, posts]);

  const scrollBy = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-social-card]");
    const step = (firstCard?.offsetWidth ?? 280) + CARD_SCROLL_GAP;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-social-card]")[index];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - 4, behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || e.button !== 0) return;
    dragRef.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
    el.classList.add("social-feed-track--dragging");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !trackRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    trackRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    trackRef.current?.classList.remove("social-feed-track--dragging");
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    updateScrollState();
  };

  if (posts.length === 0) return null;

  return (
    <div
      className={`social-feed-widget mt-8 sm:mt-10 ${entered ? "social-feed-widget--entered" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="relative">
        <ScrollButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={() => scrollBy("left")}
        />
        <ScrollButton
          direction="right"
          disabled={!canScrollRight}
          onClick={() => scrollBy("right")}
        />

        <div
          ref={trackRef}
          className="social-feed-track"
          role="list"
          aria-label="Community posts"
          onScroll={updateScrollState}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {posts.map((post, index) => (
            <SocialFeedCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>

      <div
        className="social-feed-pagination mt-5 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Carousel pages"
      >
        {posts.map((post, index) => (
          <button
            key={post.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Go to post ${index + 1}`}
            className={`social-feed-dot ${index === activeIndex ? "social-feed-dot--active" : ""}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

function SocialFeedCard({ post, index }: { post: SocialFeedPost; index: number }) {
  const isExternalImage =
    post.imageSrc.startsWith("http://") || post.imageSrc.startsWith("https://");

  return (
    <article
      data-social-card
      className={`social-feed-card social-feed-card--${post.platform} group`}
      role="listitem"
      style={{ ["--social-card-delay" as string]: `${index * 70}ms` }}
    >
      <Link
        href={post.href}
        target="_blank"
        rel="noopener noreferrer"
        className="social-feed-card__link flex h-full flex-col"
      >
        <div className="social-feed-card__media relative aspect-[4/3] overflow-hidden bg-[var(--hp-gray)]">
          <span className="social-feed-card__tint" aria-hidden />
          <Image
            src={post.imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 32vw, 22vw"
            className="social-feed-card__image object-cover"
            unoptimized={isExternalImage}
          />
          <span className="social-feed-card__badge">
            <SocialPlatformBadge platform={post.platform} />
          </span>
        </div>

        <div className="social-feed-card__content flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate font-semibold text-[var(--ink)]">
              {post.pageName}
            </span>
            <time className="shrink-0 font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              {post.dateLabel}
            </time>
          </div>

          <div className="social-feed-card__divider my-3" role="presentation" />

          <p className="line-clamp-3 flex-1 text-[13px] leading-snug text-[var(--ink)]">
            {post.caption}
          </p>

          <span className="social-feed-card__cta mt-3 text-[11px] font-semibold">
            View post
          </span>
        </div>
      </Link>
    </article>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll posts left" : "Scroll posts right"}
      className={`social-feed-nav social-feed-nav--${direction}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden
      >
        {direction === "left" ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
