-- 001_create_users_table.sql
-- Creates a minimal `users` table expected by the app
-- Run this in the Supabase SQL editor or via psql/supabase CLI

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

-- optional index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users ((lower(email)));
