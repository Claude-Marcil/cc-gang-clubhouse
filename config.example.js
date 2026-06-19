// Copy to config.js and fill in. The anon key is PUBLIC by design (Supabase RLS protects
// the database), and the passcode is stored only as a hash — so for this 5-person, no-secrets
// static page, config.js IS committed so GitHub Pages can serve it. See CONNECT.md.
window.CLUBHOUSE_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",
  ROOM_SLUG: "claude-code-gang",
  // sha-256 hex of the shared club passcode (CONNECT.md shows how to generate this)
  PASSCODE_HASH: "REPLACE_WITH_SHA256_HEX",
};
