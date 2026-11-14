/* Litir: name the color of the shown shape. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var COLORS = [
    { name: 'rauður', hex: '#E53935' },
    { name: 'blár', hex: '#1E88E5' },
    { name: 'gulur', hex: '#FDD835' },
    { name: 'grænn', hex: '#43A047' },
    { name: 'fjólublár', hex: '#8E24AA' },
    { name: 'appelsínugulur', hex: '#FB8C00' },
    { name: 'bleikur', hex: '#F48FB1' },
    { name: 'brúnn', hex: '#8D6E63' },
    { name: 'svartur', hex: '#37474F' },
    { name: 'grár', hex: '#90A4AE' }
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
    promptSpeech: function () { return 'Hvaða litur er þetta?'; },
    build: function (q, promptEl, answersEl) {
      promptEl.innerHTML =
        KL.shapeSVG(q.shape, q.color.hex, 170) +
        '<p class="q-text">Hvaða litur er þetta?</p>';
      var answers = [];
      KL.pickDistinct(COLORS.map(function (c) { return c.name; }), q.color.name, 4).forEach(function (name) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = name;
        btn.style.fontSize = 'clamp(1.2rem, 4vw, 1.8rem)';
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: name === q.color.name, speechOnCorrect: name });
      });
      return answers;
    }
  });
});
