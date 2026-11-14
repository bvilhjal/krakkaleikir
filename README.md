# Krakkaleikir

Skemmtilegir lærdómsleikir fyrir lítil börn — einföld vefsíða sem virkar í vafranum á iPad (eða hvaða tæki sem er). Engar utanaðkomandi dépendansíur, bara HTML/CSS/JS.

Educational browser games for young kids, in Icelandic. Static site, no build step, no dependencies.

## Leikir

| Leikur | Hvað er æft |
|---|---|
| Tölur | Talning 1–5 og einföld samlagning (niðurstöður ≤ 10) |
| Bókstafir | Hlustun á stafi í íslenska stafrófinu |
| Litir | Litarheiti |
| Form | Formheiti (hringur, ferningur, þríhyrningur, ...) |
| Klukkan | Lesa klukkuna (heil klukkuslög) og setja vísirinn með tapi |
| Minni | Minnisspil — finndu pörin (6 eða 8 pör) |

Spurningarnar eru lesnar upphátt á íslensku (Web Speech API, `is-IS`) og hægt er að hlusta aftur með hnappi efst í hægra horninu. Bestu stig geymast í `localStorage` í vafranum.

## Keyra

Opna bara `index.html` í vafra, eða hýsa síðuna:

- GitHub Pages: `https://bvilhjal.github.io/krakkaleikir/` (ef síðan er gerð opinber)
- Staðbundið: `python3 -m http.server` í rót repo-sins

### Á iPad

Opna síðuna í Safari → deila-hnappurinn → "Bæta við heimaskjá" (Add to Home Screen). Þá kemur app-tákn á heimaskjáinn og síðan keyrir í fullum skjá án Safari-ramma.

## Uppbygging

```
index.html          valmynd
manifest.webmanifest  "add to home screen" stillingar
games/              ein síða per leik
js/common.js        sameiginleg rökfræði (leikjaveslið, talmál, stig, SVG-form)
js/<leikur>.js      hver leikur
css/style.css       útlit, snertiskjá-vænlegt (stórir takkar)
icons/              app-tákn (búin til með tools/make_icons.py)
tools/make_icons.py  endurgerir táknin: python tools/make_icons.py
```

## Nýr leikur

1. Búðu til `games/nafn.html` (afrita frá annarri síðu) og `js/nafn.js`.
2. Notaðu `KL.runGame({ gameId, main, scoreEl, questions, build, promptSpeech })` fyrir valspurningaleiki — sjá `js/tolur.js` sem dæmi.
3. Bættu korti í `index.html`.
