-- 002_migrate_user_role_enum.sql
-- Safely migrate existing `user_role` enum values from Portuguese keys to English keys
-- This creates a new enum type, migrates `profiles.role` and `users.role` to it, then drops the old type and renames the new one.

BEGIN;

-- create new enum with desired values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    CREATE TYPE user_role_new AS ENUM ('admin','client','franqueador','franqueado');
  END IF;
END$$;

-- migrate profiles.role if table exists
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

-- migrate users.role if table exists
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

-- drop old type and rename new type to user_role
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
