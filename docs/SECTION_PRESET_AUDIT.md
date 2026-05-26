# Section preset audit (44 layouts)

Last updated: 2026-05-25. Source of truth: `lib/sectionPresetCatalog.ts`.

## Recommended library categories

| # | Category | Count | Picker focus |
|---|----------|------:|--------------|
| 1 | Page Headers | 6 | Homepage + inner-page openers |
| 2 | Content | 9 | Copy, media, FAQ, values, video |
| 3 | Galleries | 5 | 2 promoted, 2 hidden variants |
| 4 | Conversion / CTA | 2 | CTA band + stats/highlight band |
| 5 | Forms / Contact | 3 | Lead + contact layouts |
| 6 | Social Proof | 4 | Testimonials + reviews |
| 7 | Process / Steps | 4 | Process + timeline (same category) |
| 8 | Comparison | 0 | **Reserved** — no presets yet |
| 9 | Locations | 4 | Stores, maps, directions |
| 10 | Staff / Dynamic | 5 | Repeater-driven rosters |
| 11 | Memos / Notices | 2 | White-box notices |

**Picker-ready:** 39 promoted/standard · **Hidden from picker:** 3 · **Merge into another:** 2

## Duplicate / near-duplicate groups

| Group | Presets | Recommendation |
|-------|---------|----------------|
| `image_text_family` | image_text, text_image_editorial, video_text_split | **Merge** editorial + video into `image_text` settings |
| `hero_collage` | split_hero, gallery_dual_collage | **Hide** dual_collage from picker |
| `gallery_8` | 5 gallery layouts | **Keep** bento + uniform promoted; **hide** rhythm_rows |
| `process_layout` | process_horizontal, process_vertical | **Keep** both; single picker entry later |
| `timeline_layout` | timeline_vertical, timeline_horizontal | **Keep** both |
| `staff_roster` | 5 staff layouts | **Keep** grid + department + spotlight; **hide** list_compact |
| `testimonials` | grid, featured | **Keep** both |
| `location_map` | location_split_map, map_multi_location | **Keep** both (single vs multi store) |
| `dark_full_bleed` | page_header_dark_band, cta_banner, feature_band, reviews_summary | **Keep** — different intent |
| `memo_box` vs `plain_copy` | memos vs text_intro | **Keep** — box vs open copy |

## Readiness gaps (all presets)

| Capability | Status |
|------------|--------|
| Visual preview (`/section-showcase`) | Yes — all 44 |
| Page builder starter (11 CMS types) | Partial — mapped types only |
| Per-preset admin field schema | No — use catalog fields list |
| Image size guidance | Yes — in catalog |
| Responsive layout | Yes — in components |
| Mobile preview in admin | **Not yet** |

## Presets needing cleanup

| Action | preset_key | Notes |
|--------|------------|-------|
| merge | text_image_editorial | → image_text (`show_cta: false`) |
| merge | video_text_split | → image_text (`media_type: video`) |
| hide | gallery_rhythm_rows | Showcase only |
| hide | gallery_dual_collage | Overlaps split_hero collage |
| hide | staff_list_compact | Niche; use grid |

## Admin UI

- **Catalog + table:** `/admin/section-showcase`
- **Visual preview:** `/section-showcase`
- **Legacy 11 types:** `/admin/section-library`
