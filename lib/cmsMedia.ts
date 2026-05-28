import {
  CMS_MEDIA_MIME_TYPES,
  resolveCmsMediaContentType,
  validateCmsMediaUpload,
} from "./cmsMediaValidation";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export {
  CMS_MEDIA_ACCEPT,
  CMS_MEDIA_FORMATS_LABEL,
  validateCmsMediaUpload,
} from "./cmsMediaValidation";

export const CMS_MEDIA_BUCKET = "cms-media";
const UPLOAD_PREFIX = "uploads";

export interface CmsMediaFile {
  name: string;
  path: string;
  publicUrl: string;
  createdAt: string | null;
  size: number | null;
}

export function getCmsMediaPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return path;
  const normalized = path.startsWith(`${CMS_MEDIA_BUCKET}/`)
    ? path
    : `${CMS_MEDIA_BUCKET}/${path}`;
  return `${base}/storage/v1/object/public/${normalized}`;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function ensureCmsMediaBucket(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }
  if (buckets?.some((b) => b.id === CMS_MEDIA_BUCKET)) return;

  const { error } = await supabase.storage.createBucket(CMS_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [...CMS_MEDIA_MIME_TYPES, "image/gif", "image/svg+xml"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create cms-media bucket: ${error.message}`);
  }
}

export async function uploadCmsMediaFile(
  file: File | Blob,
  originalName: string,
  contentType: string,
): Promise<CmsMediaFile> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  const validation = validateCmsMediaUpload({
    name: originalName,
    type: contentType,
  });
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const resolvedType =
    resolveCmsMediaContentType(originalName, contentType) ??
    validation.contentType;

  await ensureCmsMediaBucket();
  const supabase = getSupabaseAdmin();
  const ext = validation.extension;
  const base = sanitizeFilename(
    originalName.replace(/\.[^.]+$/, "") || "image",
  );
  const path = `${UPLOAD_PREFIX}/${Date.now()}-${base}${ext}`;

  const buffer =
    file instanceof Blob && typeof file.arrayBuffer === "function"
      ? Buffer.from(await file.arrayBuffer())
      : Buffer.from(await (file as File).arrayBuffer());

  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(path, buffer, {
    contentType: resolvedType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path);

  return {
    name: path.split("/").pop() ?? path,
    path,
    publicUrl: data.publicUrl,
    createdAt: new Date().toISOString(),
    size: buffer.length,
  };
}

export async function listCmsMediaFiles(): Promise<CmsMediaFile[]> {
  if (!isSupabaseAdminConfigured()) return [];

  await ensureCmsMediaBucket();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(CMS_MEDIA_BUCKET).list(UPLOAD_PREFIX, {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    throw new Error(`Failed to list media: ${error.message}`);
  }

  return (data ?? [])
    .filter((item) => item.name && item.id !== null)
    .map((item) => {
      const path = `${UPLOAD_PREFIX}/${item.name}`;
      const { data: urlData } = supabase.storage
        .from(CMS_MEDIA_BUCKET)
        .getPublicUrl(path);
      return {
        name: item.name,
        path,
        publicUrl: urlData.publicUrl,
        createdAt: item.created_at ?? null,
        size: item.metadata?.size ?? null,
      };
    });
}

export async function deleteCmsMediaFile(path: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  const supabase = getSupabaseAdmin();
  const normalized = path.startsWith(UPLOAD_PREFIX) ? path : `${UPLOAD_PREFIX}/${path}`;
  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).remove([normalized]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
