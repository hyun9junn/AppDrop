/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/favorite', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

let favoriteExists = false

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() =>
              Promise.resolve({ data: favoriteExists ? { device_id: 'dev1' } : null, error: null })
            ),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
  },
}))

describe('POST /api/favorite', () => {
  it('adds a favorite when none exists', async () => {
    favoriteExists = false
    const res = await POST(makeRequest({ deviceId: 'dev1', creatorId: 'creator-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.favorited).toBe(true)
  })

  it('removes a favorite when one exists', async () => {
    favoriteExists = true
    const res = await POST(makeRequest({ deviceId: 'dev1', creatorId: 'creator-1' }))
    const json = await res.json()
    expect(json.favorited).toBe(false)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ deviceId: 'dev1' }))
    expect(res.status).toBe(400)
  })
})
