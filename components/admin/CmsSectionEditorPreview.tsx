"use client";

import { useState } from "react";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import type { CMSSection, EnrichedCMSSection } from "@/lib/cmsSectionModel";
import type { Store } from "@/lib/types";
interface CmsSectionEditorPreviewProps {
  section: CMSSection;
  stores?: Store[];
}

export function CmsSectionEditorPreview({
  section,
  stores = [],
}: CmsSectionEditorPreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  const enriched: EnrichedCMSSection = {
    ...section,
    stores: section.section_type === "locations" ? stores : undefined,
    vehicles:
      section.section_type === "inventory_collection" ? [] : undefined,
  };

  const scale = viewport === "mobile" ? 0.48 : 0.52;
  const widthPct = viewport === "mobile" ? 208.33 : 192.31;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line-dark)] bg-[var(--cream)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-white px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Live preview
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              viewport === "desktop"
                ? "bg-[var(--ink)] text-white"
                : "bg-[var(--cream-dark)] text-[var(--muted)]"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              viewport === "mobile"
                ? "bg-[var(--ink)] text-white"
                : "bg-[var(--cream-dark)] text-[var(--muted)]"
            }`}
          >
            Mobile
          </button>
        </div>
      </div>
      <div
        className={`mx-auto overflow-y-auto overflow-x-hidden transition-all ${
          viewport === "mobile" ? "max-w-[280px] border-x border-[var(--line)]" : ""
        }`}
        style={{ maxHeight: "28rem" }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: `${widthPct}%`,
            minHeight: "8rem",
          }}
        >
          <CMSSectionRenderer sections={[enriched]} />
        </div>
      </div>
      {!section.is_active ? (
        <p className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Section is inactive — hidden on the public site.
        </p>
      ) : null}
    </div>
  );
}
