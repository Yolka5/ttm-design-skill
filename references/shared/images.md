# Images

Collage images are what lift a page from clean to memorable. They are real pictures cut out, tinted to one colour and set on a simple backing shape.

## The tool

```bash
python scripts/collage.py in.png out.webp --dark 0A2343 --accent 1767CE --backing grid,circle --bg EEF5FF
```

Needs Python with Pillow, NumPy and OpenCV.

- `--dark`, `--light`, `--accent`: shadow, highlight and midtone colours. Use the section's meaning colour.
- `--backing`: any of `grid`, `circle`, `strips`.
- `--bg`: canvas colour. Leave it out for a transparent image.
- `--mono`: keep the picture black and white with colour only in the backing.
- `--original`: keep the picture's real colours. Use this for finished renders and good photos, since tinting them throws quality away.
- `--anchor bottom`: for subjects that run off the bottom of the frame.
- `--triptych A,B,C`: three bars with the subject on each. Better with three different pictures than one repeated.
- `--cut none`: use a file that is already cut out.

See `assets/image-examples/overview.png` for what it produces.

## What works

| Source | Result |
| --- | --- |
| Renders or product shots on a plain background | Clean, ready to use |
| One clear subject in a photo | Usually good, check the edges |
| Crowds or busy backgrounds | Poor. Ask for a hand-made cut-out and use `--cut none` |
| Screenshots with interface or overlays on the subject | Do not use |

Crop screenshots of CAD software first, so interface pieces do not end up in the cut-out.

A cut-out from a black background keeps a faint dark edge, so place it on a dark surface. Cut-outs from white or flat grey work on anything.

Always look at the output before using it. Check for leftover background, holes in dark objects and missing thin parts.

## Art direction

The tool handles the treatment. The idea is the hard part.

- Pair two objects to make a point, rather than decorating with one.
- Keep one image per section, tied to that section's colour.
- Tint everything on a page with the same few colours, so it reads as one set.
- Use only pictures the user owns or has the rights to.
