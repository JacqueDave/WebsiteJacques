-- Ensure UUID generation works on all projects.
create extension if not exists pgcrypto;

-- Create the leads table if it doesn't exist.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text not null
);

-- Explicit privileges for PostgREST roles.
grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon, authenticated;

-- Enable RLS (best practice when using anon/authenticated keys).
alter table public.leads enable row level security;

-- Keep policy idempotent so this script can be re-run safely.
drop policy if exists "Enable insert for everyone" on public.leads;
drop policy if exists "leads_insert_anon_authenticated" on public.leads;

create policy "leads_insert_anon_authenticated"
on public.leads
for insert
to anon, authenticated
with check (true);
