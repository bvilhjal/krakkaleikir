#!/usr/bin/env node
/* Runtime smoke test for krakkaleikir: drives the real app in headless Chrome
   over the DevTools protocol and plays every game to its end screen, then
   checks language switch, mute, reset, narrow screens and offline mode.
   No dependencies; needs Node >= 22 (fetch + WebSocket) and Chrome/Chromium
   (CHROME_PATH overrides discovery). Run from anywhere:

     node tools/smoke.js

   Screenshots land in a temporary directory printed at the end. Exit code 1
   on any failed check or page error. GitHub Actions runs it after check.js. */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.wav': 'audio/wav'
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  for (const c of mac) if (fs.existsSync(c)) return c;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const p = path.join(dir, name);
      try { fs.accessSync(p, fs.constants.X_OK); return p; } catch (e) { /* keep looking */ }
    }
  }
  throw new Error('Chrome/Chromium not found; set CHROME_PATH');
}

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
      catch (e) { res.writeHead(400); res.end(); return; }
      if (p.endsWith('/')) p += 'index.html';
      const file = path.normalize(path.join(ROOT, p));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.seq = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== undefined && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        if (m.error) reject(new Error(m.error.message)); else resolve(m.result);
      } else if (m.method) {
        for (const fn of this.listeners) fn(m);
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', () => reject(new Error('cannot connect to ' + url)));
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(fn) { this.listeners.push(fn); }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails.exception;
      throw new Error('page eval: ' + ((d && (d.description || d.value)) || r.exceptionDetails.text));
    }
    return r.result.value;
  }
}

/* ---- page-side players (run inside the app via Runtime.evaluate) ---- */

// click answers until the round ends: wrong ones disable, the right one locks
// the question and the engine advances on its own
const PLAY_ROUND = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let guard = 0; guard < 500; guard++) {
    if (document.querySelector('.end-card')) return true;
    const place = document.querySelector('.measure-place:not(:disabled):not([hidden])');
    if (place) place.click();
    const btns = [...document.querySelectorAll('.q-stage .answer')];
    const enabled = btns.filter((b) => !b.disabled);
    if (enabled.length) enabled[0].click();
    await sleep(120);
  }
  return false;
})()`;

// the hundred chart: read the target number back out of Kóli's bubble
// (scoped to #game: the hidden menu keeps a guide of its own in the DOM)
const PLAY_TALNATAFLA = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let guard = 0; guard < 300; guard++) {
    if (document.querySelector('.end-card')) return true;
    const bubble = document.querySelector('#game .bubble-text');
    if (bubble) {
      const text = bubble.textContent;
      const S = KL_I18N.STR[KL_I18N.lang()];
      for (let n = 1; n <= 100; n++) {
        if (KL_I18N.fmt('talnatafla.find', { n: S['num.' + n] }) === text) {
          const btn = document.querySelectorAll('.q-stage .number-cell')[n - 1];
          if (btn && !btn.disabled) { btn.click(); await sleep(150); }
          break;
        }
      }
    }
    await sleep(150);
  }
  return false;
})()`;

// Play both clock levels and check that analog clocks and picture choices have
// usable accessible names. 'set' shows the target digitally; 'read' requires
// decoding both hands (the hour hand is halfway between hours at half past).
const PLAY_KLUKKAN = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const angle = (el) => parseFloat(/rotate\\(([-\\d.]+)/.exec(el.getAttribute('transform'))[1]);
  let read = 0, pick = 0, set = 0;
  for (let guard = 0; guard < 300; guard++) {
    if (document.querySelector('.end-card')) return { ok: true, read, pick, set };
    const stage = document.querySelector('.q-stage');
    if (stage) {
      const digital = stage.querySelector('.digital');
      if (digital) {
        const parts = digital.textContent.split(':');
        const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
        const nums = [...stage.querySelectorAll('.clock-num')].filter((b) => !b.disabled);
        if (nums.length) {
          const btn = nums.find((b) => parseInt(b.textContent, 10) === h);
          if (btn) { btn.click(); set++; await sleep(150); continue; }
        }
        const choices = [...stage.querySelectorAll('.clock-choice')].filter((b) => !b.disabled);
        if (choices.length) {
          if (choices.some((b) => !/^\\d{1,2}:(00|15|30|45)$/.test(b.getAttribute('aria-label') || ''))) {
            throw new Error('clock picture choice has no accessible digital-time name');
          }
          const btn = choices.find((b) => {
            const hands = b.querySelectorAll('svg > g[transform]');
            return hands.length >= 2 && Math.abs(angle(hands[0]) - m * 6) < 0.11 &&
              Math.abs(angle(hands[1]) - ((h % 12) + m / 60) * 30) < 0.11;
          });
          if (btn) { btn.click(); pick++; await sleep(150); continue; }
        }
      } else {
        const svg = stage.querySelector('.prompt svg');
        const hands = stage.querySelectorAll('.prompt svg > g[transform]');
        if (svg && hands.length >= 2) {
          const m = (Math.round(angle(hands[0]) / 6) % 60 + 60) % 60;
          const h = Math.floor((angle(hands[1]) + 0.01) / 30) % 12 || 12;
          const expected = h + ':' + (m < 10 ? '0' + m : String(m));
          if (svg.getAttribute('role') !== 'img' || svg.getAttribute('aria-label') !== expected) {
            throw new Error('analog clock lacks its accessible time label');
          }
          const buttons = [...stage.querySelectorAll('.answer')].filter((b) => !b.disabled);
          const digitalChoices = buttons.some((b) => b.textContent.includes(':'));
          const text = digitalChoices ? expected : String(h);
          const btn = buttons.find((b) => b.textContent === text);
          if (btn) { btn.click(); read++; await sleep(150); continue; }
        }
      }
    }
    await sleep(150);
  }
  return { ok: false, read, pick, set };
})()`;

// memory: always turn the true pair (the faces are identical SVG); one card may
// already be face up from the keyboard check
const PLAY_MINNI = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const face = (c) => c.querySelector('.mface.front').innerHTML;
  for (let guard = 0; guard < 150; guard++) {
    if (document.querySelector('.end-card')) return true;
    const cards = [...document.querySelectorAll('.mcard')];
    const up = cards.filter((c) => c.classList.contains('flipped') && !c.disabled);
    const down = cards.filter((c) => !c.disabled && !c.classList.contains('flipped'));
    if (up.length === 1 && down.length) {
      (down.find((c) => face(c) === face(up[0])) || down[0]).click();
      await sleep(550);
    } else if (down.length >= 2) {
      const a = down[0];
      const b = down.find((c) => c !== a && face(c) === face(a)) || down[1];
      a.click(); await sleep(90); b.click();
      await sleep(550);
    } else await sleep(150);
  }
  return false;
})()`;

async function main() {
  const exe = findChrome();
  const srv = await serve();
  const port = srv.address().port;
  const base = 'http://localhost:' + port; // 'localhost' so the service worker may register
  const dbg = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kl-smoke-profile-'));
  const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'krakkaleikir-smoke-'));
  const chrome = spawn(exe, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--mute-audio', '--autoplay-policy=no-user-gesture-required',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-background-networking', '--disable-sync', '--disable-component-update',
    // the game advances on page-side timers; a backgrounded tab would throttle them
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--remote-debugging-port=' + dbg, '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore' });

  let passed = 0, failed = 0;
  const fail = (name, e) => { failed++; console.error('  ✗ ' + name + ': ' + e.message); };
  const test = async (name, fn) => {
    try { await fn(); passed++; console.log('  ✓ ' + name); } catch (e) { fail(name, e); }
  };
  const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'assertion failed'); };

  let cdp = null;
  const pageErrors = [];
  let offline = false;
  const killer = setTimeout(() => {
    console.error('smoke test timed out');
    try { chrome.kill('SIGKILL'); } catch (e) { /* already gone */ }
    process.exit(1);
  }, 900000);

  try {
    let target = null;
    for (let i = 0; i < 100 && !target; i++) {
      await sleep(200);
      try {
        const list = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json();
        // the tab we launched with, not some page Chrome decides to open on its own
        target = list.find((t) => t.type === 'page' && t.url === 'about:blank') || list.find((t) => t.type === 'page');
      } catch (e) { /* chrome still starting */ }
    }
    if (!target) throw new Error('headless Chrome did not start (tried ' + exe + ')');
    cdp = await CDP.connect(target.webSocketDebuggerUrl);
    cdp.on((m) => {
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        pageErrors.push((d.exception && (d.exception.description || d.exception.value)) || d.text);
      }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        pageErrors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
      }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        const text = m.params.entry.text;
        if (offline && /net::|Failed to load resource/.test(text)) return; // expected while offline
        pageErrors.push(text);
      }
    });
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

    const waitFor = async (expr, what, timeout = 20000) => {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        if (await cdp.eval(expr)) return;
        await sleep(120);
      }
      throw new Error('timeout waiting for ' + (what || expr));
    };
    const shot = async (name, settle = 800) => {
      await sleep(settle); // let entrance animations finish (cards deal in over ~0.7s)
      const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(shots, name + '.png'), Buffer.from(r.data, 'base64'));
    };
    const openGame = async (id) => {
      await cdp.eval(`KL.nav('${id}')`);
      await waitFor(`!document.getElementById('game').hidden && document.querySelector('#game .question-card, #game .minni-wrap')`, 'game ' + id);
    };
    const toMenu = async () => {
      // KL.nav('') steps back one history entry; if an earlier test aborted
      // mid-game there may be several game entries above the menu
      for (let i = 0; i < 6; i++) {
        if (await cdp.eval(`!document.getElementById('menu').hidden`)) return;
        await cdp.eval(`KL.nav('')`);
        await sleep(250);
      }
      await waitFor(`!document.getElementById('menu').hidden`, 'menu');
    };
    const pickLevel = async (i) => {
      await cdp.eval(`document.querySelectorAll('.level-btn')[${i}].click()`);
    };
    // the menu cards are static HTML: wait for the scripts too, not just the markup
    const waitForApp = async () => {
      await waitFor(`document.readyState === 'complete' && typeof KL !== 'undefined'`, 'app scripts loaded');
      await waitFor(`document.querySelectorAll('.game-card').length === 9`, 'menu');
    };
    const reloadApp = async () => {
      await cdp.eval(`window.__beforeReload = true`);
      await cdp.send('Page.reload');
      await waitFor(`!window.__beforeReload`, 'new document');
      await waitForApp();
    };

    console.log('krakkaleikir smoke test — ' + base);
    await cdp.send('Page.navigate', { url: base + '/' });
    await waitForApp();

    await test('menu renders: 9 cards, sticker book, Kóli greets', async () => {
      assert(await cdp.eval(`document.querySelectorAll('#sticker-grid .sticker').length >= 12`), 'sticker grid');
      assert(await cdp.eval(`document.querySelector('#menu .bubble-text').textContent.length > 0`), 'greeting');
      assert(await cdp.eval(`KL.stickers().length === 1`), 'first sticker is Kóli');
      assert(await cdp.eval(`document.querySelector('#score').textContent === ''`), 'menu score hidden before stars earned');
      await shot('menu-desktop');
    });

    await test('question generators: known answers, level boundaries, and recorded prompts in both languages', async () => {
      const errors = await cdp.eval(`(() => {
        const original = KL.runGame, lang = KL_I18N.lang(), errors = [];
        const check = (ok, message) => { if (!ok && errors.length < 12) errors.push(message); };
        const easyShapes = ['hringur', 'ferningur', 'þríhyrningur', 'rétthyrningur', 'sexhyrningur', 'stjarna', 'hjarta', 'tígull', 'hálfmáni'];
        const sides = { hringur: 0, sporbaugur: 0, þríhyrningur: 3, ferningur: 4, rétthyrningur: 4, tígull: 4, fimmhyrningur: 5, sexhyrningur: 6, átthyrningur: 8 };
        let cfg;
        KL.runGame = (c) => { cfg = c; };
        try {
          for (const l of KL_I18N.LANGS) {
            KL_I18N.setLang(l);
            const vocab = KL_I18N.audioVocab(l);
            for (const id of ['tolur', 'bokstafir', 'form', 'mynstur', 'klukkan', 'maelingar', 'ordmyndir']) {
              KL.games[id].start({});
              for (const level of KL.games[id].levels) for (let round = 0; round < 20; round++) {
                const qs = cfg.makeQuestions(level.id);
                check(qs.length === 10, id + ': ten questions');
                if (id === 'ordmyndir') check(new Set(qs.map((q) => q.target)).size === 10, id + ': ten different targets');
                for (const q of qs) {
                  const where = l + '/' + id + '/' + level.id;
                  const prompt = document.createElement('div'), choices = document.createElement('div');
                  const answers = cfg.build(q, prompt, choices, level.id);
                  check(answers.filter((a) => a.isCorrect).length === 1, where + ': exactly one correct choice');
                  const spoken = cfg.promptSpeech(q, level.id).concat(...answers.map((a) => a.speechParts || []));
                  check(spoken.every((key) => key in vocab), where + ': every spoken key is recorded');
                  if (id === 'mynstur') {
                    check(q.choices.length === 4 && new Set(q.choices.map((t) => t.id)).size === 4, where + ': distinct choices');
                    if (q.kind === 'visual') {
                      const ids = q.seq.map((t) => t.id);
                      const period = [1, 2, 3, 4].find((p) => ids.every((t, i) => t === ids[i % p]));
                      check(!!period && q.ans.id === ids[ids.length % period], where + ': answer continues the repeating unit');
                      check([...prompt.querySelectorAll('.pat-slot')].every((el) => el.getAttribute('role') === 'img' && el.getAttribute('aria-label')), where + ': sequence has accessible names');
                      cfg.onCorrect(q, null, prompt);
                      check(prompt.querySelector('.pat-slot.filled').getAttribute('aria-label') === KL.t(q.ans.labelKey), where + ': revealed answer has its new name');
                    } else {
                      const step = q.seq[1].n - q.seq[0].n;
                      check(step !== 0 && q.seq.every((t, i) => t.n === q.seq[0].n + i * step) && q.ans.n === q.seq[0].n + q.seq.length * step, where + ': constant-step answer');
                    }
                  } else if (id === 'form') {
                    check(new Set(q.choices).size === 4, where + ': distinct shapes');
                    if (level.id === 'easy') check(q.choices.every((s) => easyShapes.includes(s)), where + ': only easy shapes');
                    if (q.speechKey.startsWith('form.sides.')) {
                      const n = Number(q.speechKey.split('.').pop());
                      check(q.choices.filter((s) => sides[s] === n).length === 1 && sides[q.target] === n, where + ': exactly one shape has the requested side/corner count');
                    }
                  } else if (id === 'tolur') {
                    const expected = q.type === 'count' ? q.n : q.type.startsWith('miss_') ? q.b : q.type === 'sub' ? q.a - q.b : q.a + q.b;
                    check(answers.find((a) => a.isCorrect).el.textContent === String(expected), where + ': arithmetic/count answer');
                  } else if (id === 'bokstafir' && level.id === 'letters') {
                    const alphabet = l === 'da' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ' : 'AÁBDÐEÉFGHIÍJKLMNOÓPRSTUÚVXYÝÞÆÖ';
                    check(q.alpha.join('') === alphabet, where + ': complete alphabet');
                    const answer = answers.find((a) => a.isCorrect).el.textContent;
                    check(answer.toUpperCase() === q.ch && (q.type !== 'first' || q.ch === q.word[0].toUpperCase()), where + ': correct letter');
                  } else if (id === 'ordmyndir') {
                    check(q.choices.length === 4 && new Set(q.choices).size === 4, where + ': four distinct choices');
                    const correct = answers.find((a) => a.isCorrect);
                    check(q.choices[answers.indexOf(correct)] === q.target, where + ': target matches the correct choice');
                    const picture = document.createElement('div');
                    picture.innerHTML = KL_ART.animal(q.target, q.mode === 'pictures' ? 104 : 128);
                    const drawn = (q.mode === 'pictures' ? correct.el : prompt).querySelector('svg');
                    check(drawn.outerHTML === picture.firstChild.outerHTML, where + ': correct artwork');
                    const written = q.mode === 'pictures' ? prompt.querySelector('.match-word-text') : correct.el;
                    check(written.textContent === KL.t('animal.' + q.target), where + ': correct translated word');
                    check(cfg.promptSpeech(q).includes('animal.' + q.target) === (q.mode === 'pictures'), where + ': reading mode does not announce the answer');
                    check(correct.speechParts[0] === 'animal.' + q.target, where + ': feedback pronounces the match');
                    cfg.onCorrect(q, correct, prompt);
                    check((q.mode === 'pictures' ? correct.el : prompt).querySelector('.word-reveal').textContent === KL.t('animal.' + q.target), where + ': matched word revealed');
                  } else if (id === 'maelingar') {
                    if (level.id === 'compare') {
                      const biggest = q.kind === 'longest' || q.kind === 'tallest';
                      const expected = Math[biggest ? 'max' : 'min'](...q.choices);
                      check(q.correct === expected && new Set(q.choices).size === 4, where + ': unique size comparison');
                      check(answers.every((a, i) => a.el.getAttribute('aria-label') === KL.fmt('maelingar.size', { n: q.choices[i] }) && a.speechParts.length === 0), where + ': comparisons give relative sizes without claiming physical units');
                      check(answers.every((a) => a.el.querySelector('svg').getAttribute('viewBox') === '0 0 180 150'), where + ': shared picture scale');
                      if (q.kind === 'longest' || q.kind === 'shortest') {
                        const lengths = answers.map((a) => Number(a.el.querySelector('.measure-pencil').dataset.length));
                        const best = Math[biggest ? 'max' : 'min'](...lengths);
                        check(Number(answers.find((a) => a.isCorrect).el.querySelector('.measure-pencil').dataset.length) === best, where + ': drawn length matches the answer');
                      }
                    } else {
                      check(q.correct >= 1 && q.correct <= 10, where + ': bounded measurement');
                      check(Number(answers.find((a) => a.isCorrect).el.firstChild.textContent) === q.correct, where + ': correct measured value');
                      if (level.id === 'weight') {
                        const drawn = [...prompt.querySelectorAll('.measure-weight')].map((el) => Number(el.dataset.kg));
                        check(drawn.length > 0 && drawn.every((w) => [1, 2, 5].includes(w)) && drawn.reduce((a, b) => a + b, 0) === q.correct, where + ': visible weights balance the parcel');
                      } else {
                        check(Number(prompt.querySelector('.measure-pencil').dataset.length) === q.correct * 28, where + ': ruler ticks match pencil endpoints');
                        check(answers.every((a) => a.el.disabled), where + ': first align the pencil');
                      }
                      cfg.onCorrect(q, null, prompt);
                      check(prompt.querySelector('.measure-result.filled').textContent === q.correct + (level.id === 'weight' ? ' kg' : ' cm'), where + ': measured result revealed');
                    }
                  }
                }
              }
            }
          }
          return errors;
        } finally { KL.runGame = original; KL_I18N.setLang(lang); }
      })()`);
      assert(errors.length === 0, errors.join(' | '));
    });

    await test('speech fallback waits for speech before the next clip and completion', async () => {
      const result = await cdp.eval(`(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const originalPlay = Audio.prototype.play, originalSpeak = speechSynthesis.speak;
        const plays = [];
        let utterance = null, rejected = false, done = false;
        try {
          KL_TTS.stop();
          Audio.prototype.play = function () {
            plays.push(this.src);
            if (!rejected && /koala\\.hello/.test(this.src)) {
              rejected = true;
              return Promise.reject(new DOMException('injected media failure', 'NotSupportedError'));
            }
            return originalPlay.call(this);
          };
          speechSynthesis.speak = (u) => { utterance = u; };
          KL_TTS.say(['koala.hello', 'num.1'], () => { done = true; });
          for (let i = 0; i < 30 && !utterance; i++) await sleep(50);
          await sleep(250);
          const nextBeforeEnd = plays.some((src) => /num\\.1/.test(src));
          const doneBeforeEnd = done;
          if (utterance && typeof utterance.onend === 'function') utterance.onend();
          for (let i = 0; i < 80 && !done; i++) await sleep(50);
          return { utterance: !!utterance, nextBeforeEnd, doneBeforeEnd, done,
            nextAfterEnd: plays.some((src) => /num\\.1/.test(src)) };
        } finally {
          KL_TTS.stop();
          Audio.prototype.play = originalPlay;
          speechSynthesis.speak = originalSpeak;
        }
      })()`);
      assert(result.utterance, 'fallback utterance created');
      assert(!result.nextBeforeEnd && !result.doneBeforeEnd, 'advanced before fallback speech ended: ' + JSON.stringify(result));
      assert(result.nextAfterEnd && result.done, 'sequence completed after fallback speech');
    });

    await test('speech fallback cancels on mute, replacement, and navigation; stale callbacks stay cancelled', async () => {
      const result = await cdp.eval(`(async () => {
        const tick = () => new Promise((r) => setTimeout(r, 0));
        const play = Audio.prototype.play, speak = speechSynthesis.speak, cancel = speechSynthesis.cancel;
        const utterances = [];
        let cancels = 0, completed = 0;
        try {
          KL_TTS.stop();
          Audio.prototype.play = () => Promise.reject(new DOMException('injected media failure', 'NotSupportedError'));
          speechSynthesis.speak = (u) => { utterances.push(u); };
          speechSynthesis.cancel = () => { cancels++; const u = utterances.at(-1); if (u && u.onerror) u.onerror(); };
          KL_TTS.say(['koala.hello', 'num.1'], () => { completed++; });
          await tick();
          const talking = document.querySelector('#menu .koala').classList.contains('talking');
          document.getElementById('sound-toggle').click();
          await tick();
          const muted = !KL_SOUND.on() && cancels === 1 && utterances.length === 1 && completed === 0;
          document.getElementById('sound-toggle').click();
          KL_TTS.say(['num.2'], () => { completed++; });
          await tick();
          KL_TTS.say(['num.3'], () => { completed++; });
          await tick();
          const replaced = cancels === 2 && utterances.length === 3 && completed === 0;
          KL.nav('tolur');
          await tick();
          const navigated = cancels === 3 && completed === 0;
          KL_TTS.stop();
          const beforeIdleStop = cancels;
          KL_TTS.stop();
          utterances.forEach((u) => { if (u.onend) u.onend(); });
          await tick();
          return { talking, muted, replaced, navigated, idleSafe: cancels === beforeIdleStop, completed };
        } finally {
          KL_TTS.stop();
          Audio.prototype.play = play;
          speechSynthesis.speak = speak;
          speechSynthesis.cancel = cancel;
          if (!KL_SOUND.on()) document.getElementById('sound-toggle').click();
        }
      })()`);
      assert(result.talking && result.muted && result.replaced && result.navigated && result.idleSafe && result.completed === 0, JSON.stringify(result));
    });

    await test('animal voices: all 12 start via the live path (5 files + 7 synth)', async () => {
      assert(await cdp.eval(`KL_SOUND.animals.length === 12`), '12 animals');
      assert(await cdp.eval(`KL_SOUND.animalFiles.length === 5`), '5 local clips');
      await cdp.eval(`(() => {
        KL_TTS.stop();
        window.__animalOriginalPlay = Audio.prototype.play;
        window.__animalOriginalStart = OscillatorNode.prototype.start;
        window.__animalPlays = [];
        window.__animalOscStarts = 0;
        Audio.prototype.play = function () { window.__animalPlays.push(this.src); return window.__animalOriginalPlay.call(this); };
        OscillatorNode.prototype.start = function () { window.__animalOscStarts++; return window.__animalOriginalStart.apply(this, arguments); };
      })()`);
      try {
        for (const id of await cdp.eval(`KL_SOUND.animals`)) {
          const before = await cdp.eval(`({ plays: window.__animalPlays.length, oscillators: window.__animalOscStarts })`);
          await cdp.eval(`KL_SOUND.animal(${JSON.stringify(id)})`);
          await sleep(80);
          const after = await cdp.eval(`({ plays: window.__animalPlays, oscillators: window.__animalOscStarts })`);
          if (await cdp.eval(`KL_SOUND.animalFiles.includes(${JSON.stringify(id + '.mp3')})`)) {
            assert(after.plays.slice(before.plays).some((src) => src.includes('/audio/animals/' + id + '.mp3')), id + ' file playback requested');
          } else {
            assert(after.oscillators > before.oscillators, id + ' synth started an oscillator');
          }
          await cdp.eval(`KL_SOUND.stopAnimal()`);
        }
      } finally {
        await cdp.eval(`(() => {
          KL_SOUND.stopAnimal();
          Audio.prototype.play = window.__animalOriginalPlay;
          OscillatorNode.prototype.start = window.__animalOriginalStart;
        })()`);
      }
    });

    await test('tolur: level 1-10 interactive counting, stars saved, sticker awarded, confetti', async () => {
      await openGame('tolur');
      await pickLevel(0);
      await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first question');
      const tolurRes = await cdp.eval(`(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let tappedHerd = false;
        const say = KL.say, counts = [];
        KL.say = (parts, done) => { counts.push(parts.join(',')); return say(parts, done); };
        try { for (let guard = 0; guard < 500; guard++) {
          if (document.querySelector('.end-card')) return { ok: true, tappedHerd, counts };
          if (!tappedHerd) {
            const items = [...document.querySelectorAll('.q-stage .herd-item')];
            if (items.length) {
              items[0].click();
              if (items[0].querySelector('.tap-num').textContent !== '1') return { ok: false, reason: 'tap-num 1' };
              items[0].click();
              if (items[0].getAttribute('aria-pressed') !== 'true' || !items[0].getAttribute('aria-label').endsWith(': 1')) return { ok: false, reason: 'counted animal label' };
              if (items[1]) {
                items[1].click();
                if (items[1].querySelector('.tap-num').textContent !== '2') return { ok: false, reason: 'tap-num 2' };
              }
              tappedHerd = true;
            }
          }
          const btns = [...document.querySelectorAll('.q-stage .answer')];
          const enabled = btns.filter((b) => !b.disabled);
          if (enabled.length) enabled[0].click();
          await sleep(120);
        }
        return { ok: false, reason: 'timeout' };
        } finally { KL.say = say; }
      })()`);
      assert(tolurRes.ok && tolurRes.tappedHerd, 'round finished with interactive counting: ' + JSON.stringify(tolurRes));
      assert(tolurRes.counts.join(',') === 'num.1,num.1,num.2', 'counting speaks new counts and repeats without double counting: ' + tolurRes.counts);
      assert(await cdp.eval(`document.querySelectorAll('#fx .confetti').length > 0`), 'confetti');
      const stars = await cdp.eval(`parseInt(localStorage.getItem('kl.stars.tolur.10') || '0', 10)`);
      assert(stars >= 1 && stars <= 3, 'stars saved, got ' + stars);
      assert(await cdp.eval(`KL.stickers().length === 2`), 'second sticker awarded');
      assert(await cdp.eval(`!!document.querySelector('.sticker-reveal')`), 'sticker reveal');
      await shot('tolur-end-desktop', 1500); // the sticker pops in over ~1.3s
      await toMenu();
      assert(await cdp.eval(`document.querySelector('.badge[data-game="tolur"] svg') !== null`), 'badge shows stars');
      assert(await cdp.eval(`document.querySelector('#score span').textContent.length > 0`), 'menu shows total stars');
    });

    // Real MP3s still load, decode and fire onended, just 8x faster so the
    // remaining ten-question rounds hit the 1s visual floor cleanly in CI.
    await cdp.eval(`(() => {
      const orig = Audio.prototype.play;
      Audio.prototype.play = function () {
        try { this.playbackRate = 8; } catch (e) {}
        return orig.apply(this, arguments);
      };
    })()`);

    await test('tolur: levels 1-20 and 3+? finish', async () => {
      await openGame('tolur');
      await pickLevel(1);
      await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first 1-20 question');
      assert(await cdp.eval(PLAY_ROUND), '1-20 round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.tolur.20') || '0', 10) >= 1`), '1-20 stars saved');
      await toMenu();

      await openGame('tolur');
      await pickLevel(2);
      await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first missing-number question');
      assert(await cdp.eval(`document.querySelectorAll('.q-stage .miss-box').length === 1`), 'missing-number box rendered');
      assert(await cdp.eval(PLAY_ROUND), 'missing-number round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.tolur.miss') || '0', 10) >= 1`), 'missing-number stars saved');
      await toMenu();
    });

    await test('minni: 6-pair keyboard flip, labels, full round, fewest flips, replay', async () => {
      await openGame('minni');
      await pickLevel(0);
      await waitFor(`document.querySelectorAll('.mcard').length === 12`, 'board');
      assert(await cdp.eval(`document.querySelector('.mcard').tagName === 'BUTTON'`), 'cards are buttons');
      assert(await cdp.eval(`/Spjald 1/.test(document.querySelector('.mcard').getAttribute('aria-label'))`), 'face-down label');
      assert(await cdp.eval(`(() => { const c = document.querySelector('.mcard'); c.focus(); return document.activeElement === c; })()`), 'card takes focus');
      // Enter needs keyDown + text: rawKeyDown alone never fires the button's default action
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' });
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
      await waitFor(`document.querySelector('.mcard').classList.contains('flipped')`, 'Enter flips the card');
      // compare DOM-serialized SVG on both sides: innerHTML expands self-closing tags
      assert(await cdp.eval(`(() => {
        const face = document.querySelector('.mcard .mface.front').innerHTML;
        const a = KL_ART.ANIMALS.find((x) => { const d = document.createElement('div'); d.innerHTML = KL_ART.animal(x, 72); return d.innerHTML === face; });
        return !!a && document.querySelector('.mcard').getAttribute('aria-label') === KL.t('animal.' + a);
      })()`), 'face-up label is the animal shown');
      // complete the keyboard-started pair, then check matched cards leave play
      await cdp.eval(`(() => {
        const face = (c) => c.querySelector('.mface.front').innerHTML;
        const up = document.querySelector('.mcard.flipped');
        const down = [...document.querySelectorAll('.mcard')].filter((c) => !c.classList.contains('flipped'));
        (down.find((c) => face(c) === face(up)) || down[0]).click();
      })()`);
      await sleep(600); // the match resolves after 350ms
      assert(await cdp.eval(`document.querySelectorAll('.mcard.matched').length === 2 && [...document.querySelectorAll('.mcard.matched')].every((c) => c.disabled)`), 'matched pair is disabled');
      assert(await cdp.eval(PLAY_MINNI), 'round finished');
      assert(await cdp.eval(`localStorage.getItem('kl.flips.minni.6') === '6'`), 'perfect memory: 6 flips');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.minni.6') || '0', 10) === 3`), '3 stars');
      assert(await cdp.eval(`document.querySelectorAll('.big-stars svg path[fill="#FFC93C"]').length === 3`), 'end screen shows 3 filled stars');
      await cdp.eval(`document.getElementById('kl-replay').click()`);
      await waitFor(`document.querySelectorAll('.mcard:not(.flipped)').length === 12`, 'replay deals a fresh board');
      assert(await cdp.eval(`document.querySelector('#score span').textContent === '0'`), 'flip counter reset');
      await toMenu();
    });

    await test('minni: 8-pair, 10-pair, and 12-pair boards finish and store bests', async () => {
      for (const [lvIdx, nPairs] of [[1, 8], [2, 10], [3, 12]]) {
        await openGame('minni');
        await pickLevel(lvIdx);
        await waitFor(`document.querySelectorAll('.mcard').length === ${nPairs * 2}`, nPairs + '-pair board');
        assert(await cdp.eval(PLAY_MINNI), nPairs + '-pair round finished');
        assert(await cdp.eval(`localStorage.getItem('kl.flips.minni.${nPairs}') === '${nPairs}'`), 'perfect memory: ' + nPairs + ' moves');
        assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.minni.${nPairs}') || '0', 10) === 3`), '3 stars');
        await toMenu();
      }
    });

    await test('talnatafla: explore filters, 1-20 with hints, and 1-100 finish', async () => {
      await openGame('talnatafla');
      await cdp.eval(`document.querySelector('.chip[data-pat="10"]').click()`);
      assert(await cdp.eval(`document.querySelectorAll('.number-cell.pat-hi').length === 10`), '10 multiples of 10 highlighted');
      await cdp.eval(`document.querySelectorAll('.number-cell')[41].click()`);
      assert(await cdp.eval(`document.querySelector('.number-value').textContent === '42'`), 'reading shows 42');
      assert(await cdp.eval(`document.querySelector('.number-name').textContent === KL.t('num.42')`), 'reading names 42');
      assert(await cdp.eval(`document.querySelectorAll('.number-cell')[41].getAttribute('aria-pressed') === 'true'`), 'pressed state');
      await cdp.eval(`document.querySelector('.number-play-20').click()`);
      await waitFor(`document.querySelectorAll('.q-stage .number-cell').length === 20`, '20-cell quiz board');
      const hintSub = await cdp.eval(`(() => {
        const text = document.querySelector('#game .bubble-text').textContent;
        const S = KL_I18N.STR[KL_I18N.lang()];
        let target = 1;
        for (let n = 1; n <= 20; n++) if (KL_I18N.fmt('talnatafla.find', { n: S['num.' + n] }) === text) { target = n; break; }
        const wrong = target === 1 ? 2 : 1;
        document.querySelectorAll('.q-stage .number-cell')[wrong - 1].click();
        return document.querySelector('#game .bubble-sub').textContent;
      })()`);
      assert(/[↑↓]/.test(hintSub), 'higher/lower hint shown: ' + hintSub);
      await waitFor(`document.querySelector('#game .bubble-text').textContent !== KL.t('try_again')`, 'retry speech finished');
      assert(await cdp.eval(`document.querySelector('#game .bubble-sub').textContent === ${JSON.stringify(hintSub)}`), 'higher/lower hint remains after speech');
      assert(await cdp.eval(PLAY_TALNATAFLA), '1-20 round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.talnatafla.20') || '0', 10) >= 1`), '1-20 stars saved');
      await toMenu();

      await openGame('talnatafla');
      await cdp.eval(`document.querySelector('.number-play').click()`);
      await waitFor(`document.querySelectorAll('.q-stage .number-cell').length === 100`, '100-cell quiz board');
      assert(await cdp.eval(PLAY_TALNATAFLA), '1-100 round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.talnatafla') || '0', 10) >= 1`), '1-100 stars saved');
      await toMenu();
    });

    await test('ruler: mouse and touch dragging snap at zero; keyboard and tap alternatives work', async () => {
      try {
        for (const [input, length] of [['mouse', 10], ['touch', 1], ['keyboard', 6], ['tap', 4]]) {
          if (input === 'touch') {
            await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
            await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
          }
          // Fix the first length so the smallest touch target and longest pencil
          // are both exercised; keep the real generator and game engine.
          await cdp.eval(`(() => {
            const run = KL.runGame;
            KL.runGame = (cfg) => {
              const make = cfg.makeQuestions;
              cfg.makeQuestions = (lv) => {
                const qs = make(lv), i = qs.findIndex((q) => q.correct === ${length});
                [qs[0], qs[i]] = [qs[i], qs[0]];
                return qs;
              };
              run(cfg);
            };
            try { KL.nav('maelingar'); } finally { KL.runGame = run; }
          })()`);
          await pickLevel(1);
          await sleep(450);
          assert(await cdp.eval(`document.querySelectorAll('.q-stage .answer:disabled').length === 4`), input + ': answers wait for alignment');
          const points = async () => cdp.eval(`(() => {
            const svg = document.querySelector('.measure-ruler'), pencil = svg.querySelector('.measure-pencil-drag');
            svg.scrollIntoView({ block: 'center', behavior: 'instant' });
            const p = svg.createSVGPoint();
            p.x = ${length * 14}; p.y = 10;
            const from = p.matrixTransform(pencil.getScreenCTM());
            p.x += 32; p.y = 122;
            const to = p.matrixTransform(svg.getScreenCTM());
            p.y = 68;
            const bad = p.matrixTransform(svg.getScreenCTM());
            return { from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y }, bad: { x: bad.x, y: bad.y } };
          })()`);
          const drag = async (from, to) => {
            if (input === 'touch') {
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...to, id: 1 }] });
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            } else {
              await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...from, button: 'left', buttons: 1, clickCount: 1 });
              await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...to, button: 'left', buttons: 1 });
              await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...to, button: 'left', buttons: 0, clickCount: 1 });
            }
          };
          if (input === 'mouse' || input === 'touch') {
            let p = await points();
            await drag(p.from, p.bad);
            assert(await cdp.eval(`!document.querySelector('.measure-ruler.aligned') && document.querySelectorAll('.q-stage .answer:disabled').length === 4`), input + ': misplaced pencil keeps answers locked');
            p = await points();
            await drag(p.from, p.to);
          } else if (input === 'keyboard') {
            const y = await cdp.eval(`(() => { const p = document.querySelector('.measure-pencil-drag'); p.focus(); return p.transform.baseVal.getItem(0).matrix.f; })()`);
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown' });
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown' });
            assert(await cdp.eval(`document.querySelector('.measure-pencil-drag').transform.baseVal.getItem(0).matrix.f === ${y + 7}`), 'arrow moves the pencil');
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter' });
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter' });
          } else await cdp.eval(`document.querySelector('.measure-place').click()`);
          assert(await cdp.eval(`(() => {
            const svg = document.querySelector('.measure-ruler'), m = svg.querySelector('.measure-pencil-drag').transform.baseVal.getItem(0).matrix;
            return svg.classList.contains('aligned') && m.e === 32 && m.f === 112 && document.querySelectorAll('.q-stage .answer:not(:disabled)').length === 4;
          })()`), input + ': pencil snaps to zero and unlocks answers');
          if (input === 'touch') await shot('maelingar-ruler-placed-mobile');
          await toMenu();
          await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
          await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        }
      } finally {
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        await toMenu();
      }
    });

    await test('klukkan: whole, half, and quarter hour rounds finish', async () => {
      for (const [lvIdx, key, expectedPick, expectedSet] of [
        [0, 'whole', 0, 5],
        [1, 'half', 5, 0],
        [2, 'quarter', 5, 0]
      ]) {
        await openGame('klukkan');
        await pickLevel(lvIdx);
        await waitFor(`document.querySelector('.q-stage .answer, .q-stage .clock-num')`, 'first ' + key + ' question');
        const result = await cdp.eval(PLAY_KLUKKAN);
        assert(result.ok && result.read === 5 && result.pick === expectedPick && result.set === expectedSet,
          key + ' round: ' + JSON.stringify(result));
        assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.klukkan.${key}') || '0', 10) >= 1`), key + ' stars saved');
        await toMenu();
      }
    });

    for (const [id, lvIdx, slot, btnSel] of [
      ['bokstafir', 0, 'bokstafir.letters', null],
      ['bokstafir', 1, 'bokstafir.easy', '.sound-btn'],
      ['bokstafir', 2, 'bokstafir.hard', null],
      ['form', 0, 'form.easy', '.sound-btn'],
      ['form', 1, 'form.hard', null],
      ['mynstur', 0, 'mynstur.easy', null],
      ['mynstur', 1, 'mynstur.hard', null],
      ['maelingar', 0, 'maelingar.compare', null],
      ['maelingar', 1, 'maelingar.ruler', null],
      ['maelingar', 2, 'maelingar.weight', null],
      ['ordmyndir', 0, 'ordmyndir.pictures', '.animal-prompt'],
      ['ordmyndir', 1, 'ordmyndir.words', '.animal-prompt']
    ]) {
      await test(`${id} (${slot.split('.')[1]}): full round finishes`, async () => {
        await openGame(id);
        await pickLevel(lvIdx);
        await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first question');
        if (id === 'form' && lvIdx === 0) {
          assert(await cdp.eval(`!/stroke-linejoin="round"|rx="/.test(KL.shapeSVG('ferningur', '#E07A5F', 100) + KL.shapeSVG('sexhyrningur', '#E07A5F', 100))`), 'shapes use sharp corners');
        }
        if (btnSel) await cdp.eval(`document.querySelector(${JSON.stringify(btnSel)}).click()`);
        if (id === 'maelingar') await shot('maelingar-' + slot.split('.')[1] + '-desktop');
        if (id === 'ordmyndir') await shot('ordmyndir-' + slot.split('.')[1] + '-desktop');
        assert(await cdp.eval(PLAY_ROUND), 'round finished');
        assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.${slot}') || '0', 10) >= 1`), 'stars saved');
        await toMenu();
      });
    }

    await test('language switch: Danish menu and game, aria-pressed, back to IS', async () => {
      await cdp.eval(`document.querySelector('[data-lang="da"]').click()`);
      await waitFor(`document.documentElement.lang === 'da'`, 'lang attribute');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="tolur"] h2').textContent === 'Tal'`), 'card translated');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="form"] h2').textContent === 'Former'`), 'form translated');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="mynstur"] h2').textContent === 'Mønstre'`), 'mynstur translated');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="maelingar"] h2').textContent === 'Måling'`), 'maelingar translated');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="ordmyndir"] h2').textContent === 'Ord og billeder'`), 'ordmyndir translated');
      assert(await cdp.eval(`document.querySelector('[data-lang="da"]').getAttribute('aria-pressed') === 'true'`), 'aria-pressed');
      assert(await cdp.eval(`document.querySelector('#menu .bubble-text').textContent.indexOf('Hej') === 0`), 'Kóli greets in Danish');
      await openGame('mynstur');
      await pickLevel(0);
      assert(await cdp.eval(`document.querySelector('#game .bubble-text').textContent === 'Hvad kommer næst?'`), 'Danish prompt');
      assert(await cdp.eval(PLAY_ROUND), 'full Danish round finished');
      await toMenu();
      await openGame('maelingar');
      await pickLevel(2);
      assert(await cdp.eval(`document.querySelector('#game .bubble-text').textContent === 'Hvad vejer pakken?'`), 'Danish measuring prompt');
      assert(await cdp.eval(PLAY_ROUND), 'full Danish weighing round finished');
      await toMenu();
      for (const lv of [0, 1]) {
        await openGame('ordmyndir');
        await pickLevel(lv);
        assert(await cdp.eval(`document.querySelector('#game .bubble-text').textContent === KL.t('ordmyndir.${lv === 0 ? 'picture_q' : 'word_q'}')`), 'Danish matching prompt');
        assert(await cdp.eval(PLAY_ROUND), 'full Danish matching round finished');
        await toMenu();
      }
      await cdp.eval(`document.querySelector('[data-lang="is"]').click()`);
      await waitFor(`document.documentElement.lang === 'is'`, 'back to Icelandic');
    });

    await test('mute toggle persists and restores', async () => {
      await cdp.eval(`document.getElementById('sound-toggle').click()`);
      assert(await cdp.eval(`KL_SOUND.on() === false && localStorage.getItem('kl.sound') === 'off'`), 'muted');
      await cdp.eval(`document.getElementById('sound-toggle').click()`);
      assert(await cdp.eval(`KL_SOUND.on() === true && localStorage.getItem('kl.sound') === 'on'`), 'unmuted');
    });

    await test('reset clears stars and stickers', async () => {
      await cdp.eval(`window.confirm = () => true; document.getElementById('reset-scores').click()`);
      assert(await cdp.eval(`localStorage.getItem('kl.stars.tolur.10') === null`), 'stars gone');
      assert(await cdp.eval(`KL.stickers().length === 1`), 'sticker book back to Kóli');
      assert(await cdp.eval(`document.querySelector('#score').textContent === ''`), 'menu score cleared');
    });

    await test('language and mute still work with blocked or full localStorage', async () => {
      for (const blockedRead of [true, false]) {
        const injected = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source:
          (blockedRead ? "Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });" :
            "Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); };")
        });
        try {
          await reloadApp();
          await cdp.eval(`document.querySelector('[data-lang="da"]').click(); document.getElementById('sound-toggle').click()`);
          assert(await cdp.eval(`KL_I18N.lang() === 'da' && document.documentElement.lang === 'da' && document.querySelector('.game-card[data-nav="tolur"] h2').textContent === 'Tal'`), 'Danish works with ' + (blockedRead ? 'blocked' : 'full') + ' storage');
          assert(await cdp.eval(`!KL_SOUND.on() && document.getElementById('sound-toggle').getAttribute('aria-pressed') === 'false'`), 'mute works without saving');
          await cdp.eval(`document.getElementById('sound-toggle').click(); document.querySelector('[data-lang="is"]').click()`);
          assert(await cdp.eval(`KL_SOUND.on() && KL_I18N.lang() === 'is'`), 'preferences can be changed again');
        } finally {
          await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injected.identifier });
          await reloadApp();
        }
      }
    });

    await test('narrow screens (320/390px): controls, pictures, long words, and game boards fit', async () => {
      try {
        for (const width of [320, 390]) {
          await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 2, mobile: true });
          const fits = `window.innerWidth === ${width} && document.documentElement.scrollWidth <= ${width} + 1`;
          await waitFor(fits, 'menu fits at ' + width);
          if (width === 390) await shot('menu-mobile');
          await openGame('minni');
          await pickLevel(0);
          await waitFor(`document.querySelectorAll('.mcard').length === 12`, 'board');
          assert(await cdp.eval(fits), 'memory board fits at ' + width);
          assert(await cdp.eval(`document.querySelector('#game-title').getBoundingClientRect().width >= 40`), 'usable title width at ' + width);
          assert(await cdp.eval(`document.querySelector('#score').getBoundingClientRect().right <= window.innerWidth + 1`), 'score stays on screen at ' + width);
          if (width === 390) await shot('minni-mobile');
          await toMenu();
          await openGame('mynstur');
          await pickLevel(0);
          await waitFor(`document.querySelectorAll('.pat-slot').length === 6`, 'pattern row');
          assert(await cdp.eval(fits), 'mynstur fits at ' + width);
          await toMenu();
          for (const [lv, name] of [[0, 'compare'], [1, 'ruler'], [2, 'weight']]) {
            await openGame('maelingar');
            await pickLevel(lv);
            await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'measurement choices');
            await sleep(400); // entrance animation must finish before measuring bounds
            assert(await cdp.eval(fits), 'maelingar ' + name + ' fits at ' + width);
            assert(await cdp.eval(`(() => {
              const card = document.querySelector('#game .question-card').getBoundingClientRect();
              return [...document.querySelectorAll('.q-stage svg')].every((svg) => {
                const r = svg.getBoundingClientRect();
                return r.left >= card.left && r.right <= card.right && r.width > 0 && r.height > 0;
              });
            })()`), 'measurement pictures are not clipped at ' + width);
            if (width === 390) await shot('maelingar-' + name + '-mobile');
            await toMenu();
          }
          for (const lang of ['is', 'da']) for (const lv of [0, 1]) {
            await cdp.eval(`(() => {
              KL_I18N.setLang('${lang}');
              const run = KL.runGame;
              KL.runGame = (cfg) => {
                const make = cfg.makeQuestions;
                cfg.makeQuestions = (mode) => {
                  const qs = make(mode);
                  qs[0].target = 'mariuhaena';
                  qs[0].choices = ['mariuhaena', 'morgaes', 'froskur', 'kottur'];
                  return qs;
                };
                run(cfg);
              };
              try { KL.nav('ordmyndir'); } finally { KL.runGame = run; }
            })()`);
            await pickLevel(lv);
            await sleep(400);
            assert(await cdp.eval(fits), 'ordmyndir ' + lang + '/' + lv + ' fits at ' + width);
            assert(await cdp.eval(`[...document.querySelectorAll('.match-word, .match-text')].every((el) => el.scrollWidth <= el.clientWidth + 1)`), 'long translated words are not clipped');
            if (width === 390 && lang === 'is') await shot('ordmyndir-' + (lv === 0 ? 'pictures' : 'words') + '-mobile');
            await toMenu();
          }
          await cdp.eval(`document.querySelector('[data-lang="is"]').click()`);
          await openGame('talnatafla');
          assert(await cdp.eval(fits), 'hundred chart page fits at ' + width);
          assert(await cdp.eval(`document.querySelector('.number-grid').scrollWidth <= document.querySelector('.number-scroll').clientWidth + 1`), 'all 10 columns fit without horizontal scroll at ' + width);
          if (width === 390) await shot('talnatafla-mobile');
          await toMenu();
        }
      } finally {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      }
    });

    await test('offline: app loads from cache, nested stray URL redirects to the app', async () => {
      await waitFor(`navigator.serviceWorker.controller !== null`, 'service worker controls the page', 30000);
      await waitFor(`caches.match('./').then((r) => !!r)`, 'app shell cached');
      offline = true;
      await cdp.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' });
      await reloadApp();
      await openGame('tolur');
      await waitFor(`document.querySelectorAll('.level-btn').length === 3`, 'game opens offline');
      await toMenu();
      await openGame('maelingar');
      await pickLevel(1);
      await waitFor(`document.querySelector('.measure-scene')`, 'measuring game opens offline');
      const clip = await cdp.eval(`fetch('audio/is/maelingar.ruler_q.mp3', { headers: { Range: 'bytes=0-63' } }).then(async (r) => ({ status: r.status, length: (await r.arrayBuffer()).byteLength, type: r.headers.get('Content-Type') }))`);
      assert(clip.status === 206 && clip.length === 64 && clip.type.startsWith('audio/mpeg'), 'new spoken prompt cached with byte-range support: ' + JSON.stringify(clip));
      await cdp.eval(`document.querySelector('.measure-place').click()`);
      assert(await cdp.eval(`!!document.querySelector('.measure-ruler.aligned') && document.querySelectorAll('.answer:not(:disabled)').length === 4`), 'pencil placement works offline');
      await toMenu();
      await cdp.send('Page.navigate', { url: base + '/games/ordmyndir.html' });
      await waitForApp();
      await waitFor(`document.querySelectorAll('.level-btn').length === 2 && location.hash === '#ordmyndir'`, 'word-picture bookmark works offline');
      for (const [lang, lv] of [['is', 0], ['da', 1]]) {
        await cdp.eval(`KL_I18N.setLang('${lang}'); KL.nav('ordmyndir')`);
        await pickLevel(lv);
        assert(await cdp.eval(`document.querySelectorAll('.q-stage .answer').length === 4 && !!document.querySelector('.animal-prompt')`), 'matching game opens offline in ' + lang);
        const audio = await cdp.eval(`fetch('audio/${lang}/ordmyndir.${lv === 0 ? 'picture_q' : 'word_q'}.mp3', { headers: { Range: 'bytes=0-63' } }).then(async (r) => ({ status: r.status, length: (await r.arrayBuffer()).byteLength }))`);
        assert(audio.status === 206 && audio.length === 64, 'matching prompt cached in ' + lang);
      }
      await cdp.eval(`KL_I18N.setLang('is')`);
      await toMenu();
      await cdp.send('Page.navigate', { url: base + '/nested/no-such-page' });
      await waitForApp();
      await waitFor(`window.location.pathname === '/'`, 'offline fallback returned to the app root');
      offline = false;
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1, connectionType: 'wifi' });
    });

    await test('no page errors across the whole run', async () => {
      assert(pageErrors.length === 0, pageErrors.slice(0, 5).join(' | '));
    });
  } catch (e) {
    failed++;
    console.error('  ✗ smoke run aborted: ' + e.message);
  } finally {
    clearTimeout(killer);
    try { chrome.kill('SIGTERM'); } catch (e) { /* already gone */ }
    setTimeout(() => { try { chrome.kill('SIGKILL'); } catch (e) { /* already gone */ } }, 3000).unref();
    srv.close();
    fs.rmSync(profile, { recursive: true, force: true });
    if (cdp) { try { cdp.ws.close(); } catch (e) { /* ignore */ } }
  }
  console.log(`\n${passed} passed, ${failed} failed; screenshots: ${shots}`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
