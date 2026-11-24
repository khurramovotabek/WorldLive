// WorldLive — real-time link between everyone on a journey (WebSocket /ws/j/<CODE>)
// The server pushes changes the moment they happen (“v” = new shared state, “chat” = new message,
// “presence” = who is here); travellers relay tiny signals to each other (typing…, reactions).
// If the socket drops it reconnects with back-off, and HTTP polling quietly covers the gap.
import { emit } from "./core.js";

export class RT {
  constructor(code, mid) {
    this.code = code; this.mid = mid || ""; this.tries = 0; this.here = new Set(); this.alive = false; this.closed = false;
    this.connect();
    addEventListener("online", () => this.alive || this.connect());
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !this.alive) this.connect(); });
  }
  get up() { return this.alive; }
  connect() {
    if (this.closed || (this.ws && this.ws.readyState <= 1)) return;
    const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/j/${this.code}?mid=${encodeURIComponent(this.mid)}`;
    let ws;
    try { ws = this.ws = new WebSocket(url); } catch { return this._retry(); }
    ws.onopen = () => {
      this.alive = true; this.tries = 0; emit("rt:open");
      clearInterval(this._ping); this._ping = setInterval(() => this.send({ t: "ping" }), 25000);
    };
    ws.onmessage = (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === "pong") return;
      if (m.t === "presence" && m.mid && m.mid !== this.mid) {
        m.on ? this.here.add(m.mid) : this.here.delete(m.mid);
        if (m.on && !m.hello) this.send({ t: "hello" });   // say we're here too, once
      }
      emit("rt:" + m.t, m);
    };
    ws.onclose = (e) => {
      this.alive = false; clearInterval(this._ping); this.here.clear(); emit("rt:close");
      if (e.code !== 4404) this._retry();
    };
    ws.onerror = () => {};
  }
  _retry() {
    if (this.closed) return;
    const wait = Math.min(15000, 600 * 2 ** this.tries++) + Math.random() * 400;
    clearTimeout(this._t); this._t = setTimeout(() => this.connect(), wait);
  }
  send(o) { if (this.ws?.readyState === 1) { this.ws.send(JSON.stringify(o)); return true; } return false; }
  close() { this.closed = true; clearTimeout(this._t); clearInterval(this._ping); try { this.ws?.close(); } catch {} }
}

/** floating reaction that drifts up the screen (shown on every device of the journey) */
export function floatReaction(e, name) {
  const el = document.createElement("div");
  el.className = "rt-float";
  el.style.left = 12 + Math.random() * 70 + "vw";
  el.innerHTML = `<span>${e}</span>${name ? `<i>${name.replace(/[<>&"]/g, "")}</i>` : ""}`;
  document.body.append(el);
  setTimeout(() => el.remove(), 3600);
}
