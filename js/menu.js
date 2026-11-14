/* Menu: best-stars badges on the game cards and the reset button. */
(function () {
  'use strict';

  function badgeHTML(id) {
    var def = KL.games[id];
    if (!def) return '';
    var levels = def.levels || [{ id: null }];
    var parts = [];
    levels.forEach(function (lv) {
      var stars = KL.getBest('stars.' + KL.slot(id, lv.id));
      if (!stars) return;
      parts.push('<span class="slot">' + (lv.id ? '<span>' + KL.levelLabel(lv) + '</span>' : '') + KL.starsRow(stars, 3, 16) + '</span>');
    });
    return parts.length ? parts.join('') : KL.t('badge.not_played');
  }

  KL.renderMenu = function () {
    document.querySelectorAll('.badge[data-game]').forEach(function (el) {
      el.innerHTML = badgeHTML(el.getAttribute('data-game'));
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var reset = document.getElementById('reset-scores');
    if (reset) {
      reset.addEventListener('click', function () {
        KL.resetScores();
        KL.renderMenu();
      });
    }
  });
})();
