// The exclusive five + Claud3. Colors are ANSI 256 to match the web mascots' hues.
export const GANG = [
  { nick: "Copeland",  name: "Matt",    color: "\x1b[38;5;75m"  },  // blue
  { nick: "Weintz",    name: "Brent",   color: "\x1b[38;5;141m" },  // violet
  { nick: "Marcil",    name: "Mike",    color: "\x1b[38;5;209m" },  // coral
  { nick: "Niergarth", name: "Natalie", color: "\x1b[38;5;78m"  },  // green
  { nick: "Ramsey",    name: "Brooke",  color: "\x1b[38;5;221m" },  // gold
];
export const CLAUD3 = { nick: "Claud3", color: "\x1b[38;5;208m" };

export const NICKS = GANG.map(g => g.nick);

export function colorFor(nick) {
  const g = GANG.find(x => x.nick === nick);
  if (g) return g.color;
  if (nick === CLAUD3.nick) return CLAUD3.color;
  return "\x1b[38;5;250m";
}
