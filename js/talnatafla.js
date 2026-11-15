/* A hundred chart with ten columns, or a counting snake from zero.
   The snake uses five cells per bend to leave room for little fingers.
   Both views offer listening games with higher/lower hints. */
(function () {
  'use strict';

  function board(parent, quiz, maxN, snake) {
    maxN = maxN || 100;
    var scroll = document.createElement('div');
    scroll.className = snake ? 'number-scroll snake-scroll' : 'number-scroll' + (maxN <= 20 ? ' compact' : '');
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', KL.t(snake ? 'talnatafla.snake' : 'talnatafla.range'));
    var grid = document.createElement('div');
    grid.className = snake ? 'snake-board' : 'number-grid';
    scroll.appendChild(grid);
    parent.appendChild(scroll);
    var row;
    return KL.range(snake ? 0 : 1, maxN).map(function (n) {
      if (snake && n % 5 === 0) {
        row = document.createElement('div');
        row.className = 'snake-row';
        grid.appendChild(row);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'number-cell' + (quiz ? ' answer' : '') + (snake && n % 10 === 0 ? ' snake-ten' : '');
      btn.textContent = n;
      btn.dataset.number = n;
      if (snake && n === 0) btn.classList.add('snake-head');
      if (!quiz) btn.setAttribute('aria-pressed', 'false');
      (snake ? row : grid).appendChild(btn);
      return btn;
    });
  }

  function findNumber(ctx, maxN, snake) {
    maxN = maxN || 100;
    KL.runGame({
      ctx: ctx,
      gameId: 'talnatafla',
      slotKey: KL.slot('talnatafla', maxN <= 20 ? '20' : null),
      makeQuestions: function () { return KL.sample(KL.range(snake ? 0 : 1, maxN), 10); },
      promptText: function (n) { return KL.fmt('talnatafla.find', { n: KL.t('num.' + n) }); },
      promptSpeech: function (n) { return ['num.' + n]; },
      retrySpeech: function (n, lv, a) { return [a.num < n ? 'talnatafla.say_higher' : 'talnatafla.say_lower', 'num.' + n]; },
      wrongSub: function (n, a) {
        return KL.t(a.num < n ? 'talnatafla.higher' : 'talnatafla.lower');
      },
      build: function (n, promptEl, answersEl) {
        promptEl.hidden = true;
        answersEl.className = 'number-answers';
        return board(answersEl, true, maxN, snake).map(function (btn) {
          var num = Number(btn.dataset.number);
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
          '<div class="number-views" role="group" aria-label="' + KL.t('talnatafla.view') + '">' +
            '<button type="button" class="chip active" data-view="table" aria-pressed="true">' + KL.t('talnatafla.table') + '</button>' +
            '<button type="button" class="chip" data-view="snake" aria-pressed="false">' + KL.t('talnatafla.snake') + '</button>' +
          '</div>' +
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
          '<div class="snake-steps" role="group" aria-label="' + KL.t('talnatafla.steps') + '" hidden>' +
            '<button type="button" class="chip" data-step="-10">−10</button>' +
            '<button type="button" class="chip" data-step="-1">−1</button>' +
            '<button type="button" class="chip" data-step="1">+1</button>' +
            '<button type="button" class="chip" data-step="10">+10</button>' +
          '</div>' +
        '</div>';
      var card = ctx.main.querySelector('.number-card');
      var selectedNumber = null, snake = false, step = 0, cells;
      var speech = ['talnatafla.start'];
      function mark() {
        cells.forEach(function (btn) {
          var n = Number(btn.dataset.number);
          btn.setAttribute('aria-pressed', String(n === selectedNumber));
          btn.classList.toggle('pat-hi', step > 0 && n % step === 0);
        });
        card.querySelectorAll('[data-step]').forEach(function (btn) {
          var next = selectedNumber + Number(btn.dataset.step);
          btn.disabled = next < 0 || next > 100;
        });
      }
      function select(n, move) {
          selectedNumber = n;
          mark();
          var key = 'num.' + n;
          card.querySelector('.number-value').textContent = n;
          card.querySelector('.number-name').textContent = KL.t(key);
          KL.koalaSay(KL.t(key));
          speech = [key];
          KL.setReplay(speech);
          KL.say(speech);
          if (move) {
            var scroll = card.querySelector('.number-scroll');
            var cell = cells.find(function (btn) { return Number(btn.dataset.number) === n; });
            var box = cell.getBoundingClientRect(), frame = scroll.getBoundingClientRect();
            if (box.top < frame.top || box.bottom > frame.bottom) scroll.scrollTop += box.top - frame.top - frame.height / 2 + box.height / 2;
          }
      }
      function showBoard() {
        var old = card.querySelector('.number-scroll');
        if (old) old.remove();
        cells = board(card, false, 100, snake);
        cells.forEach(function (btn) {
          btn.addEventListener('click', function () { select(Number(btn.dataset.number)); });
        });
        mark();
      }
      showBoard();
      card.querySelectorAll('[data-view]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          snake = btn.dataset.view === 'snake';
          card.querySelectorAll('[data-view]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', String(b === btn));
          });
          card.querySelector('.snake-steps').hidden = !snake;
          card.querySelector('.number-play-20').textContent = (snake ? '0–20' : KL.t('talnatafla.play20')) + ' →';
          if (selectedNumber === null || (!snake && selectedNumber === 0)) selectedNumber = snake ? 0 : 1;
          showBoard();
          select(selectedNumber, true);
        });
      });
      card.querySelectorAll('[data-step]').forEach(function (btn) {
        btn.addEventListener('click', function () { select(selectedNumber + Number(btn.dataset.step), true); });
      });
      card.querySelectorAll('[data-pat]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          KL.sfx('click');
          card.querySelectorAll('[data-pat]').forEach(function (c) {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
          });
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          var pat = chip.getAttribute('data-pat');
          step = pat === 'all' ? 0 : parseInt(pat, 10);
          mark();
        });
      });
      card.querySelectorAll('.number-play, .number-play-20').forEach(function (playBtn) {
        playBtn.addEventListener('click', function () {
          KL.sfx('click');
          findNumber(ctx, parseInt(playBtn.getAttribute('data-max'), 10), snake);
        });
      });
      KL.koalaSay(KL.t('talnatafla.start'));
      KL.setReplay(speech);
      KL.say(speech);
      KL.onUnlock(function () { KL.say(speech); });
    }
  });
})();
