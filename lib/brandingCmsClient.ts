import type { BrandingCmsResource } from "@/lib/brandingCmsTypes";

export function isFallbackCmsId(id: string): boolean {
  return id.startsWith("fallback-");
}

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  return (await res.json()) as T & { error?: string };
}

export async function fetchBrandingRows<T>(resource: BrandingCmsResource): Promise<T[]> {
  const res = await fetch(`/api/admin/branding/${resource}`, { credentials: "include" });
  const data = await parseJson<{ rows?: T[] }>(res);
  if (!res.ok) throw new Error(data.error ?? "Load failed");
  return data.rows ?? [];
}

export async function createBrandingRow<T>(
  resource: BrandingCmsResource,
  payload: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`/api/admin/branding/${resource}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ row?: T }>(res);
  if (!res.ok) throw new Error(data.error ?? "Create failed");
  return data.row as T;
}

export async function updateBrandingRow<T>(
  resource: BrandingCmsResource,
  id: string,
  updates: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`/api/admin/branding/${resource}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, updates }),
  });
  const data = await parseJson<{ row?: T }>(res);
  if (!res.ok) throw new Error(data.error ?? "Save failed");
  return data.row as T;
}

export async function deleteBrandingRow(
  resource: BrandingCmsResource,
  id: string,
): Promise<void> {
  const res = await fetch(`/api/admin/branding/${resource}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parseJson<{ error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? "Delete failed");
}

export async function seedBrandingCms(): Promise<{ seeded: boolean }> {
  const res = await fetch("/api/admin/branding/seed", {
    method: "POST",
    credentials: "include",
  });
  const data = await parseJson<{ seeded?: boolean; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? "Seed failed");
  return { seeded: Boolean(data.seeded) };
}

export async function uploadBrandingLogoFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/cms-media", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await parseJson<{ file?: { publicUrl: string }; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.file?.publicUrl ?? "";
}
