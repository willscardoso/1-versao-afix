import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 })
  try {
    const id = params.id
    const { data, error } = await supabaseAdmin.from('projetos').select('*').eq('id', id).maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 })
    if (!data) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, projeto: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
