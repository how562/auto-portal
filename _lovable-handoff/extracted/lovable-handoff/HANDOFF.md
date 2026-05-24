# Lovable → Cursor / Next.js Handoff Package

Lovable is the prototype/admin UI source. Cursor + Next.js + Supabase is the production source of truth. Nothing in production should call Lovable at runtime — every page, route, and helper below must be re-implemented inside the Cursor app. Supabase is shared.

This bundle (`lovable-handoff/`) contains:

```
HANDOFF.md            ← this document
sql/                  ← every migration + seed (idempotent, safe to re-run)
components/admin/     ← every admin page (TanStack Router file-based)
layout/app-sidebar.tsx← admin nav
lib/auth.tsx          ← auth + isAdmin hook
lib/supabase.ts       ← browser Supabase client config
```

The Lovable app uses **TanStack Start + TanStack Router** with file-based routing under `src/routes/_authenticated/`. In Cursor (Next.js App Router) the same files become `app/admin/<route>/page.tsx`. The component bodies (queries, forms, mutations) port over 1:1 — only the route shell changes.

---

## 1. Admin / CMS pages built

All routes live under the `_authenticated` layout (`src/routes/_authenticated/route.tsx`) which enforces signed-in user and surfaces the `isAdmin` flag. Status legend: ✅ working end-to-end, 🟡 working UI but depends on importer/public-site code that lives outside Lovable, 🧪 prototype (UI complete, table seeded but no consumer yet).

| # | Lovable route | Purpose | Tables used | Key components | Status |
|---|---|---|---|---|---|
| 1 | `/dashboard` | Counts + recent activity overview | `stores`, `vehicles`, `feed_import_runs` | `dashboard.tsx` | ✅ |
| 2 | `/dealer-groups` | CRUD dealer groups | `dealer_groups` | `dealer-groups.tsx` | ✅ |
| 3 | `/stores` | CRUD stores + `is_active` toggle | `stores`, `dealer_groups` | `stores.tsx` | ✅ |
| 4 | `/feed-sources` (+ `/feed-sources/$id/mappings`) | Manage HomeNet/CSV/XML feed sources and field mappings | `feed_sources`, `feed_field_mappings` | `feed-sources.index.tsx`, `feed-sources.$id.mappings.tsx` | ✅ |
| 5 | `/imports` (+ `/imports/$id`) | Browse importer runs + per-run detail | `feed_import_runs` | `imports.index.tsx`, `imports.$id.tsx` | 🟡 (needs importer writing rows) |
| 6 | `/feeds` | Cross-store feed monitor: file, last import, processed/upserted/skipped, status, error | `feed_import_runs`, `stores` | `feeds.tsx` | 🟡 |
| 7 | `/feed-mapping` | Map file-name patterns → store_id (active toggle) | `feed_file_mappings`, `stores` | `feed-mapping.tsx` | ✅ (consumed by importer) |
| 8 | `/vehicles` (+ `/vehicles/$id`) | Read-only vehicle inventory browser (filters by `stores.is_active=true`) | `vehicles`, `vehicle_images`, `stores` | `vehicles.tsx`, `vehicles.$id.tsx` | ✅ |
| 9 | `/inventory-merchandising` | Per-vehicle overrides: featured, badges, custom headline | `vehicles` (or `vehicle_merchandising`, see SQL) | `inventory-merchandising.tsx` | 🟡 |
| 10 | `/collections` (+ `/collections/$id`) | Curated inventory collections (homepage shelves) | `collections`, `collection_items` | `collections.index.tsx`, `collections.$id.tsx` | ✅ |
| 11 | `/homepage-sections` (+ `/$id`) | Homepage shelf/section builder | `homepage_sections` | `homepage-sections.index.tsx`, `homepage-sections.$id.tsx` | ✅ |
| 12 | `/pages` (+ `/$id`, `/pages/import`) | Generic CMS page editor + URL importer | `pages`, `page_blocks`, optional `page_imports` | `pages.index.tsx`, `pages.$id.tsx`, `pages.import.tsx` | ✅ |
| 13 | `/navigation` | Header + footer navigation tree builder | `navigation_menus`, `navigation_items`, `pages` | `navigation.tsx` | ✅ |
| 14 | `/link-control-panel` | Audit/manage internal/external links across pages | `managed_links`, `link_audit_runs`, `link_audit_findings` | `link-control-panel.tsx` | 🟡 (audit job runs out-of-band) |
| 15 | `/cta-settings` | Site-wide & VDP CTA labels, targets, visibility | `portal_vdp_ctas` (+ `site_ctas` if added) | `cta-settings.tsx` | ✅ |
| 16 | `/vdp-controls` | VDP section visibility/order, pricing config, trust badges | `portal_vdp_sections`, `portal_pricing_config`, `portal_trust_badges`, `portal_vdp_ctas` | `vdp-controls.tsx` | ✅ |
| 17 | `/mathbox-settings` | VDP pricing math-box presentation (labels, order, grouping, conditional, applies_to, disclaimer) | `portal_pricing_mathbox_config` | `mathbox-settings.tsx` | ✅ |
| 18 | `/text-settings` | Homepage/inventory/VDP copy strings (i18n-ready key/value) | `portal_text_settings` | `text-settings.tsx` | ✅ |
| 19 | `/smart-match-rules` | Buyer-intent matching rules (body style, price band, fuel) | `smart_match_rules` | `smart-match-rules.tsx` | ✅ |
| 20 | `/notes` | Internal scratchpad / ops notes | `notes` | `notes.tsx` | ✅ |

> All pages are **presentation/config only** for pricing and inventory data. The `mathbox-settings` and `vdp-controls` pages explicitly forbid editing money/spec values — those always come from feeds.

---

## 2. Supabase schema

Every SQL file in `sql/` is idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `ON CONFLICT DO NOTHING`/`DO UPDATE`, `DROP POLICY IF EXISTS` before `CREATE POLICY`). Run them in this order in the Supabase SQL editor (or commit as Cursor migrations):

```
1.  supabase-schema.sql                              -- core: dealer_groups, stores, feed_sources, feed_field_mappings,
                                                        feed_import_runs, vehicles, vehicle_images, app_role enum,
                                                        user_roles, has_role(), base RLS
2.  supabase-stores-is-active-migration.sql          -- stores.is_active
3.  supabase-feed-file-mappings-migration.sql        -- feed_file_mappings (file pattern → store)
4.  supabase-notes-migration.sql                     -- notes
5.  supabase-page-importer-v2-migration.sql          -- pages, page_blocks, page_imports
6.  supabase-bilingual-sections-migration.sql        -- bilingual fields on page_blocks
7.  supabase-navigation-migration.sql                -- navigation_menus, navigation_items
8.  supabase-navigation-page-link-migration.sql      -- nav → pages FK
9.  supabase-navigation-link-controls-migration.sql  -- nav visibility/target controls
10. supabase-managed-links-migration.sql             -- managed_links
11. supabase-link-audit-migration.sql                -- link_audit_runs, link_audit_findings
12. supabase-portal-vdp-migration.sql                -- portal_vdp_ctas, portal_pricing_config,
                                                        portal_vdp_sections, portal_trust_badges
13. supabase-portal-pricing-mathbox-migration.sql    -- portal_pricing_mathbox_config + seed
14. supabase-seed-smart-match-rules.sql              -- seed smart_match_rules (table created in schema or here)
15. supabase-seed-nav-pages.sql                      -- seed nav pages
16. supabase-navigation-seed-cavender.sql            -- seed Cavender nav
17. supabase-seed-about-us.sql                       -- seed About page
18. supabase-seed-finance.sql                        -- seed Finance page
```

### RLS pattern (uniform across all admin tables)

```sql
alter table public.<t> enable row level security;

drop policy if exists "<t>_read"  on public.<t>;
drop policy if exists "<t>_admin" on public.<t>;

-- Public read where the public site needs it (pages, navigation, portal_*, vehicles, stores).
create policy "<t>_read"
  on public.<t> for select using (true);

-- Admin write everywhere.
create policy "<t>_admin"
  on public.<t> for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
```

`has_role()` and the `user_roles` table are defined in `supabase-schema.sql` (see the section starting `-- ---------- ROLES ----------`). It uses a separate `user_roles` table + `SECURITY DEFINER` function — never store roles on profiles.

> A few early migrations (`feed_file_mappings`) use a looser `TO authenticated` write policy. When you port to Cursor, tighten them to `has_role(auth.uid(), 'admin')` to match everything else.

---

## 3. Component export & recommended Cursor paths

Each Lovable route file is a self-contained React component (queries with `@tanstack/react-query`, forms with `react-hook-form` + `zod` where present, shadcn UI). To port:

1. Strip the TanStack Router shell:
   ```tsx
   export const Route = createFileRoute('/_authenticated/foo')({ component: FooPage });
   function FooPage() { ... }
   ```
2. In Next.js (App Router) the body becomes the default export of `app/admin/foo/page.tsx` wrapped in `'use client'` (these pages are interactive).
3. Replace `useNavigate()`/`<Link>` from `@tanstack/react-router` with `next/navigation`'s `useRouter()` and `next/link`'s `<Link>`.

Suggested Cursor layout:

```
app/
  admin/
    layout.tsx                       ← admin shell + sidebar + admin-only guard
    dashboard/page.tsx
    dealer-groups/page.tsx
    stores/page.tsx
    feed-sources/page.tsx
    feed-sources/[id]/mappings/page.tsx
    imports/page.tsx
    imports/[id]/page.tsx
    feeds/page.tsx
    feed-mapping/page.tsx
    vehicles/page.tsx
    vehicles/[id]/page.tsx
    inventory-merchandising/page.tsx
    collections/page.tsx
    collections/[id]/page.tsx
    homepage-sections/page.tsx
    homepage-sections/[id]/page.tsx
    pages/page.tsx
    pages/[id]/page.tsx
    pages/import/page.tsx
    navigation/page.tsx
    link-control-panel/page.tsx
    cta-settings/page.tsx
    vdp-controls/page.tsx
    mathbox-settings/page.tsx
    text-settings/page.tsx
    smart-match-rules/page.tsx
    notes/page.tsx

components/
  admin/
    AppSidebar.tsx                   ← from layout/app-sidebar.tsx (swap Link/useRouterState for next/*)
    MathboxSettingsPanel.tsx         ← extracted body of mathbox-settings.tsx
    MathboxPreview.tsx
    CtaSettingsForm.tsx
    TextSettingsTable.tsx
    SmartMatchRuleEditor.tsx
    NavigationTreeEditor.tsx
    PagesEditor.tsx
    PageBlockEditor.tsx
    LinkAuditTable.tsx
    FeedMonitorTable.tsx
    FeedMappingForm.tsx
    VdpControlsPanel.tsx
    StoresTable.tsx                  ← includes is_active toggle
    InventoryMerchandisingTable.tsx
    CollectionsEditor.tsx
    HomepageSectionsEditor.tsx
    DashboardSummary.tsx
    DealerGroupsForm.tsx
    NotesPanel.tsx
    ImportsList.tsx
    ImportDetail.tsx
    FeedSourcesList.tsx
    FeedFieldMappings.tsx

lib/
  supabase/
    browser.ts                       ← createBrowserClient (publishable key)
    server.ts                        ← createServerClient w/ cookies()
    admin.ts                         ← service-role client (server-only)
  auth/
    useAuth.ts                       ← session + isAdmin (mirror lib/auth.tsx)
    requireAdmin.ts                  ← server helper used by app/admin/layout.tsx

  admin/
    mathboxSettings.ts               ← queries: list, upsert, reorder, toggleActive
    ctaSettings.ts
    textSettings.ts
    smartMatchRules.ts
    navigation.ts
    pages.ts
    linkAudit.ts
    feedMonitor.ts
    feedMapping.ts
    vdpControls.ts
    stores.ts
    collections.ts
    homepageSections.ts
    inventoryMerchandising.ts
```

The full source for each Lovable page is in `components/admin/<original-filename>.tsx` inside this bundle.

---

## 4. Data wiring (per page)

Read pattern everywhere: `supabase.from('<table>').select(...).order(...)` via `@tanstack/react-query`. Write pattern: `insert` / `update` / `delete` / `upsert` then `queryClient.invalidateQueries({ queryKey: [...] })`.

| Page | Reads | Writes | Dropdown sources | Notes |
|---|---|---|---|---|
| `/dashboard` | counts from `stores`, `vehicles`, `feed_import_runs` | — | — | read-only |
| `/dealer-groups` | `dealer_groups` | insert/update/delete `dealer_groups` | — | |
| `/stores` | `stores` join `dealer_groups` | insert/update/delete + toggle `is_active` | `dealer_groups` | public site filters `is_active=true` |
| `/feed-sources` | `feed_sources` join `stores` | CRUD `feed_sources` | `stores` | |
| `/feed-sources/$id/mappings` | `feed_field_mappings` for source | CRUD `feed_field_mappings` | — | |
| `/imports` & `/imports/$id` | `feed_import_runs` join `feed_sources`,`stores` | none (importer writes) | — | |
| `/feeds` | `feed_import_runs` latest per `feed_source_id` join `stores` | none | — | importer must populate |
| `/feed-mapping` | `feed_file_mappings` join `stores` | upsert/delete + `is_active` toggle | `stores` | importer reads to route files |
| `/vehicles` | `vehicles` where `stores.is_active=true` | none (read-only) | `stores` | |
| `/vehicles/$id` | `vehicles` + `vehicle_images` | none | — | |
| `/inventory-merchandising` | `vehicles` | update merchandising fields (`featured`, `badges`, `custom_headline`) | — | |
| `/collections` & `$id` | `collections`, `collection_items`, `vehicles` | CRUD | `vehicles` | |
| `/homepage-sections` & `$id` | `homepage_sections` | CRUD + reorder | `collections`, `pages` | |
| `/pages` & `$id` | `pages`, `page_blocks` | CRUD; block reorder; bilingual fields | — | |
| `/pages/import` | runs URL importer server fn → writes `pages` + `page_blocks` | inserts | — | server-side fetch + parse |
| `/navigation` | `navigation_menus`, `navigation_items`, `pages` | CRUD + reorder + parent assignment | `pages` | |
| `/link-control-panel` | `managed_links`, `link_audit_runs`, `link_audit_findings` | update target, status, ignore | `pages` | scanner runs server-side |
| `/cta-settings` | `portal_vdp_ctas` | CRUD + `is_active`, `is_primary`, `applies_to` | — | |
| `/vdp-controls` | `portal_vdp_sections`, `portal_pricing_config` (singleton), `portal_trust_badges`, `portal_vdp_ctas` | update singleton; reorder/toggle sections; CRUD badges | — | |
| `/mathbox-settings` | `portal_pricing_mathbox_config` order by `(group_name, sort_order)` | insert/update/delete; reorder via `sort_order`; toggle `is_active`/`is_conditional`; edit label/disclaimer/`applies_to`/`group_name`/`line_type` | — | **never** edits money values |
| `/text-settings` | `portal_text_settings` | upsert by `key` | — | |
| `/smart-match-rules` | `smart_match_rules` | CRUD + reorder | — | |
| `/notes` | `notes` | CRUD | — | per-user via `created_by` |

All writes require an authenticated session with the `admin` role; RLS rejects others.

---

## 5. Public-site integration plan (Cursor)

What the public Next.js site needs to **read** from Supabase (use the server client + `revalidate`/`cache`):

| System | Public consumer | Table(s) read | Notes |
|---|---|---|---|
| Navigation settings | Site header + footer | `navigation_menus`, `navigation_items` (+ `pages` for hrefs) | filter `is_active=true`, order by `sort_order` |
| CTA settings | Buttons / modals across site + VDP | `portal_vdp_ctas` | filter `is_active`, sort by `sort_order`, respect `applies_to` (new/used/all) |
| Text settings | Copy on homepage, inventory listing, VDP | `portal_text_settings` | read by `key`; default to fallback string |
| Smart Match rules | Inventory matching / shopper quiz / "vehicles for you" | `smart_match_rules` | active rules only |
| Link audit | Admin review only | `link_audit_*` | **do not** wire to public site |
| Math Box settings | VDP pricing block | `portal_pricing_mathbox_config` join feed-driven pricing | render only `is_active=true`; group by `group_name`; respect `is_conditional` and `applies_to`; show `disclaimer` per line |
| VDP controls | VDP shell: sections order, pricing config, trust badges | `portal_vdp_sections`, `portal_pricing_config`, `portal_trust_badges` | singleton `portal_pricing_config` |
| Pages / page_blocks | CMS pages (About, Finance, etc.) | `pages`, `page_blocks` | render block-by-block by `sort_order` |
| Collections + Homepage sections | Homepage shelves | `homepage_sections`, `collections`, `collection_items`, `vehicles` | filter `vehicles.status='active'` + `stores.is_active=true` |
| Inventory merchandising | Listing + VDP badging | `vehicles` merchandising fields | |
| Stores `is_active` | All vehicle queries | `stores` | hard filter everywhere |
| Feed mapping / monitor | Importer + admin only | `feed_file_mappings`, `feed_import_runs` | not public |

Rule of thumb for the public site:
- Use the **anon/publishable** key with RLS-protected SELECT-only access.
- Cache with `next: { revalidate: 60 }` (or tag-based revalidation triggered from admin mutations).
- Never reach for the service-role key from a public route.

---

## 6. Auth / security

**All `_authenticated/*` routes must be admin-only in Cursor.** Lovable currently gates them by `requireSupabaseAuth` + an `isAdmin` flag from `lib/auth.tsx`; Cursor should:

1. Block the route group in `app/admin/layout.tsx` server-side:
   ```ts
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) redirect('/login');
   const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
   if (!isAdmin) redirect('/');
   ```
2. Re-check inside any server action / route handler that mutates.
3. Lean on RLS as the backstop — never rely on client checks alone.

**Role model (already in `supabase-schema.sql`):**
- `app_role` enum: `'admin' | 'user'`
- `user_roles(user_id uuid, role app_role)` table
- `public.has_role(_user_id uuid, _role app_role) returns boolean` SECURITY DEFINER, `search_path = public`

**RLS assumptions used by every portal/admin table:**
- Public `SELECT` allowed on anything the public site needs to render (pages, navigation, portal_*, vehicles, stores).
- `INSERT/UPDATE/DELETE` only for `has_role(auth.uid(), 'admin')`.
- `notes` is per-user (`created_by = auth.uid()`).
- Tighten the looser policies (`feed_file_mappings`, `mathbox_write`) to `has_role(...,'admin')` during the Cursor port — every other table already does.

**Service-role key** is server-only, used in Cursor for the importer + link auditor + webhook handlers — never shipped to the browser.

---

## 7. Migration priority (do in this order)

1. **Schemas / tables / RLS / seed** — run every SQL file from `sql/` against the prod Supabase project (or copy into `supabase/migrations/` in Cursor). Verify `has_role` works.
2. **Shared admin layout + auth guard + sidebar** — `app/admin/layout.tsx`, `components/admin/AppSidebar.tsx`, `lib/auth/*`, Supabase clients (browser/server/admin).
3. **Settings pages (admin CMS)** — port in this priority order:
   1. `stores` + `dealer-groups` (foundation, drives every dropdown)
   2. `feed-sources`, `feed-mapping`, `feeds`, `imports` (data plumbing)
   3. `vehicles`, `inventory-merchandising`
   4. `pages` (+ `pages/import`), `navigation`
   5. `cta-settings`, `vdp-controls`, `mathbox-settings`, `text-settings`
   6. `collections`, `homepage-sections`
   7. `smart-match-rules`, `link-control-panel`, `notes`, `dashboard`
4. **Public read-only wiring** — implement public components that read each table above. Add ISR/revalidate tags. Tag invalidation from admin mutations.
5. **Cleanup of old/duplicate concepts** —
   - Reconcile `cta-settings` with `vdp-controls`'s `portal_vdp_ctas` (single table; don't create a second one).
   - Reconcile `pages` vs hard-coded About/Finance components (drop the hard-coded ones once `pages` renders them).
   - Tighten the few loose RLS policies (`feed_file_mappings`, `mathbox_write`) to `has_role(...,'admin')`.
   - Remove any localStorage admin checks (there should be none).
   - Decide single owner for "feeds" UX (`/feeds` vs `/imports`) — keep `/feeds` as cross-store monitor, `/imports` as per-run audit.

---

## 8. Cursor implementation prompt (paste this into Cursor)

> **Goal:** Migrate the Lovable admin/CMS into this Next.js (App Router) app using the handoff bundle at `./lovable-handoff/`. Lovable is no longer a runtime dependency — everything must live in this repo + Supabase.
>
> **Tech:** Next.js App Router (RSC + server actions where possible), Supabase (`@supabase/ssr` with browser/server/admin clients), `@tanstack/react-query` for client-side admin lists, shadcn/ui, Tailwind, Zod + react-hook-form.
>
> **Steps:**
> 1. Apply every SQL file in `lovable-handoff/sql/` in the order listed in `HANDOFF.md` §2. Commit them as `supabase/migrations/<timestamp>_<name>.sql`. Verify `has_role(auth.uid(),'admin')` and the `user_roles` table.
> 2. Create `lib/supabase/{browser,server,admin}.ts` and `lib/auth/{useAuth,requireAdmin}.ts`. `requireAdmin()` must run server-side via `supabase.rpc('has_role', { _user_id, _role: 'admin' })` and redirect non-admins.
> 3. Build `app/admin/layout.tsx` that calls `requireAdmin()`, renders the sidebar from `components/admin/AppSidebar.tsx` (port of `lovable-handoff/layout/app-sidebar.tsx`, swap TanStack Router `Link` → `next/link` and `useRouterState` → `usePathname`).
> 4. For every page listed in `HANDOFF.md` §1, create `app/admin/<route>/page.tsx` and a matching extracted client component under `components/admin/`. Source code is in `lovable-handoff/components/admin/<original-file>.tsx`. Replace TanStack Router's `createFileRoute`/`useNavigate`/`<Link>` with Next equivalents. Keep `useQuery`/`useMutation` calls as-is. Add `'use client'` where state/forms are used; keep server reads (lists) in RSC where possible.
> 5. Centralize Supabase queries per domain under `lib/admin/<domain>.ts` (one file per page, see paths in `HANDOFF.md` §3). Each file exports typed `list`, `getById`, `upsert`, `delete`, `reorder`, `toggleActive` etc. — admin pages should not call `supabase.from(...)` inline.
> 6. Wire public read consumers per `HANDOFF.md` §5. Use server components + `next: { revalidate: 60 }` (or `revalidateTag` after admin mutations). Never expose service-role key to the browser.
> 7. Enforce RLS as the backstop. Tighten the two loose policies called out in §6 to `has_role(...,'admin')`.
> 8. Do **not** introduce any new tables — every admin feature in `HANDOFF.md` already has a backing table. If you think you need a new one, re-read §1/§2 first.
> 9. Special rule for `mathbox-settings`, `vdp-controls`, `text-settings`, `cta-settings`: presentation only — money/spec values must remain feed-driven. The admin UI must never expose number/price inputs for vehicle financial data.
> 10. After porting each page, smoke-test as: (a) non-admin → redirected, (b) admin → list renders, (c) create/update/delete round-trips visible after refetch.
>
> Deliver the migration in the order listed in `HANDOFF.md` §7. Do not link back to Lovable from any production code path.

---

### Appendix: where to find each artifact in this bundle

- SQL migrations: `sql/*.sql`
- Admin page sources: `components/admin/*.tsx` (filenames match the Lovable route)
- Admin sidebar: `layout/app-sidebar.tsx`
- Auth hook: `lib/auth.tsx`
- Supabase client config (URL + publishable key): `lib/supabase.ts`
