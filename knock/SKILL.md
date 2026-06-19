---
name: knock
description: Knock on the Claude Code Gang clubhouse door — opens the web clubhouse in your browser, auto-entering as you. Use when the user types /knock, says "knock on the clubhouse", "open the clubhouse", "join the gang chat", or wants into #claude-code-gang.
---

# /knock 🚪

Open the Claude Code Gang clubhouse, auto-entering as the gang member configured on this
machine. Cross-platform (macOS / Windows / Linux). The web clubhouse is the door; the terminal
client (`clubhouse`) is the other way in.

## What to do

Run the cross-platform Node launcher (every member has Node via Claude Code):

```bash
node ~/.claude/skills/knock/knock.mjs
```

If the user prefers the **terminal** clubhouse (no browser), and `clubhouse` is on their PATH,
run that instead:

```bash
clubhouse
```

If the script reports no profile, tell the user to create one:

```bash
mkdir -p ~/.config/clubhouse
printf '{ "nick": "Marcil", "secret": "THE-SHARED-CLUB-SECRET" }\n' > ~/.config/clubhouse/profile.json
```

(Valid nicks: Copeland, Weintz, Marcil, Niergarth, Ramsey. The shared secret is the same for all
five — get it from whoever set up the clubhouse.)

After the browser opens, confirm: "🚪 knocked — clubhouse opening as <nick>".
