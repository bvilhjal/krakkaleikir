/* Bilingual strings (Icelandic / Danish) + language toggle for Krakkaleikir.
   Load first. Language is stored in localStorage ('kl.lang').
   Spoken keys ('num.*', 'hour.*', 'half.*', 'color.*', 'shape.*', 'syl.*' and the
   phrase keys listed in tools/make_audio.py) are also the audio keys used by
   js/audio-manifest.js + audio/<lang>/*.mp3: after editing a spoken string, re-run
   tools/make_audio.py. Both tables must have the same keys (tools/check.js). */
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
      'desc.bokstafir': 'Hlustaðu á hljóðið og finndu stafina tvo',
      'desc.litir': 'Hvaða litur er á myndinni?',
      'desc.form': 'Hvað heitir þetta form?',
      'desc.klukkan': 'Lærðu hvað klukkan er og stilltu vísana',
      'desc.minni': 'Finndu pörin í minnisleiknum',
      'footer.note': 'Bestu stig geymast í vafranum þínum.',
      'footer.reset': 'Hreinsa stig',
      'badge.not_played': 'Ekki búið að spila',
      'back.aria': 'Til baka í valmynd',
      'speak.aria': 'Hlusta',
      'title.tolur': 'Tölur — Krakkaleikir',
      'title.bokstafir': 'Bókstafir — Krakkaleikir',
      'title.litir': 'Litir — Krakkaleikir',
      'title.form': 'Form — Krakkaleikir',
      'title.klukkan': 'Klukkan — Krakkaleikir',
      'title.minni': 'Minni — Krakkaleikir',
      'level.q': 'Veldu erfiðleikastig',
      'level.easy': 'Létt',
      'level.hard': 'Erfitt',
      'end.title': 'Þú kláraðir leikinn!',
      'end.score': 'Rétt í fyrstu tilraun: <strong>{c} af {t}</strong>',
      'end.best': 'Besti árangur:',
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
      // the time of day takes the neuter form: "klukkan er eitt / tvö / þrjú / fjögur"
      'hour.1': 'eitt', 'hour.2': 'tvö', 'hour.3': 'þrjú', 'hour.4': 'fjögur', 'hour.5': 'fimm',
      'hour.6': 'sex', 'hour.7': 'sjö', 'hour.8': 'átta', 'hour.9': 'níu', 'hour.10': 'tíu',
      'hour.11': 'ellefu', 'hour.12': 'tólf',
      // half hours count toward the coming hour: 3:30 is "hálf fjögur" (key half.4)
      'half.1': 'hálf eitt', 'half.2': 'hálf tvö', 'half.3': 'hálf þrjú', 'half.4': 'hálf fjögur',
      'half.5': 'hálf fimm', 'half.6': 'hálf sex', 'half.7': 'hálf sjö', 'half.8': 'hálf átta',
      'half.9': 'hálf níu', 'half.10': 'hálf tíu', 'half.11': 'hálf ellefu', 'half.12': 'hálf tólf',
      'tolur.count_q': 'Hvað eru margar kúlur?',
      'tolur.plus': 'plús',
      'tolur.minus': 'mínus',
      'tolur.add_q': 'Hvað er útkoman?',
      'bokstafir.q': 'Hvaða hljóð heyrist? Finndu stafina tvo sem mynda það.',
      'litir.q': 'Hvaða litur er þetta?',
      'form.q': 'Hvað heitir þetta form?',
      'klukkan.read_q': 'Hvað er klukkan?',
      'klukkan.set_a': 'Klukkan er',
      'klukkan.set_b': 'Á hvaða tölu á vísirinn að benda?',
      'klukkan.pick_b': 'Finndu réttu klukkuna.',
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
      'game.minni': 'Vendespil',
      'desc.tolur': 'Tæl kuglerne og løs simple regnestykker',
      'desc.bokstafir': 'Lyt til lyden og find de to bogstaver',
      'desc.litir': 'Hvilken farve er der på billedet?',
      'desc.form': 'Hvad hedder denne form?',
      'desc.klukkan': 'Lær hvad klokken er, og sæt viserne',
      'desc.minni': 'Find parrene i vendespillet',
      'footer.note': 'De bedste point gemmes i din browser.',
      'footer.reset': 'Nulstil point',
      'badge.not_played': 'Ikke spillet endnu',
      'back.aria': 'Tilbage til menuen',
      'speak.aria': 'Lyt',
      'title.tolur': 'Tal — Krakkaleikir',
      'title.bokstafir': 'Bogstaver — Krakkaleikir',
      'title.litir': 'Farver — Krakkaleikir',
      'title.form': 'Former — Krakkaleikir',
      'title.klukkan': 'Uret — Krakkaleikir',
      'title.minni': 'Vendespil — Krakkaleikir',
      'level.q': 'Vælg sværhedsgrad',
      'level.easy': 'Let',
      'level.hard': 'Svær',
      'end.title': 'Du klarede spillet!',
      'end.score': 'Rigtigt i første forsøg: <strong>{c} af {t}</strong>',
      'end.best': 'Bedste resultat:',
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
      // "klokken er et" (not "en")
      'hour.1': 'et', 'hour.2': 'to', 'hour.3': 'tre', 'hour.4': 'fire', 'hour.5': 'fem',
      'hour.6': 'seks', 'hour.7': 'syv', 'hour.8': 'otte', 'hour.9': 'ni', 'hour.10': 'ti',
      'hour.11': 'elleve', 'hour.12': 'tolv',
      // 3:30 is "halv fire" (key half.4)
      'half.1': 'halv et', 'half.2': 'halv to', 'half.3': 'halv tre', 'half.4': 'halv fire',
      'half.5': 'halv fem', 'half.6': 'halv seks', 'half.7': 'halv syv', 'half.8': 'halv otte',
      'half.9': 'halv ni', 'half.10': 'halv ti', 'half.11': 'halv elleve', 'half.12': 'halv tolv',
      'tolur.count_q': 'Hvor mange kugler er der?',
      'tolur.plus': 'plus',
      'tolur.minus': 'minus',
      'tolur.add_q': 'Hvad er resultatet?',
      'bokstafir.q': 'Hvilken lyd hører du? Find de to bogstaver, der laver den.',
      'litir.q': 'Hvilken farve er det?',
      'form.q': 'Hvad hedder denne form?',
      'klukkan.read_q': 'Hvad er klokken?',
      'klukkan.set_a': 'Klokken er',
      'klukkan.set_b': 'Hvilket tal skal viseren pege på?',
      'klukkan.pick_b': 'Find det rigtige ur.',
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

  // syllables for the listening game: one consonant + one vowel
  var SYLLABLES = {
    is: ['ba','be','bi','bu','da','de','di','du','ga','gu','ha','la','le','ma','me','mi','na','ne','ra','sa','ta','va'],
    da: ['ba','be','bi','bo','bu','da','de','di','du','ga','ha','ka','la','le','ma','me','mi','na','ne','ra','sa','ta','va']
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
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang());
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
    lang: lang, setLang: setLang, t: t, fmt: fmt, speechLang: speechLang, apply: apply, onChange: onChange,
    LANGS: LANGS, SYLLABLES: SYLLABLES, STR: STR
  };
})();
