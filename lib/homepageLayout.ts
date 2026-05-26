import {
  HOMEPAGE_LAYOUT_DEFAULT_ORDER,
  HOMEPAGE_LAYOUT_SECTION_DEFS,
  isHomepageLayoutSectionId,
  type HomepageLayoutSectionId,
} from "./homepageLayoutRegistry";
import { getSupabase } from "./supabase";

export interface HomepageLayoutConfig {
  sectionOrder: HomepageLayoutSectionId[];
  hiddenSections: HomepageLayoutSectionId[];
}

const LAYOUT_ROW_ID = "default";

function parseIdArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

export function resolveHomepageLayout(
  storedOrder: string[] | null | undefined,
  hidden: string[] | null | undefined,
): HomepageLayoutConfig {
  const hiddenSections = parseIdArray(hidden).filter(isHomepageLayoutSectionId);

  const known = new Set(HOMEPAGE_LAYOUT_DEFAULT_ORDER);
  const order: HomepageLayoutSectionId[] = [];

  for (const id of parseIdArray(storedOrder)) {
    if (!isHomepageLayoutSectionId(id) || !known.has(id) || order.includes(id)) {
      continue;
    }
    order.push(id);
  }

  for (const id of HOMEPAGE_LAYOUT_DEFAULT_ORDER) {
    if (!order.includes(id)) order.push(id);
  }

  const footerIdx = order.indexOf("portal_footer");
  if (footerIdx >= 0 && footerIdx !== order.length - 1) {
    order.splice(footerIdx, 1);
    order.push("portal_footer");
  }

  return {
    sectionOrder: order,
    hiddenSections,
  };
}

/** Visible sections in render order (respects hidden flags). */
export function getVisibleHomepageSectionOrder(
  config: HomepageLayoutConfig,
): HomepageLayoutSectionId[] {
  const hidden = new Set(config.hiddenSections);
  return config.sectionOrder.filter((id) => !hidden.has(id));
}

export function groupHomepageSectionsByZone(ids: HomepageLayoutSectionId[]): {
  zone: "main" | "lower";
  sectionIds: HomepageLayoutSectionId[];
}[] {
  const defZone = new Map(
    HOMEPAGE_LAYOUT_SECTION_DEFS.map((d) => [d.id, d.zone]),
  );
  const blocks: { zone: "main" | "lower"; sectionIds: HomepageLayoutSectionId[] }[] =
    [];

  for (const id of ids) {
    const zone = defZone.get(id) ?? "main";
    const last = blocks[blocks.length - 1];
    if (last && last.zone === zone) {
      last.sectionIds.push(id);
    } else {
      blocks.push({ zone, sectionIds: [id] });
    }
  }

  return blocks;
}

export async function fetchHomepageLayout(): Promise<HomepageLayoutConfig> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("homepage_layout_settings")
    .select("section_order, hidden_sections")
    .eq("id", LAYOUT_ROW_ID)
    .maybeSingle();

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("Could not find the table") ||
      msg.includes("schema cache") ||
      error.code === "PGRST205" ||
      /homepage_layout_settings/i.test(msg)
    ) {
      return resolveHomepageLayout(null, null);
    }
    throw new Error(`Failed to load homepage layout: ${msg}`);
  }

  return resolveHomepageLayout(
    parseIdArray(data?.section_order),
    parseIdArray(data?.hidden_sections),
  );
}
