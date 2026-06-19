// Clubhouse CLI config. The publishable key is public by design (RLS protects the DB).
export const CONFIG = {
  SUPABASE_URL: "https://cavefhuklhkhvviqsjrg.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ZDaTdOEJE8RTtCurNjWLMg_TKjKZISJ",
  ROOM: "claude-code-gang",
  HISTORY_LIMIT: 80,
  POLL_MS: 2000,
  PROBE_MS: 3500,
};

// Redwood-branded ANSI palette (256-color; Windows Terminal/ConPTY safe)
export const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  bark: "\x1b[38;5;130m",   // redwood bark brown
  canopy: "\x1b[38;5;78m",  // canopy green
  coral: "\x1b[38;5;209m",  // the gang coral accent
  ts: "\x1b[38;5;240m",     // muted timestamp
  sys: "\x1b[38;5;245m",
  err: "\x1b[38;5;203m",
};
