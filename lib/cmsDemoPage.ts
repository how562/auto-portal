import {
  createPageSection,
  createSitePage,
  deletePageSection,
  fetchAllPageSectionsForAdmin,
  fetchSitePageBySlugAdmin,
} from "./cmsAdmin";
import { CMS_DEMO_SLUG, CMS_DEMO_TITLE } from "./cmsDemoConstants";
import { CMS_LIBRARY_SECTION_TYPES } from "./cmsSectionLibrary";
import { getSectionStarter } from "./cmsSectionStarters";
import type { CMSLibrarySectionType } from "./cmsSectionLibrary";

export { CMS_DEMO_SLUG, CMS_DEMO_TITLE } from "./cmsDemoConstants";

export interface SeedCmsDemoResult {
  pageId: string;
  slug: string;
  sectionCount: number;
  createdPage: boolean;
  rebuilt: boolean;
}

export async function seedCmsDemoPage(options?: {
  rebuild?: boolean;
}): Promise<SeedCmsDemoResult> {
  const rebuild = options?.rebuild ?? false;
  let page = await fetchSitePageBySlugAdmin(CMS_DEMO_SLUG);
  let createdPage = false;

  if (!page) {
    page = await createSitePage({
      title: CMS_DEMO_TITLE,
      slug: CMS_DEMO_SLUG,
      status: "published",
      meta_description:
        "Reference page showcasing every supported CMS section type with starter content.",
    });
    createdPage = true;
  }

  const existing = await fetchAllPageSectionsForAdmin(page.id);

  if (existing.length > 0 && !rebuild) {
    return {
      pageId: page.id,
      slug: page.slug,
      sectionCount: existing.length,
      createdPage,
      rebuilt: false,
    };
  }

  if (existing.length > 0 && rebuild) {
    await Promise.all(existing.map((s) => deletePageSection(s.id)));
  }

  let order = 0;
  for (const type of CMS_LIBRARY_SECTION_TYPES) {
    const starter = getSectionStarter(type as CMSLibrarySectionType);
    await createPageSection({
      page_id: page.id,
      section_type: type,
      sort_order: order,
      starter,
    });
    order += 10;
  }

  return {
    pageId: page.id,
    slug: page.slug,
    sectionCount: CMS_LIBRARY_SECTION_TYPES.length,
    createdPage,
    rebuilt: rebuild || existing.length > 0,
  };
}
