import { NextResponse } from "next/server";
import { CMS_ADMIN_COOKIE, getAdminSecret, isValidAdminSecret } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const secret = getAdminSecret();
  if (!secret) {
    const response = NextResponse.json({ ok: true, protection: false });
    response.cookies.set(CMS_ADMIN_COOKIE, "open", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  const { password } = (await request.json()) as { password?: string };
  if (!isValidAdminSecret(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, protection: true });
  response.cookies.set(CMS_ADMIN_COOKIE, secret, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
