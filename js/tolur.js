/* Tölur: count the balls (1-5), then simple addition (sums up to 10). */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var WORDS = { 1: 'einn', 2: 'tveir', 3: 'þrír', 4: 'fjórir', 5: 'fimm', 6: 'sex', 7: 'sjö', 8: 'átta', 9: 'níu', 10: 'tíu' };
  var BALL_COLORS = ['#E53935', '#1E88E5', '#FDD835', '#43A047', '#8E24AA', '#FB8C00', '#F48FB1', '#26C6DA', '#8D6E63', '#66BB6A'];

  var questions = [];
  KL.sample([1, 2, 3, 4, 5], 5).forEach(function (n) { questions.push({ type: 'count', n: n }); });
  for (var i = 0; i < 5; i++) {
    var a = KL.randInt(1, 5);
    var b = KL.randInt(1, 5);
    while (a + b > 10) { a = KL.randInt(1, 5); b = KL.randInt(1, 5); }
    questions.push({ type: 'add', a: a, b: b });
  }
  questions = KL.shuffle(questions);

  KL.runGame({
    gameId: 'tolur',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function (q) {
      if (q.type === 'count') return 'Hvað eru margar kúlur?';
      return WORDS[q.a] + ' plús ' + WORDS[q.b] + '. Hvað er útkoman?';
    },
    build: function (q, promptEl, answersEl) {
      var answers = [];
      if (q.type === 'count') {
        var balls = '';
        for (var i = 0; i < q.n; i++) balls += KL.ballSVG(BALL_COLORS[i % BALL_COLORS.length], 62);
        promptEl.innerHTML = '<div class="balls">' + balls + '</div><p class="q-text">Hvað eru margar kúlur?</p>';
        KL.pickDistinct([1, 2, 3, 4, 5], q.n, 4).forEach(function (c) {
          var btn = document.createElement('button');
          btn.className = 'answer';
          btn.textContent = c;
          answersEl.appendChild(btn);
          answers.push({ el: btn, isCorrect: c === q.n, speechOnCorrect: WORDS[c] });
        });
      } else {
        var sum = q.a + q.b;
        promptEl.innerHTML = '<p class="q-big">' + q.a + ' + ' + q.b + ' = ?</p>';
        var lo = Math.max(1, sum - 3);
        var hi = Math.min(10, sum + 3);
        var pool = [];
        for (var v = lo; v <= hi; v++) pool.push(v);
        KL.pickDistinct(pool, sum, 4).forEach(function (c) {
          var btn = document.createElement('button');
          btn.className = 'answer';
          btn.textContent = c;
          answersEl.appendChild(btn);
          answers.push({ el: btn, isCorrect: c === sum, speechOnCorrect: WORDS[c] });
        });
      }
      return answers;
    }
  });
});
