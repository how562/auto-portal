# Auto Portal vAuto Importer Implementation

**Date:** 2026-08-03  
**Scope:** Portal-owned vAuto inventory ingestion backend (no UI cutover, no HomeNet removal, no active-provider switches).

Companion docs: `docs/auto-portal-inventory-audit.md`, `docs/inventory-ingestion-architecture.md`.

---

## Runtime choice

**Primary importer: Next.js Node** (`app/api/import-vauto` → `lib/import/vautoImport.ts`).

Reasons:

1. Multi-store resolution already exists (`feed_file_mappings`, `VAUTO_STORE_FILE_MAP`, filename heuristics).
2. Shared `vehicleUpsert` + `feed_import_runs` / archive / failure logging live in Node libs.
3. `ssh2-sftp-client` is already proven on the HomeNet path in this repo.
4. Deno Edge can run SFTP (GEO proves it), but wiring portal store mapping without duplicating half of `lib/import` is fragile.

**Companion:** `supabase/functions/inventory-import`

- Prefer setting Edge secret `PORTAL_IMPORT_URL` so the function **proxies** to `/api/import-vauto` (no duplicated multi-store logic).
- Without `PORTAL_IMPORT_URL`, Edge runs a **single-store fallback** (`storeId` required) with embedded parse/upsert.

SFTP files are **never deleted** after download (same as GEO / HomeNet portal path).

---

## Copied patterns (from GEO)

| GEO pattern | Portal adaptation |
|-------------|-------------------|
| Flexible vAuto header aliases (`DealerId`, `Stock #`, `Photo Url List`, …) | `lib/import/providers/vauto/vautoFieldUtils.ts` + `vautoMap.ts` |
| Require VIN **or** stock; require make + model | `mapVautoRow` returns null otherwise |
| Ordered remote image URLs; first = primary | `image_urls` jsonb + `primary_image_url` (no Storage download; no `vehicle_images` writes) |
| VIN match preferred; stock fallback when VIN absent | `vehicleUpsert.ts` |
| Soft-deactivate missing VINs for that dealer only | `softDeactivateMissingProviderVins` scoped to `store_id` + `inventory_provider='vauto'` |
| Stock-only rows not reconciled | Documented: vin-null active rows are left alone |
| Inline CSV testing + SFTP production | POST vs GET on `/api/import-vauto` |
| Import runs + row errors | `feed_import_runs` / `feed_import_run_items` + `inventory_import_failures` |
| Secrets never returned to clients | `IMPORT_SECRET` / `IMPORT_CRON_SECRET`; SFTP password only in server env |

GEO tables (`inventory_vehicles`, `inventory_import_runs`, multilingual `siteId`) were **not** reused. Portal uses `vehicles`, `stores`, `inventory_feed_sources`, etc. in **this** Supabase project only.

---

## Portal adaptations

| Concern | Behavior |
|---------|----------|
| Identity | `(store_id, vin, inventory_provider)` preferred; stock+null-vin fallback |
| Provider tag | Always write `inventory_provider='vauto'`, `import_source='vauto'` |
| Dual rows | HomeNet + vAuto rows for same VIN allowed — provider-scoped unique index **applied** on live (migrations `20260803170*`) |
| Upsert refresh | Full mutable field refresh (not prices/images only); sets `imported_at`, `last_seen_at`, `status` |
| Active source | **Never** changed by this importer |
| HomeNet | Untouched (`/api/import-homenet` retained) |
| Ambiguous files | Multi StoreID / DealerId / DealerName → file skipped |
| Intake-only | Legacy `lib/import/vautoIntake.ts` retained for archive-only runs if needed |

---

## Secrets (names only)

| Name | Where | Purpose |
|------|-------|---------|
| `IMPORT_SECRET` | Next.js + Edge | Protect import endpoints |
| `IMPORT_CRON_SECRET` / `CRON_SECRET` | Next.js + Edge | Optional cron credential |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js / Edge (hosted injects) | Upserts + logging |
| `VAUTO_SFTP_HOST/PORT/USER/PASSWORD/PATH` | Next.js + Edge | DigitalOcean SFTP |
| `VAUTO_STORE_FILE_MAP` | Next.js | Filename / DealerId → store UUID JSON |
| `PORTAL_IMPORT_URL` | Edge only | Proxy to canonical Next.js importer |
| `NEXT_PUBLIC_SUPABASE_*` | Public | **Not** used by importer writes |

Never expose service role or SFTP password to the browser.

---

## Sample-file assumptions

Assumed vAuto CSV/TXT columns (aliases are flexible):

- Identity: `VIN`, `Stock #` / `StockNumber`
- Vehicle: `Year`, `Make`, `Model`, `Series`/`Trim`, `New/Used`, `Odometer`, `Body`
- Colors: `Colour` / `Exterior Color`, `Interior Color`
- Prices: `Price`, `MSRP` (0 → null)
- Images: `Photo Url List` (comma/pipe/semicolon HTTP URLs)
- Dealer: `DealerId`, `Dealer Name`
- Status hint: `Disposition` / `Status` (sold/inactive heuristics)

Delimiter auto-detect: pipe → tab → comma. XML/JSON rejected until configured.

---

## Gaps / remaining (ops — not schema blockers)

1. **Schema migrations applied** on live project `faantdhcxnnuwuwkaxbq` (`20260803170*.sql` / MCP chunk history). Fresh environments: apply repo files in timestamp order before first import. See [`auto-portal-vauto-schema-implementation.md`](./auto-portal-vauto-schema-implementation.md).
2. **Dual HomeNet+vAuto rows** — provider-scoped unique indexes are live; legacy `(store_id, vin)` unique is gone.
3. **Legacy `inventory_provider` nulls** — backfilled to `homenet` on live; UI still treats null as HomeNet as defense in depth. Importer never switches active sources.
4. **Real production sample files** should be spot-checked against aliases after first SFTP pull.
5. **Edge multi-store** without `PORTAL_IMPORT_URL` is intentionally limited (requires `storeId`).
6. **Ops cutover remaining:** `VAUTO_SFTP_*` secrets, per-store feed mappings, successful import counts, then explicit admin provider switch (UI cutover runbook).

---

## Manual test procedure

1. Confirm schema is applied (live: already done; local/fresh: apply `20260803170*.sql`).
2. Set `.env.local`: `IMPORT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, optional `VAUTO_*`.
3. Unit tests: `npm run test:vauto`
4. Unauthorized: `curl http://localhost:3000/api/import-vauto` → 401/500.
5. Inline CSV (replace store UUID):

```bash
curl -X POST "http://localhost:3000/api/import-vauto" \
  -H "x-import-secret: $IMPORT_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"storeId\":\"STORE_UUID\",\"fileName\":\"test.csv\",\"csvContent\":\"VIN,Stock #,Year,Make,Model,Price,Photo Url List\\n1GTEST00000000001,S1,2024,GMC,Sierra,45000,https://cdn.example.com/a.jpg|https://cdn.example.com/b.jpg\\n\"}"
```

6. Malformed row: omit Make → row error logged; other rows still upsert.
7. Duplicate VIN in one file: last wins within batch dedupe.
8. Stock-only row (no VIN): upserts; reconcile does **not** deactivate stock-only actives.
9. Reconcile: import subset of VINs → missing prior vAuto VINs for that store become `inactive`; HomeNet untouched.
10. SFTP: `curl "http://localhost:3000/api/import-vauto?secret=$IMPORT_SECRET"` with `VAUTO_SFTP_*` set.
11. Confirm `feed_import_runs` / items / `inventory_feed_sources.last_import_at` / `last_vehicle_count`.
12. `npm run lint` && `npm run build`.

---

## Files created / changed (summary)

| Path | Role |
|------|------|
| `lib/import/providers/vauto/vautoFieldUtils.ts` | Aliases, images, condition, prices |
| `lib/import/providers/vauto/vautoMap.ts` | Canonical mapping + skip counters |
| `lib/import/providers/vauto/vautoParse.ts` | CSV/TXT parse / inspect |
| `lib/import/vautoImport.ts` | SFTP + inline orchestrator + reconcile |
| `lib/import/vehicleUpsert.ts` | Full refresh, stock fallback, soft-deactivate |
| `lib/import/canonicalVehicle.ts` | VIN/stock key helpers, `last_seen_at` |
| `lib/import/importAuth.ts` | Cron secret support |
| `lib/import/storeMapping.ts` | `VAUTO_STORE_FILE_MAP`, multi-DealerId reject |
| `app/api/import-vauto/route.ts` | GET SFTP / POST inline thin wrapper |
| `supabase/functions/inventory-import/**` | Edge cron entry (+ proxy) |
| `supabase/functions/_shared/vautoCsv.ts` | Deno shared parse/map |
| `lib/import/providers/vauto/__tests__/vautoMap.test.ts` | node:test suite |
| `.env.local.example` | Secret **names** only |
| `docs/auto-portal-vauto-importer-implementation.md` | This doc |
