/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockApp = {
  id: 'test-app-a1b2',
  title: 'Test App',
  tagline: 'A test tagline',
  link: 'https://example.com',
  creator_id: 'creator-x1y2',
  description: 'A description',
  use_cases: ['Use case 1'],
  tags: ['tag1'],
  category: 'writing',
  access_type: ['web'],
  pricing: 'free',
  story_card: {
    problemStatement: 'The problem',
    solutionStatement: 'The solution',
    features: ['Feature 1'],
    gradientTheme: 'indigo-purple',
    shareableUrl: '/story/test-app-a1b2',
  },
  social_copy: { twitter: 'tweet', linkedin: 'post' },
  boost_count: 5,
  is_new: true,
  status: 'published',
  created_at: '2026-05-13T00:00:00Z',
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [mockApp], error: null })),
        })),
      })),
    })),
  },
}))

describe('GET /api/apps', () => {
  it('returns an array of apps in camelCase shape', async () => {
    const req = new NextRequest('http://localhost/api/apps')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe('test-app-a1b2')
    expect(json[0].creatorId).toBe('creator-x1y2')
    expect(json[0].boostCount).toBe(5)
    expect(json[0].useCases).toEqual(['Use case 1'])
  })
})
