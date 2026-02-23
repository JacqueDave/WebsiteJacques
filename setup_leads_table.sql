-- New Supabase project setup for lead capture (safe to run multiple times).
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

grant usage on schema public to anon, authenticated;
revoke all on table public.leads from anon, authenticated;
grant insert (name, email) on table public.leads to anon, authenticated;

alter table public.leads enable row level security;

drop policy if exists "Enable insert for everyone" on public.leads;
drop policy if exists "leads_insert_anon_authenticated" on public.leads;

create policy "leads_insert_anon_authenticated"
on public.leads
for insert
to anon, authenticated
with check (email is not null and length(trim(email)) > 3);
