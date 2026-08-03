# Auto Portal vAuto UI cutover

**Date:** 2026-08-03  
**Scope:** Portal UI + admin workflows that consume inventory and switch active providers.  
**Out of scope for this task:** database migrations (schema agent), vAuto upsert/reconcile importer (importer agent), GEO.

Companion docs:

- [`docs/auto-portal-inventory-audit.md`](./auto-portal-inventory-audit.md)
- [`docs/inventory-ingestion-architecture.md`](./inventory-ingestion-architecture.md)

---

## Completed changes (this task)

### Provider handling

- `DEFAULT_INVENTORY_PROVIDER` → **`vauto`** (future preference).
- Read-path fallback when settings unset remains **HomeNet** (`FALLBACK_ACTIVE_INVENTORY_PROVIDER`) so inventory is not emptied.
- Untagged `inventory_provider IS NULL` rows resolve as **HomeNet** during transition (`resolveVehicleInventoryProvider` / `applyInventoryProviderFilter`).
- Shared filter helpers used by SRP, portal sample, homepage collections, CMS collections, admin inventory, dashboard counts, similar vehicles.
- VDP by id requires `store_id` and matching active provider (null → HomeNet); no cross-provider leak.
- New dealership settings still seed **HomeNet** as active until an operator explicitly cuts over after a successful vAuto import (no silent vAuto activation).

### Vehicle display / pricing

- Provider-agnostic `lib/feedSourceRaw.ts` for `source_raw` price/incentive/doc-fee reads.
- `lib/pricingSourceRegistry.ts` uses feed-agnostic readers (HomeNet + vAuto aliases).
- `lib/homenetSourceRaw.ts` retained as deprecated re-export.
- Image helpers already use normalized `primary_image_url` / `image_urls` (no HomeNet-only UI path).

### Admin cutover workflow

- `/admin/inventory-sources` shows per-provider last import, last success, last file, errors, counts, active provider.
- Banner warnings for zero vAuto count and material count mismatch.
- HomeNet → vAuto requires cutover confirmation checkbox; dramatic mismatch requires a second acknowledgement.
- Switch back to HomeNet remains available (“Switch back”).
- Activating a provider with zero vehicles is blocked (cached + live counts; null rows count toward HomeNet).
- API accepts `acknowledgeCutover` alongside `acknowledgeMismatch`.

### Docs / env

- Updated `.env.local.example` (HomeNet vars deprecated, vAuto primary).
- Updated `docs/inventory-ingestion-architecture.md`, `CLAUDE.md`.
- This cutover runbook.

### Safe-stage HomeNet cleanup

- Deprecation labeling and docs only.
- No deletion of HomeNet importer/API, historical rows, or env keys from runtime yet.

---

## Upstream tracks (schema + importer) — done

Schema migrations `20260803170*.sql` are **applied** on live project `faantdhcxnnuwuwkaxbq` (provider identity, null→`homenet` backfill, pipeline tables). Portal-owned vAuto map/upsert/reconcile ships via `/api/import-vauto`. See [`auto-portal-vauto-schema-implementation.md`](./auto-portal-vauto-schema-implementation.md) and [`auto-portal-vauto-importer-implementation.md`](./auto-portal-vauto-importer-implementation.md).

| Item | Status |
|------|--------|
| Provider-scoped unique indexes + null→`homenet` backfill | Applied (live) |
| Pipeline tables / import-run compat columns | Applied (live) |
| vAuto map → upsert (`inventory_provider='vauto'`) | Shipped (importer) |
| Soft-deactivate / reconcile missing VINs | Shipped (importer) |
| Stock fallback, full field refresh, `last_seen_at` | Shipped (importer) |
| Edge Function / cron scheduling | Optional ops (`PORTAL_IMPORT_URL` / cron secrets) |

**Remaining work is ops cutover only:** SFTP secrets, feed mappings, successful per-store vAuto import, then explicit admin provider switch (checklist below). Do not mass-switch.

---

## HomeNet code intentionally retained

Keep until **every** store passes the checklist below and a retention window expires:

| Path | Reason |
|------|--------|
| `app/api/import-homenet/route.ts` | Rollback import |
| `lib/import/homenetImport.ts`, `dealerSendMap.ts`, `dealerSendParse.ts` | Rollback pipeline |
| `lib/import/providers/homenet/**` | Provider isolation |
| `SFTP_*`, `HOMENET_STORE_FILE_MAP`, `HOMENET_DEFAULT_STORE_ID` | Rollback env (marked deprecated in example) |
| `inventory_provider = 'homenet'` rows + feed sources | Live rollback data |
| Switch log `homenet_count_at_switch` | Audit history |
| `lib/homenetSourceRaw.ts` | Deprecated shim for older imports |

Do **not** delete historical HomeNet DB records as part of UI cutover.

---

## Steps requiring manual Supabase or SFTP configuration

1. ~~Apply schema-agent migrations~~ — **done** on live (`20260803170*.sql` / MCP chunk history; see schema doc). Re-apply repo files only on fresh environments.
2. Confirm `VAUTO_SFTP_*` credentials and path for Auto Portal (not GEO).
3. Configure `feed_file_mappings` (and/or `VAUTO_STORE_FILE_MAP` filename tokens) for each dealership’s vAuto file.
4. Run portal-owned vAuto import until `last_vehicle_count` / live counts are healthy per store.
5. Optionally keep `/api/import-homenet` on the existing scheduler until cutover completes; then disable.
6. After all stores validated: remove deprecated HomeNet env from deployed secrets; later delete HomeNet code paths.

---

## Per-store validation checklist

Complete for each Cavender store **before** setting active provider to vAuto. Check off in Admin → Inventory sources after smoke tests.

### Shared smoke tests (after switch)

- [ ] `/` homepage discovery shows vehicles for this store’s collections / portal sample
- [ ] `/inventory` SRP lists vehicles; store filter scoped correctly
- [ ] Open 3 VDPs (`/inventory/[id]`) — prices, images, CTAs load; inactive-provider VIN returns not found
- [ ] Smart Match / guided discovery returns plausible results
- [ ] Lead modal with vehicle association still submits
- [ ] CMS page with `inventory_collection` (if used) shows this store’s active provider only
- [ ] Admin inventory table count matches public SRP for this store
- [ ] Switch back to HomeNet works (rollback drill) then re-cutover if ready

### Store checklists

#### 1. Cavender Buick GMC North

- [ ] vAuto import success in Feed Imports (`inventory_provider=vauto`)
- [ ] vAuto vehicle count &gt; 0 and not a material mismatch vs HomeNet (or mismatch acknowledged)
- [ ] Active provider switched to vAuto with cutover confirmation
- [ ] Shared smoke tests passed
- [ ] Rollback to HomeNet verified once

#### 2. Cavender Buick GMC West

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 3. Cavender Cadillac

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 4. Cavender Chevrolet

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 5. Cavender Grande Ford

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 6. Cavender Nissan of Rockwall

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 7. Cavender Nissan of San Marcos

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 8. Jaguar San Antonio

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

#### 9. Land Rover San Antonio

- [ ] vAuto import success
- [ ] Counts healthy / mismatch reviewed
- [ ] Active → vAuto confirmed
- [ ] Shared smoke tests passed
- [ ] Rollback verified once

---

## Testing mindset (automated / manual)

| Scenario | Expected |
|----------|----------|
| Null `inventory_provider` + active HomeNet | Vehicles appear (not zero) |
| Active vAuto + only null/HomeNet rows | Empty for that store until vAuto import |
| Store scoping | No other dealership’s vehicles |
| VDP by id wrong provider | Not found |
| SRP / homepage / Smart Match / leads | Active provider only |
| Switch warnings | Zero vAuto blocked; mismatch + cutover ack required |
| Mass switch | Not available (per-store only) |

---

## Safety constraints honored

- No mass provider switch
- No GEO APIs or GEO database coupling
- No public filtering based on raw feed payloads
- No importer upsert/reconcile rewrite
- No new SQL migrations in this task
