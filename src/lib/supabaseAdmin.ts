import { createClient } from '@supabase/supabase-js'

let supabaseAdmin = null as ReturnType<typeof createClient> | null

function maskKey(key?: string) {
  if (!key) return '<missing>'
  if (key.length <= 10) return key
  return key.substring(0, 6) + '...' + key.substring(key.length - 4)
}

// Helper to pick production-specific env vars when running in production (Vercel or NODE_ENV)
function pickEnv(name: string) {
  const isProd = (process.env.VERCEL_ENV === 'production') || (process.env.NODE_ENV === 'production') || (process.env.VERCEL_GIT_COMMIT_REF === 'main')
  if (isProd) {
    return process.env[`${name}_PROD`] ?? process.env[name]
  }
  return process.env[name]
}

const url = pickEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRole = pickEnv('SUPABASE_SERVICE_ROLE')

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
      // eslint-disable-next-line no-console
      console.log('Creating Supabase admin client for', maskKey(url), 'serviceRole=', maskKey(serviceRole))
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
