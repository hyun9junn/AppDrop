/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockFeedRow = {
  id: 'feed-uuid-1',
  creator_id: 'creator-x1y2',
  type: 'drop',
  app_id: 'test-app-a1b2',
  body: 'New app is live!',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  apps: {
    id: 'test-app-a1b2',
    title: 'Test App',
    tagline: 'A test tagline',
    link: 'https://example.com',
    creator_id: 'creator-x1y2',
    description: 'Desc',
    use_cases: ['Use 1'],
    tags: ['t1'],
    category: 'writing',
    access_type: ['web'],
    pricing: 'free',
    story_card: { problemStatement: 'P', solutionStatement: 'S', features: ['F'], gradientTheme: 'indigo-purple', shareableUrl: '/story/test' },
    social_copy: { twitter: 't', linkedin: 'l' },
    boost_count: 3,
    is_new: true,
  },
  creators: {
    id: 'creator-x1y2',
    name: 'Test Creator',
    bio: 'Bio',
    avatar: 'T',
    links: [],
    regular_count: 10,
  },
}

let hasFavorites = true

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'favorites') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                data: hasFavorites ? [{ creator_id: 'creator-x1y2' }] : [],
                error: null,
              })
            ),
          })),
        }
      }
      if (table === 'feed_items') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              order: jest.fn(() =>
                Promise.resolve({ data: [mockFeedRow], error: null })
              ),
            })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('GET /api/feed', () => {
  it('returns enriched feed entries for a device with favorites', async () => {
    hasFavorites = true
    const req = new NextRequest('http://localhost/api/feed?deviceId=dev1')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].item.hoursAgo).toBe(2)
    expect(json[0].creator.name).toBe('Test Creator')
    expect(json[0].app.title).toBe('Test App')
  })

  it('returns empty array when device has no favorites', async () => {
    hasFavorites = false
    const req = new NextRequest('http://localhost/api/feed?deviceId=dev1')
    const res = await GET(req)
    const json = await res.json()
    expect(json).toEqual([])
  })

  it('returns 400 when deviceId is missing', async () => {
    const req = new NextRequest('http://localhost/api/feed')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})
