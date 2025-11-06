-- Create projetos table to store quote requests from the frontend
-- Run this in the Supabase SQL editor (or include in your migration runner)

create extension if not exists pgcrypto;

CREATE TABLE IF NOT EXISTS public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text NOT NULL,
  phone text,
  service text,
  description text,
  location text,
  urgency text,
  budget text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- simple index to find recent requests
CREATE INDEX IF NOT EXISTS idx_projetos_created_at ON public.projetos(created_at DESC);
