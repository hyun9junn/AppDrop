import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToFeedItem, dbRowToCreator, dbRowToApp } from '@/lib/db-mapping'

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 })
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('creator_id')
    .eq('device_id', deviceId)

  const creatorIds = (favorites ?? []).map((f: { creator_id: string }) => f.creator_id)
  if (creatorIds.length === 0) return NextResponse.json([])

  const { data: items, error } = await supabase
    .from('feed_items')
    .select('*, apps(*), creators(*)')
    .in('creator_id', creatorIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = (items ?? []).map((row: Record<string, unknown> & { apps: Record<string, unknown>; creators: Record<string, unknown> }) => ({
    item: dbRowToFeedItem(row),
    creator: dbRowToCreator(row.creators),
    app: dbRowToApp(row.apps),
  }))

  return NextResponse.json(entries)
}
