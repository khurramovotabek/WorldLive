// WorldLive — real prayer times for Makkah and Madinah, computed on the device.
// Astronomical method (as in PrayTimes.org) with the Umm al-Qura convention used in Saudi Arabia:
//   Fajr: sun 18.5° below the horizon · Dhuhr: solar noon (+1 min) · Asr: shadow = object + 1 (standard)
//   Maghrib: sunset · Isha: 90 minutes after Maghrib (120 during Ramadan).
// Times are returned in the city's own local time (Arabia Standard Time, UTC+3, no DST).

const rad = Math.PI / 180, deg = 180 / Math.PI;
const sin = (d) => Math.sin(d * rad), cos = (d) => Math.cos(d * rad), tan = (d) => Math.tan(d * rad);
const asin = (x) => Math.asin(x) * deg, acos = (x) => Math.acos(x) * deg, atan2 = (y, x) => Math.atan2(y, x) * deg;
const acot = (x) => Math.atan(1 / x) * deg;
const fix = (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; };

export const PRAYERS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
export const PRAYER_NAMES = {
  uz: { fajr: "Bomdod", sunrise: "Quyosh", dhuhr: "Peshin", asr: "Asr", maghrib: "Shom", isha: "Xufton" },
  en: { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
  ru: { fajr: "Фаджр", sunrise: "Восход", dhuhr: "Зухр", asr: "Аср", maghrib: "Магриб", isha: "Иша" },
};

function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function sun(jd) {
  const D = jd - 2451545.0, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * D;
  const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
  return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
}

/** Islamic (Umm al-Qura-ish) month check for Ramadan — Intl gives us the calendar for free. */
function isRamadan(date) {
  try { return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric" }).format(date) === "9"; } catch { return false; }
}

/**
 * Prayer times for one civil day at (lat, lng) in a fixed UTC offset `tz` (hours).
 * Returns { fajr: Date, sunrise: Date, ... } as real instants.
 */
export function prayerTimes(lat, lng, tz, date = new Date()) {
  // the civil date *in that city*
  const local = new Date(date.getTime() + tz * 3600e3);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, d = local.getUTCDate();
  const jd = julian(y, m, d) - lng / (15 * 24);
  const at = (h) => { const s = sun(jd + h / 24); return s; };
  const noon = (h) => fix(12 - at(h).eqt, 24);
  const angleTime = (angle, h, ccw) => {
    const { decl } = at(h);
    const T = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
    return noon(h) + (ccw ? -T : T);
  };
  const asrTime = (factor, h) => { const { decl } = at(h); return angleTime(-acot(factor + tan(Math.abs(lat - decl))), h); };
  // two passes for accuracy (first guess at fixed hours, then refine)
  let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18 };
  for (let pass = 0; pass < 2; pass++) {
    t = {
      fajr: angleTime(18.5, t.fajr / 24 * 24, true),
      sunrise: angleTime(0.833, t.sunrise, true),
      dhuhr: noon(t.dhuhr),
      asr: asrTime(1, t.asr),
      maghrib: angleTime(0.833, t.maghrib),
    };
  }
  t.dhuhr += 1 / 60;
  t.isha = t.maghrib + (isRamadan(local) ? 2 : 1.5);
  // local solar hours → real instants
  const base = Date.UTC(y, m - 1, d) - tz * 3600e3;
  const out = {};
  for (const k of PRAYERS) out[k] = new Date(base + (t[k] + tz - lng / 15) * 3600e3);
  return out;
}

/** The next prayer (skipping sunrise) after `now`, looking into tomorrow if needed. */
export function nextPrayer(city, now = new Date()) {
  const tz = city.tz ?? 3;
  for (const day of [0, 1]) {
    const t = prayerTimes(city.lat, city.lng, tz, new Date(now.getTime() + day * 86400e3));
    for (const k of PRAYERS) if (k !== "sunrise" && t[k] > now) return { key: k, at: t[k], times: day ? null : t };
  }
  return null;
}

/** "17:42" in the city's own time */
export const clockIn = (d, tz = 3) => new Date(d.getTime() + tz * 3600e3).toISOString().slice(11, 16);
