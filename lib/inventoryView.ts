export type InventoryViewMode = "grid" | "list";

const STORAGE_KEY = "frontier-inventory-view";

export function getStoredViewMode(): InventoryViewMode {
  if (typeof window === "undefined") return "grid";
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function storeViewMode(mode: InventoryViewMode): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
