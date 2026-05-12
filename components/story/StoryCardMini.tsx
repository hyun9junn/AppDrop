import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

export default function StoryCardMini({ app }: { app: App }) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 text-white text-center`}>
      <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">The Problem</p>
      <p className="font-bold text-[11px] leading-snug">{app.storyCard.problemStatement}</p>
    </div>
  )
}
