/* Shared helpers for Krakkaleikir games. Vanilla JS, no dependencies. Load i18n.js first. */
(function () {
  'use strict';

  function speak(text) {
    try {
      if (window.KL_SOUND && !window.KL_SOUND.on()) return;
      if (!('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance(String(text));
      var l = window.KL_I18N.speechLang();
      u.lang = l;
      u.rate = 0.85;
      u.pitch = 1.1;
      // pick an explicit voice when the list is available (iOS loads it lazily)
      var prefix = l.slice(0, 2).toLowerCase();
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang && vs[i].lang.toLowerCase().indexOf(prefix) === 0) { u.voice = vs[i]; break; }
      }
      var synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) synth.cancel();
      // iOS drops speak() when called in the same tick as cancel(); defer slightly
      setTimeout(function () {
        try { synth.speak(u); } catch (e) { /* ignore */ }
      }, 30);
    } catch (e) { /* speech unsupported: ignore */ }
  }

  // iOS only allows speechSynthesis inside/after a user gesture: unlock on first tap.
  function unlockSpeech() {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.getVoices(); // also triggers voice loading on iOS
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    } catch (e) { /* ignore */ }
  }
  document.addEventListener('pointerdown', unlockSpeech, { once: true });
  document.addEventListener('touchstart', unlockSpeech, { once: true });

  function praise() {
    var list = window.KL_I18N.t('praise');
    return list[randInt(0, list.length - 1)];
  }

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

  /* ---- persistence (best scores per game) ---- */
  function getBest(game) {
    try { return parseInt(window.localStorage.getItem('kl.best.' + game) || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function saveBest(game, value) {
    try {
      if (value > getBest(game)) window.localStorage.setItem('kl.best.' + game, String(value));
    } catch (e) { /* storage unavailable */ }
  }
  function resetScores() {
    try {
      Object.keys(window.localStorage).forEach(function (k) {
        if (k.indexOf('kl.best.') === 0) window.localStorage.removeItem(k);
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

  /* ---- generic multiple-choice game engine ----
     cfg: {
       gameId, main, scoreEl, questions: [...],
       build: function (q, promptEl, answersEl) -> [{ el, isCorrect, speechOnCorrect }],
       promptSpeech: function (q) -> string
     } */
  function runGame(cfg) {
    var I = window.KL_I18N;
    var state = { i: 0, correct: 0, mistakes: 0, locked: false };

    function updateScore() {
      cfg.scoreEl.innerHTML = starSVG(true, 30) + '<span>' + state.correct + ' / ' + cfg.questions.length + '</span>';
    }

    function endScreen() {
      if (window.KL_SOUND) window.KL_SOUND.play('win');
      speak(I.t('end.title'));
      var total = cfg.questions.length;
      var stars = state.mistakes === 0 ? 3 : (state.mistakes <= 2 ? 2 : 1);
      saveBest(cfg.gameId, state.correct);
      var best = getBest(cfg.gameId);
      cfg.main.innerHTML =
        '<div class="question-card end-card">' +
          '<h2>' + I.t('end.title') + '</h2>' +
          '<div class="big-stars">' + starsRow(stars, 3, 56) + '</div>' +
          '<p>' + I.fmt('end.score', { c: state.correct, t: total }) + '</p>' +
          '<p class="best">' + I.fmt('end.best', { b: best, t: total }) + '</p>' +
          '<button class="btn-primary" id="kl-replay">' + I.t('end.replay') + '</button><br>' +
          '<a class="btn-secondary" href="../index.html">' + I.t('end.menu') + '</a>' +
        '</div>';
      cfg.scoreEl.innerHTML = starSVG(true, 30) + '<span>' + state.correct + '</span>';
      document.getElementById('kl-replay').addEventListener('click', function () {
        state.i = 0; state.correct = 0; state.mistakes = 0; state.locked = false;
        updateScore();
        render();
      });
    }

    function render() {
      var q = cfg.questions[state.i];
      cfg.main.innerHTML =
        '<div class="question-card">' +
          '<button class="speaker-btn" id="kl-speak" aria-label="' + I.t('speak.aria') + '">' + speakerSVG(30) + '</button>' +
          '<div class="prompt" id="kl-prompt"></div>' +
          '<div class="answers four" id="kl-answers"></div>' +
          '<div class="message" id="kl-msg"></div>' +
        '</div>';
      var promptEl = document.getElementById('kl-prompt');
      var answersEl = document.getElementById('kl-answers');
      var answers = cfg.build(q, promptEl, answersEl) || [];

      var spk = document.getElementById('kl-speak');
      spk.classList.add('hint');
      spk.addEventListener('click', function () {
        spk.classList.remove('hint');
        speak(cfg.promptSpeech(q));
      });

      answers.forEach(function (a) {
        a.el.addEventListener('click', function () {
          if (state.locked) return;
          var msg = document.getElementById('kl-msg');
          if (a.isCorrect) {
            state.locked = true;
            a.el.classList.add('correct');
            answers.forEach(function (x) { x.el.disabled = true; });
            state.correct++;
            updateScore();
            var p = praise();
            if (window.KL_SOUND) window.KL_SOUND.play('correct');
            msg.textContent = p;
            msg.className = 'message good';
            speak(p + (a.speechOnCorrect ? ' ' + a.speechOnCorrect : ''));
            setTimeout(function () {
              state.i++;
              state.locked = false;
              if (state.i >= cfg.questions.length) endScreen(); else render();
            }, 1100);
          } else {
            state.mistakes++;
            if (window.KL_SOUND) window.KL_SOUND.play('wrong');
            a.el.classList.add('wrong');
            msg.textContent = I.t('try_again');
            msg.className = 'message bad';
            speak(I.t('try_again'));
            setTimeout(function () { a.el.classList.remove('wrong'); }, 450);
          }
        });
      });

      // Speak the question when the round appears (works after the first user tap on iOS).
      speak(cfg.promptSpeech(q));
    }

    updateScore();
    render();
  }

  window.KL = {
    speak: speak,
    praise: praise,
    shuffle: shuffle,
    sample: sample,
    randInt: randInt,
    pickDistinct: pickDistinct,
    starSVG: starSVG,
    starsRow: starsRow,
    speakerSVG: speakerSVG,
    getBest: getBest,
    saveBest: saveBest,
    resetScores: resetScores,
    shapeSVG: shapeSVG,
    ballSVG: ballSVG,
    runGame: runGame,
    t: function (k) { return window.KL_I18N.t(k); },
    fmt: function (k, p) { return window.KL_I18N.fmt(k, p); }
  };
})();
