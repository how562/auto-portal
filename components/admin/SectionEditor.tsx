"use client";

import { useState } from "react";
import { CommunityHeroImageSlots } from "@/components/admin/CommunityHeroImageSlots";
import { CmsImageField } from "@/components/admin/CmsImageField";
import type { PageSection } from "@/lib/cmsTypes";
import { btnPrimaryMd } from "@/lib/buttonClasses";

interface SectionEditorProps {
 section: PageSection;
}

type ImageSettingItem = {
 position?: string;
 url?: string;
 image_url?: string;
 alt?: string;
};

function getSettingsImages(settings: Record<string, unknown>): ImageSettingItem[] {
 const raw = settings.images;
 if (!Array.isArray(raw)) return [];
 return raw.filter((item) => item && typeof item === "object") as ImageSettingItem[];
}

function urlForImageItem(item: ImageSettingItem): string {
 return (item.url ?? item.image_url ?? "").trim();
}

function buildGenericImagesSettings(
 settings: Record<string, unknown>,
 items: ImageSettingItem[],
): Record<string, unknown> {
 const normalized = items
 .map((item) => ({
 ...item,
 url: urlForImageItem(item) || undefined,
 image_url: undefined,
 }))
 .filter((item) => urlForImageItem(item) || item.position);
 return { ...settings, images: normalized };
}

export function SectionEditor({ section: initial }: SectionEditorProps) {
 const [section, setSection] = useState(initial);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);

 const settings = section.settings ?? {};
 const isCommunityHero = section.section_type === "community_hero";
 const settingsImages = getSettingsImages(settings);
 const hasSettingsImages =
 isCommunityHero || settingsImages.length > 0 || Array.isArray(settings.images);

 async function save(patch: Record<string, unknown>) {
 setSaving(true);
 setMessage(null);
 setError(null);
 try {
 const res = await fetch(`/api/admin/page-sections/${section.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 credentials: "include",
 body: JSON.stringify(patch),
 });
 const data = (await res.json()) as { section?: PageSection; error?: string };
 if (!res.ok) throw new Error(data.error ?? "Save failed");
 if (data.section) setSection(data.section);
 setMessage("Saved");
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Save failed");
 } finally {
 setSaving(false);
 }
 }

 function updateLocal(patch: Partial<PageSection>) {
 setSection((prev) => ({ ...prev, ...patch }));
 }

 return (
 <article className="rounded-md border border-[var(--line-dark)] bg-white p-5 sm:p-6">
 <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 {section.section_type}
 {section.layout_variant ? ` · ${section.layout_variant}` : ""}
 </p>
 <p className="mt-1 text-sm text-[var(--muted)]">
 Order {section.sort_order}
 {section.is_active ? "" : " · inactive"}
 </p>
 </div>
 <button
 type="button"
 disabled={saving}
 onClick={() =>
 save({
 eyebrow: section.eyebrow,
 headline: section.headline,
 subheadline: section.subheadline,
 body: section.body,
 image_url: section.image_url,
 cta_text: section.cta_text,
 cta_url: section.cta_url,
 layout_variant: section.layout_variant,
 settings: section.settings,
 is_active: section.is_active,
 })
 }
          className={`${btnPrimaryMd} disabled:opacity-60`}
 >
 {saving ? "Saving…" : "Save section"}
 </button>
 </header>

 <div className="space-y-6">
 {isCommunityHero ? (
 <>
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Eyebrow
 </span>
 <input
 type="text"
 value={section.eyebrow ?? ""}
 onChange={(e) => updateLocal({ eyebrow: e.target.value || null })}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 />
 </label>
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Headline
 </span>
 <textarea
 value={section.headline ?? ""}
 onChange={(e) => updateLocal({ headline: e.target.value || null })}
 rows={3}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 placeholder="One line per row"
 />
 </label>
 </div>
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Body
 </span>
 <textarea
 value={section.body ?? ""}
 onChange={(e) => updateLocal({ body: e.target.value || null })}
 rows={4}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 />
 </label>
 <CommunityHeroImageSlots
 sectionId={section.id}
 settings={settings}
 onSettingsSaved={(nextSettings, updatedSection) => {
 if (updatedSection) {
 setSection(updatedSection);
 } else {
 updateLocal({ settings: nextSettings });
 }
 setMessage("Collage image saved");
 setError(null);
 }}
 />
 </>
 ) : (
 <>
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Headline
 </span>
 <input
 type="text"
 value={section.headline ?? section.title ?? ""}
 onChange={(e) => updateLocal({ headline: e.target.value || null })}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 />
 </label>
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Subheadline
 </span>
 <input
 type="text"
 value={section.subheadline ?? section.subtitle ?? ""}
 onChange={(e) => updateLocal({ subheadline: e.target.value || null })}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 />
 </label>
 </div>
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Body
 </span>
 <textarea
 value={section.body ?? section.content ?? ""}
 onChange={(e) => updateLocal({ body: e.target.value || null })}
 rows={4}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 />
 </label>
 <CmsImageField
 label="Section image (image_url)"
 value={section.image_url ?? ""}
 onChange={(url) => updateLocal({ image_url: url || null })}
 />
 {hasSettingsImages && !isCommunityHero ? (
 <div className="space-y-4">
 <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Settings images
 </p>
 {(settingsImages.length > 0 ? settingsImages : [{ position: "", url: "" }]).map(
 (item, index) => (
 <div
 key={`${item.position ?? "img"}-${index}`}
 className="rounded-xl border border-[var(--line)] p-4"
 >
 <CmsImageField
 label={item.position ? `Image · ${item.position}` : `Image #${index + 1}`}
 value={urlForImageItem(item)}
 onChange={(url) => {
 const items = [...settingsImages];
 if (items.length === 0) items.push({});
 items[index] = { ...items[index], url, image_url: undefined };
 updateLocal({
 settings: buildGenericImagesSettings(settings, items),
 });
 }}
 />
 </div>
 ),
 )}
 </div>
 ) : null}
 </>
 )}
 </div>

 {message ? (
 <p className="mt-4 text-sm text-emerald-700">{message}</p>
 ) : null}
 {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
 </article>
 );
}
