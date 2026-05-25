"use client";

/**
 * Cavender Auto Group-first branding hub.
 * Dealership/OEM UI must stay in card + modal reference format only — no store nav, tabs, or full brand pages.
 *
 * This component reads from global design tokens. Update :root in app/globals.css to apply changes site-wide.
 */

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { BrandColorTokensPanel } from "@/components/admin/branding/BrandColorTokensPanel";
import { BrandTypographyTokensPanel } from "@/components/admin/branding/BrandTypographyTokensPanel";
import { DealerReferenceCard } from "@/components/admin/branding/DealerReferenceCard";
import { DealerReferenceModal } from "@/components/admin/branding/DealerReferenceModal";
import { DealershipComplianceNotice } from "@/components/admin/branding/DealershipComplianceNotice";
import {
  BRANDING_TABS,
  GROUP_IDENTITY,
  GROUP_LOGO_SRC,
  type BrandingTabId,
  type DealerBrandReference,
} from "@/lib/brandingHub";
import { BRAND_NAME } from "@/lib/brand";

interface BrandingHubProps {
  dealerReferences: DealerBrandReference[];
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
  return <div className="pt-6">{children}</div>;
}

export function BrandingHub({ dealerReferences }: BrandingHubProps) {
  const [activeTab, setActiveTab] = useState<BrandingTabId>("identity");
  const [modalDealer, setModalDealer] = useState<DealerBrandReference | null>(null);

  const openDealerTab = useCallback(() => setActiveTab("dealer-oem-notes"), []);

  const previewDealers = useMemo(
    () => dealerReferences.slice(0, 4),
    [dealerReferences],
  );

  return (
    <div className="space-y-12">
      {/* Cavender Auto Group — primary */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          Parent brand
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
          Cavender Auto Group Brand Identity
        </h2>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--cream)] px-8 py-6">
            <Image
              src={GROUP_LOGO_SRC}
              alt={`${BRAND_NAME} logo`}
              width={200}
              height={48}
              className="h-10 w-auto sm:h-11"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <p className="text-sm font-medium text-[var(--ink)]">{GROUP_IDENTITY.tagline}</p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {GROUP_IDENTITY.summary}
            </p>
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

      {/* Group-wide standards — tabbed */}
      <section>
        <div className="border-b border-[var(--line)] pb-4">
          <h2 className="text-xl font-semibold tracking-tight">Group-wide Brand Standards</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            Logo, color, type, voice, and disclaimer rules apply across all Cavender Auto Group
            properties. Use these defaults before applying store-specific OEM requirements.
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
            <div className="prose-cms max-w-3xl space-y-4 text-sm text-[var(--muted)]">
              <p>
                <strong className="text-[var(--ink)]">{GROUP_IDENTITY.name}</strong> is the
                umbrella brand for web, email, vendor decks, and shared creative templates.
              </p>
              <p>
                Voice is confident, community-minded, and clear — never franchise-first on group
                materials. Dealership names appear as supporting lines or location labels.
              </p>
              <p>
                Vendor deliverables should ship with Cavender Auto Group assets approved in the
                Logos and Colors tabs before any OEM lockups are applied.
              </p>
            </div>
          </TabPanel>

          <TabPanel id="logos" activeTab={activeTab}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--cream)] p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Primary — on light
                </p>
                <div className="mt-4 flex justify-center py-4">
                  <Image
                    src={GROUP_LOGO_SRC}
                    alt=""
                    width={180}
                    height={44}
                    className="h-9 w-auto"
                  />
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Use on cream and white backgrounds. Maintain clear space equal to the height of
                  the “C” in Cavender.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--charcoal)] bg-[var(--charcoal)] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Reversed — on dark
                </p>
                <div className="mt-4 flex justify-center py-4">
                  <Image
                    src={GROUP_LOGO_SRC}
                    alt=""
                    width={180}
                    height={44}
                    className="h-9 w-auto brightness-0 invert"
                  />
                </div>
                <p className="mt-3 text-xs text-white/65">
                  Use on charcoal panels and photography overlays. Do not stretch or recolor the
                  mark.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-[var(--muted)]">
              OEM logos are never substitutes for the group mark on corporate pages, group campaigns,
              or shared vendor toolkits.
            </p>
          </TabPanel>

          <TabPanel id="colors" activeTab={activeTab}>
            <BrandColorTokensPanel />
          </TabPanel>

          <TabPanel id="typography" activeTab={activeTab}>
            <BrandTypographyTokensPanel />
          </TabPanel>

          <TabPanel id="messaging" activeTab={activeTab}>
            <div className="max-w-3xl space-y-4 text-sm text-[var(--muted)]">
              <p>
                <strong className="text-[var(--ink)]">Tone:</strong> Warm, direct, and
                trustworthy — speak as one group serving multiple communities.
              </p>
              <p>
                <strong className="text-[var(--ink)]">Preferred phrasing:</strong> “Cavender Auto
                Group,” “our dealerships,” “guided discovery,” “your local Cavender store.”
              </p>
              <p>
                <strong className="text-[var(--ink)]">Avoid:</strong> Leading with a single
                franchise on group pages, implied OEM corporate endorsement, or competing dealer
                names in shared assets.
              </p>
            </div>
          </TabPanel>

          <TabPanel id="disclaimers" activeTab={activeTab}>
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--muted)]">
              <p>
                Group-level materials should include applicable offer expiration, inventory, and
                tax/title/license language when pricing is shown.
              </p>
              <p>
                Store-specific disclaimers and OEM mandatory footers live in each dealership
                reference card — always combine group rules with the relevant store/OEM notes.
              </p>
              <p className="rounded-lg border border-[var(--line-dark)] bg-[var(--cream-dark)] px-4 py-3 text-[var(--ink)]">
                When in doubt, route creative through marketing compliance before publish — this hub
                is a reference, not a substitute for current OEM PDF standards.
              </p>
            </div>
          </TabPanel>

          <TabPanel id="dealer-oem-notes" activeTab={activeTab}>
            <DealershipComplianceNotice />
            <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
              Compact compliance references by store — cards and detail modals only. Open a card for
              rules, required ad elements, and restrictions. Logos, colors, typography, and messaging
              are defined at the Cavender Auto Group level in the tabs above.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dealerReferences.map((dealer) => (
                <DealerReferenceCard
                  key={dealer.id}
                  dealer={dealer}
                  onViewDetails={() => setModalDealer(dealer)}
                />
              ))}
            </div>
          </TabPanel>
        </div>
      </section>

      {/* Secondary — dealership compliance references (cards/modals only) */}
      <section className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/50 p-6 sm:p-8">
        <DealershipComplianceNotice />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Dealership / OEM Reference Cards
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Quick compliance lookup by store. For the full grid and details, open{" "}
              <strong className="font-medium text-[var(--ink)]">
                Dealership Compliance References
              </strong>{" "}
              in the group standards tabs above.
            </p>
          </div>
          <button
            type="button"
            onClick={openDealerTab}
            className="text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
          >
            View all references →
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewDealers.map((dealer) => (
            <DealerReferenceCard
              key={dealer.id}
              dealer={dealer}
              compact
              onViewDetails={() => setModalDealer(dealer)}
            />
          ))}
        </div>
      </section>

      <DealerReferenceModal dealer={modalDealer} onClose={() => setModalDealer(null)} />
    </div>
  );
}
