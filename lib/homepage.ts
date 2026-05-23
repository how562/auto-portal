import { getSupabase } from "./supabase";
import type {
  Collection,
  CollectionRule,
  HomepageSection,
  HomepageSectionData,
  Vehicle,
} from "./types";

const VEHICLE_LIMIT = 8;

const VEHICLE_SELECT =
  "id, year, make, model, trim, condition, body_style, internet_price, mileage, stock_number, primary_image_url";

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("homepage_sections")
    .select(
      "id, title, subtitle, section_type, collection_id, sort_order, is_active",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load homepage sections: ${error.message}`);
  }

  return (data ?? []) as HomepageSection[];
}

async function fetchCollection(
  collectionId: string,
): Promise<Collection | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("collections")
    .select("id, store_id, name")
    .eq("id", collectionId)
    .single();

  if (error) {
    console.error(`Failed to load collection ${collectionId}:`, error.message);
    return null;
  }

  return data as Collection;
}

async function fetchCollectionRules(
  collectionId: string,
): Promise<CollectionRule[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("collection_rules")
    .select("id, collection_id, field, operator, value")
    .eq("collection_id", collectionId);

  if (error) {
    throw new Error(
      `Failed to load collection rules for ${collectionId}: ${error.message}`,
    );
  }

  return (data ?? []) as CollectionRule[];
}

async function fetchVehiclesForStore(storeId: string): Promise<Vehicle[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", storeId)
    .eq("status", "active")
    .limit(VEHICLE_LIMIT);

  if (error) {
    throw new Error(`Failed to load vehicles: ${error.message}`);
  }

  return (data ?? []) as Vehicle[];
}

async function loadCollectionSection(
  section: HomepageSection,
): Promise<HomepageSectionData> {
  if (section.section_type !== "collection" || !section.collection_id) {
    return {
      section,
      collection: null,
      rules: [],
      vehicles: [],
    };
  }

  const collection = await fetchCollection(section.collection_id);
  if (!collection) {
    return {
      section,
      collection: null,
      rules: [],
      vehicles: [],
    };
  }

  const rules = await fetchCollectionRules(section.collection_id);
  const vehicles = await fetchVehiclesForStore(collection.store_id);

  return {
    section,
    collection,
    rules,
    vehicles,
  };
}

export async function fetchHomepageData(): Promise<HomepageSectionData[]> {
  const sections = await fetchHomepageSections();

  return Promise.all(sections.map((section) => loadCollectionSection(section)));
}
