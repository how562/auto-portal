"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { CmsMediaFile } from "@/lib/cmsMedia";
import { btnPrimarySm, btnSecondarySm } from "@/lib/buttonClasses";

export function MediaManager() {
 const inputId = useId();
 const [files, setFiles] = useState<CmsMediaFile[]>([]);
 const [loading, setLoading] = useState(true);
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [copiedPath, setCopiedPath] = useState<string | null>(null);

 const loadFiles = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await fetch("/api/admin/cms-media", { credentials: "include" });
 const data = (await res.json()) as { files?: CmsMediaFile[]; error?: string };
 if (!res.ok) throw new Error(data.error ?? "Failed to load media");
 setFiles(data.files ?? []);
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Failed to load");
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 void loadFiles();
 }, [loadFiles]);

 async function handleUpload(file: File) {
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
 const data = (await res.json()) as { error?: string };
 if (!res.ok) throw new Error(data.error ?? "Upload failed");
 await loadFiles();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Upload failed");
 } finally {
 setUploading(false);
 }
 }

 async function handleDelete(path: string) {
 if (!confirm("Delete this image from storage?")) return;
 setError(null);
 try {
 const res = await fetch(
 `/api/admin/cms-media?path=${encodeURIComponent(path)}`,
 { method: "DELETE", credentials: "include" },
 );
 const data = (await res.json()) as { error?: string };
 if (!res.ok) throw new Error(data.error ?? "Delete failed");
 await loadFiles();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Delete failed");
 }
 }

 async function copyUrl(url: string, path: string) {
 await navigator.clipboard.writeText(url);
 setCopiedPath(path);
 setTimeout(() => setCopiedPath(null), 2000);
 }

 return (
 <div className="space-y-8">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
 Media library
 </h1>
 <p className="mt-1 text-sm text-[var(--muted)]">
 Uploads go to the <code className="text-[var(--ink)]">cms-media</code> bucket.
 Only public URLs are stored in CMS fields.
 </p>
 </div>
 <div>
 <input
 id={inputId}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) void handleUpload(file);
 e.target.value = "";
 }}
 />
 <label
 htmlFor={inputId}
            className={`inline-flex cursor-pointer ${btnPrimarySm} ${
 uploading ? "pointer-events-none opacity-60" : ""
 }`}
 >
 {uploading ? "Uploading…" : "Upload image"}
 </label>
 </div>
 </div>

 {error ? (
 <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
 {error}
 </p>
 ) : null}

 {loading ? (
 <p className="text-sm text-[var(--muted)]">Loading media…</p>
 ) : files.length === 0 ? (
 <p className="rounded-md border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
 No uploads yet. Images you upload will appear here.
 </p>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {files.map((file) => (
 <article
 key={file.path}
 className="overflow-hidden rounded-md border border-[var(--line-dark)] bg-white"
 >
 <div className="aspect-[4/3] bg-[var(--cream-dark)]">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={file.publicUrl}
 alt={file.name}
 className="h-full w-full object-cover"
 />
 </div>
 <div className="space-y-2 p-3">
 <p className="truncate text-xs font-medium text-[var(--ink)]">
 {file.name}
 </p>
 <div className="flex flex-wrap gap-2">
 <button
 type="button"
 onClick={() => copyUrl(file.publicUrl, file.path)}
                    className={btnSecondarySm}
 >
 {copiedPath === file.path ? "Copied" : "Copy URL"}
 </button>
 <button
 type="button"
 onClick={() => handleDelete(file.path)}
 className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
 >
 Delete
 </button>
 </div>
 </div>
 </article>
 ))}
 </div>
 )}
 </div>
 );
}
