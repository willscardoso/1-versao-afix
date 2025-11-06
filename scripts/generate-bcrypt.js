#!/usr/bin/env node
/**
 * generate-bcrypt.js
 * Usage: node scripts/generate-bcrypt.js <password> <email> [full_name] [role]
 *
 * Generates a bcrypt hash for the provided password and prints an SQL INSERT
 * statement you can paste into the Supabase SQL Editor.
 *
 * Requires: npm install bcryptjs
 */

const bcrypt = require('bcryptjs');

const [,, password, email, full_name, role] = process.argv;
if (!password || !email) {
  console.error('Usage: node scripts/generate-bcrypt.js <password> <email> [full_name] [role]');
  process.exit(1);
}

const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) { console.error(err); process.exit(1) }
  const now = new Date().toISOString();
  const safeEmail = email.replace(/'/g, "''");
  const safeName = full_name ? full_name.replace(/'/g, "''") : null;
  const finalRole = role || 'client';
  const sql = `INSERT INTO public.users (email, password_hash, full_name, role, created_at, updated_at)\nVALUES ('${safeEmail}', '${hash}', ${safeName ? `'${safeName}'` : 'NULL'}, '${finalRole}', '${now}', '${now}');`;
  console.log('\n-- SQL to insert user into public.users --');
  console.log(sql);
  console.log('\nCopy the SQL and run it in Supabase SQL Editor (after backing up).');
});
