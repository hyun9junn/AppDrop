'use client'
import { useSearchParams } from 'next/navigation'
import { apps } from '@/lib/mock-data/apps'
import { collections } from '@/lib/mock-data/collections'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'

export default function ResultsPage() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''

  const results = [...apps].sort((a, b) => b.boostCount - a.boostCount).slice(0, 3)
  const suggestedCollection = collections[0]

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/"
        title={`Apps for: "${query.slice(0, 30)}${query.length > 30 ? '…' : ''}"`}
      />
      <div className="p-4 flex flex-col gap-3">
        {query && (
          <p className="text-xs text-gray-500 italic">"{query}"</p>
        )}
        {results.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
        <div className="border border-indigo-100 rounded-2xl p-3 bg-indigo-50 flex items-center gap-3">
          <span className="text-2xl">{suggestedCollection.emoji}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-indigo-700">{suggestedCollection.title}</p>
            <p className="text-[10px] text-indigo-400">{suggestedCollection.appIds.length} apps for this goal</p>
          </div>
          <span className="text-xs text-indigo-500 font-semibold">View →</span>
        </div>
      </div>
    </div>
  )
}
