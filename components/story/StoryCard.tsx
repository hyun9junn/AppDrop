'use client'
import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

interface StoryCardProps {
  app: App
  showActions?: boolean
}

export default function StoryCard({ app, showActions = true }: StoryCardProps) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const gradient = gradientMap[a.storyCard.gradientTheme]
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className={`bg-gradient-to-br ${gradient} p-5 text-center text-white`}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-2">{t('card.the_problem')}</p>
        <p className="font-bold text-sm leading-snug mb-3">{a.storyCard.problemStatement}</p>
        <div className="w-6 h-px bg-white/30 mx-auto mb-3" />
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">{t('card.the_solution')}</p>
        <p className="font-bold text-base">{a.title}</p>
        <p className="text-xs opacity-80 mt-1">{a.storyCard.solutionStatement}</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.pricing} · {a.accessType[0]}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {a.boostCount}</p>
        </div>
        <ul className="mb-3 space-y-1">
          {a.storyCard.features.map(f => (
            <li key={f} className="text-[11px] text-gray-600 flex gap-1">
              <span className="text-brand">✓</span> {f}
            </li>
          ))}
        </ul>
        {showActions && (
          <div className="flex gap-2">
            <Link
              href={a.link}
              target="_blank"
              className="flex-[2] bg-brand text-white rounded-xl py-2 text-center text-xs font-bold"
            >
              {t('card.try')} {a.title} →
            </Link>
            <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-xs font-medium">{t('card.boost')}</button>
            <button className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-xs font-medium">⭐</button>
          </div>
        )}
      </div>
    </div>
  )
}
