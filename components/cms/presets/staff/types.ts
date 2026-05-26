/**
 * Dynamic staff repeater — intended CMS shape for all staff presets.
 * @cms_repeater staff_members[]
 */
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  location?: string;
  bio?: string;
  email?: string;
  phone?: string;
  /** CMS: image_url */
  photoLabel?: string;
}

export interface StaffSectionCopy {
  eyebrow?: string;
  headline?: string;
  body?: string;
}
