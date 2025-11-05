import { verifyToken } from '@/lib/jwt'
import supabaseAdmin from '@/lib/supabaseAdmin'

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.split('=')
      return [k?.trim(), v.join('=').trim()]
    }).filter(([k]) => k)
  )
  return cookies['afix_session'] || null
}

export function verifyTokenWrapper(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return verifyToken(token, secret) as { sub: string; email?: string; iat?: number; exp?: number }
}

export async function getUserFromRequest(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  let payload
  try {
    payload = verifyTokenWrapper(token)
  } catch (err) {
    return null
  }
  if (!payload?.sub) return null
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin.from('users').select('id, email, full_name, role').eq('id', payload.sub).maybeSingle()
  if (error) return null
  return data || null
}

export default { getTokenFromRequest, verifyToken, getUserFromRequest }
