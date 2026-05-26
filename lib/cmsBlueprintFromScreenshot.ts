import "server-only";

import {
  buildScreenshotBlueprintSystemPrompt,
  buildScreenshotBlueprintUserText,
  type ScreenshotBlueprintNotes,
} from "./cmsBlueprintAiContext";
import {
  slugifyBlueprintSlug,
  validatePageBlueprint,
  type PageBlueprint,
} from "./cmsPageBlueprint";
import { sanitizePageBlueprint } from "./cmsBlueprintSanitize";
import {
  getOpenAiApiKey,
  getOpenAiBlueprintModel,
  isOpenAiConfigured,
} from "./openaiConfig";

export { isOpenAiConfigured };

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export interface GenerateBlueprintFromScreenshotInput {
  imageBytes: Buffer;
  mimeType: string;
  notes?: ScreenshotBlueprintNotes;
}

export interface GenerateBlueprintFromScreenshotResult {
  blueprint: PageBlueprint;
  model: string;
  warnings: string[];
}

function parseJsonFromModelContent(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence?.[1]) {
      return JSON.parse(fence[1].trim()) as unknown;
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    }
    throw new Error("AI response did not contain valid JSON");
  }
}

function applyNotesToBlueprint(
  blueprint: PageBlueprint,
  notes: ScreenshotBlueprintNotes,
): PageBlueprint {
  const title = notes.pageTitle?.trim() || blueprint.title;
  const slug = slugifyBlueprintSlug(
    notes.slug?.trim() || blueprint.slug || title,
  );
  return {
    ...blueprint,
    title,
    slug,
    status: "draft",
  };
}

export async function generateBlueprintFromScreenshot(
  input: GenerateBlueprintFromScreenshotInput,
): Promise<GenerateBlueprintFromScreenshotResult> {
  if (!isOpenAiConfigured()) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Screenshot to Blueprint, or paste JSON manually.",
    );
  }

  const mime = input.mimeType.toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Screenshot must be PNG, JPEG, WebP, or GIF");
  }
  if (input.imageBytes.length > MAX_IMAGE_BYTES) {
    throw new Error("Screenshot must be 10 MB or smaller");
  }
  if (input.imageBytes.length === 0) {
    throw new Error("Screenshot file is empty");
  }

  const apiKey = getOpenAiApiKey()!;
  const model = getOpenAiBlueprintModel();
  const notes = input.notes ?? {};
  const base64 = input.imageBytes.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildScreenshotBlueprintSystemPrompt() },
        {
          role: "user",
          content: [
            { type: "text", text: buildScreenshotBlueprintUserText(notes) },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `OpenAI request failed (${response.status})`;
    try {
      const parsed = JSON.parse(errBody) as { error?: { message?: string } };
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      if (errBody) message = `${message}: ${errBody.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("OpenAI returned an empty blueprint");
  }

  const raw = parseJsonFromModelContent(content);
  const validated = validatePageBlueprint(raw);
  if (!validated.ok || !validated.blueprint) {
    throw new Error(
      `AI blueprint failed validation: ${validated.errors.join("; ")}`,
    );
  }

  const warnings: string[] = [];
  const withNotes = applyNotesToBlueprint(validated.blueprint, notes);
  const sanitized = sanitizePageBlueprint(withNotes);

  if (sanitized.sections.length === 0) {
    throw new Error("AI blueprint has no sections after sanitization");
  }

  const unsupported = validated.errors;
  if (unsupported.length) warnings.push(...unsupported);

  return { blueprint: sanitized, model, warnings };
}
