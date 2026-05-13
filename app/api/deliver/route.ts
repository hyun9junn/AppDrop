import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { dbRowToApp, dbRowToCollection } from '@/lib/db-mapping'

const DELIVERY_SYSTEM = `You are an app discovery engine for AppDrop.
Given a user's problem and a catalog of apps, return the IDs of the 3-5 most relevant apps, ranked by relevance.
Output ONLY a JSON array of app IDs. Example: ["id1", "id2", "id3"]
No markdown, no explanation, no code fences.`

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const { data: allApps } = await supabase
    .from('apps')
    .select('id, title, tagline, description, use_cases, tags, category')
    .eq('status', 'published')
    .order('boost_count', { ascending: false })

  if (!allApps?.length) return NextResponse.json({ apps: [] })

  const catalog = allApps
    .map(a => `- ${a.id}: "${a.tagline}" | ${a.description} | tags: ${(a.tags as string[]).join(', ')} | category: ${a.category}`)
    .join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: DELIVERY_SYSTEM,
    messages: [{ role: 'user', content: `User problem: "${query}"\n\nApp catalog:\n${catalog}` }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
  let rankedIds: string[] = []
  try {
    rankedIds = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 422 })
  }

  const { data: matchedApps } = await supabase
    .from('apps')
    .select('*')
    .in('id', rankedIds)

  const appMap = new Map((matchedApps ?? []).map(a => [a.id, dbRowToApp(a)]))
  const apps = rankedIds.filter(id => appMap.has(id)).map(id => appMap.get(id)!)

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('updated_at', { ascending: false })

  const matchedCollection = (collections ?? []).find(col => {
    const overlap = (col.app_ids as string[]).filter(id => rankedIds.includes(id)).length
    return overlap >= 2
  })

  return NextResponse.json({
    apps,
    collection: matchedCollection ? dbRowToCollection(matchedCollection) : undefined,
  })
}
