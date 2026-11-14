/* Bókstafir / Bogstaver: a listening and reading game — hear a short word
   ("mús"), pick the written word from four choices.
   Easy: other random words.  Hard: look-alike words that differ by one letter
   (mús / hús / lús), so every letter has to be read.
   Real words rather than syllables: the speech engine spells unknown letter
   pairs ("ba") out as abbreviations. The big speaker button says the word again. */
(function () {
  'use strict';

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

  KL.register('bokstafir', {
    levels: [{ id: 'easy', labelKey: 'level.easy' }, { id: 'hard', labelKey: 'level.hard' }],
    start: function (ctx) {
      var WORDS = KL_I18N.WORDS[KL_I18N.lang()];
      KL.runGame({
        ctx: ctx,
        gameId: 'bokstafir',
        levels: this.levels,
        makeQuestions: function () { return KL.sample(WORDS, 10).map(function (w) { return { word: w }; }); },
        promptText: function () { return KL.t('bokstafir.q'); },
        promptSpeech: function (q) { return ['bokstafir.q', 'word.' + q.word]; },
        retrySpeech: function (q) { return ['word.' + q.word]; },
        build: function (q, promptEl, answersEl, level) {
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
