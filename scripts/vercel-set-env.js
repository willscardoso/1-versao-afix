#!/usr/bin/env node
'use strict'
const readline = require('readline');
const { spawnSync } = require('child_process');
const fs = require('fs');

function question(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans); }));
}

async function main(){
  console.log('Vercel env setter helper');
  console.log('This script will print the vercel CLI commands to set environment variables and can optionally run them locally.');
  console.log('You will need a Vercel Personal Token (created in Vercel dashboard).');

  const token = (process.env.VERCEL_TOKEN) ? process.env.VERCEL_TOKEN : await question('Paste your VERCEL_TOKEN (or press Enter to abort): ');
  if(!token){ console.error('No token provided. Exiting.'); process.exit(1); }

  const project = await question('Enter the Vercel project name (lowercase, e.g. afix): ');
  if(!project){ console.error('No project specified. Exiting.'); process.exit(1); }

  const toSet = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', scope: 'preview,production' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', scope: 'preview,production' },
    { name: 'SUPABASE_SERVICE_ROLE', scope: 'production' },
    { name: 'JWT_SECRET', scope: 'production' }
  ];

  const answers = {};
  for(const v of toSet){
    const val = await question(`Value for ${v.name} (leave empty to skip): `);
    if(val) answers[v.name] = { value: val, scope: v.scope };
  }

  if(Object.keys(answers).length === 0){ console.log('No variables specified. Exiting.'); process.exit(0); }

  console.log('\nThe following vercel env add commands will be run (or you can copy/paste them):\n');
  for(const [k,info] of Object.entries(answers)){
    const scopes = info.scope.split(',');
    for(const s of scopes){
      console.log(`npx vercel env add ${k} ${s} --token <YOUR_TOKEN>   # value: ${s === 'production' ? '***PROTECTED***' : '***PROTECTED***'}`);
    }
  }

  const runNow = (await question('\nRun the vercel CLI commands now from this machine? (y/N): ')).toLowerCase();
  if(runNow !== 'y'){
    console.log('\nDone. Copy the commands above and run them manually if needed.');
    process.exit(0);
  }

  // Run commands using child_process, passing the value via stdin when required
  for(const [k,info] of Object.entries(answers)){
    const scopes = info.scope.split(',');
    for(const s of scopes){
      console.log(`Setting ${k} for ${s}...`);
      // Spawn vercel env add and pipe the value to stdin
      const cmd = 'npx';
      const args = ['vercel','env','add',k,s,'--token',token,'--confirm'];
      const cp = spawnSync(cmd, args, { input: info.value + '\n', encoding: 'utf8' });
      console.log(cp.stdout);
      if(cp.status !== 0){
        console.error('Command failed:', cp.stderr || cp.stdout);
        console.error('You can re-run the printed commands manually.');
      }
    }
  }

  console.log('\nAll done. Verify the variables in your Vercel dashboard.');
}

main().catch(err => { console.error(err); process.exit(1); });
