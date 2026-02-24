-- New Supabase project setup for lead capture (safe to run multiple times).
-- Run this after creating/recreating public.leads, otherwise client inserts can fail with:
-- HTTP 401 | permission denied for table leads
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

grant usage on schema public to anon, authenticated;
revoke all on table public.leads from public;
revoke all on table public.leads from anon, authenticated;
grant all on table public.leads to postgres, service_role;
grant insert (name, email) on table public.leads to anon, authenticated;

alter table public.leads enable row level security;

drop policy if exists "Enable insert for everyone" on public.leads;
drop policy if exists "leads_insert_anon_authenticated" on public.leads;

create policy "leads_insert_anon_authenticated"
on public.leads
for insert
to anon, authenticated
with check (email is not null and length(trim(email)) > 3);

-- Verification (run and confirm both values are true).
select
  has_table_privilege('anon', 'public.leads', 'INSERT') as anon_can_insert,
  has_table_privilege('authenticated', 'public.leads', 'INSERT') as authenticated_can_insert;

-- Verification (policy should include leads_insert_anon_authenticated for INSERT).
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'leads'
order by policyname;
