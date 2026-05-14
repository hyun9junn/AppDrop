'use client'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

export default function AppRow({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const gradient = gradientMap[a.storyCard.gradientTheme]
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
        {a.title[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{a.title}</p>
        <p className="text-[10px] text-gray-400 truncate">{a.tagline}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <Link
          href={`/reel/${app.id}`}
          className="bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          {t('reel.watch')}
        </Link>
        <Link
          href={a.link}
          target="_blank"
          className="bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-bold"
        >
          {t('app.try')}
        </Link>
      </div>
    </div>
  )
}
