'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { App, Creator } from '@/lib/types'
import { gradientMap } from '@/lib/types'
import { useLocale } from '@/lib/i18n'
import { useDeviceId } from '@/hooks/useDeviceId'
import { toggleBoost, toggleFavorite } from '@/lib/api'
import { useReelFeed } from '@/hooks/useReelFeed'

interface ReelViewerProps {
  apps: App[]
  creators: Creator[]
  initialAppId?: string
}

export default function ReelViewer({ apps, creators, initialAppId }: ReelViewerProps) {
  const router = useRouter()
  const { t, localizeApp } = useLocale()
  const deviceId = useDeviceId()
  const initialIndex = initialAppId ? apps.findIndex(a => a.id === initialAppId) : 0
  const startIndex = initialIndex >= 0 ? initialIndex : 0
  const { currentIndex, next, prev } = useReelFeed(apps.length - startIndex)
  const safeIndex = Math.min(startIndex + currentIndex, apps.length - 1)
  const app = localizeApp(apps[safeIndex])
  const creator = creators.find(c => c.id === app.creatorId)
  const gradient = gradientMap[app.storyCard.gradientTheme]
  const [boostCount, setBoostCount] = useState(app.boostCount)
  const [boosted, setBoosted] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [loopKey, setLoopKey] = useState(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    setBoostCount(app.boostCount)
    setBoosted(false)
    setFavorited(false)
    setLoopKey(k => k + 1)
  }, [app.id])

  useEffect(() => {
    if (app.reelVideoUrl) return
    const timer = setTimeout(() => setLoopKey(k => k + 1), 6500)
    return () => clearTimeout(timer)
  }, [loopKey, app.reelVideoUrl])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta > 50) next()
    else if (delta < -50) prev()
  }

  async function handleBoost() {
    if (!deviceId) return
    const prevState = { boosted, boostCount }
    const newBoosted = !boosted
    setBoosted(newBoosted)
    setBoostCount(c => newBoosted ? c + 1 : c - 1)
    try {
      const result = await toggleBoost(deviceId, app.id)
      setBoosted(result.boosted)
      setBoostCount(result.boostCount)
    } catch {
      setBoosted(prevState.boosted)
      setBoostCount(prevState.boostCount)
    }
  }

  async function handleFavorite() {
    if (!deviceId) return
    const prevFavorited = favorited
    setFavorited(f => !f)
    try {
      const result = await toggleFavorite(deviceId, app.creatorId)
      setFavorited(result.favorited)
    } catch {
      setFavorited(prevFavorited)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col max-w-[430px] mx-auto select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress dots */}
      <div className="flex gap-1.5 px-4 pt-4 justify-center relative z-10">
        {apps.slice(startIndex, startIndex + 8).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="absolute top-3 right-4 text-white/70 text-xl z-10"
      >
        ✕
      </button>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {app.reelVideoUrl ? (
          <>
            <video
              src={app.reelVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pb-2">
              <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">{t('card.the_problem')}</p>
              <p className="text-white font-bold text-sm leading-snug mb-2">{app.storyCard.problemStatement}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">{t('card.the_solution')}</p>
              <p className="text-white font-bold text-base mb-1">{app.title}</p>
              <p className="text-white/70 text-xs">{app.storyCard.solutionStatement}</p>
            </div>
          </>
        ) : (
          <div
            key={loopKey}
            className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col justify-center items-center p-8`}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="text-[9px] uppercase tracking-widest text-white mb-2"
            >
              {t('card.the_problem')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-white font-bold text-xl leading-snug text-center mb-4"
            >
              {app.storyCard.problemStatement}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 1.2 }}
              className="w-8 h-px bg-white/30 mb-4"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.3, delay: 1.8 }}
              className="text-[9px] uppercase tracking-widest text-white mb-1"
            >
              {t('card.the_solution')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.2 }}
              className="text-white font-bold text-2xl mb-1"
            >
              {app.title}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.4, delay: 2.5 }}
              className="text-white/80 text-sm text-center mb-5"
            >
              {app.storyCard.solutionStatement}
            </motion.p>
            <div className="w-full space-y-2">
              {app.storyCard.features.map((f, i) => (
                <motion.p
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 3.0 + i * 0.4 }}
                  className="text-white/80 text-sm flex gap-2"
                >
                  <span className="text-white">✓</span> {f}
                </motion.p>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 4.4 }}
              className="w-full mt-6"
            >
              <Link
                href={app.link}
                target="_blank"
                className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl text-center"
              >
                {t('reel.try')} {app.title} →
              </Link>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="px-4 py-3 flex flex-col gap-3 bg-black">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {creator?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{creator?.name}</p>
            <p className="text-white/50 text-[9px]">{app.isNew ? t('viewer.new_drop') : t('viewer.featured')}</p>
          </div>
          <p className="text-white/70 text-xs flex-shrink-0">⬆ {boostCount}</p>
        </div>

        <Link
          href={app.link}
          target="_blank"
          className="block w-full bg-white text-gray-900 font-bold text-sm py-3 rounded-xl text-center"
        >
          {t('reel.try')} {app.title} →
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleBoost}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${boosted ? 'bg-white text-gray-900' : 'bg-white/10 border border-white/20 text-white'}`}
          >
            {t('reel.boost')}
          </button>
          <button
            onClick={handleFavorite}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${favorited ? 'bg-yellow-400 text-white' : 'bg-white/10 border border-white/20 text-white'}`}
          >
            {t('reel.save_creator')}
          </button>
        </div>

        <p className="text-center text-white/20 text-[9px] pb-1">{t('reel.swipe_hint')}</p>
      </div>

      {/* Tap zones for non-swipe navigation */}
      <div className="absolute left-0 right-0 flex pointer-events-none" style={{ top: 60, bottom: 220 }}>
        <button className="flex-1 h-full pointer-events-auto" onClick={prev} aria-label="Previous reel" />
        <button className="flex-1 h-full pointer-events-auto" onClick={next} aria-label="Next reel" />
      </div>
    </div>
  )
}
