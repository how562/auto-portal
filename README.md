# Auto Group Frontend

Next.js 14 app (App Router) with TypeScript and Tailwind CSS.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Add your Supabase URL and anon key to `.env.local`.

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
