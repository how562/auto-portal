import { getSupabaseAdmin } from "./supabaseAdmin";

const MAPPING_SELECT =
  "id, file_pattern, store_id, is_active, notes, created_at, updated_at, stores(name)";

export interface FeedFileMappingAdminRow {
  id: string;
  file_pattern: string;
  store_id: string;
  store_name: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedFileMappingCreateInput {
  file_pattern: string;
  store_id: string;
  notes?: string | null;
  is_active?: boolean;
}

export interface FeedFileMappingUpdateInput {
  file_pattern?: string;
  store_id?: string;
  notes?: string | null;
  is_active?: boolean;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeRow(row: Record<string, unknown>): FeedFileMappingAdminRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  const filePattern =
    typeof row.file_pattern === "string" ? row.file_pattern.trim() : "";
  const storeId = typeof row.store_id === "string" ? row.store_id.trim() : "";
  if (!filePattern || !storeId) return null;

  let storeName: string | null = null;
  const stores = row.stores;
  if (stores && typeof stores === "object" && !Array.isArray(stores)) {
    const name = (stores as { name?: unknown }).name;
    storeName = typeof name === "string" ? name.trim() || null : null;
  }

  return {
    id,
    file_pattern: filePattern,
    store_id: storeId,
    store_name: storeName,
    is_active: row.is_active !== false,
    notes: typeof row.notes === "string" ? row.notes.trim() || null : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listFeedFileMappingsAdmin(): Promise<FeedFileMappingAdminRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("feed_file_mappings")
    .select(MAPPING_SELECT)
    .order("file_pattern", { ascending: true });

  if (error) {
    throw new Error(`Failed to load feed file mappings: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is FeedFileMappingAdminRow => row != null);
}

export async function createFeedFileMapping(
  input: FeedFileMappingCreateInput,
): Promise<FeedFileMappingAdminRow> {
  const filePattern = input.file_pattern?.trim();
  const storeId = input.store_id?.trim();
  if (!filePattern) throw new Error("file_pattern is required");
  if (!storeId || !isUuid(storeId)) throw new Error("store_id must be a valid UUID");

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("feed_file_mappings")
    .insert({
      file_pattern: filePattern,
      store_id: storeId,
      notes: input.notes?.trim() || null,
      is_active: input.is_active !== false,
      updated_at: new Date().toISOString(),
    })
    .select(MAPPING_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to create mapping: ${error.message}`);
  }

  const normalized = normalizeRow(data as Record<string, unknown>);
  if (!normalized) throw new Error("Created mapping could not be read");
  return normalized;
}

export async function updateFeedFileMapping(
  id: string,
  input: FeedFileMappingUpdateInput,
): Promise<FeedFileMappingAdminRow> {
  const mappingId = id.trim();
  if (!mappingId) throw new Error("id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.file_pattern !== undefined) {
    const pattern = input.file_pattern.trim();
    if (!pattern) throw new Error("file_pattern cannot be empty");
    payload.file_pattern = pattern;
  }
  if (input.store_id !== undefined) {
    const storeId = input.store_id.trim();
    if (!storeId || !isUuid(storeId)) throw new Error("store_id must be a valid UUID");
    payload.store_id = storeId;
  }
  if (input.notes !== undefined) {
    payload.notes = input.notes?.trim() || null;
  }
  if (input.is_active !== undefined) {
    payload.is_active = input.is_active;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("feed_file_mappings")
    .update(payload)
    .eq("id", mappingId)
    .select(MAPPING_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update mapping: ${error.message}`);
  }

  const normalized = normalizeRow(data as Record<string, unknown>);
  if (!normalized) throw new Error("Updated mapping could not be read");
  return normalized;
}

/** Soft-delete: deactivate mapping (safe default). */
export async function deactivateFeedFileMapping(
  id: string,
): Promise<FeedFileMappingAdminRow> {
  return updateFeedFileMapping(id, { is_active: false });
}
