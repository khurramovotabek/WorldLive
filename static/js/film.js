// WorldLive — “Bizning film”: a 60-second film of the couple's journey, made on the device.
// Passport stamps in travel order → the city's real photos (Ken Burns), its line, the stamp, and the
// song the couple stamped there (Apple Music preview), recorded with MediaRecorder into a video file.
import { $, esc, h, toast } from "./core.js";
import { getLang, L, t } from "./i18n.js";
import { CITY } from "./sayings.js";
import { placeLine } from "./aphorisms.js";
import { SONGS } from "./songs.js";
import { track } from "./track.js";

const LEN = 60, INTRO = 4.5, OUTRO = 5;
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function loadImg(src) {
  return new Promise((ok) => {
    if (!src) return ok(null);
    const im = new Image(); im.crossOrigin = "anonymous"; im.decoding = "async";
    im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src;
  });
}
const big = (src) => src && src.replace(/\/\d+px-/, "/1280px-");

function pickMime() {
  const c = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return c.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";
}

/** gather the story: one chapter per stamped city (max 10) */
async function chapters(world, journey) {
  const seen = new Set(), stamps = (journey.stamps || []).filter((s) => !seen.has(s.city) && seen.add(s.city)).slice(-10);
  const songs = journey.state?.songs || {}, lang = getLang();
  const out = [];
  for (const s of stamps) {
    const c = world.cities.find((x) => x.key === s.city); if (!c) continue;
    const pl = c.attractions.filter((a) => a.photo?.src).slice(0, 2);
    const imgs = (await Promise.all([big(c.photo?.src), ...pl.map((a) => big(a.photo.src))].map(loadImg))).filter(Boolean);
    const own = CITY[c.key]?.[2] || CITY[c.key]?.[0];
    const line = c.spiritual ? (L((c.quotes || [])[0]) || "") : (own?.[lang] || own?.en || (pl[0] && placeLine(pl[0].id)) || L((c.quotes || [])[0]) || "");
    const st = songs[c.key], meta = st && SONGS.find((x) => x.id === st.id);
    out.push({ city: c, imgs, line, song: st && !c.spiritual ? { title: st.title, artist: st.artist, it: meta?.it || null } : null });
  }
  return out;
}

function cover(ctx, im, W, H, k, dir) {
  const s = Math.max(W / im.width, H / im.height) * (1.08 + 0.1 * k);
  const w = im.width * s, hh = im.height * s;
  const x = (W - w) / 2 + (dir ? 1 : -1) * (k - 0.5) * W * 0.05, y = (H - hh) / 2 + (k - 0.5) * H * 0.03;
  ctx.drawImage(im, x, y, w, hh);
}
function wrapText(ctx, text, maxW) {
  const words = text.split(/\s+/), lines = []; let cur = "";
  for (const w of words) { const tt = cur ? cur + " " + w : w; if (ctx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tt; }
  if (cur) lines.push(cur); return lines.slice(0, 4);
}
function stamp(ctx, x, y, r, label, hue, rot, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = `hsla(${hue},60%,72%,.95)`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r - 12, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = `hsla(${hue},60%,78%,.95)`; ctx.font = `700 ${r * 0.24}px Manrope, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label.slice(0, 12), 0, -4); ctx.font = `600 ${r * 0.14}px Manrope, system-ui, sans-serif`; ctx.fillText("WORLDLIVE ✈", 0, r * 0.32);
  ctx.restore();
}

export async function makeFilm(world, journey) {
  const vertical = innerWidth < innerHeight;
  const W = vertical ? 720 : 1280, H = vertical ? 1280 : 720;
  const wrap = h(`<div class="modal-wrap film-wrap"><div class="modal glass film">
    <div class="eyebrow">🎬 ${t("filmTitle")}</div><h2 class="display">${esc(journey.a)}${journey.b ? " & " + esc(journey.b) : ""}</h2>
    <div class="film-stage ${vertical ? "v" : ""}"><canvas width="${W}" height="${H}"></canvas><div class="film-msg">${t("filmPreparing")}</div></div>
    <div class="film-bar"><i></i></div>
    <div class="film-acts"><button class="btn btn-ghost" data-close>${t("close")}</button><a class="btn btn-gold hidden" data-dl>⬇ ${t("filmDownload")}</a></div>
  </div></div>`);
  document.body.append(wrap);
  const cv = $("canvas", wrap), ctx = cv.getContext("2d"), msg = $(".film-msg", wrap), bar = $(".film-bar i", wrap);
  let stop = false, rec = null, raf = 0;
  const audios = [];
  const close = () => { stop = true; cancelAnimationFrame(raf); try { rec?.state === "recording" && rec.stop(); } catch {} audios.forEach((a) => { a.pause(); a.src = ""; }); WL.music?.duck?.(false); wrap.remove(); };
  $("[data-close]", wrap).onclick = close;

  const ch = await chapters(world, journey);
  if (stop) return;
  if (!ch.length) { msg.textContent = t("filmEmpty"); return; }
  if (!window.MediaRecorder || !cv.captureStream) { msg.textContent = t("filmUnsupported"); return; }
  msg.textContent = t("filmRecording");

  // ---- audio: the stamped songs, one per chapter, mixed into the recording (and heard live)
  const AC = window.AudioContext || window.webkitAudioContext, ac = new AC(), dest = ac.createMediaStreamDestination(), out = ac.createGain();
  out.connect(dest); out.connect(ac.destination);
  const per = (LEN - INTRO - OUTRO) / ch.length;
  const cues = [];
  ch.forEach((c, i) => {
    if (!c.song?.it) return;
    const [id, cc] = c.song.it.split(":");
    const el = new Audio(); el.crossOrigin = "anonymous"; el.preload = "auto"; el.src = `/api/preview/${id}?c=${cc || "US"}`;
    const g = ac.createGain(); g.gain.value = 0; ac.createMediaElementSource(el).connect(g).connect(out);
    audios.push(el); cues.push({ el, g, from: INTRO + i * per - (i ? 1.2 : INTRO), to: INTRO + (i + 1) * per + (i === ch.length - 1 ? OUTRO : 0) });
  });
  // a chapter without its own song keeps the previous one playing, so the film never falls silent
  cues.forEach((c, i) => (c.to = cues[i + 1] ? cues[i + 1].from + 1.2 : LEN));
  if (cues[0]) cues[0].from = 0;
  WL.music?.duck?.(true);

  const stream = cv.captureStream(30);
  dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
  const mime = pickMime(), chunks = [];
  try { rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6e6 } : undefined); }
  catch { msg.textContent = t("filmUnsupported"); return; }
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    if (stop) return;
    const type = rec.mimeType || mime || "video/webm", ext = type.includes("mp4") ? "mp4" : "webm";
    const url = URL.createObjectURL(new Blob(chunks, { type }));
    const a = $("[data-dl]", wrap); a.href = url; a.download = `WorldLive-${(journey.a || "film")}${journey.b ? "-" + journey.b : ""}.${ext}`.replace(/\s+/g, "_");
    a.classList.remove("hidden"); msg.textContent = ""; msg.classList.add("done");
    toast(t("filmReady")); track("film", { d: { cities: ch.length, ext } });
    audios.forEach((x) => x.pause()); WL.music?.duck?.(false);
  };
  await ac.resume();
  rec.start(1000);
  const t0 = performance.now(), km = (journey.state?.km || 0).toLocaleString(getLang());
  const names = `${journey.a || ""}${journey.b ? " & " + journey.b : ""}`;

  const draw = () => {
    if (stop) return;
    const T = (performance.now() - t0) / 1000;
    bar.style.width = `${Math.min(100, (T / LEN) * 100)}%`;
    // audio cues with gentle cross-fades
    for (const c of cues) {
      const on = T >= c.from && T < c.to, now = ac.currentTime;
      if (on && c.el.paused) { c.el.currentTime = 4; c.el.play().catch(() => {}); c.g.gain.setTargetAtTime(0.9, now, 0.6); }
      if (!on && !c.el.paused && T >= c.to) { c.g.gain.setTargetAtTime(0, now, 0.5); setTimeout(() => c.el.pause(), 1600); }
    }
    ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, W, H);
    const S = W / 1280 * (vertical ? 1.35 : 1);
    if (T < INTRO) {
      const im = ch[0].imgs[0], k = T / INTRO;
      if (im) { ctx.globalAlpha = 0.45 * clamp01(T / 1.2); cover(ctx, im, W, H, k, 1); ctx.globalAlpha = 1; }
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(5,7,13,.2)"); g.addColorStop(1, "rgba(5,7,13,.9)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const a = clamp01((T - 0.4) / 1.2) * (1 - clamp01((T - INTRO + 0.6) / 0.6));
      ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.fillStyle = "#e9c98b"; ctx.font = `600 ${22 * S}px Manrope, system-ui, sans-serif`;
      ctx.fillText(t("filmTitle").toUpperCase(), W / 2, H / 2 - 70 * S);
      ctx.fillStyle = "#fff"; ctx.font = `italic 500 ${78 * S}px "Cormorant Garamond", Georgia, serif`; ctx.fillText(names, W / 2, H / 2 + 10 * S);
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `500 ${22 * S}px Manrope, system-ui, sans-serif`;
      ctx.fillText(`${ch.length} ${t("cities")} · ${km} ${t("km")}`, W / 2, H / 2 + 64 * S); ctx.globalAlpha = 1;
    } else if (T < LEN - OUTRO) {
      const i = Math.min(ch.length - 1, Math.floor((T - INTRO) / per)), c = ch[i], lt = (T - INTRO - i * per) / per;
      const ims = c.imgs.length ? c.imgs : ch.find((x) => x.imgs.length)?.imgs || [];
      const n = Math.max(1, Math.min(ims.length, per > 6 ? 2 : 1)), j = Math.min(n - 1, Math.floor(lt * n)), im = ims[j];
      const fade = clamp01(lt * per / 0.8) * clamp01((1 - lt) * per / 0.6);
      if (im) { ctx.globalAlpha = fade; cover(ctx, im, W, H, (lt * n) % 1, (i + j) % 2); ctx.globalAlpha = 1; }
      const g = ctx.createLinearGradient(0, H * 0.35, 0, H); g.addColorStop(0, "rgba(5,7,13,0)"); g.addColorStop(1, "rgba(5,7,13,.85)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const ta = ease(clamp01((lt * per - 0.5) / 1)) * clamp01((1 - lt) * per / 0.7), pad = 64 * S;
      ctx.globalAlpha = ta; ctx.textAlign = "left";
      ctx.fillStyle = "#e9c98b"; ctx.font = `600 ${18 * S}px Manrope, system-ui, sans-serif`;
      ctx.fillText(`${String(i + 1).padStart(2, "0")} · ${(L(world.countries[c.city.country]) || "").toUpperCase()}`, pad, H - 250 * S);
      ctx.fillStyle = "#fff"; ctx.font = `500 ${64 * S}px "Cormorant Garamond", Georgia, serif`; ctx.fillText(L(c.city.name), pad, H - 190 * S);
      ctx.font = `italic 400 ${28 * S}px "Cormorant Garamond", Georgia, serif`; ctx.fillStyle = "rgba(255,255,255,.92)";
      wrapText(ctx, c.line ? `“${c.line}”` : "", W - pad * 2 - (vertical ? 0 : 220 * S)).forEach((ln, k) => ctx.fillText(ln, pad, H - 140 * S + k * 34 * S));
      if (c.song) { ctx.font = `600 ${18 * S}px Manrope, system-ui, sans-serif`; ctx.fillStyle = "#e9c98b"; ctx.fillText(`♪ ${c.song.artist} — ${c.song.title}`, pad, H - 34 * S); }
      ctx.globalAlpha = 1;
      const hue = [...c.city.key].reduce((a, x) => a + x.charCodeAt(0), 0) % 360;
      const sa = clamp01((lt * per - 0.9) / 0.4);
      stamp(ctx, W - 140 * S, vertical ? 200 * S : 150 * S, 82 * S * (1.6 - 0.6 * ease(sa)), (c.city.airport || L(c.city.name)).toUpperCase(), hue, ((hue % 17) - 8) * Math.PI / 180, sa * ta);
    } else {
      const k = (T - (LEN - OUTRO)) / OUTRO, a = clamp01(k / 0.25) * (1 - clamp01((k - 0.85) / 0.15));
      const im = ch[ch.length - 1].imgs[0];
      if (im) { ctx.globalAlpha = 0.3; cover(ctx, im, W, H, k, 0); ctx.globalAlpha = 1; }
      ctx.fillStyle = "rgba(5,7,13,.6)"; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a; ctx.textAlign = "center";
      ctx.fillStyle = "#fff"; ctx.font = `italic 500 ${58 * S}px "Cormorant Garamond", Georgia, serif`; ctx.fillText(t("filmEnd"), W / 2, H / 2 - 10 * S);
      ctx.fillStyle = "#e9c98b"; ctx.font = `600 ${20 * S}px Manrope, system-ui, sans-serif`; ctx.fillText(`${names} · WorldLive`, W / 2, H / 2 + 48 * S);
      ctx.globalAlpha = 1;
    }
    if (T >= LEN) { if (rec.state === "recording") rec.stop(); return; }
    raf = requestAnimationFrame(draw);
  };
  draw();
}
