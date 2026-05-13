import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { deviceId, appId } = await req.json()
  if (!deviceId || !appId) {
    return NextResponse.json({ error: 'deviceId and appId are required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('boosts')
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('app_id', appId)
    .maybeSingle()

  if (existing) {
    await supabase.from('boosts').delete().eq('device_id', deviceId).eq('app_id', appId)
  } else {
    await supabase.from('boosts').insert({ device_id: deviceId, app_id: appId })
  }

  const { data: app } = await supabase
    .from('apps')
    .select('boost_count')
    .eq('id', appId)
    .single()

  return NextResponse.json({ boosted: !existing, boostCount: app?.boost_count ?? 0 })
}
