# Auto Group Frontend

Next.js 14 app (App Router) with TypeScript and Tailwind CSS.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Add your Supabase URL and anon key to `.env.local`.

For CMS image uploads, also set `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API → **service_role**). Run `supabase/migrations/20260522180000_cms_media_bucket.sql` once to create the public `cms-media` bucket.

## CMS image uploads

Admin UI at `/admin` (no new database tables — only public URLs stored in existing CMS fields):

| Route | Purpose |
|-------|---------|
| `/admin/media` | Upload images, copy public URLs, delete files |
| `/admin/pages` | Pick a page → edit sections |

- **Upload image** uploads to Supabase Storage (`cms-media`) and returns a public URL.
- **Section `image_url`** — paste or upload, then **Save section**.
- **`community_hero`** — four collage slots (`top_left`, `right_tall`, `center_small`, `bottom_wide`) saved in `settings.images` as `{ position, url }`.
- SQL/manual URLs still work as fallbacks on the public site.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/page.tsx` — homepage (loads `homepage_sections`, collections, vehicles from Supabase)
- `app/layout.tsx` — root layout
- `lib/supabase.ts` — Supabase client
- `lib/homepage.ts` — homepage data fetching
- `components/VehicleCard.tsx` — vehicle card UI
- `components/HomepageSectionBlock.tsx` — section title + vehicle grid

## Homepage data

1. Active `homepage_sections` ordered by `sort_order`
2. For `section_type = collection`, loads the linked collection and `collection_rules`
3. Loads up to 8 active vehicles for the collection’s `store_id` (full rule engine coming later)
