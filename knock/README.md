# /knock — the terminal door to the clubhouse 🚪

The Claude Code Gang clubhouse is **terminal-only**. You get in by knocking from Claude Code.

## Install (each gang member, once)

1. Copy the skill into your Claude Code skills dir:
   ```bash
   cp -r knock ~/.claude/skills/knock
   chmod +x ~/.claude/skills/knock/knock.sh
   ```
2. Create your profile:
   ```bash
   mkdir -p ~/.config/clubhouse
   cp ~/.claude/skills/knock/profile.example.json ~/.config/clubhouse/profile.json
   # edit it: set your nick (Copeland|Weintz|Marcil|Neirgarth|Ramsey) and the shared secret
   ```

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
