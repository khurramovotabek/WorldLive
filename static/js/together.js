// WorldLive — travelling together, for real
// • every journey has a unique id (8-letter code) and an invite link  /j/<CODE>
// • friends open the link, enter their own name / gender / photo, and press “I'm ready”
// • the trip starts for everyone at once; from then on city, flights, season and time stay in sync
// • a live chat to decide where to go next — a proposal card has a one-tap “Let's fly” button
// • any number of devices can follow the same journey with the code
import { $, $$, api, esc, flag, h, on, store, toast } from "./core.js";
import { L, t } from "./i18n.js";
import { track } from "./track.js";

export const inviteUrl = (code) => `${location.origin}/j/${code}`;
export const readInvite = () => { try { return JSON.parse(document.getElementById("wl-invite")?.textContent || "null"); } catch { return null; } };

// ------------------------------------------------------------------ lobby
/** show the waiting room until the journey starts; resolves with the fresh journey */
export function lobby({ code, mid, onStart }) {
  const url = inviteUrl(code);
  const el = h(`<div class="lobby"><div class="lobby-card glass">
    <div class="eyebrow">${t("lobbyEyebrow")}</div>
    <h2 class="display">${t("lobbyTitle")}</h2>
    <p class="faint">${t("lobbyText")}</p>
    <div class="invite-box">
      <div class="invite-code"><span>${t("tripId")}</span><b>${esc(code)}</b></div>
      <div class="invite-url"><input readonly value="${esc(url)}" aria-label="link"><button class="btn btn-ghost" data-copy>${t("copyLink")}</button></div>
      <a class="btn tg" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("inviteMsg"))}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1-1 .2-1.5L20.5 2.8c.9-.3 1.6.2 1.4 1.5z"/></svg>
        ${t("inviteTelegram")}</a>
    </div>
    <div class="eyebrow mt">${t("lobbyWho")}</div>
    <ul class="lobby-list" data-list></ul>
    <div class="lobby-actions"><button class="btn btn-gold" data-ready>${t("imReady")}</button><button class="linkish" data-force hidden>${t("startNow")}</button></div>
  </div></div>`);
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add("on"));
  $(".btn.tg", el).addEventListener("click", () => track("invite", { d: { code } }));
  $("[data-copy]", el).onclick = async () => { try { await navigator.clipboard.writeText(url); toast(t("copied")); } catch { $("input", el).select(); } };
  $("[data-share]", el)?.addEventListener("click", () => navigator.share({ title: "WorldLive", text: t("inviteMsg"), url }).catch(() => {}));
  let ready = false, done = false, timer;
  const paint = (party = [], started) => {
    $("[data-list]", el).innerHTML = party.map((m) => `<li class="${m.ready ? "ok" : ""}">${avatar(m, m.id === mid || window.WL.rt?.here.has(m.id) ? "on" : "")}<span>${esc(m.name)}${m.u ? ` <small class="faint">@${esc(m.u)}</small>` : ""}${m.id === mid ? ` <i>· ${t("youTag")}</i>` : ""}${m.host ? ` <i>· ${t("hostTag")}</i>` : ""}</span><em>${m.ready ? "✓ " + t("readyTag") : t("waitingTag")}</em></li>`).join("")
      + (party.length < 2 ? `<li class="ghost"><span class="mav">?</span><span>${t("waitingMate")}</span><em>…</em></li>` : "");
    const me = party.find((m) => m.id === mid);
    $("[data-force]", el).hidden = !me?.host || party.every((m) => m.ready);
    $("[data-ready]", el).textContent = ready ? t("notReady") : t("imReady");
    $("[data-ready]", el).classList.toggle("btn-gold", !ready);
    if (started && !done) { done = true; clearInterval(timer); el.classList.remove("on"); setTimeout(() => el.remove(), 400); onStart(); }
  };
  const poll = async () => { try { const j = await api(`journey/${code}`); ready = !!j.state.party?.find((m) => m.id === mid)?.ready; paint(j.state.party, j.state.started); } catch {} };
  $("[data-ready]", el).onclick = async () => { ready = !ready; track("ready", { d: { code, ready } }); const r = await api(`journey/${code}/ready`, { body: { mid, ready } }); paint(r.party, r.started); };
  $("[data-force]", el).onclick = async () => { const r = await api(`journey/${code}/ready`, { body: { mid, ready: true, force: true } }); paint(r.party, r.started); };
  poll(); timer = setInterval(poll, 4000);
  on("rt:v", () => { if (!done) poll(); });
}

export function avatar(m, cls = "") {
  const ini = esc((m.name || "?")[0].toUpperCase());
  return `<span class="mav ${m.g === "f" ? "f" : "m"} ${cls}" ${m.photo ? `style="background-image:url('${esc(m.photo)}')"` : ""}>${m.photo ? "" : ini}</span>`;
}

// ------------------------------------------------------------------ chat
export class Chat {
  constructor({ journey, me, mid, onFly }) {
    this.journey = journey; this.me = me; this.mid = mid; this.onFly = onFly;
    this.last = 0; this.unread = 0; this.open = false; this.msgs = [];
    this.btn = h(`<button class="icon-btn glass chat-btn" aria-label="${t("chat")}" title="${t("chat")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5h16v11H9l-5 4z"/></svg><i class="badge" hidden></i></button>`);
    $("#passportBtn").before(this.btn);
    this.panel = h(`<aside class="chat glass" aria-label="${t("chat")}">
      <header><div><div class="eyebrow">${t("chatEyebrow")}</div><b>${t("chat")}</b></div><div class="chat-who" data-who></div><button class="gift-x" data-x>✕</button></header>
      <div class="chat-list" data-list></div>
      <div class="chat-typing" data-typing></div>
      <div class="chat-react" data-reacts>${["❤️", "😍", "✨", "😂", "👏", "🎉"].map((e) => `<button data-react="${e}">${e}</button>`).join("")}</div>
      <div class="chat-quick" data-quick></div>
      <form class="chat-form" data-form><input data-in maxlength="500" autocomplete="off" placeholder="${t("chatPh")}"><button class="btn btn-gold" aria-label="send">➤</button></form>
    </aside>`);
    document.body.append(this.panel);
    this.btn.onclick = () => this.toggle();
    $("[data-x]", this.panel).onclick = () => this.toggle(false);
    let lastTyping = 0;
    $("[data-in]", this.panel).addEventListener("input", () => { if (Date.now() - lastTyping > 2500) { lastTyping = Date.now(); window.WL.rt?.send({ t: "typing", name: this.me }); } });
    on("rt:typing", (m) => {
      const el = $("[data-typing]", this.panel); el.textContent = `${m.name} ${t("typing")}`; el.classList.add("on");
      clearTimeout(this._ty); this._ty = setTimeout(() => el.classList.remove("on"), 3500);
    });
    $("[data-form]", this.panel).onsubmit = (e) => { e.preventDefault(); const i = $("[data-in]", this.panel); const v = i.value.trim(); if (v) { this.send({ text: v }); i.value = ""; } };
    this.panel.addEventListener("click", (e) => {
      const f = e.target.closest("[data-fly]"); if (f) { this.onFly(f.dataset.fly); this.toggle(false); }
      const q = e.target.closest("[data-q]"); if (q) this.send({ text: q.dataset.q });
      const p = e.target.closest("[data-prop]"); if (p) this.send({ kind: "propose", data: { city: p.dataset.prop } });
      const a = e.target.closest("[data-agree]"); if (a) this.send({ kind: "agree", data: { ref: +a.dataset.agree } });
      const r = e.target.closest("[data-react]");
      if (r) { window.WL.rt?.send({ t: "react", e: r.dataset.react, name: this.me }); import("./realtime.js").then((x) => x.floatReaction(r.dataset.react, this.me)); }
    });
    this.pull();
  }
  toggle(v = !this.open) {
    this.open = v; this.panel.classList.toggle("on", v);
    if (v) { this.unread = 0; this.badge(); this.quick(); setTimeout(() => $("[data-in]", this.panel).focus({ preventScroll: true }), 300); this.scroll(); }
  }
  badge() { const b = $(".badge", this.btn); b.hidden = !this.unread; b.textContent = this.unread > 9 ? "9+" : this.unread; }
  quick() {
    const w = window.WL, here = w.scene?.city || w.earth?.current;
    const picks = w.world.cities.filter((c) => c.key !== here?.key).sort(() => Math.random() - 0.5).slice(0, 3);
    $("[data-quick]", this.panel).innerHTML = [
      ...picks.map((c) => `<button data-prop="${c.key}">✈ ${flag(c.country)} ${esc(L(c.name))}?</button>`),
      ...[t("q1"), t("q2"), t("q3")].map((q) => `<button data-q="${esc(q)}">${esc(q)}</button>`),
    ].join("");
    const party = w.journey?.state?.party || [];
    $("[data-who]", this.panel).innerHTML = party.map((m) => avatar(m, online(m) ? "on" : "")).join("");
  }
  scroll() { const l = $("[data-list]", this.panel); l.scrollTop = l.scrollHeight; }
  async send(body) {
    try {
      const m = await api(`journey/${this.journey().code}/chat`, { body: { ...body, author: this.me, mid: this.mid } }); this.add([m]);
      track(body.kind === "propose" ? "propose" : "chat", { city: body.data?.city, d: { len: (body.text || "").length } });
    }
    catch { toast("✕"); }
  }
  async pull() {
    try { const r = await api(`journey/${this.journey().code}/chat?after=${this.last}`); this.add(r.messages, true); } catch {}
  }
  add(list, incoming = false) {
    const fresh = list.filter((m) => m && m.id > this.last); if (!fresh.length) return;
    this.last = Math.max(this.last, ...fresh.map((m) => m.id));
    const L0 = $("[data-list]", this.panel);
    fresh.forEach((m) => {
      this.msgs.push(m);
      if (m.kind === "agree") return this.vote(m, incoming);
      L0.append(h(this.html(m)));
      if (m.kind === "propose") this.paintVotes(m.id);
      const mine = m.mid === this.mid;
      if (incoming && !mine && !this.open && this._booted) {
        this.unread++; this.badge();
        if (m.kind !== "system") toast(`💬 ${m.author}: ${m.kind === "propose" ? "✈ " + L(cityOf(m.data.city)?.name || { en: m.data.city }) + "?" : m.text}`);
      }
    });
    this._booted = true; this.scroll();
  }
  html(m) {
    const mine = m.mid === this.mid, time = new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (m.kind === "system") return `<div class="cm sys">✨ ${esc(m.data?.name || "")} ${t("joinedTrip")}</div>`;
    if (m.kind === "propose") {
      const c = cityOf(m.data.city); if (!c) return "";
      return `<div class="cm ${mine ? "me" : ""}" data-pid="${m.id}"><small>${esc(m.author)} · ${time}</small><div class="cm-prop" style="background-image:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.75)),url('${esc(c.photo?.src?.replace(/\/\d+px-/, "/960px-") || "")}')"><span>${t("letsGo")}</span><b>${flag(c.country)} ${esc(L(c.name))}</b>
        <div class="votes" data-votes></div>
        <div class="prop-acts"><button class="btn btn-gold" data-agree="${m.id}">✓ ${t("agree")}</button><button class="btn btn-ghost" data-fly="${c.key}">✈ ${t("flyNow")}</button></div></div></div>`;
    }
    return `<div class="cm ${mine ? "me" : ""}"><small>${esc(m.author)} · ${time}</small><p>${esc(m.text)}</p></div>`;
  }
}
// ---- agreeing on a destination: the proposer counts as “yes”; when everyone agrees, the plane takes off for all
Chat.prototype.votesFor = function (pid) {
  const prop = this.msgs.find((m) => m.id === pid && m.kind === "propose"); if (!prop) return null;
  const yes = new Set([prop.mid, ...this.msgs.filter((m) => m.kind === "agree" && m.data?.ref === pid).map((m) => m.mid)].filter(Boolean));
  return { prop, yes };
};
Chat.prototype.paintVotes = function (pid) {
  const v = this.votesFor(pid), card = $(`[data-pid="${pid}"]`, this.panel); if (!v || !card) return;
  const party = window.WL.journey?.state?.party || [];
  $("[data-votes]", card).innerHTML = party.map((m) => `<span class="${v.yes.has(m.id) ? "y" : ""}" title="${esc(m.name)}">${avatar(m)}</span>`).join("") + `<em>${v.yes.size}/${Math.max(party.length, 1)}</em>`;
  const btn = $("[data-agree]", card); if (btn) { btn.disabled = v.yes.has(this.mid); btn.textContent = v.yes.has(this.mid) ? "✓ " + t("agreed") : "✓ " + t("agree"); }
  card.classList.toggle("all", party.length > 1 && party.every((m) => v.yes.has(m.id)));
};
Chat.prototype.vote = function (m, incoming) {
  const pid = m.data?.ref; this.paintVotes(pid);
  const v = this.votesFor(pid), party = window.WL.journey?.state?.party || [];
  if (!v || party.length < 2 || !party.every((x) => v.yes.has(x.id))) { if (incoming && m.mid !== this.mid && this._booted) toast(`✓ ${m.author} ${t("agreesWith")} ${L(cityOf(v?.prop.data.city)?.name || {})}`); return; }
  // everyone agreed → the last vote's device books the flight; the others follow through the shared state
  if (m.mid === this.mid && !this._flown?.has(pid) && Date.now() - new Date(m.at).getTime() < 60000) {
    (this._flown ||= new Set()).add(pid);
    toast("🎉 " + t("allAgreed")); setTimeout(() => this.onFly(v.prop.data.city, true), 900); this.toggle(false);
  }
};
const cityOf = (k) => window.WL.world.cities.find((c) => c.key === k);
export const online = (m) => !!window.WL.rt?.here.has(m.id) || Date.now() - (window.WL.journey?.state?.["seen_" + m.id] || 0) < 45000;
export const myMid = () => store.get("journey")?.mid || null;
