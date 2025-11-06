import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import supabaseAdmin from '@/lib/supabaseAdmin'

// Dev-only endpoint to update an existing user's password_hash (and optionally role_id).
// Requires header x-dev-migrate matching DEV_MIGRATE_TOKEN (default 'dev-secret').
// Safety: not available in production.

export async function POST(req: Request) {
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
    const body = await req.json()
    const email = (body.email || '').toString().trim().toLowerCase()
    const password = body.password || body.pwd || ''
    const role = body.role || null

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'email and password are required' }, { status: 400 })
    }

    // Find user (case-insensitive)
    const { data: user, error: findErr } = await (supabaseAdmin as any)
      .from('users')
      .select('id,email,role_id')
      .ilike('email', email)
      .limit(1)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ ok: false, error: String(findErr.message || findErr) }, { status: 500 })
    }
    if (!user) {
      return NextResponse.json({ ok: false, error: `User not found: ${email}` }, { status: 404 })
    }

    const hash = await bcrypt.hash(password, 12)
    const updatePayload: any = { password_hash: hash }

    // If role provided, try to resolve to role_id
    if (role) {
      if (/^\d+$/.test(String(role))) {
        updatePayload.role_id = Number(role)
      } else {
        try {
          const lookup = await (supabaseAdmin as any).from('roles').select('role_id, name').ilike('name', (role || '').toString()).maybeSingle()
          if (lookup && (lookup as any).data && (lookup as any).data.role_id != null) {
            updatePayload.role_id = Number((lookup as any).data.role_id)
          }
        } catch (e) {
          // ignore
        }
      }
    }

    const { data: updated, error: updErr } = await (supabaseAdmin as any)
      .from('users')
      .update(updatePayload)
      .eq('id', user.id)
      .select('id,email,role_id')
      .maybeSingle()

    if (updErr) {
      return NextResponse.json({ ok: false, error: String(updErr.message || updErr) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user: updated })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 })
  }
}
