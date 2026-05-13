# AppDrop Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all static mock data with a real backend: Supabase database, Claude-powered AI packaging and delivery pipelines, and wired frontend pages.

**Architecture:** Next.js App Router API routes handle all backend logic server-side. Claude API powers both the packaging pipeline (form → generated app package) and the delivery engine (problem description → ranked app list). Supabase stores apps, creators, boosts, favorites, collections, and feed items. Anonymous device IDs (localStorage UUIDs) tie user actions to records without requiring auth.

**Tech Stack:** `@supabase/supabase-js` v2, `@anthropic-ai/sdk`, Next.js 16 App Router API routes, TypeScript, Jest (existing), Tailwind CSS (existing)

---

## File Structure

### New files
| File | Responsibility |
|---|---|
| `supabase/schema.sql` | Full DB schema with trigger |
| `supabase/seed.sql` | Initial collections + mock apps |
| `lib/slug.ts` | Collision-safe ID generation (`slug-xxxx`) |
| `lib/supabase.ts` | Server-side Supabase client (never used in client components) |
| `lib/db-mapping.ts` | DB row → frontend type converters |
| `lib/api.ts` | Typed `fetch` wrappers for client components |
| `hooks/useDeviceId.ts` | Stable UUID in localStorage |
| `app/api/apps/route.ts` | `GET /api/apps` |
| `app/api/collections/route.ts` | `GET /api/collections` |
| `app/api/boost/route.ts` | `POST /api/boost` |
| `app/api/favorite/route.ts` | `POST /api/favorite` |
| `app/api/feed/route.ts` | `GET /api/feed` |
| `app/api/deliver/route.ts` | `POST /api/deliver` |
| `app/api/package/route.ts` | `POST /api/package` |
| `app/api/apps/__tests__/route.test.ts` | |
| `app/api/collections/__tests__/route.test.ts` | |
| `app/api/boost/__tests__/route.test.ts` | |
| `app/api/favorite/__tests__/route.test.ts` | |
| `app/api/feed/__tests__/route.test.ts` | |
| `app/api/deliver/__tests__/route.test.ts` | |
| `app/api/package/__tests__/route.test.ts` | |
| `lib/__tests__/slug.test.ts` | |

### Modified files
| File | Change |
|---|---|
| `app/submit/page.tsx` | Add `creatorName` field; write sessionStorage on submit |
| `app/submit/generating/page.tsx` | Call `packageApp()` for real; error state |
| `app/submit/preview/page.tsx` | Read generated app from sessionStorage |
| `app/results/page.tsx` | Call `deliverApps(query)` instead of sorting mock data |
| `app/page.tsx` | Call `fetchApps()` via `useEffect` |
| `app/feed/page.tsx` | Call `fetchFeed(deviceId)` via `useEffect` |
| `app/collections/page.tsx` | Call `fetchCollections()` via `useEffect` |
| `components/app/AppCard.tsx` | Wire boost + favorite buttons |
| `components/story/StoryCard.tsx` | Wire boost button |

---

## Task 1: Install dependencies and configure environment

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Install packages**

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk
```

Expected: both packages added to `node_modules` and `package.json`

- [ ] **Step 2: Create `.env.local`**

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
```

Get these values from:
- `ANTHROPIC_API_KEY`: https://console.anthropic.com/settings/keys
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`: Supabase Dashboard → Project Settings → API

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install supabase and anthropic sdk"
```

(Do NOT commit `.env.local` — it is already gitignored by Next.js)

---

## Task 2: Supabase schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create the schema file**

```sql
-- supabase/schema.sql
-- Run this in the Supabase Dashboard → SQL Editor

create table if not exists creators (
  id            text primary key,
  name          text not null,
  bio           text not null default '',
  avatar        text not null default '',
  links         text[] not null default '{}',
  regular_count int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists apps (
  id          text primary key,
  title       text not null,
  tagline     text not null,
  link        text not null,
  creator_id  text references creators(id),
  description text not null,
  use_cases   text[] not null,
  tags        text[] not null,
  category    text not null,
  access_type text[] not null,
  pricing     text not null,
  story_card  jsonb not null,
  social_copy jsonb not null,
  boost_count int not null default 0,
  is_new      bool not null default true,
  status      text not null default 'published',
  created_at  timestamptz not null default now()
);

create table if not exists boosts (
  device_id  text not null,
  app_id     text references apps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, app_id)
);

create table if not exists favorites (
  device_id  text not null,
  creator_id text references creators(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, creator_id)
);

create table if not exists collections (
  id          text primary key,
  title       text not null,
  description text not null,
  emoji       text not null,
  app_ids     text[] not null default '{}',
  curated_by  text not null default 'AppDrop',
  updated_at  timestamptz not null default now()
);

create table if not exists feed_items (
  id         uuid primary key default gen_random_uuid(),
  creator_id text references creators(id) on delete cascade,
  type       text not null,
  app_id     text references apps(id) on delete cascade,
  body       text not null default '',
  created_at timestamptz not null default now()
);

-- Trigger: keep apps.boost_count in sync with boosts table
create or replace function sync_boost_count()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    update apps set boost_count = boost_count + 1 where id = NEW.app_id;
  elsif (TG_OP = 'DELETE') then
    update apps set boost_count = greatest(boost_count - 1, 0) where id = OLD.app_id;
  end if;
  return null;
end;
$$;

drop trigger if exists boost_count_trigger on boosts;
create trigger boost_count_trigger
  after insert or delete on boosts
  for each row execute function sync_boost_count();
```

- [ ] **Step 2: Run the schema in Supabase**

Go to Supabase Dashboard → SQL Editor → paste the entire file → Run.
Verify all 6 tables appear in Table Editor.

- [ ] **Step 3: Commit schema file**

```bash
git add supabase/schema.sql
git commit -m "chore: add supabase schema"
```

---

## Task 3: `lib/slug.ts` with test

**Files:**
- Create: `lib/slug.ts`
- Create: `lib/__tests__/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/__tests__/slug.test.ts
import { toSlug, generateId } from '../slug'

describe('toSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toSlug('PDF Helper')).toBe('pdf-helper')
  })
  it('strips non-alphanumeric characters', () => {
    expect(toSlug('My App! (v2)')).toBe('my-app-v2')
  })
  it('collapses consecutive hyphens', () => {
    expect(toSlug('hello  world')).toBe('hello-world')
  })
})

describe('generateId', () => {
  it('starts with the slug of the input', () => {
    const id = generateId('PDF Helper')
    expect(id).toMatch(/^pdf-helper-[a-z0-9]{4}$/)
  })
  it('produces unique IDs for the same input', () => {
    const a = generateId('same')
    const b = generateId('same')
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/slug.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../slug'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/slug.ts
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateId(text: string): string {
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${toSlug(text)}-${suffix}`
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/slug.test.ts --no-coverage
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts lib/__tests__/slug.test.ts
git commit -m "feat: add slug/id generation utility"
```

---

## Task 4: `lib/supabase.ts` and `lib/db-mapping.ts`

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/db-mapping.ts`

- [ ] **Step 1: Create the Supabase server client**

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)
```

This file must only be imported in `app/api/` route files, never in `'use client'` components (it exposes the service role key).

- [ ] **Step 2: Create the DB row → frontend type mappers**

```ts
// lib/db-mapping.ts
import type { App, Creator, Collection, FeedItem, Category, AccessType, Pricing, GradientTheme, FeedItemType } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function dbRowToApp(row: Row): App {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    link: row.link,
    creatorId: row.creator_id,
    description: row.description,
    useCases: row.use_cases,
    tags: row.tags,
    category: row.category as Category,
    accessType: row.access_type as AccessType[],
    pricing: row.pricing as Pricing,
    storyCard: {
      problemStatement: row.story_card.problemStatement,
      solutionStatement: row.story_card.solutionStatement,
      features: row.story_card.features,
      gradientTheme: row.story_card.gradientTheme as GradientTheme,
      shareableUrl: row.story_card.shareableUrl,
    },
    socialCopy: row.social_copy,
    boostCount: row.boost_count,
    isNew: row.is_new,
  }
}

export function dbRowToCreator(row: Row): Creator {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    avatar: row.avatar,
    links: row.links,
    appIds: row.app_ids ?? [],
    regularCount: row.regular_count,
  }
}

export function dbRowToCollection(row: Row): Collection {
  const updatedAt = new Date(row.updated_at)
  const updatedDaysAgo = Math.floor(
    (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    appIds: row.app_ids,
    updatedDaysAgo,
  }
}

export function dbRowToFeedItem(row: Row): FeedItem {
  const createdAt = new Date(row.created_at)
  const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
  return {
    id: row.id,
    creatorId: row.creator_id,
    type: row.type as FeedItemType,
    appId: row.app_id,
    body: row.body,
    hoursAgo,
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts lib/db-mapping.ts
git commit -m "feat: add supabase client and db mapping helpers"
```

---

## Task 5: `hooks/useDeviceId.ts` and `lib/api.ts`

**Files:**
- Create: `hooks/useDeviceId.ts`
- Create: `lib/api.ts`

- [ ] **Step 1: Create the device ID hook**

```ts
// hooks/useDeviceId.ts
'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'appdrop_device_id'

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}

export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState('')
  useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])
  return deviceId
}
```

- [ ] **Step 2: Create the typed fetch wrappers**

```ts
// lib/api.ts
import type { App, Collection, FeedItem, Category, Creator } from '@/lib/types'

export interface PackageInput {
  link: string
  problem: string
  audience: string
  features: string
  access: string[]
  pricing: string
  tags: string
  creatorName: string
}

export interface DeliverResult {
  apps: App[]
  collection?: Collection
}

export interface BoostResult {
  boosted: boolean
  boostCount: number
}

export interface FavoriteResult {
  favorited: boolean
}

export interface FeedEntry {
  item: FeedItem
  creator: Creator
  app: App
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export function packageApp(input: PackageInput): Promise<App> {
  return apiFetch('/api/package', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deliverApps(query: string): Promise<DeliverResult> {
  return apiFetch('/api/deliver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}

export function fetchApps(category?: Category): Promise<App[]> {
  const url = category ? `/api/apps?category=${category}` : '/api/apps'
  return apiFetch(url)
}

export function fetchCollections(): Promise<Collection[]> {
  return apiFetch('/api/collections')
}

export function toggleBoost(deviceId: string, appId: string): Promise<BoostResult> {
  return apiFetch('/api/boost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, appId }),
  })
}

export function toggleFavorite(deviceId: string, creatorId: string): Promise<FavoriteResult> {
  return apiFetch('/api/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, creatorId }),
  })
}

export function fetchFeed(deviceId: string): Promise<FeedEntry[]> {
  return apiFetch(`/api/feed?deviceId=${encodeURIComponent(deviceId)}`)
}
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useDeviceId.ts lib/api.ts
git commit -m "feat: add device id hook and api fetch wrappers"
```

---

## Task 6: `GET /api/apps`

**Files:**
- Create: `app/api/apps/route.ts`
- Create: `app/api/apps/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/apps/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockApp = {
  id: 'test-app-a1b2',
  title: 'Test App',
  tagline: 'A test tagline',
  link: 'https://example.com',
  creator_id: 'creator-x1y2',
  description: 'A description',
  use_cases: ['Use case 1'],
  tags: ['tag1'],
  category: 'writing',
  access_type: ['web'],
  pricing: 'free',
  story_card: {
    problemStatement: 'The problem',
    solutionStatement: 'The solution',
    features: ['Feature 1'],
    gradientTheme: 'indigo-purple',
    shareableUrl: '/story/test-app-a1b2',
  },
  social_copy: { twitter: 'tweet', linkedin: 'post' },
  boost_count: 5,
  is_new: true,
  status: 'published',
  created_at: '2026-05-13T00:00:00Z',
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [mockApp], error: null })),
        })),
      })),
    })),
  },
}))

describe('GET /api/apps', () => {
  it('returns an array of apps in camelCase shape', async () => {
    const req = new NextRequest('http://localhost/api/apps')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe('test-app-a1b2')
    expect(json[0].creatorId).toBe('creator-x1y2')
    expect(json[0].boostCount).toBe(5)
    expect(json[0].useCases).toEqual(['Use case 1'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/apps/__tests__/route.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../route'`

- [ ] **Step 3: Write the implementation**

```ts
// app/api/apps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToApp } from '@/lib/db-mapping'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')

  const base = supabase.from('apps').select('*').eq('status', 'published')
  const query = category ? base.eq('category', category) : base
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbRowToApp))
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/apps/__tests__/route.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/apps/route.ts app/api/apps/__tests__/route.test.ts
git commit -m "feat: add GET /api/apps route"
```

---

## Task 7: `GET /api/collections`

**Files:**
- Create: `app/api/collections/route.ts`
- Create: `app/api/collections/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/collections/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockCollection = {
  id: 'solo-founder',
  title: 'Solo Founder Pack',
  description: 'Go from idea to launch',
  emoji: '🚀',
  app_ids: ['app-1', 'app-2'],
  curated_by: 'AppDrop',
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [mockCollection], error: null })),
      })),
    })),
  },
}))

describe('GET /api/collections', () => {
  it('returns collections with updatedDaysAgo computed', async () => {
    const req = new NextRequest('http://localhost/api/collections')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe('solo-founder')
    expect(json[0].updatedDaysAgo).toBe(2)
    expect(json[0].appIds).toEqual(['app-1', 'app-2'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/collections/__tests__/route.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../route'`

- [ ] **Step 3: Write the implementation**

```ts
// app/api/collections/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToCollection } from '@/lib/db-mapping'

export async function GET(_req: NextRequest) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbRowToCollection))
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/collections/__tests__/route.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/collections/route.ts app/api/collections/__tests__/route.test.ts
git commit -m "feat: add GET /api/collections route"
```

---

## Task 8: `POST /api/boost`

**Files:**
- Create: `app/api/boost/route.ts`
- Create: `app/api/boost/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/boost/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/boost', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

// Track which mock scenario to use
let boostExists = false

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'boosts') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() =>
                  Promise.resolve({ data: boostExists ? { device_id: 'dev1' } : null, error: null })
                ),
              })),
            })),
          })),
          insert: jest.fn(() => Promise.resolve({ error: null })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          })),
        }
      }
      if (table === 'apps') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: { boost_count: boostExists ? 9 : 11 }, error: null })
              ),
            })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('POST /api/boost', () => {
  it('adds a boost when none exists', async () => {
    boostExists = false
    const res = await POST(makeRequest({ deviceId: 'dev1', appId: 'app-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.boosted).toBe(true)
    expect(json.boostCount).toBe(11)
  })

  it('removes a boost when one exists', async () => {
    boostExists = true
    const res = await POST(makeRequest({ deviceId: 'dev1', appId: 'app-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.boosted).toBe(false)
    expect(json.boostCount).toBe(9)
  })

  it('returns 400 when deviceId or appId is missing', async () => {
    const res = await POST(makeRequest({ deviceId: 'dev1' }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/boost/__tests__/route.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../route'`

- [ ] **Step 3: Write the implementation**

```ts
// app/api/boost/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { deviceId, appId } = await req.json()
  if (!deviceId || !appId) {
    return NextResponse.json({ error: 'deviceId and appId are required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('boosts')
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('app_id', appId)
    .maybeSingle()

  if (existing) {
    await supabase.from('boosts').delete().eq('device_id', deviceId).eq('app_id', appId)
  } else {
    await supabase.from('boosts').insert({ device_id: deviceId, app_id: appId })
  }

  const { data: app } = await supabase
    .from('apps')
    .select('boost_count')
    .eq('id', appId)
    .single()

  return NextResponse.json({ boosted: !existing, boostCount: app?.boost_count ?? 0 })
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/boost/__tests__/route.test.ts --no-coverage
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add app/api/boost/route.ts app/api/boost/__tests__/route.test.ts
git commit -m "feat: add POST /api/boost route"
```

---

## Task 9: `POST /api/favorite`

**Files:**
- Create: `app/api/favorite/route.ts`
- Create: `app/api/favorite/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/favorite/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/favorite', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

let favoriteExists = false

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() =>
              Promise.resolve({ data: favoriteExists ? { device_id: 'dev1' } : null, error: null })
            ),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
  },
}))

describe('POST /api/favorite', () => {
  it('adds a favorite when none exists', async () => {
    favoriteExists = false
    const res = await POST(makeRequest({ deviceId: 'dev1', creatorId: 'creator-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.favorited).toBe(true)
  })

  it('removes a favorite when one exists', async () => {
    favoriteExists = true
    const res = await POST(makeRequest({ deviceId: 'dev1', creatorId: 'creator-1' }))
    const json = await res.json()
    expect(json.favorited).toBe(false)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ deviceId: 'dev1' }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/favorite/__tests__/route.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write the implementation**

```ts
// app/api/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { deviceId, creatorId } = await req.json()
  if (!deviceId || !creatorId) {
    return NextResponse.json({ error: 'deviceId and creatorId are required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('creator_id', creatorId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('device_id', deviceId).eq('creator_id', creatorId)
  } else {
    await supabase.from('favorites').insert({ device_id: deviceId, creator_id: creatorId })
  }

  return NextResponse.json({ favorited: !existing })
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/favorite/__tests__/route.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/favorite/route.ts app/api/favorite/__tests__/route.test.ts
git commit -m "feat: add POST /api/favorite route"
```

---

## Task 10: `GET /api/feed`

**Files:**
- Create: `app/api/feed/route.ts`
- Create: `app/api/feed/__tests__/route.test.ts`

The feed route returns enriched entries: `{ item, creator, app }[]`. This matches how `app/feed/page.tsx` uses the data — it passes all three to the `<FeedItem>` component.

- [ ] **Step 1: Write the failing test**

```ts
// app/api/feed/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockFeedRow = {
  id: 'feed-uuid-1',
  creator_id: 'creator-x1y2',
  type: 'drop',
  app_id: 'test-app-a1b2',
  body: 'New app is live!',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  apps: {
    id: 'test-app-a1b2',
    title: 'Test App',
    tagline: 'A test tagline',
    link: 'https://example.com',
    creator_id: 'creator-x1y2',
    description: 'Desc',
    use_cases: ['Use 1'],
    tags: ['t1'],
    category: 'writing',
    access_type: ['web'],
    pricing: 'free',
    story_card: { problemStatement: 'P', solutionStatement: 'S', features: ['F'], gradientTheme: 'indigo-purple', shareableUrl: '/story/test' },
    social_copy: { twitter: 't', linkedin: 'l' },
    boost_count: 3,
    is_new: true,
  },
  creators: {
    id: 'creator-x1y2',
    name: 'Test Creator',
    bio: 'Bio',
    avatar: 'T',
    links: [],
    regular_count: 10,
  },
}

let hasFavorites = true

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'favorites') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                data: hasFavorites ? [{ creator_id: 'creator-x1y2' }] : [],
                error: null,
              })
            ),
          })),
        }
      }
      if (table === 'feed_items') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              order: jest.fn(() =>
                Promise.resolve({ data: [mockFeedRow], error: null })
              ),
            })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('GET /api/feed', () => {
  it('returns enriched feed entries for a device with favorites', async () => {
    hasFavorites = true
    const req = new NextRequest('http://localhost/api/feed?deviceId=dev1')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].item.hoursAgo).toBe(2)
    expect(json[0].creator.name).toBe('Test Creator')
    expect(json[0].app.title).toBe('Test App')
  })

  it('returns empty array when device has no favorites', async () => {
    hasFavorites = false
    const req = new NextRequest('http://localhost/api/feed?deviceId=dev1')
    const res = await GET(req)
    const json = await res.json()
    expect(json).toEqual([])
  })

  it('returns 400 when deviceId is missing', async () => {
    const req = new NextRequest('http://localhost/api/feed')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/feed/__tests__/route.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write the implementation**

```ts
// app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToFeedItem, dbRowToCreator, dbRowToApp } from '@/lib/db-mapping'

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 })
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('creator_id')
    .eq('device_id', deviceId)

  const creatorIds = (favorites ?? []).map((f: { creator_id: string }) => f.creator_id)
  if (creatorIds.length === 0) return NextResponse.json([])

  const { data: items, error } = await supabase
    .from('feed_items')
    .select('*, apps(*), creators(*)')
    .in('creator_id', creatorIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = (items ?? []).map((row: Record<string, unknown> & { apps: Record<string, unknown>; creators: Record<string, unknown> }) => ({
    item: dbRowToFeedItem(row),
    creator: dbRowToCreator(row.creators),
    app: dbRowToApp(row.apps),
  }))

  return NextResponse.json(entries)
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/feed/__tests__/route.test.ts --no-coverage
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add app/api/feed/route.ts app/api/feed/__tests__/route.test.ts
git commit -m "feat: add GET /api/feed route"
```

---

## Task 11: `POST /api/deliver` (delivery engine)

**Files:**
- Create: `app/api/deliver/route.ts`
- Create: `app/api/deliver/__tests__/route.test.ts`

Claude receives a compact app catalog + user query and returns a ranked array of app IDs. The route then fetches the full rows for those IDs.

- [ ] **Step 1: Write the failing test**

```ts
// app/api/deliver/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/deliver', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const mockApps = [
  {
    id: 'resume-ai-a1b2',
    title: 'ResumeAI',
    tagline: 'Tailor your CV',
    description: 'Paste job desc, get tailored CV',
    use_cases: ['Tailor CV'],
    tags: ['resume', 'writing'],
    category: 'writing',
    link: 'https://example.com',
    creator_id: 'creator-x1y2',
    access_type: ['web'],
    pricing: 'free',
    story_card: { problemStatement: 'P', solutionStatement: 'S', features: ['F'], gradientTheme: 'indigo-purple', shareableUrl: '/story/resume-ai' },
    social_copy: { twitter: 't', linkedin: 'l' },
    boost_count: 10,
    is_new: true,
  },
]

jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '["resume-ai-a1b2"]' }],
      }),
    },
  })),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'apps') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn((col: string, val: string) => {
              if (col === 'status') {
                return {
                  order: jest.fn(() =>
                    Promise.resolve({ data: mockApps, error: null })
                  ),
                }
              }
              return { in: jest.fn(() => Promise.resolve({ data: mockApps, error: null })) }
            }),
            in: jest.fn(() => Promise.resolve({ data: mockApps, error: null })),
          })),
        }
      }
      if (table === 'collections') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('POST /api/deliver', () => {
  it('returns ranked apps for a query', async () => {
    const res = await POST(makeRequest({ query: 'I need help with my resume' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.apps).toHaveLength(1)
    expect(json.apps[0].id).toBe('resume-ai-a1b2')
  })

  it('returns 400 when query is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/deliver/__tests__/route.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write the implementation**

```ts
// app/api/deliver/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { dbRowToApp, dbRowToCollection } from '@/lib/db-mapping'

const DELIVERY_SYSTEM = `You are an app discovery engine for AppDrop.
Given a user's problem and a catalog of apps, return the IDs of the 3-5 most relevant apps, ranked by relevance.
Output ONLY a JSON array of app IDs. Example: ["id1", "id2", "id3"]
No markdown, no explanation, no code fences.`

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const { data: allApps } = await supabase
    .from('apps')
    .select('id, title, tagline, description, use_cases, tags, category')
    .eq('status', 'published')
    .order('boost_count', { ascending: false })

  if (!allApps?.length) return NextResponse.json({ apps: [] })

  const catalog = allApps
    .map(a => `- ${a.id}: "${a.tagline}" | ${a.description} | tags: ${(a.tags as string[]).join(', ')} | category: ${a.category}`)
    .join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: DELIVERY_SYSTEM,
    messages: [{ role: 'user', content: `User problem: "${query}"\n\nApp catalog:\n${catalog}` }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
  let rankedIds: string[] = []
  try {
    rankedIds = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 422 })
  }

  const { data: matchedApps } = await supabase
    .from('apps')
    .select('*')
    .in('id', rankedIds)

  const appMap = new Map((matchedApps ?? []).map(a => [a.id, dbRowToApp(a)]))
  const apps = rankedIds.filter(id => appMap.has(id)).map(id => appMap.get(id)!)

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('updated_at', { ascending: false })

  const appTags = new Set(apps.flatMap(a => a.tags))
  const matchedCollection = (collections ?? []).find(col => {
    const overlap = (col.app_ids as string[]).filter(id => rankedIds.includes(id)).length
    return overlap >= 2
  })

  return NextResponse.json({
    apps,
    collection: matchedCollection ? dbRowToCollection(matchedCollection) : undefined,
  })
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/deliver/__tests__/route.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/deliver/route.ts app/api/deliver/__tests__/route.test.ts
git commit -m "feat: add POST /api/deliver route (Claude delivery engine)"
```

---

## Task 12: `POST /api/package` (packaging pipeline)

**Files:**
- Create: `app/api/package/route.ts`
- Create: `app/api/package/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/package/__tests__/route.test.ts
/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const validInput = {
  link: 'https://example.com',
  problem: 'It takes too long to tailor a resume',
  audience: 'Job seekers applying to multiple roles',
  features: 'AI rewriting, keyword matching, format preservation',
  access: ['web'],
  pricing: 'free',
  tags: 'resume writing jobs',
  creatorName: 'Kim Dev',
}

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/package', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const mockGenerated = {
  title: 'ResumeAI',
  tagline: 'Tailor your CV to any job in 60 seconds',
  description: 'AI-powered resume tailoring.',
  targetUser: 'Job seekers',
  category: 'writing',
  useCases: ['Tailor CV', 'Match keywords', 'Preserve format'],
  tags: ['resume', 'writing', 'AI', 'jobs', 'productivity'],
  storyCard: {
    problemStatement: 'Tailoring takes too long',
    solutionStatement: 'AI does it in 60 seconds',
    features: ['Keyword match', 'Format preserved', 'Any job posting'],
  },
  socialCopy: {
    twitter: 'Tailor your resume instantly',
    linkedin: 'Built an AI resume tailoring tool',
  },
}

jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockGenerated) }],
      }),
    },
  })),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

describe('POST /api/package', () => {
  it('returns a complete App object on valid input', async () => {
    const res = await POST(makeRequest(validInput))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('ResumeAI')
    expect(json.creatorId).toMatch(/^kim-dev-[a-z0-9]{4}$/)
    expect(json.id).toMatch(/^resumeai-[a-z0-9]{4}$/)
    expect(json.storyCard.gradientTheme).toBe('indigo-purple')
    expect(json.storyCard.shareableUrl).toMatch(/^\/story\/resumeai-/)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ link: 'https://example.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 422 when Claude returns invalid JSON', async () => {
    const { default: Anthropic } = jest.requireMock('@anthropic-ai/sdk')
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockResolvedValue({ content: [{ type: 'text', text: 'not json' }] }) },
    }))
    const res = await POST(makeRequest(validInput))
    expect(res.status).toBe(422)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest app/api/package/__tests__/route.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write the implementation**

```ts
// app/api/package/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/slug'
import { dbRowToApp } from '@/lib/db-mapping'
import type { GradientTheme, Category } from '@/lib/types'

const CATEGORY_GRADIENT: Record<string, GradientTheme> = {
  writing: 'indigo-purple',
  images: 'sky-indigo',
  audio: 'emerald-sky',
  video: 'amber-red',
  data: 'blue-teal',
  business: 'orange-amber',
  design: 'purple-pink',
  'ai-tools': 'teal-cyan',
}

const PACKAGING_SYSTEM = `You are an app packaging assistant for AppDrop, a platform that helps developers present their apps to non-technical users.

You will receive answers a developer filled out about their app. Generate a complete app package based on those answers.

Important: do not attempt to infer anything from the app URL — it is provided for reference only. Generate everything from the developer's answers.

Output ONLY valid JSON — no markdown, no explanation, no code fences.`

function buildPackagingPrompt(input: {
  link: string; problem: string; audience: string
  features: string; access: string[]; pricing: string; tags: string
}): string {
  return `App URL (destination only, not analyzed): ${input.link}
Problem it solves: ${input.problem}
Target user: ${input.audience}
Core features: ${input.features}
Access type: ${input.access.join(', ')}
Pricing: ${input.pricing}
Category tags (hint): ${input.tags}

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
}`
}

const REQUIRED_FIELDS = ['link', 'problem', 'audience', 'features', 'access', 'pricing', 'creatorName']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const missing = REQUIRED_FIELDS.filter(f => !body[f])
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
  }

  const { link, problem, audience, features, access, pricing, tags, creatorName } = body

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: PACKAGING_SYSTEM,
    messages: [{ role: 'user', content: buildPackagingPrompt({ link, problem, audience, features, access, pricing, tags }) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : null
  if (!text) return NextResponse.json({ error: 'No response from AI' }, { status: 422 })

  let generated: Record<string, unknown>
  try {
    generated = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 422 })
  }

  const appId = generateId(generated.title as string)
  const category = (generated.category as string) || 'ai-tools'
  const gradientTheme: GradientTheme = CATEGORY_GRADIENT[category] ?? 'teal-cyan'

  const { data: existingCreator } = await supabase
    .from('creators')
    .select('id')
    .ilike('name', creatorName)
    .single()

  const creatorId = existingCreator?.id ?? generateId(creatorName)

  if (!existingCreator) {
    await supabase.from('creators').insert({
      id: creatorId,
      name: creatorName,
      avatar: creatorName.charAt(0).toUpperCase(),
    })
  }

  const appRow = {
    id: appId,
    title: generated.title,
    tagline: generated.tagline,
    link,
    creator_id: creatorId,
    description: generated.description,
    use_cases: generated.useCases,
    tags: generated.tags,
    category: category as Category,
    access_type: access,
    pricing,
    story_card: {
      problemStatement: (generated.storyCard as Record<string, unknown>).problemStatement,
      solutionStatement: (generated.storyCard as Record<string, unknown>).solutionStatement,
      features: (generated.storyCard as Record<string, unknown>).features,
      gradientTheme,
      shareableUrl: `/story/${appId}`,
    },
    social_copy: generated.socialCopy,
    boost_count: 0,
    is_new: true,
    status: 'published',
  }

  const { error: insertError } = await supabase.from('apps').insert(appRow)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  await supabase.from('feed_items').insert({
    creator_id: creatorId,
    type: 'drop',
    app_id: appId,
    body: `${generated.title} is now live on AppDrop.`,
  })

  return NextResponse.json(dbRowToApp(appRow))
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest app/api/package/__tests__/route.test.ts --no-coverage
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Run all API tests together**

```bash
npx jest app/api --no-coverage
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add app/api/package/route.ts app/api/package/__tests__/route.test.ts
git commit -m "feat: add POST /api/package route (Claude packaging pipeline)"
```

---

## Task 13: Seed Supabase with initial data

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create the seed file**

```sql
-- supabase/seed.sql
-- Run in Supabase Dashboard → SQL Editor after schema.sql

-- Creators
insert into creators (id, name, bio, avatar, links) values
  ('kimdev-a1b2', 'KimDev Studio', 'AI tools for everyday problems. Based in Seoul.', 'K', '{"https://kimdev.example.com"}'),
  ('novatech-c3d4', 'NovaTech Labs', 'Building AI-native productivity tools.', 'N', '{"https://novatech.example.com"}'),
  ('writesmart-e5f6', 'WriteSmart', 'AI writing tools for creators and marketers.', 'W', '{"https://writesmart.example.com"}'),
  ('shipfast-g7h8', 'ShipFast', 'Tools to ship products faster.', 'S', '{"https://shipfast.example.com"}')
on conflict (id) do nothing;

-- Apps
insert into apps (id, title, tagline, link, creator_id, description, use_cases, tags, category, access_type, pricing, story_card, social_copy, boost_count, is_new) values
(
  'resume-ai-i9j0',
  'ResumeAI',
  'Tailor your CV to any job in 60 seconds',
  'https://resumeai.example.com',
  'kimdev-a1b2',
  'Paste a job description, upload your resume, get a tailored version instantly.',
  array['Tailor your CV to a specific job posting', 'Match keywords from the job description automatically', 'Keep your original voice and formatting'],
  array['resume', 'job search', 'writing', 'AI'],
  'writing',
  array['web'],
  'free',
  '{"problemStatement": "Tailoring your CV to every job description takes way too long", "solutionStatement": "Paste a job description. Upload your resume. Get a tailored version in 60 seconds.", "features": ["Matches keywords automatically", "Keeps your original voice", "Works with any file format"], "gradientTheme": "indigo-purple", "shareableUrl": "/story/resume-ai-i9j0"}'::jsonb,
  '{"twitter": "Spent 2 hours tailoring my resume last week.\n\nResumeAI does it in 60 seconds. Free → [link]", "linkedin": "I built a free tool that makes resume tailoring instant."}'::jsonb,
  243,
  true
),
(
  'pixeldrop-k1l2',
  'PixelDrop',
  'Upload once, get every image size instantly',
  'https://pixeldrop.example.com',
  'kimdev-a1b2',
  'Resize any image for every platform in seconds. No Photoshop needed.',
  array['Resize product photos for Shopify', 'Prep images for Instagram and LinkedIn at once', 'Remove backgrounds without design software'],
  array['images', 'resize', 'design', 'social media'],
  'images',
  array['web'],
  'free',
  '{"problemStatement": "Resizing images for every platform wastes hours every week", "solutionStatement": "Upload once, get every size instantly.", "features": ["Batch resize any image", "Exports for all major platforms", "Background removal included"], "gradientTheme": "sky-indigo", "shareableUrl": "/story/pixeldrop-k1l2"}'::jsonb,
  '{"twitter": "Stop wasting 20 mins resizing images before every post.\n\nPixelDrop does it in 3 seconds. Free → [link]", "linkedin": "I built a free tool that saves social media managers time every week."}'::jsonb,
  512,
  false
),
(
  'voicenote-m3n4',
  'VoiceNote Pro',
  'Transcribe and summarize your voice memos automatically',
  'https://voicenotepro.example.com',
  'novatech-c3d4',
  'Record a voice note, get a clean transcription, summary, and action items automatically.',
  array['Turn meeting voice notes into structured summaries', 'Extract action items from recorded ideas', 'Search across all your voice memos'],
  array['audio', 'transcription', 'productivity', 'notes'],
  'audio',
  array['web'],
  'freemium',
  '{"problemStatement": "Voice recordings are messy and impossible to search or act on", "solutionStatement": "Record, transcribe, summarize, and extract action items automatically.", "features": ["Accurate transcription in 30+ languages", "AI summary + action items", "Full-text search across all memos"], "gradientTheme": "emerald-sky", "shareableUrl": "/story/voicenote-m3n4"}'::jsonb,
  '{"twitter": "VoiceNote Pro transcribes, summarizes, and extracts action items automatically.", "linkedin": "Every voice memo I record becomes a searchable, structured note automatically."}'::jsonb,
  187,
  true
),
(
  'blogai-o5p6',
  'BlogAI',
  'Turn rough notes into polished blog posts',
  'https://blogai.example.com',
  'writesmart-e5f6',
  'Paste your bullet points or rough notes and get a full, well-structured blog post written in your style.',
  array['Turn LinkedIn drafts into full articles', 'Expand bullet notes into structured posts', 'Generate multiple variations to choose from'],
  array['writing', 'blogging', 'content', 'AI'],
  'writing',
  array['web'],
  'freemium',
  '{"problemStatement": "Turning rough notes into polished posts takes hours of editing", "solutionStatement": "Paste your notes, get a full blog post in your voice.", "features": ["Preserves your writing style", "Multiple variation options", "Works from bullet points"], "gradientTheme": "indigo-purple", "shareableUrl": "/story/blogai-o5p6"}'::jsonb,
  '{"twitter": "BlogAI turns my rough notes into full posts in seconds.", "linkedin": "Built an AI blog writing tool that actually sounds like you."}'::jsonb,
  156,
  false
),
(
  'launchkit-q7r8',
  'LaunchKit',
  'Everything you need to ship your product this week',
  'https://launchkit.example.com',
  'shipfast-g7h8',
  'Landing page, waitlist, and launch checklist in one place. Go from idea to live in a day.',
  array['Build a landing page without code', 'Collect waitlist signups before launch', 'Run through a 50-step launch checklist'],
  array['launch', 'startup', 'landing page', 'no-code', 'business'],
  'business',
  array['web'],
  'freemium',
  '{"problemStatement": "Launching a product is overwhelming — too many tools, too much setup", "solutionStatement": "Landing page, waitlist, and launch checklist in one place.", "features": ["No-code landing page builder", "Built-in waitlist and email collection", "50-step launch checklist"], "gradientTheme": "orange-amber", "shareableUrl": "/story/launchkit-q7r8"}'::jsonb,
  '{"twitter": "LaunchKit: from idea to live product in one day. No code needed.", "linkedin": "Built the tool I wished I had for my last product launch."}'::jsonb,
  89,
  true
)
on conflict (id) do nothing;

-- Collections
insert into collections (id, title, description, emoji, app_ids) values
(
  'solo-founder',
  'Solo Founder Starter Pack',
  'Everything you need to go from idea to launched product — without a team.',
  '🚀',
  array['launchkit-q7r8', 'blogai-o5p6', 'pixeldrop-k1l2', 'resume-ai-i9j0']
),
(
  'content-creator',
  'Content Creator Toolkit',
  'Script, record, edit, and publish faster.',
  '✍️',
  array['blogai-o5p6', 'voicenote-m3n4', 'pixeldrop-k1l2']
),
(
  'job-seeker',
  'Job Seeker Kit',
  'Stand out at every stage of the application process.',
  '💼',
  array['resume-ai-i9j0', 'blogai-o5p6']
)
on conflict (id) do nothing;

-- Feed items
insert into feed_items (creator_id, type, app_id, body) values
  ('kimdev-a1b2', 'drop', 'resume-ai-i9j0', 'ResumeAI is now live — tailor your CV to any job in 60 seconds. Free forever.'),
  ('novatech-c3d4', 'drop', 'voicenote-m3n4', 'VoiceNote Pro just launched. Your voice memos will never be messy again.'),
  ('writesmart-e5f6', 'update', 'blogai-o5p6', 'BlogAI now supports generating 3 variations at once. Pick the one that sounds most like you.'),
  ('shipfast-g7h8', 'beta', 'launchkit-q7r8', 'LaunchKit beta is open — looking for 50 early testers. Lifetime deal for beta users.');
```

- [ ] **Step 2: Run the seed in Supabase**

Go to Supabase Dashboard → SQL Editor → paste seed.sql → Run.
Verify in Table Editor that all 5 apps, 4 creators, 3 collections, and 4 feed items appear.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "chore: add supabase seed data"
```

---

## Task 14: Wire submit form — add `creatorName` field and sessionStorage

**Files:**
- Modify: `app/submit/page.tsx`

- [ ] **Step 1: Update the submit page**

Replace the entire file content:

```tsx
// app/submit/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import type { AccessType, Pricing } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

const accessOptions: AccessType[] = ['web', 'api', 'download', 'extension']
const accessLabels: Record<AccessType, string> = {
  web: 'Web App', api: 'API', download: 'Download', extension: 'Extension',
}
const pricingOptions: Pricing[] = ['free', 'freemium', 'paid']

export default function SubmitPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [creatorName, setCreatorName] = useState('')
  const [link, setLink] = useState('')
  const [problem, setProblem] = useState('')
  const [audience, setAudience] = useState('')
  const [features, setFeatures] = useState('')
  const [access, setAccess] = useState<AccessType[]>([])
  const [pricing, setPricing] = useState<Pricing | ''>('')
  const [tags, setTags] = useState('')

  function toggleAccess(type: AccessType) {
    setAccess(prev => prev.includes(type) ? prev.filter(a => a !== type) : [...prev, type])
  }

  function handleSubmit() {
    if (!creatorName || !link || !problem || !audience || !features || access.length === 0 || !pricing) return
    sessionStorage.setItem('submitForm', JSON.stringify({
      creatorName, link, problem, audience, features, access, pricing, tags,
    }))
    router.push('/submit/generating')
  }

  return (
    <div className="pb-10 min-h-screen bg-gray-950">
      <TopBar title={t('submit.title')} />
      <div className="p-4 flex flex-col gap-5">
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">Your name or handle</label>
          <input value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g. KimDev Studio" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q1')}</label>
          <input value={link} onChange={e => setLink(e.target.value)} placeholder={t('submit.q1_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q2')}</label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder={t('submit.q2_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q3')}</label>
          <input value={audience} onChange={e => setAudience(e.target.value)} placeholder={t('submit.q3_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q4')}</label>
          <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder={t('submit.q4_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q5')}</label>
          <div className="flex flex-wrap gap-2">
            {accessOptions.map(opt => (
              <button key={opt} onClick={() => toggleAccess(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${access.includes(opt) ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                {accessLabels[opt]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q6')}</label>
          <div className="flex gap-2">
            {pricingOptions.map(opt => (
              <button key={opt} onClick={() => setPricing(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${pricing === opt ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q7')}</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder={t('submit.q7_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <button onClick={handleSubmit} className="w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl mt-2">
          {t('submit.cta')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/submit/page.tsx
git commit -m "feat: add creatorName field and sessionStorage to submit form"
```

---

## Task 15: Wire generating page — real API call

**Files:**
- Modify: `app/submit/generating/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// app/submit/generating/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { packageApp } from '@/lib/api'
import { useLocale } from '@/lib/i18n'

export default function GeneratingPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    t('generating.step.0'),
    t('generating.step.1'),
    t('generating.step.2'),
  ]

  // Animate steps independently of the API call
  useEffect(() => {
    if (step >= steps.length - 1) return
    const timer = setTimeout(() => setStep(s => s + 1), 4000)
    return () => clearTimeout(timer)
  }, [step, steps.length])

  // Make the real API call
  useEffect(() => {
    const raw = sessionStorage.getItem('submitForm')
    if (!raw) { router.push('/submit'); return }

    packageApp(JSON.parse(raw))
      .then(app => {
        sessionStorage.setItem('generatedApp', JSON.stringify(app))
        router.push('/submit/preview')
      })
      .catch(err => {
        setError(err.message || 'Generation failed. Please try again.')
      })
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900 flex items-center justify-center text-3xl mb-6">⚠️</div>
        <h2 className="text-white font-extrabold text-xl mb-2">Generation failed</h2>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => router.push('/submit')}
          className="px-6 py-3 bg-brand text-white font-bold rounded-xl text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30">
        🤖
      </div>
      <h2 className="text-white font-extrabold text-xl mb-1">{t('generating.title')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('generating.subtitle')}</p>
      <div className="w-full max-w-xs flex flex-col gap-3 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all ${i < step ? 'bg-brand text-white' : i === step ? 'bg-indigo-900 border-2 border-brand' : 'border border-gray-700'}`}>
              {i < step ? '✓' : ''}
            </div>
            <span className={`text-sm ${i <= step ? 'text-white' : 'text-gray-600'}`}>{s}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/submit/generating/page.tsx
git commit -m "feat: wire generating page to real package API"
```

---

## Task 16: Wire preview page — read from sessionStorage

**Files:**
- Modify: `app/submit/preview/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// app/submit/preview/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import StoryCard from '@/components/story/StoryCard'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

export default function PreviewPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [app, setApp] = useState<App | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('generatedApp')
    if (!raw) { router.push('/submit'); return }
    setApp(JSON.parse(raw))
  }, [router])

  if (!app) return null

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/submit"
        title={t('preview.title')}
        rightAction={
          <Link href="/" className="text-brand text-sm font-bold">{t('preview.publish')}</Link>
        }
      />
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-gray-500 text-center">{t('preview.subtitle')}</p>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.story_card')}</p>
          <StoryCard app={app} showActions={false} />
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.twitter')}</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{app.socialCopy.twitter}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.linkedin')}</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{app.socialCopy.linkedin}</p>
          </div>
        </div>

        <Link href="/" className="block w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl text-center mt-2">
          {t('preview.publish_cta')}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/submit/preview/page.tsx
git commit -m "feat: wire preview page to read generated app from sessionStorage"
```

---

## Task 17: Wire results page — call `/api/deliver`

**Files:**
- Modify: `app/results/page.tsx`

- [ ] **Step 1: Replace the Results component**

```tsx
// app/results/page.tsx
'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'
import { deliverApps } from '@/lib/api'
import type { App, Collection } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import Link from 'next/link'

function Results() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''
  const { t } = useLocale()
  const [apps, setApps] = useState<App[]>([])
  const [collection, setCollection] = useState<Collection | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    deliverApps(query)
      .then(result => {
        setApps(result.apps)
        setCollection(result.collection)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/"
        title={`${t('results.heading')} "${query.slice(0, 25)}${query.length > 25 ? '…' : ''}"`}
      />
      <div className="p-4 flex flex-col gap-3">
        {query && <p className="text-xs text-gray-500 italic">"{query}"</p>}
        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}
        {!loading && !error && apps.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
        {!loading && !error && apps.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No matching apps found.</p>
        )}
        {collection && (
          <Link href={`/collections/${collection.id}`} className="border border-indigo-100 rounded-2xl p-3 bg-indigo-50 flex items-center gap-3">
            <span className="text-2xl">{collection.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-700">{collection.title}</p>
              <p className="text-[10px] text-indigo-400">{collection.appIds.length} {t('collections.apps')}</p>
            </div>
            <span className="text-xs text-indigo-500 font-semibold">{t('home.see_all')} →</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading results...</div>}>
      <Results />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/results/page.tsx
git commit -m "feat: wire results page to /api/deliver"
```

---

## Task 18: Wire home page — call `/api/apps`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import StoryRing from '@/components/story/StoryRing'
import ProblemInput from '@/components/discover/ProblemInput'
import CategoryGrid from '@/components/discover/CategoryGrid'
import CollectionCard from '@/components/collection/CollectionCard'
import AppCard from '@/components/app/AppCard'
import { fetchApps, fetchCollections } from '@/lib/api'
import type { App, Collection } from '@/lib/types'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function DiscoverPage() {
  const { t, localizeCollection } = useLocale()
  const [apps, setApps] = useState<App[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetchApps().then(setApps).catch(() => {})
    fetchCollections().then(setCollections).catch(() => {})
  }, [])

  const newApps = apps.filter(a => a.isNew)
  const featuredApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20">
      <TopBar
        rightAction={
          <div className="flex items-center gap-3 text-gray-500 text-lg">
            <Link href="/input">🔍</Link>
            <span>🔔</span>
            <Link href="/submit" className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-base font-bold leading-none">+</Link>
          </div>
        }
      />
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-4 overflow-x-auto">
        {featuredApps.slice(0, 6).map((app, i) => (
          <StoryRing key={app.id} app={app} seen={i > 2} />
        ))}
      </div>
      <ProblemInput />
      <CategoryGrid />
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('home.featured_collections')}</p>
          <Link href="/collections" className="text-[10px] text-brand font-semibold">{t('home.see_all')}</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {collections.map(col => (
            <div key={col.id} className="flex-shrink-0 w-44">
              <CollectionCard collection={localizeCollection(col)} compact />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 mt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('home.new_drops')}</p>
        <div className="flex flex-col gap-3">
          {newApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire home page to /api/apps and /api/collections"
```

---

## Task 19: Wire feed page — call `/api/feed`

**Files:**
- Modify: `app/feed/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// app/feed/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { fetchFeed } from '@/lib/api'
import type { FeedEntry } from '@/lib/api'
import FeedItem from '@/components/feed/FeedItem'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useLocale } from '@/lib/i18n'

export default function FeedPage() {
  const { t } = useLocale()
  const deviceId = useDeviceId()
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deviceId) return
    fetchFeed(deviceId)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deviceId])

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">{t('feed.title')}</p>
        <p className="text-xs text-gray-400">{t('feed.subtitle')}</p>
      </div>
      {loading && (
        <div className="p-4 flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}
      {!loading && entries.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">{t('feed.empty')}</p>
          <p className="text-gray-300 text-xs mt-1">{t('feed.empty_hint')}</p>
        </div>
      )}
      {!loading && entries.length > 0 && (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{t('feed.today')}</p>
          {entries.map(({ item, creator, app }) => (
            <FeedItem key={item.id} item={item} creator={creator} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/feed/page.tsx
git commit -m "feat: wire feed page to /api/feed"
```

---

## Task 20: Wire collections page — call `/api/collections`

**Files:**
- Modify: `app/collections/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// app/collections/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { fetchCollections } from '@/lib/api'
import type { Collection } from '@/lib/types'
import CollectionCard from '@/components/collection/CollectionCard'
import { useLocale } from '@/lib/i18n'

export default function CollectionsPage() {
  const { t, localizeCollection } = useLocale()
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {})
  }, [])

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">{t('collections.title')}</p>
        <p className="text-xs text-gray-400">{t('collections.subtitle')}</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {collections.map(col => (
          <CollectionCard key={col.id} collection={localizeCollection(col)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/collections/page.tsx
git commit -m "feat: wire collections page to /api/collections"
```

---

## Task 21: Wire boost button in `AppCard` and `StoryCard`

**Files:**
- Modify: `components/app/AppCard.tsx`
- Modify: `components/story/StoryCard.tsx`

- [ ] **Step 1: Update `AppCard`**

```tsx
// components/app/AppCard.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { App } from '@/lib/types'
import StoryCardMini from '@/components/story/StoryCardMini'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost } from '@/lib/api'

export default function AppCard({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const deviceId = useDeviceId()
  const [boostCount, setBoostCount] = useState(a.boostCount)
  const [boosted, setBoosted] = useState(false)

  async function handleBoost() {
    if (!deviceId) return
    const prev = { boosted, boostCount }
    setBoosted(b => !b)
    setBoostCount(c => boosted ? c - 1 : c + 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prev.boosted)
      setBoostCount(prev.boostCount)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <StoryCardMini app={app} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.tagline}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {boostCount}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={a.link}
            target="_blank"
            className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
          >
            {t('app.try')}
          </Link>
          <button
            onClick={handleBoost}
            className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${boosted ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {t('app.boost')}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-1.5 text-xs">⭐</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `StoryCard`**

```tsx
// components/story/StoryCard.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost } from '@/lib/api'

interface StoryCardProps {
  app: App
  showActions?: boolean
}

export default function StoryCard({ app, showActions = true }: StoryCardProps) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const gradient = gradientMap[a.storyCard.gradientTheme]
  const deviceId = useDeviceId()
  const [boostCount, setBoostCount] = useState(a.boostCount)
  const [boosted, setBoosted] = useState(false)

  async function handleBoost() {
    if (!deviceId) return
    const prev = { boosted, boostCount }
    setBoosted(b => !b)
    setBoostCount(c => boosted ? c - 1 : c + 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prev.boosted)
      setBoostCount(prev.boostCount)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className={`bg-gradient-to-br ${gradient} p-5 text-center text-white`}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-2">{t('card.the_problem')}</p>
        <p className="font-bold text-sm leading-snug mb-3">{a.storyCard.problemStatement}</p>
        <div className="w-6 h-px bg-white/30 mx-auto mb-3" />
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">{t('card.the_solution')}</p>
        <p className="font-bold text-base">{a.title}</p>
        <p className="text-xs opacity-80 mt-1">{a.storyCard.solutionStatement}</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.pricing} · {a.accessType[0]}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {boostCount}</p>
        </div>
        <ul className="mb-3 space-y-1">
          {a.storyCard.features.map(f => (
            <li key={f} className="text-[11px] text-gray-600 flex gap-1">
              <span className="text-brand">✓</span> {f}
            </li>
          ))}
        </ul>
        {showActions && (
          <div className="flex gap-2">
            <Link
              href={a.link}
              target="_blank"
              className="flex-[2] bg-brand text-white rounded-xl py-2 text-center text-xs font-bold"
            >
              {t('card.try')} {a.title} →
            </Link>
            <button
              onClick={handleBoost}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${boosted ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {t('card.boost')}
            </button>
            <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-xs font-medium">⭐</button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/app/AppCard.tsx components/story/StoryCard.tsx
git commit -m "feat: wire boost button with optimistic UI in AppCard and StoryCard"
```

---

## Task 22: Wire favorite button in `AppCard`

**Files:**
- Modify: `components/app/AppCard.tsx`

The ⭐ button in AppCard favorites the creator of the app (since apps belong to creators).

- [ ] **Step 1: Update `AppCard` to wire the favorite button**

```tsx
// components/app/AppCard.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { App } from '@/lib/types'
import StoryCardMini from '@/components/story/StoryCardMini'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost, toggleFavorite } from '@/lib/api'

export default function AppCard({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const deviceId = useDeviceId()
  const [boostCount, setBoostCount] = useState(a.boostCount)
  const [boosted, setBoosted] = useState(false)
  const [favorited, setFavorited] = useState(false)

  async function handleBoost() {
    if (!deviceId) return
    const prev = { boosted, boostCount }
    setBoosted(b => !b)
    setBoostCount(c => boosted ? c - 1 : c + 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prev.boosted)
      setBoostCount(prev.boostCount)
    }
  }

  async function handleFavorite() {
    if (!deviceId) return
    const prev = favorited
    setFavorited(f => !f)
    try {
      const result = await toggleFavorite(deviceId, app.creatorId)
      setFavorited(result.favorited)
    } catch {
      setFavorited(prev)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <StoryCardMini app={app} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.tagline}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {boostCount}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={a.link}
            target="_blank"
            className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
          >
            {t('app.try')}
          </Link>
          <button
            onClick={handleBoost}
            className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${boosted ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {t('app.boost')}
          </button>
          <button
            onClick={handleFavorite}
            className={`flex-1 rounded-xl py-1.5 text-xs transition-colors ${favorited ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            ⭐
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests to confirm nothing is broken**

```bash
npx jest --no-coverage
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/app/AppCard.tsx
git commit -m "feat: wire favorite button in AppCard"
```

---

## Self-Review Checklist

### Spec coverage
- [x] Packaging pipeline (Claude prompt, sessionStorage flow, form field) → Tasks 12, 14, 15, 16
- [x] Delivery engine (Claude ranking, collection matching) → Task 11
- [x] Supabase schema with trigger → Task 2
- [x] Collision-safe IDs → Task 3 (`generateId`), used in Task 12
- [x] Boost as lightweight endorsement → Tasks 8, 21
- [x] Favorite creator → Tasks 9, 22
- [x] Feed (chronological, favorites-only) → Tasks 10, 19
- [x] Collections → Tasks 7, 20
- [x] Home page with real data → Task 18
- [x] Results page with real delivery → Task 17
- [x] Device ID (anonymous) → Task 5
- [x] `updatedDaysAgo` computed from `updated_at` → Task 4 (`dbRowToCollection`)
- [x] `hoursAgo` computed from `created_at` → Task 4 (`dbRowToFeedItem`)
- [x] Optimistic UI for boost/favorite → Tasks 21, 22
- [x] Seed data → Task 13
- [x] No URL scraping in Claude prompt → Task 12 (system prompt says "do not attempt to infer from URL")
- [x] Creator name as submit form field (Q0) → Task 14

### Type consistency
- `FeedEntry` defined in `lib/api.ts` (Task 5), used in `app/feed/page.tsx` (Task 19) ✓
- `dbRowToApp`, `dbRowToCreator`, `dbRowToCollection`, `dbRowToFeedItem` defined in Task 4, used in route handlers Tasks 6–12 ✓
- `generateId` defined in Task 3, used in Task 12 ✓
- `toggleBoost` / `toggleFavorite` defined in Task 5, used in Tasks 21–22 ✓
- `packageApp` defined in Task 5, used in Task 15 ✓
- `deliverApps` defined in Task 5, used in Task 17 ✓
