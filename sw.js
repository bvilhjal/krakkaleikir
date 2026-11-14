/* Offline support for Krakkaleikir: on install, cache every file the app uses
   (the list below, about 2.5 MB), then serve from that cache. A change to any
   file changes VERSION, so the browser installs a fresh copy and drops the old one.
   The generated block is written by `node tools/check.js --write`. */
'use strict';

// BEGIN GENERATED (node tools/check.js --write)
var VERSION = '50cd8eb7ae5a';
var FILES = [
  './',
  'audio/da/bokstafir.q.mp3',
  'audio/da/color.appels%C3%ADnugulur.mp3',
  'audio/da/color.bleikur.mp3',
  'audio/da/color.bl%C3%A1r.mp3',
  'audio/da/color.br%C3%BAnn.mp3',
  'audio/da/color.fj%C3%B3lubl%C3%A1r.mp3',
  'audio/da/color.gr%C3%A1r.mp3',
  'audio/da/color.gr%C3%A6nn.mp3',
  'audio/da/color.gulur.mp3',
  'audio/da/color.rau%C3%B0ur.mp3',
  'audio/da/color.svartur.mp3',
  'audio/da/end.title.mp3',
  'audio/da/form.q.mp3',
  'audio/da/half.1.mp3',
  'audio/da/half.10.mp3',
  'audio/da/half.11.mp3',
  'audio/da/half.12.mp3',
  'audio/da/half.2.mp3',
  'audio/da/half.3.mp3',
  'audio/da/half.4.mp3',
  'audio/da/half.5.mp3',
  'audio/da/half.6.mp3',
  'audio/da/half.7.mp3',
  'audio/da/half.8.mp3',
  'audio/da/half.9.mp3',
  'audio/da/hour.1.mp3',
  'audio/da/hour.10.mp3',
  'audio/da/hour.11.mp3',
  'audio/da/hour.12.mp3',
  'audio/da/hour.2.mp3',
  'audio/da/hour.3.mp3',
  'audio/da/hour.4.mp3',
  'audio/da/hour.5.mp3',
  'audio/da/hour.6.mp3',
  'audio/da/hour.7.mp3',
  'audio/da/hour.8.mp3',
  'audio/da/hour.9.mp3',
  'audio/da/klukkan.clock_is_a.mp3',
  'audio/da/klukkan.pick_b.mp3',
  'audio/da/klukkan.read_q.mp3',
  'audio/da/klukkan.set_a.mp3',
  'audio/da/klukkan.set_b.mp3',
  'audio/da/litir.q.mp3',
  'audio/da/minni.end_title.mp3',
  'audio/da/minni.start.mp3',
  'audio/da/num.1.mp3',
  'audio/da/num.10.mp3',
  'audio/da/num.11.mp3',
  'audio/da/num.12.mp3',
  'audio/da/num.2.mp3',
  'audio/da/num.3.mp3',
  'audio/da/num.4.mp3',
  'audio/da/num.5.mp3',
  'audio/da/num.6.mp3',
  'audio/da/num.7.mp3',
  'audio/da/num.8.mp3',
  'audio/da/num.9.mp3',
  'audio/da/praise.0.mp3',
  'audio/da/praise.1.mp3',
  'audio/da/praise.2.mp3',
  'audio/da/praise.3.mp3',
  'audio/da/praise.4.mp3',
  'audio/da/praise.5.mp3',
  'audio/da/shape.ferningur.mp3',
  'audio/da/shape.hjarta.mp3',
  'audio/da/shape.hringur.mp3',
  'audio/da/shape.r%C3%A9tthyrningur.mp3',
  'audio/da/shape.stjarna.mp3',
  'audio/da/shape.%C3%BEr%C3%ADhyrningur.mp3',
  'audio/da/syl.ba.mp3',
  'audio/da/syl.be.mp3',
  'audio/da/syl.bi.mp3',
  'audio/da/syl.bo.mp3',
  'audio/da/syl.bu.mp3',
  'audio/da/syl.da.mp3',
  'audio/da/syl.de.mp3',
  'audio/da/syl.di.mp3',
  'audio/da/syl.du.mp3',
  'audio/da/syl.ga.mp3',
  'audio/da/syl.ha.mp3',
  'audio/da/syl.ka.mp3',
  'audio/da/syl.la.mp3',
  'audio/da/syl.le.mp3',
  'audio/da/syl.ma.mp3',
  'audio/da/syl.me.mp3',
  'audio/da/syl.mi.mp3',
  'audio/da/syl.na.mp3',
  'audio/da/syl.ne.mp3',
  'audio/da/syl.ra.mp3',
  'audio/da/syl.sa.mp3',
  'audio/da/syl.ta.mp3',
  'audio/da/syl.va.mp3',
  'audio/da/tolur.add_q.mp3',
  'audio/da/tolur.count_q.mp3',
  'audio/da/tolur.minus.mp3',
  'audio/da/tolur.plus.mp3',
  'audio/da/try_again.mp3',
  'audio/is/bokstafir.q.mp3',
  'audio/is/color.appels%C3%ADnugulur.mp3',
  'audio/is/color.bleikur.mp3',
  'audio/is/color.bl%C3%A1r.mp3',
  'audio/is/color.br%C3%BAnn.mp3',
  'audio/is/color.fj%C3%B3lubl%C3%A1r.mp3',
  'audio/is/color.gr%C3%A1r.mp3',
  'audio/is/color.gr%C3%A6nn.mp3',
  'audio/is/color.gulur.mp3',
  'audio/is/color.rau%C3%B0ur.mp3',
  'audio/is/color.svartur.mp3',
  'audio/is/end.title.mp3',
  'audio/is/form.q.mp3',
  'audio/is/half.1.mp3',
  'audio/is/half.10.mp3',
  'audio/is/half.11.mp3',
  'audio/is/half.12.mp3',
  'audio/is/half.2.mp3',
  'audio/is/half.3.mp3',
  'audio/is/half.4.mp3',
  'audio/is/half.5.mp3',
  'audio/is/half.6.mp3',
  'audio/is/half.7.mp3',
  'audio/is/half.8.mp3',
  'audio/is/half.9.mp3',
  'audio/is/hour.1.mp3',
  'audio/is/hour.10.mp3',
  'audio/is/hour.11.mp3',
  'audio/is/hour.12.mp3',
  'audio/is/hour.2.mp3',
  'audio/is/hour.3.mp3',
  'audio/is/hour.4.mp3',
  'audio/is/hour.5.mp3',
  'audio/is/hour.6.mp3',
  'audio/is/hour.7.mp3',
  'audio/is/hour.8.mp3',
  'audio/is/hour.9.mp3',
  'audio/is/klukkan.clock_is_a.mp3',
  'audio/is/klukkan.pick_b.mp3',
  'audio/is/klukkan.read_q.mp3',
  'audio/is/klukkan.set_a.mp3',
  'audio/is/klukkan.set_b.mp3',
  'audio/is/litir.q.mp3',
  'audio/is/minni.end_title.mp3',
  'audio/is/minni.start.mp3',
  'audio/is/num.1.mp3',
  'audio/is/num.10.mp3',
  'audio/is/num.11.mp3',
  'audio/is/num.12.mp3',
  'audio/is/num.2.mp3',
  'audio/is/num.3.mp3',
  'audio/is/num.4.mp3',
  'audio/is/num.5.mp3',
  'audio/is/num.6.mp3',
  'audio/is/num.7.mp3',
  'audio/is/num.8.mp3',
  'audio/is/num.9.mp3',
  'audio/is/praise.0.mp3',
  'audio/is/praise.1.mp3',
  'audio/is/praise.2.mp3',
  'audio/is/praise.3.mp3',
  'audio/is/praise.4.mp3',
  'audio/is/praise.5.mp3',
  'audio/is/shape.ferningur.mp3',
  'audio/is/shape.hjarta.mp3',
  'audio/is/shape.hringur.mp3',
  'audio/is/shape.r%C3%A9tthyrningur.mp3',
  'audio/is/shape.stjarna.mp3',
  'audio/is/shape.%C3%BEr%C3%ADhyrningur.mp3',
  'audio/is/syl.ba.mp3',
  'audio/is/syl.be.mp3',
  'audio/is/syl.bi.mp3',
  'audio/is/syl.bu.mp3',
  'audio/is/syl.da.mp3',
  'audio/is/syl.de.mp3',
  'audio/is/syl.di.mp3',
  'audio/is/syl.du.mp3',
  'audio/is/syl.ga.mp3',
  'audio/is/syl.gu.mp3',
  'audio/is/syl.ha.mp3',
  'audio/is/syl.la.mp3',
  'audio/is/syl.le.mp3',
  'audio/is/syl.ma.mp3',
  'audio/is/syl.me.mp3',
  'audio/is/syl.mi.mp3',
  'audio/is/syl.na.mp3',
  'audio/is/syl.ne.mp3',
  'audio/is/syl.ra.mp3',
  'audio/is/syl.sa.mp3',
  'audio/is/syl.ta.mp3',
  'audio/is/syl.va.mp3',
  'audio/is/tolur.add_q.mp3',
  'audio/is/tolur.count_q.mp3',
  'audio/is/tolur.minus.mp3',
  'audio/is/tolur.plus.mp3',
  'audio/is/try_again.mp3',
  'css/style.css',
  'games/bokstafir.html',
  'games/form.html',
  'games/klukkan.html',
  'games/litir.html',
  'games/minni.html',
  'games/tolur.html',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'index.html',
  'js/audio-manifest.js',
  'js/bokstafir.js',
  'js/common.js',
  'js/form.js',
  'js/i18n.js',
  'js/klukkan.js',
  'js/litir.js',
  'js/menu.js',
  'js/minni.js',
  'js/sound.js',
  'js/tolur.js',
  'js/tts.js',
  'manifest.webmanifest'
];
// END GENERATED

var CACHE = 'krakkaleikir-' + VERSION;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // bypass the HTTP cache so a new version never stores an old file
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) {
      return k.indexOf('krakkaleikir-') === 0 && k !== CACHE;
    }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Safari asks for audio in byte ranges and will not play a full 200 response to
// a range request, so cut the cached file to the requested range.
function partial(req, res) {
  var m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (!m || res.status !== 200) return res;
  return res.arrayBuffer().then(function (buf) {
    var size = buf.byteLength;
    var start, end;
    if (m[1] === '') { start = Math.max(0, size - parseInt(m[2], 10)); end = size - 1; }
    else { start = parseInt(m[1], 10); end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1); }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
    }
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes'
      }
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return partial(req, hit);
      return fetch(req);
    });
  }));
});
