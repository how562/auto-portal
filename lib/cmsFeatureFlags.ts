import { isOpenAiConfigured } from "./openaiConfig";

/**
 * Screenshot → AI blueprint is off by default (no OpenAI credentials required).
 * Enable later by setting ENABLE_SCREENSHOT_BLUEPRINT_AI=true and OPENAI_API_KEY.
 */
export function isScreenshotBlueprintAiEnabled(): boolean {
  if (process.env.ENABLE_SCREENSHOT_BLUEPRINT_AI !== "true") {
    return false;
  }
  return isOpenAiConfigured();
}
