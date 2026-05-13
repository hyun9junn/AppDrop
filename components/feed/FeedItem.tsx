'use client'
import type { FeedItem as FeedItemType, Creator, App, FeedItemType as FeedItemTypeEnum } from '@/lib/types'
import Link from 'next/link'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

interface FeedItemProps {
  item: FeedItemType
  creator: Creator
  app: App
}

const borderColors: Record<FeedItemTypeEnum, string> = {
  drop: '#6366f1',
  beta: '#8b5cf6',
  announcement: '#f59e0b',
  update: '#0ea5e9',
}

const badgeBg: Record<FeedItemTypeEnum, string> = {
  drop: 'bg-emerald-50 text-emerald-600',
  beta: 'bg-purple-50 text-purple-600',
  announcement: 'bg-amber-50 text-amber-600',
  update: 'bg-blue-50 text-blue-600',
}

const ctaBg: Record<FeedItemTypeEnum, string> = {
  drop: 'bg-brand text-white',
  beta: 'bg-purple-600 text-white',
  announcement: 'bg-amber-500 text-white',
  update: 'bg-gray-200 text-gray-600',
}

export default function FeedItem({ item, creator, app }: FeedItemProps) {
  const { t, localizeApp, localizeFeedItem } = useLocale()
  const a = localizeApp(app)
  const localItem = localizeFeedItem(item)
  const gradient = gradientMap[a.storyCard.gradientTheme]

  const hoursAgo = item.hoursAgo
  const timeLabel = hoursAgo < 24
    ? `${hoursAgo}${t('time.h_ago')}`
    : `${Math.floor(hoursAgo / 24)}${t('time.d_ago')}`

  const badgeKey = `badge.${item.type}` as const
  const ctaKey = `badge.cta.${item.type}` as const

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 border-l-4" style={{ borderLeftColor: borderColors[item.type] }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {creator.avatar}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-900">{creator.name}</p>
          <p className="text-[9px] text-gray-400">{timeLabel}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeBg[item.type]}`}>
          {t(badgeKey)}
        </span>
      </div>
      <p className="font-bold text-gray-900 text-sm mb-1">{a.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{localItem.body}</p>
      <Link
        href={`/story/${a.id}`}
        className={`block w-full ${ctaBg[item.type]} font-bold text-xs py-2 rounded-xl text-center`}
      >
        {t(ctaKey)}
      </Link>
    </div>
  )
}
