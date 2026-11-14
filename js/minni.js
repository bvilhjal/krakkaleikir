/* Minni / Vendespil: memory game with animal cards, 6 or 8 pairs. Fewer flips is
   better; best stars and fewest flips are stored per board size. */
(function () {
  'use strict';

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
        KL.sample(KL_ART.ANIMALS, nPairs).forEach(function (animal) {
          cards.push({ key: animal });
          cards.push({ key: animal });
        });
        cards = KL.shuffle(cards);

        var flipped = [];
        var matched = 0;
        var flips = 0;
        var lock = false;

        main.innerHTML =
          '<div class="minni-wrap enter">' + KL.guideHTML(64) +
            '<div class="board' + (nPairs === 8 ? ' board-8' : '') + '" id="kl-board"></div>' +
          '</div>';
        var board = document.getElementById('kl-board');
        KL.koalaSay(KL.t('minni.start'));
        KL.setReplay(['minni.start']);
        showFlips(0);

        cards.forEach(function (card, idx) {
          var el = document.createElement('div');
          el.className = 'mcard';
          el.style.animationDelay = (idx * 30) + 'ms';
          el.innerHTML =
            '<div class="mcard-inner">' +
              '<div class="mface back"></div>' +
              '<div class="mface front">' + KL_ART.animal(card.key, 72) + '</div>' +
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
                KL.burst(b.el);
                flipped = [];
                matched++;
                lock = false;
                if (matched === nPairs) { KL.later(function () { end(nPairs, flips); }, 500); return; }
                var p = KL.praise();
                KL.koalaSay(p.text, p.sub);
                KL.koalaMood('happy');
                KL.later(function () { KL.say([p.key]); }, 200);
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
        var stars = nPairs === 6
          ? (flips <= 9 ? 3 : flips <= 14 ? 2 : 1)
          : (flips <= 12 ? 3 : flips <= 18 ? 2 : 1);
        KL.saveBest('flips.minni.' + nPairs, flips, true);
        KL.finish(ctx, {
          slotKey: 'minni.' + nPairs,
          stars: stars,
          titleKey: 'minni.end_title',
          lines: [KL.fmt('minni.end_flips', { n: flips }),
                  KL.t('minni.pairs' + nPairs) + ' · ' + KL.fmt('minni.end_best', { n: KL.getBest('flips.minni.' + nPairs) })],
          onReplay: function () { play(nPairs); }
        });
      }

      chooseSize();
    }
  });
})();
