#!/usr/bin/env node
'use strict'
const readline = require('readline')
const fs = require('fs')
const path = require('path')

function question(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans) }))
}

async function fetchSafe(url, options) {
  if (typeof fetch === 'undefined') {
    try {
      global.fetch = require('node-fetch')
    } catch (e) {
      console.error('Please run this script with Node >=18 or install node-fetch')
      process.exit(1)
    }
  }
  return fetch(url, options)
}

async function main(){
  console.log('Supabase sync checker')
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await question('Supabase URL (e.g. https://abc.supabase.co): ')
  let serviceRole = process.env.SUPABASE_SERVICE_ROLE || await question('Supabase service role key (will not be stored): ')
  if(!supabaseUrl || !serviceRole){ console.error('Missing inputs'); process.exit(1) }

  // Normalize URL
  supabaseUrl = supabaseUrl.trim().replace(/\/+$/,'')

  const restBase = `${supabaseUrl}/rest/v1`
  const headers = { 'apikey': serviceRole, 'Authorization': `Bearer ${serviceRole}` }

  console.log('\nChecking `users` table via REST...')
  try{
    const resp = await fetchSafe(`${restBase}/users?select=id&limit=1`, { headers })
    const text = await resp.text()
    if(resp.ok){
      console.log(' - users table looks present (HTTP 200).')
    } else {
      console.log(` - users check returned HTTP ${resp.status}`)
      console.log('   Response:', text)
      if(/relation.*users|does not exist|no such table/i.test(text)){
        console.log('\n=> users table appears to be missing in this Supabase project.')
        console.log('You should run the migration file `supabase/run_all.sql` in the SQL Editor for this project.')
        const rl = await question('\nDo you want me to print the run_all.sql contents here for copy/paste? (y/N): ')
        if((rl||'').toLowerCase() === 'y'){
          const sql = fs.readFileSync(path.join(__dirname,'..','supabase','run_all.sql'),'utf8')
          console.log('\n---- BEGIN run_all.sql ----\n')
          console.log(sql)
          console.log('\n---- END run_all.sql ----\n')
        }
      }
    }
  }catch(err){ console.error('Error checking users via REST:', err.message||err) }

  // Check columns role and password_hash specifically
  console.log('\nChecking presence of role and password_hash columns on users (best-effort)...')
  try{
    const resp2 = await fetchSafe(`${restBase}/users?select=role,password_hash&limit=1`, { headers })
    const text2 = await resp2.text()
    if(resp2.ok){
      console.log(' - role and password_hash columns appear accessible.')
    } else {
      console.log(` - column check returned HTTP ${resp2.status}`)
      console.log('   Response:', text2)
    }
  }catch(err){ console.error('Error checking columns via REST:', err.message||err) }

  console.log('\nSummary and next steps:')
  console.log('- If users table is missing, open the Supabase project matching the masked URL below and run `supabase/run_all.sql` from the repo in the SQL Editor.')
  const mask = supabaseUrl.length > 16 ? supabaseUrl.substring(0,10)+'...'+supabaseUrl.substring(supabaseUrl.length-6) : supabaseUrl
  console.log('  Supabase project (masked):', mask)
  console.log('- After running the SQL, insert a test user with the included helper: `node scripts/generate-bcrypt.js <password> <email> <full_name> <role>`')
  console.log('- If the REST calls above returned 401, your service role key may be invalid or belong to a different project; double-check the key and project.')
  console.log('\nIf you want, run this script again with correct env vars or follow the printed SQL to apply the migration.')
}

main().catch(err=>{ console.error(err); process.exit(1) })
