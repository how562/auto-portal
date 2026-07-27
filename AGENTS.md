# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Overview

Auto Portal is the Cavender Auto Group marketing and vehicle-inventory frontend. It is built with:

- Next.js 14 using the App Router
- React 18
- TypeScript in strict mode
- Tailwind CSS
- Supabase Postgres and Storage
- SFTP-based dealer inventory feeds

Most site content is managed through the custom `/admin` CMS. Editors should be able to change homepage sections, CMS pages, dedicated-page copy, navigation, branding, CTAs, text strings, and other settings without requiring a deployment.

Treat content as data unless a feature genuinely requires a code-defined layout or behavior.

## Architecture Boundaries

These boundaries are mandatory.

- Auto Portal is its own application and product.
- GEO (Go-To-Market Execution Operations) is a separate application and product.
- Do not merge Auto Portal and GEO into one application.
- Do not share routing, authentication, CMS, application architecture, or frontend code between them.
- Do not assume a feature belongs in both applications merely because it exists in one.
- Auto Portal and GEO may consume the same shared normalized inventory source or pipeline where appropriate.
- Sharing normalized inventory infrastructure does not authorize coupling the applications themselves.
- When adding inventory functionality, preserve the option to use a shared normalized source instead of creating unnecessary Auto Portal-specific ingestion duplication.

If a requested change appears to cross this boundary, stop and clarify the intended ownership before implementing it.

## Development Commands

```bash
npm install          # install dependencies
npm run dev          # start the development server on localhost:3000
npm run dev:clean    # remove .next and start dev; use for stale chunk/cache problems
npm run build        # create a production build
npm run start        # run the production build
npm run lint         # run Next.js ESLint checks
```

Initial local setup:

```bash
cp .env.local.example .env.local
```

Populate the required Supabase URL and anonymous key. Consult `.env.local.example` for optional admin, import, SFTP, and provider settings.

There is no automated Jest, Vitest, or similar test suite in this repository. Validate changes with linting, a production build, and focused manual checks.

## Before Making Changes

- Read the files directly involved in the request and inspect nearby implementations before creating a new pattern.
- Check `git status` and preserve unrelated or pre-existing changes.
- Do not edit `_lovable-handoff/` or the nested `auto-portal/` directory unless the task explicitly targets them; they are excluded from the live TypeScript project.
- Read `docs/inventory-ingestion-architecture.md` before modifying inventory imports, provider mapping, canonical vehicles, upserts, or active-source selection.
- Read `docs/link-behavior-rules.md` before changing links, navigation, hash targets, vehicle CTAs, or lead-modal behavior.
- Consult `docs/SECTION_PRESET_AUDIT.md` before introducing or consolidating CMS section presets.
- Check existing migrations before creating a database migration.

## Content and Page Architecture

### Content Is Data

Before hardcoding copy, links, images, settings, or configurable layouts, look for an existing CMS table, settings domain, provider, or `lib/*Admin.ts` module.

When introducing a new content domain, follow the established split where appropriate:

- `<domain>.ts` for public reads
- `<domain>Admin.ts` for privileged CRUD
- `<domain>Types.ts` for shared types
- `<domain>Fallback.ts` for fallback content

Keep public reads separate from privileged writes.

### Homepage

Homepage content is driven by the ordered, active/inactive `homepage_sections` data.

Primary files:

- `lib/homepage.ts`
- `components/home/renderHomepageSection.tsx`
- `app/admin/homepage/`
- `app/admin/homepage-sections/`

Collection sections obtain vehicles through `collections` and `collection_rules`.

### Generic CMS Pages

Generic pages are routed through `app/[slug]/page.tsx` and consist of ordered CMS sections.

Primary registries and renderers:

- `lib/cmsTypes.ts`
- `lib/cmsSectionRegistry.ts`
- `lib/sectionPresetCatalog.ts`
- `components/cms/CMSSectionRenderer.tsx`
- `components/cms/presets/`

Keep section types, supported fields, admin editing, persistence, rendering, and presets synchronized.

### Dedicated Pages

Dedicated pages use fixed code-defined layouts with CMS-editable content. Their slugs are cataloged in `lib/dedicatedSitePages.ts`.

They normally have:

- `app/<slug>/page.tsx`
- a module under `lib/dedicatedPageContent/`
- an admin form under `components/admin/dedicated-page/`

Do not turn a dedicated page into a generic CMS page, or vice versa, without an explicit architectural requirement.

### Inventory Landing Pages

Inventory pages use `page_type: "inventory"` and are rendered by `InventoryLandingPageView` with definitions from `lib/inventorySitePages.ts`.

### Slug Resolution

Preserve the routing precedence in `app/[slug]/page.tsx`:

1. Reserved slugs handled by dedicated App Router segments
2. Inventory landing pages
3. Generic CMS pages
4. The existing About Us special case

When adding routes or editable slugs, account for `RESERVED_CMS_SLUGS`.

## Inventory Ingestion

Inventory sources are provider-isolated.

Current providers:

- HomeNet: live DealerSend SFTP feed
- vAuto: separate DigitalOcean SFTP intake

Provider-specific parsing and mapping belong under:

```text
lib/import/providers/<provider>/
```

Provider-specific modules must not be imported by public portal or inventory display code.

The supported shared boundary is:

- `lib/import/canonicalVehicle.ts`
- `lib/import/vehicleUpsert.ts`

Do not merge provider feeds before canonical normalization. Preserve provider provenance throughout ingestion and storage.

Vehicle identity is based on:

```text
(store_id, vin, inventory_provider)
```

Only one inventory provider is active for a store. Every public inventory read path—including SRP, VDP, homepage collections, CMS inventory sections, and related listings—must filter through the active-provider rules in `lib/inventoryActiveSource.ts`.

Reuse:

- `getActiveInventoryProvider()`
- `getActiveInventoryForDealership()`
- related active-provider filter helpers

Do not implement a second active-provider selection mechanism.

Import endpoints are protected by `IMPORT_SECRET`. Import authentication is separate from CMS admin authentication.

## Supabase and Security Guardrails

### Supabase Clients

Use the correct client for the trust boundary.

- `lib/supabase.ts` / `getSupabase()` uses the anonymous key and is safe for browser-accessible public reads.
- `lib/supabaseAdmin.ts` / `getSupabaseAdmin()` uses the service-role key and is server-only.

Never:

- Import `lib/supabaseAdmin.ts` into a client component.
- Expose `SUPABASE_SERVICE_ROLE_KEY` through props, browser bundles, logs, or `NEXT_PUBLIC_*` variables.
- Use the anonymous client for privileged CMS writes merely to bypass the existing admin layer.
- Return secrets or complete environment values in API responses or diagnostics.

Modules using the service-role client must remain server-only.

### Admin Authentication

Admin authentication uses the shared `CMS_ADMIN_SECRET`, not user accounts.

Relevant boundaries:

- `middleware.ts` protects `/admin/*` and `/mathbox-settings`.
- `lib/adminAuthConfig.ts` contains middleware-safe validation such as `isValidAdminSecret()` and `isAdminRequest()`.
- `lib/adminAuth.ts` may use `next/headers` and exposes server-component/session helpers such as `isAdminSession()`.
- Admin API routes must validate access with the established `isAdminRequest()` pattern.
- Server-rendered admin surfaces should use the established admin session/route guards.

Do not import modules that depend on `next/headers` into middleware.

The admin may be open when `CMS_ADMIN_SECRET` is unset for local development. Do not treat that development fallback as production-grade authorization or broaden it to other secrets.

### Import Authentication

`IMPORT_SECRET` protects `/api/import-homenet` and `/api/import-vauto`.

- Keep import authentication separate from the `cms_admin` cookie.
- Do not substitute `CMS_ADMIN_SECRET` for `IMPORT_SECRET`.
- Do not weaken or bypass secret checks for convenience.
- Avoid logging SFTP credentials, import secrets, raw authorization headers, or sensitive feed contents.

### Environment Files

- Never commit `.env.local` or real credentials.
- Use `.env.local.example` for placeholder configuration documentation.
- Client-visible values must be intentionally prefixed with `NEXT_PUBLIC_`.
- Treat Supabase service-role keys, CMS secrets, import secrets, and SFTP credentials as server-only secrets.

## Database Migrations

Schema changes are plain timestamp-prefixed SQL files under `supabase/migrations/`.

- Follow existing filename and SQL conventions.
- Prefer additive, backward-compatible migrations.
- Consider existing CMS data and fallback behavior.
- Include English and Spanish fields together when adding localized CMS content.
- Preserve provider provenance and active-provider behavior in inventory schema changes.
- Do not assume migrations are applied automatically; there is no repository migration-runner command.
- Clearly report any migration that must be applied manually.

Do not apply a remote migration or mutate production data unless the user explicitly requests it and provides the necessary authority.

## Links, Navigation, and CTAs

`docs/link-behavior-rules.md` is authoritative.

Reuse existing helpers instead of reconstructing URLs or interaction behavior:

- `vehicleDetailPath()` from `lib/format.ts`
- `homeHashHref()` and `scrollTargetId()` from `lib/navigationUtils.ts`
- `CmsLink` for CMS-controlled destinations
- `openLead()` and the established lead-action system for lead modals

Preserve:

- Link-versus-button semantics
- Modified-click and new-tab behavior
- Hash-link behavior across routes
- Vehicle-card CTA hierarchy
- Keyboard accessibility
- CMS-managed link behavior

Do not create ad hoc VDP paths, hash-scrolling implementations, or lead modal state.

## Internationalization

The portal supports English and Spanish through `lib/i18n/` and `components/i18n/LanguageProvider.tsx`.

- `Locale` is `"en" | "es"` and defaults to English.
- CMS-editable English fields generally require a corresponding `_es` field.
- Update types, persistence, admin forms, renderers, fallbacks, and migrations together.
- Use the established locale-selection helpers rather than checking language independently in each component.
- Do not silently introduce English-only public content where the surrounding domain is bilingual.

## TypeScript, React, and Repository Conventions

- TypeScript strict mode is enabled.
- Prefer the `@/*` alias for repository-root imports.
- Preserve server/client component boundaries.
- Add `"use client"` only when browser state, effects, event handlers, or browser-only APIs require it.
- Keep service-role operations and secret access out of client components.
- Reuse existing types, helpers, renderers, and admin patterns before introducing abstractions.
- Keep provider-specific import logic isolated from display code.
- Avoid duplicating CMS schemas or section registries in components.
- Preserve accessibility semantics and visible focus behavior.
- Avoid unrelated refactors or formatting churn.
- Do not add a dependency unless it is necessary and consistent with the existing stack.
- Update `package-lock.json` whenever an intentional dependency change modifies `package.json`.

## Directory Guide

- `app/` — Next.js routes and layouts
- `app/admin/**` — admin CMS pages
- `app/api/admin/**` — authenticated admin CRUD APIs
- `app/api/import-*` — secret-protected inventory import APIs
- `app/[slug]/` — generic CMS/inventory page resolution
- `components/admin/` — admin dashboards and editors
- `components/admin/dedicated-page/` — dedicated-page content forms
- `components/cms/` — CMS section rendering
- `components/cms/presets/` — CMS visual presets
- `components/section-showcase/` — internal section design-system previews
- `lib/` — domain logic, data access, types, fallbacks, and integrations
- `lib/import/` — inventory normalization and ingestion
- `lib/import/providers/` — provider-specific adapters
- `public/` — static assets
- `supabase/migrations/` — manually applied SQL migrations
- `types/` — shared declaration files
- `_lovable-handoff/` — excluded migration scratch space
- `auto-portal/` — excluded nested directory; not live application code

## Completion Checks

Validation should be proportional to the change, but do not claim checks that were not run.

For application changes, normally run:

```bash
npm run lint
npm run build
```

Then manually inspect the affected route or workflow with `npm run dev` when practical.

Additional checks by change type:

### CMS or Content Changes

- Confirm public reads, admin writes, types, fallbacks, and renderers remain aligned.
- Confirm content remains editable rather than unnecessarily hardcoded.
- Verify both English and Spanish fields and rendering.
- Check empty, missing, inactive, and fallback states.

### Routing or Link Changes

- Follow the checklist in `docs/link-behavior-rules.md`.
- Verify reserved slugs and catch-all precedence.
- Verify internal, external, hash, modified-click, keyboard, and lead-action behavior as relevant.

### Inventory Changes

- Confirm provider-specific code remains isolated.
- Confirm canonical mapping preserves `inventory_provider`.
- Confirm all public queries filter by the active provider.
- Check HomeNet and vAuto paths independently when both are affected.
- Verify import authentication remains separate from admin authentication.

### Admin or API Changes

- Confirm page-level and API-level authorization.
- Test unauthorized behavior as well as successful behavior.
- Confirm privileged Supabase access remains server-only.
- Ensure errors and logs do not disclose secrets.

### Database Changes

- Review migration safety and compatibility with existing rows.
- Confirm migration naming matches repository conventions.
- Report that the migration requires manual application.
- Verify code behaves safely before and after rollout when possible.

### UI Changes

- Check responsive layouts.
- Check keyboard interaction, focus states, labels, and semantic elements.
- Check loading, empty, error, and fallback states.
- Check English and Spanish layouts where copy length may differ.

## Handoff Requirements

At completion, report:

- What changed
- Which files changed
- Which validation commands were run and their results
- Which checks were not run and why
- Any migration, environment variable, or manual deployment step required
- Any known limitation or follow-up risk

Do not report a task as complete when required security, provider-filtering, migration, or CMS integration work remains unresolved.
