export interface HomepageSection {
  id: string;
  title: string | null;
  subtitle: string | null;
  section_type: string;
  collection_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Collection {
  id: string;
  store_id: string;
  name: string | null;
  title: string | null;
}

export interface CollectionRule {
  id: string;
  collection_id: string;
  field: string;
  operator: string;
  value: string | null;
}

export interface Vehicle {
  id: string;
  store_id?: string | null;
  vin?: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  condition: string | null;
  body_style: string | null;
  /**
   * Customer-facing price. NEVER 0 — the importer and migration
   * normalize 0/blank/missing to null so the UI can fall back to
   * `msrp` and finally to "Call for Price".
   */
  internet_price: number | null;
  /** Manufacturer suggested retail price (HomeNet `MSRP`). */
  msrp?: number | null;
  /** Dealer's selling price (HomeNet `SellingPrice`). */
  sale_price?: number | null;
  mileage: number | null;
  stock_number: string | null;
  primary_image_url: string | null;
  image_urls?: string[] | null;
  dealer_name?: string | null;
  image_count?: number | null;
  has_images?: boolean | null;
  data_quality_score?: number | null;
  created_at?: string | null;
  imported_at?: string | null;
}

export interface VehicleDetail extends Vehicle {
  vin: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  store_id: string | null;
  image_urls: string[] | null;
  dealer_name: string | null;
}

export interface Store {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
}

export interface HomepageSectionData {
  section: HomepageSection;
  collection: Collection | null;
  rules: CollectionRule[];
  vehicles: Vehicle[];
}

export interface LeadFormPayload {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  message: string;
  vehicleId: string | null;
  vehicleLabel: string | null;
  shopperIntent: string;
  leadAction: string;
  submittedAt: string;
}

export type ShopperIntent =
  | "any"
  | "family-suv"
  | "work-truck"
  | "luxury"
  | "under-30k"
  | "first-time"
  | "fuel-efficient";

export type BudgetRange = "any" | "under-30k" | "30-50k" | "50k-plus";

export type ConditionFilter = "either" | "new" | "used";
