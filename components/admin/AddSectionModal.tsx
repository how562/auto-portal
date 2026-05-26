"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SectionLibraryPicker } from "@/components/admin/SectionLibraryPicker";
import type { PageBuilderAddTarget } from "@/lib/pageBuilderLibrary";
import { btnSecondaryMd } from "@/lib/buttonClasses";

interface AddSectionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (target: PageBuilderAddTarget) => void;
  adding?: boolean;
  addingTarget?: PageBuilderAddTarget | null;
}

export function AddSectionModal({
  open,
  onClose,
  onAdd,
  adding = false,
  addingTarget = null,
}: AddSectionModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[var(--ink)]/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-section-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[201] flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--line-dark)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div>
            <h2 id="add-section-title" className="text-xl font-semibold tracking-tight">
              Add section
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Click <strong>Add</strong> on any block — starter copy and layout are applied
              instantly.
            </p>
          </div>
          <button type="button" onClick={onClose} className={`${btnSecondaryMd} shrink-0`}>
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <SectionLibraryPicker
            onAdd={onAdd}
            addingTarget={adding ? addingTarget : null}
            compact
            showLibraryLink={false}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
