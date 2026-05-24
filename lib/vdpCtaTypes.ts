export type VdpCtaActionKey =
  | "calculate_payment"
  | "value_trade"
  | "check_availability"
  | "get_eprice"
  | "unlock_savings";

export type VdpCtaAppliesTo = "all" | "new" | "used" | "certified";

export interface VdpCtaSettingRow {
  action_key: VdpCtaActionKey;
  label: string;
  label_es: string | null;
  sort_order: number;
  is_active: boolean;
  applies_to: VdpCtaAppliesTo;
}

export interface ResolvedVdpCta {
  actionKey: VdpCtaActionKey;
  label: string;
  sortOrder: number;
}
