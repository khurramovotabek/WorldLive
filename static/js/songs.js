// WorldLive — curated song catalogue (audio only, no video).
// Default playback: official Apple Music previews streamed from Apple's CDN. "Full songs" mode
// switches to Spotify's official embedded player, so artists and labels keep their
// rights and streams — WorldLive never stores or re-streams audio. Listeners logged in to Spotify
// hear full tracks; everyone else hears Spotify's 30‑second preview.
// Every track id below was verified with Spotify oEmbed on 2026‑11‑24.
//
//  cat:  uz · tr · ru · it · fr · ar · asia · gr · global · chill
//  c:    cities where the song is the default soundtrack (smart mode), strongest first
//  m:    feeling tags (love, hope, joy, calm, epic, nostalgia, night)

export const SONG_CATS = {
  uz:     { uz: "O‘zbekcha", en: "Uzbek",   ru: "Узбекские", flag: "🇺🇿" },
  tr:     { uz: "Turkcha",   en: "Turkish", ru: "Турецкие",  flag: "🇹🇷" },
  ru:     { uz: "Ruscha",    en: "Russian", ru: "Русские",   flag: "🇷🇺" },
  global: { uz: "Dunyo hitlari", en: "Global hits", ru: "Мировые хиты", flag: "🌍" },
  it:     { uz: "Italyancha", en: "Italian", ru: "Итальянские", flag: "🇮🇹" },
  fr:     { uz: "Fransuzcha", en: "French",  ru: "Французские", flag: "🇫🇷" },
  ar:     { uz: "Arabcha",   en: "Arabic",  ru: "Арабские",  flag: "🌙" },
  asia:   { uz: "Osiyo",     en: "Asia",    ru: "Азия",      flag: "🏮" },
  gr:     { uz: "Yunoncha",  en: "Greek",   ru: "Греческие", flag: "🇬🇷" },
  kr:     { uz: "K-pop", en: "K-pop", ru: "K-pop", flag: "🇰🇷" },
  latin:  { uz: "Lotin Amerikasi", en: "Latin America", ru: "Латинская Америка", flag: "💃" },
  india:  { uz: "Hind & Pokiston", en: "India & Pakistan", ru: "Индия и Пакистан", flag: "🪷" },
  africa: { uz: "Afrika", en: "Africa", ru: "Африка", flag: "🥁" },
  chill:  { uz: "Tabiat & chill", en: "Nature & chill", ru: "Природа и chill", flag: "🌿" },
};

// the "home" language of each city — local songs always come first there (Italian in Rome…)
export const CITY_CAT = {
  tashkent: "uz", samarkand: "uz", bukhara: "uz", istanbul: "tr", cappadocia: "tr", rome: "it", paris: "fr",
  dubai: "ar", giza: "ar", petra: "ar", kyoto: "asia", beijing: "asia", santorini: "gr",
  moscow: "ru", seoul: "kr", kualalumpur: "asia", jakarta: "asia", bali: "asia", islamabad: "india", agra: "india",
  rio: "latin", buenosaires: "latin", cusco: "latin", yucatan: "latin", capetown: "africa", nairobi: "africa", marrakech: "ar",
};

// Apple Music 30‑second previews ("trackId:storefront") for the same recordings — verified with the
// iTunes lookup API on 2026‑11‑24. They play through our own audio graph, so volume, crossfades,
// autoplay and the live visualiser all work. Songs without one fall back to the Spotify embed.
const PREVIEW = {
  "524ar6TbqMGSVYSQSXGfKf": "1738300535:US",
  "5os7Gi2RMQwT7DJXhhHO8G": "1743767917:US",
  "4BEUEFjOeJu6aPUroRLtSp": "1738300582:US",
  "3fdNZG6jyDxT47sa1knA1d": "1528951635:US",
  "4ApY3gZWrftvPS8CrotHgE": "1684912892:US",
  "6yNYXvhOc024hK0rEhaKoE": "1856708934:US",
  "3ajYmPDtB3P7JTPQ64Dr7P": "499334149:US",
  "6vEL7E8TGzrxuxbrgdlkLL": "499332705:US",
  "3SeFgStA5TbS4UZVoLVa8g": "590538069:US",
  "5HCyWlXZPP0y6Gqq8TgA20": "1574968888:US",
  "7MJQ9Nfxzh8LPZ9e9u68Fq": "1440903439:US",
  "561jH07mF1jHuk7KlaeF0s": "1425131554:US",
  "7lQ8MOhq6IN2w8EYcFNSUk": "1440821643:US",
  "15JINEqzVMv3SvJTAXAKED": "1440782199:US",
  "5rhEOqBmsEZWRgeUeElmzl": "1438988564:US",
  "0nrRP2bk19rLc0orkWPQk2": "1440872929:US",
  "1mea3bSkSGXuIRvnydlB5b": "1122773680:US",
  "0tgVpDi06FyKpA1z0VMD4v": "1193701400:US",
  "7qiZfU4dY1lWllzX7mPBI3": "1193701392:US",
  "0VjIjW4GlUZAMYd2vXMi3b": "1499378607:US",
  "0pqnGHJpmpxLKifKRmU6WP": "1411628233:US",
  "6habFhsOp2NvshLv26DqMb": "1447401620:US",
  "7qEHsqek33rTcFNT9PFqLf": "1452619054:US",
  "2igwFfvr1OAGX9SKDCPBwO": "1440932018:US",
  "7zrpoAJte9o12TzawqgdD0": "1440845105:US",
  "7kyTQrppRsgSbjqkm8PPyI": "1443833108:US",
  "4MWFeqPy2xPZg8zW2vBLN2": "97980818:US",
  "2XxNGvw2tMJI4R0VHdYFTd": "1440830407:US",
  "04TshWXkhV1qkqHzf31Hn6": "1537460612:US",
  "1I8tHoNBFTuoJAlh4hfVVE": "1712919360:US",
  "5NXEM4O5OKxwnUFMaDkYjQ": "1628492168:EG",
  "6TYFcqqQVQPb3YsgfRhvqs": "880940097:EG",
  "4d7DrWvGPobIFPRi84gjm0": "1421918281:EG",
  "3MMGH1EAHwYe2IaLfN4Bba": "1834675504:TR",
  "1EdLzNQpdullWYUlKuf7Ig": "1458962905:JP",
  "10VuSw48iPN2UK2xX9Y6P0": "1721455873:JP",
  "4m81JBEYBpyKTaUsJdDMr9": "1589963819:RU",
  "3lAun9V0YdTlCSIEXPvfsY": "920603951:RU",
  "1YYhDizHx7PnDhAhko6cDS": "1482520559:RU",
  "3QksrtI9VFCBHWA4rgvcV8": "1440858721:UZ",
  "53vpvpsOHKlkB745Jg6bvX": "254548846:UZ",
  "6rPYPgISpdBsg5wQU68NKJ": "1444872841:UZ",
  "0yQPpUq5BJyqah5m2Q5Stt": "478418076:UZ",
  "25U7raB3ZSszayTYClh4hF": "1296697430:UZ",
  "39HrUxcvKF3jtLz7fUDWXc": "1445055008:FR",
  "2ihCaVdNZmnHZWt0fvAM7B": "1440809330:IT"
};

const S = (sp, artist, title, cat, c = [], m = []) => ({ id: "sp:" + sp, kind: "sp", sp, it: PREVIEW[sp] || null, artist, title, cat, cities: c, moods: m, city: c[0] || "any", season: "any" });

// Apple-only songs (no Spotify id): "it:<trackId>"; "Open in Spotify" falls back to a Spotify search link
const I = (it, artist, title, cat, c = [], m = []) => ({ id: "it:" + it.split(":")[0], kind: "sp", sp: null, it, artist, title, cat, cities: c, moods: m, city: c[0] || "any", season: "any" });

export const SONGS = [
  // ---- Uzbek
  S("524ar6TbqMGSVYSQSXGfKf", "Konsta", "Insonlar", "uz", ["tashkent", "bukhara"], ["hope"]),
  S("5os7Gi2RMQwT7DJXhhHO8G", "Konsta", "Odamlar Ucha Olar", "uz", ["tashkent", "samarkand"], ["hope", "epic"]),
  S("4BEUEFjOeJu6aPUroRLtSp", "Konsta & Timur Alixonov", "Odamlar nima deydi?!", "uz", ["tashkent"], ["hope"]),
  S("3fdNZG6jyDxT47sa1knA1d", "Konsta", "Uchaman", "uz", ["tashkent", "bukhara"], ["hope", "joy"]),
  S("4ApY3gZWrftvPS8CrotHgE", "Sevara Nazarkhan", "Ulug‘imsan Vatanim", "uz", ["samarkand", "tashkent"], ["epic", "nostalgia"]),
  S("6yNYXvhOc024hK0rEhaKoE", "Bahrom Nazarov", "O‘zbekiston Vatanim Manim", "uz", ["samarkand", "bukhara"], ["epic"]),
  S("5NXEM4O5OKxwnUFMaDkYjQ", "Shahzoda", "Layli va Majnun", "uz", ["bukhara", "samarkand"], ["love"]),
  // ---- Turkish
  S("3MMGH1EAHwYe2IaLfN4Bba", "Sezen Aksu", "Gülümse", "tr", ["istanbul", "cappadocia"], ["nostalgia", "love"]),
  S("3ajYmPDtB3P7JTPQ64Dr7P", "Tarkan", "Kuzu Kuzu", "tr", ["istanbul"], ["joy"]),
  S("6vEL7E8TGzrxuxbrgdlkLL", "Tarkan", "Şımarık", "tr", ["istanbul", "cappadocia"], ["joy"]),
  S("3SeFgStA5TbS4UZVoLVa8g", "Yalın", "Ki Sen", "tr", ["cappadocia", "istanbul"], ["love"]),
  // ---- Russian
  S("1EdLzNQpdullWYUlKuf7Ig", "Би-2 feat. Чичерина", "Мой рок-н-ролл", "ru", ["moscow"], ["nostalgia"]),
  S("4m81JBEYBpyKTaUsJdDMr9", "Земфира", "Искала", "ru", ["moscow"], ["love"]),
  S("4lMHPE0f8y04YksaqZnzbH", "Miyagi & Andy Panda", "Minor", "ru", ["moscow"], ["night"]),
  // ---- Global
  S("5HCyWlXZPP0y6Gqq8TgA20", "The Kid LAROI & Justin Bieber", "STAY", "global", ["newyork", "dubai", "singapore", "bangkok"], ["joy", "night"]),
  S("7MJQ9Nfxzh8LPZ9e9u68Fq", "Eminem", "Lose Yourself", "global", ["newyork"], ["epic", "hope"]),
  S("561jH07mF1jHuk7KlaeF0s", "Eminem", "Mockingbird", "global", [], ["love", "nostalgia"]),
  S("7lQ8MOhq6IN2w8EYcFNSUk", "Eminem", "Without Me", "global", [], ["joy"]),
  S("15JINEqzVMv3SvJTAXAKED", "Eminem ft. Rihanna", "Love The Way You Lie", "global", [], ["epic"]),
  S("5rhEOqBmsEZWRgeUeElmzl", "Alexander Rybak", "Fairytale", "global", ["iceland", "interlaken"], ["joy", "love"]),
  S("0nrRP2bk19rLc0orkWPQk2", "Avicii", "Wake Me Up", "global", ["interlaken", "iceland", "alaska"], ["hope", "joy"]),
  S("1mea3bSkSGXuIRvnydlB5b", "Coldplay", "Viva La Vida", "global", ["paris", "rome"], ["epic"]),
  S("0tgVpDi06FyKpA1z0VMD4v", "Ed Sheeran", "Perfect", "global", ["santorini", "paris", "agra"], ["love"]),
  S("7qiZfU4dY1lWllzX7mPBI3", "Ed Sheeran", "Shape of You", "global", ["dubai", "singapore", "kualalumpur"], ["joy"]),
  S("0VjIjW4GlUZAMYd2vXMi3b", "The Weeknd", "Blinding Lights", "global", ["dubai", "newyork", "losangeles"], ["night"]),
  S("0pqnGHJpmpxLKifKRmU6WP", "Imagine Dragons", "Believer", "global", ["giza", "petra", "yucatan"], ["epic"]),
  S("6habFhsOp2NvshLv26DqMb", "Luis Fonsi ft. Daddy Yankee", "Despacito", "global", ["santorini", "maldives", "yucatan", "rio"], ["joy"]),
  S("7qEHsqek33rTcFNT9PFqLf", "Lewis Capaldi", "Someone You Loved", "global", [], ["love", "nostalgia"]),
  S("2igwFfvr1OAGX9SKDCPBwO", "JAY-Z ft. Alicia Keys", "Empire State Of Mind", "global", ["newyork"], ["epic", "night"]),
  S("3QksrtI9VFCBHWA4rgvcV8", "Frank Sinatra", "Theme From New York, New York", "global", ["newyork"], ["joy", "nostalgia"]),
  // ---- Italian
  S("7zrpoAJte9o12TzawqgdD0", "Andrea Bocelli", "Con te partirò", "it", ["rome"], ["love", "epic"]),
  S("7kyTQrppRsgSbjqkm8PPyI", "Andrea Bocelli & Sarah Brightman", "Time to Say Goodbye", "it", ["rome"], ["love", "epic"]),
  S("53vpvpsOHKlkB745Jg6bvX", "Eros Ramazzotti", "Più bella cosa", "it", ["rome"], ["love", "joy"]),
  S("4MWFeqPy2xPZg8zW2vBLN2", "Domenico Modugno", "Nel blu dipinto di blu (Volare)", "it", ["rome", "santorini"], ["joy", "nostalgia"]),
  // ---- French
  S("3lAun9V0YdTlCSIEXPvfsY", "Édith Piaf", "La Vie en rose", "fr", ["paris"], ["love", "nostalgia"]),
  S("2XxNGvw2tMJI4R0VHdYFTd", "Indila", "Dernière danse", "fr", ["paris"], ["love", "night"]),
  S("6rPYPgISpdBsg5wQU68NKJ", "Stromae", "Alors on danse", "fr", ["paris"], ["night", "joy"]),
  // ---- Arabic
  S("6TYFcqqQVQPb3YsgfRhvqs", "Amr Diab", "Tamally Maak", "ar", ["dubai", "giza", "petra"], ["love"]),
  S("0a9hcfAfQNCcTvmglpQd77", "Hussain Al Jassmi", "Boushret Kheir", "ar", ["dubai", "giza"], ["joy"]),
  S("4d7DrWvGPobIFPRi84gjm0", "Fairuz", "Nassam Alayna El Hawa", "ar", ["petra", "giza"], ["nostalgia", "calm"]),
  // ---- Asia
  S("04TshWXkhV1qkqHzf31Hn6", "Kenshi Yonezu", "Lemon", "asia", ["kyoto"], ["nostalgia"]),
  S("39HrUxcvKF3jtLz7fUDWXc", "Hikaru Utada", "First Love", "asia", ["kyoto"], ["love", "nostalgia"]),
  S("10VuSw48iPN2UK2xX9Y6P0", "Jay Chou", "青花瓷 Blue and White Porcelain", "asia", ["beijing"], ["love", "calm"]),
  // ---- Greek
  S("5f8lE7L6y27EK1yYbEGLvg", "Mikis Theodorakis", "Zorba’s Dance", "gr", ["santorini"], ["joy", "epic"]),
  // ---- Nature & chill
  S("0yQPpUq5BJyqah5m2Q5Stt", "Sigur Rós", "Hoppípolla", "chill", ["iceland", "alaska", "everest"], ["hope", "epic"]),
  S("2ihCaVdNZmnHZWt0fvAM7B", "Of Monsters and Men", "Little Talks", "chill", ["iceland", "canberra"], ["joy"]),
  S("1YYhDizHx7PnDhAhko6cDS", "John Denver", "Take Me Home, Country Roads", "chill", ["interlaken"], ["nostalgia", "joy"]),
  S("25U7raB3ZSszayTYClh4hF", "Israel Kamakawiwoʻole", "Over the Rainbow / What a Wonderful World", "chill", ["maldives", "haiti", "bali"], ["calm", "hope"]),
  S("1I8tHoNBFTuoJAlh4hfVVE", "Kygo ft. Conrad Sewell", "Firestone", "chill", ["maldives", "santorini", "bali", "singapore"], ["joy"]),
  // ---- the wider world — verified with the iTunes lookup API on 2026-11-24
  I("1589945541:US", "Gorky Park", "Moscow Calling", "ru", ["moscow"], ["epic", "nostalgia"]),
  I("1333017975:US", "Кино", "Звезда по имени Солнце", "ru", ["moscow"], ["nostalgia", "epic"]),
  I("1596532400:US", "BTS", "Dynamite", "kr", ["seoul"], ["joy"]),
  I("1445144527:US", "PSY", "Gangnam Style", "kr", ["seoul"], ["joy"]),
  I("1488300930:US", "IU", "Blueming", "kr", ["seoul"], ["love", "joy"]),
  I("1533894669:US", "BLACKPINK", "How You Like That", "kr", ["seoul"], ["night"]),
  I("573126640:US", "Siti Nurhaliza", "Cindai", "asia", ["kualalumpur"], ["love", "nostalgia"]),
  I("1612164667:US", "Tulus", "Hati-Hati di Jalan", "asia", ["jakarta", "bali"], ["love", "nostalgia"]),
  I("203778936:US", "Anggun", "Snow on the Sahara", "asia", ["jakarta", "bali"], ["love"]),
  I("1537031094:US", "Atif Aslam & Pritam", "Pehli Nazar Mein", "india", ["islamabad", "agra"], ["love"]),
  I("1354915829:US", "Nusrat Fateh Ali Khan", "Afreen Afreen", "india", ["islamabad", "agra"], ["love", "epic"]),
  I("1159292108:US", "A. R. Rahman", "Jai Ho", "india", ["agra"], ["joy", "epic"]),
  I("1073359419:US", "Arijit Singh", "Tum Hi Ho", "india", ["agra", "islamabad"], ["love"]),
  I("1103771762:ID", "Lucky Ali", "O Sanam", "india", ["agra"], ["love", "nostalgia"]),
  I("1422656474:US", "Stan Getz & João Gilberto", "The Girl from Ipanema", "latin", ["rio"], ["calm", "love"]),
  I("1443794605:US", "Sergio Mendes", "Mas Que Nada", "latin", ["rio"], ["joy"]),
  I("435222174:US", "Carlos Gardel", "Por una Cabeza", "latin", ["buenosaires"], ["love", "nostalgia"]),
  I("376141820:US", "Astor Piazzolla", "Libertango", "latin", ["buenosaires"], ["epic", "night"]),
  I("324127935:US", "Simon & Garfunkel", "El Condor Pasa (If I Could)", "latin", ["cusco"], ["nostalgia", "calm"]),
  I("989254352:US", "Ritchie Valens", "La Bamba", "latin", ["yucatan"], ["joy"]),
  I("101070162:US", "Luis Miguel", "Bésame Mucho", "latin", ["yucatan", "buenosaires"], ["love"]),
  I("1440873406:US", "Imagine Dragons", "On Top of the World", "global", ["everest", "cusco"], ["hope", "joy"]),
  I("1053934844:US", "Coldplay", "Hymn for the Weekend", "global", ["agra", "everest"], ["joy", "hope"]),
  I("252687364:IN", "Scott McKenzie", "San Francisco", "global", ["sanfrancisco"], ["nostalgia", "love"]),
  I("721519842:RU", "Otis Redding", "(Sittin' On) The Dock of the Bay", "global", ["sanfrancisco"], ["calm", "nostalgia"]),
  I("1229889035:US", "The Mamas & The Papas", "California Dreamin'", "global", ["losangeles", "sanfrancisco"], ["nostalgia"]),
  I("635770202:US", "Eagles", "Hotel California", "global", ["losangeles"], ["night", "nostalgia"]),
  I("945575413:US", "Red Hot Chili Peppers", "Californication", "global", ["losangeles"], ["night"]),
  I("1440897636:US", "Eddie Vedder", "Guaranteed", "chill", ["alaska"], ["calm", "hope"]),
  I("441488273:RU", "Wyclef Jean", "Gone Till November", "global", ["haiti"], ["love", "nostalgia"]),
  I("282960968:US", "Men at Work", "Down Under", "global", ["sydney", "melbourne"], ["joy"]),
  I("1475930045:US", "Tones and I", "Dance Monkey", "global", ["melbourne", "sydney"], ["joy"]),
  I("1022164261:US", "Vance Joy", "Riptide", "global", ["melbourne", "sydney", "canberra"], ["love", "joy"]),
  I("882945383:US", "Sia", "Chandelier", "global", ["sydney", "canberra"], ["epic", "night"]),
  I("1007045392:US", "Miriam Makeba", "Pata Pata", "africa", ["capetown", "nairobi"], ["joy"]),
  I("185717604:US", "Toto", "Africa", "africa", ["nairobi", "capetown"], ["nostalgia", "joy"]),
  I("1442812775:US", "Carmen Twillie & Lebo M", "Circle of Life", "africa", ["nairobi"], ["epic", "hope"]),
  I("1566382631:US", "Khaled", "Didi", "ar", ["marrakech"], ["joy"]),
  I("1137185775:RU", "Murray Head", "One Night in Bangkok", "global", ["bangkok"], ["night", "joy"]),
];

// sacred places stay silent (no songs auto-play)
export const SILENT_CITIES = new Set(["makkah", "madinah"]);

/** Extract a Spotify track id from an open.spotify.com link, a spotify:track: URI or a bare id. */
export function spId(input) {
  const s = String(input || "").trim();
  if (/^[A-Za-z0-9]{22}$/.test(s)) return s;
  const m = s.match(/^spotify:track:([A-Za-z0-9]{22})$/) || s.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})/);
  return m ? m[1] : null;
}

// The call to prayer heard on arrival in Makkah and Madinah.
// "Beautiful adhan" — Wikimedia Commons, CC0 (public domain), streamed from upload.wikimedia.org.
export const ADHAN = {
  src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Beautiful_adhan.ogg/Beautiful_adhan.ogg.mp3",
  page: "https://commons.wikimedia.org/wiki/File:Beautiful_adhan.ogg",
  credit: "Wikimedia Commons · CC0",
};
