# Krakkaleikir

Skemmtilegir lærdómsleikir fyrir krakka 5 ára og eldri, með Kóla kóala sem leiðsögumann — einföld vefsíða sem virkar í vafranum á iPad (eða hvaða tæki sem er), líka án nettengingar. Hrein HTML/CSS/JS, engin ytri forritasöfn og ekkert byggingarskref.

Educational browser games for kids aged 5+, guided by Kóli the koala; bilingual Icelandic/Danish (IS/DA toggle in the top bar; the choice is remembered in `localStorage`). Static single-page site, no build step, no dependencies; works offline once loaded.

## Leikir

| Leikur | Hvað er æft | Erfiðleikastig |
|---|---|---|
| Tölur | Telja dýr (banka á hvert dýr til að telja upphátt), leysa dæmi og finna töluna sem vantar | 1–10: telja, samlagning og frádráttur · 1–20: telja upp í 18, dæmi upp í 20 · 3 + ?: hvaða tala vantar (`4 + ? = 10`, `9 − ? = 5`) · 1–100: samlagning og óþekkt tala báðum megin við plús · Formagátur: finna gildi forma og leggja saman |
| Tölutafla (DA: Taltavle) | Tölur 1–100 í tíu dálkum; banka á tölu og heyra heitið, merkja mynstur (tugir/fimm/sléttar), eða talnaleit með vísbendingum (↑ hærra / ↓ lægra, líka lesnar upphátt) | Frjáls könnun í töflu eða talnaslöngu (0–100), talnaleit 1–20 eða 1–100; slangan byrjar á núlli |
| Bókstafir | Para stóra og litla stafi, finna fyrsta staf í heiti dýrs eða hlutar, eða hlusta á orð og finna rétta orðið | Stafir: stafir og upphafsstafir · Létt: ólík orð · Erfitt: orð sem líta eins út (mús / hús / lús) |
| Form (DA: Former) | Finna formin eftir nafni („Finndu sexhyrninginn!“) eða fjölda hliða og horna | Létt: 9 grunnform (þ.m.t. sexhyrningur) · Erfitt: fimm-, sex- og átthyrningur, sporbaugur og hliðaspurningar |
| Klukkan | Lesa klukkuna og stilla vísinn | 3:00: heilir tímar · 3:30: líka hálfir tímar („hálf fjögur“) · 3:15: líka korter („korter yfir“, „korter í“) |
| Minni (DA: Vendespil) | Finna myndirnar sem eru eins (dýr og hlutir); dýrið lætur í sér heyra eða Kóli nefnir hlutinn þegar par finnst | 6, 8, 10 eða 12 pör; einn eða tveir að spila |
| Mynstur (DA: Mønstre) | Finna hvað kemur næst í mynstri eða talnaröð | Létt: AAB, ABB, AABB, ABC · Erfitt: AABB, ABB, ABC og talnaraðir (+1, +2, +5, +10, −1, −2, −5, −10) |
| Mælingar (DA: Måling) | Bera saman stærðir, færa blýant að reglustiku og vigta dularfullan pakka | Stærðir: lengstur/stystur og hæst/lægst · cm: dragðu blýantinn að núlli og lestu lengdina · kg: vigt í jafnvægi með 1, 2 og 5 kg lóðum |
| Orð og myndir (DA: Ord og billeder) | Para heiti dýra og hluta við myndir | Orð → mynd: lesa orðið og velja mynd; mynd sem bankað er á segir heiti sitt · Mynd → orð: lesa og velja orð |
| Spegill (DA: Spejl) | Finna spegilmynd og draga hana í rammann hinum megin við spegilinn (eða banka á hana) | Myndir: hlutir speglaðir til hliðar · Létt: 3×3 kubbamynstur · Erfitt: 4×4 tvílit mynstur, spegillinn stendur eða liggur · Lita spegilmynd: lita sjálf/ur á rúðunet · Frjáls teikning: spegillinn teiknar hinum megin |

Tölutaflan byrjar í frjálsri könnun. „Finndu tölu“ opnar tíu spurninga leik með stjörnum og límmiða. Taflan 1–100 hefur tíu dálka og passar í breidd á síma jafnt sem iPad; talnaleit 1–20 notar fimm dálka og fjórar raðir.

Í Tölum er hvert dýr talið einu sinni; bankaðu aftur á það til að heyra töluna aftur. Stafaleikurinn nær yfir allt íslenska og danska stafrófið. Tungumála- og hljóðval virka líka meðan síðan er opin þótt vafrinn leyfi ekki vistun í `localStorage`.

Language changes requested during a round take effect at its result screen, or when returning to the menu. A notice shows the pending language; tapping the current language cancels it. Answers, drawings and memory cards stay intact, and each exercise keeps one language throughout. Outside a round, language changes are immediate.

If browser storage is unavailable or full, new stars, animals, clothes and prize counts remain available for the current visit. The result screen and menu explain that the new progress has not been saved. Reset also clears this temporary progress.

Talnaslangan í Tölutöflu vindur sig frá 0 til 100. Tugirnir eru rauðir; bankaðu á tölu til að heyra hana eða hoppaðu áfram og afturábak um 1 eða 10. Fimm tölur eru í hverri röð svo takkarnir séu stórir líka á síma. Taflan heldur sínum tíu dálkum. Talnaleit notar þá mynd sem er valin og slangan hefur núll með.

Nýja 1–100 stigið í Tölum æfir að fara yfir tug, t.d. `39 + 6 = ?`, og óþekktan lið á hvorum stað, t.d. `? + 6 = 45` eða `39 + ? = 45`. Í Formagátum gefa þrjú lítil dæmi vísbendingar: ef ferningur + ferningur = 10 er hver ferningur 5. Gildi formanna haldast eins út umferðina; síðan eru lögð saman tvö eða þrjú form.

Í „Lita spegilmynd“ velur barnið lit og bankar í reitina handan spegilsins. Bankaðu aftur á sama lit til að stroka út, notaðu strokleðrið eða hreinsaðu allt. „Athuga“ ber saman alla reiti og liti. Eftir ranga tilraun má laga myndina; stjörnur telja fyrstu tilraun eins og í hinum leikjunum. Blái og rauði liturinn hafa líka ólík tákn. Örvatakkar færa fókus á rúðunetinu; bilslá eða Enter litar reit. Fyrst koma 3×3 eins litar myndir, síðan tveir litir og 4×4 myndir við láréttan spegil.

Í Spegli eru röngu svörin algengu mistökin: sama mynd óspegluð, á hvolfi eða snúið hálfan hring. Dragðu mynd í rammann; ef hún er röng hristist hún og fer aftur á sinn stað.

Frjáls teikning í Spegli gefur engar stjörnur. Barnið velur einn af níu litum og teiknar á 10×10 rúðublað, með fingrinum eða með því að banka; spegillinn teiknar spegilmyndina um leið, til hliðar, upp og niður eða í allar áttir. Hver röð hefur sinn tón. „Afturkalla“ tekur síðustu strokuna til baka (líka „Hreinsa“) og „Sýna Kóla“ fær hrós. Myndin geymist meðan appið er opið.

Í Minni má velja „Tveir að spila“: ljónið og mörgæsin skiptast á. Sá sem finnur par fær að gera aftur, annars á hinn leik, og sá sem finnur fleiri pör fær kórónu. Tveggja manna leikur gefur engar stjörnur eða verðlaun.

Í Mælingum hafa samanburðarmyndir allar sama kvarða og grunnlínu, svo lengri blýantur er í raun lengri á skjánum. Dragðu blýantinn að græna núllmerkinu fyrir ofan reglustikuna; hann smellur á sinn stað og svarhnapparnir opnast. Örvatakkar færa blýantinn líka; Enter eða „Setja við núll“ stillir hann beint. Reglustikan sýnir 0–10 cm. Vigtin er í jafnvægi: leggðu saman merktu lóðin til að finna þyngd pakkans (1–10 kg). Þetta eru myndrænar mælingar; sentímetri á teikningunni er ekki sentímetri á skjánum.

Orð og myndir notar 20 dýr og 36 hluti (bolta, bíl, hús, epli, regnhlíf, bolla, lest, hjól …); hver umferð hefur tíu ólík markorð, fimm dýr og fimm hluti. Í „Orð → mynd“ les Kóli orðið aldrei upp, því barnið á að lesa það; þegar bankað er á mynd segir hún heiti sitt, líka þegar hún er röng. Veldu rétta mynd við orðið eða rétta orðið við myndina. Rétt svar sýnir bæði mynd og orð saman og les heitið upphátt. Báðar leiðir nota stjörnur og límmiða eins og hinir leikirnir.

Kóli les spurninguna í talblöðru og hreyfir munninn á meðan; bankaðu á hann til að heyra hana aftur. Hann hrósar á íslensku („Frábært!“, „Geggjað!“, „Jibbí!“), líka í dönsku útgáfunni, þar sem merkingin birtist undir. Rangt svar dofnar og spurningin er lesin aftur. Stjörnurnar (1–3) sýna hve margar spurningar voru réttar í fyrstu tilraun (í Minni: hve fáa snúninga þurfti). Markmiðið er að fylla dýragarðinn. Verðlaun fást aðeins fyrir góða umferð (í mesta lagi þrjár spurningar rangar í fyrstu tilraun; í Minni: tvær stjörnur) og í mesta lagi þrisvar úr hverjum leik; gjafirnar þrjár á hverju leikjaspjaldi sýna hve mörg verðlaun eru eftir. Annars segir Kóli hvað þarf til, eða að prófa annan leik. Verðlaunin koma til skiptis: tvisvar nýtt dýr í „Dýragarðinn minn“ á forsíðunni og svo eitthvað nýtt handa Kóla (10 hlutir: hattar, gleraugu, yfirvaraskegg, slaufa og fleira). Í dýragarðinum eru 20 dýr í fimm svæðum: sveitinni, skóginum, tjörninni, gresjunni og garðinum; Kóli býr þar frá byrjun. Kóli fer strax í nýja hlutinn; í „Fataskáp Kóla“ á forsíðunni má klæða hann að vild (einn hlutur á höfuð, augu, munn og háls) og hann klæðist því í öllum leikjum. Þrjú rétt svör í röð í fyrstu tilraun kveikja á stjörnuteljara; við 3, 5, 7 … í röð snýr Kóli sér í hring og konfettí fellur. Bankaðu þrisvar hratt á Kóla til að kitla hann. Hvert rétt svar í röð í fyrstu tilraun hljómar tóni hærra, upp í áttund; í Minni hækkar tónninn með hverju pari í röð. Ef enginn snertir skjáinn í 30 sekúndur sofnar Kóli; bankaðu á hann til að vekja hann og heyra spurninguna aftur.

## Hljóð

Mamma kemur í heimsókn í dýragarðinn þegar tíu dýr eru komin og pabbi þegar öll tuttugu eru komin; þau segja setninguna sína um leið og þau koma. Bankaðu á pabba til að heyra „frábært Agnes mín“ með karlrödd á íslensku, eða mömmu til að heyra „hvor er du dygtig skat“ með kvenrödd á dönsku. Setningarnar haldast eins þótt skipt sé um tungumál. Þau birtast líka strax hjá þeim sem hafa þegar safnað nógu mörgum dýrum og fara aftur ef byrjað er upp á nýtt.

Bankaðu á dýr í dýragarðinum til að heyra hljóð þess, líka þegar nýtt dýr birtist eftir leik. Ljónið öskrar, kötturinn mjálmar, grísinn rýtur, hundurinn geltir, kýrin baular, kindin jarmar, hesturinn hneggjar, öndin segir bra-bra, fíllinn blæs í ranann, apinn skrækir og býflugan suðar. Froskurinn kurrar, ugla hóar, músin pípir, ungi kvakar og mörgæsin kallar. Fiskurinn fær fjörugar loftbólur og maríuhænan létt vængjablak. Hljóðin virka án nettengingar og hlýða hljóðhnappnum.

Þrettán dýrahljóðanna eru hljóðskrár: raunverulegar upptökur frá [Mixkit](https://mixkit.co/license/) (köttur, hundur, kýr, hestur, api, býfluga), kind af Wikimedia Commons (almenningseign) og gervigreindargerðar CC0-skrár frá [SFXMint](https://sfxmint.com/license) (kóali, grís, björn, ljón, önd, fíll). Allar eru geymdar í `audio/animals/`; uppruni, vinnsla og SHA256 eru í `audio/animals/credits.json`. Hin sjö eru leikræn Web Audio-hljóð sem herma eftir dýrunum (sjá `tools/audition.js`).

Raddir foreldra eru stilltar sérstaklega í `FAMILY` í `js/i18n.js`: Gunnar fyrir pabba og Emma Multilingual fyrir mömmu (Christel skilar engu hljóði). `audio/manifest.json` skráir þessi frávik frá rödd Kóla; aðeins viðkomandi skrár eru endurgerðar þegar rödd breytist.

Allt tal er í tilbúnum mp3-skrám (`audio/<mál>/`), gerðum með talgervli Edge (rödd Kóla: is-IS-Gunnar og da-DK-Jeppe; sjá `tools/make_audio.py`). Heilar setningar eru teknar upp í einu lagi („Hvað eru þrír plús tveir?“, „Klukkan er hálf fjögur.“) og þögnin fremst og aftast í hverri skrá er klippt burt, svo talið flæðir án hléa. Bókstafir notar raunveruleg orð en ekki atkvæði eins og „ba“, sem talgervillinn stafar oft eins og skammstöfun; hvert orð er tekið upp eitt og sér. Danska röddin les stutt lokaorð með punkti sem skammstöfun („Klokken er ti.“ verður „tirsdag“), svo punkturinn er tekinn af dönskum texta áður en hann er lesinn inn. Á `tools/listen.html` (á netinu: https://bvilhjal.github.io/krakkaleikir/tools/listen.html) er hægt að hlusta á allar skrárnar og merkja þær sem hljóma rangt. Ef skrá vantar er Web Speech API notað. Almenn leikjahljóð eru búin til í vafranum með Web Audio API. Hljóðhnappurinn efst slekkur á öllu hljóði, líka tali sem er í gangi.

Á iOS þarf eitt bank áður en hljóð má spilast. Eftir það les hver leikur spurninguna um leið og hann opnast, því allt appið er ein síða. Ef Kóli vaggar sér þarf að banka á hann til að heyra spurninguna.

## Keyra

- Á netinu: https://bvilhjal.github.io/krakkaleikir/ (GitHub Pages, frá `main`)
- Staðbundið: `python3 -m http.server` í rót repo-sins og opna http://localhost:8000/ (að opna `index.html` beint virkar líka, en þá án offline-stuðnings)

### Á iPad

Opna síðuna í Safari → deila-hnappurinn → „Bæta við heimaskjá“ (Add to Home Screen). Þá kemur app-tákn á heimaskjáinn og síðan keyrir í fullum skjá án Safari-ramma. Eftir fyrstu heimsókn virkar hún líka án nettengingar: `sw.js` geymir allar skrár (um 14 MB) og leitar að nýrri útgáfu í hvert sinn sem appið er opnað. Ný útgáfa tekur gildi næst þegar valmyndin birtist, aldrei í miðjum leik.

## Uppbygging

```
index.html            eina síðan: valmynd + leikjasvæði (#tolur, #form, ... í slóðinni)
games/<leikur>.html   vísa áfram á index.html#<leikur> (gömul bókamerki)
manifest.webmanifest  stillingar fyrir „Bæta við heimaskjá“
sw.js                 offline: geymir allar skrár; skráalistinn er búinn til af tools/check.js
js/i18n.js            allir textar á íslensku og dönsku, tungumálaval og audioVocab(): listi yfir allt tal
js/common.js          Kóli (talblaðra, svipbrigði), leikjavélin, stig, límmiðar, leiðaval
js/art.js             teikningar: Kóli og fötin hans, dýrin, dýragarðurinn og hlutirnir (SVG)
js/tts.js, sound.js   tal (mp3) og hljóðáhrif
js/<leikur>.js        hver leikur
css/style.css         útlit, snertiskjá-vænlegt (stórir takkar)
audio/is, audio/da    upplesnir textar
audio/manifest.json   úr hvaða texta og stillingum hver mp3-skrá var gerð (make_audio.py)
icons/                app-tákn (tools/make_icons.py)
tools/check.js        samræmisprófanir; keyrt í GitHub Actions við hvert push
tools/smoke.js        keyrir alla leikina í gegn í headless Chrome (CDP, engin forritasöfn; Node ≥ 22); keyrt í GitHub Actions
tools/audition.js     mælir dýrahljóðin (Web Audio í headless Chrome) og skrifar WAV-forskoðun; keyrt í GitHub Actions
tools/make_audio.py   býr til mp3-skrárnar og klippir þögnina burt
tools/listen.html     hlusta á allar mp3-skrárnar og merkja þær sem hljóma rangt
```

## Eftir breytingar

1. Ef texti sem er lesinn upphátt breyttist eða bættist við: `pip install edge-tts imageio-ffmpeg` og `python tools/make_audio.py`. Skrár þar sem textinn breyttist eru endurgerðar og skrám sem ekki eru lengur notaðar er eytt.
2. `node tools/check.js --write` uppfærir skráalistann og útgáfuna í `sw.js`, svo iPadinn sæki nýju útgáfuna.
3. `node tools/check.js` athugar að íslenska og danska taflan hafi sömu lykla, að allir lyklar sem kóðinn notar séu til, að hljóðskrár passi við textana og að `sw.js` sé uppfært.
4. `node tools/smoke.js` (valfrjálst, þarf Chrome/Chromium og Node ≥ 22) spilar alla leikina í gegn í headless Chrome. Prófið sannreynir líka rétt svör í dæmum og mynstrum, erfiðleikastig forma og upptekið tal á báðum tungumálum, talningu, stöðvun talgervils, lyklaborð í Minni, tungumála- og hljóðval án vistunar, núllstillingu, mjóa skjái og offline-ham. GitHub Actions keyrir þetta við hvert push.

For focused checks, `SMOKE_FILTER='question generators|language changes preserve|progress survives' node tools/smoke.js` runs the shape, in-round language and temporary-progress regressions.

## Nýr leikur

1. Búðu til `js/nafn.js` sem kallar á `KL.register('nafn', { start: function (ctx) { ... } })`. Fyrir valspurningaleiki: `KL.runGame({ ctx, gameId, makeQuestions, promptText, promptSpeech, build })`, valfrjálst með `levels`. Sjá `js/mynstur.js` og `js/tolur.js`.
2. Í `index.html`: kort með `data-nav="nafn"` og merki með `data-game="nafn"`, og `<script src="js/nafn.js">`. Afritaðu `games/mynstur.html` í `games/nafn.html` og breyttu leiknum sem vísað er á.
3. Í báðar töflur í `js/i18n.js`: `game.nafn`, `title.nafn`, `desc.nafn` og spurningatextar. Textar sem eru lesnir upphátt fara líka í `PHRASES` (eða setningar í `audioVocab()`) í sama skjali.
4. Svo skrefin í „Eftir breytingar“.
