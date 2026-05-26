"use client";

import { CmsImageField } from "@/components/admin/CmsImageField";
import type { CMSSection } from "@/lib/cmsSectionModel";
import {
  BACKGROUND_PRESETS,
  SPACING_OPTIONS,
} from "@/lib/cmsSectionDesign";
import { parseSettings, settingString } from "@/lib/cmsSettings";

interface SectionDesignControlsProps {
  section: CMSSection;
  setSetting: (key: string, value: unknown) => void;
  setLayoutVariant: (value: string | null) => void;
}

const LAYOUT_VARIANTS = [
  { value: "", label: "Standard width" },
  { value: "full-bleed", label: "Full bleed content" },
  { value: "narrow", label: "Narrow copy column" },
  { value: "dark-band", label: "Dark text on section (hint)" },
];

export function SectionDesignControls({
  section,
  setSetting,
  setLayoutVariant,
}: SectionDesignControlsProps) {
  const s = parseSettings(section.settings);
  const bg = settingString(s, "background_color");
  const customBg = bg && !BACKGROUND_PRESETS.some((p) => p.value === bg);

  function setDesign(key: string, value: string) {
    setSetting(key, value || "");
    if (key === "layout_variant") {
      setLayoutVariant(value || null);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Design
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-[var(--muted)]">Background</span>
          <select
            value={customBg ? "__custom__" : bg}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom__") setDesign("background_color", "#ffffff");
              else setDesign("background_color", v);
            }}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {BACKGROUND_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
            <option value="__custom__">Custom color…</option>
          </select>
        </label>
        {customBg || (bg && !BACKGROUND_PRESETS.some((p) => p.value === bg)) ? (
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">Custom color</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={bg.startsWith("#") ? bg : "#f7f4ef"}
                onChange={(e) => setDesign("background_color", e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-[var(--line)]"
              />
              <input
                value={bg}
                onChange={(e) => setDesign("background_color", e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-mono"
              />
            </div>
          </label>
        ) : null}
        <div className="sm:col-span-2">
          <CmsImageField
            label="Background image (optional)"
            value={settingString(s, "background_image_url")}
            onChange={(url) => setSetting("background_image_url", url || "")}
          />
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Padding top</span>
          <select
            value={settingString(s, "padding_top", "default")}
            onChange={(e) => setDesign("padding_top", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {SPACING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Padding bottom</span>
          <select
            value={settingString(s, "padding_bottom", "default")}
            onChange={(e) => setDesign("padding_bottom", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {SPACING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Margin top</span>
          <select
            value={settingString(s, "margin_top", "none")}
            onChange={(e) => setDesign("margin_top", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {SPACING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Margin bottom</span>
          <select
            value={settingString(s, "margin_bottom", "none")}
            onChange={(e) => setDesign("margin_bottom", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {SPACING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-[var(--muted)]">Layout variant</span>
          <select
            value={
              settingString(s, "layout_variant") || section.layout_variant || ""
            }
            onChange={(e) => setDesign("layout_variant", e.target.value)}
            className="w-full max-w-md rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          >
            {LAYOUT_VARIANTS.map((o) => (
              <option key={o.value || "standard"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
