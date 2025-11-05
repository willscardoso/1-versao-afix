-- AFIX Supabase schema
-- Tables: profiles, services, requests, quotes, messages

-- Roles for application users
-- Use these role keys: admin, client, franqueador, franqueado
create type if not exists user_role as enum ('admin','client','franqueador','franqueado');

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  avatar_url text,
  password_hash text,
  role user_role not null default 'client',
  -- If this profile is a franqueado, link to the franqueador's profile id
  franchise_owner_id uuid references profiles(id) on delete set null,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  service_key text references services(key) on delete set null,
  title text,
  description text,
  urgency text,
  budget_range text,
  location text,
  created_at timestamptz default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  provider_profile_id uuid references profiles(id) on delete set null,
  amount numeric,
  message text,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  sender_profile_id uuid references profiles(id) on delete set null,
  body text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_requests_profile_id on requests(profile_id);
create index if not exists idx_quotes_request_id on quotes(request_id);
create index if not exists idx_messages_request_id on messages(request_id);
