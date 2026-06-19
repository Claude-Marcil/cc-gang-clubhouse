-- OPTIONAL hardening — restrict who can POST messages to the five known nicks + the bot.
-- Stops a random internet visitor (who finds the public anon key) from writing to the channel.
-- Safe to run anytime.

drop policy if exists "insert messages" on public.messages;
create policy "insert messages" on public.messages for insert
  with check (nick in ('Copeland','Weintz','Marcil','Neirgarth','Ramsey','Claud3','system'));
