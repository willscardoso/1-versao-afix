-- Combined migration + seed for AFIX
-- Run this in Supabase SQL Editor to apply role enum migration, create users table, and optionally insert a test user.
-- BEFORE RUNNING: make a DB backup (Supabase Dashboard -> Backups -> Take snapshot)

-- === 1) Migrate enum values (safe to run even if types/tables don't yet exist) ===
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    CREATE TYPE user_role_new AS ENUM ('admin','client','franqueador','franqueado');
  END IF;
END$$;

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

-- === 2) Create users table if missing ===
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

-- === 3) OPTIONAL: insert a test user ===
-- Generate a bcrypt hash locally (Node) and paste it below replacing <BCRYPT_HASH>
-- node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TestPass123!',12).then(h=>console.log(h));"

-- INSERT INTO public.users (id, email, password_hash, full_name, role, created_at)
-- VALUES (gen_random_uuid(), 'deniz.r.v@gmail.com', '<BCRYPT_HASH>', 'Deniz R', 'client', now())
-- ON CONFLICT (email) DO NOTHING;

-- After running, test the admin endpoint and login locally.
