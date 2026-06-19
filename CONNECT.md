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

## E. The `/knock` door (terminal-only entry — replaces the passcode)

The clubhouse is meant to be entered from the CLI: each gang member runs **`/knock`** in
Claude Code and the browser opens straight into the room as them. See `knock/README.md`
for install. The web already auto-enters on a valid knock.

To turn the door from a velvet rope into a real lock, wire the n8n knock-verifier:

1. Build a tiny n8n workflow `Clubhouse — Knock Verify`: a **Webhook (POST)** → **Code**
   node that recomputes `HMAC-SHA256(CLUBHOUSE_SECRET, window)` for the current and previous
   5-min window (`window = floor(now/300)`), compares the first 12 hex chars to the posted
   `code`, and responds `{ "ok": true|false }`. Add an n8n Variable `CLUBHOUSE_SECRET` =
   the same shared secret that's in each member's `~/.config/clubhouse/profile.json`.
2. Put that webhook's production URL into `config.js` → `KNOCK_VERIFY_URL`. Commit + push.
3. Now only CLI-minted knocks open the door. (Claude can build this workflow for you —
   just ask: "build the knock verifier.")

## F. Tell the gang
Share the URL + the install (`knock/README.md`) with the five. They `/knock` to get in. 🌲
