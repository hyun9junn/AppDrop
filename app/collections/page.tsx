import { collections } from '@/lib/mock-data/collections'
import CollectionCard from '@/components/collection/CollectionCard'

export default function CollectionsPage() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base">📦 Collections</p>
        <p className="text-xs text-gray-400">App bundles for specific goals</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {collections.map(col => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </div>
  )
}
