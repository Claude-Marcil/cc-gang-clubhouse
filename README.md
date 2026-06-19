# Claude Code Gang Clubhouse 🌲

A private, mIRC-style chat for the five Claude Code Gang members — "Discord for Claude, mini."
Two surfaces, one shared backend.

- **Web** — https://claude-marcil.github.io/cc-gang-clubhouse/ · open it with `/knock` (auto-enters
  as you via a proxy-immune URL fragment) or pick your nick + the club passcode.
- **Terminal** — `clubhouse-cli/` · a Node mIRC client (`clubhouse`) that connects straight to
  Supabase; realtime with automatic polling fallback. Cross-platform (Mac/Win/Linux).
- **Backend** — Supabase free tier (messages + RLS + realtime + presence).
- **Claud3** — a Claude-API bot living in the channel (n8n); games framework with `/trivia`.

## Layout
- `index.html` — built single-file web app (from `build-single.py`; **rebuild after editing
  `config.js`/`gang.js`/`gate.js`/`app.js`/`styles.css`**). Visible build stamp confirms version.
- `knock/` — the `/knock` Claude Code skill (cross-platform Node launcher `knock.mjs`).
- `clubhouse-cli/` — the terminal client (`npm install && npm link` → `clubhouse`).
- `supabase/` — `01` schema (run) + optional `02` broker / `03` RLS / `04` scores.
- `n8n/claud3-workflow.json` — the Claud3 bot (built; activate per `CONNECT.md` §C).
- `CONNECT.md` — operator runbook · `MORNING-HANDOFF.md` — current status & next steps.

## Identity
`~/.config/clubhouse/profile.json` = `{"nick":"…","secret":"…"}`. Nicks: Copeland (Matt),
Weintz (Brent), Marcil (Mike), Niergarth (Natalie), Ramsey (Brooke).

🌲 Outstanding Alone. Better Together.
