'use client'
import { useParams } from 'next/navigation'
import { collections } from '@/lib/mock-data/collections'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppRow from '@/components/app/AppRow'
import { useLocale } from '@/lib/i18n'

export default function CollectionDetailPage() {
  const { id } = useParams() as { id: string }
  const { t, localizeCollection } = useLocale()
  const col = collections.find(c => c.id === id)
  if (!col) return <div className="p-8 text-center text-gray-400">Collection not found</div>

  const localCol = localizeCollection(col)
  const colApps = col.appIds.map(appId => apps.find(a => a.id === appId)).filter(Boolean) as typeof apps

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/collections" title={`${col.emoji} ${localCol.title}`} />
      <div className="p-4">
        <div className="flex items-start gap-4 mb-5">
          <span className="text-4xl">{col.emoji}</span>
          <div>
            <p className="font-extrabold text-gray-900 text-base leading-snug">{localCol.title}</p>
            <p className="text-xs text-gray-400 mt-1">{localCol.description}</p>
            <p className="text-[10px] text-gray-300 mt-1">
              {t('collections.curated_by')} · {colApps.length} {t('collections.apps')} · {t('collections.updated')} {col.updatedDaysAgo} {t('collections.days_ago')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {colApps.map(app => (
            <AppRow key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
