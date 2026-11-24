// WorldLive — Music module
// • Original generative score (Web Audio) per city mood, reshaped live by season + time of day
// • User uploads (server-side, shared by both travellers), tagged by city / season
// • Playlist queue, library filters, crossfade, shuffle / repeat, smart auto-selection
// • Procedural nature ambience mixer (rain, wind, ocean, water, birds, crickets, city)
// • Visualiser + MediaSession (lock-screen controls)
// • Popular songs: curated per-city catalogue played audio-only through Spotify's official embed
//   (full tracks for Spotify listeners, 30 s previews otherwise) + couples can add their own Spotify links
import { $, $$, api, esc, h, store, toast, upload } from "./core.js";
import { L, getLang, onLang, t } from "./i18n.js";
import { ADHAN, CITY_CAT, SILENT_CITIES, SONG_CATS, SONGS } from "./songs.js";

// ---- one song, one entry: normalise "Artist — Title" so a song never appears twice
// (same Spotify id, or same artist + title written slightly differently)
const norm = (x = "") => x.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[‘’ʻʼ`']/g, "")
  .replace(/\(.*?\)|\[.*?\]|\b(feat|ft)\.?\s.*$|-\s*(remaster(ed)?|live|official).*$/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
export const songKey = (s) => `${norm((s.artist || "").split(/[&,x×]| and | va /)[0])}|${norm(s.title)}`;
export function uniqueSongs(list) {
  const seenSp = new Set(), seenKey = new Set(), out = [];
  for (const s of list) {
    const k = songKey(s), sp = s.sp || null;
    if ((sp && seenSp.has(sp)) || (s.artist && s.artist !== "Spotify" && seenKey.has(k))) continue;
    if (sp) seenSp.add(sp); seenKey.add(k); out.push(s);
  }
  return out;
}
import { track } from "./track.js";
import { PRAYER_NAMES, clockIn, nextPrayer } from "./prayer.js";

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const MOODS = {
  silk:    { name: "Silk Road Dusk",   root: 50, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 76, lead: "pluck", drone: true, pad: 0.5, density: 0.55, hue: 32 },
  maqam:   { name: "Bosphorus Maqam",  root: 50, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 70, lead: "qanun", drone: true, pad: 0.35, density: 0.6, hue: 12 },
  romance: { name: "Seine Nocturne",   root: 53, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 64, lead: "piano", drone: false, pad: 0.8, density: 0.5, hue: 330,
             prog: [[0, 2, 4, 6], [5, 0, 2, 4], [3, 5, 0, 2], [4, 6, 1, 3]] },
  ocean:   { name: "Lagoon Drift",     root: 52, scale: [0, 2, 4, 6, 7, 9, 11], bpm: 82, lead: "marimba", drone: false, pad: 0.7, density: 0.5, hue: 185,
             prog: [[0, 2, 4], [1, 3, 5], [4, 6, 1], [0, 2, 4]] },
  zen:     { name: "Kyoto Garden",     root: 57, scale: [0, 1, 5, 7, 8], bpm: 58, lead: "koto", drone: true, pad: 0.25, density: 0.32, hue: 350 },
  alpine:  { name: "Alpine Hush",      root: 55, scale: [0, 2, 4, 7, 9], bpm: 56, lead: "bell", drone: false, pad: 0.75, density: 0.35, hue: 205,
             prog: [[0, 1, 2], [3, 4, 0], [1, 2, 4], [0, 2, 3]] },
  desert:  { name: "Desert Stars",     root: 49, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 62, lead: "oud", drone: true, pad: 0.3, density: 0.45, hue: 38 },
  aurora:  { name: "Aurora Veil",      root: 47, scale: [0, 2, 3, 7, 10], bpm: 48, lead: "bell", drone: false, pad: 1, density: 0.25, hue: 150,
             prog: [[0, 2, 3], [1, 3, 4], [2, 4, 0], [0, 1, 3]] },
  city:    { name: "Midnight Avenue",  root: 45, scale: [0, 3, 5, 7, 10], bpm: 78, lead: "keys", drone: false, pad: 0.65, density: 0.45, hue: 260, hats: true,
             prog: [[0, 1, 2, 4], [3, 4, 0, 1], [2, 3, 4, 1], [1, 2, 4, 0]] },
};
const SEASON_MOD = { spring: { b: 0.12, d: 0.08, tm: 1.04 }, summer: { b: 0.1, d: 0.12, tm: 1.07 }, autumn: { b: -0.1, d: -0.05, tm: 0.95 }, winter: { b: -0.16, d: -0.14, tm: 0.9 } };
const TOD_MOD = { sunrise: { b: 0.05, tm: 0.97 }, morning: { b: 0.1, tm: 1 }, noon: { b: 0.12, tm: 1.03 }, golden: { b: 0.02, tm: 0.98 }, sunset: { b: -0.05, tm: 0.95 }, evening: { b: -0.15, tm: 0.92 }, night: { b: -0.26, tm: 0.86 } };

const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 6.2v11.6a.8.8 0 0 0 1.2.7l8.6-5.8a.8.8 0 0 0 0-1.4L6.2 5.5a.8.8 0 0 0-1.2.7z"/><rect x="16.5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.2v11.6a.8.8 0 0 1-1.2.7l-8.6-5.8a.8.8 0 0 1 0-1.4l8.6-5.8a.8.8 0 0 1 1.2.7z"/><rect x="5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h11M4 12h11M4 17h7"/><circle cx="18" cy="16.5" r="2.5"/><path d="M20.5 16.5V7l-3 1"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h3.5c2 0 3-1 4.3-3l2.4-4c1.3-2 2.3-3 4.3-3H21M18 4l3 3-3 3M3 7h3.5c1.4 0 2.3.5 3.1 1.4M21 17h-3.5c-1.4 0-2.3-.5-3.1-1.4M18 14l3 3-3 3"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  heartOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  sp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.7-6.9-2.2-10.2-1.2a.8.8 0 1 1-.4-1.5c3.7-1.1 8.3-.6 11.4 1.4.3.2.4.7.2 1zm.1-2.8C14.6 9 9.4 8.8 6.3 9.7a.9.9 0 1 1-.5-1.7c3.5-1.1 9.3-.9 13 1.3a.9.9 0 0 1-.9 1.6z"/></svg>',
  vol0: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fill-opacity=".18"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  vol1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fill-opacity=".18"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/></svg>',
  vol2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fill-opacity=".18"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.3 6.5a8 8 0 0 1 0 11"/></svg>',
  stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-dasharray="2 2.4"/><circle cx="12" cy="12" r="5.5"/><path d="M11 14.5V9.3l3.2-.8"/><circle cx="10" cy="14.6" r="1.3" fill="currentColor"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
};

// =====================================================================================
//  Audio engine
// =====================================================================================
class Engine {
  constructor() { this.ctx = null; }
  init() {
    if (this.ctx) { this.ctx.state === "suspended" && this.ctx.resume(); return; }
    const ctx = (this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback" }));
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.3;
    this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 256; this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);
    this.musicBus = ctx.createGain(); this.musicBus.connect(this.master);
    this.ambBus = ctx.createGain(); this.ambBus.connect(this.master);
    this.sacredBus = ctx.createGain(); this.sacredBus.connect(this.master);   // the call to prayer — never mixed with music
    // shared reverb
    this.reverb = ctx.createConvolver(); this.reverb.buffer = this._impulse(3.8, 2.6);
    this.revSend = ctx.createGain(); this.revSend.gain.value = 0.55;
    this.revSend.connect(this.reverb).connect(this.musicBus);
    this.noise = this._noise(); this.brown = this._noise(true);
  }
  _impulse(sec, decay) {
    const ctx = this.ctx, len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  _noise(brown) {
    const ctx = this.ctx, len = ctx.sampleRate * 3, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    return b;
  }
}

// ---- generative voice ------------------------------------------------------------
class GenVoice {
  constructor(eng, mood) {
    this.e = eng; this.m = MOODS[mood] || MOODS.silk; this.mood = mood;
    const ctx = eng.ctx;
    this.out = ctx.createGain(); this.out.gain.value = 0; this.out.connect(eng.musicBus); this.out.connect(eng.revSend);
    this.lp = ctx.createBiquadFilter(); this.lp.type = "lowpass"; this.lp.frequency.value = 3200; this.lp.Q.value = 0.4;
    this.lp.connect(this.out);
    this.delay = ctx.createDelay(2); this.fb = ctx.createGain(); this.fb.gain.value = 0.28; this.dmix = ctx.createGain(); this.dmix.gain.value = 0.22;
    this.delay.connect(this.fb).connect(this.delay); this.delay.connect(this.dmix).connect(this.lp);
    this.mods = { b: 0, d: 0, tm: 1 }; this.step = 0; this.deg = 0; this.bar = 0; this.nodes = [];
  }
  setContext(season, tod) {
    const s = SEASON_MOD[season] || {}, d = TOD_MOD[tod] || {};
    this.mods = { b: (s.b || 0) + (d.b || 0), d: s.d || 0, tm: (s.tm || 1) * (d.tm || 1) };
    if (this.e.ctx) this.lp.frequency.setTargetAtTime(1200 + 4200 * Math.max(0.1, 0.6 + this.mods.b), this.e.ctx.currentTime, 2);
  }
  get spb() { return 60 / (this.m.bpm * this.mods.tm) / 2; } // eighth notes
  start(fade = 3) {
    const ctx = this.e.ctx, now = ctx.currentTime;
    this.out.gain.cancelScheduledValues(now); this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0.85, now + fade);
    this.delay.delayTime.value = this.spb * 3;
    if (this.m.drone) this._drone();
    this.next = now + 0.1; this.running = true;
    this.timer = setInterval(() => this._schedule(), 40);
  }
  stop(fade = 3) {
    if (!this.e.ctx) return;
    const ctx = this.e.ctx, now = ctx.currentTime;
    this.running = false; clearInterval(this.timer);
    this.out.gain.cancelScheduledValues(now); this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + fade);
    setTimeout(() => { this.nodes.forEach((n) => { try { n.stop(); } catch {} }); this.out.disconnect(); }, fade * 1000 + 200);
  }
  _drone() {
    const ctx = this.e.ctx;
    const g = ctx.createGain(); g.gain.value = 0.05; g.connect(this.lp);
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500; f.connect(g);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(f.frequency); lfo.start();
    for (const [n, det] of [[this.m.root - 12, 0], [this.m.root - 5, 4], [this.m.root - 12, -6]]) {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = midi(n); o.detune.value = det; o.connect(f); o.start(); this.nodes.push(o);
    }
    this.nodes.push(lfo);
  }
  _note(n) { const sc = this.m.scale, o = Math.floor(n / sc.length); return this.m.root + sc[((n % sc.length) + sc.length) % sc.length] + 12 * o; }
  _schedule() {
    const ctx = this.e.ctx;
    while (this.running && this.next < ctx.currentTime + 0.3) {
      const t0 = this.next, s = this.step % 16;
      // pads: new chord every 2 bars
      if (s === 0 && this.m.pad > 0 && this.bar % 2 === 0) this._pad(t0);
      // lead: random-walk melody with phrasing
      const dens = Math.max(0.1, Math.min(0.9, this.m.density + this.mods.d + (s % 4 === 0 ? 0.2 : 0)));
      if (Math.random() < dens && !(s >= 13 && Math.random() < 0.6)) {
        this.deg += [-2, -1, -1, 0, 1, 1, 2, 3][(Math.random() * 8) | 0];
        this.deg = Math.max(-2, Math.min(this.m.scale.length * 2, this.deg));
        this._lead(t0, midi(this._note(this.deg) + 12), 0.5 + Math.random() * 0.5);
        if (this.m.lead === "pluck" && Math.random() < 0.25) this._lead(t0 + this.spb / 2, midi(this._note(this.deg + 1) + 12), 0.4);
      }
      if (this.m.hats && s % 2 === 0) this._hat(t0, s % 4 === 2 ? 0.05 : 0.025);
      if (this.m.hats && (s === 0 || s === 10)) this._kick(t0);
      this.step++; if (this.step % 16 === 0) this.bar++;
      this.next += this.spb * (s % 2 ? 0.94 : 1.06); // gentle swing
    }
  }
  _env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  _lead(t, f, vel) {
    const ctx = this.e.ctx, g = ctx.createGain(), type = this.m.lead;
    g.connect(this.lp); g.connect(this.delay);
    const osc = (tp, fr, gain = 1) => { const o = ctx.createOscillator(); o.type = tp; o.frequency.value = fr; const og = ctx.createGain(); og.gain.value = gain; o.connect(og).connect(g); o.start(t); o.stop(t + 4); return o; };
    const v = vel * 0.16;
    switch (type) {
      case "piano": osc("triangle", f); osc("sine", f * 2, 0.25); this._env(g, t, 0.008, v, 2.4); break;
      case "keys": osc("sine", f); osc("triangle", f * 2.001, 0.2); this._env(g, t, 0.01, v * 0.8, 1.6); break;
      case "marimba": osc("sine", f); osc("sine", f * 4, 0.12); this._env(g, t, 0.004, v, 0.7); break;
      case "bell": osc("sine", f); osc("sine", f * 2.76, 0.35); osc("sine", f * 5.4, 0.12); this._env(g, t, 0.004, v * 0.8, 3.6); break;
      case "koto": case "qanun": osc("triangle", f); osc("sawtooth", f, 0.12); this._env(g, t, 0.003, v, type === "koto" ? 1.4 : 1.0); break;
      case "oud": osc("sawtooth", f / 2, 0.6); osc("triangle", f / 2 * 1.003, 0.6); this._env(g, t, 0.004, v * 0.9, 0.9); break;
      default: { // pluck (dutar-like): bright saw through a closing filter
        const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.Q.value = 2; fl.frequency.setValueAtTime(4200, t); fl.frequency.exponentialRampToValueAtTime(500, t + 0.5);
        const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.connect(fl).connect(g); o.start(t); o.stop(t + 2);
        this._env(g, t, 0.003, v * 0.85, 0.9);
      }
    }
  }
  _pad(t) {
    const ctx = this.e.ctx, prog = this.m.prog, dur = this.spb * 32;
    const chord = prog ? prog[(this.bar / 2) % prog.length] : [0, 2, 4];
    const g = ctx.createGain(); g.connect(this.lp);
    const peak = 0.045 * this.m.pad;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 2.2); g.gain.setValueAtTime(peak, t + dur - 2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.5);
    chord.forEach((d) => [-7, 7].forEach((det) => {
      const o = ctx.createOscillator(); o.type = this.mood === "aurora" ? "sawtooth" : "triangle";
      o.frequency.value = midi(this._note(d)); o.detune.value = det; o.connect(g); o.start(t); o.stop(t + dur + 2);
    }));
  }
  _hat(t, v) {
    const ctx = this.e.ctx, s = ctx.createBufferSource(); s.buffer = this.e.noise;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
    const g = ctx.createGain(); this._env(g, t, 0.002, v, 0.06);
    s.connect(f).connect(g).connect(this.out); s.start(t, Math.random() * 2, 0.1);
  }
  _kick(t) {
    const ctx = this.e.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    this._env(g, t, 0.004, 0.18, 0.35); o.connect(g).connect(this.out); o.start(t); o.stop(t + 0.5);
  }
}

// ---- file voice -------------------------------------------------------------------
class FileVoice {
  constructor(eng, track, onEnd) {
    this.e = eng; this.track = track;
    const a = (this.audio = new Audio()); a.src = track.src; a.preload = "auto"; a.crossOrigin = "anonymous";
    this.src = eng.ctx.createMediaElementSource(a);
    this.out = eng.ctx.createGain(); this.out.gain.value = 0;
    this.src.connect(this.out).connect(eng.musicBus);
    a.onended = () => onEnd?.();
  }
  setContext() {}
  start(fade = 3) {
    const now = this.e.ctx.currentTime;
    this.audio.play().catch(() => toast("▶"));
    this.out.gain.cancelScheduledValues(now); this.out.gain.setValueAtTime(this.out.gain.value, now); this.out.gain.linearRampToValueAtTime(1, now + fade);
  }
  stop(fade = 3) {
    const now = this.e.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now); this.out.gain.setValueAtTime(this.out.gain.value, now); this.out.gain.linearRampToValueAtTime(0, now + fade);
    setTimeout(() => { this.audio.pause(); this.src.disconnect(); this.audio.src = ""; }, fade * 1000 + 100);
  }
  pause() { this.audio.pause(); } resume() { this.audio.play().catch(() => {}); }
}

// ---- Apple Music preview voice -------------------------------------------------------
// Streams the official 30-second preview through our own audio graph: real volume, real
// visualiser, and a DJ-style overlap — the next song starts while this one is still fading out.
class PreviewVoice extends FileVoice {
  constructor(m, tr, onEnd, onFail) {
    const [id, cc] = tr.it.split(":");
    super(m.e, { ...tr, src: `/api/preview/${id}?c=${cc}` }, null);
    this.m = m; this.track = tr; this.handed = false;
    const hand = () => { if (!this.handed) { this.handed = true; onEnd?.(); } };
    this.audio.onended = hand;
    this.audio.ontimeupdate = () => {
      const a = this.audio, lead = Math.min(Math.max(0.3, m.prefs.xfade), 6);
      if (a.duration && a.duration - a.currentTime < lead && !m.prefs.repeat) hand();
    };
    this.audio.onerror = () => { if (!this.handed) { this.handed = true; onFail?.(); } };
  }
  start(fade = 3) {
    const now = this.e.ctx.currentTime;
    this.audio.play().then(() => this.m._unblocked()).catch(() => this.m._blocked(this));
    this.out.gain.cancelScheduledValues(now); this.out.gain.setValueAtTime(this.out.gain.value, now); this.out.gain.linearRampToValueAtTime(1, now + fade);
  }
  stop(fade = 3) { this.handed = true; super.stop(fade); }   // clearing src fires "error" — not a real failure
  get time() { return this.audio.currentTime || 0; }
  get duration() { return this.audio.duration || 0; }
  seek(s) { this.audio.currentTime = s; }
}

// ---- the call to prayer (Makkah · Madinah) ---------------------------------------------
class Adhan {
  constructor(eng) { this.e = eng; this.audio = null; }
  get on() { return !!this.audio && !this.audio.paused; }
  play(onEnd) {
    if (this.audio) return;
    const ctx = this.e.ctx, a = (this.audio = new Audio());
    a.crossOrigin = "anonymous"; a.src = ADHAN.src; a.preload = "auto";
    const src = ctx.createMediaElementSource(a), g = (this.g = ctx.createGain()); g.gain.value = 0;
    // a touch of open-courtyard space: a soft, long reverb tail mixed under the dry voice
    const wet = ctx.createGain(); wet.gain.value = 0.32; const conv = ctx.createConvolver(); conv.buffer = this.e._impulse(4.5, 3.2);
    src.connect(g); src.connect(conv).connect(wet).connect(g); g.connect(this.e.sacredBus);
    a.onended = () => { this.stop(0.1); onEnd?.(); };
    a.play().catch(() => {});
    g.gain.setTargetAtTime(1, ctx.currentTime, 0.9);
  }
  stop(fade = 2.5) {
    const a = this.audio, g = this.g; if (!a) return;
    this.audio = null;
    g.gain.setTargetAtTime(0, this.e.ctx.currentTime, fade / 4);
    setTimeout(() => { a.pause(); a.src = ""; g.disconnect(); }, fade * 1000 + 200);
  }
}


// ---- Spotify voice (audio only) -------------------------------------------------------
// One shared Spotify embed controller in a slim glass strip. Spotify's iframe exposes no
// volume control, so crossfades fade our own generative/ambient layers around it instead.
const SPP = {
  api: null, ctl: null, ready: null, owner: null, loadedAt: 0, state: { paused: true, pos: 0, dur: 0, buffering: false }, onUpdate: null,
  load() {
    if (this.api) return this.api;
    this.api = new Promise((res) => {
      if (window.__wlSpotifyAPI) return res(window.__wlSpotifyAPI);
      window.onSpotifyIframeApiReady = (api) => { window.__wlSpotifyAPI = api; res(api); };
      const s = document.createElement("script"); s.src = "https://open.spotify.com/embed/iframe-api/v1"; s.async = true; document.head.append(s);
    });
    return this.api;
  },
  ensure(host, uri) {
    if (this.ready) return this.ready;
    this.ready = this.load().then((api) => new Promise((res) => {
      api.createController(host, { uri, width: "100%", height: 80 }, (ctl) => {
        this.ctl = ctl;
        ctl.addListener("playback_update", (e) => {
          const d = e.data || {}, prev = this.state;
          this.state = { paused: !!d.isPaused, pos: d.position || 0, dur: d.duration || 0, buffering: !!d.isBuffering };
          // "ended" = it was playing near the end and stopped; ignore the blip while a new uri loads
          const st = this.state, settled = Date.now() - this.loadedAt > 4000;
          const ended = settled && !this.endFired && st.dur > 0 && prev.dur === st.dur
            && (st.pos >= st.dur - 400 || (!prev.paused && st.paused && prev.pos >= prev.dur - 2500));
          if (ended) this.endFired = true;
          this.onUpdate?.(this.state, ended);
        });
        ctl.addListener("ready", () => res(ctl));
      });
    }));
    return this.ready;
  },
};

class SPVoice {
  constructor(music, tr, onEnd) { this.m = music; this.track = tr; this.onEnd = onEnd; this.alive = true; }
  setContext() {}
  async start() {
    SPP.owner = this;
    this.m._showCard(this.track);
    const uri = "spotify:track:" + this.track.sp;
    const first = !SPP.ready;
    const ctl = await SPP.ensure($(".sp-frame", this.m.card), uri);
    if (!this.alive || SPP.owner !== this) return;
    SPP.onUpdate = (st, ended) => {
      if (SPP.owner !== this) return;
      if (!st.paused) this.m.card.classList.remove("blocked");
      if (ended) this.onEnd?.();
      this.m._spTick?.();
    };
    SPP.loadedAt = Date.now(); SPP.endFired = false;
    if (!first) ctl.loadUri(uri);
    setTimeout(() => { if (SPP.owner === this) ctl.play(); }, first ? 300 : 600);
    clearTimeout(this._chk);
    this._chk = setTimeout(() => {
      if (SPP.owner !== this || !SPP.state.paused || !this.m.playing) return;
      ctl.play();   // a fresh loadUri occasionally swallows the first play()
      this._chk = setTimeout(() => { if (SPP.owner === this && SPP.state.paused && this.m.playing) this.m.card.classList.add("blocked"); }, 2500);
    }, 2500);
  }
  stop() {
    this.alive = false; clearTimeout(this._chk);
    if (SPP.owner !== this) return;
    SPP.owner = null; SPP.ctl?.pause(); this.m._hideCard();
  }
  pause() { SPP.ctl?.pause(); }
  resume() { SPP.ctl?.resume(); }
  get time() { return SPP.state.pos / 1000; }
  get duration() { return SPP.state.dur / 1000; }
  seek(s) { SPP.ctl?.seek(s); }
}

// ---- procedural ambience ------------------------------------------------------------
class Ambience {
  constructor(eng) {
    this.e = eng; const ctx = eng.ctx; this.layers = {};
    const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 2); return s; };
    const mk = (name, chain, base = 1) => { const g = ctx.createGain(); g.gain.value = 0; chain(g); g.connect(eng.ambBus); this.layers[name] = { g, base }; };
    mk("rain", (g) => { const f1 = ctx.createBiquadFilter(); f1.type = "highpass"; f1.frequency.value = 900; const f2 = ctx.createBiquadFilter(); f2.type = "lowpass"; f2.frequency.value = 8000; loop(eng.noise).connect(f1).connect(f2).connect(g); }, 0.22);
    mk("wind", (g) => { const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8; f.frequency.value = 500;
      const l = ctx.createOscillator(); l.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 300; l.connect(lg).connect(f.frequency); l.start();
      const am = ctx.createGain(); am.gain.value = 0.7; const l2 = ctx.createOscillator(); l2.frequency.value = 0.13; const l2g = ctx.createGain(); l2g.gain.value = 0.3; l2.connect(l2g).connect(am.gain); l2.start();
      loop(eng.noise).connect(f).connect(am).connect(g); }, 0.35);
    mk("ocean", (g) => { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 700;
      const am = ctx.createGain(); am.gain.value = 0.55; const l = ctx.createOscillator(); l.frequency.value = 0.085; const lg = ctx.createGain(); lg.gain.value = 0.45; l.connect(lg).connect(am.gain); l.start();
      loop(eng.brown).connect(f).connect(am).connect(g); }, 0.9);
    mk("water", (g) => { const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 0.4; loop(eng.noise).connect(f).connect(g); }, 0.16);
    mk("city", (g) => { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 280; loop(eng.brown).connect(f).connect(g); }, 0.6);
    mk("birds", () => {}, 1); mk("crickets", () => {}, 1);
    this.levels = {};
    this.timer = setInterval(() => this._events(), 220);
  }
  set(levels, master = 1) {
    const ctx = this.e.ctx; this.levels = levels; this.master = master;
    for (const [k, L] of Object.entries(this.layers)) L.g.gain.setTargetAtTime((levels[k] || 0) * L.base, ctx.currentTime, 1.6);
  }
  _events() {
    const ctx = this.e.ctx, t = ctx.currentTime, lv = this.levels;
    if ((lv.birds || 0) > 0 && Math.random() < lv.birds * 0.35) {
      const n = 1 + (Math.random() * 4) | 0, base = 2200 + Math.random() * 2200;
      for (let i = 0; i < n; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain(), st = t + i * (0.08 + Math.random() * 0.06);
        o.frequency.setValueAtTime(base, st); o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.5), st + 0.07);
        g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.03 * lv.birds, st + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.09);
        o.connect(g).connect(this.layers.birds.g); this.layers.birds.g.gain.value = 1; o.start(st); o.stop(st + 0.12);
      }
    }
    if ((lv.crickets || 0) > 0 && Math.random() < 0.5) {
      const o = ctx.createOscillator(), g = ctx.createGain(), am = ctx.createOscillator(), amg = ctx.createGain();
      o.frequency.value = 4300 + Math.random() * 500; am.frequency.value = 28; amg.gain.value = 0.5; am.connect(amg).connect(g.gain);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.012 * lv.crickets, t + 0.02); g.gain.linearRampToValueAtTime(0, t + 0.35);
      o.connect(g).connect(this.layers.crickets.g); this.layers.crickets.g.gain.value = 1; o.start(t); am.start(t); o.stop(t + 0.4); am.stop(t + 0.4);
    }
  }
}

// =====================================================================================
//  Music controller + UI
// =====================================================================================
export class Music {
  constructor({ getCode, cities, songStamp }) {
    this.getCode = getCode; this.cities = cities; this.songStamp = songStamp;
    this.e = new Engine();
    this.prefs = Object.assign({ master: 0.8, muted: false, vol: 0.8, amb: 0.55, smart: true, xfade: 4, shuffle: false, repeat: false, songs: true, full: false, adhan: true, favs: [] }, store.get("music", {}));
    this.recent = []; this.songCat = "city"; this.songQ = "";
    this.uploaded = [];
    this.generative = Object.entries(MOODS).map(([k, m]) => ({ id: "g:" + k, kind: "gen", mood: k, title: m.name, artist: "WorldLive", hue: m.hue }));
    this.queue = []; this.idx = -1; this.voice = null; this.playing = false;
    this.ctx = { city: null, season: "spring", tod: "noon", spiritual: false };
    this._build();
    this._keys();
    onLang(() => this.render());
  }
  get tracks() { return [...this.uploaded, ...this.generative]; }
  /** one entry per song: a couple's own Spotify link that is already in the catalogue is folded into it */
  get songs() { return uniqueSongs([...SONGS, ...this.uploaded.filter((u) => u.kind === "sp")]); }
  /** songs that belong to a city, strongest match first (custom city songs, then catalogue order) */
  citySongs(key) {
    if (!key || SILENT_CITIES.has(key)) return [];
    const own = this.uploaded.filter((u) => u.kind === "sp" && u.city === key && (u.season === "any" || u.season === this.ctx.season));
    const home = CITY_CAT[key], rank = (s) => (s.cat === home ? 0 : 10) + s.cities.indexOf(key);   // local language first
    return uniqueSongs([...own, ...SONGS.filter((s) => s.cities.includes(key)).sort((a, b) => rank(a) - rank(b))]);
  }
  get spState() { return SPP.ctl ? { ...SPP.state } : null; }
  isFav(id) { return this.prefs.favs.includes(id); }
  toggleFav(id) { const f = this.prefs.favs; f.includes(id) ? f.splice(f.indexOf(id), 1) : f.push(id); this._save(); }
  get current() { return this.queue[this.idx]; }
  _save() { store.set("music", this.prefs); }

  unlock() {
    this.e.init();
    if (!this.amb) { this.amb = new Ambience(this.e); this.adhan = new Adhan(this.e); this._applyVol(true); }
  }
  /** perceptual (squared) volume curve with smooth ramps — no zipper noise, no jumps */
  _applyVol(instant) {
    if (!this.e.ctx) return;
    const now = this.e.ctx.currentTime, tc = instant ? 0.01 : 0.08, P = this.prefs;
    const curve = (v) => v * v;
    this.e.master.gain.setTargetAtTime(P.muted ? 0 : curve(P.master) * 1.1, now, tc);
    this.e.musicBus.gain.setTargetAtTime(curve(P.vol), now, tc);
    this.e.ambBus.gain.setTargetAtTime(curve(P.amb), now, tc);
    this.e.sacredBus.gain.setTargetAtTime(0.95, now, tc);
  }
  /** set the master level (0–1) from any control, show the HUD and remember it */
  setVolume(v, { hud = true } = {}) {
    this.prefs.master = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
    if (this.prefs.master > 0) this.prefs.muted = false;
    this._save(); this._applyVol(); this._volUI(); if (hud) this._hud();
  }
  toggleMute() { this.prefs.muted = !this.prefs.muted; if (!this.prefs.muted && !this.prefs.master) this.prefs.master = 0.5; this._save(); this._applyVol(); this._volUI(); this._hud(); }
  _keys() {
    addEventListener("keydown", (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]") || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === "+" || k === "=" || (k === "ArrowUp" && e.shiftKey)) { e.preventDefault(); this.setVolume(this.prefs.master + 0.05); }
      else if (k === "-" || k === "_" || (k === "ArrowDown" && e.shiftKey)) { e.preventDefault(); this.setVolume(this.prefs.master - 0.05); }
      else if (k === "m" || k === "M") this.toggleMute();
      else if (k === " " && e.target === document.body) { e.preventDefault(); this.toggle(); }
    });
    // browsers may refuse sound until the first gesture — the very next touch starts the music
    const retry = () => { if (this._needsTap) { this._needsTap.audio?.play().then(() => this._unblocked()).catch(() => {}); } };
    addEventListener("pointerdown", retry, true); addEventListener("keydown", retry, true);
  }
  _blocked(v) { this._needsTap = v; this.player.classList.add("needs-tap"); }
  _unblocked() { this._needsTap = null; this.player.classList.remove("needs-tap"); }
  async loadUploads() {
    const code = this.getCode(); if (!code) return;
    try { this.uploaded = (await api(`journey/${code}/tracks`)).tracks; this.render(); } catch {}
  }

  /** called by the scene on every atmosphere change */
  setContext({ city, season, tod, ambience, spiritual }) {
    const cityChanged = city?.key !== this.ctx.city?.key;
    // sacred cities stay silent while you are there — even when you step back to the globe above them
    spiritual = !!spiritual || SILENT_CITIES.has(city?.key);
    this.ctx = { city, season, tod, spiritual };
    this.amb?.set(ambience || {});
    const sacred = SILENT_CITIES.has(city?.key);
    if (sacred && cityChanged && this.prefs.adhan && this.adhan) { clearTimeout(this._adhanT); this._adhanT = setTimeout(() => this.playAdhan(), 1800); }
    if (!sacred && this.adhan?.audio) { clearTimeout(this._adhanT); this.adhan.stop(); this.render(); }
    if (sacred && (cityChanged || !this._prayT)) this._schedulePrayer(); else if (!sacred) { clearTimeout(this._prayT); this._prayT = null; }
    this.voice?.setContext(season, tod);
    if (spiritual && this.current && !this._allowedInSpirit(this.current)) {
      if (this.playing) this.autoPaused = true;
      this.pause(true); this.render(); return;
    }
    if (!spiritual && this.autoPaused) { this.autoPaused = false; this.playSmart(); return; }
    if (this.prefs.smart && this.playing && (cityChanged || !this._fits(this.current))) this.playSmart();
    this.render();
  }
  /** the adhan at the real prayer times while you are in Makkah / Madinah */
  _schedulePrayer() {
    clearTimeout(this._prayT);
    const c = this.ctx.city, n = c && nextPrayer(c); if (!n) return;
    this._prayT = setTimeout(() => {
      this._prayT = null;
      if (this.ctx.city !== c) return;
      if (this.prefs.adhan) {
        const N = PRAYER_NAMES[getLang()] || PRAYER_NAMES.en;
        toast(`🕌 ${t("adhanFor", { name: N[n.key] })} · ${L(c.name)} ${clockIn(n.at, c.tz ?? 3)}`);
        this.adhan?.stop(0.4); setTimeout(() => this.playAdhan(), 600);
      }
      this._schedulePrayer();
    }, Math.min(n.at - Date.now(), 2 ** 31 - 1) + 400);
  }
  playAdhan() {
    this.unlock();
    if (!SILENT_CITIES.has(this.ctx.city?.key) || this.adhan.audio) return;
    if (this.playing) { this.autoPaused = true; this.pause(true); }
    this.adhan.play(() => this.render());
    track("adhan", { city: this.ctx.city?.key });
    this.render();
  }
  stopAdhan() { this.adhan?.stop(); this.render(); }
  _allowedInSpirit(tr) { return tr.kind === "file" && tr.city === this.ctx.city?.key; }
  _fits(tr) {
    if (!tr) return false;
    const c = this.ctx.city;
    if (tr.kind === "gen") return c && tr.mood === c.mood && !this.uploaded.some((u) => u.kind === "file" && this._match(u) === 2) && !(this.prefs.songs && this.citySongs(c.key).length);
    if (tr.kind === "sp") return !!c && (tr.cities ? tr.cities.includes(c.key) : tr.city === c.key) && (!this.queueCity || this.queueCity === c.key);
    return this._match(tr) > 0;
  }
  _match(tr) { // 2 = city+season, 1 = city or season-any, 0 = no
    const c = this.ctx.city?.key;
    const cityOk = tr.city === "any" || tr.city === c, seasonOk = tr.season === "any" || tr.season === this.ctx.season;
    if (!cityOk || !seasonOk) return 0;
    return tr.city === c ? 2 : 1;
  }
  smartPick() {
    const c = this.ctx.city;
    const ups = this.uploaded.filter((u) => u.kind === "file").map((u) => [u, this._match(u)]).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]);
    if (this.ctx.spiritual) return ups.find(([u]) => this._allowedInSpirit(u))?.[0] || null;
    if (ups.length && ups[0][1] === 2) return ups[0][0];
    if (this.prefs.songs && c) {
      const list = this.citySongs(c.key);
      if (list.length) {
        const fresh = list.filter((s) => !this.recent.includes(s.id));
        const pool = (fresh.length ? fresh : list);
        const fav = pool.filter((s) => this.isFav(s.id));
        const home = CITY_CAT[c.key], local = pool.filter((s) => s.cat === home);
        const pick = fav.length ? fav : (local.length ? local : pool).slice(0, 3);   // local songs first, a touch of variety
        return pick[(Math.random() * pick.length) | 0];
      }
    }
    return this.generative.find((g) => g.mood === (c?.mood || "silk"));
  }
  playSmart() {
    const tr = this.smartPick();
    if (!tr) { this.pause(true); toast(t("silentMode")); return; }
    if (tr.kind === "sp" && this.ctx.city) {
      // build the city's default playlist around the chosen song
      const list = this.citySongs(this.ctx.city.key), at = list.indexOf(tr);
      this.queue = [...list.slice(at), ...list.slice(0, at)]; this.idx = 0; this.queueCity = this.ctx.city.key;
      return this.playTrack(tr, { fromQueue: true });
    }
    this.queueCity = null;
    this.playTrack(tr);
  }
  playTrack(tr, { fromQueue = false } = {}) {
    this.unlock();
    if (this.ctx.spiritual && !this._allowedInSpirit(tr)) { toast(t("silentMode")); return; }
    if (!fromQueue) {
      const at = this.queue.findIndex((q) => q.id === tr.id);
      if (at >= 0) this.idx = at; else { this.queue.splice(this.idx + 1, 0, tr); this.idx++; }
    }
    const xf = Math.max(0.3, this.prefs.xfade);
    this.voice?.stop(xf);
    const usePreview = tr.kind === "sp" && tr.it && (!this.prefs.full || !tr.sp) && !this._noPreview?.has(tr.id);
    const v = tr.kind === "gen" ? new GenVoice(this.e, tr.mood)
      : usePreview ? new PreviewVoice(this, tr, () => { if (this.voice === v) this.next(true); }, () => { (this._noPreview ||= new Set()).add(tr.id); if (this.voice === v) tr.sp ? this.playTrack(tr, { fromQueue: true }) : this.next(true); })
      : tr.kind === "sp" ? new SPVoice(this, tr, () => this.next(true)) : new FileVoice(this.e, tr, () => this.next(true));
    if (!(v instanceof SPVoice) && this.voice instanceof SPVoice) this.voice.stop();
    if (tr.kind === "sp") { this.recent = [tr.id, ...this.recent.filter((x) => x !== tr.id)].slice(0, 6); }
    track("music", { city: this.ctx.city?.key, d: { title: tr.title, artist: tr.artist || "", src: tr.kind, id: tr.id } });
    v.setContext(this.ctx.season, this.ctx.tod);
    v.start(xf);
    this.voice = v; this.playing = true;
    this._media(tr); this.render();
    // the first song that really plays in a city becomes that city's "song stamp"
    clearTimeout(this._stampT);
    const city = this.ctx.city?.key;
    if (tr.kind !== "gen" && city && !SILENT_CITIES.has(city) && this.songStamp && !this.songStamp.get(city))
      this._stampT = setTimeout(() => { if (this.voice === v && this.playing && this.ctx.city?.key === city) this.stampSong(city, tr, true); }, 15000);
  }
  stampSong(city, tr, auto) {
    if (!this.songStamp || !city || !tr || tr.kind === "gen") return;
    this.songStamp.set(city, { id: tr.id, title: tr.title, artist: tr.artist || "" }, auto);
    track("song_stamp", { city, d: { title: tr.title, artist: tr.artist || "" } });
    this.render();
  }
  /** play an ordered list of song ids (e.g. the couple's passport playlist) */
  playList(ids) {
    const all = [...this.songs, ...this.uploaded], list = uniqueSongs(ids.map((id) => all.find((s) => s.id === id)).filter(Boolean));
    if (!list.length) return;
    this.queue = list; this.idx = 0; this.queueCity = null;
    this.playTrack(list[0], { fromQueue: true });
  }
  toggle() {
    this.unlock();
    if (this.adhan?.audio) return this.stopAdhan();
    if (this.playing) return this.pause();
    if (this.voice instanceof FileVoice && this.voice.track === this.current) { this.voice.resume(); this.voice.start(0.6); this.playing = true; return this.render(); }
    if (this.voice instanceof SPVoice && this.voice.track === this.current && this.voice.alive) { this.voice.resume(); this.playing = true; return this.render(); }
    this.current ? this.playTrack(this.current, { fromQueue: true }) : this.playSmart();
  }
  /** step aside for “Bizning film” (or anything else that needs the speakers), then come back */
  duck(on) {
    if (on) { this._ducked = this.playing; if (this.playing) this.pause(); }
    else if (this._ducked) { this._ducked = false; this.toggle(); }
  }
  pause(hard) {
    if (!this.voice) { this.playing = false; return this.render(); }
    if (this.voice instanceof SPVoice && !hard) { this.voice.pause(); }
    else if (this.voice instanceof FileVoice && !hard) { this.voice.out.gain.setTargetAtTime(0, this.e.ctx.currentTime, 0.15); setTimeout(() => this.voice?.pause(), 500); }
    else { this.voice.stop(hard ? 1.2 : 1.5); this.voice = null; }
    this.playing = false; this.render();
  }
  next(auto) {
    if (!this.queue.length) return this.playSmart();
    if (auto && this.prefs.repeat && this.current) return this.playTrack(this.current, { fromQueue: true });
    this.idx = this.prefs.shuffle ? (Math.random() * this.queue.length) | 0 : (this.idx + 1) % this.queue.length;
    this.playTrack(this.queue[this.idx], { fromQueue: true });
  }
  prev() {
    if (this.voice instanceof FileVoice && this.voice.audio.currentTime > 4 && !(this.voice instanceof PreviewVoice && this.voice.handed)) { this.voice.audio.currentTime = 0; return; }
    if (this.voice instanceof SPVoice && this.voice.time > 4) { this.voice.seek(0); return; }
    if (!this.queue.length) return;
    this.idx = (this.idx - 1 + this.queue.length) % this.queue.length;
    this.playTrack(this.queue[this.idx], { fromQueue: true });
  }
  _media(tr) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: tr.title, artist: tr.artist || "WorldLive", album: "WorldLive · " + (this.ctx.city ? L(this.ctx.city.name) : ""),
      artwork: tr.art ? [{ src: tr.art, sizes: "300x300", type: "image/jpeg" }] : [] });
    navigator.mediaSession.setActionHandler("play", () => this.toggle());
    navigator.mediaSession.setActionHandler("pause", () => this.pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => this.next());
    navigator.mediaSession.setActionHandler("previoustrack", () => this.prev());
  }

  // ------------------------------------------------------------------ UI
  _build() {
    this.player = h(`<div class="player glass pill">
      <div class="art"><canvas></canvas></div>
      <div class="meta"><b></b><span></span></div>
      <button class="icon-btn hide-sm" data-a="prev" aria-label="Previous">${ICON.prev}</button>
      <button class="icon-btn play" data-a="toggle" aria-label="Play"></button>
      <button class="icon-btn hide-sm" data-a="next" aria-label="Next">${ICON.next}</button>
      <div class="vol" data-vol>
        <button class="icon-btn" data-a="mute" aria-label="Volume"></button>
        <div class="vol-pop glass dense"><input type="range" min="0" max="100" step="1" aria-label="Volume" data-master><b data-vv></b></div>
      </div>
      <button class="icon-btn" data-a="panel" aria-label="Playlist">${ICON.list}</button>
    </div>`);
    this.hudEl = h(`<div class="vol-hud glass dense" aria-hidden="true"><i></i><div class="lv">${"<span></span>".repeat(16)}</div><b></b></div>`);
    const vol = $("[data-vol]", this.player), rng = $("[data-master]", this.player);
    rng.oninput = () => this.setVolume(rng.value / 100, { hud: false });
    vol.addEventListener("wheel", (e) => { e.preventDefault(); this.setVolume(this.prefs.master + (e.deltaY < 0 ? 0.04 : -0.04)); }, { passive: false });
    // touch: first tap opens the slider, a second tap on the icon mutes
    vol.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") vol.classList.add("open"); });
    vol.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") vol.classList.remove("open"); });
    document.addEventListener("pointerdown", (e) => { if (!vol.contains(e.target)) vol.classList.remove("open"); });
    this.player.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
      const vol = $("[data-vol]", this.player);
      if (a === "mute" && e.pointerType !== "mouse" && !vol.classList.contains("open")) { vol.classList.add("open"); return; }
      ({ prev: () => this.prev(), next: () => this.next(), toggle: () => { this.unlock(); this.toggle(); }, mute: () => this.toggleMute(), panel: () => this.openPanel(!this.panelOpen) })[a]();
    });
    this.tab = "now"; this.filter = "all";
    this.card = h(`<div class="sp-card glass dense" aria-label="Spotify">
      <div class="sp-box"><div class="sp-frame"></div><button class="sp-tap" data-tap>${ICON.play}<span></span></button></div>
    </div>`);
    $("[data-tap]", this.card).onclick = () => { SPP.ctl?.resume(); this.card.classList.remove("blocked"); this.playing = true; this.render(); };
    requestAnimationFrame(() => this._viz());
  }
  mount(root) { root.append(this.player); document.body.append(this.card, this.hudEl); this._volUI(); this.render(); }
  _volIcon() { const P = this.prefs; return P.muted || !P.master ? ICON.vol0 : P.master < 0.5 ? ICON.vol1 : ICON.vol2; }
  _volUI() {
    const P = this.prefs, pct = P.muted ? 0 : Math.round(P.master * 100);
    $("[data-a=mute]", this.player).innerHTML = this._volIcon();
    const r = $("[data-master]", this.player); if (document.activeElement !== r) r.value = pct;
    r.style.setProperty("--p", pct + "%"); $("[data-vv]", this.player).textContent = pct;
    this.player.classList.toggle("muted", !!P.muted);
    const pr = this.panel && $("[data-s=master]", this.panel); if (pr && document.activeElement !== pr) { pr.value = pct; pr.nextElementSibling.textContent = pct; }
  }
  _hud() {
    const P = this.prefs, pct = P.muted ? 0 : Math.round(P.master * 100), el = this.hudEl;
    $("i", el).innerHTML = this._volIcon(); $("b", el).textContent = P.muted ? t("muted") : pct + "%";
    $$(".lv span", el).forEach((s, i) => s.classList.toggle("on", i < Math.round(pct / 100 * 16)));
    el.classList.toggle("sp", this.voice instanceof SPVoice);
    el.classList.add("on"); clearTimeout(this._hudT); this._hudT = setTimeout(() => el.classList.remove("on"), 1300);
  }
  _showCard(tr) {
    $("[data-tap] span", this.card).textContent = t("tapPlay");
    this.card.classList.add("on"); document.body.classList.add("sp-on");
  }
  _hideCard() { this.card.classList.remove("on", "blocked"); document.body.classList.remove("sp-on"); }
  openPanel(open) {
    this.panelOpen = open;
    document.body.classList.toggle("mp-open", !!open);
    this.panel?.remove(); this.panel = null;
    if (!open) return;
    this.panel = h(`<div class="music-panel glass dense" role="dialog" aria-label="Music"></div>`);
    this.player.parentElement.append(this.panel);
    this.render();
  }
  render() {
    const tr = this.current, p = this.player;
    const spirit = this.ctx.spiritual && !(tr && this._allowedInSpirit(tr) && this.playing);
    const adhan = this.adhan?.audio;
    $(".meta b", p).textContent = adhan ? "🕌 " + t("adhan") : spirit ? t("silentMode") : tr ? tr.title : t("music");
    $(".meta span", p).textContent = adhan ? L(this.ctx.city?.name) || "" : tr ? (tr.kind === "gen" ? t("generative") : tr.artist || t("uploaded")) : t("smartHint");
    p.classList.toggle("adhan", !!adhan);
    $(".art", p).classList.toggle("sp", tr?.kind === "sp");
    $("[data-a=toggle]", p).innerHTML = this.playing || adhan ? ICON.pause : ICON.play;
    if (!this.panel) return;
    const P = this.panel;
    P.innerHTML = `
      <div class="mp-head"><h3 class="display">${t("music")}</h3><button class="icon-btn" data-x aria-label="${t("close")}">${ICON.x}</button></div>
      <div class="mp-tabs">${["now", "songs", "playlist", "library", "upload"].map((k) => `<button data-tab="${k}" class="${this.tab === k ? "on" : ""}">${t(k === "now" ? "nowPlaying" : k)}</button>`).join("")}</div>
      <div class="mp-body">${this["_tab_" + this.tab]()}</div>`;
    $("[data-x]", P).onclick = () => this.openPanel(false);
    $$("[data-tab]", P).forEach((b) => (b.onclick = () => { this.tab = b.dataset.tab; this.render(); }));
    this["_bind_" + this.tab]?.(P);
  }
  _trackRow(tr, i, inQueue) {
    const on = this.current?.id === tr.id, yt = tr.kind === "sp";
    const cityName = (k) => esc(L(this.cities.find((c) => c.key === k)?.name) || k);
    const tag = tr.kind === "gen" ? `<span class="tag">∞</span>`
      : yt && tr.cat ? `<span class="tag">${SONG_CATS[tr.cat]?.flag || ""} ${esc(L(SONG_CATS[tr.cat]) || "")}</span>`
      : `<span class="tag">${tr.city === "any" ? t("any") : cityName(tr.city)}${tr.season !== "any" ? " · " + t(tr.season) : ""}</span>`;
    const hue = yt ? [...tr.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7) : tr.hue ?? 40;
    const thumb = yt ? `style="background:linear-gradient(140deg,hsl(${hue} 55% 42%),hsl(${(hue + 50) % 360} 60% 22%))"` : `style="background:hsla(${hue},60%,50%,.18)"`;
    const act = inQueue ? `<button class="icon-btn del" data-rm="${i}" aria-label="remove">${ICON.x}</button>`
      : tr.kind === "file" || tr.own ? `<button class="icon-btn del" data-del="${esc(tr.id)}" aria-label="delete">${ICON.trash}</button>` : "";
    const fav = yt ? `<button class="icon-btn fav ${this.isFav(tr.id) ? "on" : ""}" data-fav="${esc(tr.id)}" aria-label="${t("favorites")}">${this.isFav(tr.id) ? ICON.heartOn : ICON.heart}</button>` : "";
    const q = yt && !inQueue ? `<button class="icon-btn del" data-q="${esc(tr.id)}" aria-label="${t("addQueue")}" title="${t("addQueue")}">${ICON.plus}</button>` : "";
    return `<div class="track ${on ? "on" : ""} ${yt ? "song" : ""}" data-id="${esc(tr.id)}" role="button" tabindex="0">
      <div class="n" ${thumb}>${on && this.playing ? '<span class="eq"><i></i><i></i><i></i></span>' : tr.kind === "gen" ? "✦" : yt ? `<em>${esc(SONG_CATS[tr.cat]?.flag || "♫")}</em>` : "♪"}</div>
      <div class="tt"><b>${esc(tr.title)}</b><span>${tr.kind === "gen" ? t("generative") : esc(tr.artist || t("uploaded"))}</span></div>${tag}${fav}${q}${act}
    </div>`;
  }
  _tab_now() {
    const spirit = this.ctx.spiritual, quiet = spirit && !(this.current && this._allowedInSpirit(this.current));
    const tr = quiet ? null : this.current, adhanOn = !!this.adhan?.audio;
    return `<div class="now">
      <canvas class="viz" width="760" height="220"></canvas>
      <div class="title">${esc(quiet ? (adhanOn ? t("adhan") : t("silentMode")) : tr?.title || t("smart"))}</div>
      <div class="sub">${quiet ? esc(L(this.ctx.city?.name) || "") : tr ? (tr.kind === "gen" ? t("generative") + " · " + (this.ctx.city ? L(this.ctx.city.name) : "") + " · " + t(this.ctx.season) : esc(tr.artist || t("uploaded"))) : t("smartHint")}</div>
      ${SILENT_CITIES.has(this.ctx.city?.key) ? `<div class="adhan-box">
        <div class="ar" lang="ar" dir="rtl">اللّٰهُ أَكْبَر</div>
        <p>${t("adhanNote")}</p>
        <button class="btn ${this.adhan?.audio ? "btn-ghost" : "btn-gold"}" data-p="adhan">${this.adhan?.audio ? t("adhanStop") : "🕌 " + t("adhanPlay")}</button>
        <div class="faint" style="font-size:11px;margin-top:8px"><a href="${ADHAN.page}" target="_blank" rel="noopener">${ADHAN.credit}</a></div></div>` : ""}
      ${tr?.kind === "sp" ? `<div class="song-acts">
        ${this.ctx.city && !SILENT_CITIES.has(this.ctx.city.key) && this.songStamp ? `<button class="chip-btn ${this.songStamp.get(this.ctx.city.key)?.id === tr.id ? "on" : ""}" data-p="stamp">${ICON.stamp} ${this.songStamp.get(this.ctx.city.key)?.id === tr.id ? t("stampedSong") : t("stampSong")}</button>` : ""}
        <a class="chip-btn" href="${tr.sp ? `https://open.spotify.com/track/${esc(tr.sp)}` : `https://open.spotify.com/search/${encodeURIComponent(tr.artist + " " + tr.title)}`}" target="_blank" rel="noopener">${ICON.sp} ${t("openSp")}</a></div>
        <div class="faint sp-hint">${this.voice instanceof SPVoice ? t("spHint") : t("pvHint")}</div>` : ""}
      ${tr?.kind === "file" || tr?.kind === "sp" ? `<div class="seek"><span data-cur>0:00</span><input type="range" min="0" max="1000" value="0" data-seek><span data-dur>0:00</span></div>` : ""}
      <div class="transport">
        <button class="icon-btn ${this.prefs.shuffle ? "on" : ""}" data-p="shuffle" aria-label="${t("shuffle")}">${ICON.shuffle}</button>
        <button class="icon-btn" data-p="prev">${ICON.prev}</button>
        <button class="icon-btn big" data-p="toggle">${this.playing ? ICON.pause : ICON.play}</button>
        <button class="icon-btn" data-p="next">${ICON.next}</button>
        <button class="icon-btn ${this.prefs.repeat ? "on" : ""}" data-p="repeat" aria-label="${t("repeat")}">${ICON.repeat}</button>
      </div>
      <div class="sliders">
        <label class="slider-row master">${t("masterVol")}<input type="range" min="0" max="100" value="${this.prefs.muted ? 0 : Math.round(this.prefs.master * 100)}" data-s="master"><span>${this.prefs.muted ? 0 : Math.round(this.prefs.master * 100)}</span></label>
        <label class="slider-row">${t("musicVol")}<input type="range" min="0" max="100" value="${this.prefs.vol * 100}" data-s="vol"><span>${Math.round(this.prefs.vol * 100)}</span></label>
        <label class="slider-row">${t("ambVol")}<input type="range" min="0" max="100" value="${this.prefs.amb * 100}" data-s="amb"><span>${Math.round(this.prefs.amb * 100)}</span></label>
        <label class="slider-row">${t("crossfade")}<input type="range" min="0" max="12" value="${this.prefs.xfade}" data-s="xfade"><span>${this.prefs.xfade}s</span></label>
      </div>
      <div class="toggle-row" style="margin-top:12px"><div><b>${t("songsMode")}</b><div class="faint">${t("songsHint")}</div></div><button class="switch ${this.prefs.songs ? "on" : ""}" data-p="songs" aria-label="${t("songsMode")}"></button></div>
      <div class="toggle-row" style="margin-top:12px"><div><b>${t("fullSongs")}</b><div class="faint">${t("fullHint")}</div></div><button class="switch ${this.prefs.full ? "on" : ""}" data-p="full" aria-label="${t("fullSongs")}"></button></div>
      <div class="toggle-row" style="margin-top:12px"><div><b>🕌 ${t("adhanAuto")}</b><div class="faint">${t("adhanAutoHint")}</div></div><button class="switch ${this.prefs.adhan ? "on" : ""}" data-p="adhanpref" aria-label="${t("adhanAuto")}"></button></div>
      <div class="faint keys-hint">${t("volKeys")}</div>
      <div class="toggle-row" style="margin-top:12px"><div><b>${t("smart")}</b><div class="faint">${t("smartHint")}</div></div><button class="switch ${this.prefs.smart ? "on" : ""}" data-p="smart" aria-label="${t("smart")}"></button></div>
    </div>`;
  }
  _bind_now(P) {
    $$("[data-p]", P).forEach((b) => (b.onclick = () => {
      const a = b.dataset.p;
      if (a === "toggle") this.toggle(); else if (a === "next") this.next(); else if (a === "prev") this.prev();
      else if (a === "adhan") { this.adhan?.audio ? this.stopAdhan() : this.playAdhan(); }
      else if (a === "stamp") this.stampSong(this.ctx.city?.key, this.current, false);
      else if (a === "adhanpref") { this.prefs.adhan = !this.prefs.adhan; this._save(); if (!this.prefs.adhan) this.stopAdhan(); else this.render(); }
      else if (a === "full") { this.prefs.full = !this.prefs.full; this._save(); if (this.playing && this.current?.kind === "sp") this.playTrack(this.current, { fromQueue: true }); else this.render(); }
      else { this.prefs[a] = !this.prefs[a]; this._save(); if ((a === "smart" || a === "songs") && this.prefs.smart && this.playing) this.playSmart(); this.render(); }
    }));
    $$("[data-s]", P).forEach((r) => (r.oninput = () => {
      const k = r.dataset.s;
      if (k === "master") { this.setVolume(r.value / 100, { hud: false }); r.nextElementSibling.textContent = r.value; return; }
      this.prefs[k] = k === "xfade" ? +r.value : r.value / 100; this._save(); this._applyVol();
      r.nextElementSibling.textContent = k === "xfade" ? r.value + "s" : r.value;
    }));
    const sk = $("[data-seek]", P);
    if (sk && (this.voice instanceof SPVoice || this.voice instanceof PreviewVoice)) {
      const v = this.voice, fmt = (s) => (isFinite(s) ? `${(s / 60) | 0}:${String((s % 60) | 0).padStart(2, "0")}` : "0:00");
      sk.oninput = () => { if (v.duration) v.seek((sk.value / 1000) * v.duration); };
      clearInterval(this._seekT);
      this._seekT = setInterval(() => {
        if (!sk.isConnected) return clearInterval(this._seekT);
        if (v.duration) sk.value = (v.time / v.duration) * 1000;
        $("[data-cur]", P).textContent = fmt(v.time); $("[data-dur]", P).textContent = fmt(v.duration);
      }, 500);
    }
    else if (sk && this.voice instanceof FileVoice) {
      const a = this.voice.audio, fmt = (s) => (isFinite(s) ? `${(s / 60) | 0}:${String((s % 60) | 0).padStart(2, "0")}` : "0:00");
      sk.oninput = () => { if (a.duration) a.currentTime = (sk.value / 1000) * a.duration; };
      clearInterval(this._seekT);
      this._seekT = setInterval(() => {
        if (!sk.isConnected) return clearInterval(this._seekT);
        if (a.duration) sk.value = (a.currentTime / a.duration) * 1000;
        $("[data-cur]", P).textContent = fmt(a.currentTime); $("[data-dur]", P).textContent = fmt(a.duration);
      }, 500);
    }
  }
  _songList() {
    const c = this.ctx.city, q = this.songQ.trim().toLowerCase();
    let list = this.songCat === "city" ? (c ? this.citySongs(c.key) : []) : this.songCat === "fav" ? this.songs.filter((s) => this.isFav(s.id))
      : this.songCat === "all" ? this.songs : this.songCat === "mine" ? this.uploaded.filter((u) => u.kind === "sp") : this.songs.filter((s) => s.cat === this.songCat);
    if (q) list = this.songs.filter((s) => (s.title + " " + s.artist).toLowerCase().includes(q));
    return list;
  }
  _tab_songs() {
    const c = this.ctx.city, list = this._songList();
    const chips = [["city", `📍 ${c ? esc(L(c.name)) : t("thisCity")}`], ["fav", `♥ ${t("favorites")}`], ["all", t("allSongs")],
      ...Object.entries(SONG_CATS).map(([k, v]) => [k, `${v.flag} ${esc(L(v))}`])];
    if (this.uploaded.some((u) => u.kind === "sp")) chips.splice(3, 0, ["mine", `★ ${t("uploaded")}`]);
    return `<div class="song-tools">
        <div class="field search-s"><input data-sq value="${esc(this.songQ)}" placeholder="${t("searchSongs")}" autocomplete="off"></div>
        <div class="filters scroll">${chips.map(([k, n]) => `<button data-sc="${k}" class="${this.songCat === k && !this.songQ ? "on" : ""}">${n}</button>`).join("")}</div>
      </div>
      ${this.songCat === "city" && c && !this.songQ ? `<div class="faint city-pl">♫ ${esc(L(c.name))} — ${t("cityPlaylist")} · ${list.length}</div>` : ""}
      <div data-sl>${list.length ? list.map((s) => this._trackRow(s)).join("") : `<p class="faint" style="padding:12px">${this.ctx.spiritual ? t("silentMode") : t("noSongsCity")}</p>`}</div>
      <div class="sp-add"><label>${ICON.sp} ${t("addSp")}</label>
        <div class="join-row field"><input data-yt placeholder="${t("spPh")}" inputmode="url" autocomplete="off"><button class="btn btn-ghost" data-yta>${t("ytAdd")}</button></div></div>
      <p class="faint" style="padding:8px 4px 0;font-size:11px">${t("spNote")}</p>`;
  }
  _bind_songs(P) {
    const sq = $("[data-sq]", P);
    sq.oninput = () => { this.songQ = sq.value; const sl = $("[data-sl]", P); const list = this._songList(); sl.innerHTML = list.map((s) => this._trackRow(s)).join("") || `<p class="faint" style="padding:12px">—</p>`; this._bindRows(sl); };
    $$("[data-sc]", P).forEach((b) => (b.onclick = () => { this.songCat = b.dataset.sc; this.songQ = ""; this.render(); }));
    this._bindRows(P);
    const add = async () => {
      const inp = $("[data-yt]", P), url = inp.value.trim(); if (!url) return inp.focus();
      const btn = $("[data-yta]", P); btn.disabled = true;
      try {
        // already in the catalogue or already added? play that one instead of creating a duplicate
        const sid = (url.match(/track[/:]([A-Za-z0-9]{22})/) || [])[1];
        const have = sid && (SONGS.find((x) => x.sp === sid) || this.uploaded.find((x) => x.sp === sid));
        if (have) { toast(t("spHave") + ": " + have.title); inp.value = ""; btn.disabled = false; return this.playTrack(have); }
        const tr = await api(`journey/${this.getCode()}/tracks`, { body: { spotify: url, city: this.ctx.city?.key || "any", season: "any" } });
        if (tr.dup || this.uploaded.some((x) => x.id === tr.id)) { toast(t("spHave") + ": " + tr.title); btn.disabled = false; return this.playTrack(this.uploaded.find((x) => x.id === tr.id) || tr); }
        this.uploaded.push(tr); toast(t("spAdded") + ": " + tr.title); track("song_add", { city: this.ctx.city?.key, d: { title: tr.title } });
        this.songCat = "mine"; this.render(); this.playTrack(tr);
      } catch { toast(t("spBad")); btn.disabled = false; }
    };
    $("[data-yta]", P).onclick = add;
    $("[data-yt]", P).onkeydown = (e) => e.key === "Enter" && add();
  }
  _bindRows(root) {
    $$(".track", root).forEach((el) => (el.onclick = async (e) => {
      const tr = this.songs.find((x) => x.id === el.dataset.id); if (!tr) return;
      if (e.target.closest("[data-fav]")) { this.toggleFav(tr.id); const b = e.target.closest("[data-fav]"); b.classList.toggle("on"); b.innerHTML = this.isFav(tr.id) ? ICON.heartOn : ICON.heart; return; }
      if (e.target.closest("[data-q]")) { this.queue.push(tr); toast(t("added") + ": " + tr.title); return; }
      if (e.target.closest("[data-del]")) {
        try { await api(`journey/${this.getCode()}/tracks/${tr.id.slice(1)}/delete`, { method: "POST", body: {} }); } catch {}
        this.uploaded = this.uploaded.filter((x) => x !== tr); this.queue = this.queue.filter((x) => x !== tr); return this.render();
      }
      this.queueCity = null; this.playTrack(tr);
    }));
  }
  _tab_playlist() {
    if (!this.queue.length) return `<p class="faint" style="padding:12px">${t("empty")}</p>`;
    return this.queue.map((tr, i) => this._trackRow(tr, i, true)).join("");
  }
  _bind_playlist(P) {
    $$(".track", P).forEach((el, i) => (el.onclick = (e) => {
      if (e.target.closest("[data-rm]")) { this.queue.splice(i, 1); if (i < this.idx) this.idx--; else if (i === this.idx) this.idx = Math.min(this.idx, this.queue.length - 1); return this.render(); }
      this.idx = i; this.playTrack(this.queue[i], { fromQueue: true });
    }));
  }
  _tab_library() {
    const c = this.ctx.city;
    const F = [["all", t("any")], ["gen", t("generative")], ["file", t("uploaded")], ...(c ? [["city", L(c.name)]] : [])];
    let list = this.tracks;
    if (this.filter === "gen") list = this.generative; else if (this.filter === "file") list = this.uploaded;
    else if (this.filter === "city" && c) list = this.tracks.filter((x) => (x.kind === "gen" ? x.mood === c.mood : x.city === c.key || x.city === "any"));
    return `<div class="filters">${F.map(([k, n]) => `<button data-f="${k}" class="${this.filter === k ? "on" : ""}">${esc(n)}</button>`).join("")}</div>
      ${list.length ? list.map((tr) => this._trackRow(tr)).join("") : `<p class="faint" style="padding:12px">${t("noTracks")}</p>`}`;
  }
  _bind_library(P) {
    $$("[data-f]", P).forEach((b) => (b.onclick = () => { this.filter = b.dataset.f; this.render(); }));
    $$(".track", P).forEach((el) => (el.onclick = async (e) => {
      const del = e.target.closest("[data-del]");
      const tr = this.tracks.find((x) => x.id === el.dataset.id);
      if (del) {
        try { await api(`journey/${this.getCode()}/tracks/${tr.id.slice(1)}/delete`, { method: "POST", body: {} }); } catch {}
        this.uploaded = this.uploaded.filter((x) => x !== tr); this.queue = this.queue.filter((x) => x !== tr);
        if (this.current == null) this.idx = this.queue.length - 1;
        return this.render();
      }
      this.playTrack(tr);
    }));
  }
  _tab_upload() {
    const c = this.ctx.city;
    return `<div class="drop" data-drop>
        <div class="big">♫</div><div><b>${t("dropHere")}</b></div>
        <div class="faint">${t("orPick")} · ${t("formats")}</div>
        <input type="file" accept="audio/*,.mp3,.ogg,.m4a,.wav,.flac,.opus" multiple class="sr" id="mp-file">
      </div>
      <div class="grid2" style="padding:0 4px">
        <div class="field"><label>${t("tagCity")}</label><select data-city><option value="any">${t("any")}</option>${this.cities.map((x) => `<option value="${x.key}" ${c?.key === x.key ? "selected" : ""}>${esc(L(x.name))}</option>`).join("")}</select></div>
        <div class="field"><label>${t("tagSeason")}</label><select data-season><option value="any">${t("any")}</option>${["spring", "summer", "autumn", "winter"].map((s) => `<option value="${s}">${t(s)}</option>`).join("")}</select></div>
      </div>
      <div class="field" style="padding:10px 4px 0"><label>Artist</label><input data-artist maxlength="120"></div>
      <div class="upl-list" data-ul></div>
      <p class="faint" style="padding:10px 4px 0">${t("rightsNote")}</p>`;
  }
  _bind_upload(P) {
    const drop = $("[data-drop]", P), input = $("#mp-file", P);
    drop.onclick = () => input.click();
    input.onchange = () => this._upload([...input.files], P);
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
    drop.ondragleave = () => drop.classList.remove("over");
    drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove("over"); this._upload([...e.dataTransfer.files].filter((f) => f.type.startsWith("audio/") || /\.(mp3|ogg|m4a|wav|flac|opus)$/i.test(f.name)), P); };
  }
  async _upload(files, P) {
    const code = this.getCode(); if (!code || !files.length) return;
    const city = $("[data-city]", P).value, season = $("[data-season]", P).value, artist = $("[data-artist]", P).value;
    for (const f of files) {
      const row = h(`<div class="upl"><span style="max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</span><div class="bar"><i></i></div><span data-pc>0%</span></div>`);
      $("[data-ul]", P)?.append(row);
      const fd = new FormData(); fd.append("file", f); fd.append("title", f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
      fd.append("artist", artist); fd.append("city", city); fd.append("season", season);
      try {
        const tr = await upload(`journey/${code}/tracks`, fd, (p) => { $("i", row).style.width = p * 100 + "%"; $("[data-pc]", row).textContent = Math.round(p * 100) + "%"; });
        this.uploaded.push(tr); this.queue.push(tr);
        $("[data-pc]", row).textContent = "✓"; toast(t("uploadedOk") + ": " + tr.title);
      } catch (e) { $("[data-pc]", row).textContent = "✕"; toast(String(e.message).slice(0, 80)); }
    }
  }
  _viz() {
    const draw = () => {
      requestAnimationFrame(draw);
      if (document.hidden) return;
      const ytOn = this.voice instanceof SPVoice && this.playing && !SPP.state.paused;
      if (!this.e.analyser && !ytOn) return;
      const data = (this._fft ||= new Uint8Array(this.e.analyser?.frequencyBinCount || 1024));
      if (ytOn) { // the embedded player's audio is cross-origin, so draw a gentle synthetic spectrum
        const tt = performance.now() / 1000;
        for (let i = 0; i < data.length; i++) { const f = i / data.length; data[i] = 255 * Math.max(0, (0.55 - f * 0.5) * (0.6 + 0.4 * Math.sin(tt * (2.1 + f * 7) + i * 0.37) * Math.sin(tt * 1.3 + i * 0.11))); }
      } else this.e.analyser.getByteFrequencyData(data);
      const hue = this.current?.hue ?? 40;
      for (const cv of [$(".art canvas", this.player), this.panel && $("canvas.viz", this.panel)]) {
        if (!cv) continue;
        const x = cv.getContext("2d"), w = (cv.width = cv.clientWidth * 2 || 84), hh = (cv.height = cv.clientHeight * 2 || 84);
        const bars = cv.classList.contains("viz") ? 48 : 7, bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255;
          const g = x.createLinearGradient(0, hh, 0, hh - v * hh);
          g.addColorStop(0, `hsla(${hue},70%,62%,.9)`); g.addColorStop(1, `hsla(${hue + 30},90%,85%,.95)`);
          x.fillStyle = g; const bh = Math.max(2, v * hh * 0.9);
          x.beginPath();
          if (x.roundRect) x.roundRect(i * bw + bw * 0.18, hh - bh, bw * 0.64, bh, bw * 0.3); else x.rect(i * bw + bw * 0.18, hh - bh, bw * 0.64, bh);
          x.fill();
        }
      }
    };
    draw();
  }
}
