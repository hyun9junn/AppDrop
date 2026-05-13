'use client'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import AppRow from '@/components/app/AppRow'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

const boostedApps = apps.slice(0, 3)
const favoriteCreators = creators.slice(0, 2)

export default function ProfilePage() {
  const { t } = useLocale()
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">{t('profile.title')}</p>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
            J
          </div>
          <div>
            <p className="font-bold text-gray-900">jisoo_k</p>
            <p className="text-xs text-gray-400">{t('profile.joined')}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('profile.boosted')}</p>
          <div className="flex flex-col gap-2">
            {boostedApps.map(app => <AppRow key={app.id} app={app} />)}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('profile.favorites')}</p>
          <div className="flex flex-col gap-2">
            {favoriteCreators.map(creator => {
              const firstApp = apps.find(a => creator.appIds[0] === a.id)
              const gradient = firstApp ? gradientMap[firstApp.storyCard.gradientTheme] : 'from-indigo-500 to-purple-600'
              return (
                <div key={creator.id} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {creator.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{creator.name}</p>
                    <p className="text-[10px] text-gray-400">{creator.appIds.length} {t('profile.apps')} · {creator.regularCount} {t('profile.regulars')}</p>
                  </div>
                  <span className="text-xs text-pink-500 font-bold">{t('profile.regular')}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('profile.recent')}</p>
          <div className="flex flex-col gap-2">
            {[t('profile.recent.0'), t('profile.recent.1')].map(q => (
              <div key={q} className="bg-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-500">
                "{q}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
