import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 })
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.email) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    // only cliente, franqueado or franqueador can edit their own projects
    const role = String((user.role || '')).toLowerCase()
    if (!['cliente', 'franqueado', 'franqueador'].includes(role)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const id = params.id
    const body = await req.json()
    // ensure project belongs to user (by email) before allowing update
  const existing = await (supabaseAdmin as any).from('projetos').select('email').eq('id', id).maybeSingle()
  if ((existing as any).error) return NextResponse.json({ ok: false, error: String((existing as any).error.message || (existing as any).error) }, { status: 500 })
  const proj = (existing as any).data
  if (!proj) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  // compare emails case-insensitively
  if (String((proj.email || '')).toLowerCase() !== String((user.email || '')).toLowerCase()) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })

    // allow only specific fields to be updated
    const allowed: any = {}
    if (body.service !== undefined) allowed.service = String(body.service)
    if (body.description !== undefined) allowed.description = String(body.description)
    if (body.location !== undefined) allowed.location = String(body.location)
    if (body.urgency !== undefined) allowed.urgency = String(body.urgency)
    if (body.budget !== undefined) allowed.budget = String(body.budget)

  const { data, error } = await (supabaseAdmin as any).from('projetos').update(allowed).eq('id', id).select('*').maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 })
    return NextResponse.json({ ok: true, projeto: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
