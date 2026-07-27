import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryProvider } from "@/lib/inventoryProviders";

export interface ReconcileStaleVehiclesResult {
  deactivated: number;
  skipped: boolean;
  skipReason?: string;
  previousActive: number;
  seenVinCount: number;
}

export interface ReconcileStaleVehiclesOptions {
  /**
   * Refuse reconcile when seen VINs are below this fraction of previous active
   * VIN-keyed inventory (default 0.5). Prevents wipeouts from truncated feeds.
   */
  minRetentionRatio?: number;
  /** Absolute minimum seen VINs before any deactivation (default 1). */
  minSeenVins?: number;
}

/**
 * Mark active vehicles missing from this import as inactive.
 *
 * Safety gates:
 * - Only VIN-keyed rows for the given store + provider
 * - No-op when the feed produced zero VINs
 * - No-op when seen VINs fall below retention ratio of prior active count
 */
export async function reconcileStaleVehicles(
  supabase: SupabaseClient,
  storeId: string,
  provider: InventoryProvider,
  seenVins: Iterable<string>,
  options: ReconcileStaleVehiclesOptions = {},
): Promise<ReconcileStaleVehiclesResult> {
  const minRetentionRatio = options.minRetentionRatio ?? 0.5;
  const minSeenVins = options.minSeenVins ?? 1;

  const seen = new Set(
    Array.from(seenVins)
      .map((vin) => vin.trim().toUpperCase())
      .filter(Boolean),
  );

  const empty: ReconcileStaleVehiclesResult = {
    deactivated: 0,
    skipped: true,
    previousActive: 0,
    seenVinCount: seen.size,
  };

  if (seen.size < minSeenVins) {
    return {
      ...empty,
      skipReason: `Reconcile skipped — only ${seen.size} VIN(s) seen (min ${minSeenVins})`,
    };
  }

  const { data: active, error } = await supabase
    .from("vehicles")
    .select("id, vin")
    .eq("store_id", storeId)
    .eq("inventory_provider", provider)
    .eq("status", "active")
    .not("vin", "is", null);

  if (error) {
    return {
      ...empty,
      skipReason: `Reconcile lookup failed: ${error.message}`,
    };
  }

  const activeRows = (active ?? []).filter(
    (row) => typeof row.vin === "string" && row.vin.trim().length > 0,
  );
  const previousActive = activeRows.length;

  if (previousActive === 0) {
    return {
      deactivated: 0,
      skipped: false,
      previousActive: 0,
      seenVinCount: seen.size,
    };
  }

  if (seen.size < previousActive * minRetentionRatio) {
    return {
      deactivated: 0,
      skipped: true,
      skipReason: `Reconcile skipped — seen ${seen.size} VIN(s) is below ${(minRetentionRatio * 100).toFixed(0)}% of ${previousActive} active (possible truncated feed)`,
      previousActive,
      seenVinCount: seen.size,
    };
  }

  const toDeactivate = activeRows.filter((row) => {
    const vin = (row.vin as string).trim().toUpperCase();
    return !seen.has(vin);
  });

  if (toDeactivate.length === 0) {
    return {
      deactivated: 0,
      skipped: false,
      previousActive,
      seenVinCount: seen.size,
    };
  }

  const ids = toDeactivate.map((row) => row.id as string);
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ status: "inactive", updated_at: now })
    .in("id", ids);

  if (updateError) {
    return {
      deactivated: 0,
      skipped: true,
      skipReason: `Reconcile update failed: ${updateError.message}`,
      previousActive,
      seenVinCount: seen.size,
    };
  }

  return {
    deactivated: ids.length,
    skipped: false,
    previousActive,
    seenVinCount: seen.size,
  };
}
