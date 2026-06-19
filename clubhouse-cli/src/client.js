import readline from "node:readline";
import { C } from "./config.js";
import { GANG, NICKS, CLAUD3, colorFor } from "./gang.js";
import { loadProfile, saveProfile, profilePath } from "./identity.js";
import { makeClient, loadHistory, connect, sendMessage, post } from "./supabase.js";
import { formatRow, formatRoster } from "./render.js";
import { parseInput, COMMANDS } from "./commands.js";
import { pickTrivia, isCorrect, TRIVIA } from "./trivia.js";

const out = (s = "") => process.stdout.write(s + "\n");

function banner(nick, mode) {
  out();
  out(`${C.canopy}╭──────────────────────────────────────────────╮${C.reset}`);
  out(`${C.canopy}│${C.reset}  ${C.coral}#claude-code-gang${C.reset} ${C.dim}· the clubhouse${C.reset} 🌲            ${C.canopy}│${C.reset}`);
  out(`${C.canopy}│${C.reset}  ${C.dim}Outstanding Alone. Better Together.${C.reset}         ${C.canopy}│${C.reset}`);
  out(`${C.canopy}╰──────────────────────────────────────────────╯${C.reset}`);
  out(`${C.sys}you are ${colorFor(nick)}${nick}${C.reset}${C.sys} · ${mode} mode · /help for commands${C.reset}`);
  out();
}

// First-run nick picker — uses its own short-lived readline, closed before the main loop.
function pickNick() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = () => {
      out(`${C.canopy}Welcome to the clubhouse.${C.reset} Pick your nick:`);
      GANG.forEach((g, i) => out(`  ${C.coral}${i + 1}${C.reset}) ${g.color}${g.nick}${C.reset} ${C.dim}(${g.name})${C.reset}`));
      rl.question("> ", (ans) => {
        const idx = parseInt(ans.trim(), 10) - 1;
        const g = GANG[idx] || GANG.find((x) => x.nick.toLowerCase() === ans.trim().toLowerCase());
        if (!g) { out(`${C.err}pick a number 1–${GANG.length}${C.reset}`); return ask(); }
        saveProfile({ nick: g.nick });
        out(`${C.sys}saved to ${profilePath()}${C.reset}`);
        rl.close();
        resolve(g.nick);
      });
    };
    ask();
  });
}

export async function run() {
  let profile = loadProfile();
  if (!profile || !NICKS.includes(profile.nick)) {
    profile = { nick: await pickNick() };
  }
  const ME = profile.nick;

  const sb = makeClient();
  const seen = new Set();
  let roster = new Set();

  // history first (printed before the input loop exists)
  try {
    const hist = await loadHistory(sb);
    hist.forEach((m) => { if (m.id) seen.add(m.id); out(formatRow(m)); });
  } catch {
    out(`${C.err}couldn't load history — check your connection${C.reset}`);
  }

  // trivia round state (the starter hosts + scores)
  let trivia = null;
  const startTrivia = async () => {
    if (trivia) return showLater(`${C.sys}a trivia round is already running${C.reset}`);
    const pick = pickTrivia(Math.floor(Math.random() * TRIVIA.length));
    trivia = { answer: pick.a };
    await post(sb, { nick: CLAUD3.nick, kind: "bot", body: `🌲 TRIVIA: ${pick.q} (first correct answer wins — 30s)` });
    trivia.timer = setTimeout(async () => {
      if (trivia) { await post(sb, { nick: CLAUD3.nick, kind: "bot", body: `⏱️ time! the answer was: ${pick.a}` }); trivia = null; }
    }, 30000);
  };
  const checkTriviaAnswer = async (m) => {
    if (!trivia || m.nick === CLAUD3.nick || m.kind !== "msg") return;
    if (isCorrect(m.body, trivia.answer)) {
      clearTimeout(trivia.timer); const ans = trivia.answer; trivia = null;
      await post(sb, { nick: CLAUD3.nick, kind: "bot", body: `🎉 ${m.nick} nailed it — "${ans}". Refuse to lose.` });
    }
  };

  // live connection BEFORE the input loop, so no piped/typed input is lost mid-setup
  let rl;
  const renderRow = (m) => {
    if (m.id && seen.has(m.id)) return;
    if (m.id) seen.add(m.id);
    if (rl) { readline.cursorTo(process.stdout, 0); readline.clearLine(process.stdout, 0); }
    out(formatRow(m));
    if (rl) rl.prompt(true);
  };
  const showLater = (line) => {
    if (rl) { readline.cursorTo(process.stdout, 0); readline.clearLine(process.stdout, 0); }
    out(line);
    if (rl) rl.prompt(true);
  };

  const teardown = await connect(sb, ME, {
    onMessage: (m) => { renderRow(m); checkTriviaAnswer(m); },
    onPresence: (set) => { roster = set; },
    onMode: (mode) => banner(ME, mode),
  });

  // NOW open the input loop
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = () => { rl.setPrompt(`${colorFor(ME)}<${ME}>${C.reset} `); rl.prompt(); };

  let lastSend = Promise.resolve();
  const cleanup = async () => {
    try { await lastSend; } catch {}          // flush any in-flight message before exit
    out(`\n${C.canopy}see you in the grove 🌲${C.reset}`);
    try { await teardown(); } catch {}
    try { rl.close(); } catch {}
    process.exit(0);
  };

  rl.on("line", async (line) => {
    // mIRC feel: erase the raw line the terminal just echoed, so the message only
    // appears ONCE — as the formatted <nick> row that round-trips back. Without this,
    // your typed text lingers above the rendered row and looks like a double/echo.
    if (process.stdout.isTTY) {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
    }
    const text = line.trim();
    if (!text) return prompt();
    const parsed = parseInput(text);
    if (parsed.type === "command") {
      switch (parsed.name) {
        case "help":
          out(`${C.canopy}commands:${C.reset}`);
          COMMANDS.forEach((c) => out(`  ${C.coral}/${c.name}${C.reset} ${C.dim}— ${c.desc}${C.reset}`));
          break;
        case "who": out(formatRoster(roster)); break;
        case "clear": console.clear(); banner(ME, "connected"); break;
        case "trivia": await startTrivia(); break;
        case "quit": return cleanup();
      }
      return prompt();
    }
    lastSend = sendMessage(sb, ME, text);
    const err = await lastSend;
    if (err) showLater(`${C.err}message failed — ${err.message}${C.reset}`);
    prompt();
  });
  rl.on("SIGINT", cleanup);
  rl.on("close", () => { /* EOF on piped input — let pending work flush then exit */ setTimeout(() => process.exit(0), 200); });

  prompt();
}
