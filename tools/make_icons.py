#!/usr/bin/env python3
"""Generate the krakkaleikir app icons (full-bleed; iOS rounds the corners itself).

Usage: python tools/make_icons.py   (writes icons/icon-192.png and icons/icon-512.png)
Requires Pillow.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"

TOP = (224, 122, 95)      # #E07A5F
BOTTOM = (242, 166, 90)   # #F2A65A
BALL = (255, 255, 255)
INK = (61, 64, 91)        # #3D405B


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        row = lerp(TOP, BOTTOM, y / max(size - 1, 1))
        for x in range(size):
            px[x, y] = row

    d = ImageDraw.Draw(img)
    cx, cy, r = size / 2, size / 2 + size * 0.02, size * 0.30

    # ball with a simple smiling face
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BALL)
    eye_r = size * 0.028
    eye_dx = r * 0.38
    eye_y = cy - r * 0.10
    d.ellipse([cx - eye_dx - eye_r, eye_y - eye_r, cx - eye_dx + eye_r, eye_y + eye_r], fill=INK)
    d.ellipse([cx + eye_dx - eye_r, eye_y - eye_r, cx + eye_dx + eye_r, eye_y + eye_r], fill=INK)
    d.arc([cx - r * 0.42, cy - r * 0.05, cx + r * 0.42, cy + r * 0.75], start=15, end=165,
          fill=INK, width=max(2, int(size * 0.022)))
    # highlight
    d.ellipse([cx - r * 0.62, cy - r * 0.78, cx - r * 0.18, cy - r * 0.48],
              fill=(255, 255, 255))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    big = make_icon(512)
    big.save(OUT / "icon-512.png", optimize=True)
    big.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
    print("wrote", OUT / "icon-512.png", "and", OUT / "icon-192.png")


if __name__ == "__main__":
    main()
