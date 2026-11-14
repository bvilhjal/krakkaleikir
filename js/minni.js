/* Minni / Hukommelse: memory matching game. Lower flip count is better; best is stored as fewest flips. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var main = document.getElementById('game');
  var scoreEl = document.getElementById('score');

  var PAIRS = [
    { shape: 'hringur', color: '#E53935' },
    { shape: 'stjarna', color: '#FDD835' },
    { shape: 'hjarta', color: '#F48FB1' },
    { shape: 'ferningur', color: '#43A047' },
    { shape: 'þríhyrningur', color: '#1E88E5' },
    { shape: 'rétthyrningur', color: '#8E24AA' },
    { shape: 'stjarna', color: '#26C6DA' },
    { shape: 'hringur', color: '#FB8C00' }
  ];

  function bestFlips() {
    try { return parseInt(window.localStorage.getItem('kl.best.minni') || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function saveFlips(f) {
    try {
      var b = bestFlips();
      if (b === 0 || f < b) window.localStorage.setItem('kl.best.minni', String(f));
    } catch (e) { /* storage unavailable */ }
  }

  function startScreen() {
    main.innerHTML =
      '<div class="question-card">' +
        '<div class="prompt">' +
          '<p class="q-text">' + KL.t('minni.start') + '</p>' +
        '</div>' +
        '<div class="diff-row">' +
          '<button class="btn-primary" id="kl-6">' + KL.t('minni.pairs6') + '</button>' +
          '<button class="btn-primary" id="kl-8">' + KL.t('minni.pairs8') + '</button>' +
        '</div>' +
        '<a class="btn-secondary" href="../index.html">' + KL.t('end.menu') + '</a>' +
      '</div>';
    document.getElementById('kl-6').addEventListener('click', function () { play(6); });
    document.getElementById('kl-8').addEventListener('click', function () { play(8); });
    if (window.KL_TTS) {
      window.KL_TTS.say(['minni.start']);
      KL.onUnlock(function () { window.KL_TTS.say(['minni.start']); });
    }
  }

  function play(nPairs) {
    var cards = [];
    KL.sample(PAIRS, nPairs).forEach(function (p, idx) {
      cards.push({ key: idx, face: p });
      cards.push({ key: idx, face: p });
    });
    cards = KL.shuffle(cards);

    var flipped = [];
    var matched = 0;
    var flips = 0;
    var lock = false;

    main.innerHTML =
      '<div class="board" id="kl-board"></div>' +
      '<div class="message" id="kl-msg" style="text-align:center"></div>';
    var board = document.getElementById('kl-board');
    scoreEl.innerHTML = KL.starSVG(true, 30) + '<span>0</span>';

    cards.forEach(function (card) {
      var el = document.createElement('div');
      el.className = 'mcard';
      el.innerHTML =
        '<div class="mcard-inner">' +
          '<div class="mface back"></div>' +
          '<div class="mface front">' + KL.shapeSVG(card.face.shape, card.face.color, 64) + '</div>' +
        '</div>';
      el.addEventListener('click', function () {
        if (lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
        if (window.KL_SOUND) window.KL_SOUND.play('flip');
        el.classList.add('flipped');
        flipped.push({ el: el, key: card.key });
        if (flipped.length === 2) {
          flips++;
          scoreEl.innerHTML = KL.starSVG(true, 30) + '<span>' + flips + '</span>';
          var a = flipped[0];
          var b = flipped[1];
          if (a.key === b.key) {
            setTimeout(function () {
              if (window.KL_SOUND) window.KL_SOUND.play('correct');
              a.el.classList.add('matched');
              b.el.classList.add('matched');
              flipped = [];
              matched++;
              var msg = document.getElementById('kl-msg');
              msg.textContent = KL.t(KL.praise());
              msg.className = 'message good';
              if (window.KL_TTS) window.KL_TTS.say([KL.praise()]);
              if (matched === nPairs) end();
            }, 350);
          } else {
            lock = true;
            setTimeout(function () {
              a.el.classList.remove('flipped');
              b.el.classList.remove('flipped');
              flipped = [];
              lock = false;
            }, 900);
          }
        }
      });
      board.appendChild(el);
    });

    function end() {
      if (window.KL_SOUND) window.KL_SOUND.play('win');
      if (window.KL_TTS) window.KL_TTS.say(['minni.end_title']);
      var stars = nPairs === 6
        ? (flips <= 9 ? 3 : flips <= 14 ? 2 : 1)
        : (flips <= 12 ? 3 : flips <= 18 ? 2 : 1);
      saveFlips(flips);
      main.innerHTML =
        '<div class="question-card end-card">' +
          '<h2>' + KL.t('minni.end_title') + '</h2>' +
          '<div class="big-stars">' + KL.starsRow(stars, 3, 56) + '</div>' +
          '<p>' + KL.fmt('minni.end_flips', { n: flips }) + '</p>' +
          '<p class="best">' + KL.fmt('minni.end_best', { n: bestFlips() }) + '</p>' +
          '<button class="btn-primary" id="kl-replay">' + KL.t('end.replay') + '</button><br>' +
          '<a class="btn-secondary" href="../index.html">' + KL.t('end.menu') + '</a>' +
        '</div>';
      document.getElementById('kl-replay').addEventListener('click', startScreen);
    }
  }

  startScreen();
});
