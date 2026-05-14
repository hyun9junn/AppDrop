// app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n'
import { fetchApps, fetchCollections } from '@/lib/api'
import type { App, Collection, GradientTheme } from '@/lib/types'
import StoryRing from '@/components/story/StoryRing'
import CategoryGrid from '@/components/discover/CategoryGrid'
import { ReelStyleThumbnail } from '@/components/story/ReelViewer'

const accentFromTheme: Record<GradientTheme, string> = {
  'indigo-purple': '#6366f1',
  'sky-indigo':    '#38bdf8',
  'emerald-sky':   '#34d399',
  'amber-red':     '#f59e0b',
  'blue-teal':     '#3b82f6',
  'orange-amber':  '#f97316',
  'purple-pink':   '#a855f7',
  'teal-cyan':     '#2dd4bf',
}

export default function DiscoverPage() {
  const { t, localizeApp, localizeCollection } = useLocale()
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchApps().then(setApps).catch(() => {})
    fetchCollections().then(setCollections).catch(() => {})
  }, [])

  const sorted = [...apps].sort((a, b) => b.boostCount - a.boostCount)
  const featuredApp = sorted[0]
  const trending = sorted.slice(0, 4)
  const newApps = apps.filter(a => a.isNew)

  function handleSearch(q: string) {
    if (!q.trim()) return
    router.push(`/results?q=${encodeURIComponent(q.trim())}`)
  }

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ─── 인사 헤더 ─── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
          >
            {todayStr}
          </p>
          <div
            className="mt-1"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: -0.3,
              color: 'var(--ink)',
            }}
          >
            안녕하세요,{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>수빈님.</em>
          </div>
        </div>
        <Link href="/profile">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ml-3"
            style={{
              background: 'linear-gradient(140deg, #FFD6BA, #E1C9F0)',
              color: 'var(--ink)',
              boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 4px 10px -2px rgba(0,0,0,.08)',
            }}
          >
            S
          </div>
        </Link>
      </div>

      {/* ─── 문제 히어로 카드 ─── */}
      <div
        className="mx-4 mt-4 rounded-[28px] p-5 relative overflow-hidden cursor-pointer"
        style={{
          background: 'var(--ink)',
          boxShadow: '0 4px 14px rgba(24,20,12,0.07), 0 30px 60px -20px rgba(24,20,12,0.25)',
        }}
        onClick={() => router.push('/input')}
      >
        <div
          className="absolute -right-10 -top-8 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(255,90,44,0.55), transparent)' }}
        />
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)' }}
        >
          AppDrop에게 문제를 말해보세요
        </p>
        <div
          className="mt-2"
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 27,
            lineHeight: 1.2,
            letterSpacing: -0.2,
            color: '#fff',
          }}
        >
          이번 주{' '}
          <em style={{ fontStyle: 'italic', color: '#FFD7C1' }}>불편한 게</em>
          <br />
          뭔가요?
        </div>
        <div
          className="mt-4 flex items-center gap-2.5 px-3.5 py-3 rounded-[18px]"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>🔍</span>
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            placeholder={t('input.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={e => { e.stopPropagation(); handleSearch(query) }}
            className="px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0"
            style={{ background: 'var(--coral)' }}
          >
            찾기 →
          </button>
        </div>
      </div>

      {/* ─── 스토리 링 ─── */}
      <div className="mt-6 pl-5">
        <div className="flex items-center justify-between pr-5 mb-3">
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
          >
            팔로우하는 크리에이터
          </p>
          <span className="text-[11px] font-medium" style={{ color: 'var(--ink-soft)' }}>
            전체 보기
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide pr-5">
          {sorted.slice(0, 8).map((app, i) => (
            <StoryRing key={app.id} app={app} seen={i > 2} />
          ))}
        </div>
      </div>

      {/* ─── 카테고리 그리드 ─── */}
      <div className="mt-5 mx-4">
        <div
          className="bg-white rounded-[24px] p-3.5"
          style={{
            border: '1px solid var(--line)',
            boxShadow: '0 1px 0 rgba(24,20,12,0.04), 0 8px 24px -10px rgba(24,20,12,0.10)',
          }}
        >
          <CategoryGrid />
        </div>
      </div>

      {/* ─── 에디터 픽 (최고 부스트 앱) ─── */}
      {featuredApp && <FeaturedCard app={featuredApp} localizeApp={localizeApp} />}

      {/* ─── 트렌딩 ─── */}
      <div className="mt-7 pl-5">
        <div className="flex items-baseline justify-between pr-5 mb-3">
          <div>
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
            >
              이번 주 트렌딩
            </p>
            <div
              className="mt-1"
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 22,
                lineHeight: 1.1,
                letterSpacing: -0.2,
                color: 'var(--ink)',
              }}
            >
              모두가 <em style={{ fontStyle: 'italic' }}>부스트</em>하는 앱
            </div>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide pr-5">
          {trending.map((app, i) => {
            const a = localizeApp(app)
            const accent = accentFromTheme[app.storyCard.gradientTheme]
            return (
              <Link key={app.id} href={`/reel/${app.id}`} className="flex-shrink-0">
                <div
                  className="w-48 bg-white rounded-[22px] p-3.5 cursor-pointer"
                  style={{
                    border: '1px solid var(--line)',
                    boxShadow: '0 1px 0 rgba(24,20,12,0.04), 0 8px 24px -10px rgba(24,20,12,0.10)',
                  }}
                >
                  <div
                    className="h-24 rounded-[14px] relative overflow-hidden mb-3"
                    style={{ background: accent + '1a' }}
                  >
                    <ReelStyleThumbnail reelStyle={app.reelStyle} compact />
                  </div>
                  <p
                    className="text-[10px]"
                    style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
                  >
                    #{String(i + 1).padStart(2, '0')}
                  </p>
                  <p
                    className="font-semibold text-sm mt-1.5 leading-tight"
                    style={{ color: 'var(--ink)', letterSpacing: -0.2 }}
                  >
                    {a.title}
                  </p>
                  <p
                    className="text-[12px] mt-1 leading-snug line-clamp-2"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {a.tagline}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ─── 새로운 드롭 ─── */}
      {newApps.length > 0 && (
        <div className="mt-7 px-5">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
              >
                오늘 새로 나온
              </p>
              <div
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 22,
                  lineHeight: 1.1,
                  letterSpacing: -0.2,
                  color: 'var(--ink)',
                }}
              >
                새로운 <em style={{ fontStyle: 'italic' }}>드롭</em>
              </div>
            </div>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--coral-ink)' }}>
              ● 라이브
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {newApps.map(app => {
              const a = localizeApp(app)
              const accent = accentFromTheme[app.storyCard.gradientTheme]
              return (
                <Link key={app.id} href={`/reel/${app.id}`}>
                  <div
                    className="flex items-center gap-3.5 p-3 bg-white rounded-[22px] cursor-pointer"
                    style={{
                      border: '1px solid var(--line)',
                      boxShadow: '0 1px 0 rgba(24,20,12,0.04), 0 8px 24px -10px rgba(24,20,12,0.10)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0"
                      style={{
                        background: accent,
                        fontFamily: 'var(--font-serif, Georgia, serif)',
                      }}
                    >
                      {a.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'var(--ink)', letterSpacing: -0.2 }}
                        >
                          {a.title}
                        </span>
                        <span
                          className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: 'var(--coral)', letterSpacing: 0.5 }}
                        >
                          NEW
                        </span>
                      </div>
                      <p
                        className="text-[12.5px] mt-0.5 leading-snug truncate"
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        {a.tagline}
                      </p>
                    </div>
                    <span style={{ color: 'var(--ink-faint)', fontSize: 18 }}>›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 컬렉션 ─── */}
      {collections.length > 0 && (
        <div className="mt-7 pl-5">
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
          >
            큐레이션 컬렉션
          </p>
          <div
            className="mt-1 mb-3.5"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 22,
              lineHeight: 1.1,
              letterSpacing: -0.2,
              color: 'var(--ink)',
            }}
          >
            지금 당신에게{' '}
            <em style={{ fontStyle: 'italic' }}>필요한 앱</em>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-hide pr-5">
            {collections.map(col => {
              const c = localizeCollection(col)
              return (
                <Link key={col.id} href={`/collections/${col.id}`} className="flex-shrink-0">
                  <div
                    className="w-56 bg-white rounded-[22px] p-4 cursor-pointer"
                    style={{
                      border: '1px solid var(--line)',
                      boxShadow: '0 1px 0 rgba(24,20,12,0.04), 0 8px 24px -10px rgba(24,20,12,0.10)',
                    }}
                  >
                    <p className="text-2xl mb-3">{c.emoji}</p>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: 'var(--ink)', letterSpacing: -0.1 }}
                    >
                      {c.title}
                    </p>
                    <p
                      className="text-[11px] mt-1 leading-snug line-clamp-2"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {c.description}
                    </p>
                    <p
                      className="text-[10px] mt-2.5"
                      style={{ fontFamily: 'monospace', color: 'var(--ink-faint)' }}
                    >
                      {c.appIds.length} {t('collections.apps')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 개발자 CTA ─── */}
      <div
        className="mx-4 mt-7 p-4 rounded-[24px] flex gap-3.5 items-center"
        style={{
          background: 'linear-gradient(135deg, #FFE9DF 0%, #F6D89A 100%)',
          border: '1px solid #F1D6A8',
        }}
      >
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: 'var(--ink)', color: '#fff' }}
        >
          ✦
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 20,
              lineHeight: 1.15,
              color: 'var(--ink)',
            }}
          >
            앱을 만드셨나요?{' '}
            <em style={{ fontStyle: 'italic' }}>드롭하세요.</em>
          </div>
          <p className="text-[12px] mt-1" style={{ color: 'var(--ink-soft)' }}>
            AppDrop이 카피, 릴, 공유 키트를 만들어드려요.
          </p>
        </div>
        <Link href="/submit">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
            style={{ background: 'var(--ink)', color: '#fff' }}
          >
            →
          </div>
        </Link>
      </div>
    </div>
  )
}

function FeaturedCard({
  app,
  localizeApp,
}: {
  app: App
  localizeApp: (a: App) => App
}) {
  const a = localizeApp(app)
  const accent = accentFromTheme[app.storyCard.gradientTheme]

  return (
    <Link href={`/reel/${app.id}`}>
      <div
        className="mx-4 mt-7 rounded-[28px] overflow-hidden cursor-pointer relative"
        style={{
          background: accent,
          color: '#fff',
          boxShadow: '0 4px 14px rgba(24,20,12,0.07), 0 30px 60px -20px rgba(24,20,12,0.25)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 90% at 90% -10%, rgba(255,255,255,0.18), transparent), radial-gradient(40% 60% at -10% 110%, rgba(0,0,0,0.18), transparent)',
            mixBlendMode: 'soft-light',
          }}
        />
        <div className="p-5 relative">
          <div className="flex items-center gap-2">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.72)' }}
            >
              에디터 픽
            </p>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.22)',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              #01
            </span>
          </div>
          <div
            className="mt-2.5"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: -0.4,
            }}
          >
            {a.title}
          </div>
          <p className="text-sm mt-1.5 leading-snug" style={{ opacity: 0.9 }}>
            {a.tagline}
          </p>

          <div
            className="mt-4 rounded-[18px] h-36 relative overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <ReelStyleThumbnail reelStyle={app.reelStyle} />
          </div>

          <div className="flex gap-2.5 mt-4">
            <Link
              href={`/reel/${app.id}`}
              onClick={e => e.stopPropagation()}
              className="flex-1 py-3 rounded-full flex items-center justify-center gap-1.5 text-sm font-semibold"
              style={{ background: '#fff', color: accent }}
            >
              ▶ 릴 보기
            </Link>
            <Link
              href={app.link}
              target="_blank"
              onClick={e => e.stopPropagation()}
              className="py-3 px-4 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(0,0,0,0.22)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
              }}
            >
              사용해보기
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}
