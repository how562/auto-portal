import type { CommitmentLocationCard } from "@/lib/cavenderCommitmentPageContent";
import type { DealershipLocation } from "@/lib/locationsPageTypes";

export function buildCommitmentLocationCards(
  dealerships: DealershipLocation[],
): CommitmentLocationCard[] {
  return dealerships.slice(0, 8).map((loc) => ({
    id: loc.id,
    name: loc.storeName,
    city: [loc.addressLine1, loc.addressLine2].filter(Boolean).join(", ") || "Texas",
    imageUrl: loc.imageUrl,
    href: "/locations",
  }));
}
