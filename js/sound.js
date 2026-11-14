/* Sound effects for Krakkaleikir, synthesized with the Web Audio API (no audio files).
   Load after i18n.js, before common.js. Mute state persisted in localStorage ('kl.sound');
   muting also silences speech (js/tts.js checks on()). */
(function () {
  'use strict';

  var KEY = 'kl.sound';
  var ctx = null;

  // iOS/iPadOS 16.4+: play like a media app, so the ring/silent switch does not
  // mute the sound effects while the spoken audio (an <audio> element) keeps playing.
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }

  function on() {
    try { return window.localStorage.getItem(KEY) !== 'off'; }
    catch (e) { return true; }
  }

  function setOn(v) {
    try { window.localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* ignore */ }
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

  function tone(freq, delay, dur, type, vol) {
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + delay;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
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

  window.KL_SOUND = { play: play, on: on, setOn: setOn };
})();
