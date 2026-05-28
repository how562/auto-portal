/** CMS media upload allowlist (Supabase cms-media bucket). */
export const CMS_MEDIA_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type CmsMediaMimeType = (typeof CMS_MEDIA_MIME_TYPES)[number];

export const CMS_MEDIA_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"] as const;

/** File input `accept` attribute for CMS image pickers. */
export const CMS_MEDIA_ACCEPT =
  "image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png";

export const CMS_MEDIA_FORMATS_LABEL = "Supported formats: WebP, JPG, PNG";

const EXTENSION_TO_MIME: Record<string, CmsMediaMimeType> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const MIME_ALIASES: Record<string, CmsMediaMimeType> = {
  "image/webp": "image/webp",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

export function getCmsMediaExtension(fileName: string): string | null {
  const lower = fileName.trim().toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = lower.slice(dot);
  return CMS_MEDIA_EXTENSIONS.includes(ext as (typeof CMS_MEDIA_EXTENSIONS)[number])
    ? ext
    : null;
}

export function resolveCmsMediaContentType(
  fileName: string,
  reportedType?: string | null,
): CmsMediaMimeType | null {
  const normalizedType = reportedType?.trim().toLowerCase() ?? "";
  if (normalizedType && MIME_ALIASES[normalizedType]) {
    return MIME_ALIASES[normalizedType];
  }

  const ext = getCmsMediaExtension(fileName);
  if (!ext) return null;
  return EXTENSION_TO_MIME[ext] ?? null;
}

export function validateCmsMediaUpload(file: {
  name: string;
  type?: string;
}):
  | { ok: true; contentType: CmsMediaMimeType; extension: string }
  | { ok: false; error: string } {
  const contentType = resolveCmsMediaContentType(file.name, file.type);
  const extension = getCmsMediaExtension(file.name);

  if (!contentType || !extension) {
    return {
      ok: false,
      error: `${CMS_MEDIA_FORMATS_LABEL}. Received: ${file.name || "unnamed file"}.`,
    };
  }

  return { ok: true, contentType, extension };
}
