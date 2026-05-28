"use client";

import { useEffect, useId, useState } from "react";
import type { PageSection } from "@/lib/cmsTypes";
import {
 HERO_SLOT_LABELS,
 HERO_SLOT_TILE_CLASS,
 buildHeroImagesSettings,
 getHeroImageUrls,
 uploadCmsImage,
} from "@/lib/communityHeroAdmin";
import {
 HERO_IMAGE_POSITIONS,
 type CommunityHeroImagePosition,
} from "@/lib/communityHeroTypes";
import { btnPrimarySm } from "@/lib/buttonClasses";
import {
  CMS_MEDIA_ACCEPT,
  CMS_MEDIA_FORMATS_LABEL,
  validateCmsMediaUpload,
} from "@/lib/cmsMediaValidation";

interface CommunityHeroImageSlotsProps {
 sectionId: string;
 settings: Record<string, unknown>;
 onSettingsSaved: (settings: Record<string, unknown>, section?: PageSection) => void;
}

function SlotPlaceholder() {
 return (
 <div className="flex h-full min-h-[7rem] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--cream-dark)] via-[#e8e2d8] to-[#ddd6cb] px-4">
 <div
 className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 ring-1 ring-[var(--line)]"
 aria-hidden
 >
 <svg
 className="h-5 w-5 text-[var(--muted)]/70"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="1.5"
 >
 <rect x="3" y="5" width="18" height="14" rx="2" />
 <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
 <path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </div>
 <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]/80">
 No image yet
 </p>
 </div>
 );
}

function HeroImageSlot({
 position,
 imageUrl,
 busy,
 saved,
 error,
 onPickFile,
 onRemove,
}: {
 position: CommunityHeroImagePosition;
 imageUrl: string;
 busy: boolean;
 saved: boolean;
 error: string | null;
 onPickFile: (file: File) => void;
 onRemove: () => void;
}) {
 const inputId = useId();
 const hasImage = Boolean(imageUrl);

 return (
 <div
 className={`overflow-hidden rounded-md border border-[var(--line-dark)] bg-white ${HERO_SLOT_TILE_CLASS[position]} ${
 saved ? "border-emerald-400 ring-1 ring-emerald-200" : "border-[var(--line)]"
 }`}
 >
 <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--cream)]/60 px-3 py-2">
 <span className="text-xs font-semibold text-[var(--ink)]">
 {HERO_SLOT_LABELS[position]}
 </span>
 <code className="text-[10px] text-[var(--muted)]">{position}</code>
 </div>

 <div className="relative min-h-[7rem] sm:min-h-[8.5rem]">
 {hasImage ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={imageUrl} alt="" className="h-full min-h-[7rem] w-full object-cover sm:min-h-[8.5rem]" />
 ) : (
 <SlotPlaceholder />
 )}
 {busy ? (
 <div className="absolute inset-0 flex items-center justify-center bg-white text-xs font-semibold text-[var(--ink)]">
 Uploading…
 </div>
 ) : null}
 </div>

 <div className="flex flex-wrap gap-2 border-t border-[var(--line)] p-3">
 <input
 id={inputId}
 type="file"
 accept={CMS_MEDIA_ACCEPT}
 className="hidden"
 disabled={busy}
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) onPickFile(file);
 e.target.value = "";
 }}
 />
 <label
 htmlFor={inputId}
          className={`cursor-pointer ${btnPrimarySm} ${
 busy ? "pointer-events-none opacity-60" : ""
 }`}
 >
 {hasImage ? "Replace image" : "Upload image"}
 </label>
 {hasImage ? (
 <button
 type="button"
 disabled={busy}
 onClick={onRemove}
 className="rounded-md px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--cream-dark)] hover:text-[var(--ink)] disabled:opacity-60"
 >
 Remove
 </button>
 ) : null}
 </div>

 {error ? <p className="px-3 pb-3 text-xs text-red-600">{error}</p> : null}
 {saved && !error ? (
 <p className="px-3 pb-3 text-xs text-emerald-700">Saved to homepage</p>
 ) : null}
 </div>
 );
}

export function CommunityHeroImageSlots({
 sectionId,
 settings,
 onSettingsSaved,
}: CommunityHeroImageSlotsProps) {
 const [urls, setUrls] = useState(() => getHeroImageUrls(settings));
 const [busySlot, setBusySlot] = useState<CommunityHeroImagePosition | null>(null);

 useEffect(() => {
 setUrls(getHeroImageUrls(settings));
 }, [settings]);
 const [slotErrors, setSlotErrors] = useState<Partial<Record<CommunityHeroImagePosition, string>>>(
 {},
 );
 const [savedSlot, setSavedSlot] = useState<CommunityHeroImagePosition | null>(null);

 async function saveSettings(
 position: CommunityHeroImagePosition,
 nextUrls: Record<CommunityHeroImagePosition, string>,
 ) {
 const nextSettings = buildHeroImagesSettings(settings, nextUrls);
 const res = await fetch(`/api/admin/page-sections/${sectionId}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 credentials: "include",
 body: JSON.stringify({ settings: nextSettings }),
 });
 const data = (await res.json()) as { section?: PageSection; error?: string };
 if (!res.ok) {
 throw new Error(data.error ?? "Failed to save image");
 }
 setUrls(nextUrls);
 onSettingsSaved(nextSettings, data.section);
 setSavedSlot(position);
 window.setTimeout(() => {
 setSavedSlot((current) => (current === position ? null : current));
 }, 2500);
 }

 async function handleUpload(position: CommunityHeroImagePosition, file: File) {
 const validation = validateCmsMediaUpload(file);
 if (!validation.ok) {
 setSlotErrors((prev) => ({ ...prev, [position]: validation.error }));
 return;
 }
 setBusySlot(position);
 setSlotErrors((prev) => ({ ...prev, [position]: undefined }));
 setSavedSlot(null);

 try {
 const publicUrl = await uploadCmsImage(file);
 const nextUrls = { ...urls, [position]: publicUrl };
 setUrls(nextUrls);
 await saveSettings(position, nextUrls);
 } catch (err: unknown) {
 setUrls(getHeroImageUrls(settings));
 setSlotErrors((prev) => ({
 ...prev,
 [position]: err instanceof Error ? err.message : "Upload failed",
 }));
 } finally {
 setBusySlot(null);
 }
 }

 async function handleRemove(position: CommunityHeroImagePosition) {
 setBusySlot(position);
 setSlotErrors((prev) => ({ ...prev, [position]: undefined }));
 setSavedSlot(null);

 try {
 const nextUrls = { ...urls, [position]: "" };
 await saveSettings(position, nextUrls);
 } catch (err: unknown) {
 setSlotErrors((prev) => ({
 ...prev,
 [position]: err instanceof Error ? err.message : "Remove failed",
 }));
 } finally {
 setBusySlot(null);
 }
 }

 return (
 <div className="space-y-4">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Homepage collage
 </p>
 <p className="mt-1 text-sm text-[var(--muted)]">
 Upload or replace any tile — saves automatically to{" "}
 <code className="text-[var(--ink)]">settings.images</code>. No URL copying needed.{" "}
 {CMS_MEDIA_FORMATS_LABEL}.
 </p>
 </div>

 <div className="hero-collage-grid max-w-2xl">
 {HERO_IMAGE_POSITIONS.map((position) => (
 <HeroImageSlot
 key={position}
 position={position}
 imageUrl={urls[position]}
 busy={busySlot === position}
 saved={savedSlot === position}
 error={slotErrors[position] ?? null}
 onPickFile={(file) => void handleUpload(position, file)}
 onRemove={() => void handleRemove(position)}
 />
 ))}
 </div>
 </div>
 );
}
