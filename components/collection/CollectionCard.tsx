import Link from 'next/link'
import type { Collection } from '@/lib/types'

const gradients = [
  'from-indigo-900 to-purple-900',
  'from-teal-900 to-emerald-900',
  'from-red-900 to-orange-900',
  'from-blue-900 to-indigo-900',
]

interface CollectionCardProps {
  collection: Collection
  compact?: boolean
}

export default function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  const gradient = gradients[collection.appIds.length % gradients.length]
  return (
    <Link href={`/collections/${collection.id}`}>
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 border border-white/10`}>
        <p className="text-2xl mb-2">{collection.emoji}</p>
        <p className="font-extrabold text-white text-sm leading-snug">{collection.title}</p>
        {!compact && <p className="text-white/60 text-xs mt-1">{collection.description}</p>}
        <p className="text-white/50 text-[10px] mt-2">{collection.appIds.length} apps</p>
      </div>
    </Link>
  )
}
