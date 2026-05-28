# Inventory ingestion architecture

Provider-agnostic inventory ingestion for Cavender Auto Group. HomeNet and vAuto are **separate sources**; the platform never merges them for display.

## Principles

1. **One active source per dealership (store)** — controlled in Admin → Inventory sources.
2. **Separate physical feeds** — HomeNet DealerSend SFTP vs dedicated vAuto DigitalOcean SFTP (`vauto` user, `/feeds/vauto/incoming`).
3. **Separate rows in `vehicles`** — keyed by `(store_id, vin, inventory_provider)`.
4. **All normalization inside our platform** — parsing, dedupe, images, analytics run after intake.

## Inventory source enum

| Code | Label | Intake |
|------|--------|--------|
| `homenet` | HomeNet | `SFTP_*` → `/api/import-homenet` |
| `vauto` | vAuto | `VAUTO_SFTP_*` → `/api/import-vauto` (intake phase 1) |

Types: `lib/inventoryProviders.ts`  
DB check constraints on `vehicles.inventory_provider` and `inventory_feed_sources.provider`.

## Table map

| Concept | Table | Notes |
|---------|--------|--------|
| Source registry (per store) | `inventory_feed_sources` | Also referred to as “inventory sources” in product language |
| Active source pointer | `dealership_inventory_settings` | `active_inventory_feed_source_id` |
| Canonical vehicles | `vehicles` | `inventory_provider` column |
| Run history | `feed_import_runs` + `feed_import_run_items` | `run_kind`: `import` \| `intake` \| `reconcile` |
| Raw file archive refs | `raw_feed_archives` | SFTP path / future Supabase Storage |
| Structured failures | `inventory_import_failures` | Row/file/run scope |
| Snapshots (future) | `inventory_snapshots` | Counts / diff baseline |
| Schedules (future) | `feed_import_schedules` | Cron metadata |

## Parser modules (provider-isolated)

| Provider | Parse | Map → canonical | Upsert |
|----------|--------|-----------------|--------|
| HomeNet | `lib/import/providers/homenet` (`dealerSendParse`) | `mapDealerSendRowToCanonical` | `lib/import/vehicleUpsert.ts` |
| vAuto | `lib/import/providers/vauto/vautoParse.ts` | `vautoMap.ts` (aliases TBD) | same upsert when import enabled |

Shared model: `lib/import/canonicalVehicle.ts` — portal/inventory code never imports provider parsers.

## Pipeline stages

```
SFTP intake → raw_feed_archives → inspect/format detect → normalize/map → upsert vehicles
                                      ↓
                            inventory_import_failures (on error)
                                      ↓
                            feed_import_runs (audit)
```

| Stage | HomeNet today | vAuto today | Future |
|-------|---------------|-------------|--------|
| Intake | SFTP download | SFTP download (`runVautoInventoryIntake`) | Same |
| Inspect | CSV/TXT parse | Header preview + format detect | XML/JSON support |
| Normalize | `dealerSendMap` | TBD after sample files | Shared normalizer |
| Dedupe | `(store_id, vin, inventory_provider)` | Same | Cross-run VIN rules |
| Upsert | Active when source = homenet | After parser | Gated by active source |
| Reconcile | Partial | — | `missing` / sold from feed |
| Images | From feed URLs | TBD | Dedicated sync job |
| Snapshots | — | — | `inventory_snapshots` |

## Public read path

Only the **active** provider per store is shown:

- `getActiveInventoryProvider(storeId)`
- `getActiveInventoryForDealership(storeId)`
- All portal/SRP/VDP/collection queries filter `inventory_provider`

Switching source in admin does **not** delete inactive provider rows.

## vAuto DigitalOcean server

- Ubuntu + OpenSSH/SFTP
- User: `vauto`
- Path: `/vauto` (set `VAUTO_SFTP_PATH=/vauto` in env; example default in `.env.local.example` may differ)
- Env: `VAUTO_SFTP_HOST`, `VAUTO_SFTP_PORT`, `VAUTO_SFTP_USER`, `VAUTO_SFTP_PASSWORD`, `VAUTO_SFTP_PATH`

Phase 1 endpoint: `GET /api/import-vauto?secret=…` — archives files, logs run, **no vehicle upsert**.

## Next steps (when vAuto delivers files)

1. Run intake: `/api/import-vauto`
2. Review `raw_feed_archives` + response `headerPreview` / `rowCountEstimate`
3. Build `lib/import/vautoMap.ts` from real column layout
4. Add `runVautoInventoryImport` (upsert with `inventory_provider: 'vauto'`)
5. Compare counts in Admin → Inventory sources before switching active source
6. Optional: copy raw files to Supabase Storage (`storage_kind: supabase_storage`)

## Environment variables

See `.env.local.example` for `SFTP_*` (HomeNet) and `VAUTO_SFTP_*` (vAuto).
