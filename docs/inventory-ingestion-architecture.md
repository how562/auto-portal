# Inventory ingestion architecture

Provider-agnostic inventory ingestion for Cavender Auto Group. HomeNet and vAuto are **separate sources**; the platform never merges them for display.

## Principles

1. **One active source per dealership (store)** — controlled in Admin → Inventory sources.
2. **Separate physical feeds** — HomeNet DealerSend SFTP vs dedicated vAuto DigitalOcean SFTP (`vauto` user, typically `/vauto`).
3. **Separate rows in `vehicles`** — keyed by `(store_id, vin, inventory_provider)`.
4. **All normalization inside our platform** — parsing, dedupe, images, analytics run after intake.

## Inventory source enum

| Code | Label | Intake |
|------|--------|--------|
| `homenet` | HomeNet | `SFTP_*` → `/api/import-homenet` |
| `vauto` | vAuto | `VAUTO_SFTP_*` → `/api/import-vauto` (full upsert; `?mode=intake` inspect-only) |

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
| vAuto | `lib/import/providers/vauto/vautoParse.ts` | `vautoMap.ts` | same upsert + `vehicleReconcile.ts` |

Shared model: `lib/import/canonicalVehicle.ts` — portal/inventory code never imports provider parsers.

## Pipeline stages

```
SFTP intake → raw_feed_archives → inspect/format detect → normalize/map → upsert vehicles
                                      ↓
                            inventory_import_failures (on error)
                                      ↓
                            feed_import_runs (audit)
                                      ↓
                            reconcile missing VINs (vAuto; retention-gated)
```

| Stage | HomeNet | vAuto |
|-------|---------|--------|
| Intake | SFTP download | SFTP download (`runVautoInventoryImport` / `runVautoInventoryIntake`) |
| Inspect | CSV/TXT parse | Header + column preview; document CSV parse |
| Normalize | `dealerSendMap` | `vautoMap` (real export columns) |
| Dedupe | `(store_id, vin, inventory_provider)` | Same |
| Upsert | Active when source = homenet | Always writes `inventory_provider: 'vauto'` (shadow until admin switch) |
| Reconcile | Status from feed row | Missing VIN → `inactive` when retention gate passes |
| Images | Feed URL lists | `Photo Url List` |

## Public read path

Only the **active** provider per store is shown:

- `getActiveInventoryProvider(storeId)`
- `getActiveInventoryForDealership(storeId)`
- All portal/SRP/VDP/collection queries filter `inventory_provider`

Switching source in admin does **not** delete inactive provider rows. Keep HomeNet active while validating vAuto counts in Admin → Inventory sources.

## vAuto DigitalOcean server

- Ubuntu + OpenSSH/SFTP
- User: `vauto`
- Path: `/vauto` (set `VAUTO_SFTP_PATH=/vauto`)
- Env: `VAUTO_SFTP_HOST`, `VAUTO_SFTP_PORT`, `VAUTO_SFTP_USER`, `VAUTO_SFTP_PASSWORD`, `VAUTO_SFTP_PATH`
- Optional: `VAUTO_STORE_FILE_MAP` JSON (filename / DealerId token → store UUID), merged with `HOMENET_STORE_FILE_MAP`

### Expected production files (8 stores)

| File | Store (one file → one store; do not split JLR) |
|------|-----------------------------------------------|
| `CavenderBuickGMCNorth.csv` | Cavender Buick GMC North |
| `CavenderBuickGMCWest.csv` | Cavender Buick GMC West |
| `CavenderCadillac.csv` | Cavender Cadillac |
| `CavenderChevrolet.csv` | Cavender Chevrolet |
| `CavenderGrandeFord.csv` | Cavender Grande Ford |
| `CavenderNissanofRockwall.csv` | Cavender Nissan of Rockwall |
| `CavenderNissanSanMarcos.csv` | Cavender Nissan San Marcos |
| `JaguarLandRoverofSanAntonio.csv` | Jaguar Land Rover of San Antonio |

### Real export columns (mapped in `vautoMap.ts`)

`DealerId`, `Dealer Name`, `VIN`, `Stock #`, `New/Used`, `Year`, `Make`, `Model`, `Model Number`, `Body`, `Transmission`, `Series`, `Body Door Ct`, `Odometer`, `Engine Cylinder Ct`, `Engine Displacement`, `Drivetrain Desc`, `Colour`, `Interior Color`, `MSRP`, `Price`, `Inventory Date`, `Certified`, `Description`, `Features`, `Photo Url List`, `City MPG`, `Highway MPG`, `Photos Last Modified Date`, `Series Detail`, `Engine`, `Age`, `Vehicle Detail Link`, `Disposition`.

Store resolution order (shared with HomeNet): `feed_file_mappings` → env file maps → filename ↔ store name → feed `DealerId` / `Dealer Name` / StoreID.

## Operations

1. Configure `VAUTO_SFTP_*` + `IMPORT_SECRET` + service role key.
2. Ensure each of the 8 files maps to a store (DB mappings and/or `VAUTO_STORE_FILE_MAP`).
3. Run import: `GET /api/import-vauto?secret=…` (upserts vAuto rows only).
4. Optional inspect: `GET /api/import-vauto?secret=…&mode=intake`
5. Compare HomeNet vs vAuto counts in Admin → Inventory sources.
6. Switch active source per store only after validation (does not delete the other provider’s rows).

## Environment variables

See `.env.local.example` for `SFTP_*` (HomeNet) and `VAUTO_SFTP_*` (vAuto).
