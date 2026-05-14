import { renderHook, act } from '@testing-library/react'
import { useReelFeed } from '../useReelFeed'

test('starts at index 0', () => {
  const { result } = renderHook(() => useReelFeed(5))
  expect(result.current.currentIndex).toBe(0)
})

test('next() increments the index', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(1)
})

test('next() does not go past total - 1', () => {
  const { result } = renderHook(() => useReelFeed(3))
  act(() => result.current.next())
  act(() => result.current.next())
  act(() => result.current.next())
  expect(result.current.currentIndex).toBe(2)
})

test('prev() decrements the index', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.next())
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})

test('prev() does not go below 0', () => {
  const { result } = renderHook(() => useReelFeed(5))
  act(() => result.current.prev())
  expect(result.current.currentIndex).toBe(0)
})
