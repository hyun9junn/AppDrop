import { useState, useCallback } from 'react'

export function useStoryViewer(ids: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set([ids[0]]))

  const next = useCallback(() => {
    setCurrentIndex(i => {
      const next = Math.min(i + 1, ids.length - 1)
      setSeenIds(s => new Set([...s, ids[next]]))
      return next
    })
  }, [ids])

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  return { currentIndex, seenIds, next, prev }
}
