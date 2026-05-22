"use client";

import { useEffect, useState } from "react";

interface AdminStatus {
 supabaseAdminConfigured: boolean;
 bucketReady: boolean;
 bucketError: string | null;
}

export function AdminSetupNotice() {
 const [status, setStatus] = useState<AdminStatus | null>(null);

 useEffect(() => {
 void fetch("/api/admin/status", { credentials: "include" })
 .then((res) => (res.ok ? res.json() : null))
 .then((data) => {
 if (data && typeof data === "object") {
 setStatus(data as AdminStatus);
 }
 })
 .catch(() => {});
 }, []);

 if (!status || status.supabaseAdminConfigured) {
 if (status?.supabaseAdminConfigured && !status.bucketReady && status.bucketError) {
 return (
 <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
 Storage bucket issue: {status.bucketError}. Run{" "}
 <code>supabase/migrations/20260522180000_cms_media_bucket.sql</code> in Supabase.
 </p>
 );
 }
 return null;
 }

 return (
 <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
 <p className="font-semibold">CMS uploads need a server key</p>
 <ol className="mt-2 list-decimal space-y-1 pl-5">
 <li>
 Open Supabase → <strong>Project Settings → API</strong> → copy the{" "}
 <strong>service_role</strong> secret (not the anon key).
 </li>
 <li>
 Add to <code>.env.local</code>:{" "}
 <code>SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret</code>
 </li>
 <li>Restart <code>npm run dev</code>.</li>
 <li>
 Run <code>supabase/migrations/20260522180000_cms_media_bucket.sql</code> if the{" "}
 <code>cms-media</code> bucket does not exist yet.
 </li>
 </ol>
 </div>
 );
}
