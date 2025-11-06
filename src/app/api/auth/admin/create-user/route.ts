import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
  let { email, password, full_name, role } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    }

  // normalize email and hash password
  email = (email || '').toString().trim().toLowerCase()
  const hash = await bcrypt.hash(password, 12)

    // normalize and validate role (accept textual role or numeric role_id)
    const allowedRoles = ['admin', 'client', 'franqueador', 'franqueado']
    const roleRaw = (role || '').toString().toLowerCase()
    let finalRole = 'client'
    let finalRoleId: number | null = null

    // If a numeric role id was provided, use it directly
    if (/^\d+$/.test(roleRaw)) {
      finalRoleId = parseInt(roleRaw, 10)
    } else if (roleRaw) {
      // If a textual role name was provided, try to resolve it to a role_id in the `roles` table
      const normalized = roleRaw === 'cliente' ? 'client' : roleRaw
      if (allowedRoles.includes(normalized)) {
        try {
          const lookup = await (supabaseAdmin as any).from('roles').select('role_id, name').ilike('name', normalized).maybeSingle()
          if (lookup && (lookup as any).data && (lookup as any).data.role_id != null) {
            finalRoleId = Number((lookup as any).data.role_id)
          } else {
            // no roles table or not found — fall back to storing textual role
            finalRole = normalized
          }
        } catch (e) {
          // roles table may not exist or permission issue — fallback to textual role
          finalRole = normalized
        }
      }
    }

    const insertPayload: any = { email, full_name, password_hash: hash }
    if (finalRoleId != null) insertPayload.role_id = finalRoleId
    else insertPayload.role = finalRole

  const { data, error } = await (supabaseAdmin as any).from('users').insert(insertPayload).select('id, email, full_name, role_id').maybeSingle()
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
