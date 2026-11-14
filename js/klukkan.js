/* Klukkan / Uret: read the analog clock (whole hours) and set the hour hand by tapping a number. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var CX = 120, CY = 120, FACE_R = 112, NUM_R = 88, BTN_R = 88, BTN_SIZE = 46;

  // position on the dial for hour h (1..12), 12 at the top
  function polar(r, h) {
    var a = (h % 12) * 30 * Math.PI / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  }

  function clockSVG(hour, showHands, withNumbers) {
    var s = [];
    s.push('<svg width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + FACE_R + '" fill="#fff" stroke="#3D405B" stroke-width="6"/>');
    var i, a, p1, p2;
    for (i = 0; i < 60; i++) {
      a = i * 6 * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = 100, r2 = major ? 90 : 95;
      p1 = [CX + r1 * Math.sin(a), CY - r1 * Math.cos(a)];
      p2 = [CX + r2 * Math.sin(a), CY - r2 * Math.cos(a)];
      s.push('<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
        '" stroke="' + (major ? '#8A8DA3' : '#C9CBD6') + '" stroke-width="' + (major ? 4 : 2) + '"/>');
    }
    if (withNumbers) {
      for (i = 1; i <= 12; i++) {
        p1 = polar(NUM_R, i);
        s.push('<text x="' + p1[0].toFixed(1) + '" y="' + p1[1].toFixed(1) + '" text-anchor="middle" dy="0.35em" font-size="24" font-weight="bold" fill="#3D405B">' + i + '</text>');
      }
    }
    if (showHands) {
      // minute hand always at 12 (whole hour)
      p1 = polar(80, 12);
      s.push('<line x1="' + CX + '" y1="' + CY + '" x2="' + p1[0].toFixed(1) + '" y2="' + p1[1].toFixed(1) + '" stroke="#3D405B" stroke-width="5" stroke-linecap="round"/>');
      // hour hand
      p2 = polar(58, hour);
      s.push('<line x1="' + CX + '" y1="' + CY + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="#E07A5F" stroke-width="9" stroke-linecap="round"/>');
      s.push('<circle cx="' + CX + '" cy="' + CY + '" r="8" fill="#3D405B"/>');
    }
    s.push('</svg>');
    return s.join('');
  }

  var questions = [];
  KL.sample(HOURS, 5).forEach(function (h) { questions.push({ type: 'read', hour: h }); });
  KL.sample(HOURS, 5).forEach(function (h) { questions.push({ type: 'set', hour: h }); });
  questions = KL.shuffle(questions);

  KL.runGame({
    gameId: 'klukkan',
    main: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    questions: questions,
    promptSpeech: function (q) {
      if (q.type === 'read') return ['klukkan.read_q'];
      return ['klukkan.set_a', 'num.' + q.hour, 'klukkan.set_b'];
    },
    build: function (q, promptEl, answersEl) {
      var answers = [];
      if (q.type === 'read') {
        promptEl.innerHTML = clockSVG(q.hour, true, true) + '<p class="q-text">' + KL.t('klukkan.read_q') + '</p>';
        KL.pickDistinct(HOURS, q.hour, 4).forEach(function (c) {
          var btn = document.createElement('button');
          btn.className = 'answer';
          btn.textContent = c;
          answersEl.appendChild(btn);
          answers.push({ el: btn, isCorrect: c === q.hour, speechParts: ['klukkan.clock_is_a', 'num.' + c] });
        });
      } else {
        promptEl.innerHTML = '<div class="digital">' + q.hour + ':00</div>';
        var wrap = document.createElement('div');
        wrap.className = 'clock-wrap';
        wrap.innerHTML = clockSVG(null, false, false);
        promptEl.appendChild(wrap);
        for (var h = 1; h <= 12; h++) {
          var p = polar(BTN_R, h);
          var btn = document.createElement('button');
          btn.className = 'clock-num';
          btn.textContent = h;
          btn.style.left = (p[0] - BTN_SIZE / 2) + 'px';
          btn.style.top = (p[1] - BTN_SIZE / 2) + 'px';
          wrap.appendChild(btn);
          answers.push({ el: btn, isCorrect: h === q.hour, speechParts: ['klukkan.clock_is_a', 'num.' + h] });
        }
      }
      return answers;
    }
  });
});
