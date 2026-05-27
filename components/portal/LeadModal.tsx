"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { btnBlock, btnPrimaryLg, btnPrimaryMd } from "@/lib/buttonClasses";
import { buildDefaultMessage, getModalHeadline, type LeadAction } from "@/lib/leads";
import { submitLeadFlow } from "@/lib/submitLead";

interface LeadModalProps {
  open: boolean;
  action: LeadAction;
  vehicleId: string | null;
  storeId: string | null;
  vehicleLabel: string | null;
  shopperIntent: string;
  onClose: () => void;
}

export function LeadModal({
  open,
  action,
  vehicleId,
  storeId,
  vehicleLabel,
  shopperIntent,
  onClose,
}: LeadModalProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactMethods = [
    { value: "email", label: t("lead.contact.email") },
    { value: "phone", label: t("lead.contact.phone") },
    { value: "text", label: t("lead.contact.text") },
    { value: "either", label: t("lead.contact.either") },
  ];

  if (!open) return null;

  const headline = getModalHeadline(action, t);
  const defaultMessage = buildDefaultMessage(action, vehicleLabel, shopperIntent, t);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      await submitLeadFlow({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        preferredContactMethod: String(form.get("preferredContactMethod") ?? ""),
        message: String(form.get("message") ?? ""),
        shopperIntent: shopperIntent || defaultMessage,
        leadAction: action,
        sourcePage: pathname || "/",
        vehicleId,
        storeId,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("lead.errorGeneric"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setError(null);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/50 "
        aria-label={t("common.closeModal")}
        onClick={handleClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-[0_24px_80px_rgba(12,12,12,0.2)] sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 text-[var(--muted)] transition hover:text-[var(--ink)]"
          aria-label={t("common.close")}
        >
          ✕
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cream)] text-2xl">
              ✓
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[var(--ink)]">
              {t("lead.successTitle")}
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t("lead.successBody")}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className={`mt-8 ${btnPrimaryLg}`}
            >
              {t("lead.close")}
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              {t("lead.connect")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              {headline}
            </h2>
            {vehicleLabel ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{vehicleLabel}</p>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <ModalField
                label={t("lead.name")}
                name="name"
                required
                disabled={submitting}
              />
              <ModalField
                label={t("lead.email")}
                name="email"
                type="email"
                required
                disabled={submitting}
              />
              <ModalField
                label={t("lead.phone")}
                name="phone"
                type="tel"
                disabled={submitting}
              />
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  {t("lead.preferredContact")}
                </label>
                <select
                  name="preferredContactMethod"
                  required
                  disabled={submitting}
                  defaultValue="either"
                  className="mt-1 w-full rounded-xl border border-[var(--line-dark)] bg-[var(--cream)] px-4 py-3 text-sm focus:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/10 disabled:opacity-60"
                >
                  {contactMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  {t("lead.message")}
                </label>
                <textarea
                  name="message"
                  rows={3}
                  disabled={submitting}
                  defaultValue={defaultMessage}
                  className="mt-1 w-full rounded-xl border border-[var(--line-dark)] bg-[var(--cream)] px-4 py-3 text-sm focus:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/10 disabled:opacity-60"
                />
              </div>

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className={`${btnBlock} ${btnPrimaryMd} disabled:opacity-60`}
              >
                {submitting ? t("lead.submitting") : t("lead.submit")}
              </button>
              <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
                {t("lead.trustCopy")}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LeadModal;

function ModalField({
  label,
  name,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border border-[var(--line-dark)] bg-[var(--cream)] px-4 py-3 text-sm focus:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/10 disabled:opacity-60"
      />
    </div>
  );
}

