#!/usr/bin/env python3
"""Generate the spoken-audio vocabulary for krakkaleikir (neural TTS mp3s).

Reads the string tables from js/i18n.js, synthesizes every spoken key with
Edge neural TTS (da-DK-ChristelNeural / is-IS-GudrunNeural) into
audio/<lang>/<key>.mp3 (UTF-8 filename; the browser requests it percent-encoded and the server decodes it), and writes js/audio-manifest.js mapping
key -> text per language (used as the Web Speech fallback).

Usage:
    python tools/make_audio.py            # Edge TTS (no key needed)
    MISTRAL_API_KEY=sk-... python tools/make_audio.py   # Mistral Voxtral TTS instead
                                                      # (note: Voxtral language
                                                      # coverage may not include da/is)

Requires: pip install edge-tts requests
"""
import asyncio
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n.js"
OUT_AUDIO = ROOT / "audio"
OUT_MANIFEST = ROOT / "js" / "audio-manifest.js"

VOICES = {
    "da": ["da-DK-JeppeNeural", "da-DK-ChristelNeural"],
    "is": ["is-IS-GudrunNeural", "is-IS-GunnarNeural"],
}
RATE = "-8%"  # slightly slower, friendlier for kids

PHRASE_KEYS = [
    "tolur.count_q", "tolur.plus", "tolur.add_q",
    "bokstafir.q", "litir.q", "form.q",
    "klukkan.read_q", "klukkan.set_a", "klukkan.set_b", "klukkan.clock_is_a",
    "minni.start", "minni.end_title", "end.title", "try_again",
] + [f"praise.{i}" for i in range(6)]


def load_tables() -> dict:
    """Evaluate js/i18n.js in node with stubs and dump STR/ALPHABETS/LETTER_NAMES."""
    js = """
      const fs = require('fs');
      global.window = global;
      global.localStorage = { getItem: () => null, setItem: () => {} };
      global.document = { documentElement: {}, addEventListener: () => {}, querySelectorAll: () => [] };
      eval(fs.readFileSync(process.argv[1], 'utf8'));
      const s = {};
      for (const lang of ['is','da']) {
        const d = {};
        for (const k of Object.keys(KL_I18N.t('x') === 'x' ? {} : {})) {}
        // dump STR via t() over a known key list is awkward; expose via closure instead
      }
      console.log(JSON.stringify({ KL: { ALPHABETS: KL_I18N.ALPHABETS, LETTER_NAMES: KL_I18N.LETTER_NAMES } }));
    """
    # simpler: grab STR by evaluating the file and reading the internal table through a probe
    probe = """
      const fs = require('fs');
      global.window = global;
      global.localStorage = { getItem: () => null, setItem: () => {} };
      global.document = { documentElement: {}, addEventListener: () => {}, querySelectorAll: () => [] };
      eval(fs.readFileSync(process.argv[1], 'utf8'));
      // STR is private; rebuild it by probing keys parsed from the source
      const src = fs.readFileSync(process.argv[1], 'utf8');
      const keys = [...new Set([...src.matchAll(/'([^']+)'\\s*:/g)].map(m => m[1]))];
      const out = { is: {}, da: {} };
      global.localStorage.getItem = (k) => k === 'kl.lang' ? 'is' : null;
      for (const k of keys) out.is[k] = KL_I18N.t(k);
      global.localStorage.getItem = (k) => k === 'kl.lang' ? 'da' : null;
      for (const k of keys) out.da[k] = KL_I18N.t(k);
      console.log(JSON.stringify({ STR: out, ALPHABETS: KL_I18N.ALPHABETS, LETTER_NAMES: KL_I18N.LETTER_NAMES }));
    """
    res = subprocess.run(["node", "-e", probe, str(I18N)], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def build_vocab(tables: dict) -> dict:
    """lang -> {audio_key: text_to_speak}"""
    vocab = {}
    for lang in ("is", "da"):
        strs = tables["STR"][lang]
        v = {}
        for k in PHRASE_KEYS:
            v[k] = strs[k]
        for i in range(1, 13):
            v[f"num.{i}"] = strs[f"num.{i}"]
        for k, val in strs.items():
            if k.startswith("color.") or k.startswith("shape."):
                v[k] = val
        for letter in tables["ALPHABETS"][lang]:
            name = tables["LETTER_NAMES"].get(lang, {}).get(letter, letter)
            v[f"letter.{letter}"] = name
        vocab[lang] = v
    return vocab


async def gen_edge(vocab: dict) -> None:
    import edge_tts

    sem = asyncio.Semaphore(1)  # Edge throttles aggressively; go sequential

    async def one(lang: str, key: str, text: str) -> None:
        dest = OUT_AUDIO / lang / (key + ".mp3")
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size > 1000:
            return
        async with sem:
            for voice in VOICES[lang]:
                for attempt in range(6):
                    try:
                        c = edge_tts.Communicate(text, voice, rate=RATE)
                        await c.save(str(dest))
                        if dest.stat().st_size > 1000:
                            return
                    except Exception as e:
                        print(f"  retry {attempt+1} {voice} {key}: {type(e).__name__}", file=sys.stderr)
                        await asyncio.sleep(2 + attempt * 2)
            raise RuntimeError(f"failed to generate {lang} {key}")

    tasks = [one(lang, k, t) for lang, v in vocab.items() for k, t in v.items()]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    failed = [r for r in results if isinstance(r, Exception)]
    for r in failed:
        print(f"FAILED: {r}", file=sys.stderr)
    if failed:
        raise RuntimeError(f"{len(failed)} files failed; re-run to fill gaps")


def gen_mistral(vocab: dict) -> None:
    """Alternative provider: Mistral Voxtral TTS. Requires MISTRAL_API_KEY.
    Note: Voxtral's supported languages may not include Danish/Icelandic."""
    import requests

    key = os.environ["MISTRAL_API_KEY"]
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    for lang, v in vocab.items():
        for k, text in v.items():
            dest = OUT_AUDIO / lang / (k + ".mp3")
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists() and dest.stat().st_size > 1000:
                continue
            r = requests.post(
                "https://api.mistral.ai/v1/audio/speech",
                headers=headers,
                json={"model": "voxtral-mini-tts-2507", "input": text, "voice": "default"},
                timeout=60,
            )
            r.raise_for_status()
            dest.write_bytes(r.content)


def main() -> None:
    tables = load_tables()
    vocab = build_vocab(tables)
    if os.environ.get("MISTRAL_API_KEY"):
        print("provider: Mistral Voxtral TTS")
        gen_mistral(vocab)
    else:
        print("provider: Edge neural TTS (set MISTRAL_API_KEY to use Mistral instead)")
        try:
            asyncio.run(gen_edge(vocab))
        except RuntimeError:
            pass  # manifest is still written below; re-run fills the gaps

    manifest = "window.KL_AUDIO = " + json.dumps(vocab, ensure_ascii=False, indent=1) + ";\n"
    OUT_MANIFEST.write_text(manifest)
    total = sum(len(v) for v in vocab.values())
    size = sum(p.stat().st_size for p in OUT_AUDIO.rglob("*.mp3"))
    print(f"wrote {total} mp3 files ({size/1e6:.1f} MB) and {OUT_MANIFEST}")


if __name__ == "__main__":
    main()
