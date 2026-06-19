# /knock — the terminal door to the clubhouse 🚪

Two ways into the Claude Code Gang clubhouse:
- **Web door (easiest):** open https://claude-marcil.github.io/cc-gang-clubhouse/, pick your name,
  passcode `treehouse` (or hit "skip"). Nothing to install.
- **`/knock` (one-click, optional):** install this skill once (below), then type `/knock` in Claude
  Code — your browser opens straight into `#claude-code-gang`, already signed in as you.

## Install (each gang member, once)

You're a collaborator on the private repo, so this is fully self-serve.

1. Clone the clubhouse repo (uses your accepted GitHub invite):
   ```bash
   gh repo clone Claude-Marcil/cc-gang-clubhouse
   cd cc-gang-clubhouse
   ```
   (No `gh`? `git clone https://github.com/Claude-Marcil/cc-gang-clubhouse.git` works too.)
2. Copy the skill into your Claude Code skills dir:
   ```bash
   cp -r knock ~/.claude/skills/knock
   chmod +x ~/.claude/skills/knock/knock.sh
   ```
3. Create your profile (set YOUR nick — Copeland|Weintz|Marcil|Neirgarth|Ramsey — and the shared secret from Mike):
   ```bash
   mkdir -p ~/.config/clubhouse
   cp ~/.claude/skills/knock/profile.example.json ~/.config/clubhouse/profile.json
   # then edit ~/.config/clubhouse/profile.json
   ```
4. **Restart Claude Code** — skills only register at session start, so `/knock` won't show up until you reload.

## Use

In Claude Code, type **`/knock`**. Your browser opens straight into `#claude-code-gang`,
already signed in as you. No passcode, no dropdown.

## How the door works

`/knock` reads your nick + the shared club secret, computes a rotating code
(`HMAC-SHA256(secret, 5-min window)`), and opens the clubhouse URL with `#nick=&code=`.
The web page verifies that code against the n8n knock-verifier (which holds the secret
server-side — it never lives in the browser). No valid knock → no entry.

> Until the n8n knock-verifier is wired (see ../CONNECT.md §E), the web door accepts any
> knock from a known nick (velvet rope). Wiring the verifier turns it into a real lock.
