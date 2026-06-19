// PLACEHOLDER config — the page loads but won't connect until real values are filled in.
// See CONNECT.md (≈5 min). The anon key is public by design; passcode stored only as a hash.
window.CLUBHOUSE_CONFIG = {
  SUPABASE_URL: "https://cavefhuklhkhvviqsjrg.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ZDaTdOEJE8RTtCurNjWLMg_TKjKZISJ",
  ROOM_SLUG: "claude-code-gang",
  PASSCODE_HASH: "REPLACE_WITH_SHA256_HEX",
  // n8n webhook that verifies a /knock code server-side. Leave as placeholder to accept
  // any knock from a known nick (velvet rope); set it to turn the door into a real lock.
  KNOCK_VERIFY_URL: "REPLACE_WITH_N8N_KNOCK_VERIFY_URL",
};
