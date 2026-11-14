/* Minni / Vendespil: memory matching game with 6 or 8 pairs. Fewer flips is
   better; best stars and fewest flips are stored per board size. */
(function () {
  'use strict';

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
  var LEVELS = [{ id: '6', labelKey: 'minni.pairs6' }, { id: '8', labelKey: 'minni.pairs8' }];

  function cardsIcon() {
    return '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="3" y="5" width="10" height="14" rx="2" fill="#FFD9A0" stroke="#E07A5F" stroke-width="1.6" transform="rotate(-8 8 12)"/>' +
      '<rect x="11" y="5" width="10" height="14" rx="2" fill="#fff" stroke="#E07A5F" stroke-width="1.6" transform="rotate(8 16 12)"/></svg>';
  }

  KL.register('minni', {
    levels: LEVELS,
    start: function (ctx) {
      var main = ctx.main;
      var scoreEl = ctx.scoreEl;

      function showFlips(n) { scoreEl.innerHTML = cardsIcon() + '<span>' + n + '</span>'; }

      function chooseSize() {
        scoreEl.innerHTML = '';
        KL.levelScreen(ctx, LEVELS, { gameId: 'minni', textKey: 'minni.start', speech: ['minni.start'] }, function (id) {
          play(parseInt(id, 10));
        });
      }

      function play(nPairs) {
        KL.onUnlock(null);
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
        var msg = document.getElementById('kl-msg');
        showFlips(0);

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
            KL.sfx('flip');
            el.classList.add('flipped');
            flipped.push({ el: el, key: card.key });
            if (flipped.length < 2) return;
            // two cards up: ignore taps until they are matched or turned back
            lock = true;
            flips++;
            showFlips(flips);
            var a = flipped[0];
            var b = flipped[1];
            if (a.key === b.key) {
              KL.later(function () {
                KL.sfx('correct');
                a.el.classList.add('matched');
                b.el.classList.add('matched');
                flipped = [];
                matched++;
                lock = false;
                if (matched === nPairs) { end(nPairs, flips); return; }
                var pk = KL.praise();
                msg.textContent = KL.t(pk);
                msg.className = 'message good';
                KL.later(function () { KL.say([pk]); }, 250);
              }, 350);
            } else {
              KL.later(function () {
                a.el.classList.remove('flipped');
                b.el.classList.remove('flipped');
                flipped = [];
                lock = false;
              }, 900);
            }
          });
          board.appendChild(el);
        });
      }

      function end(nPairs, flips) {
        KL.sfx('win');
        KL.say(['minni.end_title']);
        var stars = nPairs === 6
          ? (flips <= 9 ? 3 : flips <= 14 ? 2 : 1)
          : (flips <= 12 ? 3 : flips <= 18 ? 2 : 1);
        KL.saveBest('stars.minni.' + nPairs, stars);
        KL.saveBest('flips.minni.' + nPairs, flips, true);
        main.innerHTML =
          '<div class="question-card end-card">' +
            '<h2>' + KL.t('minni.end_title') + '</h2>' +
            '<div class="big-stars">' + KL.starsRow(stars, 3, 56) + '</div>' +
            '<p>' + KL.fmt('minni.end_flips', { n: flips }) + '</p>' +
            '<p class="best">' + KL.t('minni.pairs' + nPairs) + ' · ' + KL.fmt('minni.end_best', { n: KL.getBest('flips.minni.' + nPairs) }) + '</p>' +
            '<button type="button" class="btn-primary" id="kl-replay">' + KL.t('end.replay') + '</button><br>' +
            '<a class="btn-secondary" href="#" data-nav="">' + KL.t('end.menu') + '</a>' +
          '</div>';
        document.getElementById('kl-replay').addEventListener('click', function () { play(nPairs); });
      }

      chooseSize();
    }
  });
})();
