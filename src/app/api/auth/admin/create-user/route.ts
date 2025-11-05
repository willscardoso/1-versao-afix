import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
  const { email, password, full_name, role } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    }

    const hash = await bcrypt.hash(password, 12)

    // normalize and validate role
    const allowedRoles = ['admin', 'client', 'franqueador', 'franqueado']
    const roleRaw = (role || '').toString().toLowerCase()
    let finalRole = 'client'
    if (roleRaw) {
      if (roleRaw === 'cliente') finalRole = 'client'
      else if (allowedRoles.includes(roleRaw)) finalRole = roleRaw
    }

    const { data, error } = await (supabaseAdmin as any).from('users').insert({ email, full_name, role: finalRole, password_hash: hash }).select('id, email, full_name, role').maybeSingle()
    if (error) {
      const msg = String(error?.message ?? '')
      // Detect table missing and return a helpful error
      if (/relation \"?users\"? does not exist|does not exist|no such table|relation.*users/i.test(msg)) {
        return NextResponse.json({ ok: false, error: 'Server misconfigured: required table "users" not found. Run the SQL migration at `supabase/migrations/001_create_users_table.sql` in your project and retry.' }, { status: 500 })
      }
      // Detect if request was sent with anon key (insufficient permissions)
      if (/jwt|role.*anon|permission/i.test(msg) || /status_code":\s*401/.test(msg)) {
        return NextResponse.json({ ok: false, error: 'Server permissions error: the Supabase service role is not being used. Ensure SUPABASE_SERVICE_ROLE is set in your server env and restart the dev server.' }, { status: 500 })
      }
      return NextResponse.json({ ok: false, error: error.message ?? String(error) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 })
  }
}
