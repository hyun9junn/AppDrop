'use client'
import { feedItems } from '@/lib/mock-data/feed-items'
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'
import FeedItem from '@/components/feed/FeedItem'
import { useLocale } from '@/lib/i18n'

export default function FeedPage() {
  const { t } = useLocale()

  const enriched = feedItems
    .map(item => ({
      item,
      creator: creators.find(c => c.id === item.creatorId),
      app: apps.find(a => a.id === item.appId),
    }))
    .filter(e => e.creator && e.app) as { item: typeof feedItems[0]; creator: typeof creators[0]; app: typeof apps[0] }[]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">{t('feed.title')}</p>
        <p className="text-xs text-gray-400">{t('feed.subtitle')}</p>
      </div>
      {enriched.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">{t('feed.empty')}</p>
          <p className="text-gray-300 text-xs mt-1">{t('feed.empty_hint')}</p>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{t('feed.today')}</p>
          {enriched.map(({ item, creator, app }) => (
            <FeedItem key={item.id} item={item} creator={creator} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
