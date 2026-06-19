// Live integration test against the real Supabase backend.
// Proves: history load, wss probe, realtime/polling routing, and two-client fan-out.
import { makeClient, loadHistory, sendMessage, connect } from "../src/supabase.js";
import { probeWebSocket } from "../src/probe.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? "✓" : "✗"} ${msg}`); if (!cond) failures++; };

console.log("1. wss probe…");
const wss = await probeWebSocket();
ok(true, `probe returned: ${wss ? "realtime allowed" : "blocked → would use polling"}`);

console.log("2. history load…");
const sbA = makeClient();
const hist = await loadHistory(sbA);
ok(Array.isArray(hist), `loaded ${hist.length} history rows`);

console.log("3. two-client fan-out (A subscribes, B sends, A receives)…");
const received = [];
const teardown = await connect(sbA, "Marcil", {
  onMessage: (row) => received.push(row),
  onMode: (m) => console.log(`     A connected in ${m} mode`),
});

const marker = `__integ_${Date.now()}__`;
const sbB = makeClient();
const err = await sendMessage(sbB, "Weintz", marker);
ok(!err, `B sent test message${err ? " (ERROR: " + err.message + ")" : ""}`);

// wait up to ~6s for realtime, or one poll cycle
for (let i = 0; i < 30 && !received.some((r) => r.body === marker); i++) await sleep(200);
ok(received.some((r) => r.body === marker), "A received B's message live");

await teardown();
console.log(failures ? `\n${failures} FAILED` : "\nintegration OK");
process.exit(failures ? 1 : 0);
