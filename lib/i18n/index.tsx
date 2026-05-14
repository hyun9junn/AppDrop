'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { App, Collection, FeedItem } from '@/lib/types'
import { appsKo } from '@/lib/mock-data/apps-ko'
import { collectionsKo } from '@/lib/mock-data/collections-ko'
import { feedItemsKo } from '@/lib/mock-data/feed-items-ko'

export type Locale = 'en' | 'ko'

const messages = {
  en: {
    // Navigation
    'nav.discover': 'Discover',
    'nav.collections': 'Collections',
    'nav.feed': 'My Feed',
    'nav.profile': 'Profile',
    // Home
    'home.featured_collections': 'Featured Collections',
    'home.see_all': 'See all',
    'home.new_drops': '🆕 New Drops',
    // Problem input card
    'input.heading': 'What are you trying to do?',
    'input.subtext': "Describe your problem — we'll deliver the right apps",
    'input.placeholder': 'e.g. I need to summarize a YouTube video...',
    'input.examples.0': 'Turn my voice notes into a blog post',
    'input.examples.1': 'Resize images for Instagram without Photoshop',
    'input.examples.2': 'Transcribe a recorded meeting',
    'input.examples.3': 'Turn a spreadsheet into a chart',
    // Input page
    'input_page.cancel': 'Cancel',
    'input_page.title': 'Find Apps',
    'input_page.heading': 'What are you\ntrying to do?',
    'input_page.subtext': 'Describe your problem in plain language',
    'input_page.placeholder': 'e.g. I need to turn my voice notes into a structured blog post automatically',
    'input_page.cta': 'Deliver Apps →',
    'input_page.try_these': 'Try these',
    'input_page.examples.0': '✍️ Write a blog post from my notes',
    'input_page.examples.1': '🎙️ Transcribe a voice recording',
    'input_page.examples.2': '🖼️ Remove background from a photo',
    'input_page.examples.3': '📊 Turn spreadsheet data into a chart',
    'input_page.examples.4': '📧 Write a cold email that gets replies',
    // Results
    'results.heading': 'Apps for:',
    // Categories
    'category.writing': 'Writing',
    'category.images': 'Images',
    'category.audio': 'Audio',
    'category.video': 'Video',
    'category.data': 'Data',
    'category.business': 'Business',
    'category.design': 'Design',
    'category.ai-tools': 'AI Tools',
    // Story card
    'card.the_problem': 'The Problem',
    'card.the_solution': 'The Solution',
    'card.boost': '⬆ Boost',
    'card.try': 'Try',
    // Story viewer
    'viewer.new_drop': 'New drop',
    'viewer.featured': 'Featured',
    'viewer.boost': '⬆ Boost',
    'viewer.save_creator': '⭐ Save Creator',
    'viewer.hint': 'Swipe up to open · Tap sides to navigate',
    // App cards
    'app.try': 'Try →',
    'app.boost': '⬆ Boost',
    // Feed
    'feed.title': '📬 My Feed',
    'feed.subtitle': 'Updates from your favorite creators',
    'feed.today': 'From your favorite creators · Today',
    'feed.empty': 'No updates yet.',
    'feed.empty_hint': 'Save creators you like to see their drops here.',
    // Feed badges
    'badge.drop': '🆕 New Drop',
    'badge.beta': '🧪 Beta',
    'badge.announcement': '📢 Announcement',
    'badge.update': '🔄 Update',
    'badge.cta.drop': 'View App →',
    'badge.cta.beta': 'Join Beta →',
    'badge.cta.announcement': 'Read More →',
    'badge.cta.update': "See What's New →",
    // Collections
    'collections.title': '📦 Collections',
    'collections.subtitle': 'App bundles for specific goals',
    'collections.curated_by': 'Curated by AppDrop',
    'collections.apps': 'apps',
    'collections.updated': 'Updated',
    'collections.days_ago': 'days ago',
    // Profile
    'profile.title': '👤 Profile',
    'profile.joined': 'Joined May 2026',
    'profile.boosted': '⬆ Boosted Apps',
    'profile.favorites': '⭐ Favorite Creators',
    'profile.recent': '🕐 Recent Deliveries',
    'profile.regular': 'Regular ✓',
    'profile.regulars': 'Regulars',
    'profile.apps': 'apps',
    'profile.recent.0': 'resize images without photoshop',
    'profile.recent.1': 'voice notes to blog post',
    // Submit
    'submit.title': 'Package Your App',
    'submit.q1': '1. App Link',
    'submit.q1_ph': 'https://your-app.com',
    'submit.q2': '2. What problem does your app solve?',
    'submit.q2_ph': 'Describe the problem in 1–2 sentences',
    'submit.q3': '3. Who is it for?',
    'submit.q3_ph': 'Who is it for? (e.g. freelancers, marketers)',
    'submit.q4': '4. What are the 3 core features?',
    'submit.q4_ph': 'List 3 core features, comma-separated',
    'submit.q5': '5. How do users access it?',
    'submit.q6': '6. Pricing',
    'submit.q7': '7. Category Tags',
    'submit.q7_ph': 'e.g. writing, productivity, AI',
    'submit.cta': 'Generate My App Package →',
    // Generating
    'generating.title': 'Packaging your app...',
    'generating.subtitle': 'AI is generating your full package',
    'generating.step.0': 'Reading your submission...',
    'generating.step.1': 'Generating Story card',
    'generating.step.2': 'Writing social copy',
    // Preview
    'preview.title': 'Your App Package',
    'preview.subtitle': 'Review your package before publishing',
    'preview.story_card': 'Story Card',
    'preview.twitter': 'Twitter/X Copy',
    'preview.linkedin': 'LinkedIn Copy',
    'preview.publish': 'Publish',
    'preview.publish_cta': 'Publish App →',
    // Creator
    'creator.title': 'Creator Profile',
    'creator.regulars': 'Regulars',
    'creator.post_update': '📢 Post an Update',
    'creator.post_ph': 'Share a new drop, beta invite, or announcement...',
    'creator.my_apps': 'My Apps',
    'creator.badge.drop': '🆕 New Drop',
    'creator.badge.beta': '🧪 Beta',
    'creator.badge.announcement': '📢 Update',
    // Time
    'time.h_ago': 'h ago',
    'time.d_ago': 'd ago',
    // Category page
    'category.apps': 'Apps',
    'category.empty': 'No apps in this category yet.',
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
  },
  ko: {
    'nav.discover': '탐색',
    'nav.collections': '컬렉션',
    'nav.feed': '내 피드',
    'nav.profile': '프로필',
    'home.featured_collections': '추천 컬렉션',
    'home.see_all': '전체 보기',
    'home.new_drops': '🆕 새로운 앱',
    'input.heading': '무엇을 하려고 하나요?',
    'input.subtext': '문제를 설명해 주세요 — 딱 맞는 앱을 찾아드릴게요',
    'input.placeholder': '예) 유튜브 영상을 요약하고 싶어요...',
    'input.examples.0': '음성 메모를 블로그 글로 변환하기',
    'input.examples.1': '포토샵 없이 이미지 크기 조정하기',
    'input.examples.2': '회의 녹음 파일 텍스트로 변환하기',
    'input.examples.3': '스프레드시트를 차트로 만들기',
    'input_page.cancel': '취소',
    'input_page.title': '앱 찾기',
    'input_page.heading': '무엇을 하려고\n하나요?',
    'input_page.subtext': '문제를 쉬운 말로 설명해 주세요',
    'input_page.placeholder': '예) 음성 메모를 구조화된 블로그 포스트로 자동 변환하고 싶어요',
    'input_page.cta': '앱 찾기 →',
    'input_page.try_these': '이런 건 어떠세요',
    'input_page.examples.0': '✍️ 메모로 블로그 글 작성하기',
    'input_page.examples.1': '🎙️ 음성 녹음 텍스트로 변환하기',
    'input_page.examples.2': '🖼️ 사진 배경 제거하기',
    'input_page.examples.3': '📊 스프레드시트를 차트로 만들기',
    'input_page.examples.4': '📧 답장률 높은 영업 이메일 작성하기',
    'results.heading': '검색 결과:',
    'category.writing': '글쓰기',
    'category.images': '이미지',
    'category.audio': '오디오',
    'category.video': '영상',
    'category.data': '데이터',
    'category.business': '비즈니스',
    'category.design': '디자인',
    'category.ai-tools': 'AI 도구',
    'card.the_problem': '문제',
    'card.the_solution': '해결책',
    'card.boost': '⬆ 부스트',
    'card.try': '사용해보기',
    'viewer.new_drop': '새 앱',
    'viewer.featured': '추천',
    'viewer.boost': '⬆ 부스트',
    'viewer.save_creator': '⭐ 크리에이터 저장',
    'viewer.hint': '위로 스와이프하여 열기 · 양옆 탭으로 이동',
    'app.try': '사용해보기 →',
    'app.boost': '⬆ 부스트',
    'feed.title': '📬 내 피드',
    'feed.subtitle': '내가 저장한 크리에이터의 업데이트',
    'feed.today': '내가 저장한 크리에이터 · 오늘',
    'feed.empty': '아직 업데이트가 없어요.',
    'feed.empty_hint': '좋아하는 크리에이터를 저장하면 새 앱 소식을 받을 수 있어요.',
    'badge.drop': '🆕 새 앱',
    'badge.beta': '🧪 베타',
    'badge.announcement': '📢 공지',
    'badge.update': '🔄 업데이트',
    'badge.cta.drop': '앱 보기 →',
    'badge.cta.beta': '베타 참여 →',
    'badge.cta.announcement': '더 보기 →',
    'badge.cta.update': '업데이트 보기 →',
    'collections.title': '📦 컬렉션',
    'collections.subtitle': '목표별 앱 묶음',
    'collections.curated_by': 'AppDrop 큐레이션',
    'collections.apps': '개 앱',
    'collections.updated': '업데이트',
    'collections.days_ago': '일 전',
    'profile.title': '👤 프로필',
    'profile.joined': '2026년 5월 가입',
    'profile.boosted': '⬆ 부스트한 앱',
    'profile.favorites': '⭐ 좋아하는 크리에이터',
    'profile.recent': '🕐 최근 검색',
    'profile.regular': '단골 ✓',
    'profile.regulars': '단골',
    'profile.apps': '개 앱',
    'profile.recent.0': '포토샵 없이 이미지 크기 조정',
    'profile.recent.1': '음성 메모를 블로그 글로 변환',
    'submit.title': '앱 패키지 만들기',
    'submit.q1': '1. 앱 링크',
    'submit.q1_ph': 'https://your-app.com',
    'submit.q2': '2. 앱이 해결하는 문제는 무엇인가요?',
    'submit.q2_ph': '1~2문장으로 문제를 설명해 주세요',
    'submit.q3': '3. 대상 사용자는 누구인가요?',
    'submit.q3_ph': '예) 프리랜서, 마케터',
    'submit.q4': '4. 핵심 기능 3가지는 무엇인가요?',
    'submit.q4_ph': '핵심 기능 3가지를 쉼표로 구분하여 입력해 주세요',
    'submit.q5': '5. 어떻게 접근하나요?',
    'submit.q6': '6. 가격',
    'submit.q7': '7. 카테고리 태그',
    'submit.q7_ph': '예) 글쓰기, 생산성, AI',
    'submit.cta': '앱 패키지 생성하기 →',
    'generating.title': '앱을 패키징하는 중...',
    'generating.subtitle': 'AI가 전체 패키지를 생성하고 있어요',
    'generating.step.0': '제출 내용을 분석하는 중...',
    'generating.step.1': '스토리 카드 생성 중',
    'generating.step.2': '소셜 카피 작성 중',
    'preview.title': '앱 패키지',
    'preview.subtitle': '게시 전에 패키지를 확인하세요',
    'preview.story_card': '스토리 카드',
    'preview.twitter': 'Twitter/X 카피',
    'preview.linkedin': 'LinkedIn 카피',
    'preview.publish': '게시',
    'preview.publish_cta': '앱 게시하기 →',
    'creator.title': '크리에이터 프로필',
    'creator.regulars': '단골',
    'creator.post_update': '📢 업데이트 올리기',
    'creator.post_ph': '새 앱, 베타 초대, 공지 등을 공유해 보세요...',
    'creator.my_apps': '내 앱',
    'creator.badge.drop': '🆕 새 앱',
    'creator.badge.beta': '🧪 베타',
    'creator.badge.announcement': '📢 업데이트',
    'time.h_ago': '시간 전',
    'time.d_ago': '일 전',
    'category.apps': '앱',
    'category.empty': '이 카테고리에 아직 앱이 없어요.',
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
  },
} as const

type MessageKey = keyof typeof messages.en

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: MessageKey) => string
  localizeApp: (app: App) => App
  localizeCollection: (col: Collection) => Collection
  localizeFeedItem: (item: FeedItem) => FeedItem
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  localizeApp: (a) => a,
  localizeCollection: (c) => c,
  localizeFeedItem: (f) => f,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko')

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null
    if (stored === 'en' || stored === 'ko') setLocaleState(stored)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('locale', l)
  }

  function t(key: MessageKey): string {
    return (messages[locale] as Record<string, string>)[key]
      ?? (messages.en as Record<string, string>)[key]
      ?? key
  }

  function localizeApp(app: App): App {
    if (locale === 'en') return app
    const override = (appsKo as Record<string, Partial<App>>)[app.id]
    if (!override) return app
    return {
      ...app,
      ...override,
      storyCard: { ...app.storyCard, ...(override.storyCard ?? {}) },
    }
  }

  function localizeCollection(col: Collection): Collection {
    if (locale === 'en') return col
    const override = (collectionsKo as Record<string, Partial<Collection>>)[col.id]
    if (!override) return col
    return { ...col, ...override }
  }

  function localizeFeedItem(item: FeedItem): FeedItem {
    if (locale === 'en') return item
    const override = (feedItemsKo as Record<string, Partial<FeedItem>>)[item.id]
    if (!override) return item
    return { ...item, ...override }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, localizeApp, localizeCollection, localizeFeedItem }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
