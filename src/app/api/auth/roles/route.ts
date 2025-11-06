import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE' }, { status: 500 })
    }

    const { data, error } = await (supabaseAdmin as any).from('roles').select('role_id, name').order('role_id', { ascending: true })
    if (error) {
      console.warn('roles lookup error', error.message)
      return NextResponse.json({ ok: false, error: 'Failed to load roles' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, roles: data || [] })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
