// app/feed/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { fetchFeed } from '@/lib/api'
import type { FeedEntry } from '@/lib/api'
import FeedItem from '@/components/feed/FeedItem'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useLocale } from '@/lib/i18n'

export default function FeedPage() {
  const { t } = useLocale()
  const deviceId = useDeviceId()
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deviceId) return
    fetchFeed(deviceId)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deviceId])

  return (
    <div className="pb-20 min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="bg-white px-4 pt-3 pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
        <p className="font-extrabold text-gray-900 text-base">{t('feed.title')}</p>
        <p className="text-xs text-gray-400">{t('feed.subtitle')}</p>
      </div>
      {loading && (
        <div className="p-4 flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}
      {!loading && entries.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">{t('feed.empty')}</p>
          <p className="text-gray-300 text-xs mt-1">{t('feed.empty_hint')}</p>
        </div>
      )}
      {!loading && entries.length > 0 && (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{t('feed.today')}</p>
          {entries.map(({ item, creator, app }) => (
            <FeedItem key={item.id} item={item} creator={creator} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
