# Brand

A Show page wears the brand, not the library. Every brand gets its own colours, fonts and voice, set in one small block of tokens, so two Show sites built with this skill never look like each other.

## The brand layer

Set these at the top of the page, after `tokens.css` and `show.css`:

```css
:root {
  --brand-bg: #0b0c0e;        /* the page's main ground */
  --brand-ink: #f4f3ef;       /* text on that ground */
  --brand-soft: #a9a9a3;      /* soft text, at least 4.5:1 on the ground */
  --brand-accent: #b56a20;    /* one accent, used rarely */
  --brand-light: #f1f0ea;     /* the light chapter ground */
  --brand-mid: #8e9291;       /* the middle chapter ground */
  --font-display: 'Archivo', system-ui, sans-serif;
  --font-body: 'Instrument Sans', system-ui, sans-serif;
  --font-hand: 'Shadows Into Light', cursive;  /* only if the brand has a human voice */
  --radius-media: 14px;
}
```

When the brand has its own colours and fonts, use them exactly. When it has none, ask in the brief, then propose two directions and let the user pick.

## Colour

- Most Show pages are dark or light at heart. Pick one ground for the opening and the story, then change ground at each chapter. Anduril goes black, grey, off-white. TTM goes dark, blueprint, dark, band.
- One accent at most, used on a few things only: a contrast word, a hover, a link. Never on large surfaces, or it stops being an accent.
- Pills stay white, glass or ink. They do not take the accent, so the media stays the most colourful thing on screen.
- Check text against every ground it sits on, including the chapter grounds, at 4.5:1 for body text.

## Type

- One display face and one body face. A brand with its own fonts uses them. Without, good free options are Archivo or Inter Tight for force, Instrument Sans or Geist for calm, and Newsreader for an editorial brand.
- Choose the display weight for the voice: heavy for force, light for calm. Not medium.
- A handwritten face is for brands that are personal or informal, like TTM. Use it on one word per page.

## Voice

- Short, plain and sure. State what the thing is and does. "Original. From scratch." beats "Revolutionising the future of design".
- No superlatives the page cannot prove: "world-class", "cutting-edge", "best-in-class".
- Numbers persuade when they are real: "93 parts", "2,750 ft/s". Never invent one.
- Rewriting is where invented facts sneak in. A shorter line can quietly claim a feature the source never said. Check every rewritten line against where it came from.
- Use sentence case for headlines too. TTM's "Be A Part of The Change" reads better as "Be part of the change".
- No em dashes, and no " - " standing in for one. Use a full stop.

## Keep out

A project's colours, fonts and spacing belong to that project. Never carry TTM's amber, fonts or dark ground into another brand's site, and never copy Anduril's or Scale's look. Take their principles only.
