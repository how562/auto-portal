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
    id: "nissan",
    brandName: "Nissan",
    logoStoreAbrv: "nsm",
    altText: "Nissan at Cavender Auto Group",
    locationText: "Cavender Nissan · San Marcos & Rockwall, TX",
    inventoryUrl: "/inventory?make=Nissan",
    dealershipName: "Cavender Nissan",
  }),
  brand({
    id: "jaguar",
    brandName: "Jaguar",
    logoStoreAbrv: "jlr",
    altText: "Jaguar at Cavender Auto Group",
    locationText: "Jaguar San Antonio · San Antonio, TX",
    inventoryUrl: "/inventory?make=Jaguar",
    dealershipName: "Jaguar San Antonio",
  }),
  brand({
    id: "land-rover",
    brandName: "Land Rover",
    logoStoreAbrv: "jlr",
    altText: "Land Rover at Cavender Auto Group",
    locationText: "Land Rover San Antonio · San Antonio, TX",
    inventoryUrl: "/inventory?make=Land+Rover",
    dealershipName: "Land Rover San Antonio",
  }),
];
