-- 001_seed_users.sql
-- Insert a test user (use only in dev/staging). Replace <BCRYPT_HASH> with a real bcrypt hash.

INSERT INTO public.users (id, email, password_hash, full_name, role)
VALUES (
  gen_random_uuid(),
  'test@local.test',
  '<BCRYPT_HASH>',
  'Test User',
  'client'
)
ON CONFLICT (email) DO NOTHING;
