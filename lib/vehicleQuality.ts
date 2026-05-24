/**
 * Admin merchandising signals computed for every imported vehicle.
 *
 * THESE ARE BACK-OFFICE FIELDS. Customers never see the raw values or
 * the admin sort labels — they exist solely so the merchandising team
 * can rank inventory and triage data-quality gaps.
 *
 * Spec (matches the SQL migration
 * `supabase/migrations/20260523130000_vehicles_merchandising_quality_v2.sql`):
 *
 *   image_count        = number of valid URLs in `image_urls`
 *   has_images         = image_count > 0
 *   data_quality_score = +50 has_images
 *                        + MIN(image_count, 30)
 *                        + 10 internet_price > 0 OR msrp > 0
 *                        + 10 mileage IS NOT NULL
 *                        +  5 trim
 *                        +  5 description
 *                        +  5 exterior_color
 *                        +  5 interior_color
 *                        ────────────────────
 *                        max  120
 *
 * Default backend order (admin AND silent customer ordering):
 *   has_images DESC, image_count DESC, data_quality_score DESC,
 *   internet_price DESC NULLS LAST
 */

const MAX_IMAGE_COUNT_BONUS = 30;

export const DATA_QUALITY_MAX_SCORE = 120;

export interface VehicleQualityInput {
  image_urls?: string[] | null;
  internet_price?: number | null;
  /** MSRP counts toward the "has price" point even when internet_price is null. */
  msrp?: number | null;
  mileage?: number | null;
  trim?: string | null;
  exterior_color?: string | null;
  interior_color?: string | null;
  description?: string | null;
}

export interface VehicleQuality {
  image_count: number;
  has_images: boolean;
  data_quality_score: number;
}

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isLikelyImageUrl(value: string): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  );
}

/**
 * Strict count: only entries inside `image_urls` that look like URLs.
 *
 * Older seed rows that carry only `primary_image_url` are rehydrated by
 * the SQL migration (`image_urls = [primary_image_url]`) so the JS and
 * SQL paths agree without keeping a fallback here.
 */
export function computeImageCount(
  vehicle: Pick<VehicleQualityInput, "image_urls">,
): number {
  if (!Array.isArray(vehicle.image_urls)) return 0;
  return vehicle.image_urls.filter(
    (url) => hasText(url) && isLikelyImageUrl(url.trim()),
  ).length;
}

export function computeVehicleQuality(
  vehicle: VehicleQualityInput,
): VehicleQuality {
  const imageCount = computeImageCount(vehicle);
  let score = 0;

  if (imageCount > 0) score += 50;
  score += Math.min(imageCount, MAX_IMAGE_COUNT_BONUS);

  const hasUsablePrice =
    (typeof vehicle.internet_price === "number" && vehicle.internet_price > 0) ||
    (typeof vehicle.msrp === "number" && vehicle.msrp > 0);
  if (hasUsablePrice) score += 10;

  if (vehicle.mileage !== null && vehicle.mileage !== undefined) score += 10;
  if (hasText(vehicle.trim)) score += 5;
  if (hasText(vehicle.description)) score += 5;
  if (hasText(vehicle.exterior_color)) score += 5;
  if (hasText(vehicle.interior_color)) score += 5;

  return {
    image_count: imageCount,
    has_images: imageCount > 0,
    data_quality_score: score,
  };
}

export interface MerchandisingSortVehicle {
  internet_price?: number | null;
  msrp?: number | null;
  year?: number | null;
  image_urls?: string[] | null;
  primary_image_url?: string | null;
  image_count?: number | null;
  has_images?: boolean | null;
  data_quality_score?: number | null;
}

function merchandisingImageCount(v: MerchandisingSortVehicle): number {
  if (typeof v.image_count === "number") return v.image_count;
  if (Array.isArray(v.image_urls)) return v.image_urls.length;
  return v.primary_image_url ? 1 : 0;
}

function merchandisingHasImages(v: MerchandisingSortVehicle): boolean {
  if (typeof v.has_images === "boolean") return v.has_images;
  return merchandisingImageCount(v) > 0;
}

function merchandisingQualityScore(v: MerchandisingSortVehicle): number {
  return typeof v.data_quality_score === "number" ? v.data_quality_score : 0;
}

function merchandisingPriceDesc(v: MerchandisingSortVehicle): number {
  return typeof v.internet_price === "number" ? v.internet_price : -Infinity;
}

/** Default Smart Match / merchandised ordering for matched vehicle lists. */
export function sortVehiclesByMerchandisingQuality<
  T extends MerchandisingSortVehicle,
>(vehicles: T[]): T[] {
  return [...vehicles].sort((a, b) => {
    const imgDiff =
      Number(merchandisingHasImages(b)) - Number(merchandisingHasImages(a));
    if (imgDiff !== 0) return imgDiff;

    const countDiff =
      merchandisingImageCount(b) - merchandisingImageCount(a);
    if (countDiff !== 0) return countDiff;

    const scoreDiff =
      merchandisingQualityScore(b) - merchandisingQualityScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    return merchandisingPriceDesc(b) - merchandisingPriceDesc(a);
  });
}
