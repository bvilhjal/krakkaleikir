/* Litir / Farver: name the color of the shown shape. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var da = KL_I18N.lang() === 'da';
  var COLORS = [
    { is: 'rauður', da: 'rød', hex: '#E53935' },
    { is: 'blár', da: 'blå', hex: '#1E88E5' },
    { is: 'gulur', da: 'gul', hex: '#FDD835' },
    { is: 'grænn', da: 'grøn', hex: '#43A047' },
    { is: 'fjólublár', da: 'lilla', hex: '#8E24AA' },
    { is: 'appelsínugulur', da: 'orange', hex: '#FB8C00' },
    { is: 'bleikur', da: 'lyserød', hex: '#F48FB1' },
    { is: 'brúnn', da: 'brun', hex: '#8D6E63' },
    { is: 'svartur', da: 'sort', hex: '#37474F' },
    { is: 'grár', da: 'grå', hex: '#90A4AE' }
  ];
  var SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'stjarna', 'hjarta'];
  function name(c) { return da ? c.da : c.is; }

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
    promptSpeech: function () { return KL.t('litir.q'); },
    build: function (q, promptEl, answersEl) {
      promptEl.innerHTML =
        KL.shapeSVG(q.shape, q.color.hex, 170) +
        '<p class="q-text">' + KL.t('litir.q') + '</p>';
      var answers = [];
      var correct = name(q.color);
      KL.pickDistinct(COLORS.map(name), correct, 4).forEach(function (nm) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = nm;
        btn.style.fontSize = 'clamp(1.2rem, 4vw, 1.8rem)';
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: nm === correct, speechOnCorrect: nm });
      });
      return answers;
    }
  });
});
