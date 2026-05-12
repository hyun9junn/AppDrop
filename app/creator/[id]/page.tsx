import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'

const badgeTypes = [
  { label: '🆕 New Drop', color: 'bg-emerald-100 text-emerald-700' },
  { label: '🧪 Beta', color: 'bg-purple-100 text-purple-700' },
  { label: '📢 Update', color: 'bg-amber-100 text-amber-700' },
]

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const creator = creators.find(c => c.id === id)
  if (!creator) return <div className="p-8 text-center text-gray-400">Creator not found</div>

  const creatorApps = apps.filter(a => creator.appIds.includes(a.id))

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title="Creator Profile" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {creator.avatar}
          </div>
          <div>
            <p className="font-extrabold text-gray-900">{creator.name}</p>
            <p className="text-xs text-gray-400 mb-1">{creator.bio}</p>
            <p className="text-xs text-pink-500 font-semibold">⭐ {creator.regularCount} Regulars</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">📢 Post an Update</p>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-400 mb-3">
            Share a new drop, beta invite, or announcement...
          </div>
          <div className="flex gap-2">
            {badgeTypes.map(b => (
              <button key={b.label} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.color}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">My Apps</p>
        <div className="flex flex-col gap-3">
          {creatorApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
