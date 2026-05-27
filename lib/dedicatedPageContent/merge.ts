import type { DedicatedPageSlug } from "@/lib/dedicatedPageContent/types";
import { getDefaultDedicatedPageContent } from "@/lib/dedicatedPageContent/defaults";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge CMS patch onto defaults; arrays in patch replace defaults entirely. */
export function mergeDedicatedPageContent<S extends DedicatedPageSlug>(
  slug: S,
  stored: unknown,
): ReturnType<typeof getDefaultDedicatedPageContent<S>> {
  const defaults = getDefaultDedicatedPageContent(slug);
  if (!isPlainObject(stored)) {
    return defaults;
  }

  return mergeValues(defaults, stored) as ReturnType<
    typeof getDefaultDedicatedPageContent<S>
  >;
}

function mergeValues<T>(base: T, patch: Record<string, unknown>): T {
  if (Array.isArray(patch)) {
    return patch as T;
  }

  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (patch as T) ?? base;
  }

  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(patch)) {
    const patchValue = patch[key];
    const baseValue = result[key];

    if (patchValue === undefined) continue;

    if (Array.isArray(patchValue)) {
      result[key] = patchValue;
      continue;
    }

    if (isPlainObject(patchValue) && isPlainObject(baseValue)) {
      result[key] = mergeValues(baseValue, patchValue);
      continue;
    }

    result[key] = patchValue;
  }

  return result as T;
}
