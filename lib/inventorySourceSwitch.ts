import type { InventoryProvider } from "@/lib/inventoryProviders";
import {
  countActiveVehiclesForProvider,
} from "@/lib/inventoryActiveSource";
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
  zeroVautoWarning: boolean;
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
    zeroVautoWarning: vautoCount === 0,
  };
}

export interface ValidateProviderSwitchInput {
  storeId: string;
  targetFeedSourceId: string;
  targetProvider: InventoryProvider;
  acknowledgeMismatch?: boolean;
  /** Required when switching HomeNet → vAuto (explicit cutover confirmation). */
  acknowledgeCutover?: boolean;
}

export type ProviderSwitchBlockReason =
  | "running_import"
  | "target_has_no_data"
  | "already_active"
  | "dramatic_mismatch_unacknowledged"
  | "cutover_unacknowledged";

export interface ProviderSwitchValidation {
  allowed: boolean;
  reason?: ProviderSwitchBlockReason;
  message?: string;
  comparison: ProviderCountComparison;
  currentProvider: InventoryProvider | null;
  currentFeedSourceId: string | null;
  requiresCutoverAck: boolean;
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

async function resolveProviderCounts(
  storeId: string,
  cachedHomenet: number,
  cachedVauto: number,
): Promise<ProviderCountComparison> {
  let homenetCount = cachedHomenet;
  let vautoCount = cachedVauto;

  // Prefer live counts when cached last_vehicle_count is stale/zero so
  // legacy null-provider HomeNet rows still allow rollback switches.
  if (homenetCount === 0 || vautoCount === 0) {
    const [liveHomenet, liveVauto] = await Promise.all([
      countActiveVehiclesForProvider(storeId, "homenet"),
      countActiveVehiclesForProvider(storeId, "vauto"),
    ]);
    if (homenetCount === 0 && liveHomenet > 0) homenetCount = liveHomenet;
    if (vautoCount === 0 && liveVauto > 0) vautoCount = liveVauto;
  }

  return compareProviderCounts(homenetCount, vautoCount);
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

  const emptyComparison = compareProviderCounts(0, 0);

  if (currentFeedSourceId === input.targetFeedSourceId) {
    return {
      allowed: false,
      reason: "already_active",
      message: "This provider is already the active inventory source.",
      comparison: emptyComparison,
      currentProvider,
      currentFeedSourceId,
      requiresCutoverAck: false,
    };
  }

  const { data: sources } = await supabase
    .from("inventory_feed_sources")
    .select("provider, last_vehicle_count")
    .eq("store_id", storeId);

  const cachedHomenet =
    Number(sources?.find((s) => s.provider === "homenet")?.last_vehicle_count) ||
    0;
  const cachedVauto =
    Number(sources?.find((s) => s.provider === "vauto")?.last_vehicle_count) ||
    0;
  const comparison = await resolveProviderCounts(
    storeId,
    cachedHomenet,
    cachedVauto,
  );

  const targetCount =
    input.targetProvider === "homenet"
      ? comparison.homenetCount
      : comparison.vautoCount;

  const switchingToVauto =
    input.targetProvider === "vauto" && currentProvider !== "vauto";
  const requiresCutoverAck = switchingToVauto;

  if (await hasRunningFeedImport()) {
    return {
      allowed: false,
      reason: "running_import",
      message:
        "An inventory import is currently running. Wait for it to finish before switching sources.",
      comparison,
      currentProvider,
      currentFeedSourceId,
      requiresCutoverAck,
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
      requiresCutoverAck,
    };
  }

  if (requiresCutoverAck && !input.acknowledgeCutover) {
    return {
      allowed: false,
      reason: "cutover_unacknowledged",
      message:
        "Confirm the HomeNet → vAuto cutover for this dealership. Public inventory will switch to vAuto only after you acknowledge.",
      comparison,
      currentProvider,
      currentFeedSourceId,
      requiresCutoverAck,
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
      requiresCutoverAck,
    };
  }

  return {
    allowed: true,
    comparison,
    currentProvider,
    currentFeedSourceId,
    requiresCutoverAck,
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
