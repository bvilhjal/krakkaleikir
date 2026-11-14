/* Bókstafir / Bogstaver: a listening game — hear a syllable (one consonant +
   one vowel, e.g. "ba"), pick the matching two letters from four choices. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var SYL = KL_I18N.SYLLABLES[KL_I18N.lang()];
  var questions = KL.sample(SYL, 10).map(function (s) { return { syl: s }; });

  KL.runGame({
    gameId: 'bokstafir',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function (q) { return ['bokstafir.q', 'syl.' + q.syl]; },
    build: function (q, promptEl, answersEl) {
      promptEl.innerHTML =
        '<div style="margin:6px 0">' + KL.speakerSVG(84) + '</div>' +
        '<p class="q-text">' + KL.t('bokstafir.q') + '</p>';
      var answers = [];
      KL.pickDistinct(SYL, q.syl, 4).forEach(function (c) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = c.toUpperCase();
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: c === q.syl, speechParts: ['syl.' + c] });
      });
      return answers;
    }
  });
});
