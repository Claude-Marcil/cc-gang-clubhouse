# Clubhouse — operator runbook

The backend (Supabase) is **already live** (URL + publishable key are in `config.js` and
`clubhouse-cli/src/config.js`; the `messages` table + RLS + realtime are created). Two ways in:

## A. Web clubhouse (live — build 8)
- URL: **https://claude-marcil.github.io/cc-gang-clubhouse/**
- Entry: `/knock` opens it and auto-enters via a URL `#fragment` (proxy-immune). Floor: pick
  your nick + passcode **`treehouse`**.
- Change the passcode: edit `PASSCODE` / `PASSCODE_HASH` in `config.js`, run
  `python3 build-single.py`, commit + push.
- After editing any of `config.js` / `gang.js` / `gate.js` / `app.js` / `styles.css`, **always
  re-run `python3 build-single.py`** (it inlines them into `index.html`) before committing.

## B. Terminal clubhouse
```bash
cd clubhouse-cli && npm install && npm link   # once
clubhouse
```
Direct Supabase connection (realtime, with automatic polling fallback if wss is blocked).
See `clubhouse-cli/README.md`.

## C. Claud3 bot (activate when ready)
Built (inactive) in n8n: `Claud3 — Clubhouse Bot`
(`https://mjmarcil-rw0923.app.n8n.cloud/workflow/PY0ZghJDJ6c2lLxU`).
1. **Supabase → Database → Webhooks** → new hook on the `messages` table, **INSERT**, type
   HTTP Request, **POST** to: `https://mjmarcil-rw0923.app.n8n.cloud/webhook/claud3-clubhouse`
2. **n8n creds:** add `SUPABASE_URL` (Settings → Variables) and a `Supabase Service Key`
   Header Auth credential (`apikey` = raw service key; `Authorization` = `Bearer <same>`);
   confirm the `Anthropic account` credential has a key. Model is `claude-opus-4-8` (or
   `claude-sonnet-4-6` for cheaper trivia volume — your call; both are current).
3. **Activate** the workflow. Now `@Claud3 …` gets a reply.

## D. Optional hardening / fallback SQL (paste into the Supabase SQL editor)
- `supabase/02-knock-broker.sql` — only if the `#fragment` is stripped on your network; then set
  `KNOCK_BROKER:true` in `config.js` + rebuild. (`/knock` already writes broker rows defensively.)
- `supabase/03-harden-rls.sql` — restrict posting to the five nicks + bot.
- `supabase/04-trivia-scores.sql` — leaderboard table for Phase-4 cross-client `/trivia` scoring.

## E. Share with the gang (each member)
- Terminal: `cd clubhouse-cli && npm install && npm link` → `clubhouse`.
- Web: install the `/knock` skill (`cp -r knock ~/.claude/skills/knock`) + create
  `~/.config/clubhouse/profile.json` = `{"nick":"…","secret":"…"}`.
- Valid nicks: Copeland, Weintz, Marcil, Niergarth, Ramsey (= Brooke). Shared secret lives at
  `~/.config/clubhouse/club-secret` on the setup machine. 🌲
