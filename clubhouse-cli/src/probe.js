// Probe whether the network permits the Supabase Realtime WebSocket.
// Resolves true if the wss handshake opens within the timeout, false otherwise.
// Node 20+ has a global WebSocket; fall back gracefully if absent.
import { CONFIG } from "./config.js";

export async function probeWebSocket(timeoutMs = CONFIG.PROBE_MS) {
  if (typeof WebSocket === "undefined") return false;
  const url =
    `${CONFIG.SUPABASE_URL.replace(/^http/, "ws")}/realtime/v1/websocket` +
    `?apikey=${encodeURIComponent(CONFIG.SUPABASE_ANON_KEY)}&vsn=1.0.0`;
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; try { ws.close(); } catch {} resolve(v); } };
    let ws;
    try { ws = new WebSocket(url); } catch { return resolve(false); }
    const timer = setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => { clearTimeout(timer); finish(true); };
    ws.onerror = () => { clearTimeout(timer); finish(false); };
  });
}
