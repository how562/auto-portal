import { cache } from "react";
import { findServiceFallback, staticFallbackLocations } from "./serviceSchedulingFallback";
import { fetchStores } from "./stores";
import type { Store } from "./types";
import {
  LOCATION_IMAGE_POOL,
  LOCATION_MAP_POSITIONS,
} from "./dealershipImagery";
import type { DealershipLocation } from "./locationsPageTypes";

function splitAddress(address: string): { line1: string; line2: string | null } {
  const commaParts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (commaParts.length <= 2) {
    return { line1: address, line2: null };
  }
  const line1 = commaParts.slice(0, 2).join(", ");
  const line2 = commaParts.slice(2).join(", ");
  return { line1, line2 };
}

function viewUrlForStore(
  website: string | null | undefined,
  address: string,
): string {
  const site = website?.trim();
  if (site) {
    try {
      return new URL(site.startsWith("http") ? site : `https://${site}`).href;
    } catch {
      /* fall through */
    }
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function mergeStoreToLocation(
  store: Store,
  index: number,
  fallbackIndex: number,
): DealershipLocation {
  const fallback = findServiceFallback(store.name);
  const address =
    fallback?.address ||
    [store.city, store.state].filter(Boolean).join(", ") ||
    "Texas";
  const { line1, line2 } = splitAddress(address);
  const mapPos = LOCATION_MAP_POSITIONS[fallbackIndex] ?? LOCATION_MAP_POSITIONS[0];

  return {
    id: store.id,
    number: index + 1,
    storeName: fallback?.storeName ?? store.name,
    addressLine1: line1,
    addressLine2: line2,
    viewUrl: viewUrlForStore(store.website ?? fallback?.serviceScheduleUrl, address),
    imageUrl: LOCATION_IMAGE_POOL[index % LOCATION_IMAGE_POOL.length],
    mapPosition: { top: mapPos.top, left: mapPos.left },
    showOnInset:
      mapPos.showOnInset || address.toLowerCase().includes("rockwall"),
  };
}

function fallbackOnlyLocation(
  entry: ReturnType<typeof staticFallbackLocations>[number],
  index: number,
): DealershipLocation {
  const { line1, line2 } = splitAddress(entry.address);
  const mapPos = LOCATION_MAP_POSITIONS[index] ?? LOCATION_MAP_POSITIONS[0];

  return {
    id: `location-fallback-${index}`,
    number: index + 1,
    storeName: entry.storeName,
    addressLine1: line1,
    addressLine2: line2,
    viewUrl: viewUrlForStore(entry.serviceScheduleUrl, entry.address),
    imageUrl: LOCATION_IMAGE_POOL[index % LOCATION_IMAGE_POOL.length],
    mapPosition: { top: mapPos.top, left: mapPos.left },
    showOnInset:
      mapPos.showOnInset || entry.address.toLowerCase().includes("rockwall"),
  };
}

export const fetchDealershipLocations = cache(async (): Promise<DealershipLocation[]> => {
  try {
    const stores = await fetchStores();
    if (stores.length === 0) {
      return staticFallbackLocations().map((entry, index) =>
        fallbackOnlyLocation(entry, index),
      );
    }

    return stores.map((store, index) => {
      const fallbackIdx =
        staticFallbackLocations().findIndex((f) =>
          store.name.toLowerCase().includes(f.nameIncludes),
        );
      return mergeStoreToLocation(store, index, fallbackIdx >= 0 ? fallbackIdx : index);
    });
  } catch {
    return staticFallbackLocations().map((entry, index) =>
      fallbackOnlyLocation(entry, index),
    );
  }
});
