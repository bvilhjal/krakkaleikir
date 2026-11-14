/* Klukkan / Uret: read an analog clock and set it.
   Level 1 (whole hours): read the clock; set the hour hand by tapping a number.
   Level 2 (half hours too): read the clock; pick the clock that shows a time.
   Spoken times use the hour.N / half.N keys (3:30 is "hálf fjögur" / "halv fire" = half.4). */
(function () {
  'use strict';

  var HOURS = KL.range(1, 12);
  var CX = 120, CY = 120, FACE_R = 112, NUM_R = 88, BTN_SIZE = 46;

  // position on the dial for hour h (1..12), 12 at the top
  function polar(r, h) {
    var a = (h % 12) * 30 * Math.PI / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  }
  function f1(n) { return n.toFixed(1); }

  // times are { h: 1..12, m: 0 | 30 }
  function timeKey(t) { return t.m ? 'half.' + (t.h % 12 + 1) : 'hour.' + t.h; }
  function digital(t) { return t.h + ':' + (t.m ? '30' : '00'); }
  function shift(t, halves) {
    var mins = (((t.h % 12) * 60 + t.m + halves * 30) % 720 + 720) % 720;
    var h = Math.floor(mins / 60);
    return { h: h === 0 ? 12 : h, m: mins % 60 };
  }
  // the right time plus three it is easily confused with: the same hour and the neighbouring half hours
  function nearTimes(t) {
    var seen = {}, pool = [];
    [shift(t, -1), shift(t, 1), shift(t, 2), shift(t, -2), { h: t.h, m: t.m ? 0 : 30 }].forEach(function (x) {
      var k = digital(x);
      if (!seen[k] && k !== digital(t)) { seen[k] = true; pool.push(x); }
    });
    return KL.shuffle([t].concat(KL.sample(pool, 3)));
  }

  function hand(len, angle, color, width, id) {
    var p = polar(len, 0);
    return '<g' + (id ? ' id="' + id + '"' : '') + ' transform="rotate(' + f1(angle) + ' ' + CX + ' ' + CY + ')">' +
      '<line x1="' + CX + '" y1="' + CY + '" x2="' + f1(p[0]) + '" y2="' + f1(p[1]) + '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/></g>';
  }

  /* opts: { time, numbers, size, settable } — settable draws a hidden hour hand (#kl-hour) to swing */
  function clockSVG(opts) {
    var size = opts.size || 240;
    var s = ['<svg width="' + size + '" height="' + size + '" viewBox="0 0 240 240" aria-hidden="true">'];
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + FACE_R + '" fill="#fff" stroke="#3D405B" stroke-width="6"/>');
    var i, a, p1, p2;
    for (i = 0; i < 60; i++) {
      a = i * 6 * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = 100, r2 = major ? 90 : 95;
      p1 = [CX + r1 * Math.sin(a), CY - r1 * Math.cos(a)];
      p2 = [CX + r2 * Math.sin(a), CY - r2 * Math.cos(a)];
      s.push('<line x1="' + f1(p1[0]) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0]) + '" y2="' + f1(p2[1]) +
        '" stroke="' + (major ? '#8A8DA3' : '#C9CBD6') + '" stroke-width="' + (major ? 4 : 2) + '"/>');
    }
    if (opts.numbers) {
      for (i = 1; i <= 12; i++) {
        p1 = polar(NUM_R, i);
        s.push('<text x="' + f1(p1[0]) + '" y="' + f1(p1[1]) + '" text-anchor="middle" dy="0.35em" font-size="24" font-weight="bold" fill="#3D405B">' + i + '</text>');
      }
    }
    if (opts.time) {
      var t = opts.time;
      s.push(hand(80, t.m * 6, '#3D405B', 5));
      s.push(hand(58, ((t.h % 12) + t.m / 60) * 30, '#E07A5F', 9));
    } else if (opts.settable) {
      s.push(hand(80, 0, '#3D405B', 5)); // minute hand on 12: a whole hour
      s.push('<g id="kl-hour-wrap" opacity="0">' + hand(58, 0, '#E07A5F', 9, 'kl-hour') + '</g>');
    }
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="8" fill="#3D405B"/>');
    s.push('</svg>');
    return s.join('');
  }

  // swing the settable hour hand to hour h (the short way round); back=true returns it to 12 and hides it
  function swing(wrap, state, h, back) {
    var g = wrap.querySelector('#kl-hour');
    var from = state.angle;
    var target = back ? 0 : h * 30;
    var delta = ((target - from) % 360 + 540) % 360 - 180;
    var to = from + delta;
    state.angle = to;
    var hourWrap = wrap.querySelector('#kl-hour-wrap');
    if (!back) hourWrap.setAttribute('opacity', '1');
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / 380);
      var e = 1 - Math.pow(1 - k, 3);
      g.setAttribute('transform', 'rotate(' + f1(from + (to - from) * e) + ' ' + CX + ' ' + CY + ')');
      if (k < 1) window.requestAnimationFrame(step);
      else if (back) hourWrap.setAttribute('opacity', '0');
    }
    window.requestAnimationFrame(step);
  }

  function makeQuestions(level) {
    var qs = [];
    if (level === 'half') {
      // 5 read + 5 pick; three of each are half hours
      ['read', 'pick'].forEach(function (type) {
        KL.sample(HOURS, 5).forEach(function (h, k) { qs.push({ type: type, time: { h: h, m: k < 3 ? 30 : 0 } }); });
      });
    } else {
      KL.sample(HOURS, 5).forEach(function (h) { qs.push({ type: 'read', time: { h: h, m: 0 } }); });
      KL.sample(HOURS, 5).forEach(function (h) { qs.push({ type: 'set', time: { h: h, m: 0 } }); });
    }
    return KL.shuffle(qs);
  }

  KL.register('klukkan', {
    levels: [{ id: 'whole', label: '3:00' }, { id: 'half', label: '3:30' }],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'klukkan',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptSpeech: function (q) {
          if (q.type === 'read') return ['klukkan.read_q'];
          return ['klukkan.set_a', timeKey(q.time), q.type === 'pick' ? 'klukkan.pick_b' : 'klukkan.set_b'];
        },
        build: function (q, promptEl, answersEl, level) {
          var t = q.time;
          if (q.type === 'read') {
            promptEl.innerHTML = clockSVG({ time: t, numbers: true }) + '<p class="q-text">' + KL.t('klukkan.read_q') + '</p>';
            var choices = level === 'half' ? nearTimes(t) : KL.pickDistinct(HOURS, t.h, 4).map(function (h) { return { h: h, m: 0 }; });
            return choices.map(function (c) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'answer';
              btn.textContent = level === 'half' ? digital(c) : c.h;
              answersEl.appendChild(btn);
              return { el: btn, isCorrect: digital(c) === digital(t), speechParts: ['klukkan.clock_is_a', timeKey(c)] };
            });
          }
          if (q.type === 'pick') {
            promptEl.innerHTML = '<div class="digital">' + digital(t) + '</div><p class="q-text">' + KL.t('klukkan.pick_b') + '</p>';
            return nearTimes(t).map(function (c) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'answer clock-choice';
              btn.innerHTML = clockSVG({ time: c, numbers: true, size: 130 });
              answersEl.appendChild(btn);
              return { el: btn, isCorrect: digital(c) === digital(t), speechParts: ['klukkan.clock_is_a', timeKey(c)] };
            });
          }
          // set: tap the number the hour hand should point to; the hand swings there
          promptEl.innerHTML = '<div class="digital">' + digital(t) + '</div><p class="q-text">' + KL.t('klukkan.set_b') + '</p>';
          var wrap = document.createElement('div');
          wrap.className = 'clock-wrap';
          wrap.innerHTML = clockSVG({ settable: true });
          promptEl.appendChild(wrap);
          var handState = { angle: 0 };
          return HOURS.map(function (h) {
            var p = polar(NUM_R, h);
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'clock-num';
            btn.textContent = h;
            btn.style.left = (p[0] - BTN_SIZE / 2) + 'px';
            btn.style.top = (p[1] - BTN_SIZE / 2) + 'px';
            wrap.appendChild(btn);
            return {
              el: btn,
              isCorrect: h === t.h,
              speechParts: ['klukkan.clock_is_a', 'hour.' + h],
              onTap: function (correct) {
                swing(wrap, handState, h, false);
                if (!correct) KL.later(function () { swing(wrap, handState, h, true); }, 750);
              }
            };
          });
        }
      });
    }
  });
})();
