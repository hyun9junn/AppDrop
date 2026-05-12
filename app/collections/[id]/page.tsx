import { collections } from '@/lib/mock-data/collections'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppRow from '@/components/app/AppRow'

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const col = collections.find(c => c.id === id)
  if (!col) return <div className="p-8 text-center text-gray-400">Collection not found</div>

  const colApps = col.appIds.map(appId => apps.find(a => a.id === appId)).filter(Boolean) as typeof apps

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/collections" title={`${col.emoji} ${col.title}`} />
      <div className="p-4">
        <div className="flex items-start gap-4 mb-5">
          <span className="text-4xl">{col.emoji}</span>
          <div>
            <p className="font-extrabold text-gray-900 text-base leading-snug">{col.title}</p>
            <p className="text-xs text-gray-400 mt-1">{col.description}</p>
            <p className="text-[10px] text-gray-300 mt-1">Curated by AppDrop · {colApps.length} apps · Updated {col.updatedDaysAgo} days ago</p>
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
