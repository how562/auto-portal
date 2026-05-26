"use client";

/**
 * Cavender Auto Group-first branding CMS.
 * Global UI tokens (globals.css) control portal theme; Supabase tables hold editable brand-reference data.
 */

import { useCallback, useMemo, useState } from "react";
import { BrandColorTokensPanel } from "@/components/admin/branding/BrandColorTokensPanel";
import { BrandTypographyTokensPanel } from "@/components/admin/branding/BrandTypographyTokensPanel";
import {
  BrandingColorsEditor,
  BrandingDealerReferencesEditor,
  BrandingDisclaimersEditor,
  BrandingLogosEditor,
  BrandingMessagingEditor,
  BrandingTypographyEditor,
} from "@/components/admin/branding/cms/BrandingCmsEditors";
import { DealershipComplianceNotice } from "@/components/admin/branding/DealershipComplianceNotice";
import { BRANDING_TABS, GROUP_IDENTITY, GROUP_LOGO_SRC, type BrandingTabId } from "@/lib/brandingHub";
import { BRAND_NAME } from "@/lib/brand";
import type { BrandingCmsBundle } from "@/lib/brandingCmsTypes";
import { seedBrandingCms } from "@/lib/brandingCmsClient";

interface BrandingCmsHubProps {
  initialBundle: BrandingCmsBundle;
  cmsConfigured: boolean;
}

function TabPanel({
  id,
  activeTab,
  children,
}: {
  id: BrandingTabId;
  activeTab: BrandingTabId;
  children: React.ReactNode;
}) {
  if (id !== activeTab) return null;
  return <div className="pt-6 space-y-8">{children}</div>;
}

export function BrandingCmsHub({ initialBundle, cmsConfigured }: BrandingCmsHubProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const [activeTab, setActiveTab] = useState<BrandingTabId>("identity");
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const openDealerTab = useCallback(() => setActiveTab("dealer-oem-notes"), []);

  const primaryLogoUrl = useMemo(() => {
    const primary = bundle.logos.find(
      (l) => l.is_active && (l.logo_type === "primary" || l.logo_type === "horizontal"),
    );
    return primary?.file_url || bundle.logos.find((l) => l.is_active)?.file_url || GROUP_LOGO_SRC;
  }, [bundle.logos]);

  const previewDealers = useMemo(
    () => bundle.dealerReferences.filter((d) => d.is_active).slice(0, 4),
    [bundle.dealerReferences],
  );

  async function handleSeed() {
    setSeeding(true);
    setSeedError(null);
    try {
      await seedBrandingCms();
      const res = await fetch("/api/admin/branding/bundle", { credentials: "include" });
      const data = (await res.json()) as { bundle?: BrandingCmsBundle; error?: string };
      if (!res.ok) {
        setSeedError(data.error ?? "Reload failed");
        return;
      }
      if (data.bundle) setBundle(data.bundle);
    } catch (e: unknown) {
      setSeedError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-12">
      {bundle.source === "fallback" && cmsConfigured ? (
        <div className="rounded-xl border border-[var(--line-dark)] bg-[var(--cream-dark)] px-4 py-3 text-sm text-[var(--ink)]">
          <p>
            Showing demo fallback data. Load the default brand CMS records into Supabase to enable
            full editing persistence.
          </p>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="mt-3 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {seeding ? "Loading…" : "Load default brand data into database"}
          </button>
          {seedError ? <p className="mt-2 text-red-700">{seedError}</p> : null}
        </div>
      ) : null}

      {!cmsConfigured ? (
        <p className="rounded-xl border border-[var(--line-dark)] bg-[var(--cream-dark)] px-4 py-3 text-sm text-[var(--ink)]">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to save branding CMS records. Until then, edits
          apply only in this session (fallback mode).
        </p>
      ) : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          Parent brand
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
          Cavender Auto Group Brand Identity
        </h2>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--cream)] px-8 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryLogoUrl}
              alt={`${BRAND_NAME} logo`}
              className="h-10 w-auto max-w-[200px] object-contain sm:h-11"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <p className="text-sm font-medium text-[var(--ink)]">{GROUP_IDENTITY.tagline}</p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{GROUP_IDENTITY.summary}</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {GROUP_IDENTITY.principles.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[var(--gold)]" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="border-b border-[var(--line)] pb-4">
          <h2 className="text-xl font-semibold tracking-tight">Group-wide Brand Standards</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            Edit Cavender Auto Group brand-reference records below. Portal UI theme tokens are
            read-only in Colors and Typography (change <code className="text-xs">globals.css</code>{" "}
            for site-wide theme updates).
          </p>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-1 border-b border-[var(--line)]"
          role="tablist"
          aria-label="Brand standards"
        >
          {BRANDING_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-lg px-3 py-2.5 text-sm font-medium transition ${
                  selected
                    ? "border border-b-0 border-[var(--line)] bg-white text-[var(--ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-b-2xl rounded-tr-2xl border border-t-0 border-[var(--line)] bg-white px-6 pb-8 sm:px-8">
          <TabPanel id="identity" activeTab={activeTab}>
            <div className="max-w-3xl space-y-4 text-sm text-[var(--muted)]">
              <p>
                <strong className="text-[var(--ink)]">{GROUP_IDENTITY.name}</strong> is the umbrella
                brand. Use the Logos, Messaging, and Disclaimers tabs to manage editable CMS content.
              </p>
            </div>
          </TabPanel>

          <TabPanel id="logos" activeTab={activeTab}>
            <BrandingLogosEditor
              rows={bundle.logos}
              setRows={(logos) => setBundle({ ...bundle, logos, source: "database" })}
              readOnly={!cmsConfigured && bundle.source === "fallback"}
            />
          </TabPanel>

          <TabPanel id="colors" activeTab={activeTab}>
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">Global UI tokens (read-only)</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  These control the admin and portal theme. Edit :root in globals.css — not the brand
                  CMS color table.
                </p>
                <div className="mt-4">
                  <BrandColorTokensPanel />
                </div>
              </div>
              <div className="border-t border-[var(--line)] pt-8">
                <BrandingColorsEditor
                  rows={bundle.colors}
                  setRows={(colors) => setBundle({ ...bundle, colors, source: "database" })}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel id="typography" activeTab={activeTab}>
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">Global UI tokens (read-only)</h3>
                <div className="mt-4">
                  <BrandTypographyTokensPanel />
                </div>
              </div>
              <div className="border-t border-[var(--line)] pt-8">
                <BrandingTypographyEditor
                  rows={bundle.typography}
                  setRows={(typography) =>
                    setBundle({ ...bundle, typography, source: "database" })
                  }
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel id="messaging" activeTab={activeTab}>
            <BrandingMessagingEditor
              rows={bundle.messaging}
              setRows={(messaging) => setBundle({ ...bundle, messaging, source: "database" })}
            />
          </TabPanel>

          <TabPanel id="disclaimers" activeTab={activeTab}>
            <BrandingDisclaimersEditor
              rows={bundle.disclaimers}
              setRows={(disclaimers) => setBundle({ ...bundle, disclaimers, source: "database" })}
            />
          </TabPanel>

          <TabPanel id="dealer-oem-notes" activeTab={activeTab}>
            <BrandingDealerReferencesEditor
              rows={bundle.dealerReferences}
              setRows={(dealerReferences) =>
                setBundle({ ...bundle, dealerReferences, source: "database" })
              }
            />
          </TabPanel>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/50 p-6 sm:p-8">
        <DealershipComplianceNotice />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Dealership / OEM Reference Cards
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Compliance layer only — edit full records in{" "}
              <strong className="font-medium text-[var(--ink)]">
                Dealership Compliance References
              </strong>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={openDealerTab}
            className="text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Manage references →
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewDealers.map((dealer) => (
            <article
              key={dealer.id}
              className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm"
            >
              <p className="font-semibold text-[var(--ink)]">{dealer.store_name}</p>
              <p className="text-xs text-[var(--gold)]">{dealer.oem}</p>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">
                {dealer.compliance_notes}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
