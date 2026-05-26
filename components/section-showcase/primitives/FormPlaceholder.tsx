"use client";

import { btnPrimaryMd } from "@/lib/buttonClasses";
import { cardFormWrap } from "@/lib/cardClasses";

const FIELDS = [
  { id: "name", label: "Full name", type: "text" as const, half: true },
  { id: "email", label: "Email", type: "email" as const, half: true },
  { id: "phone", label: "Phone", type: "tel" as const, half: true },
  { id: "store", label: "Preferred store", type: "text" as const, half: true },
  { id: "message", label: "Message", type: "textarea" as const, half: false },
];

export function FormPlaceholder({
  submitLabel = "Send message",
}: {
  submitLabel?: string;
}) {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.id} className={field.half ? "" : "sm:col-span-2"}>
            <label
              htmlFor={`placeholder-${field.id}`}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
            >
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={`placeholder-${field.id}`}
                rows={4}
                disabled
                placeholder="Your message…"
                className="ui-input w-full resize-y disabled:cursor-not-allowed disabled:opacity-70"
              />
            ) : (
              <input
                id={`placeholder-${field.id}`}
                type={field.type}
                disabled
                placeholder={field.label}
                className="ui-input w-full disabled:cursor-not-allowed disabled:opacity-70"
              />
            )}
          </div>
        ))}
      </div>
      <button type="button" disabled className={`${btnPrimaryMd} disabled:opacity-60`}>
        {submitLabel}
      </button>
      <p className="text-[11px] text-[var(--muted)]">Form placeholder — not wired to submission.</p>
    </form>
  );
}

export function FormPlaceholderCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${cardFormWrap} text-left ${className}`.trim()}>{children}</div>;
}
