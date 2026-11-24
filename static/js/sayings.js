// WorldLive — sayings deck: aphorisms, motivation, feelings and short "status" lines.
// All original, written for WorldLive (never attributed to real people). Every line exists in uz / en / ru.
// Kinds: a = aphorism, m = motivation, f = feeling, s = status (short, shareable).
// The deck for a moment = this place → this city → the nature around you → the song that is playing → universal lines.
// Makkah & Madinah use only the reverent SACRED pool — no romance, no statuses.
import { getLang } from "./i18n.js";

const x = (uz, en, ru) => ({ uz, en, ru });

// ---------------------------------------------------------------- per city: [a, m, f, s]
export const CITY = {
  tashkent: [
    x("Uy — xaritadagi nuqta emas, seni kutadigan ovoz.", "Home isn’t a dot on a map — it’s the voice that waits for you.", "Дом — не точка на карте, а голос, который тебя ждёт."),
    x("Har katta sayohat ostonadan boshlanadi — bugun ostonadan birga chiqamiz.", "Every great journey starts at the doorstep — today we step out together.", "Каждое большое путешествие начинается с порога — сегодня мы выходим вместе."),
    x("Choy bug‘i, non hidi va yoningdagi kulgi — baxt shunchalik oddiy.", "Steam from the tea, the smell of bread, your laugh beside me — happiness is that simple.", "Пар от чая, запах лепёшки и твой смех рядом — счастье так просто."),
    x("Dunyo bo‘ylab yo‘l Toshkentdan boshlandi ✈️", "Around the world — starting from Tashkent ✈️", "Вокруг света — начиная с Ташкента ✈️"),
  ],
  samarkand: [
    x("Moviy gumbazlar asrlarni yengdi — chunki ular muhabbat bilan qurilgan.", "The blue domes outlived the centuries because they were built with love.", "Голубые купола пережили века, потому что их строили с любовью."),
    x("Ulug‘bek yulduzlarni o‘lchagan — sen ham orzularingni o‘lchab, rejaga aylantir.", "Ulugh Beg measured the stars — measure your dreams and turn them into plans.", "Улугбек измерял звёзды — измерь свои мечты и преврати их в план."),
    x("Registonda turib, vaqt to‘xtaganini his qildim — chunki sen yonimda eding.", "Standing in Registan I felt time stop — because you were beside me.", "На Регистане время будто остановилось — потому что мы были рядом."),
    x("Samarqand moviysi — ko‘zlaringdek 💙", "Samarkand blue — just like your eyes 💙", "Самаркандская лазурь — как твои глаза 💙"),
  ],
  bukhara: [
    x("Eski shahar shoshilmaydi — eng chiroyli narsalar ham shoshilmaydi.", "The old city never hurries — neither do the most beautiful things.", "Старый город не спешит — и всё самое красивое тоже."),
    x("Minorai Kalon ming yildan beri tik turibdi: sobitlik — eng kuchli me’morchilik.", "The Kalyan minaret has stood for nine centuries — steadiness is the strongest architecture.", "Минарет Калян стоит веками — постоянство — самая крепкая архитектура."),
    x("Tor ko‘chalarda qo‘lingni mahkamroq ushladim — adashishdan emas, yaqinlikdan.", "In the narrow lanes I held your hand tighter — not from fear of getting lost, but to be close.", "В узких улочках мы крепче держимся за руки — не от страха заблудиться, а от близости."),
    x("Buxoro: ming yillik shahar, bitta yurak 🕌", "Bukhara: a thousand-year city, one heart 🕌", "Бухара: тысячелетний город, одно сердце 🕌"),
  ],
  istanbul: [
    x("Ikki qit’ani bitta ko‘prik bog‘laydi — ikki yurakni bitta so‘z.", "One bridge joins two continents; one word joins two hearts.", "Один мост соединяет два континента, одно слово — два сердца."),
    x("Bosfor oqimi to‘xtamaydi — sen ham oldinga harakatdan to‘xtama.", "The Bosphorus never stops flowing — don’t you stop moving forward.", "Босфор не перестаёт течь — и ты не останавливайся."),
    x("Chayqalarning ovozi, choy stakani va sening jilmayishing — Istanbul shu.", "Gulls, a tulip glass of tea and your smile — that is Istanbul.", "Крик чаек, стаканчик чая и твоя улыбка — вот это Стамбул."),
    x("Yevropa va Osiyo orasida — senga yaqinroq 🌉", "Between Europe and Asia — closer to you 🌉", "Между Европой и Азией — ближе к тебе 🌉"),
  ],
  cappadocia: [
    x("Shar osmonga ko‘tarilishi uchun ichida olov bo‘lishi kerak.", "A balloon rises only when there is fire inside.", "Шар поднимается, только когда внутри огонь."),
    x("Tong qorong‘usida turganlar eng chiroyli osmonni ko‘radi.", "Those who rise in the dark of dawn see the most beautiful sky.", "Кто встаёт в предрассветной темноте, видит самое красивое небо."),
    x("Yuzlab shar orasida men faqat bittasini ko‘rdim — sen turgan savatni.", "Among hundreds of balloons I saw only one — the basket you were in.", "Среди сотен шаров для меня существует лишь один — тот, где ты."),
    x("Bugun bulutlardan balandmiz 🎈", "Above the clouds today 🎈", "Сегодня выше облаков 🎈"),
  ],
  paris: [
    x("Sevgi bir-biringizga qarash emas, birga bir tomonga qarash.", "Love isn’t looking at each other; it’s looking in the same direction together.", "Любовь — не смотреть друг на друга, а смотреть вместе в одну сторону."),
    x("Eyfel minorasi ham “keraksiz” deyilgan edi — tanqiddan qo‘rqma, qur.", "They called the Eiffel Tower useless once — don’t fear critics, build.", "Эйфелеву башню когда-то называли ненужной — не бойся критики, строй."),
    x("Sena bo‘yidagi kechada shahar chiroqlari emas, ko‘zlaring yondi.", "On that night by the Seine it wasn’t the city lights that glowed — it was your eyes.", "В ту ночь на Сене светились не огни города, а твои глаза."),
    x("Parij + sen = mukammal ✨", "Paris + you = perfect ✨", "Париж + ты = идеально ✨"),
  ],
  makkah: [],
  madinah: [],
  maldives: [
    x("Okean hech qachon shoshilmaydi, lekin doim qirg‘oqqa qaytadi.", "The ocean never hurries, yet it always returns to the shore.", "Океан никогда не спешит, но всегда возвращается к берегу."),
    x("Dam olish — dangasalik emas, yangi kuchga sarmoya.", "Rest isn’t laziness; it’s an investment in new strength.", "Отдых — не лень, а вложение в новые силы."),
    x("Feruza suv, jimjit qirg‘oq va sening yelkang — boshqa hech narsa kerak emas.", "Turquoise water, a quiet shore and your shoulder — nothing else is needed.", "Бирюзовая вода, тихий берег и твоё плечо — больше ничего не нужно."),
    x("Telefon o‘chiq, yurak ochiq 🌊", "Phone off, heart on 🌊", "Телефон выключен, сердце включено 🌊"),
  ],
  kyoto: [
    x("Choy marosimi o‘rgatadi: har bir uchrashuv takrorlanmas.", "The tea ceremony teaches that every meeting happens only once.", "Чайная церемония учит: каждая встреча неповторима."),
    x("Ming darvozadan o‘tish uchun birinchisidan o‘tish kifoya.", "To pass a thousand gates, you only need to walk through the first.", "Чтобы пройти тысячу ворот, достаточно пройти первые."),
    x("Sakura bargi yelkangga qo‘ndi — dunyo bir lahzaga jim bo‘ldi.", "A sakura petal landed on your shoulder and the world went silent for a moment.", "Лепесток сакуры упал тебе на плечо — и мир на миг затих."),
    x("Sekin hayot, chuqur nafas 🌸", "Slow life, deep breath 🌸", "Медленная жизнь, глубокий вдох 🌸"),
  ],
  interlaken: [
    x("Tog‘ cho‘qqisi yolg‘iz, lekin unga birga chiqqanlar hech qachon yolg‘iz emas.", "Summits are lonely, but those who climb together never are.", "Вершины одиноки, но те, кто поднимается вместе, — никогда."),
    x("Har bir qiyalik — mushak emas, iroda mashqi.", "Every slope trains the will, not only the legs.", "Каждый подъём тренирует не только ноги, но и волю."),
    x("Qorli cho‘qqilar oldida jim turdik — so‘z kerak emas edi.", "We stood silent before the snowy peaks — no words were needed.", "Мы молча стояли перед снежными вершинами — слова были не нужны."),
    x("Alp havosi va sen — eng toza baxt 🏔", "Alpine air and you — the purest happiness 🏔", "Альпийский воздух и ты — самое чистое счастье 🏔"),
  ],
  dubai: [
    x("Sahroda shahar qurganlar isbotladi: imkonsiz — faqat fikr.", "Those who built a city in the desert proved that impossible is only an opinion.", "Построившие город в пустыне доказали: невозможное — лишь мнение."),
    x("Eng baland bino ham bitta g‘ishtdan boshlangan.", "Even the tallest building started with one brick.", "Даже самое высокое здание началось с одного кирпича."),
    x("Favvora musiqasi ostida qo‘lingni ushladim va vaqt raqsga tushdi.", "I took your hand to the fountain’s music and time began to dance.", "Под музыку фонтана наши руки встретились — и время пустилось в пляс."),
    x("Osmon chegara emas, faqat boshlanish 🌆", "The sky is not the limit, just the start 🌆", "Небо — не предел, а только начало 🌆"),
  ],
  giza: [
    x("Piramidalar vaqtdan qo‘rqmaydi — vaqt piramidalardan qo‘rqadi.", "The pyramids don’t fear time; time fears the pyramids.", "Пирамиды не боятся времени — время боится пирамид."),
    x("Buyuk ish har kuni ko‘tarilgan bitta tosh bilan quriladi.", "Great work is built one lifted stone a day.", "Великое дело строится по одному поднятому камню в день."),
    x("Sahro shamoli yuzimizga qum sepdi, sen esa kulding — men o‘sha kulgini eslayman.", "The desert wind threw sand at us and you laughed — that laugh is what I remember.", "Ветер пустыни бросил в нас песок, а в ответ — твой смех. Его я и помню."),
    x("4500 yillik tarix va bitta selfi 🐪", "4,500 years of history and one selfie 🐪", "4500 лет истории и одно селфи 🐪"),
  ],
  santorini: [
    x("Quyosh botishi — kunning “rahmat” deyishi.", "A sunset is the day’s way of saying thank you.", "Закат — это «спасибо» уходящего дня."),
    x("Vulqon kuli ustida eng shirin uzum o‘sadi — qiyinchilik ham hosil beradi.", "The sweetest grapes grow on volcanic ash — hardship bears fruit too.", "На вулканическом пепле растёт самый сладкий виноград — трудности тоже плодоносят."),
    x("Oq devorlar, ko‘k gumbazlar va oltin osmon — ranglarim sen bilan to‘ldi.", "White walls, blue domes, a golden sky — my colours were complete with you.", "Белые стены, синие купола, золотое небо — с тобой мои цвета стали полными."),
    x("Oia’da quyosh botdi, yurakda esa chiqdi 🌅", "The sun set in Oia and rose in my heart 🌅", "В Ие солнце село, а в сердце взошло 🌅"),
  ],
  rome: [
    x("Rim bir kunda qurilmagan — sevgi ham.", "Rome wasn’t built in a day — neither is love.", "Рим не за день строился — и любовь тоже."),
    x("Barcha yo‘llar Rimga olib boradi — o‘z yo‘lingni tanlashdan qo‘rqma.", "All roads lead to Rome — so don’t be afraid to choose your own.", "Все дороги ведут в Рим — не бойся выбрать свою."),
    x("Trevi’ga tanga tashladim, lekin tilagim allaqachon yonimda turardi.", "I threw a coin into the Trevi, but my wish was already standing beside me.", "Монетка в Треви — а моё желание уже стоит рядом со мной."),
    x("La dolce vita — sen bilan 🍝", "La dolce vita — with you 🍝", "La dolce vita — с тобой 🍝"),
  ],
  iceland: [
    x("Muz va olov bir orolda yashaydi — qarama-qarshiliklar ham uyg‘un bo‘ladi.", "Ice and fire share one island — opposites can live in harmony.", "Лёд и огонь живут на одном острове — противоположности могут быть в гармонии."),
    x("Eng qorong‘u tunda shimol shafag‘i chiqadi — umidni yo‘qotma.", "The northern lights appear on the darkest nights — never lose hope.", "Северное сияние появляется в самые тёмные ночи — не теряй надежды."),
    x("Shafaq raqsga tushdi, sen esa nafasingni ushlab turding — men senga qarardim.", "The aurora danced and you held your breath — I was watching you.", "Сияние танцует, ты не дышишь от восторга, а я смотрю на тебя."),
    x("Osmon bugun yashil rangda gapirdi 💚", "The sky spoke in green tonight 💚", "Сегодня небо говорило зелёным 💚"),
  ],
  newyork: [
    x("Hech qachon uxlamaydigan shahar ham kimnidir kutadi.", "Even the city that never sleeps is waiting for someone.", "Даже город, который никогда не спит, кого-то ждёт."),
    x("Bu yerda uddalasang, hamma joyda uddalaysan — bugun boshla.", "If you can make it here, you can make it anywhere — start today.", "Справишься здесь — справишься где угодно. Начни сегодня."),
    x("Millionlab chiroq orasida eng yorqini — sening ko‘zlaring.", "Among millions of lights, the brightest were your eyes.", "Среди миллионов огней самыми яркими были твои глаза."),
    x("Katta shahar, katta orzular 🗽", "Big city, bigger dreams 🗽", "Большой город — большие мечты 🗽"),
  ],
  petra: [
    x("Qoya ham san’atga aylanadi, agar unga sabr bilan ishlov bersang.", "Even rock becomes art if you work it with patience.", "Даже скала становится искусством, если работать с ней терпеливо."),
    x("Tor daraning oxirida eng katta mo‘jiza turadi — davom et.", "At the end of the narrowest canyon stands the greatest wonder — keep going.", "В конце самого узкого ущелья стоит самое большое чудо — продолжай идти."),
    x("Siq’dan chiqib Xaznani ko‘rganimizda qo‘llarimiz o‘z-o‘zidan birlashdi.", "When we came out of the Siq and saw the Treasury, our hands found each other.", "Когда мы вышли из Сика и увидели Казну, наши руки сами нашли друг друга."),
    x("Pushti shahar, oltin xotira 🏜", "Rose city, golden memory 🏜", "Розовый город — золотое воспоминание 🏜"),
  ],
  beijing: [
    x("Devor ajratish uchun qurilgan, lekin bugun u odamlarni birlashtiradi.", "The wall was built to divide; today it brings people together.", "Стену строили, чтобы разделять, а сегодня она объединяет людей."),
    x("Ming li yo‘l bir qadamdan boshlanadi — bugungi qadamni tashla.", "A road of a thousand li begins with one step — take today’s.", "Путь в тысячу ли начинается с шага — сделай сегодняшний."),
    x("Devor ustida shamol esdi, sen ro‘molingni tutding, men esa bu lahzani.", "The wind blew on the wall; you held your scarf and I held the moment.", "На стене дует ветер: ты держишь шарф, а я — этот миг."),
    x("Buyuk devor, buyuk reja 🐉", "Great Wall, great plans 🐉", "Великая стена — великие планы 🐉"),
  ],
  moscow: [
    x("Qish qanchalik uzun bo‘lmasin, bahor albatta keladi.", "However long the winter, spring always comes.", "Какой бы долгой ни была зима, весна обязательно придёт."),
    x("Sovuqda issiqlikni saqlagan yurak eng kuchli yurak.", "A heart that stays warm in the cold is the strongest heart.", "Сердце, сохранившее тепло в мороз, — самое сильное."),
    x("Qor yog‘ayotgan Qizil maydonda qo‘llaringni cho‘ntagimga soldim.", "Snow on Red Square, and your hands in my pocket.", "Снег на Красной площади, и твои руки в моём кармане."),
    x("Moskva qori, issiq yurak ❄️", "Moscow snow, warm heart ❄️", "Московский снег, тёплое сердце ❄️"),
  ],
  seoul: [
    x("Eski saroy va yangi minora yonma-yon — o‘tmishni hurmat qil, kelajakni qur.", "Old palaces beside new towers — honour the past, build the future.", "Старые дворцы рядом с новыми башнями — уважай прошлое, строй будущее."),
    x("Kichik har kungi mehnat bir kun katta sahnaga olib chiqadi.", "Small daily effort one day puts you on a big stage.", "Маленький ежедневный труд однажды выводит на большую сцену."),
    x("Neon chiroqlar ostida kulgimiz shaharning eng yorqin nuri edi.", "Under the neon, our laughter was the brightest light in the city.", "Под неоном наш смех был самым ярким светом города."),
    x("Seul kechasi, yurak to‘la 💜", "Seoul nights, full heart 💜", "Сеульские ночи, полное сердце 💜"),
  ],
  kualalumpur: [
    x("Turli xalqlar bir shaharda — farqlar bezak, to‘siq emas.", "Many peoples in one city — differences are decoration, not walls.", "Много народов в одном городе — различия украшают, а не разделяют."),
    x("Balandlikka qo‘rqmasdan qara — maqsad shunchaki yuqoriroqda.", "Look up without fear — the goal is just a little higher.", "Смотри вверх без страха — цель просто чуть выше."),
    x("Tropik yomg‘irdan keyin havo tozardi, ikkimiz esa yanada yaqinlashdik.", "After the tropical rain the air cleared — and we grew closer.", "После тропического ливня воздух очистился, а мы стали ближе."),
    x("Egizak minoralar kabi — yonma-yon 🏙", "Like the twin towers — side by side 🏙", "Как башни-близнецы — бок о бок 🏙"),
  ],
  islamabad: [
    x("Yashil tepaliklar orasidagi shahar tinchlikni o‘rgatadi.", "A city among green hills teaches calm.", "Город среди зелёных холмов учит спокойствию."),
    x("Rejali hayot — erkin hayot: kuningni o‘zing chiz.", "A planned life is a free life — design your own day.", "Спланированная жизнь — свободная жизнь: нарисуй свой день сам."),
    x("Margalla tepaligida shamol esdi va shahar chiroqlari yulduzlarga qo‘shildi.", "On the Margalla Hills the wind blew and the city lights joined the stars.", "На холмах Маргалла дул ветер, и огни города слились со звёздами."),
    x("Tinchlik — eng chiroyli manzara 🌿", "Peace is the most beautiful view 🌿", "Покой — самый красивый вид 🌿"),
  ],
  rio: [
    x("Qiyinchilikka ochiq quchoq bilan qara — u ham kichrayadi.", "Meet hardship with open arms — it shrinks too.", "Встречай трудности с распростёртыми объятиями — они тоже уменьшаются."),
    x("Hayot samba kabi: to‘xtamasdan harakatlan, ritmni yo‘qotma.", "Life is like samba: keep moving, never lose the rhythm.", "Жизнь как самба: не останавливайся и не теряй ритм."),
    x("Kopakabanada oyoqlarimizni to‘lqin yuvdi va kulgimiz okeanga qo‘shildi.", "At Copacabana the waves washed our feet and our laughter joined the ocean.", "На Копакабане волны омывали нам ноги, а смех сливался с океаном."),
    x("Quyosh, okean va sen ☀️", "Sun, ocean and you ☀️", "Солнце, океан и ты ☀️"),
  ],
  buenosaires: [
    x("Tango ikki kishini talab qiladi — sevgi ham.", "It takes two to tango — and to love.", "Для танго нужны двое — и для любви тоже."),
    x("Qadamni adashtirsang ham raqsni davom ettir — xato ham raqsning bir qismi.", "If you miss a step, keep dancing — mistakes are part of the dance.", "Ошибся шагом — продолжай танцевать: ошибки тоже часть танца."),
    x("Bandoneon yig‘ladi, sen boshingni yelkamga qo‘yding — kecha shunday tugadi.", "The bandoneon wept, you rested your head on my shoulder — that’s how the night ended.", "Плачет бандонеон, твоя голова на моём плече — так заканчивается ночь."),
    x("Bir tango, bir umr 💃", "One tango, one lifetime 💃", "Одно танго — одна жизнь 💃"),
  ],
  cusco: [
    x("Bulutlar ustidagi shahar — orzu qilganlarning shahri.", "A city above the clouds belongs to those who dare to dream.", "Город над облаками принадлежит тем, кто осмелился мечтать."),
    x("Nafas qiyin bo‘lsa, sekinla, lekin to‘xtama.", "When breathing is hard, slow down — but don’t stop.", "Когда трудно дышать — замедлись, но не останавливайся."),
    x("Machu-Pikchuga quyosh chiqqanda tuman ko‘tarildi va sen “voy” deding — men buni unutmayman.", "When the sun rose over Machu Picchu, the mist lifted and you gasped — I’ll never forget it.", "Над Мачу-Пикчу встаёт солнце, туман поднимается, и твоё «ах» — я этого не забуду."),
    x("Bulutlardan yuqorida, orzulardan yaqinroq ⛰", "Above the clouds, closer to dreams ⛰", "Выше облаков, ближе к мечте ⛰"),
  ],
  yucatan: [
    x("Mayyalar vaqtni hisobladi — biz esa lahzalarni.", "The Maya counted time; we count moments.", "Майя считали время, а мы — мгновения."),
    x("Chuqurlikka sho‘ng‘ishdan qo‘rqma — eng tiniq suv pastda.", "Don’t fear diving deep — the clearest water is below.", "Не бойся нырять глубоко — самая чистая вода внизу."),
    x("Senot suviga sakradik va dunyo shovqini butunlay o‘chdi.", "We jumped into the cenote and the noise of the world vanished.", "Мы прыгнули в сенот, и шум мира исчез."),
    x("Qadimiy sirlar, yangi xotiralar 🌴", "Ancient secrets, new memories 🌴", "Древние тайны, новые воспоминания 🌴"),
  ],
  everest: [
    x("Tog‘ni zabt etmaymiz — o‘zimizni zabt etamiz.", "It’s not the mountain we conquer, but ourselves.", "Мы покоряем не гору, а самих себя."),
    x("Har bir qadam — cho‘qqiga bir qadam yaqinlik. Hisobla, lekin to‘xtama.", "Every step is one step closer to the summit — count them, but don’t stop.", "Каждый шаг приближает к вершине — считай, но не останавливайся."),
    x("Himolay sukunatida yuragimning ovozini eshitdim — u sening isming edi.", "In the Himalayan silence I heard my heart — it was saying your name.", "В гималайской тишине слышно сердце — оно произносит твоё имя."),
    x("Dunyoning tomida, sen bilan 🏔", "On the roof of the world, with you 🏔", "На крыше мира, с тобой 🏔"),
  ],
  sanfrancisco: [
    x("Tuman ham o‘tadi — ko‘prik esa qoladi.", "The fog passes; the bridge remains.", "Туман проходит, мост остаётся."),
    x("Har bir buyuk g‘oya kichik garajda boshlangan — boshla.", "Many great ideas started in a small garage — start.", "Многие великие идеи начинались в маленьком гараже — начни."),
    x("Oltin Darvoza ustida tuman suzdi va biz bulut ichida qo‘l ushlashdik.", "Fog drifted over the Golden Gate and we held hands inside a cloud.", "Туман плыл над Золотыми Воротами, и мы держались за руки внутри облака."),
    x("Tuman ichida ham yo‘lni topamiz 🌉", "We find our way even in the fog 🌉", "Мы найдём путь даже в тумане 🌉"),
  ],
  losangeles: [
    x("Har bir yulduz bir paytlar oddiy orzu bo‘lgan.", "Every star was once an ordinary dream.", "Каждая звезда когда-то была обычной мечтой."),
    x("Rad etilish — finish emas, keyingi sinovning boshlanishi.", "Rejection isn’t the end; it’s the start of the next audition.", "Отказ — не конец, а начало следующих проб."),
    x("Okean ustida quyosh botdi va hayotimiz bir film kadridek bo‘ldi.", "The sun set over the ocean and our life looked like a movie frame.", "Солнце село над океаном, и наша жизнь стала похожа на кадр из фильма."),
    x("Bosh rollarda: biz 🎬", "Starring: us 🎬", "В главных ролях: мы 🎬"),
  ],
  alaska: [
    x("Yovvoyi tabiat bizga kichikligimizni emas, tirikligimizni eslatadi.", "Wild nature reminds us not that we are small, but that we are alive.", "Дикая природа напоминает не о том, что мы малы, а о том, что мы живы."),
    x("Sovuq sinaydi, lekin chidaganlarga shafaq ko‘rsatadi.", "The cold tests you, but shows the aurora to those who endure.", "Холод испытывает, но тем, кто выдержит, показывает сияние."),
    x("Muzlik ko‘k nur sochdi va sen “bu rang tushga o‘xshaydi” deding.", "The glacier glowed blue and you said the colour looked like a dream.", "Ледник светится голубым, и, по твоим словам, этот цвет похож на сон."),
    x("Yovvoyi va erkin 🐻", "Wild and free 🐻", "Дикие и свободные 🐻"),
  ],
  haiti: [
    x("Ozodlik bir marta qo‘lga kiritilgan bo‘lsa, uni hech kim tortib ololmaydi.", "Freedom once won can never be taken from the heart.", "Свободу, однажды завоёванную, у сердца не отнять."),
    x("Eng tik tog‘ga ham qal’a qurgan xalq — sen ham uddalaysan.", "A people that built a fortress on the steepest peak — you can do it too.", "Народ построил крепость на самой крутой вершине — справишься и ты."),
    x("Karib shamoli sochlaringni o‘ynatdi, men esa o‘sha lahzani eslab qoldim.", "The Caribbean breeze played with your hair and I kept the moment.", "Карибский ветер играет твоими волосами, а этот миг остаётся со мной."),
    x("Karib quyoshi va erkin yurak 🌺", "Caribbean sun, free heart 🌺", "Карибское солнце и свободное сердце 🌺"),
  ],
  jakarta: [
    x("Ming orol, bitta xalq — turfa xillikda birlik.", "Thousands of islands, one people — unity in diversity.", "Тысячи островов, один народ — единство в многообразии."),
    x("Tirbandlikda ham sabr — shahar ham, hayot ham shuni o‘rgatadi.", "Patience even in traffic — the city and life both teach it.", "Терпение даже в пробке — этому учат и город, и жизнь."),
    x("Tropik kechada ko‘cha taomi va sening kulging — eng mazali kechki ovqat.", "Street food on a tropical night and your laughter — the tastiest dinner.", "Уличная еда тропической ночью и твой смех — самый вкусный ужин."),
    x("Tropik kechalar, issiq xotiralar 🌴", "Tropical nights, warm memories 🌴", "Тропические ночи, тёплые воспоминания 🌴"),
  ],
  bali: [
    x("Sholi ayvonlari — sabrning zinapoyasi.", "Rice terraces are a staircase of patience.", "Рисовые террасы — лестница терпения."),
    x("Ichki tinchlik — eng katta sayohat manzili.", "Inner peace is the greatest destination.", "Внутренний покой — главная цель путешествия."),
    x("Ibodatxona ortida quyosh botdi va sen ko‘zlaringni yumding — men esa seni.", "The sun set behind the temple; you closed your eyes and I watched you.", "Солнце садится за храмом, твои глаза закрыты, а я смотрю на тебя."),
    x("Bali vaqti: shoshilmaymiz 🌺", "Bali time: no rush 🌺", "Время Бали: не спешим 🌺"),
  ],
  sydney: [
    x("Yelkanlar shamolsiz suzmaydi — qiyinchilik ham oldinga itaradi.", "Sails don’t move without wind — hardship pushes you forward too.", "Паруса не движутся без ветра — трудности тоже толкают вперёд."),
    x("To‘lqinni kutma — unga qarab eshkak esh.", "Don’t wait for the wave — paddle towards it.", "Не жди волну — греби к ней."),
    x("Ko‘prik ustidagi otashinlar emas, sening ko‘zlaringdagi aks meni hayratda qoldirdi.", "It wasn’t the fireworks over the bridge — it was their reflection in your eyes.", "Поражают не салюты над мостом, а их отражение в твоих глазах."),
    x("Dunyoning narigi tomonida ham — birga 🦘", "Even on the other side of the world — together 🦘", "Даже на другом конце света — вместе 🦘"),
  ],
  canberra: [
    x("Rejalashtirilgan shahar ham, rejalashtirilgan orzu ham ro‘yobga chiqadi.", "A planned city and a planned dream both come true.", "И спланированный город, и спланированная мечта сбываются."),
    x("Murosaga kelish — zaiflik emas, donolik.", "Compromise isn’t weakness; it’s wisdom.", "Компромисс — не слабость, а мудрость."),
    x("Ko‘l bo‘yida tong otdi va havo sharlar osmonni rangga to‘ldirdi.", "Dawn by the lake, and hot-air balloons filled the sky with colour.", "Рассвет у озера, и воздушные шары раскрасили небо."),
    x("Tinch ko‘l, tinch yurak 🦢", "Calm lake, calm heart 🦢", "Тихое озеро, спокойное сердце 🦢"),
  ],
  melbourne: [
    x("Bir kunda to‘rt fasl — hayot ham shunday, kiyimingni ham, kayfiyatingni ham moslashtir.", "Four seasons in one day — so is life: adapt your coat and your mood.", "Четыре сезона за день — такова жизнь: подстраивай и пальто, и настроение."),
    x("Har bir tor ko‘chada san’at bor — har bir kunda imkoniyat bor.", "Every laneway hides art; every day hides a chance.", "В каждом переулке есть искусство, в каждом дне — шанс."),
    x("Yomg‘ir ostida bitta soyabonda yurdik — bu shaharda eng yoqimli ob-havo shu.", "We walked under one umbrella in the rain — the best weather in this city.", "Мы шли под одним зонтом в дождь — лучшая погода в этом городе."),
    x("Kofe, yomg‘ir va sen ☕", "Coffee, rain and you ☕", "Кофе, дождь и ты ☕"),
  ],
  capetown: [
    x("Ikki okean uchrashgan joyda kuchli to‘lqin bo‘ladi — kuchli sevgi ham.", "Where two oceans meet the waves are strong — so is love.", "Где встречаются два океана, сильные волны — и сильная любовь."),
    x("Bo‘ronli burunni “Yaxshi umid” deb atashgan — sen ham umidni tanla.", "They named a stormy cape Good Hope — you too, choose hope.", "Штормовой мыс назвали мысом Доброй Надежды — выбирай надежду и ты."),
    x("Stol tog‘idan butun shahar ko‘rindi, men esa faqat seni ko‘rdim.", "From Table Mountain we could see the whole city, but I only saw you.", "Со Столовой горы виден весь город, а я вижу только тебя."),
    x("Afrikaning janubiy uchida — yangi boshlanish 🌍", "At Africa’s southern tip — a new beginning 🌍", "На южной оконечности Африки — новое начало 🌍"),
  ],
  marrakech: [
    x("Ziravorlar bozori o‘rgatadi: hayotga ozgina ta’m qo‘sh.", "The spice market teaches: add a little flavour to life.", "Рынок специй учит: добавь в жизнь немного вкуса."),
    x("Labirintda adashish — yangi yo‘l topishning boshlanishi.", "Getting lost in the labyrinth is the start of finding a new way.", "Заблудиться в лабиринте — начало нового пути."),
    x("Jamoa al-Fna chiroqlari yondi, yalpiz choyi bug‘landi, sen esa menga jilmayding.", "The lanterns of Jemaa el-Fnaa lit up, the mint tea steamed and you smiled at me.", "Зажигаются фонари Джемаа-эль-Фна, дымится мятный чай, и твоя улыбка — для меня."),
    x("Qizil shahar, qizil yurak ❤️", "Red city, red heart ❤️", "Красный город, красное сердце ❤️"),
  ],
  nairobi: [
    x("Yolg‘iz tez borasan, birga uzoqqa borasan.", "Alone you go fast; together you go far.", "Один идёшь быстро, вместе — далеко."),
    x("Sher har kuni ov qiladi — sen ham har kuni harakat qil.", "The lion hunts every day — work for your goal every day too.", "Лев охотится каждый день — и ты каждый день трудись ради цели."),
    x("Savanna ustida quyosh chiqdi, jirafalar soya tashladi va biz jim qoldik.", "The sun rose over the savanna, giraffes cast long shadows and we fell silent.", "Над саванной взошло солнце, жирафы отбросили длинные тени, и мы замолчали."),
    x("Hakuna matata 🦁", "Hakuna matata 🦁", "Акуна матата 🦁"),
  ],
  singapore: [
    x("Kichik orol katta orzuni sig‘dira oladi.", "A small island can hold a very big dream.", "Маленький остров может вместить очень большую мечту."),
    x("Tartib va intizom — erkinlikning poydevori.", "Order and discipline are the foundation of freedom.", "Порядок и дисциплина — фундамент свободы."),
    x("Supertree’lar yondi, musiqa yangradi va biz bog‘ ichida raqsga tushdik.", "The supertrees lit up, music played and we danced in the garden.", "Зажглись супердеревья, заиграла музыка, и мы танцевали в саду."),
    x("Kelajak shahri, bugungi baxt 🌿", "City of the future, happiness of today 🌿", "Город будущего, счастье сегодняшнего дня 🌿"),
  ],
  bangkok: [
    x("Daryo oqimiga qarshi suzma — u bilan birga oqib, yo‘lni top.", "Don’t swim against the river — flow with it and find the way.", "Не плыви против течения — плыви вместе с рекой и найди путь."),
    x("Tabassum — har qanday tilda tushuniladigan so‘z.", "A smile is a word understood in every language.", "Улыбка — слово, понятное на любом языке."),
    x("Qayiqdagi bozor shovqini, mango hidi va sening qiziqqan ko‘zlaring.", "The noise of the floating market, the smell of mango and your curious eyes.", "Шум плавучего рынка, запах манго и твои любопытные глаза."),
    x("Tabassumlar mamlakatida — eng katta tabassum bilan 😊", "In the land of smiles — with the biggest smile 😊", "В стране улыбок — с самой широкой улыбкой 😊"),
  ],
  agra: [
    x("Haqiqiy muhabbat marmardan ham abadiyroq.", "True love outlasts even marble.", "Настоящая любовь долговечнее мрамора."),
    x("22 yil qurilgan yodgorlik eslatadi: buyuk narsa sabr talab qiladi.", "A monument built over 22 years reminds us: great things take patience.", "Памятник, строившийся 22 года, напоминает: великое требует терпения."),
    x("Toj Mahal tongda pushti tusga kirdi, sening yuzing esa nurga to‘ldi.", "At dawn the Taj turned pink and your face filled with light.", "На рассвете Тадж стал розовым, а твоё лицо наполнилось светом."),
    x("Bizning Toj Mahalimiz — bir-birimiz 🤍", "Our Taj Mahal is each other 🤍", "Наш Тадж-Махал — это мы друг для друга 🤍"),
  ],
};

// ---------------------------------------------------------------- universal pools (rotate everywhere except sacred cities)
export const UNIVERSAL = {
  a: [
    x("Sayohat — yangi joylarni emas, bir-birimizni qayta kashf qilish.", "Travel isn’t discovering new places but rediscovering each other.", "Путешествие — это не открытие новых мест, а новое открытие друг друга."),
    x("Eng uzun yo‘l ham yaxshi hamroh bilan qisqa tuyuladi.", "Even the longest road feels short with the right companion.", "Даже самая длинная дорога коротка с хорошим спутником."),
    x("Baxt — manzil emas, yo‘lda yurish usuli.", "Happiness isn’t a destination; it’s a way of travelling.", "Счастье — не пункт назначения, а способ идти по дороге."),
    x("Xotiralar — olib yurish mumkin bo‘lgan yagona boylik.", "Memories are the only treasure you can carry everywhere.", "Воспоминания — единственное богатство, которое можно носить с собой."),
    x("Dunyo — kitob; sayohat qilmaganlar faqat bir sahifasini o‘qiydi.", "The world is a book; those who never travel read only one page.", "Мир — это книга; кто не путешествует, читает лишь одну страницу."),
  ],
  m: [
    x("Bugun qo‘rqqan ishingni qil — ertaga u odatga aylanadi.", "Do what scares you today — tomorrow it becomes a habit.", "Сделай сегодня то, что пугает, — завтра это станет привычкой."),
    x("Kichik qadamlar ham oldinga olib boradi.", "Small steps still move you forward.", "Маленькие шаги тоже ведут вперёд."),
    x("Orzu reja bilan uchrashganda maqsadga aylanadi.", "A dream becomes a goal when it meets a plan.", "Мечта становится целью, когда встречается с планом."),
    x("Eng yaxshi vaqt — hozir. Ikkinchi eng yaxshi vaqt yo‘q.", "The best time is now — there is no second best.", "Лучшее время — сейчас. Второго лучшего не бывает."),
    x("Qulab tushish uyat emas — turmaslik uyat.", "Falling isn’t shameful — staying down is.", "Падать не стыдно — стыдно не вставать."),
  ],
  f: [
    x("Qayerda bo‘lmayin, uyim — sen turgan joy.", "Wherever I am, home is where you are.", "Где бы мы ни были, мой дом — там, где ты."),
    x("Ba’zan eng chiroyli manzara — yonimdagi odamning jilmayishi.", "Sometimes the most beautiful view is the smile next to me.", "Иногда самый красивый вид — улыбка рядом."),
    x("Sen bilan jimlik ham suhbatdek.", "With you, even silence feels like a conversation.", "С тобой даже молчание — как разговор."),
    x("Har shaharda bir parcha yuragimni qoldirdim — hammasi senga tegishli.", "I left a piece of my heart in every city — all of them belong to you.", "В каждом городе остаётся частичка моего сердца — и все они принадлежат тебе."),
    x("Vaqt tez o‘tadi, lekin sen bilan o‘tgan lahzalar abadiy qoladi.", "Time flies, but moments with you stay forever.", "Время летит, но мгновения с тобой остаются навсегда."),
  ],
  s: [
    x("Pasportda muhr, yurakda xotira ✈️", "A stamp in the passport, a memory in the heart ✈️", "Штамп в паспорте, память в сердце ✈️"),
    x("Hamrohim — eng yaxshi manzilim 💛", "My companion is my best destination 💛", "Мой спутник — моё лучшее направление 💛"),
    x("Kam narsa, ko‘p sarguzasht 🌍", "Less stuff, more adventures 🌍", "Меньше вещей — больше приключений 🌍"),
    x("Biz ikkimiz va butun dunyo 🌏", "The two of us and the whole world 🌏", "Мы вдвоём и весь мир 🌏"),
    x("Bugun ham yangi xotira yozildi 📸", "Another memory written today 📸", "Сегодня записано ещё одно воспоминание 📸"),
  ],
};

// ---------------------------------------------------------------- Makkah & Madinah — reverent only
export const SACRED = [
  x("Qalb tinchligi zikr bilan topiladi.", "The heart finds rest in remembrance.", "Сердце находит покой в поминании."),
  x("Shukr qilgan yurak doim boy.", "A grateful heart is always rich.", "Благодарное сердце всегда богато."),
  x("Sabr — yorug‘likka olib boruvchi yo‘l.", "Patience is the road that leads to light.", "Терпение — путь, ведущий к свету."),
  x("Bu yerda hamma teng: oq libos, bitta niyat.", "Here everyone is equal: white garments, one intention.", "Здесь все равны: белые одежды, одно намерение."),
  x("Kechirish — qalbni yengillatadigan eng go‘zal amal.", "Forgiveness is the most beautiful deed that lightens the heart.", "Прощение — самое прекрасное дело, облегчающее сердце."),
  x("Duo — masofani bilmaydigan yo‘l.", "A prayer is a road that knows no distance.", "Молитва — дорога, не знающая расстояний."),
  x("Ota-onaning duosi — eng ishonchli himoya.", "A parent’s prayer is the surest protection.", "Молитва родителей — самая надёжная защита."),
  x("Kamtarlik — insonni ulug‘laydigan fazilat.", "Humility is the virtue that makes a person great.", "Скромность — достоинство, возвышающее человека."),
];

// ---------------------------------------------------------------- nature around you
export const NATURE = {
  sea: [
    x("Dengiz o‘rgatadi: har to‘lqin ketadi, lekin yangisi albatta keladi.", "The sea teaches that every wave leaves, but a new one always comes.", "Море учит: каждая волна уходит, но приходит новая."),
    x("Okean shovqini — tabiatning eng uzun va eng tinchlantiruvchi qo‘shig‘i.", "The sound of the ocean is nature’s longest, calmest song.", "Шум океана — самая длинная и спокойная песня природы."),
  ],
  mountain: [
    x("Tog‘lar shoshilmaydi, lekin baribir osmonga yetadi.", "Mountains never hurry, yet they still reach the sky.", "Горы не спешат, но всё равно достают до неба."),
    x("Cho‘qqidan qaraganda yo‘lning qiyinligi emas, go‘zalligi ko‘rinadi.", "From the summit you see the beauty of the path, not its difficulty.", "С вершины видна красота пути, а не его трудность."),
  ],
  desert: [
    x("Sahro jimligida o‘z yuragingning ovozini eshitasan.", "In the silence of the desert you hear your own heart.", "В тишине пустыни слышишь собственное сердце."),
    x("Qum barxanlari shakl o‘zgartiradi — o‘zgarishdan qo‘rqma.", "Dunes change shape — don’t be afraid of change.", "Барханы меняют форму — не бойся перемен."),
  ],
  city: [
    x("Shahar chiroqlari — millionlab orzular yonib turgan derazalar.", "City lights are windows where millions of dreams are burning.", "Огни города — окна, где горят миллионы мечтаний."),
    x("Shovqinli shaharda ham ikki kishilik jimjit dunyo bor.", "Even in a noisy city there is a quiet world for two.", "Даже в шумном городе есть тихий мир для двоих."),
  ],
  rain: [
    x("Yomg‘ir derazani yuvadi, sen esa yuragimdagi g‘uborni.", "The rain washes the window; you wash the dust from my heart.", "Дождь моет окно, а ты — пыль с моего сердца."),
    x("Yomg‘irdan qochma — unda raqs tushishni o‘rgan.", "Don’t run from the rain — learn to dance in it.", "Не убегай от дождя — научись в нём танцевать."),
  ],
  snow: [
    x("Qor yerni oq sahifaga aylantiradi — yangi hikoyani boshla.", "Snow turns the world into a blank page — start a new story.", "Снег превращает мир в чистый лист — начни новую историю."),
    x("Sovuq havoda issiq qo‘l — eng qimmat sovg‘a.", "A warm hand on a cold day is the most precious gift.", "Тёплая рука в холодный день — самый ценный подарок."),
  ],
  aurora: [
    x("Osmon ham ba’zan raqsga tushadi — shunchaki qarashni bil.", "Sometimes the sky dances too — you only need to look up.", "Иногда и небо танцует — нужно лишь поднять глаза."),
  ],
  night: [
    x("Yulduzlar faqat qorong‘ida ko‘rinadi — qiyin kunlar ham o‘z nurini ko‘rsatadi.", "Stars only show in the dark — hard days reveal their own light.", "Звёзды видны только в темноте — трудные дни тоже открывают свой свет."),
    x("Tun — kunning eng samimiy suhbatdoshi.", "Night is the day’s most sincere companion.", "Ночь — самый искренний собеседник дня."),
  ],
  dawn: [
    x("Har tong — hayotning “yana bir imkoniyat” degan xati.", "Every dawn is life’s letter saying: one more chance.", "Каждый рассвет — письмо жизни со словами «ещё один шанс»."),
  ],
  sunset: [
    x("Quyosh botishi tugash emas — ertangi chiqishga va’da.", "A sunset isn’t an ending; it’s a promise of tomorrow’s sunrise.", "Закат — не конец, а обещание завтрашнего рассвета."),
  ],
  blossom: [
    x("Gullar qisqa yashaydi, shuning uchun ular shunchalik go‘zal — lahzani qadrla.", "Blossoms live briefly — that’s why they are so beautiful. Treasure the moment.", "Цветы живут недолго — поэтому они так прекрасны. Цени мгновение."),
  ],
  autumn: [
    x("Kuz barglari ko‘rsatadi: qo‘yib yuborish ham chiroyli bo‘lishi mumkin.", "Autumn leaves show that letting go can be beautiful.", "Осенние листья показывают: отпускать тоже бывает красиво."),
  ],
  forest: [
    x("Daraxt ildizi qancha chuqur bo‘lsa, bo‘roni shuncha qo‘rqinchli emas.", "The deeper the roots, the less a storm can frighten the tree.", "Чем глубже корни, тем меньше страшна буря."),
  ],
};

// ---------------------------------------------------------------- feelings that fit the music that is playing
export const SONG = {
  uz: [x("Ona tilidagi qo‘shiq — qayerda bo‘lmang, uyga qaytaradi.", "A song in your mother tongue brings you home wherever you are.", "Песня на родном языке возвращает домой, где бы ты ни был.")],
  ru: [x("Ba’zi qo‘shiqlar yurakdan o‘tib, xotiraga aylanadi.", "Some songs pass through the heart and turn into memories.", "Некоторые песни проходят через сердце и становятся воспоминаниями.")],
  tr: [x("Sharqona ohang — sog‘inchning eng nozik tili.", "An eastern melody is the gentlest language of longing.", "Восточная мелодия — самый нежный язык тоски.")],
  it: [x("Italyancha qo‘shiq tushunmasdan ham sevgini his qildiradi.", "An Italian song makes you feel love even without understanding the words.", "Итальянская песня даёт почувствовать любовь, даже не понимая слов.")],
  fr: [x("Fransuzcha shivir kabi qo‘shiq — kechki shahar uchun yaratilgan.", "A French song like a whisper — made for the city at night.", "Французская песня, как шёпот, создана для ночного города.")],
  ar: [x("Arabcha ohang sahro shamoli kabi — uzoqdan keladi, yurakka yetadi.", "An Arabic melody is like desert wind — it comes from afar and reaches the heart.", "Арабская мелодия как ветер пустыни — приходит издалека и достигает сердца.")],
  kr: [x("Ritm yuragimiz urishi bilan bir xil — demak, bu qo‘shiq bizniki.", "The beat matches our heartbeat — so this song is ours.", "Ритм совпадает с нашим сердцебиением — значит, эта песня наша.")],
  latin: [x("Lotin ritmida turib bo‘lmaydi — hayot ham raqsga chaqiradi.", "You can’t stand still to a Latin rhythm — life is inviting you to dance.", "Под латинский ритм невозможно стоять — жизнь зовёт танцевать.")],
  india: [x("Qo‘shiq ichidagi duo — tilni emas, yurakni talab qiladi.", "A prayer within a song needs a heart, not a language.", "Молитва в песне требует не языка, а сердца.")],
  africa: [x("Baraban ovozi — yerning yurak urishi.", "The drum is the heartbeat of the earth.", "Барабан — сердцебиение земли.")],
  asia: [x("Sharqning sokin ohangi — shoshmaslikni o‘rgatadi.", "The quiet melodies of the East teach us not to hurry.", "Тихие мелодии Востока учат не спешить.")],
  gr: [x("Dengiz bo‘yi qo‘shig‘i — to‘lqin va yurak duet.", "A seaside song is a duet of the waves and the heart.", "Песня у моря — дуэт волн и сердца.")],
  global: [x("Bu qo‘shiq endi har eshitganda shu joyni eslatadi.", "From now on this song will always bring back this place.", "Теперь эта песня всегда будет напоминать об этом месте.")],
  chill: [x("Sokin musiqa va tabiat — ruh uchun eng yaxshi dam.", "Calm music and nature — the best rest for the soul.", "Спокойная музыка и природа — лучший отдых для души.")],
};

export const KIND_LABEL = {
  place: { uz: "Joy hikmati", en: "Of this place", ru: "Мудрость места" },
  a: { uz: "Aforizm", en: "Aphorism", ru: "Афоризм" },
  m: { uz: "Motivatsiya", en: "Motivation", ru: "Мотивация" },
  f: { uz: "His-tuyg‘u", en: "Feeling", ru: "Чувство" },
  s: { uz: "Status", en: "Status", ru: "Статус" },
  nature: { uz: "Tabiat", en: "Nature", ru: "Природа" },
  song: { uz: "Qo‘shiq kayfiyati", en: "Song mood", ru: "Настроение песни" },
  sacred: { uz: "Hikmat", en: "Wisdom", ru: "Мудрость" },
};

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

/** Nature keys for a city at this moment (from its mood, the season and the live atmosphere profile). */
export function natureKeys(city, season, prof = {}) {
  const k = [], tod = prof.tod || "";
  const kinds = (prof.particles || []).map((p) => p?.kind);
  if (kinds.includes("rain")) k.push("rain");
  if (kinds.includes("snow")) k.push("snow");
  if (kinds.includes("petal")) k.push("blossom");
  if (kinds.includes("leaf") || season === "autumn") k.push("autumn");
  if (prof.aurora) k.push("aurora");
  if (tod === "night") k.push("night"); else if (tod === "sunrise" || tod === "dawn") k.push("dawn"); else if (tod === "sunset" || tod === "golden") k.push("sunset");
  k.push({ ocean: "sea", alpine: "mountain", aurora: "mountain", desert: "desert", city: "city", zen: "forest", romance: "city", silk: "city", maqam: "city", spiritual: "desert" }[city.mood] || "city");
  return k;
}

/**
 * Build the rotating deck for this moment: [{ kind, text }] in the current language.
 * placeLine: the aphorism of the place on screen (or null); song: the playing track (or null).
 */
export function deck(city, { placeLine, season, prof, song, songCat } = {}) {
  const lang = getLang(), T = (v) => (v && (v[lang] || v.en)) || "", out = [];
  if (placeLine) out.push({ kind: "place", text: placeLine });
  if (city.spiritual) {
    SACRED.forEach((s) => out.push({ kind: "sacred", text: T(s) }));
    (city.quotes || []).forEach((q) => out.push({ kind: "sacred", text: T(q) }));
    return out;
  }
  const seed = Math.floor(Date.now() / 36e5) + city.key.length; // varies through the day, stable for an hour
  const own = CITY[city.key] || [];
  const nk = natureKeys(city, season, prof);
  const nat = nk.flatMap((k) => NATURE[k] || []);
  const kinds = ["a", "m", "f", "s"];
  own.forEach((s, i) => out.push({ kind: kinds[i], text: T(s) }));
  (city.quotes || []).forEach((q) => out.push({ kind: "a", text: T(q) }));
  if (nat.length) out.push({ kind: "nature", text: T(pick(nat, seed)) });
  if (song && song.kind !== "gen") out.push({ kind: "song", text: T(pick(SONG[songCat] || SONG.global, seed)) });
  for (const k of kinds) out.push({ kind: k, text: T(pick(UNIVERSAL[k], seed + k.charCodeAt(0))) });
  if (nat.length > 1) out.push({ kind: "nature", text: T(pick(nat, seed + 1)) });
  return out.filter((d) => d.text);
}
export const kindLabel = (k) => { const l = KIND_LABEL[k]; return l ? l[getLang()] || l.en : ""; };
