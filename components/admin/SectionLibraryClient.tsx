"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SectionLibraryPicker } from "@/components/admin/SectionLibraryPicker";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

export function SectionLibraryClient() {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  async function seedDemo(rebuild: boolean) {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      const res = await fetch("/api/admin/cms-demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rebuild }),
      });
      const data = (await res.json()) as {
        error?: string;
        sectionCount?: number;
        rebuilt?: boolean;
        slug?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setSeedMessage(
        data.rebuilt
          ? `Demo page rebuilt with ${data.sectionCount} sections.`
          : `Demo page ready (${data.sectionCount} sections).`,
      );
      router.refresh();
    } catch (err: unknown) {
      setSeedError(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          CMS demo page
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Creates or updates a published page at{" "}
          <code className="rounded bg-[var(--cream-dark)] px-1">/{CMS_DEMO_SLUG}</code> with legacy
          library section examples (starter content included).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={seeding}
            onClick={() => seedDemo(false)}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {seeding ? "Working…" : "Create / update demo page"}
          </button>
          <button
            type="button"
            disabled={seeding}
            onClick={() => {
              if (
                confirm(
                  "Replace all sections on the demo page? Existing demo sections will be removed.",
                )
              ) {
                seedDemo(true);
              }
            }}
            className={`${btnSecondaryMd} disabled:opacity-60`}
          >
            Rebuild demo sections
          </button>
          <Link
            href={`/${CMS_DEMO_SLUG}`}
            target="_blank"
            rel="noreferrer"
            className={btnSecondaryMd}
          >
            View live demo
          </Link>
        </div>
        {seedMessage ? <p className="mt-3 text-sm text-emerald-700">{seedMessage}</p> : null}
        {seedError ? <p className="mt-3 text-sm text-red-600">{seedError}</p> : null}
      </section>

      <SectionLibraryPicker showLibraryLink={false} />
    </>
  );
}
