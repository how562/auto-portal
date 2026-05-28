export interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Admin pages index row — includes section count for warnings. */
export interface AdminSitePageListItem extends SitePage {
  section_count: number;
}
