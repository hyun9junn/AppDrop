import { renderHook, act } from '@testing-library/react'
import { useStoryViewer } from '../useStoryViewer'

const ids = ['a', 'b', 'c']

test('starts at index 0', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  expect(result.current.currentIndex).toBe(0)
})

test('next() advances index', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(1)
})

test('prev() decrements index', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})

test('next() does not go past last item', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  act(() => result.current.next())
  act(() => result.current.next())
  act(() => result.current.next()) // already at last
  expect(result.current.currentIndex).toBe(2)
})

test('marks current id as seen', () => {
  const { result } = renderHook(() => useStoryViewer(ids))
  expect(result.current.seenIds.has('a')).toBe(true)
})
