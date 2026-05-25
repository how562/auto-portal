import { getSupabaseAdmin } from "./supabaseAdmin";

const COLLECTION_SELECT =
  "id, store_id, name, slug, description, sort_order, is_active, created_at, updated_at";

export interface CollectionRuleInput {
  field: string;
  operator: string;
  value: string;
}

export interface CollectionRuleRow extends CollectionRuleInput {
  id: string;
  collection_id: string;
}

export interface CollectionAdminRow {
  id: string;
  store_id: string | null;
  store_name: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  rule_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionDetailRow extends CollectionAdminRow {
  rules: CollectionRuleRow[];
}

export interface CollectionCreateInput {
  name: string;
  slug?: string;
  description?: string | null;
  store_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CollectionUpdateInput {
  name?: string;
  slug?: string;
  description?: string | null;
  store_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  rules?: CollectionRuleInput[];
}

export function slugifyCollectionName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCollectionRow(
  row: Record<string, unknown>,
  ruleCount = 0,
): CollectionAdminRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!id || !name) return null;

  let storeName: string | null = null;
  const stores = row.stores;
  if (stores && typeof stores === "object" && !Array.isArray(stores)) {
    const n = (stores as { name?: unknown }).name;
    storeName = typeof n === "string" ? n.trim() || null : null;
  }

  return {
    id,
    store_id: typeof row.store_id === "string" ? row.store_id : null,
    store_name: storeName,
    name,
    slug: typeof row.slug === "string" ? row.slug.trim() : slugifyCollectionName(name),
    description:
      typeof row.description === "string" ? row.description.trim() || null : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    rule_count: ruleCount,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function normalizeRule(row: Record<string, unknown>): CollectionRuleRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;
  return {
    id,
    collection_id:
      typeof row.collection_id === "string" ? row.collection_id : "",
    field: typeof row.field === "string" ? row.field : "",
    operator: typeof row.operator === "string" ? row.operator : "equals",
    value: typeof row.value === "string" ? row.value : "",
  };
}

export async function listCollectionsAdmin(): Promise<CollectionAdminRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("collections")
    .select(`${COLLECTION_SELECT}, stores(name)`)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load collections: ${error.message}`);
  }

  const { data: ruleRows } = await supabase
    .from("collection_rules")
    .select("collection_id");

  const counts = new Map<string, number>();
  for (const row of ruleRows ?? []) {
    const cid = row.collection_id as string;
    counts.set(cid, (counts.get(cid) ?? 0) + 1);
  }

  return (data ?? [])
    .map((row) =>
      normalizeCollectionRow(
        row as Record<string, unknown>,
        counts.get((row as { id: string }).id) ?? 0,
      ),
    )
    .filter((row): row is CollectionAdminRow => row != null);
}

export async function getCollectionAdmin(
  id: string,
): Promise<CollectionDetailRow | null> {
  const supabase = getSupabaseAdmin();
  const collectionId = id.trim();
  if (!collectionId) return null;

  const { data, error } = await supabase
    .from("collections")
    .select(`${COLLECTION_SELECT}, stores(name)`)
    .eq("id", collectionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load collection: ${error.message}`);
  }
  if (!data) return null;

  const { data: rulesData, error: rulesError } = await supabase
    .from("collection_rules")
    .select("id, collection_id, field, operator, value")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: true });

  if (rulesError) {
    throw new Error(`Failed to load collection rules: ${rulesError.message}`);
  }

  const base = normalizeCollectionRow(
    data as Record<string, unknown>,
    rulesData?.length ?? 0,
  );
  if (!base) return null;

  const rules = (rulesData ?? [])
    .map((row) => normalizeRule(row as Record<string, unknown>))
    .filter((row): row is CollectionRuleRow => row != null);

  return { ...base, rules };
}

export async function createCollection(
  input: CollectionCreateInput,
): Promise<CollectionAdminRow> {
  const name = input.name?.trim();
  if (!name) throw new Error("name is required");

  const slug = (input.slug?.trim() || slugifyCollectionName(name)) || name;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("collections")
    .insert({
      name,
      slug,
      description: input.description?.trim() || null,
      store_id: input.store_id || null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active !== false,
      updated_at: new Date().toISOString(),
    })
    .select(COLLECTION_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to create collection: ${error.message}`);
  }

  const detail = await getCollectionAdmin(String(data.id));
  if (!detail) throw new Error("Created collection could not be read");
  return {
    id: detail.id,
    store_id: detail.store_id,
    store_name: detail.store_name,
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    sort_order: detail.sort_order,
    is_active: detail.is_active,
    rule_count: detail.rules.length,
    created_at: detail.created_at,
    updated_at: detail.updated_at,
  };
}

async function replaceCollectionRules(
  collectionId: string,
  rules: CollectionRuleInput[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error: delError } = await supabase
    .from("collection_rules")
    .delete()
    .eq("collection_id", collectionId);

  if (delError) throw new Error(delError.message);

  const clean = rules.filter((r) => r.field?.trim() && r.operator?.trim());
  if (clean.length === 0) return;

  const { error: insError } = await supabase.from("collection_rules").insert(
    clean.map((r) => ({
      collection_id: collectionId,
      field: r.field.trim(),
      operator: r.operator.trim(),
      value: String(r.value ?? "").trim(),
    })),
  );

  if (insError) throw new Error(insError.message);
}

export async function updateCollection(
  id: string,
  input: CollectionUpdateInput,
): Promise<CollectionDetailRow> {
  const collectionId = id.trim();
  if (!collectionId) throw new Error("id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error("name cannot be empty");
    payload.name = name;
  }
  if (input.slug !== undefined) {
    const slug = input.slug.trim();
    if (!slug) throw new Error("slug cannot be empty");
    payload.slug = slug;
  }
  if (input.description !== undefined) {
    payload.description = input.description?.trim() || null;
  }
  if (input.store_id !== undefined) {
    payload.store_id = input.store_id || null;
  }
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const supabase = getSupabaseAdmin();
  if (Object.keys(payload).length > 1) {
    const { error } = await supabase
      .from("collections")
      .update(payload)
      .eq("id", collectionId);
    if (error) throw new Error(`Failed to update collection: ${error.message}`);
  }

  if (input.rules !== undefined) {
    await replaceCollectionRules(collectionId, input.rules);
  }

  const row = await getCollectionAdmin(collectionId);
  if (!row) throw new Error("Updated collection could not be read");
  return row;
}

export async function deactivateCollection(
  id: string,
): Promise<CollectionAdminRow> {
  const detail = await updateCollection(id, { is_active: false });
  return {
    id: detail.id,
    store_id: detail.store_id,
    store_name: detail.store_name,
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    sort_order: detail.sort_order,
    is_active: detail.is_active,
    rule_count: detail.rules.length,
    created_at: detail.created_at,
    updated_at: detail.updated_at,
  };
}
