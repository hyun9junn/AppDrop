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
