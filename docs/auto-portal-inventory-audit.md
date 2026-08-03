# Auto Portal Inventory System Audit

**Date:** 2026-08-03  
**Scope:** Read-only audit of HomeNet / vAuto / inventory code, schema, and consumers in Auto Portal.  
**Constraints honored:** No application code changes, no Supabase mutations, no env changes, no deletions.

**Architecture decision (given):** GEO and Auto Portal remain separate applications. They may receive the same vAuto dealership feed files, but Auto Portal must own its own Supabase project tables, Edge Functions, import logs, dealership mappings, environment variables, and inventory integration. This audit treats GEO as a **pattern reference only** — GEO is not present in this repository.

**Companion doc:** `docs/inventory-ingestion-architecture.md` (current intended design; partially ahead of live DB).

---

## Executive summary

Auto Portal already has a **provider-aware** inventory model (`homenet` | `vauto`), a live **HomeNet SFTP → Next.js API → upsert** path, and a **vAuto SFTP intake-only** path (no vehicle upsert yet). Public UI (SRP, VDP, homepage, CMS collections, Smart Match) reads from the shared `vehicles` table filtered by each store’s active provider.

The replacement target (portal-owned vAuto pipeline via Edge Function) is **aligned with direction already sketched in-repo**, but several required GEO-style behaviors are **missing or incomplete** in current Auto Portal code:

| Required behavior | Current Auto Portal status |
|-------------------|----------------------------|
| Dealership-specific feed identification | Partial — HomeNet file→store mapping exists; vAuto intake does not resolve stores |
| VIN-first matching | Yes — upsert key is `(store_id, vin, inventory_provider)` |
| Stock-number fallback matching | **No** — upsert requires VIN; stock alone cannot update |
| Required VIN **or** stock | Partial — map allows VIN\|stock `import_key`; upsert still requires VIN |
| Required make and model | **No** |
| Upsert active vehicles | Partial — inserts full row; updates merge **prices/images/quality only** |
| Refresh `imported_at` / `last_seen_at` | Partial — `imported_at` on insert; `last_seen_at` exists in live DB but is **unused by app** |
| Replace ordered image URLs; first = primary | Yes on insert; images refreshed on update |
| Soft-deactivate VINs missing from feed | **Not implemented** in import (schema allows `run_kind=reconcile`; 5 live rows already have `status='missing'` from unknown prior process) |
| Import-run logs + row-level errors | Intended in code; **live schema drift breaks logging** (see §10) |
| Inline CSV testing before SFTP | **Not present** |
| Store remote image URLs (no download) | Yes — HomeNet keeps remote `http(s)` URLs |
| Edge Function importer | **Not present** — imports run as Next.js API routes |
| Cron / scheduled imports in-repo | **Not present** — `feed_import_schedules` table exists only in unapplied migration |

**Live project snapshot** (`faantdhcxnnuwuwkaxbq`, observed 2026-08-03):

- **9 stores**, **4,460 vehicles** (4,455 `active`, 5 `missing`).
- **All** vehicle rows have `inventory_provider = NULL` (provider column never backfilled).
- Several stores currently point active source at **vAuto** while all inventory rows are untagged HomeNet-era data — provider filtering would hide inventory for those stores.
- Repo migrations for the full ingestion pipeline (`raw_feed_archives`, etc.) are **not applied** on this project.

---

## 1. Current inventory architecture

### 1.1 End-to-end data flow (today)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ External inventory sources (provider-isolated)                          │
│  • HomeNet DealerSend SFTP  → env SFTP_*                                │
│  • vAuto DigitalOcean SFTP  → env VAUTO_SFTP_*  (same files may also    │
│                               land on GEO’s intake; separate runtime)   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Next.js App Router (NOT Edge Functions)                                 │
│  GET /api/import-homenet   → runHomenetMultiFileInventoryImport()       │
│  GET /api/import-vauto     → runVautoInventoryIntake()  [no upsert]     │
│  Auth: IMPORT_SECRET (header / Bearer / ?secret=)                       │
│  DB client: getSupabaseAdmin() (service role)                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
   HomeNet path                                  vAuto path (phase 1)
   parse DealerSend CSV/TXT                      download + inspect headers
   resolve file → store                          write raw_feed_archives*
   map → CanonicalVehicleRow                     log feed_import_runs*
   upsert vehicles                               NO vehicles write
          │                                           │
          └─────────────────────┬─────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Auto Portal Supabase (this project only — not GEO)                      │
│  vehicles (store_id, vin, inventory_provider)                           │
│  inventory_feed_sources + dealership_inventory_settings (active source) │
│  feed_import_runs / feed_import_run_items / feed_file_mappings          │
│  (+ pipeline tables in repo migrations, not all live)                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Public / admin reads (server components + anon client)                  │
│  Filter: status='active' AND inventory_provider = active per store      │
│  SRP /inventory, VDP /inventory/[id], homepage, CMS inventory_collection│
│  Smart Match (in-memory over fetched Vehicle[] + smart_match_rules)     │
└─────────────────────────────────────────────────────────────────────────┘

* raw_feed_archives / enriched run columns: coded in-repo; not present on
  observed live DB (migration drift — see §4 and §10).
```

### 1.2 HomeNet path (production importer)

1. Operator or external scheduler hits `GET /api/import-homenet` with `IMPORT_SECRET`.
2. `lib/import/homenetImport.ts` starts a `feed_import_runs` row (`run_kind=import`, provider `homenet`).
3. `lib/import/sftpInventory.ts` connects with `SFTP_*`, downloads all inventory files (`.csv` / `.txt` / `.xml` / `.json`) under `SFTP_PATH`.
4. For each file:
   - Parse via `dealerSendParse` (delimiter detect: pipe → tab → comma).
   - Resolve dealership via `storeMapping` + `feed_file_mappings` / `HOMENET_STORE_FILE_MAP` / filename / feed columns.
   - Map rows with `dealerSendMap` → canonical via `providers/homenet/mapToCanonical`.
   - Upsert via `vehicleUpsert` with `inventory_provider: 'homenet'`.
5. Complete run log, touch `inventory_feed_sources`, write `inventory_snapshots` (when table exists).

### 1.3 vAuto path (intake only)

1. `GET /api/import-vauto` → `runVautoInventoryIntake()`.
2. Dedicated `VAUTO_SFTP_*` download.
3. Inspect content (`inspectVautoFeedContent`: format, header preview, row estimate).
4. Intended: archive metadata + failure rows; **no** `mapVautoRow` / upsert (`mapVautoRow` always returns `null`).
5. Admin cannot safely switch a store to vAuto as UI source until that provider has `last_vehicle_count > 0`.

### 1.4 Active-source display model

- Per store: `dealership_inventory_settings.active_inventory_feed_source_id` → `inventory_feed_sources.provider`.
- Default when unset: **`homenet`** (`DEFAULT_INVENTORY_PROVIDER`).
- Providers are **never merged** on public read paths.
- Switching sources does not delete inactive provider rows (by design).

### 1.5 What is *not* in the flow today

- No `INVENTORY_FEED_URL` HTTP pull.
- No Supabase Edge Function for inventory.
- No in-repo cron / Vercel cron (`vercel.json` absent; `feed_import_schedules` unapplied).
- No image download/re-host to Storage for inventory (CMS uses `cms-media` only).
- No full VIN reconcile pass after import.

---

## 2. Complete file map

### 2.1 Documentation

| Path | Role |
|------|------|
| `docs/inventory-ingestion-architecture.md` | Canonical provider-isolation design notes |
| `docs/auto-portal-inventory-audit.md` | This audit |
| `CLAUDE.md` | GEO boundary + inventory architecture summary for agents |
| `_lovable-handoff/**` | Legacy Lovable export (not live); includes older `last_seen_at` / `vehicle_images` schema sketches — ignore for runtime unless migrating history |

### 2.2 Import pipeline (`lib/import/`)

| Path | Role |
|------|------|
| `lib/import/canonicalVehicle.ts` | Shared `CanonicalVehicleRow`; upsert key helper requires `store_id` + `vin` |
| `lib/import/vehicleUpsert.ts` | Batch upsert by `(store_id, vin, inventory_provider)`; updates merge prices/images/quality only |
| `lib/import/importAuth.ts` | `IMPORT_SECRET` authorization |
| `lib/import/sftpInventory.ts` | Shared SFTP client; HomeNet `SFTP_*` + vAuto `VAUTO_SFTP_*` |
| `lib/import/storeMapping.ts` | Multi-strategy file→store resolution |
| `lib/import/dealerSendParse.ts` | Delimiter detection + row parse (HomeNet; reused by vAuto inspect) |
| `lib/import/dealerSendMap.ts` | HomeNet field aliases, prices, images, status, `source_raw` |
| `lib/import/homenetImport.ts` | HomeNet multi-file orchestrator |
| `lib/import/vautoIntake.ts` | vAuto intake orchestrator (no upsert) |
| `lib/import/providers/homenet/index.ts` | Re-exports HomeNet parse/map |
| `lib/import/providers/homenet/mapToCanonical.ts` | Thin DealerSend → canonical adapter |
| `lib/import/providers/vauto/index.ts` | Re-exports vAuto parse/map |
| `lib/import/providers/vauto/vautoParse.ts` | CSV/TXT parse + inspect helpers; XML/JSON throw |
| `lib/import/providers/vauto/vautoMap.ts` | **Stub** — always `null` |

### 2.3 Inventory / feed domain libs

| Path | Role |
|------|------|
| `lib/inventoryProviders.ts` | `'homenet' \| 'vauto'` enum, labels, default |
| `lib/inventoryActiveSource.ts` | Active provider resolution + public filter specs + count sync |
| `lib/inventorySourceSwitch.ts` | Admin switch validation + `inventory_source_switch_log` |
| `lib/inventoryFeedSourcesAdmin.ts` | Ensure/list/activate feed sources |
| `lib/inventoryFeedSourceHealth.ts` | Admin health chips |
| `lib/inventorySnapshots.ts` | Post-import count snapshots |
| `lib/inventoryIngestion/types.ts` | Run kinds, storage kinds, stage types |
| `lib/feedImportRunLog.ts` | Write `feed_import_runs` / items |
| `lib/feedImportRunsAdmin.ts` | Admin read of runs |
| `lib/feedFileMappings.ts` / `feedFileMappingsAdmin.ts` | Filename pattern → store |
| `lib/rawFeedArchive.ts` | Archive + failure inserts (vAuto path) |
| `lib/homenetSourceRaw.ts` | HomeNet-specific `source_raw` price/incentive/doc-fee readers |
| `lib/pricingSourceRegistry.ts` | VDP pricing source assembly (HomeNet-oriented raw keys + generic fallbacks) |
| `lib/vehicleQuality.ts` | Merchandising score used at import |
| `lib/stores.ts` / `storesAdmin.ts` | Dealership/store reads |

### 2.4 Public vehicle read / search / match

| Path | Role |
|------|------|
| `lib/vehicles.ts` | SRP pagination, portal sample, VDP by id, similar vehicles (provider-filtered) |
| `lib/loadInventoryPage.ts` | Inventory page data loader |
| `lib/inventorySearch.ts` | URL ↔ filters; Smart Match client path trigger |
| `lib/inventoryServerFilters.ts` | Server-side Supabase filter apply |
| `lib/inventoryMatch.ts` | Smart Match scoring/filtering |
| `lib/inventorySitePages.ts` | Inventory landing presets |
| `lib/inventoryDiscovery.ts` | Match microcopy |
| `lib/inventoryView.ts` | View helpers |
| `lib/inventoryRails.ts` | Rail grouping (**orphaned** — not mounted from `app/`) |
| `lib/cmsCollections.ts` | CMS `inventory_collection` vehicle fetch |
| `lib/homepage.ts` | Homepage collection vehicle fetch (**current `app/page.tsx` uses portal path instead**) |
| `lib/homepageInventorySearchBridge.ts` | Hero search → `/inventory?q=` |
| `lib/smartMatchRules.ts` / `Admin` / `Types` / `Fallback` / `Merge` / `Lifestyle` | Smart Match catalog |
| `lib/categoryCounts.ts` / `lifeFilters.ts` / `matchReasons.ts` / `vehicleFitCopy.ts` | Discovery UX |
| `lib/filterVehicles.ts` | Deprecated wrapper |
| `lib/adminInventory.ts` / `adminDashboard.ts` | Admin inventory table + health |
| `lib/vdpPricing.ts` / `vdpDisplay.ts` / `vdpCta.ts` / `vdpLead.ts` / `buildPricingMathbox.ts` / `effectivePrice.ts` | VDP |
| `lib/format.ts` | Includes `vehicleDetailPath()` → `/inventory/{id}` |
| `lib/vehicleImage.ts` | Image URL helper |
| `lib/types.ts` | `Vehicle`, `VehicleDetail`, collection/homepage types |

### 2.5 API routes

| Path | Role |
|------|------|
| `app/api/import-homenet/route.ts` | HomeNet import (`nodejs`, `maxDuration=300`) |
| `app/api/import-vauto/route.ts` | vAuto intake |
| `app/api/admin/inventory-feed-sources/route.ts` | List/switch active sources |
| `app/api/admin/feed-import-runs/route.ts` | List import runs |
| `app/api/admin/feed-file-mappings/route.ts` | Feed file mapping CRUD |
| `app/api/admin/collections/route.ts` + `[id]/route.ts` | Collections CRUD |
| `app/api/admin/smart-match-rules/route.ts` | Smart Match rules |
| `app/api/admin/site-pages/**` | Can create `page_type: "inventory"` |

No public REST vehicle API — pages load via server components + `getSupabase()`.

### 2.6 App routes (user-facing)

| Path | Role |
|------|------|
| `app/page.tsx` | Homepage — `fetchPortalVehicles()` → portal experience |
| `app/inventory/page.tsx` + `layout.tsx` | SRP |
| `app/inventory/[id]/page.tsx` + `not-found.tsx` | VDP |
| `app/[slug]/page.tsx` | CMS pages + inventory landing pages |

### 2.7 UI components (inventory consumers)

**Public**

- `components/inventory/*` — SRP shell, filters, cards, landing view, pagination, match UI
- `components/vdp/*` — VDP layout, pricing, math box, CTAs, similar vehicles
- `components/portal/VehicleCard.tsx`, `PortalExperience.tsx`, `GuidedDiscoverySection.tsx`, `LeadCaptureContext.tsx`
- `components/home/DiscoveryCategoriesSection.tsx`, `HomepageInventorySearchBridge.tsx`, heroes
- `components/cms/CMSSectionRenderer.tsx` — `inventory_collection`
- `components/vehicle/*`, `VehicleImagePlaceholder.tsx`
- Orphaned: `InventoryRailsSection`, `TopPicksSection` / related libs (present, not mounted from live home)

**Admin**

- Pages: `app/admin/inventory`, `inventory-sources`, `feeds`, `feed-mapping`, `collections`, `smart-match-rules`, `dashboard`
- Components: `InventoryFeedSourcesScreen`, `FeedsScreen`, `FeedImportRunsPanel`, `FeedMapping*`, `AdminInventoryTable`, `Collections*`, `SmartMatchRules*`, `InventorySitePageEditor`, `AdminDashboardScreen`
- Nav: `components/admin/AppSidebar.tsx`

### 2.8 Migrations (inventory-related)

| Migration | Purpose |
|-----------|---------|
| `20260522230000_vehicles_homenet_import.sql` | Creates/alters `stores`, `vehicles` (+ import columns, RLS read) |
| `20260523000000_vehicles_image_urls_and_backfill.sql` | `image_urls` + HomeNet `ImageList` backfill |
| `20260523000100_vehicles_dealer_name.sql` | `dealer_name` |
| `20260523080000_vehicles_merchandising_quality.sql` | quality columns + indexes |
| `20260523130000_vehicles_merchandising_quality_v2.sql` | Rescore + index tweak |
| `20260523150000_vehicle_pricing_split.sql` | `msrp`, `sale_price`, price CHECK |
| `20260524130000_stores_is_active.sql` | Store active flag |
| `20260524130100_feed_file_mappings.sql` | Filename→store map |
| `20260524150000_feed_import_runs.sql` | Run + item audit tables |
| `20260522220000_smart_match_rules.sql` (+ lifestyle fix) | Smart Match rules |
| `20260524160000` / `20260525181000` | Collections / homepage sections |
| `20260527200000_inventory_feed_sources.sql` | Sources + settings + `inventory_provider` |
| `20260527210000_inventory_ingestion_pipeline.sql` | Archives, failures, snapshots, schedules, run_kind |
| `20260528140000_inventory_site_pages.sql` | `site_pages.page_type` inventory |
| `20260528150000_inventory_stabilization.sql` | Source switch log |
| Debug/seed: `supabase/debug/vdp_pricing_source_raw_inspect.sql`, `supabase/supabase-seed-smart-match-rules.sql` | Not runtime |

### 2.9 Edge Functions

**None for inventory.** No `supabase/functions/` inventory importer. (Leads/DriveCentric Edge Function secrets are mentioned in `.env.local.example` separately.)

### 2.10 Environment variables (inventory-related)

From `.env.local.example`:

| Variable | Purpose |
|----------|---------|
| `IMPORT_SECRET` | Protect `/api/import-*` |
| `SFTP_HOST` / `PORT` / `USER` / `PASSWORD` / `PATH` | HomeNet DealerSend SFTP |
| `VAUTO_SFTP_HOST` / `PORT` / `USER` / `PASSWORD` / `PATH` | vAuto DO SFTP |
| `HOMENET_STORE_FILE_MAP` | Optional JSON filename token → store UUID |
| `HOMENET_DEFAULT_STORE_ID` | Documented deprecated; **unused in current import code** |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Public reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Import + admin writes |

**Not present:** `INVENTORY_FEED_URL`.

Facebook env vars are social feed only — not vehicle inventory.

### 2.11 Dependencies

- `ssh2-sftp-client` (+ `@types/ssh2-sftp-client`) — SFTP downloads in Node API routes.

---

## 3. HomeNet dependencies

### 3.1 Explicit HomeNet modules / routes

- `app/api/import-homenet/route.ts`
- `lib/import/homenetImport.ts`
- `lib/import/dealerSendParse.ts`, `dealerSendMap.ts`
- `lib/import/providers/homenet/**`
- `lib/homenetSourceRaw.ts`
- Admin copy referencing `/api/import-homenet` (`FeedsScreen`, dashboard)

### 3.2 Provider-specific field names / parsing

`dealerSendMap.HEADER_ALIASES` encodes DealerSend conventions, notably:

- Mileage: `Miles` (HomeNet) vs `Mileage` / `Odometer`
- Images: `ImageList` (comma/pipe/semicolon-separated absolute URLs)
- Prices: `InternetPrice` / `Internet_Price`, `SellingPrice`, `MSRP` / `OriginalMSRP` with 0→null fallback chain
- Store hints: `StoreID` / `DealerID` / `DealerName`
- Status heuristic: `/sold|delete|inactive|removed/i` → `inactive`
- `import_source`: `homenet_dealer_send`

### 3.3 Environment / URLs

- `SFTP_*` dedicated to HomeNet
- `HOMENET_STORE_FILE_MAP`, `HOMENET_DEFAULT_STORE_ID`
- No HomeNet HTTP URL constant; transport is SFTP only

### 3.4 Image assumptions

- Remote URLs only (`http://`, `https://`, `//`)
- First URL in ordered list → `primary_image_url`
- Full list → `image_urls` JSON array
- Migrations backfill from `source_raw.ImageList`

### 3.5 Matching / upsert coupling

- Map skip message: “Missing VIN and stock number”
- Upsert skip: “Missing VIN — row skipped (upsert requires store_id + vin)”
- Unique identity intended: `(store_id, vin, inventory_provider)`
- **Live DB still has legacy unique `(store_id, vin)`** — blocks true dual-provider coexistence until fixed

### 3.6 Display / pricing coupling to HomeNet raw

- `lib/homenetSourceRaw.ts` — incentive/doc-fee/price key hints used by VDP math box / pricing sources
- `lib/pricingSourceRegistry.ts` imports HomeNet raw helpers (also has generic invoice/discount key lists labeled “vAuto / HomeNet”)
- Historical SQL backfills assume HomeNet column names in `source_raw`

### 3.7 Defaults / fallbacks tied to HomeNet

- `DEFAULT_INVENTORY_PROVIDER = "homenet"`
- Seed / ensure logic creates HomeNet + vAuto sources per store; historically default active = HomeNet
- VDP null provider coerced to `"homenet"` when comparing active source

### 3.8 Scheduled jobs

- No HomeNet-specific cron in repo
- Ops expected to call `/api/import-homenet` externally

### 3.9 Admin settings

- Inventory sources UI treats HomeNet as a first-class provider
- Feed mapping UI is HomeNet-oriented (multi-file SFTP naming)
- Switch log columns: `homenet_count_at_switch`, `vauto_count_at_switch`

---

## 4. Current Supabase schema

### 4.1 Two layers: repo migrations vs live project

This audit records **both**:

1. **Repo migrations** — intended schema in `supabase/migrations/`.
2. **Live project** `faantdhcxnnuwuwkaxbq` — observed via Supabase MCP (2026-08-03).

They diverge materially.

### 4.2 Inventory-related tables (intended + live)

| Table | In repo migrations | On live project | Notes |
|-------|--------------------|-----------------|-------|
| `stores` | Yes | Yes (9 rows) | Live also has `dealer_group_id` (legacy) |
| `vehicles` | Yes | Yes (4460 rows) | Live has extra legacy cols; see below |
| `inventory_feed_sources` | Yes | Yes | Live missing `last_intake_at`, `last_error_message` |
| `dealership_inventory_settings` | Yes | Yes | |
| `feed_file_mappings` | Yes | Yes | |
| `feed_import_runs` | Yes | Yes | Live is **hybrid legacy + portal**; missing `inventory_provider`, `run_kind`, `store_id`, `inventory_feed_source_id` |
| `feed_import_run_items` | Yes | Yes | Live still requires legacy `import_run_id` + `action`; portal code inserts `run_id` |
| `raw_feed_archives` | Yes (`20260527210000`) | **Absent** | |
| `inventory_import_failures` | Yes | **Absent** | |
| `inventory_snapshots` | Yes | **Absent** | |
| `feed_import_schedules` | Yes | **Absent** | |
| `inventory_source_switch_log` | Yes | Yes | |
| `smart_match_rules` | Yes | Yes | Live has UNIQUE(`lifestyle`) |
| `collections` / `collection_rules` | Yes | Yes | |
| `dealer_groups` | Not in portal migrations | Yes (legacy, 0 rows) | |
| `feed_sources` / `feed_field_mappings` | Not in portal migrations | Yes (legacy, unused by current importer) | |
| `vehicle_images` | Not in portal migrations | Yes (legacy; portal uses `image_urls` jsonb) | |
| `vehicle_pricing_history` | Not in portal migrations | Yes (legacy) | |
| `smart_match_config` | Not in portal migrations | Yes (legacy; app primarily uses `smart_match_rules`) | |

### 4.3 `vehicles` columns

**From portal migrations (canonical app model):**  
`id`, `store_id`, `vin`, `stock_number`, `condition`, `year`, `make`, `model`, `trim`, `body_style`, `exterior_color`, `interior_color`, `mileage`, `internet_price`, `msrp`, `sale_price`, `primary_image_url`, `image_urls`, `dealer_name`, `image_count`, `has_images`, `data_quality_score`, `status`, `source_raw`, `import_source`, `import_key`, `imported_at`, `inventory_provider`, `created_at`, `updated_at`.

**Also present on live (legacy / useful for GEO parity):**  
`dealer_group_id`, `source_feed_id`, `days_in_stock`, `raw_data`, **`last_seen_at`**.

**Live data notes:**

- `inventory_provider` is **nullable** and **NULL on all 4460 rows**.
- Status values include `active` and `missing` (5 rows) — app status heuristic uses `inactive`, not `missing`.

### 4.4 Indexes (live `vehicles`)

| Index | Definition |
|-------|------------|
| `vehicles_pkey` | `(id)` |
| `vehicles_store_vin_unique` | **UNIQUE `(store_id, vin)`** — still present; blocks dual-provider same VIN |
| `vehicles_status_idx` | `(status)` |
| `vehicles_store_id_idx` | `(store_id)` |
| Merchandising indexes | `has_images`, `image_count`, `data_quality_score`, `created_at` (partial `status='active'`) |

**Missing on live (present in repo migration `20260527200000`):**  
`vehicles_store_vin_provider_uidx`, `vehicles_store_provider_status_idx`.

### 4.5 Foreign keys (live, inventory-relevant)

- `vehicles.store_id` → `stores`
- `vehicles.dealer_group_id` → `dealer_groups`
- `vehicles.source_feed_id` → `feed_sources` (legacy)
- `inventory_feed_sources.store_id` → `stores`
- `dealership_inventory_settings.store_id` → `stores`
- `dealership_inventory_settings.active_inventory_feed_source_id` → `inventory_feed_sources`
- `feed_file_mappings.store_id` → `stores`
- `leads.vehicle_id` → `vehicles`
- `vehicle_images` / `vehicle_pricing_history` → `vehicles` (legacy)

### 4.6 RLS (live)

| Table | Policies |
|-------|----------|
| `vehicles` | `public_read_active_vehicles` / `vehicles_public_read` SELECT where `status='active'`; `admin_all_vehicles` for app_role admin |
| `inventory_feed_sources` | public SELECT |
| `dealership_inventory_settings` | public SELECT |
| `feed_file_mappings` | public SELECT + authenticated ALL (legacy) |
| `feed_import_runs` | `admin_all_feed_import_runs` (app_role) — **no anon read**; service role needed for importer writes |
| `smart_match_rules` | public SELECT active; admin ALL |

No inventory Storage bucket. CMS media bucket is unrelated.

### 4.7 Triggers / DB functions

- Portal inventory migrations define **no** inventory triggers/functions.
- Live may still have legacy Lovable `set_updated_at` / role helpers (`has_role`) from older schema — not driven by current portal migrations.

### 4.8 Applied remote migrations vs repo files

Remote `list_migrations` shows inventory-related applied names such as `inventory_feed_sources`, `inventory_feed_sources_table_hotfix`, `inventory_site_pages`, `inventory_stabilization`, plus older vehicle image/merchandising migrations.  
**Not applied** (among others): `inventory_ingestion_pipeline` (`20260527210000`) — explains missing archive/failure/snapshot/schedule tables and missing run_kind columns.

---

## 5. Current portal features using inventory

### 5.1 User-facing

| Feature | Route / surface | Dependency |
|---------|-----------------|------------|
| Homepage vehicle discovery | `/` | `fetchPortalVehicles`, Smart Match category counts, guided discovery |
| Inventory SRP | `/inventory` | Paginated/filtered `vehicles`, Smart Match modes |
| Vehicle detail (VDP) | `/inventory/[id]` | Single vehicle + similar + pricing/math box/CTAs/leads |
| Inventory landing pages | `/[slug]` when `page_type=inventory` | Same SRP client + preset filters |
| CMS inventory collections | CMS pages with `inventory_collection` | `fetchVehiclesForCollection` |
| Lead capture | Global lead modal | Optional `vehicleId` / label |
| Homepage search bridge | Heroes | Links to `/inventory?q=` (no direct DB) |

### 5.2 Admin-facing

| Feature | Route |
|---------|-------|
| Merchandising inventory table | `/admin/inventory` |
| Inventory sources / switch active provider | `/admin/inventory-sources` |
| Feed import runs | `/admin/feeds` |
| Feed file→store mapping | `/admin/feed-mapping` |
| Collections + rules | `/admin/collections` |
| Smart Match rules | `/admin/smart-match-rules` |
| Dashboard health (counts / feed status) | `/admin/dashboard` |
| Inventory site page editor | Site pages admin |

### 5.3 Business rules / matching

- Smart Match lifestyle rules against vehicle fields (body style, make, model/trim keywords, price, condition)
- Merchandising sort (`has_images`, `image_count`, `data_quality_score`)
- Pricing display / math box may read `source_raw` for incentives/doc fees
- Active-provider gating on all primary reads

---

## 6. Feed-agnostic functionality (can remain after HomeNet removal)

These layers operate on **normalized `vehicles` / `Vehicle` types** and should survive a vAuto-only (or vAuto-primary) cutover with little or no change:

- SRP / VDP / vehicle cards / list rows / image components
- Smart Match rules engine + admin UI (rules are not feed-specific)
- Collections + CMS `inventory_collection` rendering
- Inventory landing page presets
- Lead capture vehicle association
- `vehicleDetailPath`, navigation helpers, most portal text/CTA systems
- Merchandising quality scoring **if** import continues to populate the same columns
- Active-source registry pattern (`inventory_feed_sources` / settings / switch) — keep, but default/active provider becomes `vauto`
- Shared canonical model + upsert module **after** extending matching/reconcile behaviors

**Requires provider-neutral adaptation (not pure delete):**

- `pricingSourceRegistry` / `homenetSourceRaw` — replace HomeNet key hints with vAuto column names or a provider-agnostic raw reader
- Feed mapping admin — keep concept; retarget to vAuto filenames / dealership IDs
- Import run admin UI — keep; change trigger docs from HomeNet route to Edge Function / new endpoint
- `inventoryProviders` enum — may keep `homenet` temporarily for dual-run, then deprecate

---

## 7. Replacement requirements

Target pipeline (portal-owned; GEO-patterned, not GEO-shared):

```
vAuto CSV/TXT
  → DigitalOcean SFTP (VAUTO_SFTP_* or Edge Function secrets)
  → Auto Portal inventory-import Edge Function
  → Auto Portal Supabase inventory tables
  → Auto Portal server-side reads (existing lib/vehicles etc.)
  → Auto Portal UI
```

### 7.1 What must change

| Area | Change |
|------|--------|
| Runtime | Add **Supabase Edge Function** (or document interim Next.js `/api/import-vauto` full import if Edge is phase-2). User requirement prefers Edge Function. |
| Parser | Implement real `vautoMap.ts` from sample exports; enforce make/model; VIN-or-stock identity |
| Matching | VIN-first; **stock fallback** when VIN absent; update upsert key strategy accordingly |
| Upsert | Full refresh of attributes on match; set `imported_at` + **`last_seen_at`**; status `active` |
| Images | Replace ordered URL list each run; `primary_image_url = image_urls[0]`; keep remote URLs |
| Reconcile | Soft-deactivate (e.g. `status='inactive'` or `'missing'`) vehicles for store+provider not seen in current VIN set |
| Logging | Preserve/fix `feed_import_runs` + row-level `inventory_import_failures` (apply missing migrations first) |
| Testing | Add inline CSV/TXT test path (admin or secured API) before SFTP |
| Dealership mapping | Map vAuto file/dealer identifiers → `stores.id` (reuse `feed_file_mappings` pattern) |
| Env | Edge Function secrets for SFTP + service role; keep portal-only (no GEO DB) |
| Cutover | Backfill/fix `inventory_provider`; run dual inventory until vAuto counts healthy; switch `dealership_inventory_settings`; then remove HomeNet |
| UI reads | Prefer remaining on direct Supabase reads (current pattern). Optional `inventory-feed` Edge/API only if caching/CDN is required — **not present today** |

### 7.2 Gap vs proven behaviors (detail)

1. **Stock fallback** — today upsert hard-requires VIN.  
2. **Make/model required** — today optional.  
3. **Update payload too narrow** — existing rows do not refresh year/make/model/trim/mileage/status/`source_raw`/`imported_at`.  
4. **No `last_seen_at` writes** — column exists live; app ignores it.  
5. **No missing-VIN soft-deactivate** in importer.  
6. **No inline CSV test harness**.  
7. **No Edge Function**.  
8. **Schema drift** — apply/reconcile migrations before relying on archives/failures/run_kind.  
9. **Live unique `(store_id, vin)`** — must become provider-scoped (or vAuto-only after HomeNet purge) before dual rows.  
10. **NULL `inventory_provider` on all live vehicles** — must backfill before provider filters work.

### 7.3 Image policy

Portal already stores remote URLs and does not download inventory photos. **No reason found in-repo to change that** unless CDN hotlink / SSL / retention constraints appear from vAuto URL behavior (unverified — see §10).

---

## 8. HomeNet removal plan

### 8.1 Files to delete (after cutover + dual-run complete)

- `app/api/import-homenet/route.ts`
- `lib/import/homenetImport.ts`
- `lib/import/dealerSendMap.ts` (if not still needed as shared delimiter util — prefer moving shared parse to neutral module first)
- `lib/import/providers/homenet/**`
- `lib/homenetSourceRaw.ts` (after pricing raw reader is provider-neutral)
- HomeNet-only admin copy / curl instructions once Edge Function docs replace them

**Possibly keep longer:** `dealerSendParse.ts` if vAuto continues to reuse delimiter parsing (rename to neutral).

### 8.2 Files to modify

- `lib/import/providers/vauto/vautoMap.ts` — real mapping
- `lib/import/vautoIntake.ts` → full import + reconcile (or new `vautoImport.ts`)
- `lib/import/vehicleUpsert.ts` — stock fallback, full field refresh, timestamps, soft-deactivate hook
- `lib/import/canonicalVehicle.ts` — key rules (VIN or stock)
- `lib/import/sftpInventory.ts` — Edge vs Node packaging; eventually HomeNet env readers removable
- `lib/import/storeMapping.ts` — vAuto dealership identifiers; rename HomeNet env map
- `lib/inventoryProviders.ts` — default → `vauto`; later drop `homenet`
- `lib/inventoryActiveSource.ts` / `inventorySourceSwitch.ts` — defaults, switch log column naming
- `lib/pricingSourceRegistry.ts` — remove HomeNet-only imports
- Admin: `FeedsScreen`, `InventoryFeedSourcesScreen`, `FeedImportRunsPanel`, dashboard strings
- `.env.local.example` — remove `SFTP_*` / `HOMENET_*`; document Edge secrets
- `docs/inventory-ingestion-architecture.md` — rewrite for vAuto-primary Edge pipeline
- `CLAUDE.md` — update inventory section
- New: `supabase/functions/inventory-import/**` (or agreed name)
- New migrations: apply pipeline tables; fix unique indexes; backfill `inventory_provider`; optionally formalize `last_seen_at` usage

### 8.3 Environment variables to remove (post-cutover)

- `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD`, `SFTP_PATH`
- `HOMENET_STORE_FILE_MAP`
- `HOMENET_DEFAULT_STORE_ID`

**Keep / relocate to Edge secrets:** `VAUTO_SFTP_*`, `IMPORT_SECRET` (or Edge JWT / cron secret), `SUPABASE_SERVICE_ROLE_KEY`.

### 8.4 DB columns / tables to deprecate

| Item | Action |
|------|--------|
| `inventory_provider = 'homenet'` rows | Soft-deactivate then delete after verification window |
| `inventory_feed_sources` HomeNet rows | Disable then delete |
| Switch log `homenet_count_at_switch` | Keep historically or rename in a later cleanup |
| Legacy `feed_sources` / `feed_field_mappings` / `vehicle_images` / `vehicle_pricing_history` / `raw_data` | Confirm unused by app; deprecate separately (predate portal importer) |
| `import_source = 'homenet_dealer_send'` | Stop writing; historical rows OK |
| HomeNet-shaped keys inside `source_raw` | Naturally replaced by vAuto raw on re-import |

### 8.5 Temporary compatibility layers

1. Keep dual provider enum + active-source switch during parallel import.  
2. Backfill `inventory_provider='homenet'` on existing rows so current UI filters work during transition.  
3. Fix unique index to `(store_id, vin, inventory_provider)` **before** inserting vAuto duplicates of same VIN.  
4. Treat null provider as HomeNet only during backfill window (already partially done on VDP).  
5. Optionally keep Next.js `/api/import-vauto` as a thin trigger that invokes the Edge Function until cron is wired to Edge directly.  
6. Keep HomeNet importer until every store’s vAuto `last_vehicle_count` and spot-check VDPs pass.

---

## 9. Migration phases

### Phase 0 — Preconditions (no product cutover)

1. Document GEO vs Portal separation for stakeholders (already decided).  
2. Obtain sample vAuto CSV/TXT per dealership from DO SFTP.  
3. Inventory live schema drift checklist (§4 / §10) and decide repair migrations.  
4. Rollback plan owner + monitoring (SRP counts, import run success, VDP 404 rate).

### Phase 1 — Database setup

1. Apply missing portal migrations (`inventory_ingestion_pipeline` and any hotfix equivalents).  
2. Align `feed_import_runs` / `feed_import_run_items` with app writers (`inventory_provider`, `run_kind`, `run_id` vs legacy `import_run_id`).  
3. Backfill `vehicles.inventory_provider = 'homenet'` where null.  
4. Drop `vehicles_store_vin_unique`; create `vehicles_store_vin_provider_uidx` (and stock-based unique strategy if required).  
5. Ensure `last_seen_at` is documented as first-class; add NOT NULL/default only if product agrees.  
6. Seed/repair `inventory_feed_sources` + settings (default active HomeNet until cutover).  
7. Verify RLS: anon SELECT active vehicles; service role for imports.

### Phase 2 — Edge Function setup

1. Create Auto Portal–owned Edge Function `inventory-import` (name TBD) with SFTP secrets.  
2. Auth model: shared secret / cron header (mirror `IMPORT_SECRET`).  
3. Implement stages: download → archive metadata → parse → map → upsert → reconcile → log.  
4. Optional: Next.js route becomes webhook wrapper for local/dev parity.  
5. Wire scheduler (Supabase cron / external) — `feed_import_schedules` can store metadata once applied.

### Phase 3 — Dealership mapping

1. Map each vAuto feed file / dealer code → `stores.id` via `feed_file_mappings` (and/or new provider-specific map table if GEO pattern differs).  
2. Admin UI verification on `/admin/feed-mapping`.  
3. Reject multi-store mixed files (same guard as HomeNet).

### Phase 4 — Parser integration

1. Build `vautoMap` aliases from real headers.  
2. Enforce: VIN **or** stock; make; model.  
3. Image list ordering; prices; condition normalization.  
4. Write `source_raw` as full row; `import_source='vauto'`; `inventory_provider='vauto'`.

### Phase 5 — Import testing

1. **Inline CSV test** endpoint/admin tool (no SFTP).  
2. SFTP intake-only dry run (already partially exists).  
3. Full upsert against one store in staging/project branch.  
4. Validate counts, images, prices, Soft-deactivate behavior, run logs, row errors.  
5. Compare HomeNet vs vAuto inventory for same store (admin switch guards already warn on mismatch).

### Phase 6 — UI cutover

1. For each store: import vAuto until `last_vehicle_count` healthy.  
2. Switch `dealership_inventory_settings` to vAuto (acknowledge mismatch if needed).  
3. Smoke: `/`, `/inventory`, VDP, CMS collection, Smart Match, leads with vehicle.  
4. Leave HomeNet rows inactive/hidden (provider filter), do not delete yet.

### Phase 7 — HomeNet removal

1. Disable HomeNet sources; stop external HomeNet cron.  
2. Delete HomeNet code paths / env vars (§8).  
3. Optionally purge `inventory_provider='homenet'` rows after retention window.  
4. Update docs and admin copy.

### Phase 8 — Lint / build testing

1. `npm run lint`  
2. `npm run build`  
3. Manual checklist: import secret unauthorized; inline CSV; one SFTP import; SRP/VDP; admin feeds/sources.

### Phase 9 — Production validation

1. Per-store active vehicle counts vs feed row counts.  
2. Spot-check VINs across brands (new/used, image-heavy, price edge cases).  
3. Confirm sold/missing vehicles disappear within one reconcile cycle.  
4. Confirm import logs and failure rows visible in admin.  
5. Confirm no GEO database coupling (Portal project only).

### Phase 10 — Rollback steps

1. **Immediate UI rollback:** switch `dealership_inventory_settings` back to HomeNet source (requires HomeNet rows still present and provider-tagged).  
2. **Importer rollback:** disable Edge Function cron; re-enable `/api/import-homenet` if not yet deleted.  
3. **Data rollback:** do not drop HomeNet rows until Phase 7 complete; use status/provider filters rather than DELETE.  
4. **Schema rollback:** avoid irreversible drops until dual-run ends; keep migrations forward-only with feature flags in app where possible.

---

## 10. Risks and unresolved questions

### 10.1 Cannot be determined from this repository alone

1. **GEO implementation details** — matching, Edge Function code, exact vAuto column layout, cron, and logging schema live in GEO, not this repo. Portal must copy *patterns*, not code/DB.  
2. **Actual vAuto export schema** for Cavender rooftops (headers, delimiters, image URL format, sold indicators).  
3. **SFTP topology** — whether Portal and GEO share one DO user/path or separate folders; file naming per dealership; retention/delete-after-read.  
4. **Production scheduler** — who currently hits `/api/import-homenet` (Vercel cron elsewhere, GitHub Action, manual, third party)? Not configured in-repo.  
5. **Whether live empty `last_vehicle_count` / null providers already break production SRP** for stores with active=vAuto — needs product/ops confirmation of which environment users see.  
6. **Image hotlinking policy** from vAuto CDN (expiry, referrer blocking).  
7. **Whether `status='missing'` (5 live rows)** was produced by an old Lovable/GEO-like job vs manual SQL.  
8. **Service-role vs legacy `app_role` admin** interaction in production auth — portal CMS uses shared secret cookie; live RLS still references `has_role(...,'admin')`.  
9. **Multi-project Supabase** — confirm `faantdhcxnnuwuwkaxbq` is the only Auto Portal DB (staging vs prod).  
10. **Legal/ops approval** to stop HomeNet DealerSend after cutover.

### 10.2 In-repo / live risks (known)

1. **Schema drift:** app writes columns/tables that do not exist live → import run logging / archives fail silently (`console.warn`).  
2. **All vehicles `inventory_provider` NULL** + provider filters → list queries can return **zero** rows while VDP-by-id may still work for HomeNet-default stores.  
3. **Four stores already active=vAuto** with zero vAuto vehicles and null providers — high risk of empty inventory UX.  
4. **Legacy UNIQUE `(store_id, vin)`** prevents true side-by-side HomeNet+vAuto rows for the same VIN.  
5. **Partial upsert updates** allow stale make/model/status after first insert.  
6. **No reconcile** → sold cars can linger as `active`.  
7. **HomeNet `source_raw` pricing** may stop working after vAuto cutover until pricing registry is updated.  
8. **Edge Function SFTP** — Deno/Edge network + SSH libraries may differ from Node `ssh2-sftp-client`; feasibility must be validated (possible need for Node serverless instead).  
9. **Orphaned homepage collection pipeline** (`lib/homepage.ts`) vs current portal home — avoid assuming wrong entrypoint during cutover tests.

### 10.3 Explicit non-findings

- `INVENTORY_FEED_URL` — **does not exist** in this codebase.  
- Inventory Edge Functions — **do not exist**.  
- In-repo inventory cron — **does not exist** (schedule table migration unapplied).  
- GEO shared database usage — **none** in this repo (boundary docs only).

---

## Appendix A — Live store active-source snapshot (2026-08-03)

| Store | Active provider (settings) | Notes |
|-------|----------------------------|-------|
| Cavender Buick GMC North | vauto | No vAuto vehicles; all DB vehicles untagged |
| Cavender Buick GMC West | vauto | same |
| Cavender Cadillac | vauto | same |
| Cavender Chevrolet | vauto | same |
| Cavender Grande Ford | homenet | |
| Cavender Nissan of Rockwall | homenet | |
| Cavender Nissan of San Marcos | homenet | |
| Jaguar San Antonio | homenet | |
| Land Rover San Antonio | homenet | |

All `last_vehicle_count` values observed as `0` despite 4460 vehicle rows (count sync never populated / provider null).

---

## Appendix B — Recommended next artifact (not created)

When implementation begins, produce a follow-up design doc:

`docs/auto-portal-vauto-pipeline-design.md`

covering Edge Function API contract, exact match/reconcile SQL, vAuto column map from a real sample file, and a per-store cutover checklist. Do not start coding until sample feeds and schema-repair migrations are agreed.
