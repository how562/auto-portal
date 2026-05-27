import type { Metadata } from "next";
import { brandPageTitle } from "@/lib/brand";
import { fetchPublishedPageBySlug } from "@/lib/cmsPages";

/** SEO metadata for dedicated routes — prefers published CMS page settings when present. */
export async function dedicatedPageMetadata(
  slug: string,
  fallback: { title: string; description: string },
): Promise<Metadata> {
  const page = await fetchPublishedPageBySlug(slug);
  const title = page?.title?.trim() || fallback.title;
  const description = page?.meta_description?.trim() || fallback.description;

  return {
    title: brandPageTitle(title),
    description,
  };
}
