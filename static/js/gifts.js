// WorldLive — Surprise Engine
// • send a gift (flowers, a book, a MacBook, a car, perfume, a city souvenir…) with a message to anyone in the party
// • the receiver gets a wrapped box that opens with a small ceremony → react ❤, keep it for later, or set it aside
// • every city hides one secret gift; it sparkles somewhere in the scene until someone finds it
// Gifts live in the shared journey state, so they reach the partner's device on the next sync.
import { $, $$, esc, h, toast } from "./core.js";
import { getLang, L, t } from "./i18n.js";

const tri = (uz, en, ru) => ({ uz, en, ru });
const tx = (o) => o?.[getLang()] || o?.en || "";

export const GIFTS = {
  flowers: { ic: "💐", name: tri("Gul guldastasi", "A bouquet of flowers", "Букет цветов"),
    msg: [tri("Har bir gulda sen uchun bitta tabassum bor.", "Every flower holds one smile for you.", "В каждом цветке — улыбка для тебя."),
      tri("Sen bilan har fasl bahor.", "With you every season is spring.", "С тобой каждый сезон — весна.")] },
  roses: { ic: "🌹", name: tri("Qizil atirgullar", "Red roses", "Красные розы"),
    msg: [tri("Yuragimning rangi — shu atirgullarda.", "The colour of my heart is in these roses.", "Цвет моего сердца — в этих розах.")] },
  book: { ic: "📖", name: tri("Sevimli kitob", "A favourite book", "Любимая книга"),
    msg: [tri("Bu kitobni o‘qiyotganingda meni esla — eng chiroyli bobimiz hali oldinda.", "Think of me as you read — our best chapter is still ahead.", "Читай и вспоминай меня — лучшая глава ещё впереди.")] },
  macbook: { ic: "💻", name: tri("MacBook", "A MacBook", "MacBook"),
    msg: [tri("Orzularingni yozishing uchun. Men har biriga ishonaman.", "For writing your dreams down. I believe in every one of them.", "Чтобы записывать мечты. Я верю в каждую.")] },
  car: { ic: "🚗", name: tri("Mashina kaliti", "The keys to a car", "Ключи от машины"),
    msg: [tri("Keyingi sayohatga rulda sen bo‘lasan — men yonma-yon.", "Next trip you drive — I’ll be right beside you.", "В следующую поездку за рулём ты — я рядом.")] },
  perfume: { ic: "🧴", name: tri("Atir", "Perfume", "Духи"),
    msg: [tri("Bu shaharning hidi — endi har doim sen bilan.", "This city’s scent — now always with you.", "Аромат этого города — теперь всегда с тобой.")] },
  ring: { ic: "💍", name: tri("Uzuk", "A ring", "Кольцо"),
    msg: [tri("Doira kabi — boshi ham, oxiri ham yo‘q.", "Like a circle — no beginning and no end.", "Как круг — без начала и конца.")] },
  chocolate: { ic: "🍫", name: tri("Shokolad", "Chocolates", "Шоколад"),
    msg: [tri("Kuning shirin o‘tsin.", "May your day be sweet.", "Пусть день будет сладким.")] },
  letter: { ic: "💌", name: tri("Maktub", "A love letter", "Письмо"),
    msg: [tri("Ba’zi so‘zlarni faqat qog‘ozga ishonish mumkin.", "Some words can only be trusted to paper.", "Некоторые слова можно доверить только бумаге.")] },
  camera: { ic: "📷", name: tri("Fotoapparat", "A camera", "Фотоаппарат"),
    msg: [tri("Birgalikdagi har lahzani saqlab qolaylik.", "Let’s keep every moment we share.", "Давай сохраним каждый общий миг.")] },
};

// one souvenir per city — local, meaningful, never generic
const S = (ic, uz, en, ru) => ({ ic, name: tri(uz, en, ru) });
export const SOUVENIRS = {
  tashkent: S("🏺", "Rishton lagani", "A Rishtan ceramic plate", "Риштанское блюдо"),
  samarkand: S("🧵", "Samarqand suzanasi", "A Samarkand suzani", "Самаркандская сюзане"),
  bukhara: S("🪡", "Zardo‘zi do‘ppi", "A gold-embroidered doppi", "Золотошвейная тюбетейка"),
  istanbul: S("🪔", "Turk mozaika chirog‘i", "A Turkish mosaic lamp", "Турецкий мозаичный светильник"),
  cappadocia: S("🎈", "Havo shari miniatyurasi", "A hot-air balloon miniature", "Миниатюрный воздушный шар"),
  paris: S("🗼", "Eyfel minorasi kalitbog‘i", "An Eiffel Tower keepsake", "Брелок с Эйфелевой башней"),
  makkah: S("📿", "Tasbeh va zamzam", "Prayer beads and Zamzam water", "Чётки и вода Замзам"),
  madinah: S("🌴", "Ajva xurmosi", "Ajwa dates", "Финики аджва"),
  maldives: S("🐚", "Oq chig‘anoq", "A white seashell", "Белая ракушка"),
  kyoto: S("🎐", "Omamori tumori", "An omamori charm", "Амулет омамори"),
  interlaken: S("⌚", "Shveytsariya soati", "A Swiss watch", "Швейцарские часы"),
  dubai: S("🕌", "Oltin xurmo va bxur", "Golden dates and bakhoor", "Золотые финики и бахур"),
  giza: S("🔺", "Papirus surat", "A papyrus painting", "Папирус с рисунком"),
  santorini: S("💙", "Ko‘k gumbazli figurka", "A blue-dome figurine", "Фигурка с голубым куполом"),
  rome: S("🪙", "Trevi tangasi", "A Trevi Fountain coin", "Монетка фонтана Треви"),
  iceland: S("🧶", "Lopapeysa sviteri", "A lopapeysa sweater", "Исландский свитер лопапейса"),
  newyork: S("🗽", "Ozodlik haykali miniatyurasi", "A Statue of Liberty miniature", "Мини-статуя Свободы"),
  petra: S("🏜️", "Rangli qum shishasi", "A coloured-sand bottle", "Бутылочка с цветным песком"),
  beijing: S("🏮", "Qizil fonar", "A red lantern", "Красный фонарь"),
  moscow: S("🪆", "Matryoshka", "A matryoshka doll", "Матрёшка"),
  seoul: S("🎎", "Hanbok qo‘g‘irchog‘i", "A hanbok doll", "Кукла в ханбоке"),
  kualalumpur: S("🧵", "Batik ro‘mol", "A batik scarf", "Батиковый платок"),
  islamabad: S("🧣", "Pashmina ro‘mol", "A pashmina shawl", "Пашминовый платок"),
  rio: S("🎭", "Karnaval niqobi", "A carnival mask", "Карнавальная маска"),
  buenosaires: S("💃", "Tango tufli", "Tango shoes", "Туфли для танго"),
  cusco: S("🦙", "Alpaka sharf", "An alpaca scarf", "Шарф из альпаки"),
  yucatan: S("🌶️", "Mayya kakaosi", "Maya cacao", "Какао майя"),
  everest: S("🏔️", "Tibet qo‘ng‘irog‘i", "A Tibetan singing bowl", "Тибетская поющая чаша"),
  sanfrancisco: S("🌉", "Golden Gate otkritkasi", "A Golden Gate postcard", "Открытка с Золотыми Воротами"),
  losangeles: S("⭐", "Shon-sharaf yulduzi", "A Walk of Fame star", "Звезда Аллеи славы"),
  alaska: S("🐻", "Grizli o‘yinchog‘i", "A grizzly plush", "Плюшевый гризли"),
  haiti: S("🎨", "Gaiti rasmi", "A Haitian painting", "Гаитянская картина"),
  jakarta: S("🎎", "Vayang qo‘g‘irchog‘i", "A wayang puppet", "Кукла ваянг"),
  bali: S("🌺", "Frangipani gulchambar", "A frangipani garland", "Гирлянда из франжипани"),
  sydney: S("🪃", "Bumerang", "A boomerang", "Бумеранг"),
  canberra: S("🐨", "Koala o‘yinchog‘i", "A koala plush", "Плюшевая коала"),
  melbourne: S("☕", "Melburn qahvasi", "Melbourne coffee", "Мельбурнский кофе"),
  capetown: S("🍷", "Rooibos choyi", "Rooibos tea", "Чай ройбуш"),
  marrakech: S("🫖", "Marokash choynagi", "A Moroccan teapot", "Марокканский чайник"),
  nairobi: S("🦒", "Yog‘och jirafa", "A carved giraffe", "Деревянный жираф"),
  singapore: S("🦁", "Merlion figurka", "A Merlion figurine", "Фигурка Мерлиона"),
  bangkok: S("🐘", "Ipak fil", "A silk elephant", "Шёлковый слон"),
  agra: S("🤍", "Marmar Toj miniatyurasi", "A marble Taj miniature", "Мраморный мини-Тадж"),
};
const souvenirFor = (c) => SOUVENIRS[c?.key] || S("🎁", "Shahar esdaligi", "A keepsake of the city", "Сувенир города");

// secret city notes — each city's hidden gift carries one of these
const SECRET_LINES = [
  tri("Bu shaharni sen bilan ko‘rish — eng katta sovg‘a edi. Bu esa shunchaki eslatma.", "Seeing this city with you was the real gift. This is just a reminder.", "Увидеть этот город с тобой — настоящий подарок. Это лишь напоминание."),
  tri("Qayerga borsak ham, uyim — sen turgan joy.", "Wherever we go, home is where you stand.", "Куда бы мы ни поехали, дом — там, где ты."),
  tri("Shu ko‘chalarda bir kun yana qo‘l ushlashib yuramiz.", "One day we’ll walk these streets hand in hand again.", "Однажды мы снова пройдём здесь, держась за руки."),
  tri("Dunyo katta, lekin men uchun eng go‘zal manzara — sening tabassuming.", "The world is vast, but my favourite view is your smile.", "Мир огромен, но мой любимый вид — твоя улыбка."),
];
const hash = (s) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** the item a gift shows: a catalogue gift or this city's souvenir */
export function giftItem(g) {
  if (g.item === "souvenir") { const c = SOUVENIRS[g.city]; return c || souvenirFor(null); }
  return GIFTS[g.item] || GIFTS.flowers;
}

// ------------------------------------------------------------------ composer
export function openComposer({ city, me, party, onSend, item = "souvenir" }) {
  const others = party.filter((p) => p && p !== me);
  const items = [["souvenir", souvenirFor(city)], ...Object.entries(GIFTS)];
  let pick = items.some(([k]) => k === item) ? item : "souvenir";
  const sheet = h(`<div class="gift-wrap"><div class="gift-sheet glass">
    <button class="gift-x" data-x aria-label="✕">✕</button>
    <div class="eyebrow">${t("giftEyebrow")} · ${esc(L(city.name))}</div>
    <h3 class="display">${t("giftTitle")}</h3>
    <div class="gift-grid">${items.map(([k, g]) => `<button class="gift-opt${k === pick ? " on" : ""}" data-k="${k}"><span>${g.ic}</span><small>${esc(tx(g.name))}</small></button>`).join("")}</div>
    ${others.length > 1 ? `<div class="field"><label>${t("giftTo")}</label><div class="gift-to seg">${others.map((n, i) => `<button type="button" data-to="${esc(n)}" class="${i ? "" : "on"}">${esc(n)}</button>`).join("")}</div></div>` : ""}
    <div class="field"><label>${t("giftMsg")}</label><textarea data-msg rows="3" maxlength="280"></textarea></div>
    <div class="gift-actions"><button class="btn btn-ghost" data-idea>✨ ${t("giftIdea")}</button><button class="btn btn-gold" data-send>🎁 ${t("giftSend")}</button></div>
  </div></div>`);
  document.body.append(sheet);
  requestAnimationFrame(() => sheet.classList.add("on"));
  const msg = $("[data-msg]", sheet);
  const idea = () => {
    const g = pick === "souvenir" ? null : GIFTS[pick];
    const pool = g ? g.msg : SECRET_LINES;
    msg.value = tx(pool[Math.floor(Math.random() * pool.length)]);
  };
  idea();
  const close = () => { sheet.classList.remove("on"); setTimeout(() => sheet.remove(), 350); };
  $$(".gift-opt", sheet).forEach((b) => (b.onclick = () => { pick = b.dataset.k; $$(".gift-opt", sheet).forEach((x) => x.classList.toggle("on", x === b)); idea(); }));
  $$("[data-to]", sheet).forEach((b) => (b.onclick = () => $$("[data-to]", sheet).forEach((x) => x.classList.toggle("on", x === b))));
  $("[data-idea]", sheet).onclick = idea;
  $("[data-x]", sheet).onclick = close;
  sheet.onclick = (e) => e.target === sheet && close();
  $("[data-send]", sheet).onclick = () => {
    const to = $("[data-to].on", sheet)?.dataset.to || others[0] || "";
    const g = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), from: me, to, item: pick, city: city.key, msg: msg.value.trim().slice(0, 280), at: Date.now(), status: "new" };
    onSend(g); close();
    toast(`🎁 ${t("giftSent")}${to ? " → " + to : ""}`);
  };
}

// ------------------------------------------------------------------ the unwrapping ceremony
export function presentGift(g, { cityName = "", onReact } = {}) {
  const it = giftItem(g);
  const el = h(`<div class="gift-wrap reveal"><div class="gift-stage">
    <div class="gift-box" data-box><div class="gb-lid"><i></i></div><div class="gb-body"><i></i></div><div class="gb-bow"></div></div>
    <p class="gift-hint">${g.secret ? t("giftSecretHint") : `${esc(g.from || "")} ${t("giftFor")}`} · ${t("giftTap")}</p>
    <div class="gift-card glass">
      <div class="gift-item">${it.ic}</div>
      <div class="eyebrow">${g.secret ? t("giftSecret") : `${t("giftFrom")} ${esc(g.from || "")}`}${cityName ? " · " + esc(cityName) : ""}</div>
      <h3 class="display">${esc(tx(it.name))}</h3>
      ${g.msg ? `<p class="gift-msg">“${esc(g.msg)}”</p>` : ""}
      <div class="gift-react">${["❤️", "🥹", "😍", "🤗", "✨"].map((e) => `<button data-r="${e}">${e}</button>`).join("")}</div>
      <div class="gift-actions"><button class="btn btn-ghost" data-later>${t("giftLater")}</button><button class="btn btn-gold" data-keep>${t("giftKeep")}</button></div>
    </div></div></div>`);
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add("on"));
  const open = () => {
    if (el.classList.contains("opened")) return;
    el.classList.add("opened");
    // a soft burst of petals / gold dust
    const st = $(".gift-stage", el);
    for (let i = 0; i < 34; i++) {
      const p = document.createElement("i"); p.className = "gift-dust";
      p.style.setProperty("--dx", (Math.random() * 2 - 1) * 260 + "px"); p.style.setProperty("--dy", -(120 + Math.random() * 260) + "px");
      p.style.setProperty("--d", 0.9 + Math.random() * 0.9 + "s"); p.style.left = "50%"; p.style.top = "46%";
      if (Math.random() > 0.5) p.classList.add("petal");
      st.append(p); setTimeout(() => p.remove(), 2200);
    }
    navigator.vibrate?.(18);
  };
  $("[data-box]", el).onclick = open;
  let reaction = "";
  $$("[data-r]", el).forEach((b) => (b.onclick = () => { reaction = b.dataset.r; $$("[data-r]", el).forEach((x) => x.classList.toggle("on", x === b)); }));
  const close = (status) => { el.classList.remove("on"); setTimeout(() => el.remove(), 400); onReact?.({ status, reaction }); };
  $("[data-keep]", el).onclick = () => close("kept");
  $("[data-later]", el).onclick = () => close("later");
  return el;
}

/** the secret gift hidden in a city (deterministic per journey + city) */
export function secretGift(city, code, from = "WorldLive") {
  const line = SECRET_LINES[hash(code + city.key) % SECRET_LINES.length];
  return { id: "s-" + city.key, secret: true, from, item: "souvenir", city: city.key, msg: tx(line), at: Date.now(), status: "new" };
}
