import { NextResponse } from "next/server";
import { isAdminProtectionEnabled, isAdminRequest } from "@/lib/adminAuthConfig";
import { CMS_MEDIA_BUCKET, ensureCmsMediaBucket } from "@/lib/cmsMedia";
import { getServiceRoleKey, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isSupabaseAdminConfigured();
  let bucketReady = false;
  let bucketError: string | null = null;

  if (configured) {
    try {
      await ensureCmsMediaBucket();
      bucketReady = true;
    } catch (error: unknown) {
      bucketError = error instanceof Error ? error.message : "Bucket check failed";
    }
  }

  const status = {
    adminProtection: isAdminProtectionEnabled(),
    supabaseAdminConfigured: configured,
    serviceRoleKeyPresent: Boolean(getServiceRoleKey()),
    bucket: CMS_MEDIA_BUCKET,
    bucketReady,
    bucketError,
  };

  return NextResponse.json(status);
}
