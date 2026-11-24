// WorldLive — original aphorisms (written for WorldLive, never attributed to real people).
// One line per place, tuned to what that place *feels* like for two people travelling together,
// plus season × time-of-day mood lines that change with the atmosphere engine.
// Sacred places (Makkah, Madinah) carry reverent, non-romantic reflections only.
import { getLang } from "./i18n.js";

const P = {
  // ---------------------------------------------------------------- Tashkent
  "amir-timur-square": ["Buyuk yo‘llar bitta qat’iy qarordan boshlanadi — bugun o‘sha qarorni birga qabul qilaylik.", "Great roads begin with one firm decision — let’s make it together today.", "Великие пути начинаются с одного твёрдого решения — примем его вместе сегодня."],
  "independence-square-tashkent": ["Erkinlik — o‘zingni yo‘qotmasdan boshqani sevishdir.", "Freedom is loving someone without losing yourself.", "Свобода — это любить другого, не теряя себя."],
  "chorsu-bazaar": ["Hayotning ta’mi — kichik narsalarda: bir siqim mayiz, bitta tabassum, birga qilingan savdo.", "Life tastes best in small things: a handful of raisins, a smile, a bargain made together.", "Вкус жизни — в мелочах: горсть изюма, улыбка, торг вдвоём."],
  "tashkent-tower": ["Balanddan qaraganda muammolar kichrayadi, orzular esa kattalashadi.", "From up high, problems shrink and dreams grow larger.", "С высоты проблемы мельчают, а мечты становятся больше."],
  "hazrati-imam-complex": ["Sukunatda eshitilgan ovoz — eng to‘g‘ri yo‘l ko‘rsatuvchi.", "The voice you hear in silence is the truest guide.", "Голос, услышанный в тишине, — самый верный проводник."],
  "kukeldash-madrasah": ["Ilm — g‘ishtdek: har kuni bittadan qo‘ysang, bir kun saroy bo‘ladi.", "Knowledge is like brick: lay one a day and one day it is a palace.", "Знание — как кирпич: клади по одному каждый день, и однажды будет дворец."],
  // ---------------------------------------------------------------- Samarkand
  "registan": ["Uch madrasa olti asrdir yonma-yon turibdi — sabr bilan qurilgan narsa abadiydir.", "Three madrasas have stood side by side for centuries — what is built with patience lasts.", "Три медресе стоят рядом веками — построенное с терпением вечно."],
  "shah-i-zinda": ["Har bir moviy koshin kimningdir duosi edi; bizning ham orzularimiz shunday rangli bo‘lsin.", "Every blue tile was once someone’s prayer — may our dreams be just as vivid.", "Каждая синяя плитка была чьей-то молитвой — пусть наши мечты будут столь же яркими."],
  "gur-e-amir": ["Kuch o‘tkinchi, lekin yaxshi nom asrlarga qoladi.", "Power fades, but a good name stays for centuries.", "Сила проходит, а доброе имя остаётся на века."],
  "bibi-khanym-mosque": ["Sevgi uchun qurilgan narsa zilziladan keyin ham qayta tiklanadi.", "What is built for love rises again even after the earthquake.", "Построенное ради любви поднимается вновь даже после землетрясения."],
  "ulugh-beg-observatory": ["Yulduzlarni o‘lchagan odam ham bir paytlar faqat osmonga qarab orzu qilgan.", "Even the man who measured the stars once just looked up and dreamed.", "Даже тот, кто измерил звёзды, когда‑то просто смотрел в небо и мечтал."],
  // ---------------------------------------------------------------- Bukhara
  "po-i-kalyan": ["Minora shamolga emas, ildiziga suyanadi. Biz ham shunday bo‘laylik.", "A minaret leans on its roots, not on the wind. Let’s be like that.", "Минарет держится корнями, а не ветром. Будем такими же."],
  "ark-of-bukhara": ["Eng mustahkam qal’a — bir-biriga ishongan ikki yurak.", "The strongest fortress is two hearts that trust each other.", "Самая крепкая крепость — два сердца, которые доверяют друг другу."],
  "lyab-i-hauz": ["Hovuz bo‘yida choy — shoshmaslik ham bir san’at.", "Tea by the pool: not hurrying is an art too.", "Чай у хауза: умение не спешить — тоже искусство."],
  "samanid-mausoleum": ["Ming yildan beri g‘isht bilan yorug‘lik o‘ynaydi — oddiylikda mukammallik bor.", "For a thousand years light has played on plain brick — perfection hides in simplicity.", "Тысячу лет свет играет на простом кирпиче — совершенство прячется в простоте."],
  "chor-minor": ["To‘rt minora, to‘rt tomon — qaysi tomonga borsak ham, birga boramiz.", "Four minarets, four directions — whichever way we go, we go together.", "Четыре минарета, четыре стороны — куда бы ни пошли, идём вместе."],
  // ---------------------------------------------------------------- Istanbul
  "hagia-sophia": ["Asrlar o‘zgaradi, ammo yuqoriga qaragan ko‘z doim hayratlanadi.", "Centuries change, yet eyes that look up never stop wondering.", "Века меняются, но взгляд, поднятый вверх, не перестаёт удивляться."],
  "sultan-ahmed-mosque": ["Olti minora bitta osmonga qaraydi — turli yo‘llar bitta maqsadga olib boradi.", "Six minarets face one sky — many paths, one purpose.", "Шесть минаретов смотрят в одно небо — много путей, одна цель."],
  "bosphorus": ["Ikki qit’ani bir suv birlashtiradi; ikki insonni esa bitta orzu.", "One strait joins two continents; one dream joins two people.", "Один пролив соединяет два континента, одна мечта — двух людей."],
  "galata-tower": ["Shahar shovqini pastda qoladi, yuqorida faqat sen va ufq.", "The city’s noise stays below; up here it is only you and the horizon.", "Шум города остаётся внизу, здесь — только ты и горизонт."],
  "topkap-palace": ["Saroylar oltin bilan emas, unda yashagan hikoyalar bilan boy.", "Palaces are rich not in gold but in the stories lived inside them.", "Дворцы богаты не золотом, а историями, прожитыми в них."],
  "grand-bazaar-istanbul": ["Ming do‘kon orasida adashsang ham, qo‘lingni qo‘yib yubormaydigan odam bor.", "Lost among a thousand shops, there is still a hand that won’t let go of yours.", "Даже потерявшись среди тысячи лавок, есть рука, что не отпустит твою."],
  "maiden-s-tower": ["Dengiz o‘rtasidagi minora kabi — yolg‘iz emas, mustaqil bo‘l.", "Like a tower in the sea: not lonely — independent.", "Как башня посреди моря: не одинока — независима."],
  "basilica-cistern": ["Zulmatda ham ustunlar tik turadi — qiyin kunlarda ham biz shundaymiz.", "Columns stand tall even in the dark — so do we on hard days.", "Колонны стоят и во тьме — так и мы в трудные дни."],
  // ---------------------------------------------------------------- Cappadocia
  "g-reme": ["Tong saharda yuzlab shar ko‘tariladi — har biri kimningdir jasorati.", "At dawn hundreds of balloons rise — each one somebody’s courage.", "На рассвете поднимаются сотни шаров — каждый чья‑то смелость."],
  "g-reme-national-park": ["Shamol va vaqt toshni haykalga aylantirdi; sabr seni ham shunday shakllantiradi.", "Wind and time carved stone into sculpture; patience shapes you the same way.", "Ветер и время превратили камень в скульптуру; терпение так же лепит и тебя."],
  "derinkuyu-underground-city": ["Eng chuqur joyda ham odamlar umidni yoqib turishgan.", "Even at the deepest point, people kept hope burning.", "Даже на самой глубине люди хранили огонь надежды."],
  "u-hisar": ["Cho‘qqiga chiqqan odam yo‘lning toshlarini emas, manzarani eslaydi.", "Those who reach the top remember the view, not the stones on the path.", "Поднявшийся на вершину помнит вид, а не камни на пути."],
  // ---------------------------------------------------------------- Paris
  "eiffel-tower": ["Har kecha minora porlaydi — sevgi ham har kuni yangidan yoqilishi kerak.", "The tower sparkles every night — love, too, must be relit each day.", "Башня сверкает каждую ночь — и любовь нужно зажигать заново каждый день."],
  "louvre": ["Eng go‘zal asar — devorda emas, yoningda turgan odamning ko‘zlarida.", "The finest masterpiece isn’t on the wall — it’s in the eyes beside you.", "Лучший шедевр не на стене — он в глазах того, кто рядом."],
  "notre-dame-de-paris": ["Yonib ketgan narsa ham qayta tiklanadi, agar uni sevadiganlar bo‘lsa.", "Even what burns can be rebuilt, if there are people who love it.", "Даже сгоревшее восстанавливают, если есть те, кто его любит."],
  "arc-de-triomphe": ["G‘alaba — kimnidir yengish emas, kechagi o‘zingdan oshishdir.", "Victory isn’t beating others — it’s outgrowing who you were yesterday.", "Победа — не одолеть других, а перерасти себя вчерашнего."],
  "montmartre": ["Tepalikdagi rassomlar bilishadi: hayotni o‘zing chizasan.", "The painters on the hill know it: you draw your own life.", "Художники на холме знают: свою жизнь рисуешь ты сам."],
  "champs-lys-es": ["Shoshmay yur — eng chiroyli xiyobon ham birga yurilganda go‘zal.", "Walk slowly — even the grandest avenue is best walked together.", "Иди не спеша — даже самый красивый проспект лучше пройти вдвоём."],
  "seine": ["Daryo hech qachon orqaga qaytmaydi, lekin har doim qirg‘oqlarini quchoqlaydi.", "A river never flows back, yet it always embraces its banks.", "Река не течёт вспять, но всегда обнимает свои берега."],
  "palace-of-versailles": ["Oynalar saroyi eslatadi: o‘zingga qanday qarasang, dunyo ham shunday qaraydi.", "The Hall of Mirrors reminds us: the world looks at you the way you look at yourself.", "Зеркальная галерея напоминает: мир смотрит на тебя так, как ты сам на себя."],
  "pont-alexandre-iii": ["Ko‘prik qurish devor qurishdan qiyinroq, lekin hayot ko‘priklarda.", "Bridges are harder to build than walls, but life happens on bridges.", "Мосты строить труднее, чем стены, но жизнь — на мостах."],
  // ---------------------------------------------------------------- Makkah (reverent)
  "great-mosque-of-mecca": ["Bu yerda hamma bir xil kiyimda — insonning qadri qalbidadir.", "Here everyone wears the same white — a person’s worth lies in the heart.", "Здесь все в одинаково белом — ценность человека в его сердце."],
  "kaaba": ["Millionlab yurak bitta markaz atrofida — birlik shunday ko‘rinadi.", "Millions of hearts around one centre — this is what unity looks like.", "Миллионы сердец вокруг одного центра — так выглядит единство."],
  "safa-and-marwa": ["Ikki tepalik orasidagi yo‘l o‘rgatadi: umid bilan qilingan har qadam qadrlidir.", "The path between two hills teaches: every step taken in hope matters.", "Путь между двумя холмами учит: каждый шаг, сделанный с надеждой, ценен."],
  "jabal-al-nour": ["Nur ko‘pincha sukunat va yolg‘izlikda kelgan.", "Light has so often come in silence and solitude.", "Свет так часто приходил в тишине и уединении."],
  "mount-arafat": ["Kechirim so‘rash — kuchsizlik emas, qalbning poklanishidir.", "Asking forgiveness is not weakness — it is the heart made clean.", "Просить прощения — не слабость, а очищение сердца."],
  "mina-saudi-arabia": ["Oddiy chodirlar shahri: insonga juda oz narsa kerak, ko‘pi — qalbda.", "A city of simple tents: a person needs very little — the rest is in the heart.", "Город простых шатров: человеку нужно немного, остальное — в сердце."],
  // ---------------------------------------------------------------- Madinah (reverent)
  "al-masjid-an-nabawi": ["Sakinat — shoshilmagan qalbga beriladigan in’om.", "Serenity is a gift given to the heart that does not rush.", "Умиротворение — дар сердцу, которое не спешит."],
  "quba-mosque": ["Har bir yaxshi ish kichik poydevordan boshlanadi.", "Every good work begins with a small foundation.", "Каждое доброе дело начинается с малого основания."],
  "mount-uhud": ["Tog‘ kabi sobit bo‘l — sinov kunlari ham o‘tadi.", "Be steady as a mountain — days of trial pass too.", "Будь твёрд, как гора — и дни испытаний проходят."],
  "masjid-al-qiblatayn": ["Yo‘nalishni o‘zgartirish ham ba’zan eng to‘g‘ri qaror bo‘ladi.", "Sometimes changing direction is the rightest decision of all.", "Иногда сменить направление — самое верное решение."],
  // ---------------------------------------------------------------- Maldives
  "mal": ["Kichik orol, katta yurak — joyning kattaligi emas, iliqligi muhim.", "Small island, big heart — it’s the warmth of a place that matters, not its size.", "Маленький остров, большое сердце — важна теплота места, а не его размер."],
  "hulhumal": ["Dengizdan yangi yer yaratish mumkin bo‘lsa, yangi boshlanish ham mumkin.", "If new land can be raised from the sea, a new beginning is possible too.", "Если из моря можно поднять новую землю, то и новое начало возможно."],
  "vaadhoo-raa-atoll": ["To‘lqinlar yulduzdek porlaydi — qorong‘ulikda ham go‘zallik bor.", "The waves glow like stars — there is beauty even in the dark.", "Волны светятся, как звёзды — красота есть и во тьме."],
  "hanifaru": ["Ulkan manta’lar shovqinsiz suzadi — haqiqiy kuch sokin bo‘ladi.", "Giant mantas glide without a sound — true strength is quiet.", "Огромные манты скользят беззвучно — настоящая сила тиха."],
  // ---------------------------------------------------------------- Kyoto
  "fushimi-inari-taisha": ["Ming darvoza — ming qadam. Har biri seni o‘zingga yaqinlashtiradi.", "A thousand gates, a thousand steps — each one brings you closer to yourself.", "Тысяча ворот — тысяча шагов, и каждый приближает тебя к себе."],
  "kinkaku-ji": ["Oltin ko‘zguda aks etgan ko‘l kabi: tinch qalb dunyoni go‘zal ko‘rsatadi.", "Like the lake mirroring gold: a calm heart makes the world look beautiful.", "Как озеро, отражающее золото: спокойное сердце делает мир прекрасным."],
  "arashiyama": ["Bambuk egiladi, lekin sinmaydi — moslashuvchanlik ham kuch.", "Bamboo bends but does not break — flexibility is strength too.", "Бамбук гнётся, но не ломается — гибкость тоже сила."],
  "kiyomizu-dera": ["Ba’zan katta sakrash kerak — yog‘och ayvon ham yuz yillardan beri bardosh beryapti.", "Sometimes you need a great leap — the wooden stage has held for centuries.", "Иногда нужен большой прыжок — деревянная сцена держится веками."],
  "gion": ["Fonar yorug‘ida yurilgan kecha — eng uzoq esda qoladigan kecha.", "A night walked by lantern light is the night remembered longest.", "Ночь, пройденная при свете фонарей, запоминается дольше всех."],
  // ---------------------------------------------------------------- Interlaken
  "lauterbrunnen": ["Yetmish ikki sharshara bir vodiyda — baxt ham ko‘pincha kichik oqimlardan yig‘iladi.", "Seventy-two waterfalls in one valley — happiness, too, gathers from small streams.", "Семьдесят две водопада в одной долине — и счастье собирается из малых ручьёв."],
  "staubbach-falls": ["Suv qoyadan qo‘rqmay tushadi — qo‘rquvni ham shunday tashla.", "Water falls from the cliff without fear — let go of yours the same way.", "Вода падает со скалы без страха — так же отпусти и свой."],
  "jungfraujoch": ["Yevropa tomida nafas qisadi, lekin qalb kengayadi.", "On the roof of Europe the breath grows short, but the heart grows wide.", "На крыше Европы перехватывает дыхание, но расширяется сердце."],
  "lake-brienz": ["Ko‘l rangi tiniq, chunki u shoshmaydi. Fikrlar ham shunday tiniqlashadi.", "The lake is clear because it is still. Thoughts clear the same way.", "Озеро прозрачно, потому что спокойно. Так проясняются и мысли."],
  "lake-thun": ["Tog‘lar ko‘lda aks etadi — eng yaxshi odam seni o‘zingga ko‘rsatadi.", "Mountains mirror in the lake — the right person shows you yourself.", "Горы отражаются в озере — правильный человек показывает тебе тебя."],
  "grindelwald": ["Muz daryosi asta-sekin, ammo to‘xtamasdan yuradi. Maqsadga ham shunday.", "A glacier moves slowly but never stops. Move toward your goals like that.", "Ледник движется медленно, но не останавливается. Так и к цели."],
  // ---------------------------------------------------------------- Dubai
  "burj-khalifa": ["Sahroda eng baland bino qurildi — imkonsiz so‘zi faqat boshlanmagan ishlar uchun.", "The tallest tower rose from the desert — ‘impossible’ only describes what hasn’t started.", "Самая высокая башня выросла в пустыне — «невозможно» бывает лишь то, что не начато."],
  "palm-jumeirah": ["Dengizga palma chizgan odamlar avval qog‘ozda orzu qilishgan.", "Those who drew a palm on the sea first dreamt it on paper.", "Те, кто нарисовал пальму на море, сначала мечтали о ней на бумаге."],
  "dubai-creek": ["Yog‘och abra qayig‘ida ham, osmono‘par binolar orasida ham — ildizni unutma.", "In a wooden abra or among skyscrapers — never forget your roots.", "В деревянной абре или среди небоскрёбов — не забывай свои корни."],
  "burj-al-arab": ["Yelkan shaklidagi bino aytadi: shamolga qarshi emas, u bilan birga suz.", "A building shaped like a sail says: sail with the wind, not against it.", "Здание‑парус говорит: плыви с ветром, а не против него."],
  "dubai-fountain": ["Suv ham musiqaga raqs tushadi — hayotning o‘z ritmini top.", "Even water dances to music — find the rhythm of your own life.", "Даже вода танцует под музыку — найди ритм своей жизни."],
  // ---------------------------------------------------------------- Giza
  "great-pyramid-of-giza": ["To‘rt yarim ming yil — har bir buyuk ish bitta tosh bilan boshlanadi.", "Four and a half thousand years — every great work starts with a single stone.", "Четыре с половиной тысячи лет — каждое великое дело начинается с одного камня."],
  "great-sphinx-of-giza": ["Sfinks sabr bilan qaraydi: vaqt hamma savolga javob beradi.", "The Sphinx watches patiently: time answers every question.", "Сфинкс смотрит терпеливо: время отвечает на все вопросы."],
  "nile": ["Nil sahroga hayot olib keladi — yaxshi inson ham shunday.", "The Nile brings life to the desert — so does a good person.", "Нил приносит жизнь в пустыню — так же, как добрый человек."],
  "egyptian-museum": ["O‘tmishni bilgan odam kelajakdan qo‘rqmaydi.", "Whoever knows the past does not fear the future.", "Кто знает прошлое, не боится будущего."],
  "khan-el-khalili": ["Ziravor hidi, mis chiroqlar va bir piyola choy — baxt ba’zan shunchalik oddiy.", "The scent of spice, copper lanterns, a cup of tea — happiness can be that simple.", "Запах специй, медные фонари и чашка чая — счастье бывает таким простым."],
  // ---------------------------------------------------------------- Santorini
  "oia-greece": ["Quyosh botishini kutayotgan minglab odam — eng go‘zal narsa sabr bilan keladi.", "Thousands waiting for the sunset — the most beautiful things come to those who wait.", "Тысячи ждут заката — самое красивое приходит к тем, кто умеет ждать."],
  "fira": ["Oq uylar va moviy gumbazlar: oddiy ranglar ham birga bo‘lsa mo‘jiza.", "White houses, blue domes: simple colours become a miracle together.", "Белые дома и синие купола: простые цвета вместе становятся чудом."],
  "akrotiri-prehistoric-city": ["Kul ostida qolgan shahar ham hikoyasini saqlab qoldi — xotiralar o‘lmaydi.", "Even a city buried in ash kept its story — memories don’t die.", "Даже город под пеплом сохранил свою историю — воспоминания не умирают."],
  "red-beach-santorini": ["Vulqon qoldirgan qizil qoya bugun eng chiroyli plyaj — og‘riq ham go‘zallikka aylanadi.", "The red cliffs a volcano left are now a beautiful beach — pain, too, can turn into beauty.", "Красные скалы вулкана стали прекрасным пляжем — и боль может стать красотой."],
  // ---------------------------------------------------------------- Rome
  "colosseum": ["Haqiqiy jasorat — arenada emas, har kuni yaxshi bo‘lishga urinishda.", "Real courage isn’t in the arena — it’s in trying to be good every day.", "Настоящая смелость не на арене, а в попытке быть добрым каждый день."],
  "trevi-fountain": ["Tanga tashla, lekin qaytish uchun tilakni o‘zing bajar.", "Throw a coin — but make the wish to return come true yourself.", "Брось монетку — но желание вернуться исполни сам."],
  "pantheon-rome": ["Gumbazdagi teshikdan yorug‘lik tushadi — ochiq qalbga ham.", "Light falls through the dome’s opening — and through an open heart.", "Свет падает через окулус купола — и через открытое сердце."],
  "roman-forum": ["Imperiyalar qulaydi, lekin bir-biriga aytilgan yaxshi so‘z qoladi.", "Empires fall, but the kind words we said to each other remain.", "Империи падают, а добрые слова, сказанные друг другу, остаются."],
  "spanish-steps": ["Bir yuz o‘ttiz besh zina — har biriga bitta orzu qo‘yib chiqaylik.", "A hundred and thirty-five steps — let’s place a dream on each one.", "Сто тридцать пять ступеней — положим мечту на каждую."],
  // ---------------------------------------------------------------- Iceland
  "sk-gafoss": ["Sharshara tumanida kamalak paydo bo‘ladi — qiyinchilikdan keyin ham.", "A rainbow appears in the waterfall’s mist — and after every hardship.", "В брызгах водопада появляется радуга — и после каждой трудности."],
  "gullfoss": ["Oltin sharshara hech qachon to‘xtamaydi — energiyangni ham shunday saqla.", "The Golden Falls never stop — keep your energy flowing the same way.", "Золотой водопад никогда не останавливается — так храни и свою энергию."],
  "blue-lagoon-geothermal-spa": ["Muz ichida issiq suv — eng sovuq kunda ham iliqlik topiladi.", "Warm water inside the ice — warmth can be found on the coldest day.", "Тёплая вода среди льда — тепло найдётся и в самый холодный день."],
  "j-kuls-rl-n": ["Muzliklar eriydi, lekin dengizga borib yangi hayot beradi — o‘zgarish ham shunday.", "Icebergs melt, yet reach the sea and give new life — change is like that.", "Айсберги тают, но, дойдя до моря, дают новую жизнь — таковы и перемены."],
  "hallgr-mskirkja": ["Bazalt ustunlari kabi tik tur — tabiatdan ilhom ol.", "Stand tall like basalt columns — take your inspiration from nature.", "Стой прямо, как базальтовые столбы — черпай вдохновение у природы."],
  "ingvellir": ["Ikki qit’a plitasi orasida yurib bilasan: bo‘linish ham yangi yo‘l ochadi.", "Walking between two continental plates you learn: a rift can open a new path.", "Идя между двумя плитами, понимаешь: разлом тоже открывает новый путь."],
  // ---------------------------------------------------------------- New York
  "statue-of-liberty": ["Mash’alani baland ko‘tar — kimgadir yo‘l yoritayotgan bo‘lishing mumkin.", "Hold your torch high — you may be lighting someone’s way.", "Держи факел высоко — может быть, ты освещаешь кому‑то путь."],
  "central-park": ["Shoshqin shahar o‘rtasida bog‘ bor — qalbingda ham tinch burchak saqla.", "In the middle of the rushing city there is a park — keep a quiet corner in your heart.", "Посреди бегущего города есть парк — храни тихий уголок и в сердце."],
  "times-square": ["Ming reklama ichida ham eng yorqini — sening orzuing bo‘lsin.", "Among a thousand billboards, let the brightest one be your dream.", "Среди тысячи экранов пусть самым ярким будет твоя мечта."],
  "brooklyn-bridge": ["Ikki qirg‘oqni bog‘lagan ko‘prik kabi — biz ham bir-birimizga yo‘l bo‘laylik.", "Like the bridge joining two shores — let us be a road for each other.", "Как мост, соединивший два берега, — станем дорогой друг для друга."],
  "empire-state-building": ["Bir yil ichida qurilgan osmono‘par: katta maqsad, aniq reja, har kuni harakat.", "A skyscraper built in about a year: a big goal, a clear plan, action every day.", "Небоскрёб, построенный примерно за год: большая цель, ясный план, действие каждый день."],
  // ---------------------------------------------------------------- Petra
  "al-khazneh": ["Tor darani o‘tgach, xazina ochiladi — eng yaxshi narsalar sabr ortida.", "After the narrow gorge the Treasury appears — the best things wait beyond patience.", "За узким ущельем открывается Сокровищница — лучшее ждёт за терпением."],
  "ad-deir": ["Sakkiz yuz zina — cho‘qqidagi manzara har bir qadamga arziydi.", "Eight hundred steps — the view at the top is worth every one.", "Восемьсот ступеней — вид на вершине стоит каждой из них."],
  "wadi-rum": ["Qizil sahro va million yulduz: yo‘qotgan narsangni bu yerda emas, ichingda top.", "Red sand and a million stars: what you lost, look for it within, not out here.", "Красный песок и миллион звёзд: потерянное ищи не здесь, а внутри."],
  // ---------------------------------------------------------------- Beijing
  "forbidden-city": ["Minglab xona bor, lekin uy — seni kutayotgan bitta odam bor joy.", "Nine thousand rooms, yet home is wherever one person is waiting for you.", "Тысячи комнат, но дом — там, где тебя ждёт один человек."],
  "mutianyu": ["Buyuk devor ham bir-bir qo‘yilgan g‘ishtdan — kichik odatlar buyuk natija beradi.", "Even the Great Wall is brick upon brick — small habits make great results.", "И Великая стена — кирпич за кирпичом: маленькие привычки дают великий результат."],
  "temple-of-heaven": ["Osmon va yer uyg‘unligi — muvozanat baxtning siri.", "Harmony of heaven and earth — balance is the secret of happiness.", "Гармония неба и земли — равновесие и есть секрет счастья."],
  "summer-palace": ["Ko‘l bo‘yidagi uzun yo‘lak: hayot ham shoshilmasdan bosiladigan yo‘l.", "The long corridor by the lake: life is a path to walk unhurried.", "Длинная галерея у озера: жизнь — путь, который проходят не спеша."],
  // ---------------------------------------------------------------- Moscow
  "red-square": ["Maydon qanchalik katta bo‘lmasin, sen uchun eng muhim joy — uning yonidagi bir qadam.", "However vast the square, the place that matters is the step beside them.", "Какой бы огромной ни была площадь, главное место — шаг рядом с ним."],
  "saint-basil-s-cathedral": ["Har gumbaz boshqa rangda, lekin hammasi bitta binoda — farqlarimiz ham bizni bezaydi.", "Every dome a different colour, yet one building — our differences make us beautiful too.", "Каждый купол своего цвета, но здание одно — наши различия тоже нас украшают."],
  "moscow-kremlin": ["Mustahkam devorlar toshdan emas, ishonchdan quriladi.", "The strongest walls are built of trust, not stone.", "Самые крепкие стены строят из доверия, а не из камня."],
  "bolshoi-theatre": ["Sahnadagi har bir yengil sakrash ortida yillar mehnati turadi — sevgi ham shunday.", "Behind every effortless leap on stage stand years of work — love is the same.", "За каждым лёгким прыжком на сцене — годы труда. С любовью так же."],
  // ---------------------------------------------------------------- Seoul
  "gyeongbokgung": ["Saroy darvozalari ochiladi, chunki kimdir kutadi — yuragingni ham shunday och.", "Palace gates open because someone is expected — open your heart the same way.", "Ворота дворца открываются, потому что кого-то ждут, — открой и сердце."],
  "bukchon-hanok-village": ["Eski tom ostida yangi baxt — an’anani asrab, kelajakni quramiz.", "New happiness under old roofs — keep the roots, build the future.", "Новое счастье под старыми крышами — бережём корни, строим будущее."],
  "n-seoul-tower": ["Bu yerga qulf osishadi, lekin eng ishonchli qulf — har kungi va’daga sodiqlik.", "People hang love locks here, but the surest lock is keeping a promise every day.", "Здесь вешают замки любви, но самый надёжный замок — каждый день держать слово."],
  "changdeokgung": ["Maxfiy bog‘ shoshilganlarga ochilmaydi — chiroyli narsalar sabrni yaxshi ko‘radi.", "The Secret Garden never opens to the hurried — beautiful things love patience.", "Тайный сад не открывается торопливым — красота любит терпение."],
  "myeong-dong": ["Shovqinli ko‘chada ham bir-biringizni eshitsangiz — bu sevgi.", "If you can hear each other on the loudest street, that is love.", "Если вы слышите друг друга на самой шумной улице — это любовь."],
  // ---------------------------------------------------------------- Kuala Lumpur
  "petronas-towers": ["Ikki minora alohida turadi, lekin ko‘prik ularni bitta qiladi — bir-biringizga ko‘prik bo‘ling.", "Two towers stand apart, yet a bridge makes them one — be each other’s bridge.", "Две башни стоят порознь, но мост делает их одним — будьте мостом друг для друга."],
  "batu-caves": ["272 pog‘ona — har biri kichik g‘alaba. Cho‘qqi sabrlilarni kutadi.", "272 steps, each a small victory — the top waits for the patient.", "272 ступени, и каждая — маленькая победа. Вершина ждёт терпеливых."],
  "merdeka-square-kuala-lumpur": ["Mustaqillik — o‘z yo‘lingni tanlash; baxt — uni kim bilan yurishni tanlash.", "Independence is choosing your road; happiness is choosing who walks it with you.", "Независимость — выбрать свой путь; счастье — выбрать, с кем его пройти."],
  // ---------------------------------------------------------------- Islamabad
  "faisal-mosque": ["Sukunat ham ibodatdir — shukr qilgan yurak doim to‘q.", "Silence too is devotion — a grateful heart is always full.", "Тишина — тоже молитва; благодарное сердце всегда полно."],
  "pakistan-monument": ["Gul barglari bir markazga qaraydi — oila ham bitta maqsad atrofida gullaydi.", "The petals all face one centre — a family blossoms around one purpose.", "Лепестки смотрят в один центр — семья расцветает вокруг одной цели."],
  "daman-e-koh": ["Tepalikdan butun shahar ko‘rinadi — kelajakni ham birga, balanddan rejalashtiring.", "From the hill you see the whole city — plan your future together, from up high.", "С холма виден весь город — планируйте будущее вместе, с высоты."],
  "lok-virsa-museum": ["Bobolarimiz qo‘lidan chiqqan naqshlar — biz ham avlodlarga go‘zal iz qoldiraylik.", "Patterns made by our ancestors — let us leave beautiful traces too.", "Узоры рук наших предков — оставим и мы красивый след."],
  // ---------------------------------------------------------------- Rio
  "christ-the-redeemer-statue": ["Ochiq qo‘llar — eng katta jasorat: kechirish va qabul qilish.", "Open arms are the bravest gesture: to forgive and to welcome.", "Раскрытые объятия — самая смелая поза: простить и принять."],
  "sugarloaf-mountain": ["Kanat yo‘li tebranadi, lekin qo‘l ushlab tursang qo‘rqinch ham manzaraga aylanadi.", "The cable car sways, but holding hands turns fear into a view.", "Канатка качается, но, держась за руки, страх превращается в вид."],
  "copacabana-rio-de-janeiro": ["To‘lqinlar izlarni o‘chiradi — shuning uchun har kuni yangidan birga yuraylik.", "Waves wash footprints away — so let’s walk together anew each day.", "Волны смывают следы — поэтому будем идти вместе каждый день заново."],
  "escadaria-selar-n": ["Har plitka boshqa mamlakatdan — turli qismlardan ham go‘zal butunlik chiqadi.", "Each tile from another country — different pieces make one beautiful whole.", "Каждая плитка из другой страны — из разных частей выходит прекрасное целое."],
  "tijuca-forest": ["Bu o‘rmon qo‘lda qayta ekilgan — buzilgan narsani ham sabr bilan qayta o‘stirsa bo‘ladi.", "This forest was replanted by hand — what was lost can grow again with patience.", "Этот лес посадили заново вручную — утраченное можно вырастить снова, терпением."],
  // ---------------------------------------------------------------- Buenos Aires
  "la-boca": ["Uylar eski bo‘yoq qoldiqlaridan bo‘yalgan — baxt ham bor narsadan yaratiladi.", "These houses were painted with leftover paint — happiness is made from what you have.", "Дома красили остатками краски — счастье делают из того, что есть."],
  "teatro-col-n": ["Eng yaxshi akustika — ikki yurak bir ohangda urganda.", "The finest acoustics: two hearts beating in one key.", "Лучшая акустика — когда два сердца бьются в одной тональности."],
  "obelisco-de-buenos-aires": ["Keng ko‘chalar o‘rtasida tik turgan belgi kabi — qadriyatlaringda tik tur.", "Like the obelisk in the widest avenue — stand tall in your values.", "Как обелиск посреди широкого проспекта — стой прямо в своих ценностях."],
  "recoleta-cemetery": ["Marmar abadiy emas — abadiy bo‘lgani qilingan yaxshilik.", "Marble isn’t eternal; kindness is.", "Мрамор не вечен — вечна сделанная доброта."],
  "plaza-de-mayo": ["Katta o‘zgarishlar maydonda emas, qarorda boshlanadi.", "Great changes begin in a decision before they reach the square.", "Большие перемены начинаются с решения, а не с площади."],
  // ---------------------------------------------------------------- Peru
  "machu-picchu": ["Bulutlar orasidagi shahar isbot qiladi: imkonsiz joyda ham uy qurish mumkin.", "A city among the clouds proves you can build a home in impossible places.", "Город среди облаков доказывает: дом можно построить даже там, где невозможно."],
  "huayna-picchu": ["Tik zinapoyada ko‘zingni oyog‘ingga tik — katta maqsad kichik qadamlarga bo‘lingan.", "On steep stairs, watch your next step — big goals are made of small ones.", "На крутых ступенях смотри под ноги — большая цель состоит из малых шагов."],
  "cusco": ["Inklar poytaxti tosh ustiga tosh qo‘yib qurilgan — munosabat ham shunday.", "The Inca capital was built stone on stone — so is a relationship.", "Столицу инков строили камень к камню — так строятся и отношения."],
  "sacsayhuam-n": ["Toshlar orasiga pichoq ham sig‘maydi — ishonch shunchalik zich bo‘lsin.", "Not even a blade fits between these stones — let your trust be that close.", "Между этими камнями не пройдёт и лезвие — пусть доверие будет таким же."],
  "rainbow-mountain-peru": ["Kamalak tog‘i eslatadi: hayotning har qatlami o‘z rangiga ega.", "Rainbow Mountain reminds us: every layer of life has its own colour.", "Радужная гора напоминает: у каждого слоя жизни свой цвет."],
  // ---------------------------------------------------------------- Maya Yucatán
  "chichen-itza": ["Bahor va kuz tengkunligida piramidada ilon soyasi tushadi — hamma narsaning o‘z vaqti bor.", "At the equinox a serpent of shadow descends the pyramid — everything has its time.", "В равноденствие по пирамиде спускается змей из тени — всему своё время."],
  "tulum": ["Qoya ustidagi shahar dengizni kuzatadi — sen ham ufqqa qarashdan to‘xtama.", "A city on the cliff, watching the sea — never stop looking at the horizon.", "Город на скале смотрит в море — не переставай смотреть на горизонт."],
  "uxmal": ["Toshdagi nozik naqsh — kuchlilik va nafislik birga yashay oladi.", "Fine lace carved in stone — strength and gentleness can live together.", "Тонкое кружево в камне — сила и нежность живут вместе."],
  "cenote-ik-kil": ["Chuqurlikdagi tiniq suv: eng go‘zal narsalar yuzada emas.", "Clear water deep below — the most beautiful things are never on the surface.", "Чистая вода в глубине — самое красивое никогда не на поверхности."],
  // ---------------------------------------------------------------- Everest
  "mount-everest": ["Cho‘qqiga chiqqan odam yolg‘iz chiqmaydi — orqasida uni ishongan kimdir bor.", "No one reaches the summit alone — someone who believed in them is always there.", "Никто не поднимается на вершину один — за ним всегда тот, кто в него верил."],
  "everest-base-camp": ["Tayanch lager — orzu va harakat orasidagi joy. Shoshilma, moslash, keyin yur.", "Base camp is where dreams meet effort — don’t rush, adapt, then climb.", "Базовый лагерь — между мечтой и усилием: не спеши, привыкни, потом иди."],
  "tengboche-monastery": ["Yupqa havoda nafas ham ibodatday sekin — har nafasning qadrini bil.", "In thin air every breath is slow as a prayer — treasure each one.", "В разреженном воздухе каждый вдох медленный, как молитва, — цени его."],
  "namche-bazaar": ["Yo‘lning o‘rtasida dam olish — taslim bo‘lish emas, kuch yig‘ish.", "Resting halfway is not giving up; it is gathering strength.", "Отдых на полпути — не сдача, а сбор сил."],
  "kathmandu-durbar-square": ["Zilziladan keyin ham ibodatxonalar qayta tiklanadi — biz ham.", "Even after earthquakes, the temples rise again — and so do we.", "Даже после землетрясений храмы поднимаются вновь — и мы тоже."],
  // ---------------------------------------------------------------- San Francisco
  "golden-gate-bridge": ["Tuman qalin bo‘lsa ham ko‘prik bor — bir-biringizga ishoning va o‘ting.", "Even in thick fog the bridge is there — trust each other and cross.", "Даже в густом тумане мост на месте — доверьтесь друг другу и идите."],
  "alcatraz-island": ["Eng qattiq qamoq — qalbdagi kechirilmagan gina. Kechir va ozod bo‘l.", "The hardest prison is an unforgiven grudge — forgive and be free.", "Самая крепкая тюрьма — непрощённая обида. Прости и будь свободен."],
  "lombard-street-san-francisco": ["Yo‘l egri bo‘lsa ham manzilga olib boradi — va yo‘l bo‘yi gullar bor.", "A winding road still gets you there — and it has flowers along the way.", "Извилистая дорога всё равно приведёт — и по пути цветы."],
  "painted-ladies": ["Har uy o‘z rangida, lekin bitta qatorda — har kim o‘zi bo‘lib qolsin, yonma-yon.", "Each house in its own colour, side by side — stay yourselves, together.", "Каждый дом своего цвета, но в одном ряду — оставайтесь собой, рядом."],
  "fisherman-s-wharf-san-francisco": ["Dengiz sherlari quyoshda shoshilmaydi — siz ham bugun shoshilmang.", "The sea lions never hurry in the sun — don’t you hurry today either.", "Морские львы не спешат на солнце — и вы сегодня не спешите."],
  // ---------------------------------------------------------------- Los Angeles
  "hollywood-sign": ["Harflar bir paytlar reklama edi, endi orzu ramzi — boshlanishing kichik bo‘lsa ham, oxiri buyuk bo‘lishi mumkin.", "Those letters began as an advert and became a symbol of dreams — small starts can end big.", "Буквы были рекламой, а стали символом мечты — скромное начало может стать великим."],
  "griffith-observatory": ["Yulduzlarga qarab o‘zimizni kichik his qilamiz, lekin bir-birimizga qarab — cheksiz.", "Looking at the stars we feel small; looking at each other, infinite.", "Глядя на звёзды, мы чувствуем себя маленькими; глядя друг на друга — бесконечными."],
  "santa-monica-pier": ["Yo‘lning oxiri — okean. Har tugash yangi ufqni ochadi.", "The end of the road is an ocean — every ending opens a new horizon.", "Конец дороги — океан. Каждый финал открывает новый горизонт."],
  "hollywood-walk-of-fame": ["Eng yorqin yulduz — trotuarda emas, uyda seni kutayotgan inson.", "The brightest star isn’t on the pavement — it’s the person waiting for you at home.", "Самая яркая звезда — не на тротуаре, а тот, кто ждёт тебя дома."],
  "getty-center": ["San’at sekin qarashni o‘rgatadi — sevgi ham sekin qarashni yaxshi ko‘radi.", "Art teaches us to look slowly — and love likes to be looked at slowly too.", "Искусство учит смотреть медленно — и любовь любит неспешный взгляд."],
  // ---------------------------------------------------------------- Alaska
  "denali": ["Buyuk tog‘ ko‘pincha bulut ortida — sabr qilganlarga o‘zini ko‘rsatadi.", "The great mountain hides in clouds and shows itself to the patient.", "Великая гора прячется в облаках и открывается терпеливым."],
  "mendenhall-glacier": ["Muz ham asta-sekin harakatlanadi — kichik o‘zgarish ham oldinga qadam.", "Even ice moves, slowly — a small change is still a step forward.", "Даже лёд движется, медленно, — маленькая перемена — тоже шаг вперёд."],
  "kenai-fjords-national-park": ["Kit nafas olish uchun yuzaga chiqadi — siz ham qiyin kunda bir-biringizga nafas bo‘ling.", "A whale rises to breathe — on hard days, be each other’s breath.", "Кит поднимается, чтобы вдохнуть, — в трудный день будьте дыханием друг друга."],
  "glacier-bay-national-park-and-preserve": ["Muzlik chekinsa, ortida yangi o‘rmon o‘sadi — har ketish yangi hayotga joy beradi.", "Where the glacier retreats, a forest grows — every leaving makes room for life.", "Где отступает ледник, растёт лес — каждый уход даёт место жизни."],
  // ---------------------------------------------------------------- Haiti
  "citadelle-laferri-re": ["Ozodlik bir marta yutib olinadi, lekin har kuni himoya qilinadi — sevgi ham.", "Freedom is won once and defended every day — so is love.", "Свободу завоёвывают однажды, а защищают каждый день — как и любовь."],
  "sans-souci-palace": ["“San-susi” — “tashvishsiz” degani. Tashvishsiz kun ham birga yaratiladi.", "Sans-Souci means ‘without worry’ — and worry-free days are made together.", "«Сан-Суси» значит «без забот» — беззаботные дни создают вместе."],
  "labadee": ["Feruza suv va oq qum — ba’zan baxt shunchaki birga jim o‘tirish.", "Turquoise water and white sand — sometimes happiness is just sitting quietly together.", "Бирюзовая вода и белый песок — иногда счастье — просто молчать вдвоём."],
  "bassin-bleu": ["Uchta ko‘l pog‘onama-pog‘ona — har yangi bosqich yanada tiniqroq bo‘lsin.", "Three pools, step by step — may each new stage be clearer than the last.", "Три озера ступенями — пусть каждый новый этап будет прозрачнее прежнего."],
  // ---------------------------------------------------------------- Jakarta
  "national-monument-indonesia": ["Oltin alanga hech qachon o‘chmaydi — orzuning olovi ham shunday bo‘lsin.", "The golden flame never goes out — keep the fire of your dream the same.", "Золотое пламя никогда не гаснет — пусть и огонь мечты не гаснет."],
  "istiqlal-mosque-jakarta": ["Istiqlol — qalb erkinligi; u shukr va sabrdan boshlanadi.", "True independence is freedom of the heart; it begins with gratitude and patience.", "Истинная независимость — свобода сердца; она начинается с благодарности и терпения."],
  "jakarta-old-town": ["Eski maydon yangi hikoyalarni kutadi — o‘tmishingiz kelajakka to‘siq emas.", "The old square waits for new stories — your past is no wall for your future.", "Старая площадь ждёт новых историй — прошлое не стена для будущего."],
  "thousand-islands-indonesia": ["Ming orol — ming imkoniyat. Bittasini birga tanlang.", "A thousand islands, a thousand chances — choose one together.", "Тысяча островов — тысяча шансов. Выберите один вместе."],
  // ---------------------------------------------------------------- Bali
  "tanah-lot": ["To‘lqin qoyaga urilaveradi, ibodatxona esa turaveradi — sobitlik go‘zallik.", "Waves keep striking the rock, and the temple keeps standing — steadiness is beauty.", "Волны бьют о скалу, а храм стоит — постоянство прекрасно."],
  "uluwatu-temple": ["Qoya chetida quyosh botadi — eng go‘zal lahzalar ko‘pincha chegarada.", "The sun sets at the cliff’s edge — the finest moments often live at the edge.", "Солнце садится на краю скалы — лучшие мгновения часто на краю."],
  "ubud-monkey-forest": ["Maymunlar o‘ynaydi va g‘am chekmaydi — bugun ozgina bolalik qiling.", "The monkeys play without worry — be a little childlike today.", "Обезьяны играют без забот — побудьте сегодня немного детьми."],
  // ---------------------------------------------------------------- Sydney
  "sydney-opera-house": ["Bino yelkanga o‘xshaydi — orzularingizni ham shamolga qarshi emas, shamol bilan suzdiring.", "The building looks like sails — let your dreams sail with the wind, not against it.", "Здание похоже на паруса — пусть мечты идут по ветру, а не против."],
  "sydney-harbour-bridge": ["Po‘lat arka og‘irlikni ikki tomonga bo‘ladi — yukni ham birga ko‘taring.", "The steel arch shares the weight between two shores — carry burdens together.", "Стальная арка делит вес между двумя берегами — несите ношу вместе."],
  "bondi-beach": ["To‘lqinni to‘xtata olmaysan, lekin uni minishni o‘rgansa bo‘ladi.", "You can’t stop the waves, but you can learn to ride them.", "Волну не остановить, но можно научиться на ней кататься."],
  "royal-botanic-garden-sydney": ["Bog‘ ikki yuz yildan beri parvarishlanadi — go‘zallik g‘amxo‘rlikning mevasi.", "This garden has been tended for two centuries — beauty is the fruit of care.", "Этот сад ухожен двести лет — красота — плод заботы."],
  "blue-mountains-new-south-wales": ["Tog‘lar uzoqdan ko‘k ko‘rinadi — ba’zi narsalarning go‘zalligi masofada ko‘rinadi.", "The mountains look blue from afar — some beauty is only seen with distance.", "Издали горы кажутся синими — иная красота видна лишь на расстоянии."],
  // ---------------------------------------------------------------- Canberra
  "parliament-house-canberra": ["Bino tepalik ichiga qurilgan, tomida esa odamlar yuradi — kuch kamtarlikda.", "Built into the hill, with people walking on its roof — strength lives in humility.", "Здание встроено в холм, по его крыше ходят люди, — сила в скромности."],
  "lake-burley-griffin": ["Me’mor shaharni chizgan, ko‘l esa uni aks ettiradi — rejangiz ham yuragingizni aks ettirsin.", "An architect drew the city and the lake reflects it — let your plans reflect your heart.", "Архитектор начертил город, а озеро его отражает, — пусть планы отражают сердце."],
  "australian-war-memorial": ["Tinchlik qimmat turadi — uni qadrlash har kungi burch.", "Peace was paid for dearly — cherishing it is an everyday duty.", "Мир дорого оплачен — беречь его — ежедневный долг."],
  "national-gallery-of-australia": ["Qadimiy san’at eslatadi: hikoyalar avloddan avlodga o‘tadi — o‘zingiznikini yozing.", "Ancient art reminds us stories pass between generations — write your own.", "Древнее искусство напоминает: истории передаются поколениям — напишите свою."],
  // ---------------------------------------------------------------- Melbourne
  "flinders-street-railway-station": ["“Soatlar ostida uchrashamiz” — eng yaxshi va’dalar oddiy bo‘ladi.", "“Meet me under the clocks” — the best promises are simple ones.", "«Встретимся под часами» — лучшие обещания самые простые."],
  "royal-exhibition-building": ["Bu yerda dunyo ko‘rgazmaga yig‘ilgan — siz esa bir-biringizning eng yaxshi tomoningizni ko‘rsating.", "The world once gathered here to exhibit — show each other your very best.", "Здесь собирался весь мир на выставку — показывайте друг другу лучшее в себе."],
  "twelve-apostles-victoria": ["To‘lqinlar qoyani sekin shakllantiradi — kundalik mehribonlik ham xarakterni.", "The sea shapes these rocks slowly — daily kindness shapes character the same way.", "Море медленно точит скалы — ежедневная доброта так же формирует характер."],
  "st-kilda-victoria": ["Kechqurun kichkina pingvinlar uyga qaytadi — eng yaxshi sayohat ham uyga qaytish bilan tugaydi.", "At dusk the little penguins come home — the best journeys end with coming home.", "В сумерках маленькие пингвины возвращаются домой — лучшие путешествия кончаются возвращением."],
  // ---------------------------------------------------------------- Cape Town
  "table-mountain": ["Bulut tog‘ni qoplasa, “dasturxon yozildi” deyishadi — har qiyinchilikda mehmondo‘stlik toping.", "When cloud covers it, they say the table is laid — find welcome in every difficulty.", "Когда гору накрывает облако, говорят «стол накрыт» — ищите радушие в любой трудности."],
  "cape-of-good-hope": ["Bo‘ronli burun “Yaxshi umid” deb nomlangan — umidni eng qiyin joyda saqla.", "A stormy cape was named Good Hope — keep hope where it is hardest.", "Штормовой мыс назвали мысом Доброй Надежды — храните надежду там, где труднее всего."],
  "boulders-beach": ["Pingvinlar umrbod juft tanlaydi — sodiqlik ham tabiatning bir qismi.", "African penguins often stay with one partner for years — loyalty is part of nature.", "Африканские пингвины годами хранят верность паре — верность — часть природы."],
  "bo-kaap": ["Rang-barang uylar yonma-yon — turli tarixlar bir ko‘chada go‘zal yashaydi.", "Colourful houses side by side — different histories live beautifully on one street.", "Разноцветные дома бок о бок — разные истории красиво уживаются на одной улице."],
  "robben-island": ["27 yil qamoqdan keyin ham kechirgan odam bor edi — kechirimlilik eng buyuk kuch.", "One man forgave after 27 years in prison — forgiveness is the greatest strength.", "Один человек простил после 27 лет заключения — прощение — величайшая сила."],
  // ---------------------------------------------------------------- Marrakesh
  "jemaa-el-fnaa": ["Kechqurun maydon taomga va hikoyaga to‘ladi — eng yaxshi kechki ovqat suhbat bilan.", "At night the square fills with food and stories — the best dinner comes with conversation.", "Вечером площадь полна еды и историй — лучший ужин — с разговором."],
  "koutoubia-mosque": ["Minora yo‘l ko‘rsatadi — hayotda ham o‘z yo‘l chirog‘ingiz bo‘lsin.", "The minaret guides the way — keep your own guiding light in life.", "Минарет указывает путь — пусть и в жизни у вас будет свой ориентир."],
  "jardin-majorelle": ["Bitta rang butun bog‘ni o‘zgartirdi — kichik tafsilot katta baxt yaratadi.", "One colour transformed a whole garden — small details create great happiness.", "Один цвет преобразил весь сад — мелочи создают большое счастье."],
  "bahia-palace": ["“Bahiya” — “go‘zal” degani. Go‘zallik g‘isht va naqshda emas, unga qo‘shilgan mehrda.", "Bahia means ‘the beautiful’ — beauty lives in the love put into the details.", "«Бахия» значит «прекрасная» — красота в любви, вложенной в детали."],
  "ben-youssef-madrasa": ["Ilm hovlisida sukunat — o‘rganishdan to‘xtamagan juftlik birga o‘sadi.", "Silence in a courtyard of learning — couples who keep learning keep growing together.", "Тишина двора знаний — пара, что учится, растёт вместе."],
  // ---------------------------------------------------------------- Kenya
  "maasai-mara": ["Millionlab hayvon birga daryodan o‘tadi — qiyin kechuvni ham birga kechamiz.", "Millions cross the river together — we cross our hardest rivers together too.", "Миллионы животных переходят реку вместе — и мы вместе переходим самые трудные реки."],
  "amboseli-national-park": ["Fillar hech qachon o‘z podasini unutmaydi — yaqinlaringizni ham unutmang.", "Elephants never forget their herd — never forget your people.", "Слоны никогда не забывают своё стадо — не забывайте и вы своих."],
  "nairobi-national-park": ["Shahar va savanna yonma-yon — ish va sevgi ham birga yashay oladi.", "City and savanna side by side — work and love can share one life.", "Город и саванна рядом — работа и любовь могут жить в одной жизни."],
  "lake-nakuru": ["Flamingolar to‘da bo‘lib raqs tushadi — quvonch bo‘lishilganda ko‘payadi.", "Flamingos dance in flocks — joy multiplies when it is shared.", "Фламинго танцуют стаей — радость множится, когда ею делятся."],
  // ---------------------------------------------------------------- Singapore
  "marina-bay-sands": ["Osmon ostidagi hovuz eslatadi: chegaralar ko‘pincha faqat xayolimizda.", "A pool on the sky reminds us that limits are often only in our minds.", "Бассейн в небе напоминает: границы часто только в голове."],
  "gardens-by-the-bay": ["Temirdan yasalgan daraxtlar ham gullaydi — sevgi har qanday muhitda o‘sadi.", "Even trees of steel bloom here — love can grow anywhere.", "Здесь цветут даже стальные деревья — любовь растёт где угодно."],
  "merlion": ["Yarmi sher, yarmi baliq — kuch va moslashuvchanlik birga bo‘lsin.", "Half lion, half fish — be both strong and adaptable.", "Наполовину лев, наполовину рыба — будьте и сильными, и гибкими."],
  "jewel-changi-airport": ["Aeroport ichida sharshara — hatto kutish ham chiroyli bo‘lishi mumkin.", "A waterfall inside an airport — even waiting can be beautiful.", "Водопад в аэропорту — даже ожидание может быть красивым."],
  // ---------------------------------------------------------------- Bangkok
  "grand-palace": ["Oltin tomlar quyoshda yonadi — kichik yaxshilik ham dunyoni shunday yoritadi.", "Golden roofs blaze in the sun — small kindnesses light up the world the same way.", "Золотые крыши горят на солнце — маленькая доброта так же освещает мир."],
  "wat-arun": ["Tong ibodatxonasi singan chinni bo‘laklari bilan bezatilgan — singan narsadan ham go‘zallik yasaladi.", "The Temple of Dawn is adorned with broken porcelain — beauty can be made from broken things.", "Храм Рассвета украшен осколками фарфора — красоту можно сделать из разбитого."],
  "wat-pho": ["Yotgan Budda tinchlikni o‘rgatadi: dam olish ham hayot san’ati.", "The reclining Buddha teaches calm — rest is an art of living too.", "Лежащий Будда учит покою — отдых — тоже искусство жить."],
  "damnoen-saduak-floating-market": ["Qayiqlar bir-biriga to‘qnashmasdan o‘tadi — munosabatda ham bir-biringizga yo‘l bering.", "Boats pass without colliding — in love, too, make room for each other.", "Лодки проходят, не сталкиваясь, — и в любви уступайте друг другу дорогу."],
  "chao-phraya-river": ["Daryo shaharni ikki qismga bo‘ladi, ko‘priklar esa birlashtiradi — ko‘prik quruvchi bo‘ling.", "The river divides the city; bridges unite it — be a builder of bridges.", "Река делит город, мосты соединяют — будьте строителями мостов."],
  // ---------------------------------------------------------------- Agra
  "taj-mahal": ["Sevgi marmarga aylandi — lekin eng go‘zal yodgorlik bu bugun bir-biringizga ko‘rsatgan e’tibor.", "Love turned into marble — yet the finest monument is the care you show each other today.", "Любовь превратилась в мрамор — но лучший памятник — внимание, которое вы дарите друг другу сегодня."],
  "agra-fort": ["Qal’adan Tojga qarab o‘tgan yillar o‘rgatadi: yaqinlaringizni borida qadrlang.", "Years spent gazing at the Taj from this fort teach us: cherish your loved ones while they are near.", "Годы взгляда на Тадж из этой крепости учат: цените близких, пока они рядом."],
  "fatehpur-sikri": ["“G‘alaba shahri” — eng katta g‘alaba o‘z sabrsizligingni yengish.", "The ‘City of Victory’ — the greatest victory is over your own impatience.", "«Город победы» — величайшая победа — над собственным нетерпением."],
  "mehtab-bagh": ["Oy nurida Toj suvda aks etadi — yaxshi niyat ham o‘z aksini topadi.", "By moonlight the Taj appears in the water — good intentions always find their reflection.", "В лунном свете Тадж отражается в воде — добрые намерения всегда находят отклик."],
  // ---------------------------------------------------------------- added places
  "ihlara-valley": ["Daryo toshni ming yillar o‘ydi — sabr eng kuchli asbob.", "A river carved this stone for millennia — patience is the strongest tool.", "Река тысячелетиями точила камень — терпение — самый сильный инструмент."],
  "mal-friday-mosque": ["Marjondan qurilgan masjid eslatadi: dengiz bergan narsani shukr bilan ishlat.", "A mosque built of coral reminds us to use the sea’s gifts with gratitude.", "Мечеть из коралла напоминает: дары моря нужно принимать с благодарностью."],
  "nea-kameni": ["Yangi orol olovdan tug‘ilgan — eng kuchli boshlanishlar ham shunday.", "A new island was born of fire — so are the strongest beginnings.", "Новый остров родился из огня — так рождаются и самые сильные начала."],
  "siq": ["Tor yo‘l oxirida eng keng manzara ochiladi.", "At the end of the narrowest path the widest view opens.", "В конце самой узкой тропы открывается самый широкий вид."],
  "great-temple-petra": ["Xarobalar ham ulug‘ — chunki ular bir paytlar orzu bo‘lgan.", "Even ruins are grand — they were once someone’s dream.", "Даже руины величественны — когда-то они были чьей-то мечтой."],
  "cathedral-of-christ-the-saviour": ["Buzilgan narsani qayta qurish — eng chiroyli jasorat.", "Rebuilding what was destroyed is the most beautiful courage.", "Отстроить разрушенное — самое прекрасное мужество."],
  "gorky-park-moscow": ["Bog‘dagi oddiy sayr ham bayramga aylanadi, agar yoningda to‘g‘ri inson bo‘lsa.", "A simple walk in the park becomes a celebration with the right person.", "Простая прогулка по парку становится праздником, если рядом нужный человек."],
  "thean-hou-temple": ["Qizil fonarlar yo‘l ko‘rsatadi — sen ham kimgadir yorug‘lik bo‘l.", "Red lanterns light the way — be someone’s light too.", "Красные фонари освещают путь — будь и ты для кого-то светом."],
  "sultan-abdul-samad-building": ["Soat minorasi eslatadi: vaqt eng qimmat sovg‘a, uni birga o‘tkaz.", "The clock tower reminds us that time is the dearest gift — spend it together.", "Часовая башня напоминает: время — самый дорогой подарок, проводи его вместе."],
  "rawal-lake": ["Sokin ko‘l osmonni aks ettiradi — sokin yurak esa baxtni.", "A calm lake reflects the sky; a calm heart reflects happiness.", "Спокойное озеро отражает небо, спокойное сердце — счастье."],
  "margalla-hills-national-park": ["Tepalikka chiqqan sari shahar shovqini pasayadi, yurak ovozi esa ko‘tariladi.", "The higher you climb, the quieter the city and the louder the heart.", "Чем выше поднимаешься, тем тише город и громче сердце."],
  "cob": ["O‘rmon ichidagi piramida: buyuk narsalar ba’zan yashirin turadi.", "A pyramid hidden in the jungle — great things are sometimes hidden.", "Пирамида в джунглях — великое иногда скрыто."],
  "matanuska-glacier": ["Muz ustida ehtiyotkor qadam — munosabatda ham shunday.", "Careful steps on the ice — and in love too.", "Осторожные шаги по льду — и в любви тоже."],
  "taman-mini-indonesia-indah": ["Butun mamlakat bitta bog‘da — farqli narsalar ham bir joyda go‘zal.", "A whole country in one garden — different things are beautiful together.", "Целая страна в одном саду — разное прекрасно вместе."],
  "mount-batur": ["Tong otmasdan yo‘lga chiqqanlar quyoshni birinchi bo‘lib kutib oladi.", "Those who set out before dawn are the first to greet the sun.", "Кто выходит до рассвета, первым встречает солнце."],
  "tirta-empul": ["Buloq suvi kabi toza niyat — har kuni yangidan boshlash imkoniyati.", "An intention as clear as spring water is a chance to start anew each day.", "Намерение, чистое, как родник, — шанс каждый день начинать заново."],
  "tiananmen-square": ["Katta maydonda ham eng muhim joy — qo‘l ushlagan ikki kishi orasidagi masofa.", "Even on the vastest square, the place that matters is between two held hands.", "Даже на огромной площади главное место — между двумя руками, держащими друг друга."],
  "black-mountain-tower": ["Balanddan qarasang, yo‘llar qayerga olib borishini ko‘rasan.", "From up high you see where all the roads lead.", "С высоты видно, куда ведут все дороги."],
  "federation-square": ["Turli shakllar bir maydonda — turli fikrlar bir oilada.", "Different shapes on one square, different minds in one family.", "Разные формы на одной площади — разные мнения в одной семье."],
  "mount-kenya": ["Ekvatorda ham qor bor — imkonsiz deb o‘ylagan narsalar ham bo‘ladi.", "There is snow even on the equator — the impossible happens.", "Снег есть даже на экваторе — невозможное случается."],
  "sentosa": ["Ba’zan baxt — shunchaki shoshilmasdan bir kunni birga o‘tkazish.", "Sometimes happiness is simply spending one unhurried day together.", "Иногда счастье — просто провести вместе один неспешный день."],
  "tomb-of-i-tim-d-ud-daulah": ["Kichik narsa ham buyuk ishga namuna bo‘ladi — “kichik Toj” kabi.", "Small things can inspire great ones — like the ‘Baby Taj’.", "Малое вдохновляет великое — как «Малый Тадж»."],
  "cap-ha-tien": ["Eski shahar ko‘chalari tarixni pichirlaydi — tinglash uchun sekinla.", "Old streets whisper history — slow down to listen.", "Старые улицы шепчут историю — замедлись, чтобы услышать."],
};

// season × part-of-day mood lines (shown under the place line)
const MOOD = {
  spring: {
    day: ["Bahor — qayta boshlash uchun ruxsat.", "Spring is permission to begin again.", "Весна — разрешение начать заново."],
    eve: ["Bahor oqshomi: gullar kabi sekin, lekin aniq ochil.", "Spring evening: open slowly but surely, like the blossoms.", "Весенний вечер: раскрывайся медленно, но верно, как цветы."],
    night: ["Bahor kechasi orzular ham uyg‘onadi.", "On spring nights even dreams wake up.", "Весенней ночью просыпаются даже мечты."],
  },
  summer: {
    day: ["Yoz — jasur bo‘lish fasli.", "Summer is the season to be brave.", "Лето — время быть смелыми."],
    eve: ["Yoz shomida vaqt sekinlashadi — undan bahramand bo‘l.", "Summer dusk slows time down — enjoy it.", "Летний закат замедляет время — наслаждайся."],
    night: ["Yozgi yulduzlar ostida va’dalar abadiydek tuyuladi.", "Under summer stars, promises feel eternal.", "Под летними звёздами обещания кажутся вечными."],
  },
  autumn: {
    day: ["Kuz o‘rgatadi: qo‘yib yuborish ham go‘zal bo‘lishi mumkin.", "Autumn teaches that letting go can be beautiful.", "Осень учит: отпускать тоже бывает красиво."],
    eve: ["Kuz oqshomi — issiq choy va samimiy suhbat vaqti.", "Autumn evening — time for warm tea and honest talk.", "Осенний вечер — время тёплого чая и искреннего разговора."],
    night: ["Kuz kechasi xotiralar oltin rangda.", "On autumn nights memories turn golden.", "Осенней ночью воспоминания становятся золотыми."],
  },
  winter: {
    day: ["Qish sovuq, lekin qo‘llar ushlab turilsa — iliq.", "Winter is cold, but held hands are warm.", "Зима холодна, но держащиеся руки тёплые."],
    eve: ["Qish shomi: eng yorqin chiroq — uyda kutayotgan odam.", "Winter dusk: the brightest light is someone waiting at home.", "Зимние сумерки: самый яркий свет — тот, кто ждёт дома."],
    night: ["Qish kechasi jim — yurak ovozi aniqroq eshitiladi.", "Winter nights are quiet — the heart is heard more clearly.", "Зимняя ночь тиха — сердце слышно отчётливее."],
  },
};
const SACRED_MOOD = ["Sukunat va hurmat bilan.", "In silence and with respect.", "В тишине и с уважением."];

const idx = () => ({ uz: 0, en: 1, ru: 2 })[getLang()] ?? 1;
export const placeLine = (id) => P[id]?.[idx()] || null;
export function moodLine(season, tod, sacred) {
  if (sacred) return SACRED_MOOD[idx()];
  const part = ["evening", "sunset", "golden"].includes(tod) ? "eve" : tod === "night" ? "night" : "day";
  return (MOOD[season] || MOOD.spring)[part][idx()];
}
export const hasPlaceLine = (id) => !!P[id];
