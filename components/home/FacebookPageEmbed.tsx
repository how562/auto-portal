"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildFacebookPagePluginUrl } from "@/lib/facebookPageConfig";

interface FacebookPageEmbedProps {
  pageUrl: string;
}

/**
 * Meta Page Plugin via iframe — works without SDK, tokens, or visitor login.
 */
export function FacebookPageEmbed({ pageUrl }: FacebookPageEmbedProps) {
  const pluginSrc = useMemo(
    () => buildFacebookPagePluginUrl(pageUrl, { width: 1200, height: 560 }),
    [pageUrl],
  );

  return (
    <div className="fb-embed-shell mt-8 w-full overflow-hidden rounded-xl border border-[var(--hp-line-cool)] bg-white shadow-[0_2px_16px_rgba(9,33,63,0.06)]">
      <iframe
        title="Cavender Auto Group Facebook timeline"
        src={pluginSrc}
        className="block w-full border-0"
        height={560}
        style={{ minHeight: 560 }}
        scrolling="no"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="border-t border-[var(--hp-line-cool)] bg-[var(--hp-frost)] px-4 py-3 text-center text-xs text-[var(--muted)]">
        Feed not loading?{" "}
        <Link
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#1877f2] hover:underline"
        >
          Open our Facebook page
        </Link>
        {" "}(ad blockers sometimes hide embedded feeds).
      </p>
    </div>
  );
}
