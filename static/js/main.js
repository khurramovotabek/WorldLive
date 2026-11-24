// WorldLive — application orchestrator
import { $, $$, api, on, upload, distanceKm, esc, flag, flightMinutes, fmtDur, glassLight, h, seasonNow, sleep, store, timeIn, toast, todFromSun } from "./core.js";
import { Earth } from "./globe.js";
import { applyI18n, getLang, L, onLang, setLang, t } from "./i18n.js";
import { playBoarding, preloadBoarding } from "./boarding.js";
import { Music } from "./music.js";
import { CityScene, memHTML } from "./scene.js";
import { track, trackContext } from "./track.js";
import { giftItem, openComposer, presentGift, secretGift } from "./gifts.js";
import { avatar, Chat, inviteUrl, lobby, online, readInvite } from "./together.js";

const WL = (window.WL = { me: null, journey: null, role: "a", season: "auto", tod: "auto", open: (k) => openCity(byKey(k)) });
const byKey = (k) => WL.world.cities.find((c) => c.key === k);

// ----------------------------------------------------------------------------- boot
async function boot() {
  glassLight();
  applyI18n();
  const [world, config] = await Promise.all([fetch("/static/data/world.json").then((r) => r.json()), api("config").catch(() => ({}))]);
  WL.world = world; WL.config = config;
  WL.earth = new Earth($("#globe"), world);
  WL.earth.onPick = (c) => preview(c);
  WL.music = new Music({
    getCode: () => WL.journey?.code, cities: world.cities,
    // one song per city — the couple's soundtrack, collected like passport stamps
    songStamp: {
      get: (city) => WL.journey?.state?.songs?.[city],
      set: (city, rec, auto) => {
        if (!WL.journey) return;
        push({ songs: { ...(WL.journey.state.songs || {}), [city]: { ...rec, at: Date.now(), by: WL.me || "" } } });
        toast(`💿 ${t(auto ? "songStampedAuto" : "songStamped", { city: L(byKey(city)?.name) || city })} — ${rec.title}`);
      },
    },
  });
  WL.music.mount($("#ui"));
  WL.scene = new CityScene({ root: $("#scene"), music: WL.music, journey: () => WL.journey, onBack: (o) => backToGlobe(o), onAtmos: () => {} });
  buildDock(); bindAtmos(); bindTopbar(); bindIntro();
  onLang(() => { buildDock(); WL.earth.relabel(); if (WL.previewCity) preview(WL.previewCity, true); if (WL.scene.city) WL.scene.open(WL.scene.city, { season: curSeason(), tod: curTod(), atIndex: WL.scene.idx }); renderAtmos(); renderTop(); });
  setTimeout(() => $("#loader").classList.add("out"), 900);
  track("visit", { d: { ref: document.referrer ? new URL(document.referrer).hostname : "" } });
  onLang((l) => track("lang", { d: { lang: getLang() } }));
}

// ----------------------------------------------------------------------------- surprises & gifts
const partyNames = () => { const p = WL.journey?.state?.party; return Array.isArray(p) && p.length ? p.map((x) => x.name) : [WL.journey?.a, WL.journey?.b].filter(Boolean); };
const giftSeen = new Set(JSON.parse(sessionStorage.getItem("wl-gifts") || "[]"));
function saveGift(g, patch) {
  const list = (WL.journey.state.gifts || []).map((x) => (x.id === g.id ? { ...x, ...patch } : x));
  push({ gifts: list });
}
function giftMemory(g, reaction) {
  const it = giftItem(g), c = byKey(g.city);
  const text = `${it.ic} ${L(it.name)}${g.from ? " — " + g.from : ""}${g.msg ? ": “" + g.msg + "”" : ""}${reaction ? " " + reaction : ""}`;
  api(`journey/${WL.journey.code}/memory`, { body: { kind: "gift", text, city: g.city, place: c ? L(c.name) : "", author: WL.me } })
    .then((m) => { (WL.journey.memories ||= []).unshift(m); }).catch(() => {});
  track("gift", { city: g.city, d: { item: g.item, reaction, secret: !!g.secret } });
}
function checkGifts() {
  if (WL.flying || document.querySelector(".gift-wrap")) return;
  const g = (WL.journey?.state?.gifts || []).find((x) => x.to === WL.me && (x.status === "new" || x.status === "later") && !giftSeen.has(x.id));
  if (!g) return;
  giftSeen.add(g.id); sessionStorage.setItem("wl-gifts", JSON.stringify([...giftSeen]));
  presentGift(g, { cityName: L(byKey(g.city)?.name || { en: "" }), onReact: ({ status, reaction }) => {
    saveGift(g, { status, reaction, opened: Date.now() });
    if (status === "kept") { giftMemory(g, reaction); toast(`💛 ${t("giftKept")}`); }
  } });
}
on("plan:step", (s) => { WL.tod = s.tod; WL._cycTod = null; applyAtmos(); push({ tod: s.tod }); });
on("gift:compose", ({ city, item }) => openComposer({ city, item, me: WL.me, party: partyNames(), onSend: (g) => {
  push({ gifts: [...(WL.journey.state.gifts || []).slice(-60), g] });
  track("gift_send", { city: city.key, d: { item: g.item, to: g.to } });
} }));
on("gift:secret", (city) => {
  const btn = $("[data-secret]"); btn.hidden = true;
  const g = secretGift(city, WL.journey.code, partyNames().find((n) => n !== WL.me) || "WorldLive");
  presentGift(g, { cityName: L(city.name), onReact: ({ status, reaction }) => {
    if (status === "kept") { push({ secrets: { ...(WL.journey.state.secrets || {}), [city.key]: Date.now() } }); giftMemory(g, reaction); toast(`💛 ${t("giftKept")}`); }
    else btn.hidden = false;
  } });
});
/** a secret gift sparkles somewhere in each city until it has been found */
function armSecret(c) {
  const btn = $("[data-secret]"); if (!btn) return;
  btn.hidden = true; clearTimeout(WL._secT);
  if (WL.journey?.state?.secrets?.[c.key]) return;
  WL._secT = setTimeout(() => {
    if (WL.scene.city?.key !== c.key) return;
    const r = (n) => Math.abs(Math.sin(n * 9301 + c.key.length * 49297)) ;
    btn.style.left = 18 + r(1) * 60 + "%"; btn.style.top = 30 + r(2) * 30 + "%";
    btn.hidden = false;
  }, 7000);
}

// ----------------------------------------------------------------------------- travel party (up to 8)
const MAX_PARTY = 8;
/** shrink a portrait on the device (max 512 px, JPEG) before it ever leaves the phone */
function shrinkPhoto(file) {
  return new Promise((ok, no) => {
    const im = new Image(), url = URL.createObjectURL(file);
    im.onload = () => {
      const k = Math.min(1, 512 / Math.max(im.width, im.height)), c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? ok(b) : no()), "image/jpeg", 0.86);
    };
    im.onerror = () => { URL.revokeObjectURL(url); no(); };
    im.src = url;
  });
}
function partyRow(i) {
  return h(`<div class="pm extra" data-i="${i}">
    <label class="pm-ph" title="${t("photoOpt")}"><input type="file" accept="image/jpeg,image/png,image/webp" hidden><span>+</span></label>
    <div class="field"><label>${t("mateName")} ${i + 1}</label><input maxlength="40" autocomplete="off"></div>
    <div class="pm-g seg"><button type="button" data-g="m" class="${i % 2 ? "" : "on"}" aria-label="♂">♂</button><button type="button" data-g="f" class="${i % 2 ? "on" : ""}" aria-label="♀">♀</button></div>
    <button type="button" class="pm-x" aria-label="${t("remove")}">✕</button></div>`);
}
function bindParty() {
  const box = $("#party"), more = $(".party-more", box);
  const count = () => { const n = $$(".pm", box).length; $("#partyN").textContent = `${n} / ${MAX_PARTY}`; $("#addMate").disabled = n >= MAX_PARTY; };
  const wire = (row) => {
    $$(".pm-g button", row).forEach((b) => (b.onclick = () => { $$(".pm-g button", row).forEach((x) => x.classList.toggle("on", x === b)); }));
    const inp = $("input[type=file]", row), ph = $(".pm-ph", row);
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const blob = await shrinkPhoto(f); row._photo = blob;
        ph.style.backgroundImage = `url(${URL.createObjectURL(blob)})`; ph.classList.add("has");
        $("#consent").classList.remove("hidden");
      } catch { toast(t("photoBad")); }
    };
    // a second tap on a chosen photo removes it
    ph.addEventListener("click", (e) => { if (row._photo) { e.preventDefault(); row._photo = null; ph.style.backgroundImage = ""; ph.classList.remove("has"); inp.value = ""; } });
    $(".pm-x", row)?.addEventListener("click", () => { row.remove(); count(); });
  };
  $$(".pm", box).forEach(wire);
  $("#addMate").onclick = () => { const n = $$(".pm", box).length; if (n >= MAX_PARTY) return; const r = partyRow(n); box.insertBefore(r, more); wire(r); count(); $("input:not([type=file])", r).focus(); };
  count();
  // restore a saved party (names + genders; photos stay on the server)
  const saved = store.get("party");
  if (Array.isArray(saved)) saved.slice(2).forEach(() => $("#addMate").click());
  if (Array.isArray(saved)) $$(".pm", box).forEach((r, i) => { const p = saved[i]; if (!p) return; const n = $("input:not([type=file])", r); if (i > 1) n.value = p.name || ""; $$(".pm-g button", r).forEach((b) => b.classList.toggle("on", b.dataset.g === p.g)); if (p.photo) { r._url = p.photo; $(".pm-ph", r).style.backgroundImage = `url(${p.photo})`; $(".pm-ph", r).classList.add("has"); } });
}
/** read the party from the form; upload consented photos once the journey code exists */
async function collectParty(code) {
  const rows = $$("#party .pm"), consent = $("#consentBox").checked, out = [];
  for (const r of rows) {
    const name = $("input:not([type=file])", r).value.trim(); if (!name) continue;
    const g = $(".pm-g button.on", r)?.dataset.g || "m";
    let photo = r._url || null;
    if (r._photo && consent) {
      try { const fd = new FormData(); fd.append("file", r._photo, "me.jpg"); fd.append("consent", "1"); photo = (await upload(`journey/${code}/avatar`, fd)).url; r._url = photo; r._photo = null; } catch { toast(t("photoBad")); }
    } else if (r._photo && !consent) toast(t("needConsent"));
    out.push({ name: name.slice(0, 40), g, photo });
  }
  return out.slice(0, MAX_PARTY);
}

// ----------------------------------------------------------------------------- intro / journey
function bindIntro() {
  bindParty();
  const saved = store.get("journey");
  let invite = readInvite();
  const inviteMode = (inv) => {
    invite = inv;
    $("#intro").classList.add("invited");
    $(".pm[data-i='1']")?.remove(); $$(".pm.extra").forEach((x) => x.remove()); $(".party-more")?.classList.add("hidden");
    $("#inviteBanner")?.remove();
    $(".party").before(h(`<div id="inviteBanner" class="invite-banner">✈ ${esc(inv.host || "")} ${t("invitedYou")} <b>${esc(inv.code)}</b></div>`));
    $("#startBtn span").textContent = t("joinTrip");
    $("#joinToggle").classList.add("hidden");
  };
  if (invite) inviteMode(invite);
  else if (saved) { $("#nameA").value = saved.me || ""; $("#nameB").value = saved.partner?.split(", ")[0] || ""; }
  $$(".lang-switch button").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  $("#joinToggle").onclick = () => $("#joinBox").classList.toggle("hidden");
  $("#startBtn").onclick = async () => {
    const a = $("#nameA").value.trim(), b = $("#nameB")?.value.trim() || "";
    if (!a) { $("#nameA").focus(); return toast(t("needName")); }
    WL.music.unlock();
    const btn = $("#startBtn"); btn.disabled = true;
    try {
      // the same device coming back to its own journey
      if (saved?.code && saved.mid && saved.me === a && (!invite || invite.code === saved.code)) {
        try {
          const j = await api(`journey/${saved.code}`);
          if (j.state.party?.some((m) => m.id === saved.mid)) return j.state.started ? enter(j, saved.role, a) : toLobby(saved.code, saved.mid, saved.role, a);
        } catch {}
      }
      let code, role;
      if (invite) { code = invite.code; role = "b"; }
      else { const j = await api("journey", { body: { a, b, lang: getLang(), state: { city: "tashkent" } } }); code = j.code; role = "a"; }
      const party = await collectParty(code);
      let mid = null;
      for (const [i, p] of party.entries()) {
        const r = await api(`journey/${code}/member`, { body: { ...p, ready: i > 0 } });   // mates typed on this device are ready already
        if (i === 0) mid = r.mid;
      }
      store.set("party", party);
      store.set("journey", { code, role, me: a, mid });
      track(invite ? "join" : "create", { d: { code, n: party.length } });
      toLobby(code, mid, role, a);
    } catch (e) { toast(/full/.test(e?.message || "") ? t("tripFull") : "✕"); }
    finally { btn.disabled = false; }
  };
  $("#joinBtn").onclick = async () => {
    const code = $("#joinCode").value.trim().toUpperCase();
    try { const j = await api(`journey/${code}`); inviteMode({ code: j.code, host: j.a }); $("#startBtn").click(); }
    catch { toast("✕ " + code); }
  };
  $("#nameA").addEventListener("keydown", (e) => e.key === "Enter" && ($("#nameB") ? $("#nameB").focus() : $("#startBtn").click()));
  $("#nameB")?.addEventListener("keydown", (e) => e.key === "Enter" && $("#startBtn").click());
}
function toLobby(code, mid, role, me) {
  $("#intro").classList.add("lobbying");
  lobby({ code, mid, onStart: async () => {
    const j = await api(`journey/${code}`);
    $("#intro").classList.remove("lobbying");
    enter(j, role, me);
  } });
}

async function enter(j, role, me) {
  const mid = store.get("journey")?.mid || null;
  const partner = (j.state.party || []).filter((m) => m.id !== mid).map((m) => m.name).join(", ") || j.b || "";
  WL.journey = j; WL.role = role; WL.me = me; WL.mid = mid;
  trackContext({ journey: j.code, role, name: me });
  track("enter", { city: j.state.city || "tashkent", d: { partner: partner || "" } });
  store.set("journey", { code: j.code, role, me, partner, mid });
  WL.chat ||= new Chat({ journey: () => WL.journey, me, mid, onFly: (k) => { const c = byKey(k); if (!c) return; if (WL.scene.city) backToGlobe(); setTimeout(() => book(c), 400); } });
  WL.version = j.version;
  $("#intro").classList.add("out");
  $("#globe").classList.remove("dim");
  ["#topbar", "#dock", "#atmos"].forEach((s) => $(s).classList.remove("away"));
  renderTop(); renderAtmos();
  WL.music.loadUploads();
  const here = byKey(j.state.city) || byKey("tashkent");
  WL.earth.current = here; WL.earth._idleArcs();
  await sleep(600);
  WL.earth.focus(here, 1.9, 3200);
  toast(`${t("welcome")}, ${me}${partner ? " & " + partner : ""} — ${t("tashkentStart")}`);
  WL.music.setContext({ city: here, season: curSeason(here), tod: curTod(here), ambience: { wind: 0.12, city: 0.1 } });
  WL.music.playSmart();
  startSync();
}

// ----------------------------------------------------------------------------- topbar
function bindTopbar() {
  $("#codeChip").onclick = async () => {
    track("share"); const url = inviteUrl(WL.journey.code);
    if (navigator.share && matchMedia("(pointer: coarse)").matches) return navigator.share({ title: "WorldLive", text: t("inviteMsg"), url }).catch(() => {});
    try { await navigator.clipboard.writeText(url); toast(t("linkCopied")); } catch { toast(url); }
  };
  $("#passportBtn").onclick = () => { track("passport"); passport(); };
  $$("#topbar .lang-switch button").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  setInterval(renderClocks, 15000);
}
function renderTop() {
  const j = WL.journey; if (!j) return;
  const party = j.state.party?.length ? j.state.party : [{ id: "a", name: j.a }, ...(j.b ? [{ id: "b", name: j.b, g: "f" }] : [])];
  $(".couple").innerHTML = `<div class="avs">${party.slice(0, 5).map((m) => avatar(m, (m.id === WL.mid || online(m)) ? "on" : "")).join("")}${party.length > 5 ? `<span class="mav more">+${party.length - 5}</span>` : ""}</div><div class="couple-names" id="coupleNames">${esc(party.map((m) => m.name).join(party.length > 2 ? ", " : " & "))}</div>`;
  $("#codeTxt").textContent = j.code;
  renderClocks();
}
function renderClocks() {
  const here = WL.earth?.current; if (!here) return;
  $("#clocks").innerHTML = `<span>${flag("UZ")} ${esc(L(byKey("tashkent").name))}</span><b>${timeIn("UZ")}</b>${here.key !== "tashkent" ? `<span>${flag(here.country)} ${esc(L(here.name))}</span><b>${timeIn(here)}</b>` : ""}`;
}

// ----------------------------------------------------------------------------- dock
function buildDock() {
  const w = WL.world, q = ($("#search").value || "").toLowerCase();
  $("#heroStrip").innerHTML = w.hero.map((k) => byKey(k)).map((c) => `<button class="hero-chip" data-k="${c.key}">${flag(c.country)} ${esc(L(c.name))}</button>`).join("");
  $$("#heroStrip button").forEach((b) => (b.onclick = () => preview(byKey(b.dataset.k))));
  const groups = {};
  for (const c of w.cities) {
    const country = w.countries[c.country];
    const hay = [L(c.name), c.name.en, L(country), country.en].join(" ").toLowerCase();
    if (q && !hay.includes(q)) continue;
    (groups[c.country] ||= []).push(c);
  }
  $("#dockList").innerHTML = Object.entries(groups).map(([cc, cs]) => `
    <div class="dock-group">${flag(cc)} ${esc(L(w.countries[cc]))}</div>
    ${cs.map((c) => `<button class="dest ${WL.previewCity === c ? "on" : ""}" data-k="${c.key}">
      <div class="thumb" style="background-image:url('${esc(c.photo?.src?.replace(/\/\d+px-/, "/250px-") || "")}')"></div>
      <div><div class="t">${esc(L(c.name))}</div><div class="s">${esc(L(c.tagline))} · ${c.attractions.length} ${t("places").toLowerCase()}</div></div>
      ${w.hero.includes(c.key) ? '<span class="star">★</span>' : ""}</button>`).join("")}`).join("");
  $$("#dockList .dest").forEach((b) => (b.onclick = () => preview(byKey(b.dataset.k))));
}
$("#search").addEventListener("input", buildDock);

// ----------------------------------------------------------------------------- preview
function preview(c, silent) {
  if (!WL.journey || WL.flying) return;
  WL.previewCity = c;
  if (!silent) track("preview", { city: c.key });
  const from = WL.earth.current, here = from.key === c.key;
  const km = Math.round(distanceKm(from, c)), mins = flightMinutes(km);
  const el = $("#preview");
  el.innerHTML = `
    <button class="icon-btn close-x glass" aria-label="${t("close")}">✕</button>
    <div class="ph" style="background-image:url('${esc(c.photo?.src || "")}')"><div class="over">
      <div class="eyebrow">${flag(c.country)} ${esc(L(WL.world.countries[c.country]))}</div><h3 class="display">${esc(L(c.name))}</h3></div></div>
    <div class="body">
      <div class="facts">
        <div class="fact"><b>${here ? "—" : km.toLocaleString()}</b><span>${t("distance")}, km</span></div>
        <div class="fact"><b>${here ? "—" : fmtDur(mins)}</b><span>${t("flightTime")}</span></div>
        <div class="fact"><b>${timeIn(c)}</b><span>${t("localTime")}</span></div>
      </div>
      <p>${esc(c.extract[getLang()] || c.extract.en || "")}</p>
      <div class="row">
        ${here ? `<button class="btn btn-gold" data-explore>${t("explore")}</button>` : `<button class="btn btn-ghost" data-explore>${t("explore")}</button><button class="btn btn-gold" data-book>✈ ${t("bookFlight")}</button>`}
      </div>
      ${c.photo ? `<div class="credit" style="margin-top:10px">${t("photoBy")}: ${esc(c.photo.artist || "Wikimedia Commons")} · ${esc(c.photo.license)}</div>` : ""}
    </div>`;
  el.classList.remove("away");
  $(".close-x", el).onclick = () => { el.classList.add("away"); WL.previewCity = null; buildDock(); WL.earth.idle(); };
  $("[data-explore]", el).onclick = () => openCity(c);
  $("[data-book]", el)?.addEventListener("click", () => book(c));
  if (!silent) { WL.earth.focus(c, 1.35, 1800); buildDock(); }
}

// ----------------------------------------------------------------------------- booking
function book(to, quick) {
  const from = WL.earth.current, j = WL.journey;
  const km = Math.round(distanceKm(from, to)), mins = flightMinutes(km);
  const fno = "WL " + (100 + ((to.key.charCodeAt(0) * 7 + to.key.length * 31 + from.key.charCodeAt(1)) % 880));
  const sel = { cls: "business", seat: "window", dep: "now" };
  const wrap = h(`<div class="modal-wrap"><div class="modal glass dense">
    <div class="eyebrow">SkyJourney · ${esc(L(from.name))} → ${esc(L(to.name))}</div>
    <h2 class="display">${t("boarding")}</h2>
    <div class="grid2">
      <div><div class="faint" style="margin-bottom:8px">${t("chooseClass")}</div><div class="seg" data-g="cls">
        <button data-v="economy"><b>${t("economy")}</b><small>A320neo</small></button>
        <button data-v="business"><b>${t("business")}</b><small>B787 Dreamliner</small></button>
        <button data-v="first"><b>${t("first")}</b><small>A350-1000 Suite</small></button></div></div>
      <div><div class="faint" style="margin-bottom:8px">${t("seat")}</div><div class="seg" data-g="seat">
        <button data-v="window">🪟 ${t("window")}</button><button data-v="aisle">🚶 ${t("aisle")}</button></div>
        <div class="faint" style="margin:14px 0 8px">${t("departure")}</div><div class="seg" data-g="dep">
        <button data-v="now">${t("now")}</button><button data-v="sunset">🌇 ${t("sunsetDep")}</button><button data-v="night">🌙 ${t("nightDep")}</button></div></div>
    </div>
    <div class="pass" data-pass></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
      <button class="btn btn-ghost" data-close>${t("close")}</button><button class="btn btn-gold" data-board>✈ ${t("board")}</button></div>
  </div></div>`);
  const renderPass = () => {
    const row = { economy: 24, business: 4, first: 1 }[sel.cls], letter = sel.seat === "window" ? "A" : "C";
    $("[data-pass]", wrap).innerHTML = `<div class="main">
        <div class="air"><span>WorldLive Airways</span><span>${fno}</span></div>
        <div class="route"><div class="iata">${from.airport}</div><div class="line"></div><div class="iata">${to.airport}</div></div>
        <div class="cities"><span>${esc(L(from.name))}</span><span>${esc(L(to.name))}</span></div>
        <div class="kv"><div><span>${t("passenger")}</span><b>${esc(j.a)}${j.b ? " & " + esc(j.b) : ""}</b></div><div><span>${t("class")}</span><b>${t(sel.cls)}</b></div>
          <div><span>${t("seat")}</span><b>${row}${letter}${j.b ? " · " + row + String.fromCharCode(letter.charCodeAt(0) + 1) : ""}</b></div><div><span>${t("flightTime")}</span><b>${fmtDur(mins)}</b></div></div>
        <div class="barcode"></div></div>
      <div class="stub"><div class="air"><span>${t("gate")}</span></div><div class="iata" style="font-size:42px">${"ABCDE"[km % 5]}${(km % 19) + 1}</div>
        <div class="faint" style="color:#8b7a5e;margin-top:8px">${km.toLocaleString()} km</div><div class="faint" style="color:#8b7a5e">${new Date().toLocaleDateString(getLang())}</div></div>
      <div class="virtual">${t("virtualNote")}</div>`;
    $$(".seg", wrap).forEach((g) => $$("button", g).forEach((b) => b.classList.toggle("on", sel[g.dataset.g] === b.dataset.v)));
  };
  $$(".seg button", wrap).forEach((b) => (b.onclick = () => { sel[b.closest(".seg").dataset.g] = b.dataset.v; renderPass(); }));
  wrap.onclick = (e) => { if (e.target === wrap || e.target.closest("[data-close]")) wrap.remove(); };
  $("[data-board]", wrap).onclick = () => { wrap.remove(); track("fly", { city: to.key, d: { from: from.key, to: to.key, km: Math.round(distanceKm(from, to)), fno, dep: sel.dep } }); fly(from, to, { fno, dep: sel.dep }); push({ flight: { from: from.key, to: to.key, fno, dep: sel.dep, at: Date.now() } }); };
  document.body.append(wrap); renderPass(); preloadBoarding();
}

// ----------------------------------------------------------------------------- flight
async function fly(from, to, { fno, dep, follower = false }) {
  if (WL.flying) return;
  WL.flying = true;
  ["#topbar", "#dock", "#preview"].forEach((s) => $(s).classList.add("away"));
  const couple = { a: WL.journey?.a || "", b: WL.journey?.b || "", party: WL.journey?.state?.party || null }, anim = WL.prefs3d !== false && !follower;
  if (anim) await playBoarding("board", { city: from, ...couple, tod: WL.tod });
  $("#hud").classList.remove("away");
  const title = h(`<div class="flight-title"><div class="eyebrow">${t("flyingTo")} · ${esc(fno)}</div><div class="display">${esc(L(to.name))}</div></div>`);
  $("#ui").append(title);
  setTimeout(() => (title.style.opacity = 0), 4200);
  WL.music.amb?.set({ city: 0.45, wind: 0.25 }); // cabin hum
  const mins = flightMinutes(distanceKm(from, to));
  await WL.earth.fly(from, to, (p, info) => {
    $("#hudAlt").textContent = info.altM.toLocaleString() + " m";
    $("#hudSpd").textContent = info.speed + " km/h";
    $("#hudRem").textContent = fmtDur(Math.round(mins * (1 - p)));
    $("#hudProg").style.width = p * 100 + "%";
  });
  title.remove();
  track("land", { city: to.key, d: { from: from.key, follower } });
  $("#hud").classList.add("away");
  WL.flying = false;
  if (dep === "sunset") WL.tod = "sunset"; else if (dep === "night") WL.tod = "night";
  if (anim) await playBoarding("arrive", { city: to, ...couple, tod: WL.tod });
  // only the traveller who booked records the trip; the companion just follows
  if (!follower) {
    WL.journey.state.km = (WL.journey.state.km || 0) + Math.round(distanceKm(from, to));
    try { const r = await api(`journey/${WL.journey.code}/stamp`, { body: { city: to.key, country: to.country, flight: fno } }); WL.newStamp = to.key; WL.journey.stamps = r.stamps; } catch {}
    push({ city: to.key, km: WL.journey.state.km, flight: null });
  }
  openCity(to);
}

// ----------------------------------------------------------------------------- city
function curSeason(c = WL.scene.city || WL.earth.current) { return WL.season === "auto" ? seasonNow(c.lat) : WL.season; }
function curTod(c = WL.scene.city || WL.earth.current) { return WL.tod === "auto" ? todFromSun(c.lat, c.lng) : WL.tod === "cycle" ? cycleTod(cycleHour()) : WL.tod; }

// ---- living day: 1 real minute = 1 hour from sunrise to night, then the night passes in ~10 s
// (deterministic from a shared start time, so every device in the journey sees the same sky)
const DAY_S = 16 * 60, NIGHT_S = 10, LOOP = DAY_S + NIGHT_S;
function cycleHour(now = Date.now()) {
  const ph = (((now - (WL.cycle0 || now)) / 1000) + DAY_S) % LOOP;        // starts at nightfall: dawn after 10 s
  return ph < DAY_S ? 5 + ph / 60 : (21 + ((ph - DAY_S) / NIGHT_S) * 8) % 24;
}
function cycleTod(hr) {
  return hr >= 21 || hr < 5 ? "night" : hr < 6.5 ? "sunrise" : hr < 10.5 ? "morning" : hr < 15 ? "noon" : hr < 17.8 ? "golden" : hr < 19.3 ? "sunset" : "evening";
}
setInterval(() => {
  const el = $("#cycleClock");
  if (WL.tod !== "cycle") { el?.classList.add("hidden"); return; }
  const hr = cycleHour(), tod = cycleTod(hr);
  if (el) { el.classList.remove("hidden"); el.querySelector("b").textContent = `${String(Math.floor(hr)).padStart(2, "0")}:${String(Math.floor((hr % 1) * 60)).padStart(2, "0")}`; el.querySelector("i").textContent = TOD_IC[tod]; }
  if (tod !== WL._cycTod) { WL._cycTod = tod; applyAtmos(); }
}, 1000);
function openCity(c, atIndex = 0) {
  WL.earth.current = c;
  ["#preview", "#dock", "#topbar"].forEach((s) => $(s).classList.add("away"));
  $("#globe").classList.add("dim");
  clearTimeout(WL._pauseT); WL._pauseT = setTimeout(() => WL.scene.city && WL.earth.pause(true), 1500);
  WL.scene.open(c, { season: curSeason(c), tod: curTod(c), atIndex });
  track("city", { city: c.key, d: { season: curSeason(c), tod: curTod(c) } });
  renderAtmos(); renderClocks(); armSecret(c);
  toast(`${t("arrived")} ${L(c.name)} ${flag(c.country)}`);
  if (WL.journey.state.city !== c.key) push({ city: c.key });
}
function backToGlobe({ pick = false } = {}) {
  if (!WL.scene.city) return;
  track("globe", { city: WL.scene.city?.key });
  clearTimeout(WL._pauseT);
  WL.scene.close(); WL.earth.pause(false);
  document.querySelectorAll(".sheet, .studio, .modal-wrap").forEach((x) => x.remove());
  $("#globe").classList.remove("dim"); $("#dock").classList.remove("away"); $("#topbar").classList.remove("away");
  WL.earth.focus(WL.earth.current, 1.8, 2000);
  WL.music.setContext({ city: WL.earth.current, season: curSeason(), tod: curTod(), ambience: { wind: 0.1 } });
  push({ inScene: false });
  // "fly somewhere else": open the destination list with the search ready
  if (pick) setTimeout(() => { const sI = $("#search"); sI.value = ""; buildDock(); sI.focus({ preventScroll: true }); $("#dock").classList.add("pulse-once"); setTimeout(() => $("#dock").classList.remove("pulse-once"), 1200); }, 350);
}

// ----------------------------------------------------------------------------- atmosphere controls
const SEASON_IC = { auto: "✦", spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };
const TOD_IC = { auto: "◐", cycle: "🔄", sunrise: "🌅", morning: "🌤️", noon: "☀️", golden: "🌇", sunset: "🌆", evening: "🌃", night: "🌙" };
function bindAtmos() {
  $("#atmos").addEventListener("click", (e) => {
    const s = e.target.closest("[data-season]")?.dataset.season, td = e.target.closest("[data-tod-open]");
    if (s) { WL.season = s; applyAtmos(); push({ season: s }); track("season", { city: (WL.scene.city || WL.earth.current)?.key, d: { season: s } }); }
    if (td) toggleTod();
  });
}
function renderAtmos() {
  const c = WL.scene.city || WL.earth.current, cs = curSeason(c);
  const tropical = c?.climate === "tropical";
  const label = tropical ? (cs === "summer" || cs === "autumn" ? t("wet") : t("dry")) : t(cs);
  $("#atmos").innerHTML = ["auto", "spring", "summer", "autumn", "winter"].map((s) => `<button class="icon-btn ${WL.season === s ? "on" : ""}" data-season="${s}" title="${t(s)}" aria-label="${t(s)}">${SEASON_IC[s]}</button>`).join("")
    + `<span class="lbl">${esc(label)}</span><span class="sep"></span><button class="icon-btn ${WL.tod !== "auto" ? "on" : ""}" data-tod-open title="${t("timeOfDay")}">${TOD_IC[WL.tod === "auto" ? curTod(c) : WL.tod]}</button><span class="lbl">${t(WL.tod === "auto" ? "realtime" : WL.tod)}</span>`;
}
function toggleTod() {
  const ex = $(".tod"); if (ex) return ex.remove();
  const tods = ["auto", "cycle", "sunrise", "morning", "noon", "golden", "sunset", "evening", "night"];
  const el = h(`<div class="tod glass dense"><div class="eyebrow" style="margin-bottom:10px">${t("timeOfDay")}</div>
    <input type="range" min="0" max="${tods.length - 1}" step="1" value="${tods.indexOf(WL.tod)}"><div class="seg" style="margin-top:10px">${tods.map((k) => `<button data-k="${k}" class="${WL.tod === k ? "on" : ""}">${TOD_IC[k]} ${t(k === "auto" ? "realtime" : k === "cycle" ? "dayCycle" : k)}</button>`).join("")}</div></div>`);
  const set = (k) => { if (k === "cycle" && WL.tod !== "cycle") WL.cycle0 = Date.now(); WL.tod = k; WL._cycTod = null; applyAtmos(); push({ tod: k, ...(k === "cycle" ? { cycle0: WL.cycle0 } : {}) }); track("tod", { city: (WL.scene.city || WL.earth.current)?.key, d: { tod: k } }); $$("button", el).forEach((b) => b.classList.toggle("on", b.dataset.k === k)); $("input", el).value = tods.indexOf(k); };
  $("input", el).oninput = (e) => set(tods[+e.target.value]);
  $$("button", el).forEach((b) => (b.onclick = () => set(b.dataset.k)));
  $("#ui").append(el);
}
function applyAtmos() {
  renderAtmos();
  if (WL.scene.city) WL.scene.setAtmos(curSeason(), curTod());
  else WL.music.setContext({ city: WL.earth.current, season: curSeason(), tod: curTod(), ambience: { wind: 0.1 } });
}
setInterval(() => { if (WL.tod === "auto" && WL.scene.city) WL.scene.setAtmos(curSeason(), curTod()); }, 60000);

// ----------------------------------------------------------------------------- passport
function passport() {
  const j = WL.journey, stamps = j.stamps || [];
  const countries = new Set(stamps.map((s) => s.country));
  const wrap = h(`<div class="modal-wrap"><div class="modal glass passport">
    <div class="eyebrow">Digital Passport · ${esc(j.code)}</div><h2 class="display">${esc(j.a)}${j.b ? " & " + esc(j.b) : ""}</h2>
    <div class="stats"><div class="stat"><b>${countries.size}</b><span>${t("countries")}</span></div><div class="stat"><b>${stamps.length}</b><span>${t("cities")}</span></div>
      <div class="stat"><b>${(j.state.km || 0).toLocaleString()}</b><span>${t("km")}</span></div><div class="stat"><b>${(j.memories || []).length}</b><span>${t("memories")}</span></div></div>
    <div class="eyebrow" style="margin-bottom:12px">${t("stamps")}</div>
    <div class="stamps">${stamps.length ? stamps.map((s) => stampSVG(s)).join("") : `<p class="faint">${t("empty")}</p>`}</div>
    ${songsBlock(j, stamps)}
    <div class="film-cta mt"><button class="btn btn-gold" data-film>🎬 ${t("filmMake")}</button><a class="btn btn-ghost" target="_blank" rel="noopener" href="/album/${esc(j.code)}?lang=${getLang()}">📔 ${t("album")}</a><span class="faint">${t("filmHint")}</span></div>
    <div class="eyebrow mt">${t("memories")}</div><div class="memories">${(j.memories || []).slice(0, 30).map(memHTML).join("") || `<p class="faint">${t("empty")}</p>`}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:20px"><button class="btn btn-ghost" data-close>${t("close")}</button></div></div></div>`);
  wrap.onclick = (e) => {
    const play = e.target.closest("[data-playours]"), one = e.target.closest("[data-playsong]");
    if (play || one) {
      const ids = ourSongs(j, stamps).map((s) => s.id);
      WL.music.playList(one ? [one.dataset.playsong, ...ids.filter((x) => x !== one.dataset.playsong)] : ids);
      track("music", { d: { title: "passport playlist", src: "passport" } });
      return;
    }
    if (e.target.closest("[data-film]")) { wrap.remove(); import("./film.js").then((m) => m.makeFilm(WL.world, WL.journey)); return; }
    if (e.target === wrap || e.target.closest("[data-close]")) wrap.remove();
  };
  document.body.append(wrap);
  WL.newStamp = null;
}
// the couple's own soundtrack: one song per stamped city, in the order they travelled
function ourSongs(j, stamps) {
  const songs = j.state?.songs || {}, order = [...stamps.map((s) => s.city), ...Object.keys(songs)];
  return [...new Set(order)].filter((c) => songs[c]).map((c) => ({ city: c, ...songs[c] }));
}
function songsBlock(j, stamps) {
  const list = ourSongs(j, stamps);
  return `<div class="eyebrow mt" style="display:flex;align-items:center;gap:10px">💿 ${t("ourPlaylist")}<span class="faint" style="letter-spacing:0;text-transform:none;font-weight:500">${t("ourPlaylistHint")}</span></div>
    ${list.length ? `<div class="our-songs">${list.map((s, i) => { const c = byKey(s.city);
      return `<button class="our-song" data-playsong="${esc(s.id)}"><span class="no">${String(i + 1).padStart(2, "0")}</span><span class="disc" style="--h:${[...s.city].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360}"><i></i></span>
        <span class="tt"><b>${esc(s.title)}</b><span>${esc(s.artist)}</span></span><span class="where">${flag(c?.country || "")} ${esc(L(c?.name) || s.city)}</span></button>`; }).join("")}</div>
      <button class="btn btn-gold mt" data-playours>▶ ${t("playOurs")}</button>` : `<p class="faint">${t("noSongStamps")}</p>`}`;
}
function stampSVG(s) {
  const c = byKey(s.city) || { name: { en: s.city }, airport: "", country: s.country };
  const hue = [...s.city].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
  const col = `hsl(${hue},55%,68%)`, name = esc(L(c.name)).toUpperCase();
  return `<div class="stamp ${WL.newStamp === s.city ? "new" : ""}" style="transform:rotate(${(hue % 17) - 8}deg)"><svg viewBox="0 0 200 200">
    <defs><path id="arc-${s.city}" d="M 30 100 A 70 70 0 1 1 170 100"/></defs>
    <circle cx="100" cy="100" r="88" fill="none" stroke="${col}" stroke-width="4" stroke-dasharray="2 5"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="${col}" stroke-width="2"/>
    <text font-family="Manrope" font-weight="800" font-size="15" letter-spacing="4" fill="${col}"><textPath href="#arc-${s.city}" startOffset="50%" text-anchor="middle">${name}</textPath></text>
    <text x="100" y="112" text-anchor="middle" font-family="Cormorant Garamond" font-size="44" font-weight="600" fill="${col}">${esc(c.airport)}</text>
    <text x="100" y="140" text-anchor="middle" font-size="22">${flag(s.country)}</text>
    <text x="100" y="166" text-anchor="middle" font-family="Manrope" font-size="11" font-weight="700" letter-spacing="2" fill="${col}">${esc(s.date)} · ${esc(s.flight || "")}</text></svg>
    ${WL.journey?.state?.songs?.[s.city] ? `<div class="stamp-song" style="color:${col}">♪ ${esc(WL.journey.state.songs[s.city].title)}</div>` : ""}</div>`;
}

// ----------------------------------------------------------------------------- shared journey sync
let pushing = Promise.resolve();
function push(patch) {
  if (!WL.journey) return;
  Object.assign(WL.journey.state, patch);
  pushing = pushing.then(() => api(`journey/${WL.journey.code}`, { body: { state: patch } }).then((r) => { WL.version = r.version; }).catch(() => {}));
}
function startSync() {
  const beat = () => push({ ["seen_" + WL.role]: Date.now(), ...(WL.mid ? { ["seen_" + WL.mid]: Date.now() } : {}) });
  beat(); setInterval(beat, 20000);
  const poll = async () => {
    if (document.hidden || !WL.journey) return;
    try {
      const r = await api(`journey/${WL.journey.code}?v=${WL.version}`);
      if (r.unchanged) return;
      const prev = WL.journey, s = r.state;
      WL.version = r.version;
      const other = WL.role === "a" ? "b" : "a";
      if (!prev.b && r.b) toast(`${t("partnerJoined")}: ${r.b}`);
      WL.journey = { ...prev, ...r };
      renderTop();
      if ((r.chat_last || 0) > (WL.chat?.last || 0)) WL.chat?.pull();
      // follow the partner
      if (s.flight && s.flight.at > Date.now() - 20000 && !WL.flying && s.flight.at !== WL._lastFlight) {
        WL._lastFlight = s.flight.at;
        if (WL.scene.city) backToGlobe();
        fly(byKey(s.flight.from), byKey(s.flight.to), { ...s.flight, follower: true });
      } else if (!WL.flying && s.city && s.city !== WL.earth.current.key && !s.flight) {
        WL.earth.current = byKey(s.city);
      }
      if (s.season && s.season !== WL.season) { WL.season = s.season; applyAtmos(); }
      if (s.cycle0 && s.cycle0 !== WL.cycle0) WL.cycle0 = s.cycle0;
      if (s.tod && s.tod !== WL.tod) { WL.tod = s.tod; WL._cycTod = null; applyAtmos(); }
      void other;
      checkGifts();
    } catch {}
  };
  setInterval(poll, 2500);
}

boot().catch((e) => { console.error(e); $(".loader-txt").textContent = "Error: " + e.message; });
