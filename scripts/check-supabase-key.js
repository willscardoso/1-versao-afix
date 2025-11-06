#!/usr/bin/env node
/**
 * check-supabase-key.js
 * Quick script to validate SUPABASE_SERVICE_ROLE and NEXT_PUBLIC_SUPABASE_URL
 * Usage (PowerShell):
 *  $env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"; $env:SUPABASE_SERVICE_ROLE="<service_role_key>"; node .\scripts\check-supabase-key.js
 * The script will attempt a lightweight select from `users` and print results or the Supabase error.
 */

const { createClient } = require('@supabase/supabase-js')

async function main() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let serviceRole = process.env.SUPABASE_SERVICE_ROLE

  // Fallback: try to read .env.local in repo root to pick up developer values
  if ((!url || !serviceRole) && require('fs').existsSync('.env.local')) {
    try {
      const envContent = require('fs').readFileSync('.env.local', 'utf8')
      envContent.split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
        if (!m) return
        const k = m[1]
        let v = m[2] || ''
        // remove surrounding quotes
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1)
        }
        if (!url && k === 'NEXT_PUBLIC_SUPABASE_URL') url = v
        if (!serviceRole && k === 'SUPABASE_SERVICE_ROLE') serviceRole = v
      })
      console.log('Loaded values from .env.local fallback (if present)')
    } catch (e) {
      // ignore parse errors
    }
  }

  if (!url || !serviceRole) {
    console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE before running this script, or add them to .env.local')
    console.error('Example (PowerShell):')
    console.error('$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"; $env:SUPABASE_SERVICE_ROLE="<service_role_key>"; node .\\scripts\\check-supabase-key.js')
    process.exit(2)
  }

  console.log('Using NEXT_PUBLIC_SUPABASE_URL =', url)
  // avoid printing full key
  console.log('Using SUPABASE_SERVICE_ROLE =', serviceRole && (serviceRole.length > 10 ? `${serviceRole.slice(0,6)}...${serviceRole.slice(-4)}` : serviceRole))

  try {
    const supabase = createClient(url, serviceRole)
    console.log('Sending test request: SELECT id FROM public.users LIMIT 1')
    const res = await supabase.from('users').select('id').limit(1)
    if (res.error) {
      console.error('\nSupabase returned an error:')
      console.error('message:', res.error.message)
      if (res.status) console.error('status:', res.status)
      if (res.error.details) console.error('details:', res.error.details)
      process.exit(3)
    }

    console.log('\nSuccess. Response:')
    console.log('data:', res.data)
    console.log('If the response shows data or an empty array, the key is valid for queries against your project.')
    process.exit(0)
  } catch (err) {
    console.error('\nUnexpected error while checking Supabase key:')
    console.error(err && err.message ? err.message : String(err))
    process.exit(4)
  }
}

main()
