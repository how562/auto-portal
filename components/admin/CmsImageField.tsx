"use client";

import { useId, useState } from "react";
import { btnPrimarySm } from "@/lib/buttonClasses";
import {
  CMS_MEDIA_ACCEPT,
  CMS_MEDIA_FORMATS_LABEL,
  validateCmsMediaUpload,
} from "@/lib/cmsMediaValidation";

interface CmsImageFieldProps {
 label: string;
 value: string;
 onChange: (url: string) => void;
 hint?: string;
}

export function CmsImageField({ label, value, onChange, hint }: CmsImageFieldProps) {
 const inputId = useId();
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function handleUpload(file: File) {
 const validation = validateCmsMediaUpload(file);
 if (!validation.ok) {
 setError(validation.error);
 return;
 }
 setUploading(true);
 setError(null);
 try {
 const formData = new FormData();
 formData.append("file", file);
 const res = await fetch("/api/admin/cms-media", {
 method: "POST",
 body: formData,
 credentials: "include",
 });
 const data = (await res.json()) as { file?: { publicUrl: string }; error?: string };
 if (!res.ok) {
 throw new Error(data.error ?? "Upload failed");
 }
 if (data.file?.publicUrl) {
 onChange(data.file.publicUrl);
 }
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Upload failed");
 } finally {
 setUploading(false);
 }
 }

 return (
 <div className="space-y-2">
 <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 {label}
 </label>
 <p className="text-xs text-[var(--muted)]">
 {hint ? `${hint} ` : null}
 {CMS_MEDIA_FORMATS_LABEL}
 </p>
 <div className="flex flex-wrap items-center gap-2">
 <input
 id={inputId}
 type="file"
 accept={CMS_MEDIA_ACCEPT}
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) void handleUpload(file);
 e.target.value = "";
 }}
 />
        <label
          htmlFor={inputId}
          className={`cursor-pointer ${btnPrimarySm} ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
 {uploading ? "Uploading…" : "Upload image"}
 </label>
 {value ? (
 <button
 type="button"
 onClick={() => onChange("")}
 className="rounded-md px-3 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)]"
 >
 Clear
 </button>
 ) : null}
 </div>
 <input
 type="url"
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Or paste image URL"
 className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-0 focus:border-[var(--ink)]"
 />
 {value ? (
 <div className="overflow-hidden rounded-md border border-[var(--line-dark)] bg-[var(--cream-dark)]">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={value} alt="" className="max-h-48 w-full object-cover" />
 </div>
 ) : null}
 {error ? <p className="text-xs text-red-600">{error}</p> : null}
 </div>
 );
}
