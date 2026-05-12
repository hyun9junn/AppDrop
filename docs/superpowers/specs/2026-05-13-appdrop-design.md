# AppDrop — MVP Design Spec
**Date:** 2026-05-13  
**Focus:** UX/UI Design  
**Status:** Draft

---

## 1. Platform Identity

AppDrop is an **AI-era app packaging and delivery platform**. It is not a social network.

- **Developers** package their apps into consumer-friendly Story cards, descriptions, tags, and promotional copy using a guided AI pipeline.
- **Users** describe a problem in plain language and receive the most relevant apps, delivered as Story cards.
- **Growth & loyalty** happens through boosting, favorite creators, a subscription feed, and app collections — not through social feeds or follower counts.

---

## 2. Three Layers

| Layer | Name | Role |
|---|---|---|
| A | Packaging | Developer submits → AI generates full app package |
| B | Delivery | User describes problem → AI delivers matching apps as Story cards |
| C | Story-driven Growth & Loyalty | Story rings, boosting, favorite creators, subscription feed, app collections |

The **Story card** is the universal unit across all three layers. It is generated in packaging, delivered in search results, shown in the story rings, and shared externally via shareable link.

---

## 3. Go-to-Market

- **Developer-first.** Build supply before demand. Developers can submit and publish apps before a large user base exists.
- **Web-first, mobile later.** MVP ships as a responsive web app. Mobile native follows after validation.
- **No freemium in MVP.** All packaging features are available to all developers. Monetization is deferred.

---

## 4. User Types

### Developer
Submits apps, gets a full package (hosted page, Story card, social copy). Wants distribution and promotion. Has a creator profile.

### User (app discoverer)
Non-technical person with a specific problem to solve. Does not browse catalogs; describes what they need. May become a regular by saving creators and following their drops.

---

## 5. Developer UX — Packaging Studio

### 5.1 Guided Submission Form

Developers submit via a 7-question guided form. The form is the primary AI input — no URL scraping, no auto-fill. Quality of output depends on quality of answers.

**Questions:**
1. App link (URL)
2. What problem does your app solve? *(1–2 sentences)*
3. Who is it for? *(target user description)*
4. What are the 3 core features?
5. How do users access it? *(Web App / API / Download / Chrome Extension — multi-select)*
6. Pricing *(Free / Freemium / Paid — single select)*
7. Category tags *(free text, AI-assisted)*

**Form UX:**
- Single-page form, vertically stacked
- Pill selects for Q5 and Q6 (tap to toggle)
- "Generate My App Package →" CTA at the bottom
- Estimated generation time shown: ~15 seconds

### 5.2 AI Packaging Pipeline

On submission, the AI generates the full app package:

| Output | Description |
|---|---|
| Title + tagline | Short, plain-language name and one-liner |
| Description | 2–3 sentence plain-English summary, written for non-technical users |
| Target user | One-sentence persona |
| Use cases | 3–5 concrete bullet points |
| Tags | Auto-generated, editable by developer |
| Story card | Visual card: gradient background, Problem → Solution structure |
| Social copy | Twitter/X post, LinkedIn post |
| Embeddings | Generated for semantic delivery matching (internal) |

### 5.3 Review & Publish

After generation, developer sees a preview of their full package:
- Left panel: Hosted app page preview
- Right panel: Story card + social copy

Developer can edit any field inline before publishing. On publish, the app enters the catalog and gets a shareable Story card URL.

### 5.4 Creator Profile

Each developer gets a creator profile:
- Name, bio, avatar, external links
- List of published apps (as Story cards)
- Follower count (shown as "Regulars")
- New drop announcement composer (for sending to followers via the subscription feed)

---

## 6. User UX — Discovery & Delivery Platform

The user-side is inspired by food delivery apps (Baedal Minjok): browse-first with AI delivery as the power feature. New users lead with the problem input; returning users lead with their subscription feed.

### 6.1 Navigation Structure

Four-tab bottom navigation:

| Tab | Icon | Content |
|---|---|---|
| Discover | 🏠 | Story rings, problem input, category grid, featured collections, new drops |
| Collections | 📦 | AI-curated app bundles by goal |
| My Feed | 📬 | Subscription updates from favorite creators |
| Profile | 👤 | Boosted apps, favorite creators, saved collections |

---

### 6.2 Discover Tab (Home)

The primary entry point. Layout from top to bottom:

#### Top Bar
- AppDrop logo (left)
- Search icon (right) — opens problem input as full-screen overlay
- Notification bell (right) — for feed updates

#### Story Rings Row
Horizontal scroll of circular app icons with gradient rings, identical in interaction to Instagram Stories.

- **Colored ring** = unseen Story (new or updated app)
- **Grey ring** = already viewed
- Each ring shows the app icon and app name below
- **Content source:** new drops this week + apps from favorite creators + highly boosted apps
- Tap → opens full-screen Story card viewer

**Story card viewer (full-screen):**
- Progress bars at top (one per app Story in current session)
- Creator avatar + name + timestamp (top left)
- Close button (top right)
- Story card content (Problem → Solution → Features → CTA)
- "Try [App] — Free →" primary CTA button
- Boost and Save Creator buttons at the bottom
- Swipe up → opens app in new tab
- Tap left/right → previous/next Story

**Developer value:** The Story ring row is the primary promotion surface on AppDrop. Appearing here is driven by recency (new drops), boost count, and creator loyalty. Future: paid featured story slots.

#### Problem Input Card
Prominent card below the Story rings with gradient background (indigo → purple):
- Heading: "What are you trying to do?"
- Subtext: "Describe your problem — we'll deliver the right apps"
- Text input area (tappable, opens full-screen input)
- "Deliver Apps →" button

Full-screen problem input:
- Large text area
- Example prompts shown as tappable chips below the input
- "Deliver" button submits and returns Story card results

**Delivery results page:**
- Heading: "Apps for: [user's problem summary]"
- 3–5 app Story cards shown vertically
- Each card: gradient header (Problem → Solution), app name, creator, boost count, use cases, Try / Boost / Save Creator actions
- Below results: "See a relevant collection →" if a matching collection exists

#### Category Grid
8 categories displayed as icon tiles in a 4×2 grid:

| Icon | Label |
|---|---|
| ✍️ | Writing |
| 🖼️ | Images |
| 🎙️ | Audio |
| 🎬 | Video |
| 📊 | Data |
| 💼 | Business |
| 🎨 | Design |
| 🤖 | AI Tools |

Tapping a category opens a filtered list of apps in that category, displayed as Story cards in a vertical scroll.

#### Featured Collections
Horizontal scroll of collection cards below the category grid:
- Each card: gradient background, emoji, collection title, app count
- "See all" link navigates to the Collections tab

#### New Drops
Vertical list of recently published apps:
- App icon, name, one-liner, boost count, creator name, Try button

---

### 6.3 Collections Tab

AI-curated bundles of apps for specific goals. Not a single-app recommendation — a complete stack.

**Collection card (list view):**
- Emoji + title + subtitle + app count

**Collection detail page:**
- Header: emoji, title, description, "Curated by AppDrop · X apps · Updated Y days ago"
- App list: each app shown as a compact row (icon, name, one-liner, Try button)

**Example collections:**
- 🚀 Solo Founder Starter Pack — 5 apps to go from idea to launch
- ✍️ Content Creator Toolkit — 4 apps to script, edit, and publish
- 🎙️ Podcast Production Kit — 3 apps to record, transcribe, and distribute
- 🎓 Student Productivity Pack — tools for note-taking, summarizing, and studying

Collections are generated by the AppDrop team initially, with AI assistance. User-created collections are out of scope for MVP.

---

### 6.4 My Feed Tab

The returning-user homepage. Shows chronological updates from favorite creators only.

**Feed item types:**

| Badge | Meaning |
|---|---|
| 🆕 New Drop | Creator published a new app |
| 🧪 Beta | Creator is looking for early testers |
| 📢 Announcement | Creator posted an update or news |
| 🔄 Update | Existing app received a significant update |

**Feed item anatomy:**
- Creator avatar + name + timestamp (top row)
- Badge (New Drop / Beta / Announcement / Update)
- App name + one-liner
- Brief description (2 lines max)
- Primary action button (View App / Join Beta / See What's New)

Feed is **chronological**, not algorithmic. Users see exactly what their favorite creators post, in order.

**Empty state (no favorite creators yet):**
- Prompt to browse the Discover tab and save creators they like
- Suggested creators based on their delivery history

---

### 6.5 Profile Tab

Personal space for the user's activity on AppDrop:

- **Boosted Apps** — apps they've backed
- **Favorite Creators** — their "regulars" (creator cards with follow/unfollow)
- **Saved Collections** — collections they've bookmarked
- **Recent Deliveries** — history of problem inputs and matched apps

---

## 7. Story Card Design System

The Story card is the visual identity of AppDrop. Every app has one.

### Card Structure (full version)
```
┌─────────────────────────────┐
│  THE PROBLEM                │  ← small label, uppercase, low opacity
│                             │
│  [Problem statement]        │  ← 1–2 lines, bold, large
│  ─────────────────          │  ← divider
│  THE SOLUTION               │  ← small label
│                             │
│  [App name]                 │  ← colored, semi-bold
│  [Solution description]     │  ← 1–2 lines
│                             │
│  ✓ Feature 1                │
│  ✓ Feature 2                │
│  ✓ Feature 3                │
│                             │
│  [Try App — Free →]         │  ← full-width CTA button
└─────────────────────────────┘
```

### Card Variants
| Variant | Used In |
|---|---|
| Full card | Story ring viewer, delivery results |
| Mini card (header only) | Category browse list, collection items |
| Ring thumbnail | Story rings row |

### Color
Each Story card has a gradient background auto-assigned from a palette of 8 gradients based on category:
- Writing: indigo → purple
- Images: sky → indigo
- Audio: emerald → sky
- Video: amber → red
- Data: blue → teal
- Business: orange → amber
- Design: purple → pink
- AI Tools: teal → cyan

Developers cannot customize gradients in MVP. This ensures visual consistency across the feed.

---

## 8. Growth & Loyalty Mechanics

| Feature | Description |
|---|---|
| **Boost** | One boost per user per app. Affects delivery ranking and Story ring placement. Not a vanity counter — a ranking signal. |
| **Favorite Creator** | Save a creator as a "regular." Unlocks their posts in My Feed. Closer to a newsletter subscription than social following. |
| **Subscription Feed** | Chronological updates from favorite creators only. New drops, betas, announcements, updates. |
| **App Collections** | AI-curated goal-based bundles. Shown in Discover and as a follow-up to delivery results. |
| **Story Rings** | The primary promotion surface. Apps appear here based on recency, boost count, and creator loyalty. |
| **Shareable Story Card URL** | Every app's Story card has a standalone shareable link. Opens the full-screen Story card viewer. Developers share these externally for promotion. |

---

## 9. Core Data Entities (Brief)

| Entity | Key Fields |
|---|---|
| App | id, title, tagline, link, creator_id, description, use_cases, tags, access_type, pricing, story_card, social_copy, embedding, boost_count, status |
| Creator | id, name, bio, avatar, links, app_ids[], follower_count |
| User | id, email, boosted_app_ids[], favorite_creator_ids[], saved_collection_ids[], query_history[] |
| Story Card | app_id, problem_statement, solution_statement, features[], gradient_theme, shareable_url |
| Collection | id, title, description, emoji, app_ids[], curated_by, updated_at |
| Boost | user_id, app_id, created_at (unique per pair) |
| Favorite | user_id, creator_id, created_at |
| Feed Item | creator_id, type (drop/beta/announcement/update), app_id, body, created_at |

---

## 10. AI Pipelines (Brief)

### Packaging Pipeline
1. Input: 7 form answers
2. LLM generates: description, tagline, target user, use cases, social copy
3. Template engine renders: Story card (gradient + structure)
4. Tags auto-generated and surfaced for developer review
5. Embedding created for delivery matching

### Delivery Engine
1. Input: user's plain-language problem description
2. LLM interprets intent and extracts key needs
3. Semantic search against app embeddings
4. Re-rank by boost count + recency
5. Return top 3–5 apps as Story cards
6. If a matching Collection exists, surface it below results

---

## 11. Out of Scope for MVP

- Mobile native app (web-first, mobile-responsive)
- Freemium / paid tiers
- User-created Collections
- Paid featured Story ring slots
- Analytics dashboard for developers
- Algorithmic feed (My Feed is chronological only)
- Badges and reward economy
- Developer-to-developer discovery
- In-app payments or affiliate links
