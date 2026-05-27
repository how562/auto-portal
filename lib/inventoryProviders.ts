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

export const DEFAULT_INVENTORY_PROVIDER: InventoryProvider = "homenet";
