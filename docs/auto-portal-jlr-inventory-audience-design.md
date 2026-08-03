# Design: JLR inventory audiences (shared file, virtual sites)

**Status:** Implemented (2026-08-03). Pool store + audiences live; provider cutover for Jaguar/Land Rover public sites remains manual.  
**Project:** Auto Portal (`faantdhcxnnuwuwkaxbq`) only. Not GEO.  
**Date:** 2026-08-03

---

## 1. Problem

vAuto delivers one file:

`JaguarLandRoverofSanAntonio.csv`

Facts from SFTP inspection:

- Single `DealerId` / effectively one rooftop feed.
- `Dealer Name` does not split Jaguar vs Land Rover.
- `Make` includes Jaguar, Land Rover, and many other brands (used inventory).

Portal already has two store records:

- Jaguar San Antonio  
- Land Rover San Antonio  

**Product intent (this design):**

| Site (audience) | Inventory definition |
|-----------------|----------------------|
| **Jaguar Site** | All **used** inventory **+** **new Jaguar** inventory |
| **Land Rover Site** | All **used** inventory **+** **new Land Rover / Range Rover** inventory |

Constraints:

- Import the shared file **once**.
- **Do not duplicate** vehicle rows (same VIN must not exist twice for the same provider).
- Extend the **query layer** with **inventory audiences**, not dual upserts.

---

## 2. Goals and non-goals

### Goals

1. One physical vAuto inventory set for the shared rooftop file.
2. Two public “site” experiences that filter that set differently.
3. Used vehicles appear on **both** sites (same underlying row / id).
4. New Jaguar only on Jaguar site; new Land Rover / Range Rover only on Land Rover site.
5. Soft-deactivate / import logging remain store+provider scoped to the **physical** owner.
6. Preserve HomeNet rollback for other stores; JLR path stays vAuto-audience based after cutover.

### Non-goals (this design)

- Make-only filtering of the whole file into two physical stores.
- Duplicating rows into both Jaguar and Land Rover `store_id`s.
- GEO integration.
- Implementing code in this pass.

---

## 3. Recommended model

### 3.1 Concepts

| Concept | Meaning |
|---------|---------|
| **Physical inventory owner** | The `store_id` (or pool id) that owns the imported `vehicles` rows |
| **Site / dealership store** | Existing public store: Jaguar SA or Land Rover SA (nav, leads, branding) |
| **Inventory audience** | Named query rule that maps a **site store** → **physical owner** + **row predicate** |

```
JaguarLandRoverofSanAntonio.csv
        │
        ▼  (single import)
vehicles rows
  store_id = <physical owner>
  inventory_provider = 'vauto'
        │
        ├─ audience "jaguar"  → Jaguar Site SRP/VDP/collections
        └─ audience "land_rover" → Land Rover Site SRP/VDP/collections
```

**Used rows are not copied.** Both audiences include the same used vehicles by **filter**, so both sites can list `/inventory/[same-uuid]` when context allows.

### 3.2 Physical owner options

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **A. Dedicated pool store** | Hidden/internal store e.g. “JLR San Antonio Inventory Pool”; both audiences point at it | **Preferred** — clear ownership, symmetric sites |
| **B. Designate one site as owner** | e.g. Land Rover store_id owns all rows; Jaguar audiences from that store | Avoid — asymmetric admin/counts |
| **C. `inventory_pool_id` column** | New nullable FK; `store_id` unused or null for pooled rows | More schema; only if pools generalize beyond JLR |

**Recommendation: Option A** — one new (or repurposed) physical store used only as inventory owner, not as a customer-facing brand site. Keep Jaguar and Land Rover stores as **audience faces**.

Feed mapping:

- `JaguarLandRoverofSanAntonio` → **physical pool store only** (single active mapping).
- Remove or disable the ambiguous dual mapping to both Jaguar and Land Rover stores.

### 3.3 Audience predicates (canonical)

Normalize `condition` the same way the importer does (`new` | `used` | `cpo`). Treat **`cpo` as used** for audience membership (included in “all used”).

**Make helpers (case-insensitive):**

- `isJaguarMake(make)` → make matches `/^jaguar$/i` (trim).
- `isLandRoverFamily(make, model)` →  
  - make matches `/^land\s*rover$/i`, **or**  
  - make/model indicates Range Rover (`/^range\s*rover/i` on make or model),  
  - optionally body/series fields if needed after sample QA.

**Jaguar audience** (`audience_key = 'jaguar'`):

```text
status = 'active'
AND inventory_provider = active provider for physical owner
AND store_id = <physical owner>
AND (
  condition IN ('used', 'cpo')
  OR (condition = 'new' AND isJaguarMake(make))
)
```

**Land Rover audience** (`audience_key = 'land_rover'`):

```text
status = 'active'
AND inventory_provider = active provider for physical owner
AND store_id = <physical owner>
AND (
  condition IN ('used', 'cpo')
  OR (condition = 'new' AND isLandRoverFamily(make, model))
)
```

**Explicitly excluded from both as “new franchise” inventory:**

- New vehicles whose make is neither Jaguar nor Land Rover family (e.g. new BMW in file — rare; if present, they appear in **neither** site’s “new” slice, and also **not** in used — so they would be **invisible** on both sites).

**Open product decision (must confirm before implement):**

> Should non-JLR **new** units in the shared file be hidden, attached to one site, or forced into “used” display?

Default in this design: **hidden from both public audiences** (still in DB for admin/pool inventory table).

### 3.4 Overlap (intentional)

| Vehicle class | Jaguar site | Land Rover site |
|---------------|-------------|-----------------|
| Used / CPO (any make) | Yes | Yes |
| New Jaguar | Yes | No |
| New Land Rover / Range Rover | No | Yes |
| New other make | No (default) | No (default) |

Overlap is **logical only** — one row, two query memberships.

---

## 4. Data / config shape (proposed)

### 4.1 Table `inventory_audiences` (new)

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `audience_key` | text UNIQUE | `jaguar`, `land_rover` |
| `label` | text | Admin label |
| `site_store_id` | uuid FK → `stores` | Public site this audience serves |
| `source_store_id` | uuid FK → `stores` | Physical inventory owner |
| `rules` | jsonb NOT NULL | Versioned rule document (below) |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

**Unique:** one active audience per `site_store_id` (or allow multiple later).

### 4.2 `rules` JSON (v1)

```json
{
  "version": 1,
  "include_used": true,
  "include_cpo_as_used": true,
  "new_make_any_of": ["jaguar"],
  "new_make_family": null,
  "new_land_rover_family": false
}
```

Land Rover audience:

```json
{
  "version": 1,
  "include_used": true,
  "include_cpo_as_used": true,
  "new_make_any_of": ["land rover", "landrover"],
  "new_model_prefix_any_of": ["range rover"],
  "new_land_rover_family": true
}
```

Keep rules data-driven so admin can tune without redeploying predicates.

### 4.3 What we do **not** add

- No second `vehicles` row per audience.
- No `vehicles.audience_keys` array required for v1 (derive at query time). Optional later for indexing if performance requires.
- No change to `(store_id, vin, inventory_provider)` uniqueness — still one row per physical owner + VIN + provider.

---

## 5. Query-layer extension

Today (simplified):

```text
vehicles
  WHERE status = 'active'
  AND store_id = <site or filter>
  AND inventory_provider = <active provider for that store>
```

### 5.1 Audience-aware resolution

Add something like:

```ts
// Conceptual API — names TBD at implement time
resolveInventoryScope(siteStoreId: string): 
  | { kind: 'store'; storeId; provider }
  | { kind: 'audience'; audienceKey; sourceStoreId; provider; rules }
```

- If `site_store_id` has an **active** `inventory_audiences` row → use audience scope.  
- Else → existing store-scoped behavior (all other Cavender stores unchanged).

### 5.2 Apply filters

Extend `lib/vehicles.ts` / `inventoryActiveSource.ts` / `cmsCollections.ts` / homepage collection fetches:

1. Resolve scope for requested store (or “all stores” portal aggregation).
2. Provider filter against **source_store_id** (physical owner), not the site id when in audience mode.
3. Append audience SQL/predicate (condition + make/model rules).
4. For portal-wide SRP with store filter = Jaguar → audience filter; store filter = Land Rover → other audience; store filter = Ford → classic store filter.

### 5.3 VDP (`fetchVehicleById`)

Current rule: vehicle’s `store_id` must match active provider for that store.

Audience rule:

1. Load vehicle by id.  
2. Determine **which site context** requested it (referrer store filter, query `?store=`, path, or lead context — **needs a concrete context signal**).  
3. Allow if vehicle’s `store_id === audience.source_store_id` AND vehicle matches that audience’s rules AND provider is active on the **source** store.  
4. Reject if vehicle is new Jaguar but context is Land Rover site (and vice versa).  
5. Allow used on either site context.

**Context signal recommendation:**  
- SRP links: `/inventory/[id]?audience=jaguar` or `?store=<siteStoreId>`  
- Or encode site in host/path if multi-site hosting exists later.  
- Default if missing: allow if vehicle matches **any** active audience for its source store (or require store param — stricter).

### 5.4 Similar vehicles / Smart Match / collections

- Similar: same audience scope as current VDP context.  
- Smart Match: run over audience-filtered vehicle set for that site.  
- CMS `inventory_collection` bound to Jaguar store → resolve audience automatically.  
- Admin inventory table: show **physical owner** inventory in full (no audience hide), with optional audience preview toggle.

### 5.5 Counts and cutover admin

- `last_vehicle_count` on `inventory_feed_sources` remains **physical** count for the pool store.  
- Optional derived metrics: `audience_jaguar_count`, `audience_land_rover_count` (computed, not stored rows).  
- Provider switch: activate vAuto on the **physical pool store**; site stores may not hold vehicles — UI should show “this site uses audience X → source Y”.

---

## 6. Import pipeline changes (design only)

1. **Single mapping:** `JaguarLandRoverofSanAntonio.csv` → physical pool `store_id`.  
2. Disable dual Jaguar + Land Rover file mappings (ambiguous today).  
3. Import once via existing vAuto importer (`inventory_provider='vauto'`).  
4. Reconcile / soft-deactivate only against the **pool** store’s vAuto VINs.  
5. Do **not** write audience-specific rows.  
6. Optional: tag `dealer_name` / `source_raw` unchanged for merchandising.

No make-based **routing at import time** for split stores — routing is **query-time** only.

---

## 7. Edge cases

| Case | Behavior |
|------|----------|
| New Jaguar | Jaguar audience only |
| New Land Rover / Range Rover (make or model) | Land Rover audience only |
| Used BMW / Ford / etc. | **Both** audiences |
| New non-JLR make | Hidden from both public audiences (default); visible in admin pool |
| CPO | Treated as used → both |
| Missing condition | Define: exclude from public audiences or treat as used — **decide at implement** (recommend exclude) |
| Missing make on new | Already skipped by importer validation |
| Same vehicle on both SRPs | Same `id`; shared VDP; leads should record **site_store_id** (audience face), not only physical owner |
| HomeNet historical rows on Jaguar/LR stores | Unrelated to pool; keep provider rules; audiences apply to vAuto pool after cutover |

---

## 8. SEO / UX notes

- Used inventory intentionally duplicated in **listings** (not DB). Accept duplicate URLs for same vehicle under two site navigations, or canonicalize VDP to one preferred host with `rel=canonical` — **product/SEO decision**.  
- Store filter chips: Jaguar vs Land Rover mean **audience**, not disjoint stock.  
- Messaging tip: “Shared pre-owned inventory” on both sites reduces shopper confusion.

---

## 9. Implementation sketch (when approved)

1. Migration: `inventory_audiences` + seed jaguar/land_rover rows; create/ensure pool store; fix feed mapping.  
2. `lib/inventoryAudiences.ts`: load rules, `vehicleMatchesAudience()`, `applyAudienceFilter(query)`.  
3. Wire `fetchInventoryVehiclesPage`, `fetchVehicleById`, collections, similar, admin preview.  
4. Lead payload: add `siteStoreId` / `audienceKey`.  
5. Admin: audience editor + pool import health.  
6. Import JLR file once to pool; validate counts; enable audiences; do not dual-map.  
7. Tests: used in both; new Jaguar only jaguar; new LR only land_rover; no row duplication; other stores unchanged.

---

## 10. Alternatives considered

| Approach | Why rejected |
|----------|--------------|
| Duplicate rows into both stores | Violates “do not duplicate”; breaks VIN uniqueness / reconcile |
| Make-only import split | Misclassifies used multi-make inventory; already ruled out |
| Import twice with different providers | Still duplicates; wrong model |
| DB view per audience only | Fine as optimization later; still need audience config + VDP context |

---

## 11. Decisions needed from review

1. Confirm **Option A** (dedicated pool store) vs B/C.  
2. Confirm **non-JLR new** units: hide vs assign.  
3. Confirm **CPO** = used (both sites).  
4. Confirm **Range Rover** matching via make and/or model prefix.  
5. Confirm VDP context: required `?store=` / `?audience=` vs permissive.  
6. Confirm SEO canonical strategy for shared used VDPs.  
7. Naming: pool store display name; whether it appears in public store filters (recommend **no**).

---

## 12. Success criteria

- One import run for `JaguarLandRoverofSanAntonio.csv` → N pool rows.  
- `count(*)` for pool ≫ unique VINs across both sites’ listings, but  
  `jaguar_listing ∪ land_rover_listing` uses **N or fewer** physical ids with **overlap on used**.  
- Zero duplicate `(store_id, vin, inventory_provider)` for the same VIN in the pool.  
- Ford/Nissan/etc. query paths unchanged.  
- Admin can still see full pool inventory without audience filtering.
