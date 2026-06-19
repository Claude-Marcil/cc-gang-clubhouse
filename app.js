// Claude Code Gang Clubhouse — frontend app
const $ = (s) => document.querySelector(s);

// ---- gate ----
GANG.forEach(g => {
  const o = document.createElement("option");
  o.value = g.nick; o.textContent = `${g.nick} (${g.name})`;
  $("#nickPick").appendChild(o);
});
// remember last nick
const lastNick = localStorage.getItem("cc_nick");
if (lastNick) $("#nickPick").value = lastNick;

$("#enterBtn").addEventListener("click", enter);
$("#passInput").addEventListener("keydown", e => { if (e.key === "Enter") enter(); });

async function enter() {
  const nick = $("#nickPick").value;
  if (!(await passcodeOk($("#passInput").value))) { $("#gateErr").hidden = false; return; }
  localStorage.setItem("cc_nick", nick);
  $("#gate").hidden = true; $("#app").hidden = false;
  startClubhouse(nick);
}

// ---- channel shell ----
function startClubhouse(nick) {
  const me = GANG.find(g => g.nick === nick);
  $("#app").innerHTML = `
    <header>
      <div class="logo">3</div>
      <div>
        <h1>#claude-code-gang</h1>
        <div class="topic">build cool stuff · don't dupe each other's work · Claud3 is listening 🌲</div>
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
  connectSupabase(me);
}

// ---- supabase ----
let sb, channel, ME;
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
