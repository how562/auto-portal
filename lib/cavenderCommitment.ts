import { fetchPublishedPageBySlug } from "./cmsPages";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import { getSupabase } from "./supabase";
import type { CavenderCommitmentCmsPayload } from "./cavenderCommitmentTypes";

export { resolveCavenderCommitmentContent } from "./cavenderCommitmentContent";

export async function fetchCavenderCommitmentCmsPayload(): Promise<CavenderCommitmentCmsPayload> {
  const page = await fetchPublishedPageBySlug("home");
  if (!page) return { pageSection: null };

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return { pageSection: null };
  }

  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", page.id)
    .eq("section_type", "cavender_commitment")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { pageSection: null };

  const section = normalizePageSectionRow(data as Record<string, unknown>);
  return { pageSection: section };
}
