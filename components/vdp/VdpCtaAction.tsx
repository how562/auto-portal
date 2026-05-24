"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { formatVehicleLabel } from "@/lib/format";
import { vdpCtaActionToLeadAction } from "@/lib/vdpLead";
import type { ResolvedVdpCta } from "@/lib/vdpCtaTypes";
import type { Store, VehicleDetail } from "@/lib/types";
import { btnAccentMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface VdpCtaActionProps {
  cta: ResolvedVdpCta;
  vehicle: VehicleDetail;
  store: Store | null;
  storeId: string | null;
  layout: "bar" | "stack";
}

function creditNowConditionType(
  condition: string | null | undefined,
): "new" | "used" {
  return condition?.trim().toLowerCase() === "new" ? "new" : "used";
}

export function VdpCtaAction({
  cta,
  vehicle,
  store,
  storeId,
  layout,
}: VdpCtaActionProps) {
  const { openVdpLead, openValueTrade } = useLeadCapture();
  const label = formatVehicleLabel(vehicle);
  const isStack = layout === "stack";
  const widthClass = isStack ? "w-full" : "w-full lg:w-auto lg:min-w-[11rem]";
  const secondaryWidth = isStack ? "w-full" : "w-full sm:w-auto";

  switch (cta.actionKey) {
    case "calculate_payment":
      return (
        <div
          className={`cn-button-container ${widthClass}`}
          data-vin={vehicle.vin ?? ""}
          data-page-type="vdp"
          data-type={creditNowConditionType(vehicle.condition)}
        />
      );

    case "value_trade":
      return (
        <a
          href="#"
          role="button"
          className={`main-cta vdp-pricebox-cta-button stat-button-link ${btnAccentMd} ${secondaryWidth} text-center no-underline`}
          onClick={(event) => {
            event.preventDefault();
            openValueTrade({ vehicle, store, storeId });
          }}
        >
          {cta.label}
        </a>
      );

    case "check_availability":
    case "get_eprice":
    case "unlock_savings": {
      const leadAction = vdpCtaActionToLeadAction(cta.actionKey);
      if (!leadAction) return null;

      const intentByAction: Record<string, string> = {
        availability: `Check availability for ${label}`,
        eprice: `Get e-price for ${label}`,
        savings: `Unlock savings for ${label}`,
      };

      return (
        <button
          type="button"
          onClick={() =>
            openVdpLead({
              action: leadAction,
              vehicle,
              store,
              storeId,
              shopperIntent: intentByAction[leadAction] ?? `Inquiry for ${label}`,
            })
          }
          className={`${btnSecondaryMd} ${secondaryWidth}`}
        >
          {cta.label}
        </button>
      );
    }

    default:
      return null;
  }
}

/** Primary styling wrapper when CreditNow injects a button into the container. */
export function VdpCtaStack({ children, layout }: { children: React.ReactNode; layout: "bar" | "stack" }) {
  const isStack = layout === "stack";
  return (
    <div
      className={
        isStack
          ? "flex flex-col gap-2.5 [&_.cn-button-container]:w-full [&_.cn-button-container_a]:inline-flex [&_.cn-button-container_a]:w-full [&_.cn-button-container_a]:items-center [&_.cn-button-container_a]:justify-center [&_.cn-button-container_a]:rounded-md [&_.cn-button-container_a]:bg-[var(--ink)] [&_.cn-button-container_a]:px-5 [&_.cn-button-container_a]:py-3 [&_.cn-button-container_a]:text-sm [&_.cn-button-container_a]:font-semibold [&_.cn-button-container_a]:text-white"
          : "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center [&_.cn-button-container]:w-full [&_.cn-button-container]:lg:w-auto [&_.cn-button-container]:lg:min-w-[11rem] [&_.cn-button-container_a]:inline-flex [&_.cn-button-container_a]:w-full [&_.cn-button-container_a]:items-center [&_.cn-button-container_a]:justify-center [&_.cn-button-container_a]:rounded-md [&_.cn-button-container_a]:bg-[var(--ink)] [&_.cn-button-container_a]:px-5 [&_.cn-button-container_a]:py-3 [&_.cn-button-container_a]:text-sm [&_.cn-button-container_a]:font-semibold [&_.cn-button-container_a]:text-white"
      }
    >
      {children}
    </div>
  );
}
