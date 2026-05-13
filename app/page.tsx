'use client'
import TopBar from '@/components/layout/TopBar'
import StoryRing from '@/components/story/StoryRing'
import ProblemInput from '@/components/discover/ProblemInput'
import CategoryGrid from '@/components/discover/CategoryGrid'
import CollectionCard from '@/components/collection/CollectionCard'
import AppCard from '@/components/app/AppCard'
import { apps } from '@/lib/mock-data/apps'
import { collections } from '@/lib/mock-data/collections'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function DiscoverPage() {
  const { t, localizeCollection } = useLocale()
  const newApps = apps.filter(a => a.isNew)
  const featuredApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20">
      <TopBar
        rightAction={
          <div className="flex items-center gap-3 text-gray-500 text-lg">
            <Link href="/input">🔍</Link>
            <span>🔔</span>
            <Link href="/submit" className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-base font-bold leading-none">+</Link>
          </div>
        }
      />

      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-4 overflow-x-auto">
        {featuredApps.slice(0, 6).map((app, i) => (
          <StoryRing key={app.id} app={app} seen={i > 2} />
        ))}
      </div>

      <ProblemInput />
      <CategoryGrid />

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('home.featured_collections')}</p>
          <Link href="/collections" className="text-[10px] text-brand font-semibold">{t('home.see_all')}</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {collections.map(col => (
            <div key={col.id} className="flex-shrink-0 w-44">
              <CollectionCard collection={localizeCollection(col)} compact />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('home.new_drops')}</p>
        <div className="flex flex-col gap-3">
          {newApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
