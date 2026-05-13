import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dbRowToCollection } from '@/lib/db-mapping'

export async function GET(_req: NextRequest) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbRowToCollection))
}
