-- Ensure UUID generation works
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create the leads table freshly
CREATE TABLE public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text not null
);

-- 2. Explicit privileges for PostgREST roles to access and write
GRANT usage ON schema public TO anon, authenticated;
GRANT insert ON table public.leads TO anon, authenticated;

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any attached policies just in case
DROP POLICY IF EXISTS "leads_insert_anon_authenticated" ON public.leads;

-- 5. Create policy allowing anyone (anon) to insert a row
CREATE POLICY "leads_insert_anon_authenticated"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
