'use client'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'
import ReelViewer from '@/components/story/ReelViewer'

const rankedApps = [...apps].sort((a, b) => b.boostCount - a.boostCount)

export default function ReelsPage() {
  return (
    <ReelViewer
      apps={rankedApps}
      creators={creators}
    />
  )
}
