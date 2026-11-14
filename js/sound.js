/* Sound effects for Krakkaleikir: Web Audio cues and short animal MP3s.
   Load after i18n.js, before common.js. Mute state persisted in localStorage ('kl.sound');
   muting also silences speech (js/tts.js checks on()). */
(function () {
  'use strict';

  var KEY = 'kl.sound';
  var ctx = null;
  var animalAudio = null;
  var animalNodes = [];

  // iOS/iPadOS 16.4+: play like a media app, so the ring/silent switch does not
  // mute the sound effects while the spoken audio (an <audio> element) keeps playing.
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }

  function on() {
    try { return window.localStorage.getItem(KEY) !== 'off'; }
    catch (e) { return true; }
  }

  function setOn(v) {
    try { window.localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* ignore */ }
    if (!v) stopAnimal();
  }

  function ac() {
    if (!on()) return null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  // iOS requires a user gesture before audio can start; resume on any tap
  // (touchend/click are the events iOS accepts as a gesture for Web Audio).
  ['pointerdown', 'touchstart', 'touchend', 'click'].forEach(function (ev) {
    document.addEventListener(ev, function () { ac(); }, true);
  });

  function tone(freq, delay, dur, type, vol, endFreq) {
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + delay;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return o;
  }

  // Clips are shared by both languages. Small calls and playful bubbles/wing
  // flutters use pitch sweeps: [frequency, delay, duration, waveform, gain, end].
  var ANIMAL_SOUNDS = {
    koala: 'koala.mp3',
    froskur: [[150, 0, 0.22, 'sawtooth', 0.08, 85], [170, 0.28, 0.22, 'sawtooth', 0.08, 90]],
    ungi: [[1700, 0, 0.1, 'sine', 0.12, 2500], [1900, 0.18, 0.1, 'sine', 0.12, 2800], [1700, 0.36, 0.14, 'sine', 0.1, 2200]],
    kottur: 'kottur.mp3',
    svin: 'svin.mp3',
    bjorn: 'bjorn.mp3',
    fiskur: [[360, 0, 0.12, 'sine', 0.16, 1000], [500, 0.16, 0.12, 'sine', 0.14, 1400], [420, 0.34, 0.15, 'sine', 0.12, 1200]],
    mariuhaena: [[190, 0, 0.12, 'triangle', 0.1, 240], [220, 0.16, 0.12, 'triangle', 0.1, 170], [190, 0.32, 0.18, 'triangle', 0.08, 260]],
    ugla: [[430, 0, 0.18, 'sine', 0.18, 360], [400, 0.3, 0.48, 'sine', 0.18, 330]],
    mus: [[1900, 0, 0.11, 'sine', 0.1, 2700], [2300, 0.22, 0.14, 'sine', 0.08, 1600]],
    ljon: 'ljon.mp3',
    morgaes: [[320, 0, 0.2, 'sawtooth', 0.06, 470], [380, 0.25, 0.35, 'sawtooth', 0.06, 210]]
  };

  function stopAnimal() {
    if (animalAudio) {
      try { animalAudio.pause(); animalAudio.currentTime = 0; } catch (e) { /* not loaded yet */ }
    }
    animalNodes.forEach(function (node) { try { node.stop(); } catch (e) { /* already stopped */ } });
    animalNodes = [];
  }

  function animal(id) {
    stopAnimal();
    if (!on() || !Object.prototype.hasOwnProperty.call(ANIMAL_SOUNDS, id)) return;
    var sound = ANIMAL_SOUNDS[id];
    try {
      if (typeof sound === 'string') {
        if (!animalAudio) { animalAudio = new Audio(); animalAudio.volume = 0.8; }
        animalAudio.src = new URL('audio/animals/' + sound, document.baseURI).href;
        var p = animalAudio.play();
        if (p && p.catch) p.catch(function () { /* audio unavailable */ });
      } else {
        sound.forEach(function (part) {
          var node = tone.apply(null, part);
          if (!node) return;
          animalNodes.push(node);
          node.onended = function () { animalNodes = animalNodes.filter(function (n) { return n !== node; }); };
        });
      }
    } catch (e) { /* audio unavailable */ }
  }

  var SFX = {
    correct: function () { tone(523.25, 0, 0.12, 'sine', 0.25); tone(659.25, 0.09, 0.12, 'sine', 0.25); tone(783.99, 0.18, 0.22, 'sine', 0.25); },
    wrong: function () { tone(196.0, 0, 0.18, 'triangle', 0.16); tone(146.83, 0.12, 0.25, 'triangle', 0.14); },
    flip: function () { tone(880, 0, 0.05, 'square', 0.05); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, i * 0.12, 0.18, 'sine', 0.25); }); },
    click: function () { tone(660, 0, 0.04, 'sine', 0.07); },
    pop: function () { tone(440, 0, 0.08, 'sine', 0.2); tone(880, 0.06, 0.1, 'sine', 0.2); tone(1318.5, 0.12, 0.18, 'triangle', 0.15); }
  };

  function play(name) {
    try { if (SFX[name]) SFX[name](); } catch (e) { /* audio unavailable */ }
  }

  function speakerOnSVG(size) {
    size = size || 26;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="#3D405B"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#3D405B" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  function speakerOffSVG(size) {
    size = size || 26;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="#C9CBD6"/>' +
      '<path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="#C9CBD6" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  function refreshToggle() {
    var btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.innerHTML = on() ? speakerOnSVG(26) : speakerOffSVG(26);
    btn.classList.toggle('off', !on());
    btn.setAttribute('aria-label', on() ? 'Hljóð á / Lyd til' : 'Hljóð af / Lyd fra');
    btn.title = btn.getAttribute('aria-label');
  }

  document.addEventListener('DOMContentLoaded', function () {
    refreshToggle();
    var btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        setOn(!on());
        refreshToggle();
        if (on()) play('click');
        else if (window.KL_TTS) window.KL_TTS.stop(); // cut off speech that is already playing
      });
    }
  });

  window.KL_SOUND = {
    play: play, on: on, setOn: setOn, animal: animal, stopAnimal: stopAnimal,
    animals: Object.keys(ANIMAL_SOUNDS),
    animalFiles: Object.keys(ANIMAL_SOUNDS).filter(function (id) { return typeof ANIMAL_SOUNDS[id] === 'string'; }).map(function (id) { return ANIMAL_SOUNDS[id]; })
  };
})();
