"use client";

/**
 * Shared branding CMS UI. Reads/writes brand-reference records in Supabase.
 * Global UI theme tokens remain in globals.css — not edited here.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CopyTokenButton } from "@/components/admin/branding/CopyTokenButton";

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        active
          ? "bg-[var(--cream-dark)] text-[var(--ink)]"
          : "bg-[var(--line)] text-[var(--muted)]"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function BrandingCmsEmpty({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--line-dark)] px-6 py-10 text-center">
      <p className="text-sm text-[var(--muted)]">No {label} yet.</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
      >
        Add new
      </button>
    </div>
  );
}

export function BrandingCmsToolbar({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-[var(--ink)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          Add new
        </button>
      </div>
    </div>
  );
}

export function ConfirmDeleteDialog({
  open,
  label,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40"
        aria-label="Cancel"
        onClick={onCancel}
      />
      <div className="relative max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-[var(--ink)]">Delete record?</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This will permanently remove <strong className="text-[var(--ink)]">{label}</strong>.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function BrandingCmsModal({
  open,
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col rounded-2xl border border-[var(--line)] bg-white shadow-lg">
        <div className="border-b border-[var(--line)] px-6 py-4">
          <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-[var(--line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const className =
    "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]";
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={className}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="mt-3 flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--line-dark)]"
      />
      {label}
    </label>
  );
}

export function TokenLinkBadge({ tokenName }: { tokenName: string | null }) {
  if (!tokenName) return null;
  return (
    <span className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
      Global token: <code className="rounded bg-[var(--cream)] px-1">{tokenName}</code>
      <CopyTokenButton value={tokenName} label="Copy" />
    </span>
  );
}

export function LogoPreviewDual({ fileUrl, alt }: { fileUrl: string; alt: string }) {
  if (!fileUrl) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)] p-4 text-center">
        <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">On light</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl} alt={alt} className="mx-auto mt-2 max-h-16 w-auto object-contain" />
      </div>
      <div className="rounded-lg border border-[var(--charcoal)] bg-[var(--charcoal)] p-4 text-center">
        <p className="text-[10px] font-semibold uppercase text-white/60">On dark</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={alt}
          className="mx-auto mt-2 max-h-16 w-auto object-contain brightness-0 invert"
        />
      </div>
    </div>
  );
}
