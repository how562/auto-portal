import type { PageBlueprint } from "./cmsPageBlueprint";
import {
  getPageTemplate,
  isPageTemplateId,
  type PageTemplateId,
  type PageTemplateSectionSeed,
} from "./cmsPageTemplates";
import type { CMSSection } from "./cmsSectionModel";
import {
  canonicalSectionPatchFromInput,
  canonicalSectionToDbPayload,
} from "./cmsSectionToDb";
import { parsePageSectionFromDb, PAGE_SECTION_SELECT } from "./cmsSectionFromDb";
import { CMS_DEMO_SLUG, CMS_DEMO_TITLE } from "./cmsDemoConstants";
import {
  CMS_DEMO_META_DESCRIPTION,
  CMS_DEMO_SECTION_SEEDS,
} from "./cmsDemoPageSeeds";
import { seedDedicatedPageContentIfEmpty } from "./dedicatedPageContent";
import {
  DEDICATED_SITE_PAGES,
  isDedicatedSitePageSlug,
} from "./dedicatedSitePages";
import { RESERVED_CMS_SLUGS, type AdminSitePageListItem, type SitePage } from "./cmsTypes";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

const PAGE_SELECT = "id, slug, title, meta_description, status, created_at, updated_at";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPageUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

function coercePageId(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value != null) return String(value).trim();
  return "";
}

export function slugifyPageSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePageRow(row: Record<string, unknown>): SitePage | null {
  const id = coercePageId(row.id);
  if (!id) return null;

  const slug =
    typeof row.slug === "string" && row.slug.trim()
      ? row.slug.trim()
      : slugifyPageSlug(
          typeof row.title === "string" ? row.title : "page",
        ) || "page";

  const title =
    typeof row.title === "string" && row.title.trim()
      ? row.title.trim()
      : "Untitled page";

  return {
    id,
    slug,
    title,
    meta_description:
      typeof row.meta_description === "string"
        ? row.meta_description.trim() || null
        : null,
    status:
      row.status === "published" || row.status === "draft"
        ? row.status
        : "draft",
    created_at:
      typeof row.created_at === "string" ? row.created_at : row.created_at != null ? String(row.created_at) : null,
    updated_at:
      typeof row.updated_at === "string" ? row.updated_at : row.updated_at != null ? String(row.updated_at) : null,
  };
}

async function ensureDedicatedPageSections(
  pageId: string,
  definition: (typeof DEDICATED_SITE_PAGES)[number],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("page_sections")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);

  if (error) {
    console.error(
      `[cmsAdmin] Failed to count sections for "${definition.slug}":`,
      error.message,
    );
    return;
  }

  if ((count ?? 0) > 0) return;

  await createPageSectionsBulk(pageId, [
    {
      section_type: "text_block",
      sort_order: 10,
      headline: `${definition.title} (dedicated layout)`,
      body: definition.adminNote,
      settings: { alignment: "left" },
    },
  ]);
}

export async function ensureDedicatedSitePages(): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const supabase = getSupabaseAdmin();

  for (const definition of DEDICATED_SITE_PAGES) {
    const existing = await fetchSitePageBySlugAdmin(definition.slug);
    const status = definition.keepPublished ? "published" : existing?.status ?? "draft";

    if (existing) {
      const { error: updateError } = await supabase
        .from("site_pages")
        .update({
          title: definition.title,
          meta_description: definition.metaDescription,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(
          `[cmsAdmin] Failed to update dedicated page "${definition.slug}":`,
          updateError.message,
        );
        continue;
      }

      await ensureDedicatedPageSections(existing.id, definition);
      await seedDedicatedPageContentIfEmpty(existing.id, definition.slug);
      continue;
    }

    const { data, error } = await supabase
      .from("site_pages")
      .insert({
        title: definition.title,
        slug: definition.slug,
        status,
        meta_description: definition.metaDescription,
        updated_at: new Date().toISOString(),
      })
      .select(PAGE_SELECT)
      .single();

    if (error || !data) {
      console.error(
        `[cmsAdmin] Failed to provision dedicated page "${definition.slug}":`,
        error?.message ?? "unknown",
      );
      continue;
    }

    const page = normalizePageRow(data as Record<string, unknown>);
    if (!page?.id) continue;

    await ensureDedicatedPageSections(page.id, definition);
    await seedDedicatedPageContentIfEmpty(page.id, definition.slug);
  }
}

/** CMS section workbench — always draft, never listed under Live. */
export async function ensureCmsDemoSitePage(): Promise<SitePage> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  let existing = await fetchSitePageBySlugAdmin(CMS_DEMO_SLUG);

  if (existing) {
    if (existing.status === "published") {
      existing = await updateSitePage(existing.id, { status: "draft" });
    }

    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("page_sections")
      .select("id", { count: "exact", head: true })
      .eq("page_id", existing.id);

    if ((count ?? 0) === 0) {
      await createPageSectionsBulk(existing.id, CMS_DEMO_SECTION_SEEDS);
    }

    return existing;
  }

  const page = await createSitePage({
    title: CMS_DEMO_TITLE,
    slug: CMS_DEMO_SLUG,
    meta_description: CMS_DEMO_META_DESCRIPTION,
    status: "draft",
  });

  await createPageSectionsBulk(page.id, CMS_DEMO_SECTION_SEEDS);
  return page;
}

async function countSectionsByPageId(): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("page_sections").select("page_id");

  if (error) {
    console.error("[cmsAdmin] Failed to load section counts:", error.message);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const pageId =
      typeof row.page_id === "string"
        ? row.page_id
        : row.page_id != null
          ? String(row.page_id)
          : "";
    if (!pageId) continue;
    counts.set(pageId, (counts.get(pageId) ?? 0) + 1);
  }
  return counts;
}

async function provisionAdminSitePages(): Promise<void> {
  try {
    await ensureDedicatedSitePages();
  } catch (error: unknown) {
    console.error(
      "[cmsAdmin] ensureDedicatedSitePages failed:",
      error instanceof Error ? error.message : error,
    );
  }

  try {
    await ensureCmsDemoSitePage();
  } catch (error: unknown) {
    console.error(
      "[cmsAdmin] ensureCmsDemoSitePage failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function listAllSitePagesForAdmin(): Promise<AdminSitePageListItem[]> {
  if (!isSupabaseAdminConfigured()) return [];

  await provisionAdminSitePages();

  const supabase = getSupabaseAdmin();
  const [pagesResult, sectionCounts] = await Promise.all([
    supabase.from("site_pages").select(PAGE_SELECT).order("updated_at", { ascending: false }),
    countSectionsByPageId(),
  ]);

  if (pagesResult.error) {
    throw new Error(`Failed to list pages: ${pagesResult.error.message}`);
  }

  return (pagesResult.data ?? [])
    .map((row) => {
      const page = normalizePageRow(row as Record<string, unknown>);
      if (!page) return null;
      return {
        ...page,
        section_count: sectionCounts.get(page.id) ?? 0,
      } satisfies AdminSitePageListItem;
    })
    .filter((row): row is AdminSitePageListItem => row != null);
}

export async function listAllSitePages(): Promise<SitePage[]> {
  const rows = await listAllSitePagesForAdmin();
  return rows.map(({ section_count: _sectionCount, ...page }) => page);
}

export async function fetchSitePageById(pageId: string): Promise<SitePage | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId.trim())
    .maybeSingle();
  if (error) throw new Error(`Failed to load page: ${error.message}`);
  if (!data) return null;
  return normalizePageRow(data as Record<string, unknown>);
}

export async function sitePageRecordExists(pageId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) return false;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select("id")
    .eq("id", pageId.trim())
    .maybeSingle();
  if (error) throw new Error(`Failed to verify page: ${error.message}`);
  return Boolean(data && coercePageId(data.id));
}

export async function assertSitePageExists(pageId: string): Promise<void> {
  const id = pageId.trim();
  if (!id) throw new Error("page id is required");
  if (!isValidPageUuid(id)) {
    throw new Error(
      "Invalid page id. Open the page from Admin → Site pages (do not bookmark a stale URL).",
    );
  }
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server (npm run dev).",
    );
  }
  const exists = await sitePageRecordExists(id);
  if (!exists) {
    throw new Error(
      "This page was not found in site_pages. Open it again from Admin → Site pages, or create a new page.",
    );
  }
}

export async function requireSitePage(pageId: string): Promise<SitePage> {
  await assertSitePageExists(pageId);
  const page = await fetchSitePageById(pageId);
  if (!page) {
    throw new Error(
      "Page exists but could not be loaded. Check the site_pages row in Supabase.",
    );
  }
  return page;
}

export async function fetchSitePageBySlugAdmin(
  slug: string,
): Promise<SitePage | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("slug", slug.trim())
    .maybeSingle();
  if (error) throw new Error(`Failed to load page: ${error.message}`);
  if (!data) return null;
  return normalizePageRow(data as Record<string, unknown>);
}

export async function isPageSlugTaken(
  slug: string,
  excludePageId?: string,
): Promise<boolean> {
  const existing = await fetchSitePageBySlugAdmin(slug);
  if (!existing) return false;
  if (excludePageId && existing.id === excludePageId.trim()) return false;
  return true;
}

/** Picks base slug or base-2, base-3, … when slug already exists. */
export async function resolveUniquePageSlug(
  desired: string,
  options?: { excludePageId?: string },
): Promise<string> {
  const base = slugifyPageSlug(desired);
  if (!base) throw new Error("slug is required");
  if (isDedicatedSitePageSlug(base)) {
    throw new Error(
      `Slug "${base}" is reserved for a dedicated system page. Edit it under Site pages → Live.`,
    );
  }
  if (RESERVED_CMS_SLUGS.has(base)) {
    throw new Error(`Slug "${base}" is reserved for app routes`);
  }

  const excludePageId = options?.excludePageId?.trim();

  if (!(await isPageSlugTaken(base, excludePageId))) {
    return base;
  }

  for (let n = 2; n <= 99; n++) {
    const candidate = `${base}-${n}`;
    if (RESERVED_CMS_SLUGS.has(candidate)) continue;
    if (!(await isPageSlugTaken(candidate, excludePageId))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not find an available slug for "${base}". Edit the blueprint slug and try again.`,
  );
}

export interface SitePageCreateInput {
  title: string;
  slug?: string;
  meta_description?: string | null;
  status?: "draft" | "published";
}

export interface SitePageUpdateInput {
  title?: string;
  slug?: string;
  meta_description?: string | null;
  status?: "draft" | "published";
}

export async function createSitePage(
  input: SitePageCreateInput,
): Promise<SitePage> {
  const title = input.title?.trim();
  if (!title) throw new Error("title is required");

  const desiredSlug = slugifyPageSlug(input.slug?.trim() || title);
  const slug = await resolveUniquePageSlug(desiredSlug);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .insert({
      title,
      slug,
      meta_description: input.meta_description?.trim() || null,
      status: input.status ?? "draft",
      updated_at: new Date().toISOString(),
    })
    .select(PAGE_SELECT)
    .single();

  if (error) {
    if (error.message.includes("site_pages_slug_key")) {
      throw new Error(
        `Slug "/${slug}" is already in use. Change the slug in your blueprint and try again.`,
      );
    }
    throw new Error(`Failed to create page: ${error.message}`);
  }
  const row = normalizePageRow(data as Record<string, unknown>);
  if (!row?.id) throw new Error("Created page could not be read");
  return row;
}

export async function updateSitePage(
  pageId: string,
  input: SitePageUpdateInput,
): Promise<SitePage> {
  const id = pageId.trim();
  if (!id) throw new Error("page id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error("title cannot be empty");
    payload.title = title;
  }
  if (input.slug !== undefined) {
    const slug = slugifyPageSlug(input.slug);
    if (!slug) throw new Error("slug cannot be empty");
    if (RESERVED_CMS_SLUGS.has(slug) && !isDedicatedSitePageSlug(slug)) {
      throw new Error(`Slug "${slug}" is reserved for app routes`);
    }
    if (await isPageSlugTaken(slug, id)) {
      throw new Error(
        `Slug "/${slug}" is already used by another page. Choose a different slug.`,
      );
    }
    payload.slug = slug;
  }
  if (input.meta_description !== undefined) {
    payload.meta_description = input.meta_description?.trim() || null;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_pages").update(payload).eq("id", id);
  if (error) throw new Error(`Failed to update page: ${error.message}`);

  const row = await fetchSitePageById(id);
  if (!row) throw new Error("Updated page could not be read");
  return row;
}

export async function deleteSitePage(pageId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_pages")
    .delete()
    .eq("id", pageId.trim());
  if (error) throw new Error(`Failed to delete page: ${error.message}`);
}

export async function fetchPageSectionsForAdmin(
  pageId: string,
  options?: { includeInactive?: boolean },
): Promise<CMSSection[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", pageId.trim())
    .order("sort_order", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load sections: ${error.message}`);
  return (data ?? [])
    .map((row) => parsePageSectionFromDb(row as Record<string, unknown>))
    .filter((s): s is CMSSection => s != null);
}

export async function fetchAllPageSectionsForAdmin(
  pageId: string,
): Promise<CMSSection[]> {
  return fetchPageSectionsForAdmin(pageId, { includeInactive: true });
}

export interface PageSectionCreateInput {
  page_id: string;
  section_type: CMSSection["section_type"];
  sort_order?: number;
}

/** Canonical fields only — no title/content. */
export type PageSectionUpdateInput = Partial<
  Pick<
    CMSSection,
    | "section_type"
    | "settings"
    | "sort_order"
    | "is_active"
    | "layout_variant"
    | "eyebrow"
    | "headline"
    | "subheadline"
    | "body"
    | "headline_es"
    | "subheadline_es"
    | "body_es"
    | "cta_text_es"
    | "image_url"
    | "image_url_es"
    | "cta_text"
    | "cta_url"
    | "cta_url_es"
  >
>;

function formatPageSectionInsertError(message: string, pageId: string): string {
  if (message.includes("page_sections_page_id_fkey")) {
    return `Could not add section: page ${pageId} was not found in site_pages. Open the page again from Admin → Site pages, or create a new page.`;
  }
  return `Failed to create section: ${message}`;
}

export async function createPageSection(
  input: PageSectionCreateInput,
): Promise<CMSSection> {
  const pageId = input.page_id.trim();
  if (!pageId) throw new Error("page_id is required");

  await assertSitePageExists(pageId);

  const supabase = getSupabaseAdmin();
  const { data: maxRow } = await supabase
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder =
    input.sort_order ??
    (typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 0);

  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: pageId,
      section_type: input.section_type,
      sort_order: nextOrder,
      is_active: true,
      settings: {},
      updated_at: new Date().toISOString(),
    })
    .select(PAGE_SECTION_SELECT)
    .single();

  if (error) {
    throw new Error(formatPageSectionInsertError(error.message, pageId));
  }
  const row = parsePageSectionFromDb(data as Record<string, unknown>);
  if (!row) throw new Error("Created section could not be read");
  return row;
}

export async function updatePageSection(
  sectionId: string,
  input: PageSectionUpdateInput,
): Promise<CMSSection> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  const payload = canonicalSectionToDbPayload(
    canonicalSectionPatchFromInput(input as Record<string, unknown>),
  );

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .update(payload)
    .eq("id", sectionId.trim())
    .select(PAGE_SECTION_SELECT)
    .single();

  if (error) throw new Error(`Failed to update section: ${error.message}`);
  const row = parsePageSectionFromDb(data as Record<string, unknown>);
  if (!row) throw new Error("Updated section could not be read");
  return row;
}

export async function deletePageSection(sectionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("id", sectionId.trim());
  if (error) throw new Error(`Failed to delete section: ${error.message}`);
}

export type PageSectionSeedInput = PageTemplateSectionSeed;

function sectionSeedToInsertRow(
  pageId: string,
  seed: PageSectionSeedInput,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const patch = canonicalSectionPatchFromInput({
    section_type: seed.section_type,
    headline: seed.headline ?? null,
    subheadline: seed.subheadline ?? null,
    body: seed.body ?? null,
    image_url: seed.image_url ?? null,
    cta_text: seed.cta_text ?? null,
    cta_url: seed.cta_url ?? null,
    settings: seed.settings ?? {},
    sort_order: seed.sort_order,
    is_active: seed.is_active ?? true,
  });

  return {
    page_id: pageId,
    section_type: seed.section_type,
    ...canonicalSectionToDbPayload(patch),
    sort_order: seed.sort_order,
    is_active: seed.is_active ?? true,
    updated_at: now,
  };
}

export async function createPageSectionsBulk(
  pageId: string,
  seeds: PageSectionSeedInput[],
): Promise<CMSSection[]> {
  const id = pageId.trim();
  if (!id) throw new Error("page_id is required");
  if (!seeds.length) return [];

  const supabase = getSupabaseAdmin();
  const rows = seeds.map((seed) => sectionSeedToInsertRow(id, seed));
  const { data, error } = await supabase
    .from("page_sections")
    .insert(rows)
    .select(PAGE_SECTION_SELECT);

  if (error) {
    throw new Error(formatPageSectionInsertError(error.message, id));
  }
  return (data ?? [])
    .map((row) => parsePageSectionFromDb(row as Record<string, unknown>))
    .filter((s): s is CMSSection => s != null);
}

export interface SitePageFromTemplateInput {
  templateId: PageTemplateId;
  title: string;
  slug?: string;
  meta_description?: string | null;
}

export async function createSitePageFromTemplate(
  input: SitePageFromTemplateInput,
): Promise<SitePage> {
  if (!isPageTemplateId(input.templateId)) {
    throw new Error(`Unknown template: ${input.templateId}`);
  }

  const template = getPageTemplate(input.templateId);
  const title = input.title.trim();
  if (!title) throw new Error("title is required");

  const slug = slugifyPageSlug(
    input.slug?.trim() || template.suggestedSlug || title,
  );

  const page = await createSitePage({
    title,
    slug,
    meta_description: input.meta_description,
    status: "draft",
  });

  await createPageSectionsBulk(page.id, template.sections);
  return page;
}

export interface DuplicateSitePageInput {
  title: string;
  slug?: string;
}

export async function duplicateSitePage(
  sourcePageId: string,
  input: DuplicateSitePageInput,
): Promise<SitePage> {
  const source = await fetchSitePageById(sourcePageId);
  if (!source) throw new Error("Source page not found");

  const sections = await fetchAllPageSectionsForAdmin(sourcePageId);
  const title = input.title.trim();
  if (!title) throw new Error("title is required");

  const slug = slugifyPageSlug(input.slug?.trim() || `${source.slug}-copy`);

  const page = await createSitePage({
    title,
    slug,
    meta_description: source.meta_description,
    status: "draft",
  });

  const seeds: PageSectionSeedInput[] = sections.map((section) => ({
    section_type: section.section_type,
    sort_order: section.sort_order,
    is_active: section.is_active,
    headline: section.headline,
    subheadline: section.subheadline,
    body: section.body,
    image_url: section.image_url,
    cta_text: section.cta_text,
    cta_url: section.cta_url,
    settings: section.settings ?? {},
  }));

  await createPageSectionsBulk(page.id, seeds);
  return page;
}

export async function createSitePageFromBlueprint(
  blueprint: PageBlueprint,
): Promise<{
  page: SitePage;
  sections: CMSSection[];
  slugUsed: string;
  slugAdjusted: boolean;
}> {
  const desiredSlug = slugifyPageSlug(blueprint.slug);

  const page = await createSitePage({
    title: blueprint.title,
    slug: desiredSlug,
    meta_description: blueprint.meta_description,
    status: blueprint.status === "published" ? "published" : "draft",
  });

  const seeds: PageSectionSeedInput[] = blueprint.sections.map((section) => ({
    section_type: section.section_type,
    sort_order: section.sort_order,
    is_active: section.is_active,
    headline: section.headline,
    subheadline: section.subheadline,
    body: section.body,
    image_url: section.image_url,
    cta_text: section.cta_text,
    cta_url: section.cta_url,
    settings: section.settings ?? {},
  }));

  const sections = await createPageSectionsBulk(page.id, seeds);
  return {
    page,
    sections,
    slugUsed: page.slug,
    slugAdjusted: page.slug !== desiredSlug,
  };
}

export async function swapPageSectionOrder(
  sectionIdA: string,
  sectionIdB: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from("page_sections")
    .select("id, sort_order")
    .in("id", [sectionIdA.trim(), sectionIdB.trim()]);

  if (error || !rows || rows.length !== 2) {
    throw new Error("Sections not found for reorder");
  }

  const a = rows.find((r) => r.id === sectionIdA.trim());
  const b = rows.find((r) => r.id === sectionIdB.trim());
  if (!a || !b) throw new Error("Sections not found for reorder");

  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("page_sections")
    .update({ sort_order: b.sort_order, updated_at: now })
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("page_sections")
    .update({ sort_order: a.sort_order, updated_at: now })
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
}
