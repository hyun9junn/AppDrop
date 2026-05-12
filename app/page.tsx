import TopBar from '@/components/layout/TopBar'
import StoryRing from '@/components/story/StoryRing'
import ProblemInput from '@/components/discover/ProblemInput'
import CategoryGrid from '@/components/discover/CategoryGrid'
import CollectionCard from '@/components/collection/CollectionCard'
import AppCard from '@/components/app/AppCard'
import { apps } from '@/lib/mock-data/apps'
import { collections } from '@/lib/mock-data/collections'
import Link from 'next/link'

export default function DiscoverPage() {
  const newApps = apps.filter(a => a.isNew)
  const featuredApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20">
      <TopBar
        rightAction={
          <div className="flex gap-3 text-gray-500 text-lg">
            <Link href="/input">🔍</Link>
            <span>🔔</span>
          </div>
        }
      />

      {/* Story rings */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-4 overflow-x-auto">
        {featuredApps.slice(0, 6).map((app, i) => (
          <StoryRing key={app.id} app={app} seen={i > 2} />
        ))}
      </div>

      <ProblemInput />
      <CategoryGrid />

      {/* Featured Collections */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Featured Collections</p>
          <Link href="/collections" className="text-[10px] text-brand font-semibold">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {collections.map(col => (
            <div key={col.id} className="flex-shrink-0 w-44">
              <CollectionCard collection={col} compact />
            </div>
          ))}
        </div>
      </div>

      {/* New drops */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">🆕 New Drops</p>
        <div className="flex flex-col gap-3">
          {newApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
