import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CMS_ADMIN_COOKIE, getAdminSecret, isValidAdminSecret } from "@/lib/adminAuth";

function isAdminProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname === "/mathbox-settings";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminProtectedPath(pathname)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.next();
  }

  const session = request.cookies.get(CMS_ADMIN_COOKIE)?.value;
  if (!isValidAdminSecret(session)) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mathbox-settings"],
};
