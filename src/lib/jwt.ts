import crypto from 'crypto'

function base64UrlEncode(buf: Buffer) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  // pad
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64')
}

export function signToken(payload: object, secret: string, expiresIn = '7d') {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  let exp = now + 60 * 60 * 24 * 7 // default 7 days
  // parse simple formats like '7d', '1h', '30m'
  const m = /^(\d+)([smhd])$/.exec(expiresIn)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = m[2]
    if (unit === 's') exp = now + n
    if (unit === 'm') exp = now + n * 60
    if (unit === 'h') exp = now + n * 60 * 60
    if (unit === 'd') exp = now + n * 60 * 60 * 24
  }
  const body = { ...payload, iat: now, exp }
  const headerB = Buffer.from(JSON.stringify(header))
  const payloadB = Buffer.from(JSON.stringify(body))
  const toSign = `${base64UrlEncode(headerB)}.${base64UrlEncode(payloadB)}`
  const sig = crypto.createHmac('sha256', secret).update(toSign).digest()
  return `${toSign}.${base64UrlEncode(sig)}`
}

export function verifyToken(token: string, secret: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token')
    const [h, p, s] = parts
    const toSign = `${h}.${p}`
    const expectedSig = base64UrlEncode(crypto.createHmac('sha256', secret).update(toSign).digest())
    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(s))) throw new Error('Invalid signature')
    const payload = JSON.parse(base64UrlDecode(p).toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) throw new Error('Token expired')
    return payload
  } catch (err) {
    throw err
  }
}

export default { signToken, verifyToken }
