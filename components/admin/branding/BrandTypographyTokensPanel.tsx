"use client";

/**
 * This component reads from global design tokens. Update globals.css / tailwind theme to apply changes site-wide.
 */

import { CopyTokenButton } from "@/components/admin/branding/CopyTokenButton";
import { fontTokens } from "@/lib/designTokens";
import { useResolvedFontFamily } from "@/lib/useResolvedCssVars";

export function BrandTypographyTokensPanel() {
  const resolvedFamily = useResolvedFontFamily();

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Type stack is set on <code className="rounded bg-[var(--cream)] px-1 text-xs">html</code>{" "}
        in globals.css and extended as{" "}
        <code className="rounded bg-[var(--cream)] px-1 text-xs">font-sans</code> in
        tailwind.config.ts.
      </p>
      <ul className="space-y-4">
        {fontTokens.map((token) => (
          <li
            key={token.key}
            className="rounded-xl border border-[var(--line)] p-4 text-sm"
          >
            <p className="font-semibold text-[var(--ink)]">{token.label}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{token.usage}</p>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted)]">Token family</dt>
                <dd className="font-mono text-[var(--ink)]">{token.family}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Tailwind</dt>
                <dd className="font-mono text-[var(--ink)]">{token.tailwindClass}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted)]">Computed (site)</dt>
                <dd className="font-mono text-[var(--ink)] break-all">
                  {resolvedFamily || "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyTokenButton value={token.family} label="Family" />
              <CopyTokenButton value={token.tailwindClass} label="Tailwind" />
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-[var(--line)] pt-6 font-sans">
        <p className="text-4xl font-bold tracking-tight text-[var(--ink)]">
          Display headline
        </p>
        <p className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Section headline
        </p>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Body copy uses the same global stack with relaxed line height for readability.
        </p>
      </div>
    </div>
  );
}
