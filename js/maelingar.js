/* Mælingar / Måling: compare sizes, measure a pencil, and weigh a mystery parcel.
   Pictures share a coordinate system: a longer pencil really is longer, and
   every ruler starts at zero. A level balance says the parcel weighs exactly
   as much as the marked weights on the other pan. No real-world object masses
   are assumed. All lengths and masses stay within 1–10 cm/kg. */
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
    var s = '<svg class="measure-scene" viewBox="0 0 344 166" role="img" aria-label="' + KL.fmt('maelingar.ruler_aria', { n: q.correct }) + '">';
    s += pencil(start, 42, q.correct * step, q.color);
    s += '<path d="M' + start + ' 66v46M' + end + ' 66v46" stroke="#5C6BC0" stroke-width="2" stroke-dasharray="4 4"/>';
    s += '<rect x="18" y="106" width="308" height="48" rx="7" fill="#FFE29A" stroke="#B07D18" stroke-width="2"/>';
    for (var n = 0; n <= 10; n++) {
      var x = start + n * step;
      s += '<path d="M' + x + ' 106v' + (n % 5 === 0 ? 18 : 12) + '" stroke="#7A5500" stroke-width="2"/>';
      s += '<text x="' + x + '" y="143" text-anchor="middle" font-size="15" fill="#3D405B">' + n + '</text>';
    }
    return s + '<text x="308" y="92" text-anchor="end" font-size="16" fill="#3D405B">cm</text></svg>';
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
        promptSpeech: function (q) { return ['maelingar.' + (q.kind === 'ruler' ? 'ruler_q' : q.kind === 'weight' ? 'weight_q' : q.kind)]; },
        onCorrect: function (q, _a, promptEl) {
          var result = promptEl.querySelector('.measure-result');
          if (result) { result.textContent = q.correct + (q.kind === 'weight' ? ' kg' : ' cm'); result.classList.add('filled'); }
        },
        build: function (q, promptEl, answersEl) {
          var comparing = COMPARE.indexOf(q.kind) >= 0;
          var unit = q.kind === 'weight' ? 'kg' : 'cm';
          if (!comparing) promptEl.innerHTML = (q.kind === 'ruler' ? ruler(q) : scale(q)) + '<span class="measure-result" aria-live="polite">? ' + unit + '</span>';
          else promptEl.hidden = true;
          var values = comparing ? q.choices : KL.pickDistinct(KL.range(1, 10), q.correct, 4);
          return values.map(function (n, i) {
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
            answersEl.appendChild(btn);
            return { el: btn, isCorrect: n === q.correct, speechParts: comparing ? [] : [key] };
          });
        }
      });
    }
  });
})();
