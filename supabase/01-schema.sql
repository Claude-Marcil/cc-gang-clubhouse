-- Claude Code Gang Clubhouse — Supabase schema
-- Run once in the Supabase SQL editor (see CONNECT.md).

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  room text not null default 'claude-code-gang',
  nick text not null,
  kind text not null default 'msg' check (kind in ('msg','act','bot','sys')),
  body text not null
);

create index if not exists messages_room_time on public.messages(room, created_at);

-- Row Level Security: anon may read + insert, never update/delete.
alter table public.messages enable row level security;

drop policy if exists "read messages" on public.messages;
create policy "read messages"  on public.messages for select using (true);

drop policy if exists "insert messages" on public.messages;
create policy "insert messages" on public.messages for insert with check (true);

-- Realtime: broadcast inserts on this table to subscribed clients.
alter publication supabase_realtime add table public.messages;
