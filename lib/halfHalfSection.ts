import type { SectionCopy } from "@/lib/cmsSectionDisplay";
import type { EnrichedCMSSection } from "@/lib/cmsSectionModel";
import { parseSettings, settingString } from "@/lib/cmsSettings";
import type { SplitFeaturePageHeaderFields } from "@/lib/pageHeaderTypes";

export interface HalfHalfBlockProps {
  eyebrow?: string;
  title: string;
  titleLine2?: string;
  introText?: string;
  signatureText?: string;
  image?: string;
  imageAlt?: string;
  /** Which side the photo sits on (default right). */
  imagePosition?: "left" | "right";
  /** Compact height + full-bleed image (About Us hero style). */
  variant?: "default" | "compact";
  as?: "header" | "section";
  headingLevel?: "h1" | "h2";
  headingId?: string;
  className?: string;
}

export function halfHalfFromSplitFields(
  data: SplitFeaturePageHeaderFields,
): HalfHalfBlockProps {
  return {
    eyebrow: data.eyebrow,
    title: data.title,
    titleLine2: data.titleLine2,
    introText: data.introText,
    signatureText: data.signatureText,
    image: data.image,
    imageAlt: data.imageAlt,
    imagePosition: "right",
    variant: "compact",
    as: "header",
    headingId: "page-header-title",
  };
}

export function halfHalfFromCmsSection(
  section: EnrichedCMSSection,
  copy: SectionCopy,
  locale: "en" | "es" = "en",
): HalfHalfBlockProps {
  const s = parseSettings(section.settings);
  const imagePosition = settingString(s, "image_position", "right");
  const signatureText =
    locale === "es"
      ? settingString(s, "signature_text_es") || settingString(s, "signature_text")
      : settingString(s, "signature_text");
  return {
    eyebrow: copy.eyebrow ?? undefined,
    title: copy.headline ?? "",
    titleLine2: copy.subheadline ?? undefined,
    introText: copy.body ?? undefined,
    signatureText: signatureText || undefined,
    image: copy.imageUrl || undefined,
    imageAlt: settingString(s, "image_alt") || undefined,
    imagePosition: imagePosition === "left" ? "left" : "right",
    variant: settingString(s, "variant", "compact") === "default" ? "default" : "compact",
    as: "section",
    headingId: `half-half-${section.id}`,
  };
}
