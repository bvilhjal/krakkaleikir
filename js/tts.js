/* Spoken audio for Krakkaleikir: plays pre-generated mp3s from
   audio/<lang>/<key>.mp3 (tools/make_audio.py; the clip list is audioVocab() in
   js/i18n.js). A key may name its language ('is:praise.0' is Kóli's Icelandic
   cheer, also in the Danish version). Falls back to Web Speech (KL.speak) if a
   file is missing or Audio is unavailable. Load after i18n.js/sound.js.

   All speech goes through one shared <audio> element: iOS lets an element that
   has played once inside a tap play again later without one, so after the first
   tap anywhere in the app every later prompt can start on its own.

   Only one sequence plays at a time: each say() invalidates any sequence still
   in flight (generation token), and each file is finished exactly once.
   say(parts, onDone) calls onDone once the whole sequence finished (or right
   away when muted/empty/refused). When the browser refuses to start audio before
   a tap, blocked() turns true and common.js says the prompt again on the next tap.
   onState(fn) reports 'talk' / 'quiet' / 'blocked' (Kóli moves his mouth). */
(function () {
  'use strict';

  // site base path, works at /krakkaleikir/, /krakkaleikir/index.html and /krakkaleikir/games/x.html
  function base() {
    var p = window.location.pathname;
    var gi = p.indexOf('/games/');
    if (gi >= 0) return p.slice(0, gi + 1);
    return p.replace(/[^/]*$/, '');
  }

  var el = null;
  var token = 0;
  var busy = false;
  var refused = false;
  var primed = false;
  var stateFn = null;
  function state(s) { if (stateFn) { try { stateFn(s); } catch (e) { /* ignore */ } } }

  function audio() {
    if (!el && typeof Audio !== 'undefined') {
      el = new Audio();
      el.preload = 'auto';
      el.addEventListener('playing', function () { if (busy) state('talk'); });
    }
    return el;
  }

  // 'is:praise.0' -> { lang: 'is', key: 'praise.0' }; plain keys use the current language
  function split(k) {
    var m = /^([a-z]{2}):(.+)$/.exec(k);
    return m ? { lang: m[1], key: m[2] } : { lang: window.KL_I18N.lang(), key: k };
  }

  function urlFor(p) { return base() + 'audio/' + p.lang + '/' + encodeURIComponent(p.key) + '.mp3'; }

  function textFor(p) {
    var v = window.KL_I18N.audioVocab(p.lang);
    return v[p.key] || p.key.replace(/^[a-z]+\./, '');
  }

  // 0.05 s of silence (8 kHz, 8-bit mono WAV) used to unlock the element in a tap
  var silentUrl = null;
  function silence() {
    if (silentUrl) return silentUrl;
    var n = 400, b = new Uint8Array(44 + n), dv = new DataView(b.buffer), i;
    function str(o, s) { for (var k = 0; k < s.length; k++) b[o + k] = s.charCodeAt(k); }
    str(0, 'RIFF'); dv.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
    str(36, 'data'); dv.setUint32(40, n, true);
    for (i = 0; i < n; i++) b[44 + i] = 128;
    var s = '';
    for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    silentUrl = 'data:audio/wav;base64,' + window.btoa(s);
    return silentUrl;
  }

  function stop() {
    token++;
    if (busy || refused) state('quiet');
    busy = false;
    refused = false;
    if (el) {
      try { el.onended = null; el.onerror = null; el.pause(); } catch (e) { /* ignore */ }
    }
  }

  /* Call inside a tap: plays silence once so later say() calls may start without a tap. */
  function prime() {
    if (primed || busy) return;
    var a = audio();
    if (!a) return;
    try {
      a.onended = null; a.onerror = null;
      a.src = silence();
      var p = a.play();
      if (p && p.then) p.then(function () { primed = true; }, function () { /* not a gesture: retry on the next tap */ });
    } catch (e) { /* ignore */ }
  }

  /* parts: array of audio keys, played in order. onDone: optional callback. */
  function say(parts, onDone) {
    if (window.KL_SOUND && !window.KL_SOUND.on()) { if (onDone) setTimeout(onDone, 0); return; }
    if (!parts || !parts.length) { if (onDone) setTimeout(onDone, 0); return; }
    stop();
    var gen = token;
    var i = 0;
    busy = true;
    refused = false;
    function fallback(p) {
      try { window.KL.speak(textFor(p), p.lang); } catch (e) { /* ignore */ }
    }
    function next() {
      if (gen !== token) return; // a newer say()/stop() superseded this sequence
      if (i >= parts.length) { busy = false; state('quiet'); if (onDone) onDone(); return; }
      var p = split(parts[i++]);
      var a = audio();
      if (!a) { fallback(p); next(); return; }
      var done = false;
      function finish(err) {
        if (done || gen !== token) return;
        done = true;
        if (err && err.name === 'NotAllowedError') {
          // autoplay refused (no tap yet): Web Speech would be refused too, so
          // stop here and let the next tap say it again
          refused = true;
          busy = false;
          state('blocked');
          if (onDone) onDone();
          return;
        }
        if (err) fallback(p);
        next();
      }
      a.onended = function () { finish(null); };
      a.onerror = function () { finish({ name: 'MediaError' }); };
      a.src = urlFor(p);
      var pr;
      try { pr = a.play(); } catch (e) { finish(e); return; }
      if (pr && pr.then) pr.then(function () { primed = true; }, function (e) { finish(e || { name: 'Error' }); });
    }
    next();
  }

  window.KL_TTS = {
    say: say,
    stop: stop,
    prime: prime,
    blocked: function () { return refused; },
    onState: function (fn) { stateFn = fn; }
  };
})();
