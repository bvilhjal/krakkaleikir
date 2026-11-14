/* Drawings for Krakkaleikir: Kóli the koala (the guide) and the animal faces used
   for counting, the memory cards and the sticker book. Plain SVG strings, no images. */
(function () {
  'use strict';

  var INK = '#2E3142';

  function eyes(x1, x2, y, r) {
    r = r || 5;
    return '<g class="k-eyes">' +
      '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (x1 + r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + (r * 0.32) + '" fill="#fff"/>' +
      '<circle cx="' + (x2 + r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + (r * 0.32) + '" fill="#fff"/></g>';
  }
  function cheeks(x1, x2, y, r) {
    return '<circle cx="' + x1 + '" cy="' + y + '" r="' + (r || 5) + '" fill="#F48FB1" opacity=".55"/>' +
      '<circle cx="' + x2 + '" cy="' + y + '" r="' + (r || 5) + '" fill="#F48FB1" opacity=".55"/>';
  }

  // Kóli: ears, head, big nose; .k-mouth moves while he talks (CSS), .k-eyes blink
  function koalaInner() {
    return '' +
      '<g class="k-ear k-ear-l"><circle cx="24" cy="40" r="22" fill="#97A3AD"/><circle cx="24" cy="40" r="13" fill="#F3C1CB"/></g>' +
      '<g class="k-ear k-ear-r"><circle cx="96" cy="40" r="22" fill="#97A3AD"/><circle cx="96" cy="40" r="13" fill="#F3C1CB"/></g>' +
      '<ellipse cx="60" cy="68" rx="41" ry="38" fill="#AEB8C1"/>' +
      '<ellipse cx="60" cy="88" rx="23" ry="15" fill="#DCE2E6"/>' +
      cheeks(33, 87, 78, 6.5) +
      eyes(43, 77, 58, 5.5) +
      '<ellipse cx="60" cy="71" rx="10.5" ry="13" fill="#3D405B"/>' +
      '<ellipse cx="56.5" cy="66" rx="3" ry="4.2" fill="#62668A"/>' +
      '<ellipse class="k-mouth" cx="60" cy="92" rx="6.5" ry="3.2" fill="#8C3B4A"/>';
  }
  function koala(size, cls) {
    size = size || 80;
    return '<svg class="koala-svg' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 120 120" aria-hidden="true">' + koalaInner() + '</svg>';
  }

  var FACES = {
    koala: function () { return '<g transform="scale(0.8333)">' + koalaInner() + '</g>'; },
    froskur: function () {
      return '<ellipse cx="50" cy="62" rx="40" ry="28" fill="#66BB6A"/>' +
        '<circle cx="29" cy="36" r="15" fill="#66BB6A"/><circle cx="71" cy="36" r="15" fill="#66BB6A"/>' +
        '<circle cx="29" cy="36" r="9.5" fill="#fff"/><circle cx="71" cy="36" r="9.5" fill="#fff"/>' +
        '<circle cx="30" cy="37" r="5" fill="' + INK + '"/><circle cx="70" cy="37" r="5" fill="' + INK + '"/>' +
        '<circle cx="44" cy="55" r="1.8" fill="#2E7D32"/><circle cx="56" cy="55" r="1.8" fill="#2E7D32"/>' +
        '<path d="M27 66 Q50 84 73 66" fill="none" stroke="#2E7D32" stroke-width="4" stroke-linecap="round"/>' +
        cheeks(20, 80, 64, 5.5);
    },
    ungi: function () {
      return '<path d="M44 24 C40 12 50 8 50 20 C52 8 62 12 56 24 Z" fill="#FFCA28"/>' +
        '<circle cx="50" cy="57" r="35" fill="#FFD54F"/>' +
        '<ellipse cx="17" cy="64" rx="8" ry="13" fill="#FFC107" transform="rotate(22 17 64)"/>' +
        '<ellipse cx="83" cy="64" rx="8" ry="13" fill="#FFC107" transform="rotate(-22 83 64)"/>' +
        eyes(38, 62, 51, 5) +
        '<path d="M42 61 L58 61 L50 71 Z" fill="#FB8C00" stroke="#FB8C00" stroke-width="2" stroke-linejoin="round"/>' +
        cheeks(29, 71, 64, 5);
    },
    kottur: function () {
      return '<path d="M17 46 L23 10 L46 30 Z" fill="#FFA726" stroke="#FFA726" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M83 46 L77 10 L54 30 Z" fill="#FFA726" stroke="#FFA726" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M25 37 L27 19 L39 30 Z" fill="#F8BBD0"/><path d="M75 37 L73 19 L61 30 Z" fill="#F8BBD0"/>' +
        '<ellipse cx="50" cy="59" rx="37" ry="32" fill="#FFB74D"/>' +
        '<path d="M44 29 L46 38 M50 28 L50 38 M56 29 L54 38" stroke="#F57C00" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="k-eyes"><ellipse cx="37" cy="55" rx="4.5" ry="6" fill="' + INK + '"/><ellipse cx="63" cy="55" rx="4.5" ry="6" fill="' + INK + '"/></g>' +
        '<path d="M46 64 L54 64 L50 69 Z" fill="#EC407A"/>' +
        '<path d="M50 69 Q46 75 41 72 M50 69 Q54 75 59 72" stroke="#6D4C41" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M30 65 L11 61 M30 70 L11 72 M70 65 L89 61 M70 70 L89 72" stroke="#6D4C41" stroke-width="1.8" stroke-linecap="round"/>';
    },
    svin: function () {
      return '<path d="M19 38 L21 12 L42 26 Z" fill="#F48FB1" stroke="#F48FB1" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M81 38 L79 12 L58 26 Z" fill="#F48FB1" stroke="#F48FB1" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="57" r="36" fill="#F8BBD0"/>' +
        eyes(36, 64, 48, 5) +
        '<ellipse cx="50" cy="67" rx="16" ry="11" fill="#F48FB1"/>' +
        '<ellipse cx="44" cy="67" rx="3" ry="4.5" fill="#C2185B"/><ellipse cx="56" cy="67" rx="3" ry="4.5" fill="#C2185B"/>' +
        cheeks(24, 76, 62, 5);
    },
    bjorn: function () {
      return '<circle cx="23" cy="28" r="14" fill="#8D6E63"/><circle cx="23" cy="28" r="7" fill="#BCAAA4"/>' +
        '<circle cx="77" cy="28" r="14" fill="#8D6E63"/><circle cx="77" cy="28" r="7" fill="#BCAAA4"/>' +
        '<circle cx="50" cy="57" r="36" fill="#8D6E63"/>' +
        '<ellipse cx="50" cy="69" rx="18" ry="14" fill="#D7CCC8"/>' +
        eyes(36, 64, 50, 5) +
        '<ellipse cx="50" cy="63" rx="7" ry="5" fill="#3E2723"/>' +
        '<path d="M50 67 L50 72 M44 74 Q50 78 56 74" stroke="#3E2723" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    },
    fiskur: function () {
      return '<path d="M70 50 L94 30 L94 70 Z" fill="#29B6F6" stroke="#29B6F6" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M34 30 Q46 12 60 30 Z" fill="#29B6F6"/>' +
        '<ellipse cx="44" cy="51" rx="35" ry="25" fill="#4FC3F7"/>' +
        '<path d="M54 30 Q62 51 54 72" stroke="#B3E5FC" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="26" cy="45" r="8.5" fill="#fff"/><circle cx="27" cy="46" r="4.5" fill="' + INK + '"/>' +
        '<path d="M11 57 Q17 62 23 57" stroke="#0277BD" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<circle cx="36" cy="62" r="4" fill="#F48FB1" opacity=".5"/>';
    },
    mariuhaena: function () {
      return '<path d="M41 16 Q37 6 30 6 M59 16 Q63 6 70 6" stroke="' + INK + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<circle cx="50" cy="30" r="18" fill="' + INK + '"/>' +
        '<circle cx="50" cy="60" r="34" fill="#E53935"/>' +
        '<path d="M50 28 L50 94" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="35" cy="52" r="7" fill="' + INK + '"/><circle cx="65" cy="52" r="7" fill="' + INK + '"/>' +
        '<circle cx="31" cy="72" r="6" fill="' + INK + '"/><circle cx="69" cy="72" r="6" fill="' + INK + '"/>' +
        '<circle cx="42" cy="86" r="4.5" fill="' + INK + '"/><circle cx="58" cy="86" r="4.5" fill="' + INK + '"/>' +
        '<circle cx="43" cy="25" r="4.5" fill="#fff"/><circle cx="57" cy="25" r="4.5" fill="#fff"/>' +
        '<circle cx="44" cy="26" r="2.2" fill="' + INK + '"/><circle cx="58" cy="26" r="2.2" fill="' + INK + '"/>';
    },
    ugla: function () {
      return '<path d="M17 32 L21 8 L39 24 Z" fill="#8D6E63"/><path d="M83 32 L79 8 L61 24 Z" fill="#8D6E63"/>' +
        '<ellipse cx="50" cy="58" rx="35" ry="37" fill="#8D6E63"/>' +
        '<ellipse cx="50" cy="76" rx="21" ry="17" fill="#D7CCC8"/>' +
        '<path d="M42 72 q3 3 6 0 M52 72 q3 3 6 0 M47 80 q3 3 6 0" stroke="#A1887F" stroke-width="2" fill="none"/>' +
        '<circle cx="35" cy="46" r="13" fill="#fff" stroke="#FFCA28" stroke-width="3"/>' +
        '<circle cx="65" cy="46" r="13" fill="#fff" stroke="#FFCA28" stroke-width="3"/>' +
        eyes(35, 65, 47, 6) +
        '<path d="M45 57 L55 57 L50 66 Z" fill="#FB8C00" stroke="#FB8C00" stroke-width="2" stroke-linejoin="round"/>';
    },
    mus: function () {
      return '<circle cx="23" cy="32" r="18" fill="#B0BEC5"/><circle cx="23" cy="32" r="11" fill="#F8BBD0"/>' +
        '<circle cx="77" cy="32" r="18" fill="#B0BEC5"/><circle cx="77" cy="32" r="11" fill="#F8BBD0"/>' +
        '<ellipse cx="50" cy="61" rx="31" ry="29" fill="#B0BEC5"/>' +
        eyes(40, 60, 56, 4.5) +
        '<circle cx="50" cy="70" r="5" fill="#EC407A"/>' +
        '<rect x="47" y="76" width="6" height="5" rx="1" fill="#fff" stroke="#90A4AE" stroke-width="1"/>' +
        '<path d="M38 70 L18 66 M38 74 L18 77 M62 70 L82 66 M62 74 L82 77" stroke="#78909C" stroke-width="1.8" stroke-linecap="round"/>' +
        cheeks(30, 70, 66, 4.5);
    },
    ljon: function () {
      var mane = '';
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        mane += '<circle cx="' + (50 + 34 * Math.cos(a)).toFixed(1) + '" cy="' + (54 + 34 * Math.sin(a)).toFixed(1) + '" r="12" fill="#EF6C00"/>';
      }
      return mane + '<circle cx="50" cy="54" r="36" fill="#F57C00"/>' +
        '<circle cx="31" cy="33" r="7" fill="#FFB74D"/><circle cx="69" cy="33" r="7" fill="#FFB74D"/>' +
        '<circle cx="50" cy="56" r="27" fill="#FFCC80"/>' +
        '<ellipse cx="50" cy="66" rx="13" ry="9" fill="#FFE0B2"/>' +
        eyes(40, 60, 51, 4.5) +
        '<path d="M45 61 L55 61 L50 66 Z" fill="#5D4037"/>' +
        '<path d="M50 66 Q46 72 42 69 M50 66 Q54 72 58 69" stroke="#5D4037" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    },
    morgaes: function () {
      return '<ellipse cx="17" cy="66" rx="7" ry="16" fill="#263238" transform="rotate(18 17 66)"/>' +
        '<ellipse cx="83" cy="66" rx="7" ry="16" fill="#263238" transform="rotate(-18 83 66)"/>' +
        '<ellipse cx="50" cy="57" rx="33" ry="38" fill="#37474F"/>' +
        '<circle cx="40" cy="50" r="15" fill="#fff"/><circle cx="60" cy="50" r="15" fill="#fff"/>' +
        '<ellipse cx="50" cy="70" rx="22" ry="20" fill="#fff"/>' +
        eyes(41, 59, 49, 4.5) +
        '<path d="M44 59 L56 59 L50 67 Z" fill="#FB8C00" stroke="#FB8C00" stroke-width="2" stroke-linejoin="round"/>' +
        cheeks(32, 68, 62, 4.5);
    }
  };
  var ANIMALS = ['koala', 'froskur', 'ungi', 'kottur', 'svin', 'bjorn', 'fiskur', 'mariuhaena', 'ugla', 'mus', 'ljon', 'morgaes'];

  function animal(id, size) {
    size = size || 64;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' + FACES[id]() + '</svg>';
  }

  // a flat grey version for stickers not collected yet
  function silhouette(id, size) {
    return '<span class="sil">' + animal(id, size) + '</span>';
  }

  function face(id) { return FACES[id](); }

  // Friendly parent portraits for completing the animal book; never random prizes.
  function parent(id, size) {
    var mom = id === 'mom';
    var hair = mom ? '#65463A' : '#705342';
    return '<svg width="' + (size || 88) + '" height="' + (size || 88) + '" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="47" fill="#FFF0CD"/>' +
      (mom ? '<path d="M20 77 L20 38 Q20 9 50 9 Q80 9 80 38 L82 80 Z" fill="' + hair + '"/>' : '') +
      '<path d="M12 100 Q13 76 38 76 L62 76 Q87 76 88 100 Z" fill="' + (mom ? '#E07A5F' : '#5C6BC0') + '"/>' +
      '<rect x="41" y="67" width="18" height="18" rx="8" fill="#E8AF8D"/>' +
      '<circle cx="25" cy="47" r="7" fill="#F2C3A5"/><circle cx="75" cy="47" r="7" fill="#F2C3A5"/>' +
      '<ellipse cx="50" cy="45" rx="26" ry="32" fill="#F2C3A5"/>' +
      (mom ? '<path d="M23 39 Q20 9 50 9 Q79 9 78 38 Q60 34 45 22 Q36 35 23 39" fill="' + hair + '"/>' :
        '<path d="M24 38 Q17 17 35 13 Q49 2 68 16 Q83 19 77 37 L69 28 Q47 32 32 25 L30 38 Z" fill="' + hair + '"/>') +
      eyes(39, 61, 45, 3.5) + cheeks(32, 68, 56, 4.5) +
      '<path class="k-mouth" d="M39 61 Q50 73 61 61" fill="#A64F58" stroke="#A64F58" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
  }

  window.KL_ART = { koala: koala, animal: animal, face: face, parent: parent, silhouette: silhouette, ANIMALS: ANIMALS };
})();
