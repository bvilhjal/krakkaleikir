/* Bókstafir / Bogstaver: a listening game — hear a syllable (one consonant +
   one vowel, e.g. "ba"), pick the matching two letters from four choices.
   Easy: random other syllables.  Hard: syllables that share the consonant or
   the vowel (ba / bi / da), so the child has to listen to each sound. */
(function () {
  'use strict';

  function similar(target, syl) {
    var others = syl.filter(function (s) { return s !== target; });
    var sameC = KL.shuffle(others.filter(function (s) { return s[0] === target[0]; }));
    var sameV = KL.shuffle(others.filter(function (s) { return s.slice(1) === target.slice(1); }));
    var pick = sameC.slice(0, 2);
    sameV.forEach(function (s) { if (pick.length < 3) pick.push(s); });
    KL.shuffle(others).forEach(function (s) { if (pick.length < 3 && pick.indexOf(s) < 0) pick.push(s); });
    return KL.shuffle([target].concat(pick));
  }

  KL.register('bokstafir', {
    levels: [{ id: 'easy', labelKey: 'level.easy' }, { id: 'hard', labelKey: 'level.hard' }],
    start: function (ctx) {
      var SYL = KL_I18N.SYLLABLES[KL_I18N.lang()];
      KL.runGame({
        ctx: ctx,
        gameId: 'bokstafir',
        levels: this.levels,
        makeQuestions: function () { return KL.sample(SYL, 10).map(function (s) { return { syl: s }; }); },
        promptSpeech: function (q) { return ['bokstafir.q', 'syl.' + q.syl]; },
        retrySpeech: function (q) { return ['syl.' + q.syl]; },
        build: function (q, promptEl, answersEl, level) {
          promptEl.innerHTML =
            '<div style="margin:6px 0">' + KL.speakerSVG(84) + '</div>' +
            '<p class="q-text">' + KL.t('bokstafir.q') + '</p>';
          var choices = level === 'hard' ? similar(q.syl, SYL) : KL.pickDistinct(SYL, q.syl, 4);
          return choices.map(function (c) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer';
            btn.textContent = c; // lowercase, so it always reads as the syllable "ba", never spelled out as "B-A"
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: c === q.syl, speechParts: ['syl.' + c] };
          });
        }
      });
    }
  });
})();
