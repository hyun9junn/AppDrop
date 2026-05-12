import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import StoryViewer from '@/components/story/StoryViewer'

export default async function StoryPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  return (
    <StoryViewer
      apps={apps}
      creators={creators}
      initialAppId={appId}
    />
  )
}
