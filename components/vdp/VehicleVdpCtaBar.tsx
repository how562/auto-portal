"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { VdpCtaAction, VdpCtaStack } from "@/components/vdp/VdpCtaAction";
import { resolveVdpCtasForVehicle } from "@/lib/vdpCta";
import type { VdpCtaSettingRow } from "@/lib/vdpCtaTypes";
import type { Store, VehicleDetail } from "@/lib/types";
import { btnSecondaryMd } from "@/lib/buttonClasses";

interface VehicleVdpCtaBarProps {
  vehicle: VehicleDetail;
  store: Store | null;
  storeId: string | null;
  vdpCtaSettings: VdpCtaSettingRow[];
  layout?: "bar" | "stack";
}

export function VehicleVdpCtaBar({
  vehicle,
  store,
  storeId,
  vdpCtaSettings,
  layout = "bar",
}: VehicleVdpCtaBarProps) {
  const { t, locale } = useLanguage();
  const exploreLabel = t("vdp.cta.exploreDetails", "Explore Details");
  const isStack = layout === "stack";

  const ctas = useMemo(
    () => resolveVdpCtasForVehicle(vdpCtaSettings, vehicle, locale),
    [vdpCtaSettings, vehicle, locale],
  );

  return (
    <VdpCtaStack layout={layout}>
      {ctas.map((cta) => (
        <VdpCtaAction
          key={cta.actionKey}
          cta={cta}
          vehicle={vehicle}
          store={store}
          storeId={storeId}
          layout={layout}
        />
      ))}

      {!isStack ? (
        <a
          href="#vehicle-overview"
          className={`${btnSecondaryMd} w-full text-center sm:w-auto lg:ml-auto`}
        >
          {exploreLabel}
        </a>
      ) : null}
    </VdpCtaStack>
  );
}
