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
