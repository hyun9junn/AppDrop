/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/boost', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

// Track which mock scenario to use
let boostExists = false

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'boosts') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() =>
                  Promise.resolve({ data: boostExists ? { device_id: 'dev1' } : null, error: null })
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
        }
      }
      if (table === 'apps') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: { boost_count: boostExists ? 9 : 11 }, error: null })
              ),
            })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('POST /api/boost', () => {
  it('adds a boost when none exists', async () => {
    boostExists = false
    const res = await POST(makeRequest({ deviceId: 'dev1', appId: 'app-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.boosted).toBe(true)
    expect(json.boostCount).toBe(11)
  })

  it('removes a boost when one exists', async () => {
    boostExists = true
    const res = await POST(makeRequest({ deviceId: 'dev1', appId: 'app-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.boosted).toBe(false)
    expect(json.boostCount).toBe(9)
  })

  it('returns 400 when deviceId or appId is missing', async () => {
    const res = await POST(makeRequest({ deviceId: 'dev1' }))
    expect(res.status).toBe(400)
  })
})
