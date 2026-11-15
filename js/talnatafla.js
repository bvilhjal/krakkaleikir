/* A hundred chart: ten numbers in each row, so moving down adds ten.
   Explore by tapping any number (with optional skip-counting highlights);
   the listening game offers 1-20 or 1-100 with higher/lower hints. */
(function () {
  'use strict';

  function board(parent, quiz, maxN) {
    maxN = maxN || 100;
    var scroll = document.createElement('div');
    scroll.className = 'number-scroll' + (maxN <= 20 ? ' compact' : '');
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', KL.t('talnatafla.range'));
    var grid = document.createElement('div');
    grid.className = 'number-grid';
    scroll.appendChild(grid);
    parent.appendChild(scroll);
    return KL.range(1, maxN).map(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'number-cell' + (quiz ? ' answer' : '');
      btn.textContent = n;
      if (!quiz) btn.setAttribute('aria-pressed', 'false');
      grid.appendChild(btn);
      return btn;
    });
  }

  function findNumber(ctx, maxN) {
    maxN = maxN || 100;
    KL.runGame({
      ctx: ctx,
      gameId: 'talnatafla',
      slotKey: KL.slot('talnatafla', maxN <= 20 ? '20' : null),
      makeQuestions: function () { return KL.sample(KL.range(1, maxN), 10); },
      promptText: function (n) { return KL.fmt('talnatafla.find', { n: KL.t('num.' + n) }); },
      promptSpeech: function (n) { return ['num.' + n]; },
      retrySpeech: function (n, lv, a) { return [a.num < n ? 'talnatafla.say_higher' : 'talnatafla.say_lower', 'num.' + n]; },
      wrongSub: function (n, a) {
        return KL.t(a.num < n ? 'talnatafla.higher' : 'talnatafla.lower');
      },
      build: function (n, promptEl, answersEl) {
        promptEl.hidden = true;
        answersEl.className = 'number-answers';
        return board(answersEl, true, maxN).map(function (btn, i) {
          var num = i + 1;
          return { el: btn, num: num, isCorrect: num === n, speechParts: ['num.' + n] };
        });
      }
    });
  }

  KL.register('talnatafla', {
    levels: [{ id: '20', label: '1–20' }, { id: null, label: '1–100' }],
    start: function (ctx) {
      ctx.main.innerHTML =
        '<div class="question-card number-card enter">' + KL.guideHTML(64) +
          '<div class="number-toolbar">' +
            '<div class="number-reading"><span class="number-value">1–100</span><span class="number-name"></span></div>' +
            '<div class="number-actions">' +
              '<button type="button" class="number-play-20" data-max="20">' + KL.t('talnatafla.play20') + ' →</button>' +
              '<button type="button" class="number-play" data-max="100">' + KL.t('talnatafla.play') + ' →</button>' +
            '</div>' +
          '</div>' +
          '<div class="number-filters" role="group" aria-label="' + KL.t('talnatafla.range') + '">' +
            '<button type="button" class="chip active" aria-pressed="true" data-pat="all">' + KL.t('talnatafla.all') + '</button>' +
            '<button type="button" class="chip" aria-pressed="false" data-pat="10">' + KL.t('talnatafla.tens') + '</button>' +
            '<button type="button" class="chip" aria-pressed="false" data-pat="5">' + KL.t('talnatafla.fives') + '</button>' +
            '<button type="button" class="chip" aria-pressed="false" data-pat="2">' + KL.t('talnatafla.evens') + '</button>' +
          '</div>' +
        '</div>';
      var card = ctx.main.querySelector('.number-card');
      var selected = null;
      var speech = ['talnatafla.start'];
      var cells = board(card, false, 100);
      cells.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          if (selected) selected.setAttribute('aria-pressed', 'false');
          selected = btn;
          btn.setAttribute('aria-pressed', 'true');
          var key = 'num.' + (i + 1);
          card.querySelector('.number-value').textContent = i + 1;
          card.querySelector('.number-name').textContent = KL.t(key);
          KL.koalaSay(KL.t(key));
          speech = [key];
          KL.setReplay(speech);
          KL.say(speech);
        });
      });
      card.querySelectorAll('.chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          KL.sfx('click');
          card.querySelectorAll('.chip').forEach(function (c) {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
          });
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          var pat = chip.getAttribute('data-pat');
          var step = pat === 'all' ? 0 : parseInt(pat, 10);
          cells.forEach(function (btn, idx) {
            btn.classList.toggle('pat-hi', step > 0 && (idx + 1) % step === 0);
          });
        });
      });
      card.querySelectorAll('.number-play, .number-play-20').forEach(function (playBtn) {
        playBtn.addEventListener('click', function () {
          KL.sfx('click');
          findNumber(ctx, parseInt(playBtn.getAttribute('data-max'), 10));
        });
      });
      KL.koalaSay(KL.t('talnatafla.start'));
      KL.setReplay(speech);
      KL.say(speech);
      KL.onUnlock(function () { KL.say(speech); });
    }
  });
})();
