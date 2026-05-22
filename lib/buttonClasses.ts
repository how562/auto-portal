/** Shared button styles: 6–8px radius, solid primary, clean secondary, no pill shapes. */

const btnBase =
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:pointer-events-none disabled:opacity-60";

export const btnPrimary = `${btnBase} bg-[var(--ink)] text-white hover:bg-[var(--charcoal)]`;

export const btnPrimarySm = `${btnPrimary} px-5 py-2.5 text-xs`;
export const btnPrimaryMd = `${btnPrimary} px-6 py-3 text-sm`;
export const btnPrimaryLg = `${btnPrimary} px-8 py-3.5 text-sm`;

export const btnSecondary = `${btnBase} border border-[var(--line-dark)] bg-white text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--cream)]`;

export const btnSecondarySm = `${btnSecondary} px-5 py-2.5 text-xs`;
export const btnSecondaryMd = `${btnSecondary} px-6 py-3 text-sm`;
export const btnSecondaryLg = `${btnSecondary} px-8 py-3.5 text-sm`;

/** For CTAs on dark backgrounds (hero bands, footer outlines). */
export const btnOnDark = `${btnBase} border border-white/25 bg-transparent text-white hover:bg-white/10`;

export const btnOnDarkMd = `${btnOnDark} px-8 py-3.5 text-sm`;

/** Inverted CTA on charcoal/image heroes. */
export const btnLight = `${btnBase} bg-white text-[var(--ink)] hover:bg-[var(--cream)]`;

export const btnLightMd = `${btnLight} px-6 py-3 text-sm`;

export const btnBlock = "w-full";

export const btnCompact = `${btnPrimary} px-4 py-2 text-xs`;

export const btnAccent = `${btnBase} bg-[var(--gold)] text-[var(--ink)] hover:opacity-90`;

export const btnAccentMd = `${btnAccent} px-8 py-3.5 text-sm`;

export const btnAccentSm = `${btnAccent} px-6 py-2.5 text-xs`;

export const btnCardPrimary = `${btnPrimary} px-3 py-2 text-[11px]`;

export const btnCardSecondary = `${btnSecondary} px-3 py-2 text-[11px]`;
