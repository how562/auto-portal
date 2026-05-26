"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { HomepageSectionPreviewThumb } from "@/components/admin/HomepageSectionPreviewThumb";
import {
  getHomepageLayoutSectionDef,
  HOMEPAGE_LAYOUT_SECTION_DEFS,
  type HomepageLayoutSectionId,
} from "@/lib/homepageLayoutRegistry";
import type { HomepageLayoutAdminPayload } from "@/lib/homepageLayoutAdmin";

interface HomepageLayoutEditorProps {
  initialLayout: HomepageLayoutAdminPayload;
}

export function HomepageLayoutEditor({ initialLayout }: HomepageLayoutEditorProps) {
  const [sectionOrder, setSectionOrder] = useState<HomepageLayoutSectionId[]>(
    initialLayout.sectionOrder,
  );
  const [hiddenSections, setHiddenSections] = useState<HomepageLayoutSectionId[]>(
    initialLayout.hiddenSections,
  );
  const [swapSource, setSwapSource] = useState<HomepageLayoutSectionId | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hiddenSet = useMemo(() => new Set(hiddenSections), [hiddenSections]);

  const orderedDefs = useMemo(
    () =>
      sectionOrder
        .map((id) => getHomepageLayoutSectionDef(id))
        .filter((d): d is NonNullable<typeof d> => d != null),
    [sectionOrder],
  );

  const visibleCount = orderedDefs.filter((d) => !hiddenSet.has(d.id)).length;

  const persist = useCallback(
    async (order: HomepageLayoutSectionId[], hidden: HomepageLayoutSectionId[]) => {
      setBusy(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/homepage-layout", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionOrder: order, hiddenSections: hidden }),
      });
      const data = (await res.json()) as {
        layout?: HomepageLayoutAdminPayload;
        error?: string;
      };
      setBusy(false);
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return false;
      }
      if (data.layout) {
        setSectionOrder(data.layout.sectionOrder);
        setHiddenSections(data.layout.hiddenSections);
      }
      setMessage("Layout saved");
      return true;
    },
    [],
  );

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sectionOrder.length) return;
    const def = getHomepageLayoutSectionDef(sectionOrder[index]);
    const targetDef = getHomepageLayoutSectionDef(sectionOrder[target]);
    if (def?.locked || targetDef?.locked) return;

    const next = [...sectionOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setSectionOrder(next);
    void persist(next, hiddenSections);
  }

  function toggleHidden(id: HomepageLayoutSectionId) {
    const def = getHomepageLayoutSectionDef(id);
    if (def?.locked) return;

    const nextHidden = hiddenSet.has(id)
      ? hiddenSections.filter((h) => h !== id)
      : [...hiddenSections, id];
    setHiddenSections(nextHidden);
    void persist(sectionOrder, nextHidden);
  }

  function handleSwapClick(id: HomepageLayoutSectionId) {
    const def = getHomepageLayoutSectionDef(id);
    if (def?.locked) return;

    if (!swapSource) {
      setSwapSource(id);
      return;
    }

    if (swapSource === id) {
      setSwapSource(null);
      return;
    }

    const a = sectionOrder.indexOf(swapSource);
    const b = sectionOrder.indexOf(id);
    if (a < 0 || b < 0) {
      setSwapSource(null);
      return;
    }

    const next = [...sectionOrder];
    [next[a], next[b]] = [next[b], next[a]];
    setSectionOrder(next);
    setSwapSource(null);
    void persist(next, hiddenSections);
  }

  function onDragStart(index: number) {
    const id = sectionOrder[index];
    const def = getHomepageLayoutSectionDef(id);
    if (def?.locked) return;
    setDragIndex(index);
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const targetId = sectionOrder[index];
    if (getHomepageLayoutSectionDef(targetId)?.locked) return;

    const next = [...sectionOrder];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    setSectionOrder(next);
  }

  function onDragEnd() {
    if (dragIndex !== null) {
      void persist(sectionOrder, hiddenSections);
    }
    setDragIndex(null);
  }

  function resetToDefault() {
    const order = HOMEPAGE_LAYOUT_SECTION_DEFS.map((d) => d.id);
    setSectionOrder(order);
    setHiddenSections([]);
    setSwapSource(null);
    void persist(order, []);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {visibleCount} of {orderedDefs.length} sections visible on the live homepage.
            Drag to reorder, or use <strong className="font-semibold text-[var(--ink)]">Swap</strong>{" "}
            to exchange two sections.
          </p>
          {swapSource ? (
            <p className="mt-2 text-sm font-medium text-[var(--gold)]">
              Swap mode: choose a second section to swap with &ldquo;
              {getHomepageLayoutSectionDef(swapSource)?.label}&rdquo;.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setSwapSource(null)}
            className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            Cancel swap
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={resetToDefault}
            className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            Reset order
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            View live homepage
          </Link>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {/* Mini page map */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Page map
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <span className="homepage-layout-minimap-pill shrink-0 opacity-60">Header</span>
          {orderedDefs.map((def) => (
            <span
              key={def.id}
              className={`homepage-layout-minimap-pill shrink-0 ${
                hiddenSet.has(def.id) ? "opacity-35 line-through" : ""
              } ${swapSource === def.id ? "ring-2 ring-[var(--gold)]" : ""}`}
              title={def.label}
            >
              {def.label}
            </span>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {orderedDefs.map((def, index) => {
          const isHidden = hiddenSet.has(def.id);
          const isSwapSelected = swapSource === def.id;
          const isDragging = dragIndex === index;

          return (
            <li
              key={def.id}
              draggable={!def.locked && !busy}
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              className={`homepage-layout-row flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm transition sm:flex-row sm:items-stretch ${
                isDragging ? "border-[var(--gold)] opacity-80" : "border-[var(--line)]"
              } ${isSwapSelected ? "ring-2 ring-[var(--gold)]" : ""} ${
                isHidden ? "opacity-55" : ""
              }`}
            >
              <HomepageSectionPreviewThumb
                section={def}
                className="w-full shrink-0 sm:w-[148px]"
              />

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-[var(--ink)]">{def.label}</p>
                    <span className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {def.zone === "lower" ? "Lower page" : "Upper page"}
                    </span>
                    {isHidden ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Hidden
                      </span>
                    ) : null}
                    {def.locked ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Locked
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    {def.description}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{def.id}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!def.locked ? (
                    <>
                      <button
                        type="button"
                        disabled={busy || index === 0}
                        onClick={() => moveSection(index, -1)}
                        className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                        aria-label={`Move ${def.label} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={busy || index === orderedDefs.length - 1}
                        onClick={() => moveSection(index, 1)}
                        className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                        aria-label={`Move ${def.label} down`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleSwapClick(def.id)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                          isSwapSelected
                            ? "border-[var(--gold)] bg-[var(--gold-soft)]"
                            : "border-[var(--line-dark)]"
                        }`}
                      >
                        Swap
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleHidden(def.id)}
                        className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold"
                      >
                        {isHidden ? "Show" : "Hide"}
                      </button>
                    </>
                  ) : null}
                  {def.editHref ? (
                    <Link
                      href={def.editHref}
                      className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--cream)]"
                    >
                      Edit content
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
