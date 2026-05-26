import { localizeSettings } from "./cmsSectionI18n";
import { parseSettings, settingItems, settingString } from "./cmsSettings";
import type { Locale } from "./i18n/types";
import type { TranslationKey } from "./i18n/translations";
import type { PageSection } from "./cmsTypes";
import {
  COMMITMENT_VALUE_ORDER,
  type CavenderCommitmentContent,
  type CommitmentValueId,
  type CommitmentValueItem,
} from "./cavenderCommitmentTypes";

const VALUE_TITLE_KEYS: Record<CommitmentValueId, TranslationKey> = {
  savings: "commitment.value.savings.title",
  priority: "commitment.value.priority.title",
  community: "commitment.value.community.title",
  appreciated: "commitment.value.appreciated.title",
};

const VALUE_DESC_KEYS: Record<CommitmentValueId, TranslationKey> = {
  savings: "commitment.value.savings.desc",
  priority: "commitment.value.priority.desc",
  community: "commitment.value.community.desc",
  appreciated: "commitment.value.appreciated.desc",
};

interface CmsValueRow extends Record<string, unknown> {
  id?: string;
  title?: string;
  description?: string;
  body?: string;
}

function isValueId(value: string): value is CommitmentValueId {
  return COMMITMENT_VALUE_ORDER.includes(value as CommitmentValueId);
}

function resolveSettings(
  section: PageSection | null,
  locale: Locale,
): Record<string, unknown> {
  const raw = parseSettings(section?.settings);
  return locale === "es" ? localizeSettings(raw, "es") : raw;
}

function resolveImageUrl(
  locale: Locale,
  english: string | null | undefined,
  spanish: string | null | undefined,
): string | null {
  const en = english?.trim() || null;
  const es = spanish?.trim() || null;
  if (locale === "es") {
    return es || en;
  }
  return en;
}

const COMMITMENT_IMAGE_FALLBACKS = {
  left: "/hero/community.jpg",
  right: "/hero/dealership.jpg",
} as const;

function cmsValueMap(
  settings: Record<string, unknown>,
): Map<CommitmentValueId, CmsValueRow> {
  const map = new Map<CommitmentValueId, CmsValueRow>();
  const rows = [
    ...settingItems<CmsValueRow>(settings, "values"),
    ...settingItems<CmsValueRow>(settings, "items"),
  ];

  for (const row of rows) {
    const id = row.id?.trim().toLowerCase();
    if (id && isValueId(id)) {
      map.set(id, row);
    }
  }
  return map;
}

export function resolveCavenderCommitmentContent(
  cmsSection: PageSection | null,
  locale: Locale,
  t: (key: TranslationKey, fallback?: string) => string,
): CavenderCommitmentContent {
  const settings = resolveSettings(cmsSection, locale);

  const headlineFromSettings = settingString(settings, "headline").trim();
  const resolvedHeadline =
    headlineFromSettings ||
    (locale === "es"
      ? cmsSection?.headline_es?.trim() || cmsSection?.headline?.trim()
      : cmsSection?.headline?.trim()) ||
    t("commitment.headline");

  const bodyFromSettings = settingString(settings, "body").trim();
  const resolvedBody =
    bodyFromSettings ||
    (locale === "es"
      ? cmsSection?.body_es?.trim() || cmsSection?.body?.trim()
      : cmsSection?.body?.trim()) ||
    t("commitment.body");

  const legacyImageEn =
    cmsSection?.image_url?.trim() ||
    settingString(parseSettings(cmsSection?.settings), "image_url").trim() ||
    settingString(parseSettings(cmsSection?.settings), "image").trim() ||
    null;
  const legacyImageEs =
    cmsSection?.image_url_es?.trim() ||
    settingString(parseSettings(cmsSection?.settings), "image_url_es").trim() ||
    null;

  const imageItems = settingItems<{
    position?: string;
    url?: string;
    image_url?: string;
    url_es?: string;
    image_url_es?: string;
    alt?: string;
  }>(settings, "images");

  const leftItem = imageItems.find(
    (item) => item.position?.trim().toLowerCase() === "left",
  );
  const rightItem = imageItems.find(
    (item) => item.position?.trim().toLowerCase() === "right",
  );

  const leftImageUrl = resolveImageUrl(
    locale,
    settingString(parseSettings(cmsSection?.settings), "image_url_left").trim() ||
      settingString(parseSettings(cmsSection?.settings), "left_image_url").trim() ||
      leftItem?.url?.trim() ||
      leftItem?.image_url?.trim() ||
      imageItems[0]?.url?.trim() ||
      imageItems[0]?.image_url?.trim() ||
      null,
    settingString(parseSettings(cmsSection?.settings), "image_url_left_es").trim() ||
      settingString(parseSettings(cmsSection?.settings), "left_image_url_es").trim() ||
      leftItem?.url_es?.trim() ||
      leftItem?.image_url_es?.trim() ||
      imageItems[0]?.url_es?.trim() ||
      imageItems[0]?.image_url_es?.trim() ||
      null,
  );

  const rightImageUrl = resolveImageUrl(
    locale,
    settingString(parseSettings(cmsSection?.settings), "image_url_right").trim() ||
      settingString(parseSettings(cmsSection?.settings), "right_image_url").trim() ||
      rightItem?.url?.trim() ||
      rightItem?.image_url?.trim() ||
      imageItems[1]?.url?.trim() ||
      imageItems[1]?.image_url?.trim() ||
      legacyImageEn,
    settingString(parseSettings(cmsSection?.settings), "image_url_right_es").trim() ||
      settingString(parseSettings(cmsSection?.settings), "right_image_url_es").trim() ||
      rightItem?.url_es?.trim() ||
      rightItem?.image_url_es?.trim() ||
      imageItems[1]?.url_es?.trim() ||
      imageItems[1]?.image_url_es?.trim() ||
      legacyImageEs,
  );

  const defaultAlt = t("commitment.imageAlt");
  const leftImageAlt =
    settingString(settings, "image_alt_left").trim() ||
    leftItem?.alt?.trim() ||
    imageItems[0]?.alt?.trim() ||
    defaultAlt;
  const rightImageAlt =
    settingString(settings, "image_alt_right").trim() ||
    rightItem?.alt?.trim() ||
    imageItems[1]?.alt?.trim() ||
    settingString(settings, "image_alt").trim() ||
    defaultAlt;

  const cmsValues = cmsValueMap(settings);
  const values: CommitmentValueItem[] = COMMITMENT_VALUE_ORDER.map((id) => {
    const row = cmsValues.get(id);
    const description =
      row?.description?.trim() ||
      row?.body?.trim() ||
      t(VALUE_DESC_KEYS[id]);
    return {
      id,
      title: row?.title?.trim() || t(VALUE_TITLE_KEYS[id]),
      description,
    };
  });

  const primaryCtaHref =
    (locale === "es"
      ? cmsSection?.cta_url_es?.trim() || cmsSection?.cta_url?.trim()
      : cmsSection?.cta_url?.trim()) ||
    settingString(settings, "cta_href").trim() ||
    settingString(settings, "primary_cta_href").trim() ||
    null;

  const secondaryCtaHref =
    settingString(settings, "secondary_cta_href").trim() ||
    settingString(settings, "cta_secondary_href").trim() ||
    null;

  return {
    headline: resolvedHeadline,
    body: resolvedBody,
    leftImageUrl: leftImageUrl || COMMITMENT_IMAGE_FALLBACKS.left,
    rightImageUrl: rightImageUrl || COMMITMENT_IMAGE_FALLBACKS.right,
    leftImageAlt,
    rightImageAlt,
    values,
    primaryCtaHref,
    secondaryCtaHref,
  };
}
