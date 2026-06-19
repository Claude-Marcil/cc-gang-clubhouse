# ☀️ Morning handoff — Claude Code Gang Clubhouse

**TL;DR: the clubhouse is live and working two ways, both verified against the real backend.
You can get in right now. A couple of optional 2-minute steps are yours when you want them.**

---

## What you can do this second

### 1. Terminal clubhouse (the robust one — built + verified end-to-end)
```bash
cd "Claude Code/cc-gang-clubhouse/clubhouse-cli"
npm install && npm link     # one time
clubhouse                   # chat
```
mIRC-style, connects straight to Supabase. Commands: `/help /who /trivia /me /clear /quit`.
**Verified live:** two separate clients see each other's messages + presence in real time
(ran two instances against the real Supabase); wss realtime works; `/trivia` round runs;
cross-platform (Node — so **Brooke on PC works too**, no Mac-only anything).

### 2. Web clubhouse — build 8
**https://claude-marcil.github.io/cc-gang-clubhouse/**
- `/knock` (now a cross-platform Node launcher, already installed in your `~/.claude/skills`)
  opens it and **auto-enters as you** via a URL `#fragment` — which is *physically impossible*
  for a proxy to strip (fragments are never sent to a server). This is the real fix for the
  query-string-stripping you hit last night.
- **Guaranteed floor:** if anything about the fragment misbehaves, pick your name + passcode
  **`treehouse`** — that always works, no network dependency.
- **Verified in a clean browser:** fragment auto-entry, live presence, message-id dedup (no
  more double messages), build stamp.

---

## What I verified (real, not sandbox hand-waving — the lesson from last night)
- ✅ Terminal: 2-client realtime fan-out + presence, **against live Supabase**
- ✅ Terminal: 10/10 pure-logic unit tests (commands, render, trivia)
- ✅ Web build 8: fragment auto-entry, presence, dedup, in a clean browser
- ✅ **Cross-surface interop:** a message sent from the *terminal* client showed up in the
  *web* clubhouse — both surfaces share one live channel
- ✅ `/knock` Node launcher runs on this machine; installed to your skills dir
- ⏳ Can't verify from here (needs *your* network): whether Redwood passes the `#fragment`.
  The build-8 diag line on the gate now shows `hash=…` — if you ever see the gate *with* a
  hash present, the fragment got stripped and you'd flip on the broker (step B below). Not
  expected; the passcode floor covers it either way.

## Your optional steps (each ~2 min, none blocking)
- **A — Activate Claud3 (the bot).** Needs your n8n creds + a Supabase webhook. Steps in
  `CONNECT.md` §C. Until then the bot shows in the list but won't reply.
- **B — Broker fallback (only if the fragment is stripped on your net).** Run
  `supabase/02-knock-broker.sql` in the SQL editor, set `KNOCK_BROKER:true` in `config.js`,
  rebuild (`python3 build-single.py`) + push. Then `/knock` works with zero URL params.
- **C — Lock down writes (nice hardening).** Run `supabase/03-harden-rls.sql` to restrict
  posting to the five nicks + bot.
- **D — Share with the gang.** Each member: install the terminal client + the `/knock` skill,
  and create `~/.config/clubhouse/profile.json` = `{"nick":"…","secret":"…"}`. The shared
  secret is on this machine at `~/.config/clubhouse/club-secret`.

## Notes
- A few test messages are in the channel (`__integ…`, `…verify…`, "overnight build check") from
  proving things worked — harmless, ignore or clear them.
- Plan of record: `~/.claude/plans/zippy-prancing-allen.md`. Repo: `Claude-Marcil/cc-gang-clubhouse`.
- Deferred to Phase 4: web-side games UI (terminal has `/trivia` now); cross-client trivia
  leaderboard (`supabase/04-trivia-scores.sql` is staged for it).

🌲 Outstanding Alone. Better Together.
