import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

function mask(value?: string) {
  if (!value) return '<missing>'
  if (value.length <= 12) return value
  return value.substring(0, 8) + '...' + value.substring(value.length - 4)
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = !!process.env.SUPABASE_SERVICE_ROLE
  const configured = !!supabaseAdmin
  return NextResponse.json({ ok: true, supabaseUrl: mask(url), hasServiceRole: service, configured })
}
