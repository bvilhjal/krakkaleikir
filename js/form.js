/* Form / Former: hear a shape's name and pick its picture.
   All four choices share a color, so the outline is the only clue. */
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
        promptText: function () { return KL.t('form.q'); },
        promptSpeech: function (q) { return ['form.q', 'shape.' + q.shape]; },
        retrySpeech: function (q) { return ['shape.' + q.shape]; },
        build: function (q, promptEl, answersEl) {
          var again = document.createElement('button');
          again.type = 'button';
          again.className = 'sound-btn';
          again.setAttribute('aria-label', KL.t('speak.aria'));
          again.innerHTML = KL.speakerSVG(64, '#fff');
          again.addEventListener('click', function () { KL.replay(again, 'pulse-once'); KL.say(['shape.' + q.shape]); });
          promptEl.appendChild(again);
          return KL.pickDistinct(SHAPES, q.shape, 4).map(function (shape) {
            var key = 'shape.' + shape;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer shape-choice';
            btn.setAttribute('aria-label', KL.t(key));
            btn.innerHTML = KL.shapeSVG(shape, q.color, 110);
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: shape === q.shape, speechParts: [key] };
          });
        }
      });
    }
  });
})();
