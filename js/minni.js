/* Minni / Vendespil: memory game with animal and thing cards (6, 8, 10, or 12 pairs).
   Matching a pair plays that animal's voice or says the thing's name. Fewer flips is better; best stars
   and fewest flips are stored per board size. Pairs found in a row chime a step higher each time.
   Two players (the lion and the penguin) can take turns: a pair earns another go, a miss passes
   the turn, and whoever finds more pairs wins. Two-player rounds give no stars or prizes. */
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

  var players = 1; // chosen on the level screen; kept for the visit
  var P = ['ljon', 'morgaes']; // player 1 and player 2
  function pairsText(n) { return KL.fmt(n % 10 === 1 && n % 100 !== 11 ? 'minni.duo_pairs_one' : 'minni.duo_pairs', { n: n }); }
  function who(k) { return '<span class="bubble-face">' + KL_ART.animal(P[k - 1], 34) + '</span>'; }

  // the most flips that still give two stars (and a prize)
  var GOOD = { 6: 14, 8: 18, 10: 24, 12: 28 };
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
        main.querySelector('.level-row').insertAdjacentHTML('beforebegin',
          '<div class="players-toggle" role="group" aria-label="' + KL.t('minni.players') + '">' + [1, 2].map(function (k) {
            return '<button type="button" class="players-btn" data-players="' + k + '" aria-pressed="' + (players === k) + '">' +
              '<span class="players-faces">' + P.slice(0, k).map(function (id) { return KL_ART.animal(id, 36); }).join('') + '</span>' +
              '<span>' + KL.t(k === 1 ? 'minni.solo' : 'minni.duo') + '</span></button>';
          }).join('') + '</div>');
        main.querySelectorAll('[data-players]').forEach(function (b) {
          b.addEventListener('click', function () {
            players = Number(b.getAttribute('data-players'));
            KL.sfx('click');
            main.querySelectorAll('[data-players]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          });
        });
      }

      function play(nPairs) {
        KL_I18N.beginRound();
        KL.onUnlock(null);
        var cards = [];
        // about half animals, half things
        var nAnimals = Math.ceil(nPairs / 2);
        KL.sample(KL_ART.ANIMALS, nAnimals).concat(KL.sample(KL_ART.THINGS, nPairs - nAnimals)).forEach(function (id) {
          cards.push({ key: id });
          cards.push({ key: id });
        });
        cards = KL.shuffle(cards);

        var flipped = [];
        var matched = 0;
        var flips = 0;
        var lock = false;
        var run = 0; // pairs found in a row
        var duo = players === 2, turn = 1, pairs = [0, 0, 0];

        main.innerHTML =
          '<div class="minni-wrap enter">' + KL.guideHTML(64) +
            (duo ? '<div class="duo-score">' + [1, 2].map(function (k) {
              return '<div class="duo-player p' + k + '" data-player="' + k + '" role="img">' + KL_ART.animal(P[k - 1], 44) + '<span class="duo-pairs">0</span></div>';
            }).join('') + '</div>' : '') +
            '<div class="board' + (nPairs === 10 || nPairs === 12 ? ' board-' + nPairs : '') + '" id="kl-board"></div>' +
          '</div>';
        var board = document.getElementById('kl-board');
        function showTurn() {
          main.querySelectorAll('.duo-player').forEach(function (el) {
            var k = Number(el.getAttribute('data-player'));
            el.classList.toggle('active', k === turn);
            el.querySelector('.duo-pairs').textContent = pairs[k];
            el.setAttribute('aria-label', KL.t('minni.p' + k) + ': ' + pairsText(pairs[k]));
          });
        }
        if (duo) {
          scoreEl.innerHTML = '';
          scoreEl.removeAttribute('aria-label');
          showTurn();
          KL.koalaSay(who(1) + ' ' + KL.t('minni.start2'));
          KL.setReplay(['minni.start2']);
          KL.say(['minni.start2']);
        } else {
          KL.koalaSay(KL.t('minni.start'));
          KL.setReplay(['minni.start']);
          showFlips(0);
        }

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
              '<div class="mface front">' + KL_ART.picture(card.key, 72) + '</div>' +
            '</div>';
          el.addEventListener('click', function () {
            if (lock || el.disabled || el.classList.contains('flipped')) return;
            KL.sfx('flip');
            el.classList.add('flipped');
            el.setAttribute('aria-label', KL.t(KL_ART.nameKey(card.key)));
            flipped.push({ el: el, key: card.key, label: cardLabel });
            if (flipped.length < 2) return;
            // two cards up: ignore taps until they are matched or turned back
            lock = true;
            flips++;
            if (!duo) showFlips(flips);
            var a = flipped[0];
            var b = flipped[1];
            if (a.key === b.key) {
              KL.later(function () {
                run++;
                KL.sfx('correct', run - 1);
                a.el.classList.add('matched');
                b.el.classList.add('matched');
                a.el.disabled = true;
                b.el.disabled = true;
                KL.burst(b.el);
                flipped = [];
                matched++;
                lock = false;
                if (window.KL_TTS) window.KL_TTS.stop();
                // an animal makes its sound; a thing is named
                KL.later(function () {
                  if (KL_ART.isThing(a.key)) KL.say([KL_ART.nameKey(a.key)]);
                  else if (window.KL_SOUND) KL_SOUND.animal(a.key);
                }, 180);
                if (duo) { pairs[turn]++; showTurn(); }
                if (matched === nPairs) { KL.later(function () { if (duo) endDuo(nPairs, pairs); else end(nPairs, flips); }, 850); return; }
                var p = KL.praise();
                if (duo) KL.koalaSay(who(turn) + ' ' + p.text + ' — ' + KL.t(KL_ART.nameKey(a.key)), KL.t('minni.again' + turn) + (p.sub ? ' · ' + p.sub : ''));
                else KL.koalaSay(p.text + ' — ' + KL.t(KL_ART.nameKey(a.key)), p.sub);
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
                run = 0;
                if (duo) { // a miss passes the turn
                  turn = 3 - turn;
                  KL.sfx('turn');
                  showTurn();
                  KL.replay(main.querySelector('.duo-player.active'), 'turn-pop');
                  KL.koalaSay(who(turn) + ' ' + KL.t('minni.turn' + turn));
                }
              }, 900);
            }
          });
          board.appendChild(el);
        });
      }

      function end(nPairs, flips) {
        KL_I18N.endRound();
        showFlips(flips);
        KL.saveBest('flips.minni.' + nPairs, flips, true);
        KL.finish(ctx, {
          slotKey: 'minni.' + nPairs,
          stars: starsFor(nPairs, flips),
          earned: flips <= GOOD[nPairs],
          ruleText: KL.fmt('prize.rule_minni', { n: GOOD[nPairs] }),
          titleKey: 'minni.end_title',
          lines: [KL.fmt(flips % 10 === 1 && flips % 100 !== 11 ? 'minni.end_flips_one' : 'minni.end_flips', { n: flips }),
                  KL.t('minni.pairs' + nPairs) + ' · ' + KL.fmt('minni.end_best', { n: KL.getBest('flips.minni.' + nPairs) })],
          onReplay: function () { play(nPairs); }
        });
      }

      // two players: no stars or prizes; the one with more pairs gets the crown (both on a tie)
      function endDuo(nPairs, pairs) {
        KL_I18N.endRound();
        var w = pairs[1] > pairs[2] ? 1 : pairs[2] > pairs[1] ? 2 : 0;
        var key = w ? 'minni.win' + w : 'minni.tie';
        var hurra = KL_I18N.PRAISE[KL_I18N.HURRA];
        main.innerHTML =
          '<div class="question-card end-card enter">' + KL.guideHTML(96) +
            '<div class="duo-result">' + [1, 2].map(function (k) {
              var top = !w || w === k;
              return '<div class="duo-player p' + k + (top ? ' winner' : '') + '">' +
                (top ? '<span class="duo-crown">' + KL_ART.outfitIcon('crown', 46) + '</span>' : '') +
                KL_ART.animal(P[k - 1], 88) + '<strong>' + KL.t('minni.p' + k) + '</strong><span>' + pairsText(pairs[k]) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="end-buttons">' +
              '<button type="button" class="btn-primary" id="kl-replay">' + KL.t('end.replay') + '</button>' +
              '<a class="btn-secondary" href="#" data-nav="">' + KL.t('end.menu') + '</a>' +
            '</div>' +
          '</div>';
        KL.koalaSay(hurra.is + ' ' + KL.t(key), KL_I18N.lang() === 'da' ? KL.fmt('praise.means', { g: hurra.da }) : '');
        KL.koalaMood('happy');
        var speech = ['is:praise.' + KL_I18N.HURRA, key];
        KL.setReplay(speech);
        KL.say(speech);
        KL.onUnlock(null);
        KL.sfx('win');
        KL.confetti(70);
        document.getElementById('kl-replay').addEventListener('click', function () { play(nPairs); });
      }

      chooseSize();
    }
  });
})();
