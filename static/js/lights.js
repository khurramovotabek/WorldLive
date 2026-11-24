// WorldLive — night lights over the real photo of a place
// • every city at evening / night: warm street-light bokeh and windows that come alive
// • landmark towers light up: a soft column of light plus their own signature —
//   the Eiffel Tower sparkles (in Paris it sparkles for 5 minutes at the top of every hour after dusk),
//   Tashkent Tower glows in shifting colours, Burj Khalifa / Petronas / N Seoul / Empire State shine
// Light-weight: one canvas, animated only while it is visible.

const TOWERS = {
  "eiffel-tower": { col: [255, 196, 110], sparkle: true },
  "tashkent-tower": { col: [120, 190, 255], rainbow: true },
  "burj-khalifa": { col: [200, 220, 255], sparkle: true },
  "n-seoul-tower": { col: [255, 140, 200], rainbow: true },
  "empire-state-building": { col: [255, 210, 140] },
  "petronas-towers": { col: [210, 230, 255] },
  "galata-tower": { col: [255, 190, 120] },
  "marina-bay-sands": { col: [255, 230, 180] },
  "cathedral-of-christ-the-saviour": { col: [255, 215, 150] },
  "sydney-opera-house": { col: [255, 235, 210] },
};
export const towerOf = (id) => TOWERS[id] || null;

export class NightLights {
  constructor(root) {
    this.cv = document.createElement("canvas"); this.cv.className = "nightfx";
    root.append(this.cv);
    this.x = this.cv.getContext("2d"); this.on = false; this.raf = 0; this.dots = []; this.win = [];
    addEventListener("resize", () => this.on && this._size());
  }
  _size() {
    const d = Math.min(2, devicePixelRatio || 1); this.W = innerWidth; this.H = innerHeight;
    this.cv.width = this.W * d; this.cv.height = this.H * d; this.x.setTransform(d, 0, 0, d, 0, 0);
  }
  /** tod: the scene's part of day; place: current attraction id; city key for colour mood */
  set({ tod, place, sparkleNow = false }) {
    const night = tod === "night" || tod === "evening" || tod === "sunset";
    this.level = tod === "night" ? 1 : tod === "evening" ? 0.8 : tod === "sunset" ? 0.35 : 0;
    this.tower = night ? towerOf(place) : null;
    this.sparkleNow = sparkleNow;
    if (!night) { this.stop(); return; }
    if (place !== this.place) { this.place = place; this._seed(); }
    if (!this.on) { this.on = true; this._size(); this.cv.classList.add("on"); this._loop(); }
  }
  stop() { this.on = false; cancelAnimationFrame(this.raf); this.cv.classList.remove("on"); }
  _seed() {
    const r = mulberry(hash(this.place || "x"));
    // street lights: lower part of the frame, more towards the horizon
    this.dots = Array.from({ length: 90 }, () => ({ x: r(), y: 0.55 + Math.pow(r(), 0.7) * 0.42, s: 1.5 + r() * 4, ph: r() * 6.28, sp: 0.4 + r() * 1.4, warm: r() > 0.25 }));
    // lit windows: small rectangles in the middle band
    this.win = Array.from({ length: 60 }, () => ({ x: r(), y: 0.45 + r() * 0.3, w: 2 + r() * 4, h: 3 + r() * 5, on: r() > 0.35, t: r() * 20 }));
    // sparkles on a tower silhouette (a tapered band around the centre of the photo)
    this.spk = Array.from({ length: 160 }, () => { const v = r(); return { y: 0.12 + v * 0.62, x: 0.5 + (r() - 0.5) * (0.04 + v * 0.2), ph: r() * 6.28 }; });
  }
  _loop() {
    if (!this.on) return;
    this.raf = requestAnimationFrame(() => this._loop());
    const { x, W, H } = this, T = performance.now() / 1000, L = this.level;
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = "lighter";
    // windows
    for (const w of this.win) {
      const flick = w.on ? 1 : (Math.sin(T * 0.3 + w.t) > 0.85 ? 1 : 0);
      if (!flick) continue;
      x.fillStyle = `rgba(255,${200 + (w.t % 40)},140,${0.16 * L})`; x.fillRect(w.x * W, w.y * H, w.w, w.h);
    }
    // street-light bokeh
    for (const d of this.dots) {
      const a = (0.35 + 0.35 * Math.sin(T * d.sp + d.ph)) * L, R = d.s * (1 + d.y);
      const g = x.createRadialGradient(d.x * W, d.y * H, 0, d.x * W, d.y * H, R * 3);
      g.addColorStop(0, d.warm ? `rgba(255,190,110,${a})` : `rgba(170,200,255,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.beginPath(); x.arc(d.x * W, d.y * H, R * 3, 0, 6.283); x.fill();
    }
    // the landmark tower
    const tw = this.tower;
    if (tw) {
      let [r, g, b] = tw.col;
      if (tw.rainbow) { const h = (T * 18) % 360; [r, g, b] = hsl(h, 0.75, 0.62); }
      const col = x.createLinearGradient(W / 2, H * 0.08, W / 2, H * 0.8);
      col.addColorStop(0, `rgba(${r},${g},${b},0)`); col.addColorStop(0.35, `rgba(${r},${g},${b},${0.22 * L})`); col.addColorStop(1, `rgba(${r},${g},${b},${0.06 * L})`);
      x.fillStyle = col; x.beginPath(); x.moveTo(W * 0.48, H * 0.08); x.lineTo(W * 0.52, H * 0.08); x.lineTo(W * 0.64, H * 0.8); x.lineTo(W * 0.36, H * 0.8); x.closePath(); x.fill();
      // beacon at the top
      const bA = 0.5 + 0.5 * Math.sin(T * 2.2);
      const bg = x.createRadialGradient(W / 2, H * 0.1, 0, W / 2, H * 0.1, 40); bg.addColorStop(0, `rgba(${r},${g},${b},${0.7 * bA * L})`); bg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = bg; x.beginPath(); x.arc(W / 2, H * 0.1, 40, 0, 6.283); x.fill();
      // the sparkle — thousands of flashing bulbs, here a few hundred white glints
      if (tw.sparkle && this.sparkleNow) {
        for (const s of this.spk) {
          if (Math.sin(T * 23 + s.ph * 9) < 0.55) continue;
          const sx = s.x * W, sy = s.y * H, R = 1.2 + Math.random() * 2.2;
          x.fillStyle = `rgba(255,255,255,${0.9 * L})`; x.beginPath(); x.arc(sx, sy, R, 0, 6.283); x.fill();
          x.fillStyle = `rgba(255,255,255,${0.25 * L})`; x.fillRect(sx - R * 4, sy - 0.4, R * 8, 0.8); x.fillRect(sx - 0.4, sy - R * 4, 0.8, R * 8);
        }
      }
    }
    x.globalCompositeOperation = "source-over";
  }
}
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hsl(h, s, l) { const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round); }
