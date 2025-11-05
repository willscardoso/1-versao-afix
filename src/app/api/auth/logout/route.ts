import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true })
  // clear cookie
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
