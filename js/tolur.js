/* Tölur / Tal: count the animals, then simple sums with little animals to count on.
   Level 1: count 1-5, add two numbers 1-5.  Level 2: count up to 10, add and subtract within 10.
   Sums are spoken as one sentence ('add.3.2' = "Hvað eru þrír plús tveir?"). */
(function () {
  'use strict';

  var COUNT_ANIMALS = ['fiskur', 'froskur', 'ungi', 'kottur'];

  function makeQuestions(level) {
    var hard = level === '2';
    var qs = [];
    KL.sample(hard ? KL.range(3, 10) : KL.range(1, 5), 5).forEach(function (n) {
      qs.push({ type: 'count', n: n, animal: COUNT_ANIMALS[KL.randInt(0, COUNT_ANIMALS.length - 1)] });
    });
    var seen = {};
    for (var i = 0; i < 5; ) {
      var a, b, type = hard && i % 2 === 1 ? 'sub' : 'add';
      if (type === 'sub') { a = KL.randInt(3, 10); b = KL.randInt(1, a - 1); }
      else if (hard) { a = KL.randInt(2, 8); b = KL.randInt(1, 10 - a); }
      else { a = KL.randInt(1, 5); b = KL.randInt(1, 5); }
      var k = type + '.' + a + '.' + b;
      if (seen[k]) continue; // never the same sum twice in one round
      seen[k] = true;
      qs.push({ type: type, a: a, b: b });
      i++;
    }
    // two different animals for the two numbers of a sum
    qs.forEach(function (q) { if (q.type !== 'count') q.pair = KL.sample(COUNT_ANIMALS, 2); });
    return KL.shuffle(qs);
  }

  // up to five per row, like a ten-frame; 'gone' ones are taken away (greyed out)
  function group(n, animal, size, gone) {
    var s = '<span class="dots' + (gone ? ' gone' : '') + '" style="--sz: ' + size + 'px; grid-template-columns: repeat(' + Math.min(n, 5) + ', auto)">';
    for (var i = 0; i < n; i++) s += KL_ART.animal(animal, size);
    return s + '</span>';
  }

  function numberButtons(answersEl, choices, correct) {
    return choices.map(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer';
      btn.textContent = c;
      answersEl.appendChild(btn);
      return { el: btn, isCorrect: c === correct, speechParts: ['num.' + c] };
    });
  }

  function near(correct, max) {
    return KL.pickDistinct(KL.range(Math.max(1, correct - 3), Math.min(max, correct + 3)), correct, 4);
  }

  KL.register('tolur', {
    levels: [{ id: '1', label: '1–5' }, { id: '2', label: '1–10' }],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'tolur',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function (q) {
          if (q.type === 'count') return KL.t('tolur.count_q.' + q.animal);
          return KL.fmt(q.type === 'sub' ? 'tolur.sub' : 'tolur.add', { a: q.a, b: q.b });
        },
        promptSpeech: function (q) {
          if (q.type === 'count') return ['tolur.count_q.' + q.animal];
          return [q.type + '.' + q.a + '.' + q.b];
        },
        build: function (q, promptEl, answersEl, level) {
          if (q.type === 'count') {
            promptEl.innerHTML = '<div class="herd">' + group(q.n, q.animal, q.n > 5 ? 58 : 70) + '</div>';
            var choices = level === '2' ? near(q.n, 10) : KL.pickDistinct(KL.range(1, 5), q.n, 4);
            return numberButtons(answersEl, choices, q.n);
          }
          var sub = q.type === 'sub';
          var result = sub ? q.a - q.b : q.a + q.b;
          promptEl.innerHTML =
            '<p class="q-big">' + q.a + (sub ? ' − ' : ' + ') + q.b + ' = ?</p>' +
            '<div class="sum-dots">' +
              (sub ? group(q.a - q.b, q.pair[0], 34) + group(q.b, q.pair[0], 34, true)
                   : group(q.a, q.pair[0], 34) + '<span class="op">+</span>' + group(q.b, q.pair[1], 34)) +
            '</div>';
          return numberButtons(answersEl, near(result, 10), result);
        }
      });
    }
  });
})();
