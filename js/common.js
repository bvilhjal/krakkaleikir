/* Shared helpers, the multiple-choice game engine and the page router for
   Krakkaleikir. Vanilla JS, no dependencies. Load after i18n.js, sound.js,
   tts.js and audio-manifest.js; each game script then calls KL.register().

   The whole app is one page (index.html): '#tolur' etc. show a game, an empty
   hash shows the menu. Staying on one page keeps audio unlocked after the first
   tap (iOS asks for a new tap on every page load), so prompts are spoken as soon
   as a game opens. */
(function () {
  'use strict';

  var I = window.KL_I18N;

  function say(parts, onDone) {
    if (window.KL_TTS) window.KL_TTS.say(parts, onDone);
    else if (onDone) setTimeout(onDone, 0);
  }
  function sfx(name) { if (window.KL_SOUND) window.KL_SOUND.play(name); }

  /* ---- Web Speech fallback (used by tts.js when an mp3 is missing) ---- */
  function speak(text) {
    try {
      if (window.KL_SOUND && !window.KL_SOUND.on()) return;
      if (!('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance(String(text));
      var l = I.speechLang();
      u.lang = l;
      u.rate = 0.85;
      u.pitch = 1.1;
      u.volume = 1;
      // pick an explicit voice when the list is available (iOS loads it lazily)
      var prefix = l.slice(0, 2).toLowerCase();
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang && vs[i].lang.toLowerCase().indexOf(prefix) === 0) { u.voice = vs[i]; break; }
      }
      // NOTE: never call speechSynthesis.cancel() here — on iOS it can wedge
      // the speech queue permanently and all later speak() calls go silent.
      try { window.speechSynthesis.speak(u); } catch (e) { /* ignore */ }
    } catch (e) { /* speech unsupported: ignore */ }
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
  function onGesture() {
    var T = window.KL_TTS;
    if (!T) return;
    if (T.blocked() && unlockCb) { try { unlockCb(); } catch (e) { /* ignore */ } }
    else T.prime();
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
  function praise() { return 'praise.' + randInt(0, 5); }

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

  function speakerSVG(size) {
    size = size || 30;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="#5C6BC0"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#5C6BC0" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  /* ---- persistence: best results per game and level ----
     'kl.stars.<game>[.<level>]' = best stars (1-3, higher is better);
     'kl.flips.minni.<pairs>' = fewest flips (lower is better). */
  function slot(gameId, level) { return gameId + (level ? '.' + level : ''); }
  function getBest(key) {
    try { return parseInt(window.localStorage.getItem('kl.' + key) || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function saveBest(key, value, lowerIsBetter) {
    try {
      var b = getBest(key);
      if (!b || (lowerIsBetter ? value < b : value > b)) window.localStorage.setItem('kl.' + key, String(value));
    } catch (e) { /* storage unavailable */ }
  }
  function resetScores() {
    try {
      Object.keys(window.localStorage).forEach(function (k) {
        // 'kl.best.' holds scores from versions before stars
        if (/^kl\.(stars|flips|best)\./.test(k)) window.localStorage.removeItem(k);
      });
    } catch (e) { /* ignore */ }
  }

  /* ---- SVG shapes and balls (shape keys are always Icelandic, internal only) ---- */
  function starPoints(cx, cy, outer, inner, points) {
    var pts = [];
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = (Math.PI / points) * i - Math.PI / 2;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  function shapeSVG(shape, color, size) {
    size = size || 120;
    var common = 'stroke="rgba(0,0,0,0.18)" stroke-width="4"';
    var inner = '';
    switch (shape) {
      case 'ferningur':
        inner = '<rect x="12" y="12" width="76" height="76" rx="14" fill="' + color + '" ' + common + '/>';
        break;
      case 'þríhyrningur':
        inner = '<polygon points="50,10 90,86 10,86" fill="' + color + '" ' + common + ' stroke-linejoin="round"/>';
        break;
      case 'rétthyrningur':
        inner = '<rect x="8" y="24" width="84" height="52" rx="12" fill="' + color + '" ' + common + '/>';
        break;
      case 'stjarna':
        inner = '<polygon points="' + starPoints(50, 52, 42, 17, 5) + '" fill="' + color + '" ' + common + ' stroke-linejoin="round"/>';
        break;
      case 'hjarta':
        inner = '<path d="M50 86 C22 64 10 46 10 32 C10 18 21 10 32 10 C40 10 47 14 50 22 C53 14 60 10 68 10 C79 10 90 18 90 32 C90 46 78 64 50 86 Z" fill="' + color + '" ' + common + ' stroke-linejoin="round"/>';
        break;
      case 'hringur':
      default:
        inner = '<circle cx="50" cy="50" r="40" fill="' + color + '" ' + common + '/>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  }

  function ballSVG(color, size) {
    size = size || 64;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="44" fill="' + color + '" stroke="rgba(0,0,0,0.15)" stroke-width="4"/>' +
      '<ellipse cx="36" cy="30" rx="12" ry="7" fill="rgba(255,255,255,0.55)"/>' +
      '<circle cx="38" cy="52" r="5" fill="#3D405B"/>' +
      '<circle cx="62" cy="52" r="5" fill="#3D405B"/>' +
      '<path d="M40 66 Q50 74 60 66" fill="none" stroke="#3D405B" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---- level choice: one big button per level, with the best stars under it ----
     levels: [{ id, label } or { id, labelKey }]; opts: { gameId, textKey, speech } */
  function levelLabel(lv) { return lv.labelKey ? I.t(lv.labelKey) : lv.label; }
  function levelScreen(ctx, levels, opts, onPick) {
    ctx.main.innerHTML =
      '<div class="question-card">' +
        '<div class="prompt"><p class="q-text">' + I.t(opts.textKey) + '</p></div>' +
        '<div class="diff-row"></div>' +
      '</div>';
    var row = ctx.main.querySelector('.diff-row');
    levels.forEach(function (lv) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-primary level-btn';
      var best = getBest('stars.' + slot(opts.gameId, lv.id));
      b.innerHTML = '<span>' + levelLabel(lv) + '</span>' + (best ? '<span class="lv-stars">' + starsRow(best, 3, 18) + '</span>' : '');
      b.addEventListener('click', function () { onPick(lv.id); });
      row.appendChild(b);
    });
    if (opts.speech) {
      say(opts.speech);
      onUnlock(function () { say(opts.speech); });
    } else {
      onUnlock(null);
    }
  }

  /* ---- generic multiple-choice game engine ----
     cfg: {
       ctx: { main, scoreEl },  gameId,
       levels: optional [{ id, label|labelKey }] -> a level screen comes first,
       makeQuestions: function (level) -> [q, ...]   (called again on replay),
       build: function (q, promptEl, answersEl, level) -> [{ el, isCorrect, speechParts: [audioKey, ...], onTap? }],
       promptSpeech: function (q) -> [audioKey, ...],
       retrySpeech: optional function (q) -> [audioKey, ...] said after "try again" (default: the prompt)
     }
     A wrong answer is disabled and the question is repeated; the score is how
     many questions were answered right on the first try. */
  function runGame(cfg) {
    var main = cfg.ctx.main;
    var level = null;
    var questions = [];
    var state = null;

    function start(lv) {
      level = lv;
      questions = cfg.makeQuestions(lv);
      state = { i: 0, firstTry: 0, results: [] };
      render();
    }

    function progressHTML() {
      var s = '<div class="progress" aria-hidden="true">';
      for (var k = 0; k < questions.length; k++) {
        var cls = k < state.i ? (state.results[k] ? 'done' : 'retry') : (k === state.i ? 'now' : '');
        s += '<span class="' + cls + '"></span>';
      }
      return s + '</div>';
    }

    function endScreen() {
      sfx('win');
      say(['end.title']);
      onUnlock(null);
      var total = questions.length;
      var c = state.firstTry;
      var stars = c === total ? 3 : (c >= total - 2 ? 2 : 1);
      var key = 'stars.' + slot(cfg.gameId, level);
      saveBest(key, stars);
      main.innerHTML =
        '<div class="question-card end-card">' +
          '<h2>' + I.t('end.title') + '</h2>' +
          '<div class="big-stars">' + starsRow(stars, 3, 56) + '</div>' +
          '<p>' + I.fmt('end.score', { c: c, t: total }) + '</p>' +
          '<p class="best">' + I.t('end.best') + ' <span class="inline-stars">' + starsRow(getBest(key), 3, 24) + '</span></p>' +
          '<button type="button" class="btn-primary" id="kl-replay">' + I.t('end.replay') + '</button><br>' +
          '<a class="btn-secondary" href="#" data-nav="">' + I.t('end.menu') + '</a>' +
        '</div>';
      document.getElementById('kl-replay').addEventListener('click', function () { start(level); });
    }

    function render() {
      var q = questions[state.i];
      var mistakes = 0;
      var locked = false;
      main.innerHTML =
        '<div class="question-card">' +
          progressHTML() +
          '<button type="button" class="speaker-btn hint" id="kl-speak" aria-label="' + I.t('speak.aria') + '">' + speakerSVG(30) + '</button>' +
          '<div class="prompt" id="kl-prompt"></div>' +
          '<div class="answers four" id="kl-answers"></div>' +
          '<div class="message" id="kl-msg"></div>' +
        '</div>';
      var promptEl = document.getElementById('kl-prompt');
      var answersEl = document.getElementById('kl-answers');
      var msg = document.getElementById('kl-msg');
      var answers = cfg.build(q, promptEl, answersEl, level) || [];
      var prompt = cfg.promptSpeech(q);

      var spk = document.getElementById('kl-speak');
      spk.addEventListener('click', function () {
        spk.classList.remove('hint');
        say(prompt);
      });

      answers.forEach(function (a) {
        a.el.addEventListener('click', function () {
          if (locked || a.el.disabled) return;
          if (a.onTap) a.onTap(a.isCorrect);
          if (a.isCorrect) {
            locked = true;
            a.el.classList.add('correct');
            answers.forEach(function (x) { x.el.disabled = true; });
            state.results[state.i] = mistakes === 0;
            if (mistakes === 0) state.firstTry++;
            var p = praise();
            sfx('correct');
            msg.textContent = I.t(p);
            msg.className = 'message good';
            // Advance only after the praise has actually been read aloud
            // (plus a short beat), with a 1.1s minimum so the praise stays
            // visible and a 4.5s hard cap — otherwise the next question's
            // say() would cut the praise off mid-word.
            var t0 = Date.now();
            var advanced = false;
            var advance = function () {
              if (advanced) return;
              var wait = 1100 - (Date.now() - t0);
              if (wait > 0) { later(advance, wait); return; }
              advanced = true;
              state.i++;
              if (state.i >= questions.length) endScreen(); else render();
            };
            later(function () { // let the 'correct' sound effect finish first
              say([p].concat(a.speechParts || []), function () { later(advance, 300); });
            }, 250);
            later(advance, 4500); // hard cap
          } else {
            mistakes++;
            sfx('wrong');
            a.el.classList.add('wrong');
            a.el.disabled = true;
            msg.textContent = I.t('try_again');
            msg.className = 'message bad';
            say(['try_again'].concat(cfg.retrySpeech ? cfg.retrySpeech(q) : prompt));
            later(function () { a.el.classList.remove('wrong'); a.el.classList.add('used'); }, 450);
          }
        });
      });

      // Speak the question when the round appears (after a refused autoplay: on the next tap).
      say(prompt);
      onUnlock(function () { say(prompt); });
    }

    if (cfg.levels) levelScreen(cfg.ctx, cfg.levels, { gameId: cfg.gameId, textKey: 'level.q' }, start);
    else start(null);
  }

  /* ---- games and router ---- */
  var GAMES = {};
  var order = [];
  function register(id, def) { GAMES[id] = def; order.push(id); }

  var current = null;
  function routeFromHash() {
    var h = window.location.hash.replace(/^#\/?/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* malformed: show the menu */ }
    return GAMES[h] ? h : '';
  }

  function show(id) {
    current = id;
    clearTimers();
    onUnlock(null);
    if (window.KL_TTS) window.KL_TTS.stop();
    var menu = document.getElementById('menu');
    var game = document.getElementById('game');
    var back = document.getElementById('back');
    var title = document.getElementById('game-title');
    var score = document.getElementById('score');
    score.innerHTML = '';
    game.innerHTML = '';
    window.scrollTo(0, 0);
    if (!id) {
      game.hidden = true;
      menu.hidden = false;
      back.hidden = true;
      title.textContent = '';
      document.title = I.t('title.menu');
      if (KL.renderMenu) KL.renderMenu();
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
    var id = a.getAttribute('data-nav');
    if (id) sfx('click');
    nav(id);
  });

  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);
  I.onChange(function () { show(current); }); // new language: redraw the current screen

  document.addEventListener('DOMContentLoaded', function () { show(routeFromHash()); });

  // offline support (sw.js); service workers need https or localhost
  window.addEventListener('load', function () {
    if (!('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;
    navigator.serviceWorker.register('sw.js').catch(function () { /* offline support unavailable */ });
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
    starSVG: starSVG,
    starsRow: starsRow,
    speakerSVG: speakerSVG,
    slot: slot,
    getBest: getBest,
    saveBest: saveBest,
    resetScores: resetScores,
    shapeSVG: shapeSVG,
    ballSVG: ballSVG,
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
