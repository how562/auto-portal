import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeMappingToken } from "@/lib/import/storeMapping";

export interface FeedFileMappingRow {
  file_pattern: string;
  store_id: string;
}

/** Active DB mappings: normalized file_pattern token → store_id. */
export async function loadActiveFeedFileMappings(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("feed_file_mappings")
    .select("file_pattern, store_id")
    .eq("is_active", true);

  if (error) {
    console.warn(`feed_file_mappings: ${error.message}`);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const pattern =
      typeof row.file_pattern === "string" ? row.file_pattern.trim() : "";
    const storeId = typeof row.store_id === "string" ? row.store_id.trim() : "";
    const normalized = normalizeMappingToken(pattern);
    if (normalized && storeId) {
      map.set(normalized, storeId);
    }
  }
  return map;
}
