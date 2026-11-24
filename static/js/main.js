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
import { floatReaction, RT } from "./realtime.js";

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
// ----------------------------------------------------------------------------- intro: account + own profile
// One person, one account: a unique @username (the login) + a 4-digit PIN. The traveller fills in only
// their own name / gender / photo; companions join through the Telegram invite link and fill in theirs.
const UNAME = /^[a-z0-9_.]{3,20}$/;
const ACCT = { me: null, known: null };   // signed-in account; result of the last username check
function bindProfile() {
  const row = $("#party .pm"), ph = $(".pm-ph", row), inp = $("input[type=file]", row);
  $$(".pm-g button", row).forEach((b) => (b.onclick = () => $$(".pm-g button", row).forEach((x) => x.classList.toggle("on", x === b))));
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    try { const blob = await shrinkPhoto(f); row._photo = blob; ph.style.backgroundImage = `url(${URL.createObjectURL(blob)})`; ph.classList.add("has"); $("#consent").classList.remove("hidden"); }
    catch { toast(t("photoBad")); }
  };
  ph.addEventListener("click", (e) => { if (row._photo || row._url) { e.preventDefault(); row._photo = null; row._url = null; ph.style.backgroundImage = ""; ph.classList.remove("has"); inp.value = ""; } });
}
function profileOf() {
  const row = $("#party .pm");
  return { name: $("#nameA").value.trim().slice(0, 40), g: $(".pm-g button.on", row)?.dataset.g || "m", row };
}
function fillProfile(a) {
  const row = $("#party .pm");
  $("#nameA").value = a.name || "";
  $$(".pm-g button", row).forEach((b) => b.classList.toggle("on", b.dataset.g === a.g));
  if (a.photo) { row._url = a.photo; $(".pm-ph", row).style.backgroundImage = `url(${a.photo})`; $(".pm-ph", row).classList.add("has"); }
}
/** upload a consented photo once a journey exists, then remember it on the account */
async function profilePhoto(code) {
  const { row } = profileOf();
  if (row._photo && $("#consentBox").checked) {
    try {
      const fd = new FormData(); fd.append("file", row._photo, "me.jpg"); fd.append("consent", "1");
      row._url = (await upload(`journey/${code}/avatar`, fd)).url; row._photo = null;
      api("account/update", { body: { photo: row._url } }).catch(() => {});
    } catch { toast(t("photoBad")); }
  } else if (row._photo) toast(t("needConsent"));
  return row._url || null;
}
function paintAccount() {
  const a = ACCT.me, bar = $("#acctBar");
  $("#acct").classList.toggle("hidden", !!a);
  bar.classList.toggle("hidden", !a);
  if (!a) { $("#trips").classList.add("hidden"); return; }
  bar.innerHTML = `${avatar({ name: a.name, g: a.g, photo: a.photo })}<div><b>${esc(a.name)}</b><span>@${esc(a.username)}</span></div><button class="linkish" data-out>${t("logout")}</button>`;
  $("[data-out]", bar).onclick = async () => { await api("account/logout", { body: {} }).catch(() => {}); ACCT.me = null; store.set("journey", null); location.reload(); };
  fillProfile(a);
  const trips = readInvite() ? [] : (a.trips || []);
  $("#trips").classList.toggle("hidden", !trips.length);
  $("#trips").innerHTML = trips.length ? `<div class="eyebrow">${t("yourTrips")}</div>` + trips.slice(0, 4).map((x) => `
    <button class="trip" data-trip="${esc(x.code)}"><b>${esc(x.code)}</b><span>${x.with.length ? "👥 " + esc(x.with.join(", ")) : t("waitingMate")}</span><em>${x.stamps ? "🛂 " + x.stamps : ""} ${x.started ? t("resume") + " →" : t("lobbyShort") + " →"}</em></button>`).join("") : "";
  $$("#trips [data-trip]").forEach((b) => (b.onclick = () => resumeTrip(a.trips.find((x) => x.code === b.dataset.trip))));
  $("#startBtn span").textContent = readInvite() ? t("joinTrip") : trips.length ? t("newTrip") : t("start");
}
async function resumeTrip(x) {
  try {
    const j = await api(`journey/${x.code}`);
    const me = j.state.party?.find((m) => m.id === x.mid); if (!me) throw 0;
    const role = me.host ? "a" : "b";
    store.set("journey", { code: x.code, role, me: me.name, mid: x.mid });
    return j.state.started ? enter(j, role, me.name) : toLobby(x.code, x.mid, role, me.name);
  } catch { toast("✕ " + x.code); }
}
function hostCard(inv) {
  const names = (inv.names || []).filter((n) => n && n !== inv.host);
  return `<div class="host-card">
    ${avatar({ name: inv.host, g: inv.g, photo: inv.photo }, "big")}
    <div><div class="eyebrow">${t("invitation")}</div>
      <p><b>${esc(inv.host)}</b>${inv.u ? ` <span class="faint">@${esc(inv.u)}</span>` : ""} ${t("invitedYou")}</p>
      ${names.length ? `<small class="faint">${t("alreadyIn")}: ${esc(names.join(", "))}</small>` : ""}
      <small class="faint">${t("tripId")} · <b class="mono">${esc(inv.code)}</b></small></div></div>`;
}

function bindIntro() {
  bindProfile();
  let invite = readInvite();
  const inviteMode = (inv) => {
    invite = inv;
    $("#intro").classList.add("invited");
    $("#inviteHost").innerHTML = hostCard(inv);
    $("#startBtn span").textContent = t("joinTrip");
    $("#joinToggle").classList.add("hidden"); $("#introHow").textContent = t("introHowInvited");
    paintAccount();
  };
  if (invite) inviteMode(invite);
  $$(".lang-switch button").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  $("#joinToggle").onclick = () => $("#joinBox").classList.toggle("hidden");
  // signed in already on this device?
  api("account").then((r) => { if (r.account) { ACCT.me = r.account; paintAccount(); } }).catch(() => {});
  // live username check
  let tm;
  $("#uname").addEventListener("input", () => {
    const u = $("#uname").value.trim().replace(/^@/, "").toLowerCase(); $("#uname").value = u;
    clearTimeout(tm); ACCT.known = null;
    const hint = $("#unameHint"); hint.className = "hint";
    if (!u) { hint.textContent = t("unameHint"); return; }
    if (!UNAME.test(u)) { hint.textContent = t("unameBad"); hint.classList.add("bad"); return; }
    tm = setTimeout(async () => {
      try {
        const r = await api("account/check", { body: { username: u } }); if ($("#uname").value !== u) return;
        ACCT.known = r;
        if (!r.ok) { hint.textContent = r.why === "reserved" ? t("unameTaken") : t("unameBad"); hint.classList.add("bad"); }
        else if (r.exists) { hint.textContent = `👋 ${t("welcomeBack")}, ${r.name} — ${t("enterPin")}`; hint.classList.add("ok"); }
        else { hint.textContent = "✓ " + t("unameFree"); hint.classList.add("ok"); }
        $("#party").classList.toggle("hidden", !!r.exists);
      } catch {}
    }, 350);
  });
  $("#upin").addEventListener("input", () => { $("#upin").value = $("#upin").value.replace(/\D/g, "").slice(0, 4); });
  $("#upin").addEventListener("keydown", (e) => e.key === "Enter" && ($("#party").classList.contains("hidden") ? $("#startBtn").click() : $("#nameA").focus()));
  $("#nameA").addEventListener("keydown", (e) => e.key === "Enter" && $("#startBtn").click());

  $("#startBtn").onclick = async () => {
    const btn = $("#startBtn");
    WL.music.unlock();
    btn.disabled = true;
    try {
      // 1 · sign in, or create the default account on first use of the username
      if (!ACCT.me) {
        const u = $("#uname").value.trim(), pin = $("#upin").value;
        if (!UNAME.test(u)) { $("#uname").focus(); return toast(t("unameBad")); }
        if (!/^\d{4}$/.test(pin)) { $("#upin").focus(); return toast(t("pinHint")); }
        const p = profileOf();
        if (!ACCT.known?.exists && !p.name) { $("#nameA").focus(); return toast(t("needName")); }
        let r;
        try { r = await api("account/login", { body: { username: u, pin, name: p.name, g: p.g } }); }
        catch (e) { const m = e?.message || ""; return toast(/wrong/.test(m) ? t("pinWrong") : /locked/.test(m) ? t("pinLocked") : /reserved/.test(m) ? t("unameTaken") : /name/.test(m) ? t("needName") : "✕"); }
        ACCT.me = r.account; paintAccount();
        track("login", { d: { u, created: r.created } });
        const trips = r.account.trips || [];
        if (invite) { const x = trips.find((q) => q.code === invite.code); if (x) return resumeTrip(x); }
        else if (!r.created && trips.length) return toast(t("pickTrip"));   // show their trips first
      }
      // 2 · own profile (name / gender / photo) — kept on the account
      const p = profileOf();
      if (!p.name) { $("#nameA").focus(); return toast(t("needName")); }
      if (p.name !== ACCT.me.name || p.g !== ACCT.me.g) api("account/update", { body: { name: p.name, g: p.g } }).catch(() => {});
      if (invite) { const x = ACCT.me.trips?.find((q) => q.code === invite.code); if (x) return resumeTrip(x); }
      // 3 · create a journey (host) or join the invited one
      let code, role;
      if (invite) { code = invite.code; role = "b"; }
      else { const j = await api("journey", { body: { a: p.name, b: "", lang: getLang(), state: { city: "tashkent" } } }); code = j.code; role = "a"; }
      const photo = await profilePhoto(code);
      const r = await api(`journey/${code}/member`, { body: { name: p.name, g: p.g, photo, self: true } });
      store.set("journey", { code, role, me: p.name, mid: r.mid });
      track(invite ? "join" : "create", { d: { code } });
      toLobby(code, r.mid, role, p.name);
    } catch (e) { toast(/full/.test(e?.message || "") ? t("tripFull") : "✕"); }
    finally { btn.disabled = false; }
  };
  $("#joinBtn").onclick = async () => {
    const code = $("#joinCode").value.trim().toUpperCase();
    try { const j = await api(`journey/${code}`); const host = j.state.party?.find((m) => m.host) || { name: j.a };
      inviteMode({ code: j.code, host: host.name, photo: host.photo, g: host.g, u: host.u, names: (j.state.party || []).map((m) => m.name) }); }
    catch { toast("✕ " + code); }
  };
}
function live(code, mid) {
  if (WL.rt?.code === code) return WL.rt;
  WL.rt?.close();
  return (WL.rt = new RT(code, mid));
}
on("rt:react", (m) => floatReaction(m.e, m.name));
// ---- shared 3D moments: whoever opens one, everyone on the journey sees it too
async function openMoment({ kind, item, place }, shared = false) {
  const c = WL.scene.city || WL.earth.current; if (!c || WL._moment) return;
  const pl = (place && c.attractions.find((a) => a.id === place)) || WL.scene.place || c.attractions[0];
  WL._moment = true;
  try {
    const mod = await import("./moments.js"), party = WL.journey?.state?.party || [];
    const dish = item ? (c.food || []).find((f) => f.id === item) : null;
    if (!shared) {
      push({ moment: { kind, item: item || null, place: pl?.id || null, city: c.key, at: Date.now(), by: WL.mid } });
      track("moment", { city: c.key, d: { kind, item } });
      if (dish) WL.scene._saveMemory("note", `${dish.emoji} ${L(dish.name)} — ${t("togetherAt")} ${L(c.name)}`, pl ? L(pl.names) : L(c.name));
    } else toast(`✨ ${t("momentJoined")}`);
    const S = await (kind === "balloon" ? mod.balloon({ city: c, party }) : kind === "paraglide" ? mod.paraglide({ city: c, place: pl, party }) : mod.cafe({ city: c, place: pl, party, dish, tod: WL.scene.tod || curTod(c) }));
    if (S) S.onClose = () => (WL._moment = false); else WL._moment = false;
  } catch (e) { console.error(e); WL._moment = false; }
}
on("moment:open", (m) => openMoment(m));
on("rt:presence", () => { renderTop(); WL.chat?.quick?.(); });
function toLobby(code, mid, role, me) {
  live(code, mid);
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
  live(j.code, mid);
  WL.chat ||= new Chat({ journey: () => WL.journey, me, mid, onFly: (k, agreed) => { const c = byKey(k); if (!c || WL.flying) return; if (WL.scene.city) backToGlobe(); setTimeout(() => book(c, agreed ? "agreed" : undefined), 400); } });
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
  // every journey begins in Tashkent: the TV tower and Konsta — “Odamlar Ucha Olar”
  const first = !(j.stamps || []).length;
  const anthem = WL.music.songs.find((x) => /odamlar ucha olar/i.test(x.title));
  if (first && anthem) WL.music.playTrack(anthem); else WL.music.playSmart();
  if (first) setTimeout(() => {
    const tk = byKey("tashkent"), ti = tk.attractions.findIndex((a) => a.id === "tashkent-tower");
    if (!WL.scene.city && !WL.flying) openCity(tk, Math.max(0, ti));
  }, 3600);
  startSync();
}

// ----------------------------------------------------------------------------- topbar
function bindTopbar() {
  $("#codeChip").onclick = async () => {
    track("share"); const url = inviteUrl(WL.journey.code);
    try { await navigator.clipboard.writeText(url); } catch {}
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("inviteMsg"))}`, "_blank", "noopener");
    toast(t("linkCopied"));
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
// phones: the destination list is a bottom sheet — peek (title + golden routes), open (full list), mini (just a handle)
const PHONE = () => innerWidth <= 860;
function dockState(st) {
  const d = $("#dock");
  d.classList.toggle("open", st === "open"); d.classList.toggle("mini", st === "mini");
  $("#dockMin").textContent = st === "mini" ? "▢" : "–";
  try { localStorage.setItem("wl-dock-mini", st === "mini" ? "1" : "0"); } catch {}
  liftGlobe();
}
WL.dockState = dockState;
// keep the globe in the free part of the screen, above the sheet
function liftGlobe() {
  const d = $("#dock"), g = $("#globe");
  if (!PHONE() || d.classList.contains("away")) return g.style.setProperty("--lift", "0px");
  const top = d.getBoundingClientRect().top, free = Math.max(160, top - 60);
  g.style.setProperty("--lift", Math.round((innerHeight - free) / 2 - 30) + "px");
}
new MutationObserver(() => setTimeout(liftGlobe, 30)).observe($("#dock"), { attributes: true, attributeFilter: ["class"] });
addEventListener("resize", liftGlobe);
$("#dock").addEventListener("transitionend", liftGlobe);
(() => {
  const grip = $("#dockGrip"), head = $("#dock .dock-head");
  let y0 = null, moved = 0;
  const down = (e) => { if (!PHONE() || e.target.closest("input")) return; y0 = e.clientY; moved = 0; };
  const move = (e) => { if (y0 != null) moved = e.clientY - y0; };
  const up = () => {
    if (y0 == null) return; y0 = null;
    const d = $("#dock"), st = d.classList.contains("open") ? "open" : d.classList.contains("mini") ? "mini" : "peek";
    if (moved < -28) dockState("open");
    else if (moved > 28) dockState("mini");
    else if (Math.abs(moved) < 6) dockState(st === "open" ? "mini" : "open");
  };
  [grip, head].forEach((el) => el?.addEventListener("pointerdown", down));
  addEventListener("pointermove", move, { passive: true }); addEventListener("pointerup", up); addEventListener("pointercancel", () => (y0 = null));
  $("#search").addEventListener("focus", () => PHONE() && dockState("open"));
  $("#search").addEventListener("input", () => PHONE() && dockState("open"));
  $("#dockFab").onclick = () => dockState("open");
  if (PHONE()) dockState("mini");
})();
$("#dockMin").onclick = () => { const m = !$("#dock").classList.contains("mini"); $("#dock").classList.toggle("mini", m); $("#dockMin").textContent = m ? "▢" : "–"; try { localStorage.setItem("wl-dock-mini", m ? "1" : "0"); } catch {} };
try { if (localStorage.getItem("wl-dock-mini") === "1") { $("#dock").classList.add("mini"); $("#dockMin").textContent = "▢"; } } catch {}

// ----------------------------------------------------------------------------- preview
function preview(c, silent) {
  WL.earth.selected = c;
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
  if (PHONE()) $("#dock").classList.add("away");
  $(".close-x", el).onclick = () => { el.classList.add("away"); WL.previewCity = null; $("#dock").classList.remove("away"); buildDock(); WL.earth.idle(); };
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
  if (quick === "agreed") {   // everyone voted yes in the chat: no forms — board together right away
    if (from.key === to.key) return openCity(to);
    track("fly", { city: to.key, d: { from: from.key, to: to.key, km, fno, dep: "now", agreed: true } });
    push({ flight: { from: from.key, to: to.key, fno, dep: "now", at: Date.now() } });
    return fly(from, to, { fno, dep: "now" });
  }
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
  document.body.classList.remove("zen");
  if (WL.flying) return;
  if (!WL.scene.city) {   // the scene already closed (or is closing): just make sure the globe is usable
    $("#scene").classList.remove("on"); $("#globe").classList.remove("dim"); WL.earth.pause(false);
    ["#dock", "#topbar"].forEach((s) => $(s).classList.remove("away"));
    if (pick) showPicker();
    return;
  }
  track("globe", { city: WL.scene.city?.key });
  clearTimeout(WL._pauseT);
  WL.scene.close(); WL.earth.pause(false);
  document.querySelectorAll(".sheet, .studio, .modal-wrap").forEach((x) => x.remove());
  $("#globe").classList.remove("dim"); $("#dock").classList.remove("away"); $("#topbar").classList.remove("away");
  WL.earth.focus(WL.earth.current, 1.8, 2000);
  WL.music.setContext({ city: WL.earth.current, season: curSeason(), tod: curTod(), ambience: { wind: 0.1 } });
  push({ inScene: false });
  // "fly somewhere else": open the destination list with the search ready
  if (pick) setTimeout(showPicker, 350);
}
function showPicker() {
  const d = $("#dock"), sI = $("#search");
  ["#dock", "#topbar"].forEach((s) => $(s).classList.remove("away")); $("#preview").classList.add("away"); WL.previewCity = null;
  sI.value = ""; buildDock();
  dockState("open");
  $("#dockList").scrollTop = 0;
  if (matchMedia("(pointer: fine)").matches) sI.focus({ preventScroll: true });
  d.classList.add("pulse-once"); setTimeout(() => d.classList.remove("pulse-once"), 1200);
}

// ----------------------------------------------------------------------------- atmosphere controls
const SEASON_IC = { auto: "✦", spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };
const TOD_IC = { auto: "◐", cycle: "🔄", sunrise: "🌅", morning: "🌤️", noon: "☀️", golden: "🌇", sunset: "🌆", evening: "🌃", night: "🌙" };
function bindAtmos() {
  $("#atmos").addEventListener("click", (e) => {
    if (e.target.closest("[data-fold]")) { $("#atmos").classList.toggle("open"); return; }
    const s = e.target.closest("[data-season]")?.dataset.season, td = e.target.closest("[data-tod-open]");
    if (s) { WL.season = s; applyAtmos(); push({ season: s }); track("season", { city: (WL.scene.city || WL.earth.current)?.key, d: { season: s } }); }
    if (td) toggleTod();
  });
}
function renderAtmos() {
  const c = WL.scene.city || WL.earth.current, cs = curSeason(c);
  const tropical = c?.climate === "tropical";
  const label = tropical ? (cs === "summer" || cs === "autumn" ? t("wet") : t("dry")) : t(cs);
  $("#atmos").innerHTML = `<button class="icon-btn fold-btn" data-fold aria-label="${t("timeOfDay")}">${SEASON_IC[WL.season] || "✦"}</button>` + ["auto", "spring", "summer", "autumn", "winter"].map((s) => `<button class="icon-btn ${WL.season === s ? "on" : ""}" data-season="${s}" title="${t(s)}" aria-label="${t(s)}">${SEASON_IC[s]}</button>`).join("")
    + `<span class="lbl">${esc(label)}</span><span class="sep"></span><button class="icon-btn ${WL.tod !== "auto" ? "on" : ""}" data-tod-open title="${t("timeOfDay")}">${TOD_IC[WL.tod === "auto" ? curTod(c) : WL.tod]}</button><span class="lbl">${t(WL.tod === "auto" ? "realtime" : WL.tod)}</span>`;
}
function toggleTod() {
  const ex = $(".tod"); if (ex) return ex.remove();
  const tods = ["auto", "cycle", "sunrise", "morning", "noon", "golden", "sunset", "evening", "night"];
  const el = h(`<div class="tod glass dense"><div class="eyebrow" style="margin-bottom:10px">${t("timeOfDay")}</div>
    <input type="range" min="0" max="${tods.length - 1}" step="1" value="${tods.indexOf(WL.tod)}"><div class="seg" style="margin-top:10px">${tods.map((k) => `<button data-k="${k}" class="${WL.tod === k ? "on" : ""}">${TOD_IC[k]} ${t(k === "auto" ? "realtime" : k === "cycle" ? "dayCycle" : k)}</button>`).join("")}</div></div>`);
  const set = (k) => { if (k === "cycle" && WL.tod !== "cycle") { WL.cycle0 = Date.now(); track("cycle"); } WL.tod = k; WL._cycTod = null; applyAtmos(); push({ tod: k, ...(k === "cycle" ? { cycle0: WL.cycle0 } : {}) }); track("tod", { city: (WL.scene.city || WL.earth.current)?.key, d: { tod: k } }); $$("button", el).forEach((b) => b.classList.toggle("on", b.dataset.k === k)); $("input", el).value = tods.indexOf(k); };
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
    <p class="dev-credit">WorldLive · Developed by <a href="https://welicodev.uz" target="_blank" rel="noopener">welicodev.uz</a></p>
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
    if (e.target.closest("a[href^='/album/']")) track("album");
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
  let busy = false, again = false, lastPoll = 0;
  const poll = async (force) => {
    if (busy && force) { again = true; return; }   // a change arrived mid-request: fetch again right after
    if (!WL.journey || busy || (!force && document.hidden)) return;
    if (!force && WL.rt?.up && Date.now() - lastPoll < 15000) return;   // the socket tells us when something changes
    busy = true; lastPoll = Date.now();
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
      const jel = WL.scene._journalEl, cityMems = (WL.journey.memories || []).filter((m) => m.city === WL.scene.city?.key).length;
      if (jel?.isConnected && cityMems !== WL.scene._journalN && !jel.querySelector("[data-text]")?.value) WL.scene._journal(jel);
      // follow the partner
      if (s.flight && s.flight.at > Date.now() - 20000 && !WL.flying && s.flight.at !== WL._lastFlight) {
        WL._lastFlight = s.flight.at;
        if (WL.scene.city) backToGlobe();
        fly(byKey(s.flight.from), byKey(s.flight.to), { ...s.flight, follower: true });
      } else if (!WL.flying && s.city && s.city !== WL.earth.current.key && !s.flight) {
        WL.earth.current = byKey(s.city);
      }
      if (s.moment && s.moment.at !== WL._lastMoment && s.moment.by !== WL.mid && Date.now() - s.moment.at < 60000 && !WL.flying) {
        WL._lastMoment = s.moment.at;
        const c = byKey(s.moment.city);
        if (c && WL.scene.city?.key === c.key) openMoment(s.moment, true);
      }
      if (s.season && s.season !== WL.season) { WL.season = s.season; applyAtmos(); }
      if (s.cycle0 && s.cycle0 !== WL.cycle0) WL.cycle0 = s.cycle0;
      if (s.tod && s.tod !== WL.tod) { WL.tod = s.tod; WL._cycTod = null; applyAtmos(); }
      void other;
      checkGifts();
    } catch {} finally { busy = false; if (again) { again = false; setTimeout(() => poll(true), 0); } }
  };
  setInterval(poll, 2500);
  on("rt:v", (m) => { if (m.v > (WL.version || 0)) poll(true); });
  on("rt:open", () => poll(true));
  on("rt:chat", (m) => WL.chat?.add([m.m], true));
}

boot().catch((e) => { console.error(e); $(".loader-txt").textContent = "Error: " + e.message; });
