'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  const s = active ? '#fff' : '#6E665C'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" />
    </svg>
  )
}

function ReelsIcon({ active }: { active: boolean }) {
  const s = active ? '#fff' : '#6E665C'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill={s} stroke="none" />
    </svg>
  )
}

function InboxIcon({ active }: { active: boolean }) {
  const s = active ? '#fff' : '#6E665C'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h4l2 3h6l2-3h4" />
      <path d="M3 13l3-7h12l3 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  const s = active ? '#fff' : '#6E665C'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

const tabs = [
  { label: '탐색',   Icon: HomeIcon,   href: '/' },
  { label: '릴스',   Icon: ReelsIcon,  href: '/reels' },
  { label: '받은함', Icon: InboxIcon,   href: '/feed' },
  { label: '프로필', Icon: UserIcon,    href: '/profile' },
] as const

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm z-20"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 28,
        padding: '6px 4px',
        boxShadow: '0 8px 32px rgba(20,16,10,0.10), 0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(20,16,10,0.04)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
      }}
    >
      {tabs.map(({ label, Icon, href }) => {
        const active =
          pathname === href ||
          (href === '/reels' && pathname.startsWith('/reel'))
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: 50,
              borderRadius: 22,
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? '#fff' : 'var(--ink-soft)',
              transition: 'background .2s, color .2s',
              textDecoration: 'none',
            }}
          >
            <Icon active={active} />
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: -0.1 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
