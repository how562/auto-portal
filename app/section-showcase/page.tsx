import type { Metadata } from "next";
import { SectionShowcaseView } from "@/components/section-showcase/SectionShowcaseView";

export const metadata: Metadata = {
  title: "Section showcase | CMS layout kit",
  description:
    "Saved CMS section presets: content blocks, galleries, page headers, forms, and memos.",
  robots: { index: false, follow: false },
};

export default function SectionShowcasePage() {
  return <SectionShowcaseView />;
}
