-- Connects new @Claud3 messages to the n8n bot via the pg_net extension.
-- (This project has no `supabase_functions` schema, so we use net.http_post directly.)
-- regexp_replace strips any stray whitespace a paste might inject into the URL.
-- security definer lets the trigger call net.http_post. WHEN clause = only fire on @Claud3.

create extension if not exists pg_net;

create or replace function public.notify_claud3() returns trigger
language plpgsql
security definer
set search_path = public, net, extensions
as $$
begin
  perform net.http_post(
    url := regexp_replace('https://mjmarcil-rw0923.app.n8n.cloud/webhook/claud3-clubhouse', '\s', '', 'g'),
    body := jsonb_build_object('type','INSERT','table','messages','record', to_jsonb(new)),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return new;
end;
$$;

drop trigger if exists claud3_on_mention on public.messages;
create trigger claud3_on_mention
after insert on public.messages
for each row
when (new.body like '%@Claud3%' and new.nick <> 'Claud3')
execute function public.notify_claud3();
