import { createClient } from '@supabase/supabase-js'

// Public keys should be exposed to the browser via NEXT_PUBLIC_* env vars.
// Keep service role keys out of client-side code and only use them on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the browser client when running on the client and when env vars exist.
// This prevents server-side imports from throwing when vars aren't set in certain environments.
let supabase: ReturnType<typeof createClient> | null = null

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Supabase environment variables are not set: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use the browser's cookie storage where appropriate in Next.js app router
        // (leave default for now).
      }
    })
  }
}

export { supabase }
export default supabase
