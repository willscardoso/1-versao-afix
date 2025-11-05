# Deploy & Setup guide — Supabase (AFIX)

This guide walks through applying the DB migrations, creating the `users` table and a test user, and verifying the Next.js app can use the Supabase service role for admin operations.

IMPORTANT: Always take a DB backup before running migrations in production.

---

## 1) Backup (do this first)
Use Supabase Dashboard → Project → Backups → Take snapshot.
Or with supabase CLI:

```powershell
supabase db dump --project-ref <project-ref> --file .\backups\backup-$(Get-Date -Format yyyyMMdd_HHmmss).sql
```

---

## 2) Run enum migration (safe)
Copy & paste this SQL into Supabase SQL Editor and execute. It normalises role labels and updates existing columns safely.

```sql
-- 002_migrate_user_role_enum.sql
BEGIN;

-- create new enum with desired values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    CREATE TYPE user_role_new AS ENUM ('admin','client','franqueador','franqueado');
  END IF;
END$$;

-- migrate profiles.role if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles
      ALTER COLUMN role TYPE user_role_new USING (
        CASE role
          WHEN 'cliente' THEN 'client'
          WHEN 'client' THEN 'client'
          WHEN 'franqueador' THEN 'franqueador'
          WHEN 'franqueado' THEN 'franqueado'
          WHEN 'admin' THEN 'admin'
          ELSE 'client'
        END::user_role_new
      );
  END IF;
END$$;

-- migrate users.role if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE public.users
      ALTER COLUMN role TYPE user_role_new USING (
        CASE role
          WHEN 'cliente' THEN 'client'
          WHEN 'client' THEN 'client'
          WHEN 'franqueador' THEN 'franqueador'
          WHEN 'franqueado' THEN 'franqueado'
          WHEN 'admin' THEN 'admin'
          ELSE 'client'
        END::user_role_new
      );
  END IF;
END$$;

-- rename types safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE user_role RENAME TO user_role_old;
  END IF;
  ALTER TYPE user_role_new RENAME TO user_role;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_old') THEN
    DROP TYPE user_role_old;
  END IF;
END$$;

COMMIT;
```

Notes:
- This is idempotent and checks for the presence of columns/types before altering them.

---

## 3) Create `users` table
Run this next (SQL Editor):

```sql
-- 001_create_users_table.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users ((lower(email)));
```

---

## 4) (Optional) Insert a test user
Generate a bcrypt hash locally (Node required):

```powershell
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TestPass123!',12).then(h=>console.log(h));"
```

Copy the printed hash and insert it in SQL editor (replace `<BCRYPT_HASH>`):

```sql
INSERT INTO public.users (id, email, password_hash, full_name, role, created_at)
VALUES (gen_random_uuid(), 'deniz.r.v@gmail.com', '<BCRYPT_HASH>', 'Deniz R', 'client', now())
ON CONFLICT (email) DO NOTHING;
```

OR use app admin endpoint (requires SUPABASE_SERVICE_ROLE configured in server):

```powershell
$payload = @{ email='deniz.r.v@gmail.com'; password='TestPass123!'; full_name='Deniz R'; role='client' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/auth/admin/create-user -Method Post -Body $payload -ContentType 'application/json' | ConvertTo-Json
```

---

## 5) Configure environment variables for your app
Local dev (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE=<service-role-key>
JWT_SECRET=<long-random-secret>
```

In production (Vercel): add the same variables in Project → Settings → Environment Variables. Make sure `SUPABASE_SERVICE_ROLE` is stored as a server-side secret (do NOT prefix with `NEXT_PUBLIC_`).

---

## 6) Restart Next app & verify
Restart your dev server:

```powershell
npm run dev
```

Check the debug endpoint (should show `hasService: true` and `configured: true`):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/debug/supabase | ConvertTo-Json
```

Expected example:

```json
{ "ok": true, "hasUrl": true, "hasService": true, "configured": true }
```

---

## 7) Test login flow
1. If you inserted the test user with password `TestPass123!`, test login:

```powershell
$body = @{ email='deniz.r.v@gmail.com'; password='TestPass123!' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method Post -Body $body -ContentType 'application/json' -ErrorAction SilentlyContinue | ConvertTo-Json
```

2. Check current authenticated user:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/me | ConvertTo-Json
```

---

## 8) If something fails — what to paste here
- Output JSON from: `Invoke-RestMethod -Uri http://localhost:3000/api/debug/supabase | ConvertTo-Json`
- The JSON response from failing endpoint (admin-create or login).
- Terminal logs where `npm run dev` is running (lines with `Auth debug:` or Supabase errors).

I will guide you on exact fixes based on those outputs.

---

## 9) Cleanup after verification
When everything works, ask me to:
- Remove temporary debug logging from `src/app/api/auth/login/route.ts`.
- Add a small helper `requireRole(...roles)` to protect server routes.

---

## Files added to repo
- `supabase/run_all.sql` — combined migration + create table + optional seed (already in repo).
- `supabase/migrations/001_create_users_table.sql` and `002_migrate_user_role_enum.sql` — migrations.
- `supabase/seeds/001_seed_users.sql` — seed template.

---

If you want, I can also create a PR that documents these steps in `README.md` or apply additional code changes (remove debug logs, add role helper). Which next step do you want me to do?

- Reply `remove-logs` to remove debug logs.
- Reply `add-requireRole` to add a helper and example usage.
- Reply `done` once you run the SQL and test so I can tidy up.
