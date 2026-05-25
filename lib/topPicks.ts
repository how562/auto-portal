import { fetchPublishedPageBySlug } from "./cmsPages";
import { localizePageSection } from "./cmsSectionI18n";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import { parseSettings, settingItems, settingString } from "./cmsSettings";
import { filterVehicles } from "./filterVehicles";
import type { Locale } from "./i18n/types";
import type { TranslationKey } from "./i18n/translations";
import type { PageSection } from "./cmsTypes";
import { getSupabase } from "./supabase";
import type { Vehicle } from "./types";
import {
  TOP_PICK_SLOT_ORDER,
  type TopPickCardData,
  type TopPickSlotId,
  type TopPicksCmsPayload,
} from "./topPicksTypes";

const SLOT_LABEL_KEYS: Record<TopPickSlotId, TranslationKey> = {
  family: "topPicks.label.family",
  value: "topPicks.label.value",
  popular: "topPicks.label.popular",
  under30k: "topPicks.label.under30k",
};

const SLOT_WHY_KEYS: Record<TopPickSlotId, TranslationKey> = {
  family: "topPicks.why.family",
  value: "topPicks.why.value",
  popular: "topPicks.why.popular",
  under30k: "topPicks.why.under30k",
};

interface CmsPickRow extends Record<string, unknown> {
  slot?: string;
  vehicle_id?: string;
  label?: string;
  why?: string;
}

function isTopPickSlot(value: string): value is TopPickSlotId {
  return TOP_PICK_SLOT_ORDER.includes(value as TopPickSlotId);
}

function hasImage(vehicle: Vehicle): boolean {
  if (vehicle.primary_image_url?.trim()) return true;
  return Array.isArray(vehicle.image_urls)
    && vehicle.image_urls.some((url) => typeof url === "string" && url.trim().length > 0);
}

function unusedPool(vehicles: Vehicle[], used: Set<string>): Vehicle[] {
  return vehicles.filter((v) => !used.has(v.id));
}

function pickFirst(pool: Vehicle[], used: Set<string>): Vehicle | null {
  const candidate = pool.find((v) => !used.has(v.id));
  if (!candidate) return null;
  used.add(candidate.id);
  return candidate;
}

function pickForSlot(
  vehicles: Vehicle[],
  slot: TopPickSlotId,
  used: Set<string>,
): Vehicle | null {
  const pool = unusedPool(vehicles, used);

  if (slot === "family") {
    const matches = filterVehicles(pool, "family-suv", "any", "either");
    const withImage = matches.filter(hasImage);
    return pickFirst(withImage.length > 0 ? withImage : matches, used);
  }

  if (slot === "under30k") {
    const matches = filterVehicles(pool, "under-30k", "any", "either");
    const withImage = matches.filter(hasImage);
    return pickFirst(withImage.length > 0 ? withImage : matches, used);
  }

  if (slot === "value") {
    const priced = pool
      .filter((v) => (v.internet_price ?? 0) > 0)
      .sort((a, b) => (a.internet_price ?? 0) - (b.internet_price ?? 0));
    const withImage = priced.filter(hasImage);
    return pickFirst(withImage.length > 0 ? withImage : priced, used);
  }

  if (slot === "popular") {
    const priced = pool
      .filter((v) => (v.internet_price ?? 0) >= 28000)
      .sort((a, b) => (b.internet_price ?? 0) - (a.internet_price ?? 0));
    const withImage = priced.filter(hasImage);
    return pickFirst(withImage.length > 0 ? withImage : priced, used);
  }

  return pickFirst(pool, used);
}

function cmsPickMap(section: PageSection | null): Map<TopPickSlotId, CmsPickRow> {
  const map = new Map<TopPickSlotId, CmsPickRow>();
  if (!section) return map;

  const settings = parseSettings(section.settings);
  for (const row of settingItems<CmsPickRow>(settings, "picks")) {
    const slot = row.slot?.trim().toLowerCase();
    if (slot && isTopPickSlot(slot)) {
      map.set(slot, row);
    }
  }
  return map;
}

export async function fetchTopPicksCmsPayload(): Promise<TopPicksCmsPayload> {
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
    .eq("section_type", "top_picks")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { pageSection: null };

  const section = normalizePageSectionRow(data as Record<string, unknown>);
  return { pageSection: section };
}

export function resolveTopPicksIntro(
  cmsSection: PageSection | null,
  locale: Locale,
  t: (key: TranslationKey, fallback?: string) => string,
): { headline: string; subheadline: string } {
  const fallbackHeadline = t("topPicks.headline");
  const fallbackSubheadline = t("topPicks.subheadline");

  if (!cmsSection) {
    return { headline: fallbackHeadline, subheadline: fallbackSubheadline };
  }

  const localized = localizePageSection(cmsSection, locale);
  const settings = parseSettings(localized.settings);
  const headline =
    localized.headline?.trim() ||
    settingString(settings, "headline").trim() ||
    fallbackHeadline;
  const subheadline =
    localized.subheadline?.trim() ||
    settingString(settings, "subheadline").trim() ||
    localized.body?.trim() ||
    fallbackSubheadline;

  return { headline, subheadline };
}

export function buildTopPickCards(
  vehicles: Vehicle[],
  cmsSection: PageSection | null,
  locale: Locale,
  t: (key: TranslationKey, fallback?: string) => string,
): TopPickCardData[] {
  if (vehicles.length === 0) return [];

  const localized = cmsSection
    ? localizePageSection(cmsSection, locale)
    : null;
  const cmsRows = cmsPickMap(localized);
  const used = new Set<string>();
  const cards: TopPickCardData[] = [];

  for (const slot of TOP_PICK_SLOT_ORDER) {
    const row = cmsRows.get(slot);
    let vehicle: Vehicle | null = null;

    if (row?.vehicle_id?.trim()) {
      const match = vehicles.find((v) => v.id === row.vehicle_id?.trim());
      if (match && !used.has(match.id)) {
        vehicle = match;
        used.add(match.id);
      }
    }

    if (!vehicle) {
      vehicle = pickForSlot(vehicles, slot, used);
    }

    if (!vehicle) continue;

    const recommendationLabel =
      row?.label?.trim() || t(SLOT_LABEL_KEYS[slot]);
    const whyItFits = row?.why?.trim() || t(SLOT_WHY_KEYS[slot]);

    cards.push({
      slot,
      vehicle,
      recommendationLabel,
      whyItFits,
    });
  }

  return cards;
}
