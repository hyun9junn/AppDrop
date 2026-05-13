import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { deviceId, creatorId } = await req.json()
  if (!deviceId || !creatorId) {
    return NextResponse.json({ error: 'deviceId and creatorId are required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('creator_id', creatorId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('device_id', deviceId).eq('creator_id', creatorId)
  } else {
    await supabase.from('favorites').insert({ device_id: deviceId, creator_id: creatorId })
  }

  return NextResponse.json({ favorited: !existing })
}
