/* Form / Former: name the shown shape. Shape keys stay Icelandic internally. */
(function () {
  'use strict';

  var SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'stjarna', 'hjarta'];
  var SHAPE_COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#FB8C00', '#8E24AA', '#26C6DA'];

  KL.register('form', {
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'form',
        makeQuestions: function () {
          return KL.sample(SHAPES.concat(SHAPES), 10).map(function (s) {
            return { shape: s, color: SHAPE_COLORS[KL.randInt(0, SHAPE_COLORS.length - 1)] };
          });
        },
        promptSpeech: function () { return ['form.q']; },
        build: function (q, promptEl, answersEl) {
          promptEl.innerHTML =
            KL.shapeSVG(q.shape, q.color, 170) +
            '<p class="q-text">' + KL.t('form.q') + '</p>';
          var correct = 'shape.' + q.shape;
          return KL.pickDistinct(SHAPES.map(function (s) { return 'shape.' + s; }), correct, 4).map(function (key) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer word';
            btn.textContent = KL.t(key);
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: key === correct, speechParts: [key] };
          });
        }
      });
    }
  });
})();
