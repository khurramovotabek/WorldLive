// WorldLive — City scene: cinematic place exploration, atmosphere, taste, memories, studio, 3D
import { $, $$, api, emit, esc, flag, h, hourIn, timeIn, toast } from "./core.js";
import { profile, SEASONS, TODS, Weather } from "./atmosphere.js";
import { getLang, L, t } from "./i18n.js";
import { moodLine, placeLine } from "./aphorisms.js";
import { deck } from "./sayings.js";
import { PRAYERS, PRAYER_NAMES, clockIn, nextPrayer, prayerTimes } from "./prayer.js";
import { track } from "./track.js";
import { NightLights, towerOf } from "./lights.js";
import { planFor } from "./plans.js";

const CAT_ICON = { mosque: "🕌", sacred: "🕋", heritage: "🏛️", square: "⛲", bazaar: "🧺", tower: "🗼", museum: "🖼️", monument: "🏛️", district: "🏘️", street: "🛣️",
  water: "🌊", palace: "🏰", bridge: "🌉", nature: "🌿", mountain: "⛰️", waterfall: "💧", island: "🏝️", beach: "🏖️", city: "🏙️", village: "🏘️", science: "🔭",
  glacier: "🧊", architecture: "🏢", park: "🌳", show: "⛲", desert: "🏜️" };

export class CityScene {
  constructor({ root, music, journey, onBack, onAtmos }) {
    this.root = root; this.music = music; this.journey = journey; this.onBack = onBack; this.onAtmos = onAtmos;
    root.innerHTML = `
      <div class="scene-photo kb" data-a></div><div class="scene-photo kb b" data-b></div>
      <div class="grade"></div><div class="grade2"></div><div class="aurora"></div>
      <canvas id="fx"></canvas><div class="scene-shade"></div>
      <div class="scene-top">
        <button class="icon-btn glass" data-back aria-label="${t("backGlobe")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg></button>
        <button class="secret-spark" data-secret hidden aria-label="🎁"><span>🎁</span></button>
        <button class="plan-btn glass pill" data-plan>📖 <span>${t("dayPlan")}</span></button>
        <button class="fly-btn glass pill" data-fly>✈ <span>${t("flyElsewhere")}</span></button>
        <div class="scene-title"><div class="eyebrow" data-country></div><div class="display" data-city></div><div class="level-tag glass pill" data-level></div></div>
      </div>
      <div class="spirit-banner glass dense hidden" data-spirit></div>
      <div class="prayer-card glass dense hidden" data-prayer></div>
      <nav class="rail glass dense" data-rail></nav>
      <button class="snav prev glass" data-sprev aria-label="‹">‹</button><button class="snav next glass" data-snext aria-label="›">›</button>
      <div class="tour glass pill" data-tour>
        <button data-tp aria-label="pause"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button>
        <span class="tour-ring"><i data-tring></i></span><b data-tt>0:45</b>
        <button data-tdur title="${t("tourDur")}">45s</button>
        <button data-tn aria-label="next">${t("nextPlace")} ›</button>
      </div>
      <div class="place-card glass dense" data-card></div>
      <div class="quote" data-quote><blockquote></blockquote><div class="by"></div></div>
      <nav class="scene-tabs glass pill" data-tabs></nav>`;
    this.weather = new Weather($("#fx", root));
    this.lights = new NightLights(root); $(".aurora", root).after(this.lights.cv);
    this.layerA = $("[data-a]", root); this.layerB = $("[data-b]", root); this.front = this.layerA;
    $("[data-back]", root).onclick = () => this.onBack();
    $("[data-fly]", root).onclick = () => this.onBack({ pick: true });
    $("[data-secret]", root).onclick = () => emit("gift:secret", this.city);
    $("[data-plan]", root).onclick = () => this.plan();
  }

  /** Makkah · Madinah: today's real prayer times in local time, the next one counting down */
  _prayer() {
    const el = $("[data-prayer]", this.root), c = this.city;
    clearInterval(this._prayerT);
    el.classList.toggle("hidden", !c?.spiritual);
    if (!c?.spiritual) return;
    const draw = () => {
      if (this.city !== c) return clearInterval(this._prayerT);
      const now = new Date(), tz = c.tz ?? 3, T = prayerTimes(c.lat, c.lng, tz, now), nx = nextPrayer(c, now);
      const N = PRAYER_NAMES[getLang()] || PRAYER_NAMES.en, left = Math.max(0, nx.at - now), hh = (left / 36e5) | 0, mm = Math.ceil((left % 36e5) / 6e4);
      el.innerHTML = `<div class="pc-h"><span>🕌 ${t("prayerTimes")}</span><b>${t("localTimeOf", { city: L(c.name) })} ${clockIn(now, tz)}</b></div>
        <div class="pc-row">${PRAYERS.map((k) => `<div class="pt ${k === nx.key ? "next" : ""} ${k === "sunrise" ? "sun" : ""}"><span>${N[k]}</span><b>${clockIn(T[k], tz)}</b></div>`).join("")}</div>
        <div class="pc-next">${t("nextPrayerIn", { name: N[nx.key], left: hh ? t("hm", { h: hh, m: mm }) : t("m", { m: mm }) })}</div>`;
    };
    draw(); this._prayerT = setInterval(draw, 20000);
  }

  open(city, { season, tod, atIndex = 0 } = {}) {
    this.city = city; this.idx = -1; this.tab = "places";
    this.season = season; this.tod = tod;
    const r = this.root;
    $("[data-country]", r).textContent = `${flag(city.country)}  ${L(window.WL.world.countries[city.country])}`;
    $("[data-city]", r).textContent = L(city.name);
    $("[data-level]", r).innerHTML = `◉ ${t("cinematic")}`;
    const sp = $("[data-spirit]", r);
    sp.classList.toggle("hidden", !city.spiritual); sp.textContent = t("spiritual");
    this._prayer();
    $("[data-rail]", r).innerHTML = city.attractions.map((a, i) => `<button data-i="${i}" title="${esc(L(a.names))}" style="background-image:url('${esc(a.photo?.src?.replace(/\/\d+px-/, "/250px-") || "")}')">${a.photo ? "" : `<span class="ic">${CAT_ICON[a.category] || "📍"}</span>`}</button>`).join("");
    $$("[data-rail] button", r).forEach((b) => (b.onclick = () => { this.show(+b.dataset.i); emit("scene:place", +b.dataset.i); }));
    this._tabs();
    r.classList.add("on");
    this.weather.start();
    this.show(Math.min(atIndex, city.attractions.length - 1), true);
    this.setAtmos(season, tod);
    clearInterval(this._qT); this._quote(true); this._qT = setInterval(() => this._quote(), 14000);
    // preload the rest quietly
    setTimeout(() => city.attractions.forEach((a) => { if (a.photo) new Image().src = a.photo.src; }), 2500);
  }
  close() { this.root.classList.remove("on"); this.weather.stop(); this.lights.stop(); clearInterval(this._qT); clearInterval(this._tourT); clearInterval(this._lightT); this.city = null; }
  /** “a day in the city”: step through a real-life itinerary together */
  plan() {
    const ex = $(".plan", this.root); if (ex) return ex.remove();
    const c = this.city, steps = planFor(c), lang = getLang();
    this._planDone ||= {};
    const done = (this._planDone[c.key] ||= new Set());
    const el = h(`<div class="plan glass"><div class="eyebrow">${t("dayPlan")} · ${esc(L(c.name))}</div>
      <ol>${steps.map((s, i) => `<li class="${done.has(i) ? "done" : ""}"><button data-st="${i}"><span class="ic">${s.ic}</span><span class="tx"><small>${t(s.tod)}</small>${esc(s.title[lang] || s.title.en)}</span><span class="ck">${done.has(i) ? "✓" : "›"}</span></button></li>`).join("")}</ol></div>`);
    this.root.append(el);
    $$("[data-st]", el).forEach((b) => (b.onclick = () => {
      const i = +b.dataset.st, s = steps[i], idx = c.attractions.findIndex((a) => a.id === s.place);
      done.add(i); b.parentElement.classList.add("done"); $(".ck", b).textContent = "✓";
      if (idx >= 0) { this.show(idx); emit("scene:place", idx); }
      emit("plan:step", s);
      track("plan", { city: c.key, d: { step: i, place: s.place } });
      if (s.act === "photo") setTimeout(() => this.studio(), 900);
      if (s.act === "note") setTimeout(() => this.setTab("journal"), 900);
      if (s.act?.startsWith("gift:")) setTimeout(() => emit("gift:compose", { city: c, item: s.act.slice(5) }), 900);
      if (innerWidth < 680) el.remove();
    }));
  }
  /** night lights for the current place; the Eiffel Tower sparkles like the real one */
  _lights() {
    if (!this.city) return;
    const a = this.place, tod = this.prof?.tod || this.tod;
    // real Paris: 5 minutes at the top of every hour after dusk — here also 12 s every minute so nobody misses it
    const pm = +new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", minute: "numeric" }).format(new Date());
    const sparkleNow = pm < 5 || new Date().getSeconds() < 12;
    this.lights.set({ tod, place: a?.id, sparkleNow });
    const tw = towerOf(a?.id), night = tod === "night" || tod === "evening";
    if (tw?.sparkle && night && sparkleNow && !this._sparkToast) { this._sparkToast = true; toast("✨ " + t("sparkle")); }
    if (!sparkleNow) this._sparkToast = false;
  }
  // ------------------------------------------------ guided tour: each photo stays `dur` seconds, then the next place
  _tourInit() {
    if (this._tourReady) return; this._tourReady = true;
    const r = this.root, DURS = [15, 30, 45, 60];
    this.tourDur = +(localStorage.getItem("wl-tour") || 45); this.tourOn = localStorage.getItem("wl-tour-on") !== "0";
    const step = (d) => { if (!this.city) return; const n = this.city.attractions.length; this.show((this.idx + d + n) % n); emit("scene:place", this.idx); };
    $("[data-tn]", r).onclick = () => step(1);
    $("[data-snext]", r).onclick = () => step(1);
    $("[data-sprev]", r).onclick = () => step(-1);
    $("[data-tp]", r).onclick = () => { this.tourOn = !this.tourOn; try { localStorage.setItem("wl-tour-on", this.tourOn ? "1" : "0"); } catch {} this._tourT0 = performance.now() - this._tourEl; this._tourPaint(); };
    $("[data-tdur]", r).onclick = () => { this.tourDur = DURS[(DURS.indexOf(this.tourDur) + 1) % DURS.length]; try { localStorage.setItem("wl-tour", this.tourDur); } catch {} this._tourReset(); };
    // swipe between places on touch screens
    let sx = null, sy = 0;
    r.addEventListener("touchstart", (e) => { if (e.target.closest(".place-card, .rail, .tour, .dock, .sheet, button, input, textarea")) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    r.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1); sx = null; }, { passive: true });
    addEventListener("keydown", (e) => { if (!this.city || e.target.closest?.("input, textarea")) return; if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); if (e.key === " " && !e.target.closest?.("button")) { e.preventDefault(); $("[data-tp]", r).click(); } });
  }
  _tourReset() {
    this._tourInit(); this._tourEl = 0; this._tourT0 = performance.now(); clearInterval(this._tourT);
    this._tourT = setInterval(() => this._tourTick(), 250); this._tourPaint();
  }
  _tourTick() {
    if (!this.city) return;
    // pause while a sheet / studio / gift is open or the tab is hidden
    const busy = document.hidden || document.querySelector(".gift-wrap, .studio, .film-wrap") || this._cardOpen;
    if (!this.tourOn || busy) { this._tourT0 = performance.now() - this._tourEl; return this._tourPaint(); }
    this._tourEl = performance.now() - this._tourT0;
    if (this._tourEl >= this.tourDur * 1000) { const n = this.city.attractions.length; this.show((this.idx + 1) % n); emit("scene:place", this.idx); return; }
    this._tourPaint();
  }
  _tourPaint() {
    const r = this.root, left = Math.max(0, Math.ceil(this.tourDur - (this._tourEl || 0) / 1000)), p = Math.min(1, (this._tourEl || 0) / (this.tourDur * 1000));
    $("[data-tt]", r).textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    $("[data-tdur]", r).textContent = this.tourDur + "s";
    $("[data-tring]", r).style.setProperty("--p", p);
    $("[data-tour]", r).classList.toggle("paused", !this.tourOn);
    $("[data-tp]", r).innerHTML = this.tourOn ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>` : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const on = $("[data-rail] button.on", r); if (on) on.style.setProperty("--p", p);
  }
  get place() { return this.city?.attractions[this.idx]; }

  show(i, first) {
    if (i === this.idx || !this.city) return;
    this.idx = i;
    const a = this.city.attractions[i], src = a?.photo?.src || this.city.photo?.src || "";
    const back = this.front === this.layerA ? this.layerB : this.layerA;
    const img = new Image();
    img.onload = img.onerror = () => {
      back.style.backgroundImage = `url("${src}")`;
      back.style.animation = "none"; void back.offsetWidth; back.style.animation = "";
      back.style.opacity = 1; this.front.style.opacity = 0; this.front = back;
    };
    img.src = src;
    $$("[data-rail] button", this.root).forEach((b, k) => b.classList.toggle("on", k === i));
    if (this.tab === "places") this._card();
    track("place", { city: this.city.key, place: a?.id, d: { season: this.season } });
    if (!first) { clearInterval(this._qT); this._quote(true); this._qT = setInterval(() => this._quote(), 14000); }
    $$("[data-rail] button", this.root).forEach((b) => b.style.removeProperty("--p"));
    $("[data-rail] button.on", this.root)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    this._tourReset();
    this._lights?.();
  }

  setAtmos(season, tod) {
    this.season = season; this.tod = tod;
    if (!this.city) return;
    const p = profile(this.city, season, tod);
    this.prof = p;
    const r = this.root;
    [this.layerA, this.layerB].forEach((l) => (l.style.filter = p.grade.filter));
    $(".grade", r).style.background = `radial-gradient(120% 90% at 50% 10%, ${p.grade.soft}, transparent 70%)`;
    $(".grade2", r).style.background = p.grade.over;
    $(".aurora", r).classList.toggle("on", p.aurora);
    this.weather.set(p.particles, p.stars);
    clearInterval(this._lightT); this._lights(); this._lightT = setInterval(() => this._lights(), 1000);
    this.music.setContext({ city: this.city, season, tod: p.tod, ambience: p.amb, spiritual: this.city.spiritual });
    if (this._qi) this.refreshQuote();
    this.onAtmos?.(p);
  }

  /** place aphorism first (fits the spot + season + time), then the city's own lines */
  _quote(placeFirst) {
    if (!this.city) return;
    const song = this.music.current, playing = this.music.playing && song && song.kind !== "gen";
    const pool = deck(this.city, { placeLine: this.place && placeLine(this.place.id), season: this.season, prof: this.prof, song: playing ? song : null, songCat: song?.cat });
    if (!pool.length) return;
    if (placeFirst) this._qi = 0;
    const item = pool[this._qi++ % pool.length], el = $("[data-quote]", this.root);
    el.classList.remove("show"); void el.offsetWidth;
    el.dataset.kind = item.kind;
    $("blockquote", el).innerHTML = `“${esc(item.text)}”${item.kind === "s" ? `<button class="q-copy" data-copy title="${t("copyStatus")}" aria-label="${t("copyStatus")}">⧉</button>` : ""}`;
    const cp = $("[data-copy]", el);
    if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(item.text); toast(t("copied")); track("status_copy", { city: this.city.key, d: { text: item.text.slice(0, 120) } }); } catch {} };
    $(".by", el).innerHTML = `<span>${esc(moodLine(this.season, this.prof?.tod || this.tod, this.city.spiritual))}</span>${playing ? `<em>♪ ${esc(song.artist ? song.artist + " — " : "")}${esc(song.title)}</em>` : ""}`;
    el.classList.add("show");
    this.onQuote?.(item.text);
  }
  refreshQuote() { this._qi = Math.max(0, (this._qi || 1) - 1); this._quote(); }

  _tabs() {
    const has3d = !!window.WL.config.googleKey;
    const tabs = [["places", "📍", t("places")], ["taste", "🍽️", t("taste")], ["journal", "✍️", t("journal")], ["photo", "📸", t("photo")], ["d3", "🧭", t("city3d")]];
    const nav = $("[data-tabs]", this.root);
    nav.innerHTML = tabs.map(([k, i, n]) => `<button data-t="${k}" class="${this.tab === k ? "on" : ""}" ${k === "d3" && !has3d ? 'title="' + esc(t("noKey")) + '"' : ""}><span>${i}</span>${esc(n)}</button>`).join("");
    $$("button", nav).forEach((b) => (b.onclick = () => this.setTab(b.dataset.t)));
  }
  setTab(k) {
    track("tab", { city: this.city?.key, place: this.place?.id, d: { tab: k } });
    if (k === "photo") return this.studio();
    if (k === "d3") return this.open3D();
    this.tab = k; this._tabs();
    $(".sheet", this.root)?.remove();
    const card = $("[data-card]", this.root);
    card.classList.toggle("hidden", k !== "places");
    if (k === "places") return this._card();
    const sheet = h(`<div class="sheet glass dense"></div>`);
    this.root.append(sheet);
    k === "taste" ? this._taste(sheet) : this._journal(sheet);
  }

  _card() {
    const a = this.place, c = this.city, card = $("[data-card]", this.root);
    if (!a) return;
    if (this._cardOpen === undefined) this._cardOpen = false;
    const lang = getLang(), text = a.extract[lang] || a.extract.en || "";
    card.innerHTML = `
      <button class="pc-grip" data-grip aria-label="${t("more")}"><i></i></button>
      <div class="eyebrow">${CAT_ICON[a.category] || "📍"} ${esc(L(c.name))} · ${a.lat.toFixed(4)}°, ${a.lng.toFixed(4)}°</div>
      <blockquote class="pc-quote" data-pq>${esc(placeLine(a.id) || "")}</blockquote>
      <h3 class="display">${esc(a.names[lang] || a.names.en)}</h3>
      <p>${esc(text)}</p>
      <div class="credit">${a.photo ? `${t("photoBy")}: ${esc(a.photo.artist || "Wikimedia Commons")} · ${esc(a.photo.license)} · <a href="${esc(a.photo.page)}" target="_blank" rel="noopener">Commons</a> · ` : ""}${t("source")}: ${a.src_note?.[lang] ? `WorldLive · <a href="${esc(a.wiki)}" target="_blank" rel="noopener">Wikipedia (EN)</a>` : `<a href="${esc(a.wiki)}" target="_blank" rel="noopener">Wikipedia</a>`}</div>
      <div class="actions">
        <button class="btn btn-ghost" data-prev>←</button>
        <button class="btn btn-ghost" data-next>→</button>
        <button class="btn btn-ghost" data-photo>📸 ${t("photo")}</button>
        <button class="btn btn-ghost" data-note>✍️ ${t("note")}</button>
        <button class="btn btn-ghost" data-gift>🎁 ${t("gift")}</button>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}">🗺️ Maps</a>
      </div>`;
    const n = c.attractions.length;
    $("[data-prev]", card).onclick = () => { this.show((this.idx - 1 + n) % n); emit("scene:place", this.idx); };
    $("[data-next]", card).onclick = () => { this.show((this.idx + 1) % n); emit("scene:place", this.idx); };
    $("[data-photo]", card).onclick = () => this.studio();
    $("[data-note]", card).onclick = () => this.setTab("journal");
    $("[data-gift]", card).onclick = () => emit("gift:compose", { city: this.city });
    // mobile: a bottom sheet — collapsed shows title + aphorism, a tap / swipe up opens the full story
    card.classList.toggle("open", !!this._cardOpen);
    const toggle = (v) => { this._cardOpen = v ?? !this._cardOpen; card.classList.toggle("open", this._cardOpen); if (!this._cardOpen) card.scrollTop = 0; };
    $("[data-grip]", card).onclick = (e) => { e.stopPropagation(); toggle(); };
    card.onclick = (e) => { if (matchMedia("(max-width: 680px)").matches && !this._cardOpen && !e.target.closest("button, a")) toggle(true); };
    let y0 = null;
    card.ontouchstart = (e) => (y0 = e.touches[0].clientY);
    card.ontouchend = (e) => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (dy < -40 && !this._cardOpen) toggle(true); else if (dy > 50 && this._cardOpen && card.scrollTop <= 0) toggle(false); };
  }

  _taste(el) {
    const c = this.city;
    el.innerHTML = `<div class="eyebrow">${t("taste")} · ${esc(L(c.name))}</div>
      <h3 class="display" style="font-size:32px;margin:6px 0 0">${esc(L(c.tagline))}</h3>
      <div class="food-grid">${(c.food || []).map((f) => `<button class="food" data-f="${f.id}"><div class="e">${f.emoji}</div><b>${esc(L(f.name))}</b><p>${esc(L(f.text))}</p></button>`).join("")}</div>`;
    $$(".food", el).forEach((b) => (b.onclick = () => {
      const f = c.food.find((x) => x.id === b.dataset.f);
      b.animate([{ transform: "scale(1)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }], { duration: 500 });
      this._saveMemory("note", `${f.emoji} ${L(f.name)}`, L(c.name));
    }));
  }

  _journal(el) {
    const J = this.journey(), c = this.city;
    const today = new Date().toISOString().slice(0, 10);
    const mems = (J.memories || []).filter((m) => m.city === c.key);
    el.innerHTML = `<div class="eyebrow">${t("journal")} · ${esc(L(c.name))}</div>
      <div class="field mt"><textarea maxlength="2000" data-text placeholder="${esc(t("writeMemory"))}"></textarea></div>
      <div style="display:flex;gap:10px;align-items:end;margin-top:10px;flex-wrap:wrap">
        <label class="field" style="flex:1;min-width:160px"><label>${t("openOn")} · ${t("postcard")}</label><input type="date" min="${today}" data-date></label>
        <button class="btn btn-gold" data-save>${t("save")}</button>
      </div>
      <div class="memories">${mems.map((m) => memHTML(m)).join("") || `<p class="faint">${t("empty")}</p>`}</div>`;
    $("[data-save]", el).onclick = async () => {
      const text = $("[data-text]", el).value.trim(); if (!text) return;
      const date = $("[data-date]", el).value;
      await this._saveMemory(date ? "postcard" : "note", text, this.place ? L(this.place.names) : "", date || null);
      this._journal(el);
    };
  }
  async _saveMemory(kind, text, place, open_on = null) {
    track(kind === "postcard" ? "postcard" : kind === "photo" ? "photo" : "memory", { city: this.city?.key, place: this.place?.id, d: { len: text.length } });
    const J = this.journey();
    try {
      const m = await api(`journey/${J.code}/memory`, { body: { kind, text, city: this.city.key, place, author: window.WL.me, open_on } });
      J.memories = [m, ...(J.memories || [])];
      toast(t("saved"));
    } catch (e) { toast(e.message); }
  }

  // ------------------------------------------------------------ Memory Studio
  async studio() {
    const a = this.place, c = this.city, J = this.journey();
    const wrap = h(`<div class="modal-wrap"><div class="modal glass dense studio">
      <div class="eyebrow">${t("studioTitle")}</div><h2 class="display">${esc(L(c.name))}</h2>
      <canvas width="1600" height="1000"></canvas>
      <div class="row mt" style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost" data-close>${t("close")}</button><button class="btn btn-gold" data-dl>${t("download")}</button></div>
    </div></div>`);
    document.body.append(wrap);
    wrap.onclick = (e) => { if (e.target === wrap || e.target.closest("[data-close]")) wrap.remove(); };
    const cv = $("canvas", wrap), x = cv.getContext("2d"), W = cv.width, H = cv.height;
    const img = await loadImg(a?.photo?.src || c.photo?.src);
    x.fillStyle = "#0b0d14"; x.fillRect(0, 0, W, H);
    if (img) {
      const s = Math.max(W / img.width, H / img.height), iw = img.width * s, ih = img.height * s;
      x.filter = this.prof?.grade.filter || "none"; x.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih); x.filter = "none";
    }
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(0.45, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.82)");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // soft bokeh
    x.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) { const r = 20 + Math.random() * 70, px = Math.random() * W, py = Math.random() * H * 0.6, rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, "rgba(255,220,170,.16)"); rg.addColorStop(1, "rgba(255,220,170,0)"); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2); }
    x.globalCompositeOperation = "source-over";
    // frame
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 2; x.strokeRect(36, 36, W - 72, H - 72);
    await document.fonts.ready;
    x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 14;
    x.fillStyle = "#e9c98b"; x.font = "800 26px Manrope"; x.letterSpacing = "8px";
    x.fillText(`${(J.a + (J.b ? " & " + J.b : "")).toUpperCase()}`, 80, 110); x.letterSpacing = "0px"; x.shadowBlur = 0;
    x.fillStyle = "#fff"; x.font = "500 120px 'Cormorant Garamond'"; x.fillText(L(c.name), 76, H - 250);
    x.font = "italic 400 44px 'Cormorant Garamond'"; x.fillStyle = "rgba(255,255,255,.9)";
    // the aphorism of this exact place (falls back to a city quote)
    const q = (a && placeLine(a.id)) || L((c.quotes || [])[Math.floor(Math.random() * (c.quotes || []).length)] || "");
    if (q) wrapText(x, `“${q}”`, 80, H - 180, W - 400, 50);
    // musical postcard: the song that was playing at this moment
    const song = this.music.current, withSong = song && song.kind !== "gen" && this.music.playing && !c.spiritual;
    if (withSong) {
      const sx = W - 660, sy = 150, sw = 580, sh = 150;
      x.fillStyle = "rgba(8,10,18,.55)"; x.beginPath(); x.roundRect ? x.roundRect(sx, sy, sw, sh, 56) : x.rect(sx, sy, sw, sh); x.fill();
      x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 1.5; x.stroke();
      // vinyl
      const cx = sx + 75, cy = sy + 75;
      x.fillStyle = "#111"; x.beginPath(); x.arc(cx, cy, 54, 0, 7); x.fill();
      x.strokeStyle = "rgba(255,255,255,.12)"; for (let r = 20; r < 54; r += 6) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); }
      x.fillStyle = "#e9c98b"; x.beginPath(); x.arc(cx, cy, 17, 0, 7); x.fill(); x.fillStyle = "#111"; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill();
      x.fillStyle = "#fff"; x.font = "700 36px Manrope"; x.fillText(clip(x, song.title, 340), sx + 150, sy + 66);
      x.fillStyle = "rgba(255,255,255,.7)"; x.font = "500 26px Manrope"; x.fillText(clip(x, song.artist || "", 340), sx + 150, sy + 104);
      // little equaliser
      x.fillStyle = "#e9c98b"; for (let i = 0; i < 5; i++) { const bh = 8 + Math.abs(Math.sin(i * 1.7 + song.title.length)) * 22; x.fillRect(sx + sw - 76 + i * 10, sy + 90 - bh, 6, bh); }
    }
    x.font = "600 24px Manrope"; x.fillStyle = "rgba(255,255,255,.8)";
    x.fillText(`${flag(c.country)}  ${a ? (a.names[getLang()] || a.names.en) : ""}  ·  ${new Date().toLocaleDateString(getLang())}`, 80, H - 70);
    x.textAlign = "right"; x.font = "600 46px 'Cormorant Garamond'"; x.fillStyle = "#fff"; x.fillText("WorldLive", W - 80, 116);
    x.font = "500 15px Manrope"; x.fillStyle = "rgba(255,255,255,.55)";
    if (a?.photo) x.fillText(`Photo: ${a.photo.artist || "Wikimedia Commons"} · ${a.photo.license}`, W - 80, H - 70);
    x.textAlign = "left";
    $("[data-dl]", wrap).onclick = () => {
      try {
        cv.toBlob((b) => {
          const u = URL.createObjectURL(b), l = document.createElement("a");
          l.href = u; l.download = `WorldLive-${c.key}-${Date.now()}.png`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000);
        }, "image/png");
        this._saveMemory("photo", `📸 ${a ? L(a.names) : L(c.name)}${q ? ` — “${q}”` : ""}${withSong ? ` · ♪ ${song.artist ? song.artist + " — " : ""}${song.title}` : ""}`, a ? L(a.names) : "");
      } catch (e) { toast("Image export blocked by the photo host"); }
    };
  }

  // ------------------------------------------------------------ Level-1 3D (Google Photorealistic 3D Tiles)
  async open3D() {
    track("3d", { city: this.city?.key });
    const key = window.WL.config.googleKey;
    if (!key) return toast(t("noKey"));
    const a = this.place || this.city;
    const wrap = h(`<div id="city3d"><button class="icon-btn glass back" aria-label="${t("close")}">✕</button><div class="tag glass pill">◉ ${t("real3d")} — ${esc(a.names ? L(a.names) : L(this.city.name))}</div><div data-v style="position:absolute;inset:0"></div></div>`);
    document.body.append(wrap);
    $(".back", wrap).onclick = () => { this._viewer?.destroy(); this._viewer = null; wrap.remove(); };
    const C = await loadCesium();
    C.GoogleMaps.defaultApiKey = key;
    const v = (this._viewer = new C.Viewer($("[data-v]", wrap), {
      baseLayer: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false,
      animation: false, timeline: false, fullscreenButton: false, infoBox: false, selectionIndicator: false, globe: false, requestRenderMode: false,
    }));
    v.scene.skyAtmosphere.show = true;
    try { v.scene.primitives.add(await C.createGooglePhotorealistic3DTileset({ onlyUsingWithGoogleGeocoder: true })); }
    catch (e) { toast("3D Tiles: " + e.message); }
    const target = C.Cartesian3.fromDegrees(a.lng, a.lat, 0);
    let heading = 0;
    v.clock.onTick.addEventListener(() => {
      heading += 0.0016;
      v.camera.lookAt(target, new C.HeadingPitchRange(heading, -0.42, 650));
    });
  }
}

const memHTML = (m) => {
  const locked = m.open_on && m.open_on > new Date().toISOString().slice(0, 10);
  return `<div class="mem ${locked ? "locked" : ""}"><div class="h">${m.kind === "gift" ? "🎁" : m.kind === "postcard" ? "✉️" : m.kind === "photo" ? "📸" : "✍️"} ${esc(m.author || "")} · ${esc(m.place || "")} · ${new Date(m.date).toLocaleDateString(getLang())}</div>${locked ? esc(t("locked", { date: m.open_on })) : esc(m.text)}</div>`;
};
export { memHTML };

function loadImg(src) {
  return new Promise((res) => { if (!src) return res(null); const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
function wrapText(x, text, X, Y, maxW, lh) {
  const words = text.split(" "); let line = "", y = Y; const lines = [];
  for (const w of words) { if (x.measureText(line + w).width > maxW && line) { lines.push(line); line = ""; } line += w + " "; }
  lines.push(line);
  lines.slice(0, 3).forEach((l, i) => x.fillText(l.trim(), X, y + i * lh - (Math.min(lines.length, 3) - 1) * lh));
}
let cesiumP;
function loadCesium() {
  if (cesiumP) return cesiumP;
  const base = "https://cdn.jsdelivr.net/npm/cesium@1.139.0/Build/Cesium/";
  window.CESIUM_BASE_URL = base;
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "Widgets/widgets.css"; document.head.append(css);
  return (cesiumP = new Promise((res, rej) => { const s = document.createElement("script"); s.src = base + "Cesium.js"; s.onload = () => res(window.Cesium); s.onerror = rej; document.head.append(s); }));
}
export { SEASONS, TODS, hourIn, timeIn };

function clip(x, text, max) {
  if (x.measureText(text).width <= max) return text;
  let s = text; while (s.length > 1 && x.measureText(s + "…").width > max) s = s.slice(0, -1);
  return s + "…";
}
