import Link from 'next/link'
import type { Category } from '@/lib/types'

const categories: { label: string; icon: string; slug: Category }[] = [
  { label: 'Writing', icon: '✍️', slug: 'writing' },
  { label: 'Images', icon: '🖼️', slug: 'images' },
  { label: 'Audio', icon: '🎙️', slug: 'audio' },
  { label: 'Video', icon: '🎬', slug: 'video' },
  { label: 'Data', icon: '📊', slug: 'data' },
  { label: 'Business', icon: '💼', slug: 'business' },
  { label: 'Design', icon: '🎨', slug: 'design' },
  { label: 'AI Tools', icon: '🤖', slug: 'ai-tools' },
]

const bgMap: Record<Category, string> = {
  writing: 'bg-indigo-50',
  images: 'bg-red-50',
  audio: 'bg-green-50',
  video: 'bg-yellow-50',
  data: 'bg-blue-50',
  business: 'bg-orange-50',
  design: 'bg-purple-50',
  'ai-tools': 'bg-teal-50',
}

export default function CategoryGrid() {
  return (
    <div className="bg-white rounded-2xl mx-4 mt-3 p-3">
      <div className="grid grid-cols-4 gap-2">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-10 h-10 ${bgMap[cat.slug]} rounded-xl flex items-center justify-center text-xl`}>
              {cat.icon}
            </div>
            <span className="text-[9px] font-semibold text-gray-600">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
