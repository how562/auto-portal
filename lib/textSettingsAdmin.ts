import { getSupabaseAdmin } from "./supabaseAdmin";

const TEXT_SELECT =
  "text_key, label_en, label_es, category, is_active, created_at, updated_at";

export interface PortalTextSettingRow {
  text_key: string;
  label_en: string;
  label_es: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PortalTextSettingUpdateInput = Partial<
  Pick<PortalTextSettingRow, "label_en" | "label_es" | "category" | "is_active">
>;

function normalizeRow(row: Record<string, unknown>): PortalTextSettingRow | null {
  const textKey = typeof row.text_key === "string" ? row.text_key.trim() : "";
  if (!textKey) return null;

  return {
    text_key: textKey,
    label_en:
      typeof row.label_en === "string" && row.label_en.trim()
        ? row.label_en.trim()
        : textKey,
    label_es:
      typeof row.label_es === "string" ? row.label_es.trim() || null : null,
    category:
      typeof row.category === "string" ? row.category.trim() || null : null,
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listPortalTextSettings(): Promise<PortalTextSettingRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portal_text_settings")
    .select(TEXT_SELECT)
    .order("category", { ascending: true })
    .order("text_key", { ascending: true });

  if (error) {
    throw new Error(`Failed to load text settings: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is PortalTextSettingRow => row != null);
}

export async function updatePortalTextSetting(
  textKey: string,
  input: PortalTextSettingUpdateInput,
): Promise<PortalTextSettingRow> {
  const key = textKey.trim();
  if (!key) throw new Error("text_key is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label_en !== undefined) {
    const label = input.label_en.trim();
    if (!label) throw new Error("label_en cannot be empty");
    payload.label_en = label;
  }
  if (input.label_es !== undefined) {
    payload.label_es = input.label_es?.trim() || null;
  }
  if (input.category !== undefined) {
    payload.category = input.category?.trim() || null;
  }
  if (input.is_active !== undefined) {
    payload.is_active = input.is_active;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portal_text_settings")
    .update(payload)
    .eq("text_key", key)
    .select(TEXT_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update text setting: ${error.message}`);
  }

  const normalized = normalizeRow(data as Record<string, unknown>);
  if (!normalized) {
    throw new Error("Updated row could not be read");
  }
  return normalized;
}
