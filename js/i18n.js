/* Bilingual strings (Icelandic / Danish) + language toggle for Krakkaleikir.
   Load first. Language is stored in localStorage ('kl.lang').
   audioVocab(lang) lists every spoken clip (audio key -> text): it is the single
   source for tools/make_audio.py, tools/check.js and the Web Speech fallback.
   After editing a spoken string, re-run tools/make_audio.py.
   Kóli the koala cheers in Icelandic in both languages (PRAISE; Danish shows a gloss). */
(function () {
  'use strict';

  var STR = {
    is: {
      'title.menu': 'Krakkaleikir',
      'koala.hello': 'Hæ! Ég heiti Kóli. Veldu leik og við spilum saman!',
      'koala.next': 'Hvað viltu spila næst?',
      'menu.stickers': 'Dýragarðurinn minn',
      'game.tolur': 'Tölur',
      'game.talnatafla': 'Tölutafla',
      'game.bokstafir': 'Bókstafir',
      'game.form': 'Form',
      'game.klukkan': 'Klukkan',
      'game.minni': 'Minni',
      'game.mynstur': 'Mynstur',
      'game.maelingar': 'Mælingar',
      'game.ordmyndir': 'Orð og myndir',
      'game.spegill': 'Spegill',
      'desc.tolur': 'Teldu dýrin og leystu dæmi',
      'desc.talnatafla': 'Kannaðu tölurnar frá 1 upp í 100',
      'desc.bokstafir': 'Hlustaðu og finndu staf eða orð',
      'desc.form': 'Finndu formin og teldu hliðarnar',
      'desc.klukkan': 'Lærðu á klukkuna',
      'desc.minni': 'Finndu myndirnar sem eru eins',
      'desc.mynstur': 'Hvað kemur næst í röðinni?',
      'desc.maelingar': 'Mældu, vigtaðu og berðu saman',
      'desc.ordmyndir': 'Paraðu orðin og myndirnar',
      'desc.spegill': 'Finndu spegilmyndina',
      'footer.note': 'Stjörnur, dýrin og föt Kóla geymast í þessum vafra.',
      'footer.reset': 'Byrja upp á nýtt',
      'reset.confirm': 'Eyða öllum stjörnum, dýrum og fötum Kóla?',
      'badge.not_played': 'Ekki prófað enn',
      'back.aria': 'Til baka í valmynd',
      'speak.aria': 'Hlusta aftur',
      'menu.stars_aria': 'Samtals stjörnur: {n}',
      'title.tolur': 'Tölur — Krakkaleikir',
      'title.talnatafla': 'Tölutafla — Krakkaleikir',
      'title.bokstafir': 'Bókstafir — Krakkaleikir',
      'title.form': 'Form — Krakkaleikir',
      'title.klukkan': 'Klukkan — Krakkaleikir',
      'title.minni': 'Minni — Krakkaleikir',
      'title.mynstur': 'Mynstur — Krakkaleikir',
      'title.maelingar': 'Mælingar — Krakkaleikir',
      'title.ordmyndir': 'Orð og myndir — Krakkaleikir',
      'title.spegill': 'Spegill — Krakkaleikir',
      'level.q': 'Hvað eigum við að prófa?',
      'level.easy': 'Létt',
      'level.hard': 'Erfitt',
      'level.letters': 'Stafir',
      'end.title': 'Þú kláraðir leikinn!',
      'end.score': 'Rétt í fyrstu tilraun: <strong>{c} af {t}</strong>',
      'end.best': 'Besti árangur:',
      'end.replay': 'Spila aftur',
      'end.menu': 'Annar leikur',
      'sticker.new': 'Nýtt dýr í dýragarðinum: {a}!',
      'sticker.sound': 'Heyra hljóð: {a}',
      'family.title': 'Gestir í dýragarðinum',
      'family.locked': 'Kemur þegar {n} dýr eru komin',
      'family.arrived': '{p} kom í heimsókn í dýragarðinn!',
      'zoo.farm': 'Sveitin', 'zoo.forest': 'Skógurinn', 'zoo.water': 'Tjörnin', 'zoo.savanna': 'Gresjan', 'zoo.garden': 'Garðurinn',
      'family.dad': 'Pabbi',
      'family.mom': 'Mamma',
      'sticker.all': 'Öll dýrin eru komin í dýragarðinn!',
      'prize.retry': 'Vandaðu þig, þá færðu verðlaun næst!',
      'prize.rule': 'Verðlaun fást fyrir {n} rétt eða fleiri í fyrstu tilraun.',
      'prize.rule_minni': 'Verðlaun fást ef þú notar {n} snúninga eða færri.',
      'prize.done': 'Þú hefur fengið öll verðlaunin úr þessum leik. Prófaðu annan leik!',
      'prize.badge': 'Verðlaun: {n} af {t}',
      'outfit.new': 'Vá! Sjáðu hvað Kóli fékk!',
      'outfit.new_text': 'Nýtt handa Kóla: {a}!',
      'wardrobe.title': 'Fataskápur Kóla',
      'wardrobe.hint': 'Bankaðu á hlut til að klæða Kóla.',
      'wardrobe.empty': 'Kláraðu leiki til að fá hatta, gleraugu og fleira handa Kóla!',
      'wardrobe.wear': 'Klæða Kóla: {a}',
      'wardrobe.locked': 'Læst',
      'outfit.partyhat': 'veisluhattur', 'outfit.crown': 'kóróna', 'outfit.wizard': 'galdrahattur', 'outfit.flower': 'blóm',
      'outfit.sunglasses': 'sólgleraugu', 'outfit.hearts': 'hjartagleraugu', 'outfit.moustache': 'yfirvaraskegg',
      'outfit.bowtie': 'slaufa', 'outfit.scarf': 'trefill', 'outfit.medal': 'medalía',
      'streak.aria': '{n} rétt í röð',
      'try_again': 'Næstum því! Reyndu aftur.',
      'praise.means': '{g}',
      'num.1': 'einn', 'num.2': 'tveir', 'num.3': 'þrír', 'num.4': 'fjórir', 'num.5': 'fimm',
      'num.6': 'sex', 'num.7': 'sjö', 'num.8': 'átta', 'num.9': 'níu', 'num.10': 'tíu',
      // the time of day takes the neuter form: "klukkan er eitt / tvö / þrjú / fjögur"
      'hour.1': 'eitt', 'hour.2': 'tvö', 'hour.3': 'þrjú', 'hour.4': 'fjögur', 'hour.5': 'fimm',
      'hour.6': 'sex', 'hour.7': 'sjö', 'hour.8': 'átta', 'hour.9': 'níu', 'hour.10': 'tíu',
      'hour.11': 'ellefu', 'hour.12': 'tólf',
      // half hours count toward the coming hour: 3:30 is "hálf fjögur" (half.4)
      'half.1': 'hálf eitt', 'half.2': 'hálf tvö', 'half.3': 'hálf þrjú', 'half.4': 'hálf fjögur',
      'half.5': 'hálf fimm', 'half.6': 'hálf sex', 'half.7': 'hálf sjö', 'half.8': 'hálf átta',
      'half.9': 'hálf níu', 'half.10': 'hálf tíu', 'half.11': 'hálf ellefu', 'half.12': 'hálf tólf',
      'klukkan.q_past': 'korter yfir {h}',
      'klukkan.q_to': 'korter í {h}',
      'tolur.count_q.fiskur': 'Hvað eru margir fiskar?',
      'tolur.count_q.froskur': 'Hvað eru margir froskar?',
      'tolur.count_q.ungi': 'Hvað eru margir ungar?',
      'tolur.count_q.kottur': 'Hvað eru margir kettir?',
      'tolur.add': 'Hvað eru {a} plús {b}?',
      'tolur.sub': 'Hvað eru {a} mínus {b}?',
      'tolur.miss_q': 'Hvað vantar í dæmið?',
      'tolur.miss_add': '{a} plús hvað er {c}?',
      'tolur.miss_sub': '{a} mínus hvað er {c}?',
      'talnatafla.start': 'Bankaðu á tölu og hlustum saman!',
      'talnatafla.play': 'Finndu tölu',
      'talnatafla.play20': '1–20',
      'talnatafla.find': 'Finndu töluna {n}!',
      'talnatafla.range': 'Tölur frá 1 til 100',
      'talnatafla.all': 'Allar',
      'talnatafla.tens': 'Tugir',
      'talnatafla.fives': 'Fimm',
      'talnatafla.evens': 'Sléttar',
      'talnatafla.higher': '↑ Hærra!',
      'talnatafla.lower': '↓ Lægra!',
      'talnatafla.say_higher': 'Hærra!',
      'talnatafla.say_lower': 'Lægra!',
      'bokstafir.q': 'Hlustaðu vel! Hvaða orð heyrirðu?',
      'bokstafir.match_q': 'Finndu litla stafinn!',
      'bokstafir.first_q': 'Á hvaða staf byrjar orðið?',
      'klukkan.read_q': 'Hvað er klukkan?',
      'klukkan.time': 'Klukkan er {t}.',
      'klukkan.set_b': 'Hvert á litli vísirinn að benda?',
      'klukkan.pick_b': 'Finndu réttu klukkuna!',
      'minni.start': 'Finndu myndirnar sem eru eins! Snúðu við tveimur spjöldum í einu.',
      'minni.pairs6': '6 pör',
      'minni.pairs8': '8 pör',
      'minni.pairs10': '10 pör',
      'minni.pairs12': '12 pör',
      'minni.end_title': 'Þú fannst öll pörin!',
      'minni.end_flips': 'Þú notaðir <strong>{n}</strong> snúninga.',
      'minni.end_flips_one': 'Þú notaðir <strong>{n}</strong> snúning.',
      'minni.end_best': 'Fæstu snúningar: {n}',
      'minni.card': 'Spjald {n}',
      'minni.flips': 'Snúningar',
      'mynstur.q': 'Hvað kemur næst?',
      'maelingar.compare': 'Stærðir',
      'maelingar.size': 'Stærð {n}',
      'maelingar.longest': 'Hvaða blýantur er lengstur?',
      'maelingar.shortest': 'Hvaða blýantur er stystur?',
      'maelingar.tallest': 'Hvaða blóm er hæst?',
      'maelingar.lowest': 'Hvaða blóm er lægst?',
      'maelingar.ruler_q': 'Hvað er blýanturinn langur?',
      'maelingar.weight_q': 'Hvað vegur pakkinn?',
      'maelingar.ruler_aria': 'Blýantur frá 0 til {n} cm á reglustiku.',
      'maelingar.scale_aria': 'Vigt í jafnvægi: pakki á móti {weights}.',
      'maelingar.cm_one': '{n} sentímetri',
      'maelingar.cm_many': '{n} sentímetrar',
      'maelingar.kg': '{n} kíló',
      'maelingar.move_q': 'Færðu blýantinn að núllinu á reglustikunni!',
      'maelingar.move_aria': 'Færa blýant. Notaðu örvatakkana eða Enter til að stilla við núll.',
      'maelingar.place': 'Setja við núll',
      'ordmyndir.pictures': 'Orð → mynd',
      'ordmyndir.words': 'Mynd → orð',
      'ordmyndir.picture_q': 'Hvaða mynd passar við orðið?',
      'ordmyndir.word_q': 'Hvaða orð passar við myndina?',
      'spegill.q': 'Hvað sést í speglinum? Dragðu rétta mynd á sinn stað!',
      'spegill.hint': 'Mundu að spegillinn snýr myndinni við.',
      'spegill.pictures': 'Myndir',
      'spegill.choice': 'Mynd {n}',
      'form.find.hringur': 'Finndu hringinn!',
      'form.find.ferningur': 'Finndu ferninginn!',
      'form.find.þríhyrningur': 'Finndu þríhyrninginn!',
      'form.find.rétthyrningur': 'Finndu rétthyrninginn!',
      'form.find.fimmhyrningur': 'Finndu fimmhyrninginn!',
      'form.find.sexhyrningur': 'Finndu sexhyrninginn!',
      'form.find.átthyrningur': 'Finndu átthyrninginn!',
      'form.find.stjarna': 'Finndu stjörnuna!',
      'form.find.hjarta': 'Finndu hjartað!',
      'form.find.tígull': 'Finndu tígulinn!',
      'form.find.hálfmáni': 'Finndu hálfmánann!',
      'form.find.sporbaugur': 'Finndu sporbauginn!',
      'form.sides.0': 'Hvert form hefur engin horn?',
      'form.sides.3': 'Hvert form hefur þrjú horn?',
      'form.sides.4': 'Hvert form hefur fjögur horn?',
      'form.sides.5': 'Hvert form hefur fimm hliðar?',
      'form.sides.6': 'Hvert form hefur sex hliðar?',
      'form.sides.8': 'Hvert form hefur átta hliðar?',
      'shape.hringur': 'hringur',
      'shape.ferningur': 'ferningur',
      'shape.þríhyrningur': 'þríhyrningur',
      'shape.rétthyrningur': 'rétthyrningur',
      'shape.fimmhyrningur': 'fimmhyrningur',
      'shape.sexhyrningur': 'sexhyrningur',
      'shape.átthyrningur': 'átthyrningur',
      'shape.stjarna': 'stjarna',
      'shape.hjarta': 'hjarta',
      'shape.tígull': 'tígull',
      'shape.hálfmáni': 'hálfmáni',
      'shape.sporbaugur': 'sporbaugur',
      'animal.koala': 'kóala',
      'animal.froskur': 'froskur',
      'animal.ungi': 'ungi',
      'animal.kottur': 'köttur',
      'animal.svin': 'grís',
      'animal.bjorn': 'björn',
      'animal.fiskur': 'fiskur',
      'animal.mariuhaena': 'maríuhæna',
      'animal.ugla': 'ugla',
      'animal.mus': 'mús',
      'animal.ljon': 'ljón',
      'animal.morgaes': 'mörgæs',
      'animal.hundur': 'hundur',
      'animal.kyr': 'kýr',
      'animal.kind': 'kind',
      'animal.hestur': 'hestur',
      'animal.ond': 'önd',
      'animal.fill': 'fíll',
      'animal.api': 'api',
      'animal.byfluga': 'býfluga',
      'thing.bolti': 'bolti', 'thing.bill': 'bíll', 'thing.hus': 'hús', 'thing.sol': 'sól', 'thing.epli': 'epli',
      'thing.banani': 'banani', 'thing.tre': 'tré', 'thing.blom': 'blóm', 'thing.batur': 'bátur', 'thing.kaka': 'kaka',
      'thing.lykill': 'lykill', 'thing.skor': 'skór', 'thing.regnhlif': 'regnhlíf', 'thing.bok': 'bók',
      'thing.flugvel': 'flugvél', 'thing.bladra': 'blaðra', 'thing.iskrem': 'ís', 'thing.gulrot': 'gulrót',
      'thing.stoll': 'stóll', 'thing.bolli': 'bolli', 'thing.skeid': 'skeið', 'thing.sokkur': 'sokkur', 'thing.hufa': 'húfa',
      'thing.vettlingur': 'vettlingur', 'thing.tannbursti': 'tannbursti', 'thing.blyantur': 'blýantur', 'thing.tromma': 'tromma',
      'thing.lest': 'lest', 'thing.hjol': 'hjól', 'thing.jardarber': 'jarðarber', 'thing.pera': 'pera', 'thing.egg': 'egg',
      'thing.kerti': 'kerti', 'thing.hamar': 'hamar', 'thing.dreki': 'flugdreki', 'thing.rum': 'rúm'
    },
    da: {
      'title.menu': 'Krakkaleikir',
      'koala.hello': 'Hej! Jeg hedder Kóli. Vælg et spil, så leger vi sammen!',
      'koala.next': 'Hvad vil du spille nu?',
      'menu.stickers': 'Min zoo',
      'game.tolur': 'Tal',
      'game.talnatafla': 'Taltavle',
      'game.bokstafir': 'Bogstaver',
      'game.form': 'Former',
      'game.klukkan': 'Klokken',
      'game.minni': 'Vendespil',
      'game.mynstur': 'Mønstre',
      'game.maelingar': 'Måling',
      'game.ordmyndir': 'Ord og billeder',
      'game.spegill': 'Spejl',
      'desc.tolur': 'Tæl dyrene og løs regnestykker',
      'desc.talnatafla': 'Gå på opdagelse i tallene fra 1 til 100',
      'desc.bokstafir': 'Lyt og find bogstav eller ord',
      'desc.form': 'Find formerne og tæl siderne',
      'desc.klukkan': 'Lær klokken',
      'desc.minni': 'Find de billeder, der er ens',
      'desc.mynstur': 'Hvad kommer næst i rækken?',
      'desc.maelingar': 'Mål, vej og sammenlign',
      'desc.ordmyndir': 'Match ord og billeder',
      'desc.spegill': 'Find spejlbilledet',
      'footer.note': 'Stjerner, dyrene og Kólis tøj gemmes i denne browser.',
      'footer.reset': 'Start forfra',
      'reset.confirm': 'Slette alle stjerner, dyr og Kólis tøj?',
      'badge.not_played': 'Ikke prøvet endnu',
      'back.aria': 'Tilbage til menuen',
      'speak.aria': 'Lyt igen',
      'menu.stars_aria': 'Stjerner i alt: {n}',
      'title.tolur': 'Tal — Krakkaleikir',
      'title.talnatafla': 'Taltavle — Krakkaleikir',
      'title.bokstafir': 'Bogstaver — Krakkaleikir',
      'title.form': 'Former — Krakkaleikir',
      'title.klukkan': 'Klokken — Krakkaleikir',
      'title.minni': 'Vendespil — Krakkaleikir',
      'title.mynstur': 'Mønstre — Krakkaleikir',
      'title.maelingar': 'Måling — Krakkaleikir',
      'title.ordmyndir': 'Ord og billeder — Krakkaleikir',
      'title.spegill': 'Spejl — Krakkaleikir',
      'level.q': 'Hvad skal vi prøve?',
      'level.easy': 'Let',
      'level.hard': 'Svær',
      'level.letters': 'Bogstaver',
      'end.title': 'Du klarede spillet!',
      'end.score': 'Rigtigt i første forsøg: <strong>{c} af {t}</strong>',
      'end.best': 'Bedste resultat:',
      'end.replay': 'Spil igen',
      'end.menu': 'Et andet spil',
      'sticker.new': 'Nyt dyr i din zoo: {a}!',
      'sticker.sound': 'Hør lyden: {a}',
      'family.title': 'Gæster i din zoo',
      'family.locked': 'Kommer når der er {n} dyr',
      'family.arrived': '{p} er kommet på besøg i din zoo!',
      'zoo.farm': 'Bondegården', 'zoo.forest': 'Skoven', 'zoo.water': 'Søen', 'zoo.savanna': 'Savannen', 'zoo.garden': 'Haven',
      'family.dad': 'Far',
      'family.mom': 'Mor',
      'sticker.all': 'Alle dyrene er kommet i din zoo!',
      'prize.retry': 'Gør dig umage, så får du en præmie næste gang!',
      'prize.rule': 'Du får en præmie for {n} eller flere rigtige i første forsøg.',
      'prize.rule_minni': 'Du får en præmie, hvis du bruger {n} træk eller færre.',
      'prize.done': 'Du har fået alle præmierne fra dette spil. Prøv et andet spil!',
      'prize.badge': 'Præmier: {n} af {t}',
      'outfit.new': 'Wow! Se hvad Kóli har fået!',
      'outfit.new_text': 'Nyt til Kóli: {a}!',
      'wardrobe.title': 'Kólis klædeskab',
      'wardrobe.hint': 'Tryk på en ting for at klæde Kóli på.',
      'wardrobe.empty': 'Gennemfør spil for at få hatte, briller og meget mere til Kóli!',
      'wardrobe.wear': 'Klæd Kóli på: {a}',
      'wardrobe.locked': 'Låst',
      'outfit.partyhat': 'festhat', 'outfit.crown': 'krone', 'outfit.wizard': 'troldmandshat', 'outfit.flower': 'blomst',
      'outfit.sunglasses': 'solbriller', 'outfit.hearts': 'hjertebriller', 'outfit.moustache': 'overskæg',
      'outfit.bowtie': 'butterfly', 'outfit.scarf': 'halstørklæde', 'outfit.medal': 'medalje',
      'streak.aria': '{n} rigtige i træk',
      'try_again': 'Næsten! Prøv igen.',
      'praise.means': 'betyder: {g}',
      'num.1': 'en', 'num.2': 'to', 'num.3': 'tre', 'num.4': 'fire', 'num.5': 'fem',
      'num.6': 'seks', 'num.7': 'syv', 'num.8': 'otte', 'num.9': 'ni', 'num.10': 'ti',
      // "klokken er et" (not "en")
      'hour.1': 'et', 'hour.2': 'to', 'hour.3': 'tre', 'hour.4': 'fire', 'hour.5': 'fem',
      'hour.6': 'seks', 'hour.7': 'syv', 'hour.8': 'otte', 'hour.9': 'ni', 'hour.10': 'ti',
      'hour.11': 'elleve', 'hour.12': 'tolv',
      // 3:30 is "halv fire" (half.4)
      'half.1': 'halv et', 'half.2': 'halv to', 'half.3': 'halv tre', 'half.4': 'halv fire',
      'half.5': 'halv fem', 'half.6': 'halv seks', 'half.7': 'halv syv', 'half.8': 'halv otte',
      'half.9': 'halv ni', 'half.10': 'halv ti', 'half.11': 'halv elleve', 'half.12': 'halv tolv',
      'klukkan.q_past': 'kvart over {h}',
      'klukkan.q_to': 'kvart i {h}',
      'tolur.count_q.fiskur': 'Hvor mange fisk er der?',
      'tolur.count_q.froskur': 'Hvor mange frøer er der?',
      'tolur.count_q.ungi': 'Hvor mange kyllinger er der?',
      'tolur.count_q.kottur': 'Hvor mange katte er der?',
      'tolur.add': 'Hvad er {a} plus {b}?',
      'tolur.sub': 'Hvad er {a} minus {b}?',
      'tolur.miss_q': 'Hvad mangler?',
      'tolur.miss_add': '{a} plus hvad er {c}?',
      'tolur.miss_sub': '{a} minus hvad er {c}?',
      'talnatafla.start': 'Tryk på et tal, så lytter vi sammen!',
      'talnatafla.play': 'Find et tal',
      'talnatafla.play20': '1–20',
      'talnatafla.find': 'Find tallet {n}!',
      'talnatafla.range': 'Tal fra 1 til 100',
      'talnatafla.all': 'Alle',
      'talnatafla.tens': 'Tiere',
      'talnatafla.fives': 'Femmere',
      'talnatafla.evens': 'Lige',
      'talnatafla.higher': '↑ Højere!',
      'talnatafla.lower': '↓ Lavere!',
      'talnatafla.say_higher': 'Højere!',
      'talnatafla.say_lower': 'Lavere!',
      'bokstafir.q': 'Lyt godt efter! Hvilket ord hører du?',
      'bokstafir.match_q': 'Find det lille bogstav!',
      'bokstafir.first_q': 'Hvilket bogstav begynder ordet med?',
      'klukkan.read_q': 'Hvad er klokken?',
      'klukkan.time': 'Klokken er {t}.',
      'klukkan.set_b': 'Hvor skal den lille viser pege hen?',
      'klukkan.pick_b': 'Find det rigtige ur!',
      'minni.start': 'Find de billeder, der er ens! Vend to kort ad gangen.',
      'minni.pairs6': '6 par',
      'minni.pairs8': '8 par',
      'minni.pairs10': '10 par',
      'minni.pairs12': '12 par',
      'minni.end_title': 'Du fandt alle parrene!',
      'minni.end_flips': 'Du brugte <strong>{n}</strong> træk.',
      'minni.end_flips_one': 'Du brugte <strong>{n}</strong> træk.',
      'minni.end_best': 'Færrest træk: {n}',
      'minni.card': 'Kort {n}',
      'minni.flips': 'Træk',
      'mynstur.q': 'Hvad kommer næst?',
      'maelingar.compare': 'Størrelser',
      'maelingar.size': 'Størrelse {n}',
      'maelingar.longest': 'Hvilken blyant er længst?',
      'maelingar.shortest': 'Hvilken blyant er kortest?',
      'maelingar.tallest': 'Hvilken blomst er højest?',
      'maelingar.lowest': 'Hvilken blomst er lavest?',
      'maelingar.ruler_q': 'Hvor lang er blyanten?',
      'maelingar.weight_q': 'Hvad vejer pakken?',
      'maelingar.ruler_aria': 'Blyant fra 0 til {n} cm på en lineal.',
      'maelingar.scale_aria': 'Vægt i balance: en pakke over for {weights}.',
      'maelingar.cm_one': '{n} centimeter',
      'maelingar.cm_many': '{n} centimeter',
      'maelingar.kg': '{n} kilo',
      'maelingar.move_q': 'Flyt blyanten hen til nul på linealen!',
      'maelingar.move_aria': 'Flyt blyant. Brug piletasterne eller Enter for at lægge den ved nul.',
      'maelingar.place': 'Læg ved nul',
      'ordmyndir.pictures': 'Ord → billede',
      'ordmyndir.words': 'Billede → ord',
      'ordmyndir.picture_q': 'Hvilket billede passer til ordet?',
      'ordmyndir.word_q': 'Hvilket ord passer til billedet?',
      'spegill.q': 'Hvad ser man i spejlet? Træk det rigtige billede på plads!',
      'spegill.hint': 'Husk, at spejlet vender billedet om.',
      'spegill.pictures': 'Billeder',
      'spegill.choice': 'Billede {n}',
      'form.find.hringur': 'Find cirklen!',
      'form.find.ferningur': 'Find kvadratet!',
      'form.find.þríhyrningur': 'Find trekanten!',
      'form.find.rétthyrningur': 'Find rektanglet!',
      'form.find.fimmhyrningur': 'Find femkanten!',
      'form.find.sexhyrningur': 'Find sekskanten!',
      'form.find.átthyrningur': 'Find ottekanten!',
      'form.find.stjarna': 'Find stjernen!',
      'form.find.hjarta': 'Find hjertet!',
      'form.find.tígull': 'Find romben!',
      'form.find.hálfmáni': 'Find halvmånen!',
      'form.find.sporbaugur': 'Find ovalen!',
      'form.sides.0': 'Hvilken form har ingen hjørner?',
      'form.sides.3': 'Hvilken form har tre hjørner?',
      'form.sides.4': 'Hvilken form har fire hjørner?',
      'form.sides.5': 'Hvilken form har fem sider?',
      'form.sides.6': 'Hvilken form har seks sider?',
      'form.sides.8': 'Hvilken form har otte sider?',
      'shape.hringur': 'cirkel',
      'shape.ferningur': 'kvadrat',
      'shape.þríhyrningur': 'trekant',
      'shape.rétthyrningur': 'rektangel',
      'shape.fimmhyrningur': 'femkant',
      'shape.sexhyrningur': 'sekskant',
      'shape.átthyrningur': 'ottekant',
      'shape.stjarna': 'stjerne',
      'shape.hjarta': 'hjerte',
      'shape.tígull': 'rombe',
      'shape.hálfmáni': 'halvmåne',
      'shape.sporbaugur': 'oval',
      'animal.koala': 'koala',
      'animal.froskur': 'frø',
      'animal.ungi': 'kylling',
      'animal.kottur': 'kat',
      'animal.svin': 'gris',
      'animal.bjorn': 'bjørn',
      'animal.fiskur': 'fisk',
      'animal.mariuhaena': 'mariehøne',
      'animal.ugla': 'ugle',
      'animal.mus': 'mus',
      'animal.ljon': 'løve',
      'animal.morgaes': 'pingvin',
      'animal.hundur': 'hund',
      'animal.kyr': 'ko',
      'animal.kind': 'får',
      'animal.hestur': 'hest',
      'animal.ond': 'and',
      'animal.fill': 'elefant',
      'animal.api': 'abe',
      'animal.byfluga': 'bi',
      'thing.bolti': 'bold', 'thing.bill': 'bil', 'thing.hus': 'hus', 'thing.sol': 'sol', 'thing.epli': 'æble',
      'thing.banani': 'banan', 'thing.tre': 'træ', 'thing.blom': 'blomst', 'thing.batur': 'båd', 'thing.kaka': 'kage',
      'thing.lykill': 'nøgle', 'thing.skor': 'sko', 'thing.regnhlif': 'paraply', 'thing.bok': 'bog',
      'thing.flugvel': 'fly', 'thing.bladra': 'ballon', 'thing.iskrem': 'is', 'thing.gulrot': 'gulerod',
      'thing.stoll': 'stol', 'thing.bolli': 'kop', 'thing.skeid': 'ske', 'thing.sokkur': 'sok', 'thing.hufa': 'hue',
      'thing.vettlingur': 'vante', 'thing.tannbursti': 'tandbørste', 'thing.blyantur': 'blyant', 'thing.tromma': 'tromme',
      'thing.lest': 'tog', 'thing.hjol': 'cykel', 'thing.jardarber': 'jordbær', 'thing.pera': 'pære', 'thing.egg': 'æg',
      'thing.kerti': 'lys', 'thing.hamar': 'hammer', 'thing.dreki': 'drage', 'thing.rum': 'seng'
    }
  };

  // Build 11–100 from their spoken forms. Icelandic puts tens first;
  // Danish puts units first and joins them into a single word (enogtyve).
  var TEENS = {
    is: ['ellefu', 'tólf', 'þrettán', 'fjórtán', 'fimmtán', 'sextán', 'sautján', 'átján', 'nítján'],
    da: ['elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten']
  };
  var TENS = {
    is: ['tuttugu', 'þrjátíu', 'fjörutíu', 'fimmtíu', 'sextíu', 'sjötíu', 'áttatíu', 'níutíu'],
    da: ['tyve', 'tredive', 'fyrre', 'halvtreds', 'tres', 'halvfjerds', 'firs', 'halvfems']
  };
  ['is', 'da'].forEach(function (l) {
    var S = STR[l];
    for (var n = 11; n <= 100; n++) {
      var unit = n % 10;
      var ten = TENS[l][Math.floor(n / 10) - 2];
      S['num.' + n] = n < 20 ? TEENS[l][n - 11] :
        n === 100 ? (l === 'is' ? 'eitt hundrað' : 'et hundrede') :
        !unit ? ten : l === 'is' ? ten + ' og ' + S['num.' + unit] : S['num.' + unit] + 'og' + ten;
    }
  });

  // Parent rewards keep their own language and voice, whatever the menu language.
  // They visit the zoo once it holds `need` animals (Kóli counts as the first).
  var FAMILY = {
    mom: { lang: 'da', voice: 'en-US-EmmaMultilingualNeural', text: 'hvor er du dygtig skat', need: 10 },
    dad: { lang: 'is', voice: 'is-IS-GunnarNeural', text: 'frábært Agnes mín', need: 20 }
  };

  // Kóli's Icelandic cheers, said in Icelandic in both languages (da: the gloss is shown)
  var PRAISE = [
    { is: 'Frábært!', da: 'fantastisk!' },
    { is: 'Æðislegt!', da: 'skønt!' },
    { is: 'Snilld!', da: 'genialt!' },
    { is: 'Vel gert!', da: 'godt gået!' },
    { is: 'Geggjað!', da: 'vildt godt!' },
    { is: 'Jibbí!', da: 'jubii!' },
    { is: 'Glæsilegt!', da: 'flot!' },
    { is: 'Meiriháttar!', da: 'super!' },
    { is: 'Vá, flott!', da: 'wow, flot!' },
    { is: 'Húrra!', da: 'hurra!' }
  ];
  var HURRA = 9;

  var KEY = 'kl.lang';
  var LANGS = ['is', 'da'];

  // short real words for the listening game (Bókstafir). Real words, not syllables like
  // "ba": the speech engine spells unknown letter pairs out as abbreviations ("B-A").
  // Families that differ by one letter (mús / hús / lús) make the hard level.
  var WORDS = {
    is: ['mús', 'hús', 'lús', 'hár', 'tár', 'sár', 'kýr', 'dýr', 'api', 'afi', 'amma', 'mamma', 'rós', 'dós',
         'sól', 'sel', 'bók', 'bak', 'lok', 'rok', 'nef', 'net', 'egg', 'ís', 'já', 'nú', 'þú', 'bú', 'bað', 'búð',
         'tré', 'ský', 'kaka', 'taka', 'önd', 'hönd', 'bíll', 'fíll', 'pera', 'lamb'],
    da: ['mus', 'hus', 'bus', 'kat', 'hat', 'is', 'ko', 'so', 'bo', 'bi', 'sol', 'sæl', 'bog', 'tog', 'bil', 'pil',
         'mor', 'far', 'and', 'ost', 'æg', 'sky', 'ske', 'kop', 'top', 'dør', 'bær', 'hår', 'får', 'tå', 'gå',
         'sø', 'ja', 'nu', 'du', 'abe', 'fisk', 'gris', 'kage', 'frø']
  };

  // phrases spoken as they are; combined sentences are built in audioVocab()
  var PHRASES = [
    'koala.hello', 'koala.next', 'level.q', 'end.title', 'try_again', 'sticker.all', 'outfit.new', 'prize.retry', 'prize.done',
    'tolur.count_q.fiskur', 'tolur.count_q.froskur', 'tolur.count_q.ungi', 'tolur.count_q.kottur',
    'bokstafir.q', 'bokstafir.match_q', 'bokstafir.first_q',
    'klukkan.read_q', 'klukkan.set_b', 'klukkan.pick_b',
    'minni.start', 'minni.end_title', 'talnatafla.start', 'talnatafla.say_higher', 'talnatafla.say_lower',
    'mynstur.q', 'maelingar.longest', 'maelingar.shortest', 'maelingar.tallest',
    'maelingar.lowest', 'maelingar.ruler_q', 'maelingar.weight_q', 'maelingar.move_q',
    'ordmyndir.picture_q', 'ordmyndir.word_q', 'spegill.q', 'spegill.hint'
  ];

  // Preferences still work for this visit when storage is blocked or full.
  var currentLang = 'is';
  try {
    var storedLang = window.localStorage.getItem(KEY);
    if (LANGS.indexOf(storedLang) >= 0) currentLang = storedLang;
  } catch (e) { /* use the default */ }

  function lang() { return currentLang; }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0) return;
    currentLang = l;
    try { window.localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
  }

  function fill(s, params) {
    s = String(s);
    Object.keys(params || {}).forEach(function (p) { s = s.split('{' + p + '}').join(String(params[p])); });
    return s;
  }

  function t(k) {
    var l = lang();
    if (STR[l] && STR[l][k] !== undefined) return STR[l][k];
    return STR.is[k] !== undefined ? STR.is[k] : k;
  }

  function fmt(k, params) { return fill(t(k), params); }

  function speechLang(l) { return (l || lang()) === 'da' ? 'da-DK' : 'is-IS'; }

  /* Every spoken clip for a language: audio key -> text. Sentences that join a
     number or a time to words are recorded whole ("Hvað eru þrír plús tveir?"),
     which sounds far smoother than stitching single words together. */
  var vocabCache = {};
  function audioVocab(l) {
    if (vocabCache[l]) return vocabCache[l];
    var S = STR[l], v = {}, a, b, c, h;
    PHRASES.forEach(function (k) { v[k] = S[k]; });
    for (a = 1; a <= 100; a++) v['num.' + a] = S['num.' + a];
    for (a = 1; a <= 10; a++) {
      v['maelingar.cm.' + a] = fill(S[a === 1 ? 'maelingar.cm_one' : 'maelingar.cm_many'], { n: S['num.' + a] });
      v['maelingar.kg.' + a] = fill(S['maelingar.kg'], { n: S['hour.' + a] });
    }
    for (a = 1; a <= 10; a++) {
      for (b = 1; b <= 10; b++) {
        if (a + b <= 10) v['add.' + a + '.' + b] = fill(S['tolur.add'], { a: S['num.' + a], b: S['num.' + b] });
        if (b < a) v['sub.' + a + '.' + b] = fill(S['tolur.sub'], { a: S['num.' + a], b: S['num.' + b] });
      }
    }
    for (a = 6; a <= 15; a++) {
      for (b = 1; b <= 9; b++) {
        if (a + b > 10 && a + b <= 20) v['add.' + a + '.' + b] = fill(S['tolur.add'], { a: S['num.' + a], b: S['num.' + b] });
      }
    }
    for (a = 11; a <= 19; a++) {
      [1, 2, 3, 4, 5, 10].forEach(function (subB) {
        v['sub.' + a + '.' + subB] = fill(S['tolur.sub'], { a: S['num.' + a], b: S['num.' + subB] });
      });
    }
    for (c = 5; c <= 10; c++) {
      for (a = 1; a < c; a++) {
        v['miss.' + a + '.' + c] = fill(S['tolur.miss_add'], { a: S['num.' + a], c: S['num.' + c] });
      }
    }
    for (a = 5; a <= 10; a++) {
      for (c = 1; c < a; c++) {
        v['submiss.' + a + '.' + c] = fill(S['tolur.miss_sub'], { a: S['num.' + a], c: S['num.' + c] });
      }
    }
    for (h = 1; h <= 12; h++) {
      v['time.' + h + '.0'] = fill(S['klukkan.time'], { t: S['hour.' + h] });
      v['time.' + h + '.15'] = fill(S['klukkan.time'], { t: fill(S['klukkan.q_past'], { h: S['hour.' + h] }) });
      v['time.' + h + '.30'] = fill(S['klukkan.time'], { t: S['half.' + (h % 12 + 1)] });
      v['time.' + h + '.45'] = fill(S['klukkan.time'], { t: fill(S['klukkan.q_to'], { h: S['hour.' + (h % 12 + 1)] }) });
    }
    Object.keys(S).forEach(function (k) {
      if (/^(shape|animal|thing|form\.find|form\.sides)\./.test(k)) v[k] = S[k];
      if (k.indexOf('animal.') === 0) v['sticker.' + k.slice(7)] = fill(S['sticker.new'], { a: S[k] });
    });
    WORDS[l].forEach(function (w) { v['word.' + w] = w; });
    Object.keys(FAMILY).forEach(function (id) { if (FAMILY[id].lang === l) v['family.' + id] = FAMILY[id].text; });
    if (l === 'is') PRAISE.forEach(function (p, i) { v['praise.' + i] = p.is; });
    vocabCache[l] = v;
    return v;
  }

  // (re)translate the static page; safe to call repeatedly
  function apply() {
    document.documentElement.lang = lang();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang();
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  var listeners = [];
  function onChange(fn) { listeners.push(fn); }

  document.addEventListener('DOMContentLoaded', function () {
    apply();
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = btn.getAttribute('data-lang');
        if (l === lang()) return;
        setLang(l);
        apply();
        listeners.forEach(function (fn) { try { fn(l); } catch (e) { /* ignore */ } });
      });
    });
  });

  window.KL_I18N = {
    lang: lang, setLang: setLang, t: t, fmt: fmt, fill: fill, speechLang: speechLang, apply: apply, onChange: onChange,
    audioVocab: audioVocab, LANGS: LANGS, WORDS: WORDS, STR: STR, PRAISE: PRAISE, HURRA: HURRA, FAMILY: FAMILY
  };
})();
