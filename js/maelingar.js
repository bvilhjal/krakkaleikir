/* Mælingar / Måling: compare sizes, measure a pencil, and weigh a mystery parcel.
   Pictures share a coordinate system: a longer pencil really is longer, and
   the child moves the pencil to zero before reading the ruler. A level balance
   says the parcel weighs exactly as much as the marked weights on the other
   pan. No real-world object masses are assumed. All lengths and masses stay
   within 1–10 cm/kg. */
(function () {
  'use strict';

  var COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#D98B18', '#9C55B8', '#008D9C'];
  var COMPARE = ['longest', 'shortest', 'tallest', 'lowest'];

  function pencil(x, y, length, color) {
    return '<g class="measure-pencil" data-length="' + length + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + (length - 12) + '" height="20" rx="3" fill="' + color + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="8" height="20" rx="3" fill="#F4B6C2"/>' +
      '<path d="M' + (x + 10) + ' ' + (y + 5) + 'h' + (length - 25) + '" stroke="#fff" stroke-width="3" opacity=".5"/>' +
      '<path d="M' + (x + length - 12) + ' ' + y + 'l12 10-12 10z" fill="#E8C69A"/>' +
      '<path d="M' + (x + length - 4) + ' ' + (y + 7) + 'l4 3-4 3z" fill="#3D405B"/></g>';
  }

  function flower(n, color) {
    var top = 112 - n * 8, s = '<path d="M90 122V' + top + '" stroke="#57A773" stroke-width="6"/>';
    s += '<ellipse cx="100" cy="' + (top + 25) + '" rx="13" ry="6" transform="rotate(-25 100 ' + (top + 25) + ')" fill="#57A773"/>';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      s += '<circle cx="' + (90 + 10 * Math.cos(a)).toFixed(1) + '" cy="' + (top + 10 * Math.sin(a)).toFixed(1) + '" r="8" fill="' + color + '"/>';
    }
    return s + '<circle cx="90" cy="' + top + '" r="7" fill="#FFD166"/>' +
      '<path d="M72 118h36l-5 24H77z" fill="#E07A5F"/><path d="M72 118h36" stroke="#B04E36" stroke-width="5"/>';
  }

  function ruler(q) {
    var start = 32, step = 28, end = start + q.correct * step;
    var length = q.correct * step, x0 = 326 - length;
    if (Math.abs(x0 - start) < 20) x0 = 10;
    var s = '<svg class="measure-scene measure-ruler" viewBox="0 0 344 230" role="group" aria-label="' + KL.t('maelingar.ruler_q') + '">';
    s += '<rect x="8" y="6" width="328" height="54" rx="14" fill="#F5F6FF"/>';
    s += '<path d="M32 76v23m-7-7 7 7 7-7" fill="none" stroke="#57A773" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<circle class="measure-zero" cx="32" cy="122" r="12" fill="#DFF3E3" stroke="#57A773" stroke-width="2" stroke-dasharray="3 3"/>';
    s += '<path class="measure-guides" d="M' + start + ' 136v32M' + end + ' 136v32" stroke="#5C6BC0" stroke-width="2" stroke-dasharray="4 4"/>';
    s += '<rect x="18" y="168" width="308" height="48" rx="7" fill="#FFE29A" stroke="#B07D18" stroke-width="2"/>';
    for (var n = 0; n <= 10; n++) {
      var x = start + n * step;
      s += '<path d="M' + x + ' 168v' + (n % 5 === 0 ? 18 : 12) + '" stroke="#7A5500" stroke-width="2"/>';
      s += '<text x="' + x + '" y="205" text-anchor="middle" font-size="15" fill="#3D405B">' + n + '</text>';
    }
    s += '<text x="308" y="154" text-anchor="end" font-size="16" fill="#3D405B">cm</text>';
    return s + '<g class="measure-pencil-drag" transform="translate(' + x0 + ' 22)" role="button" tabindex="0" aria-label="' + KL.t('maelingar.move_aria') + '">' +
      '<rect x="-6" y="-20" width="' + Math.max(44, length + 12) + '" height="60" rx="12" fill="transparent"/>' + pencil(0, 0, length, q.color) + '</g></svg>';
  }

  function movePencil(q, promptEl, answers) {
    var svg = promptEl.querySelector('.measure-ruler'), pencilEl = svg.querySelector('.measure-pencil-drag');
    var helper = promptEl.querySelector('.measure-place'), hint = promptEl.querySelector('.measure-hint');
    var x = pencilEl.transform.baseVal.getItem(0).matrix.e, y = 22, drag = null, placed = false;
    function move(nx, ny) {
      x = Math.max(8, Math.min(326 - q.correct * 28, nx));
      y = Math.max(8, Math.min(140, ny));
      pencilEl.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
    }
    function place() {
      if (placed) return;
      placed = true;
      move(32, 112);
      svg.classList.add('aligned');
      svg.setAttribute('aria-label', KL.fmt('maelingar.ruler_aria', { n: q.correct }));
      pencilEl.setAttribute('aria-disabled', 'true');
      pencilEl.setAttribute('tabindex', '-1');
      helper.hidden = true;
      hint.hidden = true;
      answers.forEach(function (a) { a.el.disabled = false; });
      KL.sfx('pop');
      KL.say(['maelingar.ruler_q']);
      KL.setReplay(['maelingar.ruler_q']);
      KL.onUnlock(function () { KL.say(['maelingar.ruler_q']); });
    }
    function snap() { if (Math.abs(x - 32) <= 16 && Math.abs(y - 112) <= 20) place(); }
    function point(e) {
      var p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    pencilEl.addEventListener('pointerdown', function (e) {
      if (placed || !e.isPrimary || e.button !== 0) return;
      e.preventDefault();
      var p = point(e);
      drag = { id: e.pointerId, dx: p.x - x, dy: p.y - y };
      pencilEl.setPointerCapture(e.pointerId);
      pencilEl.classList.add('dragging');
    });
    pencilEl.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = point(e);
      move(p.x - drag.dx, p.y - drag.dy);
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      pencilEl.classList.remove('dragging');
      if (e.type === 'pointerup') snap();
    }
    pencilEl.addEventListener('pointerup', release);
    pencilEl.addEventListener('pointercancel', release);
    pencilEl.addEventListener('lostpointercapture', release);
    pencilEl.addEventListener('keydown', function (e) {
      if (placed) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Home') { e.preventDefault(); place(); }
      else if (/^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
        e.preventDefault();
        move(x + (e.key === 'ArrowRight' ? 7 : e.key === 'ArrowLeft' ? -7 : 0), y + (e.key === 'ArrowDown' ? 7 : e.key === 'ArrowUp' ? -7 : 0));
        snap();
      }
    });
    pencilEl.addEventListener('click', function (e) { if (e.detail === 0) place(); });
    helper.addEventListener('click', place);
  }

  function scale(q) {
    var label = q.weights.map(function (w) { return w + ' kg'; }).join(' + ');
    var s = '<svg class="measure-scene" viewBox="0 0 344 230" role="img" aria-label="' + KL.fmt('maelingar.scale_aria', { weights: label }) + '">';
    s += '<path d="M172 43v153m-48 8h96l-16-14h-64z" fill="#5C6BC0" stroke="#3D405B" stroke-width="6" stroke-linejoin="round"/>';
    s += '<path d="M62 53h220M62 53l-44 105h88L62 53m220 0-44 105h88L282 53" fill="none" stroke="#3D405B" stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="M18 158q44 27 88 0m132 0q44 27 88 0" fill="#DFF3E3" stroke="#57A773" stroke-width="4"/>';
    s += '<rect x="32" y="104" width="60" height="53" rx="5" fill="' + q.color + '"/>' +
      '<path d="M62 104v53m-30-37h60" stroke="#FFE29A" stroke-width="7"/>' +
      '<circle cx="62" cy="138" r="12" fill="#fff"/><text x="62" y="144" text-anchor="middle" font-size="20" font-weight="bold" fill="#3D405B">?</text>';
    q.weights.forEach(function (w, i) {
      var x = 242 + (i % 2) * 41, y = 126 - Math.floor(i / 2) * 34;
      s += '<g class="measure-weight" data-kg="' + w + '"><rect x="' + x + '" y="' + y + '" width="39" height="30" rx="5" fill="#FFD166" stroke="#B07D18" stroke-width="2"/>' +
        '<text x="' + (x + 19.5) + '" y="' + (y + 20) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#3D405B">' + w + ' kg</text></g>';
    });
    return s + '<circle cx="172" cy="53" r="10" fill="#E07A5F"/><text x="172" y="226" text-anchor="middle" font-size="20" fill="#3D405B">=</text></svg>';
  }

  function makeQuestions(level) {
    if (level === 'compare') {
      return KL.shuffle(KL.range(0, 9).map(function (i) {
        var kind = COMPARE[i % COMPARE.length];
        var choices = KL.sample(KL.range(3, 10), 4);
        var biggest = kind === 'longest' || kind === 'tallest';
        return { kind: kind, choices: choices, correct: Math[biggest ? 'max' : 'min'].apply(Math, choices), colors: KL.shuffle(COLORS) };
      }));
    }
    return KL.shuffle(KL.range(1, 10)).map(function (n) {
      // A few marked 1/2/5 kg pieces make the total readable on a small screen.
      var left = n, weights = [];
      while (left > 0) {
        var w = left >= 5 ? 5 : left >= 2 ? 2 : 1;
        weights.push(w);
        left -= w;
      }
      return { kind: level, correct: n, weights: KL.shuffle(weights), color: COLORS[KL.randInt(0, COLORS.length - 1)] };
    });
  }

  KL.register('maelingar', {
    levels: [{ id: 'compare', labelKey: 'maelingar.compare' }, { id: 'ruler', label: 'cm' }, { id: 'weight', label: 'kg' }],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'maelingar',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function (q) { return KL.t('maelingar.' + (q.kind === 'ruler' ? 'ruler_q' : q.kind === 'weight' ? 'weight_q' : q.kind)); },
        promptSpeech: function (q) { return q.kind === 'ruler' ? ['maelingar.move_q', 'maelingar.ruler_q'] : ['maelingar.' + (q.kind === 'weight' ? 'weight_q' : q.kind)]; },
        retrySpeech: function (q) { return ['maelingar.' + (q.kind === 'ruler' ? 'ruler_q' : q.kind === 'weight' ? 'weight_q' : q.kind)]; },
        onCorrect: function (q, _a, promptEl) {
          var result = promptEl.querySelector('.measure-result');
          if (result) { result.textContent = q.correct + (q.kind === 'weight' ? ' kg' : ' cm'); result.classList.add('filled'); }
        },
        build: function (q, promptEl, answersEl) {
          var comparing = COMPARE.indexOf(q.kind) >= 0;
          var unit = q.kind === 'weight' ? 'kg' : 'cm';
          if (!comparing) promptEl.innerHTML = (q.kind === 'ruler' ? ruler(q) : scale(q)) + '<span class="measure-result" aria-live="polite">? ' + unit + '</span>';
          else promptEl.hidden = true;
          if (q.kind === 'ruler') promptEl.insertAdjacentHTML('beforeend', '<span class="measure-hint" aria-live="polite">' + KL.t('maelingar.move_q') + '</span><button type="button" class="chip measure-place">' + KL.t('maelingar.place') + '</button>');
          var values = comparing ? q.choices : KL.pickDistinct(KL.range(1, 10), q.correct, 4);
          var answers = values.map(function (n, i) {
            var key = 'maelingar.' + unit + '.' + n;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer' + (comparing ? ' measure-choice' : '');
            if (comparing) {
              btn.setAttribute('aria-label', KL.fmt('maelingar.size', { n: n }));
              // A common viewBox preserves the visual ratios across all choices.
              var drawing = q.kind === 'longest' || q.kind === 'shortest' ? pencil(22, 64, n * 13, q.colors[i]) : flower(n, q.colors[i]);
              btn.innerHTML = '<svg viewBox="0 0 180 150" aria-hidden="true">' + drawing + '</svg>';
            } else btn.innerHTML = n + '<span class="measure-unit">' + unit + '</span>';
            btn.disabled = q.kind === 'ruler';
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: n === q.correct, speechParts: comparing ? [] : [key] };
          });
          if (q.kind === 'ruler') movePencil(q, promptEl, answers);
          return answers;
        }
      });
    }
  });
})();
