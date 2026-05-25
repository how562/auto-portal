"use client";

/**
 * This component reads from global design tokens. Update :root in app/globals.css to apply changes site-wide.
 */

import { CopyTokenButton } from "@/components/admin/branding/CopyTokenButton";
import {
  BRAND_COLOR_CSS_VARS,
  colorTokens,
  cssVarReference,
} from "@/lib/designTokens";
import { useResolvedCssVars } from "@/lib/useResolvedCssVars";

export function BrandColorTokensPanel() {
  const resolved = useResolvedCssVars(BRAND_COLOR_CSS_VARS);

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-[var(--muted)]">
        Swatches and values are read from{" "}
        <code className="rounded bg-[var(--cream)] px-1 text-xs">:root</code> in{" "}
        <code className="rounded bg-[var(--cream)] px-1 text-xs">app/globals.css</code>.
        Edit those variables to update the portal, admin, and this page automatically.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colorTokens.map((token) => {
          const computed = resolved[token.cssVar] ?? "—";
          const varRef = cssVarReference(token.cssVar);
          return (
            <li
              key={`${token.key}-${token.cssVar}`}
              className="flex flex-col gap-3 rounded-xl border border-[var(--line)] p-4"
            >
              <div className="flex gap-4">
                <span
                  className="h-14 w-14 shrink-0 rounded-lg border border-[var(--line-dark)]"
                  style={{ backgroundColor: varRef }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-[var(--ink)]">{token.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">
                    {token.key} → {token.cssVar}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                    {computed}
                  </p>
                  {token.tailwindBg ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Tailwind: <code className="text-[var(--ink)]">{token.tailwindBg}</code>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs leading-snug text-[var(--muted)]">
                    {token.usage}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyTokenButton value={token.cssVar} label="CSS var" />
                <CopyTokenButton value={varRef} label="var()" />
                {computed !== "—" ? (
                  <CopyTokenButton value={computed} label="Computed" />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
