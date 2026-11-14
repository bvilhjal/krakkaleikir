/* Form / Former: name the shown shape. Shape keys stay Icelandic internally. */
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
    promptSpeech: function () { return ['form.q']; },
    build: function (q, promptEl, answersEl) {
      var color = SHAPE_COLORS[KL.randInt(0, SHAPE_COLORS.length - 1)];
      promptEl.innerHTML =
        KL.shapeSVG(q.shape, color, 170) +
        '<p class="q-text">' + KL.t('form.q') + '</p>';
      var answers = [];
      var correct = 'shape.' + q.shape;
      KL.pickDistinct(SHAPES.map(function (s) { return 'shape.' + s; }), correct, 4).forEach(function (key) {
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
