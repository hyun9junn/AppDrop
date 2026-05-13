import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/slug'
import { dbRowToApp } from '@/lib/db-mapping'
import type { GradientTheme, Category } from '@/lib/types'

const CATEGORY_GRADIENT: Record<string, GradientTheme> = {
  writing: 'indigo-purple',
  images: 'sky-indigo',
  audio: 'emerald-sky',
  video: 'amber-red',
  data: 'blue-teal',
  business: 'orange-amber',
  design: 'purple-pink',
  'ai-tools': 'teal-cyan',
}

const PACKAGING_SYSTEM = `You are an app packaging assistant for AppDrop, a platform that helps developers present their apps to non-technical users.

You will receive answers a developer filled out about their app. Generate a complete app package based on those answers.

Important: do not attempt to infer anything from the app URL — it is provided for reference only. Generate everything from the developer's answers.

Output ONLY valid JSON — no markdown, no explanation, no code fences.`

function buildPackagingPrompt(input: {
  link: string; problem: string; audience: string
  features: string; access: string[]; pricing: string; tags: string
}): string {
  return `App URL (destination only, not analyzed): ${input.link}
Problem it solves: ${input.problem}
Target user: ${input.audience}
Core features: ${input.features}
Access type: ${input.access.join(', ')}
Pricing: ${input.pricing}
Category tags (hint): ${input.tags}

Return this JSON shape exactly:
{
  "title": "Short plain-language name (2-4 words)",
  "tagline": "One-liner under 60 chars",
  "description": "2-3 sentence plain-English summary for non-technical users",
  "targetUser": "One-sentence persona",
  "category": "one of: writing|images|audio|video|data|business|design|ai-tools",
  "useCases": ["use case 1", "use case 2", "use case 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "storyCard": {
    "problemStatement": "The problem in 1-2 bold lines",
    "solutionStatement": "How the app solves it in 1-2 lines",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  },
  "socialCopy": {
    "twitter": "Twitter/X post under 280 chars with hook",
    "linkedin": "LinkedIn post 2-3 sentences, professional tone"
  }
}`
}

const REQUIRED_FIELDS = ['link', 'problem', 'audience', 'features', 'access', 'pricing', 'creatorName']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const missing = REQUIRED_FIELDS.filter(f => !body[f])
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
  }

  const { link, problem, audience, features, access, pricing, tags, creatorName } = body

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: PACKAGING_SYSTEM,
    messages: [{ role: 'user', content: buildPackagingPrompt({ link, problem, audience, features, access, pricing, tags }) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : null
  if (!text) return NextResponse.json({ error: 'No response from AI' }, { status: 422 })

  let generated: Record<string, unknown>
  try {
    generated = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 422 })
  }

  const appId = generateId(generated.title as string)
  const category = (generated.category as string) || 'ai-tools'
  const gradientTheme: GradientTheme = CATEGORY_GRADIENT[category] ?? 'teal-cyan'

  const { data: existingCreator } = await supabase
    .from('creators')
    .select('id')
    .ilike('name', creatorName)
    .single()

  const creatorId = existingCreator?.id ?? generateId(creatorName)

  if (!existingCreator) {
    await supabase.from('creators').insert({
      id: creatorId,
      name: creatorName,
      avatar: creatorName.charAt(0).toUpperCase(),
    })
  }

  const appRow = {
    id: appId,
    title: generated.title,
    tagline: generated.tagline,
    link,
    creator_id: creatorId,
    description: generated.description,
    use_cases: generated.useCases,
    tags: generated.tags,
    category: category as Category,
    access_type: access,
    pricing,
    story_card: {
      problemStatement: (generated.storyCard as Record<string, unknown>).problemStatement,
      solutionStatement: (generated.storyCard as Record<string, unknown>).solutionStatement,
      features: (generated.storyCard as Record<string, unknown>).features,
      gradientTheme,
      shareableUrl: `/story/${appId}`,
    },
    social_copy: generated.socialCopy,
    boost_count: 0,
    is_new: true,
    status: 'published',
  }

  const { error: insertError } = await supabase.from('apps').insert(appRow)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  await supabase.from('feed_items').insert({
    creator_id: creatorId,
    type: 'drop',
    app_id: appId,
    body: `${generated.title} is now live on AppDrop.`,
  })

  return NextResponse.json(dbRowToApp(appRow))
}
