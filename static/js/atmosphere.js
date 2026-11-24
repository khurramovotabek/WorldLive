// WorldLive — Atmosphere engine: season × time-of-day × climate × city
// Produces colour grading, particle weather and an ambience mix for the audio engine.
import { QUALITY } from "./core.js";

export const SEASONS = ["spring", "summer", "autumn", "winter"];
export const TODS = ["sunrise", "morning", "noon", "golden", "sunset", "evening", "night"];

// ---- colour grading per time of day ---------------------------------------
const GRADE = {
  sunrise: { soft: "rgba(255,170,120,.55)", over: "linear-gradient(180deg, rgba(255,150,120,.28), rgba(120,90,160,.08) 50%, rgba(40,20,60,.25))", filter: "brightness(.92) saturate(1.1) contrast(1.02)" },
  morning: { soft: "rgba(255,235,200,.35)", over: "linear-gradient(180deg, rgba(200,225,255,.12), transparent 60%)", filter: "brightness(1.02) saturate(1.05)" },
  noon: { soft: "rgba(255,255,255,.12)", over: "linear-gradient(180deg, rgba(160,200,255,.06), transparent)", filter: "brightness(1.05) saturate(1.08) contrast(1.04)" },
  golden: { soft: "rgba(255,190,90,.65)", over: "linear-gradient(180deg, rgba(255,190,110,.18), rgba(255,140,60,.12) 60%, rgba(60,30,10,.25))", filter: "brightness(1) saturate(1.18) contrast(1.05) sepia(.08)" },
  sunset: { soft: "rgba(255,120,80,.75)", over: "linear-gradient(180deg, rgba(110,60,140,.35), rgba(255,110,70,.22) 55%, rgba(40,10,20,.4))", filter: "brightness(.82) saturate(1.25) contrast(1.06)" },
  evening: { soft: "rgba(90,110,200,.65)", over: "linear-gradient(180deg, rgba(20,30,80,.55), rgba(60,50,120,.3) 55%, rgba(10,10,30,.55))", filter: "brightness(.62) saturate(.9) contrast(1.08) hue-rotate(-8deg)" },
  night: { soft: "rgba(40,70,160,.8)", over: "linear-gradient(180deg, rgba(4,8,30,.78), rgba(10,20,60,.5) 55%, rgba(0,0,10,.72))", filter: "brightness(.5) saturate(.8) contrast(1.12) hue-rotate(-12deg)" },
};
const SEASON_TINT = {
  spring: "saturate(1.06)", summer: "saturate(1.12) brightness(1.02)",
  autumn: "sepia(.18) saturate(1.1) hue-rotate(-6deg)", winter: "saturate(.78) brightness(1.04) hue-rotate(6deg)",
};

// ---- particle palettes --------------------------------------------------------
const P = {
  snow: { kind: "snow" }, snowHeavy: { kind: "snow", mult: 1.8 },
  rain: { kind: "rain" }, rainLight: { kind: "rain", mult: 0.45 }, rainTropical: { kind: "rain", mult: 1.7, slant: 0.35 },
  blossom: { kind: "petal", colors: ["#fff4f6", "#ffe1ea", "#fbd0dc"] },
  sakura: { kind: "petal", colors: ["#ffc6d6", "#ffb3c8", "#ffd9e4", "#ff9fbb"], mult: 1.6 },
  tulip: { kind: "petal", colors: ["#ff6b7d", "#ffd166", "#ff9bb0"], mult: 0.6 },
  alpineFlowers: { kind: "petal", colors: ["#ffffff", "#ffe27a", "#c9a8ff"], mult: 0.7 },
  leaves: { kind: "leaf", colors: ["#d9822b", "#c4512a", "#e8b04a", "#a8401f"] },
  momiji: { kind: "leaf", colors: ["#d6261c", "#ef4b2f", "#b5121b", "#f0832a"], mult: 1.3 },
  chinar: { kind: "leaf", colors: ["#e0a83a", "#c97b22", "#f2c55c"] },
  ginkgo: { kind: "leaf", colors: ["#f7d23e", "#f2c12e", "#ffe27a"], mult: 1.2 },
  larch: { kind: "leaf", colors: ["#e9b949", "#d99a2b"], mult: 0.6 },
  sand: { kind: "sand" }, sandSoft: { kind: "sand", mult: 0.4 },
  motes: { kind: "mote", colors: ["#fff3d6"] }, light: { kind: "mote", colors: ["#ffe8b8", "#ffffff"], mult: 0.6 },
  sparkle: { kind: "mote", colors: ["#ffffff", "#bff3ff"], mult: 0.8 },
  fireflies: { kind: "firefly" }, bokeh: { kind: "bokeh" },
};

/** City-aware profile. Returns everything the scene + audio need. */
export function profile(city, season, tod) {
  const c = city.climate, k = city.key, night = tod === "night" || tod === "evening";
  const out = { particles: [], aurora: false, stars: tod === "night", label: season, tod, amb: { wind: 0.12 } };
  const add = (...ps) => out.particles.push(...ps.map((p) => P[p]));

  // climate-correct seasons
  if (c === "tropical") {
    const wet = season === "summer" || season === "autumn"; // SW monsoon ≈ May–Nov
    out.label = wet ? "wet" : "dry";
    wet ? add("rainTropical") : add("sparkle");
    out.amb = { ocean: 0.75, rain: wet ? 0.7 : 0, wind: 0.15, birds: night ? 0 : 0.18, crickets: night ? 0.3 : 0 };
  } else if (c === "desert") {
    if (city.spiritual) { add("light"); out.amb = { wind: 0.16, birds: night ? 0 : 0.05 }; }
    else {
      season === "summer" ? add("sand") : season === "winter" ? add("sandSoft") : add("sandSoft");
      out.amb = { wind: season === "summer" ? 0.35 : 0.22, crickets: night ? 0.2 : 0, city: k === "dubai" ? 0.15 : 0 };
    }
    if (season === "winter" && night) out.stars = true;
  } else if (c === "mediterranean") {
    ({ spring: () => add("blossom"), summer: () => add("motes"), autumn: () => add("leaves"), winter: () => add("rainLight") })[season]();
    out.amb = { ocean: ["santorini", "sydney", "capetown", "sanfrancisco", "losangeles"].includes(k) ? 0.5 : 0, rain: season === "winter" ? 0.4 : 0, wind: 0.2, birds: night ? 0 : 0.25, crickets: season === "summer" && night ? 0.45 : 0, city: ["rome", "sanfrancisco", "losangeles", "sydney"].includes(k) ? 0.2 : 0 };
  } else if (c === "alpine") {
    const north = k === "iceland" || k === "alaska", snowy = ["everest", "alaska", "interlaken"].includes(k);
    const midnightSun = north && season === "summer";
    if (midnightSun && night) out.tod = "golden"; // the sun barely sets in Icelandic summer
    ({ spring: () => add(k === "everest" ? "snow" : north ? "rainLight" : "alpineFlowers"), summer: () => add(k === "everest" ? "snow" : "motes"), autumn: () => add(k === "everest" ? "snow" : north ? "rainLight" : k === "cusco" ? "motes" : "larch"), winter: () => add(k === "cusco" ? "rainLight" : "snowHeavy") })[season]();
    out.aurora = north && (season === "winter" || season === "autumn") && night;
    out.amb = { wind: snowy ? 0.5 : season === "winter" ? 0.45 : 0.25, water: ["iceland", "interlaken", "alaska"].includes(k) ? 0.35 : 0, birds: night || season === "winter" ? 0 : 0.3 };
  } else { // temperate
    const spring = { seoul: "sakura", kyoto: "sakura", istanbul: "tulip", tashkent: "blossom", samarkand: "blossom", paris: "blossom", beijing: "blossom", newyork: "blossom" }[k] || "blossom";
    const autumn = { seoul: "momiji", kyoto: "momiji", tashkent: "chinar", samarkand: "chinar", beijing: "ginkgo", cappadocia: "chinar" }[k] || "leaves";
    ({ spring: () => add(spring), summer: () => add(night ? "fireflies" : "motes"), autumn: () => add(autumn), winter: () => add(k === "istanbul" ? "rainLight" : "snow") })[season]();
    if (season === "spring" && (k === "paris" || k === "istanbul")) add("rainLight");
    out.amb = { wind: season === "autumn" || season === "winter" ? 0.3 : 0.15, rain: k === "istanbul" && season === "winter" ? 0.35 : season === "spring" && (k === "paris" || k === "istanbul") ? 0.2 : 0,
      birds: night || season === "winter" ? 0 : 0.32, crickets: season === "summer" && night ? 0.5 : 0, city: ["newyork", "paris", "istanbul", "tashkent", "beijing", "moscow", "seoul", "buenosaires", "sanfrancisco", "losangeles", "melbourne"].includes(k) ? 0.22 : 0.05, water: k === "istanbul" ? 0.25 : 0 };
  }
  if (night && ["paris", "newyork", "istanbul", "dubai", "tashkent", "moscow", "seoul", "kualalumpur", "singapore", "bangkok", "jakarta", "losangeles", "sanfrancisco", "sydney", "melbourne", "rio", "buenosaires"].includes(k)) add("bokeh");
  if (city.spiritual) out.amb.birds = Math.min(out.amb.birds || 0, 0.08);
  const g = GRADE[out.tod];
  out.grade = { ...g, filter: `${g.filter} ${SEASON_TINT[season] || ""}` };
  return out;
}

// ---- sprite cache ----------------------------------------------------------
const sprites = {};
function sprite(key, size, draw) {
  if (sprites[key]) return sprites[key];
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size); return (sprites[key] = c);
}
const glow = (color, size = 64) => sprite("g" + color + size, size, (x, s) => {
  if (color.length === 4) color = "#" + [...color.slice(1)].map((c) => c + c).join("");
  const r = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, color); r.addColorStop(0.35, color + "aa"); r.addColorStop(1, color + "00");
  x.fillStyle = r; x.fillRect(0, 0, s, s);
});
const petal = (color) => sprite("p" + color, 48, (x, s) => {
  x.translate(s / 2, s / 2); x.fillStyle = color; x.shadowColor = "rgba(0,0,0,.15)"; x.shadowBlur = 4;
  x.beginPath(); x.moveTo(0, -18); x.bezierCurveTo(14, -10, 12, 10, 0, 18); x.bezierCurveTo(-12, 10, -14, -10, 0, -18); x.fill();
  x.globalAlpha = 0.35; x.fillStyle = "#fff"; x.beginPath(); x.ellipse(-3, -4, 3, 8, -0.3, 0, 7); x.fill();
});
const leaf = (color) => sprite("l" + color, 64, (x, s) => {
  x.translate(s / 2, s / 2); x.fillStyle = color;
  x.beginPath(); x.moveTo(0, -26);
  x.bezierCurveTo(20, -18, 22, 8, 0, 26); x.bezierCurveTo(-22, 8, -20, -18, 0, -26); x.fill();
  x.strokeStyle = "rgba(60,20,0,.45)"; x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, -24); x.lineTo(0, 30); x.stroke();
  for (let i = -14; i < 18; i += 8) { x.beginPath(); x.moveTo(0, i); x.lineTo(10, i - 7); x.moveTo(0, i); x.lineTo(-10, i - 7); x.stroke(); }
});

// ---- particle canvas ---------------------------------------------------------
export class Weather {
  constructor(canvas) {
    this.cv = canvas; this.x = canvas.getContext("2d");
    this.parts = []; this.layers = []; this.stars = []; this.showStars = false; this.running = false;
    this.max = [45, 150, 280][QUALITY.tier];
    this.wind = 0; this.t = 0;
    this._resize = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5);
      this.w = canvas.clientWidth; this.h = canvas.clientHeight;
      canvas.width = this.w * d; canvas.height = this.h * d; this.x.setTransform(d, 0, 0, d, 0, 0);
      this.stars = Array.from({ length: Math.round(this.w * this.h / 9000) }, () => ({ x: Math.random() * this.w, y: Math.random() * this.h * 0.45, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6 }));
    };
    addEventListener("resize", this._resize); this._resize();
    this._loop = this._loop.bind(this);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && this.running) requestAnimationFrame(this._loop); });
  }
  set(layers, stars) { this.layers = layers; this.showStars = stars; }
  start() { if (this.running) return; this.running = true; this._last = performance.now(); requestAnimationFrame(this._loop); }
  stop() { this.running = false; this.x.clearRect(0, 0, this.w, this.h); this.parts = []; }

  _spawn(L) {
    const w = this.w, h = this.h, r = Math.random;
    const base = { L, x: r() * w * 1.2 - w * 0.1, y: -20, rot: r() * 6.28, vr: (r() - 0.5) * 2, life: 0 };
    switch (L.kind) {
      case "snow": { const z = r(); return { ...base, z, s: 2 + z * 5, vy: 30 + z * 70, vx: 0, img: glow("#ffffff", 32) }; }
      case "rain": { const z = r(); return { ...base, z, vy: 650 + z * 500, vx: 0, len: 10 + z * 18 }; }
      case "petal": { const z = r(); return { ...base, z, s: 9 + z * 12, vy: 35 + z * 45, vx: 20, img: petal(L.colors[(r() * L.colors.length) | 0]), flip: r() * 6 }; }
      case "leaf": { const z = r(); return { ...base, z, s: 16 + z * 18, vy: 45 + z * 55, vx: 30, img: leaf(L.colors[(r() * L.colors.length) | 0]), flip: r() * 6 }; }
      case "sand": return { ...base, x: -20, y: r() * h, z: r(), vy: (r() - 0.5) * 10, vx: 260 + r() * 300, s: 0.6 + r() * 1.4 };
      case "mote": return { ...base, y: r() * h, z: r(), vy: -6 - r() * 10, vx: (r() - 0.5) * 8, s: 6 + r() * 16, img: glow(L.colors[(r() * L.colors.length) | 0], 48), max: 8 + r() * 8 };
      case "firefly": return { ...base, x: r() * w, y: h * (0.45 + r() * 0.5), z: r(), vy: 0, vx: 0, s: 10 + r() * 10, img: glow("#d8ff7a", 48), max: 6 + r() * 6, ph: r() * 6 };
      case "bokeh": return { ...base, x: r() * w, y: h * (0.35 + r() * 0.6), z: r(), vy: -2, vx: 0, s: 30 + r() * 70, img: glow(["#ffcf8a", "#ffe6b8", "#ffb36b", "#9fc4ff"][(r() * 4) | 0], 96), max: 10 + r() * 10, ph: r() * 6 };
    }
  }
  _loop(now) {
    if (!this.running || document.hidden) return;
    const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now; this.t += dt;
    const { x, w, h } = this;
    this.wind = Math.sin(this.t * 0.25) * 0.6 + Math.sin(this.t * 0.71) * 0.3;
    x.clearRect(0, 0, w, h);
    if (this.showStars) {
      for (const s of this.stars) { x.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(this.t * 0.8 + s.p)); x.fillStyle = "#fff"; x.fillRect(s.x, s.y, s.r, s.r); }
      x.globalAlpha = 1;
    }
    // spawn toward target density per layer
    for (const L of this.layers) {
      const target = Math.round(this.max * (L.mult || 1) * (L.kind === "bokeh" ? 0.12 : L.kind === "firefly" ? 0.18 : L.kind === "mote" ? 0.25 : L.kind === "rain" ? 1.2 : 0.55));
      const have = this.parts.reduce((n, p) => n + (p.L === L), 0);
      for (let i = 0; i < Math.min(4, target - have); i++) this.parts.push(this._spawn(L));
    }
    const alive = [];
    for (const p of this.parts) {
      if (!this.layers.includes(p.L)) { p.fade = (p.fade ?? 1) - dt * 1.5; if (p.fade <= 0) continue; }
      p.life += dt;
      const k = p.L.kind;
      if (k === "rain") {
        const sl = (p.L.slant || 0.12) + this.wind * 0.05;
        p.x += p.vy * sl * dt; p.y += p.vy * dt;
        x.strokeStyle = `rgba(190,210,255,${(0.18 + p.z * 0.35) * (p.fade ?? 1)})`; x.lineWidth = 0.6 + p.z;
        x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.len * sl, p.y - p.len); x.stroke();
        if (p.y > h) { if (p.z > 0.7 && Math.random() < 0.3) { x.fillStyle = "rgba(200,220,255,.4)"; x.fillRect(p.x - 2, h - 3, 4, 1); } continue; }
      } else if (k === "sand") {
        p.x += p.vx * dt * (1 + this.wind * 0.3); p.y += p.vy * dt + Math.sin(p.life * 3) * 0.3;
        x.fillStyle = `rgba(235,200,150,${(0.2 + p.z * 0.4) * (p.fade ?? 1)})`; x.fillRect(p.x, p.y, p.s * 3, p.s);
        if (p.x > w + 20) continue;
      } else if (k === "mote" || k === "firefly" || k === "bokeh") {
        p.x += (p.vx + this.wind * 4) * dt + (k === "firefly" ? Math.sin(p.life * 1.3 + p.ph) * 0.6 : 0);
        p.y += p.vy * dt + (k === "firefly" ? Math.cos(p.life * 1.1 + p.ph) * 0.5 : 0);
        const a = Math.min(1, p.life / 2) * Math.min(1, (p.max - p.life) / 2) * (k === "firefly" ? 0.5 + 0.5 * Math.sin(p.life * 3 + p.ph) : k === "bokeh" ? 0.35 : 0.55) * (p.fade ?? 1);
        if (p.life > p.max) continue;
        x.globalAlpha = Math.max(0, a); x.globalCompositeOperation = "lighter";
        x.drawImage(p.img, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
      } else { // snow, petal, leaf — tumbling fall with wind sway
        const sway = Math.sin(p.life * (k === "snow" ? 1.2 : 1.8) + p.rot) * (k === "snow" ? 18 : 40);
        p.x += (sway + this.wind * (k === "snow" ? 25 : 70) + (p.vx || 0) * 0.3) * dt;
        p.y += p.vy * dt; p.rot += p.vr * dt;
        x.globalAlpha = (k === "snow" ? 0.55 + p.z * 0.45 : 0.9) * (p.fade ?? 1);
        if (k === "snow") x.drawImage(p.img, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
        else {
          x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.scale(Math.cos(p.life * 2 + p.flip), 1);
          x.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s); x.restore();
        }
        x.globalAlpha = 1;
        if (p.y > h + 30) continue;
      }
      alive.push(p);
    }
    this.parts = alive;
    requestAnimationFrame(this._loop);
  }
}
