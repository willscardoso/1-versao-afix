import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import supabaseAdmin from '@/lib/supabaseAdmin'
import fs from 'fs'
import path from 'path'

// Dev-only endpoint to create a test user if the `users` table exists.
// Safety: only enabled when NODE_ENV !== 'production' and requires a short-lived header token.

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
    const full_name = body.full_name || body.name || null
    const role = (body.role || 'client').toString().toLowerCase()

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'email and password are required' }, { status: 400 })
    }

    // Check if users table exists by attempting a simple select
    const { data: test, error: testErr } = await (supabaseAdmin as any).from('users').select('id').limit(1)
    if (testErr) {
      // Include migration SQL to help the user
      const sqlPath = path.join(process.cwd(), 'supabase', 'run_all.sql')
      let sql = ''
      try { sql = fs.readFileSync(sqlPath, 'utf8') } catch (e) { sql = 'Could not read supabase/run_all.sql from repo.' }
      return NextResponse.json({ ok: false, error: 'users table missing or inaccessible', detail: String(testErr.message || testErr), run_all_sql: sql }, { status: 500 })
    }

    // Hash and insert user
    const hash = await bcrypt.hash(password, 12)
    // Resolve textual role names to role_id where possible, prefer role_id in users table
    const insertObj: any = { email, password_hash: hash }
    if (full_name) insertObj.full_name = full_name

    if (/^\d+$/.test(String(role))) {
      insertObj.role_id = Number(role)
    } else if (role) {
      // try to resolve name -> role_id in roles table
      try {
        const { data: lookup, error: lookupErr } = await (supabaseAdmin as any).from('roles').select('role_id, name').ilike('name', role.toString()).maybeSingle()
        if (lookupErr) {
          // don't fail; just skip role mapping
          // eslint-disable-next-line no-console
          console.warn('create-test-user: role lookup error', lookupErr)
        }
        if (lookup && lookup.role_id != null) {
          insertObj.role_id = Number(lookup.role_id)
        } else {
          // roles table doesn't contain the name; prefer leaving out unknown columns
          // eslint-disable-next-line no-console
          console.warn('create-test-user: role name not found, leaving role_id unset for', role)
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.warn('create-test-user: role lookup exception', e && e.message ? e.message : String(e))
      }
    }

    const { data, error } = await (supabaseAdmin as any).from('users').insert(insertObj).select('id,email,role_id').maybeSingle()
    if (error) {
      // If duplicate key on email, try updating the existing user instead (replace password_hash)
      // Postgres duplicate key error code = '23505'
      // eslint-disable-next-line no-console
      console.error('create-test-user: insert error', error)
      if (String(error.code) === '23505' || (error.message && String(error.message).includes('duplicate key'))) {
        try {
          const updObj: any = { password_hash: insertObj.password_hash }
          if (insertObj.role_id != null) updObj.role_id = insertObj.role_id
          if (insertObj.full_name) updObj.full_name = insertObj.full_name
          const { data: updated, error: updErr } = await (supabaseAdmin as any).from('users').update(updObj).eq('email', email).select('id,email,role_id').maybeSingle()
          if (updErr) {
            // eslint-disable-next-line no-console
            console.error('create-test-user: update-after-duplicate error', updErr)
            return NextResponse.json({ ok: false, error: String(updErr.message ?? updErr), detail: updErr }, { status: 500 })
          }
          return NextResponse.json({ ok: true, user: updated, updated: true })
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error('create-test-user: update-after-duplicate exception', e)
          return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 500 })
        }
      }

      return NextResponse.json({ ok: false, error: String(error.message ?? error), detail: error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 })
  }
}
