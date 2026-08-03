# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Auto Group Frontend — a Next.js 14 (App Router) + TypeScript + Tailwind marketing/inventory portal for Cavender Auto Group dealerships, backed by Supabase (Postgres + Storage). Nearly all page content (homepage sections, CMS pages, dedicated pages, navigation, branding, text strings) is editable through a custom `/admin` CMS rather than hardcoded, and vehicle inventory is ingested from dealer SFTP feeds.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run dev:clean     # wipe .next then start dev (use if you hit stale vendor-chunk errors)
npm run build         # production build
npm run start         # run production build
npm run lint          # next lint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite configured in this repo (no jest/vitest, no `*.test.*` files) — verify changes via `npm run lint`, `npm run build`, and manual checks in the dev server.

Setup: `npm install`, then `cp .env.local.example .env.local` and fill in Supabase URL/anon key (see `.env.local.example` for the full list of optional vars — SFTP/vAuto import, admin secret, OpenAI blueprint feature, Facebook feed).

## Architecture Boundaries

- Auto Portal is its own application/product and must remain separate from **GEO** (Go-To-Market Execution Operations), which is a separate application.
- Do not merge Auto Portal and GEO into one application, and do not assume a feature belongs in both just because it exists in one.
- Auto Portal and GEO may consume the same shared normalized inventory source/pipeline where appropriate.
- Sharing inventory infrastructure does not mean sharing application architecture, routing, authentication, CMS, or frontend code — those stay independent per app.
- When implementing inventory functionality, preserve the possibility of a shared normalized inventory source rather than creating unnecessary application-specific duplication.

## Architecture

### Content is data, not code

The overwhelming majority of this codebase exists to let non-developers edit the live site through `/admin` without deploys. Before hardcoding copy, layout, or links in a component, check whether there's already a CMS/settings table and `lib/*Admin.ts` fetcher for it — there almost always is. Key content systems:

- **Homepage** — `homepage_sections` table (ordered, active/inactive) rendered via `lib/homepage.ts` → `components/home/renderHomepageSection.tsx`. Section types include `collection` (pulls vehicles via `collections` + `collection_rules`), hero, social feed, etc. Admin at `/admin/homepage-sections` and `/admin/homepage`.
- **CMS pages** (`/[slug]`) — generic pages built from an ordered list of **sections** (one of `CMS_SECTION_TYPES` in `lib/cmsTypes.ts`: hero, text_block, image_text, split_feature, half_half, cta_band, faq, stats, card_grid, inventory_collection, form, locations, custom_html, top_picks, cavender_commitment, social_feed). Rendered by `components/cms/CMSSectionRenderer.tsx`. The section→field mapping and which fields a section type supports lives in `lib/cmsSectionRegistry.ts`. New section *presets* (visual layout variants within a type) are cataloged in `lib/sectionPresetCatalog.ts` — see `docs/SECTION_PRESET_AUDIT.md` for the current inventory of 44 layouts and merge/hide plans.
- **Dedicated pages** — a fixed set of routes (About Us, Locations, Schedule Service, Executive Team, Value Your Trade, Cavender Commitment, Cavender Cares, Our Story, Contact The Cavenders, Finance Center — see `lib/dedicatedSitePages.ts`) that have **fixed layout/components** but CMS-editable copy via `lib/dedicatedPageContent/`. These are distinct from generic CMS pages: layout is code, content is data. Each has its own `app/<slug>/page.tsx`, a `*PageContent.ts` content-fetch module, and (usually) an admin content form under `components/admin/dedicated-page/`.
- **Inventory landing pages** — a third page kind (`page_type: "inventory"` on `SitePage`), rendered by `InventoryLandingPageView` with presets from `lib/inventorySitePages.ts`.
- Slugs are routed by `app/[slug]/page.tsx`, which checks (in order): reserved slugs (`RESERVED_CMS_SLUGS` in `lib/cmsTypes.ts`, handled by their own App Router segments) → inventory page → generic CMS page → About Us special case.
- Other admin-editable settings: branding/design tokens (`lib/brandingCms*`), portal text strings (`lib/portalTextSettings.ts`, `PortalTextSettingsProvider`), CTAs (`lib/portalCtas.ts`, `CtaProvider`), navigation (`lib/navigation.ts`), Smart Match rules (`lib/smartMatchRules*`), pricing math box (`lib/pricingMathbox*`), social feed (`lib/socialFeed*`).

### Inventory ingestion

Full detail in `docs/inventory-ingestion-architecture.md` and cutover runbook `docs/auto-portal-vauto-ui-cutover.md`. Key points:
- Two **provider-isolated**, never-merged sources: vAuto (preferred / future default) and HomeNet (temporary rollback until every store is validated). Provider-specific parse/map code lives under `lib/import/providers/<provider>/` and must not be imported by portal/inventory display code — only the shared `lib/import/canonicalVehicle.ts` model and `lib/import/vehicleUpsert.ts` are shared.
- `vehicles` rows are keyed by `(store_id, vin, inventory_provider)`; only one provider is "active" per store (`getActiveInventoryProvider`/`getActiveInventoryForDealership` in `lib/inventoryActiveSource.ts`). **All** public read paths (SRP, VDP, homepage collections) must filter via `applyInventoryProviderFilter` / `getActiveInventoryProviderFilterSpec` — null `inventory_provider` rows are treated as legacy HomeNet during cutover (do not hide inventory).
- Preferred future config default is `vauto` (`DEFAULT_INVENTORY_PROVIDER`); stores without settings still fall back to HomeNet until an explicit admin cutover. Do not mass-switch providers.
- Schema migrations `supabase/migrations/20260803170*.sql` are applied on the live Auto Portal project; remaining vAuto work is ops cutover (SFTP secrets, feed mappings, per-store switch) — see `docs/auto-portal-vauto-ui-cutover.md`.
- Import endpoints (`/api/import-vauto`, `/api/import-homenet`) are secret-protected via `IMPORT_SECRET`, separate from the `/admin` cookie auth. HomeNet importer is retained for rollback until cutover completes.
- Auto Portal and GEO remain separate applications; they may share the same normalized inventory *pattern* / feed files, never application code or databases.

### Admin auth

Simple shared-secret auth, not user accounts. `CMS_ADMIN_SECRET` env var (optional — admin is open if unset, intended for local dev). `middleware.ts` gates `/admin/*` and `/mathbox-settings` by checking the `cms_admin` cookie against `lib/adminAuthConfig.ts` (`isValidAdminSecret`). `lib/adminAuth.ts` wraps the same logic with `next/headers` for server components/actions (`isAdminSession()`); `adminAuthConfig.ts` itself has no `next/headers` dependency so it's safe to import from middleware. API routes check the secret via `x-cms-admin-key` header or the same cookie (`isAdminRequest`).

### Supabase access

Two separate clients — **do not mix them up**:
- `lib/supabase.ts` (`getSupabase()`) — anon key, browser-safe, used for all public reads.
- `lib/supabaseAdmin.ts` (`getSupabaseAdmin()`) — service role key, **server-only**, used for admin writes/uploads (CMS saves, media uploads). Never import this from a client component or expose the key to the browser.

Database schema changes are plain SQL files under `supabase/migrations/` (timestamp-prefixed, applied manually/via Supabase — there's no migration-runner command in this repo). Check existing migrations for naming/style conventions before adding one.

### Link and navigation rules

`docs/link-behavior-rules.md` is the canonical spec for every clickable element (link vs. button decision tree, hash-link handling, vehicle card CTA hierarchy, lead-modal actions, CMS `CmsLink` href rules). Read it before adding or changing navigation/CTAs — it defines required shared helpers (`vehicleDetailPath()` in `lib/format.ts`, `homeHashHref()`/`scrollTargetId()` in `lib/navigationUtils.ts`, `openLead()` lead actions) that must be reused rather than reimplemented, and includes a PR checklist.

### i18n

Bilingual EN/ES throughout — most CMS content fields have `_es` counterparts (e.g. `headline` / `headline_es`), and `lib/i18n/` + `components/i18n/LanguageProvider.tsx` provide the locale toggle (`Locale = "en" | "es"`, default `en`). When adding CMS-editable copy fields, add the `_es` counterpart to match existing patterns.

### Path alias

`@/*` maps to the repo root (see `tsconfig.json`). The `_lovable-handoff` and `auto-portal` directories are excluded from the TS project and are not live code — `_lovable-handoff` is scratch space for migrating assets from an external Lovable CMS export (see its `README.md`); ignore both unless specifically asked to work there.

### Directory map

- `app/` — routes (App Router). `app/admin/**` = admin UI pages, `app/api/admin/**` = admin CRUD API routes, `app/api/import-*` = SFTP ingestion endpoints, `app/[slug]` = generic CMS page catch-all, other top-level `app/<name>/page.tsx` = dedicated pages / reserved routes.
- `components/admin/` — admin UI (dashboards, editors per content type, `dedicated-page/` forms).
- `components/cms/presets/` — the visual preset components for CMS section types, grouped by category (gallery, headers, location, maps, process, reviews, staff, testimonials, timeline, utility, video).
- `components/section-showcase/` — internal design-system preview gallery (`/section-showcase`, `/admin/section-showcase`) with reusable visual primitives under `primitives/`.
- `lib/` — flat, large (~230 files), mostly one module per content domain, typically split into `<domain>.ts` (fetch), `<domain>Admin.ts` (admin CRUD), `<domain>Types.ts`, `<domain>Fallback.ts` (default content when CMS is empty). Follow this naming split when adding a new content domain.
