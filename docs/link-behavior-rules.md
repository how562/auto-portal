# Link Behavior Rules — Cavender Auto Portal

**Status:** Canonical spec for all public portal UI  
**Related:** [link-audit.md](./link-audit.md)  
**Last updated:** 2026-05-23

These rules govern every clickable element in the portal. When in doubt, prefer clarity over cleverness: if the user cannot predict what happens on click, the element violates this spec.

---

## 1. Core principles

| Rule | Meaning |
|------|---------|
| **Links navigate** | Route changes, hash navigation, or external URLs — use `<Link>`, `<a>`, or programmatic `router.push` to a URL. |
| **Buttons act** | Modals, filters, wizard steps, locale toggles, menus — use `<button type="button">` with `onClick`. Never use `<button>` for primary route changes. |
| **Hash links respect homepage** | On `/`, scroll in-page. Off home, navigate to `/#section`. |
| **Inventory → VDP** | Every vehicle card’s navigational affordance goes to `/inventory/[id]`. |
| **Stores → locations** | Every store reference that looks clickable must reach a location or store destination. |
| **Nothing dead or ambiguous** | No hover affordance without handler. No labels that imply navigation when nothing happens. No duplicate labels that do different things without clear context. |

---

## 2. Link vs button decision tree

```
Does the click change the URL (path, query, hash, or external)?
├── YES → Navigation
│   ├── Internal path (/inventory, /inventory/[id], /[slug])
│   │   └── Next.js <Link href="...">
│   ├── Hash (#guided-discovery, #categories)
│   │   └── See §3 (Hash rules)
│   ├── External URL (https://, mailto:, tel:)
│   │   └── <a href="..." rel="noopener noreferrer"> (+ target="_blank" for http(s))
│   └── Programmatic (build URL from filters)
│       └── router.push(url) or <Link href={builtUrl}>
│
└── NO → Action
    ├── Opens lead modal → <button> + openLead({ action })
    ├── Toggles filter / sort / view → <button> + onChange / URL sync helper
    ├── Scroll on current page only → <button> + scrollIntoView (homepage hash only)
    ├── Form submit → <button type="submit">
    └── UI chrome (menu, drawer, locale) → <button>
```

### Never

- `<div onClick>` or `<span onClick>` for navigation (use `Link` or `button`).
- `<a href="#">` or `<Link href="#">` as a placeholder.
- `<button>` wrapping a `Link` (pick one element).
- Non-interactive `<span>` for text that looks like nav (styled links must be links or buttons).

### Accessibility

- **Links:** describe destination (`aria-label` when visible text is insufficient, e.g. image-only VDP links).
- **Buttons:** describe action; use `type="button"` unless submitting a form.
- **Disabled navigation:** use `<span>` or `aria-disabled` — not a link with `href=""`.

---

## 3. Hash link rules

**Registered homepage sections** (must have matching `id` on section):

| Hash | Section `id` | Component |
|------|--------------|-----------|
| `#guided-discovery` | `guided-discovery` | Smart Match / Refine Your Fit |
| `#categories` | `categories` | Shop by Life |
| `#how-it-works` | `how-it-works` | How It Works |
| `#locations` | `locations` | Store brand strip |
| `#locations-contact` | `locations-contact` | Footer store contact block |
| `#cavender-commitment` | `cavender-commitment` | Cavender Commitment |

### Behavior

| Current path | Hash target | Implementation |
|--------------|-------------|----------------|
| `/` (homepage) | `#section` | `<button type="button" onClick={() => scrollToId(id)}>` — smooth scroll |
| Any other path | `#section` | `<Link href="/#section">` via `homeHashHref()` from `lib/navigationUtils.ts` |
| CMS page on `/` | `#section` | Same as homepage scroll (`CmsLink` pattern) |
| CMS page off `/` | `#section` | `<Link href="/#section">` |

### Helpers (use these — do not reimplement)

```ts
import { homeHashHref, scrollTargetId } from "@/lib/navigationUtils";
// Off home:  <Link href={homeHashHref("#guided-discovery")} />
// On home:   scrollToId(scrollTargetId("#guided-discovery"))
```

### Do not

- Use raw `<a href="#section">` off the homepage (breaks — section not on page).
- Link hash targets that do not exist in the DOM.
- Use different hashes for the same user intent (e.g. Find My Vehicle and Smart Match must not diverge unless labels differ intentionally).

---

## 4. Internal route rules

### Static app routes

| Route | Use for |
|-------|---------|
| `/` | Home |
| `/inventory` | Browse all / SRP |
| `/inventory/[id]` | Vehicle detail (VDP) |
| `/[slug]` | CMS pages (privacy, finance, locations, etc.) |

Use **`vehicleDetailPath(id)`** from `lib/format.ts` for all VDP URLs — never hand-build `/inventory/${id}` strings in new code.

### Filtered inventory

Build URLs with shared helpers only:

- `filtersToSearchParams()` + `/inventory?…` from `lib/inventorySearch.ts`
- `buildInventoryUrl()` from `lib/inventoryMatch.ts` for Smart Match

### CMS placeholder slugs

Link to intended slugs even before pages exist (CMS will publish). Document in [link-audit.md §7](./link-audit.md#7-routing-map).

### Default CTA → route mapping

See [link-audit.md §7 — Default CTA routing rules](./link-audit.md#default-cta-routing-rules). New CTAs must map to that table or be added to it explicitly.

---

## 5. Inventory card rules

Every vehicle merchandising component must follow this layout:

### Navigational (→ VDP)

| Affordance | Element | Target |
|------------|---------|--------|
| Hero / thumbnail image | `<Link href={vehicleDetailPath(id)}>` | VDP |
| Title (year make model) | `<Link href={vehicleDetailPath(id)}>` | VDP |
| Explicit “View details” / “Details” | `<Link href={vehicleDetailPath(id)}>` | VDP |

**One primary VDP CTA is required** (button-styled `Link` or text link). Image + title may also link to VDP but must not be the only path.

### Actions (lead modal — buttons, not links)

| Label family | `openLead` action | Requires `vehicle` |
|--------------|-------------------|--------------------|
| Check availability / Check | `availability` | Yes |
| Build My Shortlist / Save / Shortlist | `shortlist` | Yes (except site-wide shortlist) |
| Compare Similar / Compare | `compare` | Yes when vehicle shown; footer Compare is site-wide |
| Get My Shortlist (site-wide) | `general-shortlist` | No |

### Card hierarchy

1. **Primary:** View details → VDP (`Link`)
2. **Secondary:** One lead action (availability or shortlist) — `button`
3. **Tertiary:** Additional lead actions — `button`, visually de-emphasized

Do not make availability the only or primary CTA unless the surface is explicitly call-to-action (e.g. VDP sidebar).

### Components in scope

`DiscoveryVehicleCard`, `InventoryListRow`, `InventorySpotlightCard`, `VehicleCard`, `TopPickCard`, `FeaturedPicksStrip`, CMS inventory collection (`VehicleCard` rail).

### Whole-card click

If the entire card is one `<Link>`, do not nest buttons inside. Either:

- Split: image/title/details = `Link`, lead CTAs = `button` outside the link, or
- Card = `Link` only with no separate lead buttons on that surface.

---

## 6. Store and location rules

Any UI that shows a **store name, logo, city, or address** and appears interactive must navigate somewhere valid.

### Allowed targets (in priority order)

| Context | Target | Element |
|---------|--------|---------|
| Store card / logo in strip | `/locations` or `/locations/[storeSlug]` when available | `<Link>` |
| Store name in footer contact | `/locations` or `#locations-contact` on home | `<Link>` or scroll button on `/` |
| Phone number | `tel:${normalizedPhone}` | `<a href="tel:…">` |
| Store website (CMS) | Store URL from data | `<a target="_blank" rel="noopener noreferrer">` |
| VDP “Call store” | `tel:…` when phone exists | `<a>` |

### Not allowed

- Store card with hover border but no `href` / `onClick`.
- Plain text store name where users expect a location page.
- All distinct stores linking to the same URL **without** copy that sets expectation (e.g. “View all locations”).

### Header/footer

- **Locations** nav item → `/locations` (route), not `#locations`, unless explicitly a homepage-only anchor in a homepage-only menu.

---

## 7. Lead modal rules

Lead capture is always a **button action**, never a link.

```ts
openLead({
  action: "availability" | "shortlist" | "compare" | "general-shortlist",
  vehicle?,       // required for vehicle-scoped actions
  storeId?,       // when store context matters (VDP)
  shopperIntent?, // analytics / default message
});
```

- Wrap app surfaces that use leads in `LeadCaptureProvider`.
- Use `useOptionalLeadCapture()` in header (inventory may omit provider in edge cases).
- Label must match action (do not label “Contact our team” if behavior is `availability`).

---

## 8. CTA and navigation deduplication

Avoid redundant competing CTAs in the same viewport:

| Funnel stage | One primary per viewport | Acceptable duplicates |
|--------------|--------------------------|------------------------|
| Start discovery | One scroll or `/#guided-discovery` | Header + sticky on mobile OK if same behavior |
| Browse inventory | One prominent `/inventory` | Secondary text link OK |
| Get shortlist | One `general-shortlist` button | Header OR footer, not both prominent in same strip |

Synonyms that must share **identical behavior** when on the same page:

- Find My Vehicle = Smart Match = Start Discovery → `#guided-discovery`
- Get Shortlist = Get My Shortlist → `general-shortlist`

---

## 9. CMS content rules

### `CmsLink` (and equivalents)

| `href` pattern | Render |
|----------------|--------|
| Starts with `/` | `<Link href={href}>` |
| Starts with `#` | §3 hash rules |
| `http(s)://` | `<a target="_blank" rel="noopener noreferrer">` |
| `tel:` / `mailto:` | `<a href="…">` |
| Empty / `#` only | **Do not render** clickable — hide CTA or show disabled state |

### CMS form sections

- CTA = `<button>` + `openLead({ action: leadAction from settings })`.

### Custom HTML

- Links pass through sanitizer; editors must follow §4 slug list.
- Prefer structured sections over raw HTML for CTAs.

---

## 10. Surface-specific requirements

| Surface | Must include | Notes |
|---------|--------------|-------|
| **Homepage** | Header, footer, mobile sticky discovery | Full hash + CMS hero |
| **SRP** (`/inventory`) | Header, footer (target) | Footer currently missing — add per audit |
| **VDP** (`/inventory/[id]`) | Header, footer (target), VDP lead panel | Mobile sticky lead (target) |
| **CMS** (`/[slug]`) | Header, footer | `DiscoveryProvider` for hash CTAs |
| **Admin** | Admin nav | Separate rules; not lead-modal scope |

Every shopping surface (SRP, VDP) must expose at least:

- Path back to `/inventory` or `/`
- Path to VDP from any vehicle tile
- At least one lead action (availability or shortlist)

---

## 11. Anti-patterns (from link audit)

| Anti-pattern | Fix |
|--------------|-----|
| Footer column text with no `href` | Wire `FooterNavGroups` or remove link styling |
| `InventoryFilterBar` unused | Mount or delete |
| `InventoryRailsSection` / `TopPicksSection` unwired | Mount on homepage or remove |
| Footer Compare without vehicle | Rename to “Compare options” or require context |
| Learn More → `/cavender-commitment` while section on home | Prefer `#cavender-commitment` on `/`, page route off home |
| Three stacked lead buttons, no View details | Add VDP link as primary |
| CMS nav item without URL | Fallback href or non-clickable plain text (no link style) |

---

## 12. Implementation checklist (PR review)

Before merging UI that adds or changes click targets:

- [ ] Navigation uses `<Link>` or documented `router.push` — not `<button>`.
- [ ] Actions use `<button type="button">` — not `<a href="#">`.
- [ ] Hash links use `homeHashHref` / scroll pattern from §3.
- [ ] VDP URLs use `vehicleDetailPath(id)`.
- [ ] Vehicle cards have image/title/details → VDP + explicit View details.
- [ ] Lead CTAs use `openLead` with correct `action` and `vehicle` when needed.
- [ ] Store visuals link to `/locations` (or store page) or are not styled as clickable.
- [ ] Phone numbers use `tel:` links.
- [ ] External links use `rel="noopener noreferrer"`.
- [ ] No `#`-only or empty `href`.
- [ ] Label matches behavior (EN + ES via CTA/i18n system).
- [ ] Click target has visible focus style and predictable outcome.

---

## 13. Source-of-truth files

| Concern | File |
|---------|------|
| Hash helpers | `lib/navigationUtils.ts` |
| VDP path | `lib/format.ts` → `vehicleDetailPath()` |
| Nav fallbacks | `lib/navigationFallback.ts` |
| CTA defaults | `lib/portalCtaFallbacks.ts` |
| Lead actions | `lib/leads.ts`, `LeadCaptureContext.tsx` |
| Filter URLs | `lib/inventorySearch.ts`, `lib/inventoryMatch.ts` |
| Hash scroll (home) | `DiscoveryContext.tsx` → `scrollToGuided()` |
| CMS links | `components/cms/CMSSectionRenderer.tsx` → `CmsLink` |
| Nav hash/route | `HeaderNavItems.tsx`, `FooterNavGroups.tsx` |

When implementing new features, extend these shared helpers rather than adding one-off navigation logic.
