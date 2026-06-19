// Claude Code Gang Clubhouse — frontend app
const $ = (s) => document.querySelector(s);

// Declared up top: /knock auto-entry runs during page load and connects Supabase before
// the section below would otherwise initialize these (temporal-dead-zone bug otherwise).
let sb, channel, ME;
let renderedIds = new Set();   // message-id dedup (kills loadHistory↔realtime race dupes)

// ---- gate ----
GANG.forEach(g => {
  const o = document.createElement("option");
  o.value = g.nick; o.textContent = `${g.nick} (${g.name})`;
  $("#nickPick").appendChild(o);
});
// remember last nick (storage may be unavailable in private mode)
let lastNick = null;
try { lastNick = localStorage.getItem("cc_nick"); } catch (e) {}
if (lastNick) $("#nickPick").value = lastNick;

$("#enterBtn").addEventListener("click", enter);
$("#passInput").addEventListener("keydown", e => { if (e.key === "Enter") enter(); });

// escape hatch — enter with no passcode/crypto/params (works if the page loaded at all)
const _skip = document.querySelector("#skipBtn");
if (_skip) _skip.addEventListener("click", () => {
  const nick = $("#nickPick").value || "Marcil";
  $("#gate").hidden = true; $("#app").hidden = false;
  startClubhouse(nick);
});

// ---- /knock auto-entry (terminal-only door) ----
// If the page was opened by the `/knock` CLI command, it carries #nick=&code=.
// Runs on load AND on hashchange, so /knock works even when the tab is already open.
// Verify server-side (n8n) when configured; otherwise accept any knock from a known nick.
async function tryKnock() {
  if (!$("#app").hidden) return;                    // already inside → nothing to do
  // Read the #fragment FIRST — fragments are never sent to servers (RFC 3986/9110), so a
  // corporate proxy physically cannot strip them (the query string IS stripped on some nets).
  // Fall back to the query string for any direct links that still use it.
  let p = new URLSearchParams(location.hash.slice(1));
  let nick = p.get("nick"), code = p.get("code");
  if (!nick || !code) { p = new URLSearchParams(location.search); nick = p.get("nick"); code = p.get("code"); }
  if (!nick || !code) return;                       // normal visit → show the gate (or broker)
  if (!GANG.find(g => g.nick === nick)) return;     // unknown nick → no entry
  const verifyUrl = window.CLUBHOUSE_CONFIG.KNOCK_VERIFY_URL;
  let ok = !verifyUrl || verifyUrl.startsWith("REPLACE_"); // velvet rope until verifier wired
  if (!ok) {
    try {
      const r = await fetch(verifyUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick, code }),
      });
      ok = (await r.json())?.ok === true;
    } catch (e) { ok = false; }
  }
  if (!ok) return;                                  // bad knock → fall through to gate
  $("#gate").hidden = true; $("#app").hidden = false;
  startClubhouse(nick);                             // reveal FIRST — never let storage block entry
  try { localStorage.setItem("cc_nick", nick); } catch (e) {}   // Safari Private throws; ignore
  try { history.replaceState(null, "", location.pathname); } catch (e) {}
}
tryKnock();
window.addEventListener("hashchange", tryKnock);

// Broker fallback (opt-in): if the #fragment is ever stripped on this network, /knock also
// writes a short-lived row to a `knock_codes` table and the page polls it — no URL needed.
// Enable by setting KNOCK_BROKER:true in config AFTER creating the table (CONNECT.md §E).
async function checkBroker() {
  if (!$("#app").hidden) return;
  const cfg = window.CLUBHOUSE_CONFIG;
  if (!cfg.KNOCK_BROKER) return;
  try {
    const h = { apikey: cfg.SUPABASE_ANON_KEY, Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY };
    const r = await fetch(`${cfg.SUPABASE_URL}/rest/v1/knock_codes?select=*&order=created_at.desc&limit=1&expires_at=gt.${new Date().toISOString()}`, { headers: h });
    const row = (await r.json())?.[0];
    if (!row || !GANG.find(g => g.nick === row.nick)) return;
    fetch(`${cfg.SUPABASE_URL}/rest/v1/knock_codes?id=eq.${row.id}`, { method: "DELETE", headers: h }).catch(() => {});
    $("#gate").hidden = true; $("#app").hidden = false;
    startClubhouse(row.nick);
    try { localStorage.setItem("cc_nick", row.nick); } catch (e) {}
  } catch (e) {}
}
checkBroker();

// on-screen diagnostics so we can see runtime state without DevTools
try {
  const d = document.querySelector("#diag");
  if (d) d.textContent =
    "search=" + (location.search || "none") +
    " · hash=" + (location.hash || "none") +
    " · crypto=" + !!(window.crypto && window.crypto.subtle) +
    " · supabase=" + (typeof supabase !== "undefined") +
    " · opts=" + document.querySelectorAll("#nickPick option").length;
} catch (e) {}

async function enter() {
  const nick = $("#nickPick").value;
  let ok = false;
  try { ok = await passcodeOk($("#passInput").value); }
  catch (e) {
    // Never let a passcode-check exception silently swallow the click (the old
    // "buttons feel dead" symptom). Surface it and fall through to the error path.
    const d = $("#diag"); if (d) d.textContent = "passcode check threw: " + (e && e.message || e);
  }
  if (!ok) {
    const raw = $("#passInput").value;
    const err = $("#gateErr");
    if (err) {
      err.hidden = false;
      // Loud + diagnostic: a silent mismatch is the thing that wastes everyone's time.
      err.textContent = `nope — passcode didn't match (you entered ${raw.length} char${raw.length === 1 ? "" : "s"}). hit "skip" to come in anyway.`;
    }
    return;
  }
  $("#gate").hidden = true; $("#app").hidden = false;
  startClubhouse(nick);
  try { localStorage.setItem("cc_nick", nick); } catch (e) {}
}

// ---- channel shell ----
function startClubhouse(nick) {
  const me = GANG.find(g => g.nick === nick);
  $("#app").innerHTML = `
    <header>
      <div class="logo">3</div>
      <div>
        <h1>#claude-code-gang</h1>
        <div class="topic">Outstanding Alone. Better Together. · Claud3 is listening 🌲</div>
      </div>
      <button class="buddybtn" id="buddyBtn">buddies</button>
    </header>
    <div class="body-row">
      <div class="chan">
        <div class="log" id="log"></div>
        <div class="composer">
          <input id="msgInput" placeholder="message #claude-code-gang   (try: @Claud3 ...)" autocomplete="off">
          <button id="sendBtn">Send</button>
        </div>
      </div>
      <aside id="buddies"><h2 id="onlineHdr">Online — 0</h2><ul id="nicklist"></ul></aside>
    </div>`;
  $("#buddyBtn").addEventListener("click", () => $("#buddies").classList.toggle("show"));
  renderNicklist(new Set());           // draw roster (all offline) immediately
  renderedIds = new Set();             // fresh dedup set per entry
  connectSupabase(me);
}

// ---- supabase ----
function connectSupabase(me) {
  ME = me;
  sb = supabase.createClient(CLUBHOUSE_CONFIG.SUPABASE_URL, CLUBHOUSE_CONFIG.SUPABASE_ANON_KEY);
  loadHistory().then(subscribeRealtime).catch(showOffline);
  wireComposer();
}
function showOffline() {
  const log = $("#log");
  if (log) log.insertAdjacentHTML("beforeend",
    `<div class="line sys">— can't reach the clubhouse server (check config.js / CONNECT.md) —</div>`);
}

async function loadHistory() {
  const { data, error } = await sb.from("messages").select("*")
    .eq("room", CLUBHOUSE_CONFIG.ROOM_SLUG)
    .order("created_at", { ascending: true }).limit(200);
  if (error) throw error;
  (data || []).forEach(renderRow);
  scrollLog();
}

function subscribeRealtime() {
  channel = sb.channel("room:" + CLUBHOUSE_CONFIG.ROOM_SLUG,
    { config: { presence: { key: ME.nick } } });

  channel.on("postgres_changes",
    { event: "INSERT", schema: "public", table: "messages",
      filter: `room=eq.${CLUBHOUSE_CONFIG.ROOM_SLUG}` },
    (payload) => { renderRow(payload.new); scrollLog(); });

  setupPresence(channel);

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({ nick: ME.nick, at: Date.now() });
    }
  });

  // clean up the realtime channel on exit (avoid leaked connections vs the free-tier cap)
  window.addEventListener("beforeunload", () => { try { sb.removeChannel(channel); } catch (e) {} });
  // re-assert presence when the tab comes back to the foreground (fixes stale presence)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && channel) {
      try { channel.track({ nick: ME.nick, at: Date.now() }); } catch (e) {}
    }
  });
}

async function sendMessage(body) {
  const isAction = body.startsWith("/me ");
  const kind = isAction ? "act" : "msg";
  const text = isAction ? body.slice(4) : body;
  const { error } = await sb.from("messages").insert(
    { room: CLUBHOUSE_CONFIG.ROOM_SLUG, nick: ME.nick, kind, body: text });
  if (error) showOffline();
}

function wireComposer() {
  const send = () => {
    const v = $("#msgInput").value.trim();
    if (!v) return;
    $("#msgInput").value = "";
    sendMessage(v);
  };
  $("#sendBtn").addEventListener("click", send);
  $("#msgInput").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
}

// ---- presence ----
function setupPresence(ch) {
  ch.on("presence", { event: "sync" }, () => {
    renderNicklist(new Set(Object.keys(ch.presenceState())));
  });
}

function renderNicklist(online) {
  const ul = $("#nicklist");
  if (!ul) return;
  ul.innerHTML = "";
  ul.insertAdjacentHTML("beforeend",
    `<li class="bot"><span class="botav">3</span>Claud3 <span class="tag">bot</span></li>`);
  GANG.forEach(g => {
    const isOn = online.has(g.nick);
    ul.insertAdjacentHTML("beforeend", `
      <li class="${isOn ? '' : 'off'}">
        <img class="av" src="${g.avatar}" alt="${g.nick}">
        <span class="dot ${isOn ? 'online' : 'idle'}"></span>
        <span class="op">${g.op ? '@' : ''}</span>
        <span style="color:${g.color}">${g.nick}</span>
        <span class="real">${g.name}</span>
      </li>`);
  });
  const hdr = $("#onlineHdr");
  if (hdr) hdr.textContent = `Online — ${online.size}`;
}

// ---- rendering ----
function colorFor(nick) {
  const g = GANG.find(x => x.nick === nick);
  return g ? g.color : (nick === CLAUD3.nick ? CLAUD3.color : "#ccc");
}
function esc(s) {
  return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function scrollLog() { const l = $("#log"); if (l) l.scrollTop = l.scrollHeight; }

function renderRow(m) {
  const log = $("#log");
  if (!log) return;
  if (m.id) { if (renderedIds.has(m.id)) return; renderedIds.add(m.id); }  // dedup
  const div = document.createElement("div");
  const ts = new Date(m.created_at || Date.now())
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (m.kind === "sys") {
    div.className = "line sys"; div.textContent = `— ${m.body} —`;
  } else if (m.kind === "act") {
    div.className = "line act";
    div.innerHTML = `* <span style="color:${colorFor(m.nick)}">${esc(m.nick)}</span> ${esc(m.body)}`;
  } else {
    div.className = "line";
    const botCls = m.kind === "bot" ? "botnick" : "";
    const style = m.kind === "bot" ? "" : `style="color:${colorFor(m.nick)}"`;
    div.innerHTML =
      `<span class="ts">${ts}</span>` +
      `<span class="nick ${botCls}" ${style}>&lt;${esc(m.nick)}&gt;</span>` +
      `<span class="body">${esc(m.body)}</span>`;
  }
  log.appendChild(div);
}
