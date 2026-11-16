/* Drawings for Krakkaleikir: Kóli the koala (the guide) and his wardrobe, the
   animal faces (counting, memory cards, the zoo) and everyday things (words,
   memory, letters). Plain SVG strings, no images. */
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

  // Kóli: ears, head, big nose; .k-mouth moves while he talks (CSS), .k-eyes blink.
  // .k-sleep-eyes (closed) stay hidden unless CSS shows them while he dozes.
  function koalaInner() {
    return '' +
      '<g class="k-ear k-ear-l"><circle cx="24" cy="40" r="22" fill="#97A3AD"/><circle cx="24" cy="40" r="13" fill="#F3C1CB"/></g>' +
      '<g class="k-ear k-ear-r"><circle cx="96" cy="40" r="22" fill="#97A3AD"/><circle cx="96" cy="40" r="13" fill="#F3C1CB"/></g>' +
      '<ellipse cx="60" cy="68" rx="41" ry="38" fill="#AEB8C1"/>' +
      '<ellipse cx="60" cy="88" rx="23" ry="15" fill="#DCE2E6"/>' +
      cheeks(33, 87, 78, 6.5) +
      eyes(43, 77, 58, 5.5) +
      '<g class="k-sleep-eyes" display="none" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round">' +
        '<path d="M36.5 57 Q43 63.5 49.5 57"/><path d="M70.5 57 Q77 63.5 83.5 57"/></g>' +
      '<ellipse cx="60" cy="71" rx="10.5" ry="13" fill="#3D405B"/>' +
      '<ellipse cx="56.5" cy="66" rx="3" ry="4.2" fill="#62668A"/>' +
      '<ellipse class="k-mouth" cx="60" cy="92" rx="6.5" ry="3.2" fill="#8C3B4A"/>';
  }
  // outfit: optional { slot: itemId } from the wardrobe, drawn on top of Kóli
  function koala(size, cls, outfit) {
    size = size || 80;
    return '<svg class="koala-svg' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 120 120" aria-hidden="true">' + koalaInner() + outfitSVG(outfit) + '</svg>';
  }

  /* ---- Kóli's wardrobe: things to wear, in his 120x120 coordinates ----
     One item per slot. Head top is y=30 (ears reach y=18), eyes at y=58,
     nose ends at y=84, mouth at y=92, chin at y=106. */
  var SLOTS = ['head', 'eyes', 'mouth', 'neck'];
  function heart(cx, cy, s, fill) {
    return '<path d="M' + cx + ' ' + (cy + 9 * s) + ' C' + (cx - 14 * s) + ' ' + (cy - 1 * s) + ' ' + (cx - 10 * s) + ' ' + (cy - 11 * s) + ' ' + cx + ' ' + (cy - 4 * s) +
      ' C' + (cx + 10 * s) + ' ' + (cy - 11 * s) + ' ' + (cx + 14 * s) + ' ' + (cy - 1 * s) + ' ' + cx + ' ' + (cy + 9 * s) + ' Z" fill="' + fill + '" stroke="#AD1457" stroke-width="2" stroke-linejoin="round"/>';
  }
  var OUTFIT = {
    partyhat: { box: '36 -3 48 48', slot: 'head', svg: '<g transform="rotate(12 60 34)"><path d="M60 5 L77 35 Q60 40 43 35 Z" fill="#5C6BC0"/>' +
      '<circle cx="57" cy="22" r="3" fill="#FFC93C"/><circle cx="64" cy="29" r="3" fill="#F48FB1"/><circle cx="53" cy="31" r="3" fill="#57A773"/><circle cx="61" cy="15" r="2.5" fill="#F48FB1"/>' +
      '<circle cx="60" cy="6" r="5.5" fill="#FFC93C"/></g>' },
    crown: { box: '31 -7 58 58', slot: 'head', svg: '<path d="M37 35 L35 11 L48 24 L60 7 L72 24 L85 11 L83 35 Z" fill="#FFC93C" stroke="#D49A00" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="48" cy="29" r="3.5" fill="#E53935"/><circle cx="60" cy="27" r="4" fill="#1E88E5"/><circle cx="72" cy="29" r="3.5" fill="#43A047"/>' +
      '<circle cx="35" cy="11" r="3" fill="#FFE082"/><circle cx="60" cy="7" r="3" fill="#FFE082"/><circle cx="85" cy="11" r="3" fill="#FFE082"/>' },
    wizard: { box: '26 -14 68 68', slot: 'head', svg: '<path d="M41 33 Q50 20 54 4 Q58 0 61 5 Q68 20 79 33 Z" fill="#7E57C2"/>' +
      '<ellipse cx="60" cy="34" rx="32" ry="6" fill="#5E35B1"/>' +
      '<path d="M57 17 l1.5 3.5 3.8.3-2.9 2.4.9 3.7-3.3-2-3.3 2 .9-3.7-2.9-2.4 3.8-.3z" fill="#FFC93C"/>' +
      '<circle cx="66" cy="26" r="2" fill="#FFE082"/><circle cx="50" cy="28" r="1.6" fill="#FFE082"/>' },
    flower: { box: '66 7 36 36', slot: 'head', svg: '<g transform="translate(84 25)">' +
      [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="0" cy="-9" rx="6" ry="8" fill="#F48FB1" transform="rotate(' + a + ')"/>'; }).join('') +
      '<circle r="5.5" fill="#FFC93C"/></g>' },
    sunglasses: { box: '15 28 90 60', slot: 'eyes', svg: '<path d="M30 56 L18 52 M90 56 L102 52" stroke="#2E3142" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="28" y="49" width="29" height="18" rx="7" fill="#2E3142"/><rect x="63" y="49" width="29" height="18" rx="7" fill="#2E3142"/>' +
      '<path d="M56 54 Q60 50 64 54" fill="none" stroke="#2E3142" stroke-width="3"/>' +
      '<path d="M33 54 L40 54 M68 54 L75 54" stroke="#9FA8DA" stroke-width="2.5" stroke-linecap="round"/>' },
    hearts: { box: '15 28 90 60', slot: 'eyes', svg: '<path d="M30 56 L18 52 M90 56 L102 52" stroke="#AD1457" stroke-width="3" stroke-linecap="round"/>' +
      heart(43, 58, 1.25, 'rgba(236,64,122,.85)') + heart(77, 58, 1.25, 'rgba(236,64,122,.85)') +
      '<path d="M55 55 Q60 51 65 55" fill="none" stroke="#AD1457" stroke-width="3"/>' },
    moustache: { box: '27 54 66 66', slot: 'mouth', svg: '<path d="M60 84 C55 79 45 78 37 84 C33 87 30 85 29 82 C29 90 38 93 47 90 C53 88 57 87 60 86 C63 87 67 88 73 90 C82 93 91 90 91 82 C90 85 87 87 83 84 C75 78 65 79 60 84 Z" fill="#6D4C41"/>' },
    bowtie: { box: '37 83 46 46', slot: 'neck', svg: '<path d="M60 106 L42 96 Q38 106 42 116 Z M60 106 L78 96 Q82 106 78 116 Z" fill="#E53935" stroke="#B71C1C" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="55" y="101" width="10" height="10" rx="3" fill="#C62828"/>' +
      '<circle cx="47" cy="102" r="1.8" fill="#fff"/><circle cx="46" cy="110" r="1.8" fill="#fff"/><circle cx="73" cy="102" r="1.8" fill="#fff"/><circle cx="74" cy="110" r="1.8" fill="#fff"/>' },
    scarf: { box: '21 70 78 56', slot: 'neck', svg: '<path d="M70 104 L84 104 L86 120 L72 120 Z" fill="#26A69A"/>' +
      '<path d="M24 97 Q60 115 96 97 L97 107 Q60 125 23 107 Z" fill="#26A69A"/>' +
      '<path d="M36 104 Q38 110 36 115 M48 108 Q50 114 48 119 M72 108 Q70 114 72 119 M84 104 Q82 110 84 115" stroke="#FFC93C" stroke-width="3.5" fill="none"/>' },
    medal: { box: '43 90 34 34', slot: 'neck', svg: '<path d="M45 96 L56 110 L60 106 L52 94 Z M75 96 L64 110 L60 106 L68 94 Z" fill="#E53935"/>' +
      '<path d="M52 94 L60 106 L68 94" fill="none" stroke="#1E88E5" stroke-width="3"/>' +
      '<circle cx="60" cy="111" r="8" fill="#FFC93C" stroke="#D49A00" stroke-width="2"/>' +
      '<path d="M60 106.5 l1.4 2.9 3.2.4-2.3 2.2.6 3.1-2.9-1.6-2.9 1.6.6-3.1-2.3-2.2 3.2-.4z" fill="#FFF3C4"/>' }
  };
  var OUTFIT_IDS = Object.keys(OUTFIT);
  function outfitSVG(outfit) {
    if (!outfit) return '';
    return '<g class="k-outfit">' + SLOTS.map(function (slot) {
      var item = OUTFIT[outfit[slot]];
      return item && item.slot === slot ? item.svg : '';
    }).join('') + '</g>';
  }
  // one item on its own, cropped to it (box: its part of the 120x120 drawing)
  function outfitIcon(id, size) {
    var item = OUTFIT[id];
    size = size || 64;
    return '<svg width="' + size + '" height="' + size + '" viewBox="' + item.box + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + item.svg + '</svg>';
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
    },
    hundur: function () {
      return '<ellipse cx="50" cy="55" rx="32" ry="33" fill="#D7A86E"/>' +
        '<ellipse cx="62" cy="47" rx="11" ry="10" fill="#B07A45"/>' +
        '<ellipse cx="50" cy="71" rx="18" ry="14" fill="#F3DDB8"/>' +
        '<ellipse cx="19" cy="48" rx="11" ry="24" fill="#8D5A34" transform="rotate(18 19 48)"/>' +
        '<ellipse cx="81" cy="48" rx="11" ry="24" fill="#8D5A34" transform="rotate(-18 81 48)"/>' +
        eyes(38, 62, 49, 5) +
        '<ellipse cx="50" cy="63" rx="7.5" ry="5.5" fill="' + INK + '"/>' +
        '<path d="M46 76 Q50 89 54 76 Z" fill="#EF5350"/>' +
        '<path d="M50 68 L50 74 M42 74 Q50 80 58 74" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    },
    kyr: function () {
      return '<path d="M31 27 Q21 15 27 6 Q31 17 39 22 Z" fill="#FFF3D6" stroke="#BCAAA4" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M69 27 Q79 15 73 6 Q69 17 61 22 Z" fill="#FFF3D6" stroke="#BCAAA4" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<ellipse cx="14" cy="40" rx="13" ry="6.5" fill="#fff" stroke="#CFD8DC" stroke-width="1.5" transform="rotate(-20 14 40)"/>' +
        '<ellipse cx="86" cy="40" rx="13" ry="6.5" fill="#fff" stroke="#CFD8DC" stroke-width="1.5" transform="rotate(20 86 40)"/>' +
        '<ellipse cx="50" cy="50" rx="30" ry="33" fill="#fff" stroke="#CFD8DC" stroke-width="2"/>' +
        '<path d="M27 32 Q38 20 47 29 Q47 43 35 44 Q24 41 27 32 Z" fill="' + INK + '"/>' +
        '<path d="M66 50 Q76 44 79 54 Q76 62 68 60 Z" fill="' + INK + '"/>' +
        '<g class="k-eyes"><circle cx="38" cy="52" r="5.5" fill="#fff"/><circle cx="38" cy="52" r="4" fill="' + INK + '"/><circle cx="62" cy="52" r="4" fill="' + INK + '"/></g>' +
        '<ellipse cx="50" cy="75" rx="25" ry="15" fill="#F8BBD0"/>' +
        '<ellipse cx="41" cy="74" rx="3.5" ry="4.5" fill="#C2185B"/><ellipse cx="59" cy="74" rx="3.5" ry="4.5" fill="#C2185B"/>' +
        '<path d="M43 83 Q50 87 57 83" stroke="#C2185B" stroke-width="2" fill="none" stroke-linecap="round"/>';
    },
    kind: function () {
      var wool = '';
      for (var i = 0; i < 10; i++) {
        var a = i * Math.PI / 5;
        wool += '<circle cx="' + (50 + 31 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 30 * Math.sin(a)).toFixed(1) + '" r="13" fill="#FAFAFA" stroke="#E0E0E0" stroke-width="1.5"/>';
      }
      return wool + '<circle cx="50" cy="50" r="30" fill="#FAFAFA"/>' +
        '<ellipse cx="22" cy="52" rx="11" ry="5.5" fill="#6D5E58" transform="rotate(25 22 52)"/>' +
        '<ellipse cx="78" cy="52" rx="11" ry="5.5" fill="#6D5E58" transform="rotate(-25 78 52)"/>' +
        '<ellipse cx="50" cy="60" rx="18" ry="24" fill="#6D5E58"/>' +
        '<circle cx="40" cy="33" r="9" fill="#fff"/><circle cx="50" cy="29" r="10" fill="#fff"/><circle cx="60" cy="33" r="9" fill="#fff"/>' +
        '<circle cx="42" cy="55" r="5.5" fill="#fff"/><circle cx="58" cy="55" r="5.5" fill="#fff"/>' +
        eyes(42, 58, 56, 3.6) +
        '<path d="M45 72 Q50 77 55 72" stroke="#F8BBD0" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M47 67 L53 67 L50 70 Z" fill="#F8BBD0"/>';
    },
    hestur: function () {
      return '<path d="M30 22 L34 4 L44 18 Z" fill="#8D6E63" stroke="#8D6E63" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M70 22 L66 4 L56 18 Z" fill="#8D6E63" stroke="#8D6E63" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="52" rx="27" ry="40" fill="#8D6E63"/>' +
        '<path d="M47 28 L53 28 L56 62 L44 62 Z" fill="#FFF8EE"/>' +
        '<path d="M37 18 Q50 4 63 18 Q58 30 50 25 Q42 31 37 18 Z" fill="#4E342E"/>' +
        '<ellipse cx="50" cy="78" rx="21" ry="15" fill="#BCAAA4"/>' +
        eyes(35, 65, 45, 5) +
        '<ellipse cx="42" cy="77" rx="3" ry="4.5" fill="#5D4037"/><ellipse cx="58" cy="77" rx="3" ry="4.5" fill="#5D4037"/>' +
        '<path d="M43 86 Q50 90 57 86" stroke="#5D4037" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    },
    ond: function () {
      return '<path d="M44 16 Q46 6 54 10 Q50 14 52 20 Z" fill="#fff" stroke="#CFD8DC" stroke-width="1.5"/>' +
        '<ellipse cx="17" cy="62" rx="9" ry="15" fill="#ECEFF1" transform="rotate(22 17 62)"/>' +
        '<ellipse cx="83" cy="62" rx="9" ry="15" fill="#ECEFF1" transform="rotate(-22 83 62)"/>' +
        '<circle cx="50" cy="54" r="34" fill="#fff" stroke="#CFD8DC" stroke-width="2"/>' +
        eyes(37, 63, 46, 5) +
        '<path d="M28 66 Q50 54 72 66 Q72 76 50 78 Q28 76 28 66 Z" fill="#FB8C00"/>' +
        '<path d="M31 67 Q50 70 69 67" stroke="#E65100" stroke-width="2" fill="none"/>' +
        '<circle cx="44" cy="62" r="1.6" fill="#E65100"/><circle cx="56" cy="62" r="1.6" fill="#E65100"/>' +
        cheeks(25, 75, 56, 4.5);
    },
    fill: function () {
      return '<ellipse cx="19" cy="46" rx="19" ry="27" fill="#90A4AE"/><ellipse cx="21" cy="46" rx="11" ry="18" fill="#F8BBD0"/>' +
        '<ellipse cx="81" cy="46" rx="19" ry="27" fill="#90A4AE"/><ellipse cx="79" cy="46" rx="11" ry="18" fill="#F8BBD0"/>' +
        '<ellipse cx="50" cy="44" rx="28" ry="29" fill="#B0BEC5"/>' +
        '<path d="M41 56 Q38 80 45 92 Q50 97 56 92 L58 87 Q51 86 52 76 Q53 64 59 56 Z" fill="#B0BEC5"/>' +
        '<path d="M43 68 Q48 70 54 68 M43 77 Q48 79 53 77" stroke="#78909C" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M37 62 Q33 70 37 75 M63 62 Q67 70 63 75" stroke="#FFF8EE" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        eyes(38, 62, 42, 4.5) +
        cheeks(31, 69, 53, 4.5);
    },
    api: function () {
      return '<circle cx="16" cy="50" r="12" fill="#795548"/><circle cx="16" cy="50" r="7" fill="#FFCC80"/>' +
        '<circle cx="84" cy="50" r="12" fill="#795548"/><circle cx="84" cy="50" r="7" fill="#FFCC80"/>' +
        '<circle cx="50" cy="52" r="35" fill="#795548"/>' +
        '<path d="M50 24 Q46 16 52 12 M50 24 Q55 17 60 18" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="39" cy="47" r="13" fill="#FFCC80"/><circle cx="61" cy="47" r="13" fill="#FFCC80"/>' +
        '<ellipse cx="50" cy="66" rx="23" ry="17" fill="#FFCC80"/>' +
        eyes(40, 60, 47, 4.5) +
        '<circle cx="46" cy="60" r="1.8" fill="#5D4037"/><circle cx="54" cy="60" r="1.8" fill="#5D4037"/>' +
        '<path d="M38 68 Q50 81 62 68" stroke="#5D4037" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    },
    byfluga: function () {
      return '<ellipse cx="28" cy="25" rx="16" ry="11" fill="#E3F2FD" stroke="#90CAF9" stroke-width="2" transform="rotate(-25 28 25)"/>' +
        '<ellipse cx="72" cy="25" rx="16" ry="11" fill="#E3F2FD" stroke="#90CAF9" stroke-width="2" transform="rotate(25 72 25)"/>' +
        '<path d="M42 26 Q38 12 30 10 M58 26 Q62 12 70 10" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="30" cy="10" r="3.5" fill="' + INK + '"/><circle cx="70" cy="10" r="3.5" fill="' + INK + '"/>' +
        '<circle cx="50" cy="56" r="33" fill="#FFCA28"/>' +
        '<path d="M22 66 Q50 76 78 66" stroke="' + INK + '" stroke-width="8" fill="none"/>' +
        '<path d="M29 80 Q50 89 71 80" stroke="' + INK + '" stroke-width="7" fill="none"/>' +
        eyes(39, 61, 46, 5) +
        '<path d="M43 55 Q50 61 57 55" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        cheeks(29, 71, 54, 4.5);
    }
  };
  // the zoo: 20 animals in five areas, in sticker-book order
  var ZOO = [
    { id: 'farm', animals: ['kyr', 'kind', 'hestur', 'svin', 'hundur', 'ungi'] },
    { id: 'forest', animals: ['koala', 'ugla', 'api', 'bjorn'] },
    { id: 'water', animals: ['froskur', 'ond', 'fiskur', 'morgaes'] },
    { id: 'savanna', animals: ['ljon', 'fill'] },
    { id: 'garden', animals: ['kottur', 'mus', 'mariuhaena', 'byfluga'] }
  ];
  var ANIMALS = ['koala', 'froskur', 'ungi', 'kottur', 'svin', 'bjorn', 'fiskur', 'mariuhaena', 'ugla', 'mus', 'ljon', 'morgaes',
    'hundur', 'kyr', 'kind', 'hestur', 'ond', 'fill', 'api', 'byfluga'];

  /* ---- things (not animals) for the word-picture, memory and letter games ---- */
  var THING = {
    bolti: '<circle cx="50" cy="52" r="36" fill="#E53935"/>' +
      '<path d="M50 16 Q28 52 50 88" stroke="#fff" stroke-width="9" fill="none"/><path d="M50 16 Q72 52 50 88" stroke="#FFCA28" stroke-width="9" fill="none"/>' +
      '<path d="M15 46 Q50 60 85 46" stroke="#1E88E5" stroke-width="7" fill="none"/>' +
      '<circle cx="36" cy="32" r="6" fill="#fff" opacity=".6"/>',
    bill: '<path d="M8 66 L12 50 Q14 44 22 44 L32 44 L42 28 Q45 24 52 24 L70 24 Q76 24 80 30 L88 44 Q94 46 94 54 L94 66 Z" fill="#E53935"/>' +
      '<path d="M46 30 L52 29 L52 44 L37 44 Z M57 29 L68 29 Q72 29 75 33 L82 44 L57 44 Z" fill="#BBDEFB"/>' +
      '<circle cx="28" cy="68" r="11" fill="' + INK + '"/><circle cx="28" cy="68" r="4.5" fill="#B0BEC5"/>' +
      '<circle cx="74" cy="68" r="11" fill="' + INK + '"/><circle cx="74" cy="68" r="4.5" fill="#B0BEC5"/>' +
      '<rect x="88" y="50" width="6" height="5" rx="2" fill="#FFEB3B"/>',
    hus: '<rect x="20" y="46" width="60" height="44" fill="#FFE0B2"/>' +
      '<path d="M12 50 L50 14 L88 50 Z" fill="#E53935" stroke="#C62828" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="64" y="20" width="9" height="18" fill="#8D6E63"/>' +
      '<rect x="42" y="62" width="16" height="28" rx="2" fill="#8D6E63"/><circle cx="54" cy="77" r="1.8" fill="#FFCA28"/>' +
      '<rect x="26" y="56" width="12" height="12" fill="#81D4FA" stroke="#fff" stroke-width="2"/><rect x="62" y="56" width="12" height="12" fill="#81D4FA" stroke="#fff" stroke-width="2"/>',
    sol: (function () {
      var r = '';
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        r += '<path d="M' + (50 + 28 * Math.cos(a)).toFixed(1) + ' ' + (50 + 28 * Math.sin(a)).toFixed(1) + ' L' + (50 + 44 * Math.cos(a)).toFixed(1) + ' ' + (50 + 44 * Math.sin(a)).toFixed(1) + '" stroke="#FFB300" stroke-width="5" stroke-linecap="round"/>';
      }
      return r + '<circle cx="50" cy="50" r="25" fill="#FFCA28"/>' + eyes(42, 58, 47, 3.2) +
        '<path d="M42 56 Q50 63 58 56" stroke="#E65100" stroke-width="2.4" fill="none" stroke-linecap="round"/>' + cheeks(36, 64, 55, 3.5);
    })(),
    epli: '<path d="M50 28 C38 18 16 22 16 48 C16 72 32 90 42 90 C46 90 48 87 50 87 C52 87 54 90 58 90 C68 90 84 72 84 48 C84 22 62 18 50 28 Z" fill="#E53935"/>' +
      '<path d="M50 30 Q49 18 54 10" stroke="#6D4C41" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 18 Q66 8 76 14 Q66 24 54 18 Z" fill="#66BB6A"/>' +
      '<ellipse cx="32" cy="44" rx="5" ry="9" fill="#fff" opacity=".45" transform="rotate(20 32 44)"/>',
    banani: '<path d="M18 28 Q14 70 52 84 Q78 90 90 72 Q86 70 82 72 Q56 78 40 58 Q30 44 30 26 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M18 28 L20 18 L30 20 L30 26 Z" fill="#6D4C41"/>' +
      '<path d="M26 40 Q30 64 54 76" stroke="#F9A825" stroke-width="2" fill="none"/>',
    tre: '<rect x="43" y="56" width="14" height="36" rx="3" fill="#8D6E63"/>' +
      '<circle cx="50" cy="38" r="26" fill="#66BB6A"/><circle cx="30" cy="50" r="17" fill="#66BB6A"/><circle cx="70" cy="50" r="17" fill="#66BB6A"/>' +
      '<circle cx="40" cy="30" r="5" fill="#E53935"/><circle cx="62" cy="42" r="5" fill="#E53935"/><circle cx="34" cy="54" r="5" fill="#E53935"/>',
    blom: '<path d="M50 52 Q48 74 50 94" stroke="#43A047" stroke-width="5" fill="none"/>' +
      '<path d="M50 78 Q34 66 28 74 Q38 84 50 80 Z" fill="#66BB6A"/>' +
      [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="50" cy="16" rx="11" ry="15" fill="#BA68C8" transform="rotate(' + a + ' 50 36)"/>'; }).join('') +
      '<circle cx="50" cy="36" r="10" fill="#FFCA28"/>',
    batur: '<path d="M50 12 L50 64" stroke="#6D4C41" stroke-width="4"/>' +
      '<path d="M53 14 L80 58 L53 58 Z" fill="#fff" stroke="#B0BEC5" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M47 22 L26 58 L47 58 Z" fill="#FFCA28"/>' +
      '<path d="M10 64 L90 64 L78 82 L22 82 Z" fill="#1E88E5"/>' +
      '<path d="M6 90 Q16 84 26 90 Q36 96 46 90 Q56 84 66 90 Q76 96 86 90 Q92 86 96 88" stroke="#4FC3F7" stroke-width="4" fill="none" stroke-linecap="round"/>',
    kaka: '<rect x="18" y="52" width="64" height="36" rx="6" fill="#F8BBD0"/>' +
      '<rect x="18" y="68" width="64" height="7" fill="#EC407A"/>' +
      '<path d="M18 58 Q18 50 26 50 L74 50 Q82 50 82 58 Q76 64 70 58 Q64 64 58 58 Q52 64 46 58 Q40 64 34 58 Q28 64 22 58 Z" fill="#fff"/>' +
      '<rect x="46" y="28" width="8" height="22" rx="2" fill="#5C6BC0"/>' +
      '<path d="M50 12 Q57 20 50 26 Q43 20 50 12 Z" fill="#FFB300"/>' +
      '<rect x="12" y="86" width="76" height="6" rx="3" fill="#CFD8DC"/>',
    lykill: '<circle cx="30" cy="50" r="18" fill="#FFCA28" stroke="#D49A00" stroke-width="3"/><circle cx="30" cy="50" r="7" fill="#FFF8EE"/>' +
      '<rect x="46" y="45" width="44" height="10" rx="3" fill="#FFCA28" stroke="#D49A00" stroke-width="2.5"/>' +
      '<rect x="72" y="54" width="7" height="14" fill="#FFCA28" stroke="#D49A00" stroke-width="2.5"/><rect x="83" y="54" width="7" height="10" fill="#FFCA28" stroke="#D49A00" stroke-width="2.5"/>',
    skor: '<path d="M10 70 L12 40 Q14 34 22 36 L40 42 Q48 46 56 52 L80 58 Q92 62 92 72 L92 76 L10 76 Z" fill="#1E88E5"/>' +
      '<path d="M10 76 L92 76 Q92 84 84 84 L14 84 Q10 84 10 76 Z" fill="#fff" stroke="#B0BEC5" stroke-width="2"/>' +
      '<path d="M30 44 L38 52 M38 46 L46 54 M46 50 L52 56" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M60 62 Q72 60 82 66" stroke="#FFCA28" stroke-width="4" fill="none" stroke-linecap="round"/>',
    regnhlif: '<path d="M10 50 Q50 0 90 50 Q83 44 76 50 Q70 44 63 50 Q57 44 50 50 Q43 44 37 50 Q30 44 24 50 Q17 44 10 50 Z" fill="#EC407A"/>' +
      '<path d="M50 14 Q44 30 37 50 M50 14 Q56 30 63 50" stroke="#AD1457" stroke-width="2" fill="none"/>' +
      '<path d="M50 50 L50 82 Q50 90 42 90 Q36 90 36 84" stroke="#5D4037" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 6 L50 14" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/>',
    bok: '<path d="M50 28 Q32 18 10 22 L10 78 Q32 74 50 84 Z" fill="#fff" stroke="#5C6BC0" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M50 28 Q68 18 90 22 L90 78 Q68 74 50 84 Z" fill="#fff" stroke="#5C6BC0" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M18 36 Q30 34 42 38 M18 46 Q30 44 42 48 M18 56 Q30 54 42 58 M58 38 Q70 34 82 36 M58 48 Q70 44 82 46 M58 58 Q70 54 82 56" stroke="#B0BEC5" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 28 L50 84" stroke="#5C6BC0" stroke-width="2"/>',
    flugvel: '<path d="M8 52 Q8 44 18 44 L78 44 Q94 46 94 52 Q94 58 78 60 L18 60 Q8 60 8 52 Z" fill="#ECEFF1" stroke="#90A4AE" stroke-width="2"/>' +
      '<path d="M40 46 L60 16 L70 16 L58 46 Z M40 58 L58 84 L68 84 L56 58 Z" fill="#1E88E5"/>' +
      '<path d="M12 46 L6 28 L16 28 L26 44 Z" fill="#E53935"/>' +
      '<circle cx="70" cy="51" r="3.2" fill="#4FC3F7"/><circle cx="60" cy="51" r="3.2" fill="#4FC3F7"/><circle cx="50" cy="51" r="3.2" fill="#4FC3F7"/><circle cx="80" cy="51" r="3.2" fill="#4FC3F7"/>',
    bladra: '<path d="M50 72 Q46 82 52 88 Q58 94 50 98" stroke="#78909C" stroke-width="2" fill="none"/>' +
      '<ellipse cx="50" cy="38" rx="27" ry="32" fill="#E53935"/>' +
      '<path d="M45 70 L55 70 L50 64 Z" fill="#C62828"/>' +
      '<ellipse cx="39" cy="26" rx="6" ry="10" fill="#fff" opacity=".45" transform="rotate(20 39 26)"/>',
    iskrem: '<path d="M30 46 L50 94 L70 46 Z" fill="#E0A458" stroke="#B5762C" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M36 52 L60 76 M44 48 L64 66 M56 48 L42 76 M64 52 L48 84" stroke="#B5762C" stroke-width="2"/>' +
      '<circle cx="50" cy="34" r="20" fill="#F8BBD0"/><circle cx="36" cy="44" r="10" fill="#F8BBD0"/><circle cx="64" cy="44" r="10" fill="#F8BBD0"/>' +
      '<circle cx="50" cy="14" r="6" fill="#E53935"/>' +
      '<path d="M42 28 l3 -2 M54 24 l3 2 M48 38 l3 -1 M58 34 l2 3" stroke="#5C6BC0" stroke-width="2.4" stroke-linecap="round"/>',
    gulrot: '<path d="M30 30 Q24 36 28 44 L70 94 Q74 96 74 90 L46 30 Q40 24 30 30 Z" fill="#FB8C00"/>' +
      '<path d="M38 44 L46 42 M44 56 L52 54 M52 68 L59 66" stroke="#E65100" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M36 30 Q28 12 18 10 Q26 20 30 30 Z M38 28 Q40 10 34 2 Q44 12 42 28 Z M40 30 Q52 16 62 16 Q52 26 44 32 Z" fill="#66BB6A"/>'
  };
  var WOOD = '#A1887F', WOOD_D = '#6D4C41';
  var MORE = {
    stoll: '<rect x="26" y="8" width="9" height="84" rx="3" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="2"/>' +
      '<rect x="32" y="16" width="5" height="34" fill="' + WOOD_D + '" opacity=".3"/>' +
      '<rect x="26" y="50" width="54" height="10" rx="3" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="2"/>' +
      '<rect x="70" y="58" width="9" height="34" rx="3" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="2"/>',
    bolli: '<ellipse cx="48" cy="90" rx="38" ry="6" fill="#CFD8DC"/>' +
      '<path d="M70 40 Q90 40 88 56 Q86 72 66 70" stroke="#5C6BC0" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M20 32 L76 32 L70 78 Q68 88 58 88 L38 88 Q28 88 26 78 Z" fill="#5C6BC0"/>' +
      '<path d="M30 46 L66 46" stroke="#fff" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/>' +
      '<path d="M38 22 Q32 14 38 6 M50 22 Q44 14 50 6 M62 22 Q56 14 62 6" stroke="#B0BEC5" stroke-width="3" fill="none" stroke-linecap="round"/>',
    skeid: '<path d="M46 46 L86 90" stroke="#B0BEC5" stroke-width="9" stroke-linecap="round"/>' +
      '<ellipse cx="32" cy="30" rx="15" ry="22" fill="#CFD8DC" stroke="#78909C" stroke-width="2.5" transform="rotate(-42 32 30)"/>' +
      '<ellipse cx="28" cy="26" rx="5" ry="9" fill="#fff" opacity=".7" transform="rotate(-42 28 26)"/>',
    sokkur: '<path d="M28 8 L58 8 L58 56 Q58 64 66 66 L80 68 Q94 70 94 82 Q94 94 80 94 L46 94 Q28 94 28 76 Z" fill="#EF5350"/>' +
      '<rect x="28" y="8" width="30" height="12" fill="#fff"/><rect x="28" y="30" width="30" height="6" fill="#fff"/><rect x="28" y="44" width="30" height="6" fill="#fff"/>' +
      '<path d="M28 78 Q28 94 46 94 L50 94 Q40 86 40 76 Z" fill="#C62828"/><path d="M84 70 Q94 72 94 82 Q94 92 84 94 Q88 82 84 70 Z" fill="#C62828"/>',
    hufa: '<path d="M14 70 Q14 26 50 24 Q86 26 86 70 Z" fill="#26A69A"/>' +
      '<path d="M30 30 L30 66 M50 25 L50 66 M70 30 L70 66" stroke="#00796B" stroke-width="3"/>' +
      '<rect x="10" y="64" width="80" height="18" rx="7" fill="#FFCA28"/>' +
      '<circle cx="50" cy="18" r="11" fill="#E53935"/>',
    vettlingur: '<path d="M40 82 L38 44 Q38 16 60 16 Q82 16 80 44 L78 82 Z" fill="#AB47BC"/>' +
      '<path d="M41 58 Q24 58 20 44 Q18 32 28 32 Q36 32 40 46 Z" fill="#AB47BC"/>' +
      '<rect x="34" y="78" width="50" height="16" rx="5" fill="#fff" stroke="#CE93D8" stroke-width="2"/>' +
      '<path d="M59 34 L59 54 M50 44 L68 44 M53 38 L65 50 M65 38 L53 50" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>',
    tannbursti: '<g transform="rotate(-32 50 50)">' +
      '<rect x="4" y="47" width="64" height="11" rx="5.5" fill="#42A5F5"/><rect x="12" y="49" width="20" height="3" rx="1.5" fill="#fff" opacity=".6"/>' +
      '<rect x="64" y="45" width="30" height="14" rx="4" fill="#90CAF9"/>' +
      '<path d="M67 45 L67 31 M72 45 L72 31 M77 45 L77 31 M82 45 L82 31 M87 45 L87 31 M92 45 L92 31" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>' +
      '<path d="M66 30 Q72 22 80 27 Q88 21 94 29" stroke="#4FC3F7" stroke-width="6" fill="none" stroke-linecap="round"/></g>',
    blyantur: '<g transform="rotate(-35 50 50)">' +
      '<rect x="14" y="41" width="58" height="18" fill="#FFCA28"/><rect x="14" y="47" width="58" height="6" fill="#FFB300"/>' +
      '<path d="M72 41 L94 50 L72 59 Z" fill="#F3D2A2"/><path d="M87 47 L94 50 L87 53 Z" fill="' + INK + '"/>' +
      '<rect x="4" y="41" width="10" height="18" rx="3" fill="#F48FB1"/><rect x="12" y="40" width="6" height="20" fill="#B0BEC5"/></g>',
    tromma: '<path d="M18 78 L18 40 L82 40 L82 78 Q50 92 18 78 Z" fill="#E53935"/>' +
      '<path d="M18 46 L34 74 L50 46 L66 74 L82 46" stroke="#FFCA28" stroke-width="4" fill="none" stroke-linejoin="round"/>' +
      '<ellipse cx="50" cy="40" rx="32" ry="10" fill="#FFF8EE" stroke="#BDBDBD" stroke-width="2"/>' +
      '<path d="M30 8 L52 36 M74 6 L56 34" stroke="#8D6E63" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="30" cy="8" r="5" fill="#FFF8EE"/><circle cx="74" cy="6" r="5" fill="#FFF8EE"/>',
    lest: '<circle cx="66" cy="16" r="6" fill="#ECEFF1"/><circle cx="76" cy="9" r="8" fill="#ECEFF1"/>' +
      '<rect x="54" y="20" width="12" height="20" fill="' + INK + '"/>' +
      '<rect x="10" y="38" width="66" height="34" rx="4" fill="#E53935"/>' +
      '<rect x="10" y="18" width="30" height="24" rx="3" fill="#C62828"/><rect x="16" y="23" width="18" height="13" rx="2" fill="#BBDEFB"/>' +
      '<path d="M76 54 L92 74 L76 74 Z" fill="#FFCA28"/><circle cx="72" cy="46" r="4" fill="#FFEB3B"/>' +
      '<circle cx="26" cy="76" r="10" fill="' + INK + '"/><circle cx="26" cy="76" r="4" fill="#B0BEC5"/>' +
      '<circle cx="56" cy="76" r="10" fill="' + INK + '"/><circle cx="56" cy="76" r="4" fill="#B0BEC5"/>',
    hjol: '<circle cx="24" cy="66" r="17" fill="none" stroke="' + INK + '" stroke-width="5"/><circle cx="78" cy="66" r="17" fill="none" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M24 66 L46 66 L66 38 L36 38 Z M46 66 L33 30 M66 38 L78 66" stroke="#E53935" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M26 28 L40 28" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M66 38 L62 24 L72 22" stroke="' + INK + '" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="46" cy="66" r="5" fill="#B0BEC5"/>',
    jardarber: '<path d="M50 94 Q16 68 18 42 Q22 26 50 30 Q78 26 82 42 Q84 68 50 94 Z" fill="#E53935"/>' +
      [[36, 46], [50, 44], [64, 46], [42, 60], [58, 60], [50, 74], [32, 56], [68, 56]].map(function (d) { return '<ellipse cx="' + d[0] + '" cy="' + d[1] + '" rx="1.8" ry="2.6" fill="#FFEB3B"/>'; }).join('') +
      '<path d="M50 34 L36 22 L46 26 L42 12 L50 22 L58 12 L54 26 L64 22 Z" fill="#43A047" stroke="#43A047" stroke-width="3" stroke-linejoin="round"/>',
    pera: '<path d="M50 20 Q40 20 40 36 Q40 46 30 58 Q16 76 30 88 Q40 96 50 96 Q60 96 70 88 Q84 76 70 58 Q60 46 60 36 Q60 20 50 20 Z" fill="#C0CA33"/>' +
      '<path d="M50 22 Q50 12 56 6" stroke="#6D4C41" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 14 Q66 6 74 14 Q64 20 54 14 Z" fill="#66BB6A"/>' +
      '<ellipse cx="38" cy="68" rx="5" ry="10" fill="#fff" opacity=".4" transform="rotate(20 38 68)"/>',
    egg: '<ellipse cx="50" cy="42" rx="24" ry="30" fill="#FFF8E1" stroke="#D7CCC8" stroke-width="2"/>' +
      '<ellipse cx="42" cy="32" rx="5" ry="9" fill="#fff" transform="rotate(20 42 32)"/>' +
      '<path d="M24 58 Q26 80 50 80 Q74 80 76 58 Z" fill="#42A5F5"/>' +
      '<rect x="40" y="78" width="20" height="8" fill="#42A5F5"/><rect x="30" y="84" width="40" height="8" rx="4" fill="#1E88E5"/>' +
      '<circle cx="40" cy="66" r="3" fill="#fff"/><circle cx="50" cy="70" r="3" fill="#fff"/><circle cx="60" cy="66" r="3" fill="#fff"/>',
    kerti: '<rect x="37" y="40" width="26" height="50" rx="3" fill="#F48FB1"/>' +
      '<path d="M37 46 Q42 54 46 46 L46 58 Q48 62 50 58 L50 44 Z" fill="#F8BBD0"/>' +
      '<rect x="30" y="88" width="40" height="7" rx="3.5" fill="#FFCA28"/>' +
      '<path d="M50 40 L50 33" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M50 8 Q62 24 50 34 Q38 24 50 8 Z" fill="#FFB300"/><path d="M50 18 Q56 27 50 32 Q44 27 50 18 Z" fill="#FFF176"/>',
    hamar: '<rect x="46" y="32" width="11" height="62" rx="5" fill="#A1887F" stroke="#6D4C41" stroke-width="2"/>' +
      '<path d="M30 16 L80 16 L80 36 L30 36 Z" fill="#78909C"/>' +
      '<path d="M30 16 Q12 16 6 30 L14 30 Q20 24 30 26 Z M30 36 Q14 36 8 30 L14 30 Q20 30 30 31 Z" fill="#78909C"/>' +
      '<rect x="78" y="14" width="8" height="24" rx="2" fill="#607D8B"/>',
    dreki: '<path d="M52 72 Q38 80 48 88 Q60 96 46 100" stroke="' + INK + '" stroke-width="2" fill="none"/>' +
      '<path d="M44 80 L38 76 L38 84 Z M53 90 L60 86 L60 94 Z" fill="#FFCA28"/>' +
      '<path d="M50 6 L78 36 L50 72 Z" fill="#EF5350"/><path d="M50 6 L22 36 L50 72 Z" fill="#42A5F5"/>' +
      '<path d="M22 36 L78 36" stroke="#fff" stroke-width="2"/>',
    rum: '<rect x="8" y="34" width="12" height="56" rx="3" fill="#8D6E63"/>' +
      '<rect x="84" y="54" width="10" height="36" rx="3" fill="#8D6E63"/>' +
      '<rect x="16" y="58" width="72" height="16" rx="3" fill="#fff" stroke="#CFD8DC" stroke-width="2"/>' +
      '<ellipse cx="32" cy="54" rx="13" ry="8" fill="#fff" stroke="#CFD8DC" stroke-width="2"/>' +
      '<path d="M44 50 L86 50 Q90 50 90 56 L90 76 L44 76 Z" fill="#5C6BC0"/><path d="M44 58 L90 58" stroke="#9FA8DA" stroke-width="3"/>'
  };
  Object.keys(MORE).forEach(function (id) { THING[id] = MORE[id]; });
  var THINGS = Object.keys(THING);

  function animal(id, size) {
    size = size || 64;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' + FACES[id]() + '</svg>';
  }
  // any picture: an animal or a thing
  function isThing(id) { return Object.prototype.hasOwnProperty.call(THING, id); }
  function picture(id, size) {
    if (!isThing(id)) return animal(id, size);
    size = size || 64;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true">' + THING[id] + '</svg>';
  }
  // the string key of a picture's name ('animal.ljon', 'thing.bolti'), also its audio key
  function nameKey(id) { return (isThing(id) ? 'thing.' : 'animal.') + id; }

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

  window.KL_ART = {
    koala: koala, animal: animal, face: face, parent: parent, silhouette: silhouette, ANIMALS: ANIMALS, ZOO: ZOO,
    THINGS: THINGS, PICTURES: ANIMALS.concat(THINGS), picture: picture, nameKey: nameKey, isThing: isThing,
    OUTFIT: OUTFIT, OUTFIT_IDS: OUTFIT_IDS, outfitSlot: function (id) { return OUTFIT[id] ? OUTFIT[id].slot : null; }, outfitIcon: outfitIcon
  };
})();
