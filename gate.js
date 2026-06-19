// Members-only gate. Light "club door," not hardened auth (no sensitive data lives here).
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function passcodeOk(entered) {
  // Plain comparison — avoids crypto.subtle (undefined in some contexts) entirely.
  if (window.CLUBHOUSE_CONFIG.PASSCODE != null) {
    return entered === window.CLUBHOUSE_CONFIG.PASSCODE;
  }
  // Fallback to hash if a plain passcode isn't configured.
  try { return (await sha256Hex(entered)) === window.CLUBHOUSE_CONFIG.PASSCODE_HASH; }
  catch (e) { return false; }
}
window.sha256Hex = sha256Hex;
window.passcodeOk = passcodeOk;
