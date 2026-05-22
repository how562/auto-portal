"use client";

import { btnBlock, btnPrimaryMd } from "@/lib/buttonClasses";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const next = searchParams.get("next") ?? "/admin/pages";
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 try {
 const res = await fetch("/api/admin/auth/login", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ password }),
 credentials: "include",
 });
 const data = (await res.json()) as { error?: string };
 if (!res.ok) throw new Error(data.error ?? "Login failed");
 router.push(next);
 router.refresh();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Login failed");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="mx-auto max-w-md">
 <h1 className="text-2xl font-semibold tracking-tight">CMS sign in</h1>
 <p className="mt-2 text-sm text-[var(--muted)]">
 Enter the admin password from <code>CMS_ADMIN_SECRET</code>.
 </p>
 <form onSubmit={handleSubmit} className="mt-8 space-y-4">
 <label className="block space-y-1">
 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
 Password
 </span>
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
 autoComplete="current-password"
 />
 </label>
 {error ? <p className="text-sm text-red-600">{error}</p> : null}
 <button
 type="submit"
 disabled={loading}
 className={`${btnBlock} ${btnPrimaryMd} disabled:opacity-60`}
 >
 {loading ? "Signing in…" : "Sign in"}
 </button>
 </form>
 </div>
 );
}

export default function AdminLoginPage() {
 return (
 <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
 <AdminLoginForm />
 </Suspense>
 );
}
