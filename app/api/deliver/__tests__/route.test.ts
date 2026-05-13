/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/deliver', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const mockApps = [
  {
    id: 'resume-ai-a1b2',
    title: 'ResumeAI',
    tagline: 'Tailor your CV',
    description: 'Paste job desc, get tailored CV',
    use_cases: ['Tailor CV'],
    tags: ['resume', 'writing'],
    category: 'writing',
    link: 'https://example.com',
    creator_id: 'creator-x1y2',
    access_type: ['web'],
    pricing: 'free',
    story_card: { problemStatement: 'P', solutionStatement: 'S', features: ['F'], gradientTheme: 'indigo-purple', shareableUrl: '/story/resume-ai' },
    social_copy: { twitter: 't', linkedin: 'l' },
    boost_count: 10,
    is_new: true,
  },
]

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '["resume-ai-a1b2"]' }],
      }),
    },
  })),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'apps') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockApps, error: null })),
            })),
            in: jest.fn(() => Promise.resolve({ data: mockApps, error: null })),
          })),
        }
      }
      if (table === 'collections') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      }
      return {}
    }),
  },
}))

describe('POST /api/deliver', () => {
  it('returns ranked apps for a query', async () => {
    const res = await POST(makeRequest({ query: 'I need help with my resume' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.apps).toHaveLength(1)
    expect(json.apps[0].id).toBe('resume-ai-a1b2')
  })

  it('returns 400 when query is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })
})
