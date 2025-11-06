import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    return NextResponse.json({ ok: true, user })
  } catch (err: any) {
    // log server-side for easier debugging
    // eslint-disable-next-line no-console
    console.error('Error in /api/auth/me:', err && err.message ? err.message : String(err))
    const payload: any = { ok: false, error: 'Server error' }
    if (process.env.NODE_ENV !== 'production') payload.debug = err && err.message ? err.message : String(err)
    return NextResponse.json(payload, { status: 500 })
  }
}
