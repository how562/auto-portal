import type { PortalTextKey, PortalTextValue } from "./portalTextTypes";

/** Default copy when Supabase has no row (aligned with lib/i18n/translations). */
export const PORTAL_TEXT_FALLBACKS: Record<PortalTextKey, PortalTextValue> = {
  smart_match_eyebrow: {
    labelEn: "Smart match",
    labelEs: "Match inteligente",
    category: "smart_match",
  },
  smart_match_title: {
    labelEn: "Refine your fit",
    labelEs: "Afina tu búsqueda",
    category: "smart_match",
  },
  smart_match_step_1_title: {
    labelEn: "What do you need it for?",
    labelEs: "¿Para qué lo necesitas?",
    category: "smart_match",
  },
  smart_match_step_1_body: {
    labelEn:
      "Pick the story that fits your life—we'll bias inventory toward it.",
    labelEs:
      "Elige la historia que encaja con tu vida; priorizamos inventario acorde.",
    category: "smart_match",
  },
  smart_match_results_title: {
    labelEn: "Your matches",
    labelEs: "Tus opciones",
    category: "smart_match",
  },
  smart_match_results_body: {
    labelEn:
      "Based on what matters to you, here are a few vehicles to consider.",
    labelEs:
      "Según lo que más te importa, estas son algunas opciones para considerar.",
    category: "smart_match",
  },
  smart_match_empty: {
    labelEn: "Complete the steps to reveal your matches",
    labelEs: "Completa los pasos para ver tus opciones",
    category: "smart_match",
  },
  smart_match_view_all: {
    labelEn: "View all matching vehicles",
    labelEs: "Ver todas las opciones",
    category: "smart_match",
  },
  "homepage.title": {
    labelEn: "Cavender Confidence.\nDriven by Impact.",
    labelEs: "Confianza Cavender.\nImpulsados por el impacto.",
    category: "homepage",
  },
  "homepage.subtitle": {
    labelEn:
      "At Cavender Auto Group, every vehicle we sell supports the people and causes that make our communities stronger. Together, we're driving more than change — we're building a better tomorrow.",
    labelEs:
      "En Cavender Auto Group, cada vehículo que vendemos apoya a las personas y causas que fortalecen nuestras comunidades. Juntos impulsamos algo más que cambio: construimos un mejor mañana.",
    category: "homepage",
  },
  "inventory.title": {
    labelEn: "Inventory Command Center",
    labelEs: "Centro de comando de inventario",
    category: "inventory",
  },
  "discovery.heading": {
    labelEn: "How do you drive?",
    labelEs: "¿Cómo manejas?",
    category: "discovery",
  },
};

export const PORTAL_TEXT_KEYS = Object.keys(
  PORTAL_TEXT_FALLBACKS,
) as PortalTextKey[];
