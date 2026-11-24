"""Uzbek names and short descriptions for places whose Uzbek Wikipedia article does not exist yet.

Original WorldLive texts (facts checked against the English Wikipedia articles linked in world.json).
`sync_world` fills a missing uz name / extract from here; the English and Russian Wikipedia
extracts are always kept as they are.
"""

UZ = {
    # Moscow
    "saint-basil-s-cathedral": ("Avliyo Vasiliy sobori", "Qizil maydondagi rang-barang gumbazli sobor 1555–1561-yillarda Ivan IV (Dahshatli) buyrug‘i bilan Qozon xonligi ustidan g‘alaba sharafiga qurilgan. Bugun u Davlat tarix muzeyi tarkibida va YuNESKO Butunjahon merosi ro‘yxatida."),
    # Seoul
    "bukchon-hanok-village": ("Bukchon hanok qishlog‘i", "Kyonbokkun va Changdokkun saroylari orasidagi tepalikda joylashgan, an’anaviy koreys uylari — hanoklar saqlangan mahalla. Chosun davrida bu yerda zodagonlar yashagan."),
    "changdeokgung": ("Changdokkun saroyi", "1405-yilda qurilgan Chosun sulolasi saroyi. Tabiiy landshaftga uyg‘un joylashgani va mashhur “Maxfiy bog‘”i (Huvon) bilan 1997-yildan YuNESKO merosi ro‘yxatida."),
    "myeong-dong": ("Myondon", "Seulning eng gavjum savdo va ko‘cha taomlari mahallasi: kosmetika do‘konlari, neon chiroqlar va kechki bozor."),
    # Kuala Lumpur
    "petronas-towers": ("Petronas egizak minoralari", "Balandligi 452 metr bo‘lgan 88 qavatli egizak minoralar 1998–2004-yillarda dunyodagi eng baland bino bo‘lgan. 41–42-qavatlar oralig‘ida ularni “Skybridge” osma ko‘prigi bog‘laydi."),
    "batu-caves": ("Batu g‘orlari", "Ohaktosh tepalikdagi g‘orlar majmuasi — Malayziyaning eng mashhur hindu ziyoratgohi. Kirish yo‘lida 272 pog‘onali rang-barang zinapoya va 42,7 metrli oltin Murugan haykali bor."),
    "merdeka-square-kuala-lumpur": ("Merdeka maydoni", "1957-yil 31-avgust kuni Malaya mustaqilligi e’lon qilinib, bu yerda birinchi marta milliy bayroq ko‘tarilgan. Maydon atrofida mavritan uslubidagi Sulton Abdul Samad binosi turadi."),
    # Islamabad
    "daman-e-koh": ("Daman-e-Koh", "Margalla tepaliklaridagi ko‘rinish maydoni: bu yerdan butun Islomobod, Faysal masjidi va Ravol ko‘li ko‘rinadi."),
    "lok-virsa-museum": ("Lok Virsa muzeyi", "Pokiston xalq madaniyati muzeyi: milliy liboslar, hunarmandchilik, musiqa asboblari va turli viloyatlarning turmush tarzi namoyish etiladi."),
    # Rio de Janeiro
    "sugarloaf-mountain": ("Qand boshi tog‘i (Pan di Asukar)", "Guanabara ko‘rfazi og‘zidagi 396 metrli granit cho‘qqi. Unga 1912-yildan beri ishlayotgan osma kanat yo‘li orqali chiqiladi; cho‘qqidan Kopakabana va Iso haykali ko‘rinadi."),
    "copacabana-rio-de-janeiro": ("Kopakabana", "Rioning 4 kilometrlik mashhur plyaji va mahallasi. To‘lqinsimon naqshli trotuari va Yangi yil kechasidagi ulkan bayrami bilan tanilgan."),
    "escadaria-selar-n": ("Selaron zinapoyasi", "Chililik rassom Xorxe Selaron 1990-yildan boshlab 60 dan ortiq mamlakatdan yig‘ilgan 2000 dan ziyod plitka bilan bezagan 215 pog‘onali zinapoya."),
    "tijuca-forest": ("Tijuka o‘rmoni", "Dunyodagi eng katta shahar o‘rmonlaridan biri. XIX asrda qahva plantatsiyalari o‘rnida qo‘lda qayta ekilgan; Korkovado tog‘i va Iso haykali shu milliy bog‘ hududida."),
    # Buenos Aires
    "la-boca": ("La-Boka", "Rang-barang uylari bilan mashhur port mahallasi. Kaminito ko‘chasida tango raqqoslari chiqish qiladi; “Boka Juniors” klubining stadioni ham shu yerda."),
    "teatro-col-n": ("Kolon teatri", "1908-yilda ochilgan opera teatri — akustikasi bo‘yicha dunyoning eng yaxshi uchta konsert zali qatoriga kiradi."),
    "obelisco-de-buenos-aires": ("Buenos-Ayres obeliski", "Shahar asos solinganining 400 yilligi munosabati bilan 1936-yilda o‘rnatilgan 67,5 metrli obelisk; dunyodagi eng keng ko‘chalardan biri — 9 de Xulio avenyusida turadi."),
    "recoleta-cemetery": ("Rekoleta qabristoni", "1822-yilda ochilgan memoriy qabriston: marmar maqbaralar ko‘chalari, Eva Peron dafn etilgan joy."),
    "plaza-de-mayo": ("May maydoni", "1810-yil may inqilobi nomi bilan atalgan bosh maydon. Uning atrofida prezident saroyi — Kasa Rosada va Kabildo binosi joylashgan."),
    # Peru
    "huayna-picchu": ("Vayna-Pikchu", "Machu-Pikchu ortida qad ko‘targan cho‘qqi. Inklar unga tik tosh zinapoyalar qurgan; tepasidan butun qadimiy shahar kaftdagidek ko‘rinadi."),
    "sacsayhuam-n": ("Saksayvaman", "Kusko tepasidagi inklar qal’asi. Ba’zilari 100 tonnadan og‘ir toshlar qorishmasiz, shunchalik zich terilganki, oralig‘iga pichoq tig‘i ham kirmaydi."),
    "rainbow-mountain-peru": ("Vinikunka — Kamalak tog‘i", "Dengiz sathidan 5200 metr balandlikdagi tog‘: turli minerallar uning yonbag‘irlarini qizil, sariq, yashil va binafsha chiziqlarga bo‘yagan."),
    # Yucatán
    "tulum": ("Tulum", "Karib dengizi qirg‘og‘idagi qoya ustida qurilgan mayya devorli shahri; XIII–XV asrlarda gullab-yashnagan muhim port bo‘lgan."),
    "uxmal": ("Ushmal", "Puuk uslubidagi mayya shahri: oval asosli “Sehrgar piramidasi” va nozik tosh naqshli saroylari bilan YuNESKO merosi ro‘yxatida."),
    "cenote-ik-kil": ("Ik-Kil senoti", "Chichen-Itsa yaqinidagi tabiiy quduq-ko‘l: suv yuzasi yerdan qariyb 26 metr pastda, tepadan liana va sharsharachalar osilib turadi."),
    # Everest
    "everest-base-camp": ("Everest tayanch lageri", "Nepal tomonidagi janubiy lager taxminan 5364 metr balandlikda joylashgan; alpinistlar cho‘qqiga chiqishdan oldin shu yerda iqlimga moslashadi."),
    "tengboche-monastery": ("Tengboche monastiri", "3867 metr balandlikdagi sherpa xalqining eng katta buddaviy monastiri; derazalaridan Ama-Dablam va Everest cho‘qqilari ko‘rinadi."),
    "namche-bazaar": ("Namche-Bazar", "Taxminan 3440 metr balandlikdagi sherpa qishlog‘i — Everest yo‘lidagi asosiy savdo va dam olish bekati."),
    "kathmandu-durbar-square": ("Katmandu Durbar maydoni", "Qadimiy qirollik saroyi oldidagi maydon: pagoda uslubidagi ibodatxonalar va yog‘och o‘ymakorligi bilan Katmandu vodiysi YuNESKO merosining bir qismi."),
    # San Francisco
    "lombard-street-san-francisco": ("Lombard ko‘chasi", "Rashan Hill tepaligidan tushadigan, sakkizta keskin burilishli “dunyodagi eng qiyshiq ko‘cha”; yo‘l bo‘yi gulzorlar bilan bezatilgan."),
    "painted-ladies": ("“Bo‘yalgan xonimlar”", "Alamo-skver qarshisidagi rang-barang Viktoriya uslubidagi uylar qatori; ortida shaharning zamonaviy osmono‘par binolari ko‘rinadi."),
    "fisherman-s-wharf-san-francisco": ("Baliqchilar iskalasi", "Shaharning dengiz bo‘yidagi mahallasi: dengiz sherlari dam oladigan 39-pirs, baliq restoranlari va Alkatrazga qayiqlar."),
    # Los Angeles
    "hollywood-sign": ("Hollivud yozuvi", "Li tog‘idagi 14 metrli harflar 1923-yilda ko‘chmas mulk reklamasi sifatida “HOLLYWOODLAND” deb o‘rnatilgan; 1949-yilda oxirgi to‘rt harf olib tashlangan."),
    "griffith-observatory": ("Griffit observatoriyasi", "1935-yilda ochilgan bepul observatoriya: teleskoplar, planetariy va Hollivud yozuvi hamda shahar chiroqlariga eng yaxshi ko‘rinish."),
    "santa-monica-pier": ("Santa-Monika pirsi", "Tinch okeanga cho‘zilgan tarixiy pirs: quyosh energiyasida ishlaydigan charxpalak, attraksionlar va 66-yo‘nalishning ramziy so‘nggi nuqtasi."),
    "getty-center": ("Getti markazi", "Tepalikdagi oq travertin san’at markazi: Van Gog “Irislar”i kabi asarlar, bog‘lar va okeangacha ko‘rinish; kirish bepul."),
    # Alaska
    "mendenhall-glacier": ("Mendenxoll muzligi", "Juno shahri yaqinidagi 19 kilometrlik muzlik; ko‘k muz g‘orlari va Nugget sharsharasi bilan mashhur."),
    "kenai-fjords-national-park": ("Kenay fyordlari milliy bog‘i", "Harding muz maydonidan okeanga tushadigan muzliklar, fyordlar, kitlar va dengiz otterlari makoni."),
    # Haiti
    "citadelle-laferri-re": ("Laferr’er qal’asi", "Bonnet-a-l’Evek tog‘i cho‘qqisida, 1805–1820-yillarda ozodlikni himoya qilish uchun qurilgan Amerikadagi eng katta qal’a; YuNESKO merosi ro‘yxatida."),
    "sans-souci-palace": ("San-Susi saroyi", "Qirol Anri Kristof qarorgohi bo‘lgan saroy xarobalari — Laferr’er qal’asi bilan birga Milliy tarix bog‘ining bir qismi."),
    "labadee": ("Labadi", "Gaitining shimoliy qirg‘og‘idagi oq qumli yarimorol va ko‘rfaz — feruza suvli tinch plyajlar."),
    "bassin-bleu": ("Basen-Blyu", "Jakmel yaqinidagi tog‘ orasida pog‘onama-pog‘ona joylashgan uchta moviy ko‘l va sharsharalar."),
    # Jakarta
    "national-monument-indonesia": ("Milliy monument (Monas)", "Merdeka maydonidagi 132 metrli obelisk; uchidagi alanga shakli oltin bilan qoplangan va mustaqillik uchun kurashni ramziy ifodalaydi."),
    "jakarta-old-town": ("Kota Tua — Eski Jakarta", "Gollandiya mustamlakasi davridagi Bataviya markazi: Fatahillah maydoni, tarix muzeyi va eski kanallar."),
    "thousand-islands-indonesia": ("Ming orol (Kepulauan Seribu)", "Jakarta ko‘rfazidan shimolga cho‘zilgan 100 dan ortiq orolcha: marjon riflari, sho‘ng‘ish va tinch dam olish maskani."),
    # Bali
    "tanah-lot": ("Tanah-Lot ibodatxonasi", "Okeandagi qoya ustidagi hindu ibodatxonasi; quyosh botishida qoyaning qora silueti Balining eng mashhur manzaralaridan biri."),
    "uluwatu-temple": ("Uluvatu ibodatxonasi", "Okeandan 70 metr baland qoya cho‘qqisidagi dengiz ibodatxonasi; kechqurun kecak olov raqsi ijro etiladi."),
    "ubud-monkey-forest": ("Ubud maymunlar o‘rmoni", "Qadimiy ibodatxonalar va ulkan banyan daraxtlari orasida 1000 dan ortiq uzun dumli makaka yashaydigan muqaddas o‘rmon."),
    # Sydney
    "sydney-harbour-bridge": ("Sidney Harbor ko‘prigi", "1932-yilda ochilgan po‘lat arkali ko‘prik — mahalliy aholi uni “Kiyim ilgich” deb ataydi; arkasining tepasiga ekskursiya bilan chiqish mumkin."),
    "bondi-beach": ("Bondi plyaji", "Sidney markazidan 7 km uzoqlikdagi mashhur sörf plyaji va qoyalar bo‘ylab Bondi–Kuji sohil yo‘lagi."),
    "royal-botanic-garden-sydney": ("Sidney qirollik botanika bog‘i", "1816-yilda asos solingan bog‘: Opera teatri va ko‘prikka qaragan maysazorlar, “Missis Makkuori kursi” ko‘rinish nuqtasi."),
    "blue-mountains-new-south-wales": ("Moviy tog‘lar", "Evkalipt efir moylarining havodagi ko‘kish tumani tog‘larga nom bergan. “Uch opa-singil” qoyalari va sharsharalari bilan YuNESKO merosi ro‘yxatida."),
    # Canberra
    "parliament-house-canberra": ("Kanberra parlament binosi", "1988-yilda ochilgan bino tepalik ichiga qurilgan: tomi ustidagi maysazor bo‘ylab yurish mumkin, tepasida 81 metrli bayroq ustuni."),
    "lake-burley-griffin": ("Berli-Griffin ko‘li", "Shahar markazidagi sun’iy ko‘l; u shaharni loyihalagan me’mor Uolter Berli Griffin nomi bilan atalgan. Ko‘lda baland favvora va qo‘ng‘iroqlar minorasi bor."),
    "australian-war-memorial": ("Avstraliya urush memoriali", "Urushlarda halok bo‘lgan avstraliyaliklar xotirasiga bag‘ishlangan memorial va muzey; har kuni kechqurun xotira marosimi o‘tkaziladi."),
    "national-gallery-of-australia": ("Avstraliya milliy galereyasi", "Mamlakatning bosh san’at muzeyi: tub aholi san’atining dunyodagi eng katta to‘plamlaridan biri va haykallar bog‘i."),
    # Melbourne
    "flinders-street-railway-station": ("Flinders-strit vokzali", "1910-yilda qurilgan sariq-oltin rangli vokzal; uning soatlari ostida “uchrashamiz” deyish melburnliklarning eski odati."),
    "twelve-apostles-victoria": ("O‘n ikki havoriy qoyalari", "Buyuk okean yo‘li bo‘yidagi dengizdan ko‘tarilgan ohaktosh ustunlar; to‘lqinlar ularni minglab yillar davomida qirg‘oqdan ajratib chiqqan."),
    "st-kilda-victoria": ("Sent-Kilda", "Melburnning dengiz bo‘yidagi mahallasi: pirs, Luna Park va kechqurun qirg‘oqqa qaytadigan kichik pingvinlar."),
    # Cape Town
    "table-mountain": ("Stol tog‘i", "Tepasi stoldek tekis 1085 metrli tog‘; bulut uni qoplaganida “dasturxon yozildi” deyishadi. Aylanuvchi kabinali kanat yo‘li cho‘qqiga olib chiqadi."),
    "boulders-beach": ("Bolders plyaji", "Granit qoyalar orasidagi plyaj — afrika pingvinlari koloniyasi yaqinidan kuzatiladigan kam sonli joylardan biri."),
    "bo-kaap": ("Bo-Kaap", "Signal-Hill etagidagi rang-barang uylar mahallasi; tarixan Keyp-Malay jamoasi yashagan, masjidlari va oshxonasi bilan mashhur."),
    "robben-island": ("Robben oroli", "Nelson Mandela 27 yillik qamoqning 18 yilini o‘tkazgan orol; bugun u ozodlik va yarashuv ramzi sifatida muzey va YuNESKO merosi."),
    # Marrakesh
    "jemaa-el-fnaa": ("Jamoa al-Fna maydoni", "Madinaning yuragi: kunduzi ilon o‘ynatuvchilar va hikoyachilar, kechasi esa yuzlab taom chodirlari. Maydon madaniyati YuNESKO nomoddiy merosi ro‘yxatida."),
    "koutoubia-mosque": ("Kutubiya masjidi", "XII asrda Muvahhidlar davrida qurilgan Marrakeshning eng katta masjidi; 77 metrli minorasi Sevilyadagi Xiralda va Rabotdagi Hasan minorasiga namuna bo‘lgan."),
    "jardin-majorelle": ("Majorel bog‘i", "Fransuz rassomi Jak Majorel 1920–1930-yillarda yaratgan bog‘: o‘ziga xos “Majorel ko‘ki” rangidagi villa, kaktuslar va favvoralar. Keyinchalik uni Iv Sen-Loran sotib olgan."),
    # Kenya
    "maasai-mara": ("Masai-Mara", "Serengeti bilan tutash savanna qo‘riqxonasi: har yili iyul–oktabrda millionlab gnu va zebralar Mara daryosini kechib o‘tadi."),
    "amboseli-national-park": ("Amboseli milliy bog‘i", "Kilimanjaro qorli cho‘qqisi fonida fil podalari yuradigan mashhur savanna bog‘i."),
    "nairobi-national-park": ("Nayrobi milliy bog‘i", "Poytaxt chegarasidagi yovvoyi tabiat bog‘i: osmono‘par binolar fonida sherlar, jirafalar va karkidonlarni ko‘rish mumkin."),
    "lake-nakuru": ("Nakuru ko‘li", "Rift vodiysidagi ishqorli ko‘l — pushti flamingolar to‘dalari va oq karkidonlar qo‘riqxonasi."),
    # Singapore
    "marina-bay-sands": ("Marina Bey Sends", "Uchta 55 qavatli minora tepasida 340 metrli kema shaklidagi “SkyPark” va undagi osma basseyn — 2010-yilda ochilgan."),
    "gardens-by-the-bay": ("Ko‘rfaz bo‘yidagi bog‘lar", "Balandligi 25–50 metrli po‘lat “supertree”lar, gulli gumbaz va Bulutli o‘rmon sharsharasi; kechasi daraxtlar musiqa ostida yonadi."),
    "merlion": ("Merlion", "Boshi sher, tanasi baliq shaklidagi Singapur ramzi; 8,6 metrli haykal og‘zidan Marina ko‘rfaziga suv otiladi."),
    "jewel-changi-airport": ("Jewel Changi", "Aeroport ichidagi shisha gumbazli majmua: dunyodagi eng baland yopiq sharshara — 40 metrli Rain Vortex va besh qavatli tropik o‘rmon."),
    # Bangkok
    "grand-palace": ("Katta qirollik saroyi", "1782-yildan Siam qirollarining qarorgohi; uning hududidagi Vat Phra Keo ibodatxonasida Tailandning eng muqaddas Zumrad Budda haykali saqlanadi."),
    "wat-arun": ("Vat Arun — Tong ibodatxonasi", "Chaophraya daryosi bo‘yidagi 70 metrdan baland markaziy minorasi chinni va rangli shisha bo‘laklari bilan bezatilgan."),
    "wat-pho": ("Vat Pho", "46 metr uzunlikdagi oltin yotgan Budda haykali bilan mashhur ibodatxona; an’anaviy tay massaji maktabi ham shu yerda tug‘ilgan."),
    "damnoen-saduak-floating-market": ("Damnoen-Saduak suzuvchi bozori", "Kanallarda qayiqlardan meva, gul va issiq taom sotiladigan an’anaviy bozor."),
    # Agra
    "agra-fort": ("Agra qal’asi", "Qizil qumtoshdan qurilgan Boburiylar qal’asi; Shoh Jahon umrining so‘nggi yillarida shu yerdan Toj Mahalga tikilib yashagan. YuNESKO merosi ro‘yxatida."),
    "fatehpur-sikri": ("Fatehpur-Sikri", "Akbarshoh 1571-yilda bunyod etgan qizil qumtosh poytaxt; 54 metrli Buland Darvoza bilan mashhur. YuNESKO merosi ro‘yxatida."),
    "mehtab-bagh": ("Mahtob bog‘ — Oydin bog‘", "Yamuna daryosining narigi sohilidagi Boburiylar bog‘i — oydin kechada Toj Mahalning suvdagi aksini tomosha qilish uchun qurilgan."),
}
# ---- older cities (no Uzbek Wikipedia article) ----
UZ.update({
    "ulugh-beg-observatory": ("Ulug‘bek rasadxonasi", "Mirzo Ulug‘bek 1420-yillarda Samarqandda qurdirgan rasadxona. Uning ulkan marmar sekstanti yordamida 1018 yulduz o‘rni aniqlangan “Ziji jadidi Ko‘ragoniy” jadvali tuzilgan."),
    "grand-bazaar-istanbul": ("Katta bozor (Kapalıçarşı)", "1461-yilda Mehmed II davrida qurila boshlagan dunyodagi eng qadimiy va eng katta yopiq bozorlardan biri: 60 dan ortiq ko‘cha va 4000 ga yaqin do‘kon."),
    "g-reme": ("Go‘reme", "Kappadokiyadagi qishloq: “peri mo‘rilari” deb ataladigan vulqon tufidan hosil bo‘lgan qoya ustunlar va tong chog‘ida osmonga ko‘tariladigan yuzlab havo sharlari bilan mashhur."),
    "g-reme-national-park": ("Go‘reme tarixiy milliy bog‘i", "Qoyalarga o‘yib ishlangan cherkovlar, freskalar va uy-g‘orlar majmuasi; 1985-yildan YuNESKO Butunjahon merosi ro‘yxatida."),
    "derinkuyu-underground-city": ("Derinkuyu yer osti shahri", "Taxminan 85 metr chuqurlikkacha tushadigan ko‘p qavatli yer osti shahri: unda minglab odam chorva va oziq-ovqati bilan birga panoh topa olgan."),
    "arc-de-triomphe": ("Zafar arkasi", "Napoleon buyrug‘i bilan 1806–1836-yillarda qurilgan 50 metrli arka; ostida Noma’lum askar qabri va mangu olov joylashgan, tepasidan Yelisey dalalari ko‘rinadi."),
    "montmartre": ("Monmartr", "Parijning eng baland tepaligi: oq Sakre-Ker bazilikasi, Tertr maydonidagi rassomlar va Pikasso, Van Gog yashagan bohem ko‘chalari."),
    "champs-lys-es": ("Yelisey dalalari", "Konkord maydonidan Zafar arkasigacha cho‘zilgan qariyb 2 km uzunlikdagi mashhur xiyobon: daraxtlar, kafelar va do‘konlar."),
    "pont-alexandre-iii": ("Aleksandr III ko‘prigi", "1896–1900-yillarda qurilgan, oltin haykallar va chiroqlar bilan bezatilgan ko‘prik — Fransiya va Rossiya do‘stligi ramzi."),
    "mina-saudi-arabia": ("Mino vodiysi", "Makkadan taxminan 8 km sharqdagi vodiy: haj kunlarida yuz minglab oq chodir tikiladi va hojilar shayton toshlash marosimini ado etadi."),
    "hulhumal": ("Hulhumale", "Male yonida dengizdan qum to‘kib yaratilgan sun’iy orol-shahar; keng plyaji va zamonaviy mahallalari bor."),
    "vaadhoo-raa-atoll": ("Vaadhu oroli", "Kechalari qirg‘oqdagi to‘lqinlar fitoplankton tufayli moviy nur sochadigan — “yulduzli dengiz” manzarasi bilan mashhur orol."),
    "hanifaru": ("Baa atolli va Hanifaru ko‘rfazi", "YuNESKO biosfera rezervati: may–noyabr oylarida Hanifaru ko‘rfaziga yuzlab manta skatlari va kit akulalari to‘planadi."),
    "fushimi-inari-taisha": ("Fusimi Inari ibodatxonasi", "Inari tog‘i yonbag‘ri bo‘ylab ming-minglab to‘q sariq torii darvozalari tizilgan sinto ibodatxonasi; tepasigacha yo‘l 2–3 soat davom etadi."),
    "kinkaku-ji": ("Kinkaku-dzi — Oltin ibodatxona", "Ikki yuqori qavati oltin varaq bilan qoplangan, hovuz suvida aks etuvchi buddaviy ibodatxona; Kioto merosi sifatida YuNESKO ro‘yxatida."),
    "kiyomizu-dera": ("Kiyomizu-dera", "778-yilda asos solingan ibodatxona: mixsiz qurilgan ulkan yog‘och ayvoni bahorda sakura, kuzda qizil zarang ustida osilib turadi."),
    "gion": ("Gion", "Kiotoning an’anaviy mahallasi: yog‘och choyxonalar, tosh ko‘chalar va kechqurun ko‘rinib qoladigan geyko va maykolar."),
    "lauterbrunnen": ("Lauterbrunnen", "Tik qoyalar orasidagi vodiy qishlog‘i; atrofida 72 ta sharshara bor va u Yevropaning eng go‘zal vodiylaridan biri hisoblanadi."),
    "staubbach-falls": ("Shtaubbax sharsharasi", "Lauterbrunnen qishlog‘i ustidan qariyb 300 metr balandlikdan tushadigan sharshara — Gyote unga she’r bag‘ishlagan."),
    "jungfraujoch": ("Yungfrauyox", "3454 metr balandlikdagi dovon — “Yevropa tomi”: u yerga Yevropaning eng baland temir yo‘l bekatigacha poyezdda chiqiladi, Aletsch muzligi ko‘rinadi."),
    "lake-brienz": ("Briyens ko‘li", "Interlaken sharqidagi feruza rangli tog‘ ko‘li; qirg‘og‘ida Gisbax sharsharasi va yog‘och o‘ymakorlari qishlog‘i bor."),
    "lake-thun": ("Tun ko‘li", "Interlaken g‘arbidagi ko‘l: qasrlar, uzumzorlar va qorli Alp cho‘qqilari fonida suzadigan bug‘ kemalari."),
    "grindelwald": ("Grindelvald", "Eyger shimoliy devori etagidagi tog‘ qishlog‘i: qishda chang‘i, yozda Alp o‘tloqlari bo‘ylab sayr yo‘llari."),
    "palm-jumeirah": ("Palm Jumeyra", "Fors ko‘rfazida palma daraxti shaklida qum to‘kib yaratilgan sun’iy orollar arxipelagi: villalar, mehmonxonalar va plyajlar."),
    "dubai-creek": ("Dubay ko‘rfazi (Creek)", "Shaharni Deyra va Bur-Dubayga bo‘luvchi tarixiy suv yo‘li; abra qayiqlari, oltin va ziravor bozorlari shu yerda."),
    "dubai-fountain": ("Dubay favvorasi", "Burj Xalifa poyidagi ko‘lda musiqa va chiroq ostida suvni 150 metrgacha otadigan dunyodagi eng katta xoreografik favvoralardan biri."),
    "egyptian-museum": ("Misr muzeyi", "Qohiradagi Tahrir maydonidagi muzey: 120 mingdan ortiq qadimiy misr yodgorligi, fir’avnlar haykallari va mumiyolar saqlanadi."),
    "oia-greece": ("Iya (Oia)", "Santorini shimolidagi oq uylar va ko‘k gumbazli qishloq — dunyodagi eng go‘zal quyosh botishi manzaralaridan biri shu yerda."),
    "fira": ("Fira", "Santorinining kaldera qoyasi ustidagi poytaxti: ko‘rinish maydonlari, muzeylar va eski portga tushadigan zinapoya."),
    "akrotiri-prehistoric-city": ("Akrotiri", "Miloddan avvalgi XVII asrdagi vulqon otilishi kul ostida qoldirgan bronza davri shahri — “Egey dengizi Pompeyi”, devoriy suratlari saqlangan."),
    "red-beach-santorini": ("Qizil plyaj", "Akrotiri yaqinidagi qizil va qora vulqon qoyalari bilan o‘ralgan plyaj; qumi temirga boy jinslardan qizg‘ish tusda."),
    "trevi-fountain": ("Trevi favvorasi", "1762-yilda qurib bitkazilgan Rimning eng katta barokko favvorasi; an’anaga ko‘ra unga tanga tashlagan odam Rimga yana qaytadi."),
    "roman-forum": ("Rim forumi", "Qadimgi Rimning siyosiy, diniy va savdo markazi bo‘lgan maydon: ibodatxonalar, bazilikalar va zafar arkalari xarobalari."),
    "spanish-steps": ("Ispan zinapoyasi", "Ispaniya maydonini Trinita-dei-Monti cherkovi bilan bog‘lovchi 135 pog‘onali barokko zinapoya (1723–1726)."),
    "sk-gafoss": ("Skougafoss", "Kengligi 25, balandligi 60 metr bo‘lgan sharshara; quyoshli kunlarda uning changida kamalak paydo bo‘ladi."),
    "gullfoss": ("Gyudlfoss — Oltin sharshara", "Hvitau daryosining ikki pog‘onali sharsharasi chuqur daraga quyiladi; “Oltin halqa” yo‘nalishining eng mashhur bekati."),
    "blue-lagoon-geothermal-spa": ("Moviy laguna", "Lava dalasi orasidagi geotermal suv havzasi: kremniy va minerallarga boy sutsimon moviy suv harorati 37–39 °C."),
    "j-kuls-rl-n": ("Yokulsaurlaun", "Vatnayokull muzligi etagidagi muzlik ko‘li: suzib yurgan ko‘k aysberglar va qora qumli “Olmos plyaji”."),
    "hallgr-mskirkja": ("Hadlgrimskirkya", "Reykyavikdagi 74,5 metrli lyuteran cherkovi — bazalt ustunlarni eslatuvchi me’morchilik; minorasidan butun shahar ko‘rinadi."),
    "ingvellir": ("Tingvetlir milliy bog‘i", "930-yilda dunyodagi eng qadimiy parlamentlardan biri — Alting yig‘ilgan joy; bu yerda Shimoliy Amerika va Yevroosiyo plitalari orasidagi yoriq ko‘rinadi."),
    "times-square": ("Tayms-skver", "Manxettendagi ulkan reklama ekranlari bilan yonib turuvchi chorraha — har Yangi yil kechasi bu yerda mashhur shar tushiriladi."),
    "al-khazneh": ("Al-Xazna — Xazina", "Nabatiylar milodiy I asrda qizil qumtosh qoyaga o‘yib yaratgan 40 metrli fasad; Siq darasidan chiqishda birdan ko‘rinadi."),
    "ad-deir": ("Ad-Deyr — Monastir", "Petraning eng katta qoyaga o‘yilgan binosi (kengligi 47 m); unga 800 dan ortiq tosh pog‘ona orqali chiqiladi."),
    "mutianyu": ("Mutianyu — Buyuk Xitoy devori", "Pekindan 70 km shimoldagi qayta tiklangan devor qismi: 22 ta qorovul minorasi, o‘rmonli tepaliklar va kanat yo‘li."),
})


# ---- Russian texts where the Russian Wikipedia has no article ----
RU = {
    "u-hisar": ("Учхисар", "Самая высокая точка Каппадокии — скальная крепость из вулканического туфа, вся изрытая пещерными жилищами; с вершины видна долина Гёреме."),
    "vaadhoo-raa-atoll": ("Остров Ваадху", "Остров, где ночью волны у берега светятся голубым из‑за фитопланктона — знаменитое «море звёзд»."),
    "red-beach-santorini": ("Красный пляж", "Пляж у Акротири среди красных и чёрных вулканических скал; песок окрашен железистыми породами."),
    "mutianyu": ("Мутяньюй — Великая стена", "Восстановленный участок Великой Китайской стены в 70 км от Пекина: 22 сторожевые башни, лесистые холмы и канатная дорога."),
    "bukchon-hanok-village": ("Деревня Пукчон Ханок", "Квартал традиционных корейских домов‑ханоков на холме между дворцами Кёнбоккун и Чхандоккун; в эпоху Чосон здесь жила знать."),
    "rainbow-mountain-peru": ("Виникунка — Радужная гора", "Гора на высоте около 5200 м, склоны которой минералы раскрасили в красные, жёлтые, зелёные и фиолетовые полосы."),
    "kathmandu-durbar-square": ("Площадь Дурбар в Катманду", "Площадь перед старым королевским дворцом с пагодами и резьбой по дереву; часть объекта ЮНЕСКО «Долина Катманду»."),
    "santa-monica-pier": ("Пирс Санта‑Моники", "Исторический пирс в Тихом океане: колесо обозрения на солнечной энергии, аттракционы и символический конец трассы 66."),
    "labadee": ("Лабади", "Полуостров с белым песком и бирюзовыми бухтами на северном побережье Гаити."),
    "bassin-bleu": ("Бассен‑Блё", "Три голубых озера с водопадами, расположенные каскадом в горах около Жакмеля."),
    "jakarta-old-town": ("Кота Туа — Старая Джакарта", "Центр колониальной Батавии: площадь Фатахиллах, исторический музей и старые каналы."),
    "bondi-beach": ("Пляж Бонди", "Знаменитый пляж для сёрфинга в 7 км от центра Сиднея и прибрежная тропа Бонди — Куджи вдоль скал."),
    "boulders-beach": ("Пляж Боулдерс", "Пляж среди гранитных валунов — одно из немногих мест, где колонию африканских пингвинов можно увидеть совсем близко."),
    "jewel-changi-airport": ("Jewel Чанги", "Комплекс под стеклянным куполом в аэропорту Чанги: самый высокий крытый водопад в мире Rain Vortex (40 м) и пятиэтажный тропический лес."),
    "damnoen-saduak-floating-market": ("Плавучий рынок Дамноен Садуак", "Традиционный рынок на каналах, где фрукты, цветы и горячую еду продают прямо с лодок."),
    "mehtab-bagh": ("Сад Мехтаб‑Багх — Лунный сад", "Сад Великих Моголов на противоположном берегу Ямуны, созданный, чтобы любоваться отражением Тадж‑Махала в лунную ночь."),
}

# ---- places added on 24.11.2026 ----
UZ.update({
    "ihlara-valley": ("Ixlara vodiysi", "Melendiz daryosi o‘yib yaratgan 14 km uzunlikdagi dara: qoyalarga o‘yilgan Vizantiya cherkovlari va freskalar, daryo bo‘yidagi yashil so‘qmoqlar."),
    "mal-friday-mosque": ("Male Juma masjidi (Hukuru Miskiy)", "1658-yilda marjon toshlaridan qurilgan Maldivning eng qadimiy masjidi; o‘ymakor marjon devorlari va lak bilan bezatilgan yog‘och ichki qismi bilan mashhur."),
    "nea-kameni": ("Nea-Kameni", "Santorini kalderasi markazidagi yosh vulqon oroli: qora lava dalalari ustidan krater tepasiga piyoda chiqish mumkin."),
    "siq": ("Siq darasi", "Petraga kiradigan 1,2 km uzunlikdagi tor qoya yo‘lagi; ba’zi joylarda kengligi 3 metrgacha torayadi va oxirida birdan Xazna ko‘rinadi."),
    "cathedral-of-christ-the-saviour": ("Najotkor Masih sobori", "Moskva daryosi bo‘yidagi oltin gumbazli sobor; 1931-yilda buzilgan, 1990-yillarda asl ko‘rinishida qayta qurilgan."),
    "gorky-park-moscow": ("Gorkiy bog‘i", "Moskva daryosi bo‘yidagi markaziy bog‘: yozda velosiped va ochiq kinoteatr, qishda esa ulkan muz maydoni."),
    "thean-hou-temple": ("Tyan Xou ibodatxonasi", "Tepalik ustidagi olti qavatli xitoy ibodatxonasi: qizil fonarlar, naqshinkor tomlar va Kuala-Lumpur manzarasi."),
    "sultan-abdul-samad-building": ("Sulton Abdul Samad binosi", "1897-yilda qurilgan mavritan uslubidagi bino: mis gumbazlari va 41 metrli soat minorasi Merdeka maydoniga qaraydi."),
    "rawal-lake": ("Ravol ko‘li", "Islomobod va Ravalpindini suv bilan ta’minlovchi sun’iy ko‘l; qirg‘og‘ida bog‘lar, qayiq sayri va quyosh botishi manzarasi."),
    "margalla-hills-national-park": ("Margalla tepaliklari milliy bog‘i", "Islomobod shimolidagi o‘rmonli tepaliklar: piyoda yo‘llar, qushlar, maymunlar va shahar ustidan keng manzara."),
    "cob": ("Koba", "O‘rmon ichidagi qadimiy mayya shahri; 42 metrli Nohoch Mul piramidasi Yukatandagi eng baland piramidalardan biri."),
    "matanuska-glacier": ("Matanuska muzligi", "Ankorijdan 160 km uzoqlikdagi 43 km uzunlikdagi muzlik; uning ustida maxsus yo‘lboshchi bilan yurish mumkin."),
    "taman-mini-indonesia-indah": ("Taman Mini Indoneziya", "Indoneziyaning barcha viloyatlari an’anaviy uylari, muzeylari va bog‘lari bir joyga jamlangan madaniyat bog‘i."),
    "mount-batur": ("Batur vulqoni", "1717 metrli faol vulqon: tong otmasdan chiqib, kaldera ko‘li ustida quyosh chiqishini kutish Balining eng mashhur sarguzashtlaridan."),
    "tirta-empul": ("Tirta Empul ibodatxonasi", "962-yilda asos solingan muqaddas buloq ibodatxonasi; ziyoratchilar tosh favvoralar ostida poklanish marosimini o‘tkazadi."),
    "black-mountain-tower": ("Telstra minorasi (Qora tog‘)", "Qora tog‘ tepasidagi 195 metrli aloqa minorasi; ko‘rinish maydonidan butun Kanberra va Berli-Griffin ko‘li ko‘rinadi."),
    "federation-square": ("Federatsiya maydoni", "Melburn markazidagi zamonaviy madaniyat maydoni: galereyalar, kinomuzey va bayramlar o‘tkaziladigan ochiq maydon."),
    "mount-kenya": ("Keniya tog‘i", "Afrikaning ikkinchi eng baland cho‘qqisi (5199 m); muzliklari, o‘ziga xos o‘simliklari bilan YuNESKO merosi ro‘yxatida."),
    "sentosa": ("Sentoza oroli", "Singapur janubidagi dam olish oroli: plyajlar, Universal Studios, okeanarium va kanat yo‘li."),
    "tomb-of-i-tim-d-ud-daulah": ("I’timod-ud-Davla maqbarasi", "1622–1628-yillarda qurilgan, “kichik Toj” deb ataladigan oq marmar maqbara; nozik tosh mozaikasi Toj Mahalga namuna bo‘lgan."),
})
RU.update({
    "thean-hou-temple": ("Храм Тянь Хоу", "Шестиярусный китайский храм на холме: красные фонари, резные крыши и вид на Куала-Лумпур."),
    "black-mountain-tower": ("Башня Телстра (Чёрная гора)", "195-метровая телебашня на вершине Чёрной горы; со смотровой площадки видна вся Канберра и озеро Берли-Гриффин."),
})



def apply(world):
    """Fill missing Uzbek / Russian names and extracts in a world.json dict in place; returns how many were filled."""
    n = 0
    for c in world["cities"]:
        for a in c["attractions"]:
            for lang, table in (("uz", UZ), ("ru", RU)):
                t = table.get(a["id"])
                if not t:
                    continue
                if not a["names"].get(lang):
                    a["names"][lang] = t[0]
                if not a["extract"].get(lang):
                    a["extract"][lang] = t[1]
                    a.setdefault("src_note", {})[lang] = "WorldLive"
                    n += 1
    return n


def missing(world):
    """(city, id, lang) for every place still lacking a name or text in uz/en/ru."""
    return [(c["key"], a["id"], lang) for c in world["cities"] for a in c["attractions"]
            for lang in ("uz", "en", "ru") if not a["names"].get(lang) or not a["extract"].get(lang)]
