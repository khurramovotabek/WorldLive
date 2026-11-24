// WorldLive — travelling together, for real
// • every journey has a unique id (8-letter code) and an invite link  /j/<CODE>
// • friends open the link, enter their own name / gender / photo, and press “I'm ready”
// • the trip starts for everyone at once; from then on city, flights, season and time stay in sync
// • a live chat to decide where to go next — a proposal card has a one-tap “Let's fly” button
// • any number of devices can follow the same journey with the code
import { $, $$, api, esc, flag, h, store, toast } from "./core.js";
import { L, t } from "./i18n.js";

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
      <div class="invite-share">
        <a class="btn tg" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("inviteMsg"))}">✈ Telegram</a>
        <a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(t("inviteMsg") + " " + url)}">WhatsApp</a>
        ${navigator.share ? `<button class="btn btn-ghost" data-share>${t("shareMore")}</button>` : ""}
      </div>
    </div>
    <div class="eyebrow mt">${t("lobbyWho")}</div>
    <ul class="lobby-list" data-list></ul>
    <div class="lobby-actions"><button class="btn btn-gold" data-ready>${t("imReady")}</button><button class="linkish" data-force hidden>${t("startNow")}</button></div>
  </div></div>`);
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add("on"));
  $("[data-copy]", el).onclick = async () => { try { await navigator.clipboard.writeText(url); toast(t("copied")); } catch { $("input", el).select(); } };
  $("[data-share]", el)?.addEventListener("click", () => navigator.share({ title: "WorldLive", text: t("inviteMsg"), url }).catch(() => {}));
  let ready = false, done = false, timer;
  const paint = (party = [], started) => {
    $("[data-list]", el).innerHTML = party.map((m) => `<li class="${m.ready ? "ok" : ""}">${avatar(m)}<span>${esc(m.name)}${m.id === mid ? ` <i>· ${t("youTag")}</i>` : ""}${m.host ? ` <i>· ${t("hostTag")}</i>` : ""}</span><em>${m.ready ? "✓ " + t("readyTag") : t("waitingTag")}</em></li>`).join("");
    const me = party.find((m) => m.id === mid);
    $("[data-force]", el).hidden = !me?.host || party.every((m) => m.ready);
    $("[data-ready]", el).textContent = ready ? t("notReady") : t("imReady");
    $("[data-ready]", el).classList.toggle("btn-gold", !ready);
    if (started && !done) { done = true; clearInterval(timer); el.classList.remove("on"); setTimeout(() => el.remove(), 400); onStart(); }
  };
  const poll = async () => { try { const j = await api(`journey/${code}`); ready = !!j.state.party?.find((m) => m.id === mid)?.ready; paint(j.state.party, j.state.started); } catch {} };
  $("[data-ready]", el).onclick = async () => { ready = !ready; const r = await api(`journey/${code}/ready`, { body: { mid, ready } }); paint(r.party, r.started); };
  $("[data-force]", el).onclick = async () => { const r = await api(`journey/${code}/ready`, { body: { mid, ready: true, force: true } }); paint(r.party, r.started); };
  poll(); timer = setInterval(poll, 2000);
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
      <div class="chat-quick" data-quick></div>
      <form class="chat-form" data-form><input data-in maxlength="500" autocomplete="off" placeholder="${t("chatPh")}"><button class="btn btn-gold" aria-label="send">➤</button></form>
    </aside>`);
    document.body.append(this.panel);
    this.btn.onclick = () => this.toggle();
    $("[data-x]", this.panel).onclick = () => this.toggle(false);
    $("[data-form]", this.panel).onsubmit = (e) => { e.preventDefault(); const i = $("[data-in]", this.panel); const v = i.value.trim(); if (v) { this.send({ text: v }); i.value = ""; } };
    this.panel.addEventListener("click", (e) => {
      const f = e.target.closest("[data-fly]"); if (f) { this.onFly(f.dataset.fly); this.toggle(false); }
      const q = e.target.closest("[data-q]"); if (q) this.send({ text: q.dataset.q });
      const p = e.target.closest("[data-prop]"); if (p) this.send({ kind: "propose", data: { city: p.dataset.prop } });
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
    try { const m = await api(`journey/${this.journey().code}/chat`, { body: { ...body, author: this.me, mid: this.mid } }); this.add([m]); }
    catch { toast("✕"); }
  }
  async pull() {
    try { const r = await api(`journey/${this.journey().code}/chat?after=${this.last}`); this.add(r.messages, true); } catch {}
  }
  add(list, incoming = false) {
    const fresh = list.filter((m) => m.id > this.last); if (!fresh.length) return;
    this.last = Math.max(this.last, ...fresh.map((m) => m.id));
    const L0 = $("[data-list]", this.panel);
    fresh.forEach((m) => {
      this.msgs.push(m);
      L0.append(h(this.html(m)));
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
      return `<div class="cm ${mine ? "me" : ""}"><small>${esc(m.author)} · ${time}</small><div class="cm-prop" style="background-image:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.75)),url('${esc(c.photo?.src?.replace(/\/\d+px-/, "/960px-") || "")}')"><span>${t("letsGo")}</span><b>${flag(c.country)} ${esc(L(c.name))}</b><button class="btn btn-gold" data-fly="${c.key}">✈ ${t("flyThere")}</button></div></div>`;
    }
    return `<div class="cm ${mine ? "me" : ""}"><small>${esc(m.author)} · ${time}</small><p>${esc(m.text)}</p></div>`;
  }
}
const cityOf = (k) => window.WL.world.cities.find((c) => c.key === k);
export const online = (m) => Date.now() - (window.WL.journey?.state?.["seen_" + m.id] || 0) < 45000;
export const myMid = () => store.get("journey")?.mid || null;
