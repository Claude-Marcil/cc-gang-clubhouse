import assert from "node:assert";
import { parseInput, COMMANDS } from "../src/commands.js";
import { formatRow, formatRoster } from "../src/render.js";
import { isCorrect, normalize, pickTrivia, TRIVIA } from "../src/trivia.js";

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("  ✓", name); };

// --- commands ---
t("plain text is a message", () => {
  assert.equal(parseInput("hello gang").type, "message");
});
t("/me is a message (action), not a command", () => {
  assert.equal(parseInput("/me waves").type, "message");
});
t("/trivia is a recognized command", () => {
  const r = parseInput("/trivia");
  assert.equal(r.type, "command"); assert.equal(r.name, "trivia");
});
t("/quit recognized; unknown /foo is 'unknown' (NOT broadcast)", () => {
  assert.equal(parseInput("/quit").type, "command");
  const u = parseInput("/foo bar");
  assert.equal(u.type, "unknown"); assert.equal(u.name, "foo");
});
t("aliases resolve: /exit and /q -> quit, /? -> help", () => {
  assert.equal(parseInput("/exit").name, "quit");
  assert.equal(parseInput("/q").name, "quit");
  assert.equal(parseInput("/?").name, "help");
});
t("command args captured", () => {
  assert.equal(parseInput("/who extra").args, "extra");
});

// --- render (smoke: returns strings, contains the body) ---
t("formatRow renders each kind", () => {
  for (const kind of ["msg", "act", "bot", "sys"]) {
    const line = formatRow({ nick: "Marcil", kind, body: "hi", created_at: "2026-06-19T05:00:00Z" });
    assert.ok(typeof line === "string" && line.includes("hi"));
  }
});
t("formatRoster handles online set and polling(null)", () => {
  assert.ok(formatRoster(new Set(["Marcil", "Weintz"])).includes("Marcil"));
  assert.ok(formatRoster(null).toLowerCase().includes("polling"));
});

// --- trivia ---
t("normalize strips punctuation/case", () => {
  assert.equal(normalize("  Everything! "), "everything");
});
t("isCorrect exact + forgiving substring", () => {
  assert.ok(isCorrect("everything", "everything"));
  assert.ok(isCorrect("it's everything to us", "everything"));
  assert.ok(!isCorrect("nope", "everything"));
});
t("pickTrivia wraps index safely", () => {
  assert.deepEqual(pickTrivia(0), TRIVIA[0]);
  assert.deepEqual(pickTrivia(TRIVIA.length), TRIVIA[0]);
  assert.ok(pickTrivia(-1));
});

console.log(`\n${n} tests passed`);
