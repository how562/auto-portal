/** Server-only OpenAI configuration for CMS blueprint generation. */

export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}

/** Vision + JSON blueprint model (override via env). */
export function getOpenAiBlueprintModel(): string {
  return (
    process.env.OPENAI_BLUEPRINT_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}
