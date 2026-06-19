---
name: knock
description: Knock on the Claude Code Gang clubhouse door — opens the web clubhouse in your browser, auto-entering as you. Use when the user types /knock, says "knock on the clubhouse", "open the clubhouse", "join the gang chat", or wants into #claude-code-gang.
---

# /knock 🚪

Open the Claude Code Gang clubhouse, auto-entering as the gang member configured on this
machine. The clubhouse is terminal-only — this is the door.

## What to do

Run the knock script (it reads your local profile and opens the browser):

```bash
bash ~/.claude/skills/knock/knock.sh
```

If the script reports no profile, tell the user to create one:

```bash
mkdir -p ~/.config/clubhouse
cat > ~/.config/clubhouse/profile.json <<'EOF'
{ "nick": "Marcil", "secret": "THE-SHARED-CLUB-SECRET" }
EOF
```

(Valid nicks: Copeland, Weintz, Marcil, Neirgarth, Ramsey. The shared secret is the same
for all five — get it from whoever set up the clubhouse.)

After the browser opens, confirm to the user: "🚪 knocked — clubhouse opening as <nick>".
