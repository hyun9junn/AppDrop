'use client'
import { useParams } from 'next/navigation'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import StoryViewer from '@/components/story/StoryViewer'

export default function StoryPage() {
  const { appId } = useParams() as { appId: string }
  return (
    <StoryViewer
      apps={apps}
      creators={creators}
      initialAppId={appId}
    />
  )
}
