'use client'
import { useParams } from 'next/navigation'
import { apps } from '@/lib/mock-data/apps'
import type { Category } from '@/lib/types'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'
import { useLocale } from '@/lib/i18n'

const categoryIcons: Record<Category, string> = {
  writing: '✍️', images: '🖼️', audio: '🎙️', video: '🎬',
  data: '📊', business: '💼', design: '🎨', 'ai-tools': '🤖',
}

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string }
  const { t } = useLocale()
  const category = slug as Category
  const icon = categoryIcons[category] ?? '📱'
  const label = t(`category.${category}` as any)
  const filtered = apps.filter(a => a.category === category).sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title={`${icon} ${label} ${t('category.apps')}`} />
      <div className="p-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">{t('category.empty')}</p>
        )}
        {filtered.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}
