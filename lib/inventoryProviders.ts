/** Canonical inventory feed providers (one active per dealership/store). */
export type InventoryProvider = "homenet" | "vauto";

export const INVENTORY_PROVIDERS: InventoryProvider[] = ["homenet", "vauto"];

export const INVENTORY_PROVIDER_LABELS: Record<InventoryProvider, string> = {
  homenet: "HomeNet",
  vauto: "vAuto",
};

export function isInventoryProvider(value: unknown): value is InventoryProvider {
  return value === "homenet" || value === "vauto";
}

/**
 * Preferred provider for newly configured dealerships once vAuto import is
 * validated. Does **not** silently activate vAuto when a store has no settings
 * yet — see `LEGACY_UNTAGGED_INVENTORY_PROVIDER` for read-path fallback.
 */
export const DEFAULT_INVENTORY_PROVIDER: InventoryProvider = "vauto";

/**
 * Untagged (`inventory_provider IS NULL`) vehicle rows are legacy HomeNet-era
 * inventory. During cutover / backfill, treat null as HomeNet so public reads
 * do not return zero vehicles.
 */
export const LEGACY_UNTAGGED_INVENTORY_PROVIDER: InventoryProvider = "homenet";

/**
 * Read-path fallback when a store has no `dealership_inventory_settings` row.
 * Keep HomeNet until operators explicitly cut over after a successful vAuto import.
 */
export const FALLBACK_ACTIVE_INVENTORY_PROVIDER: InventoryProvider =
  LEGACY_UNTAGGED_INVENTORY_PROVIDER;

/** Resolve a DB `inventory_provider` value, mapping null/unknown → legacy HomeNet. */
export function resolveVehicleInventoryProvider(
  value: string | null | undefined,
): InventoryProvider {
  if (isInventoryProvider(value)) return value;
  return LEGACY_UNTAGGED_INVENTORY_PROVIDER;
}

/** Whether a vehicle row belongs to the store's active provider (null → HomeNet). */
export function vehicleMatchesActiveProvider(
  rowProvider: string | null | undefined,
  activeProvider: InventoryProvider,
): boolean {
  return resolveVehicleInventoryProvider(rowProvider) === activeProvider;
}

/**
 * PostgREST filter fragment for `inventory_provider`.
 * HomeNet includes null (untagged legacy rows); vAuto is exact match only.
 */
export function inventoryProviderEqFilter(
  provider: InventoryProvider,
): { kind: "eq"; provider: InventoryProvider } | { kind: "or"; filter: string } {
  if (provider === LEGACY_UNTAGGED_INVENTORY_PROVIDER) {
    return {
      kind: "or",
      filter: `inventory_provider.eq.${provider},inventory_provider.is.null`,
    };
  }
  return { kind: "eq", provider };
}
