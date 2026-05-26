import { brandLogoPath } from "./brandLogoAssets";

/**
 * Defaults when stores.service_* columns are empty or stores table has no rows.
 * Update URLs and phones here, or set per-row values in Supabase `stores`.
 */
export interface ServiceLocationFallback {
  /** Substring match against stores.name (case-insensitive). */
  nameIncludes: string;
  storeName: string;
  brand: string;
  logoStoreAbrv: string;
  address: string;
  servicePhone?: string;
  serviceScheduleUrl?: string;
}

export const SERVICE_LOCATION_FALLBACKS: ServiceLocationFallback[] = [
  {
    nameIncludes: "buick gmc north",
    storeName: "Cavender Buick GMC North",
    brand: "Buick GMC",
    logoStoreAbrv: "bgn",
    address: "17811 San Pedro Ave, San Antonio, TX 78232",
    serviceScheduleUrl: "https://www.cavenderbuickgmcnorth.com/schedule-service.htm",
  },
  {
    nameIncludes: "buick gmc west",
    storeName: "Cavender Buick GMC West",
    brand: "Buick GMC",
    logoStoreAbrv: "bgw",
    address: "8125 Interstate 10 W, San Antonio, TX 78230",
    serviceScheduleUrl: "https://www.cavenderbuickgmcwest.com/schedule-service.htm",
  },
  {
    nameIncludes: "cadillac",
    storeName: "Cavender Cadillac",
    brand: "Cadillac",
    logoStoreAbrv: "cad",
    address: "10225 Fredericksburg Rd, San Antonio, TX 78240",
    serviceScheduleUrl: "https://www.cavendercadillac.com/schedule-service.htm",
  },
  {
    nameIncludes: "chevrolet",
    storeName: "Cavender Chevrolet",
    brand: "Chevrolet",
    logoStoreAbrv: "chv",
    address: "13865 W Interstate 10, Boerne, TX 78006",
    serviceScheduleUrl: "https://www.cavenderchevrolet.com/schedule-service.htm",
  },
  {
    nameIncludes: "grande ford",
    storeName: "Cavender Grande Ford",
    brand: "Ford",
    logoStoreAbrv: "cgf",
    address: "8445 Interstate 10 W, San Antonio, TX 78230",
    serviceScheduleUrl: "https://www.cavendergrandeford.com/schedule-service.htm",
  },
  {
    nameIncludes: "nissan",
    storeName: "Cavender Nissan",
    brand: "Nissan",
    logoStoreAbrv: "nsm",
    address: "San Marcos & Rockwall, TX",
    serviceScheduleUrl: "https://www.cavendernissan.com/schedule-service.htm",
  },
  {
    nameIncludes: "jaguar",
    storeName: "Jaguar San Antonio",
    brand: "Jaguar",
    logoStoreAbrv: "jlr",
    address: "15255 Interstate 10 W, San Antonio, TX 78249",
    serviceScheduleUrl: "https://www.jaguarsanantonio.com/schedule-service.htm",
  },
  {
    nameIncludes: "land rover",
    storeName: "Land Rover San Antonio",
    brand: "Land Rover",
    logoStoreAbrv: "jlr",
    address: "15255 Interstate 10 W, San Antonio, TX 78249",
    serviceScheduleUrl: "https://www.landroversanantonio.com/schedule-service.htm",
  },
];

export function findServiceFallback(storeName: string): ServiceLocationFallback | null {
  const lower = storeName.toLowerCase();
  return (
    SERVICE_LOCATION_FALLBACKS.find((entry) => lower.includes(entry.nameIncludes)) ?? null
  );
}

export function fallbackLogoUrl(logoStoreAbrv: string): string {
  return brandLogoPath(logoStoreAbrv);
}

export function staticFallbackLocations(): ServiceLocationFallback[] {
  return SERVICE_LOCATION_FALLBACKS;
}
