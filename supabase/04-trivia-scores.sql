-- OPTIONAL (Phase 4) — leaderboard table for /trivia cross-client scoring.
-- The terminal client's /trivia already runs rounds; this adds a persistent scoreboard.

create table if not exists public.scores (
  nick text primary key,
  points int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.scores enable row level security;
drop policy if exists "scores read"   on public.scores;
create policy "scores read"   on public.scores for select using (true);
drop policy if exists "scores write"  on public.scores;
create policy "scores write"  on public.scores for insert with check (true);
drop policy if exists "scores update" on public.scores;
create policy "scores update" on public.scores for update using (true);
