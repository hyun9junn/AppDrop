'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { App, Creator } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useStoryViewer } from '@/hooks/useStoryViewer'

interface StoryViewerProps {
  apps: App[]
  creators: Creator[]
  initialAppId: string
}

export default function StoryViewer({ apps, creators, initialAppId }: StoryViewerProps) {
  const router = useRouter()
  const initialIndex = apps.findIndex(a => a.id === initialAppId)
  const startIndex = initialIndex >= 0 ? initialIndex : 0
  const ids = apps.map(a => a.id)
  const { currentIndex, next, prev } = useStoryViewer(ids.slice(startIndex))
  const app = apps[startIndex + currentIndex]
  const creator = creators.find(c => c.id === app.creatorId)
  const gradient = gradientMap[app.storyCard.gradientTheme]

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col max-w-md mx-auto">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3">
        {apps.slice(startIndex, startIndex + 4).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20">
            <div className={`h-full rounded-full bg-white transition-all ${i <= currentIndex ? 'w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      {/* Creator bar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
          {creator?.avatar}
        </div>
        <div className="flex-1">
          <p className="text-white text-xs font-bold">{creator?.name}</p>
          <p className="text-white/50 text-[9px]">{app.isNew ? 'New drop' : 'Featured'}</p>
        </div>
        <button onClick={() => router.back()} className="text-white/60 text-lg">✕</button>
      </div>

      {/* Story card */}
      <motion.div
        key={app.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`mx-3 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white text-center`}
      >
        <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2">The Problem</p>
        <p className="font-bold text-base leading-snug mb-3">{app.storyCard.problemStatement}</p>
        <div className="w-6 h-px bg-white/20 mx-auto mb-3" />
        <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1">The Solution</p>
        <p className="font-bold text-lg text-white/90">{app.title}</p>
        <p className="text-xs opacity-75 mt-1 mb-4">{app.storyCard.solutionStatement}</p>
        <div className="space-y-1.5 text-left mb-4">
          {app.storyCard.features.map(f => (
            <p key={f} className="text-xs text-white/75 flex gap-2">
              <span className="text-white/90">✓</span> {f}
            </p>
          ))}
        </div>
        <Link
          href={app.link}
          target="_blank"
          className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl"
        >
          Try {app.title} — Free →
        </Link>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pt-3">
        <button className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl py-2 text-xs font-semibold">
          ⬆ Boost
        </button>
        <button className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl py-2 text-xs font-semibold">
          ⭐ Save Creator
        </button>
      </div>
      <p className="text-center text-white/20 text-[9px] mt-2">Swipe up to open · Tap sides to navigate</p>

      {/* Tap zones */}
      <div className="absolute inset-0 flex" style={{ top: 100 }}>
        <button className="flex-1 h-full" onClick={prev} aria-label="Previous story" />
        <button className="flex-1 h-full" onClick={next} aria-label="Next story" />
      </div>
    </div>
  )
}
