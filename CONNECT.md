# Clubhouse — one-time setup (≈5 min)

The page is live at **https://claude-marcil.github.io/cc-gang-clubhouse/** but it won't
actually chat until you connect the free Supabase backbone below. Two layers:
the **passcode** (the door) and **Supabase** (the room behind it).

---

## A. The passcode (the door)

The shared club passcode is stored only as a SHA-256 hash in `config.js` (`PASSCODE_HASH`).
To change it:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR-PASSCODE').digest('hex'))"
```

Paste the result into `config.js` → `PASSCODE_HASH`, then `git commit -am "passcode" && git push`.

---

## B. Supabase (the room) — makes chat actually work

1. **Create a project** at https://supabase.com (free tier). Copy the **Project URL** and
   the **anon public key** (Project Settings → API).
2. **Run the schema:** SQL Editor → paste the contents of `supabase/schema.sql` → Run.
3. **Fill `config.js`:** set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Commit + push.
   (The anon key is public by design — Supabase row-level rules protect the data.)
4. ✅ The chat + live presence now work. Open the page, enter the passcode, say hi.

---

## C. Claud3 the bot (optional but fun) — n8n

Already built (inactive) in your n8n: **`Claud3 — Clubhouse Bot`**
(`https://mjmarcil-rw0923.app.n8n.cloud/workflow/PY0ZghJDJ6c2lLxU`).

1. **Point Supabase at it:** Supabase → Database → Webhooks → *Create a new hook* on the
   `messages` table, **INSERT** event, type **HTTP Request**, method **POST**, URL:
   ```
   https://mjmarcil-rw0923.app.n8n.cloud/webhook/claud3-clubhouse
   ```
2. **Give n8n its keys** (the three HTTP nodes call Supabase + Claude):
   - **`SUPABASE_URL`** — n8n → Settings → Variables → add `SUPABASE_URL` =
     `https://YOUR-PROJECT.supabase.co` (no trailing slash).
   - **Supabase service key** — n8n → Credentials → New → **Header Auth**, name it
     `Supabase Service Key`. Set the **`apikey`** header to your **raw** service-role JWT
     (no `Bearer`), and `Authorization` to `Bearer <same key>`. (Supabase wants the raw key
     in `apikey` and the `Bearer`-prefixed key in `Authorization`.)
   - **Anthropic key** — the workflow already references an `Anthropic account` credential;
     confirm it has a valid key.
3. **Activate** the `Claud3 — Clubhouse Bot` workflow.
4. ✅ Now `@Claud3 ...` in the channel gets a reply.

> Improvement note: the HTTP nodes can be swapped for n8n's native **Supabase** node
> (one "Supabase API" credential = host + service key) to avoid the apikey/Bearer split.
> Left as HTTP for now; refactor anytime.

---

## D. Tell the gang
Share the URL + passcode with the five. That's it. 🌲
