# AppDrop — Reels Format Design Spec
**Date:** 2026-05-14
**Focus:** Reels-style App Discovery
**Status:** Approved

---

## 1. Overview

AppDrop's core promotional format shifts from static Instagram Stories-style cards to a Reels/TikTok-style short-form video feed. Each app is presented as a short vertical video ad. Developers can upload their own clip; if they skip, the AI packaging pipeline auto-generates a motion-graphics animated sequence from the app's existing `storyCard` data.

The Problem → Solution → Features → CTA content structure is preserved. Try App / Boost / Save Creator actions remain. The change is in how the content is experienced: immersive, full-screen, auto-playing, swipe-navigated.

---

## 2. Approach

**Video-first with animated fallback.**

- If `app.reelVideoUrl` is set: play the developer-uploaded MP4 with `storyCard` content overlaid as captions.
- If `app.reelVideoUrl` is null: render a Framer Motion animated sequence — gradient background with timed text reveals for Problem, Solution, Features, and CTA. Auto-loops.

Both paths use the same `ReelViewer` component. The viewer checks for the URL and renders accordingly.

---

## 3. Data Model Changes

One new optional field added to the `App` type:

```ts
reelVideoUrl?: string   // uploaded MP4 URL, or null for animated fallback
```

The existing `storyCard` object is **unchanged**:

```ts
interface StoryCard {
  problemStatement: string
  solutionStatement: string
  features: string[]
  gradientTheme: GradientTheme
  shareableUrl: string   // now points to /reel/[appId]
}
```

`shareableUrl` is updated to point to `/reel/[appId]` instead of the old story viewer URL.

The AI packaging pipeline output is **unchanged** — no new LLM fields needed. The animated fallback is driven entirely by existing `storyCard` data on the client.

---

## 4. ReelViewer Component

New component: `components/story/ReelViewer.tsx`. Replaces `StoryViewer`.

### Container
Full-screen black background, max-width 430px centered, `fixed inset-0 z-50`.

### Playback — Video path (`reelVideoUrl` present)
- `<video>` element: `autoPlay`, `muted`, `loop`, `playsInline`, `object-fit: cover`, fills full screen.
- `storyCard` content (problem, solution, features, CTA) overlaid as a semi-transparent caption panel at the bottom.

### Playback — Animated path (`reelVideoUrl` null)
Gradient background fills screen. Framer Motion drives a timed sequence:

| Step | Content | Animation | Delay |
|---|---|---|---|
| 1 | "THE PROBLEM" label | fade in | 0s |
| 2 | Problem statement | slide up | 0.5s |
| 3 | Divider line | draw in | 1.2s |
| 4 | "THE SOLUTION" label | fade in | 1.8s |
| 5 | App title + solution | slide up | 2.2s |
| 6 | Feature 1 | slide in | 3.0s |
| 7 | Feature 2 | slide in | 3.4s |
| 8 | Feature 3 | slide in | 3.8s |
| 9 | CTA button | bounce in | 4.4s |
| 10 | Hold | — | 1.5s hold |
| 11 | Loop | — | restart |

### Navigation
- **Swipe up** = next app
- **Swipe down** = previous app
- **Tap fallback**: top half of screen = previous, bottom half = next (for non-swipe devices)
- Progress indicators: dot row at top (one dot per app in current session; active dot is white, others are white/30)

### Persistent Overlay (always visible on top of video/animation)
- Top right: close/back button
- Bottom left: creator avatar + creator name
- Bottom right: boost count (⬆ N)
- Bottom: full-width "Try [App] →" primary CTA button
- Bottom row: Boost button + Save Creator button

### Gesture handling
Use `touchstart`/`touchend` delta on Y axis. If `|deltaY| > 50px` = swipe. Fallback tap zones as above.

---

## 5. Reels Tab & Navigation

Bottom nav expands from 4 to 5 tabs. Reels is placed center.

| Tab | Icon | Label | Route |
|---|---|---|---|
| Discover | 🏠 | Discover | `/` |
| Collections | 📦 | Collections | `/collections` |
| **Reels** | **▶** | **Reels** | `/reels` |
| My Feed | 📬 | Feed | `/feed` |
| Profile | 👤 | Profile | `/profile` |

### `/reels` page
- Opens directly into `ReelViewer` full-screen experience.
- Feed is ranked: boost count + recency (personalization deferred).
- Infinite-scroll via swipe — each swipe loads the next app's Reel.
- No visible list or grid; purely the immersive viewer.

### `/reel/[appId]` page
- Opens `ReelViewer` starting at the specified app.
- After the app's Reel ends, continues to the ranked feed.
- This is the shareable link URL developers distribute externally.

### Entry points into ReelViewer
| Surface | Action | Result |
|---|---|---|
| Reels tab | Tap | Opens feed from top |
| Story ring (Discover) | Tap | Opens ReelViewer at that app |
| Results / Category / Collections card | "Watch Reel →" button | Opens ReelViewer at that app |
| Creator profile app entry | Tap play thumbnail | Opens ReelViewer at that app |
| External shareable link | Navigate to `/reel/[appId]` | Opens ReelViewer at that app |

### Backward compatibility
`/story/[appId]` redirects to `/reel/[appId]`.

---

## 6. Packaging Studio Changes

### New Step 8 — Add your Reel (optional)

Appended after the existing 7-question form as a distinct step, shown **before** the user taps "Generate My App Package →". The video upload is collected at submission time so `reelVideoUrl` is available when the app record is created.

```
┌─────────────────────────────────────┐
│  Add a short video clip (optional)  │
│                                     │
│  Upload a 15–30s vertical MP4       │
│  that shows your app in action.     │
│                                     │
│  [  Drop file or tap to upload  ]   │
│                                     │
│  Accepted: MP4, MOV · Max 50MB      │
│  Recommended: 9:16 vertical         │
│                                     │
│  Skip — we'll animate your Reel →   │
└─────────────────────────────────────┘
```

- Upload: Supabase Storage. On completion, `reelVideoUrl` is set on the app record.
- Skip: `reelVideoUrl` remains null. Animated fallback runs automatically.
- Client-side validation: MP4/MOV only, max 50MB, before upload begins.

### Updated Preview Page (`/submit/preview`)

Currently shows a static `StoryCard`. After this change:
- Shows the `ReelViewer` in a phone-frame mockup (plays the animated sequence, or the uploaded video if provided).
- Non-interactive for the preview (no swipe navigation); just auto-plays.
- Social copy section below remains unchanged.

---

## 7. Existing Surfaces

### Discover tab — Story rings
Story rings row stays. Tapping a ring opens `ReelViewer` for that app. Ring visual design is unchanged.

### Delivery results page (`/results`)
Static `StoryCard` list view is preserved. Each card gains a "Watch Reel →" button alongside Try / Boost / Save Creator. Tapping opens `ReelViewer` for that app.

### Category browse & Collections
Same pattern as results — list view with "Watch Reel →" entry point per card.

### Creator profile (`/creator/[id]`)
App list shows a Reel thumbnail (first frame of uploaded video, or static gradient tile for animated Reels) with a play button. Tapping opens `ReelViewer` for that app.

### `StoryCard` component
**Not deleted.** Remains in use for list views (results, category, collections). Only the full-screen viewer changes.

---

## 8. Routing Summary

| Route | Component | Notes |
|---|---|---|
| `/reels` | `ReelViewer` (ranked feed) | New |
| `/reel/[appId]` | `ReelViewer` (specific app) | New |
| `/story/[appId]` | Redirect → `/reel/[appId]` | Backward compat |
| `/submit` | Submission form (+ step 8) | Updated |
| `/submit/preview` | Preview with ReelViewer | Updated |

---

## 9. Out of Scope

- AI video generation via third-party services (Sora, Runway, Pika)
- Reel script / structured scene model
- Developer ability to customize animation timing or style
- Analytics on Reel play-through rate
- Reel audio (uploads play muted; animated fallback has no audio)
- Paid featured Reel slots
