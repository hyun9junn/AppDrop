/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockCollection = {
  id: 'solo-founder',
  title: 'Solo Founder Pack',
  description: 'Go from idea to launch',
  emoji: '🚀',
  app_ids: ['app-1', 'app-2'],
  curated_by: 'AppDrop',
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [mockCollection], error: null })),
      })),
    })),
  },
}))

describe('GET /api/collections', () => {
  it('returns collections with updatedDaysAgo computed', async () => {
    const req = new NextRequest('http://localhost/api/collections')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe('solo-founder')
    expect(json[0].updatedDaysAgo).toBe(2)
    expect(json[0].appIds).toEqual(['app-1', 'app-2'])
  })
})
