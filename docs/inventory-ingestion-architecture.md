# Inventory ingestion architecture

Provider-agnostic inventory ingestion for Cavender Auto Group. HomeNet and vAuto are **separate sources**; the platform never merges them for display.

**UI cutover runbook:** [`docs/auto-portal-vauto-ui-cutover.md`](./auto-portal-vauto-ui-cutover.md)  
**Schema (applied live):** [`docs/auto-portal-vauto-schema-implementation.md`](./auto-portal-vauto-schema-implementation.md)  
**Importer:** [`docs/auto-portal-vauto-importer-implementation.md`](./auto-portal-vauto-importer-implementation.md)  
**Audit snapshot:** [`docs/auto-portal-inventory-audit.md`](./auto-portal-inventory-audit.md)

## Principles

1. **One active source per dealership (store)** — controlled in Admin → Inventory sources.
2. **Separate physical feeds** — HomeNet DealerSend SFTP (rollback) vs dedicated vAuto DigitalOcean SFTP (`vauto` user).
3. **Separate rows in `vehicles`** — keyed by `(store_id, vin, inventory_provider)`.
4. **All normalization inside our platform** — parsing, dedupe, images, analytics run after intake.
5. **Dealership isolation** — public reads never cross stores or mix providers.
6. **Null-provider compatibility** — untagged `inventory_provider IS NULL` rows are treated as legacy HomeNet (defense in depth; live backfill set existing rows to `homenet`).

## Inventory source enum

| Code | Label | Intake | Role during cutover |
|------|--------|--------|---------------------|
| `vauto` | vAuto | `VAUTO_SFTP_*` → `/api/import-vauto` | Preferred / future default |
| `homenet` | HomeNet | `SFTP_*` → `/api/import-homenet` | Temporary rollback |

Types: `lib/inventoryProviders.ts`  
- `DEFAULT_INVENTORY_PROVIDER = "vauto"` (future config preference)  
- `FALLBACK_ACTIVE_INVENTORY_PROVIDER = "homenet"` (read path when settings unset; never silently activate empty vAuto)

DB check constraints on `vehicles.inventory_provider` and `inventory_feed_sources.provider`.

## Table map

| Concept | Table | Notes |
|---------|--------|--------|
| Source registry (per store) | `inventory_feed_sources` | Also referred to as “inventory sources” in product language |
| Active source pointer | `dealership_inventory_settings` | `active_inventory_feed_source_id` |
| Canonical vehicles | `vehicles` | `inventory_provider` NOT NULL after live backfill; reads still treat null as HomeNet |
| Switch audit | `inventory_source_switch_log` | Per-store cutover / rollback events |
| Run history | `feed_import_runs` + `feed_import_run_items` | `run_kind`: `import` \| `intake` \| `reconcile` |
| Raw file archive refs | `raw_feed_archives` | SFTP path / future Supabase Storage |
| Structured failures | `inventory_import_failures` | Row/file/run scope |
| Snapshots (future) | `inventory_snapshots` | Counts / diff baseline |
| Schedules (future) | `feed_import_schedules` | Cron metadata |

## Parser modules (provider-isolated)

| Provider | Parse | Map → canonical | Upsert |
|----------|--------|-----------------|--------|
| HomeNet | `lib/import/providers/homenet` (`dealerSendParse`) | `mapDealerSendRowToCanonical` | `lib/import/vehicleUpsert.ts` |
| vAuto | `lib/import/providers/vauto/vautoParse.ts` | `vautoMap.ts` | `lib/import/vehicleUpsert.ts` via `/api/import-vauto` |

Shared model: `lib/import/canonicalVehicle.ts` — portal/inventory code never imports provider parsers. Do not filter public inventory from raw feed payloads.

## Pipeline stages

```
SFTP intake → raw_feed_archives → inspect/format detect → normalize/map → upsert vehicles
                                      ↓
                            inventory_import_failures (on error)
                                      ↓
                            feed_import_runs (audit)
```

| Stage | HomeNet today | vAuto today | Notes |
|-------|---------------|-------------|--------|
| Intake | SFTP download | SFTP download (`VAUTO_SFTP_*`) | Portal-owned; not GEO |
| Inspect | CSV/TXT parse | Header preview + format detect | |
| Normalize | `dealerSendMap` | `vautoMap` → canonical | Shared `vehicleUpsert` |
| Dedupe | `(store_id, vin, inventory_provider)` | Same | Provider-scoped indexes **applied** live |
| Upsert | Active | Active (`inventory_provider='vauto'`) | Ops: secrets + mappings + first import |
| Reconcile | Partial | Soft-deactivate missing VINs | Scoped to store + provider |
| Images | Remote URLs → `primary_image_url` / `image_urls` | Same display fields | UI is feed-agnostic |
| Display pricing | Normalized columns + `lib/feedSourceRaw.ts` | Same | No HomeNet-only UI assumptions |

## Public read path

Only the **active** provider per store is shown:

- `getActiveInventoryProvider(storeId)`
- `applyInventoryProviderFilter(query, provider)` — HomeNet includes `NULL` provider rows
- `getActiveInventoryProviderFilterSpec()` / `applyActiveInventoryProviderFilterSpec`
- VDP by id (`fetchVehicleById`) enforces store + active provider (null → HomeNet); does not bypass scope

Switching source in admin does **not** delete inactive provider rows. There is **no** mass provider switch.

## Admin cutover controls

Admin → Inventory sources (`/admin/inventory-sources`):

- Shows per-provider last import, last success, last file, errors, vehicle counts, active provider
- Warns on zero vAuto count and material HomeNet vs vAuto mismatch
- Requires explicit confirmation for HomeNet → vAuto
- Allows switch back to HomeNet for rollback
- Blocks activating a provider with zero vehicles (live count includes null→HomeNet)

## vAuto DigitalOcean server

- Ubuntu + OpenSSH/SFTP
- User: `vauto`
- Path: set `VAUTO_SFTP_PATH` (ops confirms; example may differ)
- Env: `VAUTO_SFTP_HOST`, `VAUTO_SFTP_PORT`, `VAUTO_SFTP_USER`, `VAUTO_SFTP_PASSWORD`, `VAUTO_SFTP_PATH`

Endpoint: `GET /api/import-vauto?secret=…` (POST inline CSV for tests) — portal-owned upsert/reconcile. Remaining work is ops cutover (secrets, mappings, per-store switch), not schema.

## HomeNet deprecation (safe stage)

Retained until every dealership is validated on vAuto:

- `/api/import-homenet` and `lib/import/providers/homenet/**`
- `SFTP_*`, `HOMENET_STORE_FILE_MAP`, `HOMENET_DEFAULT_STORE_ID` (marked deprecated in `.env.local.example`)
- `lib/homenetSourceRaw.ts` re-exports provider-agnostic `lib/feedSourceRaw.ts`

Do **not** delete historical HomeNet DB rows. Full code/env removal is a later phase after cutover checklists pass.

## Environment variables

See `.env.local.example` for `VAUTO_SFTP_*` (primary) and deprecated `SFTP_*` / `HOMENET_*` (rollback).
