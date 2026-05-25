"use client";

import Link from "next/link";
import { CavenderLogo } from "@/components/brand/CavenderLogo";
import { BRAND_NAME } from "@/lib/brand";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  );
}

const ADMIN_QUICK_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", accent: "bg-emerald-500" },
  { label: "Pages", href: "/admin/pages", accent: "bg-red-500" },
  { label: "Branding", href: "/admin/branding", accent: "bg-amber-400" },
  { label: "Inventory", href: "/admin/inventory", accent: "bg-violet-500" },
  { label: "Media", href: "/admin/media", accent: "bg-sky-500" },
  { label: "Feeds", href: "/admin/feeds", accent: "bg-rose-400" },
] as const;

interface AdminLoginScreenProps {
  password: string;
  error: string | null;
  loading: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminLoginScreen({
  password,
  error,
  loading,
  onPasswordChange,
  onSubmit,
}: AdminLoginScreenProps) {
  return (
    <div className="admin-login relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fffdf9] px-4 py-14 text-[var(--ink)]">
      <div
        className="pointer-events-none absolute -right-24 top-[12%] h-72 w-72 rounded-[42%] bg-gradient-to-br from-[var(--gold-soft)] via-[#e8a04a] to-[#d45c3a] opacity-70 blur-2xl sm:-right-16 sm:top-[14%] sm:h-80 sm:w-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-[18%] h-48 w-48 rounded-[38%] bg-gradient-to-tr from-[#f0c96a] via-[var(--gold)] to-[#c96b45] opacity-60 blur-xl sm:bottom-[22%] sm:left-[-3rem]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] via-[var(--gold)] to-[#c45a38] shadow-sm"
              aria-hidden
            />
            <CavenderLogo size="hero" variant="dark" className="!h-8 !w-[168px]" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight text-[#333333] sm:text-[1.65rem]">
            Good to see you again
          </h1>
        </div>

        <div className="w-full rounded-2xl border border-[var(--line)]/60 bg-white px-7 py-8 shadow-[0_8px_30px_rgba(21,42,71,0.08)] sm:px-8 sm:py-9">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-[#6b7280]"
              >
                Admin password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--ink)]" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Enter your CMS password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#e5e7eb] bg-white py-3 pl-11 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#9ca3af] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/25"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="mt-1 w-full rounded-full bg-gradient-to-b from-[#2fd058] to-[#1db937] py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(29,185,55,0.35)] transition hover:from-[#28c84f] hover:to-[#18a832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1db937] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <Link
              href="/"
              className="text-[#2563eb] underline-offset-2 transition hover:underline"
            >
              Back to site
            </Link>
            <span className="text-[#9ca3af]">{BRAND_NAME} CMS</span>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
          {ADMIN_QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-xl border border-[var(--line)]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-[var(--shadow-tight)] transition hover:border-[var(--line-dark)] hover:shadow-[var(--shadow-card)]"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.accent}`}
                aria-hidden
              />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
