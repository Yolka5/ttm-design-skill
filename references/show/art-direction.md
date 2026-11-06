# Art direction

On a Show page the pictures do most of the work. This file is about choosing, placing and treating them. For cut-outs and tinted collages, see `references/shared/images.md`.

## Choosing

- Ask the user for everything they have: renders, photos, video, logo files. Look at all of it before planning the page, because the strongest picture decides the opening.
- Rank pictures by how much they say without words. Footage of the thing working beats a render, and a render beats a diagram.
- One picture per screen. Two pictures side by side split attention unless they make a point together, like before and after, or outside and inside.
- Pair a whole view with a detail. TTM shows the Beaver whole, then exploded, then the gas system. Anduril shows the factory, then one part in close-up.
- Never use pictures the user does not own or have the rights to.

## Video

- Muted, looping, `playsinline`, with a poster frame so the screen is never empty while it loads.
- Short loops of 6 to 15 seconds, with no cuts that flash. Keep files small: under about 8 MB for an opening, and compress anything bigger.
- Only one video plays at a time. The sheet stack already pauses videos that are off screen.
- With reduced motion, show the poster frame and do not autoplay.

## Placing text on media

1. Find the empty area of the picture: sky, wall, floor, shadow. That is where the copy goes.
2. Set `object-position` so the subject stays in frame at laptop, wide and phone sizes. Check all three.
3. Add a scrim that fades from the copy's side, dark under the text and clear over the subject. TTM's soldier band goes from about 80% dark on the left to almost nothing on the right.
4. Check contrast against the brightest point under the text. If it fails, darken the scrim or move the text, never shrink it.
5. Use a glass panel only when the empty area is busy, and keep it small.

## Treatment

- Keep renders and good photos in their real colours. Tinting throws quality away.
- Give a set of pictures one shared treatment: the same background, the same light direction, the same crop style. A mosaic of mismatched pictures looks like stock.
- Dark product renders on a dark page need a little light around them, a soft glow or a lighter floor, or they disappear.
- Do not add fake interface on top of pictures: crosshairs, coordinates, scan lines, "LIVE" labels. They read as decoration pretending to be information.

## Renders on white

CAD shots and product renders usually come on white. On an off-white page they show a faint box around them.

- Run `python scripts/ground.py render.png out.webp --ground <page colour>`. It lifts the near-white to white, trims the empty margin, multiplies the picture onto the ground and saves it lossless.
- Keep these lossless. Lossy WebP or JPEG shifts a flat background by one shade, and the box comes back.
- Don't rely on `mix-blend-mode: multiply` instead. It stops working inside anything faded, blurred or transformed, which is most scroll motion.
- A plain white ground is the other answer, if the brand can take it.

## Crops

- Full-bleed bands crop hard at different screen sizes. Pick pictures whose subject survives losing its edges.
- Parallax layers are taller than their frame, so they crop even more. Leave room above and below the subject.
- Product tiles crop to the tile shape. Wide products, like rifles, need wide tiles. Tall products need tall tiles. Plan the mosaic around the pictures, not the other way round.
