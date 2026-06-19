# Clubhouse CLI 🌲 — terminal chat for the Claude Code Gang

A mIRC-style terminal client for `#claude-code-gang`. Connects **directly** to the shared
Supabase backend, so it sidesteps the browser/corporate-proxy issues entirely. Cross-platform
(macOS / Windows / Linux — anywhere Node runs, which is everywhere a gang member runs Claude Code).

## Install (each member, once)

```bash
# from a clone of the repo:
cd cc-gang-clubhouse/clubhouse-cli
npm install
npm link          # puts `clubhouse` on your PATH

# then, forever after:
clubhouse
```

(Windows: same commands in PowerShell. No admin needed if Node's npm prefix is on PATH; otherwise
use `npx .` from this folder.)

First run asks you to pick your nick (Copeland / Weintz / Marcil / Niergarth / Ramsey) and saves it
to `~/.config/clubhouse/profile.json`. No passcode — the room is gated by the shared backend.

## Use

- Type to chat. `Enter` sends.
- **Commands:** `/help` `/who` `/trivia` `/me <action>` `/clear` `/quit`
- **`/trivia`** starts a Redwood-flavored round — first correct answer in chat wins.

## How it stays robust

On startup it probes whether the network allows the Supabase Realtime WebSocket. If yes →
real-time mode (instant messages + live who's-online). If a proxy blocks WebSockets → it
automatically falls back to 2-second polling (chat still works; presence shows "polling mode").

## Notes
- The Supabase publishable key in `src/config.js` is public by design (row-level security protects
  the data). The terminal client needs no secret.
- Same backend as the web clubhouse — messages and the Claud3 bot are shared across both.
