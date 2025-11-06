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
  const { data, error } = await supabaseAdmin.from('users').select('id, email, full_name, role_id').eq('id', payload.sub).maybeSingle()
  if (error) return null
  // if role missing but role_id present, attempt to resolve human readable role name
  const user = data as any
  if (user && !user.role && user.role_id != null) {
    try {
      const r = await supabaseAdmin.from('roles').select('role_id, name').eq('role_id', user.role_id).maybeSingle()
      if (r && (r as any).data && (r as any).data.name) {
        user.role = (r as any).data.name
      }
    } catch (e) {
      // ignore
    }
  }
  return user || null
}

export default { getTokenFromRequest, verifyToken, getUserFromRequest }
