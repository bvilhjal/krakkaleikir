/* Bókstafir / Bogstaver: letters, first letters of words, and listening/reading.
   Letters: match uppercase to lowercase + find the first letter of an animal or a thing.
   Easy: other random short words.  Hard: look-alike words that differ by one letter
   (mús / hús / lús), so every letter has to be read. */
(function () {
  'use strict';

  var ALPHABET = {
    is: 'AÁBDÐEÉFGHIÍJKLMNOÓPRSTUÚVXYÝÞÆÖ'.split(''),
    da: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'.split('')
  };

  var CONFUSE = {
    'A': 'ÁOÆ', 'Á': 'AOÓ', 'B': 'DPÞ', 'D': 'BPÐ', 'Ð': 'DBÞ',
    'E': 'ÉÆA', 'É': 'EÆI', 'F': 'EPT', 'G': 'CJO', 'H': 'NMK',
    'I': 'ÍLJ', 'Í': 'ILJ', 'J': 'IÍL', 'K': 'HXR', 'L': 'IÍJ',
    'M': 'NWK', 'N': 'MHV', 'O': 'ÓÖØ', 'Ó': 'OÖÁ', 'P': 'BDÞ',
    'R': 'KPB', 'S': 'ZCG', 'T': 'FLI', 'U': 'ÚVÖ', 'Ú': 'UVY',
    'V': 'UWÝ', 'Y': 'ÝUV', 'Ý': 'YUV', 'Þ': 'PBÐ', 'Æ': 'EÖØ',
    'Ö': 'OØÆ', 'Ø': 'OÖÆ', 'Å': 'AÆØ', 'C': 'GOE'
  };

  // animals whose name does not sound like its first letter ("ungi" is said "úngi")
  var NOT_FIRST = { is: ['ungi'], da: [] };

  var WORD_ART = {
    is: { 'mús': 'mus' },
    da: { 'mus': 'mus', 'kat': 'kottur', 'gris': 'svin', 'frø': 'froskur', 'fisk': 'fiskur' }
  };

  // how alike two words look: same length, the same letters in the same places,
  // shared letters (mús ~ hús ~ lús rank above dós, which ranks above kaka)
  function likeness(a, b) {
    var score = a.length === b.length ? 3 : -2 * Math.abs(a.length - b.length);
    for (var i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) score += 2;
    var rem = b.split('');
    for (var j = 0; j < a.length; j++) {
      var k = rem.indexOf(a[j]);
      if (k >= 0) { score += 1; rem.splice(k, 1); }
    }
    return score;
  }

  function lookAlikes(target, words) {
    var others = KL.shuffle(words.filter(function (w) { return w !== target; }));
    others.sort(function (x, y) { return likeness(target, y) - likeness(target, x); });
    return KL.shuffle([target].concat(others.slice(0, 3)));
  }

  function letterChoices(target, alpha) {
    var pool = [];
    (CONFUSE[target] || '').split('').forEach(function (ch) {
      if (ch !== target && alpha.indexOf(ch) >= 0 && pool.indexOf(ch) < 0) pool.push(ch);
    });
    KL.shuffle(alpha).forEach(function (ch) {
      if (pool.length < 3 && ch !== target && pool.indexOf(ch) < 0) pool.push(ch);
    });
    return KL.shuffle([target].concat(pool.slice(0, 3)));
  }

  function makeQuestions(level, lang, WORDS) {
    if (level === 'letters') {
      var alpha = ALPHABET[lang] || ALPHABET.is;
      var qs = [];
      KL.sample(alpha, 5).forEach(function (ch) {
        qs.push({ type: 'case', ch: ch, alpha: alpha });
      });
      KL.sample(KL_ART.PICTURES.filter(function (id) { return (NOT_FIRST[lang] || []).indexOf(id) < 0; }), 5).forEach(function (id) {
        var name = KL.t(KL_ART.nameKey(id));
        qs.push({ type: 'first', item: id, word: name, ch: name.charAt(0).toUpperCase(), alpha: alpha });
      });
      return KL.shuffle(qs);
    }
    return KL.sample(WORDS, 10).map(function (w) { return { type: 'word', word: w }; });
  }

  KL.register('bokstafir', {
    levels: [
      { id: 'letters', labelKey: 'level.letters' },
      { id: 'easy', labelKey: 'level.easy' },
      { id: 'hard', labelKey: 'level.hard' }
    ],
    start: function (ctx) {
      var lang = KL_I18N.lang();
      var WORDS = KL_I18N.WORDS[lang];
      KL.runGame({
        ctx: ctx,
        gameId: 'bokstafir',
        levels: this.levels,
        makeQuestions: function (lv) { return makeQuestions(lv, lang, WORDS); },
        promptText: function (q) {
          if (q.type === 'case') return KL.t('bokstafir.match_q');
          if (q.type === 'first') return KL.t('bokstafir.first_q');
          return KL.t('bokstafir.q');
        },
        promptSpeech: function (q) {
          if (q.type === 'case') return ['bokstafir.match_q'];
          if (q.type === 'first') return ['bokstafir.first_q', KL_ART.nameKey(q.item)];
          return ['bokstafir.q', 'word.' + q.word];
        },
        retrySpeech: function (q) {
          if (q.type === 'case') return ['bokstafir.match_q'];
          if (q.type === 'first') return [KL_ART.nameKey(q.item)];
          return ['word.' + q.word];
        },
        onCorrect: function (q, _a, promptEl) {
          if (q.type === 'first') {
            var lbl = document.createElement('p');
            lbl.className = 'word-reveal';
            lbl.innerHTML = '<strong>' + q.ch + '</strong>' + q.word.slice(1);
            promptEl.appendChild(lbl);
            return;
          }
          var art = WORD_ART[lang] && WORD_ART[lang][q.word];
          if (art) {
            var badge = document.createElement('div');
            badge.className = 'word-art-reveal';
            badge.innerHTML = KL_ART.animal(art, 84);
            promptEl.appendChild(badge);
          }
        },
        build: function (q, promptEl, answersEl, level) {
          if (q.type === 'case') {
            promptEl.innerHTML = '<p class="q-big">' + q.ch + '</p>';
            return letterChoices(q.ch, q.alpha).map(function (c) {
              var low = c.toLowerCase();
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'answer';
              btn.textContent = low;
              answersEl.appendChild(btn);
              return { el: btn, isCorrect: c === q.ch, speechParts: [] };
            });
          }
          if (q.type === 'first') {
            var pic = document.createElement('button');
            pic.type = 'button';
            pic.className = 'animal-prompt';
            pic.setAttribute('aria-label', q.word);
            pic.innerHTML = KL_ART.picture(q.item, 128);
            pic.addEventListener('click', function () {
              KL.replay(pic, 'sticker-play');
              KL.say([KL_ART.nameKey(q.item)]);
            });
            promptEl.appendChild(pic);
            return letterChoices(q.ch, q.alpha).map(function (c) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'answer';
              btn.textContent = c;
              answersEl.appendChild(btn);
              return { el: btn, isCorrect: c === q.ch, speechParts: c === q.ch ? [KL_ART.nameKey(q.item)] : [] };
            });
          }
          var again = document.createElement('button');
          again.type = 'button';
          again.className = 'sound-btn';
          again.setAttribute('aria-label', KL.t('speak.aria'));
          again.innerHTML = KL.speakerSVG(64, '#fff');
          again.addEventListener('click', function () { KL.replay(again, 'pulse-once'); KL.say(['word.' + q.word]); });
          promptEl.appendChild(again);
          var choices = level === 'hard' ? lookAlikes(q.word, WORDS) : KL.pickDistinct(WORDS, q.word, 4);
          return choices.map(function (c) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer read';
            btn.textContent = c;
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: c === q.word, speechParts: ['word.' + c] };
          });
        }
      });
    }
  });
})();
