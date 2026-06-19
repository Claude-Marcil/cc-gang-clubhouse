// Pure formatting helpers — no I/O, so they're unit-testable.
import { C } from "./config.js";
import { colorFor } from "./gang.js";

function hhmm(iso) {
  const d = iso ? new Date(iso) : new Date();
  return d.toTimeString().slice(0, 5);
}

// Format a message row into a single ANSI-colored line (mIRC style).
export function formatRow(m) {
  const col = colorFor(m.nick);
  switch (m.kind) {
    case "sys":
      return `${C.sys}— ${m.body} —${C.reset}`;
    case "act":
      return `${C.ts}${hhmm(m.created_at)}${C.reset} ${C.dim}*${C.reset} ${col}${m.nick}${C.reset} ${m.body}`;
    case "bot":
      return `${C.ts}${hhmm(m.created_at)}${C.reset} ${C.coral}<${m.nick}>${C.reset} ${m.body}`;
    default: // msg
      return `${C.ts}${hhmm(m.created_at)}${C.reset} ${col}<${m.nick}>${C.reset} ${m.body}`;
  }
}

// Online roster line for the header.
export function formatRoster(onlineSet) {
  if (onlineSet === null) return `${C.sys}presence: polling mode (who's-online unavailable)${C.reset}`;
  const names = [...onlineSet].sort();
  const colored = names.map((n) => `${colorFor(n)}${n}${C.reset}`).join(" ");
  return `${C.canopy}online (${names.length}):${C.reset} ${colored || C.dim + "(nobody yet)" + C.reset} ${C.coral}+ Claud3${C.reset}`;
}
