/** Map marker positions aligned to fallback store order (San Antonio cluster + inset). */
export const LOCATION_MAP_POSITIONS: Array<{
  top: string;
  left: string;
  showOnInset?: boolean;
}> = [
  { top: "42%", left: "38%" },
  { top: "48%", left: "44%" },
  { top: "52%", left: "36%" },
  { top: "28%", left: "52%" },
  { top: "46%", left: "50%" },
  { top: "58%", left: "42%" },
  { top: "50%", left: "40%" },
  { top: "46%", left: "46%", showOnInset: true },
];

export const LOCATION_IMAGE_POOL = [
  "/images/hero/dealership.jpg",
  "/images/hero/community.jpg",
  "/images/hero/vehicle.jpg",
  "/images/hero/lifestyle.jpg",
] as const;

/** Rotating storefront imagery when a location has no dedicated photo. */
export const SERVICE_LOCATION_IMAGE_POOL = [
  "/images/hero/dealership.jpg",
  "/images/hero/community.jpg",
  "/images/hero/vehicle.jpg",
  "/images/hero/lifestyle.jpg",
] as const;

export function serviceLocationImageUrl(index: number): string {
  return SERVICE_LOCATION_IMAGE_POOL[index % SERVICE_LOCATION_IMAGE_POOL.length];
}
