/* Bókstafir / Bogstaver: a listening game — hear a letter, pick it from four choices. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var LETTERS = KL_I18N.lang() === 'da'
    ? 'a b c d e f g h i j k l m n o p q r s t u v w x y z æ ø å'.split(' ')
    : 'a á b d ð e é f g h i í j k l m n o ó p r s t u ú v x y ý þ æ ö'.split(' ');

  var questions = KL.sample(LETTERS, 10).map(function (l) { return { letter: l }; });

  KL.runGame({
    gameId: 'bokstafir',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function (q) { return q.letter; },
    build: function (q, promptEl, answersEl) {
      promptEl.innerHTML =
        '<div style="margin:6px 0">' + KL.speakerSVG(84) + '</div>' +
        '<p class="q-text">' + KL.t('bokstafir.q') + '</p>';
      var answers = [];
      KL.pickDistinct(LETTERS, q.letter, 4).forEach(function (c) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = c.toUpperCase();
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: c === q.letter, speechOnCorrect: c });
      });
      return answers;
    }
  });
});
