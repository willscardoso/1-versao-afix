import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { signToken } from '@/lib/jwt'

type LoginBody = {
  email?: string
  password?: string
}

export async function POST(req: Request) {
  try {
    const body: LoginBody = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password are required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      if (process.env.NODE_ENV !== 'production') console.warn('Auth debug: supabaseAdmin not configured')
      return NextResponse.json({ ok: false, error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    }

    // Look up user in the 'users' table only
    const { data: userRecord, error: userError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, email, password_hash, full_name, role')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (userError) {
      const msg = String(userError?.message || '')
      console.warn('Supabase users lookup error', msg)
      // Detect common Postgres "relation does not exist" error and return a clear server error
      if (/relation \"?users\"? does not exist|does not exist|no such table|relation.*users/i.test(msg)) {
        return NextResponse.json({ ok: false, error: 'Server misconfigured: required table "users" not found. Run the SQL migration at `supabase/migrations/001_create_users_table.sql` and retry.' }, { status: 500 })
      }
      // Detect anon/permission issues
      if (/jwt|role.*anon|permission/i.test(msg) || /status_code":\s*401/.test(msg)) {
        return NextResponse.json({ ok: false, error: 'Server permissions error: ensure SUPABASE_SERVICE_ROLE is set in your server env and restart the dev server.' }, { status: 500 })
      }
      // Other DB errors: in development include minimal debug, otherwise return generic 401
      const base = { ok: false, error: 'Invalid credentials' }
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ ...base, debug: { userError: msg } }, { status: 401 })
      }
      return NextResponse.json(base, { status: 401 })
    }

    if (!userRecord) {
      if (process.env.NODE_ENV !== 'production') console.log('Auth debug: no userRecord found for', email)
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Determine which column holds the hash
    const hash = (userRecord.password_hash ?? userRecord.password ?? null) as string | null
    if (!hash) {
      if (process.env.NODE_ENV !== 'production') console.log('Auth debug: user found but no password_hash for', userRecord.email)
      return NextResponse.json({ ok: false, error: `No password hash found for user` }, { status: 500 })
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth debug: userRecord', { id: userRecord.id, email: userRecord.email, full_name: userRecord.full_name, role: userRecord.role })
      console.log('Auth debug: comparing password for', userRecord.email)
    }

    const match = await bcrypt.compare(password, hash)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth debug: password match result for', userRecord.email, match)
    }

    if (!match) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    }

  // Authentication successful. Issue a signed JWT and set httpOnly cookie.
  const safeUser = { id: userRecord.id, email: userRecord.email, role: userRecord.role }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json({ ok: false, error: 'Server misconfigured: missing JWT_SECRET' }, { status: 500 })
    }

  const token = signToken({ sub: safeUser.id, email: safeUser.email, role: safeUser.role }, secret, '7d')

    const res = NextResponse.json({ ok: true, user: safeUser })
    // set cookie
    res.cookies.set({
      name: 'afix_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return res
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 })
  }
}
