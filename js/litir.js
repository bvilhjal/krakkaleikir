/* Litir / Farver: name the color of the shown shape. Colors are keyed by their Icelandic name. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var COLORS = [
    { key: 'color.rauður', hex: '#E53935' },
    { key: 'color.blár', hex: '#1E88E5' },
    { key: 'color.gulur', hex: '#FDD835' },
    { key: 'color.grænn', hex: '#43A047' },
    { key: 'color.fjólublár', hex: '#8E24AA' },
    { key: 'color.appelsínugulur', hex: '#FB8C00' },
    { key: 'color.bleikur', hex: '#F48FB1' },
    { key: 'color.brúnn', hex: '#8D6E63' },
    { key: 'color.svartur', hex: '#37474F' },
    { key: 'color.grár', hex: '#90A4AE' }
  ];
  var SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'stjarna', 'hjarta'];

  var questions = [];
  for (var i = 0; i < 10; i++) {
    questions.push({
      color: COLORS[KL.randInt(0, COLORS.length - 1)],
      shape: SHAPES[KL.randInt(0, SHAPES.length - 1)]
    });
  }

  KL.runGame({
    gameId: 'litir',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function () { return ['litir.q']; },
    build: function (q, promptEl, answersEl) {
      promptEl.innerHTML =
        KL.shapeSVG(q.shape, q.color.hex, 170) +
        '<p class="q-text">' + KL.t('litir.q') + '</p>';
      var answers = [];
      var correct = q.color.key;
      KL.pickDistinct(COLORS.map(function (c) { return c.key; }), correct, 4).forEach(function (key) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = KL.t(key);
        btn.style.fontSize = 'clamp(1.2rem, 4vw, 1.8rem)';
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: key === correct, speechParts: [key] });
      });
      return answers;
    }
  });
});
