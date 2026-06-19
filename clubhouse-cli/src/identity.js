// Cross-platform profile storage at ~/.config/clubhouse/profile.json
// (path.join + os.homedir() resolves correctly on macOS, Linux, and Windows).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function dir() { return join(homedir(), ".config", "clubhouse"); }
function file() { return join(dir(), "profile.json"); }

export function loadProfile() {
  try {
    if (!existsSync(file())) return null;
    return JSON.parse(readFileSync(file(), "utf8"));
  } catch { return null; }
}

export function saveProfile(profile) {
  mkdirSync(dir(), { recursive: true });
  writeFileSync(file(), JSON.stringify(profile, null, 2));
}

export function profilePath() { return file(); }
