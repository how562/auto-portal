/** Per-department contact + CTA editable in CMS. */
export interface DealershipDepartmentFields {
  phone: string;
  ctaLabel: string;
  ctaUrl: string;
}

/** CMS record for a dealership — merged over store data on Locations & Schedule Service. */
export interface DealershipCmsEntry {
  /** Stable key; matched to store id when present, else nameKey substring. */
  id: string;
  /** Substring match against stores.name (case-insensitive). */
  nameKey: string;
  storeName: string;
  imageUrl: string;
  addressLine1: string;
  addressLine2: string;
  viewUrl: string;
  viewCtaLabel: string;
  mapTop: string;
  mapLeft: string;
  showOnInset: boolean;
  sales: DealershipDepartmentFields;
  service: DealershipDepartmentFields;
  parts: DealershipDepartmentFields;
}

export interface DealershipDepartmentContact {
  key: "sales" | "service" | "parts";
  label: string;
  phone: string | null;
  phoneTel: string | null;
  ctaLabel: string;
  ctaUrl: string | null;
}

export function emptyDepartmentFields(): DealershipDepartmentFields {
  return { phone: "", ctaLabel: "", ctaUrl: "" };
}
