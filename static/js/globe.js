// WorldLive — Living Earth: real-sun day/night shader, clouds, borders, markers, flights
import { distanceKm, emit, flag, greatCircle, QUALITY, subsolar, STATIC } from "./core.js";
import { L } from "./i18n.js";

const THREE = window.THREE;
const IMG = STATIC + "img/earth/";

const earthShader = {
  vertexShader: `
    varying vec2 vUv; varying vec3 vN; varying vec3 vP;
    void main() {
      vUv = uv;
      vN = normalize(mat3(modelMatrix) * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0); vP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: `
    uniform sampler2D dayTex; uniform sampler2D nightTex; uniform sampler2D waterTex;
    uniform vec3 sunDir; uniform float nightBoost;
    varying vec2 vUv; varying vec3 vN; varying vec3 vP;
    void main() {
      vec3 n = normalize(vN);
      vec3 V = normalize(cameraPosition - vP);
      float d = dot(n, sunDir);
      float day = smoothstep(-0.10, 0.22, d);
      vec3 dayC = texture2D(dayTex, vUv).rgb;
      vec3 nightC = texture2D(nightTex, vUv).rgb;
      float water = texture2D(waterTex, vUv).r;
      vec3 Hh = normalize(sunDir + V);
      float spec = pow(max(dot(n, Hh), 0.0), 140.0) * water * day;
      float twi = exp(-pow(d * 5.5, 2.0));
      vec3 lit = dayC * (0.18 + 1.05 * max(d, 0.0));
      vec3 city = pow(nightC, vec3(1.25)) * vec3(1.35, 1.05, 0.72) * nightBoost;
      vec3 col = mix(city + dayC * 0.035, lit, day);
      col += vec3(1.0, 0.48, 0.2) * twi * 0.16;
      col += vec3(1.0, 0.93, 0.8) * spec * 0.55;
      float fr = pow(1.0 - max(dot(n, V), 0.0), 2.6);
      col += vec3(0.32, 0.58, 1.0) * fr * (0.12 + 0.55 * day);
      gl_FragColor = vec4(col, 1.0);
    }`,
};
const cloudShader = {
  vertexShader: earthShader.vertexShader,
  fragmentShader: `
    uniform sampler2D map; uniform vec3 sunDir; uniform float opacity;
    varying vec2 vUv; varying vec3 vN; varying vec3 vP;
    void main() {
      vec4 c = texture2D(map, vUv);
      float d = dot(normalize(vN), sunDir);
      float day = smoothstep(-0.15, 0.25, d);
      vec3 col = mix(vec3(0.05, 0.07, 0.12), vec3(1.0), day) + vec3(1.0, 0.55, 0.3) * exp(-pow(d * 5.0, 2.0)) * 0.25;
      gl_FragColor = vec4(col, c.a * opacity * (0.35 + 0.65 * day));
    }`,
};

function buildPlane() {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f2ee, metalness: 0.55, roughness: 0.28 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe9c98b, metalness: 0.9, roughness: 0.25, emissive: 0x2a1c05 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0c1830, metalness: 1, roughness: 0.1 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 2.3, 18), white);
  fus.rotation.x = Math.PI / 2; g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), white);
  nose.scale.set(1, 1, 1.8); nose.position.z = 1.15; g.add(nose);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 3), glass);
  cockpit.position.set(0, 0.06, 1.28); cockpit.rotation.x = 0.9; g.add(cockpit);
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.35); wingShape.lineTo(1.45, -0.25); wingShape.lineTo(1.45, -0.42); wingShape.lineTo(0, -0.18);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.035, bevelEnabled: false });
  for (const s of [1, -1]) {
    const w = new THREE.Mesh(wingGeo, white);
    w.rotation.x = Math.PI / 2; w.scale.x = s; w.position.set(0, -0.04, 0.05); g.add(w);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.38, 12), gold);
    eng.rotation.x = Math.PI / 2; eng.position.set(0.55 * s, -0.12, 0.25); g.add(eng);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: s > 0 ? 0x41ff8a : 0xff4155 }));
    tip.position.set(1.45 * s, -0.04, -0.33); g.add(tip);
  }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.38), white);
  fin.position.set(0, 0.3, -1.0); fin.rotation.x = -0.35; g.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.025, 0.24), white);
  stab.position.set(0, 0.04, -1.05); g.add(stab);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.15, 1.2, 18, 1, true, -0.4, 0.8), gold);
  stripe.rotation.x = Math.PI / 2; g.add(stripe);
  const light = new THREE.PointLight(0xffe2b0, 2.2, 14); light.position.set(0, 1.5, 0); g.add(light);
  g.scale.setScalar(1.25);
  return g;
}

export class Earth {
  constructor(el, world) {
    this.world = world;
    this.cities = world.cities;
    this.home = this.cities.find((c) => c.key === "tashkent");
    this.current = this.home;
    this.onPick = () => {};
    const g = (this.g = new window.Globe(el, {
      rendererConfig: { antialias: QUALITY.tier > 0, powerPreference: "high-performance", logarithmicDepthBuffer: false },
      waitForGlobeReady: true, animateIn: true,
    }));
    g.renderer().setPixelRatio(QUALITY.dpr);
    g.backgroundImageUrl(IMG + "night-sky-md.jpg")
      .showAtmosphere(true).atmosphereColor("#7fb2ff").atmosphereAltitude(0.21)
      .width(innerWidth).height(innerHeight);
    addEventListener("resize", () => g.width(innerWidth).height(innerHeight));
    const ctl = g.controls();
    ctl.autoRotate = true; ctl.autoRotateSpeed = 0.28; ctl.enableDamping = true; ctl.dampingFactor = 0.08;
    ctl.minDistance = 112; ctl.maxDistance = 900;
    // phones: a calmer, more precise drag, and the canvas owns every touch (no page pull / pinch-zoom)
    if (matchMedia("(pointer: coarse)").matches) { ctl.rotateSpeed = 0.55; ctl.zoomSpeed = 0.7; ctl.dampingFactor = 0.12; }
    el.style.touchAction = "none";

    const tl = new THREE.TextureLoader();
    const tex = (f) => { const t = tl.load(IMG + f); t.anisotropy = 8; return t; };
    // progressive: a ~100 KB globe appears at once, the sharp textures stream in after the app has booted
    // (phones get 2K, larger screens 4K) — slow connections are never blocked behind 5 MB of images
    const big = !QUALITY.small && QUALITY.tier === 2;
    const prog = (f, fullOnPhone = null) => {
      const [b, ext] = [f.slice(0, f.lastIndexOf(".")), f.slice(f.lastIndexOf("."))];
      const u = { value: tex(`${b}-lo${ext}`) };
      const hi = big ? f : fullOnPhone ?? `${b}-md${ext}`;
      setTimeout(() => tl.load(IMG + hi, (t) => { t.anisotropy = 8; t.colorSpace = u.value.colorSpace; const old = u.value; u.value = t; old.dispose(); }), 3500);
      return u;
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: { dayTex: prog("earth-day.jpg"), nightTex: prog("earth-night.jpg"),
        waterTex: prog("earth-water.png"), sunDir: { value: new THREE.Vector3(1, 0, 0) }, nightBoost: { value: 1.0 } },
      vertexShader: earthShader.vertexShader, fragmentShader: earthShader.fragmentShader,
    });
    g.globeMaterial(this.mat);

    // clouds
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(g.getGlobeRadius() * 1.008, 72, 48),
      new THREE.ShaderMaterial({ uniforms: { map: prog("clouds.webp", "clouds.webp"), sunDir: this.mat.uniforms.sunDir, opacity: { value: 0.75 } },
        vertexShader: cloudShader.vertexShader, fragmentShader: cloudShader.fragmentShader, transparent: true, depthWrite: false })
    );
    this.clouds.rotation.y = -Math.PI / 2; // align texture with globe.gl's uv orientation
    g.scene().add(this.clouds);

    this.simTime = null; // null = real time
    this._tick = this._tick.bind(this);
    this._last = performance.now();
    requestAnimationFrame(this._tick);

    this._borders();
    this._markers();
    this._idleArcs();
    g.pointOfView({ lat: 25, lng: 40, altitude: 3.2 }, 0);
  }

  setSimTime(date) { this.simTime = date; }
  _sun() {
    const s = subsolar(this.simTime || new Date());
    const c = this.g.getCoords(s.lat, s.lng, 0);
    this.mat.uniforms.sunDir.value.set(c.x, c.y, c.z).normalize();
  }
  _tick(now) {
    const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
    if (!this.paused) {
      this.clouds.rotation.y += dt * 0.004;
      this._sun();
      this.flight?.step(now);
      if (now - (this._dc || 0) > 180) { this._dc = now; this._declutter(); }
    }
    requestAnimationFrame(this._tick);
  }

  // Borders are merged into two LineSegments draw calls (ours = gold, rest = faint).
  // (globe.gl polygon layers cost ~23 ms/frame on integrated GPUs — far too slow.)
  async _borders() {
    try {
      const geo = await (await fetch(STATIC + "data/countries.geojson")).json();
      const ours = new Set(this.cities.map((c) => c.country));
      const A = [], B = [];
      const iso = (p) => (p.ISO_A2 !== "-99" ? p.ISO_A2 : p.WB_A2 !== "-99" ? p.WB_A2 : { NOR: "NO" }[p.ADM0_A3] || p.ADM0_A3);
      this.countries = geo.features.filter((f) => f.properties.ISO_A2 !== "AQ").map((f) => {
        const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        const code = iso(f.properties), dst = ours.has(code) ? A : B;
        for (const poly of polys) for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
          const p = this.g.getCoords(ring[i][1], ring[i][0], 0.0025), q = this.g.getCoords(ring[i + 1][1], ring[i + 1][0], 0.0025);
          dst.push(p.x, p.y, p.z, q.x, q.y, q.z);
        }
        return { iso: code, name: f.properties.NAME, polys };
      });
      const mk = (arr, color, opacity) => {
        const geom = new THREE.BufferGeometry(); geom.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
        return new THREE.LineSegments(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
      };
      this.g.scene().add(mk(B, 0xffffff, 0.13), mk(A, 0xe9c98b, 0.55));
      // a tap on the globe picks the city nearest to the finger (not just the country's first city):
      // Cappadocia and Istanbul are both in Türkiye
      this.g.onGlobeClick(({ lat, lng }) => {
        const alt = this.g.pointOfView().altitude, reach = Math.max(350, Math.min(1500, alt * 520));
        const near = this.cities.map((c) => [c, distanceKm({ lat, lng }, c)]).sort((a, b) => a[1] - b[1])[0];
        if (near && near[1] < reach) return this.onPick(near[0]);
        const hit = this.countryAt(lat, lng);
        const inC = hit && this.cities.filter((x) => x.country === hit.iso).map((c) => [c, distanceKm({ lat, lng }, c)]).sort((a, b) => a[1] - b[1])[0];
        if (inC) this.onPick(inC[0]);
      });
    } catch (e) { console.warn("[WorldLive] borders", e); }
  }
  countryAt(lat, lng) {
    const inRing = (ring) => {
      let ins = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ins = !ins;
      }
      return ins;
    };
    return this.countries?.find((c) => c.polys.some((p) => inRing(p[0]) && !p.slice(1).some(inRing)));
  }

  _markers() {
    const heroes = new Set(this.world.hero);
    this.g.htmlElementsData(this.cities)
      .htmlLat((d) => d.lat).htmlLng((d) => d.lng).htmlAltitude(0.012)
      .htmlElement((d) => {
        const el = document.createElement("div");
        el.className = "marker" + (heroes.has(d.key) ? " hero" : "") + (d.key === "tashkent" ? " home" : "");
        el.innerHTML = `<div class="lbl">${flag(d.country)} <span>${L(d.name)}</span></div><div class="pin"></div>`;
        el.onclick = (e) => { e.stopPropagation(); this.onPick(d); };
        d._el = el;
        return el;
      })
      .htmlElementVisibilityModifier((el, vis) => el.classList.toggle("far", !vis))
      .htmlTransitionDuration(0);
    this.g.ringsData(this.cities.filter((c) => heroes.has(c.key)))
      .ringLat((d) => d.lat).ringLng((d) => d.lng)
      .ringColor(() => (t) => `rgba(233,201,139,${1 - t})`)
      .ringMaxRadius(3.2).ringPropagationSpeed(1.4).ringRepeatPeriod(2200);
  }
  _declutter() {
    const heroes = new Set(this.world.hero), sel = this.selected?.key;
    const rank = (c) => (c.key === sel ? 0 : c.key === this.current?.key ? 1 : heroes.has(c.key) ? 2 : 3);
    const taken = [];
    [...this.cities].sort((a, b) => rank(a) - rank(b)).forEach((c) => {
      const el = c._el; if (!el || !el.isConnected || el.classList.contains("far")) return;
      const lb = el.firstElementChild; if (!lb) return;
      el.classList.remove("tuck");
      const r = lb.getBoundingClientRect();
      if (!r.width) return;
      const hit = taken.some((q) => r.left < q.right + 4 && r.right > q.left - 4 && r.top < q.bottom + 3 && r.bottom > q.top - 3);
      if (hit) el.classList.add("tuck"); else taken.push(r);
    });
  }
  relabel() { this.cities.forEach((d) => { const s = d._el?.querySelector(".lbl span"); if (s) s.textContent = L(d.name); }); }

  _idleArcs() {
    const from = this.current;
    const arcs = this.world.hero.filter((k) => k !== from.key).map((k) => this.cities.find((c) => c.key === k)).filter(Boolean)
      .map((to) => ({ from, to, idle: true }));
    this._setArcs(arcs);
  }
  _setArcs(arcs) {
    this.g.arcsData(arcs)
      .arcStartLat((d) => d.from.lat).arcStartLng((d) => d.from.lng).arcEndLat((d) => d.to.lat).arcEndLng((d) => d.to.lng)
      .arcColor((d) => (d.idle ? ["rgba(233,201,139,0.05)", "rgba(233,201,139,0.55)"] : ["rgba(255,236,200,0.9)", "rgba(233,201,139,1)"]))
      .arcStroke((d) => (d.idle ? 0.35 : 0.7))
      .arcAltitudeAutoScale(0.42)
      .arcDashLength((d) => (d.idle ? 0.35 : 1)).arcDashGap((d) => (d.idle ? 1.6 : 0))
      .arcDashInitialGap((d) => (d.idle ? Math.random() * 2 : 0))
      .arcDashAnimateTime((d) => (d.idle ? 5200 : 0));
  }

  focus(city, altitude = 1.6, ms = 2200) {
    this.g.controls().autoRotate = false;
    // portrait phones: pull back so the whole globe fits the narrow screen
    const portrait = innerWidth / innerHeight < 0.8;
    this.g.pointOfView({ lat: city.lat - (portrait ? 2 : 6), lng: city.lng, altitude: altitude * (portrait ? 1.45 : 1) }, ms);
  }
  idle() { this.g.controls().autoRotate = true; }
  pause(p) {
    this.paused = p;
    p ? this.g.pauseAnimation() : this.g.resumeAnimation();
  }

  /** Animate a flight; resolves when the aircraft lands. onProgress(t, info) for the HUD. */
  fly(from, to, onProgress) {
    return new Promise((resolve) => {
      const g = this.g, R = g.getGlobeRadius();
      const km = distanceKm(from, to);
      const dur = Math.min(15000, Math.max(8000, 6500 + km * 0.7));
      const peak = Math.min(0.34, Math.max(0.07, km / 26000));
      const plane = this.plane || (this.plane = buildPlane());
      g.scene().add(plane);
      const trailN = 90, trailPts = new Float32Array(trailN * 3), trailCol = new Float32Array(trailN * 3);
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPts, 3));
      trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
      const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
      g.scene().add(trail);
      const hist = [];
      this._setArcs([{ from, to }]);
      g.htmlElementsData(this.cities.filter((c) => c === from || c === to));
      g.controls().autoRotate = false; g.controls().enabled = false;
      const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
      const alt = (t) => 0.004 + peak * Math.pow(Math.sin(Math.PI * t), 0.75);
      const v = new THREE.Vector3(), ahead = new THREE.Vector3();
      let t0 = null;
      this.flight = {
        step: (now) => {
          if (t0 == null) t0 = now;
          const raw = Math.min(1, (now - t0) / dur), t = ease(raw);
          const p = greatCircle(from, to, t), pa = greatCircle(from, to, Math.min(1, t + 0.004));
          const c = g.getCoords(p.lat, p.lng, alt(t)), ca = g.getCoords(pa.lat, pa.lng, alt(Math.min(1, t + 0.004)));
          v.set(c.x, c.y, c.z); ahead.set(ca.x, ca.y, ca.z);
          plane.position.copy(v); plane.up.copy(v).normalize(); plane.lookAt(ahead);
          hist.unshift(v.clone()); if (hist.length > trailN) hist.pop();
          for (let i = 0; i < trailN; i++) {
            const q = hist[Math.min(i, hist.length - 1)];
            trailPts.set([q.x, q.y, q.z], i * 3);
            const f = 1 - i / trailN; trailCol.set([f, f * 0.85, f * 0.6], i * 3);
          }
          trailGeo.attributes.position.needsUpdate = trailGeo.attributes.color.needsUpdate = true;
          // chase camera: slightly behind and above, pulling in on approach
          const cam = greatCircle(from, to, Math.max(0, t - 0.05));
          const camAlt = 0.55 + peak * 2.2 * Math.sin(Math.PI * t) + (raw > 0.88 ? -(raw - 0.88) * 2.2 : 0);
          g.pointOfView({ lat: cam.lat - 4 * (1 - t), lng: cam.lng, altitude: Math.max(0.28, camAlt) }, 0);
          onProgress?.(raw, { km, altM: Math.round(Math.min(1, Math.pow(Math.sin(Math.PI * t), 0.6) * 1.15) * 11300 / 10) * 10, speed: raw > 0.08 && raw < 0.92 ? 870 + Math.round(Math.sin(now / 900) * 12) : Math.round(260 + 600 * Math.sin(Math.PI * raw)) });
          if (raw >= 1) {
            this.flight = null;
            g.scene().remove(trail); trailGeo.dispose();
            setTimeout(() => g.scene().remove(plane), 400);
            g.controls().enabled = true;
            this.current = to;
            g.htmlElementsData(this.cities);
            this._idleArcs();
            resolve();
          }
        },
      };
    });
  }
}
