'use client'
import { useParams } from 'next/navigation'
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'
import { useLocale } from '@/lib/i18n'

export default function CreatorProfilePage() {
  const { id } = useParams() as { id: string }
  const { t } = useLocale()
  const creator = creators.find(c => c.id === id)
  if (!creator) return <div className="p-8 text-center text-gray-400">Creator not found</div>

  const creatorApps = apps.filter(a => creator.appIds.includes(a.id))

  const badgeTypes = [
    { label: t('creator.badge.drop'), color: 'bg-emerald-100 text-emerald-700' },
    { label: t('creator.badge.beta'), color: 'bg-purple-100 text-purple-700' },
    { label: t('creator.badge.announcement'), color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title={t('creator.title')} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {creator.avatar}
          </div>
          <div>
            <p className="font-extrabold text-gray-900">{creator.name}</p>
            <p className="text-xs text-gray-400 mb-1">{creator.bio}</p>
            <p className="text-xs text-pink-500 font-semibold">⭐ {creator.regularCount} {t('creator.regulars')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('creator.post_update')}</p>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-400 mb-3">
            {t('creator.post_ph')}
          </div>
          <div className="flex gap-2">
            {badgeTypes.map(b => (
              <button key={b.label} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.color}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t('creator.my_apps')}</p>
        <div className="flex flex-col gap-3">
          {creatorApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
