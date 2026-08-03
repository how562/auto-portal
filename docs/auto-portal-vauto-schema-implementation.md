# Auto Portal vAuto Schema Implementation

**Date:** 2026-08-03  
**Scope:** Supabase schema / migrations only (no UI, importer, or env changes).  
**Project:** `faantdhcxnnuwuwkaxbq` (Auto Portal — separate from GEO)  
**Inputs:** `docs/auto-portal-inventory-audit.md`, repo migrations, live schema inspection, app writers in `lib/feedImportRunLog.ts` / `lib/rawFeedArchive.ts`.

---

## Summary

Forward-only migrations were added and applied so Auto Portal can:

- keep HomeNet vehicle rows during a short dual-provider transition
- accept vAuto rows under `inventory_provider = 'vauto'`
- use provider-aware VIN uniqueness (and stock uniqueness when VIN is absent)
- expose `last_seen_at`, `imported_at`, `import_source`, and generated `is_active`
- align import-run / row-error logging tables with current application writers
- retain legacy Lovable tables without deleting them

Smoke test confirmed portal-shaped inserts into `feed_import_runs`, `feed_import_run_items` (compat trigger fills legacy `import_run_id` / `action`), and `inventory_import_failures`.

---

## Schema before (live, pre-change)

Key problems from the audit:

| Area | Before |
|------|--------|
| `vehicles.inventory_provider` | Nullable; **all 4460 rows NULL** |
| Unique identity | Legacy **UNIQUE `(store_id, vin)`** — blocked dual-provider same VIN |
| Stock-only rows | `vin` NOT NULL; no stock unique strategy |
| `last_seen_at` | Column existed (legacy) but unused / not in portal migration story |
| `is_active` on vehicles | Did not exist (portal uses `status`) |
| Pipeline tables | `raw_feed_archives`, `inventory_import_failures`, `inventory_snapshots`, `feed_import_schedules` **missing** |
| `feed_import_runs` | Missing portal columns (`inventory_provider`, `run_kind`, `store_id`, `inventory_feed_source_id`, `trigger_source`); status CHECK only `pending\|success\|failed` |
| `feed_import_run_items` | Legacy `import_run_id` + `action` NOT NULL; portal writes `run_id` + `status` → inserts failed |
| `inventory_feed_sources` | Missing `last_intake_at` / `last_error_message`; counts stuck at 0 |
| `vehicle_images` | No public read policy (portal primarily uses `image_urls`) |

---

## Schema after

### `vehicles`

- `inventory_provider` **NOT NULL**, default `'homenet'`, CHECK (`homenet`\|`vauto`)
- All existing rows backfilled to **`homenet`** (HomeNet preserved)
- `import_source` backfilled to `homenet_dealer_send` where empty for HomeNet rows
- `last_seen_at` / `imported_at` backfilled from available timestamps where null
- `vin` nullable (enables future stock-only upserts)
- Generated **`is_active boolean`** = `(status = 'active')` (read-only; write `status`)
- Legacy unique index **`vehicles_store_vin_unique` removed**
- New unique indexes:
  - `vehicles_store_vin_provider_uidx` on `(store_id, vin, inventory_provider)` where VIN present
  - `vehicles_store_stock_provider_uidx` on `(store_id, stock_number, inventory_provider)` where VIN absent and stock present

### Import logging / pipeline

- `feed_import_runs`: portal columns + `trigger_source`; status CHECK expanded to `pending|running|success|partial|failed`
- `feed_import_run_items`: portal columns; `import_run_id` / `action` nullable; BEFORE INSERT/UPDATE trigger syncs legacy ↔ portal fields
- Created: `raw_feed_archives`, `inventory_import_failures` (+ `stock_number`), `inventory_snapshots`, `feed_import_schedules`
- `inventory_feed_sources`: `last_intake_at`, `last_error_message`; HomeNet `last_vehicle_count` refreshed from backfilled rows
- `feed_file_mappings`: optional `inventory_provider`; unique `(file_pattern, store_id, coalesce(provider,''))`

### RLS

- Public/authenticated SELECT active vehicles only
- Public SELECT `vehicle_images` only when parent vehicle is `active`
- Public SELECT on source registry + feed file mappings
- Removed broad authenticated write on `feed_file_mappings`
- Import audit / pipeline tables: RLS on, **no anon public read** (service role / existing admin role policies)

### Live data after backfill

| Provider | Status | Count |
|----------|--------|------:|
| homenet | active | 4455 |
| homenet | missing | 5 |

Legacy unique `(store_id, vin)` index: **gone**. Provider-aware indexes: **present**.

---

## Migration order (repo)

Apply in timestamp order:

1. `supabase/migrations/20260803170000_vauto_vehicles_provider_identity.sql`  
   Provider backfill, identity indexes, timestamps, `is_active`.
2. `supabase/migrations/20260803170100_vauto_import_logging_pipeline.sql`  
   Import runs/items compat, pipeline tables, feed mapping provider, status CHECK.
3. `supabase/migrations/20260803170200_vauto_inventory_rls_and_legacy_notes.sql`  
   RLS + legacy table comments (no drops).
4. `supabase/migrations/20260803170300_vauto_feed_import_runs_status_compat.sql`  
   Idempotent status CHECK + `search_path` harden (safe if already applied inside #2).

### Live project application note

Because MCP `apply_migration` was used in chunks on production, remote history names are:

- `vauto_vehicles_provider_identity`
- `vauto_import_logging_pipeline` (runs columns)
- `vauto_import_run_items_compat`
- `vauto_ingestion_pipeline_tables`
- `vauto_inventory_rls_and_legacy_notes`
- `vauto_feed_import_runs_status_check`
- `vauto_compat_function_search_path`

**Repo files above remain the canonical source** for other environments / fresh installs.

---

## Indexes added or changed

| Index | Purpose |
|-------|---------|
| ~~`vehicles_store_vin_unique`~~ | **Dropped** |
| `vehicles_store_vin_provider_uidx` | VIN-first upsert key per provider |
| `vehicles_store_stock_provider_uidx` | Stock fallback when VIN absent |
| `vehicles_store_provider_status_idx` | Active-source filtering |
| `vehicles_store_provider_vin_idx` | VIN lookup |
| `vehicles_store_provider_stock_idx` | Stock lookup |
| `vehicles_active_provider_store_idx` | Active inventory queries |
| `vehicles_last_seen_at_idx` | Reconcile / soft-deactivate scans |
| `vehicles_import_key_uidx` | Import key lookup (partial) |
| `vehicle_images_vehicle_sort_idx` | Image ordering `(vehicle_id, sort_order)` |
| `feed_import_runs_*` | Run history by provider/status/kind/started_at |
| `feed_import_run_items_run_id_idx` | Item → run |
| `raw_feed_archives_*` | Archive history + remote path |
| `inventory_import_failures_*` | Row-level error history |
| `inventory_snapshots_store_provider_idx` | Snapshot history |
| `feed_file_mappings_pattern_store_provider_uniq` | Provider-aware file maps |
| `feed_file_mappings_provider_active_idx` | Active mappings by provider |

---

## RLS changes

| Table | Change |
|-------|--------|
| `vehicles` | Recreated public SELECT `status = 'active'` |
| `vehicle_images` | Added public SELECT when parent vehicle active |
| `inventory_feed_sources` / `dealership_inventory_settings` | Public SELECT retained/recreated |
| `feed_file_mappings` | Public SELECT retained; **dropped** authenticated write-all policy |
| `feed_import_runs` / items / archives / failures / snapshots / schedules / switch log | RLS enabled; no public read policies |

Import writes remain service-role (bypass RLS). Admin UI already uses `getSupabaseAdmin()`.

Advisor note: tables with RLS and **no policies** (intentional deny-by-default for anon) include `raw_feed_archives`, `inventory_import_failures`, `inventory_snapshots`, `feed_import_schedules`, `inventory_source_switch_log`. That is desired for import audit data. See [RLS enabled no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

---

## Compatibility decisions

1. **`status` vs `is_active`:** Portal lifecycle stays on `vehicles.status`. Added generated `is_active` for GEO-style reads without dual writes. Importers must continue writing `status`.
2. **HomeNet rows retained:** Backfilled to `inventory_provider='homenet'`; nothing deleted.
3. **Legacy Lovable columns retained** on `feed_import_runs` / items (`feed_source_id`, `total_records`, `import_run_id`, `action`, etc.).
4. **Compat trigger** maps portal file statuses → legacy `action` values and mirrors `run_id` ↔ `import_run_id`.
5. **`feed_file_mappings.inventory_provider` NULL** means “any provider” so existing HomeNet mappings keep working without app changes.
6. **Legacy tables not dropped:** `vehicle_images`, `vehicle_pricing_history`, `feed_sources`, `feed_field_mappings`, `dealer_groups`, `smart_match_config` — commented as LEGACY only.
7. **No importer/UI changes in this schema task** — schema was applied first; importer track later shipped `last_seen_at`, stock-fallback matching, and soft-deactivate (see importer doc).

---

## Rollback considerations

These migrations are **forward-only** and deliberately non-destructive to inventory rows.

| Goal | How |
|------|-----|
| UI rollback to HomeNet | Keep `inventory_provider='homenet'` rows; set `dealership_inventory_settings` active source back to HomeNet feed source |
| Stop using vAuto rows | Soft-deactivate or leave inactive; do not require schema rollback |
| Undo provider unique | Would require restoring `vehicles_store_vin_unique` **only after** deleting/merging any dual-provider VIN pairs — do not do this during transition |
| Remove generated `is_active` | `ALTER TABLE vehicles DROP COLUMN is_active` (safe; derived only) |
| Compat trigger | Can `DROP TRIGGER` if portal writers are updated to fill legacy columns themselves |

**Do not** drop HomeNet vehicle rows until cutover validation is complete.

---

## Generated types

- `supabase/database.types.ts` — regenerated from live project after migrations  
- Not wired into `tsconfig` by default (app uses hand-written `lib/types.ts`). Import explicitly if desired.

---

## Validation performed

1. Applied migrations to live Auto Portal Supabase project  
2. Verified provider backfill counts (4455 active homenet)  
3. Verified legacy VIN unique index removed; provider indexes present  
4. Verified pipeline tables exist  
5. Smoke insert: run + item + row failure (compat trigger set `action='updated'`, synced `import_run_id`); cleaned up  
6. Security advisors reviewed (inventory audit tables correctly policy-less for anon; function `search_path` hardened for compat trigger)  
7. No React/importer/env files modified

---

## Unresolved production-schema / ops risks

1. **Four stores still have active source = vAuto** (Buick North/West, Cadillac, Chevrolet) while inventory may still be HomeNet-only until vAuto import succeeds. Provider filtering shows **empty inventory** for those stores until ops switch active source back to HomeNet or import vAuto rows.  
   - Schema layer did **not** auto-change `dealership_inventory_settings` (product/ops decision). Do not mass-switch.
2. **Jaguar San Antonio** HomeNet `last_vehicle_count = 0` after refresh — may be genuinely empty or unassigned `store_id` on vehicles (investigate before cutover).
3. **Importer track is complete** (map/upsert/`last_seen_at`/stock fallback/soft-deactivate via `/api/import-vauto`). Remaining work is **ops cutover**: SFTP secrets, feed mappings, per-store import validation, then explicit admin switch (UI cutover runbook).
4. Dual-provider coexistence is index-safe; **vAuto vehicle rows appear only after successful import** (not auto-created by schema).
5. Remote migration history chunk names ≠ single repo filenames (documented above). Prefer applying the four repo files on any new environment.
6. Unrelated advisor warnings remain (leads insert policy, cms-media listing, other functions’ `search_path`) — out of inventory scope.

---

## Legacy tables inventory (retained)

| Table | Notes |
|-------|-------|
| `vehicle_images` | Prefer `vehicles.image_urls`; public read added for active parents |
| `vehicle_pricing_history` | Unused by current importer |
| `feed_sources` / `feed_field_mappings` | Lovable-era; portal uses `inventory_feed_sources` + `feed_file_mappings` |
| `dealer_groups` | Portal identity is `stores` |
| `smart_match_config` | Portal uses `smart_match_rules` |

---

## Next schema-adjacent work (out of scope here)

- Ops: SFTP secrets + feed mappings; reset active source to HomeNet for vAuto-empty stores **or** import vAuto then cut over per store (see UI cutover runbook)  
- Importer + UI tracks: **done** (no further schema work required for cutover)  
- Optional: wire `Database` types into Supabase clients
