# Krakkaleikir

Skemmtilegir lærdómsleikir fyrir lítil börn, með Kóla kóala sem leiðsögumann — einföld vefsíða sem virkar í vafranum á iPad (eða hvaða tæki sem er), líka án nettengingar. Hrein HTML/CSS/JS, engin ytri forritasöfn og ekkert byggingarskref.

Educational browser games for young kids, guided by Kóli the koala; bilingual Icelandic/Danish (IS/DA toggle in the top bar; the choice is remembered in `localStorage`). Static single-page site, no build step, no dependencies; works offline once loaded.

## Leikir

| Leikur | Hvað er æft | Erfiðleikastig |
|---|---|---|
| Tölur | Telja dýr og leysa einföld dæmi, með dýrum til að telja | 1–5: telja upp í 5, samlagning · 1–10: telja upp í 10, samlagning og frádráttur |
| Tölutafla (DA: Taltavle) | Tölur 1–100 í tíu dálkum; banka á tölu og heyra heitið, eða finna tíu tölur sem Kóli les | Frjáls könnun eða talnaleit |
| Bókstafir | Hlusta á stutt orð (t.d. „mús“) og finna það skrifað | Létt: ólík orð · Erfitt: orð sem líta eins út (mús / hús / lús) |
| Litir | Litarheiti; hver litur kemur einu sinni | — |
| Form | Hlusta á formheiti og velja réttu myndina (hringur, ferningur, þríhyrningur, ...) | — |
| Klukkan | Lesa klukkuna og stilla vísinn | 3:00: heilir tímar, vísirinn snýst að tölunni sem bankað er á · 3:30: líka hálfir tímar („hálf fjögur“), finna réttu klukkuna |
| Minni (DA: Vendespil) | Finna dýrin sem eru eins | 6 eða 8 pör |

Tölutaflan byrjar í frjálsri könnun. „Finndu tölu“ opnar tíu spurninga leik með stjörnum og límmiða. Á þröngum skjám má strjúka töflunni til hliðar; dálkarnir eru alltaf tíu.

Kóli les spurninguna í talblöðru og hreyfir munninn á meðan; bankaðu á hann til að heyra hana aftur. Hann hrósar á íslensku („Frábært!“, „Geggjað!“, „Jibbí!“), líka í dönsku útgáfunni, þar sem merkingin birtist undir. Rangt svar dofnar og spurningin er lesin aftur. Stjörnurnar (1–3) sýna hve margar spurningar voru réttar í fyrstu tilraun (í Minni: hve fáa snúninga þurfti). Eftir hvern leik kemur nýr dýralímmiði í límmiðabókina á forsíðunni (12 dýr).

## Hljóð

Bankaðu á límmiða sem þú hefur safnað til að heyra hljóð dýrsins, líka þegar nýr límmiði birtist eftir leik. Ljónið öskrar, kötturinn mjálmar og grísinn rýtur. Fiskurinn fær fjörugar loftbólur og maríuhænan létt vængjablak. Hljóðin virka án nettengingar og hlýða hljóðhnappnum.

Fimm stutt dýrahljóð eru tilbúnar, gervigreindargerðar CC0-hljóðskrár frá [SFXMint](https://sfxmint.com/license), geymdar í `audio/animals/`; uppruni, vinnsla og SHA256 eru í `audio/animals/credits.json`. Hin sjö eru leikræn Web Audio-hljóð.

Allt tal er í tilbúnum mp3-skrám (`audio/<mál>/`), gerðum með talgervli Edge (rödd Kóla: is-IS-Gunnar og da-DK-Jeppe; sjá `tools/make_audio.py`). Heilar setningar eru teknar upp í einu lagi („Hvað eru þrír plús tveir?“, „Klukkan er hálf fjögur.“) og þögnin fremst og aftast í hverri skrá er klippt burt, svo talið flæðir án hléa. Bókstafir notar raunveruleg orð en ekki atkvæði eins og „ba“, sem talgervillinn stafar oft eins og skammstöfun; hvert orð er sagt í setningu („Hlustaðu: mús.“) og klippt út. Á `tools/listen.html` (á netinu: https://bvilhjal.github.io/krakkaleikir/tools/listen.html) er hægt að hlusta á allar skrárnar og merkja þær sem hljóma rangt. Ef skrá vantar er Web Speech API notað. Almenn leikjahljóð eru búin til í vafranum með Web Audio API. Hljóðhnappurinn efst slekkur á öllu hljóði, líka tali sem er í gangi.

Á iOS þarf eitt bank áður en hljóð má spilast. Eftir það les hver leikur spurninguna um leið og hann opnast, því allt appið er ein síða. Ef Kóli vaggar sér þarf að banka á hann til að heyra spurninguna.

## Keyra

- Á netinu: https://bvilhjal.github.io/krakkaleikir/ (GitHub Pages, frá `main`)
- Staðbundið: `python3 -m http.server` í rót repo-sins og opna http://localhost:8000/ (að opna `index.html` beint virkar líka, en þá án offline-stuðnings)

### Á iPad

Opna síðuna í Safari → deila-hnappurinn → „Bæta við heimaskjá“ (Add to Home Screen). Þá kemur app-tákn á heimaskjáinn og síðan keyrir í fullum skjá án Safari-ramma. Eftir fyrstu heimsókn virkar hún líka án nettengingar: `sw.js` geymir allar skrár (um 6,9 MB) og sækir nýja útgáfu þegar hún er komin á netið.

## Uppbygging

```
index.html            eina síðan: valmynd + leikjasvæði (#tolur, #litir, ... í slóðinni)
games/<leikur>.html   vísa áfram á index.html#<leikur> (gömul bókamerki)
manifest.webmanifest  stillingar fyrir „Bæta við heimaskjá“
sw.js                 offline: geymir allar skrár; skráalistinn er búinn til af tools/check.js
js/i18n.js            allir textar á íslensku og dönsku, tungumálaval og audioVocab(): listi yfir allt tal
js/common.js          Kóli (talblaðra, svipbrigði), leikjavélin, stig, límmiðar, leiðaval
js/art.js             teikningar: Kóli og dýrin (SVG)
js/tts.js, sound.js   tal (mp3) og hljóðáhrif
js/<leikur>.js        hver leikur
css/style.css         útlit, snertiskjá-vænlegt (stórir takkar)
audio/is, audio/da    upplesnir textar
audio/manifest.json   úr hvaða texta og stillingum hver mp3-skrá var gerð (make_audio.py)
icons/                app-tákn (tools/make_icons.py)
tools/check.js        samræmisprófanir; keyrt í GitHub Actions við hvert push
tools/make_audio.py   býr til mp3-skrárnar og klippir þögnina burt
tools/listen.html     hlusta á allar mp3-skrárnar og merkja þær sem hljóma rangt
```

## Eftir breytingar

1. Ef texti sem er lesinn upphátt breyttist eða bættist við: `pip install edge-tts imageio-ffmpeg` og `python tools/make_audio.py`. Skrár þar sem textinn breyttist eru endurgerðar og skrám sem ekki eru lengur notaðar er eytt.
2. `node tools/check.js --write` uppfærir skráalistann og útgáfuna í `sw.js`, svo iPadinn sæki nýju útgáfuna.
3. `node tools/check.js` athugar að íslenska og danska taflan hafi sömu lykla, að allir lyklar sem kóðinn notar séu til, að hljóðskrár passi við textana og að `sw.js` sé uppfært.

## Nýr leikur

1. Búðu til `js/nafn.js` sem kallar á `KL.register('nafn', { start: function (ctx) { ... } })`. Fyrir valspurningaleiki: `KL.runGame({ ctx, gameId, makeQuestions, promptText, promptSpeech, build })`, valfrjálst með `levels`. Sjá `js/litir.js` (einfaldast) og `js/tolur.js` (með stigum).
2. Í `index.html`: kort með `data-nav="nafn"` og merki með `data-game="nafn"`, og `<script src="js/nafn.js">`. Afritaðu `games/litir.html` í `games/nafn.html` og breyttu leiknum sem vísað er á.
3. Í báðar töflur í `js/i18n.js`: `game.nafn`, `title.nafn`, `desc.nafn` og spurningatextar. Textar sem eru lesnir upphátt fara líka í `PHRASES` (eða setningar í `audioVocab()`) í sama skjali.
4. Svo skrefin í „Eftir breytingar“.
