#!/usr/bin/env python3
"""Put a render that sits on white onto the page's own ground colour.

    python ground.py in.png out.webp --ground f5f5f3 [--width 1600] [--pad 0.05] [--edge 0.012]

CAD screenshots and product renders usually come on a white or near-white
background. Placed on an off-white page they show a faint box. This lifts the
near-white to pure white, trims the empty margin around the subject, multiplies
the picture onto the ground colour and saves it lossless, since lossy WebP or
JPEG shifts a flat background by a shade and the box comes back.
Needs Pillow.
"""
import argparse
import os

from PIL import Image, ImageChops


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--ground", default="f5f5f3", help="page colour as hex, no #")
    ap.add_argument("--width", type=int, default=1600, help="largest width to keep")
    ap.add_argument("--pad", type=float, default=0.05, help="space kept around the subject")
    ap.add_argument("--edge", type=float, default=0.012, help="share cut off each edge first, for stray lines")
    ap.add_argument("--white", type=int, default=236, help="anything this light or lighter becomes white")
    a = ap.parse_args()

    ground = tuple(int(a.ground.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    im = Image.open(a.src).convert("RGB")
    w, h = im.size
    e = int(min(w, h) * a.edge)
    im = im.crop((e, e, w - e, h - e))
    im = im.point(lambda v: min(255, round(v * 255 / a.white)))

    mask = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 12 else 0)
    box = mask.getbbox()
    if box:
        left, top, right, bottom = box
        p = int(max(right - left, bottom - top) * a.pad)
        im = im.crop((max(0, left - p), max(0, top - p), min(im.width, right + p), min(im.height, bottom + p)))

    im = ImageChops.multiply(im, Image.new("RGB", im.size, ground))
    if im.width > a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)

    ext = os.path.splitext(a.out)[1].lower()
    if ext == ".webp":
        im.save(a.out, "WEBP", lossless=True, method=6)
    else:
        im.save(a.out)
    print(f"{a.out}: {im.width}x{im.height}, {os.path.getsize(a.out) // 1024} KB")


if __name__ == "__main__":
    main()
