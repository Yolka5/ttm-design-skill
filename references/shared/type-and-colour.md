# Type and colour

Set these in `assets/tokens.css` for each project. Keep the structure and change the values.

## Type

Two faces with two jobs. The serif is the voice: page titles and big moments. The sans is for work: everything you read in detail or operate. The contrast between them does the design work, so never mix them inside one element.

The default pair is Newsreader and Instrument Sans, both free on Google Fonts. Use a project's own fonts when it has them. For a louder brand, swap the voice for a heavy sans. Archivo is free and has a width axis, which allows narrow bold headlines.

- Headlines are short and tight: line height around 1.05.
- Body text is 1.5 to 1.6 line height.
- Sizes are either the same or clearly different. Nearly equal sizes look like a mistake.
- Use `font-variant-numeric: tabular-nums` wherever numbers are compared.

## Contrast moves

Plain headings are the default, and a serif headline usually needs nothing else. When a heading does need a lift, use one of these once, on the word that matters most.

- **Other typeface:** one word in the serif inside a sans headline.
- **Handwritten word:** one word in a script face. Only for brands with a human, informal voice.

Never put a block of colour behind a heading word. Solid, white and gradient blocks all look stuck on.

## Tone steps

Four surfaces from page to selected, plus ink, soft ink and a line colour. Each step is one visible jump lighter or darker. Dark mode values come first in design decisions, since a greyscale that works in dark usually works inverted.

## Meaning colours

Up to three, each with a soft version for backgrounds. Colour means something: a topic, a category, a series in a chart. If a colour means nothing, remove it.

Give each one a brighter value for dark mode. A colour picked for a light page goes dull on a dark one, in charts and diagrams most of all.

Text on colour must pass contrast, at least 4.5:1 for body text. Pair soft tints with `--ink` and full colours with `--on-meaning`, which is white in light mode and near-black in dark mode. Test any other combination.

## Status colours

Danger, success and warning are separate from the meaning colours, and they only ever say one thing. Red means delete or error. Green means done, passed or added. Yellow means check this.

- **Status that informs** uses the pale tint with the matching text: `.banner--danger`, `.badge--success`. Light enough that body text still reads.
- **The control itself** uses the solid fill with `--on-*` text, and only one control gets it: the button that confirms deleting, inside the "are you sure" step. Everywhere else a delete button is grey with a red word, `.q-btn--quiet-danger`.
- **Green is almost never a button.** It belongs to data: `+128` in a diff, a test that passed, a session that is running.
- **Never a green yes and a red no.** A choice gets one bright button and one quiet one, like any other pair.
- **Colour never works alone.** Every status also has a word or an icon, so it reads for colour-blind people and in greyscale.
- If a meaning colour is red or green, keep it out of views that show errors or success, or the reader will read a topic as a warning.

## Size, space and timing

Use the steps in `tokens.css` and nothing in between: `--space-*` for gaps and padding, `--text-*` for font sizes, `--dur-*` for animation. Pages that pick their own values drift apart, and choosing between fewer options is faster.

- Gaps inside a component: `--space-xs` to `--space-md`. Between components: `--space-lg` to `--space-xl`. Between sections: `--space-2xl` or `--space-3xl`.
- Soft text uses `--ink-soft`, never `opacity`. Opacity mixes with whatever is behind, so the same text changes contrast on every surface.

## Keep out

NRK Sans, NRK's logo shapes and patterns, and Claude's fonts belong to their owners. Take the principles only. A project's colours, fonts and spacing stay with that project and do not become defaults.
