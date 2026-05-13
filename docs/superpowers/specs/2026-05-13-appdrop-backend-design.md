# AppDrop — Backend Design Spec
**Date:** 2026-05-13
**Focus:** Backend & AI Pipelines
**Status:** Approved

---

## Overview

AppDrop's frontend MVP is complete with static mock data. This spec covers replacing all mocked data with real backend functionality: AI-powered app packaging, semantic delivery engine, and persistent storage.

**Stack:**
- Next.js App Router API routes (server-side, same repo)
- Anthropic Claude API (generation + delivery)
- Supabase (PostgreSQL, hosted)
- Anonymous device ID (localStorage UUID, no auth)

---

## 1. Database Schema (Supabase)

### `apps`
```sql
id          text PRIMARY KEY,
title       text NOT NULL,
tagline     text NOT NULL,
link        text NOT NULL,
creator_id  text REFERENCES creators(id),
description text NOT NULL,
use_cases   text[] NOT NULL,
tags        text[] NOT NULL,
category    text NOT NULL,
access_type text[] NOT NULL,
pricing     text NOT NULL,
story_card  jsonb NOT NULL,
social_copy jsonb NOT NULL,
boost_count int NOT NULL DEFAULT 0,
is_new      bool NOT NULL DEFAULT true,
status      text NOT NULL DEFAULT 'published',
created_at  timestamptz NOT NULL DEFAULT now()
```

### `creators`
```sql
id            text PRIMARY KEY,
name          text NOT NULL,
bio           text NOT NULL DEFAULT '',
avatar        text NOT NULL DEFAULT '',
links         text[] NOT NULL DEFAULT '{}',
regular_count int NOT NULL DEFAULT 0,
created_at    timestamptz NOT NULL DEFAULT now()
```

### `boosts`
```sql
device_id  text NOT NULL,
app_id     text REFERENCES apps(id) ON DELETE CASCADE,
created_at timestamptz NOT NULL DEFAULT now(),
PRIMARY KEY (device_id, app_id)
```

### `favorites`
```sql
device_id  text NOT NULL,
creator_id text REFERENCES creators(id) ON DELETE CASCADE,
created_at timestamptz NOT NULL DEFAULT now(),
PRIMARY KEY (device_id, creator_id)
```

### `collections`
```sql
id          text PRIMARY KEY,
title       text NOT NULL,
description text NOT NULL,
emoji       text NOT NULL,
app_ids     text[] NOT NULL DEFAULT '{}',
curated_by  text NOT NULL DEFAULT 'AppDrop',
updated_at  timestamptz NOT NULL DEFAULT now()
```

### `feed_items`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
creator_id text REFERENCES creators(id) ON DELETE CASCADE,
type       text NOT NULL,  -- drop | beta | announcement | update
app_id     text REFERENCES apps(id) ON DELETE CASCADE,
body       text NOT NULL DEFAULT '',
created_at timestamptz NOT NULL DEFAULT now()
```

### Trigger: maintain `boost_count`
A Postgres trigger increments `apps.boost_count` on `INSERT` into `boosts` and decrements on `DELETE`. This keeps boost_count always consistent without a separate update query.

---

## 2. API Routes

All routes live under `app/api/`. All accept and return JSON.

### `POST /api/package`
**Input:**
```ts
{
  link: string
  problem: string
  audience: string
  features: string
  access: AccessType[]
  pricing: Pricing
  tags: string
  creatorName: string  // new field added to submit form (Q0: "Your name or handle")
}
```
**Process:**
1. Call Claude with the 7 form answers (structured prompt, single round trip)
2. Parse and validate the returned JSON
3. Assign gradient theme based on inferred category
4. Generate `id` as a URL-safe slug from the title
5. Upsert creator row (id derived from creatorName slug)
6. Insert app row with `status: 'published'`
7. Insert `feed_item` of type `'drop'`

**Output:** Full `App` object

**Error:** 422 if Claude returns malformed JSON; 500 for Supabase errors

---

### `POST /api/deliver`
**Input:**
```ts
{ query: string }
```
**Process:**
1. Fetch all published apps from Supabase (id, title, tagline, description, use_cases, tags, category only)
2. Call Claude with the app catalog + user query
3. Parse returned JSON array of app IDs
4. Fetch full app rows for returned IDs
5. Check for a matching collection (tag overlap ≥ 2)
6. Return apps ordered by Claude's ranking; boost_count as tiebreaker

**Output:**
```ts
{
  apps: App[]
  collection?: Collection
}
```

---

### `GET /api/apps`
**Query params:** `?category=writing` (optional)

Fetches all published apps from Supabase. Optional category filter. Orders by `created_at DESC`.

**Output:** `App[]`

---

### `POST /api/boost`
**Input:** `{ deviceId: string, appId: string }`

Inserts or deletes from `boosts` (toggle). The Postgres trigger handles `boost_count`. Returns current state after the operation.

**Output:** `{ boosted: boolean, boostCount: number }`

---

### `POST /api/favorite`
**Input:** `{ deviceId: string, creatorId: string }`

Inserts or deletes from `favorites` (toggle).

**Output:** `{ favorited: boolean }`

---

### `GET /api/feed`
**Query params:** `?deviceId=...`

1. Query `favorites` for the device ID
2. Fetch `feed_items` WHERE `creator_id IN (...)` ordered by `created_at DESC`
3. Join creator data

**Output:** `FeedItem[]` (with creator embedded). The API computes `hoursAgo` from `created_at` before returning, to match the existing frontend `FeedItem` type.

---

### `GET /api/collections`
Fetches all collections from Supabase. Joins full app rows for each collection's `app_ids`. Computes `updatedDaysAgo` from `updated_at` before returning, to match the existing frontend `Collection` type.

**Output:** `Collection[]`

---

## 3. AI Packaging Pipeline

### Claude Prompt
Single structured prompt, one round trip. System message instructs Claude to return only valid JSON.

**System:**
```
You are an app packaging assistant for AppDrop, a platform that helps
developers present their apps to non-technical users.

Given the developer's answers, generate a complete app package.
Output ONLY valid JSON — no markdown, no explanation, no code fences.
```

**User message structure:**
```
App URL: {link}
Problem it solves: {problem}
Target user: {audience}
Core features: {features}
Access type: {access}
Pricing: {pricing}
Category tags (hint): {tags}

Return this JSON shape exactly:
{
  "title": "Short plain-language name (2-4 words)",
  "tagline": "One-liner under 60 chars",
  "description": "2-3 sentence plain-English summary for non-technical users",
  "targetUser": "One-sentence persona",
  "category": "one of: writing|images|audio|video|data|business|design|ai-tools",
  "useCases": ["use case 1", "use case 2", "use case 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "storyCard": {
    "problemStatement": "The problem in 1-2 bold lines",
    "solutionStatement": "How the app solves it in 1-2 lines",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  },
  "socialCopy": {
    "twitter": "Twitter/X post under 280 chars with hook",
    "linkedin": "LinkedIn post 2-3 sentences, professional tone"
  }
}
```

### Frontend Flow
1. Submit page stores form state in `sessionStorage` before navigation
2. `/submit/generating` reads `sessionStorage`, calls `POST /api/package` immediately
3. Existing step animation plays while Claude runs (~10–15s)
4. On success: generated app written to `sessionStorage`, navigate to `/submit/preview`
5. On error: show error state with retry button (no navigation)
6. `/submit/preview` reads generated app from `sessionStorage` instead of `apps[0]`

---

## 4. Delivery Engine

### Claude Prompt
**System:**
```
You are an app discovery engine for AppDrop.
Given a user's problem and a catalog of apps, return the IDs of the
3-5 most relevant apps, ranked by relevance.
Output ONLY a JSON array of app IDs. Example: ["id1", "id2", "id3"]
No markdown, no explanation.
```

**User message:**
```
User problem: "{query}"

App catalog:
- {id}: "{tagline}" | {description} | tags: {tags} | category: {category}
- ...
```

Claude returns `["id1", "id2"]`. The API fetches full rows for those IDs.

### Scaling Note
This approach works for up to ~300 apps before prompt size becomes a concern. At that scale, replace with vector embeddings (Voyage AI) without changing the API contract.

---

## 5. Frontend Wiring

### New Shared Utilities

**`lib/supabase.ts`** — Supabase server client (never imported in `'use client'` components)
```ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
```

**`lib/api.ts`** — Typed fetch wrappers for all routes
```ts
export async function packageApp(input: PackageInput): Promise<App>
export async function deliverApps(query: string): Promise<DeliverResult>
export async function toggleBoost(deviceId: string, appId: string): Promise<BoostResult>
export async function toggleFavorite(deviceId: string, creatorId: string): Promise<FavoriteResult>
export async function fetchApps(category?: Category): Promise<App[]>
export async function fetchFeed(deviceId: string): Promise<FeedItem[]>
export async function fetchCollections(): Promise<Collection[]>
```

**`hooks/useDeviceId.ts`** — Reads/writes a UUID from localStorage
```ts
export function useDeviceId(): string
// Returns stable UUID, creates one on first call, persists in localStorage
```

### Pages Updated

| Page | Change |
|---|---|
| `/submit/generating` | Reads sessionStorage, calls `packageApp()`, handles error state |
| `/submit/preview` | Reads generated app from sessionStorage instead of `apps[0]` |
| `/results` | Calls `deliverApps(query)`, shows skeleton while loading |
| `/` (home) | Calls `fetchApps()` for new drops and story rings data |
| `/feed` | Calls `fetchFeed(deviceId)` |
| `/collections` | Calls `fetchCollections()` |
| `AppCard`, `StoryCard` | Boost button wired to `toggleBoost()` with optimistic UI |
| `CreatorCard` (profile/creator pages) | Favorite button wired to `toggleFavorite()` with optimistic UI |

### Optimistic UI Pattern
For boost and favorite toggles:
1. Update local state immediately (instant feedback)
2. Call API in background
3. On error: revert local state + show toast

---

## 6. Environment Variables

```env
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...   # server-side only, never exposed to browser
NEXT_PUBLIC_SUPABASE_URL=... # public (for future client-side reads if needed)
```

---

## 7. Out of Scope

- User authentication (using anonymous device ID)
- App embedding / vector search (Claude does direct matching)
- Developer dashboard / analytics
- Collection editing UI (collections seeded manually in Supabase)
- Feed item composer UI (feed items created automatically on publish)
- Rate limiting on API routes
