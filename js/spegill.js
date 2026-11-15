/* Spegill / Spejl: mirror images. A picture stands by a mirror; drag the
   picture that is its reflection into the empty frame on the other side (a tap
   works too). Pictures: things facing one way, mirrored left-right. Easy: 3x3
   block patterns by an upright mirror. Hard: 4x4 two-colour patterns, the
   mirror upright or lying down. The wrong choices are the classic mix-ups:
   the same picture unturned, upside down, or turned half a round. */
(function () {
  'use strict';

  // things that look different mirrored left-right AND upside down (so the
  // three choices never look alike; the plane and the fish were left out)
  var PICTURES = ['bill', 'banani', 'lykill', 'skor', 'batur', 'gulrot', 'regnhlif', 'bolli',
    'sokkur', 'stoll', 'hamar', 'lest', 'tannbursti', 'blyantur', 'vettlingur', 'hjol'];
  var COLORS = ['#E07A5F', '#5C6BC0', '#57A773', '#F2B544', '#26A6C9', '#EC6A9C'];

  // a pattern is a list of [row, col, colour]; flips act on an n x n grid
  function flip(cells, n, how) {
    return cells.map(function (c) {
      var r = c[0], k = c[1];
      if (how === 'h' || how === 'r') k = n - 1 - k; // left-right
      if (how === 'v' || how === 'r') r = n - 1 - r; // upside down ('r': half a turn)
      return [r, k, c[2]];
    });
  }
  function sig(cells) {
    return cells.map(function (c) { return c[0] + ',' + c[1] + ',' + c[2]; }).sort().join(' ');
  }
  // random pattern whose four looks (as is, mirrored both ways, half-turned) all differ
  function pattern(n, count, colors) {
    for (;;) {
      var all = [];
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) all.push([r, k]);
      var cells = KL.sample(all, count).map(function (c, i) { return [c[0], c[1], colors[i % colors.length]]; });
      var looks = ['id', 'h', 'v', 'r'].map(function (how) { return sig(how === 'id' ? cells : flip(cells, n, how)); });
      if (looks.every(function (x, i) { return looks.indexOf(x) === i; })) return cells;
    }
  }

  function gridSVG(cells, n, size) {
    var u = 20, s = '';
    for (var r = 0; r < n; r++) {
      for (var k = 0; k < n; k++) s += '<rect x="' + (k * u + 2) + '" y="' + (r * u + 2) + '" width="' + (u - 4) + '" height="' + (u - 4) + '" rx="3" fill="#EEF0F6"/>';
    }
    cells.forEach(function (c) {
      s += '<rect x="' + (c[1] * u + 1) + '" y="' + (c[0] * u + 1) + '" width="' + (u - 2) + '" height="' + (u - 2) + '" rx="3" fill="' + c[2] + '"/>';
    });
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + (n * u) + ' ' + (n * u) + '" aria-hidden="true">' + s + '</svg>';
  }
  function pictureSVG(id, how, size) {
    var t = { id: '', h: 'translate(100 0) scale(-1 1)', v: 'translate(0 100) scale(1 -1)', r: 'rotate(180 50 50)' }[how];
    var inner = KL_ART.picture(id, size).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true"><g transform="' + t + '">' + inner + '</g></svg>';
  }
  function draw(q, how, size) {
    if (q.kind === 'picture') return pictureSVG(q.item, how, size);
    return gridSVG(how === 'id' ? q.cells : flip(q.cells, q.n, how), q.n, size);
  }

  function makeQuestions(level) {
    if (level === 'paint') {
      return KL.range(0, 9).map(function (i) {
        var n = i >= 4 && i % 2 === 0 ? 4 : 3;
        var lying = n === 4 || i % 3 === 1;
        return { kind: 'paint', n: n, cells: pattern(n, i < 4 ? 3 : 5, i < 4 ? ['#5C6BC0'] : ['#5C6BC0', '#E07A5F']),
          axis: lying ? 'lying' : 'upright', answer: lying ? 'v' : 'h' };
      });
    }
    if (level === 'pictures') {
      return KL.sample(PICTURES, 10).map(function (id) {
        return { kind: 'picture', item: id, axis: 'upright', answer: 'h', choices: KL.shuffle(['h', 'id', 'v']) };
      });
    }
    var hard = level === 'hard';
    var qs = [];
    for (var i = 0; i < 10; i++) {
      var n = hard ? 4 : 3;
      var colors = hard ? KL.sample(COLORS, 2) : [COLORS[i % COLORS.length]];
      // hard: every third mirror lies down, so the reflection is upside down
      var lying = hard && i % 3 === 2;
      var answer = lying ? 'v' : 'h';
      var wrong = hard ? ['id', lying ? 'h' : 'v', 'r'] : ['id', KL.randInt(0, 1) ? 'v' : 'r'];
      qs.push({ kind: 'grid', n: n, cells: pattern(n, hard ? KL.randInt(5, 7) : 4, colors), axis: lying ? 'lying' : 'upright',
        answer: answer, choices: KL.shuffle([answer].concat(wrong)) });
    }
    return KL.shuffle(qs);
  }

  function inside(el, x, y) {
    var r = el.getBoundingClientRect(), pad = 24;
    return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  }

  /* Drag a choice onto the frame. A drop on the frame answers (the engine's
     click handler decides); a drop elsewhere flies back. A plain tap answers too.
     The browser's own click after a drag is swallowed so it cannot answer twice. */
  function draggable(btn, slot) {
    var drag = null, lastDrag = 0, letThrough = false;
    btn.addEventListener('pointerdown', function (e) {
      if (btn.disabled || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    btn.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      drag.moved = true;
      btn.classList.remove('return');
      btn.classList.add('dragging');
      btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.06)';
      slot.classList.toggle('over', inside(slot, e.clientX, e.clientY));
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      btn.classList.remove('dragging');
      slot.classList.remove('over');
      if (!d.moved) return; // a tap: the click that follows answers
      lastDrag = Date.now();
      var hit = e.type === 'pointerup' && inside(slot, e.clientX, e.clientY);
      btn.classList.add('return');
      btn.style.transform = '';
      if (hit && !btn.disabled) { letThrough = true; btn.click(); }
    }
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('lostpointercapture', end);
    // registered before the engine's handler, so it can stop a stray click
    btn.addEventListener('click', function (e) {
      if (letThrough) { letThrough = false; return; }
      if (Date.now() - lastDrag < 600) e.stopImmediatePropagation();
    });
  }

  // Painting is checked only when the child asks. A wrong check keeps every
  // cell editable; exact equality also catches extra paint in empty squares.
  function paintBoard(q, promptEl, answersEl) {
    var ink = ['#5C6BC0', '#E07A5F'], names = { '#5C6BC0': 'spegill.blue', '#E07A5F': 'spegill.red' };
    var selected = ink[0], painted = Array(q.n * q.n).fill(null), source = painted.slice();
    q.cells.forEach(function (c) { source[c[0] * q.n + c[1]] = c[2]; });
    var expected = painted.slice();
    flip(q.cells, q.n, q.answer).forEach(function (c) { expected[c[0] * q.n + c[1]] = c[2]; });
    promptEl.classList.add('mirror-prompt');
    promptEl.innerHTML = '<div class="paint-palette" role="group" aria-label="' + KL.t('spegill.colors') + '"></div>' +
      '<div class="paint-board ' + q.axis + '"><div class="paint-grid paint-source" role="group" aria-label="' + KL.t('spegill.model') + '"></div>' +
      '<div class="paint-axis" aria-hidden="true"></div>' +
      '<div class="paint-grid paint-target" role="group" aria-label="' + KL.t('spegill.yours') + '"></div></div>' +
      '<p class="workbook-hint">' + KL.t('spegill.paint_hint') + '</p>';
    var palette = promptEl.querySelector('.paint-palette');
    ink.concat([null]).forEach(function (color, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'paint-tool' + (i < 2 ? ' ink-' + i : '');
      btn.dataset.ink = color || '';
      btn.textContent = i < 2 ? (i === 0 ? '●' : '✚') : KL.t('spegill.erase');
      btn.setAttribute('aria-label', KL.t(i < 2 ? names[color] : 'spegill.erase'));
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.addEventListener('click', function () {
        selected = color;
        palette.querySelectorAll('[data-ink]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      });
      palette.appendChild(btn);
    });
    function label(i, color) {
      return KL.fmt('spegill.cell', { r: Math.floor(i / q.n) + 1, c: i % q.n + 1 }) + ': ' +
        KL.t(color ? names[color] : 'spegill.empty');
    }
    function show(cell, i, color) {
      cell.className = 'paint-cell' + (color ? ' ink-' + ink.indexOf(color) : '');
      cell.textContent = color ? (color === ink[0] ? '●' : '✚') : '';
      cell.setAttribute('aria-label', label(i, color));
    }
    var target = promptEl.querySelector('.paint-target');
    promptEl.querySelectorAll('.paint-grid').forEach(function (grid) { grid.style.setProperty('--n', q.n); });
    source.forEach(function (color, i) {
      var model = document.createElement('span');
      model.setAttribute('role', 'img');
      show(model, i, color);
      promptEl.querySelector('.paint-source').appendChild(model);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.cell = i;
      show(cell, i, null);
      cell.addEventListener('click', function () {
        painted[i] = painted[i] === selected ? null : selected;
        show(cell, i, painted[i]);
        KL.sfx('click');
      });
      cell.addEventListener('keydown', function (e) {
        var move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -q.n, ArrowDown: q.n }[e.key];
        if (move === undefined) return;
        e.preventDefault();
        var next = i + move;
        if (next >= 0 && next < painted.length && (Math.abs(move) !== 1 || Math.floor(next / q.n) === Math.floor(i / q.n))) target.children[next].focus();
      });
      target.appendChild(cell);
    });
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'paint-tool';
    clear.textContent = KL.t('spegill.clear');
    clear.addEventListener('click', function () {
      painted.fill(null);
      Array.from(target.children).forEach(function (cell, i) { show(cell, i, null); });
    });
    palette.appendChild(clear);
    answersEl.className = 'answers paint-actions';
    var check = document.createElement('button');
    check.type = 'button';
    check.className = 'answer paint-check';
    check.textContent = KL.t('spegill.check');
    answersEl.appendChild(check);
    return [{ el: check, retryable: true, speechParts: [],
      isCorrect: function () { return painted.every(function (color, i) { return color === expected[i]; }); } }];
  }

  KL.register('spegill', {
    levels: [
      { id: 'pictures', labelKey: 'spegill.pictures' },
      { id: 'easy', labelKey: 'level.easy' },
      { id: 'hard', labelKey: 'level.hard' },
      { id: 'paint', labelKey: 'spegill.paint' }
    ],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'spegill',
        levels: this.levels,
        makeQuestions: makeQuestions,
        promptText: function (q) { return KL.t(q.kind === 'paint' ? 'spegill.paint_q' : 'spegill.q'); },
        promptSpeech: function (q) { return [q.kind === 'paint' ? 'spegill.paint_q' : 'spegill.q']; },
        retrySpeech: function (q) { return [q.kind === 'paint' ? 'spegill.paint_hint' : 'spegill.hint']; },
        onCorrect: function (q, a, promptEl) {
          if (q.kind === 'paint') { promptEl.querySelector('.paint-target').classList.add('filled'); return; }
          var slot = promptEl.querySelector('.mirror-slot');
          slot.innerHTML = draw(q, q.answer, 110);
          slot.classList.add('filled');
          a.el.classList.add('placed');
        },
        build: function (q, promptEl, answersEl) {
          if (q.kind === 'paint') return paintBoard(q, promptEl, answersEl);
          promptEl.classList.add('mirror-prompt');
          promptEl.innerHTML = '<div class="mirror-stage ' + q.axis + '">' +
            '<div class="mirror-card">' + draw(q, 'id', 110) + '</div>' +
            '<div class="mirror-glass" aria-hidden="true"></div>' +
            '<div class="mirror-slot" aria-hidden="true"></div></div>';
          var slot = promptEl.querySelector('.mirror-slot');
          answersEl.className = 'answers mirror-choices';
          return q.choices.map(function (how, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer mirror-choice';
            btn.setAttribute('aria-label', KL.fmt('spegill.choice', { n: i + 1 }));
            btn.innerHTML = draw(q, how, 96);
            draggable(btn, slot);
            answersEl.appendChild(btn);
            return { el: btn, how: how, isCorrect: how === q.answer, speechParts: [] };
          });
        }
      });
    }
  });

  KL.spegill = { flip: flip, sig: sig, PICTURES: PICTURES }; // for the smoke test
})();
