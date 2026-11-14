/* Tölur / Tal: count the balls, then simple sums with dots to count on.
   Level 1: count 1-5, add two numbers 1-5.  Level 2: count up to 10, add and subtract within 10. */
(function () {
  'use strict';

  var BALL_COLORS = ['#E53935', '#1E88E5', '#FDD835', '#43A047', '#8E24AA', '#FB8C00', '#F48FB1', '#26C6DA', '#8D6E63', '#66BB6A'];
  var DOT_A = '#5C6BC0';
  var DOT_B = '#E07A5F';

  function makeQuestions(level) {
    var hard = level === '2';
    var qs = [];
    KL.sample(hard ? KL.range(3, 10) : KL.range(1, 5), 5).forEach(function (n) { qs.push({ type: 'count', n: n }); });
    for (var i = 0; i < 5; i++) {
      var a, b;
      if (hard && i % 2 === 1) {
        a = KL.randInt(3, 10); b = KL.randInt(1, a - 1);
        qs.push({ type: 'sub', a: a, b: b });
      } else if (hard) {
        a = KL.randInt(2, 8); b = KL.randInt(1, 10 - a);
        qs.push({ type: 'add', a: a, b: b });
      } else {
        a = KL.randInt(1, 5); b = KL.randInt(1, 5);
        qs.push({ type: 'add', a: a, b: b });
      }
    }
    return KL.shuffle(qs);
  }

  // up to five dots per row, like a ten-frame; 'crossed' dots are taken away
  function dots(n, color, crossed) {
    var s = '<span class="dots" style="grid-template-columns: repeat(' + Math.min(n, 5) + ', 22px)">';
    for (var i = 0; i < n; i++) {
      s += '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="9" fill="' + (crossed ? '#E6E7EF' : color) + '"/>' +
        (crossed ? '<path d="M5 5l12 12M17 5L5 17" stroke="#D64550" stroke-width="2.5" stroke-linecap="round"/>' : '') +
        '</svg>';
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
        promptSpeech: function (q) {
          if (q.type === 'count') return ['tolur.count_q'];
          return ['num.' + q.a, q.type === 'sub' ? 'tolur.minus' : 'tolur.plus', 'num.' + q.b, 'tolur.add_q'];
        },
        build: function (q, promptEl, answersEl, level) {
          if (q.type === 'count') {
            var balls = '';
            var size = q.n > 5 ? 54 : 62;
            for (var i = 0; i < q.n; i++) balls += KL.ballSVG(BALL_COLORS[i % BALL_COLORS.length], size);
            promptEl.innerHTML = '<div class="balls' + (q.n > 5 ? ' frame' : '') + '">' + balls + '</div>' +
              '<p class="q-text">' + KL.t('tolur.count_q') + '</p>';
            var choices = level === '2' ? near(q.n, 10) : KL.pickDistinct(KL.range(1, 5), q.n, 4);
            return numberButtons(answersEl, choices, q.n);
          }
          var sub = q.type === 'sub';
          var result = sub ? q.a - q.b : q.a + q.b;
          promptEl.innerHTML =
            '<p class="q-big">' + q.a + (sub ? ' − ' : ' + ') + q.b + ' = ?</p>' +
            '<div class="sum-dots">' +
              (sub ? dots(q.a - q.b, DOT_A) + dots(q.b, DOT_A, true)
                   : dots(q.a, DOT_A) + '<span class="op">+</span>' + dots(q.b, DOT_B)) +
            '</div>';
          return numberButtons(answersEl, near(result, 10), result);
        }
      });
    }
  });
})();
