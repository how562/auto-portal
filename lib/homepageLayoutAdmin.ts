import {
  HOMEPAGE_LAYOUT_DEFAULT_ORDER,
  isHomepageLayoutSectionId,
  type HomepageLayoutSectionId,
} from "./homepageLayoutRegistry";
import { resolveHomepageLayout, type HomepageLayoutConfig } from "./homepageLayout";
import { getSupabaseAdmin } from "./supabaseAdmin";

const LAYOUT_ROW_ID = "default";

export interface HomepageLayoutAdminPayload {
  sectionOrder: HomepageLayoutSectionId[];
  hiddenSections: HomepageLayoutSectionId[];
}

export async function fetchHomepageLayoutAdmin(): Promise<HomepageLayoutAdminPayload> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("homepage_layout_settings")
    .select("section_order, hidden_sections")
    .eq("id", LAYOUT_ROW_ID)
    .maybeSingle();

  if (error) {
    if (isMissingLayoutTableError(error.message)) {
      return defaultHomepageLayoutAdminPayload();
    }
    throw new Error(formatLayoutDbError("load", error.message));
  }

  const storedOrder =
    data && Array.isArray(data.section_order) && data.section_order.length > 0
      ? data.section_order
      : null;
  const storedHidden =
    data && Array.isArray(data.hidden_sections) ? data.hidden_sections : null;

  const resolved = resolveHomepageLayout(storedOrder, storedHidden);

  const fullOrder = [...resolved.sectionOrder];
  for (const id of HOMEPAGE_LAYOUT_DEFAULT_ORDER) {
    if (!fullOrder.includes(id)) fullOrder.push(id);
  }

  const mergedHidden = new Set(resolved.hiddenSections);
  for (const id of HOMEPAGE_LAYOUT_DEFAULT_ORDER) {
    if (!fullOrder.includes(id)) mergedHidden.add(id);
  }

  return {
    sectionOrder: fullOrder,
    hiddenSections: Array.from(mergedHidden),
  };
}

export async function saveHomepageLayoutAdmin(
  input: HomepageLayoutAdminPayload,
): Promise<HomepageLayoutAdminPayload> {
  const order: HomepageLayoutSectionId[] = [];
  for (const id of input.sectionOrder) {
    if (isHomepageLayoutSectionId(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  for (const id of HOMEPAGE_LAYOUT_DEFAULT_ORDER) {
    if (!order.includes(id)) order.push(id);
  }

  const footerIdx = order.indexOf("portal_footer");
  if (footerIdx >= 0 && footerIdx !== order.length - 1) {
    order.splice(footerIdx, 1);
    order.push("portal_footer");
  }

  const hiddenSections = input.hiddenSections.filter(isHomepageLayoutSectionId);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("homepage_layout_settings").upsert({
    id: LAYOUT_ROW_ID,
    section_order: order,
    hidden_sections: hiddenSections,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(formatLayoutDbError("save", error.message));
  }

  return fetchHomepageLayoutAdmin();
}

function isMissingLayoutTableError(message: string): boolean {
  return (
    /homepage_layout_settings/i.test(message) &&
    (/does not exist/i.test(message) ||
      /schema cache/i.test(message) ||
      /PGRST205/i.test(message))
  );
}

function defaultHomepageLayoutAdminPayload(): HomepageLayoutAdminPayload {
  return {
    sectionOrder: [...HOMEPAGE_LAYOUT_DEFAULT_ORDER],
    hiddenSections: [],
  };
}

function formatLayoutDbError(action: string, message: string): string {
  if (isMissingLayoutTableError(message)) {
    return `Failed to ${action} homepage layout: run migration supabase/migrations/20260526200000_homepage_layout_settings.sql (or apply it in the Supabase SQL editor).`;
  }
  return `Failed to ${action} homepage layout: ${message}`;
}

export type { HomepageLayoutConfig };
