import type { PricingMathboxConfigRow } from "./pricingMathboxTypes";

/** Default math box presentation (values still come from feed at runtime). */
export const PRICING_MATHBOX_DEFAULTS: PricingMathboxConfigRow[] = [
  {
    line_key: "msrp",
    label: "MSRP",
    label_es: "MSRP",
    source_key: "msrp",
    group_name: "standard",
    line_type: "charge",
    display_order: 10,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "invoice",
    label: "Invoice",
    label_es: "Factura",
    source_key: "invoice",
    group_name: "standard",
    line_type: "charge",
    display_order: 15,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "dealer_discount",
    label: "Dealer Discount",
    label_es: "Descuento del concesionario",
    source_key: "dealer_discount",
    group_name: "discounts",
    line_type: "discount",
    display_order: 20,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "dealer_discount_derived",
    label: "Dealer Discount",
    label_es: "Descuento del concesionario",
    source_key: "dealer_discount_derived",
    group_name: "discounts",
    line_type: "discount",
    display_order: 21,
    is_active: false,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "internet_price",
    label: "Internet Price",
    label_es: "Precio en internet",
    source_key: "internet_price",
    group_name: "standard",
    line_type: "charge",
    display_order: 30,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "sale_price",
    label: "Selling Price",
    label_es: "Precio de venta",
    source_key: "sale_price",
    group_name: "standard",
    line_type: "charge",
    display_order: 35,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "conditional_incentives",
    label: "Conditional Offers",
    label_es: "Ofertas condicionales",
    source_key: "conditional_incentives",
    group_name: "conditional",
    line_type: "discount",
    display_order: 40,
    is_active: true,
    is_conditional: true,
    show_when_zero: false,
    collapse_by_default: true,
    disclaimer_text: null,
    disclaimer_key: "vdp.math.conditionalDisclaimer",
    applies_to: "all",
  },
  {
    line_key: "conditional_unavailable",
    label: "Additional offers",
    label_es: "Ofertas adicionales",
    source_key: "_conditional_unavailable",
    group_name: "conditional",
    line_type: "info",
    display_order: 45,
    is_active: true,
    is_conditional: true,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: "vdp.math.incentivesUnavailable",
    applies_to: "all",
  },
  {
    line_key: "doc_fee",
    label: "Doc Fee",
    label_es: "Cargo de documentación",
    source_key: "doc_fee",
    group_name: "fees",
    line_type: "charge",
    display_order: 50,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: null,
    applies_to: "all",
  },
  {
    line_key: "final_price",
    label: "Your Price",
    label_es: "Tu precio",
    source_key: "final_price",
    group_name: "final",
    line_type: "final",
    display_order: 60,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: "vdp.math.microcopy",
    applies_to: "all",
  },
  {
    line_key: "pricing_disclaimer",
    label: "Pricing disclaimer",
    label_es: "Aviso de precios",
    source_key: "_pricing_disclaimer",
    group_name: "final",
    line_type: "info",
    display_order: 70,
    is_active: true,
    is_conditional: false,
    show_when_zero: false,
    collapse_by_default: false,
    disclaimer_text: null,
    disclaimer_key: "vdp.math.disclaimer",
    applies_to: "all",
  },
];

export const MATHBOX_GROUP_ORDER: Record<string, number> = {
  standard: 10,
  discounts: 20,
  conditional: 30,
  fees: 40,
  final: 50,
};

/** HomeNet simplified mode — only these source keys may render. */
export const HOMENET_SIMPLIFIED_SOURCE_KEYS = new Set([
  "sale_price",
  "internet_price",
  "final_price",
  "selling_price",
]);

export function isMathboxGroupName(value: string): value is PricingMathboxConfigRow["group_name"] {
  return (
    value === "standard" ||
    value === "discounts" ||
    value === "conditional" ||
    value === "fees" ||
    value === "final"
  );
}

export function isMathboxLineType(value: string): value is PricingMathboxConfigRow["line_type"] {
  return (
    value === "charge" ||
    value === "discount" ||
    value === "subtotal" ||
    value === "final" ||
    value === "info"
  );
}

export function isMathboxAppliesTo(value: string): value is PricingMathboxConfigRow["applies_to"] {
  return value === "all" || value === "new" || value === "used" || value === "certified";
}
