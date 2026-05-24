import type { VdpCtaActionKey, VdpCtaAppliesTo, VdpCtaSettingRow } from "./vdpCtaTypes";

/** Default VDP CTA stack when `portal_vdp_cta_settings` is empty or missing. */
export const VDP_CTA_DEFAULTS: VdpCtaSettingRow[] = [
  {
    action_key: "calculate_payment",
    label: "Calculate My Payment",
    label_es: "Calcular mi pago",
    sort_order: 10,
    is_active: true,
    applies_to: "all",
  },
  {
    action_key: "value_trade",
    label: "Value My Trade",
    label_es: "Valuar mi auto",
    sort_order: 20,
    is_active: true,
    applies_to: "used",
  },
  {
    action_key: "check_availability",
    label: "Check Availability",
    label_es: "Consultar disponibilidad",
    sort_order: 30,
    is_active: true,
    applies_to: "all",
  },
  {
    action_key: "get_eprice",
    label: "Get E-Price",
    label_es: "Obtener e-precio",
    sort_order: 40,
    is_active: true,
    applies_to: "used",
  },
  {
    action_key: "unlock_savings",
    label: "Unlock Savings",
    label_es: "Desbloquear ahorros",
    sort_order: 40,
    is_active: true,
    applies_to: "new",
  },
];

export const VDP_CTA_ACTION_KEYS: VdpCtaActionKey[] = [
  "calculate_payment",
  "value_trade",
  "check_availability",
  "get_eprice",
  "unlock_savings",
];

export function isVdpCtaActionKey(value: string): value is VdpCtaActionKey {
  return (VDP_CTA_ACTION_KEYS as string[]).includes(value);
}

export function isVdpCtaAppliesTo(value: string): value is VdpCtaAppliesTo {
  return value === "all" || value === "new" || value === "used" || value === "certified";
}
