/* Sound effects for Krakkaleikir: Web Audio cues and short animal MP3s.
   Load after i18n.js, before common.js. Mute state persisted in localStorage ('kl.sound');
   muting also silences speech (js/tts.js checks on()). */
(function () {
  'use strict';

  var KEY = 'kl.sound';
  var ctx = null;
  // every tone runs through one gain, so muting also silences cues that were
  // already scheduled (a win jingle keeps ringing for half a second otherwise)
  var master = null;
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
    if (master) master.gain.value = v ? 1 : 0;
    if (!v) stopAnimal();
  }

  function ac() {
    if (!on()) return null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (!master) { master = ctx.createGain(); master.connect(ctx.destination); }
      // iOS leaves the context 'interrupted' after a call or an app switch
      if (ctx.state !== 'running' && ctx.state !== 'closed') {
        var r = ctx.resume();
        if (r && r.catch) r.catch(function () { /* needs a tap */ });
      }
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
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return o;
  }

  /* ---- animal voice synth kit ----
     A voice is a function (ctx, out) -> [source nodes]. The same functions play
     in the app and render offline in tools/audition.js, which measures them and
     writes WAV previews — what you audition is exactly what the app plays. */
  function noiseBuffer(c) {
    if (!c.__klNoise) {
      var b = c.createBuffer(1, c.sampleRate, c.sampleRate);
      var d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      c.__klNoise = b;
    }
    return c.__klNoise;
  }

  // enveloped tone with optional glide (f0->f1->f2), filter, vibrato [rate, Hz]
  // and tremolo [rate, depth] — the trill that makes a frog a frog
  function voice(c, out, o) {
    var t0 = o.at, dur = o.dur, a = o.attack || 0.012, rel = o.release || 0.06;
    var src = c.createOscillator();
    src.type = o.type || 'sine';
    src.frequency.setValueAtTime(o.f0, t0);
    if (o.f1) src.frequency.exponentialRampToValueAtTime(o.f1, t0 + (o.glide || dur));
    if (o.f2) src.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    var g = c.createGain();
    var base = Math.max(o.trem ? o.vol * (1 - o.trem[1]) : o.vol, 0.0001);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(base, t0 + a);
    g.gain.setValueAtTime(base, t0 + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (o.trem) {
      var tl = c.createOscillator(), tg = c.createGain();
      tl.frequency.value = o.trem[0]; tg.gain.value = o.vol * o.trem[1];
      tl.connect(tg); tg.connect(g.gain);
      tl.start(t0); tl.stop(t0 + dur + 0.1);
    }
    if (o.vib) {
      var vl = c.createOscillator(), vg = c.createGain();
      vl.frequency.value = o.vib[0]; vg.gain.value = o.vib[1];
      vl.connect(vg); vg.connect(src.frequency);
      vl.start(t0); vl.stop(t0 + dur + 0.1);
    }
    if (o.filter) {
      var f = c.createBiquadFilter();
      f.type = o.filter[0]; f.frequency.value = o.filter[1]; f.Q.value = o.filter[2] || 1;
      src.connect(f); f.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(out);
    src.start(t0); src.stop(t0 + dur + 0.1);
    return src;
  }

  // enveloped filtered noise: breath, wing flutter, bray texture
  function breath(c, out, o) {
    var t0 = o.at, dur = o.dur, a = o.attack || 0.01, rel = o.release || 0.05;
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(c); src.loop = true;
    var f = c.createBiquadFilter();
    f.type = o.filter[0]; f.frequency.value = o.filter[1]; f.Q.value = o.filter[2] || 1;
    var g = c.createGain();
    var base = Math.max(o.trem ? o.vol * (1 - o.trem[1]) : o.vol, 0.0001);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(base, t0 + a);
    g.gain.setValueAtTime(base, t0 + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (o.trem) {
      var tl = c.createOscillator(), tg = c.createGain();
      tl.frequency.value = o.trem[0]; tg.gain.value = o.vol * o.trem[1];
      tl.connect(tg); tg.connect(g.gain);
      tl.start(t0); tl.stop(t0 + dur + 0.1);
    }
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t0); src.stop(t0 + dur + 0.1);
    return src;
  }

  // Clips are shared by both languages. Five local clips: four AI-generated
  // CC0 SFXMint effects and one real royalty-free Mixkit cat recording
  // (audio/animals/, credits.json); the other seven are synthesized voices.
  var ANIMAL_SOUNDS = {
    koala: 'koala.mp3',
    // "ribbit": a short low grunt, then a trilled resonant croak, twice
    froskur: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      [[0, 105], [0.42, 122]].forEach(function (p) {
        var at = t + p[0], f = p[1];
        nodes.push(voice(c, out, { at: at, dur: 0.09, type: 'sawtooth', f0: f, f1: f * 0.85, vol: 0.16, filter: ['lowpass', 500, 1.5], attack: 0.008, release: 0.03 }));
        nodes.push(voice(c, out, { at: at + 0.1, dur: 0.3, type: 'sawtooth', f0: f * 1.1, f1: f * 0.8, vol: 0.18, filter: ['bandpass', 320, 2.2], trem: [27, 0.4], attack: 0.015, release: 0.08 }));
      });
      return nodes;
    },
    // "cheep-cheep": round rising-falling chirps
    ungi: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      [[0, 1900, 2700, 2100], [0.17, 2100, 2900, 2300], [0.36, 1800, 2500, 2000]].forEach(function (p) {
        nodes.push(voice(c, out, { at: t + p[0], dur: 0.11, type: 'triangle', f0: p[1], f1: p[2], f2: p[3], glide: 0.05, vol: 0.11, attack: 0.008, release: 0.045 }));
      });
      return nodes;
    },
    // real cat meow (Mixkit, royalty-free). Replaced an AI-generated clip that
    // had the pitch arc but none of the formant character of a real cat.
    kottur: 'kottur.mp3',
    svin: 'svin.mp3',
    bjorn: 'bjorn.mp3',
    // playful bubbles: discrete rising "bloop"s, big and small
    fiskur: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      [[0, 280, 750, 0.1], [0.2, 400, 1000, 0.09], [0.36, 330, 850, 0.1], [0.54, 520, 1300, 0.08], [0.7, 420, 1050, 0.09]].forEach(function (p) {
        nodes.push(voice(c, out, { at: t + p[0], dur: p[3] + 0.06, type: 'sine', f0: p[1], f1: p[2], glide: p[3], vol: 0.16, attack: 0.005, release: 0.05 }));
      });
      return nodes;
    },
    // a light wing flutter: one continuous 40 Hz-modulated buzz over a faint hum
    mariuhaena: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      nodes.push(breath(c, out, { at: t, dur: 0.42, vol: 0.35, filter: ['bandpass', 240, 1.1], trem: [40, 0.4], attack: 0.02, release: 0.08 }));
      nodes.push(voice(c, out, { at: t, dur: 0.42, type: 'triangle', f0: 190, f1: 215, vol: 0.02, attack: 0.02, release: 0.08 }));
      return nodes;
    },
    // "hoo-hoo": soft sine hoots gliding down, with a little breath and chest
    ugla: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      [[0, 340, 300, 0.3], [0.45, 315, 275, 0.42]].forEach(function (p) {
        nodes.push(voice(c, out, { at: t + p[0], dur: p[3], type: 'sine', f0: p[1], f1: p[2], vol: 0.22, vib: [5.5, 4], attack: 0.035, release: 0.1 }));
        nodes.push(voice(c, out, { at: t + p[0], dur: p[3], type: 'sine', f0: p[1] / 2, f1: p[2] / 2, vol: 0.07, attack: 0.04, release: 0.1 }));
        nodes.push(breath(c, out, { at: t + p[0], dur: p[3], vol: 0.02, filter: ['bandpass', 600, 1.2], attack: 0.04, release: 0.1 }));
      });
      return nodes;
    },
    // "squeak-squeak": fast up-down sweeps, three of them
    mus: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      [[0, 2300, 3400, 2700], [0.16, 2600, 3700, 2900], [0.34, 2100, 3100, 2500]].forEach(function (p) {
        nodes.push(voice(c, out, { at: t + p[0], dur: 0.1, type: 'sine', f0: p[1], f1: p[2], f2: p[3], glide: 0.05, vol: 0.09, attack: 0.008, release: 0.04 }));
        nodes.push(voice(c, out, { at: t + p[0], dur: 0.1, type: 'sine', f0: p[1] * 2, f1: p[2] * 2, f2: p[3] * 2, glide: 0.05, vol: 0.02, attack: 0.008, release: 0.04 }));
      });
      return nodes;
    },
    ljon: 'ljon.mp3',
    // a penguin bray: harsh harmonic call through a formant, down then up
    morgaes: function (c, out) {
      var t = c.currentTime + 0.01, nodes = [];
      nodes.push(voice(c, out, { at: t, dur: 0.34, type: 'sawtooth', f0: 430, f1: 290, vol: 0.18, filter: ['bandpass', 900, 1.4], trem: [15, 0.2], attack: 0.02, release: 0.08 }));
      nodes.push(voice(c, out, { at: t + 0.42, dur: 0.3, type: 'sawtooth', f0: 310, f1: 420, vol: 0.18, filter: ['bandpass', 950, 1.4], trem: [15, 0.2], attack: 0.02, release: 0.1 }));
      nodes.push(breath(c, out, { at: t, dur: 0.72, vol: 0.004, filter: ['bandpass', 1400, 1], attack: 0.03, release: 0.1 }));
      return nodes;
    }
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
        var c = ac();
        if (!c) return;
        var nodes = sound(c, master) || [];
        nodes.forEach(function (node) {
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
    // render a synthesized voice into any (offline) context — tools/audition.js
    synth: function (id, c, out) {
      var s = ANIMAL_SOUNDS[id];
      return typeof s === 'function' ? s(c, out) : null;
    },
    animals: Object.keys(ANIMAL_SOUNDS),
    animalFiles: Object.keys(ANIMAL_SOUNDS).filter(function (id) { return typeof ANIMAL_SOUNDS[id] === 'string'; }).map(function (id) { return ANIMAL_SOUNDS[id]; })
  };
})();
