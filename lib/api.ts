import type { App, Collection, FeedItem, Category, Creator } from '@/lib/types'

export interface PackageInput {
  link: string
  problem: string
  audience: string
  features: string
  access: string[]
  pricing: string
  tags: string
  creatorName: string
}

export interface DeliverResult {
  apps: App[]
  collection?: Collection
}

export interface BoostResult {
  boosted: boolean
  boostCount: number
}

export interface FavoriteResult {
  favorited: boolean
}

export interface FeedEntry {
  item: FeedItem
  creator: Creator
  app: App
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export function packageApp(input: PackageInput): Promise<App> {
  return apiFetch('/api/package', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deliverApps(query: string): Promise<DeliverResult> {
  return apiFetch('/api/deliver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}

export function fetchApps(category?: Category): Promise<App[]> {
  const url = category ? `/api/apps?category=${category}` : '/api/apps'
  return apiFetch(url)
}

export function fetchCollections(): Promise<Collection[]> {
  return apiFetch('/api/collections')
}

export function toggleBoost(deviceId: string, appId: string): Promise<BoostResult> {
  return apiFetch('/api/boost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, appId }),
  })
}

export function toggleFavorite(deviceId: string, creatorId: string): Promise<FavoriteResult> {
  return apiFetch('/api/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, creatorId }),
  })
}

export function fetchFeed(deviceId: string): Promise<FeedEntry[]> {
  return apiFetch(`/api/feed?deviceId=${encodeURIComponent(deviceId)}`)
}
