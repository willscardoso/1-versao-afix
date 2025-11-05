import { createClient } from '@supabase/supabase-js'

let supabaseAdmin = null as ReturnType<typeof createClient> | null

function maskKey(key?: string) {
  if (!key) return '<missing>'
  if (key.length <= 10) return key
  return key.substring(0, 6) + '...' + key.substring(key.length - 4)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE

if (!url || !serviceRole) {
  // eslint-disable-next-line no-console
  console.warn('Supabase admin client missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE')
} else {
  // basic sanity check for supabase URL
  const ok = /https?:\/\/[\w.-]+supabase\.co/.test(url)
  if (!ok) {
    console.warn(`Supabase admin client - NEXT_PUBLIC_SUPABASE_URL appears malformed: ${maskKey(url)}`)
  } else {
    try {
      supabaseAdmin = createClient(url, serviceRole)
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to create Supabase admin client:', err.message ?? err)
      supabaseAdmin = null
    }
  }
}

export { supabaseAdmin }
export default supabaseAdmin
