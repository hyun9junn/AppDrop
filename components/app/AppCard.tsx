'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { App } from '@/lib/types'
import StoryCardMini from '@/components/story/StoryCardMini'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost, toggleFavorite } from '@/lib/api'

export default function AppCard({ app }: { app: App }) {
  const { t, localizeApp } = useLocale()
  const a = localizeApp(app)
  const deviceId = useDeviceId()
  const [boostCount, setBoostCount] = useState(a.boostCount)
  const [boosted, setBoosted] = useState(false)
  const [favorited, setFavorited] = useState(false)

  async function handleBoost() {
    if (!deviceId) return
    const prev = { boosted, boostCount }
    setBoosted(b => !b)
    setBoostCount(c => boosted ? c - 1 : c + 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prev.boosted)
      setBoostCount(prev.boostCount)
    }
  }

  async function handleFavorite() {
    if (!deviceId) return
    const prev = favorited
    setFavorited(f => !f)
    try {
      const result = await toggleFavorite(deviceId, app.creatorId)
      setFavorited(result.favorited)
    } catch {
      setFavorited(prev)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <StoryCardMini app={app} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-sm">{a.title}</p>
            <p className="text-[10px] text-gray-400">{a.tagline}</p>
          </div>
          <p className="text-xs text-brand font-bold">⬆ {boostCount}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={a.link}
            target="_blank"
            className="flex-[2] bg-brand text-white rounded-xl py-1.5 text-center text-xs font-bold"
          >
            {t('app.try')}
          </Link>
          <button
            onClick={handleBoost}
            className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${boosted ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {t('app.boost')}
          </button>
          <button
            onClick={handleFavorite}
            className={`flex-1 rounded-xl py-1.5 text-xs transition-colors ${favorited ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            ⭐
          </button>
        </div>
      </div>
    </div>
  )
}
