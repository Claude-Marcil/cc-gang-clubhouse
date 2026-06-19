import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "./config.js";
import { probeWebSocket } from "./probe.js";

export function makeClient() {
  return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
    auth: { persistSession: false },
  });
}

export async function loadHistory(sb, limit = CONFIG.HISTORY_LIMIT) {
  const { data, error } = await sb
    .from("messages").select("*")
    .eq("room", CONFIG.ROOM)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Generic insert (used for Claud3/system/game messages).
export async function post(sb, { nick, kind = "msg", body }) {
  const { error } = await sb.from("messages").insert({ room: CONFIG.ROOM, nick, kind, body });
  return error || null;
}

export async function sendMessage(sb, nick, body) {
  const isAction = body.startsWith("/me ");
  const kind = isAction ? "act" : "msg";
  const text = isAction ? body.slice(4) : body;
  const { error } = await sb.from("messages")
    .insert({ room: CONFIG.ROOM, nick, kind, body: text });
  return error || null;
}

// Connect for live updates. Probes wss; uses realtime if allowed, else polling.
// callbacks: { onMessage(row), onPresence(Set<nick>)|null, onMode("realtime"|"polling") }
// returns an async teardown().
export async function connect(sb, nick, cb) {
  const wssOk = await probeWebSocket();
  cb.onMode?.(wssOk ? "realtime" : "polling");

  if (wssOk) {
    const channel = sb.channel(`room:${CONFIG.ROOM}`, {
      config: { presence: { key: nick } },
    });
    channel.on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.${CONFIG.ROOM}` },
      (payload) => cb.onMessage?.(payload.new));
    channel.on("presence", { event: "sync" }, () => {
      cb.onPresence?.(new Set(Object.keys(channel.presenceState())));
    });
    await new Promise((resolve) => {
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") { await channel.track({ nick, at: Date.now() }); resolve(); }
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { resolve(); }
      });
    });
    return async () => { try { await channel.unsubscribe(); } catch {} };
  }

  // Polling fallback — presence is unavailable (returns null once).
  cb.onPresence?.(null);
  let lastSeen = new Date().toISOString();
  const timer = setInterval(async () => {
    const { data } = await sb.from("messages").select("*")
      .eq("room", CONFIG.ROOM).gt("created_at", lastSeen)
      .order("created_at", { ascending: true });
    if (data && data.length) {
      lastSeen = data[data.length - 1].created_at;
      data.forEach((row) => cb.onMessage?.(row));
    }
  }, CONFIG.POLL_MS);
  return async () => clearInterval(timer);
}
