/* Tölur / Tal: count the animals, solve sums/subtraction, or find the missing number.
   Level 1 (1-10): count 4-10, add and subtract within 10.
   Level 2 (1-20): count 10-18, add and subtract within 20.
   Level 3 (3 + ?): missing addends/subtrahends within 10 (e.g. 4 + ? = 10, 9 − ? = 5).
   Sums are spoken as one sentence ('add.3.2' = "Hvað eru þrír plús tveir?"). */
(function () {
  'use strict';

  var COUNT_ANIMALS = ['fiskur', 'froskur', 'ungi', 'kottur'];

  function makeQuestions(level) {
    var qs = [];
    var seen = {};
    var i, a, b, c, type, k;
    if (level === 'miss') {
      for (i = 0; i < 6; ) {
        // Include friends of 10 (a + ? = 10) plus varied missing addends within 10
        c = i < 2 ? 10 : KL.randInt(5, 10);
        a = KL.randInt(1, c - 1);
        b = c - a;
        k = 'miss.' + a + '.' + c;
        if (seen[k]) continue;
        seen[k] = true;
        qs.push({ type: 'miss_add', a: a, b: b, c: c });
        i++;
      }
      for (i = 0; i < 4; ) {
        a = KL.randInt(5, 10);
        c = KL.randInt(1, a - 1);
        b = a - c;
        k = 'submiss.' + a + '.' + c;
        if (seen[k]) continue;
        seen[k] = true;
        qs.push({ type: 'miss_sub', a: a, b: b, c: c });
        i++;
      }
    } else if (level === '20') {
      KL.sample(KL.range(10, 18), 5).forEach(function (n) {
        qs.push({ type: 'count', n: n, animal: COUNT_ANIMALS[KL.randInt(0, COUNT_ANIMALS.length - 1)] });
      });
      var subBs = [1, 2, 3, 4, 5, 10];
      for (i = 0; i < 5; ) {
        type = i % 2 === 1 ? 'sub' : 'add';
        if (type === 'sub') {
          a = KL.randInt(11, 19);
          b = subBs[KL.randInt(0, subBs.length - 1)];
        } else {
          a = KL.randInt(6, 15);
          var minB = Math.max(1, 11 - a);
          var maxB = Math.min(9, 20 - a);
          b = KL.randInt(minB, maxB);
        }
        k = type + '.' + a + '.' + b;
        if (seen[k]) continue;
        seen[k] = true;
        qs.push({ type: type, a: a, b: b });
        i++;
      }
    } else {
      KL.sample(KL.range(4, 10), 5).forEach(function (n) {
        qs.push({ type: 'count', n: n, animal: COUNT_ANIMALS[KL.randInt(0, COUNT_ANIMALS.length - 1)] });
      });
      for (i = 0; i < 5; ) {
        type = i % 2 === 1 ? 'sub' : 'add';
        if (type === 'sub') { a = KL.randInt(3, 10); b = KL.randInt(1, a - 1); }
        else { a = KL.randInt(2, 8); b = KL.randInt(1, 10 - a); }
        k = type + '.' + a + '.' + b;
        if (seen[k]) continue; // never the same sum twice in one round
        seen[k] = true;
        qs.push({ type: type, a: a, b: b });
        i++;
      }
    }
    // two different animals for the two numbers of a sum
    qs.forEach(function (q) {
      if (q.type === 'add' || q.type === 'sub' || q.type === 'miss_add' || q.type === 'miss_sub') {
        q.pair = KL.sample(COUNT_ANIMALS, 2);
      }
    });
    return KL.shuffle(qs);
  }

  // up to five per row, like a ten-frame; 'gone' ones are taken away (greyed out)
  function group(n, animal, size, gone, interactive) {
    var s = '<span class="dots' + (gone ? ' gone' : '') + '" style="--sz: ' + size + 'px; grid-template-columns: repeat(' + Math.min(n, 5) + ', auto)">';
    for (var i = 0; i < n; i++) {
      if (interactive) s += '<button type="button" class="herd-item">' + KL_ART.animal(animal, size) + '<span class="tap-num"></span></button>';
      else s += KL_ART.animal(animal, size);
    }
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

  function near(correct, max, min) {
    return KL.pickDistinct(KL.range(Math.max(min || 1, correct - 4), Math.min(max, correct + 4)), correct, 4);
  }

  KL.register('tolur', {
    levels: [{ id: '10', label: '1–10' }, { id: '20', label: '1–20' }, { id: 'miss', label: '3 + ?' }],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'tolur',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function (q) {
          if (q.type === 'count') return KL.t('tolur.count_q.' + q.animal);
          if (q.type === 'miss_add' || q.type === 'miss_sub') return KL.t('tolur.miss_q');
          return KL.fmt(q.type === 'sub' ? 'tolur.sub' : 'tolur.add', { a: q.a, b: q.b });
        },
        promptSpeech: function (q) {
          if (q.type === 'count') return ['tolur.count_q.' + q.animal];
          if (q.type === 'miss_add') return ['miss.' + q.a + '.' + q.c];
          if (q.type === 'miss_sub') return ['submiss.' + q.a + '.' + q.c];
          return [q.type + '.' + q.a + '.' + q.b];
        },
        onCorrect: function (q, _a, promptEl) {
          if (q.type !== 'miss_add' && q.type !== 'miss_sub') return;
          var big = promptEl.querySelector('.q-big');
          if (big) big.textContent = q.a + (q.type === 'miss_sub' ? ' − ' : ' + ') + q.b + ' = ' + q.c;
          var box = promptEl.querySelector('.miss-box');
          if (box) { box.classList.add('filled'); box.textContent = q.b; }
        },
        build: function (q, promptEl, answersEl, level) {
          var max = level === '20' ? 20 : 10;
          if (q.type === 'count') {
            var sz = q.n > 10 ? 44 : q.n > 5 ? 58 : 70;
            promptEl.innerHTML = '<div class="herd">' + group(q.n, q.animal, sz, false, true) + '</div>';
            var tapped = 0;
            promptEl.querySelectorAll('.herd-item').forEach(function (item) {
              item.setAttribute('aria-label', KL.t('animal.' + q.animal));
              item.setAttribute('aria-pressed', 'false');
              item.addEventListener('click', function () {
                KL.sfx('click');
                KL.replay(item, 'herd-pop');
                if (!item.classList.contains('counted')) {
                  tapped++;
                  item.classList.add('counted');
                  item.querySelector('.tap-num').textContent = tapped;
                  item.setAttribute('aria-pressed', 'true');
                  item.setAttribute('aria-label', KL.t('animal.' + q.animal) + ': ' + tapped);
                }
                KL.say(['num.' + item.querySelector('.tap-num').textContent]);
              });
            });
            return numberButtons(answersEl, near(q.n, max, level === '20' ? 8 : 1), q.n);
          }
          if (q.type === 'miss_add' || q.type === 'miss_sub') {
            var isSub = q.type === 'miss_sub';
            promptEl.innerHTML =
              '<p class="q-big">' + q.a + (isSub ? ' − ' : ' + ') + '? = ' + q.c + '</p>' +
              '<div class="sum-dots">' +
                group(q.a, q.pair[0], 30) +
                '<span class="op">' + (isSub ? '−' : '+') + '</span>' +
                '<span class="miss-box" aria-hidden="true">?</span>' +
                '<span class="op">=</span>' +
                '<span class="miss-target">' + q.c + '</span>' +
              '</div>';
            return numberButtons(answersEl, near(q.b, 9, 1), q.b);
          }
          var sub = q.type === 'sub';
          var result = sub ? q.a - q.b : q.a + q.b;
          var dotSz = (sub ? q.a : q.a + q.b) > 10 ? 24 : 34;
          promptEl.innerHTML =
            '<p class="q-big">' + q.a + (sub ? ' − ' : ' + ') + q.b + ' = ?</p>' +
            '<div class="sum-dots">' +
              (sub ? group(q.a - q.b, q.pair[0], dotSz) + group(q.b, q.pair[0], dotSz, true)
                   : group(q.a, q.pair[0], dotSz) + '<span class="op">+</span>' + group(q.b, q.pair[1], dotSz)) +
            '</div>';
          return numberButtons(answersEl, near(result, max), result);
        }
      });
    }
  });
})();
