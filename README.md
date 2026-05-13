# AppDrop — Developer Guide

AI-era app packaging and delivery platform. Developers drop a link + form → Claude generates a full app package. Users describe a problem → Claude delivers ranked matching apps as Story cards.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Database | Supabase (PostgreSQL, hosted) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Tests | Jest + React Testing Library |
| Identity | Anonymous device ID (localStorage UUID, no auth) |

---

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Supabase](https://supabase.com/) project (free tier is enough)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # Service Role key — server-side only, never exposed to browser
```

Get these from:
- **Anthropic API key** → [console.anthropic.com](https://console.anthropic.com/) → API Keys
- **Supabase URL + Service Role key** → Supabase Dashboard → Project Settings → API

### 3. Set up the database

In the Supabase Dashboard → **SQL Editor**, run these two files in order:

**Step 1 — Schema** (`supabase/schema.sql`):
Creates 6 tables (`creators`, `apps`, `boosts`, `favorites`, `collections`, `feed_items`) and a Postgres trigger that keeps `apps.boost_count` in sync automatically.

**Step 2 — Seed data** (`supabase/seed.sql`):
Seeds 4 creators, 5 apps, 3 collections, and 4 feed items so the app has content on first run.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  api/                  # Server-side API routes (Next.js App Router)
    apps/               # GET  /api/apps        — fetch published apps
    collections/        # GET  /api/collections  — fetch curated collections
    boost/              # POST /api/boost        — toggle boost (endorsement)
    favorite/           # POST /api/favorite     — toggle creator favorite
    feed/               # GET  /api/feed         — chronological feed for device
    deliver/            # POST /api/deliver      — Claude delivery engine
    package/            # POST /api/package      — Claude packaging pipeline
  submit/               # App submission flow (form → generating → preview)
  results/              # AI delivery results page
  feed/                 # My Feed page
  collections/          # Collections browser
  ...

components/             # Reusable UI components
lib/
  supabase.ts           # Server-only Supabase client
  db-mapping.ts         # DB row → frontend type mappers
  api.ts                # Typed fetch wrappers for all API routes
  types.ts              # Shared TypeScript types
  slug.ts               # Collision-safe ID generation
hooks/
  useDeviceId.ts        # Stable anonymous device ID (localStorage UUID)
supabase/
  schema.sql            # Database schema + boost trigger
  seed.sql              # Initial seed data
```

---

## API Routes

All routes accept and return JSON.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/apps?category=writing` | Fetch published apps, optional category filter |
| `GET` | `/api/collections` | Fetch all curated collections with full app data |
| `GET` | `/api/feed?deviceId=...` | Chronological feed from favorited creators |
| `POST` | `/api/boost` | Toggle boost on an app `{ deviceId, appId }` |
| `POST` | `/api/favorite` | Toggle favorite on a creator `{ deviceId, creatorId }` |
| `POST` | `/api/deliver` | AI delivery: problem → ranked apps `{ query }` |
| `POST` | `/api/package` | AI packaging: form → full app package |

### `/api/package` input shape

```ts
{
  creatorName: string   // developer name or handle
  link: string          // destination URL (not scraped — form is the AI source)
  problem: string
  audience: string
  features: string
  access: ('web' | 'api' | 'download' | 'extension')[]
  pricing: 'free' | 'freemium' | 'paid'
  tags: string
}
```

---

## How the AI Pipelines Work

### Packaging (`/api/package`)
1. Developer fills out the submission form
2. Form answers (not the URL) are sent to Claude as a structured prompt
3. Claude returns a full app package as JSON: title, tagline, description, use cases, tags, story card, social copy
4. App is written to Supabase; a `feed_item` of type `drop` is created automatically

> The app URL is stored as the destination (where users are sent when they tap "Try App") but is never scraped or analyzed.

### Delivery (`/api/deliver`)
1. User describes their problem in plain language
2. A compact catalog of all published apps (id, tagline, description, tags) is sent to Claude
3. Claude returns ranked app IDs (3–5 most relevant)
4. Full app rows are fetched and returned, with a matching collection if one overlaps

This direct-matching approach works up to ~300 apps. Beyond that, replace with vector embeddings without changing the API contract.

---

## Running Tests

```bash
npx jest
```

48 tests across 17 suites covering all API routes (with mocked Supabase and Claude), UI components, and utility functions.

---

## Key Design Decisions

- **No auth** — anonymous device ID stored in `localStorage`. One boost per device per app.
- **Boost = lightweight endorsement** — not a points economy. A Postgres trigger keeps `boost_count` consistent without extra queries.
- **Chronological feed** — My Feed shows updates from favorited creators only, newest first. Not algorithmic.
- **sessionStorage submission flow** — form data flows through the submission pages via `sessionStorage` (submit → generating → preview) so the AI call happens server-side in the API route.
- **Collections are manually curated** — seeded directly in Supabase. No composer UI in MVP.

---

## Environment Variables Reference

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | No |
| `SUPABASE_URL` | Supabase → Project Settings → API | No |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → service_role | No |
