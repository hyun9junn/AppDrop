import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToApp } from '@/lib/db-mapping'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')

  const base = supabase.from('apps').select('*').eq('status', 'published')
  const query = category ? base.eq('category', category) : base
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbRowToApp))
}
