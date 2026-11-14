/* Form: name the shown shape. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'stjarna', 'hjarta'];
  var SHAPE_COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#FB8C00', '#8E24AA', '#26C6DA'];

  var questions = KL.sample(SHAPES.concat(SHAPES), 10).map(function (s) { return { shape: s }; });

  KL.runGame({
    gameId: 'form',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function () { return 'Hvað heitir þetta form?'; },
    build: function (q, promptEl, answersEl) {
      var color = SHAPE_COLORS[KL.randInt(0, SHAPE_COLORS.length - 1)];
      promptEl.innerHTML =
        KL.shapeSVG(q.shape, color, 170) +
        '<p class="q-text">Hvað heitir þetta form?</p>';
      var answers = [];
      KL.pickDistinct(SHAPES, q.shape, 4).forEach(function (name) {
        var btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = name;
        btn.style.fontSize = 'clamp(1.2rem, 4vw, 1.8rem)';
        answersEl.appendChild(btn);
        answers.push({ el: btn, isCorrect: name === q.shape, speechOnCorrect: name });
      });
      return answers;
    }
  });
});
