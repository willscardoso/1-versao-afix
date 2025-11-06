import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured: SUPABASE_SERVICE_ROLE not set' }, { status: 500 })
  }

  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

  // Behavior by role with optional server-side status filter (?status=...):
  // - admin: default return projects with status 'finalizado' unless status param provided
  // - franqueado / franqueador: behave like 'cliente' (see only their own projects)
  // - cliente: return only the user's projects (can be filtered by status if provided)
    const url = new URL(req.url)
    const statusParam = url.searchParams.get('status') // e.g. 'pendente', 'em_analise', 'finalizado' or 'all'

    let query = (supabaseAdmin as any).from('projetos').select('id,full_name,email,phone,service,description,location,urgency,budget,status,created_at')
    const role = String((user.role || '') || '').toLowerCase()

    if (role === 'admin') {
      if (statusParam && statusParam !== 'all') {
        query = query.eq('status', statusParam)
      } else {
        query = query.eq('status', 'finalizado')
      }
      query = query.order('created_at', { ascending: false }).limit(200)
    } else if (role === 'franqueado' || role === 'franqueador') {
      // treat franqueado/franqueador like cliente: show only their own projects
      // use case-insensitive match for email
        // franqueado/franqueador should see all projects; optionally filtered by statusParam
        if (statusParam && statusParam !== 'all') {
          query = query.eq('status', statusParam)
        }
        query = query.order('created_at', { ascending: false }).limit(200)
    } else {
      // cliente: only their projects
      query = query.eq('email', String(user.email || '')).order('created_at', { ascending: false }).limit(200)
      if (statusParam && statusParam !== 'all') {
        query = query.eq('status', statusParam)
      }
    }
    const { data, error } = await query
    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, projetos: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
