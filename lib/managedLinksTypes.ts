export type ManagedLinkType = "cta" | "nav";

export type ManagedLinkMenuLocation = "header" | "footer";

export interface ManagedLinkRow {
  link_key: string;
  link_type: ManagedLinkType;
  menu_location?: ManagedLinkMenuLocation | null;
  parent_key?: string | null;
  is_group?: boolean | null;
  label: string;
  label_es?: string | null;
  url?: string | null;
  sort_order: number;
  opens_new_tab?: boolean | null;
  is_active?: boolean | null;
}
