# Tool mode

For anything people operate: apps, settings, forms, sign-in, dashboards, calculators and small visual tools. The interface should disappear so the work is what you see.

## The look

- Build depth from `--surface-0` to `--surface-3`, not shadows or borders.
- Use serif for the page title only. Everything you operate is sans.
- Keep buttons sentence case with no border, shadow or gradient.
- Allow one `q-btn--main` per view. Every other button stays grey.
- Use `.picks` and `.pick` for all selection: tabs, sidebars, menus, lists, segmented toggles. Mark the chosen one with `aria-selected`, `aria-current` or `aria-checked`.
- Keep colour for meaning in the content, such as a chart series or a warning. A provider logo on a sign-in button works because it is the only colour on screen.
- Nest radii: `--radius-shell` outside, `--radius-control` inside.

## Small tools and calculators

These are the most common Tool job, and the ones most often over-built.

- Put inputs and results on one screen, with no scrolling on a laptop. Inputs on the left or top, results beside or below them.
- Lead with the answer. The number the person came for is the largest thing on the page, set in the serif or at a large size.
- Update results live as inputs change. A Calculate button only adds a step.
- Always show units, and use `font-variant-numeric: tabular-nums` so digits line up and do not jitter.
- Use `.ctl` sliders for ranges, `.picks--seg` for two to four options and `.stats` for live readouts.
- Use a preset picker for known options, like a motor or a gear ratio, with a way to enter custom values.
- When comparing options, one chart beats a table of numbers. Give each option a meaning colour and label it on the line, not in a legend.
- Use a real scale on charts, with axes, gridlines and units. For a chart with a known technical convention, follow it.
- State your assumptions in one quiet line under the result, such as voltage or efficiency. Engineers need to know what the number depends on.
- Do not invent specifications. If you are unsure of a value, say so on the page and make it editable.
- Do not animate numbers or charts when inputs change. People adjust these repeatedly, and animation makes the tool feel slow.
- A sim is the exception, because its motion is the explanation. Show a useful still frame before it runs, and with reduced motion run it only when the user asks.

## Dropdowns

- Use a native `<select class="select">` for plain form choices. On a phone it opens the system picker, which beats anything custom.
- Use `.drop` with `assets/menu.js` when options need a second line, an icon, groups or an action. Add `.drop--actions` for a menu of commands instead of a choice.
- The chosen option gets the usual selection fill plus a tick, and the trigger shows its name.
- Menus open in 160ms from the trigger, and instantly when opened by keyboard. They flip upward when there is no room below.
- Arrow keys move, Enter picks, Escape closes and returns focus to the trigger, and typing a letter jumps to the first match. `menu.js` does all of this.
- Over about 15 options, add a search field at the top. A long scroll of options is hard to use.
- Put destructive items last, after a separator, with `.drop__item--danger`.

## States

- **No disabled buttons.** Keep the button live and say what is missing when it is pressed: "Add a name first". A disabled button cannot explain itself, and it is unreadable.
- **Status** follows the rules in `references/shared/type-and-colour.md`: pale tint plus text to inform, solid red only on the confirm step of a delete.
- **Empty states** invite the first action. **Errors** say what happened and what to do. See `references/shared/writing.md`.
- **Dense lists and settings** use `.rows`, hairline-split rows. A stack of cards for every item reads as clutter.
- **Floating layers:** at most two at once, for example a panel and a menu inside it. A third means it should be a dialog. Only floating things get `--shadow-float`.

## Sign-in

Use `.shell`. Stack provider buttons, then an "or" divider, an input and one main button. Keep the provider buttons grey.

## Motion

Press feedback and small state changes only, under 200ms. No scroll effects. A search palette or anything opened by keyboard never animates, because people use it constantly and any delay reads as lag.
