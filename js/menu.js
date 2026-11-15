/* Menu: best-stars badges on the game cards, total stars pill, the zoo (animal stickers and
   visiting parents), Kóli's wardrobe and reset button. */
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
      parts.push('<span class="slot">' + ((lv.id || lv.label) ? '<span>' + KL.levelLabel(lv) + '</span>' : '') + KL.starsRow(stars, 3, 16) + '</span>');
    });
    var won = Math.min(KL.prizesWon(id), KL.PRIZES_PER_GAME), gifts = '';
    for (var i = 0; i < KL.PRIZES_PER_GAME; i++) gifts += KL.giftSVG(i < won, 16);
    return (parts.length ? parts.join('') : KL.t('badge.not_played')) +
      '<span class="prizes" role="img" aria-label="' + KL.fmt('prize.badge', { n: won, t: KL.PRIZES_PER_GAME }) + '">' + gifts + '</span>';
  }

  function totalStars() {
    var earned = 0, total = 0;
    KL.gameOrder.forEach(function (id) {
      var def = KL.games[id];
      var levels = (def && def.levels) || [{ id: null }];
      levels.forEach(function (lv) {
        total += 3;
        earned += KL.getBest('stars.' + KL.slot(id, lv.id));
      });
    });
    return { earned: earned, total: total };
  }

  // the zoo: one fenced area per habitat; animals not found yet are grey outlines
  function stickerBook() {
    var have = KL.stickers();
    document.getElementById('sticker-count').textContent = have.length + ' / ' + KL_ART.ANIMALS.length;
    document.getElementById('sticker-grid').innerHTML = KL_ART.ZOO.map(function (area) {
      var n = area.animals.length; // wider areas for more animals
      return '<div class="zoo-area zoo-' + area.id + '" style="flex: ' + n + ' 1 ' + (n * 66 + 30) + 'px"><span class="zoo-sign">' + KL.t('zoo.' + area.id) + '</span><div class="zoo-animals">' +
        area.animals.map(function (id) {
          if (have.indexOf(id) < 0) return '<span class="sticker missing" title="?">' + KL_ART.silhouette(id, 56) + '</span>';
          return '<button type="button" class="sticker" data-animal-sound="' + id + '" aria-label="' + KL.fmt('sticker.sound', { a: KL.t('animal.' + id) }) + '">' +
            KL_ART.animal(id, 56) + '</button>';
        }).join('') + '</div></div>';
    }).join('') + KL.familyHTML();
  }

  // Kóli's wardrobe: a big Kóli to dress, and the clothes earned so far
  function wardrobeHTML() {
    var have = KL.wardrobe(), worn = KL.outfit();
    var on = Object.keys(worn).map(function (k) { return worn[k]; });
    document.getElementById('wardrobe-count').textContent = have.length + ' / ' + KL_ART.OUTFIT_IDS.length;
    document.getElementById('wardrobe-hint').textContent = KL.t(have.length ? 'wardrobe.hint' : 'wardrobe.empty');
    document.getElementById('wardrobe-grid').innerHTML = KL_ART.OUTFIT_IDS.map(function (id) {
      if (have.indexOf(id) < 0) return '<span class="outfit-item locked" aria-label="' + KL.t('wardrobe.locked') + '">?</span>';
      var pressed = on.indexOf(id) >= 0;
      return '<button type="button" class="outfit-item" data-outfit="' + id + '" aria-pressed="' + pressed + '" aria-label="' +
        KL.fmt('wardrobe.wear', { a: KL.t('outfit.' + id) }) + '">' + KL_ART.outfitIcon(id, 54) + '</button>';
    }).join('');
    KL.dressKoalas();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-outfit]') : null;
    if (!b) return;
    KL.wear(b.getAttribute('data-outfit'));
    KL.sfx('pop');
    wardrobeHTML();
    document.querySelectorAll('#menu .koala').forEach(function (k) { k.classList.remove('spin'); KL.replay(k, 'happy'); });
  });

  KL.renderMenu = function () {
    document.querySelectorAll('.badge[data-game]').forEach(function (el) {
      el.innerHTML = badgeHTML(el.getAttribute('data-game'));
    });
    var score = document.getElementById('score');
    if (score) {
      var st = totalStars();
      if (st.earned > 0) {
        score.innerHTML = KL.starSVG(true, 22) + '<span>' + st.earned + '/' + st.total + '</span>';
        score.setAttribute('aria-label', KL.fmt('menu.stars_aria', { n: st.earned }));
      } else {
        score.innerHTML = '';
        score.removeAttribute('aria-label');
      }
    }
    stickerBook();
    wardrobeHTML();
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
