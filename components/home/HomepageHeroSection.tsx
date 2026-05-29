"use client";

import dynamic from "next/dynamic";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import { isVideoFullscreenHero } from "@/lib/communityHeroVideo";

const EditorialHero = dynamic(
  () => import("@/components/home/EditorialHero").then((m) => m.EditorialHero),
  { ssr: false },
);

const FullscreenVideoHero = dynamic(
  () =>
    import("@/components/home/FullscreenVideoHero").then((m) => m.FullscreenVideoHero),
  { ssr: false },
);

export function HomepageHeroSection({ content }: { content: CommunityHeroContent }) {
  if (isVideoFullscreenHero(content.video)) {
    return <FullscreenVideoHero content={content} />;
  }
  return <EditorialHero content={content} />;
}
