/**
 * Pure JLR audience matching helpers (no React / Supabase).
 * Used by `inventoryAudiences.ts` and unit tests.
 */

export const JLR_POOL_STORE_ID = "b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d";

export type InventoryAudienceKey = "jaguar" | "land_rover";

export type InventoryAudienceRules = {
  version: number;
  include_used: boolean;
  include_cpo_as_used: boolean;
  new_make_any_of: string[];
  new_land_rover_family?: boolean;
};

const AUDIENCE_KEYS = new Set<string>(["jaguar", "land_rover"]);

export function isInventoryAudienceKey(
  value: unknown,
): value is InventoryAudienceKey {
  return typeof value === "string" && AUDIENCE_KEYS.has(value);
}

/** Collapse make strings for comparison: "Land Rover" / "LAND_ROVER" → "landrover". */
export function normalizeMakeToken(make: string | null | undefined): string {
  return String(make ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function normalizeConditionToken(
  condition: string | null | undefined,
): "new" | "used" | "cpo" | "other" | "missing" {
  const raw = String(condition ?? "").trim().toLowerCase();
  if (!raw) return "missing";
  if (raw === "n" || raw === "new" || raw.startsWith("new")) return "new";
  if (raw === "cpo" || raw.includes("cert")) return "cpo";
  if (
    raw === "u" ||
    raw === "used" ||
    raw.startsWith("used") ||
    raw.includes("pre")
  ) {
    return "used";
  }
  return "other";
}

export function isSharedPreownedCondition(
  condition: string | null | undefined,
): boolean {
  const c = normalizeConditionToken(condition);
  return c === "used" || c === "cpo";
}

export function isJaguarMake(make: string | null | undefined): boolean {
  return normalizeMakeToken(make) === "jaguar";
}

/**
 * Land Rover family for **new** franchise classification.
 * Primary: feed make. Fallback model only when make blank/inconsistent.
 */
export function isLandRoverFamilyMake(
  make: string | null | undefined,
  model?: string | null,
): boolean {
  const makeTok = normalizeMakeToken(make);
  if (
    makeTok === "landrover" ||
    makeTok === "rangerover" ||
    makeTok.startsWith("rangerover")
  ) {
    return true;
  }
  // Documented fallback: make blank or inconsistent → inspect model
  if (!makeTok || makeTok === "other" || makeTok === "unknown") {
    const modelTok = normalizeMakeToken(model);
    if (modelTok.startsWith("rangerover") || modelTok.startsWith("landrover")) {
      return true;
    }
  }
  return false;
}

export function vehicleMatchesAudience(
  vehicle: {
    condition?: string | null;
    make?: string | null;
    model?: string | null;
  },
  audienceKey: InventoryAudienceKey,
): boolean {
  if (isSharedPreownedCondition(vehicle.condition)) return true;

  const cond = normalizeConditionToken(vehicle.condition);
  if (cond !== "new") return false;

  if (audienceKey === "jaguar") {
    return isJaguarMake(vehicle.make);
  }

  return isLandRoverFamilyMake(vehicle.make, vehicle.model);
}

export function vehicleMatchesAnyJlrAudience(vehicle: {
  condition?: string | null;
  make?: string | null;
  model?: string | null;
}): boolean {
  return (
    vehicleMatchesAudience(vehicle, "jaguar") ||
    vehicleMatchesAudience(vehicle, "land_rover")
  );
}

export function audienceMembershipOrFilter(
  audienceKey: InventoryAudienceKey,
): string {
  const shared =
    "condition.eq.used,condition.eq.cpo,condition.ilike.used,condition.ilike.cpo";
  if (audienceKey === "jaguar") {
    return `${shared},and(condition.eq.new,make.ilike.jaguar)`;
  }
  return `${shared},and(condition.eq.new,or(make.ilike.land rover,make.ilike.landrover,make.ilike.range rover,make.ilike.rangerover))`;
}

export function jlrPoolUnionMembershipOrFilter(): string {
  return [
    "condition.eq.used",
    "condition.eq.cpo",
    "condition.ilike.used",
    "condition.ilike.cpo",
    "and(condition.eq.new,make.ilike.jaguar)",
    "and(condition.eq.new,or(make.ilike.land rover,make.ilike.landrover,make.ilike.range rover,make.ilike.rangerover))",
  ].join(",");
}

export function vehicleDetailPathWithAudience(
  vehicleId: string,
  audienceKey?: InventoryAudienceKey | null,
): string {
  const base = `/inventory/${vehicleId}`;
  if (audienceKey) return `${base}?audience=${audienceKey}`;
  return base;
}

export function canonicalVehiclePath(vehicle: {
  id: string;
  condition?: string | null;
  make?: string | null;
  model?: string | null;
}): string {
  if (isSharedPreownedCondition(vehicle.condition)) {
    return `/inventory/${vehicle.id}`;
  }
  if (isJaguarMake(vehicle.make)) {
    return vehicleDetailPathWithAudience(vehicle.id, "jaguar");
  }
  if (isLandRoverFamilyMake(vehicle.make, vehicle.model)) {
    return vehicleDetailPathWithAudience(vehicle.id, "land_rover");
  }
  return `/inventory/${vehicle.id}`;
}
