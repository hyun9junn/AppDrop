/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const validInput = {
  link: 'https://example.com',
  problem: 'It takes too long to tailor a resume',
  audience: 'Job seekers applying to multiple roles',
  features: 'AI rewriting, keyword matching, format preservation',
  access: ['web'],
  pricing: 'free',
  tags: 'resume writing jobs',
  creatorName: 'Kim Dev',
}

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/package', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const mockGenerated = {
  title: 'ResumeAI',
  tagline: 'Tailor your CV to any job in 60 seconds',
  description: 'AI-powered resume tailoring.',
  targetUser: 'Job seekers',
  category: 'writing',
  useCases: ['Tailor CV', 'Match keywords', 'Preserve format'],
  tags: ['resume', 'writing', 'AI', 'jobs', 'productivity'],
  storyCard: {
    problemStatement: 'Tailoring takes too long',
    solutionStatement: 'AI does it in 60 seconds',
    features: ['Keyword match', 'Format preserved', 'Any job posting'],
  },
  socialCopy: {
    twitter: 'Tailor your resume instantly',
    linkedin: 'Built an AI resume tailoring tool',
  },
}

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockGenerated) }],
      }),
    },
  })),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

describe('POST /api/package', () => {
  it('returns a complete App object on valid input', async () => {
    const res = await POST(makeRequest(validInput))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('ResumeAI')
    expect(json.creatorId).toMatch(/^kim-dev-[a-z0-9]{4}$/)
    expect(json.id).toMatch(/^resumeai-[a-z0-9]{4}$/)
    expect(json.storyCard.gradientTheme).toBe('indigo-purple')
    expect(json.storyCard.shareableUrl).toMatch(/^\/story\/resumeai-/)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ link: 'https://example.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 422 when Claude returns invalid JSON', async () => {
    const { default: Anthropic } = jest.requireMock('@anthropic-ai/sdk')
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockResolvedValue({ content: [{ type: 'text', text: 'not json' }] }) },
    }))
    const res = await POST(makeRequest(validInput))
    expect(res.status).toBe(422)
  })
})
