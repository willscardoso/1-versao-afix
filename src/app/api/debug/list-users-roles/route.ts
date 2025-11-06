import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

// Dev-only endpoint to list rows in public.users and public.roles for debugging.
// Requires header x-dev-migrate matching DEV_MIGRATE_TOKEN (default 'dev-secret').
// Not available in production.

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 403 })
  }

  const secret = process.env.DEV_MIGRATE_TOKEN || 'dev-secret'
  const header = req.headers.get('x-dev-migrate') || ''
  if (!header || header !== secret) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid dev token header (x-dev-migrate)' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured: SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_URL missing' }, { status: 500 })
  }

  try {
    const [{ data: users, error: uErr }, { data: roles, error: rErr }] = await Promise.all([
      (supabaseAdmin as any).from('users').select('id,email,password_hash,role_id,full_name').limit(200),
      (supabaseAdmin as any).from('roles').select('role_id,name').limit(200)
    ])

    if (uErr) return NextResponse.json({ ok: false, error: String(uErr.message || uErr) }, { status: 500 })
    if (rErr) return NextResponse.json({ ok: false, error: String(rErr.message || rErr) }, { status: 500 })

    // compute a lower-cased email client-side to avoid PostgREST SQL function usage in select
    const usersNormalized = (users || []).map((u: any) => ({ ...u, email_l: (u.email || '').toLowerCase() }))

    return NextResponse.json({ ok: true, users: usersNormalized, roles: roles || [] })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 })
  }
}
