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

// the clock: 'set' shows the target digitally; 'read' hides it in the hour hand
const PLAY_KLUKKAN = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let guard = 0; guard < 300; guard++) {
    if (document.querySelector('.end-card')) return true;
    const stage = document.querySelector('.q-stage');
    if (stage) {
      let target = null;
      const digital = stage.querySelector('.digital');
      if (digital) target = parseInt(digital.textContent.split(':')[0], 10);
      else {
        const hands = stage.querySelectorAll('.prompt svg > g[transform]');
        if (hands.length >= 2) {
          const m = /rotate\\(([-\\d.]+)/.exec(hands[1].getAttribute('transform'));
          if (m) target = Math.round(parseFloat(m[1]) / 30) % 12 || 12;
        }
      }
      if (target) {
        const btn = [...stage.querySelectorAll('.answer, .clock-num')]
          .find((b) => !b.disabled && parseInt(b.textContent, 10) === target);
        if (btn) { btn.click(); await sleep(150); continue; }
      }
    }
    await sleep(150);
  }
  return false;
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
  }, 420000);

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
      await waitFor(`document.querySelectorAll('.game-card').length === 7`, 'menu');
    };

    console.log('krakkaleikir smoke test — ' + base);
    await cdp.send('Page.navigate', { url: base + '/' });
    await waitForApp();

    await test('menu renders: 7 cards, sticker book, Kóli greets', async () => {
      assert(await cdp.eval(`document.querySelectorAll('#sticker-grid .sticker').length >= 12`), 'sticker grid');
      assert(await cdp.eval(`document.querySelector('#menu .bubble-text').textContent.length > 0`), 'greeting');
      assert(await cdp.eval(`KL.stickers().length === 1`), 'first sticker is Kóli');
      await shot('menu-desktop');
    });

    await test('animal voices: all 12 play via the live path (5 recorded + 7 synth)', async () => {
      assert(await cdp.eval(`KL_SOUND.animals.length === 12`), '12 animals');
      assert(await cdp.eval(`KL_SOUND.animalFiles.length === 5`), '5 recorded clips');
      for (const id of await cdp.eval(`KL_SOUND.animals`)) {
        await cdp.eval(`KL_SOUND.animal(${JSON.stringify(id)})`);
        await sleep(60);
        await cdp.eval(`KL_SOUND.stopAnimal()`);
      }
    });

    await test('tolur: full round, stars saved, sticker awarded, confetti', async () => {
      await openGame('tolur');
      await pickLevel(0);
      await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first question');
      assert(await cdp.eval(PLAY_ROUND), 'round finished');
      assert(await cdp.eval(`document.querySelectorAll('#fx .confetti').length > 0`), 'confetti');
      const stars = await cdp.eval(`parseInt(localStorage.getItem('kl.stars.tolur.1') || '0', 10)`);
      assert(stars >= 1 && stars <= 3, 'stars saved, got ' + stars);
      assert(await cdp.eval(`KL.stickers().length === 2`), 'second sticker awarded');
      assert(await cdp.eval(`!!document.querySelector('.sticker-reveal')`), 'sticker reveal');
      await shot('tolur-end-desktop', 1500); // the sticker pops in over ~1.3s
      await toMenu();
      assert(await cdp.eval(`document.querySelector('.badge[data-game="tolur"] svg') !== null`), 'badge shows stars');
    });

    await test('minni: keyboard flip, labels, full round, fewest flips, replay', async () => {
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

    await test('talnatafla: explore speaks a number, listening round finishes', async () => {
      await openGame('talnatafla');
      await cdp.eval(`document.querySelectorAll('.number-cell')[41].click()`);
      assert(await cdp.eval(`document.querySelector('.number-value').textContent === '42'`), 'reading shows 42');
      assert(await cdp.eval(`document.querySelector('.number-name').textContent === KL.t('num.42')`), 'reading names 42');
      assert(await cdp.eval(`document.querySelectorAll('.number-cell')[41].getAttribute('aria-pressed') === 'true'`), 'pressed state');
      await cdp.eval(`document.querySelector('.number-play').click()`);
      await waitFor(`document.querySelectorAll('.q-stage .number-cell').length === 100`, 'quiz board');
      assert(await cdp.eval(PLAY_TALNATAFLA), 'round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.talnatafla') || '0', 10) >= 1`), 'stars saved');
      await toMenu();
    });

    await test('klukkan: whole-hour round finishes', async () => {
      await openGame('klukkan');
      await pickLevel(0);
      await waitFor(`document.querySelector('.q-stage .answer, .q-stage .clock-num')`, 'first question');
      assert(await cdp.eval(PLAY_KLUKKAN), 'round finished');
      assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.klukkan.whole') || '0', 10) >= 1`), 'stars saved');
      await toMenu();
    });

    for (const [id, level] of [['bokstafir', 0], ['litir', -1], ['form', -1]]) {
      await test(id + ': full round finishes', async () => {
        await openGame(id);
        if (level >= 0) await pickLevel(level);
        await waitFor(`document.querySelectorAll('.q-stage .answer').length === 4`, 'first question');
        if (id === 'bokstafir') {
          await cdp.eval(`document.querySelector('.sound-btn').click()`); // hear the word again
        }
        assert(await cdp.eval(PLAY_ROUND), 'round finished');
        const slot = id === 'bokstafir' ? 'bokstafir.easy' : id;
        assert(await cdp.eval(`parseInt(localStorage.getItem('kl.stars.${slot}') || '0', 10) >= 1`), 'stars saved');
        await toMenu();
      });
    }

    await test('language switch: Danish menu and game, aria-pressed, back to IS', async () => {
      await cdp.eval(`document.querySelector('[data-lang="da"]').click()`);
      await waitFor(`document.documentElement.lang === 'da'`, 'lang attribute');
      assert(await cdp.eval(`document.querySelector('.game-card[data-nav="tolur"] h2').textContent === 'Tal'`), 'card translated');
      assert(await cdp.eval(`document.querySelector('[data-lang="da"]').getAttribute('aria-pressed') === 'true'`), 'aria-pressed');
      assert(await cdp.eval(`document.querySelector('#menu .bubble-text').textContent.indexOf('Hej') === 0`), 'Kóli greets in Danish');
      await openGame('litir');
      assert(await cdp.eval(`document.querySelector('#game .bubble-text').textContent === 'Hvilken farve er det?'`), 'Danish prompt');
      await toMenu();
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
      assert(await cdp.eval(`localStorage.getItem('kl.stars.tolur.1') === null`), 'stars gone');
      assert(await cdp.eval(`KL.stickers().length === 1`), 'sticker book back to Kóli');
    });

    await test('narrow screen (390px): no horizontal overflow', async () => {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
      const fits = `document.documentElement.scrollWidth <= window.innerWidth + 1`;
      await waitFor(fits, 'menu fits');
      await shot('menu-mobile');
      await openGame('minni');
      await pickLevel(0);
      await waitFor(`document.querySelectorAll('.mcard').length === 12`, 'board');
      assert(await cdp.eval(fits), 'memory board fits');
      await shot('minni-mobile');
      await toMenu();
      await openGame('talnatafla');
      assert(await cdp.eval(fits), 'hundred chart fits (scrolls inside)');
      await toMenu();
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await test('offline: app loads from cache, stray URL falls back to the app', async () => {
      await waitFor(`navigator.serviceWorker.controller !== null`, 'service worker controls the page', 30000);
      await waitFor(`caches.match('./').then((r) => !!r)`, 'app shell cached');
      offline = true;
      await cdp.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' });
      await cdp.send('Page.reload');
      await waitForApp();
      await openGame('tolur');
      await waitFor(`document.querySelectorAll('.level-btn').length === 2`, 'game opens offline');
      await toMenu();
      await cdp.send('Page.navigate', { url: base + '/no-such-page' });
      await waitForApp();
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
