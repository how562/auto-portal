import { brandLogoPath } from "@/lib/brandLogoAssets";

export interface ExploreBrand {
  id: string;
  brandName: string;
  /** Store abbreviation → /brand/hplogo_{abrv}.jpg */
  logoStoreAbrv: string;
  logoUrl: string;
  altText: string;
  locationText: string;
  inventoryUrl: string;
  dealershipName?: string;
}

function brand(
  entry: Omit<ExploreBrand, "logoUrl"> & { logoStoreAbrv: string },
): ExploreBrand {
  return {
    ...entry,
    logoUrl: brandLogoPath(entry.logoStoreAbrv),
  };
}

/**
 * Cavender Auto Group brand showcase — logos from public/brand/hplogo_*.jpg
 */
export const EXPLORE_BRANDS: ExploreBrand[] = [
  brand({
    id: "chevrolet",
    brandName: "Chevrolet",
    logoStoreAbrv: "chv",
    altText: "Chevrolet at Cavender Auto Group",
    locationText: "Cavender Chevrolet · Boerne, TX",
    inventoryUrl: "/inventory?make=Chevrolet",
    dealershipName: "Cavender Chevrolet",
  }),
  brand({
    id: "buick",
    brandName: "Buick",
    logoStoreAbrv: "bgn",
    altText: "Buick at Cavender Auto Group",
    locationText: "Cavender Buick GMC North · San Antonio, TX",
    inventoryUrl: "/inventory?make=Buick",
    dealershipName: "Cavender Buick GMC North",
  }),
  brand({
    id: "gmc",
    brandName: "GMC",
    logoStoreAbrv: "bgw",
    altText: "GMC at Cavender Auto Group",
    locationText: "Cavender Buick GMC West · San Antonio, TX",
    inventoryUrl: "/inventory?make=GMC",
    dealershipName: "Cavender Buick GMC West",
  }),
  brand({
    id: "cadillac",
    brandName: "Cadillac",
    logoStoreAbrv: "cad",
    altText: "Cadillac at Cavender Auto Group",
    locationText: "Cavender Cadillac · San Antonio, TX",
    inventoryUrl: "/inventory?make=Cadillac",
    dealershipName: "Cavender Cadillac",
  }),
  brand({
    id: "ford",
    brandName: "Ford",
    logoStoreAbrv: "cgf",
    altText: "Ford at Cavender Auto Group",
    locationText: "Cavender Grande Ford · San Antonio, TX",
    inventoryUrl: "/inventory?make=Ford",
    dealershipName: "Cavender Grande Ford",
  }),
  brand({
    id: "nissan-san-marcos",
    brandName: "Nissan",
    logoStoreAbrv: "nsm",
    altText: "Cavender Nissan San Marcos",
    locationText: "Cavender Nissan · San Marcos, TX",
    inventoryUrl: "/inventory?make=Nissan",
    dealershipName: "Cavender Nissan San Marcos",
  }),
  brand({
    id: "nissan-rockwall",
    brandName: "Nissan",
    logoStoreAbrv: "nrw",
    altText: "Cavender Nissan Rockwall",
    locationText: "Cavender Nissan · Rockwall, TX",
    inventoryUrl: "/inventory?make=Nissan",
    dealershipName: "Cavender Nissan Rockwall",
  }),
  brand({
    id: "jaguar-land-rover",
    brandName: "Jaguar & Land Rover",
    logoStoreAbrv: "jlr",
    altText: "Jaguar and Land Rover at Cavender Auto Group",
    locationText: "Jaguar & Land Rover · San Antonio, TX",
    inventoryUrl: "/inventory",
    dealershipName: "Jaguar & Land Rover San Antonio",
  }),
];
