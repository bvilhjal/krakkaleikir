/* Form / Former: name the shown shape. Shape keys stay Icelandic internally. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var da = KL_I18N.lang() === 'da';
  var SHAPES = [
    { key: 'hringur', is: 'hringur', da: 'cirkel' },
    { key: 'ferningur', is: 'ferningur', da: 'kvadrat' },
    { key: 'þríhyrningur', is: 'þríhyrningur', da: 'trekant' },
    { key: 'rétthyrningur', is: 'rétthyrningur', da: 'rektangel' },
    { key: 'stjarna', is: 'stjarna', da: 'stjerne' },
    { key: 'hjarta', is: 'hjarta', da: 'hjerte' }
  ];
  var SHAPE_COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#FB8C00', '#8E24AA', '#26C6DA'];
  function name(s) { return da ? s.da : s.is; }

  var questions = KL.sample(SHAPES.concat(SHAPES), 10).map(function (s) { return { shape: s }; });

  KL.runGame({
    gameId: 'form',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function () { return KL.t('form.q'); },
    build: function (q, promptEl, answersEl) {
      var color = SHAPE_COLORS[KL.randInt(0, SHAPE_COLORS.length - 1)];
      promptEl.innerHTML =
        KL.shapeSVG(q.shape.key, color, 170) +
        '<p class="q-text">' + KL.t('form.q') + '</p>';
      var answers = [];
      var correct = name(q.shape);
      KL.pickDistinct(SHAPES.map(name), correct, 4).forEach(function (nm) {
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
