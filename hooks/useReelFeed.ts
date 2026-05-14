import { useState, useCallback } from 'react'

export function useReelFeed(total: number) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, total - 1))
  }, [total])

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  return { currentIndex, next, prev }
}
