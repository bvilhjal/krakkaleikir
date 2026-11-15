/* Mynstur / Mønstre: complete the pattern or number sequence.
   Easy: AAB, ABB, AABB, ABC visual patterns with shapes and animals.
   Hard: AABB, ABB, ABC visual patterns and forward/backward number sequences (+1, +2, +5, +10, −1, −2, −5, −10). */
(function () {
  'use strict';

  var SHAPE_TOKENS = [
    { id: 's.circle', kind: 'shape', shape: 'hringur', color: '#E53935', speech: 'shape.hringur', labelKey: 'shape.hringur' },
    { id: 's.tri', kind: 'shape', shape: 'þríhyrningur', color: '#1E88E5', speech: 'shape.þríhyrningur', labelKey: 'shape.þríhyrningur' },
    { id: 's.star', kind: 'shape', shape: 'stjarna', color: '#F9A825', speech: 'shape.stjarna', labelKey: 'shape.stjarna' },
    { id: 's.sq', kind: 'shape', shape: 'ferningur', color: '#43A047', speech: 'shape.ferningur', labelKey: 'shape.ferningur' },
    { id: 's.heart', kind: 'shape', shape: 'hjarta', color: '#8E24AA', speech: 'shape.hjarta', labelKey: 'shape.hjarta' },
    { id: 's.diam', kind: 'shape', shape: 'tígull', color: '#FB8C00', speech: 'shape.tígull', labelKey: 'shape.tígull' },
    { id: 's.moon', kind: 'shape', shape: 'hálfmáni', color: '#00ACC1', speech: 'shape.hálfmáni', labelKey: 'shape.hálfmáni' },
    { id: 's.hex', kind: 'shape', shape: 'sexhyrningur', color: '#D81B60', speech: 'shape.sexhyrningur', labelKey: 'shape.sexhyrningur' }
  ];

  function animalTokens() {
    return KL_ART.ANIMALS.map(function (id) {
      return { id: 'a.' + id, kind: 'animal', animal: id, speech: 'animal.' + id, labelKey: 'animal.' + id };
    });
  }

  function renderToken(tok, size) {
    if (tok.kind === 'num') return '<span class="pat-num">' + tok.n + '</span>';
    if (tok.kind === 'animal') return KL_ART.animal(tok.animal, size || 52);
    return KL.shapeSVG(tok.shape, tok.color, size || 52);
  }

  function tokenLabel(tok) {
    return tok.kind === 'num' ? String(tok.n) : KL.t(tok.labelKey);
  }

  function visualQuestion(pool, rule) {
    var picks = KL.sample(pool, 4);
    var A = picks[0], B = picks[1], C = picks[2], D = picks[3];
    var seq, ans;
    if (rule === 'aabb') { seq = [A, A, B, B, A]; ans = B; }
    else if (rule === 'aab') { seq = [A, A, B, A, A]; ans = B; }
    else if (rule === 'abb') { seq = [A, B, B, A, B]; ans = B; }
    else { seq = [A, B, C, A, B]; ans = C; }
    var choices = KL.shuffle([A, B, C, D]);
    return { kind: 'visual', seq: seq, ans: ans, choices: choices };
  }

  function numberQuestion() {
    var specs = [
      { start: KL.randInt(1, 6), step: 1 },
      { start: KL.randInt(10, 20), step: -1 },
      { start: 2, step: 2 },
      { start: 1, step: 2 },
      { start: 10, step: 2 },
      { start: 20, step: -2 },
      { start: 5, step: 5 },
      { start: 10, step: 5 },
      { start: 30, step: -5 },
      { start: 10, step: 10 },
      { start: 20, step: 10 },
      { start: 60, step: -10 }
    ];
    var sp = specs[KL.randInt(0, specs.length - 1)];
    var seq = [];
    for (var i = 0; i < 4; i++) seq.push({ id: 'n.' + i, kind: 'num', n: sp.start + i * sp.step });
    var ansVal = sp.start + 4 * sp.step;
    var ans = { id: 'n.ans', kind: 'num', n: ansVal, speech: 'num.' + ansVal };
    var candidates = [];
    [ansVal - 1, ansVal + 1, ansVal - 2, ansVal + 2, ansVal + Math.abs(sp.step), ansVal - Math.abs(sp.step), ansVal + 10, ansVal - 5, ansVal + 3, ansVal + 4]
      .forEach(function (v) {
        if (v >= 1 && v <= 100 && v !== ansVal && candidates.indexOf(v) < 0) candidates.push(v);
      });
    var distractors = KL.sample(candidates, 3).map(function (v) {
      return { id: 'n.' + v, kind: 'num', n: v, speech: 'num.' + v };
    });
    return { kind: 'number', seq: seq, ans: ans, choices: KL.shuffle([ans].concat(distractors)) };
  }

  function makeQuestions(level) {
    var animals = animalTokens();
    var qs = [];
    var i;
    if (level === 'hard') {
      var hardRules = ['aabb', 'abc', 'abb', 'abc'];
      for (i = 0; i < 4; i++) {
        qs.push(visualQuestion(i % 2 === 0 ? SHAPE_TOKENS : animals, hardRules[i]));
      }
      var seenSeq = {};
      while (qs.length < 10) {
        var nq = numberQuestion();
        var key = nq.seq.map(function (t) { return t.n; }).join(',');
        if (seenSeq[key]) continue;
        seenSeq[key] = true;
        qs.push(nq);
      }
    } else {
      var easyRules = ['aab', 'abb', 'aabb', 'abc', 'aab', 'abb', 'aabb', 'abc', 'aab', 'abc'];
      for (i = 0; i < 10; i++) {
        qs.push(visualQuestion(i % 2 === 0 ? SHAPE_TOKENS : animals, easyRules[i]));
      }
    }
    return KL.shuffle(qs);
  }

  KL.register('mynstur', {
    levels: [
      { id: 'easy', labelKey: 'level.easy' },
      { id: 'hard', labelKey: 'level.hard' }
    ],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'mynstur',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function () { return KL.t('mynstur.q'); },
        promptSpeech: function () { return ['mynstur.q']; },
        onCorrect: function (q, _a, promptEl) {
          var miss = promptEl.querySelector('.pat-slot.missing');
          if (!miss) return;
          miss.classList.remove('missing');
          miss.classList.add('filled');
          miss.innerHTML = renderToken(q.ans, 48);
        },
        build: function (q, promptEl, answersEl) {
          var row = document.createElement('div');
          row.className = 'pattern-row';
          row.innerHTML = q.seq.map(function (tok) {
            return '<span class="pat-slot">' + renderToken(tok, 48) + '</span>';
          }).join('') + '<span class="pat-slot missing" aria-label="?">?</span>';
          promptEl.appendChild(row);

          return q.choices.map(function (c) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer ' + (c.kind === 'num' ? '' : 'pat-choice');
            btn.setAttribute('aria-label', tokenLabel(c));
            btn.innerHTML = c.kind === 'num' ? String(c.n) : renderToken(c, 84);
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: c.id === q.ans.id, speechParts: c.speech ? [c.speech] : [] };
          });
        }
      });
    }
  });
})();
