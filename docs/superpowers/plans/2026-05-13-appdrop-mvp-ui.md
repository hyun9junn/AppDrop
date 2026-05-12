# AppDrop MVP UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all 12 screens of the AppDrop MVP as a mobile-first responsive web app using mock data, covering all three layers: Packaging (developer), Delivery (user discovery), and Story-driven Growth & Loyalty.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind CSS. All data is static mock data in `/lib/mock-data/`. No backend or API calls in MVP — the AI packaging and delivery engines are simulated with pre-written outputs. Framer Motion handles Story viewer animations and gesture interaction.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Jest, React Testing Library

**Spec reference:** `docs/superpowers/specs/2026-05-13-appdrop-design.md`

---

## File Structure

```
appdrop/
├── app/
│   ├── layout.tsx                        # Root layout — font, global styles
│   ├── page.tsx                          # Discover home (/)
│   ├── input/page.tsx                    # Problem input full-screen
│   ├── results/page.tsx                  # Delivery results
│   ├── category/[slug]/page.tsx          # Category browse
│   ├── story/[appId]/page.tsx            # Full-screen story viewer
│   ├── submit/page.tsx                   # Developer submission form
│   ├── submit/generating/page.tsx        # AI generating state
│   ├── submit/preview/page.tsx           # Package preview & publish
│   ├── creator/[id]/page.tsx             # Creator profile
│   ├── collections/page.tsx              # Collections list
│   ├── collections/[id]/page.tsx         # Collection detail
│   ├── feed/page.tsx                     # My Feed (subscription)
│   └── profile/page.tsx                 # User profile
├── components/
│   ├── layout/
│   │   ├── BottomTabBar.tsx             # 4-tab nav (Discover/Collections/Feed/Profile)
│   │   ├── TopBar.tsx                   # Logo + icons top bar
│   │   └── MobileShell.tsx             # Max-w wrapper for mobile-first layout
│   ├── story/
│   │   ├── StoryRing.tsx               # Circular avatar ring (seen/unseen)
│   │   ├── StoryCard.tsx               # Full story card (Problem→Solution→CTA)
│   │   ├── StoryCardMini.tsx           # Header-only card for browse lists
│   │   └── StoryViewer.tsx            # Full-screen viewer with progress bars
│   ├── app/
│   │   ├── AppCard.tsx                 # Card with mini story header + app details
│   │   └── AppRow.tsx                  # Compact row (icon, name, one-liner, Try)
│   ├── collection/
│   │   └── CollectionCard.tsx          # Gradient card with emoji + title + count
│   ├── feed/
│   │   └── FeedItem.tsx               # Creator update item with badge
│   └── discover/
│       ├── ProblemInput.tsx            # Gradient card with text input
│       └── CategoryGrid.tsx            # 4×2 icon grid
├── lib/
│   ├── types.ts                         # All TypeScript types
│   └── mock-data/
│       ├── apps.ts                      # 10 mock apps with full package
│       ├── creators.ts                  # 4 mock creators
│       ├── collections.ts               # 4 mock collections
│       └── feed-items.ts               # 6 mock feed items
└── hooks/
    └── useStoryViewer.ts               # Current index + seen state for viewer
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `tsconfig.json`, `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*"
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure Jest**

Create `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Update `tailwind.config.ts` with custom colors**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#8b5cf6',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Verify setup**

```bash
npm run dev
```
Expected: Next.js default page at `http://localhost:3000`

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: project setup — Next.js 14 + Tailwind + Framer Motion + Jest"
```

---

## Task 2: Types & Mock Data

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock-data/apps.ts`
- Create: `lib/mock-data/creators.ts`
- Create: `lib/mock-data/collections.ts`
- Create: `lib/mock-data/feed-items.ts`

- [ ] **Step 1: Write failing test**

Create `lib/__tests__/mock-data.test.ts`:
```typescript
import { apps } from '../mock-data/apps'
import { creators } from '../mock-data/creators'
import { collections } from '../mock-data/collections'
import { feedItems } from '../mock-data/feed-items'

test('apps have required fields', () => {
  expect(apps.length).toBeGreaterThan(0)
  apps.forEach(app => {
    expect(app.id).toBeTruthy()
    expect(app.title).toBeTruthy()
    expect(app.storyCard.problemStatement).toBeTruthy()
    expect(app.storyCard.solutionStatement).toBeTruthy()
    expect(app.category).toBeTruthy()
  })
})

test('every app references a valid creator', () => {
  const creatorIds = new Set(creators.map(c => c.id))
  apps.forEach(app => expect(creatorIds.has(app.creatorId)).toBe(true))
})

test('every collection references valid apps', () => {
  const appIds = new Set(apps.map(a => a.id))
  collections.forEach(col =>
    col.appIds.forEach(id => expect(appIds.has(id)).toBe(true))
  )
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest lib/__tests__/mock-data.test.ts
```
Expected: FAIL — modules not found

- [ ] **Step 3: Create types**

Create `lib/types.ts`:
```typescript
export type Category =
  | 'writing' | 'images' | 'audio' | 'video'
  | 'data' | 'business' | 'design' | 'ai-tools'

export type AccessType = 'web' | 'api' | 'download' | 'extension'
export type Pricing = 'free' | 'freemium' | 'paid'
export type FeedItemType = 'drop' | 'beta' | 'announcement' | 'update'

export type GradientTheme =
  | 'indigo-purple' | 'sky-indigo' | 'emerald-sky'
  | 'amber-red' | 'blue-teal' | 'orange-amber'
  | 'purple-pink' | 'teal-cyan'

export interface StoryCard {
  problemStatement: string
  solutionStatement: string
  features: string[]
  gradientTheme: GradientTheme
  shareableUrl: string
}

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
}

export interface Creator {
  id: string
  name: string
  bio: string
  avatar: string
  links: string[]
  appIds: string[]
  regularCount: number
}

export interface Collection {
  id: string
  title: string
  description: string
  emoji: string
  appIds: string[]
  updatedDaysAgo: number
}

export interface FeedItem {
  id: string
  creatorId: string
  type: FeedItemType
  appId: string
  body: string
  hoursAgo: number
}
```

- [ ] **Step 4: Create mock apps**

Create `lib/mock-data/apps.ts`:
```typescript
import type { App } from '../types'

export const apps: App[] = [
  {
    id: 'resume-ai',
    title: 'ResumeAI',
    tagline: 'Tailor your CV to any job in 60 seconds',
    link: 'https://resumeai.example.com',
    creatorId: 'kimdev',
    description: 'Paste a job description, upload your resume, get a tailored version instantly. No prompt engineering needed.',
    useCases: [
      'Tailor your CV to a specific job posting',
      'Match keywords from the job description automatically',
      'Keep your original voice and formatting',
    ],
    tags: ['resume', 'job search', 'writing', 'AI'],
    category: 'writing',
    accessType: ['web'],
    pricing: 'free',
    storyCard: {
      problemStatement: 'Tailoring your CV to every job description takes way too long',
      solutionStatement: 'Paste a job description. Upload your resume. Get a tailored version in 60 seconds.',
      features: ['Matches keywords automatically', 'Keeps your original voice', 'Works with any file format'],
      gradientTheme: 'indigo-purple',
      shareableUrl: '/story/resume-ai',
    },
    socialCopy: {
      twitter: "Spent 2 hours tailoring my resume last week 😤\n\nResumeAI does it in 60 seconds. Paste the job description, upload your CV, done.\n\nFree → [link]",
      linkedin: "I built a free tool that makes resume tailoring instant.\n\nResumeAI reads any job description and rewrites your CV to match — automatically, in your voice.",
    },
    boostCount: 243,
    isNew: true,
  },
  {
    id: 'pixeldrop',
    title: 'PixelDrop',
    tagline: 'Upload once, get every image size instantly',
    link: 'https://pixeldrop.example.com',
    creatorId: 'kimdev',
    description: 'Resize any image for every platform in seconds. No Photoshop, no Canva — just upload and download.',
    useCases: [
      'Resize product photos for Shopify',
      'Prep images for Instagram, Twitter, and LinkedIn at once',
      'Remove backgrounds without design software',
    ],
    tags: ['images', 'resize', 'design', 'social media'],
    category: 'images',
    accessType: ['web'],
    pricing: 'free',
    storyCard: {
      problemStatement: 'Resizing images for every platform wastes hours every week',
      solutionStatement: 'Upload once, get every size instantly — no design skills needed.',
      features: ['Batch resize any image', 'Exports for all major platforms', 'Background removal included'],
      gradientTheme: 'sky-indigo',
      shareableUrl: '/story/pixeldrop',
    },
    socialCopy: {
      twitter: "Stop wasting 20 mins resizing images before every post 😤\n\nPixelDrop does it in 3 seconds. Upload once → get every size.\n\nFree → [link]",
      linkedin: "I built a free tool that saves social media managers ~2 hours per week.\n\nPixelDrop automatically resizes any image for Instagram, Twitter, LinkedIn, and more — in one click.",
    },
    boostCount: 512,
    isNew: false,
  },
  {
    id: 'voicenote-pro',
    title: 'VoiceNote Pro',
    tagline: 'Transcribe and summarize your voice memos automatically',
    link: 'https://voicenotepro.example.com',
    creatorId: 'novatech',
    description: 'Record a voice note, get a clean transcription, summary, and action items — automatically.',
    useCases: [
      'Turn meeting voice notes into structured summaries',
      'Extract action items from recorded ideas',
      'Search across all your voice memos',
    ],
    tags: ['audio', 'transcription', 'productivity', 'notes'],
    category: 'audio',
    accessType: ['web'],
    pricing: 'freemium',
    storyCard: {
      problemStatement: 'Voice recordings are messy and impossible to search or act on',
      solutionStatement: 'Record, transcribe, summarize, and extract action items — automatically.',
      features: ['Accurate transcription in 30+ languages', 'AI summary + action items', 'Full-text search across all memos'],
      gradientTheme: 'emerald-sky',
      shareableUrl: '/story/voicenote-pro',
    },
    socialCopy: {
      twitter: "I used to lose half my best ideas because voice notes are chaos.\n\nVoiceNote Pro transcribes, summarizes, and extracts action items automatically.\n\nFree to try → [link]",
      linkedin: "Every voice memo I record becomes a searchable, structured note automatically.",
    },
    boostCount: 187,
    isNew: true,
  },
  {
    id: 'blogai',
    title: 'BlogAI',
    tagline: 'Turn rough notes into polished blog posts',
    link: 'https://blogai.example.com',
    creatorId: 'writesmart',
    description: 'Paste your bullet points or rough notes and get a full, well-structured blog post written in your style.',
    useCases: [
      'Turn LinkedIn drafts into full articles',
      'Expand bullet notes into structured posts',
      'Generate multiple variations to choose from',
    ],
    tags: ['writing', 'blogging', 'content', 'AI'],
    category: 'writing',
    accessType: ['web'],
    pricing: 'freemium',
    storyCard: {
      problemStatement: 'Turning rough notes into polished blog posts takes hours of painful rewriting',
      solutionStatement: 'Paste your notes, get a full blog post in your voice — in under a minute.',
      features: ['Works from bullet points or rough drafts', 'Matches your writing style', 'Multiple variations generated'],
      gradientTheme: 'indigo-purple',
      shareableUrl: '/story/blogai',
    },
    socialCopy: {
      twitter: "My notes were great. My blog posts were not.\n\nBlogAI fixes that. Paste your rough notes → get a polished post.\n\nFree → [link]",
      linkedin: "The gap between a great idea and a great blog post used to be 3 hours of rewriting.",
    },
    boostCount: 318,
    isNew: false,
  },
  {
    id: 'launchkit',
    title: 'LaunchKit',
    tagline: 'Go from idea to launched product page in minutes',
    link: 'https://launchkit.example.com',
    creatorId: 'shipfast',
    description: 'Generate a complete product page — copy, design, waitlist form — from a one-paragraph description.',
    useCases: [
      'Launch a waitlist page before you build',
      'Test product ideas with a real landing page',
      'Ship your first version without a designer',
    ],
    tags: ['launch', 'landing page', 'startup', 'no-code'],
    category: 'business',
    accessType: ['web'],
    pricing: 'freemium',
    storyCard: {
      problemStatement: 'Setting up a product page before launch takes days of design and copywriting work',
      solutionStatement: 'Describe your product in one paragraph. Get a complete launch page in minutes.',
      features: ['Full page copy generated', 'Built-in waitlist form', 'One-click publish'],
      gradientTheme: 'orange-amber',
      shareableUrl: '/story/launchkit',
    },
    socialCopy: {
      twitter: "Built a product page in 8 minutes yesterday.\n\nLaunchKit generates everything — copy, layout, waitlist form — from a description.\n\nFree to try → [link]",
      linkedin: "You should be testing product ideas with real landing pages, not just talking about them.",
    },
    boostCount: 401,
    isNew: false,
  },
]
```

- [ ] **Step 5: Create mock creators**

Create `lib/mock-data/creators.ts`:
```typescript
import type { Creator } from '../types'

export const creators: Creator[] = [
  {
    id: 'kimdev',
    name: 'KimDev Studio',
    bio: 'AI tools for everyday problems. Based in Seoul.',
    avatar: 'K',
    links: ['https://kimdev.example.com'],
    appIds: ['resume-ai', 'pixeldrop'],
    regularCount: 142,
  },
  {
    id: 'novatech',
    name: 'NovaTech Labs',
    bio: 'Building AI-native productivity tools.',
    avatar: 'N',
    links: ['https://novatech.example.com'],
    appIds: ['voicenote-pro'],
    regularCount: 89,
  },
  {
    id: 'writesmart',
    name: 'WriteSmart',
    bio: 'AI writing tools for creators and marketers.',
    avatar: 'W',
    links: ['https://writesmart.example.com'],
    appIds: ['blogai'],
    regularCount: 203,
  },
  {
    id: 'shipfast',
    name: 'ShipFast',
    bio: 'Tools to ship products faster.',
    avatar: 'S',
    links: ['https://shipfast.example.com'],
    appIds: ['launchkit'],
    regularCount: 317,
  },
]
```

- [ ] **Step 6: Create mock collections**

Create `lib/mock-data/collections.ts`:
```typescript
import type { Collection } from '../types'

export const collections: Collection[] = [
  {
    id: 'solo-founder',
    title: 'Solo Founder Starter Pack',
    description: 'Everything you need to go from idea to launched product — without a team.',
    emoji: '🚀',
    appIds: ['launchkit', 'blogai', 'pixeldrop', 'resume-ai'],
    updatedDaysAgo: 2,
  },
  {
    id: 'content-creator',
    title: 'Content Creator Toolkit',
    description: 'Script, record, edit, and publish faster.',
    emoji: '✍️',
    appIds: ['blogai', 'voicenote-pro', 'pixeldrop'],
    updatedDaysAgo: 5,
  },
  {
    id: 'job-seeker',
    title: 'Job Seeker Kit',
    description: 'Stand out at every stage of the application process.',
    emoji: '💼',
    appIds: ['resume-ai', 'blogai'],
    updatedDaysAgo: 8,
  },
]
```

- [ ] **Step 7: Create mock feed items**

Create `lib/mock-data/feed-items.ts`:
```typescript
import type { FeedItem } from '../types'

export const feedItems: FeedItem[] = [
  {
    id: 'fi-1',
    creatorId: 'kimdev',
    type: 'drop',
    appId: 'resume-ai',
    body: 'Tailor your CV to any job description in 60 seconds. Early users get lifetime free access.',
    hoursAgo: 2,
  },
  {
    id: 'fi-2',
    creatorId: 'novatech',
    type: 'beta',
    appId: 'voicenote-pro',
    body: 'Looking for early testers! VoiceNote Pro now supports 30+ languages. Join the beta.',
    hoursAgo: 26,
  },
  {
    id: 'fi-3',
    creatorId: 'shipfast',
    type: 'update',
    appId: 'launchkit',
    body: 'LaunchKit v2 shipped — Notion integration and faster export now live.',
    hoursAgo: 72,
  },
]
```

- [ ] **Step 8: Run test — expect PASS**

```bash
npx jest lib/__tests__/mock-data.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add lib/
git commit -m "feat: types and mock data for all entities"
```

---

## Task 3: Layout Shell & Bottom Tab Bar

**Files:**
- Create: `components/layout/MobileShell.tsx`
- Create: `components/layout/TopBar.tsx`
- Create: `components/layout/BottomTabBar.tsx`
- Modify: `app/layout.tsx`
- Test: `components/layout/__tests__/BottomTabBar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/layout/__tests__/BottomTabBar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import BottomTabBar from '../BottomTabBar'

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

test('renders all four tabs', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toBeInTheDocument()
  expect(screen.getByText('Collections')).toBeInTheDocument()
  expect(screen.getByText('My Feed')).toBeInTheDocument()
  expect(screen.getByText('Profile')).toBeInTheDocument()
})

test('highlights Discover tab when on home route', () => {
  render(<BottomTabBar />)
  const discoverLabel = screen.getByText('Discover')
  expect(discoverLabel).toHaveClass('text-brand')
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest components/layout/__tests__/BottomTabBar.test.tsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Create MobileShell**

Create `components/layout/MobileShell.tsx`:
```typescript
export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-white">
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create TopBar**

Create `components/layout/TopBar.tsx`:
```typescript
import Link from 'next/link'

interface TopBarProps {
  title?: string
  backHref?: string
  rightAction?: React.ReactNode
}

export default function TopBar({ title, backHref, rightAction }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      {backHref && (
        <Link href={backHref} className="text-gray-400 text-sm">←</Link>
      )}
      {!backHref && !title && (
        <span className="text-brand font-black text-xl flex-1">AppDrop</span>
      )}
      {title && (
        <span className="font-bold text-gray-900 text-sm flex-1">{title}</span>
      )}
      {rightAction}
    </header>
  )
}
```

- [ ] **Step 5: Create BottomTabBar**

Create `components/layout/BottomTabBar.tsx`:
```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Discover', icon: '🏠', href: '/' },
  { label: 'Collections', icon: '📦', href: '/collections' },
  { label: 'My Feed', icon: '📬', href: '/feed' },
  { label: 'Profile', icon: '👤', href: '/profile' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-2 z-20">
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[10px] font-semibold ${active ? 'text-brand' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 6: Update root layout**

Edit `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MobileShell from '@/components/layout/MobileShell'
import BottomTabBar from '@/components/layout/BottomTabBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AppDrop',
  description: 'AI-era app packaging and delivery platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <MobileShell>
          {children}
          <BottomTabBar />
        </MobileShell>
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Run test — expect PASS**

```bash
npx jest components/layout/__tests__/BottomTabBar.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: layout shell — MobileShell, TopBar, BottomTabBar"
```

---

## Task 4: Story Card Components

**Files:**
- Create: `components/story/StoryRing.tsx`
- Create: `components/story/StoryCard.tsx`
- Create: `components/story/StoryCardMini.tsx`
- Test: `components/story/__tests__/StoryCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/story/__tests__/StoryCard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import StoryCard from '../StoryCard'
import { apps } from '@/lib/mock-data/apps'

const app = apps[0] // ResumeAI

test('renders problem statement', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByText(app.storyCard.problemStatement)).toBeInTheDocument()
})

test('renders solution statement', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByText(app.storyCard.solutionStatement)).toBeInTheDocument()
})

test('renders all feature checkmarks', () => {
  render(<StoryCard app={app} />)
  app.storyCard.features.forEach(f => {
    expect(screen.getByText(f)).toBeInTheDocument()
  })
})

test('renders Try CTA with app title', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByRole('link', { name: /Try ResumeAI/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest components/story/__tests__/StoryCard.test.tsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Create gradient utility**

Add to `lib/types.ts` (append):
```typescript
export const gradientMap: Record<GradientTheme, string> = {
  'indigo-purple': 'from-indigo-500 to-purple-600',
  'sky-indigo': 'from-sky-400 to-indigo-500',
  'emerald-sky': 'from-emerald-400 to-sky-500',
  'amber-red': 'from-amber-400 to-red-500',
  'blue-teal': 'from-blue-500 to-teal-400',
  'orange-amber': 'from-orange-400 to-amber-500',
  'purple-pink': 'from-purple-500 to-pink-500',
  'teal-cyan': 'from-teal-400 to-cyan-500',
}
```

- [ ] **Step 4: Create StoryRing**

Create `components/story/StoryRing.tsx`:
```typescript
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

interface StoryRingProps {
  app: App
  seen?: boolean
}

export default function StoryRing({ app, seen = false }: StoryRingProps) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <Link href={`/story/${app.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className={`w-14 h-14 rounded-full p-0.5 ${seen ? 'bg-gray-300' : `bg-gradient-to-br ${gradient}`}`}>
        <div className="w-full h-full rounded-full bg-white p-0.5">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xl`}>
            {app.title[0]}
          </div>
        </div>
      </div>
      <span className="text-[9px] font-semibold text-gray-700 w-14 text-center truncate">{app.title}</span>
    </Link>
  )
}
```

- [ ] **Step 5: Create StoryCard**

Create `components/story/StoryCard.tsx`:
```typescript
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

interface StoryCardProps {
  app: App
  showActions?: boolean
}

export default function StoryCard({ app, showActions = true }: StoryCardProps) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${gradient} p-5 text-center text-white`}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-2">The Problem</p>
        <p className="font-bold text-sm leading-snug mb-3">{app.storyCard.problemStatement}</p>
        <div className="w-6 h-px bg-white/30 mx-auto mb-3" />
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">The Solution</p>
        <p className="font-bold text-base">{app.title}</p>
        <p className="text-xs opacity-80 mt-1">{app.storyCard.solutionStatement}</p>
      </div>
      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-gray-900 text-sm">{app.title}</p>
            <p className="text-[10px] text-gray-400">{app.pricing} · {app.accessType[0]}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {app.boostCount}</p>
        </div>
        <ul className="mb-3 space-y-1">
          {app.storyCard.features.map(f => (
            <li key={f} className="text-[11px] text-gray-600 flex gap-1">
              <span className="text-brand">✓</span> {f}
            </li>
          ))}
        </ul>
        {showActions && (
          <div className="flex gap-2">
            <Link
              href={app.link}
              target="_blank"
              className="flex-[2] bg-brand text-white rounded-xl py-2 text-center text-xs font-bold"
            >
              Try {app.title} →
            </Link>
            <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-xs font-medium">⬆ Boost</button>
            <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-xs font-medium">⭐</button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create StoryCardMini**

Create `components/story/StoryCardMini.tsx`:
```typescript
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

export default function StoryCardMini({ app }: { app: App }) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 text-white text-center`}>
      <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">The Problem</p>
      <p className="font-bold text-[11px] leading-snug">{app.storyCard.problemStatement}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run test — expect PASS**

```bash
npx jest components/story/__tests__/StoryCard.test.tsx
```
Expected: PASS (4 tests)

- [ ] **Step 8: Commit**

```bash
git add components/story/ lib/types.ts
git commit -m "feat: story card components — StoryRing, StoryCard, StoryCardMini"
```

---

## Task 5: Story Viewer (Full-Screen)

**Files:**
- Create: `hooks/useStoryViewer.ts`
- Create: `components/story/StoryViewer.tsx`
- Create: `app/story/[appId]/page.tsx`
- Test: `hooks/__tests__/useStoryViewer.test.ts`

- [ ] **Step 1: Write failing test**

Create `hooks/__tests__/useStoryViewer.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useStoryViewer } from '../useStoryViewer'

const ids = ['a', 'b', 'c']

test('starts at index 0', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  expect(result.current.currentIndex).toBe(0)
})

test('next() advances index', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(1)
})

test('prev() decrements index', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})

test('next() does not go past last item', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  act(() => result.current.next())
  act(() => result.current.next()) // already at last
  expect(result.current.currentIndex).toBe(2)
})

test('marks current id as seen', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  expect(result.current.seenIds.has('a')).toBe(true)
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest hooks/__tests__/useStoryViewer.test.ts
```

- [ ] **Step 3: Create useStoryViewer hook**

Create `hooks/useStoryViewer.ts`:
```typescript
import { useState, useCallback } from 'react'

export function useStoryViewer(ids: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set([ids[0]]))

  const next = useCallback(() => {
    setCurrentIndex(i => {
      const next = Math.min(i + 1, ids.length - 1)
      setSeenIds(s => new Set([...s, ids[next]]))
      return next
    })
  }, [ids])

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  return { currentIndex, seenIds, next, prev }
}
```

- [ ] **Step 4: Create StoryViewer component**

Create `components/story/StoryViewer.tsx`:
```typescript
'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { App, Creator } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useStoryViewer } from '@/hooks/useStoryViewer'

interface StoryViewerProps {
  apps: App[]
  creators: Creator[]
  initialAppId: string
}

export default function StoryViewer({ apps, creators, initialAppId }: StoryViewerProps) {
  const router = useRouter()
  const initialIndex = apps.findIndex(a => a.id === initialAppId)
  const startIndex = initialIndex >= 0 ? initialIndex : 0
  const ids = apps.map(a => a.id)
  const { currentIndex, next, prev } = useStoryViewer(ids.slice(startIndex))
  const app = apps[startIndex + currentIndex]
  const creator = creators.find(c => c.id === app.creatorId)
  const gradient = gradientMap[app.storyCard.gradientTheme]

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col max-w-md mx-auto">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3">
        {apps.slice(startIndex, startIndex + 4).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20">
            <div className={`h-full rounded-full bg-white transition-all ${i <= currentIndex ? 'w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      {/* Creator bar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
          {creator?.avatar}
        </div>
        <div className="flex-1">
          <p className="text-white text-xs font-bold">{creator?.name}</p>
          <p className="text-white/50 text-[9px]">{app.isNew ? 'New drop' : 'Featured'}</p>
        </div>
        <button onClick={() => router.back()} className="text-white/60 text-lg">✕</button>
      </div>

      {/* Story card */}
      <motion.div
        key={app.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`mx-3 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white text-center`}
      >
        <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2">The Problem</p>
        <p className="font-bold text-base leading-snug mb-3">{app.storyCard.problemStatement}</p>
        <div className="w-6 h-px bg-white/20 mx-auto mb-3" />
        <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1">The Solution</p>
        <p className="font-bold text-lg text-white/90">{app.title}</p>
        <p className="text-xs opacity-75 mt-1 mb-4">{app.storyCard.solutionStatement}</p>
        <div className="space-y-1.5 text-left mb-4">
          {app.storyCard.features.map(f => (
            <p key={f} className="text-xs text-white/75 flex gap-2">
              <span className="text-white/90">✓</span> {f}
            </p>
          ))}
        </div>
        <Link
          href={app.link}
          target="_blank"
          className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl"
        >
          Try {app.title} — Free →
        </Link>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pt-3">
        <button className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl py-2 text-xs font-semibold">
          ⬆ Boost
        </button>
        <button className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl py-2 text-xs font-semibold">
          ⭐ Save Creator
        </button>
      </div>
      <p className="text-center text-white/20 text-[9px] mt-2">Swipe up to open · Tap sides to navigate</p>

      {/* Tap zones */}
      <div className="absolute inset-0 flex" style={{ top: 100 }}>
        <button className="flex-1 h-full" onClick={prev} aria-label="Previous story" />
        <button className="flex-1 h-full" onClick={next} aria-label="Next story" />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create story page**

Create `app/story/[appId]/page.tsx`:
```typescript
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import StoryViewer from '@/components/story/StoryViewer'

export default function StoryPage({ params }: { params: { appId: string } }) {
  return (
    <StoryViewer
      apps={apps}
      creators={creators}
      initialAppId={params.appId}
    />
  )
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx jest hooks/__tests__/useStoryViewer.test.ts
```
Expected: PASS (5 tests)

- [ ] **Step 7: Commit**

```bash
git add hooks/ components/story/StoryViewer.tsx app/story/
git commit -m "feat: full-screen story viewer with progress bars and tap navigation"
```

---

## Task 6: Discover Home Screen

**Files:**
- Create: `components/discover/ProblemInput.tsx`
- Create: `components/discover/CategoryGrid.tsx`
- Modify: `app/page.tsx`
- Test: `components/discover/__tests__/CategoryGrid.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/discover/__tests__/CategoryGrid.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import CategoryGrid from '../CategoryGrid'

test('renders all 8 categories', () => {
  render(<CategoryGrid />)
  expect(screen.getByText('Writing')).toBeInTheDocument()
  expect(screen.getByText('Images')).toBeInTheDocument()
  expect(screen.getByText('Audio')).toBeInTheDocument()
  expect(screen.getByText('Video')).toBeInTheDocument()
  expect(screen.getByText('Data')).toBeInTheDocument()
  expect(screen.getByText('Business')).toBeInTheDocument()
  expect(screen.getByText('Design')).toBeInTheDocument()
  expect(screen.getByText('AI Tools')).toBeInTheDocument()
})

test('each category links to its browse page', () => {
  render(<CategoryGrid />)
  const writingLink = screen.getByRole('link', { name: /writing/i })
  expect(writingLink).toHaveAttribute('href', '/category/writing')
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest components/discover/__tests__/CategoryGrid.test.tsx
```

- [ ] **Step 3: Create ProblemInput**

Create `components/discover/ProblemInput.tsx`:
```typescript
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const examples = [
  'Turn my voice notes into a blog post',
  'Resize images for Instagram without Photoshop',
  'Transcribe a recorded meeting',
  'Turn a spreadsheet into a chart',
]

export default function ProblemInput() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(q: string) {
    if (!q.trim()) return
    router.push(`/results?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 mx-4 mt-3">
      <p className="text-white font-extrabold text-sm mb-1">What are you trying to do?</p>
      <p className="text-white/70 text-[10px] mb-3">Describe your problem — we'll deliver the right apps</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(query)}
          placeholder="e.g. I need to summarize a YouTube video..."
          className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-xl px-3 py-2 text-xs outline-none"
        />
        <button
          onClick={() => handleSubmit(query)}
          className="bg-white text-brand font-bold text-xs px-3 py-2 rounded-xl"
        >
          →
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {examples.map(ex => (
          <button
            key={ex}
            onClick={() => handleSubmit(ex)}
            className="bg-white/15 text-white/80 text-[9px] px-2 py-1 rounded-full"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create CategoryGrid**

Create `components/discover/CategoryGrid.tsx`:
```typescript
import Link from 'next/link'
import type { Category } from '@/lib/types'

const categories: { label: string; icon: string; slug: Category }[] = [
  { label: 'Writing', icon: '✍️', slug: 'writing' },
  { label: 'Images', icon: '🖼️', slug: 'images' },
  { label: 'Audio', icon: '🎙️', slug: 'audio' },
  { label: 'Video', icon: '🎬', slug: 'video' },
  { label: 'Data', icon: '📊', slug: 'data' },
  { label: 'Business', icon: '💼', slug: 'business' },
  { label: 'Design', icon: '🎨', slug: 'design' },
  { label: 'AI Tools', icon: '🤖', slug: 'ai-tools' },
]

const bgMap: Record<Category, string> = {
  writing: 'bg-indigo-50',
  images: 'bg-red-50',
  audio: 'bg-green-50',
  video: 'bg-yellow-50',
  data: 'bg-blue-50',
  business: 'bg-orange-50',
  design: 'bg-purple-50',
  'ai-tools': 'bg-teal-50',
}

export default function CategoryGrid() {
  return (
    <div className="bg-white rounded-2xl mx-4 mt-3 p-3">
      <div className="grid grid-cols-4 gap-2">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-10 h-10 ${bgMap[cat.slug]} rounded-xl flex items-center justify-center text-xl`}>
              {cat.icon}
            </div>
            <span className="text-[9px] font-semibold text-gray-600">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build Discover home page**

Edit `app/page.tsx`:
```typescript
import TopBar from '@/components/layout/TopBar'
import StoryRing from '@/components/story/StoryRing'
import ProblemInput from '@/components/discover/ProblemInput'
import CategoryGrid from '@/components/discover/CategoryGrid'
import CollectionCard from '@/components/collection/CollectionCard'
import AppCard from '@/components/app/AppCard'
import { apps } from '@/lib/mock-data/apps'
import { collections } from '@/lib/mock-data/collections'
import Link from 'next/link'

export default function DiscoverPage() {
  const newApps = apps.filter(a => a.isNew)
  const featuredApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20">
      <TopBar
        rightAction={
          <div className="flex gap-3 text-gray-500 text-lg">
            <Link href="/input">🔍</Link>
            <span>🔔</span>
          </div>
        }
      />

      {/* Story rings */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-4 overflow-x-auto">
        {featuredApps.slice(0, 6).map((app, i) => (
          <StoryRing key={app.id} app={app} seen={i > 2} />
        ))}
      </div>

      <ProblemInput />
      <CategoryGrid />

      {/* Featured Collections */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Featured Collections</p>
          <Link href="/collections" className="text-[10px] text-brand font-semibold">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {collections.map(col => (
            <div key={col.id} className="flex-shrink-0 w-44">
              <CollectionCard collection={col} compact />
            </div>
          ))}
        </div>
      </div>

      {/* New drops */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">🆕 New Drops</p>
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

- [ ] **Step 6: Run test — expect PASS**

```bash
npx jest components/discover/__tests__/CategoryGrid.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add components/discover/ app/page.tsx
git commit -m "feat: discover home — story rings, problem input, category grid, collections, new drops"
```

---

## Task 7: AppCard & CollectionCard Components

**Files:**
- Create: `components/app/AppCard.tsx`
- Create: `components/app/AppRow.tsx`
- Create: `components/collection/CollectionCard.tsx`
- Test: `components/app/__tests__/AppCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/app/__tests__/AppCard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import AppCard from '../AppCard'
import { apps } from '@/lib/mock-data/apps'

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
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest components/app/__tests__/AppCard.test.tsx
```

- [ ] **Step 3: Create AppCard**

Create `components/app/AppCard.tsx`:
```typescript
import Link from 'next/link'
import type { App } from '@/lib/types'
import StoryCardMini from '@/components/story/StoryCardMini'

export default function AppCard({ app }: { app: App }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <StoryCardMini app={app} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-sm">{app.title}</p>
            <p className="text-[10px] text-gray-400">{app.tagline}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {app.boostCount}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={app.link}
            target="_blank"
            className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
          >
            Try →
          </Link>
          <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-1.5 text-xs">⬆ Boost</button>
          <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-1.5 text-xs">⭐</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create AppRow**

Create `components/app/AppRow.tsx`:
```typescript
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

export default function AppRow({ app }: { app: App }) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
        {app.title[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{app.title}</p>
        <p className="text-[10px] text-gray-400 truncate">{app.tagline}</p>
      </div>
      <Link
        href={app.link}
        target="_blank"
        className="bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-bold flex-shrink-0"
      >
        Try →
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Create CollectionCard**

Create `components/collection/CollectionCard.tsx`:
```typescript
import Link from 'next/link'
import type { Collection } from '@/lib/types'

const gradients = [
  'from-indigo-900 to-purple-900',
  'from-teal-900 to-emerald-900',
  'from-red-900 to-orange-900',
  'from-blue-900 to-indigo-900',
]

interface CollectionCardProps {
  collection: Collection
  compact?: boolean
}

export default function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  const gradient = gradients[collection.appIds.length % gradients.length]
  return (
    <Link href={`/collections/${collection.id}`}>
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 border border-white/10`}>
        <p className="text-2xl mb-2">{collection.emoji}</p>
        <p className="font-extrabold text-white text-sm leading-snug">{collection.title}</p>
        {!compact && <p className="text-white/60 text-xs mt-1">{collection.description}</p>}
        <p className="text-white/50 text-[10px] mt-2">{collection.appIds.length} apps</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 6: Run test — expect PASS**

```bash
npx jest components/app/__tests__/AppCard.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add components/app/ components/collection/
git commit -m "feat: AppCard, AppRow, CollectionCard components"
```

---

## Task 8: Problem Input & Delivery Results Screens

**Files:**
- Create: `app/input/page.tsx`
- Create: `app/results/page.tsx`
- Test: `app/results/__tests__/page.test.tsx`

- [ ] **Step 1: Write failing test**

Create `app/results/__tests__/page.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import ResultsPage from '../page'

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'resize images without photoshop' }),
}))

test('shows user query in heading', () => {
  render(<ResultsPage />)
  expect(screen.getByText(/resize images without photoshop/i)).toBeInTheDocument()
})

test('shows at least one app card', () => {
  render(<ResultsPage />)
  const tryButtons = screen.getAllByRole('link', { name: /try/i })
  expect(tryButtons.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest app/results/__tests__/page.test.tsx
```

- [ ] **Step 3: Create full-screen input page**

Create `app/input/page.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const examples = [
  '✍️ Write a blog post from my notes',
  '🎙️ Transcribe a voice recording',
  '🖼️ Remove background from a photo',
  '📊 Turn spreadsheet data into a chart',
  '📧 Write a cold email that gets replies',
]

export default function InputPage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function submit(q: string) {
    if (!q.trim()) return
    router.push(`/results?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-indigo-400 text-sm font-semibold">Cancel</Link>
        <span className="text-white font-bold text-sm">Find Apps</span>
        <div className="w-12" />
      </div>
      <h1 className="text-white font-extrabold text-2xl mb-1">What are you<br />trying to do?</h1>
      <p className="text-gray-500 text-sm mb-5">Describe your problem in plain language</p>
      <textarea
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. I need to turn my voice notes into a structured blog post automatically"
        className="bg-gray-800 border border-indigo-500 text-white rounded-xl p-3 text-sm resize-none h-24 mb-4 outline-none placeholder-gray-600"
      />
      <button
        onClick={() => submit(query)}
        className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl mb-6"
      >
        Deliver Apps →
      </button>
      <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-3">Try these</p>
      <div className="flex flex-col gap-2">
        {examples.map(ex => (
          <button
            key={ex}
            onClick={() => submit(ex)}
            className="bg-gray-800 text-gray-400 rounded-xl px-4 py-2.5 text-sm text-left"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create delivery results page**

Create `app/results/page.tsx`:
```typescript
'use client'
import { useSearchParams } from 'next/navigation'
import { apps } from '@/lib/mock-data/apps'
import { collections } from '@/lib/mock-data/collections'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'
import CollectionCard from '@/components/collection/CollectionCard'

export default function ResultsPage() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''

  // Mock: return first 3 apps sorted by boostCount
  const results = [...apps].sort((a, b) => b.boostCount - a.boostCount).slice(0, 3)
  const suggestedCollection = collections[0]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/"
        title={`Apps for: "${query.slice(0, 30)}${query.length > 30 ? '…' : ''}"`}
      />
      <div className="p-4 flex flex-col gap-3">
        {results.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
        {/* Collection suggestion */}
        <div className="border border-indigo-100 rounded-2xl p-3 bg-indigo-50 flex items-center gap-3">
          <span className="text-2xl">{suggestedCollection.emoji}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-indigo-700">{suggestedCollection.title}</p>
            <p className="text-[10px] text-indigo-400">{suggestedCollection.appIds.length} apps for this goal</p>
          </div>
          <span className="text-xs text-indigo-500 font-semibold">View →</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx jest app/results/__tests__/page.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add app/input/ app/results/
git commit -m "feat: problem input screen and delivery results page"
```

---

## Task 9: Category Browse Screen

**Files:**
- Create: `app/category/[slug]/page.tsx`

- [ ] **Step 1: Create category browse page**

Create `app/category/[slug]/page.tsx`:
```typescript
import { apps } from '@/lib/mock-data/apps'
import type { Category } from '@/lib/types'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'

const categoryMeta: Record<Category, { label: string; icon: string }> = {
  writing: { label: 'Writing', icon: '✍️' },
  images: { label: 'Images', icon: '🖼️' },
  audio: { label: 'Audio', icon: '🎙️' },
  video: { label: 'Video', icon: '🎬' },
  data: { label: 'Data', icon: '📊' },
  business: { label: 'Business', icon: '💼' },
  design: { label: 'Design', icon: '🎨' },
  'ai-tools': { label: 'AI Tools', icon: '🤖' },
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as Category
  const meta = categoryMeta[slug] ?? { label: slug, icon: '📱' }
  const filtered = apps.filter(a => a.category === slug)
    .sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title={`${meta.icon} ${meta.label} Apps`} />
      <div className="p-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No apps in this category yet.</p>
        )}
        {filtered.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```
Navigate to `http://localhost:3000/category/writing` — expected: Writing apps listed as cards.

- [ ] **Step 3: Commit**

```bash
git add app/category/
git commit -m "feat: category browse page"
```

---

## Task 10: Developer Submission Form

**Files:**
- Create: `app/submit/page.tsx`
- Test: `app/submit/__tests__/page.test.tsx`

- [ ] **Step 1: Write failing test**

Create `app/submit/__tests__/page.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubmitPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders all 7 form questions', () => {
  render(<SubmitPage />)
  expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/problem/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/who is it for/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/3 core features/i)).toBeInTheDocument()
})

test('submit button is present', () => {
  render(<SubmitPage />)
  expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
})

test('access type pills toggle on click', async () => {
  render(<SubmitPage />)
  const webPill = screen.getByText('Web App')
  expect(webPill).not.toHaveClass('bg-brand')
  await userEvent.click(webPill)
  expect(webPill).toHaveClass('bg-brand')
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest app/submit/__tests__/page.test.tsx
```

- [ ] **Step 3: Create submission form page**

Create `app/submit/page.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import type { AccessType, Pricing } from '@/lib/types'

const accessOptions: AccessType[] = ['web', 'api', 'download', 'extension']
const accessLabels: Record<AccessType, string> = {
  web: 'Web App', api: 'API', download: 'Download', extension: 'Extension',
}
const pricingOptions: Pricing[] = ['free', 'freemium', 'paid']

export default function SubmitPage() {
  const router = useRouter()
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
    if (!link || !problem || !audience || !features || access.length === 0 || !pricing) return
    router.push('/submit/generating')
  }

  return (
    <div className="pb-10 min-h-screen bg-gray-950">
      <TopBar title="Package Your App" />
      <div className="p-4 flex flex-col gap-5">
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">1. App Link</label>
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://your-app.com" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">2. What problem does your app solve?</label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="Describe the problem in 1–2 sentences" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">3. Who is it for?</label>
          <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who is it for? (e.g. freelancers, marketers)" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">4. What are the 3 core features?</label>
          <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="List 3 core features, comma-separated" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">5. How do users access it?</label>
          <div className="flex flex-wrap gap-2">
            {accessOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleAccess(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${access.includes(opt) ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                {accessLabels[opt]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">6. Pricing</label>
          <div className="flex gap-2">
            {pricingOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setPricing(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${pricing === opt ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">7. Category Tags</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. writing, productivity, AI" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <button onClick={handleSubmit} className="w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl mt-2">
          Generate My App Package →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx jest app/submit/__tests__/page.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add app/submit/
git commit -m "feat: developer submission form — 7 questions with pill selects"
```

---

## Task 11: AI Generating & Package Preview Screens

**Files:**
- Create: `app/submit/generating/page.tsx`
- Create: `app/submit/preview/page.tsx`

- [ ] **Step 1: Create generating state page**

Create `app/submit/generating/page.tsx`:
```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  'Reading your submission...',
  'Writing description + tagline',
  'Generating use cases',
  'Rendering Story card',
  'Writing social copy',
  'Creating embeddings',
]

export default function GeneratingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 700)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => router.push('/submit/preview'), 800)
      return () => clearTimeout(t)
    }
  }, [step, router])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30">
        🤖
      </div>
      <h2 className="text-white font-extrabold text-xl mb-1">Packaging your app...</h2>
      <p className="text-gray-500 text-sm mb-8">AI is generating your full package</p>
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
      <p className="text-gray-600 text-xs mt-3">~15 seconds</p>
    </div>
  )
}
```

- [ ] **Step 2: Create package preview page**

Create `app/submit/preview/page.tsx`:
```typescript
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import StoryCard from '@/components/story/StoryCard'
import Link from 'next/link'

export default function PreviewPage() {
  const app = apps[0] // mock: show first app as preview result

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/submit"
        title="Your App Package"
        rightAction={
          <Link href="/" className="text-brand text-sm font-bold">Publish</Link>
        }
      />
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-gray-500 text-center">Review your package before publishing</p>

        {/* Story Card */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Story Card</p>
          <StoryCard app={app} showActions={false} />
        </div>

        {/* Social copy */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Twitter/X Copy</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">{app.socialCopy.twitter}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">LinkedIn Copy</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">{app.socialCopy.linkedin}</p>
          </div>
        </div>

        <Link href="/" className="block w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl text-center mt-2">
          Publish App →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```
Navigate to `/submit` → fill form → `/submit/generating` → `/submit/preview`. Check the animated progress and preview layout.

- [ ] **Step 4: Commit**

```bash
git add app/submit/generating/ app/submit/preview/
git commit -m "feat: AI generating state + package preview screen"
```

---

## Task 12: Creator Profile Screen

**Files:**
- Create: `app/creator/[id]/page.tsx`

- [ ] **Step 1: Create creator profile page**

Create `app/creator/[id]/page.tsx`:
```typescript
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  const creator = creators.find(c => c.id === params.id)
  if (!creator) return <div className="p-8 text-center text-gray-400">Creator not found</div>

  const creatorApps = apps.filter(a => creator.appIds.includes(a.id))

  const badgeTypes = [
    { label: '🆕 New Drop', color: 'bg-emerald-100 text-emerald-700' },
    { label: '🧪 Beta', color: 'bg-purple-100 text-purple-700' },
    { label: '📢 Update', color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title="Creator Profile" />
      <div className="p-4">
        {/* Creator header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {creator.avatar}
          </div>
          <div>
            <p className="font-extrabold text-gray-900">{creator.name}</p>
            <p className="text-xs text-gray-400 mb-1">{creator.bio}</p>
            <p className="text-xs text-pink-500 font-semibold">⭐ {creator.regularCount} Regulars</p>
          </div>
        </div>

        {/* Post update composer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">📢 Post an Update</p>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-400 mb-3">
            Share a new drop, beta invite, or announcement...
          </div>
          <div className="flex gap-2">
            {badgeTypes.map(b => (
              <button key={b.label} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.color}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Apps */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">My Apps</p>
        <div className="flex flex-col gap-3">
          {creatorApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/creator/
git commit -m "feat: creator profile page with app list and drop composer"
```

---

## Task 13: My Feed Screen

**Files:**
- Create: `components/feed/FeedItem.tsx`
- Create: `app/feed/page.tsx`
- Test: `components/feed/__tests__/FeedItem.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/feed/__tests__/FeedItem.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import FeedItem from '../FeedItem'
import { feedItems } from '@/lib/mock-data/feed-items'
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'

const item = feedItems[0]
const creator = creators.find(c => c.id === item.creatorId)!
const app = apps.find(a => a.id === item.appId)!

test('renders creator name', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(creator.name)).toBeInTheDocument()
})

test('renders app title', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(app.title)).toBeInTheDocument()
})

test('renders New Drop badge for drop type', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(/New Drop/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest components/feed/__tests__/FeedItem.test.tsx
```

- [ ] **Step 3: Create FeedItem**

Create `components/feed/FeedItem.tsx`:
```typescript
import type { FeedItem as FeedItemType, Creator, App, FeedItemType as FeedItemTypeEnum } from '@/lib/types'
import Link from 'next/link'
import { gradientMap } from '@/lib/types'

interface FeedItemProps {
  item: FeedItemType
  creator: Creator
  app: App
}

const badgeConfig: Record<FeedItemTypeEnum, { label: string; bg: string; text: string; cta: string; ctaBg: string }> = {
  drop:         { label: '🆕 New Drop',    bg: 'bg-emerald-50',  text: 'text-emerald-600', cta: 'View App →',       ctaBg: 'bg-brand' },
  beta:         { label: '🧪 Beta',        bg: 'bg-purple-50',   text: 'text-purple-600',  cta: 'Join Beta →',      ctaBg: 'bg-purple-600' },
  announcement: { label: '📢 Announcement',bg: 'bg-amber-50',    text: 'text-amber-600',   cta: 'Read More →',      ctaBg: 'bg-amber-500' },
  update:       { label: '🔄 Update',      bg: 'bg-blue-50',     text: 'text-blue-600',    cta: "See What's New →", ctaBg: 'bg-gray-200' },
}

function timeAgo(hoursAgo: number) {
  if (hoursAgo < 24) return `${hoursAgo}h ago`
  return `${Math.floor(hoursAgo / 24)}d ago`
}

export default function FeedItem({ item, creator, app }: FeedItemProps) {
  const badge = badgeConfig[item.type]
  const gradient = gradientMap[app.storyCard.gradientTheme]

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 border-l-4" style={{ borderLeftColor: item.type === 'drop' ? '#6366f1' : item.type === 'beta' ? '#8b5cf6' : item.type === 'update' ? '#f59e0b' : '#0ea5e9' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {creator.avatar}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-900">{creator.name}</p>
          <p className="text-[9px] text-gray-400">{timeAgo(item.hoursAgo)}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>
      <p className="font-bold text-gray-900 text-sm mb-1">{app.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{item.body}</p>
      <Link
        href={`/story/${app.id}`}
        className={`block w-full ${badge.ctaBg} ${item.type === 'update' ? 'text-gray-600' : 'text-white'} font-bold text-xs py-2 rounded-xl text-center`}
      >
        {badge.cta}
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Create My Feed page**

Create `app/feed/page.tsx`:
```typescript
import { feedItems } from '@/lib/mock-data/feed-items'
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import FeedItem from '@/components/feed/FeedItem'

export default function FeedPage() {
  const enriched = feedItems
    .map(item => ({
      item,
      creator: creators.find(c => c.id === item.creatorId),
      app: apps.find(a => a.id === item.appId),
    }))
    .filter(e => e.creator && e.app) as { item: typeof feedItems[0]; creator: typeof creators[0]; app: typeof apps[0] }[]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">📬 My Feed</p>
        <p className="text-xs text-gray-400">Updates from your favorite creators</p>
      </div>
      {enriched.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">No updates yet.</p>
          <p className="text-gray-300 text-xs mt-1">Save creators you like to see their drops here.</p>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">From your favorite creators · Today</p>
          {enriched.map(({ item, creator, app }) => (
            <FeedItem key={item.id} item={item} creator={creator} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx jest components/feed/__tests__/FeedItem.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add components/feed/ app/feed/
git commit -m "feat: My Feed screen with creator update items and badge types"
```

---

## Task 14: Collections Screens

**Files:**
- Create: `app/collections/page.tsx`
- Create: `app/collections/[id]/page.tsx`

- [ ] **Step 1: Create collections list page**

Create `app/collections/page.tsx`:
```typescript
import { collections } from '@/lib/mock-data/collections'
import TopBar from '@/components/layout/TopBar'
import CollectionCard from '@/components/collection/CollectionCard'

export default function CollectionsPage() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">📦 Collections</p>
        <p className="text-xs text-gray-400">App bundles for specific goals</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {collections.map(col => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create collection detail page**

Create `app/collections/[id]/page.tsx`:
```typescript
import { collections } from '@/lib/mock-data/collections'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppRow from '@/components/app/AppRow'

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const col = collections.find(c => c.id === params.id)
  if (!col) return <div className="p-8 text-center text-gray-400">Collection not found</div>

  const colApps = col.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean) as typeof apps

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/collections" title={`${col.emoji} ${col.title}`} />
      <div className="p-4">
        <div className="flex items-start gap-4 mb-5">
          <span className="text-4xl">{col.emoji}</span>
          <div>
            <p className="font-extrabold text-gray-900 text-base leading-snug">{col.title}</p>
            <p className="text-xs text-gray-400 mt-1">{col.description}</p>
            <p className="text-[10px] text-gray-300 mt-1">Curated by AppDrop · {colApps.length} apps · Updated {col.updatedDaysAgo} days ago</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {colApps.map(app => (
            <AppRow key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/collections/
git commit -m "feat: collections list and detail pages"
```

---

## Task 15: User Profile Screen

**Files:**
- Create: `app/profile/page.tsx`

- [ ] **Step 1: Create profile page**

Create `app/profile/page.tsx`:
```typescript
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import AppRow from '@/components/app/AppRow'
import { gradientMap } from '@/lib/types'

const boostedApps = apps.slice(0, 3)
const favoriteCreators = creators.slice(0, 2)

export default function ProfilePage() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">👤 Profile</p>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {/* User card */}
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
            J
          </div>
          <div>
            <p className="font-bold text-gray-900">jisoo_k</p>
            <p className="text-xs text-gray-400">Joined May 2026</p>
          </div>
        </div>

        {/* Boosted apps */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">⬆ Boosted Apps</p>
          <div className="flex flex-col gap-2">
            {boostedApps.map(app => <AppRow key={app.id} app={app} />)}
          </div>
        </div>

        {/* Favorite creators */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">⭐ Favorite Creators</p>
          <div className="flex flex-col gap-2">
            {favoriteCreators.map(creator => {
              const firstApp = apps.find(a => creator.appIds[0] === a.id)
              const gradient = firstApp ? gradientMap[firstApp.storyCard.gradientTheme] : 'from-indigo-500 to-purple-600'
              return (
                <div key={creator.id} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {creator.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{creator.name}</p>
                    <p className="text-[10px] text-gray-400">{creator.appIds.length} apps · {creator.regularCount} regulars</p>
                  </div>
                  <span className="text-xs text-pink-500 font-bold">Regular ✓</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent deliveries */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">🕐 Recent Deliveries</p>
          <div className="flex flex-col gap-2">
            {['resize images without photoshop', 'voice notes to blog post'].map(q => (
              <div key={q} className="bg-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-500">
                "{q}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/profile/
git commit -m "feat: user profile page — boosted apps, favorite creators, recent deliveries"
```

---

## Task 16: Full Test Run & Polish

**Files:**
- Verify: all pages render without errors

- [ ] **Step 1: Run full test suite**

```bash
npx jest --passWithNoTests
```
Expected: All tests PASS, 0 failures

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: Build succeeds with no type errors

- [ ] **Step 3: Manual smoke test — navigate all 12 screens**

```bash
npm run dev
```

Visit each route and confirm it renders:
- `/` — Discover home (story rings + problem card + category grid)
- `/input` — Full-screen problem input
- `/results?q=resize+images` — Delivery results
- `/category/writing` — Category browse
- `/story/resume-ai` — Story viewer (full-screen)
- `/submit` — Developer form
- `/submit/generating` — AI generating state (auto-advances)
- `/submit/preview` — Package preview
- `/creator/kimdev` — Creator profile
- `/collections` — Collections list
- `/collections/solo-founder` — Collection detail
- `/feed` — My Feed
- `/profile` — User profile

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: AppDrop MVP UI complete — 12 screens, 3 layers, all mock data"
```
