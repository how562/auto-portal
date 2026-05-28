import type { InventoryProvider } from "@/lib/inventoryProviders";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Absolute count gap that always triggers a dramatic mismatch warning. */
export const INVENTORY_COUNT_MISMATCH_ABSOLUTE = 10;

/** Relative gap (fraction of larger count) for mismatch warning. */
export const INVENTORY_COUNT_MISMATCH_RATIO = 0.15;

export interface ProviderCountComparison {
  homenetCount: number;
  vautoCount: number;
  difference: number;
  dramaticMismatch: boolean;
}

export function compareProviderCounts(
  homenetCount: number,
  vautoCount: number,
): ProviderCountComparison {
  const difference = Math.abs(homenetCount - vautoCount);
  const larger = Math.max(homenetCount, vautoCount);
  const ratioMismatch =
    larger > 0 && difference / larger >= INVENTORY_COUNT_MISMATCH_RATIO;
  const absoluteMismatch = difference >= INVENTORY_COUNT_MISMATCH_ABSOLUTE;
  const bothHaveStock = homenetCount > 0 && vautoCount > 0;

  return {
    homenetCount,
    vautoCount,
    difference,
    dramaticMismatch:
      bothHaveStock && (ratioMismatch || absoluteMismatch),
  };
}

export interface ValidateProviderSwitchInput {
  storeId: string;
  targetFeedSourceId: string;
  targetProvider: InventoryProvider;
  acknowledgeMismatch?: boolean;
}

export type ProviderSwitchBlockReason =
  | "running_import"
  | "target_has_no_data"
  | "already_active"
  | "dramatic_mismatch_unacknowledged";

export interface ProviderSwitchValidation {
  allowed: boolean;
  reason?: ProviderSwitchBlockReason;
  message?: string;
  comparison: ProviderCountComparison;
  currentProvider: InventoryProvider | null;
  currentFeedSourceId: string | null;
}

export async function hasRunningFeedImport(
  provider?: InventoryProvider,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("feed_import_runs")
    .select("id")
    .eq("status", "running")
    .limit(1);

  if (provider) {
    query = query.eq("inventory_provider", provider);
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`hasRunningFeedImport: ${error.message}`);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function validateProviderSwitch(
  input: ValidateProviderSwitchInput,
): Promise<ProviderSwitchValidation> {
  const supabase = getSupabaseAdmin();
  const storeId = input.storeId.trim();

  const { data: settings } = await supabase
    .from("dealership_inventory_settings")
    .select("active_inventory_feed_source_id")
    .eq("store_id", storeId)
    .maybeSingle();

  const currentFeedSourceId =
    (settings?.active_inventory_feed_source_id as string | null) ?? null;

  let currentProvider: InventoryProvider | null = null;
  if (currentFeedSourceId) {
    const { data: currentSource } = await supabase
      .from("inventory_feed_sources")
      .select("provider")
      .eq("id", currentFeedSourceId)
      .maybeSingle();
    currentProvider = (currentSource?.provider as InventoryProvider) ?? null;
  }

  if (currentFeedSourceId === input.targetFeedSourceId) {
    return {
      allowed: false,
      reason: "already_active",
      message: "This provider is already the active inventory source.",
      comparison: { homenetCount: 0, vautoCount: 0, difference: 0, dramaticMismatch: false },
      currentProvider,
      currentFeedSourceId,
    };
  }

  const { data: sources } = await supabase
    .from("inventory_feed_sources")
    .select("provider, last_vehicle_count")
    .eq("store_id", storeId);

  const homenetCount =
    sources?.find((s) => s.provider === "homenet")?.last_vehicle_count ?? 0;
  const vautoCount =
    sources?.find((s) => s.provider === "vauto")?.last_vehicle_count ?? 0;
  const comparison = compareProviderCounts(
    Number(homenetCount) || 0,
    Number(vautoCount) || 0,
  );

  const targetCount =
    input.targetProvider === "homenet"
      ? comparison.homenetCount
      : comparison.vautoCount;

  if (await hasRunningFeedImport()) {
    return {
      allowed: false,
      reason: "running_import",
      message:
        "An inventory import is currently running. Wait for it to finish before switching sources.",
      comparison,
      currentProvider,
      currentFeedSourceId,
    };
  }

  if (targetCount === 0) {
    return {
      allowed: false,
      reason: "target_has_no_data",
      message: `Cannot activate ${input.targetProvider}: no vehicles are stored for this provider at this dealership. Run a successful import first (shadow testing).`,
      comparison,
      currentProvider,
      currentFeedSourceId,
    };
  }

  if (comparison.dramaticMismatch && !input.acknowledgeMismatch) {
    return {
      allowed: false,
      reason: "dramatic_mismatch_unacknowledged",
      message: `HomeNet (${comparison.homenetCount}) and vAuto (${comparison.vautoCount}) counts differ significantly. Confirm you have reviewed the mismatch before switching.`,
      comparison,
      currentProvider,
      currentFeedSourceId,
    };
  }

  return {
    allowed: true,
    comparison,
    currentProvider,
    currentFeedSourceId,
  };
}

export async function logInventorySourceSwitch(input: {
  storeId: string;
  fromFeedSourceId: string | null;
  toFeedSourceId: string;
  fromProvider: InventoryProvider | null;
  toProvider: InventoryProvider;
  homenetCount: number;
  vautoCount: number;
  acknowledgedMismatch: boolean;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("inventory_source_switch_log").insert({
    store_id: input.storeId,
    from_feed_source_id: input.fromFeedSourceId,
    to_feed_source_id: input.toFeedSourceId,
    from_provider: input.fromProvider,
    to_provider: input.toProvider,
    homenet_count_at_switch: input.homenetCount,
    vauto_count_at_switch: input.vautoCount,
    acknowledged_mismatch: input.acknowledgedMismatch,
  });

  if (error) {
    console.warn(`inventory_source_switch_log: ${error.message}`);
  }
}
