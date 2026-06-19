# Claude Code Gang Clubhouse 🌲

A mIRC-style web chat room for the five Claude Code Gang members, with live AOL-style
presence and the **Claud3** bot. Exclusive 5-person club.

- **Frontend:** static page on GitHub Pages (no build step)
- **Backbone:** Supabase (realtime messages + presence) — free tier
- **Claud3 bot:** n8n + Claude API, fires only on `@Claud3` mentions

## Layout
- `index.html` / `app.js` / `styles.css` — the room
- `gang.js` — the five members + Claud3 roster
- `gate.js` — members-only passcode gate
- `config.example.js` → copy to `config.js` and fill in
- `supabase/schema.sql` — DB table + RLS + realtime
- `n8n/claud3-workflow.json` — Claud3's brain (reference export)
- `CONNECT.md` — one-time setup (≈5 min)

## Status
Built 2026-06-18. Goes live once `CONNECT.md` is completed (Supabase project + keys).
