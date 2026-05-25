"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Reads computed :root CSS custom property values from the live theme.
 * This component reads from global design tokens. Update tokens in globals.css to apply changes site-wide.
 */
export function useResolvedCssVars(cssVars: string[]): Record<string, string> {
  const key = useMemo(() => cssVars.join("\0"), [cssVars]);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const cssVar of cssVars) {
        next[cssVar] = style.getPropertyValue(cssVar).trim();
      }
      setResolved(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, [key, cssVars]);

  return resolved;
}

export function useResolvedFontFamily(): string {
  const [family, setFamily] = useState("");

  useEffect(() => {
    const read = () => {
      setFamily(getComputedStyle(document.documentElement).fontFamily.trim());
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => observer.disconnect();
  }, []);

  return family;
}
