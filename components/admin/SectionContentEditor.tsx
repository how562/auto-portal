"use client";

import { CmsImageField } from "@/components/admin/CmsImageField";
import { CMS_IMAGE_FIELD_HINTS } from "@/lib/cmsImageFieldHints";

type ImageHintKey = keyof typeof CMS_IMAGE_FIELD_HINTS;

export function SectionEditorField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </label>
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
      {children}
    </div>
  );
}

export function SectionTextInput({
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]";

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

export function SectionImageUrlField({
  label,
  value,
  onChange,
  imageHintKey,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  imageHintKey?: ImageHintKey;
  hint?: string;
}) {
  const sizeHint = imageHintKey ? CMS_IMAGE_FIELD_HINTS[imageHintKey] : hint;

  return (
    <CmsImageField
      label={label}
      value={value}
      onChange={onChange}
      hint={sizeHint}
    />
  );
}
