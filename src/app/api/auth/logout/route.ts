import { NextResponse } from 'next/server'

// POST /api/auth/logout
// Clears the afix_session cookie and returns ok:true
export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true })
  // clear cookie (set empty value + maxAge 0)
  res.cookies.set({
    name: 'afix_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return res
}
