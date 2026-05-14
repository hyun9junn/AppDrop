'use client'
import Link from 'next/link'
import type { Category } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

const categories: { key: string; icon: string; slug: Category }[] = [
  { key: 'category.writing', icon: '✍️', slug: 'writing' },
  { key: 'category.images', icon: '🖼️', slug: 'images' },
  { key: 'category.audio', icon: '🎙️', slug: 'audio' },
  { key: 'category.video', icon: '🎬', slug: 'video' },
  { key: 'category.data', icon: '📊', slug: 'data' },
  { key: 'category.business', icon: '💼', slug: 'business' },
  { key: 'category.design', icon: '🎨', slug: 'design' },
  { key: 'category.ai-tools', icon: '🤖', slug: 'ai-tools' },
]

const bgMap: Record<Category, string> = {
  writing:   '#FFE9DF',
  images:    '#E2EFE8',
  audio:     '#FBE5C8',
  video:     '#E6DFF7',
  data:      '#DCEAF6',
  business:  '#F4E0E0',
  design:    '#EFE6DA',
  'ai-tools':'#E5E5E5',
}

export default function CategoryGrid() {
  const { t } = useLocale()
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {categories.map(cat => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="flex flex-col items-center gap-1.5"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: bgMap[cat.slug] }}
          >
            {cat.icon}
          </div>
          <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: '#1A1815' }}>
            {t(cat.key as any)}
          </span>
        </Link>
      ))}
    </div>
  )
}
