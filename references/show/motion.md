# Motion

Scroll, card and button behaviour for Show pages. Extracted from the TTM website, then rebuilt without its colours, fonts or section names. Code lives in `assets/motion/motion.js` and `assets/motion/motion.css`. Open `assets/motion/demo.html` to feel every pattern. The exact source code is in `assets/originals/`, for when a pattern needs to match precisely.

## How it works

Everything follows one idea: **scroll position becomes a number, and CSS does the moving.**

```
scroll -> JS writes --in, --reveal, --t as 0 to 1 -> CSS turns that into transform and opacity
```

This is why it feels good. Motion is tied to position, so it never plays on its own, it reverses when you scroll back, and it stops the moment you stop.

Rules that keep it working:

- Animate only `transform`, `opacity` and `clip-path`.
- Stage things inside one section by shifting the same number, not with separate timers: `--copy: clamp(0, calc((var(--in) - 0.45) / 0.3), 1)`.
- Fade content to a low opacity rather than zero, so fast scrolling never shows a blank page. Reveal items stop at 0.2.
- Build the page to read top to bottom first. Pinning switches on only when JS sets `data-mode="live"`, so a failed script still leaves a working page.
- Keep one scroll listener and one animation loop per page.
- Use time-based easing. Never a per-frame factor like `x += (y - x) * 0.1`, which runs at different speeds on 60Hz and 144Hz screens.

## Motion as the story

On a Show page, motion is how the story is told, so plan it for the whole page before picking patterns.

- Give the page one main scroll moment: a sheet stack or a pinned product opening. Not two back to back.
- Keep everything else lighter: reveals as sections arrive, one or two parallax bands, hover on pills and tiles.
- Map each screen to a pattern before building. Opening: beats, or a still. Story: the sheet stack or the product sequence. Proof: reveal. Atmosphere band: parallax. Chapters: reveal. Closing: nothing.
- Pinned scroll has to earn its length. More than about six screens of pinned scroll on one page feels like being held hostage.
- Motion follows the scroll and stops when the scroll stops. Nothing loops on its own except muted video.

## Patterns

### Sheet stack

The main scroll experience. Full-screen sheets slide over each other like cards, each from a direction you choose, while the one underneath shrinks back.

```html
<section class="stack">
  <div class="stack__track">
    <div class="stack__pin">
      <article class="sheet">first sheet</article>
      <article class="sheet" data-from="bottom"><div class="sheet__copy">...</div></article>
      <article class="sheet" data-from="right">...</article>
      <article class="sheet" data-from="left">...</article>
    </div>
  </div>
</section>
```

- `data-from` takes `bottom`, `top`, `left` or `right`. Change direction between sheets, since repeating one direction turns it back into plain scrolling.
- Scroll length is 130vh per sheet, matching the source. Much longer feels like the page is holding you hostage, much shorter and sheets trip over each other.
- Put text in `.sheet__copy`. It lands after its sheet and leaves before it.
- A `<video>` in a sheet plays only while that sheet is showing.
- 3 to 5 sheets. Below 768px wide it becomes a normal stacked page.

### Reveal

Add `data-reveal` to a section and `.reveal-item` with `style="--i:0"`, `--i:1` to its children. Each item comes in slightly after the last, with 0.06 of the reveal between them. Keep it to about 4 items.

### Parallax

```html
<div class="parallax" data-parallax><img class="parallax__layer" data-parallax-layer></div>
```

The image drifts a short distance as you scroll past. It is a small window, not a full pan. Use it on one image per section, and pick a subject that still looks right with the edges cropped.

### Beats

A pinned section that hands the frame from one idea to the next. Good for a product story or big numbers. Add `data-beats` to the section, wrap the content in `.beats__pin`, and mark each step with `data-beat`.

- `.beat-part` with `--i` lands the parts of a beat one after another.
- `data-count="1240"` counts up as the beat arrives. Put the final number in the HTML so it reads correctly without JS.
- `data-curtain="0.3,0.42,0.72,0.84"` with a `.curtain` element wipes the page dark and back. The four numbers are where it starts and finishes coming in, then starts and finishes going out.
- 110vh of scroll per beat. The last beat holds so the section never ends on an empty frame.

### Letters

Add `class="letters"` to a short headline inside a `data-reveal` section or a beat. It flips up one letter at a time from the baseline. Use it once per page, on display sizes only, and on headlines under about 20 characters. It keeps an `aria-label` so screen readers get the whole text.

### Buttons

Pill shape, uppercase, wide letter spacing, frosted glass. On hover the button lifts 3px and grows 2% with a springy curve, and a soft glow follows the pointer. On press it drops back.

| Class | Use on |
| --- | --- |
| `btn--solid` | Light backgrounds, main action |
| `btn--glass` | Light backgrounds, second action |
| `btn--light` | Images, video and dark backgrounds, main action |
| `btn--ghost` | Images, video and dark backgrounds, second action |

To open a short label into a longer one on hover:

```html
<a class="btn btn--ghost" aria-label="Order the product">
  <span>Order</span><span class="btn__more" aria-hidden="true"><span> the product</span></span>
</a>
```

It needs no JS, and touch screens always show the full label.

### Glass panel

`.glass-panel` puts text over images or video, and `.glass-panel--light` is the bright version. It is 22px of blur at 1.45 saturation, with a thin bright line along the top edge. That top line is what makes it read as glass and not just a blurred box. Always check text contrast against the brightest part of the media, and darken the media if it fails.

### Tilted card row

`.card-row` holds three `.card` items at -4, 6 and -2 degrees. On hover the card lifts, the image zooms slowly and a band of light sweeps across once. Works best in a column no wider than about 40rem. `.card--locked` is the gated last card with diagonal stripes and a lock.

### Smooth wheel

Add `data-smooth-wheel="12"` to `<html>`. Native mouse wheels move in steps, so scroll-linked motion can look stepped. This eases each step. Touch, keyboard and scrollbar stay native, and it switches off for reduced motion.

Leave it off unless stepped motion is a visible problem, since it takes over wheel input. If you use it, keep the rate between 8 and 16.

## Easing and timing

| Use | Value |
| --- | --- |
| Entrances, sheets, reveals | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Hover lift, anything springy | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Button hover | 350ms |
| Label expand | 200ms |
| Card lift | 450ms |
| Image zoom | 700ms |
| Light sweep | 900ms |

Quick for things you touch, slower for things that drift. Springy curves only on small elements, never on full sections.

## Always

- Keep every pattern working with `prefers-reduced-motion`: no pinning, no parallax, everything visible.
- Keep hover effects behind `@media (hover: hover)` or give touch a sensible default.
- Let a sheet's links be reachable by keyboard. The kit scrolls to a sheet when focus lands inside it.

## Never

- Delayed scroll stop. This is the one thing not to copy from the TTM site, where the wheel eased at 1% per frame. That takes about 7.6s to settle on a 60Hz screen and 3.2s on 144Hz. The kit settles in about 0.4s on both.
- Small uppercase titles above headings, em dashes, tiny numbered labels and spaced-out mono labels.
- Fades on everything. If a section has no story to tell, let it scroll normally.
- Motion libraries for these patterns. None of them need one.
