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
      'menu.stickers': 'Límmiðarnir mínir',
      'game.tolur': 'Tölur',
      'game.talnatafla': 'Tölutafla',
      'game.bokstafir': 'Bókstafir',
      'game.litir': 'Litir',
      'game.form': 'Form',
      'game.klukkan': 'Klukkan',
      'game.minni': 'Minni',
      'desc.tolur': 'Teldu dýrin og leystu dæmi',
      'desc.talnatafla': 'Kannaðu tölurnar frá 1 upp í 100',
      'desc.bokstafir': 'Hlustaðu og finndu orðið',
      'desc.litir': 'Hvaða litur er þetta?',
      'desc.form': 'Hlustaðu og finndu formið',
      'desc.klukkan': 'Lærðu á klukkuna',
      'desc.minni': 'Finndu dýrin sem eru eins',
      'footer.note': 'Stjörnur og límmiðar geymast í þessum vafra.',
      'footer.reset': 'Byrja upp á nýtt',
      'reset.confirm': 'Eyða öllum stjörnum og límmiðum?',
      'badge.not_played': 'Ekki prófað enn',
      'back.aria': 'Til baka í valmynd',
      'speak.aria': 'Hlusta aftur',
      'title.tolur': 'Tölur — Krakkaleikir',
      'title.talnatafla': 'Tölutafla — Krakkaleikir',
      'title.bokstafir': 'Bókstafir — Krakkaleikir',
      'title.litir': 'Litir — Krakkaleikir',
      'title.form': 'Form — Krakkaleikir',
      'title.klukkan': 'Klukkan — Krakkaleikir',
      'title.minni': 'Minni — Krakkaleikir',
      'level.q': 'Hvað eigum við að prófa?',
      'level.easy': 'Létt',
      'level.hard': 'Erfitt',
      'end.title': 'Þú kláraðir leikinn!',
      'end.score': 'Rétt í fyrstu tilraun: <strong>{c} af {t}</strong>',
      'end.best': 'Besti árangur:',
      'end.replay': 'Spila aftur',
      'end.menu': 'Annar leikur',
      'sticker.new': 'Nýr límmiði: {a}!',
      'sticker.sound': 'Heyra hljóð: {a}',
      'family.title': 'Pabbi og mamma',
      'family.unlocked': 'Þú safnaðir öllum dýrunum!',
      'family.dad': 'Pabbi',
      'family.mom': 'Mamma',
      'sticker.all': 'Allir límmiðarnir eru komnir í bókina!',
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
      'tolur.count_q.fiskur': 'Hvað eru margir fiskar?',
      'tolur.count_q.froskur': 'Hvað eru margir froskar?',
      'tolur.count_q.ungi': 'Hvað eru margir ungar?',
      'tolur.count_q.kottur': 'Hvað eru margir kettir?',
      'tolur.add': 'Hvað eru {a} plús {b}?',
      'tolur.sub': 'Hvað eru {a} mínus {b}?',
      'talnatafla.start': 'Bankaðu á tölu og hlustum saman!',
      'talnatafla.play': 'Finndu tölu',
      'talnatafla.find': 'Finndu töluna {n}!',
      'talnatafla.range': 'Tölur frá 1 til 100',
      'bokstafir.q': 'Hlustaðu vel! Hvaða orð heyrirðu?',
      'litir.q': 'Hvaða litur er þetta?',
      'form.q': 'Hlustaðu og finndu formið!',
      'klukkan.read_q': 'Hvað er klukkan?',
      'klukkan.time': 'Klukkan er {t}.',
      'klukkan.set_b': 'Hvert á litli vísirinn að benda?',
      'klukkan.pick_b': 'Finndu réttu klukkuna!',
      'minni.start': 'Finndu dýrin sem eru eins! Snúðu við tveimur spjöldum í einu.',
      'minni.pairs6': '6 pör',
      'minni.pairs8': '8 pör',
      'minni.end_title': 'Þú fannst öll pörin!',
      'minni.end_flips': 'Þú notaðir <strong>{n}</strong> snúninga.',
      'minni.end_best': 'Fæstu snúningar: {n}',
      'minni.card': 'Spjald {n}',
      'minni.flips': 'Snúningar',
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
      'shape.hjarta': 'hjarta',
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
      'animal.morgaes': 'mörgæs'
    },
    da: {
      'title.menu': 'Krakkaleikir',
      'koala.hello': 'Hej! Jeg hedder Kóli. Vælg et spil, så leger vi sammen!',
      'koala.next': 'Hvad vil du spille nu?',
      'menu.stickers': 'Mine klistermærker',
      'game.tolur': 'Tal',
      'game.talnatafla': 'Taltavle',
      'game.bokstafir': 'Bogstaver',
      'game.litir': 'Farver',
      'game.form': 'Former',
      'game.klukkan': 'Klokken',
      'game.minni': 'Vendespil',
      'desc.tolur': 'Tæl dyrene og løs regnestykker',
      'desc.talnatafla': 'Gå på opdagelse i tallene fra 1 til 100',
      'desc.bokstafir': 'Lyt og find ordet',
      'desc.litir': 'Hvilken farve er det?',
      'desc.form': 'Lyt og find formen',
      'desc.klukkan': 'Lær klokken',
      'desc.minni': 'Find de dyr, der er ens',
      'footer.note': 'Stjerner og klistermærker gemmes i denne browser.',
      'footer.reset': 'Start forfra',
      'reset.confirm': 'Slette alle stjerner og klistermærker?',
      'badge.not_played': 'Ikke prøvet endnu',
      'back.aria': 'Tilbage til menuen',
      'speak.aria': 'Lyt igen',
      'title.tolur': 'Tal — Krakkaleikir',
      'title.talnatafla': 'Taltavle — Krakkaleikir',
      'title.bokstafir': 'Bogstaver — Krakkaleikir',
      'title.litir': 'Farver — Krakkaleikir',
      'title.form': 'Former — Krakkaleikir',
      'title.klukkan': 'Klokken — Krakkaleikir',
      'title.minni': 'Vendespil — Krakkaleikir',
      'level.q': 'Hvad skal vi prøve?',
      'level.easy': 'Let',
      'level.hard': 'Svær',
      'end.title': 'Du klarede spillet!',
      'end.score': 'Rigtigt i første forsøg: <strong>{c} af {t}</strong>',
      'end.best': 'Bedste resultat:',
      'end.replay': 'Spil igen',
      'end.menu': 'Et andet spil',
      'sticker.new': 'Nyt klistermærke: {a}!',
      'sticker.sound': 'Hør lyden: {a}',
      'family.title': 'Far og mor',
      'family.unlocked': 'Du har samlet alle dyrene!',
      'family.dad': 'Far',
      'family.mom': 'Mor',
      'sticker.all': 'Alle klistermærkerne er i bogen!',
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
      'tolur.count_q.fiskur': 'Hvor mange fisk er der?',
      'tolur.count_q.froskur': 'Hvor mange frøer er der?',
      'tolur.count_q.ungi': 'Hvor mange kyllinger er der?',
      'tolur.count_q.kottur': 'Hvor mange katte er der?',
      'tolur.add': 'Hvad er {a} plus {b}?',
      'tolur.sub': 'Hvad er {a} minus {b}?',
      'talnatafla.start': 'Tryk på et tal, så lytter vi sammen!',
      'talnatafla.play': 'Find et tal',
      'talnatafla.find': 'Find tallet {n}!',
      'talnatafla.range': 'Tal fra 1 til 100',
      'bokstafir.q': 'Lyt godt efter! Hvilket ord hører du?',
      'litir.q': 'Hvilken farve er det?',
      'form.q': 'Lyt og find formen!',
      'klukkan.read_q': 'Hvad er klokken?',
      'klukkan.time': 'Klokken er {t}.',
      'klukkan.set_b': 'Hvor skal den lille viser pege hen?',
      'klukkan.pick_b': 'Find det rigtige ur!',
      'minni.start': 'Find de dyr, der er ens! Vend to kort ad gangen.',
      'minni.pairs6': '6 par',
      'minni.pairs8': '8 par',
      'minni.end_title': 'Du fandt alle parrene!',
      'minni.end_flips': 'Du brugte <strong>{n}</strong> træk.',
      'minni.end_best': 'Færrest træk: {n}',
      'minni.card': 'Kort {n}',
      'minni.flips': 'Træk',
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
      'shape.hjarta': 'hjerte',
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
      'animal.morgaes': 'pingvin'
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
  var FAMILY = {
    dad: { lang: 'is', voice: 'is-IS-GunnarNeural', text: 'frábært Agnes mín' },
    mom: { lang: 'da', voice: 'en-US-EmmaMultilingualNeural', text: 'hvor er du dygtig skat' }
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
    'koala.hello', 'koala.next', 'level.q', 'end.title', 'try_again', 'sticker.all',
    'tolur.count_q.fiskur', 'tolur.count_q.froskur', 'tolur.count_q.ungi', 'tolur.count_q.kottur',
    'bokstafir.q', 'litir.q', 'form.q', 'klukkan.read_q', 'klukkan.set_b', 'klukkan.pick_b',
    'minni.start', 'minni.end_title', 'talnatafla.start'
  ];

  function lang() {
    try {
      var l = window.localStorage.getItem(KEY);
      return LANGS.indexOf(l) >= 0 ? l : 'is';
    } catch (e) { return 'is'; }
  }

  function setLang(l) {
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
    var S = STR[l], v = {}, a, b, h;
    PHRASES.forEach(function (k) { v[k] = S[k]; });
    for (a = 1; a <= 100; a++) v['num.' + a] = S['num.' + a];
    for (a = 1; a <= 10; a++) {
      for (b = 1; b <= 10; b++) {
        if (a + b <= 10) v['add.' + a + '.' + b] = fill(S['tolur.add'], { a: S['num.' + a], b: S['num.' + b] });
        if (b < a) v['sub.' + a + '.' + b] = fill(S['tolur.sub'], { a: S['num.' + a], b: S['num.' + b] });
      }
    }
    for (h = 1; h <= 12; h++) {
      v['time.' + h + '.0'] = fill(S['klukkan.time'], { t: S['hour.' + h] });
      v['time.' + h + '.30'] = fill(S['klukkan.time'], { t: S['half.' + (h % 12 + 1)] });
    }
    Object.keys(S).forEach(function (k) {
      if (/^(color|shape)\./.test(k)) v[k] = S[k];
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
