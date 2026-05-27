import { mergeDedicatedPageContent } from "@/lib/dedicatedPageContent/merge";
import { getDefaultDedicatedPageContentUntyped } from "@/lib/dedicatedPageContent/defaults";
import type {
  DedicatedPageContent,
  DedicatedPageSlug,
} from "@/lib/dedicatedPageContent/types";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const PAGE_CONTENT_SELECT = "id, slug, title, meta_description, status, page_content";

export async function fetchPublishedDedicatedPageContent<S extends DedicatedPageSlug>(
  slug: S,
): Promise<ReturnType<typeof mergeDedicatedPageContent<S>>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("site_pages")
    .select("page_content")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(`[dedicatedPageContent] fetch ${slug}:`, error.message);
    return mergeDedicatedPageContent(slug, null);
  }

  return mergeDedicatedPageContent(slug, data?.page_content);
}

export async function fetchAdminDedicatedPageContent(
  pageId: string,
): Promise<{ slug: DedicatedPageSlug; content: DedicatedPageContent } | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_CONTENT_SELECT)
    .eq("id", pageId.trim())
    .maybeSingle();

  if (error || !data?.slug) return null;

  const slug = data.slug as string;
  if (!isDedicatedPageSlugGuard(slug)) return null;

  return {
    slug,
    content: mergeDedicatedPageContent(slug, data.page_content) as DedicatedPageContent,
  };
}

export async function saveAdminDedicatedPageContent(
  pageId: string,
  content: DedicatedPageContent,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_pages")
    .update({
      page_content: content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId.trim());

  if (error) {
    throw new Error(`Failed to save page content: ${error.message}`);
  }
}

export async function seedDedicatedPageContentIfEmpty(
  pageId: string,
  slug: DedicatedPageSlug,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("site_pages")
    .select("page_content")
    .eq("id", pageId)
    .maybeSingle();

  if (data?.page_content != null && typeof data.page_content === "object") {
    return;
  }

  await supabase
    .from("site_pages")
    .update({
      page_content: getDefaultDedicatedPageContentUntyped(slug),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);
}

function isDedicatedPageSlugGuard(slug: string): slug is DedicatedPageSlug {
  return (
    slug === "about-us" ||
    slug === "locations" ||
    slug === "schedule-service" ||
    slug === "executive-team" ||
    slug === "value-your-trade"
  );
}
