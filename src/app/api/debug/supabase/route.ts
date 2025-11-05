import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE
  const configured = !!supabaseAdmin
  return NextResponse.json({ ok: true, hasUrl, hasService, configured })
}
