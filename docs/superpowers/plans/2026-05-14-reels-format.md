# AppDrop Reels Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Story card viewer with a full-screen swipeable Reels feed, with developer video upload and an animated-fallback path for every app.

**Architecture:** A new `ReelViewer` component handles both paths (uploaded video + animated sequence). A new `/reels` tab and `/reel/[appId]` shareable route use it. The existing `StoryCard` stays for list views; only the full-screen viewer changes.

**Tech Stack:** Next.js 16, React 19, Framer Motion, Tailwind CSS, Supabase Storage (video upload), TypeScript

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/types.ts` | Add `reelVideoUrl?: string` to `App` |
| Modify | `lib/mock-data/apps.ts` | Update `shareableUrl` from `/story/` to `/reel/` |
| Modify | `lib/i18n/index.tsx` | Add new keys: `nav.reels`, `reel.*`, `submit.reel_*`, `preview.reel_preview` |
| Create | `hooks/useReelFeed.ts` | Index management for the feed (next/prev, bounds) |
| Create | `hooks/__tests__/useReelFeed.test.ts` | Tests for useReelFeed |
| Create | `components/story/ReelViewer.tsx` | Full-screen viewer: video path + animated fallback, swipe gestures |
| Create | `components/story/__tests__/ReelViewer.test.tsx` | Tests for ReelViewer |
| Create | `app/reels/page.tsx` | Reels tab — full ranked feed |
| Create | `app/reel/[appId]/page.tsx` | Shareable Reel page — starts at specific app |
| Modify | `app/story/[appId]/page.tsx` | Redirect to `/reel/[appId]` |
| Modify | `components/layout/BottomTabBar.tsx` | Add Reels tab (center, index 2) |
| Modify | `components/layout/__tests__/BottomTabBar.test.tsx` | Update for 5th tab |
| Modify | `components/story/StoryRing.tsx` | Change href from `/story/` to `/reel/` |
| Modify | `components/app/AppCard.tsx` | Add "Watch Reel →" button |
| Modify | `components/app/__tests__/AppCard.test.tsx` | Add Watch Reel button test |
| Modify | `app/submit/page.tsx` | Add video upload step 8 |
| Modify | `app/submit/generating/page.tsx` | Merge `reelVideoUrl` from form data into generated app |
| Modify | `app/submit/preview/page.tsx` | Replace StoryCard preview with ReelViewer phone frame |

---

## Task 1: Data model, mock data, and i18n keys

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/mock-data/apps.ts`
- Modify: `lib/i18n/index.tsx`

- [ ] **Step 1: Add `reelVideoUrl` to the `App` type**

In `lib/types.ts`, add one field to the `App` interface after `isNew`:

```ts
export interface App {
  id: string
  title: string
  tagline: string
  link: string
  creatorId: string
  description: string
  useCases: string[]
  tags: string[]
  category: Category
  accessType: AccessType[]
  pricing: Pricing
  storyCard: StoryCard
  socialCopy: { twitter: string; linkedin: string }
  boostCount: number
  isNew: boolean
  reelVideoUrl?: string
}
```

- [ ] **Step 2: Update `shareableUrl` in all mock apps**

In `lib/mock-data/apps.ts`, replace every `/story/` prefix in `shareableUrl` with `/reel/`. There are 5 entries:

```ts
shareableUrl: '/reel/resume-ai',
// ...
shareableUrl: '/reel/pixeldrop',
// ...
shareableUrl: '/reel/voicenote-pro',
// ...
shareableUrl: '/reel/blogai',
// ...
shareableUrl: '/reel/launchkit',
```

- [ ] **Step 3: Add new i18n keys**

In `lib/i18n/index.tsx`, add the following keys to the `en` messages object (after the `'creator.badge.announcement'` entry) and to the `ko` messages object:

```ts
// en additions — insert before the closing `},` of the en block
// Reels
'nav.reels': 'Reels',
'reel.watch': 'Watch Reel →',
'reel.try': 'Try',
'reel.boost': '⬆ Boost',
'reel.save_creator': '⭐ Save Creator',
'reel.swipe_hint': 'Swipe up for next · Tap sides to navigate',
// Submit — reel upload
'submit.reel_label': '8. Add your Reel (optional)',
'submit.reel_hint': 'Upload a 15–30s vertical MP4 that shows your app in action.',
'submit.reel_accept': 'Accepted: MP4, MOV · Max 50MB · Recommended: 9:16 vertical',
'submit.reel_skip': 'Skip — we\'ll animate your Reel →',
'submit.reel_selected': 'Video selected:',
// Preview
'preview.reel_preview': 'Reel Preview',
```

```ts
// ko additions — insert before the closing `},` of the ko block
'nav.reels': '릴스',
'reel.watch': '릴 보기 →',
'reel.try': '사용해보기',
'reel.boost': '⬆ 부스트',
'reel.save_creator': '⭐ 크리에이터 저장',
'reel.swipe_hint': '위로 스와이프하면 다음 · 양옆 탭으로 이동',
'submit.reel_label': '8. 릴 영상 추가 (선택 사항)',
'submit.reel_hint': '앱 사용 모습을 담은 15~30초 세로 영상(MP4)을 업로드하세요.',
'submit.reel_accept': '허용 형식: MP4, MOV · 최대 50MB · 권장: 9:16 세로',
'submit.reel_skip': '건너뛰기 — 자동으로 애니메이션 릴을 만들어드릴게요 →',
'submit.reel_selected': '선택된 영상:',
'preview.reel_preview': '릴 미리보기',
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/mock-data/apps.ts lib/i18n/index.tsx
git commit -m "feat: add reelVideoUrl to App type, update shareableUrl, add reel i18n keys"
```

---

## Task 2: `useReelFeed` hook

**Files:**
- Create: `hooks/useReelFeed.ts`
- Create: `hooks/__tests__/useReelFeed.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `hooks/__tests__/useReelFeed.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useReelFeed } from '../useReelFeed'

test('starts at index 0', () => {
  const { result } = renderHook(() => useReelFeed(5))
  expect(result.current.currentIndex).toBe(0)
})

test('next() increments the index', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(1)
})

test('next() does not go past total - 1', () => {
  const { result } = renderHook(() => useReelFeed(3))
  act(() => result.current.next())
  act(() => result.current.next())
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(2)
})

test('prev() decrements the index', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.next())
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})

test('prev() does not go below 0', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx jest hooks/__tests__/useReelFeed.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '../useReelFeed'"

- [ ] **Step 3: Implement `useReelFeed`**

Create `hooks/useReelFeed.ts`:

```ts
import { useState, useCallback } from 'react'

export function useReelFeed(total: number) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, total - 1))
  }, [total])

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  return { currentIndex, next, prev }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest hooks/__tests__/useReelFeed.test.ts --no-coverage
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add hooks/useReelFeed.ts hooks/__tests__/useReelFeed.test.ts
git commit -m "feat: add useReelFeed hook"
```

---

## Task 3: `ReelViewer` — core component

**Files:**
- Create: `components/story/ReelViewer.tsx`
- Create: `components/story/__tests__/ReelViewer.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/story/__tests__/ReelViewer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ReelViewer from '../ReelViewer'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'card.the_problem': 'The Problem',
      'card.the_solution': 'The Solution',
      'reel.try': 'Try',
      'reel.boost': '⬆ Boost',
      'reel.save_creator': '⭐ Save Creator',
      'reel.swipe_hint': 'Swipe up for next',
      'viewer.new_drop': 'New drop',
      'viewer.featured': 'Featured',
    }[key] ?? key),
    localizeApp: (a: (typeof apps)[0]) => a,
  }),
}))

jest.mock('@/hooks/useDeviceId', () => ({
  useDeviceId: () => 'test-device',
}))

jest.mock('@/lib/api', () => ({
  toggleBoost: jest.fn(),
  toggleFavorite: jest.fn(),
}))

const app = apps[0]

test('renders problem statement', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getByText(app.storyCard.problemStatement)).toBeInTheDocument()
})

test('renders solution statement', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getByText(app.storyCard.solutionStatement)).toBeInTheDocument()
})

test('renders app title', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getAllByText(app.title).length).toBeGreaterThan(0)
})

test('renders all features', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  app.storyCard.features.forEach(f => {
    expect(screen.getByText(f)).toBeInTheDocument()
  })
})

test('renders Try CTA link pointing to app.link', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  const links = screen.getAllByRole('link').filter(l => l.getAttribute('href') === app.link)
  expect(links.length).toBeGreaterThan(0)
})

test('renders video element when reelVideoUrl is set', () => {
  const appWithVideo = { ...app, reelVideoUrl: 'blob:http://localhost/fake-video' }
  render(<ReelViewer apps={[appWithVideo, ...apps.slice(1)]} creators={creators} initialAppId={app.id} />)
  const video = document.querySelector('video')
  expect(video).toBeInTheDocument()
  expect(video?.getAttribute('src')).toBe('blob:http://localhost/fake-video')
})

test('does not render video element when reelVideoUrl is absent', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(document.querySelector('video')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx jest components/story/__tests__/ReelViewer.test.tsx --no-coverage
```

Expected: FAIL — "Cannot find module '../ReelViewer'"

- [ ] **Step 3: Implement `ReelViewer`**

Create `components/story/ReelViewer.tsx`:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { App, Creator } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost, toggleFavorite } from '@/lib/api'
import { useReelFeed } from '@/hooks/useReelFeed'

interface ReelViewerProps {
  apps: App[]
  creators: Creator[]
  initialAppId?: string
}

export default function ReelViewer({ apps, creators, initialAppId }: ReelViewerProps) {
  const router = useRouter()
  const { t, localizeApp } = useLocale()
  const deviceId = useDeviceId()
  const initialIndex = initialAppId ? apps.findIndex(a => a.id === initialAppId) : 0
  const startIndex = initialIndex >= 0 ? initialIndex : 0
  const { currentIndex, next, prev } = useReelFeed(apps.length - startIndex)
  const app = localizeApp(apps[startIndex + currentIndex])
  const creator = creators.find(c => c.id === app.creatorId)
  const gradient = gradientMap[app.storyCard.gradientTheme]
  const [boostCount, setBoostCount] = useState(app.boostCount)
  const [boosted, setBoosted] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [loopKey, setLoopKey] = useState(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    setBoostCount(app.boostCount)
    setBoosted(false)
    setFavorited(false)
    setLoopKey(0)
  }, [app.id])

  useEffect(() => {
    if (app.reelVideoUrl) return
    const timer = setTimeout(() => setLoopKey(k => k + 1), 6500)
    return () => clearTimeout(timer)
  }, [loopKey, app.reelVideoUrl])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta > 50) next()
    else if (delta < -50) prev()
  }

  async function handleBoost() {
    if (!deviceId) return
    const prevState = { boosted, boostCount }
    setBoosted(b => !b)
    setBoostCount(c => boosted ? c - 1 : c + 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prevState.boosted)
      setBoostCount(prevState.boostCount)
    }
  }

  async function handleFavorite() {
    if (!deviceId) return
    const prevFavorited = favorited
    setFavorited(f => !f)
    try {
      const result = await toggleFavorite(deviceId, app.creatorId)
      setFavorited(result.favorited)
    } catch {
      setFavorited(prevFavorited)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col max-w-[430px] mx-auto select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress dots */}
      <div className="flex gap-1.5 px-4 pt-4 justify-center relative z-10">
        {apps.slice(startIndex, startIndex + 8).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="absolute top-3 right-4 text-white/70 text-xl z-10"
      >
        ✕
      </button>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {app.reelVideoUrl ? (
          <>
            <video
              src={app.reelVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pb-2">
              <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">{t('card.the_problem')}</p>
              <p className="text-white font-bold text-sm leading-snug mb-2">{app.storyCard.problemStatement}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">{t('card.the_solution')}</p>
              <p className="text-white font-bold text-base mb-1">{app.title}</p>
              <p className="text-white/70 text-xs">{app.storyCard.solutionStatement}</p>
            </div>
          </>
        ) : (
          <div
            key={loopKey}
            className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col justify-center items-center p-8`}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="text-[9px] uppercase tracking-widest text-white mb-2"
            >
              {t('card.the_problem')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-white font-bold text-xl leading-snug text-center mb-4"
            >
              {app.storyCard.problemStatement}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 1.2 }}
              className="w-8 h-px bg-white/30 mb-4"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.3, delay: 1.8 }}
              className="text-[9px] uppercase tracking-widest text-white mb-1"
            >
              {t('card.the_solution')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.2 }}
              className="text-white font-bold text-2xl mb-1"
            >
              {app.title}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.4, delay: 2.5 }}
              className="text-white/80 text-sm text-center mb-5"
            >
              {app.storyCard.solutionStatement}
            </motion.p>
            <div className="w-full space-y-2">
              {app.storyCard.features.map((f, i) => (
                <motion.p
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 3.0 + i * 0.4 }}
                  className="text-white/80 text-sm flex gap-2"
                >
                  <span className="text-white">✓</span> {f}
                </motion.p>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 4.4 }}
              className="w-full mt-6"
            >
              <Link
                href={app.link}
                target="_blank"
                className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl text-center"
              >
                {t('reel.try')} {app.title} →
              </Link>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="px-4 py-3 flex flex-col gap-3 bg-black">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {creator?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{creator?.name}</p>
            <p className="text-white/50 text-[9px]">{app.isNew ? t('viewer.new_drop') : t('viewer.featured')}</p>
          </div>
          <p className="text-white/70 text-xs flex-shrink-0">⬆ {boostCount}</p>
        </div>

        <Link
          href={app.link}
          target="_blank"
          className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl text-center"
        >
          {t('reel.try')} {app.title} →
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleBoost}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${boosted ? 'bg-white text-gray-900' : 'bg-white/10 border border-white/20 text-white'}`}
          >
            {t('reel.boost')}
          </button>
          <button
            onClick={handleFavorite}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${favorited ? 'bg-yellow-400 text-white' : 'bg-white/10 border border-white/20 text-white'}`}
          >
            {t('reel.save_creator')}
          </button>
        </div>

        <p className="text-center text-white/20 text-[9px] pb-1">{t('reel.swipe_hint')}</p>
      </div>

      {/* Tap zones for non-swipe navigation */}
      <div className="absolute left-0 right-0 flex pointer-events-none" style={{ top: 60, bottom: 220 }}>
        <button className="flex-1 h-full pointer-events-auto" onClick={prev} aria-label="Previous reel" />
        <button className="flex-1 h-full pointer-events-auto" onClick={next} aria-label="Next reel" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest components/story/__tests__/ReelViewer.test.tsx --no-coverage
```

Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add components/story/ReelViewer.tsx components/story/__tests__/ReelViewer.test.tsx
git commit -m "feat: add ReelViewer component with animated fallback and video path"
```

---

## Task 4: Reels routes

**Files:**
- Create: `app/reels/page.tsx`
- Create: `app/reel/[appId]/page.tsx`
- Modify: `app/story/[appId]/page.tsx`

- [ ] **Step 1: Create `/reels` page (ranked feed)**

Create `app/reels/page.tsx`:

```tsx
'use client'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import ReelViewer from '@/components/story/ReelViewer'

const rankedApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

export default function ReelsPage() {
  return (
    <ReelViewer
      apps={rankedApps}
      creators={creators}
    />
  )
}
```

- [ ] **Step 2: Create `/reel/[appId]` page (shareable entry point)**

Create `app/reel/[appId]/page.tsx`:

```tsx
'use client'
import { useParams } from 'next/navigation'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import ReelViewer from '@/components/story/ReelViewer'

const rankedApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

export default function ReelPage() {
  const { appId } = useParams() as { appId: string }
  return (
    <ReelViewer
      apps={rankedApps}
      creators={creators}
      initialAppId={appId}
    />
  )
}
```

- [ ] **Step 3: Redirect `/story/[appId]` to `/reel/[appId]`**

Replace the full contents of `app/story/[appId]/page.tsx` with:

```tsx
import { redirect } from 'next/navigation'

export default function StoryPage({ params }: { params: { appId: string } }) {
  redirect(`/reel/${params.appId}`)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/reels/page.tsx app/reel/[appId]/page.tsx app/story/[appId]/page.tsx
git commit -m "feat: add /reels and /reel/[appId] routes, redirect /story/[appId]"
```

---

## Task 5: Add Reels tab to BottomTabBar

**Files:**
- Modify: `components/layout/BottomTabBar.tsx`
- Modify: `components/layout/__tests__/BottomTabBar.test.tsx`

- [ ] **Step 1: Update the test to expect 5 tabs**

Replace `components/layout/__tests__/BottomTabBar.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import BottomTabBar from '../BottomTabBar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: () => {},
    t: (key: string) => ({
      'nav.discover': 'Discover',
      'nav.collections': 'Collections',
      'nav.reels': 'Reels',
      'nav.feed': 'My Feed',
      'nav.profile': 'Profile',
    }[key] ?? key),
  }),
}))

test('renders all five tabs', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toBeInTheDocument()
  expect(screen.getByText('Collections')).toBeInTheDocument()
  expect(screen.getByText('Reels')).toBeInTheDocument()
  expect(screen.getByText('My Feed')).toBeInTheDocument()
  expect(screen.getByText('Profile')).toBeInTheDocument()
})

test('highlights Discover tab when on home route', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toHaveClass('text-brand')
})

test('Reels tab links to /reels', () => {
  render(<BottomTabBar />)
  const reelsLink = screen.getByText('Reels').closest('a')
  expect(reelsLink).toHaveAttribute('href', '/reels')
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx jest components/layout/__tests__/BottomTabBar.test.tsx --no-coverage
```

Expected: FAIL — "renders all five tabs" fails because 'Reels' is not found

- [ ] **Step 3: Update `BottomTabBar` to include Reels tab**

Replace the full contents of `components/layout/BottomTabBar.tsx` with:

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/lib/i18n'

export default function BottomTabBar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useLocale()

  const tabs = [
    { key: 'nav.discover', icon: '🏠', href: '/' },
    { key: 'nav.collections', icon: '📦', href: '/collections' },
    { key: 'nav.reels', icon: '▶', href: '/reels' },
    { key: 'nav.feed', icon: '📬', href: '/feed' },
    { key: 'nav.profile', icon: '👤', href: '/profile' },
  ] as const

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-2 z-20">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href === '/reels' && pathname.startsWith('/reel'))
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[10px] font-semibold ${active ? 'text-brand' : 'text-gray-400'}`}>
              {t(tab.key)}
            </span>
          </Link>
        )
      })}
      <button
        onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
        className="flex flex-col items-center gap-0.5 py-1 px-3"
      >
        <span className="text-lg">🌐</span>
        <span className="text-[10px] font-semibold text-gray-400">{locale.toUpperCase()}</span>
      </button>
    </nav>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest components/layout/__tests__/BottomTabBar.test.tsx --no-coverage
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add components/layout/BottomTabBar.tsx components/layout/__tests__/BottomTabBar.test.tsx
git commit -m "feat: add Reels tab to BottomTabBar"
```

---

## Task 6: Update StoryRing to link to `/reel/[appId]`

**Files:**
- Modify: `components/story/StoryRing.tsx`

- [ ] **Step 1: Update the href in `StoryRing`**

In `components/story/StoryRing.tsx`, change line 13 from:

```tsx
<Link href={`/story/${app.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
```

to:

```tsx
<Link href={`/reel/${app.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/story/StoryRing.tsx
git commit -m "feat: StoryRing links to /reel/[appId]"
```

---

## Task 7: Add "Watch Reel →" to `AppCard`

**Files:**
- Modify: `components/app/AppCard.tsx`
- Modify: `components/app/__tests__/AppCard.test.tsx`

- [ ] **Step 1: Add the test**

In `components/app/__tests__/AppCard.test.tsx`, add after the existing tests:

```tsx
test('renders Watch Reel link pointing to /reel/<id>', () => {
  render(<AppCard app={app} />)
  const link = screen.getByRole('link', { name: /watch reel/i })
  expect(link).toHaveAttribute('href', `/reel/${app.id}`)
})
```

Also update the mock for `@/lib/i18n` at the top of the file. The existing test file does not mock `@/lib/i18n` explicitly — check if it already passes. If `useLocale` is not mocked and tests pass, it means the LocaleProvider is handled by the test environment. Add the mock to the file to be safe. Replace the full test file with:

```tsx
import { render, screen } from '@testing-library/react'
import AppCard from '../AppCard'
import { apps } from '@/lib/mock-data/apps'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'app.try': 'Try →',
      'app.boost': '⬆ Boost',
      'reel.watch': 'Watch Reel →',
    }[key] ?? key),
    localizeApp: (a: (typeof apps)[0]) => a,
  }),
}))

jest.mock('@/hooks/useDeviceId', () => ({
  useDeviceId: () => 'test-device',
}))

jest.mock('@/lib/api', () => ({
  toggleBoost: jest.fn(),
  toggleFavorite: jest.fn(),
}))

const app = apps[0]

test('renders app title', () => {
  render(<AppCard app={app} />)
  expect(screen.getByText(app.title)).toBeInTheDocument()
})

test('renders boost count', () => {
  render(<AppCard app={app} />)
  expect(screen.getByText(`⬆ ${app.boostCount}`)).toBeInTheDocument()
})

test('renders Try button linking to app', () => {
  render(<AppCard app={app} />)
  const link = screen.getByRole('link', { name: /try/i })
  expect(link).toHaveAttribute('href', app.link)
})

test('renders Watch Reel link pointing to /reel/<id>', () => {
  render(<AppCard app={app} />)
  const link = screen.getByRole('link', { name: /watch reel/i })
  expect(link).toHaveAttribute('href', `/reel/${app.id}`)
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx jest components/app/__tests__/AppCard.test.tsx --no-coverage
```

Expected: FAIL — "Watch Reel link" test fails

- [ ] **Step 3: Add Watch Reel button to `AppCard`**

In `components/app/AppCard.tsx`, find the actions row `<div className="flex gap-2 mt-2">` and add a Watch Reel link between the Try link and the Boost button:

```tsx
<div className="flex gap-2 mt-2">
  <Link
    href={a.link}
    target="_blank"
    className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
  >
    {t('app.try')}
  </Link>
  <Link
    href={`/reel/${app.id}`}
    className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-1.5 text-center text-xs font-semibold"
  >
    {t('reel.watch')}
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest components/app/__tests__/AppCard.test.tsx --no-coverage
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add components/app/AppCard.tsx components/app/__tests__/AppCard.test.tsx
git commit -m "feat: add Watch Reel button to AppCard"
```

---

## Task 8: Add "Watch Reel →" to `AppRow` (collections detail page)

**Files:**
- Modify: `components/app/AppRow.tsx`

The collections detail page at `/collections/[id]` uses `AppRow`, not `AppCard`. It needs the same Watch Reel entry point.

- [ ] **Step 1: Add Watch Reel link to `AppRow`**

Replace the full contents of `components/app/AppRow.tsx` with:

```tsx
'use client'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

export default function AppRow({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const gradient = gradientMap[a.storyCard.gradientTheme]
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
        {a.title[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{a.title}</p>
        <p className="text-[10px] text-gray-400 truncate">{a.tagline}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <Link
          href={`/reel/${app.id}`}
          className="bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          {t('reel.watch')}
        </Link>
        <Link
          href={a.link}
          target="_blank"
          className="bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-bold"
        >
          {t('app.try')}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/app/AppRow.tsx
git commit -m "feat: add Watch Reel link to AppRow"
```

---

## Task 10: Submit form — video upload step

**Files:**
- Modify: `app/submit/page.tsx`

- [ ] **Step 1: Add `reelFile` state and the upload step UI**

In `app/submit/page.tsx`, add `reelFile` state alongside the other state declarations:

```tsx
const [reelFile, setReelFile] = useState<File | null>(null)
const [reelError, setReelError] = useState<string | null>(null)
```

Add a `handleReelFile` handler:

```tsx
function handleReelFile(file: File | null) {
  setReelError(null)
  if (!file) { setReelFile(null); return }
  if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
    setReelError('Only MP4 or MOV files are accepted.')
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    setReelError('File must be under 50MB.')
    return
  }
  setReelFile(file)
}
```

Update `handleSubmit` to include a blob URL when a file is selected:

```tsx
function handleSubmit() {
  if (!creatorName || !link || !problem || !audience || !features || access.length === 0 || !pricing) return
  const reelVideoUrl = reelFile ? URL.createObjectURL(reelFile) : undefined
  sessionStorage.setItem('submitForm', JSON.stringify({
    creatorName, link, problem, audience, features, access, pricing, tags, reelVideoUrl,
  }))
  router.push('/submit/generating')
}
```

Add the step 8 upload block at the bottom of the form, before the submit button:

```tsx
<div>
  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">
    {t('submit.reel_label')}
  </label>
  <p className="text-[10px] text-gray-500 mb-2">{t('submit.reel_hint')}</p>
  {reelFile ? (
    <div className="bg-gray-800 rounded-xl px-3 py-2.5 flex items-center justify-between">
      <p className="text-white text-xs">{t('submit.reel_selected')} {reelFile.name}</p>
      <button onClick={() => handleReelFile(null)} className="text-gray-400 text-xs ml-2">✕</button>
    </div>
  ) : (
    <label className="block w-full bg-gray-800 border border-dashed border-gray-600 rounded-xl px-3 py-5 text-center cursor-pointer hover:border-indigo-500 transition-colors">
      <input
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={e => handleReelFile(e.target.files?.[0] ?? null)}
      />
      <p className="text-gray-400 text-xs">{t('submit.reel_accept')}</p>
    </label>
  )}
  {reelError && <p className="text-red-400 text-xs mt-1">{reelError}</p>}
  <button
    type="button"
    onClick={handleSubmit}
    className="w-full mt-3 bg-transparent text-gray-500 text-xs underline text-center"
  >
    {t('submit.reel_skip')}
  </button>
</div>
```

Remove the existing standalone submit button at the bottom of the form (the one that calls `handleSubmit` with `{t('submit.cta')}`), and replace it with a version that only appears after all other fields are filled — above the reel step or just use the existing CTA as the primary submit and the skip link in step 8 as a secondary path. To keep it simple: keep the existing `{t('submit.cta')}` button but move it to appear after step 8.

The final form order is:
1. Creator name
2–7. Existing questions
8. Reel upload (step 8 block above, including its own skip button)
9. Primary CTA button: `{t('submit.cta')}`

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/submit/page.tsx
git commit -m "feat: add video upload step to submit form"
```

---

## Task 11: Generating page — merge `reelVideoUrl`

**Files:**
- Modify: `app/submit/generating/page.tsx`

- [ ] **Step 1: Merge `reelVideoUrl` from form data into the generated app**

In `app/submit/generating/page.tsx`, update the `packageApp` `.then` callback:

```tsx
.then(app => {
  const raw = sessionStorage.getItem('submitForm')
  const formData = raw ? JSON.parse(raw) : {}
  const appWithReel = formData.reelVideoUrl
    ? { ...app, reelVideoUrl: formData.reelVideoUrl }
    : app
  sessionStorage.setItem('generatedApp', JSON.stringify(appWithReel))
  router.push('/submit/preview')
})
```

Note: The `raw` re-parse is safe here because `sessionStorage` is synchronous and the value was set before navigating to this page.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/submit/generating/page.tsx
git commit -m "feat: merge reelVideoUrl from form data into generated app"
```

---

## Task 12: Preview page — replace StoryCard with ReelViewer

**Files:**
- Modify: `app/submit/preview/page.tsx`

- [ ] **Step 1: Replace `StoryCard` with `ReelViewer` in a phone frame**

Replace the full contents of `app/submit/preview/page.tsx` with:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import ReelViewer from '@/components/story/ReelViewer'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import { creators } from '@/lib/mock-data/creators'

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
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.reel_preview')}</p>
          <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-gray-800 shadow-xl pointer-events-none">
            <ReelViewer apps={[app]} creators={creators} initialAppId={app.id} />
          </div>
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

Note: `pointer-events-none` on the phone frame makes the preview non-interactive (no swipe, no buttons). The `ReelViewer` plays the animation or video automatically.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all existing tests pass, plus new tests for `useReelFeed` and `ReelViewer` and updated tests for `BottomTabBar` and `AppCard`.

- [ ] **Step 4: Commit**

```bash
git add app/submit/preview/page.tsx
git commit -m "feat: replace StoryCard preview with ReelViewer phone frame"
```

---

## Self-Review Checklist

After all tasks are complete, run the full test suite one final time:

```bash
npx jest --no-coverage
```

All tests must pass before declaring implementation complete.
