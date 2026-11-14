document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  function renderBadges() {
    document.querySelectorAll('.badge[data-game]').forEach(function (el) {
      var game = el.getAttribute('data-game');
      var best = KL.getBest(game);
      if (best <= 0) {
        el.textContent = KL.t('badge.not_played');
      } else if (game === 'minni') {
        el.textContent = KL.fmt('badge.best_flips', { n: best });
      } else {
        el.textContent = KL.fmt('badge.best', { n: best });
      }
    });
  }

  renderBadges();

  document.querySelectorAll('.game-card').forEach(function (card) {
    card.addEventListener('click', function () {
      if (window.KL_SOUND) window.KL_SOUND.play('click');
    });
  });

  var reset = document.getElementById('reset-scores');
  if (reset) {
    reset.addEventListener('click', function () {
      KL.resetScores();
      renderBadges();
    });
  }
});
