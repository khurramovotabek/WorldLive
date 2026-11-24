// WorldLive — lightweight step tracker → /api/track (batched, sendBeacon on exit).
import { getLang } from "./i18n.js";

const KEY = "wl.did";
let did;
try { did = localStorage.getItem(KEY); if (!did) { did = crypto.randomUUID(); localStorage.setItem(KEY, did); } }
catch { did = crypto.randomUUID?.() || "00000000-0000-4000-8000-" + String(Date.now()).slice(-12).padStart(12, "0"); }

const q = [];
let ctx = { journey: null, role: null, name: null }, timer = null, last = "";

export function trackContext(c) { Object.assign(ctx, c); }

/** track("place", { city, place, ...extra }) — identical consecutive steps are collapsed. */
export function track(k, { city, place, d: extra, ...rest } = {}) {
  const d = { ...rest, ...(extra || {}) };
  const sig = k + "|" + city + "|" + place + "|" + JSON.stringify(d);
  if (sig === last && k !== "music") return;
  last = sig;
  q.push({ k, city, place, d, t: Date.now() });
  if (q.length >= 20) flush(); else if (!timer) timer = setTimeout(flush, 4000);
}

function payload() {
  return JSON.stringify({
    did, ...ctx, lang: getLang(), events: q.splice(0, 40),
    screen: `${screen.width}x${screen.height}@${devicePixelRatio || 1}`,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  });
}
export function flush(beacon) {
  clearTimeout(timer); timer = null;
  if (!q.length && !beacon) return;
  const body = payload();
  if (beacon && navigator.sendBeacon) return navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}
addEventListener("pagehide", () => { track("leave"); flush(true); });
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(true); });
