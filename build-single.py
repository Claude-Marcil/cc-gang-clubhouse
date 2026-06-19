#!/usr/bin/env python3
"""Collapse styles.css + config.js + gang.js + gate.js + app.js into ONE self-contained
index.html. Single resource => no separate cacheable files to go stale. A visible BUILD
stamp lets us confirm at a glance whether a browser is on the current version."""
import pathlib, re

BUILD = "8"
here = pathlib.Path(".")

styles = (here / "styles.css").read_text()
js_parts = []
for f in ["config.js", "gang.js", "gate.js", "app.js"]:
    js_parts.append(f"// ===== {f} =====\n" + (here / f).read_text())
combined_js = "\n\n".join(js_parts)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
<title>#claude-code-gang</title>
<style>
{styles}
.buildtag {{ position:fixed; bottom:6px; right:8px; z-index:99; font:11px ui-monospace,monospace;
  color:#6ee7a8; background:#000a; padding:2px 7px; border-radius:6px; pointer-events:none; }}
</style>
</head>
<body>
  <div id="gate" class="gate">
    <div class="gate-card">
      <div class="logo">3</div>
      <h1>#claude-code-gang</h1>
      <p>members only 🌲 · build {BUILD}</p>
      <select id="nickPick" aria-label="Who are you?"></select>
      <input id="passInput" type="password" placeholder="club passcode" autocomplete="off">
      <button id="enterBtn">Enter the clubhouse</button>
      <p id="gateErr" class="err" hidden>nope. try again.</p>
      <button id="skipBtn" style="background:#2a2f38;color:#cbd3dd;margin-top:8px;">skip — just let me in</button>
      <div id="diag" style="margin-top:14px;font:10px ui-monospace,monospace;color:#566;word-break:break-all;">⚠ script did not run</div>
    </div>
  </div>

  <div id="app" hidden></div>

  <div class="buildtag">build {BUILD}</div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
{combined_js}
  </script>
</body>
</html>
"""

(here / "index.html").write_text(html)
print(f"wrote single-file index.html (build {BUILD}, {len(html)//1024} KB)")
