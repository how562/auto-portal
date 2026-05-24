# Link Audit — Cavender Auto Portal

**Last updated:** 2026-05-23 (codebase scan)  
**Scope:** Public portal + admin shell (`components/**`, `app/**`)  
**Method:** Static scan for `<Link>`, `router.push`, `<a>`, scroll `onClick`, and `openLead()`  
**Source:** CTA audit + wiring pass + full repo scan

---

## 1. Overview

### Total links count

| Metric | Count | Notes |
|--------|------:|-------|
| **Static `<Link>` JSX in source** | **55** | 27 files; excludes `.next` / `node_modules` |
| **`router.push()` call sites** | **2** | Shop-by-Life cards (×8 buttons) + admin login redirect |
| **Explicit `<a>` in TSX** | **8** | + dynamic CMS store websites + sanitized HTML anchors |
| **`openLead()` call sites** | **18** | × N vehicles where used on cards |
| **Scroll-nav `onClick` templates** | **10** | + × N hash nav items from CMS/fallback |
| **Estimated runtime (homepage, 50 vehicles, 6 stores)** | **~350+** | Dominated by vehicle card links (3–6 per vehicle) |

> **Dynamic multiplier:** Each vehicle on SRP/VDP/similar rails adds 3–6 navigational/lead targets via `DiscoveryVehicleCard`, `InventoryListRow`, `InventorySpotlightCard`, `VehicleCard`, or `TopPickCard`.

### Count by link mechanism

| Mechanism | Static count | Grouped type |
|-----------|-------------:|--------------|
| `<Link>` (Next.js) | 55 | nav, CTA |
| `router.push()` | 2 | nav (programmatic) |
| `<a href>` | 8 | external, tel |
| `button` + scroll (`scrollToGuided` / `scrollToId`) | 10 | scroll |
| `button` + `openLead()` | 18 | modal |
| `button` + `router.push` (via handler) | 1 handler / 8 triggers | nav |
| Filter/state `onClick` (non-navigation) | excluded | — |

### Count by grouped type

| Type | Static instances | Status split |
|------|-----------------:|--------------|
| **Navigation** (`Link`, `router.push`, route `<a>`) | ~45 templates | Working: 42 · Needs Decision: 2 · Needs Fix: 1 |
| **CTA buttons** (scroll, primary CTAs) | ~18 templates | Working: 16 · Needs Decision: 2 |
| **Inventory actions** (VDP links, filtered SRP) | ~24 patterns × N | Working: 24 |
| **Lead modal triggers** (`openLead`) | 18 call sites × N | Working: 16 · Needs Decision: 2 |
| **CMS links** (`CmsLink`, section CTAs) | 6 templates + CMS ∞ | Working: 5 · Needs Decision: 1 |
| **Footer links** (fallback 12 + 2 CTAs) | 14 | Working: 14 |
| **External / tel** | 8 + CMS | Working: 7 · Needs Decision: 1 |
| **Scroll / hash** | 10 + nav items | Working: 10 |

### Count by status (static templates only)

| Status | Count | Description |
|--------|------:|-------------|
| **Working** | **~95** | Wired to valid route, scroll target, modal, or `tel:` |
| **Needs Fix** | **2** | Dead code or missing href when CMS omits URL |
| **Needs Decision** | **~12** | Ambiguous product behavior — see §5 |

### Link types (reference)

| Type | Description | Examples |
|------|-------------|----------|
| **nav** | Internal route via `Link` or `router.push` | `/inventory`, `/inventory/[id]` |
| **scroll** | In-page smooth scroll (home) or `/#hash` off home | `#guided-discovery` |
| **modal** | Opens `LeadModal` via `openLead()` | `availability`, `shortlist`, `compare` |
| **external** | `<a target="_blank">` | CMS URLs, store websites |
| **tel** | Click-to-call | Store phones |
| **CTA** | Branded action button (may be nav, scroll, or modal) | Start Discovery, Get Shortlist |
| **action** | UI state only (filters, wizard steps) | Not counted as navigation |

---

## 2. Link Inventory Table

> **Status:** `Working` · `Needs Fix` · `Needs Decision`  
> **Scan date:** 2026-05-23 — audit-only; no code changes in this pass.

### A. `<Link>` components (55 static JSX occurrences)

| Location | Element | Type | Current Target | Expected Behavior | Status | Notes |
|----------|---------|------|----------------|-------------------|--------|-------|
| `components/brand/CavenderLogo.tsx` | Logo wrapper | nav | `href` prop (default `/`) | Home | Working | Used in header/footer |
| `components/layout/PortalHeader.tsx` | Browse Inventory | nav | `discoveryBrowse.url ?? "/inventory"` | SRP | Working | Hidden on inventory route variant |
| `components/layout/PortalHeader.tsx` | Start Discovery (inventory) | nav | `discoveryHref` → `/#guided-discovery` | Home Smart Match | Working | When `pathname.startsWith("/inventory")` |
| `components/navigation/HeaderNavItems.tsx` | Hash item (off home) | nav | `homeHashHref(href)` → `/#…` | Home section | Working | Template; × N CMS/fallback items |
| `components/navigation/HeaderNavItems.tsx` | Route item | nav | CMS/fallback `href` | Internal page | Working | e.g. `/inventory`, `/locations` |
| `components/navigation/FooterNavGroups.tsx` | Hash item (off home) | nav | `homeHashHref(href)` | Home section | Working | × 4 hash fallback items |
| `components/navigation/FooterNavGroups.tsx` | Route item | nav | Fallback/CMS `href` | Internal page | Working | × 8 route fallback items |
| `components/home/PortalFooter.tsx` | Footer logo | nav | `/` | Home | Working | Fixed in wiring pass |
| `components/home/PortalFooter.tsx` | Start Discovery (off home) | nav | `footerDiscovery.url ?? "/#guided-discovery"` | Smart Match | Working | |
| `components/home/DiscoveryCTA.tsx` | Browse Inventory | nav | `discoveryBrowse.url ?? "/inventory"` | SRP | Working | |
| `components/home/EditorialHero.tsx` | CMS internal button | nav | `button.url` (starts with `/`) | CMS/route | Working | Default `/inventory` |
| `components/home/CavenderCommitmentSection.tsx` | Learn More | nav | `primaryHref` → `/cavender-commitment` | Commitment page | Working | CMS override supported |
| `components/home/CavenderCommitmentSection.tsx` | See Available Vehicles | nav | `secondaryHref` → `/inventory` | SRP | Working | |
| `components/home/StoreBrandStrip.tsx` | Store card (×N stores) | nav | `/locations` | Locations page | Needs Decision | All stores → same URL |
| `components/home/DiscoveryCategoriesSection.tsx` | — | — | — | — | — | Uses `router.push`, not `Link` |
| `components/home/InventoryRailsSection.tsx` | Browse all inventory | nav | `browseAll.url ?? "/inventory"` | SRP | Working | **Not mounted** on homepage |
| `components/home/TopPickCard.tsx` | Image | nav | `vehicleDetailPath(id)` | VDP | Working | × N picks; **not mounted** |
| `components/home/TopPickCard.tsx` | Title block | nav | `/inventory/[id]` | VDP | Working | |
| `components/home/TopPickCard.tsx` | View details | nav | `/inventory/[id]` | VDP | Working | |
| `components/portal/GuidedDiscoverySection.tsx` | Browse Inventory (empty) | nav | `browseInventoryCta.url ?? "/inventory"` | SRP | Working | |
| `components/portal/GuidedDiscoverySection.tsx` | View all matching vehicles | nav | `inventoryHref` = `buildInventoryUrl(matchFilters)` | Filtered SRP | Working | Dynamic query string |
| `components/inventory/DiscoveryVehicleCard.tsx` | Image | nav | `/inventory/[id]` | VDP | Working | × N SRP grid cards |
| `components/inventory/DiscoveryVehicleCard.tsx` | Title | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/DiscoveryVehicleCard.tsx` | View details | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/InventoryListRow.tsx` | Thumbnail | nav | `/inventory/[id]` | VDP | Working | × N list rows |
| `components/inventory/InventoryListRow.tsx` | Title | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/InventoryListRow.tsx` | Details | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/InventorySpotlightCard.tsx` | Hero image | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/InventorySpotlightCard.tsx` | Title | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/InventorySpotlightCard.tsx` | View details | nav | `/inventory/[id]` | VDP | Working | |
| `components/inventory/FeaturedPicksStrip.tsx` | Pick card (whole card) | nav | `/inventory/[id]` | VDP | Working | × N featured picks |
| `components/inventory/InventoryPagination.tsx` | Previous | nav | `buildPageHref(page-1)` | SRP paginated | Working | Disabled state = `<span>` |
| `components/inventory/InventoryPagination.tsx` | Next | nav | `buildPageHref(page+1)` | SRP paginated | Working | |
| `components/portal/VehicleCard.tsx` | Image | nav | `/inventory/[id]` | VDP | Working | Similar/match/rails |
| `components/portal/VehicleCard.tsx` | Title | nav | `/inventory/[id]` | VDP | Working | |
| `components/portal/VehicleCard.tsx` | View details | nav | `/inventory/[id]` | VDP | Working | Added wiring pass |
| `components/vdp/VehicleDetailView.tsx` | Breadcrumb Home | nav | `/` | Home | Working | |
| `components/vdp/VehicleDetailView.tsx` | Breadcrumb Inventory | nav | `/inventory` | SRP | Working | |
| `components/vdp/VehicleDetailView.tsx` | Browse similar (header) | nav | `similarHref` | Filtered SRP | Working | Body-style heuristic |
| `components/vdp/VehicleDetailView.tsx` | Back to Inventory | nav | `/inventory` | SRP | Working | |
| `components/vdp/VehicleDetailView.tsx` | Browse similar vehicles | nav | `similarHref` | Filtered SRP | Working | Footer duplicate link |
| `components/cms/CMSSectionRenderer.tsx` | `CmsLink` internal | nav | CMS `href` (`/…`) | Internal route | Working | |
| `components/cms/CMSSectionRenderer.tsx` | `CmsLink` hash (off home) | nav | `/${hash}` → `/#…` | Home section | Working | Fixed wiring pass |
| `components/cms/CMSSectionRenderer.tsx` | Browse all inventory | nav | `/inventory` | SRP | Working | Collection section |
| `app/inventory/[id]/not-found.tsx` | Back to Inventory | nav | `discovery_browse.url ?? "/inventory"` | SRP | Working | |
| `app/[slug]/not-found.tsx` | Back to home | nav | `/` | Home | Working | |
| `app/admin/layout.tsx` | Logo + Pages + Inventory + Media + View site | nav | `/admin/*`, `/` | Admin/public | Working | 5 links |
| `app/admin/pages/page.tsx` | Page list item | nav | `/admin/pages/[id]` | Admin editor | Working | × N pages |
| `app/admin/pages/[pageId]/page.tsx` | Back link | nav | `/admin/pages` | Admin list | Working | |
| `app/admin/inventory/page.tsx` | Admin inventory link | nav | admin route | Admin | Working | |
| `components/admin/AdminInventorySortControls.tsx` | Sort link | nav | URL with sort param | Admin inventory | Working | |

### B. `router.push()` (2 call sites)

| Location | Element | Type | Current Target | Expected Behavior | Status | Notes |
|----------|---------|------|----------------|-------------------|--------|-------|
| `components/home/DiscoveryCategoriesSection.tsx` | Life category card (×8) | nav | `/inventory?${filtersToSearchParams(...)}` | Filtered SRP | Working | `navigateToCategory()` |
| `app/admin/login/page.tsx` | Post-login redirect | nav | `next` param (default admin) | Admin destination | Working | Auth flow only |

### C. `<a>` tags (8 explicit TSX + dynamic CMS)

| Location | Element | Type | Current Target | Expected Behavior | Status | Notes |
|----------|---------|------|----------------|-------------------|--------|-------|
| `components/home/EditorialHero.tsx` | CMS external button | external | CMS `button.url` | External URL | Needs Decision | No validation/allowlist |
| `components/navigation/HeaderNavItems.tsx` | External nav item | external | CMS `href` | New tab | Working | Template × N items |
| `components/navigation/FooterNavGroups.tsx` | External footer item | external | CMS `href` | New tab | Working | Template |
| `components/home/PortalFooter.tsx` | Store phone (×N) | tel | `tel:${digits}` | Click-to-call | Working | Fixed wiring pass |
| `components/vdp/VehicleLeadPanel.tsx` | Call store | tel | `tel:${store.phone}` | Click-to-call | Working | When phone present |
| `components/cms/CMSSectionRenderer.tsx` | `CmsLink` external | external | CMS `href` | New tab | Working | Non-`/` URLs |
| `components/cms/CMSSectionRenderer.tsx` | Visit website (×N stores) | external | `store.website` | Store site | Working | CMS locations section |
| `components/admin/AdminInventoryTable.tsx` | VDP/stock link | external/nav | vehicle URL | Open VDP | Working | Admin-only |
| `lib/sanitizeHtml.ts` | CMS custom HTML anchors | external | CMS HTML content | User-defined | Needs Decision | Rendered in custom HTML sections |

### D. Button `onClick` navigation (scroll)

| Location | Element | Type | Current Target | Expected Behavior | Status | Notes |
|----------|---------|------|----------------|-------------------|--------|-------|
| `components/home/EditorialHero.tsx` | Start Your Journey (guided URL) | scroll | `#guided-discovery` | Smart Match section | Working | `scrollToGuided()` |
| `components/home/DiscoveryCTA.tsx` | Start Discovery | scroll | `#guided-discovery` | Smart Match | Working | Used in 4+ sections |
| `components/home/PortalFooter.tsx` | Start Discovery (on `/`) | scroll | `#guided-discovery` | Smart Match | Working | |
| `components/portal/MobileStickyCTA.tsx` | Start Discovery | scroll | `#guided-discovery` | Smart Match | Working | Homepage only |
| `components/layout/PortalHeader.tsx` | Start Discovery (on `/`) | scroll | `scrollToId("guided-discovery")` | Smart Match | Working | |
| `components/navigation/HeaderNavItems.tsx` | Hash item (on `/`) | scroll | `scrollToId(targetId)` | Home section | Working | × N hash nav items |
| `components/navigation/FooterNavGroups.tsx` | Hash item (on `/`) | scroll | `scrollToId(targetId)` | Home section | Working | Find My Vehicle, Smart Match, Categories, How It Works |
| `components/cms/CMSSectionRenderer.tsx` | `CmsLink` hash (on `/`) | scroll | `getElementById` + smooth scroll | Home section | Working | |
| `components/navigation/HeaderNavItems.tsx` | Desktop parent w/ children | scroll/nav | Hover submenu only | Parent navigation | Needs Decision | `<button>` with no `onClick` nav |
| `components/navigation/HeaderNavItems.tsx` | Nav item w/o href | — | `<span>` only | Should link somewhere | Needs Fix | When CMS omits URL |

### E. Lead modal triggers — `openLead()` (18 call sites)

| Location | Element | Type | Current Target | Expected Behavior | Status | Notes |
|----------|---------|------|----------------|-------------------|--------|-------|
| `components/layout/PortalHeader.tsx` | Get Shortlist | modal | `general-shortlist` | Lead modal | Working | Optional if no provider |
| `components/navigation/HeaderNavItems.tsx` | Get Shortlist nav item | modal | `general-shortlist` | Lead modal | Working | `item.action` template |
| `components/home/DiscoveryCTA.tsx` | Get My Shortlist | modal | `general-shortlist` | Lead modal | Working | |
| `components/home/PortalFooter.tsx` | Get My Shortlist | modal | `general-shortlist` | Lead modal | Working | |
| `components/navigation/FooterNavGroups.tsx` | Compare | modal | `compare` | Lead modal | Working | No vehicle context |
| `components/inventory/InventoryConfidenceBand.tsx` | Get My Shortlist | modal | `general-shortlist` | Lead modal | Working | SRP band |
| `components/cms/CMSFormSection.tsx` | Form CTA | modal | CMS `leadAction` | Lead modal | Working | |
| `components/inventory/DiscoveryVehicleCard.tsx` | Shortlist | modal | `shortlist` + vehicle | Lead modal | Working | × N grid cards |
| `components/inventory/DiscoveryVehicleCard.tsx` | Check availability | modal | `availability` + vehicle | Lead modal | Working | |
| `components/inventory/InventoryListRow.tsx` | Save | modal | `shortlist` + vehicle | Lead modal | Working | × N rows |
| `components/inventory/InventoryListRow.tsx` | Check | modal | `availability` + vehicle | Lead modal | Working | |
| `components/inventory/InventorySpotlightCard.tsx` | Shortlist | modal | `shortlist` + vehicle | Lead modal | Working | |
| `components/inventory/InventorySpotlightCard.tsx` | Check availability | modal | `availability` + vehicle | Lead modal | Working | |
| `components/portal/VehicleCard.tsx` | Check Availability | modal | `availability` + vehicle | Lead modal | Working | × N cards |
| `components/portal/VehicleCard.tsx` | Build My Shortlist | modal | `shortlist` + vehicle | Lead modal | Working | |
| `components/portal/VehicleCard.tsx` | Compare Similar | modal | `compare` + vehicle | Lead modal | Needs Decision | No compare UI |
| `components/vdp/VehicleLeadPanel.tsx` | Check Availability | modal | `availability` + vehicle | Lead modal | Working | |
| `components/vdp/VehicleLeadPanel.tsx` | Build My Shortlist | modal | `shortlist` + vehicle | Lead modal | Working | |
| `components/vdp/VehicleLeadPanel.tsx` | Compare Similar | modal | `compare` + vehicle | Lead modal | Needs Decision | Lead-only |
| `components/vdp/VehicleLeadPanel.tsx` | Contact our team (no phone) | modal | `availability` | Lead modal | Needs Decision | Same as Check Availability |

### F. Non-navigation controls (excluded from totals)

| Location | Element | Type | Notes |
|----------|---------|------|-------|
| `GuidedDiscoverySection` | Wizard step buttons | action | In-flow filter state only |
| `InventoryQuickFilters` / drawer / chips | Filter controls | action | URL sync via `onChange`, not direct nav |
| `InventoryPageClient` | Reset discovery | action | Clears filters |
| `LanguageToggle` | EN / ES | action | Locale toggle |
| `PortalHeader` | Mobile menu toggle | action | UI chrome |
| `LeadModal` | Submit / close | action | Form lifecycle |
| `InventoryFilterBar` | Filter chips | action | **Needs Fix** — component never mounted |

### G. Fallback navigation inventory (when CMS menus empty)

**Header (`lib/navigationFallback.ts`) — 5 items**

| Element | Mechanism | Target | Status |
|---------|-----------|--------|--------|
| Find My Vehicle | scroll / `Link` | `#guided-discovery` / `/#guided-discovery` | Working |
| Inventory | `Link` | `/inventory` | Working |
| Locations | `Link` | `/locations` | Working |
| How It Works | scroll / `Link` | `#how-it-works` / `/#how-it-works` | Working |
| Get Shortlist | `openLead` | `general-shortlist` | Working |

**Footer — 12 items + 2 primary CTAs**

| Element | Mechanism | Target | Status |
|---------|-----------|--------|--------|
| Find My Vehicle | scroll / `Link` | `#guided-discovery` | Working |
| Smart Match | scroll / `Link` | `#guided-discovery` | Working |
| Categories | scroll / `Link` | `#categories` | Working |
| Inventory | `Link` | `/inventory` | Working |
| Under $30k | `Link` | `/inventory?budget=under-30k` | Working |
| Compare | `openLead` | `compare` | Working |
| Locations | `Link` | `/locations` | Working |
| How It Works | scroll / `Link` | `#how-it-works` | Working |
| Contact | `Link` | `/contact-the-cavenders` | Working |
| Privacy | `Link` | `/privacy` | Working |
| Terms | `Link` | `/terms` | Working |
| Accessibility | `Link` | `/accessibility` | Working |
| Get My Shortlist (footer CTA) | `openLead` | `general-shortlist` | Working |
| Start Discovery (footer CTA) | scroll / `Link` | `#guided-discovery` / `/#guided-discovery` | Working |

---

## 3. Broken / Fixed Links

Fixes applied during the CTA wiring pass:

| File | Element | Before | After |
|------|---------|--------|-------|
| `lib/portalCtaFallbacks.ts` | Commitment Learn More | `/about` | `/cavender-commitment` |
| `components/home/CavenderCommitmentSection.tsx` | Learn More / See Vehicles fallbacks | `#` | `/cavender-commitment` / `/inventory` |
| `lib/navigationFallback.ts` | Footer column items (12) | No href (decorative) | Full routing map (§7) |
| `lib/navigationFallback.ts` | Header Locations | `#locations` | `/locations` |
| `components/home/PortalFooter.tsx` | Footer columns | Plain `<li>` text | `FooterNavGroups` wired |
| `components/home/PortalFooter.tsx` | Store phones | Plain text | `tel:` links |
| `components/home/PortalFooter.tsx` | Footer logo | Non-clickable | `<Link href="/">` |
| `components/navigation/FooterNavGroups.tsx` | Compare | N/A (component unused) | Lead modal (`compare`) |
| `lib/navigation.ts` | CMS footer `action:*` URLs | Stripped on parse | Preserved as `action` |
| `lib/navigationTypes.ts` | FooterNavLink | No `action` field | Added `action?: LeadAction` |
| `components/home/StoreBrandStrip.tsx` | Store cards | Hover only, no handler | `<Link href="/locations">` |
| `components/portal/VehicleCard.tsx` | View details | Missing | Primary `<Link>` to VDP |
| `components/cms/CMSSectionRenderer.tsx` | Hash CTAs | Raw `<a href="#…">` | Scroll on home; `Link` to `/#…` off home |

---

## 4. Working Links (Confirmed)

### Homepage

- Hero CMS buttons: scroll to Smart Match or `/inventory`
- Shop by Life cards → filtered `/inventory?lifestyle=…`
- Smart Match wizard → in-flow filters + `buildInventoryUrl()` + vehicle preview cards
- `DiscoveryCTA` trio (Start Discovery, Browse, Shortlist) in How It Works, Guided Discovery, etc.
- Cavender Commitment CTAs → `/cavender-commitment`, `/inventory`
- Mobile sticky Start Discovery → scroll
- Footer primary CTAs (Shortlist modal, Start Discovery)

### Inventory

- All vehicle cards/rows → `/inventory/[id]`
- Lead CTAs on cards (Shortlist, Check availability)
- Quick filters, drawer, chips, sort, pagination → URL-synced SRP state
- Confidence band shortlist → lead modal

### VDP

- Breadcrumbs, back links, browse similar → `/` or filtered `/inventory`
- Lead panel CTAs + `tel:` when phone available
- Similar vehicles via `VehicleCard` (now includes View details)

### Header

- Logo, nav items (routes, hashes, lead actions), language toggle, header CTAs

### Footer

- Wired column navigation via `FooterNavGroups` + fallback data
- Location phones as `tel:` links
- Logo → home

### CMS

- `CmsLink` for internal routes (`Link`), external URLs (`<a>`), hash targets (scroll / `/#…`)
- Inventory collection → vehicle cards + browse-all link
- Locations section → phone + website links
- Form sections → lead modal

---

## 5. Needs Decision

| Item | Current behavior | Question |
|------|------------------|----------|
| **Desktop nav parents with children** | Hover-only dropdown; parent button does not navigate | Should parent labels link to a landing page, or remain dropdown-only? |
| **StoreBrandStrip cards** | All link to `/locations` | Per-store deep links (slug, map, or `#locations-contact`)? |
| **Footer store location cards** | Info + `tel:` only | Link to `/locations` or individual store pages? |
| **Compare Similar (site-wide)** | Opens lead modal (`compare`) — no compare UI | Confirm lead-only is the long-term product behavior |
| **Contact our team (VDP, no phone)** | Same lead flow as Check Availability | Use `/contact-the-cavenders` instead? |
| **Mobile sticky CTA** | Homepage only | Add sticky lead/discovery bar on SRP and VDP? |
| **InventoryFilterBar** | Component exists, never mounted | Delete or replace `InventoryQuickFilters`? |
| **EditorialHero external URLs** | Pass-through from CMS | Require allowlist or validation? |
| **CMS placeholder slugs** | Linked but 404 until CMS publish | Confirm final slug list matches content plan |
| **InventoryRailsSection / TopPicksSection** | Fully wired but not on homepage | Mount on homepage or remove? |

---

## 6. Missing Links / Opportunities

| Area | Gap | Suggested action |
|------|-----|------------------|
| **Inventory / VDP mobile** | No bottom sticky CTA (unlike homepage) | Add `MobileStickyCTA` variant with Check Availability on VDP |
| **VDP lead panel (mobile/tablet)** | CTAs below fold after long content | Sticky mobile action bar |
| **Footer store cards** | No link to locations page | Wrap in `Link` to `/locations` or store slug |
| **Header logo on footer** | Now links home ✅ | — |
| **Certified Pre-Owned** | No dedicated nav entry in fallback | Add header/footer link → `/certified-pre-owned` |
| **Finance / Credit / Service** | Not in fallback nav | Add when CMS pages ready (see routing map) |
| **Vehicle image aria-labels** | Image links rely on adjacent title | Add `aria-label` on image-only links |
| **Admin layout** | No link to `/admin/login` | Add if operators need it from view-site header |
| **404 / error pages** | Limited cross-links | Add discovery + inventory links on global error boundary |
| **Compare flow** | Modal only | Future compare tray or side-by-side page |
| **Per-store StoreBrandStrip** | Generic `/locations` | Deep link when store pages exist |

---

## 7. Routing Map

### Static app routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Homepage (`PortalExperience`) |
| `/inventory` | `app/inventory/page.tsx` | Search results (SRP) |
| `/inventory/[id]` | `app/inventory/[id]/page.tsx` | Vehicle detail (VDP) |
| `/[slug]` | `app/[slug]/page.tsx` | CMS pages (excludes reserved slugs) |
| `/admin/*` | `app/admin/**` | CMS admin (not public portal) |

**Reserved slugs** (blocked from CMS): `inventory`, `admin`, `api`, `_next`, `favicon.ico`

### Intended CMS slugs (link now; page when published)

| Slug | Typical entry points |
|------|----------------------|
| `/cavender-commitment` | Commitment Learn More |
| `/cavender-cares` | Future nav / CMS |
| `/about-us` | About |
| `/locations` | Header, footer, store strip |
| `/careers` | Careers |
| `/contact-the-cavenders` | Footer Contact, Talk to a Real Person |
| `/stories` | Stories |
| `/finance` | Finance CTAs |
| `/credit` | Credit / approval CTAs |
| `/value-your-trade` | Trade-in |
| `/service` | Service |
| `/schedule-service` | Schedule service |
| `/collision` | Collision center |
| `/certified-pre-owned` | CPO inventory landing |
| `/privacy` | Footer legal |
| `/terms` | Footer legal |
| `/accessibility` | Footer legal |

### Inventory query parameters

| Param | Example | Behavior |
|-------|---------|----------|
| `condition` | `?condition=new` | New / used / cpo filter |
| `budget` | `?budget=under-30k` | Price band |
| `lifestyle` | `?lifestyle=family` | Shop by Life category |
| `lifeRefinement` | `?lifeRefinement=…` | Life refinement chip |
| `body` | `?body=suv` | Body style (VDP similar links) |
| `store` | `?store=…` | Store filter |
| `sort` | `?sort=…` | Sort order |
| `page` | `?page=2` | Pagination |

### Hash / scroll targets (homepage)

| Hash | Section ID | Component |
|------|------------|-----------|
| `#guided-discovery` | `guided-discovery` | `GuidedDiscoverySection` (Smart Match) |
| `#categories` | `categories` | `DiscoveryCategoriesSection` (Shop by Life) |
| `#how-it-works` | `how-it-works` | `HowItWorksSection` |
| `#locations` | `locations` | `StoreBrandStrip` |
| `#locations-contact` | `locations-contact` | `PortalFooter` store block |
| `#cavender-commitment` | `cavender-commitment` | `CavenderCommitmentSection` |

**Off-home behavior:** Hash links resolve to `/#<id>` via `homeHashHref()` or `FooterNavGroups` / `HeaderNavItems`.

### Default CTA routing rules

| Label pattern | Target |
|---------------|--------|
| Browse Inventory / See Available Vehicles / Explore Vehicles | `/inventory` |
| New Vehicles | `/inventory?condition=new` |
| Pre-Owned | `/inventory?condition=used` |
| Certified Pre-Owned | `/certified-pre-owned` |
| Finance / Check My Options | `/finance` |
| Credit / Start My Approval / See My Buying Power | `/credit` |
| Value Your Trade | `/value-your-trade` |
| Service | `/service` |
| Schedule Service | `/schedule-service` |
| Collision Center | `/collision` |
| Cavender Commitment / Learn More | `/cavender-commitment` |
| Cavender Cares | `/cavender-cares` |
| About Us | `/about-us` |
| Locations | `/locations` |
| Careers | `/careers` |
| Contact / Talk to a Real Person | `/contact-the-cavenders` |
| Stories | `/stories` |
| Start Discovery / Find What Fits You / Find My Match | Scroll `#guided-discovery` on `/`, else `/#guided-discovery` |
| Build My Shortlist / Let Us Build Your Shortlist | Lead modal `shortlist` or `general-shortlist` |
| Check Availability | Lead modal `availability` |
| Compare Similar / Compare My Options | Lead modal `compare` |
| View Details / vehicle title / image | `/inventory/[vehicle.id]` |

### Lead modal actions

| Action | Trigger contexts |
|--------|------------------|
| `availability` | Vehicle cards, VDP panel, Check buttons |
| `shortlist` | Vehicle-specific shortlist |
| `general-shortlist` | Header, footer, discovery CTAs, confidence band |
| `compare` | Compare buttons, footer Compare |

---

## 8. Future Enhancements

### Deep linking

- Preserve full filter state in shareable URLs (already partial via query params; document canonical URLs)
- Smart Match results → permalink with intent/budget/condition encoded
- Store-specific location pages with `#store-id` anchors
- CMS hero/button deep links validated against routing map at save time

### Tracking (analytics)

- CTA key impressions/clicks (`discovery_primary`, `commitment_learn_more`, etc.)
- Lead modal funnel by `action` type and source component
- Shop by Life card → SRP conversion
- Hash scroll engagement (Smart Match vs Categories)
- VDP lead panel vs card CTA attribution

### A/B testing

- Hero headline / CTA order (Start Discovery vs Browse first)
- Mobile sticky CTA copy and visibility on SRP/VDP
- Vehicle card primary CTA: View details vs Check availability
- Commitment section CTA pair (Learn More vs See Vehicles prominence)
- Footer Compare: modal vs `/inventory` with compare mode

### Tooling

- Automated link crawler in CI (check internal 404s, empty `href`, `#`-only links)
- Visual regression for clickable affordances (hover states without handlers)
- CMS link validator against §7 routing map on publish

---

## Appendix: Key source files

| Concern | Files |
|---------|-------|
| CTA defaults | `lib/portalCtaFallbacks.ts`, `components/cta/CtaProvider.tsx` |
| Nav fallbacks | `lib/navigationFallback.ts`, `lib/navigation.ts` |
| Footer wiring | `components/home/PortalFooter.tsx`, `components/navigation/FooterNavGroups.tsx` |
| Lead modal | `components/portal/LeadModal.tsx`, `components/portal/LeadCaptureContext.tsx`, `lib/leads.ts` |
| Inventory URLs | `lib/inventoryMatch.ts` (`buildInventoryUrl`), `lib/inventorySearch.ts` |
| CMS links | `components/cms/CMSSectionRenderer.tsx` (`CmsLink`) |
| Vehicle paths | `lib/format.ts` (`vehicleDetailPath`) |
