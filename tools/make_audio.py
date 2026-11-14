#!/usr/bin/env python3
"""Generate the spoken audio for krakkaleikir (neural TTS mp3s).

The list of clips comes from audioVocab() in js/i18n.js (audio key -> text per
language). Each clip is synthesized with Edge neural TTS into
audio/<lang>/<key>.mp3 (UTF-8 file name; the browser asks for it percent-encoded)
and the silence Edge puts before and after the speech is cut away (lossless, at
mp3 frame boundaries), so clips played one after another flow without gaps.
Single words for the reading game (word.*) are said inside a short sentence
("Hlustaðu: mús.") and cut out using Edge's word timings, so the engine always
reads them as words, with a natural ending, never as letter-by-letter abbreviations.

audio/manifest.json records the text and settings each mp3 was made from: a clip
whose text or settings changed is regenerated, and mp3s for keys that no longer
exist are deleted. Afterwards run `node tools/check.js --write`.

Usage:   python tools/make_audio.py
Requires: node, pip install edge-tts imageio-ffmpeg (or an ffmpeg on PATH)
"""
import asyncio
import json
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n.js"
OUT_AUDIO = ROOT / "audio"
RECORD = OUT_AUDIO / "manifest.json"

# Kóli has the same (male) voice in both languages: his Icelandic cheers are
# mixed into Danish sentences. da-DK-ChristelNeural returns no audio (2026-11).
VOICES = {
    "is": ["is-IS-GunnarNeural"],
    "da": ["da-DK-JeppeNeural"],
}
RATE = "-8%"            # a little slower, friendlier for small kids
LEAD, TAIL = 0.05, 0.12  # seconds of silence kept before / after the speech
SETTINGS = {"voices": VOICES, "rate": RATE, "trim": [LEAD, TAIL]}
CARRIER = {"is": "Hlustaðu: {w}.", "da": "Lyt: {w}.", "cut": "-0.01s re-encoded, blips dropped"}  # sentence a word.* clip is cut from


def load_vocab() -> dict:
    """lang -> {audio_key: text}, from audioVocab() in js/i18n.js."""
    probe = """
      const fs = require('fs'), vm = require('vm');
      const ctx = { localStorage: { getItem: () => null, setItem() {} },
                    document: { documentElement: {}, addEventListener() {}, querySelectorAll: () => [] } };
      ctx.window = ctx; vm.createContext(ctx);
      vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), ctx);
      const I = ctx.KL_I18N, out = {};
      for (const l of I.LANGS) out[l] = I.audioVocab(l);
      console.log(JSON.stringify(out));
    """
    res = subprocess.run(["node", "-e", probe, str(I18N)], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        exe = shutil.which("ffmpeg")
        if not exe:
            sys.exit("needs ffmpeg: pip install imageio-ffmpeg")
        return exe


def trim(ff: str, src: Path, dest: Path) -> None:
    """Cut leading/trailing silence without re-encoding."""
    out = subprocess.run([ff, "-hide_banner", "-i", str(src), "-af", "silencedetect=noise=-45dB:d=0.04", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    # stretches of sound between the silences; a blip under 50 ms set apart by
    # silence (e.g. the tail of the carrier's lead-in word) is not speech
    segs, t = [], 0.0
    for s0, s1 in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if s0 - t > 0.005:
            segs.append((t, s0))
        t = s1
    if dur - t > 0.005:
        segs.append((t, dur))
    while len(segs) > 1 and segs[0][1] - segs[0][0] < 0.05:
        segs.pop(0)
    while len(segs) > 1 and segs[-1][1] - segs[-1][0] < 0.05:
        segs.pop()
    begin, finish = (segs[0][0], segs[-1][1]) if segs else (0.0, dur)
    a, b = max(0.0, begin - LEAD), min(dur, finish + TAIL)
    subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
                    "-c", "copy", "-map_metadata", "-1", str(dest)], check=True)


async def synth(text: str, voice: str, dest: Path) -> list:
    """Synthesize text into dest; return the word timings [(word, start_s, dur_s)]."""
    words = []
    c = edge_tts.Communicate(text, voice, rate=RATE, boundary="WordBoundary")
    with open(dest, "wb") as f:
        async for chunk in c.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append((chunk["text"], chunk["offset"] / 1e7, chunk["duration"] / 1e7))
    return words


def cut_from(ff: str, src: Path, start: float, dest: Path) -> None:
    """Keep src from start (seconds, sample-accurate) to the end, with a 20 ms fade-in.
    Re-encodes: the pause before the word can be under 0.1 s, finer than mp3 frames."""
    subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{max(0.0, start):.3f}", "-i", str(src),
                    "-af", "afade=t=in:d=0.02", "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "64k",
                    "-map_metadata", "-1", str(dest)], check=True)


def load_record() -> dict:
    try:
        return json.loads(RECORD.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def prune(vocab: dict, record: dict) -> None:
    """Delete mp3s whose key is gone or whose text/settings changed, so they get (re)generated."""
    same_settings = record.get("settings") == json.loads(json.dumps(SETTINGS))
    same_carrier = record.get("carrier") == CARRIER
    for lang in VOICES:
        folder = OUT_AUDIO / lang
        if not folder.is_dir():
            continue
        v = vocab.get(lang, {})
        old = record.get(lang, {})
        for mp3 in folder.glob("*.mp3"):
            key = unicodedata.normalize("NFC", mp3.stem)
            if key not in v:
                print(f"  delete {lang}/{mp3.name} (no longer used)")
                mp3.unlink()
            elif not same_settings or old.get(key) != v[key] or (key.startswith("word.") and not same_carrier):
                mp3.unlink()


async def generate(vocab: dict) -> int:
    ff = ffmpeg_exe()
    tmpdir = Path(tempfile.mkdtemp(prefix="kl_tts_"))
    todo = [(lang, k, t) for lang, v in vocab.items() for k, t in v.items()
            if not (OUT_AUDIO / lang / (k + ".mp3")).exists()]
    print(f"{len(todo)} clips to generate")
    failed = 0
    for n, (lang, key, text) in enumerate(todo, 1):
        dest = OUT_AUDIO / lang / (key + ".mp3")
        dest.parent.mkdir(parents=True, exist_ok=True)
        raw = tmpdir / "raw.mp3"
        carrier = key.startswith("word.")
        ok = False
        for voice in VOICES[lang]:
            for attempt in range(5):
                try:
                    if carrier:
                        timings = await synth(CARRIER[lang].format(w=text), voice, tmpdir / "sentence.mp3")
                        hits = [t for t in timings if t[0].strip(".:,!").lower() == text.lower()]
                        if not hits:
                            raise RuntimeError(f"no timing for {text!r} in {timings}")
                        cut_from(ff, tmpdir / "sentence.mp3", hits[-1][1] - 0.01, raw)
                    else:
                        await synth(text, voice, raw)
                    if raw.stat().st_size > 1000:
                        ok = True
                        break
                except Exception as e:  # network hiccups, throttling
                    print(f"  retry {attempt + 1} {voice} {key}: {type(e).__name__}", file=sys.stderr)
                    await asyncio.sleep(2 + attempt * 2)
            if ok:
                break
        if not ok:
            print(f"FAILED {lang}/{key}", file=sys.stderr)
            failed += 1
            continue
        trim(ff, raw, dest)
        if n % 25 == 0 or n == len(todo):
            print(f"  {n}/{len(todo)}  {lang}/{key}: {text}", flush=True)
    shutil.rmtree(tmpdir, ignore_errors=True)
    return failed


def main() -> None:
    vocab = load_vocab()
    prune(vocab, load_record())
    failed = asyncio.run(generate(vocab))
    # A missing mp3 is regenerated on the next run whatever the record says.
    RECORD.write_text(json.dumps({"settings": SETTINGS, "carrier": CARRIER, **vocab}, ensure_ascii=False, indent=1) + "\n",
                      encoding="utf-8")
    total = sum(len(v) for v in vocab.values())
    size = sum(p.stat().st_size for p in OUT_AUDIO.rglob("*.mp3"))
    print(f"{total} clips ({size / 1e6:.1f} MB); record: {RECORD.relative_to(ROOT)}")
    if failed:
        sys.exit(f"{failed} clips failed; re-run to fill the gaps")


if __name__ == "__main__":
    main()
