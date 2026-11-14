/* Menu: best-stars badges on the game cards, the sticker book and the reset button. */
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

  function stickerBook() {
    var have = KL.stickers();
    document.getElementById('sticker-count').textContent = have.length + ' / ' + KL_ART.ANIMALS.length;
    document.getElementById('sticker-grid').innerHTML = KL_ART.ANIMALS.map(function (id) {
      var got = have.indexOf(id) >= 0;
      if (!got) return '<span class="sticker missing" title="?">' + KL_ART.silhouette(id, 56) + '</span>';
      return '<button type="button" class="sticker" data-animal-sound="' + id + '" aria-label="' + KL.fmt('sticker.sound', { a: KL.t('animal.' + id) }) + '">' +
        KL_ART.animal(id, 56) + '</button>';
    }).join('');
  }

  KL.renderMenu = function () {
    document.querySelectorAll('.badge[data-game]').forEach(function (el) {
      el.innerHTML = badgeHTML(el.getAttribute('data-game'));
    });
    stickerBook();
  };

  // animal versions of the Tölur and Minni card icons
  function icons() {
    var A = KL_ART;
    var tolur = document.querySelector('.game-card[data-nav="tolur"] .icon');
    if (tolur) {
      tolur.innerHTML = '<svg width="96" height="84" viewBox="0 0 120 100" aria-hidden="true">' +
        '<svg x="0" y="34" width="44" height="44" viewBox="0 0 100 100">' + A.face('fiskur') + '</svg>' +
        '<svg x="38" y="10" width="44" height="44" viewBox="0 0 100 100">' + A.face('froskur') + '</svg>' +
        '<svg x="76" y="38" width="44" height="44" viewBox="0 0 100 100">' + A.face('ungi') + '</svg></svg>';
    }
    var minni = document.querySelector('.game-card[data-nav="minni"] .icon');
    if (minni) {
      minni.innerHTML = '<svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true">' +
        '<g transform="rotate(-8 33 49)"><rect x="14" y="24" width="38" height="50" rx="8" fill="#fff" stroke="#E07A5F" stroke-width="4"/>' +
        '<svg x="17" y="33" width="32" height="32" viewBox="0 0 100 100">' + A.face('ljon') + '</svg></g>' +
        '<g transform="rotate(8 67 49)"><rect x="48" y="24" width="38" height="50" rx="8" fill="#fff" stroke="#E07A5F" stroke-width="4"/>' +
        '<svg x="51" y="33" width="32" height="32" viewBox="0 0 100 100">' + A.face('ljon') + '</svg></g></svg>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    icons();
    var reset = document.getElementById('reset-scores');
    if (reset) {
      reset.addEventListener('click', function () {
        if (!window.confirm(KL.t('reset.confirm'))) return;
        KL.resetScores();
        KL.renderMenu();
      });
    }
  });
})();
