import { apps } from '@/lib/mock-data/apps'
import type { Category } from '@/lib/types'
import TopBar from '@/components/layout/TopBar'
import AppCard from '@/components/app/AppCard'

const categoryMeta: Record<Category, { label: string; icon: string }> = {
  writing: { label: 'Writing', icon: '✍️' },
  images: { label: 'Images', icon: '🖼️' },
  audio: { label: 'Audio', icon: '🎙️' },
  video: { label: 'Video', icon: '🎬' },
  data: { label: 'Data', icon: '📊' },
  business: { label: 'Business', icon: '💼' },
  design: { label: 'Design', icon: '🎨' },
  'ai-tools': { label: 'AI Tools', icon: '🤖' },
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = slug as Category
  const meta = categoryMeta[category] ?? { label: slug, icon: '📱' }
  const filtered = apps.filter(a => a.category === category)
    .sort((a, b) => b.boostCount - a.boostCount)

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <TopBar backHref="/" title={`${meta.icon} ${meta.label} Apps`} />
      <div className="p-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No apps in this category yet.</p>
        )}
        {filtered.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}
