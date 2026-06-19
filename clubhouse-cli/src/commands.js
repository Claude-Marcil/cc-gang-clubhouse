// Command framework — parse leading /commands so games (e.g. /trivia) are pluggable.
// Pure parsing here; the client wires each command to behavior.

export const COMMANDS = [
  { name: "help",   desc: "show this help" },
  { name: "who",    desc: "list who's online" },
  { name: "trivia", desc: "start a Redwood trivia round (answer in chat)" },
  { name: "me",     desc: "/me <action>  — pose an action line" },
  { name: "clear",  desc: "clear the screen" },
  { name: "quit",   desc: "leave the clubhouse" },
];

// Natural aliases people reach for out of muscle memory (mIRC/IRC habits).
export const ALIASES = {
  exit: "quit", q: "quit", bye: "quit", leave: "quit",
  "?": "help", h: "help", commands: "help",
  w: "who", names: "who", cls: "clear",
};

// Returns { type:'message', raw } for normal text and /me,
// { type:'command', name, args, raw } for a recognized (or aliased) leading /command,
// or { type:'unknown', name, raw } for an unrecognized /command — which the client
// reports locally instead of broadcasting to the room.
export function parseInput(line) {
  const raw = line;
  if (!line.startsWith("/")) return { type: "message", raw };
  if (line.startsWith("/me ")) return { type: "message", raw }; // /me handled as an action message
  const m = line.slice(1).match(/^(\S+)\s*(.*)$/s);
  if (!m) return { type: "message", raw };
  const name = (ALIASES[m[1].toLowerCase()] || m[1].toLowerCase());
  const args = m[2];
  if (!COMMANDS.some((c) => c.name === name)) return { type: "unknown", name, raw }; // don't broadcast
  return { type: "command", name, args, raw };
}
