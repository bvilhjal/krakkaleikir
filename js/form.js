/* Form / Former: find shapes by name ("Find the hexagon!") or by corners/sides.
   All four choices share a color, so the outline is the only clue.
   Easy: 9 core shapes including hexagon. Hard: polygons/ovals + side-counting questions. */
(function () {
  'use strict';

  var EASY_SHAPES = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'sexhyrningur', 'stjarna', 'hjarta', 'tígull', 'hálfmáni'];
  var HARD_SHAPES = ['sexhyrningur', 'fimmhyrningur', 'átthyrningur', 'sporbaugur', 'tígull', 'rétthyrningur', 'ferningur'];
  var SHAPE_COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#FB8C00', '#8E24AA', '#0097A7'];

  var CLOSE = {
    sexhyrningur: ['fimmhyrningur', 'átthyrningur', 'ferningur', 'tígull'],
    fimmhyrningur: ['sexhyrningur', 'átthyrningur', 'þríhyrningur', 'ferningur'],
    átthyrningur: ['sexhyrningur', 'fimmhyrningur', 'hringur', 'ferningur'],
    sporbaugur: ['hringur', 'hálfmáni', 'tígull', 'rétthyrningur'],
    hringur: ['sporbaugur', 'átthyrningur', 'hálfmáni', 'sexhyrningur'],
    ferningur: ['rétthyrningur', 'tígull', 'fimmhyrningur', 'sexhyrningur'],
    rétthyrningur: ['ferningur', 'tígull', 'sexhyrningur', 'sporbaugur'],
    tígull: ['ferningur', 'rétthyrningur', 'þríhyrningur', 'sexhyrningur']
  };

  var SIDE_SPECS = [
    { key: 'form.sides.0', target: 'hringur', pool: ['þríhyrningur', 'ferningur', 'rétthyrningur', 'fimmhyrningur', 'sexhyrningur', 'átthyrningur', 'tígull'] },
    { key: 'form.sides.3', target: 'þríhyrningur', pool: ['ferningur', 'fimmhyrningur', 'sexhyrningur', 'átthyrningur', 'hringur', 'tígull'] },
    { key: 'form.sides.4', targets: ['ferningur', 'rétthyrningur'], pool: ['þríhyrningur', 'fimmhyrningur', 'sexhyrningur', 'átthyrningur', 'hringur'] },
    { key: 'form.sides.5', target: 'fimmhyrningur', pool: ['þríhyrningur', 'ferningur', 'sexhyrningur', 'átthyrningur', 'tígull'] },
    { key: 'form.sides.6', target: 'sexhyrningur', pool: ['þríhyrningur', 'ferningur', 'fimmhyrningur', 'átthyrningur', 'tígull'] },
    { key: 'form.sides.8', target: 'átthyrningur', pool: ['ferningur', 'fimmhyrningur', 'sexhyrningur', 'hringur', 'sporbaugur'] }
  ];

  function randomColor() {
    return SHAPE_COLORS[KL.randInt(0, SHAPE_COLORS.length - 1)];
  }

  function makeFindQuestion(shape, pool) {
    var close = (CLOSE[shape] || []).filter(function (s) { return s !== shape; });
    var distractors = KL.sample(close, 3);
    if (distractors.length < 3) {
      var rest = KL.shuffle(pool.filter(function (s) { return s !== shape && distractors.indexOf(s) < 0; }));
      distractors = distractors.concat(rest.slice(0, 3 - distractors.length));
    }
    return {
      speechKey: 'form.find.' + shape,
      target: shape,
      choices: KL.shuffle([shape].concat(distractors)),
      color: randomColor()
    };
  }

  function makeSideQuestion(spec) {
    var target = spec.targets ? spec.targets[KL.randInt(0, spec.targets.length - 1)] : spec.target;
    var distractors = KL.sample(spec.pool, 3);
    return {
      speechKey: spec.key,
      target: target,
      choices: KL.shuffle([target].concat(distractors)),
      color: randomColor()
    };
  }

  function makeQuestions(level) {
    if (level === 'hard') {
      var findQs = KL.sample(HARD_SHAPES, 5).map(function (s) { return makeFindQuestion(s, HARD_SHAPES); });
      var sideQs = KL.sample(SIDE_SPECS, 5).map(makeSideQuestion);
      return KL.shuffle(findQs.concat(sideQs));
    }
    var easyPick = EASY_SHAPES.concat([EASY_SHAPES[KL.randInt(0, EASY_SHAPES.length - 1)]]);
    return KL.shuffle(easyPick).map(function (s) { return makeFindQuestion(s, EASY_SHAPES); });
  }

  KL.register('form', {
    levels: [
      { id: 'easy', labelKey: 'level.easy' },
      { id: 'hard', labelKey: 'level.hard' }
    ],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'form',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function (q) { return KL.t(q.speechKey); },
        promptSpeech: function (q) { return [q.speechKey]; },
        retrySpeech: function (q) { return [q.speechKey]; },
        build: function (q, promptEl, answersEl) {
          var again = document.createElement('button');
          again.type = 'button';
          again.className = 'sound-btn';
          again.setAttribute('aria-label', KL.t('speak.aria'));
          again.innerHTML = KL.speakerSVG(64, '#fff');
          again.addEventListener('click', function () {
            KL.replay(again, 'pulse-once');
            KL.say([q.speechKey]);
          });
          promptEl.appendChild(again);

          return q.choices.map(function (shape) {
            var key = 'shape.' + shape;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer shape-choice';
            btn.setAttribute('aria-label', KL.t(key));
            btn.innerHTML = KL.shapeSVG(shape, q.color, 110);
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: shape === q.target, speechParts: [key] };
          });
        }
      });
    }
  });
})();
