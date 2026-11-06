# Craft

The decisions that make an interface feel right. Adapted from Emil Kowalski's design engineering skill (github.com/emilkowalski/skills, MIT).

## Should this animate at all?

Ask how often the person will see it, before anything else.

| How often | Decision |
| --- | --- |
| Constantly, like a keyboard shortcut or search palette | Never animate |
| Tens of times a day, like hovers and list navigation | Remove or reduce a lot |
| Occasionally, like modals and toasts | Standard animation |
| Rarely, like a first visit or a landing page | Room for delight |

This table is what separates the two sides: Use pages live in the top rows, Show pages in the last one.

Then ask what it is for: showing where something came from, showing a state change, explaining something, or confirming a press. "It looks cool" is only a reason on things people rarely see.

## Timing

| Element | Duration |
| --- | --- |
| Press feedback | 100 to 160ms |
| Tooltips, small popovers | 125 to 200ms |
| Dropdowns, selects | 150 to 250ms |
| Modals, drawers | 200 to 500ms |
| Scroll-tied and marketing motion | Can be longer |

Keep interface animation under 300ms on both sides: buttons, menus, dialogs. Exits are faster than entrances. Scroll-tied motion on Show pages has no duration, since it follows the scroll, and its hover and card timings are in `references/show/motion.md`.

## Easing

- Entering or leaving: ease-out. It responds immediately.
- Moving on screen: ease-in-out.
- Hover or colour change: ease.
- Never ease-in on an interface element. It delays the moment people are watching.
- Use the curves in `assets/motion/motion.css`, since the built-in CSS ones are weak.

## Details

- Press feedback on anything pressable: `scale(0.97)` on `:active`.
- Never animate from `scale(0)`. Start at 0.95 with opacity 0.
- Popovers and menus grow from their trigger. Modals stay centred.
- Anything opened from the keyboard opens instantly.
- Once one tooltip is open, the next opens instantly.
- Use transitions for anything that can be interrupted. Keyframes restart from zero.
- Stagger items by 30 to 80ms, and never block interaction during it.
- If a crossfade looks wrong, add a blur of about 2px during it.
- Keep hover effects behind `@media (hover: hover) and (pointer: fine)`.
- Animate only `transform`, `opacity` and `clip-path`.
- With reduced motion, keep gentle fades and remove movement.

## Reviewing work

List changes in a table with Before, After and Why columns, then check the result the next day or in slow motion. Timing problems that are invisible at full speed show up at a quarter of it.
