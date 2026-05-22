import { t } from "./i18n";
import type { TranslationKey } from "./i18n/translations";
import type { Locale } from "./i18n/types";
import type {
  FooterNavigation,
  HeaderNavItem,
  HeaderNavigation,
  PortalNavigation,
} from "./navigationTypes";

const HEADER_LABEL_KEYS: Record<string, TranslationKey> = {
  "fallback-find": "nav.findMyVehicle",
  "fallback-inventory": "nav.inventory",
  "fallback-locations": "nav.locations",
  "fallback-how": "nav.howItWorks",
  "fallback-shortlist": "nav.getShortlist",
};

const FOOTER_GROUP_KEYS: Record<string, TranslationKey> = {
  Discover: "footer.col.discover",
  Shop: "footer.col.shop",
  Group: "footer.col.group",
  Legal: "footer.col.legal",
};

const FOOTER_ITEM_KEYS: Record<string, TranslationKey> = {
  "fb-d1": "nav.findMyVehicle",
  "fb-d2": "footer.item.smartMatch",
  "fb-d3": "footer.item.categories",
  "fb-s1": "nav.inventory",
  "fb-s2": "footer.item.under30k",
  "fb-s3": "footer.item.compare",
  "fb-g1": "nav.locations",
  "fb-g2": "nav.howItWorks",
  "fb-g3": "footer.item.contact",
  "fb-l1": "footer.item.privacy",
  "fb-l2": "footer.item.terms",
  "fb-l3": "footer.item.accessibility",
};

function cmsNavLabel(
  item: { label: string; label_es?: string | null },
  locale: Locale,
): string {
  if (locale !== "es") return item.label;
  return item.label_es?.trim() || item.label;
}

function translateHeaderItem(item: HeaderNavItem, locale: Locale): HeaderNavItem {
  const key = HEADER_LABEL_KEYS[item.id];
  const label = key ? t(locale, key) : cmsNavLabel(item, locale);
  return {
    ...item,
    label,
    children: item.children?.map((child) => translateHeaderItem(child, locale)),
  };
}

/** Applies i18n to fallback navigation IDs and CMS label_es fields. */
export function translatePortalNavigation(
  navigation: PortalNavigation,
  locale: Locale,
): PortalNavigation {
  if (locale === "en") return navigation;

  const header: HeaderNavigation = {
    items: navigation.header.items.map((item) =>
      translateHeaderItem(item, locale),
    ),
  };

  const footer: FooterNavigation = {
    groups: navigation.footer.groups.map((group) => ({
      title: FOOTER_GROUP_KEYS[group.title]
        ? t(locale, FOOTER_GROUP_KEYS[group.title]!)
        : cmsNavLabel(
            { label: group.title, label_es: group.title_es },
            locale,
          ),
      items: group.items.map((item) => ({
        ...item,
        label: FOOTER_ITEM_KEYS[item.id]
          ? t(locale, FOOTER_ITEM_KEYS[item.id]!)
          : cmsNavLabel(item, locale),
      })),
    })),
  };

  return { header, footer };
}
