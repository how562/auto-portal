import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { sanitizePageBlueprint } from "@/lib/cmsBlueprintSanitize";
import { validatePageBlueprint } from "@/lib/cmsPageBlueprint";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = validatePageBlueprint(body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 400 },
      );
    }
    const blueprint = sanitizePageBlueprint({
      ...result.blueprint!,
      status: "draft",
    });
    return NextResponse.json({ ok: true, blueprint });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
