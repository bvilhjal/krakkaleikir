#!/usr/bin/env node
/* Audition and measure every animal voice (js/sound.js + audio/animals/*.mp3).
   No dependencies; needs Node >= 22 and Chrome/Chromium (CHROME_PATH overrides).

     node tools/audition.js [--out DIR] [--only id,id]

   Synthesized voices are rendered with OfflineAudioContext — the exact functions
   the app plays. Local audio clips (AI-generated CC0 effects and real
   recordings, see audio/animals/credits.json) are decoded with the browser's own Web Audio (the same
   pipeline the app uses). Each is written as a 16-bit WAV preview
   (default: ../krakkaleikir-sounds-preview, outside the repo so nothing ships)
   and measured: spectral peak, band energies, phrase count, trill rate and a
   pitch contour. Synthesized voices are asserted to still have the character of
   their animal (frog: low trilled croak; owl: two soft hoots; mouse/chick: high
   chirps; penguin: mid bray; fish: bubbles; ladybug: wing flutter). Recorded
   clips are reported, not asserted. Exit 1 on any failed check. */
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
const argVal = (flag) => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : null; };
const OUT = path.resolve(argVal('--out') || path.join(ROOT, '..', 'krakkaleikir-sounds-preview'));
const ONLY = (argVal('--only') || '').split(',').filter(Boolean);

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const c of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium']) if (fs.existsSync(c)) return c;
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

/* Page-side: one analyzer used for both rendered and decoded audio. */
const PAGE_SETUP = `
window.__kl = (function () {
  function pitchContour(x, sr, lo, hi) {
    const frame = Math.round(sr * 0.03), hop = Math.round(sr * 0.02);
    const minLag = Math.floor(sr / 1200), maxLag = Math.floor(sr / 120);
    const out = [];
    for (let s = lo; s + frame < hi; s += hop) {
      let rms = 0; for (let i = s; i < s + frame; i++) rms += x[i] * x[i];
      rms = Math.sqrt(rms / frame);
      if (rms < 0.01) { out.push({ t: s / sr, f0: 0 }); continue; }
      let best = 0, bestLag = 0;
      for (let lag = minLag; lag <= maxLag; lag++) {
        let c = 0, n1 = 0, n2 = 0;
        for (let i = s; i < s + frame - lag; i++) { c += x[i] * x[i + lag]; n1 += x[i] * x[i]; n2 += x[i + lag] * x[i + lag]; }
        const n = c / Math.sqrt(n1 * n2 + 1e-9);
        if (n > best) { best = n; bestLag = lag; }
      }
      out.push({ t: s / sr, f0: best > 0.45 ? sr / bestLag : 0 });
    }
    return out;
  }

  function analyze(x, sr) {
    const N = 32768, re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < Math.min(x.length, N); i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; }
    }
    for (let len = 2; len <= N; len <<= 1) {
      const wr = Math.cos(-2 * Math.PI / len), wi = Math.sin(-2 * Math.PI / len);
      for (let i = 0; i < N; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k];
          const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
          const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi;
          re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
    const binHz = sr / N;
    let peak = 0, peakF = 0, total = 0;
    const bands = { low: 0, mid: 0, high: 0, air: 0 };
    for (let i = 1; i < N / 2; i++) {
      const m2 = re[i] * re[i] + im[i] * im[i], f = i * binHz;
      total += m2;
      if (m2 > peak && f > 30) { peak = m2; peakF = f; }
      if (f < 500) bands.low += m2; else if (f < 1500) bands.mid += m2;
      else if (f < 4000) bands.high += m2; else bands.air += m2;
    }
    const win = Math.round(sr * 0.01), env = new Float64Array(x.length);
    let sum = 0;
    for (let i = 0; i < x.length; i++) { sum += Math.abs(x[i]); if (i >= win) sum -= Math.abs(x[i - win]); env[i] = sum / Math.min(i + 1, win); }
    let emax = 0; for (let i = 0; i < env.length; i++) emax = Math.max(emax, env[i]);
    const thr = emax * 0.15, minLen = sr * 0.02, mergeGap = sr * 0.04;
    const runs = []; let start = -1;
    for (let i = 0; i < env.length; i++) {
      if (env[i] > thr && start < 0) start = i;
      if ((env[i] <= thr || i === env.length - 1) && start >= 0) { runs.push([start, i]); start = -1; }
    }
    const merged = [];
    for (const r of runs) { if (merged.length && r[0] - merged[merged.length - 1][1] < mergeGap) merged[merged.length - 1][1] = r[1]; else merged.push(r); }
    const bursts = merged.filter((r) => r[1] - r[0] >= minLen).length;
    const slowWin = Math.round(sr * 0.06), hp = new Float64Array(env.length);
    let acc = 0;
    for (let i = 0; i < env.length; i++) { acc += env[i]; if (i >= slowWin) acc -= env[i - slowWin]; hp[i] = env[i] - acc / Math.min(i + 1, slowWin); }
    let bestP = 0, amRate = 0;
    for (let f = 15; f <= 60; f++) {
      const coeff = 2 * Math.cos(2 * Math.PI * f / sr);
      let s1 = 0, s2 = 0;
      for (let i = 0; i < hp.length; i++) { const s0 = hp[i] + coeff * s1 - s2; s2 = s1; s1 = s0; }
      const p = s1 * s1 + s2 * s2 - coeff * s1 * s2;
      if (p > bestP) { bestP = p; amRate = f; }
    }
    // pitch over the active region only — rendered silence must not dilute voicing
    let actLo = 0, actHi = env.length;
    for (let i = 0; i < env.length; i++) { if (env[i] > thr) { actLo = i; break; } }
    for (let i = env.length - 1; i >= 0; i--) { if (env[i] > thr) { actHi = i; break; } }
    const pitch = pitchContour(x, sr, actLo, actHi);
    const voiced = pitch.filter((p) => p.f0 > 0).map((p) => p.f0);
    const vavg = voiced.length ? voiced.reduce((a, b) => a + b, 0) / voiced.length : 0;
    return {
      dur: (actHi - actLo) / sr, peakHz: Math.round(peakF),
      low: bands.low / total, mid: bands.mid / total, high: bands.high / total, air: bands.air / total,
      bursts, amRate, rms: Math.sqrt(x.reduce((a, v) => a + v * v, 0) / x.length),
      voicedFrac: voiced.length / Math.max(1, pitch.length),
      f0min: voiced.length ? Math.round(Math.min(...voiced)) : 0,
      f0max: voiced.length ? Math.round(Math.max(...voiced)) : 0,
      f0avg: Math.round(vavg),
      f0start: voiced.length ? Math.round(voiced[0]) : 0,
      f0end: voiced.length ? Math.round(voiced[voiced.length - 1]) : 0
    };
  }

  function wav(x, sr) {
    const n = x.length, bytes = 44 + n * 2, b = new Uint8Array(bytes), dv = new DataView(b.buffer);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    str(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, x[i])); dv.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
    let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    return btoa(s);
  }

  return {
    renderVoice: async function (id) {
      const sr = 24000, dur = 1.6;
      const oc = new OfflineAudioContext(1, Math.ceil(sr * dur), sr);
      const nodes = KL_SOUND.synth(id, oc, oc.destination);
      if (!nodes || !nodes.length) throw new Error('no synth for ' + id);
      const x = (await oc.startRendering()).getChannelData(0);
      return { wav: wav(x, sr), stats: analyze(x, sr) };
    },
    analyzeFile: async function (url) {
      const buf = await (await fetch(url)).arrayBuffer();
      const oc = new OfflineAudioContext(1, 1, 24000);
      const audio = await oc.decodeAudioData(buf);
      const x = audio.getChannelData(0);
      return { wav: wav(x, audio.sampleRate), stats: analyze(x, audio.sampleRate) };
    }
  };
})();
`;

const CHECKS = {
  froskur: { desc: 'low trilled ribbit', test: (s) => s.low > 0.5 && s.bursts >= 2 && s.amRate >= 22 && s.amRate <= 33 },
  ungi: { desc: 'high cheeps', test: (s) => s.high + s.air > 0.5 && s.bursts >= 3 },
  fiskur: { desc: 'discrete low bubbles', test: (s) => s.bursts >= 4 && s.low + s.mid > 0.7 },
  mariuhaena: { desc: 'continuous fast wing flutter', test: (s) => s.bursts >= 1 && s.amRate >= 32 && s.amRate <= 50 },
  ugla: { desc: 'two soft low hoots', test: (s) => s.peakHz >= 250 && s.peakHz <= 400 && s.bursts === 2 && s.high + s.air < 0.1 },
  mus: { desc: 'high squeaks', test: (s) => s.high + s.air > 0.6 && s.bursts >= 3 },
  morgaes: { desc: 'mid-range bray, two phrases', test: (s) => s.peakHz >= 250 && s.peakHz <= 1300 && s.bursts >= 2 }
};
const LOCAL_CLIPS = ['koala', 'kottur', 'svin', 'bjorn', 'ljon', 'hundur', 'kyr', 'kind', 'hestur', 'ond', 'fill', 'api', 'byfluga'];

async function main() {
  const exe = findChrome();
  const srv = await serve();
  const base = 'http://localhost:' + srv.address().port;
  const dbg = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kl-audition-'));
  const chrome = spawn(exe, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--remote-debugging-port=' + dbg, '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore' });
  const killer = setTimeout(() => { console.error('audition timed out'); try { chrome.kill('SIGKILL'); } catch (e) {} process.exit(1); }, 180000);
  let failed = 0;
  try {
    let target = null;
    for (let i = 0; i < 100 && !target; i++) {
      await sleep(200);
      try {
        const list = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json();
        target = list.find((t) => t.type === 'page' && t.url === 'about:blank') || list.find((t) => t.type === 'page');
      } catch (e) { /* starting */ }
    }
    if (!target) throw new Error('headless Chrome did not start');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', () => rej(new Error('CDP connect failed'))); });
    let seq = 0; const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== undefined && pending.has(m.id)) { const cb = pending.get(m.id); pending.delete(m.id); cb(m); }
    });
    const send = (method, params = {}) => new Promise((res, rej) => {
      const id = ++seq; pending.set(id, res);
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('CDP timeout: ' + method)); } }, 90000);
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const m = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (m.result.exceptionDetails) {
        const d = m.result.exceptionDetails.exception;
        throw new Error((d && (d.description || d.value)) || m.result.exceptionDetails.text);
      }
      return m.result.result.value;
    };
    await send('Page.enable');
    await send('Page.navigate', { url: base + '/' });
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`document.readyState === 'complete' && typeof KL_SOUND !== 'undefined'`)) break;
      await sleep(150);
    }
    await evaluate(PAGE_SETUP);
    fs.mkdirSync(OUT, { recursive: true });
    console.log('auditioning animal voices -> ' + OUT);
    const pct = (v) => (v * 100).toFixed(0).padStart(4);
    const want = (id) => !ONLY.length || ONLY.includes(id);

    console.log('\nSYNTHESIZED (asserted)');
    console.log('voice        peak Hz   <500  500-1.5k  >1.5k   phrases  trill Hz   f0 arc          voiced  rms     result');
    for (const id of Object.keys(CHECKS)) {
      if (!want(id)) continue;
      const r = await evaluate(`__kl.renderVoice(${JSON.stringify(id)})`);
      fs.writeFileSync(path.join(OUT, id + '.wav'), Buffer.from(r.wav, 'base64'));
      const s = r.stats, ok = CHECKS[id].test(s);
      if (!ok) failed++;
      console.log(id.padEnd(12) + String(s.peakHz).padStart(7) + '  ' + pct(s.low) + '  ' + pct(s.mid) + '  ' + pct(s.high + s.air) +
        '   ' + String(s.bursts).padStart(5) + '   ' + String(s.amRate).padStart(6) + '   ' +
        (s.f0start + '->' + s.f0max + '->' + s.f0end).padStart(14) + '  ' + pct(s.voicedFrac) + '  ' + s.rms.toFixed(3) + '   ' +
        (ok ? 'ok (' + CHECKS[id].desc + ')' : 'FAIL (expected ' + CHECKS[id].desc + ')'));
    }

    console.log('\nLOCAL CLIPS (reported; pitch contour shows the vocal arc)');
    console.log('voice        dur s   peak Hz   f0 start->peak->end   voiced   result');
    for (const id of LOCAL_CLIPS) {
      if (!want(id)) continue;
      const r = await evaluate(`__kl.analyzeFile(${JSON.stringify('audio/animals/' + id + '.mp3')})`);
      fs.writeFileSync(path.join(OUT, id + '.wav'), Buffer.from(r.wav, 'base64'));
      const s = r.stats;
      console.log(id.padEnd(12) + s.dur.toFixed(2).padStart(6) + '  ' + String(s.peakHz).padStart(7) + '   ' +
        (s.f0start + '->' + s.f0max + '->' + s.f0end).padStart(16) + '   ' + pct(s.voicedFrac) + '   recorded');
    }
    ws.close();
  } catch (e) {
    failed++;
    console.error('audition aborted: ' + e.message);
  } finally {
    clearTimeout(killer);
    try { chrome.kill('SIGTERM'); } catch (e) { /* gone */ }
    setTimeout(() => { try { chrome.kill('SIGKILL'); } catch (e) { /* gone */ } }, 3000).unref();
    srv.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
  if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
  console.log('\nall synthesized voices measured true');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
