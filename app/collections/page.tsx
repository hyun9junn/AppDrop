// app/collections/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { fetchCollections } from '@/lib/api'
import type { Collection } from '@/lib/types'
import CollectionCard from '@/components/collection/CollectionCard'
import { useLocale } from '@/lib/i18n'

export default function CollectionsPage() {
  const { t, localizeCollection } = useLocale()
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {})
  }, [])

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">{t('collections.title')}</p>
        <p className="text-xs text-gray-400">{t('collections.subtitle')}</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {collections.map(col => (
          <CollectionCard key={col.id} collection={localizeCollection(col)} />
        ))}
      </div>
    </div>
  )
}
