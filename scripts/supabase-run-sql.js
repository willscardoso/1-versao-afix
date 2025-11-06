#!/usr/bin/env node
'use strict'
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

function question(q){
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans); }));
}

async function main(){
  const sqlPath = path.join(__dirname, '..', 'supabase', 'run_all.sql');
  if(!fs.existsSync(sqlPath)){
    console.error('Could not find supabase/run_all.sql in repo. Create it or run migrations manually.');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Found supabase/run_all.sql.\n');
  console.log('You can run this SQL in the Supabase dashboard SQL Editor (recommended).');
  console.log('--- BEGIN SQL PREVIEW ---\n');
  console.log(sql.slice(0, 2000));
  if(sql.length > 2000) console.log('\n... (truncated)');
  console.log('\n--- END SQL PREVIEW ---\n');

  console.log('Options to run the SQL:');
  console.log('  1) Open Supabase dashboard → Database → SQL Editor → paste and run (recommended)');
  console.log('  2) Use the supabase CLI if installed: `npx supabase db query --file supabase/run_all.sql --project-ref <ref>`');
  console.log('  3) Use the HTTP API: POST the SQL to the SQL Editor endpoint (requires service_role key) — we do not run this automatically for safety.');

  const opt = (await question('Choose option to run now (1=web editor, 2=use supabase CLI if installed, 3=print curl example): ')).trim();
  if(opt === '2'){
    const projectRef = await question('Supabase project ref (the short id shown in the URL): ');
    if(!projectRef){ console.error('Project ref required.'); process.exit(1); }
    console.log('Running using supabase CLI (requires you to have the CLI and be authenticated).');
    const cmd = 'npx';
    const args = ['supabase','db','query','--file', 'supabase/run_all.sql', '--project-ref', projectRef];
    const cp = spawnSync(cmd, args, { stdio: 'inherit' });
    if(cp.status !== 0){ console.error('supabase CLI command failed. Install supabase CLI or run via web editor.'); process.exit(1); }
    console.log('Finished running SQL via supabase CLI.');
    process.exit(0);
  }

  if(opt === '3'){
    const supabaseUrl = await question('Enter your Supabase project URL (e.g. https://abc123.supabase.co): ');
    const serviceKey = await question('Enter your SUPABASE_SERVICE_ROLE (it will not be stored): ');
    if(!supabaseUrl || !serviceKey){ console.error('Missing inputs. Aborting.'); process.exit(1); }
    console.log('\nExample curl you can run locally to execute the SQL via the SQL editor endpoint:\n');
    console.log(`curl '${supabaseUrl}/rest/v1/rpc' -H 'apikey: ${serviceKey}' -H 'Authorization: Bearer ${serviceKey}' -H 'Content-Type: application/sql' --data-binary @supabase/run_all.sql`);
    console.log('\nNote: the exact HTTP API for executing arbitrary SQL may vary. The safest approach is using the Supabase SQL Editor in the dashboard.');
    process.exit(0);
  }

  console.log('OK — open the Supabase dashboard SQL Editor and paste the contents of supabase/run_all.sql and run it.');
  console.log('Remember to backup your database before running migrations.');
}

main().catch(err => { console.error(err); process.exit(1); });
