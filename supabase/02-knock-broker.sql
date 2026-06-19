-- OPTIONAL — only needed if the #fragment is stripped on your network (it shouldn't be).
-- Creates the broker table so /knock can hand off identity with NO URL params at all.
-- After running this, set KNOCK_BROKER:true in config.js and rebuild.

create table if not exists public.knock_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nick text not null,
  code text not null,
  expires_at timestamptz not null
);

alter table public.knock_codes enable row level security;
drop policy if exists "kc read"   on public.knock_codes;
create policy "kc read"   on public.knock_codes for select using (true);
drop policy if exists "kc insert" on public.knock_codes;
create policy "kc insert" on public.knock_codes for insert with check (true);
drop policy if exists "kc delete" on public.knock_codes;
create policy "kc delete" on public.knock_codes for delete using (true);
