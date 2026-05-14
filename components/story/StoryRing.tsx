import Link from 'next/link'
import type { App } from '@/lib/types'
import { gradientMap } from '@/lib/types'

interface StoryRingProps {
  app: App
  seen?: boolean
}

export default function StoryRing({ app, seen = false }: StoryRingProps) {
  const gradient = gradientMap[app.storyCard.gradientTheme]
  return (
    <Link href={`/reel/${app.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className={`w-14 h-14 rounded-full p-0.5 ${seen ? 'bg-gray-300' : `bg-gradient-to-br ${gradient}`}`}>
        <div className="w-full h-full rounded-full bg-white p-0.5">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xl`}>
            {app.title[0]}
          </div>
        </div>
      </div>
      <span className="text-[9px] font-semibold text-gray-700 w-14 text-center truncate">{app.title}</span>
    </Link>
  )
}
