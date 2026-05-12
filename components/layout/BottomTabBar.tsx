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
