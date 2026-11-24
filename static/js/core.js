// static root of this build (…/static/v/<build>/), derived from where this module was loaded
export const STATIC = new URL("../", import.meta.url).href;
// WorldLive — shared core: store, API, geo + solar maths, DOM helpers
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const flag = (cc) => cc ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "";
export const store = {
  get(k, d) { try { const v = localStorage.getItem("wl." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("wl." + k, JSON.stringify(v)); } catch {} },
};

export const TZ = { UZ: "Asia/Tashkent", TR: "Europe/Istanbul", FR: "Europe/Paris", SA: "Asia/Riyadh", MV: "Indian/Maldives",
  JP: "Asia/Tokyo", CH: "Europe/Zurich", AE: "Asia/Dubai", EG: "Africa/Cairo", GR: "Europe/Athens", IT: "Europe/Rome",
  IS: "Atlantic/Reykjavik", US: "America/New_York", JO: "Asia/Amman", CN: "Asia/Shanghai", RU: "Europe/Moscow", KR: "Asia/Seoul",
  MY: "Asia/Kuala_Lumpur", PK: "Asia/Karachi", BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires", PE: "America/Lima",
  MX: "America/Merida", NP: "Asia/Kathmandu", HT: "America/Port-au-Prince", ID: "Asia/Jakarta", AU: "Australia/Sydney",
  ZA: "Africa/Johannesburg", MA: "Africa/Casablanca", KE: "Africa/Nairobi", SG: "Asia/Singapore", TH: "Asia/Bangkok", IN: "Asia/Kolkata" };
// accepts a country code, an IANA zone, or a city object ({ iana, country }) — the US alone spans five zones
const zoneOf = (z) => (z && typeof z === "object" ? z.iana || TZ[z.country] : String(z || "").includes("/") ? z : TZ[z]);
export const timeIn = (cc, d = new Date()) => {
  try { return d.toLocaleTimeString("en-GB", { timeZone: zoneOf(cc), hour: "2-digit", minute: "2-digit" }); } catch { return "--:--"; }
};
export const hourIn = (cc, d = new Date()) => {
  try {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: zoneOf(cc), hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
    return +p.find((x) => x.type === "hour").value + +p.find((x) => x.type === "minute").value / 60;
  } catch { return d.getHours(); }
};

// ---- geo -----------------------------------------------------------------
const R = 6371, rad = Math.PI / 180;
export function distanceKm(a, b) {
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
// point at fraction t along the great circle a → b
export function greatCircle(a, b, t) {
  const φ1 = a.lat * rad, λ1 = a.lng * rad, φ2 = b.lat * rad, λ2 = b.lng * rad;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (d < 1e-9) return { lat: a.lat, lng: a.lng };
  const A = Math.sin((1 - t) * d) / Math.sin(d), B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  return { lat: Math.atan2(z, Math.hypot(x, y)) / rad, lng: Math.atan2(y, x) / rad };
}
// realistic block time: ~830 km/h cruise + 35 min taxi/climb/descent
export const flightMinutes = (km) => Math.round(km / 830 * 60 + 35);
export const fmtDur = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;

// ---- sun (NOAA simplified) -------------------------------------------------
// returns subsolar point {lat,lng} for a date — drives the globe terminator
export function subsolar(date = new Date()) {
  const d = date.getTime() / 864e5 + 2440587.5 - 2451545.0; // days since J2000
  const g = (357.529 + 0.98560028 * d) * rad;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
  const e = (23.439 - 0.00000036 * d) * rad;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  let lng = (ra / rad - gmst * 15) % 360;
  if (lng > 180) lng -= 360; if (lng < -180) lng += 360;
  return { lat: dec / rad, lng };
}
// solar elevation in degrees at a place
export function sunElevation(lat, lng, date = new Date()) {
  const s = subsolar(date);
  const φ = lat * rad, δ = s.lat * rad, H = (lng - s.lng) * rad;
  return Math.asin(Math.sin(φ) * Math.sin(δ) + Math.cos(φ) * Math.cos(δ) * Math.cos(H)) / rad;
}
export function todFromSun(lat, lng, date = new Date()) {
  const e = sunElevation(lat, lng, date);
  const later = sunElevation(lat, lng, new Date(date.getTime() + 6e5));
  const rising = later > e;
  if (e < -8) return "night";
  if (e < 0) return rising ? "sunrise" : "evening";
  if (e < 7) return rising ? "sunrise" : "sunset";
  if (e < 16) return rising ? "morning" : "golden";
  return e > 45 || !rising ? "noon" : "morning";
}
export function seasonNow(lat, date = new Date()) {
  const m = date.getMonth();
  const north = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "autumn", "autumn", "autumn", "winter"][m];
  if (lat >= 0) return north;
  return { winter: "summer", summer: "winter", spring: "autumn", autumn: "spring" }[north];
}

// ---- API -------------------------------------------------------------------
const csrf = () => (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || "";
export async function api(path, opts = {}) {
  const init = { method: opts.method || (opts.body || opts.form ? "POST" : "GET"), headers: { "X-CSRFToken": csrf() } };
  if (opts.body) { init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(opts.body); }
  if (opts.form) init.body = opts.form;
  const r = await fetch("/api/" + path, init);
  if (!r.ok) throw new Error(await r.text() || r.statusText);
  return r.json();
}
// upload with progress (fetch has no upload progress)
export function upload(path, form, onProgress) {
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/api/" + path);
    x.setRequestHeader("X-CSRFToken", csrf());
    x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    x.onload = () => (x.status < 300 ? res(JSON.parse(x.responseText)) : rej(new Error(x.responseText)));
    x.onerror = () => rej(new Error("network"));
    x.send(form);
  });
}

// ---- tiny event bus ---------------------------------------------------------
const bus = new EventTarget();
export const on = (n, fn) => bus.addEventListener(n, (e) => fn(e.detail));
export const emit = (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d }));

export function toast(msg) {
  const el = h(`<div class="toast glass dense pill">${esc(msg)}</div>`);
  document.body.append(el);
  setTimeout(() => el.remove(), 4200);
}
// pointer-following specular highlight on glass
export function glassLight() {
  let raf = 0, ev;
  addEventListener("pointermove", (e) => {
    ev = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const g = ev.target.closest?.(".glass");
      if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", ((ev.clientX - r.left) / r.width) * 100 + "%");
      g.style.setProperty("--my", ((ev.clientY - r.top) / r.height) * 100 + "%");
    });
  }, { passive: true });
}
// quality tier for adaptive rendering
export const QUALITY = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const tier = reduce ? 0 : cores >= 8 && mem >= 8 && !small ? 2 : 1;
  return { tier, reduce, dpr: Math.min(devicePixelRatio || 1, small && !reduce ? 2 : tier === 2 ? 1.75 : 1.25), small };
})();
