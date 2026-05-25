/** This screen reads from global design tokens. Update :root in app/globals.css to apply changes site-wide. */

import { BrandingCmsHub } from "@/components/admin/branding/BrandingCmsHub";
import {
  BRANDING_STRUCTURE_RULES,
} from "@/lib/brandingHub";
import { loadBrandingCmsBundle } from "@/lib/brandingCmsAdmin";
import { getBrandingCmsFallbackBundle } from "@/lib/brandingCmsFallback";
import { DESIGN_TOKEN_BRAND_CLARIFICATION } from "@/lib/designTokens";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function BrandingScreen() {
  const configured = isSupabaseAdminConfigured();
  let bundle = getBrandingCmsFallbackBundle();
  let loadError: string | null = null;

  if (configured) {
    try {
      bundle = await loadBrandingCmsBundle();
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Could not load branding CMS data.";
      bundle = getBrandingCmsFallbackBundle();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Branding</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          This hub defines the Cavender Auto Group brand system and provides dealership-specific
          reference notes for compliant usage across web, creative, and vendor materials.
        </p>
        <div
          className="mt-4 max-w-3xl rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm leading-relaxed text-[var(--ink)]"
          role="note"
        >
          {DESIGN_TOKEN_BRAND_CLARIFICATION.map((paragraph, index) => (
            <p key={paragraph} className={index > 0 ? "mt-2" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
        <ul className="mt-4 max-w-3xl space-y-1.5 text-xs leading-relaxed text-[var(--muted)]">
          {BRANDING_STRUCTURE_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="text-[var(--gold)]" aria-hidden>
                •
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-xs text-[var(--muted)]">
          <strong className="text-[var(--ink)]">Global UI tokens</strong> control the portal theme
          (read-only swatches in Colors/Typography tabs).{" "}
          <strong className="text-[var(--ink)]">Brand CMS tables</strong> store editable logos,
          reference colors, copy, and compliance records in Supabase.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-[var(--line-dark)] bg-[var(--cream-dark)] px-4 py-3 text-sm text-[var(--ink)]">
          {loadError} Run migration{" "}
          <code className="rounded bg-white/80 px-1">20260525120000_branding_cms.sql</code> if tables
          are missing.
        </p>
      ) : null}

      <BrandingCmsHub initialBundle={bundle} cmsConfigured={configured} />
    </div>
  );
}
