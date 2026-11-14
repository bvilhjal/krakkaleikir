#!/usr/bin/env python3
"""Generate the spoken-audio vocabulary for krakkaleikir (neural TTS mp3s).

Reads the string tables from js/i18n.js, synthesizes every spoken key with
Edge neural TTS (is-IS-GudrunNeural / da-DK-JeppeNeural, with a second voice as
fallback) into audio/<lang>/<key>.mp3 (UTF-8 filename; the browser requests it
percent-encoded and the server decodes it), and writes js/audio-manifest.js
mapping key -> text per language (also used as the Web Speech fallback).

The previous manifest records which text each mp3 was made from: an mp3 whose
text changed in js/i18n.js is regenerated, and mp3s for keys that no longer
exist are deleted. Afterwards run `node tools/check.js --write` to refresh the
offline file list in sw.js.

Usage:
    python tools/make_audio.py            # Edge TTS (no key needed)
    MISTRAL_API_KEY=sk-... python tools/make_audio.py   # Mistral Voxtral TTS instead
                                                      # (note: Voxtral language
                                                      # coverage may not include da/is)

Requires: node, pip install edge-tts (or requests for Mistral)
"""
import asyncio
import json
import os
import subprocess
import sys
import unicodedata
from pathlib import Path

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
    "tolur.count_q", "tolur.plus", "tolur.minus", "tolur.add_q",
    "bokstafir.q", "litir.q", "form.q",
    "klukkan.read_q", "klukkan.set_a", "klukkan.set_b", "klukkan.pick_b", "klukkan.clock_is_a",
    "minni.start", "minni.end_title", "end.title", "try_again",
] + [f"praise.{i}" for i in range(6)]
SPOKEN_PREFIXES = ("num.", "hour.", "half.", "color.", "shape.")


def load_tables() -> dict:
    """Evaluate js/i18n.js in node with stubs and dump the string tables and syllables."""
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
      for (const lang of ['is', 'da']) {
        global.localStorage.getItem = (k) => k === 'kl.lang' ? lang : null;
        for (const k of keys) out[lang][k] = KL_I18N.t(k);
      }
      console.log(JSON.stringify({ STR: out, SYLLABLES: KL_I18N.SYLLABLES }));
    """
    res = subprocess.run(["node", "-e", probe, str(I18N)], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def build_vocab(tables: dict) -> dict:
    """lang -> {audio_key: text_to_speak}"""
    vocab = {}
    for lang in ("is", "da"):
        strs = tables["STR"][lang]
        v = {k: strs[k] for k in PHRASE_KEYS}
        for k, val in strs.items():
            if k.startswith(SPOKEN_PREFIXES):
                v[k] = val
        for syl in tables["SYLLABLES"][lang]:
            v[f"syl.{syl}"] = syl
        vocab[lang] = v
    return vocab


def load_old_manifest() -> dict:
    try:
        text = OUT_MANIFEST.read_text(encoding="utf-8")
        return json.loads(text[text.index("{"):text.rindex("}") + 1])
    except (OSError, ValueError):
        return {}


def prune(vocab: dict, old: dict) -> None:
    """Delete mp3s whose key is gone or whose text changed, so they get (re)generated."""
    for lang, v in vocab.items():
        folder = OUT_AUDIO / lang
        if not folder.is_dir():
            continue
        for mp3 in folder.glob("*.mp3"):
            key = unicodedata.normalize("NFC", mp3.stem)
            if key not in v:
                print(f"  delete orphan {lang}/{mp3.name}")
                mp3.unlink()
            elif old.get(lang, {}).get(key) != v[key]:
                print(f"  text changed, regenerate {lang}/{mp3.name}")
                mp3.unlink()


async def gen_edge(vocab: dict) -> None:
    import edge_tts

    sem = asyncio.Semaphore(1)  # Edge throttles aggressively; go sequential

    async def one(lang: str, key: str, text: str) -> None:
        dest = OUT_AUDIO / lang / (key + ".mp3")
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size > 1000:
            return
        async with sem:
            print(f"  generate {lang}/{key}: {text}")
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
    vocab = build_vocab(load_tables())
    prune(vocab, load_old_manifest())
    failed = False
    if os.environ.get("MISTRAL_API_KEY"):
        print("provider: Mistral Voxtral TTS")
        gen_mistral(vocab)
    else:
        print("provider: Edge neural TTS (set MISTRAL_API_KEY to use Mistral instead)")
        try:
            asyncio.run(gen_edge(vocab))
        except RuntimeError as e:
            failed = True
            print(e, file=sys.stderr)

    # A missing mp3 is regenerated on the next run whatever the manifest says,
    # so the manifest can always be written.
    manifest = "window.KL_AUDIO = " + json.dumps(vocab, ensure_ascii=False, indent=1) + ";\n"
    OUT_MANIFEST.write_text(manifest, encoding="utf-8")
    total = sum(len(v) for v in vocab.values())
    size = sum(p.stat().st_size for p in OUT_AUDIO.rglob("*.mp3"))
    print(f"wrote manifest for {total} mp3 files ({size/1e6:.1f} MB): {OUT_MANIFEST}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
