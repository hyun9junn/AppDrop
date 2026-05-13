// app/results/page.tsx
'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'
import { deliverApps } from '@/lib/api'
import type { App, Collection } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import Link from 'next/link'

function Results() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''
  const { t } = useLocale()
  const [apps, setApps] = useState<App[]>([])
  const [collection, setCollection] = useState<Collection | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    deliverApps(query)
      .then(result => {
        setApps(result.apps)
        setCollection(result.collection)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/"
        title={`${t('results.heading')} "${query.slice(0, 25)}${query.length > 25 ? '…' : ''}"`}
      />
      <div className="p-4 flex flex-col gap-3">
        {query && <p className="text-xs text-gray-500 italic">"{query}"</p>}
        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}
        {!loading && !error && apps.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
        {!loading && !error && apps.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No matching apps found.</p>
        )}
        {collection && (
          <Link href={`/collections/${collection.id}`} className="border border-indigo-100 rounded-2xl p-3 bg-indigo-50 flex items-center gap-3">
            <span className="text-2xl">{collection.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-700">{collection.title}</p>
              <p className="text-[10px] text-indigo-400">{collection.appIds.length} {t('collections.apps')}</p>
            </div>
            <span className="text-xs text-indigo-500 font-semibold">{t('home.see_all')} →</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading results...</div>}>
      <Results />
    </Suspense>
  )
}
