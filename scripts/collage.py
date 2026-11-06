#!/usr/bin/env python3
"""Turn a picture into a collage cut-out: remove the background, tint it, add backing shapes.

    python collage.py in.png out.webp --dark 0A2343 --accent 1767CE --backing grid,circle

--cut auto    picks flat for plain backgrounds, photo for everything else
--cut flat    removes a plain or near-plain background (product renders)
--cut photo   uses GrabCut, for a subject that is clear of the frame edges
--cut none    keeps the file's own transparency (for a hand-made cut-out)

Three tall bars with the subject on each, from one picture or three:

    python collage.py in.png out.webp --triptych 1767CE,8129E5,DB3627
    python collage.py a.png b.png c.png out.webp --triptych 1767CE,8129E5,DB3627
"""
import argparse

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

CANVAS = (1000, 750)
SS = 2  # shapes are drawn at twice the size, then shrunk, for smooth edges

PALETTES = {
    "ttm": {"dark": "0A0A0A", "light": "F8F8F9", "accent": "B56A20", "bg": "F0F0F2"},
    "steel": {"dark": "0A2343", "light": "FFFFFF", "accent": "1767CE", "bg": "EEF5FF"},
    "violet": {"dark": "2A0E55", "light": "FFFFFF", "accent": "8129E5", "bg": "F8F1FF"},
    "signal": {"dark": "3A0A06", "light": "FFF2EE", "accent": "DB3627", "bg": "FFF2EE"},
}


def rgb(value):
    if isinstance(value, tuple):
        return value
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, amount):
    return tuple(round(x + (y - x) * amount) for x, y in zip(rgb(a), rgb(b)))


def edge_pixels(a):
    return np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])


def edge_spread(im):
    """How much the background varies around the frame. Zero means perfectly flat."""
    edge = edge_pixels(np.asarray(im.convert("RGB")).astype(int))
    return (np.percentile(edge, 95, axis=0) - np.percentile(edge, 5, axis=0)).max()


def is_flat(im):
    return edge_spread(im) <= 12


def soften(mask):
    """Shave the edge pixels, which carry background colour, and smooth what is left."""
    mask = drop_specks(cv2.erode(mask, np.ones((3, 3), np.uint8)))
    return cv2.GaussianBlur(mask, (0, 0), 0.8)


def largest_part(mask):
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    if n < 2:
        return mask
    return ((labels == 1 + stats[1:, cv2.CC_STAT_AREA].argmax()) * 255).astype(np.uint8)


def drop_specks(mask):
    """Remove stray dots, but keep real separate pieces like the parts in an exploded view."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    if n < 2:
        return mask
    minimum = stats[1:, cv2.CC_STAT_AREA].max() * 0.002
    keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= minimum]
    return (np.isin(labels, keep) * 255).astype(np.uint8)


def cut_flat(im, tolerance):
    a = np.asarray(im.convert("RGB")).astype(int)
    bg = np.median(edge_pixels(a), axis=0)
    diff = np.abs(a - bg).max(axis=2)

    # Whatever reaches the frame edge is background.
    near = (diff <= tolerance).astype(np.uint8)
    labels = cv2.connectedComponents(near, connectivity=4)[1]
    outside = np.isin(labels, list(set(edge_pixels(labels)) - {0}))

    # Enclosed patches are gaps, like a trigger guard, only if they match the background
    # almost exactly. Shaded parts of a dark object come close to a dark background.
    exact = (diff <= 2).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(exact, connectivity=4)
    gap_size = a.shape[0] * a.shape[1] * 0.0002
    gaps = np.zeros(labels.shape, bool)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < gap_size:
            continue
        patch = labels == i
        # A real gap has a hard edge around it. A bright highlight fades into the
        # surface, so its surroundings stay close to the background colour.
        ring = cv2.dilate(patch.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & ~patch
        if diff[ring].mean() > 40:
            gaps |= patch

    mask = ((~(outside | gaps)) * 255).astype(np.uint8)
    return soften(mask)


def cut_photo(im, to_bottom):
    bgr = cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
    full_h, full_w = bgr.shape[:2]
    scale = min(1, 900 / max(full_h, full_w))
    small = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    h, w = small.shape[:2]

    mask = np.zeros((h, w), np.uint8)
    # A subject that runs off the bottom of the photo keeps a straight bottom edge.
    rect = (int(w * 0.03), int(h * 0.03), int(w * 0.94), h - int(h * 0.03) if to_bottom else int(h * 0.94))
    cv2.grabCut(small, mask, rect, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_RECT)

    fg = (((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)) * 255).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    fg = cv2.resize(largest_part(fg), (full_w, full_h), interpolation=cv2.INTER_LINEAR)
    return soften((fg > 127).astype(np.uint8) * 255)


def cut_out(im, mode, tolerance, to_bottom):
    if mode == "auto":
        mode = "flat" if is_flat(im) else "photo"
    if mode == "none":
        return im.convert("RGBA")
    if mode == "flat" and tolerance is None:
        # A flat render needs a tight match, or dark parts near the background get eaten.
        tolerance = min(14, 4 + edge_spread(im))
    mask = cut_flat(im, tolerance) if mode == "flat" else cut_photo(im, to_bottom)
    out = im.convert("RGBA")
    out.putalpha(Image.fromarray(mask))
    return out


def tint(im, dark, light, accent=None):
    """Map shadows to dark and highlights to light, with accent in the midtones unless left out."""
    alpha = im.getchannel("A")
    grey = ImageOps.autocontrast(im.convert("L"), cutoff=0.5, mask=alpha.point(lambda v: 255 * (v > 127)))
    # Local contrast brings back the detail in flat-shaded renders.
    grey = Image.fromarray(cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(np.asarray(grey)))
    mid = mix(dark, accent, 0.7) if accent else None
    out = ImageOps.colorize(grey, rgb(dark), rgb(light), mid=mid, midpoint=105).convert("RGBA")
    out.putalpha(alpha)
    return out


def strip(width, height, accent):
    """A bar that fades from pale on the left to full colour on the right."""
    fade = np.linspace(0.45, 1, width)[None, :, None]
    bar = (255 - (255 - np.array(rgb(accent))) * fade).astype(np.uint8)
    return Image.fromarray(np.repeat(bar, height, axis=0), "RGB").convert("RGBA")


def draw_grid(layer, box, accent, spacing):
    draw = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = box
    for x in range(x0, x1 + 1, spacing):
        draw.line([(x, y0), (x, y1)], fill=(*rgb(accent), 150), width=2)
    for y in range(y0, y1 + 1, spacing):
        draw.line([(x0, y), (x1, y)], fill=(*rgb(accent), 150), width=2)


def backing(size, kinds, accent):
    W, H = size[0] * SS, size[1] * SS
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    if "strips" in kinds:
        rows = ((0.06, 0.74, 0.30), (0.00, 0.62, 0.43), (0.12, 0.82, 0.56))
        for left, right, top in rows:
            bar = strip(int(W * (right - left)), int(H * 0.11), accent)
            layer.alpha_composite(bar, (int(W * (left + 0.09)), int(H * top)))

    paper_box = (int(W * 0.14), int(H * 0.22), int(W * 0.86), int(H * 0.82))
    if "grid" in kinds:
        paper = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(paper).rectangle(paper_box, fill=(255, 255, 255, 255))
        shadow = paper.getchannel("A").point(lambda v: v // 6).filter(ImageFilter.GaussianBlur(10 * SS))
        layer.paste((0, 0, 0, 255), (0, 6 * SS), shadow)
        layer.alpha_composite(paper.rotate(-3, Image.BICUBIC, center=(W // 2, H // 2)))

    disc = Image.new("L", (W, H), 0)
    if "circle" in kinds:
        d = int(H * 0.44)
        x, y = int(W * 0.62), int(H * 0.40)
        ImageDraw.Draw(disc).ellipse((x, y, x + d, y + d), fill=255)
        layer.paste((*rgb(accent), 255), (0, 0), disc)

    if "grid" in kinds:
        lines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw_grid(lines, paper_box, accent, 26 * SS)
        lines = lines.rotate(-3, Image.BICUBIC, center=(W // 2, H // 2))
        layer.alpha_composite(lines)
        # Accent lines vanish on an accent circle, so they turn white there.
        layer.paste((255, 255, 255, 255), (0, 0), ImageChops.multiply(lines.getchannel("A"), disc))

    return layer.resize(size, Image.LANCZOS)


def triptych(subjects, accents, canvas):
    """Three tall bars at different heights, each holding the subject in its own colour."""
    W, H = canvas.size
    bars = ((0.20, 0.17, 0.14, 0.84), (0.50, 0.21, 0.03, 0.80), (0.80, 0.17, 0.22, 0.96))
    for subject, accent, (center, width, top, bottom) in zip(subjects, accents, bars):
        x = int(W * (center - width / 2))
        bar = strip(int(H * (bottom - top)), int(W * width), accent).transpose(Image.ROTATE_270)
        canvas.alpha_composite(bar, (x, int(H * top)))

        toned = tint(subject, mix(accent, "000000", 0.72), (255, 255, 255), accent)
        toned = toned.crop(toned.getchannel("A").getbbox())
        scale = min(H * 0.66 / toned.height, W * 0.29 / toned.width)
        toned = toned.resize((round(toned.width * scale), round(toned.height * scale)), Image.LANCZOS)
        y = int(H * (top + bottom) / 2 - toned.height / 2)
        canvas.alpha_composite(toned, (int(W * center - toned.width / 2), max(y, 0)))


def place(subject, canvas, fill, anchor):
    subject = subject.crop(subject.getchannel("A").getbbox())
    W, H = canvas.size
    scale = min(W * fill / subject.width, H * fill / subject.height)
    size = (round(subject.width * scale), round(subject.height * scale))
    subject = subject.resize(size, Image.LANCZOS)
    y = H - size[1] if anchor == "bottom" else (H - size[1]) // 2
    canvas.alpha_composite(subject, ((W - size[0]) // 2, y))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("paths", nargs="+", metavar="path", help="the input picture or pictures, then the output file")
    p.add_argument("--palette", choices=sorted(PALETTES), help="a set of colours, which the options below override")
    p.add_argument("--cut", choices=["auto", "flat", "photo", "none"], default="auto")
    p.add_argument("--tolerance", type=int, help="how far from the background colour still counts as background, set automatically if left out")
    p.add_argument("--dark", help="colour for the shadows")
    p.add_argument("--light", help="colour for the highlights")
    p.add_argument("--accent", help="colour for the backing shapes and the midtones")
    p.add_argument("--mono", action="store_true", help="leave the accent out of the picture itself")
    p.add_argument("--original", action="store_true", help="keep the picture's real colours, for finished renders and photos")
    p.add_argument("--backing", default="", help="any of grid, circle, strips, separated by commas")
    p.add_argument("--triptych", help="three colours separated by commas, one for each bar")
    p.add_argument("--bg", help="canvas colour, transparent if left out")
    p.add_argument("--size", default=f"{CANVAS[0]}x{CANVAS[1]}")
    p.add_argument("--fill", type=float, default=0.86, help="how much of the canvas the subject fills, 0 to 1")
    p.add_argument("--anchor", choices=["center", "bottom"], default="center")
    args = p.parse_args()

    if len(args.paths) < 2:
        p.error("give at least one input and an output")
    *inputs, output = args.paths

    palette = PALETTES.get(args.palette, {})
    dark = args.dark or palette.get("dark", "111111")
    light = args.light or palette.get("light", "FFFFFF")
    accent = args.accent or palette.get("accent", "1F6FEB")
    bg = args.bg or palette.get("bg")

    size = tuple(int(n) for n in args.size.split("x"))
    kinds = [k.strip() for k in args.backing.split(",") if k.strip()]
    to_bottom = args.anchor == "bottom"
    cuts = [cut_out(Image.open(path), args.cut, args.tolerance, to_bottom) for path in inputs]

    canvas = Image.new("RGBA", size, (*rgb(bg), 255) if bg else (0, 0, 0, 0))
    if args.triptych:
        accents = [a.strip() for a in args.triptych.split(",")]
        if len(accents) != 3 or len(cuts) not in (1, 3):
            p.error("--triptych needs three colours and either one or three inputs")
        # One picture alone would look copied, so the middle one faces the other way.
        subjects = cuts if len(cuts) == 3 else [cuts[0], ImageOps.mirror(cuts[0]), cuts[0]]
        triptych(subjects, accents, canvas)
    else:
        if kinds:
            canvas.alpha_composite(backing(size, kinds, accent))
        subject = cuts[0] if args.original else tint(cuts[0], dark, light, None if args.mono else accent)
        place(subject, canvas, args.fill, args.anchor)

    if output.lower().endswith((".jpg", ".jpeg")):
        canvas = canvas.convert("RGB")
    canvas.save(output, quality=90)
    print(output)


if __name__ == "__main__":
    main()
