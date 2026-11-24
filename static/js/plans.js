// WorldLive — a day in the city: a small, real-life itinerary you can step through together
// each step sets the time of day, opens the place and offers one gesture (coffee, flowers, a photo, a note…)
const tri = (uz, en, ru) => ({ uz, en, ru });
const P = (tod, place, ic, title, act) => ({ tod, place, ic, title, act });

export const PLANS = {
  paris: [
    P("morning", "montmartre", "☕", tri("Monmartrda ertalabki qahva va kruassan", "Morning coffee and croissants in Montmartre", "Утренний кофе и круассаны на Монмартре")),
    P("noon", "louvre", "🖼️", tri("Luvr: Mona Liza oldida birga", "The Louvre: together before the Mona Lisa", "Лувр: вместе перед Моной Лизой"), "photo"),
    P("golden", "seine", "💐", tri("Sena bo‘yida gul sovg‘a qilish", "Flowers by the Seine", "Цветы на берегу Сены"), "gift:roses"),
    P("night", "eiffel-tower", "✨", tri("Tunda Eyfel chiroqlari chaqnaganini tomosha qilish", "Watch the Eiffel Tower sparkle at night", "Смотреть, как мерцает ночная Эйфелева башня")),
  ],
  tashkent: [
    P("morning", "chorsu-bazaar", "🫓", tri("Chorsuda issiq non va choy", "Warm bread and tea at Chorsu", "Горячая лепёшка и чай на Чорсу")),
    P("noon", "hazrati-imam-complex", "🕌", tri("Hazrati Imom majmuasida sokin sayr", "A quiet walk at Hazrati Imam", "Тихая прогулка по Хазрати Имам")),
    P("golden", "amir-timur-square", "💐", tri("Amir Temur xiyobonida gul sovg‘asi", "Flowers on Amir Timur Square", "Цветы на сквере Амира Темура"), "gift:flowers"),
    P("night", "tashkent-tower", "🗼", tri("Tungi teleminora chiroqlari", "Tashkent Tower lit up at night", "Ночные огни Ташкентской телебашни")),
  ],
  samarkand: [
    P("sunrise", "registan", "🌅", tri("Registonda tong", "Sunrise over the Registan", "Рассвет над Регистаном"), "photo"),
    P("noon", "shah-i-zinda", "💙", tri("Shohi Zinda ko‘k koshinlari", "The blue tiles of Shah-i-Zinda", "Синие изразцы Шахи-Зинда")),
    P("night", "registan", "✨", tri("Registon tungi yoritilishi", "Registan lit at night", "Ночной Регистан"), "note"),
  ],
  istanbul: [
    P("morning", "galata-tower", "☕", tri("Galatada turk qahvasi", "Turkish coffee in Galata", "Турецкий кофе в Галате")),
    P("noon", "hagia-sophia", "🕌", tri("Ayasofya gumbazi ostida", "Under the dome of Hagia Sophia", "Под куполом Святой Софии")),
    P("sunset", "bosphorus", "⛴️", tri("Bosforda quyosh botishi", "Sunset on the Bosphorus", "Закат на Босфоре"), "gift:souvenir"),
    P("night", "maiden-s-tower", "🌙", tri("Qiz minorasi yonida tun", "Night by the Maiden’s Tower", "Ночь у Девичьей башни"), "note"),
  ],
  rome: [
    P("morning", "trevi-fountain", "🪙", tri("Trevi favvorasiga tanga tashlash", "A coin into the Trevi Fountain", "Монетка в фонтан Треви"), "gift:souvenir"),
    P("noon", "colosseum", "🏛️", tri("Kolizey", "The Colosseum", "Колизей"), "photo"),
    P("golden", "pantheon-rome", "🍝", tri("Panteon yonida kechki ovqat", "Dinner near the Pantheon", "Ужин у Пантеона")),
  ],
  kyoto: [
    P("sunrise", "fushimi-inari-taisha", "⛩️", tri("Tongda ming darvoza", "A thousand gates at dawn", "Тысяча ворот на рассвете")),
    P("noon", "arashiyama", "🎋", tri("Bambuk o‘rmonida sayr", "A walk in the bamboo grove", "Прогулка по бамбуковой роще"), "photo"),
    P("evening", "gion", "🏮", tri("Gion fonarlari ostida", "Under the lanterns of Gion", "Под фонарями Гиона"), "gift:souvenir"),
  ],
  dubai: [
    P("noon", "dubai-creek", "⛵", tri("Abra qayig‘ida Krik bo‘ylab", "An abra across the Creek", "На абре через Крик")),
    P("sunset", "burj-khalifa", "🌇", tri("Burj Xalifa tepasida quyosh botishi", "Sunset from the top of Burj Khalifa", "Закат с вершины Бурдж-Халифа"), "photo"),
    P("night", "dubai-fountain", "⛲", tri("Dubay favvorasi shousi", "The Dubai Fountain show", "Шоу Поющих фонтанов"), "gift:ring"),
  ],
  newyork: [
    P("morning", "central-park", "☕", tri("Central Parkda qahva", "Coffee in Central Park", "Кофе в Центральном парке")),
    P("golden", "brooklyn-bridge", "🌉", tri("Bruklin ko‘prigidan o‘tish", "Walking the Brooklyn Bridge", "Прогулка по Бруклинскому мосту"), "photo"),
    P("night", "times-square", "🌃", tri("Tayms-skver chiroqlari", "The lights of Times Square", "Огни Таймс-сквер"), "gift:souvenir"),
  ],
};

/** a city's plan, or a gentle one made from its first places */
export function planFor(city) {
  const own = PLANS[city.key];
  if (own) return own.filter((s) => city.attractions.some((a) => a.id === s.place));
  const a = city.attractions, tods = ["morning", "noon", "golden", "night"], ics = ["☕", "📍", "🌇", "🌙"];
  const T = [tri("Ertalabki sayr", "Morning walk", "Утренняя прогулка"), tri("Kunduzi kashfiyot", "Afternoon discovery", "Дневное открытие"), tri("Oltin soat — surat", "Golden hour — a photo", "Золотой час — фото"), tri("Tungi xotira", "A night to remember", "Ночь на память")];
  return a.slice(0, 4).map((x, i) => P(tods[i], x.id, ics[i], T[i], i === 2 ? "photo" : i === 3 ? "note" : null));
}
