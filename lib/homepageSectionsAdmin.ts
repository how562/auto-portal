import { getSupabaseAdmin } from "./supabaseAdmin";

const SECTION_SELECT =
  "id, title, title_es, subtitle, subtitle_es, section_type, collection_id, sort_order, is_active, created_at, updated_at";

export type HomepageSectionType = "collection" | "banner" | "static";

export interface HomepageSectionAdminRow {
  id: string;
  title: string | null;
  title_es: string | null;
  subtitle: string | null;
  subtitle_es: string | null;
  section_type: HomepageSectionType;
  collection_id: string | null;
  collection_name: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageSectionCreateInput {
  title?: string | null;
  title_es?: string | null;
  subtitle?: string | null;
  subtitle_es?: string | null;
  section_type?: HomepageSectionType;
  collection_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export type HomepageSectionUpdateInput = HomepageSectionCreateInput;

function normalizeType(value: string | undefined): HomepageSectionType {
  if (value === "banner" || value === "static") return value;
  return "collection";
}

function normalizeRow(row: Record<string, unknown>): HomepageSectionAdminRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  let collectionName: string | null = null;
  const collections = row.collections;
  if (collections && typeof collections === "object" && !Array.isArray(collections)) {
    const name = (collections as { name?: unknown }).name;
    collectionName = typeof name === "string" ? name.trim() || null : null;
  }

  return {
    id,
    title: typeof row.title === "string" ? row.title.trim() || null : null,
    title_es: typeof row.title_es === "string" ? row.title_es.trim() || null : null,
    subtitle: typeof row.subtitle === "string" ? row.subtitle.trim() || null : null,
    subtitle_es:
      typeof row.subtitle_es === "string" ? row.subtitle_es.trim() || null : null,
    section_type: normalizeType(
      typeof row.section_type === "string" ? row.section_type : undefined,
    ),
    collection_id:
      typeof row.collection_id === "string" ? row.collection_id : null,
    collection_name: collectionName,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listHomepageSectionsAdmin(): Promise<HomepageSectionAdminRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("homepage_sections")
    .select(`${SECTION_SELECT}, collections(name)`)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load homepage sections: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is HomepageSectionAdminRow => row != null);
}

export async function getHomepageSectionAdmin(
  id: string,
): Promise<HomepageSectionAdminRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("homepage_sections")
    .select(`${SECTION_SELECT}, collections(name)`)
    .eq("id", id.trim())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load homepage section: ${error.message}`);
  }
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function createHomepageSection(
  input: HomepageSectionCreateInput,
): Promise<HomepageSectionAdminRow> {
  const supabase = getSupabaseAdmin();
  const { data: maxRow } = await supabase
    .from("homepage_sections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder =
    input.sort_order ??
    (typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 0);

  const sectionType = normalizeType(input.section_type);
  const { data, error } = await supabase
    .from("homepage_sections")
    .insert({
      title: input.title?.trim() || null,
      title_es: input.title_es?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      subtitle_es: input.subtitle_es?.trim() || null,
      section_type: sectionType,
      collection_id:
        sectionType === "collection" && input.collection_id
          ? input.collection_id
          : null,
      sort_order: nextOrder,
      is_active: input.is_active !== false,
      updated_at: new Date().toISOString(),
    })
    .select(SECTION_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to create homepage section: ${error.message}`);
  }

  const row = await getHomepageSectionAdmin(String(data.id));
  if (!row) throw new Error("Created section could not be read");
  return row;
}

export async function updateHomepageSection(
  id: string,
  input: HomepageSectionUpdateInput,
): Promise<HomepageSectionAdminRow> {
  const sectionId = id.trim();
  if (!sectionId) throw new Error("id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title?.trim() || null;
  if (input.title_es !== undefined) {
    payload.title_es = input.title_es?.trim() || null;
  }
  if (input.subtitle !== undefined) {
    payload.subtitle = input.subtitle?.trim() || null;
  }
  if (input.subtitle_es !== undefined) {
    payload.subtitle_es = input.subtitle_es?.trim() || null;
  }
  if (input.section_type !== undefined) {
    payload.section_type = normalizeType(input.section_type);
  }
  if (input.collection_id !== undefined) {
    payload.collection_id = input.collection_id || null;
  }
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("homepage_sections")
    .update(payload)
    .eq("id", sectionId);

  if (error) {
    throw new Error(`Failed to update homepage section: ${error.message}`);
  }

  const row = await getHomepageSectionAdmin(sectionId);
  if (!row) throw new Error("Updated section could not be read");
  return row;
}

export async function swapHomepageSectionOrder(
  idA: string,
  idB: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const [a, b] = await Promise.all([
    getHomepageSectionAdmin(idA),
    getHomepageSectionAdmin(idB),
  ]);
  if (!a || !b) throw new Error("Section not found");

  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("homepage_sections")
    .update({ sort_order: b.sort_order, updated_at: now })
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("homepage_sections")
    .update({ sort_order: a.sort_order, updated_at: now })
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
}
