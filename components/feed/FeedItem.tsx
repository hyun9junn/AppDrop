import type { FeedItem as FeedItemType, Creator, App, FeedItemType as FeedItemTypeEnum } from '@/lib/types'
import Link from 'next/link'
import { gradientMap } from '@/lib/types'

interface FeedItemProps {
  item: FeedItemType
  creator: Creator
  app: App
}

const badgeConfig: Record<FeedItemTypeEnum, { label: string; bg: string; text: string; cta: string; ctaBg: string }> = {
  drop:         { label: '🆕 New Drop',     bg: 'bg-emerald-50',  text: 'text-emerald-600', cta: 'View App →',       ctaBg: 'bg-brand' },
  beta:         { label: '🧪 Beta',         bg: 'bg-purple-50',   text: 'text-purple-600',  cta: 'Join Beta →',      ctaBg: 'bg-purple-600' },
  announcement: { label: '📢 Announcement', bg: 'bg-amber-50',    text: 'text-amber-600',   cta: 'Read More →',      ctaBg: 'bg-amber-500' },
  update:       { label: '🔄 Update',       bg: 'bg-blue-50',     text: 'text-blue-600',    cta: "See What's New →", ctaBg: 'bg-gray-200' },
}

function timeAgo(hoursAgo: number) {
  if (hoursAgo < 24) return `${hoursAgo}h ago`
  return `${Math.floor(hoursAgo / 24)}d ago`
}

const borderColors: Record<FeedItemTypeEnum, string> = {
  drop: '#6366f1',
  beta: '#8b5cf6',
  announcement: '#f59e0b',
  update: '#0ea5e9',
}

export default function FeedItem({ item, creator, app }: FeedItemProps) {
  const badge = badgeConfig[item.type]
  const gradient = gradientMap[app.storyCard.gradientTheme]

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 border-l-4" style={{ borderLeftColor: borderColors[item.type] }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {creator.avatar}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-900">{creator.name}</p>
          <p className="text-[9px] text-gray-400">{timeAgo(item.hoursAgo)}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>
      <p className="font-bold text-gray-900 text-sm mb-1">{app.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{item.body}</p>
      <Link
        href={`/story/${app.id}`}
        className={`block w-full ${badge.ctaBg} ${item.type === 'update' ? 'text-gray-600' : 'text-white'} font-bold text-xs py-2 rounded-xl text-center`}
      >
        {badge.cta}
      </Link>
    </div>
  )
}
