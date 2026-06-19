#!/usr/bin/env node
// /knock — open the Claude Code Gang clubhouse, auto-entering as you.
// Cross-platform (macOS / Windows / Linux / WSL). Requires Node (every member has it via Claude Code).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";

const URL_BASE = process.env.CLUBHOUSE_URL || "https://claude-marcil.github.io/cc-gang-clubhouse/";
const SUPABASE_URL = "https://cavefhuklhkhvviqsjrg.supabase.co";
const SUPABASE_ANON = "sb_publishable_ZDaTdOEJE8RTtCurNjWLMg_TKjKZISJ";
const CFG = process.env.CLUBHOUSE_PROFILE || join(homedir(), ".config", "clubhouse", "profile.json");

if (!existsSync(CFG)) {
  console.error(`no clubhouse profile at ${CFG}`);
  console.error(`create one:  mkdir -p ~/.config/clubhouse && echo '{"nick":"YourNick","secret":"SHARED-SECRET"}' > "${CFG}"`);
  process.exit(1);
}
const { nick, secret = "" } = JSON.parse(readFileSync(CFG, "utf8"));

// rotating knock code: HMAC-SHA256(secret, 5-min window), first 12 hex chars.
const window = Math.floor(Date.now() / 300000);
const code = createHmac("sha256", secret).update(String(window)).digest("hex").slice(0, 12);

// fragment carries identity (proxy-immune); unique k= forces a fresh page load.
const url = `${URL_BASE}#nick=${encodeURIComponent(nick)}&code=${code}&k=${Date.now()}`;

// belt-and-suspenders: also drop a short-lived broker row (used only if KNOCK_BROKER is enabled
// on the web side; harmless no-op if the table doesn't exist).
try {
  await fetch(`${SUPABASE_URL}/rest/v1/knock_codes`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ nick, code, expires_at: new Date(Date.now() + 120000).toISOString() }),
  });
} catch { /* ignore — broker is optional */ }

function isWSL() {
  try { return process.platform === "linux" && readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft"); }
  catch { return false; }
}
function openBrowser(u) {
  const p = process.platform;
  if (p === "darwin") return spawn("open", [u], { detached: true, stdio: "ignore" }).unref();
  if (p === "win32") return spawn("cmd", ["/c", "start", "", u], { detached: true, stdio: "ignore" }).unref();
  if (isWSL()) return spawn("powershell.exe", ["-NoProfile", "-Command", `Start-Process "${u}"`], { detached: true, stdio: "ignore" }).unref();
  return spawn("xdg-open", [u], { detached: true, stdio: "ignore" }).unref();
}

console.log(`🚪 knock knock — opening the clubhouse as ${nick}`);
try { openBrowser(url); } catch { console.log("open this in your browser:\n" + url); }
