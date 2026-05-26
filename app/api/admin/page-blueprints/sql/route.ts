import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  generateBlueprintSql,
  validatePageBlueprint,
} from "@/lib/cmsPageBlueprint";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = validatePageBlueprint(body);
    if (!result.ok || !result.blueprint) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 400 },
      );
    }

    const sql = generateBlueprintSql(result.blueprint);
    return NextResponse.json({ ok: true, sql });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SQL generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
