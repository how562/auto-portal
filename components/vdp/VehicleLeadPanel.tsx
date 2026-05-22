"use client";



import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

import { formatPrice, formatVehicleLabel } from "@/lib/format";

import type { Store, VehicleDetail } from "@/lib/types";

import { btnBlock, btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";



interface VehicleLeadPanelProps {

  vehicle: VehicleDetail;

  store: Store | null;

}



export function VehicleLeadPanel({ vehicle, store }: VehicleLeadPanelProps) {

  const { t } = useLanguage();
  const { openLead } = useLeadCapture();

  const availability = useCta("availability");

  const buildShortlist = useCta("build_my_shortlist");

  const compareSimilar = useCta("compare_similar");

  const contactTeam = useCta("contact_team");

  const label = formatVehicleLabel(vehicle);

  const storeId = store?.id ?? vehicle.store_id ?? null;



  return (

    <div className="card-framer p-5 sm:p-6 lg:sticky lg:top-24">

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">

        {t("vdp.readyToConnect")}

      </p>

      <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">

        {formatPrice(vehicle.internet_price)}

      </p>

      <p className="mt-1 text-sm text-[var(--muted)]">

        {t("vdp.stock", undefined, { number: vehicle.stock_number ?? "—" })}

      </p>



      <div className="mt-6 flex flex-col gap-2">

        <button

          type="button"

          onClick={() =>

            openLead({

              action: "availability",

              vehicle,

              storeId,

              shopperIntent: `Check availability for ${label}`,

            })

          }

          className={`${btnBlock} ${btnPrimaryMd}`}

        >

          {availability.label}

        </button>

        <button

          type="button"

          onClick={() =>

            openLead({

              action: "shortlist",

              vehicle,

              storeId,

              shopperIntent: `Add to shortlist: ${label}`,

            })

          }

          className={`${btnBlock} ${btnSecondaryMd}`}

        >

          {buildShortlist.label}

        </button>

        <button

          type="button"

          onClick={() =>

            openLead({

              action: "compare",

              vehicle,

              storeId,

              shopperIntent: `Find similar to ${label}`,

            })

          }

          className={`${btnBlock} ${btnSecondaryMd}`}

        >

          {compareSimilar.label}

        </button>

        {store?.phone ? (

          <a

            href={`tel:${store.phone.replace(/\D/g, "")}`}

            className="mt-2 w-full rounded-md border border-dashed border-[var(--gold)] py-3.5 text-center text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"

          >

            {t("vdp.call", undefined, { phone: store.phone })}

          </a>

        ) : (

          <button

            type="button"

            onClick={() =>

              openLead({

                action: "availability",

                vehicle,

                storeId,

                shopperIntent: `Contact request for ${label}`,

              })

            }

            className="mt-2 w-full rounded-md border border-dashed border-[var(--gold)] py-3.5 text-sm font-semibold text-[var(--ink)]"

          >

            {contactTeam.label}

          </button>

        )}

      </div>



      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--muted)]">

        {t("vdp.trustCopy")}

      </p>

    </div>

  );

}


