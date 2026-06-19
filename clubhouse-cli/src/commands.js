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

// Returns { type:'message', raw } for normal text and /me,
// or { type:'command', name, args, raw } for a recognized leading /command.
export function parseInput(line) {
  const raw = line;
  if (!line.startsWith("/")) return { type: "message", raw };
  if (line.startsWith("/me ")) return { type: "message", raw }; // /me handled as an action message
  const m = line.slice(1).match(/^(\S+)\s*(.*)$/s);
  if (!m) return { type: "message", raw };
  const name = m[1].toLowerCase();
  const args = m[2];
  if (!COMMANDS.some((c) => c.name === name)) return { type: "message", raw }; // unknown / → send as text
  return { type: "command", name, args, raw };
}
