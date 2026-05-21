export type LeadAction =
  | "availability"
  | "shortlist"
  | "compare"
  | "general-shortlist";

export function getModalHeadline(action: LeadAction): string {
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

export function buildDefaultMessage(
  action: LeadAction,
  vehicleLabel: string | null,
  shopperIntent: string,
): string {
  if (shopperIntent) return shopperIntent;
  if (action === "availability" && vehicleLabel) {
    return `I'd like to check availability for ${vehicleLabel}.`;
  }
  if (action === "compare" && vehicleLabel) {
    return `I'd like to find vehicles similar to ${vehicleLabel}.`;
  }
  if (action === "shortlist" && vehicleLabel) {
    return `Please add ${vehicleLabel} to my shortlist.`;
  }
  return "I'd like help building a shortlist across your stores.";
}
