// Bundled Redwood/ServiceTitan-flavored trivia bank (v1 — no API needed).
// Phase 4 will add Claude-generated questions + cross-client scoring via a Supabase table.
export const TRIVIA = [
  { q: "In ServiceTitan, what does 'CO' stand for in the CO/RPW work?", a: "conversion opportunity" },
  { q: "Redwood's founding maxim (CEO Richard Lewis): 'Connection is ____.'", a: "everything" },
  { q: "Coast redwoods have no taproot — they stay standing because their roots do what?", a: "interlock" },
  { q: "Redwood's 4 PSC values: Proactive, Collaborative, Adaptive, and ____?", a: "tenacious" },
  { q: "What ServiceTitan metric counts a job as converted only at the sold threshold?", a: "opp given" },
  { q: "Redwood's quarterly company magazine is called 'Branching ____.'", a: "out" },
  { q: "'16 partner companies… 1 Redwood ____.'", a: "nation" },
  { q: "Which warehouse tool is nicknamed 'Canopy' internally?", a: "snowflake" },
];

// Pick a question deterministically from an index (caller supplies randomness/rotation).
export function pickTrivia(i) {
  return TRIVIA[((i % TRIVIA.length) + TRIVIA.length) % TRIVIA.length];
}

// Normalize an answer for forgiving comparison.
export function normalize(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

export function isCorrect(guess, answer) {
  const g = normalize(guess), a = normalize(answer);
  return g === a || (a.length > 4 && g.includes(a));
}
