document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  function renderBadges() {
    document.querySelectorAll('.badge[data-game]').forEach(function (el) {
      var game = el.getAttribute('data-game');
      var best = KL.getBest(game);
      if (best <= 0) {
        el.textContent = 'Ekki búið að spila';
      } else if (game === 'minni') {
        el.textContent = 'Best: ' + best + ' snúningar';
      } else {
        el.textContent = 'Best: ' + best + ' / 10';
      }
    });
  }

  renderBadges();

  var reset = document.getElementById('reset-scores');
  if (reset) {
    reset.addEventListener('click', function () {
      KL.resetScores();
      renderBadges();
    });
  }
});
