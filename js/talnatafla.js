/* A hundred chart: ten numbers in each row, so moving down adds ten.
   Explore by tapping any number; the listening game uses the same board and
   the shared ten-question engine for retries, stars and stickers. */
(function () {
  'use strict';

  function board(parent, quiz) {
    var scroll = document.createElement('div');
    scroll.className = 'number-scroll';
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', KL.t('talnatafla.range'));
    var grid = document.createElement('div');
    grid.className = 'number-grid';
    scroll.appendChild(grid);
    parent.appendChild(scroll);
    return KL.range(1, 100).map(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'number-cell' + (quiz ? ' answer' : '');
      btn.textContent = n;
      if (!quiz) btn.setAttribute('aria-pressed', 'false');
      grid.appendChild(btn);
      return btn;
    });
  }

  function findNumber(ctx) {
    KL.runGame({
      ctx: ctx,
      gameId: 'talnatafla',
      makeQuestions: function () { return KL.sample(KL.range(1, 100), 10); },
      promptText: function (n) { return KL.fmt('talnatafla.find', { n: KL.t('num.' + n) }); },
      promptSpeech: function (n) { return ['num.' + n]; },
      build: function (n, promptEl, answersEl) {
        promptEl.hidden = true;
        answersEl.className = 'number-answers';
        return board(answersEl, true).map(function (btn, i) {
          return { el: btn, isCorrect: i + 1 === n, speechParts: ['num.' + n] };
        });
      }
    });
  }

  KL.register('talnatafla', {
    start: function (ctx) {
      ctx.main.innerHTML =
        '<div class="question-card number-card enter">' + KL.guideHTML(64) +
          '<div class="number-toolbar">' +
            '<div class="number-reading"><span class="number-value">1–100</span><span class="number-name"></span></div>' +
            '<button type="button" class="number-play">' + KL.t('talnatafla.play') + ' →</button>' +
          '</div>' +
        '</div>';
      var card = ctx.main.querySelector('.number-card');
      var selected = null;
      var speech = ['talnatafla.start'];
      board(card, false).forEach(function (btn, i) {
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
      card.querySelector('.number-play').addEventListener('click', function () {
        KL.sfx('click');
        findNumber(ctx);
      });
      KL.koalaSay(KL.t('talnatafla.start'));
      KL.setReplay(speech);
      KL.say(speech);
      KL.onUnlock(function () { KL.say(speech); });
    }
  });
})();
