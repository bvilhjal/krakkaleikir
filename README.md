# Krakkaleikir

Skemmtilegir lærdómsleikir fyrir lítil börn — einföld vefsíða sem virkar í vafranum á iPad (eða hvaða tæki sem er), líka án nettengingar. Hrein HTML/CSS/JS, engin ytri forritasöfn og ekkert byggingarskref.

Educational browser games for young kids, bilingual Icelandic/Danish (IS/DA toggle in the top bar; the choice is remembered in `localStorage`). Static single-page site, no build step, no dependencies; works offline once loaded.

## Leikir

| Leikur | Hvað er æft | Erfiðleikastig |
|---|---|---|
| Tölur | Talning og einföld dæmi, með punktum til að telja | 1–5: telja upp í 5, samlagning · 1–10: telja upp í 10, samlagning og frádráttur |
| Bókstafir | Hlusta á atkvæði (t.d. „ba“) og finna stafina tvo | Létt: ólík atkvæði · Erfitt: atkvæði með sama samhljóða eða sérhljóða (ba / bi / da) |
| Litir | Litarheiti; hver litur kemur einu sinni | — |
| Form | Formheiti (hringur, ferningur, þríhyrningur, ...) | — |
| Klukkan | Lesa klukkuna og stilla vísinn | 3:00: heilir tímar, vísirinn snýst að tölunni sem bankað er á · 3:30: líka hálfir tímar („hálf fjögur“), finna réttu klukkuna |
| Minni (DA: Vendespil) | Finna pörin | 6 eða 8 pör |

Rangt svar dofnar og spurningin er lesin aftur. Stjörnurnar (1–3) sýna hve margar spurningar voru réttar í fyrstu tilraun (í Minni: hve fáa snúninga þurfti). Bestu stjörnur hvers leiks og stigs birtast í valmyndinni.

## Hljóð

Spurningar, svör og hrós eru lesin upphátt á valnu máli úr tilbúnum mp3-skrám (`audio/<mál>/`, gerðar með talgervli Edge, sjá `tools/make_audio.py`). Ef skrá vantar er Web Speech API notað. Hljóðáhrifin eru búin til í vafranum með Web Audio API. Hljóðhnappurinn efst slekkur á öllu hljóði, líka tali sem er í gangi.

Á iOS þarf eitt bank áður en hljóð má spilast. Eftir það les hver leikur spurninguna um leið og hann opnast, því allt appið er ein síða. Púlserandi hátalarahnappurinn les spurninguna aftur.

## Keyra

- Á netinu: https://bvilhjal.github.io/krakkaleikir/ (GitHub Pages, frá `main`)
- Staðbundið: `python3 -m http.server` í rót repo-sins og opna http://localhost:8000/ (að opna `index.html` beint virkar líka, en þá án offline-stuðnings)

### Á iPad

Opna síðuna í Safari → deila-hnappurinn → „Bæta við heimaskjá“ (Add to Home Screen). Þá kemur app-tákn á heimaskjáinn og síðan keyrir í fullum skjá án Safari-ramma. Eftir fyrstu heimsókn virkar hún líka án nettengingar: `sw.js` geymir allar skrár (um 2,4 MB) og sækir nýja útgáfu þegar hún er komin á netið.

## Uppbygging

```
index.html            eina síðan: valmynd + leikjasvæði (#tolur, #litir, ... í slóðinni)
games/<leikur>.html   vísa áfram á index.html#<leikur> (gömul bókamerki)
manifest.webmanifest  stillingar fyrir „Bæta við heimaskjá“
sw.js                 offline: geymir allar skrár; skráalistinn er búinn til af tools/check.js
js/i18n.js            allir textar á íslensku og dönsku + tungumálaval
js/common.js          leikjavélin, stig, leiðaval milli valmyndar og leikja, SVG-form
js/tts.js, sound.js   tal (mp3) og hljóðáhrif
js/audio-manifest.js  lykill → texti fyrir hverja mp3-skrá (búið til af make_audio.py)
js/<leikur>.js        hver leikur
css/style.css         útlit, snertiskjá-vænlegt (stórir takkar)
audio/is, audio/da    upplesnir textar
icons/                app-tákn (tools/make_icons.py)
tools/check.js        samræmisprófanir; keyrt í GitHub Actions við hvert push
tools/make_audio.py   býr til mp3-skrár og audio-manifest.js
```

## Eftir breytingar

1. Ef texti sem er lesinn upphátt breyttist eða bættist við: `pip install edge-tts` og `python tools/make_audio.py`. Skrár þar sem textinn breyttist eru endurgerðar og skrám sem ekki eru lengur notaðar er eytt.
2. `node tools/check.js --write` uppfærir skráalistann og útgáfuna í `sw.js`, svo iPadinn sæki nýju útgáfuna.
3. `node tools/check.js` athugar að íslenska og danska taflan hafi sömu lykla, að allir lyklar sem kóðinn notar séu til, að hljóðskrár passi við textana og að `sw.js` sé uppfært.

## Nýr leikur

1. Búðu til `js/nafn.js` sem kallar á `KL.register('nafn', { start: function (ctx) { ... } })`. Fyrir valspurningaleiki: `KL.runGame({ ctx, gameId, makeQuestions, build, promptSpeech })`, valfrjálst með `levels`. Sjá `js/litir.js` (einfaldast) og `js/tolur.js` (með stigum).
2. Í `index.html`: kort með `data-nav="nafn"` og merki með `data-game="nafn"`, og `<script src="js/nafn.js">`. Afritaðu `games/litir.html` í `games/nafn.html` og breyttu leiknum sem vísað er á.
3. Í báðar töflur í `js/i18n.js`: `game.nafn`, `title.nafn`, `desc.nafn` og spurningatextar. Textar sem eru lesnir upphátt fara líka í `PHRASE_KEYS` í `tools/make_audio.py`.
4. Svo skrefin í „Eftir breytingar“.
