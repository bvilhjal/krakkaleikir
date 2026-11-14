/* Litir / Farver: name the color of the shown shape. Each of the ten colors
   comes up once per game. Colors are keyed by their Icelandic name. */
(function () {
  'use strict';

  var COLORS = [
    { key: 'color.rauður', hex: '#E53935' },
    { key: 'color.blár', hex: '#1E88E5' },
    { key: 'color.gulur', hex: '#FDD835' },
    { key: 'color.grænn', hex: '#43A047' },
    { key: 'color.fjólublár', hex: '#8E24AA' },
    { key: 'color.appelsínugulur', hex: '#FB8C00' },
    { key: 'color.bleikur', hex: '#F48FB1' },
    { key: 'color.brúnn', hex: '#795548' },
    { key: 'color.svartur', hex: '#212121' },
    { key: 'color.grár', hex: '#9E9E9E' }
  ];
  var SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'stjarna', 'hjarta'];

  KL.register('litir', {
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'litir',
        makeQuestions: function () {
          return KL.sample(COLORS, 10).map(function (c) {
            return { color: c, shape: SHAPES[KL.randInt(0, SHAPES.length - 1)] };
          });
        },
        promptSpeech: function () { return ['litir.q']; },
        build: function (q, promptEl, answersEl) {
          promptEl.innerHTML =
            KL.shapeSVG(q.shape, q.color.hex, 170) +
            '<p class="q-text">' + KL.t('litir.q') + '</p>';
          var correct = q.color.key;
          return KL.pickDistinct(COLORS.map(function (c) { return c.key; }), correct, 4).map(function (key) {
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
