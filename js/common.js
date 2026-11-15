/* Shared helpers, Kóli the guide, the multiple-choice game engine and the page
   router for Krakkaleikir. Vanilla JS, no dependencies. Load after i18n.js,
   sound.js, tts.js and art.js; each game script then calls KL.register().

   The whole app is one page (index.html): '#tolur' etc. show a game, an empty
   hash shows the menu. Staying on one page keeps audio unlocked after the first
   tap (iOS asks for a new tap on every page load), so prompts are spoken as soon
   as a game opens. */
(function () {
  'use strict';

  var I = window.KL_I18N;
  var ART = window.KL_ART;

  function say(parts, onDone) {
    if (window.KL_SOUND) window.KL_SOUND.stopAnimal();
    if (window.KL_TTS) window.KL_TTS.say(parts, onDone);
    else if (onDone) setTimeout(onDone, 0);
  }
  function sfx(name) { if (window.KL_SOUND) window.KL_SOUND.play(name); }

  /* ---- Web Speech fallback (used by tts.js when an mp3 is missing) ----
     onDone runs once, after the utterance ends or fails. tts.js needs that
     callback to avoid playing the next mp3 on top of the fallback voice. */
  function speak(text, lang, onDone) {
    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      if (onDone) onDone();
    }
    try {
      if (window.KL_SOUND && !window.KL_SOUND.on()) { if (onDone) setTimeout(done, 0); return; }
      if (!('speechSynthesis' in window)) { if (onDone) setTimeout(done, 0); return; }
      var u = new SpeechSynthesisUtterance(String(text));
      var l = I.speechLang(lang);
      u.lang = l;
      u.rate = 0.85;
      u.pitch = 1.1;
      u.volume = 1;
      u.onend = done;
      u.onerror = done;
      // pick an explicit voice when the list is available (iOS loads it lazily)
      var prefix = l.slice(0, 2).toLowerCase();
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang && vs[i].lang.toLowerCase().indexOf(prefix) === 0) { u.voice = vs[i]; break; }
      }
      // Do not cancel an idle iOS speech queue: it can wedge later speech.
      // tts.js cancels only a fallback that is actually in flight.
      try { window.speechSynthesis.speak(u); } catch (e) { done(); }
    } catch (e) { done(); }
  }

  /* ---- audio unlock ----
     Browsers (iOS above all) refuse to start audio before the page has had a
     tap. Warm up Web Speech on the first touch; when a spoken prompt was
     refused, say it again inside the next tap (onUnlock sets what to say),
     otherwise use the tap to unlock the shared speech element. */
  var unlockCb = null;
  function onUnlock(fn) { unlockCb = fn || null; }
  function warmSpeech() {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.getVoices(); // also triggers voice loading on iOS
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    } catch (e) { /* ignore */ }
  }
  document.addEventListener('pointerdown', warmSpeech, { once: true });
  document.addEventListener('touchstart', warmSpeech, { once: true });
  var OWN_AUDIO = '#sound-toggle, [data-lang], [data-nav], [data-animal-sound], [data-family], .guide .koala, .guide .bubble, [data-outfit], .wardrobe-koala, .level-btn, .answer:not(:disabled), .clock-num:not(:disabled), .number-cell:not(:disabled), .number-play, .number-play-20, .sound-btn, .animal-prompt, .measure-pencil-drag, .measure-place, #kl-replay';
  function onGesture(e) {
    var T = window.KL_TTS;
    if (!T) return;
    var own = e && e.target && e.target.closest && e.target.closest(OWN_AUDIO);
    // keep the callback: a touchend that ends a scroll is no gesture, so the
    // prompt is refused again and the next real tap has to say it
    if (!own && T.blocked() && unlockCb) {
      try { unlockCb(); } catch (err) { /* ignore */ }
    } else {
      T.prime();
    }
  }
  document.addEventListener('touchend', onGesture, true);
  document.addEventListener('click', onGesture, true);

  /* ---- timers that belong to the current screen: cleared when the screen changes ---- */
  var timers = [];
  function later(fn, ms) {
    var id = setTimeout(function () {
      timers = timers.filter(function (x) { return x !== id; });
      fn();
    }, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() {
    timers.forEach(function (id) { clearTimeout(id); });
    timers = [];
  }

  /* ---- small helpers ---- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.min(n, arr.length)); }
  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function range(lo, hi) { var r = []; for (var v = lo; v <= hi; v++) r.push(v); return r; }
  function pickDistinct(pool, correct, count) {
    var distractors = shuffle(pool.filter(function (x) { return x !== correct; }));
    return shuffle([correct].concat(distractors.slice(0, count - 1)));
  }
  // restart a CSS animation class on an element
  function replay(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // reflow, so the animation runs again
    el.classList.add(cls);
  }

  function starSVG(filled, size) {
    size = size || 34;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" fill="' +
      (filled ? '#FFC93C' : 'none') + '" stroke="' + (filled ? '#E0A100' : '#C9CBD6') +
      '" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }
  function starsRow(filledCount, total, size) {
    var s = '';
    for (var i = 0; i < total; i++) s += starSVG(i < filledCount, size || 44);
    return s;
  }
  // a little present: the prizes a game still has to give (menu badges)
  function giftSVG(filled, size) {
    var c = filled ? '#E07A5F' : 'none', s = filled ? '#B5523A' : '#C9CBD6';
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="4" y="10" width="16" height="11" rx="2" fill="' + c + '" stroke="' + s + '" stroke-width="1.6"/>' +
      '<rect x="2.5" y="6.5" width="19" height="4" rx="1.5" fill="' + c + '" stroke="' + s + '" stroke-width="1.6"/>' +
      '<path d="M12 6.5V21" stroke="' + (filled ? '#FFC93C' : s) + '" stroke-width="2.2"/>' +
      '<path d="M12 6.5C10 2.5 5.5 3 6.5 5.5 7.5 7 11 6.5 12 6.5ZM12 6.5C14 2.5 18.5 3 17.5 5.5 16.5 7 13 6.5 12 6.5Z" fill="none" stroke="' + s + '" stroke-width="1.6"/></svg>';
  }
  function speakerSVG(size, color) {
    size = size || 30;
    color = color || '#5C6BC0';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="' + color + '"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  /* ---- persistence: best results, stickers, Kóli's wardrobe ----
     'kl.stars.<game>[.<level>]' = best stars (1-3); 'kl.flips.minni.<pairs>' =
     fewest flips; 'kl.stickers' = collected animals (JSON list); 'kl.wardrobe' =
     Kóli's clothes (JSON list); 'kl.outfit' = what he wears ({ slot: item });
     'kl.rewards' = prizes handed out, so animals and clothes take turns;
     'kl.prizes.<game>' = prizes won in that game (at most PRIZES_PER_GAME). */
  var PRIZES_PER_GAME = 3;
  // Failed writes stay authoritative for this visit. Successful reads are
  // remembered too, so a later storage failure does not empty an existing zoo.
  var progressMemory = Object.create(null), unsavedProgress = Object.create(null);
  var storageReadFailed = false, storageWriteFailed = false;
  function temporaryProgress() { return storageReadFailed || storageWriteFailed || Object.keys(unsavedProgress).length > 0; }
  function storageNotice() {
    var el = document.getElementById('storage-note');
    var key = temporaryProgress() ? 'footer.temporary' : 'footer.note';
    if (el && el.getAttribute('data-i18n') !== key) {
      el.setAttribute('data-i18n', key);
      el.textContent = I.t(key);
    }
  }
  function readProgress(key) {
    if (Object.prototype.hasOwnProperty.call(unsavedProgress, key)) return progressMemory[key];
    try {
      progressMemory[key] = window.localStorage.getItem(key);
      storageReadFailed = false;
    } catch (e) { storageReadFailed = true; }
    storageNotice();
    return progressMemory[key] === undefined ? null : progressMemory[key];
  }
  function writeProgress(key, value) {
    progressMemory[key] = value;
    // After a failed save, keep later writes together in memory. In particular,
    // do not persist a spent prize when its animal could not be saved.
    if (storageWriteFailed && value !== null) { unsavedProgress[key] = true; storageNotice(); return; }
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
      delete unsavedProgress[key];
    } catch (e) { unsavedProgress[key] = true; storageWriteFailed = true; }
    storageNotice();
  }
  function prizesWon(gameId) { return getBest('prizes.' + gameId); }
  function slot(gameId, level) { return gameId + (level ? '.' + level : ''); }
  function getBest(key) {
    return parseInt(readProgress('kl.' + key) || '0', 10) || 0;
  }
  function saveBest(key, value, lowerIsBetter) {
    var b = getBest(key);
    if (!b || (lowerIsBetter ? value < b : value > b)) writeProgress('kl.' + key, String(value));
  }
  function stickers() {
    try {
      var s = JSON.parse(readProgress('kl.stickers') || 'null');
      if (Array.isArray(s)) return s.filter(function (id, i) { return ART.ANIMALS.indexOf(id) >= 0 && s.indexOf(id) === i; });
    } catch (e) { /* ignore */ }
    return ['koala']; // Kóli is the first sticker
  }
  function awardSticker() {
    var have = stickers();
    var left = ART.ANIMALS.filter(function (id) { return have.indexOf(id) < 0; });
    if (!left.length) return null;
    var id = left[randInt(0, left.length - 1)];
    have.push(id);
    writeJSON('kl.stickers', have);
    return id;
  }
  function readJSON(key, fallback) {
    try {
      var v = JSON.parse(readProgress(key) || 'null');
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, v) {
    writeProgress(key, JSON.stringify(v));
  }
  function wardrobe() {
    var w = readJSON('kl.wardrobe', []);
    return Array.isArray(w) ? w.filter(function (id, i) { return ART.OUTFIT_IDS.indexOf(id) >= 0 && w.indexOf(id) === i; }) : [];
  }
  // what Kóli wears now: only clothes he owns, one per slot
  var outfitNow = null; // kept in memory too, for browsers that block storage
  function outfit() {
    var o = outfitNow || readJSON('kl.outfit', {}), have = wardrobe(), out = {};
    if (o && typeof o === 'object') {
      Object.keys(o).forEach(function (slotName) {
        if (have.indexOf(o[slotName]) >= 0 && ART.outfitSlot(o[slotName]) === slotName) out[slotName] = o[slotName];
      });
    }
    return out;
  }
  // put an item on (or take it off when he already wears it)
  function wear(id) {
    var o = outfit(), slotName = ART.outfitSlot(id);
    if (!slotName || wardrobe().indexOf(id) < 0) return o;
    if (o[slotName] === id) delete o[slotName]; else o[slotName] = id;
    outfitNow = o;
    writeJSON('kl.outfit', o);
    dressKoalas();
    return o;
  }
  function awardOutfit() {
    var have = wardrobe();
    var left = ART.OUTFIT_IDS.filter(function (id) { return have.indexOf(id) < 0; });
    if (!left.length) return null;
    var id = left[randInt(0, left.length - 1)];
    have.push(id);
    writeJSON('kl.wardrobe', have);
    var o = outfit();
    o[ART.outfitSlot(id)] = id; // Kóli puts it on right away
    outfitNow = o;
    writeJSON('kl.outfit', o);
    return id;
  }
  // one prize per finished game: two new zoo animals, then something for Kóli
  function awardReward() {
    var haveS = stickers(), haveO = wardrobe();
    var stickerLeft = ART.ANIMALS.some(function (id) { return haveS.indexOf(id) < 0; });
    var outfitLeft = ART.OUTFIT_IDS.some(function (id) { return haveO.indexOf(id) < 0; });
    var n = getBest('rewards');
    var prize = outfitLeft && (!stickerLeft || n % 3 === 2) ? { outfit: awardOutfit() } : { sticker: awardSticker() };
    writeProgress('kl.rewards', String(n + 1));
    return prize;
  }
  function allAnimals() {
    var have = stickers();
    return ART.ANIMALS.every(function (id) { return have.indexOf(id) >= 0; });
  }
  // Mom and Dad visit the zoo once it holds enough animals (I.FAMILY[id].need)
  function familyHere(id) { return !!I.FAMILY[id] && stickers().length >= I.FAMILY[id].need; }
  // ids: which parents to show (default: both, waiting ones as a grey outline);
  // arrived: the end-card version, announcing who just came
  function familyHTML(ids, arrived) {
    ids = ids || Object.keys(I.FAMILY);
    if (!ids.length) return '';
    return '<section class="family-reward"><h2>' + I.t('family.title') + '</h2>' +
      (arrived ? '<p>' + I.fmt('family.arrived', { p: I.t('family.' + ids[0]) }) + '</p>' : '') +
      '<div class="family-row">' + ids.map(function (id) {
        var p = I.FAMILY[id];
        if (!familyHere(id)) {
          return '<span class="family-sticker waiting"><span class="sil">' + ART.parent(id, 88) + '</span><strong>' + I.t('family.' + id) + '</strong>' +
            '<span>' + I.fmt('family.locked', { n: p.need }) + '</span></span>';
        }
        return '<button type="button" class="family-sticker" data-family="' + id + '" aria-label="' + I.t('family.' + id) + ': ' + p.text + '">' +
          ART.parent(id, 88) + '<strong>' + I.t('family.' + id) + '</strong><span lang="' + p.lang + '">' + p.text + '</span></button>';
      }).join('') + '</div></section>';
  }
  function resetScores() {
    var keys = Object.keys(progressMemory);
    storageWriteFailed = false;
    try {
      keys = keys.concat(Object.keys(window.localStorage));
    } catch (e) { /* ignore */ }
    keys.filter(function (k, i) { return keys.indexOf(k) === i; }).forEach(function (k) {
      // Failed removals remain null in memory; old prizes must not reappear.
      if (/^kl\.(stars|flips|best|prizes)\./.test(k) || /^kl\.(stickers|wardrobe|outfit|rewards)$/.test(k)) writeProgress(k, null);
    });
    outfitNow = null;
    dressKoalas();
  }

  /* ---- SVG shapes (shape keys are always Icelandic, internal only) ---- */
  function starPoints(cx, cy, outer, inner, points) {
    var pts = [];
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = (Math.PI / points) * i - Math.PI / 2;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }
  function polyPoints(cx, cy, r, sides, rotDeg) {
    var pts = [];
    var rot = ((rotDeg || 0) - 90) * Math.PI / 180;
    for (var i = 0; i < sides; i++) {
      var a = rot + (2 * Math.PI * i) / sides;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }
  function shapeSVG(shape, color, size) {
    size = size || 120;
    var common = 'stroke="rgba(0,0,0,0.22)" stroke-width="3" stroke-linejoin="miter" stroke-miterlimit="6"';
    var inner = '';
    switch (shape) {
      case 'ferningur':
        inner = '<rect x="14" y="14" width="72" height="72" fill="' + color + '" ' + common + '/>';
        break;
      case 'þríhyrningur':
        inner = '<polygon points="50,13 89,81 11,81" fill="' + color + '" ' + common + '/>';
        break;
      case 'rétthyrningur':
        inner = '<rect x="8" y="25" width="84" height="50" fill="' + color + '" ' + common + '/>';
        break;
      case 'stjarna':
        inner = '<polygon points="' + starPoints(50, 52, 42, 17, 5) + '" fill="' + color + '" ' + common + '/>';
        break;
      case 'hjarta':
        inner = '<path d="M50 86 C22 64 10 46 10 32 C10 18 21 10 32 10 C40 10 47 14 50 22 C53 14 60 10 68 10 C79 10 90 18 90 32 C90 46 78 64 50 86 Z" fill="' + color + '" ' + common + '/>';
        break;
      case 'sporbaugur':
        inner = '<ellipse cx="50" cy="50" rx="43" ry="26" fill="' + color + '" ' + common + '/>';
        break;
      case 'tígull':
        inner = '<polygon points="50,8 84,50 50,92 16,50" fill="' + color + '" ' + common + '/>';
        break;
      case 'hálfmáni':
        inner = '<path d="M64 13 A38 38 0 1 0 64 87 A28 33 0 1 1 64 13 Z" fill="' + color + '" ' + common + '/>';
        break;
      case 'fimmhyrningur':
        inner = '<polygon points="' + polyPoints(50, 53, 41, 5, 0) + '" fill="' + color + '" ' + common + '/>';
        break;
      case 'sexhyrningur':
        inner = '<polygon points="' + polyPoints(50, 50, 41, 6, 0) + '" fill="' + color + '" ' + common + '/>';
        break;
      case 'átthyrningur':
        inner = '<polygon points="' + polyPoints(50, 50, 41, 8, 22.5) + '" fill="' + color + '" ' + common + '/>';
        break;
      case 'hringur':
      default:
        inner = '<circle cx="50" cy="50" r="39" fill="' + color + '" ' + common + '/>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  }

  /* ---- Kóli the guide: koala + speech bubble ----
     Tapping Kóli or the bubble repeats what he last asked (setReplay). */
  var replayParts = null;
  var replayAfter = null;
  function setReplay(parts, onAfter) { replayParts = parts; replayAfter = onAfter || null; }
  function guideHTML(size) {
    return '<div class="guide">' +
      '<button type="button" class="koala" data-size="' + (size || 76) + '" aria-label="' + I.t('speak.aria') + '">' + ART.koala(size || 76, null, outfit()) + '</button>' +
      '<div class="bubble" role="status" aria-live="polite"><div class="bubble-text"></div><div class="bubble-sub"></div><span class="bubble-ear" aria-hidden="true">' + speakerSVG(18, '#7A82A6') + '</span></div>' +
    '</div>';
  }
  // redraw every Kóli on the page in his current outfit
  function dressKoalas() {
    var o = outfit();
    document.querySelectorAll('.koala[data-size]').forEach(function (k) {
      k.innerHTML = ART.koala(parseInt(k.getAttribute('data-size'), 10) || 76, null, o);
    });
  }
  // three quick taps on Kóli tickle him: he giggles and spins
  var tickles = [];
  function tickle(k) {
    var now = Date.now();
    tickles = tickles.filter(function (t) { return now - t < 1500; });
    tickles.push(now);
    if (tickles.length < 3) return false;
    tickles = [];
    if (window.KL_TTS) window.KL_TTS.stop();
    sfx('giggle');
    k.classList.remove('happy', 'oops', 'hint');
    replay(k, 'spin');
    return true;
  }
  function screenEl() { return document.getElementById(current ? 'game' : 'menu'); }
  function guideEl() { var s = screenEl(); return s ? s.querySelector('.guide') : null; }
  function koalaSay(text, sub) {
    var g = guideEl();
    if (!g) return;
    g.querySelector('.koala').setAttribute('aria-label', I.t('speak.aria'));
    g.querySelector('.bubble-text').innerHTML = text || '';
    g.querySelector('.bubble-sub').textContent = sub || '';
    replay(g.querySelector('.bubble'), 'pop');
  }
  function koalaMood(mood) {
    var g = guideEl();
    if (!g) return;
    var k = g.querySelector('.koala');
    k.classList.remove('happy', 'oops', 'spin');
    replay(k, mood);
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var parent = e.target.closest('[data-family]');
    if (parent) {
      var reward = I.FAMILY[parent.getAttribute('data-family')];
      if (!familyHere(parent.getAttribute('data-family'))) return;
      onUnlock(null);
      say([reward.lang + ':family.' + parent.getAttribute('data-family')]);
      replay(parent, 'sticker-play');
      return;
    }
    var sticker = e.target.closest('[data-animal-sound]');
    if (sticker) {
      if (window.KL_TTS) window.KL_TTS.stop();
      onUnlock(null);
      if (window.KL_SOUND) window.KL_SOUND.animal(sticker.getAttribute('data-animal-sound'));
      replay(sticker, 'sticker-play');
      return;
    }
    var koalaBtn = e.target.closest('.koala');
    if (koalaBtn && tickle(koalaBtn)) { onUnlock(null); return; }
    if (koalaBtn && koalaBtn.classList.contains('wardrobe-koala')) { sfx('pop'); koalaBtn.classList.remove('spin'); replay(koalaBtn, 'happy'); return; }
    if (e.target.closest('.guide .koala, .guide .bubble') && replayParts) {
      var g = guideEl();
      if (g) g.querySelector('.koala').classList.remove('hint');
      var after = replayAfter;
      say(replayParts, after ? function () {
        if (!(window.KL_TTS && window.KL_TTS.blocked())) after();
      } : undefined);
    }
  });
  if (window.KL_TTS) {
    window.KL_TTS.onState(function (s) {
      document.querySelectorAll('.guide .koala').forEach(function (k) {
        k.classList.toggle('talking', s === 'talk');
        if (s === 'talk') k.classList.remove('hint');
        if (s === 'blocked') k.classList.add('hint'); // wiggle: tap me to hear it
      });
    });
  }

  // Kóli's Icelandic cheer: 'Frábært!' most often; in Danish the meaning is shown under it
  function praise() {
    var i = Math.random() < 0.3 ? 0 : randInt(1, I.PRAISE.length - 2);
    return { key: 'is:praise.' + i, text: I.PRAISE[i].is, sub: I.lang() === 'da' ? I.fmt('praise.means', { g: I.PRAISE[i].da }) : '' };
  }

  /* ---- celebrations ---- */
  var COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#FFC93C', '#26C6DA', '#F48FB1', '#8E24AA'];
  function fxLayer() {
    var fx = document.getElementById('fx');
    if (!fx) { fx = document.createElement('div'); fx.id = 'fx'; fx.setAttribute('aria-hidden', 'true'); document.body.appendChild(fx); }
    return fx;
  }
  // little sparks flying out of an element
  function burst(el) {
    if (!el) return;
    var r = el.getBoundingClientRect(), fx = fxLayer();
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      var a = (i / 10) * Math.PI * 2;
      var d = 50 + Math.random() * 40;
      s.style.left = (r.left + r.width / 2) + 'px';
      s.style.top = (r.top + r.height / 2) + 'px';
      s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
      s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(0) + 'px');
      s.style.background = COLORS[i % COLORS.length];
      fx.appendChild(s);
    }
    setTimeout(function () { fx.querySelectorAll('.spark').forEach(function (s) { s.remove(); }); }, 900);
  }
  function confetti(n) {
    var fx = fxLayer();
    for (var i = 0; i < (n || 60); i++) {
      var c = document.createElement('span');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = COLORS[i % COLORS.length];
      c.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
      c.style.animationDuration = (1.8 + Math.random() * 1.4).toFixed(2) + 's';
      c.style.setProperty('--spin', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      fx.appendChild(c);
    }
    setTimeout(function () { fx.querySelectorAll('.confetti').forEach(function (c) { c.remove(); }); }, 3800);
  }

  /* ---- level choice: Kóli asks, one big button per level with the best stars ----
     levels: [{ id, label } or { id, labelKey }]; opts: { gameId, textKey, speech } */
  function levelLabel(lv) { return lv.labelKey ? I.t(lv.labelKey) : lv.label; }
  function levelScreen(ctx, levels, opts, onPick) {
    ctx.main.innerHTML =
      '<div class="question-card enter">' + guideHTML() +
        '<div class="level-row"></div>' +
      '</div>';
    var row = ctx.main.querySelector('.level-row');
    levels.forEach(function (lv) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'level-btn';
      var best = getBest('stars.' + slot(opts.gameId, lv.id));
      b.innerHTML = '<span class="lv-label">' + levelLabel(lv) + '</span>' + (best ? '<span class="lv-stars">' + starsRow(best, 3, 20) + '</span>' : '');
      b.addEventListener('click', function () { sfx('click'); onPick(lv.id); });
      row.appendChild(b);
    });
    koalaSay(I.t(opts.textKey));
    var speech = opts.speech || [opts.textKey];
    setReplay(speech);
    say(speech);
    onUnlock(function () { say(speech); });
  }

  /* ---- end of a game: stars, a prize, confetti ----
     o: { slotKey, gameId, stars, earned, ruleText, titleKey, lines: [html], onReplay }
     A prize (a zoo animal or something for Kóli) comes only for a good round
     (o.earned) and at most PRIZES_PER_GAME times from the same game. */
  function finish(ctx, o) {
    I.endRound();
    sfx('win');
    saveBest('stars.' + o.slotKey, o.stars);
    var best = getBest('stars.' + o.slotKey);
    var gameId = o.gameId || String(o.slotKey).split('.')[0];
    var before = stickers().length;
    var haveO = wardrobe();
    var prizesLeft = before < ART.ANIMALS.length || ART.OUTFIT_IDS.some(function (id) { return haveO.indexOf(id) < 0; });
    var prize = {}, why = null;
    if (prizesLeft && !o.earned) why = 'retry';
    else if (prizesLeft && prizesWon(gameId) >= PRIZES_PER_GAME) why = 'done';
    else if (prizesLeft) {
      prize = awardReward();
      writeProgress('kl.prizes.' + gameId, String(prizesWon(gameId) + 1));
    }
    var sticker = prize.sticker, dress = prize.outfit;
    // a parent whose number of animals was reached just now comes to visit
    var visitors = Object.keys(I.FAMILY).filter(function (id) { return before < I.FAMILY[id].need && familyHere(id); });
    var hurra = I.PRAISE[I.HURRA];
    var speech = ['is:praise.' + I.HURRA, o.titleKey].concat(sticker ? ['sticker.' + sticker] : dress ? ['outfit.new'] : why ? ['prize.' + why] : (allAnimals() ? ['sticker.all'] : []))
      .concat(visitors.map(function (id) { return I.FAMILY[id].lang + ':family.' + id; }));
    ctx.main.innerHTML =
      '<div class="question-card end-card enter">' + guideHTML(96) +
        '<div class="big-stars">' + starsRow(o.stars, 3, 56) + '</div>' +
        o.lines.map(function (l) { return '<p>' + l + '</p>'; }).join('') +
        '<p class="best">' + I.t('end.best') + ' <span class="inline-stars">' + starsRow(best, 3, 24) + '</span></p>' +
        (temporaryProgress() ? '<p class="storage-note" role="status">' + I.t('footer.temporary') + '</p>' : '') +
        (sticker ? '<div class="sticker-reveal"><button type="button" class="sticker-new" data-animal-sound="' + sticker + '" aria-label="' + I.fmt('sticker.sound', { a: I.t('animal.' + sticker) }) + '">' + ART.animal(sticker, 92) + '</button>' +
          '<p>' + I.fmt('sticker.new', { a: I.t('animal.' + sticker) }) + '</p></div>' : '') +
        (dress ? '<div class="sticker-reveal outfit-reveal"><span class="sticker-new">' + ART.outfitIcon(dress, 92) + '</span>' +
          '<p>' + I.fmt('outfit.new_text', { a: I.t('outfit.' + dress) }) + '</p></div>' : '') +
        (why ? '<p class="prize-note">' + I.t('prize.' + why) + (why === 'retry' && o.ruleText ? '<small>' + o.ruleText + '</small>' : '') + '</p>' : '') +
        familyHTML(visitors, true) +
        '<div class="end-buttons">' +
          '<button type="button" class="btn-primary" id="kl-replay">' + I.t('end.replay') + '</button>' +
          '<a class="btn-secondary" href="#" data-nav="">' + I.t('end.menu') + '</a>' +
        '</div>' +
      '</div>';
    koalaSay(hurra.is + ' ' + I.t(o.titleKey), I.lang() === 'da' ? I.fmt('praise.means', { g: hurra.da }) : '');
    koalaMood('happy');
    setReplay(speech);
    say(speech);
    onUnlock(null);
    confetti(70);
    if (sticker || dress) later(function () { sfx('pop'); }, 700);
    if (dress) later(function () { koalaMood('spin'); }, 1300); // showing off the new look
    document.getElementById('kl-replay').addEventListener('click', o.onReplay);
  }

  /* ---- generic multiple-choice game engine ----
     cfg: {
       ctx: { main, scoreEl },  gameId,
       levels: optional [{ id, label|labelKey }] -> Kóli asks for a level first,
       makeQuestions: function (level) -> [q, ...]   (called again on replay),
       promptText: function (q) -> bubble text (HTML),
       promptSpeech: function (q) -> [audioKey, ...],
       retrySpeech: optional function (q, level, tapped) -> [audioKey, ...] said after "try again" (default: the prompt)
       wrongSpeech: optional function (q, level, tapped) -> [audioKey, ...] said instead of "try again" + retry
       build: function (q, promptEl, answersEl, level) -> [{ el, isCorrect, speechParts: [audioKey, ...], onTap? }],
       Editable answers may use isCorrect() and retryable: true, so checking a
       drawing counts an attempt but leaves the drawing available to correct.
     }
     The card with Kóli stays put; only the question slides in. A wrong answer
     is disabled and the question repeated; stars count first-try answers. */
  function runGame(cfg) {
    var main = cfg.ctx.main;
    var level = null;
    var questions = [];
    var state = null;
    var progressEl, stageEl, streakEl;

    // first-try answers in a row: from three on, a star counter; every
    // second one after that Kóli spins and confetti falls
    function showStreak() {
      var n = state.streak;
      if (n < 3) { streakEl.hidden = true; return false; }
      streakEl.hidden = false;
      streakEl.setAttribute('aria-label', I.fmt('streak.aria', { n: n }));
      streakEl.innerHTML = starSVG(true, 24) + '<span>' + n + '</span>';
      replay(streakEl, 'streak-pop');
      return n % 2 === 1;
    }

    function start(lv) {
      I.beginRound();
      level = lv;
      questions = cfg.makeQuestions(lv);
      state = { i: 0, firstTry: 0, results: [], streak: 0 };
      var dots = '';
      for (var k = 0; k < questions.length; k++) dots += '<span></span>';
      main.innerHTML =
        '<div class="question-card enter">' +
          '<div class="progress" aria-hidden="true">' + dots + '</div>' +
          '<div class="streak" hidden></div>' +
          guideHTML() +
          '<div class="q-stage"></div>' +
        '</div>';
      progressEl = main.querySelector('.progress');
      streakEl = main.querySelector('.streak');
      stageEl = main.querySelector('.q-stage');
      render();
    }

    function updateProgress() {
      var spans = progressEl.children;
      for (var k = 0; k < spans.length; k++) {
        spans[k].className = k < state.i ? (state.results[k] ? 'done' : 'retry') : (k === state.i ? 'now' : '');
      }
    }

    function endScreen() {
      I.endRound();
      var total = questions.length;
      var c = state.firstTry;
      finish(cfg.ctx, {
        slotKey: cfg.slotKey || slot(cfg.gameId, level),
        gameId: cfg.gameId,
        stars: c === total ? 3 : (c >= total - 2 ? 2 : 1),
        // a prize for at most three questions missed at the first try
        earned: total - c <= 3,
        ruleText: I.fmt('prize.rule', { n: total - 3 }),
        titleKey: 'end.title',
        lines: [I.fmt('end.score', { c: c, t: total })],
        onReplay: function () { start(level); }
      });
    }

    function render() {
      var q = questions[state.i];
      var mistakes = 0;
      var locked = false;
      updateProgress();
      stageEl.innerHTML = '<div class="prompt"></div><div class="answers four"></div>';
      replay(stageEl, 'q-enter');
      var promptEl = stageEl.querySelector('.prompt');
      var answersEl = stageEl.querySelector('.answers');
      var answers = cfg.build(q, promptEl, answersEl, level) || [];
      var prompt = cfg.promptSpeech(q, level);
      var promptStr = cfg.promptText(q, level);
      var afterSpoken = cfg.onPromptSpoken ? function () {
        if (!locked && !(window.KL_TTS && window.KL_TTS.blocked())) cfg.onPromptSpoken(q, level);
      } : null;
      koalaSay(promptStr);
      setReplay(prompt, afterSpoken);

      answers.forEach(function (a) {
        a.el.addEventListener('click', function () {
          if (locked || a.el.disabled) return;
          var correct = typeof a.isCorrect === 'function' ? a.isCorrect() : a.isCorrect;
          if (a.onTap) a.onTap(correct);
          if (correct) {
            locked = true;
            a.el.classList.add('correct');
            answers.forEach(function (x) { x.el.disabled = true; });
            promptEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
            state.results[state.i] = mistakes === 0;
            if (mistakes === 0) state.firstTry++;
            state.streak = mistakes === 0 ? state.streak + 1 : 0;
            var big = showStreak();
            if (cfg.onCorrect) cfg.onCorrect(q, a, promptEl, level);
            var p = praise();
            sfx('correct');
            burst(a.el);
            koalaSay(p.text, p.sub);
            koalaMood(big ? 'spin' : 'happy');
            if (big) { confetti(28); later(function () { sfx('streak'); }, 380); }
            var feedback = [p.key].concat(a.speechParts || []);
            setReplay(feedback);
            onUnlock(null);
            // Advance once the cheer has been said (plus a short beat), with a
            // 1s minimum so it can be seen and a 4.5s cap.
            var t0 = Date.now();
            var advanced = false;
            var advance = function () {
              if (advanced) return;
              var wait = 1000 - (Date.now() - t0);
              if (wait > 0) { later(advance, wait); return; }
              advanced = true;
              state.i++;
              if (state.i >= questions.length) endScreen(); else render();
            };
            later(function () { // let the 'correct' chime ring first
              say(feedback, function () { later(advance, 250); });
            }, 200);
            later(advance, 4500); // hard cap
          } else {
            mistakes++;
            state.streak = 0;
            showStreak();
            sfx('wrong');
            a.el.classList.add('wrong');
            a.el.disabled = true;
            var sub = cfg.wrongSub ? cfg.wrongSub(q, a, level) : promptStr;
            koalaSay(I.t('try_again'), sub);
            koalaMood('oops');
            var retry = cfg.retrySpeech ? cfg.retrySpeech(q, level, a) : prompt;
            say(cfg.wrongSpeech ? cfg.wrongSpeech(q, level, a) : ['try_again'].concat(retry), function () {
              if (!locked) {
                koalaSay(promptStr, cfg.wrongSub ? sub : '');
                if (afterSpoken) afterSpoken();
              }
            });
            later(function () {
              a.el.classList.remove('wrong');
              if (a.retryable) { if (!locked) a.el.disabled = false; }
              else a.el.classList.add('used');
            }, 450);
          }
        });
      });

      // Speak the question when it appears (after a refused autoplay: on the next tap).
      say(prompt, afterSpoken || undefined);
      onUnlock(function () { say(prompt, afterSpoken || undefined); });
    }

    if (cfg.levels) levelScreen(cfg.ctx, cfg.levels, { gameId: cfg.gameId, textKey: 'level.q' }, start);
    else start(null);
  }

  /* ---- games and router ---- */
  var GAMES = {};
  var order = [];
  function register(id, def) { GAMES[id] = def; order.push(id); }

  var current = null;
  var greeted = false;
  function routeFromHash() {
    var h = window.location.hash.replace(/^#\/?/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* malformed: show the menu */ }
    return Object.prototype.hasOwnProperty.call(GAMES, h) ? h : '';
  }

  function show(id) {
    current = id;
    I.endRound();
    clearTimers();
    if (window.KL_SOUND) window.KL_SOUND.stopAnimal();
    onUnlock(null);
    setReplay(null);
    if (window.KL_TTS) window.KL_TTS.stop();
    var menu = document.getElementById('menu');
    var game = document.getElementById('game');
    var back = document.getElementById('back');
    var title = document.getElementById('game-title');
    var score = document.getElementById('score');
    var fx = document.getElementById('fx');
    if (fx) fx.innerHTML = '';
    score.innerHTML = '';
    game.innerHTML = '';
    window.scrollTo(0, 0);
    if (!id) {
      if (updateReady) { window.location.reload(); return; } // a new version is installed
      game.hidden = true;
      menu.hidden = false;
      back.hidden = true;
      title.textContent = '';
      document.title = I.t('title.menu');
      replay(menu, 'enter');
      if (KL.renderMenu) KL.renderMenu();
      var line = greeted ? 'koala.next' : 'koala.hello';
      greeted = true;
      koalaSay(I.t(line));
      setReplay([line]);
      say([line]);
      onUnlock(function () { say([line]); });
      return;
    }
    menu.hidden = true;
    game.hidden = false;
    back.hidden = false;
    title.textContent = I.t('game.' + id);
    document.title = I.t('title.' + id);
    GAMES[id].start({ id: id, main: game, scoreEl: score });
  }

  // Navigate inside a tap, so the first prompt of the game may be spoken right away.
  function nav(id) {
    if (!id) {
      // came from the menu: step back so the browser history stays short
      if (window.history.state && window.history.state.kl) { window.history.back(); return; }
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* ignore */ }
      show('');
      return;
    }
    try { window.history.pushState({ kl: id }, '', '#' + id); } catch (e) { window.location.hash = id; return; }
    show(id);
  }

  function onHistory() {
    var id = routeFromHash();
    if (id !== current) show(id);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-nav]') : null;
    if (!a) return;
    e.preventDefault();
    sfx('click');
    nav(a.getAttribute('data-nav'));
  });

  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);
  // new language: redraw the current screen (and Kóli introduces himself again)
  I.onChange(function (lang, keepScreen) {
    greeted = false;
    if (keepScreen) {
      document.getElementById('game-title').textContent = current ? I.t('game.' + current) : '';
      document.title = I.t(current ? 'title.' + current : 'title.menu');
    } else show(current);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var menuGuide = document.getElementById('menu-guide');
    if (menuGuide) menuGuide.outerHTML = guideHTML(96);
    show(routeFromHash());
  });

  /* offline support (sw.js); service workers need https or localhost.
     A home-screen app is mostly resumed, not reloaded, so look for a new version
     whenever it comes back to the screen. Once a new version has taken over,
     reload at the menu (never in the middle of a game). */
  var updateReady = false;
  window.addEventListener('load', function () {
    if (!('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;
    var sw = navigator.serviceWorker;
    var hadController = !!sw.controller;
    sw.addEventListener('controllerchange', function () {
      if (!hadController) { hadController = true; return; } // first install, nothing old to replace
      updateReady = true;
      if (!current) window.location.reload();
    });
    sw.register('sw.js').then(function (reg) {
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') reg.update().catch(function () { /* offline */ });
      });
    }).catch(function () { /* offline support unavailable */ });
  });

  var KL = window.KL = {
    speak: speak,
    say: say,
    sfx: sfx,
    later: later,
    praise: praise,
    shuffle: shuffle,
    sample: sample,
    randInt: randInt,
    range: range,
    pickDistinct: pickDistinct,
    replay: replay,
    starSVG: starSVG,
    starsRow: starsRow,
    speakerSVG: speakerSVG,
    giftSVG: giftSVG,
    prizesWon: prizesWon,
    PRIZES_PER_GAME: PRIZES_PER_GAME,
    slot: slot,
    getBest: getBest,
    saveBest: saveBest,
    stickers: stickers,
    allAnimals: allAnimals,
    familyHere: familyHere,
    familyHTML: familyHTML,
    wardrobe: wardrobe,
    outfit: outfit,
    wear: wear,
    dressKoalas: dressKoalas,
    resetScores: resetScores,
    shapeSVG: shapeSVG,
    guideHTML: guideHTML,
    koalaSay: koalaSay,
    koalaMood: koalaMood,
    setReplay: setReplay,
    burst: burst,
    confetti: confetti,
    finish: finish,
    levelLabel: levelLabel,
    levelScreen: levelScreen,
    runGame: runGame,
    onUnlock: onUnlock,
    register: register,
    games: GAMES,
    gameOrder: order,
    nav: nav,
    renderMenu: null, // set by menu.js
    t: function (k) { return I.t(k); },
    fmt: function (k, p) { return I.fmt(k, p); }
  };
})();
