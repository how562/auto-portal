"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import type { Store } from "@/lib/types";

interface PortalFooterProps {
  stores: Store[];
}

export function PortalFooter({ stores }: PortalFooterProps) {
  const { openLead } = useLeadCapture();
  const { scrollToGuided } = useDiscovery();

  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] text-white">
      <p
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[28%] select-none text-[clamp(5rem,18vw,14rem)] font-semibold tracking-tighter text-white/[0.04]"
        aria-hidden
      >
        Auto Group
      </p>

      <div className="portal-container relative py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="headline-stack text-3xl sm:text-4xl">
            Still deciding? Let us build your shortlist.
          </h2>
          <p className="mt-4 text-sm text-white/45">
            A concierge curates real options across our stores—personalized,
            pressure-free, ready when you are.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "general-shortlist",
                  shopperIntent: "Footer: Get my shortlist",
                })
              }
              className="rounded-full bg-[var(--gold)] px-8 py-4 text-sm font-semibold text-[var(--ink)] transition hover:brightness-110"
            >
              Get My Shortlist
            </button>
            <button
              type="button"
              onClick={scrollToGuided}
              className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Start Discovery
            </button>
          </div>
          <p className="mt-6 text-xs text-white/35">
            No pressure. Just real options from across our auto group.
          </p>
        </div>

        {stores.length > 0 ? (
          <div id="locations-contact" className="mt-14 border-t border-white/10 pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Locations & contact
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <p className="font-semibold">{store.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {[store.city, store.state].filter(Boolean).join(", ") ||
                      "—"}
                  </p>
                  {store.phone ? (
                    <p className="mt-2 text-sm text-[var(--gold-soft)]">
                      {store.phone}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterCol title="Discover" items={["Find My Vehicle", "Smart Match", "Categories"]} />
          <FooterCol title="Shop" items={["Inventory", "Under $30k", "Compare"]} />
          <FooterCol title="Group" items={["Locations", "How It Works", "Contact"]} />
          <FooterCol title="Legal" items={["Privacy", "Terms", "Accessibility"]} />
        </div>

        <p className="mt-12 text-[11px] text-white/25">
          © {new Date().getFullYear()} Auto Group. Guided discovery portal.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-white/30">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
