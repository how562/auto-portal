import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { generateBlueprintFromScreenshot } from "@/lib/cmsBlueprintFromScreenshot";
import { isScreenshotBlueprintAiEnabled } from "@/lib/cmsFeatureFlags";
import { blueprintJsonString } from "@/lib/cmsPageBlueprint";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ enabled: isScreenshotBlueprintAiEnabled() });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isScreenshotBlueprintAiEnabled()) {
    return NextResponse.json(
      {
        error:
          "Screenshot to blueprint is not enabled. Use Import JSON on Page blueprints, or enable ENABLE_SCREENSHOT_BLUEPRINT_AI with OPENAI_API_KEY when credentials are available.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("screenshot");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "screenshot file is required" },
        { status: 400 },
      );
    }

    const imageBytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/png";

    const notes = {
      pageTitle: String(form.get("pageTitle") ?? "").trim() || undefined,
      slug: String(form.get("slug") ?? "").trim() || undefined,
      tone: String(form.get("tone") ?? "").trim() || undefined,
      sectionNotes: String(form.get("sectionNotes") ?? "").trim() || undefined,
    };

    const result = await generateBlueprintFromScreenshot({
      imageBytes,
      mimeType,
      notes,
    });

    return NextResponse.json({
      blueprint: result.blueprint,
      json: blueprintJsonString(result.blueprint),
      model: result.model,
      warnings: result.warnings,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Screenshot analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
