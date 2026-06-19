// Members-only gate. Light "club door," not hardened auth (no sensitive data lives here).
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
// Forgiving normalize: trims surrounding whitespace AND any stray inner spaces
// (autocomplete/keyboards can sneak in a trailing space or a leading capital), then
// lowercases. The passcode is a velvet rope, not a credential — being lenient here
// costs nothing and kills the "I typed it right and nothing happened" class of bug.
function normPass(s) { return String(s == null ? "" : s).trim().replace(/\s+/g, "").toLowerCase(); }
async function passcodeOk(entered) {
  // Plain comparison — avoids crypto.subtle (undefined in some contexts) entirely.
  if (window.CLUBHOUSE_CONFIG.PASSCODE != null) {
    return normPass(entered) === normPass(window.CLUBHOUSE_CONFIG.PASSCODE);
  }
  // Fallback to hash if a plain passcode isn't configured.
  try { return (await sha256Hex(normPass(entered))) === window.CLUBHOUSE_CONFIG.PASSCODE_HASH; }
  catch (e) { return false; }
}
window.sha256Hex = sha256Hex;
window.passcodeOk = passcodeOk;
