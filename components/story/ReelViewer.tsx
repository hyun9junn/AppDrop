'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { App, Creator, ReelStyle } from '@/lib/types'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost } from '@/lib/api'

// ── Category / pricing labels ─────────────────────────────────────
const categoryKo: Record<string, string> = {
  writing: '글쓰기', images: '이미지', audio: '오디오',
  video: '비디오', data: '데이터', business: '비즈니스',
  design: '디자인', 'ai-tools': 'AI 도구',
}
const pricingKo: Record<string, string> = {
  free: '무료', freemium: '부분 무료', paid: '유료',
}

// ── Inline SVG atoms ──────────────────────────────────────────────
function Svg({ d, size = 20, stroke = 'currentColor', sw = 1.6, fill = 'none', vb = 24, children }: {
  d?: string; size?: number; stroke?: string; sw?: number; fill?: string; vb?: number; children?: React.ReactNode
}) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}
      fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : children}
    </svg>
  )
}
const CloseIcon  = (p: { size?: number }) => <Svg {...p} stroke="#fff" d="M6 6l12 12M18 6l-12 12" />
const ArrowIcon  = (p: { size?: number; stroke?: string }) => <Svg {...p} d="M5 12h14M13 5l7 7-7 7" />
const BoltIcon   = (p: { size?: number; stroke?: string }) => (
  <Svg {...p} fill={p.stroke ?? '#fff'} d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />
)
const BookmarkIcon = ({ size = 15, stroke = '#fff', fill = 'none' }: { size?: number; stroke?: string; fill?: string }) => (
  <Svg size={size} stroke={stroke} fill={fill} d="M6 4h12v17l-6-4-6 4V4z" />
)
const MicIcon = (p: { size?: number; stroke?: string }) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Svg>
)
const CheckIcon = (p: { size?: number; stroke?: string }) => <Svg {...p} d="M5 12.5L10 17l9-10" />

// ── ReelStyleThumbnail — small visual hint per reel style ─────────
export function ReelStyleThumbnail({ reelStyle, compact = false }: { reelStyle?: ReelStyle; compact?: boolean }) {
  switch (reelStyle) {
    case 'paper':
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '38%', height: '78%', background: '#fff8ec', borderRadius: 6,
            transform: 'rotate(-6deg)', boxShadow: '0 2px 10px rgba(0,0,0,.15)',
            backgroundImage: 'repeating-linear-gradient(transparent 0 6px, rgba(0,0,0,0.08) 6px 7px)',
            backgroundSize: '100% 7px', backgroundPosition: '0 10px',
          }} />
          <div style={{
            width: '38%', height: '78%', background: '#fff', borderRadius: 6,
            transform: 'rotate(6deg) translateX(-6%)', boxShadow: '0 2px 10px rgba(0,0,0,.15)',
            backgroundImage: 'repeating-linear-gradient(transparent 0 6px, rgba(255,90,44,0.5) 6px 7px)',
            backgroundSize: '100% 7px', backgroundPosition: '0 10px',
          }} />
        </div>
      )
    case 'explosion':
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, padding: 12 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ background: `rgba(255,255,255,${0.18 + i * 0.04})`, borderRadius: 6 }} />
          ))}
        </div>
      )
    case 'waveform':
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              width: 3, height: `${20 + (Math.sin(i) + 1) * 30}%`,
              background: '#fff', borderRadius: 3, opacity: 0.85,
              animation: `pulseBar ${0.8 + (i % 5) * 0.15}s ease-in-out ${i * 0.04}s infinite`,
              transformOrigin: 'center',
            }} />
          ))}
        </div>
      )
    case 'stickies':
      return (
        <div style={{ position: 'absolute', inset: 0 }}>
          {(['#FFEAA1','#FFC7BA','#C9E5C0'] as const).map((c, i) => (
            <div key={c} style={{
              position: 'absolute', width: 56, height: 56, background: c,
              top: 10 + i * 18, left: 10 + i * 36,
              transform: `rotate(${(i - 1) * 6}deg)`,
              boxShadow: '0 3px 8px rgba(0,0,0,.15)', borderRadius: 2,
            }}>
              <div style={{ height: 6, marginTop: 12, marginLeft: 8, marginRight: 8, background: 'rgba(0,0,0,.4)', borderRadius: 1 }} />
              <div style={{ height: 6, marginTop: 6, marginLeft: 8, marginRight: 18, background: 'rgba(0,0,0,.3)', borderRadius: 1 }} />
              <div style={{ height: 6, marginTop: 6, marginLeft: 8, marginRight: 24, background: 'rgba(0,0,0,.25)', borderRadius: 1 }} />
            </div>
          ))}
        </div>
      )
    case 'speedrun':
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: 'monospace', fontSize: compact ? 22 : 32, color: '#FF5A2C', fontWeight: 600, letterSpacing: -1 }}>00:47</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 }}>제작 중…</div>
        </div>
      )
    default:
      return null
  }
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 1: PAPER TRANSFORM
// ═════════════════════════════════════════════════════════════════
function PaperTransformReel({ progress }: { progress: number }) {
  const swap = progress > 0.45
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #2A1F14 0%, #1A1208 100%)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.35, background: 'radial-gradient(80% 60% at 50% 30%, rgba(255,200,140,0.25), transparent 60%)' }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>문제</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 27, lineHeight: 1.15, marginTop: 4, padding: '0 36px', color: '#fff', fontStyle: 'italic' }}>
          하나의 이력서로는 <span style={{ color: '#FFB68A', fontStyle: 'normal' }}>모든</span> 공고를 커버할 수 없어요.
        </div>
      </div>

      <div style={{ position: 'absolute', top: '32%', left: 0, right: 0, height: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* BEFORE sheet */}
        <div style={{
          width: 130, height: 178, borderRadius: 6,
          background: '#FBF5EA', boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
          transform: swap ? 'translateX(-90px) rotate(-14deg) scale(.92)' : 'translateX(-32px) rotate(-7deg)',
          transition: 'transform .9s cubic-bezier(.6,.2,.2,1)',
          padding: 10, position: 'relative',
        }}>
          <PaperLines />
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'monospace', fontSize: 8, color: '#998870', letterSpacing: 1 }}>이전</div>
        </div>
        {/* AFTER sheet */}
        <div style={{
          width: 130, height: 178, borderRadius: 6,
          background: '#fff', boxShadow: '0 10px 28px rgba(255,90,44,0.35), 0 20px 40px rgba(0,0,0,0.5)',
          transform: swap ? 'translateX(32px) rotate(6deg) scale(1.05)' : 'translateX(90px) rotate(15deg) scale(.92)',
          transition: 'transform .9s cubic-bezier(.6,.2,.2,1)',
          padding: 10, position: 'relative',
        }}>
          <PaperLines highlighted />
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'monospace', fontSize: 8, color: '#FF5A2C', letterSpacing: 1 }}>이후 · 47초</div>
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            padding: '2px 6px', borderRadius: 3, background: '#FF5A2C', color: '#fff',
            fontFamily: 'monospace', fontSize: 7, letterSpacing: 1,
            opacity: swap ? 1 : 0, transition: 'opacity .4s .4s',
            transform: 'rotate(-4deg)',
          }}>매칭 ✓</div>
        </div>
      </div>

      {/* Coral arrow when swapped */}
      <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -50%)', opacity: swap ? 1 : 0, transition: 'opacity .4s .2s', zIndex: 4 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FF5A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px rgba(255,90,44,0.2), 0 8px 18px rgba(255,90,44,0.4)' }}>
          <ArrowIcon size={18} stroke="#fff" />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5, opacity: swap ? 1 : 0, transform: swap ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity .4s .5s, transform .4s .5s' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#FF5A2C' }}>해결 — 47초</span>
      </div>
    </div>
  )
}

function PaperLines({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ height: 7, width: '60%', background: '#1A1815', borderRadius: 1, marginBottom: 4 }} />
      <div style={{ height: 4, width: '40%', background: '#6E665C', borderRadius: 1, marginBottom: 10 }} />
      {Array.from({ length: 14 }).map((_, i) => {
        const hl = highlighted && [2, 5, 8, 11].includes(i)
        return (
          <div key={i} style={{ height: 3.5, marginBottom: 4, width: `${50 + (i * 37) % 50}%`, background: hl ? '#FF5A2C' : '#CFC4AE', borderRadius: 1, boxShadow: hl ? '0 0 0 1px rgba(255,90,44,0.15)' : 'none' }} />
        )
      })}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 2: IMAGE EXPLOSION
// ═════════════════════════════════════════════════════════════════
function ImageExplosionReel({ progress }: { progress: number }) {
  const exploded = progress > 0.35
  const variants = [
    { label: 'INSTAGRAM',  w: 56, h: 56,  dx: -90,  dy: -110, rot: -8 },
    { label: 'STORY',      w: 38, h: 68,  dx: 92,   dy: -114, rot: 6 },
    { label: 'TWITTER',    w: 88, h: 49,  dx: -100, dy: 44,   rot: -3 },
    { label: 'LINKEDIN',   w: 78, h: 42,  dx: 100,  dy: 44,   rot: 8 },
    { label: 'PINTEREST',  w: 38, h: 56,  dx: -64,  dy: 130,  rot: -4 },
    { label: 'SHOPIFY',    w: 60, h: 60,  dx: 58,   dy: 130,  rot: 4 },
    { label: 'YOUTUBE',    w: 80, h: 44,  dx: 0,    dy: -178, rot: 0 },
    { label: 'TIKTOK',     w: 36, h: 64,  dx: -150, dy: -10,  rot: -12 },
    { label: 'EMAIL HDR',  w: 88, h: 36,  dx: 140,  dy: -8,   rot: 10 },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 40%, #1A2A3A 0%, #050B14 70%)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>한 번 업로드로</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 36, lineHeight: 1.1, marginTop: 4, color: '#fff', letterSpacing: -0.4 }}>
          사진 1장 → <span style={{ fontStyle: 'italic', color: '#7FE7C4' }}>9가지 크기</span>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${exploded ? 0.85 : 1})`, transition: 'transform 1s cubic-bezier(.6,.2,.2,1)', width: 124, height: 124, borderRadius: 14, background: 'linear-gradient(135deg, #FF8A5C 0%, #C7390F 50%, #5B1B0C 100%)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 14, borderRadius: 8, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>HERO.JPG · 4096px</div>
      </div>

      {/* Variant tiles */}
      {variants.map((v, i) => (
        <div key={v.label} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: v.w, height: v.h, borderRadius: 6,
          background: 'linear-gradient(135deg, #FF8A5C 0%, #C7390F 60%, #5B1B0C 100%)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
          transform: exploded
            ? `translate(calc(-50% + ${v.dx}px), calc(-50% + ${v.dy}px)) rotate(${v.rot}deg)`
            : 'translate(-50%, -50%) scale(0.6)',
          opacity: exploded ? 1 : 0,
          transition: `transform .9s cubic-bezier(.4,.6,.2,1) ${i * 0.05}s, opacity .4s ${i * 0.05}s`,
        }}>
          <div style={{ position: 'absolute', inset: 4, borderRadius: 3, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: -14, left: 0, right: 0, textAlign: 'center', fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>{v.label}</div>
        </div>
      ))}

      <div style={{ position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#7FE7C4' }}>9개 플랫폼 · 원클릭 · 배경 제거</span>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 3: VOICE WAVEFORM
// ═════════════════════════════════════════════════════════════════
function VoiceWaveformReel({ progress }: { progress: number }) {
  const lines = [
    { text: '다음 주 아이디어 — ', delay: 0 },
    { text: '인티그레이션 페이지부터 먼저 출시하고,', delay: 0.18 },
    { text: '그 다음 수진 언니한테 가격 조율 얘기해야 해.', delay: 0.34 },
    { text: '아, 분석팀에 이메일도 보내야 한다는 거 상기시켜줘.', delay: 0.5 },
  ]
  const visible = lines.filter(l => progress > l.delay)

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1A3D2F 0%, #0E2A20 100%)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: -100, left: -100, right: -100, height: 320, background: 'radial-gradient(closest-side, rgba(127,231,196,0.18), transparent)' }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(127,231,196,0.85)' }}>녹음 중 — 0:34</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4, color: '#fff', letterSpacing: -0.3 }}>
          그냥 <span style={{ fontStyle: 'italic', color: '#7FE7C4' }}>말하세요.</span> 나머지는 우리가.
        </div>
      </div>

      {/* Waveform */}
      <div style={{ position: 'absolute', top: 200, left: 22, right: 22, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            width: 3, borderRadius: 3,
            height: `${20 + (Math.sin(i * 0.7) * 0.5 + 0.5) * 60}%`,
            background: '#7FE7C4',
            animation: `pulseBar ${0.7 + (i % 7) * 0.15}s ease-in-out ${i * 0.02}s infinite`,
            transformOrigin: 'center',
            opacity: i / 50 < progress * 1.5 ? 1 : 0.25,
            transition: 'opacity .3s',
          }} />
        ))}
      </div>

      {/* Transcript card */}
      <div style={{ position: 'absolute', top: 310, left: 22, right: 22, padding: 16, borderRadius: 22, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(127,231,196,0.25)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', minHeight: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <MicIcon size={13} stroke="#7FE7C4" />
          <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7FE7C4' }}>실시간 전사</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
          {visible.map((l, i) => {
            const isAction = l.text.includes('출시') || l.text.includes('이메일') || l.text.includes('상기')
            return (
              <div key={i} style={{ marginBottom: 6, animation: 'fadeUp .35s ease-out forwards', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                {isAction ? (
                  <>
                    <span style={{ flexShrink: 0, marginTop: 4, fontFamily: 'monospace', fontSize: 8, padding: '2px 5px', borderRadius: 3, background: '#FF5A2C', color: '#fff', letterSpacing: 1 }}>할 일</span>
                    <span style={{ color: '#fff' }}>{l.text}</span>
                  </>
                ) : (
                  <span>{l.text}</span>
                )}
              </div>
            )
          })}
          {progress < 0.6 && (
            <span style={{ display: 'inline-block', width: 10, height: 16, background: '#7FE7C4', verticalAlign: 'text-bottom', animation: 'pulseBar 1s infinite' }} />
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#7FE7C4' }}>액션 아이템 2개 자동 추출</span>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 4: STITCH (sticky notes → article)
// ═════════════════════════════════════════════════════════════════
function StitchReel({ progress }: { progress: number }) {
  const stitched = progress > 0.4
  const stickies = [
    { c: '#FFEAA1', x: 22,  y: 0,   r: -7,  text: '통계로 훅을 잡아' },
    { c: '#FFC7BA', x: 138, y: 14,  r: 8,   text: '왜 지금인가?' },
    { c: '#C9E5C0', x: 50,  y: 76,  r: -3,  text: '배운 것 3가지' },
    { c: '#BFD9F0', x: 168, y: 92,  r: 6,   text: 'CTA: 뉴스레터' },
    { c: '#F6D89A', x: 16,  y: 162, r: -10, text: '독자 사례?' },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #F6D89A 0%, #E8B870 100%)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0 2px, transparent 2px 6px)' }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7A4A12' }}>거친 메모들</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 32, lineHeight: 1.1, marginTop: 4, color: '#1A1815', letterSpacing: -0.4 }}>
          Stitch.
        </div>
      </div>

      {/* Sticky notes */}
      <div style={{ position: 'absolute', top: 160, left: '50%', transform: 'translateX(-50%)', width: 280, height: 240 }}>
        {stickies.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: s.x, top: s.y,
            width: 86, height: 64, background: s.c,
            transform: stitched
              ? `translate(${(50 - s.x) * 0.6}px, ${(120 - s.y) * 0.6}px) rotate(${s.r * 0.2}deg) scale(0.55)`
              : `rotate(${s.r}deg)`,
            transition: 'transform 1s cubic-bezier(.6,.2,.2,1)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)', padding: '8px 10px',
            fontFamily: '"Caveat", "Comic Sans MS", cursive',
            fontSize: 11, lineHeight: 1.2, color: '#3a2a14',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(0,0,0,0.35)', letterSpacing: 1, marginBottom: 3 }}>메모 {i + 1}</div>
            {s.text}
          </div>
        ))}
        {stitched && (
          <svg width="280" height="240" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M50 30 Q 140 50 240 50 T 240 200" stroke="#1A1815" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity=".5" />
          </svg>
        )}
      </div>

      {/* Polished article card */}
      <div style={{ position: 'absolute', bottom: 260, left: 22, right: 22, background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', transform: stitched ? 'translateY(0)' : 'translateY(180px)', opacity: stitched ? 1 : 0, transition: 'transform .8s cubic-bezier(.4,.7,.2,1) .2s, opacity .4s .2s' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--ink-faint, #A8A097)', letterSpacing: 1, textTransform: 'uppercase' }}>초안 v1 · 14분 전</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 18, lineHeight: 1.15, marginTop: 4, color: '#1A1815' }}>
          유료 아이디어로 무료 서비스를 출시하며 배운 세 가지
        </div>
        <div style={{ marginTop: 8 }}>
          {[100, 92, 78, 60].map((w, i) => (
            <div key={i} style={{ height: 4, borderRadius: 1, marginBottom: 4, width: `${w}%`, background: '#D9D0BD' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: 999, background: '#FFE9DF', color: '#C7390F', fontSize: 11, fontWeight: 500, fontFamily: 'monospace' }}>내 목소리로</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: 999, background: '#E2EFE8', color: '#1F5F4B', fontSize: 11, fontWeight: 500, fontFamily: 'monospace' }}>SEO 소제목</span>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 5: SPEEDRUN
// ═════════════════════════════════════════════════════════════════
function SpeedrunReel({ progress }: { progress: number }) {
  const remaining = Math.max(0, Math.round(60 - progress * 60))
  const stage = progress > 0.9 ? 4 : progress > 0.65 ? 3 : progress > 0.4 ? 2 : progress > 0.15 ? 1 : 0

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 360, height: 360, background: 'radial-gradient(closest-side, rgba(255,90,44,0.25), transparent)' }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#FF5A2C' }}>스피드런</span>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 30, marginTop: 4, color: '#fff', lineHeight: 1.1, letterSpacing: -0.3 }}>
          아이디어 → 실제 페이지<br /><span style={{ fontStyle: 'italic', color: '#FF5A2C' }}>60초 만에.</span>
        </div>
      </div>

      {/* Countdown ring */}
      <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
          <circle cx="60" cy="60" r="52" stroke="#FF5A2C" strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset={326.7 * progress}
            transform="rotate(-90 60 60)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: -1 }}>
            00:{String(remaining).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginTop: -2 }}>남은 시간</div>
        </div>
      </div>

      {/* Mock landing page */}
      <div style={{ position: 'absolute', top: 350, left: 36, right: 36, background: 'linear-gradient(180deg, #161616 0%, #0E0E0E 100%)', border: '1px solid #2A2A2A', borderRadius: 14, padding: 14, boxShadow: '0 20px 50px rgba(255,90,44,0.18), 0 0 0 1px rgba(255,90,44,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 9, color: '#5A5A5A' }}>orbit-app.com</span>
        </div>
        <div style={{ height: 11, width: stage >= 1 ? '70%' : '0%', background: '#fff', borderRadius: 2, transition: 'width .5s', marginBottom: 5 }} />
        <div style={{ height: 6, width: stage >= 1 ? '88%' : '0%', background: 'rgba(255,255,255,0.6)', borderRadius: 1, transition: 'width .5s .1s', marginBottom: 5 }} />
        <div style={{ height: 6, width: stage >= 1 ? '60%' : '0%', background: 'rgba(255,255,255,0.4)', borderRadius: 1, transition: 'width .5s .2s', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, opacity: stage >= 2 ? 1 : 0, transition: 'opacity .3s' }}>
          <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 6 }} />
          <div style={{ width: 50, height: 22, background: '#FF5A2C', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 8, color: '#fff', fontWeight: 600 }}>가입</div>
        </div>
        <div style={{ height: stage >= 3 ? 60 : 0, overflow: 'hidden', transition: 'height .4s', background: 'linear-gradient(135deg, #FF5A2C 0%, #C7390F 100%)', borderRadius: 6, position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 13, color: '#fff' }}>orbit · 새로운 방식으로 출시</div>
        </div>
        <div style={{ opacity: stage >= 4 ? 1 : 0, transform: stage >= 4 ? 'scale(1)' : 'scale(0.9)', transition: 'opacity .3s, transform .3s', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: '#7FE7C4', color: '#0E2A20', fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>
          <CheckIcon size={10} stroke="#0E2A20" /> 라이브
        </div>
      </div>
    </div>
  )
}

// ── Format map ────────────────────────────────────────────────────
const FORMATS: Record<string, React.ComponentType<{ progress: number }>> = {
  paper:     PaperTransformReel,
  explosion: ImageExplosionReel,
  waveform:  VoiceWaveformReel,
  stickies:  StitchReel,
  speedrun:  SpeedrunReel,
}

// ── Bottom drawer ─────────────────────────────────────────────────
function ReelDrawer({ app, creator, onClose }: { app: App; creator: Creator | undefined; onClose: () => void }) {
  const deviceId = useDeviceId()
  const [boosted, setBoosted] = useState(false)
  const [boostCount, setBoostCount] = useState(app.boostCount)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    setBoostCount(app.boostCount)
    setBoosted(false)
    setSaved(false)
  }, [app.id, app.boostCount])

  async function handleBoost() {
    if (!deviceId) return
    const prev = { boosted, boostCount }
    const nb = !boosted
    setBoosted(nb)
    setBoostCount(c => nb ? c + 1 : c - 1)
    try {
      const res = await toggleBoost(deviceId, app.id)
      setBoosted(res.boosted)
      setBoostCount(res.boostCount)
    } catch {
      setBoosted(prev.boosted)
      setBoostCount(prev.boostCount)
    }
  }

  const cat = categoryKo[app.category] ?? app.category
  const pricing = pricingKo[app.pricing] ?? app.pricing
  const tint = creator?.tint ?? '#FF5A2C'

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '60px 16px 22px', zIndex: 20, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.88) 100%)' }}>
      {/* Creator row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: tint, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, flexShrink: 0 }}>
          {creator?.avatar ?? app.title[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {creator?.name ?? '크리에이터'}
            <span style={{ color: '#FFB68A', fontSize: 10.5, fontFamily: 'monospace', letterSpacing: 1 }}>✓ 인증됨</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{cat} · {pricing} · {boostCount.toLocaleString()} 부스트</div>
        </div>
        <button
          onClick={() => setFollowing(f => !f)}
          style={{ padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.3)', background: following ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', color: following ? '#1A1815' : '#fff', fontWeight: 600, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          {following ? '팔로잉 ✓' : '팔로우'}
        </button>
      </div>

      {/* Title */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 22, lineHeight: 1.2, color: '#fff', letterSpacing: -0.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {app.title}
          <span style={{ color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', fontSize: 16, marginLeft: 6 }}>
            — {app.tagline.toLowerCase()}.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Link href={app.link} target="_blank" style={{
          flex: 1, padding: '13px', borderRadius: 999,
          background: '#fff', color: '#1A1815', fontWeight: 600, fontSize: 14,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          textDecoration: 'none',
        }}>
          {app.title} 사용해보기 <ArrowIcon size={14} stroke="#1A1815" />
        </Link>
        <button onClick={handleBoost} style={{ width: 46, height: 46, borderRadius: '50%', background: boosted ? 'var(--coral, #FF5A2C)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BoltIcon size={16} stroke="#fff" />
        </button>
        <button onClick={() => setSaved(s => !s)} style={{ width: 46, height: 46, borderRadius: '50%', background: saved ? '#fff' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookmarkIcon size={15} stroke={saved ? '#1A1815' : '#fff'} fill={saved ? '#1A1815' : 'none'} />
        </button>
      </div>
    </div>
  )
}

// ── Main ReelViewer ───────────────────────────────────────────────
interface ReelViewerProps {
  apps: App[]
  creators: Creator[]
  initialAppId?: string
}

export default function ReelViewer({ apps, creators, initialAppId }: ReelViewerProps) {
  const router = useRouter()
  const startIdx = initialAppId ? Math.max(0, apps.findIndex(a => a.id === initialAppId)) : 0
  const [idx, setIdx] = useState(startIdx)
  const [progress, setProgress] = useState(0)
  const touchStartY = useRef(0)

  const app = apps[Math.min(idx, apps.length - 1)]
  const creator = creators.find(c => c.id === app?.creatorId)

  useEffect(() => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 0.012
        if (next >= 1) {
          setIdx(i => (i + 1) % apps.length)
          return 0
        }
        return next
      })
    }, 60)
    return () => clearInterval(interval)
  }, [idx, apps.length])

  function jump(delta: number) {
    setIdx(i => (i + delta + apps.length) % apps.length)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta > 50) jump(1)
    else if (delta < -50) jump(-1)
  }

  if (!app) return null

  const Format = FORMATS[app.reelStyle ?? ''] ?? PaperTransformReel

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden', color: '#fff', zIndex: 50, maxWidth: 430, margin: '0 auto' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reel content — key forces remount/restart per app */}
      <div key={app.id} style={{ position: 'absolute', inset: 0 }}>
        <Format progress={progress} />
      </div>

      {/* Top chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px 0', zIndex: 30 }}>
        {/* Progress bars */}
        <div style={{ display: 'flex', gap: 4 }}>
          {apps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#fff',
                width: i < idx ? '100%' : i === idx ? `${progress * 100}%` : '0%',
                transition: i === idx ? 'none' : 'width .2s',
              }} />
            </div>
          ))}
        </div>
        {/* Counter + close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, whiteSpace: 'nowrap' }}>
            REEL {String(idx + 1).padStart(2, '0')} / {String(apps.length).padStart(2, '0')}
          </div>
          <button
            onClick={() => router.back()}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* Tap zones */}
      <button aria-label="이전" onClick={() => jump(-1)} style={{ position: 'absolute', left: 0, top: 80, bottom: 200, width: '30%', zIndex: 10, background: 'transparent' }} />
      <button aria-label="다음" onClick={() => jump(1)}  style={{ position: 'absolute', right: 0, top: 80, bottom: 200, width: '30%', zIndex: 10, background: 'transparent' }} />

      {/* Bottom drawer */}
      <ReelDrawer app={app} creator={creator} onClose={() => router.back()} />
    </div>
  )
}
