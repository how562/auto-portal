"use client";

import { useEffect, useRef, useState } from "react";

/** Fade/slide-in when element enters viewport; respects reduced motion. */
export function useStoryReveal<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "0px 0px -8% 0px",
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, visible, className: visible ? "is-revealed" : "" };
}
