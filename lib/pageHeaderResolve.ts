import type { AboutUsPageContent } from "@/lib/aboutUsPageContent";
import type { CavenderCaresPageContent } from "@/lib/cavenderCaresPageContent";
import type { CavenderCommitmentPageContent } from "@/lib/cavenderCommitmentPageContent";
import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";
import type { ExecutiveTeamPageContent } from "@/lib/executiveTeamPageContent";
import type { FinancePageContent } from "@/lib/financePageContent";
import type { LocationsPageContent } from "@/lib/locationsPageTypes";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";
import type { ScheduleServicePageContent } from "@/lib/serviceSchedulingTypes";
import type { ValueYourTradePageContent } from "@/lib/valueYourTradePageContent";
import {
  defaultHeaderForType,
  RECOMMENDED_PAGE_HEADER_TYPE,
  type CinematicPageHeaderFields,
  type EditorialPageHeaderFields,
  type MagazinePageHeaderFields,
  type SplitFeaturePageHeaderFields,
  type PageHeaderConfig,
  type PageHeaderSlug,
  type PageHeaderType,
  type UtilityPageHeaderFields,
} from "@/lib/pageHeaderTypes";
import { STORIES_PAGE_HEADER } from "@/lib/storiesPageHeader";

export interface WithOptionalPageHeader {
  header?: PageHeaderConfig;
}

function mergeStrings(stored: string, fallback: string): string {
  return stored.trim() ? stored : fallback;
}

function mergeCinematic(
  stored: CinematicPageHeaderFields,
  fallback: CinematicPageHeaderFields,
): CinematicPageHeaderFields {
  return {
    eyebrow: mergeStrings(stored.eyebrow, fallback.eyebrow),
    title: mergeStrings(stored.title, fallback.title),
    subtitle: mergeStrings(stored.subtitle, fallback.subtitle),
    backgroundImage: mergeStrings(stored.backgroundImage, fallback.backgroundImage),
    mobileBackgroundImage: mergeStrings(
      stored.mobileBackgroundImage,
      fallback.mobileBackgroundImage || fallback.backgroundImage,
    ),
    overlayOpacity: stored.overlayOpacity ?? fallback.overlayOpacity,
    primaryButtonLabel: mergeStrings(stored.primaryButtonLabel, fallback.primaryButtonLabel),
    primaryButtonUrl: mergeStrings(stored.primaryButtonUrl, fallback.primaryButtonUrl),
    secondaryButtonLabel: mergeStrings(
      stored.secondaryButtonLabel,
      fallback.secondaryButtonLabel,
    ),
    secondaryButtonUrl: mergeStrings(stored.secondaryButtonUrl, fallback.secondaryButtonUrl),
    logoImageUrl: mergeStrings(stored.logoImageUrl, fallback.logoImageUrl),
    logoAlt: mergeStrings(stored.logoAlt, fallback.logoAlt),
  };
}

function mergeEditorial(
  stored: EditorialPageHeaderFields,
  fallback: EditorialPageHeaderFields,
): EditorialPageHeaderFields {
  return {
    eyebrow: mergeStrings(stored.eyebrow, fallback.eyebrow),
    title: mergeStrings(stored.title, fallback.title),
    introText: mergeStrings(stored.introText, fallback.introText),
    signatureText: mergeStrings(stored.signatureText, fallback.signatureText),
    categoryLabels:
      Array.isArray(stored.categoryLabels) && stored.categoryLabels.length > 0
        ? stored.categoryLabels
        : (fallback.categoryLabels ?? []),
    image: mergeStrings(stored.image, fallback.image),
    imageAlt: mergeStrings(stored.imageAlt, fallback.imageAlt),
    primaryButtonLabel: mergeStrings(stored.primaryButtonLabel, fallback.primaryButtonLabel),
    primaryButtonUrl: mergeStrings(stored.primaryButtonUrl, fallback.primaryButtonUrl),
  };
}

function mergeUtility(
  stored: UtilityPageHeaderFields,
  fallback: UtilityPageHeaderFields,
): UtilityPageHeaderFields {
  return {
    eyebrow: mergeStrings(stored.eyebrow, fallback.eyebrow),
    title: mergeStrings(stored.title, fallback.title),
    introText: mergeStrings(stored.introText, fallback.introText),
    supportPoints:
      stored.supportPoints.length > 0 ? stored.supportPoints : fallback.supportPoints,
    formSlot: mergeStrings(stored.formSlot, fallback.formSlot),
    toolSlot: mergeStrings(stored.toolSlot, fallback.toolSlot),
    vehicleImage: mergeStrings(stored.vehicleImage, fallback.vehicleImage),
    vehicleImageAlt: mergeStrings(stored.vehicleImageAlt, fallback.vehicleImageAlt),
    primaryButtonLabel: mergeStrings(stored.primaryButtonLabel, fallback.primaryButtonLabel),
    primaryButtonUrl: mergeStrings(stored.primaryButtonUrl, fallback.primaryButtonUrl),
    secondaryButtonLabel: mergeStrings(
      stored.secondaryButtonLabel,
      fallback.secondaryButtonLabel,
    ),
    secondaryButtonUrl: mergeStrings(stored.secondaryButtonUrl, fallback.secondaryButtonUrl),
  };
}

function mergeSplit(
  stored: SplitFeaturePageHeaderFields,
  fallback: SplitFeaturePageHeaderFields,
): SplitFeaturePageHeaderFields {
  return {
    eyebrow: mergeStrings(stored.eyebrow, fallback.eyebrow),
    title: mergeStrings(stored.title, fallback.title),
    titleLine2: mergeStrings(stored.titleLine2, fallback.titleLine2),
    introText: mergeStrings(stored.introText, fallback.introText),
    signatureText: mergeStrings(stored.signatureText, fallback.signatureText),
    image: mergeStrings(stored.image, fallback.image),
    imageAlt: mergeStrings(stored.imageAlt, fallback.imageAlt),
  };
}

function mergeMagazine(
  stored: MagazinePageHeaderFields,
  fallback: MagazinePageHeaderFields,
): MagazinePageHeaderFields {
  return {
    logoUrl: mergeStrings(stored.logoUrl, fallback.logoUrl),
    logoText: mergeStrings(stored.logoText, fallback.logoText),
    eyebrow: mergeStrings(stored.eyebrow, fallback.eyebrow),
    title: mergeStrings(stored.title, fallback.title),
    subtitle: mergeStrings(stored.subtitle, fallback.subtitle),
    categoryLinks:
      stored.categoryLinks.length > 0 ? stored.categoryLinks : fallback.categoryLinks,
    darkMode: stored.darkMode ?? fallback.darkMode,
  };
}

function mergeHeaderConfig(
  stored: PageHeaderConfig,
  fallback: PageHeaderConfig,
): PageHeaderConfig {
  if (stored.type === "none" || fallback.type === "none") {
    return stored.type === "none" ? stored : fallback;
  }
  if (stored.type !== fallback.type) {
    return stored;
  }
  if (stored.type === "cinematic" && fallback.type === "cinematic") {
    return {
      type: "cinematic",
      cinematic: mergeCinematic(stored.cinematic, fallback.cinematic),
    };
  }
  if (stored.type === "editorial" && fallback.type === "editorial") {
    return {
      type: "editorial",
      editorial: mergeEditorial(stored.editorial, fallback.editorial),
    };
  }
  if (stored.type === "split" && fallback.type === "split") {
    return {
      type: "split",
      split: mergeSplit(stored.split, fallback.split),
    };
  }
  if (stored.type === "utility" && fallback.type === "utility") {
    return {
      type: "utility",
      utility: mergeUtility(stored.utility, fallback.utility),
    };
  }
  if (stored.type === "magazine" && fallback.type === "magazine") {
    return {
      type: "magazine",
      magazine: mergeMagazine(stored.magazine, fallback.magazine),
    };
  }
  return stored;
}

export function deriveHeaderFromLegacy(
  slug: PageHeaderSlug,
  content: unknown,
): PageHeaderConfig {
  const type = RECOMMENDED_PAGE_HEADER_TYPE[slug] ?? "editorial";

  switch (slug) {
    case "about-us": {
      const c = content as AboutUsPageContent;
      const introParagraphs =
        c.hero?.introParagraphs?.length
          ? c.hero.introParagraphs
          : c.hero?.tagline?.length
            ? c.hero.tagline
            : [];
      return {
        type: "split",
        split: {
          eyebrow: "About Us",
          title: c.hero?.titleLine1 ?? c.hero?.title ?? "Built on trust.",
          titleLine2: c.hero?.titleLine2 ?? "Driven by people.",
          introText: introParagraphs.join("\n\n"),
          signatureText: c.hero?.signature ?? "Cavender Family",
          image: c.hero?.imageUrl ?? "",
          imageAlt: c.hero?.imageAlt ?? "Cavender Auto Group team",
        },
      };
    }
    case "executive-team": {
      const c = content as ExecutiveTeamPageContent;
      return {
        type: "editorial",
        editorial: {
          eyebrow: c.intro?.eyebrow ?? "Leadership",
          title: c.hero?.title ?? "Executive Team",
          introText: c.intro?.paragraph ?? c.hero?.tagline?.join(" ") ?? "",
          signatureText: "",
          categoryLabels: ["Leadership", "Our Team", "Cavender Auto Group"],
          image: c.hero?.imageUrl ?? "",
          imageAlt: "Cavender executive leadership",
          primaryButtonLabel: "",
          primaryButtonUrl: "",
        },
      };
    }
    case "locations": {
      const c = content as LocationsPageContent;
      return {
        type: "utility",
        utility: {
          eyebrow: c.hero?.kicker ?? "",
          title: c.hero?.title ?? "Locations",
          introText: c.hero?.tagline ?? "",
          supportPoints: c.help?.features?.map((f) => f.title) ?? [],
          formSlot: "",
          toolSlot: "",
          vehicleImage: c.hero?.imageUrl ?? "",
          vehicleImageAlt: "Cavender dealerships",
          primaryButtonLabel: c.map?.ctaLabel ?? "View dealerships",
          primaryButtonUrl: "#dealership-locations",
          secondaryButtonLabel: "",
          secondaryButtonUrl: "",
        },
      };
    }
    case "schedule-service": {
      const c = content as ScheduleServicePageContent;
      return {
        type: "utility",
        utility: {
          eyebrow: c.hero?.kicker ?? "",
          title: c.hero?.title ?? "Schedule Service",
          introText: [c.hero?.tagline, c.intro?.subheadline].filter(Boolean).join(" "),
          supportPoints: c.features?.map((f) => f.title) ?? [],
          formSlot: "",
          toolSlot: "",
          vehicleImage: c.hero?.imageUrl ?? "",
          vehicleImageAlt: "Schedule service at Cavender",
          primaryButtonLabel: "",
          primaryButtonUrl: "",
          secondaryButtonLabel: "",
          secondaryButtonUrl: "",
        },
      };
    }
    case "finance-center": {
      const c = content as FinancePageContent;
      return {
        type: "utility",
        utility: {
          eyebrow: c.intro?.eyebrow ?? "",
          title: c.hero?.title ?? "Finance Center",
          introText: [c.hero?.subtitle, c.hero?.supportingLine, c.intro?.body]
            .filter(Boolean)
            .join("\n\n"),
          supportPoints: c.features?.map((f) => f.title) ?? [],
          formSlot: "",
          toolSlot: "",
          vehicleImage: c.hero?.imageUrl ?? "",
          vehicleImageAlt: "Finance at Cavender",
          primaryButtonLabel: c.cta?.locationsLabel ?? "",
          primaryButtonUrl: c.cta?.locationsHref ?? "",
          secondaryButtonLabel: c.cta?.shopLabel ?? "",
          secondaryButtonUrl: c.cta?.shopHref ?? "",
        },
      };
    }
    case "value-your-trade": {
      const c = content as ValueYourTradePageContent;
      return {
        type: "utility",
        utility: {
          eyebrow: "Trade-in",
          title: c.hero?.title ?? "Value Your Trade",
          introText: c.hero?.tagline?.join("\n") ?? "",
          supportPoints: [],
          formSlot: "",
          toolSlot: "",
          vehicleImage: "",
          vehicleImageAlt: "",
          primaryButtonLabel: "",
          primaryButtonUrl: "",
          secondaryButtonLabel: "",
          secondaryButtonUrl: "",
        },
      };
    }
    case "cavender-commitment": {
      const c = content as CavenderCommitmentPageContent;
      return {
        type: "cinematic",
        cinematic: {
          eyebrow: c.memo?.classification ?? "",
          title: `${c.hero?.headlineLine1 ?? ""} ${c.hero?.headlineLine2 ?? ""}`.trim(),
          subtitle: c.hero?.headlineAccent ?? c.hero?.subheadline ?? "",
          backgroundImage: c.hero?.imageUrl ?? "",
          mobileBackgroundImage: "",
          overlayOpacity: 50,
          primaryButtonLabel: c.hero?.primaryCta?.label ?? "",
          primaryButtonUrl: c.hero?.primaryCta?.href ?? "",
          secondaryButtonLabel: c.hero?.secondaryCta?.label ?? "",
          secondaryButtonUrl: c.hero?.secondaryCta?.href ?? "",
          logoImageUrl: "/brand/cavender-commitment.png",
          logoAlt: "Cavender Commitment",
        },
      };
    }
    case "cavender-cares": {
      const c = content as CavenderCaresPageContent;
      return {
        type: "cinematic",
        cinematic: {
          eyebrow: "Community",
          title: c.hero?.headline ?? "Cavender Cares",
          subtitle: c.intro?.heading ?? "",
          backgroundImage: c.hero?.backgroundImageUrl ?? "",
          mobileBackgroundImage: "",
          overlayOpacity: 45,
          primaryButtonLabel: "",
          primaryButtonUrl: "",
          secondaryButtonLabel: "",
          secondaryButtonUrl: "",
          logoImageUrl: c.hero?.logoUrl ?? "",
          logoAlt: c.hero?.logoAlt ?? "Cavender Cares",
        },
      };
    }
    case "contact-the-cavenders": {
      const c = content as ContactTheCavendersPageContent;
      const introBody = c.intro?.body?.trim() ?? "";
      return {
        type: "split",
        split: {
          eyebrow: "Contact Leadership",
          title: "Your voice",
          titleLine2: "matters.",
          introText: [
            c.hero?.supportingText,
            c.intro?.heading,
            introBody,
          ]
            .filter(Boolean)
            .join("\n\n"),
          signatureText: c.quote?.attribution?.replace(/^—\s*/, "") ?? "Rob & Lee Cavender",
          image: "",
          imageAlt: c.intro?.leadershipImageAlt ?? "Rob and Lee Cavender",
        },
      };
    }
    case "our-story": {
      const c = content as OurStoryPageContent;
      return {
        type: "magazine",
        magazine: {
          logoUrl: "",
          logoText: "Cavender Auto Group",
          eyebrow: "Since 1939",
          title: c.hero?.title ?? "Our Story",
          subtitle: c.hero?.subtitle ?? c.hero?.supportingLine ?? "",
          categoryLinks: [
            { label: "Timeline", href: "#story-timeline" },
            { label: "Legacy", href: "#story-legacy" },
          ],
          darkMode: false,
        },
      };
    }
    case "stories":
      return STORIES_PAGE_HEADER;
    default:
      return defaultHeaderForType(type);
  }
}

function stripValueYourTradeUtilityFields(
  utility: UtilityPageHeaderFields,
): UtilityPageHeaderFields {
  return {
    ...utility,
    formSlot: "",
    toolSlot: "",
    vehicleImage: "",
    vehicleImageAlt: "",
  };
}

/** Always utility intro for Value Your Trade — ignores outdated CMS header types. */
export function resolveValueYourTradeUtilityHeader(
  content: ValueYourTradePageContent | null | undefined,
): UtilityPageHeaderFields {
  const fallback = deriveHeaderFromLegacy("value-your-trade", content ?? {});
  if (fallback.type !== "utility") {
    const c = content;
    return stripValueYourTradeUtilityFields({
      eyebrow: "Trade-in",
      title: c?.hero?.title ?? "Value Your Trade",
      introText: c?.hero?.tagline?.join("\n") ?? "",
      supportPoints: [],
      formSlot: "",
      toolSlot: "",
      vehicleImage: "",
      vehicleImageAlt: "",
      primaryButtonLabel: "",
      primaryButtonUrl: "",
      secondaryButtonLabel: "",
      secondaryButtonUrl: "",
    });
  }

  const stored = content?.header;
  if (stored?.type === "utility") {
    return stripValueYourTradeUtilityFields(
      mergeUtility(stored.utility, fallback.utility),
    );
  }

  return stripValueYourTradeUtilityFields(fallback.utility);
}

export function resolvePageHeader(
  slug: PageHeaderSlug,
  content: WithOptionalPageHeader | null | undefined,
): PageHeaderConfig | null {
  if (slug === "value-your-trade") {
    if (content?.header?.type === "none") return null;
    return {
      type: "utility",
      utility: resolveValueYourTradeUtilityHeader(
        content as ValueYourTradePageContent | null | undefined,
      ),
    };
  }

  const fallback = deriveHeaderFromLegacy(slug, content ?? {});
  const stored = content?.header;

  if (stored?.type === "none") return null;
  if (!stored) {
    if (fallback.type === "none") return null;
    return fallback;
  }

  let resolved = mergeHeaderConfig(stored, fallback);

  // Contact — leadership photo sits beside the form, not in the header.
  if (slug === "contact-the-cavenders" && resolved.type === "split") {
    resolved = {
      type: "split",
      split: { ...resolved.split, image: "" },
    };
  }

  // Pages migrated to split header — ignore outdated CMS header types.
  if (
    (slug === "contact-the-cavenders" || slug === "about-us") &&
    stored.type !== "split" &&
    fallback.type === "split"
  ) {
    if (slug === "contact-the-cavenders") {
      return {
        type: "split",
        split: { ...fallback.split, image: "" },
      };
    }
    return fallback;
  }

  return resolved;
}

export function ensurePageHeaderOnContent<T extends WithOptionalPageHeader>(
  slug: PageHeaderSlug,
  content: T,
): T {
  if (content.header) return content;
  const derived = deriveHeaderFromLegacy(slug, content);
  return { ...content, header: derived };
}

export function switchHeaderType(
  current: PageHeaderConfig | undefined,
  nextType: PageHeaderType,
  slug: PageHeaderSlug,
  content: unknown,
): PageHeaderConfig {
  if (nextType === "none") return { type: "none" };
  const legacy = deriveHeaderFromLegacy(slug, content);
  const next = defaultHeaderForType(nextType);
  if (legacy.type === nextType) {
    return mergeHeaderConfig(next, legacy);
  }
  if (current && current.type === nextType) {
    return current;
  }
  return next;
}
