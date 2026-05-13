'use client'
import Link from 'next/link'
import type { App } from '@/lib/types'
import StoryCardMini from '@/components/story/StoryCardMini'
import { useLocale } from '@/lib/i18n'

export default function AppCard({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <StoryCardMini app={app} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.tagline}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {a.boostCount}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={a.link}
            target="_blank"
            className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
          >
            {t('app.try')}
          </Link>
          <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-1.5 text-xs">{t('app.boost')}</button>
          <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-1.5 text-xs">⭐</button>
        </div>
      </div>
    </div>
  )
}
