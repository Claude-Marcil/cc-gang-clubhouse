-- Connects new @Claud3 messages to the n8n bot. Run once in the Supabase SQL editor.
-- The WHEN clause means n8n is only called for actual @Claud3 mentions (not every message),
-- so it barely uses any n8n execution quota. The loop guard (nick <> 'Claud3') stops the bot
-- from triggering itself.

create trigger claud3_on_mention
after insert on public.messages
for each row
when (new.body like '%@Claud3%' and new.nick <> 'Claud3')
execute function supabase_functions.http_request(
  'https://mjmarcil-rw0923.app.n8n.cloud/webhook/claud3-clubhouse',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '2000'
);

-- If your project errors on `supabase_functions.http_request` (older projects), use the
-- dashboard instead: Database → Webhooks → Create → table `messages`, event INSERT, type
-- HTTP Request, POST to the URL above. (The WHEN filter isn't available in the dashboard UI,
-- so n8n will receive every insert and filter @Claud3 itself — still fine, just chattier.)
