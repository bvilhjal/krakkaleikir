/* Minni / Vendespil: memory game with animal cards (4, 6, 8, or 10 pairs).
   Matching a pair plays that animal's voice. Fewer flips is better; best stars
   and fewest flips are stored per board size. */
(function () {
  'use strict';

  var LEVELS = [
    { id: '6', labelKey: 'minni.pairs6' },
    { id: '8', labelKey: 'minni.pairs8' },
    { id: '10', labelKey: 'minni.pairs10' },
    { id: '12', labelKey: 'minni.pairs12' }
  ];

  function cardsIcon() {
    return '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="3" y="5" width="10" height="14" rx="2" fill="#FFD9A0" stroke="#E07A5F" stroke-width="1.6" transform="rotate(-8 8 12)"/>' +
      '<rect x="11" y="5" width="10" height="14" rx="2" fill="#fff" stroke="#E07A5F" stroke-width="1.6" transform="rotate(8 16 12)"/></svg>';
  }

  function starsFor(nPairs, flips) {
    if (nPairs === 6) return flips <= 9 ? 3 : flips <= 14 ? 2 : 1;
    if (nPairs === 8) return flips <= 12 ? 3 : flips <= 18 ? 2 : 1;
    if (nPairs === 10) return flips <= 16 ? 3 : flips <= 24 ? 2 : 1;
    return flips <= 20 ? 3 : flips <= 28 ? 2 : 1;
  }

  KL.register('minni', {
    levels: LEVELS,
    start: function (ctx) {
      var main = ctx.main;
      var scoreEl = ctx.scoreEl;

      function showFlips(n) {
        scoreEl.innerHTML = cardsIcon() + '<span>' + n + '</span>';
        scoreEl.setAttribute('aria-label', KL.t('minni.flips') + ': ' + n);
      }

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
            '<div class="board' + (nPairs === 10 || nPairs === 12 ? ' board-' + nPairs : '') + '" id="kl-board"></div>' +
          '</div>';
        var board = document.getElementById('kl-board');
        KL.koalaSay(KL.t('minni.start'));
        KL.setReplay(['minni.start']);
        showFlips(0);

        cards.forEach(function (card, idx) {
          // a real button: keyboard and screen readers can play too. Face down
          // the label is the position; face up it is the animal (what is shown).
          var el = document.createElement('button');
          el.type = 'button';
          el.className = 'mcard';
          el.style.animationDelay = (idx * 30) + 'ms';
          var cardLabel = KL.fmt('minni.card', { n: idx + 1 });
          el.setAttribute('aria-label', cardLabel);
          el.innerHTML =
            '<div class="mcard-inner">' +
              '<div class="mface back"></div>' +
              '<div class="mface front">' + KL_ART.animal(card.key, 72) + '</div>' +
            '</div>';
          el.addEventListener('click', function () {
            if (lock || el.disabled || el.classList.contains('flipped')) return;
            KL.sfx('flip');
            el.classList.add('flipped');
            el.setAttribute('aria-label', KL.t('animal.' + card.key));
            flipped.push({ el: el, key: card.key, label: cardLabel });
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
                a.el.disabled = true;
                b.el.disabled = true;
                KL.burst(b.el);
                flipped = [];
                matched++;
                lock = false;
                if (window.KL_TTS) window.KL_TTS.stop();
                KL.later(function () { if (window.KL_SOUND) KL_SOUND.animal(a.key); }, 180);
                if (matched === nPairs) { KL.later(function () { end(nPairs, flips); }, 850); return; }
                var p = KL.praise();
                var animalName = KL.t('animal.' + a.key);
                KL.koalaSay(p.text + ' — ' + animalName, p.sub);
                KL.koalaMood('happy');
              }, 350);
            } else {
              KL.later(function () {
                a.el.classList.remove('flipped');
                b.el.classList.remove('flipped');
                a.el.setAttribute('aria-label', a.label);
                b.el.setAttribute('aria-label', b.label);
                flipped = [];
                lock = false;
              }, 900);
            }
          });
          board.appendChild(el);
        });
      }

      function end(nPairs, flips) {
        KL.saveBest('flips.minni.' + nPairs, flips, true);
        KL.finish(ctx, {
          slotKey: 'minni.' + nPairs,
          stars: starsFor(nPairs, flips),
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
