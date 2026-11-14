#!/usr/bin/env node
/* Consistency checks for krakkaleikir (no dependencies; run from anywhere):

     node tools/check.js           check, exit 1 on any problem
     node tools/check.js --write   also rewrite the offline file list + VERSION in sw.js

   Checks: the Icelandic and Danish string tables have the same keys; every key
   the game code names exists (and has audio when it is spoken); audio/<lang>/*.mp3
   match audioVocab() in js/i18n.js one-to-one and audio/manifest.json says each
   was made from the current text (else re-run tools/make_audio.py); file names
   are NFC; games are registered, linked from the menu and have a redirect page;
   sw.js lists exactly the current files. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const WRITE = process.argv.includes('--write');
const errors = [];
const err = (m) => errors.push(m);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---- load the string tables ---- */
const store = {};
const ctx = {
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  document: { documentElement: {}, addEventListener() {}, querySelectorAll: () => [] }
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(read('js/i18n.js'), ctx);
const { STR, LANGS } = ctx.KL_I18N;
const VOCAB = {};
for (const l of LANGS) VOCAB[l] = ctx.KL_I18N.audioVocab(l);
let RECORD = {};
try { RECORD = JSON.parse(read('audio/manifest.json')); } catch (e) { err('audio/manifest.json missing or unreadable (run tools/make_audio.py)'); }

/* ---- string tables ---- */
const keys = {};
for (const l of LANGS) keys[l] = new Set(Object.keys(STR[l]));
for (const a of LANGS) for (const b of LANGS) {
  if (a === b) continue;
  const missing = [...keys[a]].filter((k) => !keys[b].has(k));
  if (missing.length) err(`i18n: keys in '${a}' missing from '${b}': ${missing.join(', ')}`);
}

/* ---- keys named in the game code exist ---- */
const prefixes = new Set([...keys.is].map((k) => k.split('.')[0]));
const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js') && f !== 'i18n.js');
for (const f of jsFiles) {
  const src = read('js/' + f);
  for (const m of src.matchAll(/'([a-z_]+)\.([^'.\s][^'\s]*)'(?!\s*\+)/g)) {
    const key = m[1] + '.' + m[2];
    if (prefixes.has(m[1]) && !keys.is.has(key) && !(key in VOCAB.is) && !/\.(js|html|mp3|css)$/.test(key)) err(`js/${f}: unknown string key '${key}'`);
  }
  // a literal key at the start of a speech list (['litir.q']) must have audio
  for (const m of src.matchAll(/\[\s*'([a-z_]+\.[^'\s]+)'(?!\s*\+)/g)) {
    if (prefixes.has(m[1].split('.')[0]) && !(m[1] in VOCAB.is)) err(`js/${f}: spoken key '${m[1]}' has no audio (add it to audioVocab in js/i18n.js)`);
  }
}

/* ---- audio files <-> audioVocab() <-> audio/manifest.json ---- */
for (const l of LANGS) {
  const vocab = VOCAB[l];
  const made = RECORD[l] || {};
  const dir = path.join(ROOT, 'audio', l);
  const raw = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')) : [];
  for (const f of raw) if (f !== f.normalize('NFC')) err(`audio/${l}/${f}: file name is not NFC (the browser asks for the NFC spelling)`);
  const files = new Set(raw.map((f) => f.normalize('NFC').slice(0, -4)));
  for (const k of Object.keys(vocab)) {
    if (!files.has(k)) err(`audio/${l}/${k}.mp3 missing (run tools/make_audio.py)`);
    else if (made[k] !== vocab[k]) err(`audio/${l}/${k}.mp3 was made from "${made[k]}" but the text is now "${vocab[k]}" (run tools/make_audio.py)`);
  }
  for (const k of files) if (!(k in vocab)) err(`audio/${l}/${k}.mp3 is no longer used (run tools/make_audio.py)`);
}

/* ---- games: registered, on the menu, loaded, redirect page ---- */
const index = read('index.html');
const registered = jsFiles.flatMap((f) => [...read('js/' + f).matchAll(/KL\.register\('([^']+)'/g)].map((m) => ({ id: m[1], file: f })));
const cards = new Set([...index.matchAll(/class="game-card"[^>]*data-nav="([^"]+)"/g)].map((m) => m[1]));
for (const { id, file } of registered) {
  if (!cards.has(id)) err(`index.html: no menu card (data-nav="${id}") for game '${id}'`);
  if (!index.includes(`data-game="${id}"`)) err(`index.html: no badge (data-game="${id}") for game '${id}'`);
  if (!index.includes(`src="js/${file}"`)) err(`index.html: js/${file} is not loaded`);
  if (!fs.existsSync(path.join(ROOT, 'games', id + '.html'))) err(`games/${id}.html redirect page missing`);
  if (!keys.is.has('game.' + id) || !keys.is.has('title.' + id) || !keys.is.has('desc.' + id)) err(`i18n: game '${id}' needs game./title./desc. strings`);
}
for (const id of cards) if (!registered.some((r) => r.id === id)) err(`index.html: menu card '${id}' has no registered game`);

/* ---- sw.js: offline file list ---- */
const SHIP = ['index.html', 'manifest.webmanifest', 'css', 'js', 'icons', 'audio', 'games'];
function walk(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [rel];
  return fs.readdirSync(abs).filter((f) => !f.startsWith('.') && rel + '/' + f !== 'audio/manifest.json').sort().flatMap((f) => walk(rel + '/' + f));
}
const shipped = SHIP.flatMap(walk).map((p) => p.normalize('NFC')).sort();
const hash = crypto.createHash('sha256');
for (const p of shipped) { hash.update(p + '\0'); hash.update(fs.readFileSync(path.join(ROOT, p))); hash.update('\0'); }
const version = hash.digest('hex').slice(0, 12);
const urls = ['./'].concat(shipped.map((p) => p.split('/').map(encodeURIComponent).join('/')));
const block = '// BEGIN GENERATED (node tools/check.js --write)\n' +
  "var VERSION = '" + version + "';\n" +
  'var FILES = [\n' + urls.map((u) => "  '" + u + "'").join(',\n') + '\n];\n' +
  '// END GENERATED';
const sw = read('sw.js');
const re = /\/\/ BEGIN GENERATED[\s\S]*?\/\/ END GENERATED/;
if (!re.test(sw)) err('sw.js: generated block markers not found');
else if (sw.match(re)[0] !== block) {
  if (WRITE) { fs.writeFileSync(path.join(ROOT, 'sw.js'), sw.replace(re, block)); console.log(`sw.js: wrote ${urls.length} files, version ${version}`); }
  else err('sw.js: offline file list is out of date (run: node tools/check.js --write)');
}

if (errors.length) {
  console.error(errors.map((e) => '✗ ' + e).join('\n'));
  console.error(`\n${errors.length} problem(s)`);
  process.exit(1);
}
const mb = shipped.reduce((s, p) => s + fs.statSync(path.join(ROOT, p)).size, 0) / 1e6;
console.log(`ok: ${keys.is.size} strings per language, ${Object.keys(VOCAB.is).length}+${Object.keys(VOCAB.da).length} mp3s, ${registered.length} games, ${urls.length} offline files (${mb.toFixed(1)} MB), version ${version}`);
