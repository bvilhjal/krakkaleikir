/* Bilingual strings (Icelandic / Danish) + language toggle for Krakkaleikir.
   Load before sound.js / tts.js / common.js on every page.
   Language is stored in localStorage ('kl.lang').
   Keys 'num.*', 'color.*', 'shape.*', 'letter.*' (letters) and the phrase keys are
   also the audio keys used by js/audio-manifest.js + audio/<lang>/*.mp3. */
(function () {
  'use strict';

  var STR = {
    is: {
      'title.menu': 'Krakkaleikir',
      'menu.subtitle': 'Veldu leik og byrjaðu að spila!',
      'game.tolur': 'Tölur',
      'game.bokstafir': 'Bókstafir',
      'game.litir': 'Litir',
      'game.form': 'Form',
      'game.klukkan': 'Klukkan',
      'game.minni': 'Minni',
      'desc.tolur': 'Teldu kúlurnar og leystu einföld dæmi',
      'desc.bokstafir': 'Hlustaðu á stafinn og finndu hann',
      'desc.litir': 'Hvaða litur er á myndinni?',
      'desc.form': 'Hvað heitir þetta form?',
      'desc.klukkan': 'Lærðu hvað klukkan er og stilltu vísana',
      'desc.minni': 'Finndu pörin í minnarleiknum',
      'footer.note': 'Bestu stig geymast í vafranum þínum.',
      'footer.reset': 'Hreinsa stig',
      'badge.not_played': 'Ekki búið að spila',
      'badge.best': 'Best: {n} / 10',
      'badge.best_flips': 'Best: {n} snúningar',
      'back.aria': 'Til baka í valmynd',
      'speak.aria': 'Hlusta',
      'title.tolur': 'Tölur — Krakkaleikir',
      'title.bokstafir': 'Bókstafir — Krakkaleikir',
      'title.litir': 'Litir — Krakkaleikir',
      'title.form': 'Form — Krakkaleikir',
      'title.klukkan': 'Klukkan — Krakkaleikir',
      'title.minni': 'Minni — Krakkaleikir',
      'end.title': 'Þú kláraðir leikinn!',
      'end.score': 'Þú fékkst <strong>{c} af {t}</strong> rätt.',
      'end.best': 'Bestu stig í þessum leik: {b} / {t}',
      'end.replay': 'Spila aftur',
      'end.menu': 'Til baka í valmynd',
      'try_again': 'Reyndu aftur!',
      'praise.0': 'Rétt!',
      'praise.1': 'Frábært!',
      'praise.2': 'Vel gert!',
      'praise.3': 'Alveg rétt!',
      'praise.4': 'Svoleiðis!',
      'praise.5': 'Æðislegt!',
      'num.1': 'einn', 'num.2': 'tveir', 'num.3': 'þrír', 'num.4': 'fjórir', 'num.5': 'fimm',
      'num.6': 'sex', 'num.7': 'sjö', 'num.8': 'átta', 'num.9': 'níu', 'num.10': 'tíu',
      'num.11': 'ellefu', 'num.12': 'tólf',
      'tolur.count_q': 'Hvað eru margar kúlur?',
      'tolur.plus': 'plús',
      'tolur.add_q': 'Hvað er útkoman?',
      'bokstafir.q': 'Hvaða stafur heyrist?',
      'litir.q': 'Hvaða litur er þetta?',
      'form.q': 'Hvað heitir þetta form?',
      'klukkan.read_q': 'Hvað er klukkan?',
      'klukkan.set_a': 'Klukkan er',
      'klukkan.set_b': 'Á hvaða tölu á vísirinn að benda?',
      'klukkan.clock_is_a': 'Klukkan er',
      'minni.start': 'Finndu pörin! Snúðu tveimur spjöldum í einu og reyndu að muna hvar myndirnar eru.',
      'minni.pairs6': '6 pör',
      'minni.pairs8': '8 pör',
      'minni.end_title': 'Þú fannst öll pörin!',
      'minni.end_flips': 'Þú notaðir <strong>{n}</strong> snúninga.',
      'minni.end_best': 'Fæstu snúningar: {n}',
      'color.rauður': 'rauður',
      'color.blár': 'blár',
      'color.gulur': 'gulur',
      'color.grænn': 'grænn',
      'color.fjólublár': 'fjólublár',
      'color.appelsínugulur': 'appelsínugulur',
      'color.bleikur': 'bleikur',
      'color.brúnn': 'brúnn',
      'color.svartur': 'svartur',
      'color.grár': 'grár',
      'shape.hringur': 'hringur',
      'shape.ferningur': 'ferningur',
      'shape.þríhyrningur': 'þríhyrningur',
      'shape.rétthyrningur': 'rétthyrningur',
      'shape.stjarna': 'stjarna',
      'shape.hjarta': 'hjarta'
    },
    da: {
      'title.menu': 'Krakkaleikir',
      'menu.subtitle': 'Vælg et spil og begynd at spille!',
      'game.tolur': 'Tal',
      'game.bokstafir': 'Bogstaver',
      'game.litir': 'Farver',
      'game.form': 'Former',
      'game.klukkan': 'Uret',
      'game.minni': 'Hukommelse',
      'desc.tolur': 'Tæl kuglerne og løs simple regnestykker',
      'desc.bokstafir': 'Lyt til bogstavet og find det',
      'desc.litir': 'Hvilken farve er der på billedet?',
      'desc.form': 'Hvad hedder denne form?',
      'desc.klukkan': 'Lær hvad klokken er, og sæt viserne',
      'desc.minni': 'Find parrene i hukommelsesspillet',
      'footer.note': 'De bedste point gemmes i din browser.',
      'footer.reset': 'Nulstil point',
      'badge.not_played': 'Ikke spillet endnu',
      'badge.best': 'Bedste: {n} / 10',
      'badge.best_flips': 'Bedste: {n} træk',
      'back.aria': 'Tilbage til menuen',
      'speak.aria': 'Lyt',
      'title.tolur': 'Tal — Krakkaleikir',
      'title.bokstafir': 'Bogstaver — Krakkaleikir',
      'title.litir': 'Farver — Krakkaleikir',
      'title.form': 'Former — Krakkaleikir',
      'title.klukkan': 'Uret — Krakkaleikir',
      'title.minni': 'Hukommelse — Krakkaleikir',
      'end.title': 'Du klarede spillet!',
      'end.score': 'Du fik <strong>{c} af {t}</strong> rigtige.',
      'end.best': 'Bedste point i dette spil: {b} / {t}',
      'end.replay': 'Spil igen',
      'end.menu': 'Tilbage til menuen',
      'try_again': 'Prøv igen!',
      'praise.0': 'Rigtigt!',
      'praise.1': 'Fantastisk!',
      'praise.2': 'Godt gået!',
      'praise.3': 'Helt rigtigt!',
      'praise.4': 'Sejt!',
      'praise.5': 'Flot klaret!',
      'num.1': 'en', 'num.2': 'to', 'num.3': 'tre', 'num.4': 'fire', 'num.5': 'fem',
      'num.6': 'seks', 'num.7': 'syv', 'num.8': 'otte', 'num.9': 'ni', 'num.10': 'ti',
      'num.11': 'elleve', 'num.12': 'tolv',
      'tolur.count_q': 'Hvor mange kugler er der?',
      'tolur.plus': 'plus',
      'tolur.add_q': 'Hvad er resultatet?',
      'bokstafir.q': 'Hvilket bogstav kan du høre?',
      'litir.q': 'Hvilken farve er det?',
      'form.q': 'Hvad hedder denne form?',
      'klukkan.read_q': 'Hvad er klokken?',
      'klukkan.set_a': 'Klokken er',
      'klukkan.set_b': 'Hvilket tal skal viseren pege på?',
      'klukkan.clock_is_a': 'Klokken er',
      'minni.start': 'Find parrene! Vend to kort ad gangen, og husk hvor billederne ligger.',
      'minni.pairs6': '6 par',
      'minni.pairs8': '8 par',
      'minni.end_title': 'Du fandt alle parrene!',
      'minni.end_flips': 'Du brugte <strong>{n}</strong> træk.',
      'minni.end_best': 'Færrest træk: {n}',
      'color.rauður': 'rød',
      'color.blár': 'blå',
      'color.gulur': 'gul',
      'color.grænn': 'grøn',
      'color.fjólublár': 'lilla',
      'color.appelsínugulur': 'orange',
      'color.bleikur': 'lyserød',
      'color.brúnn': 'brun',
      'color.svartur': 'sort',
      'color.grár': 'grå',
      'shape.hringur': 'cirkel',
      'shape.ferningur': 'kvadrat',
      'shape.þríhyrningur': 'trekant',
      'shape.rétthyrningur': 'rektangel',
      'shape.stjarna': 'stjerne',
      'shape.hjarta': 'hjerte'
    }
  };

  var KEY = 'kl.lang';
  var LANGS = ['is', 'da'];

  // alphabets per language; letter -> spoken name overrides for special letters
  var ALPHABETS = {
    is: 'a á b d ð e é f g h i í j k l m n o ó p r s t u ú v x y ý þ æ ö'.split(' '),
    da: 'a b c d e f g h i j k l m n o p q r s t u v w x y z æ ø å'.split(' ')
  };
  var LETTER_NAMES = {
    is: { 'ð': 'eð', 'þ': 'þorn' },
    da: {}
  };

  function lang() {
    try {
      var l = window.localStorage.getItem(KEY);
      return LANGS.indexOf(l) >= 0 ? l : 'is';
    } catch (e) { return 'is'; }
  }

  function setLang(l) {
    try { window.localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
  }

  function t(k) {
    var l = lang();
    if (STR[l] && STR[l][k] !== undefined) return STR[l][k];
    return STR.is[k] !== undefined ? STR.is[k] : k;
  }

  function fmt(k, params) {
    var s = String(t(k));
    if (params) {
      Object.keys(params).forEach(function (p) { s = s.split('{' + p + '}').join(String(params[p])); });
    }
    return s;
  }

  function speechLang() { return lang() === 'da' ? 'da-DK' : 'is-IS'; }

  function apply() {
    document.documentElement.lang = lang();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang()) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
        window.location.reload();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', apply);

  window.KL_I18N = {
    lang: lang, setLang: setLang, t: t, fmt: fmt, speechLang: speechLang,
    LANGS: LANGS, ALPHABETS: ALPHABETS, LETTER_NAMES: LETTER_NAMES
  };
})();
