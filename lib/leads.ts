import type { Translator } from "./i18n/translations";

export type LeadAction =
  | "availability"
  | "shortlist"
  | "compare"
  | "general-shortlist";

export function getModalHeadline(action: LeadAction, t?: Translator): string {
  if (!t) {
    switch (action) {
      case "availability":
        return "Check availability for this vehicle";
      case "shortlist":
      case "general-shortlist":
        return "Let us build your shortlist";
      case "compare":
        return "Find similar vehicles";
      default:
        return "Connect with our team";
    }
  }

  switch (action) {
    case "availability":
      return t("lead.headline.availability");
    case "shortlist":
    case "general-shortlist":
      return t("lead.headline.shortlist");
    case "compare":
      return t("lead.headline.compare");
    default:
      return t("lead.headline.default");
  }
}

export function buildDefaultMessage(
  action: LeadAction,
  vehicleLabel: string | null,
  shopperIntent: string,
  t?: Translator,
): string {
  if (shopperIntent) return shopperIntent;
  if (action === "availability" && vehicleLabel) {
    return t
      ? t("lead.message.availability", undefined, { vehicle: vehicleLabel })
      : `I'd like to check availability for ${vehicleLabel}.`;
  }
  if (action === "compare" && vehicleLabel) {
    return t
      ? t("lead.message.compare", undefined, { vehicle: vehicleLabel })
      : `I'd like to find vehicles similar to ${vehicleLabel}.`;
  }
  if (action === "shortlist" && vehicleLabel) {
    return t
      ? t("lead.message.shortlist", undefined, { vehicle: vehicleLabel })
      : `Please add ${vehicleLabel} to my shortlist.`;
  }
  return t
    ? t("lead.message.general")
    : "I'd like help building a shortlist across your stores.";
}
