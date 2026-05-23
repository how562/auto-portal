"use client";



import Link from "next/link";

import { useCta } from "@/components/cta/CtaProvider";

import { useLanguage } from "@/components/i18n/LanguageProvider";

import { PortalHeader } from "@/components/layout/PortalHeader";

import { btnPrimaryLg } from "@/lib/buttonClasses";



export default function VehicleNotFound() {

  const { t } = useLanguage();

  const inventoryNav = useCta("discovery_browse");



  return (

    <>

      <PortalHeader />

      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-4 pt-20 text-center">

        <h1 className="headline-stack text-4xl">{t("vdp.notFoundTitle")}</h1>

        <p className="mt-4 max-w-md text-[var(--muted)]">{t("vdp.notFoundBody")}</p>

        <Link

          href={inventoryNav.url ?? "/inventory"}

          className={`mt-8 ${btnPrimaryLg}`}

        >

          {t("vdp.backToInventory")}

        </Link>

      </div>

    </>

  );

}


