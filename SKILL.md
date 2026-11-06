---
name: ttm-design
description: A complete web design system for building pages, sites, apps and small interactive tools that look designed rather than generated. It first asks a few questions to understand what the user wants, then sorts the job into a Use page (tools, dashboards, articles, lessons) or a Show page (brand sites, product pages, launches, portfolios) and follows only that side's rules. Use this skill whenever the user asks to build, design, restyle or improve anything visual for the web, including company and brand websites, landing pages, product pages, sections of an existing site, articles, explainers, lessons, dashboards, forms, sign-in screens, settings, HTML artifacts, calculators, charts and small visual tools such as engineering or FRC motor calculators, even if they never mention design.
---

# TTM-Design

One design system for two very different kinds of page. Both share the same tokens and the same taste, but they succeed in opposite ways, so they follow different rules.

The feel is **calm until it matters**. Most AI-made pages fail by making everything loud at once, so restraint is the point. What "matters" depends on the side: on a Use page almost nothing does, and on a Show page a few big moments carry the whole page.

## Start with the brief

Before any code, read `references/brief.md` and do what it says: take in everything the user gave, ask one round of questions whose answers would change the build, then play back in a few lines what you will make. This happens on every job, small ones included, because a first draft built on a guess gets thrown away.

## Use or Show

Then sort the page. This is the first design decision and it decides every other one.

| | Use | Show |
| --- | --- | --- |
| Job | Get something done or understood | Make an impression: trust, desire, presence |
| Examples | Calculators, dashboards, settings, forms, sign-in, docs, articles, explainers, lessons, news | Company and brand sites, product pages, launches, portfolios, team pages, a landing section |
| Visitor | Comes back, or stays to work or read | Arrives once and decides fast |
| Success | Clear, correct, quick | Remembered, felt before it is read |
| Leads with | The answer or the text | One strong image, video or headline |
| Motion | Feedback only, or none | Scroll-tied story: sheets, reveals, parallax |
| Buttons | Quiet grey, one bright | Glass pills, uppercase |
| Colour | Neutral interface, colour only in content | The brand's own, full colour sections |
| Read | `references/use/` | `references/show/` |

Signs it is **Show**: a company, product or person is the subject; the user talks about how it should feel; there are renders, photos or video; it is the front door of a site. Signs it is **Use**: there are inputs, data or a lot of text; people will return to it; it answers a question.

When the signs point both ways, two tie-breakers settle most cases. If the page has inputs or data to work with, it is Use, even when it belongs to a brand: a sales dashboard for a company, an order form for a product. If its main job is to be looked at once, it is Show, even when it carries some text: a portfolio, a launch page. Ask only when neither settles it, as with "a page for our robotics team", which could be a recruiting site or a team schedule.

Then state the choice in one line before building, and mark it on the page: `<html data-kind="use">` or `<html data-kind="show">`.

### Within each side

- **Use** has two modes. **Tool** (`references/use/tool.md`) for anything operated: apps, settings, forms, sign-in, dashboards, calculators, sims. **Read** (`references/use/read.md`) for anything read: articles, docs, explainers, lessons, news.
- **Show** has one mode, **Stage**. Read `references/show/stage.md` first, then `art-direction.md` for pictures and video, `brand.md` for the brand's colours, type and voice, and `motion.md` for the scroll patterns.

Read the files for your side and the files in `references/shared/`. Do not read the other side's files. That is how the two stay apart.

## Never mix

One page belongs to one side. A site can hold both: TTM's home page is Show, and its order form is Use wearing TTM's colours and fonts.

- **A Use page never gets:** sheet stacks, beats, letter reveals, glass pills, uppercase buttons, display type bigger than the page title, smooth wheel, tilted card rows, or full-bleed hero media. Read pages may use the few motions listed in `use/read.md`, no more.
- **A Show page never gets:** grey quiet buttons, stat tiles, dashboard cards, status banners and badges, dense rows, tabs or segmented pickers as content, sliders, or a narrow article column for the main story.
- **When a Show page needs a Use part**, like a spec table, an order form or a calculator, give it its own page or a clearly separate block after the story, and build that part by the Use rules in the brand's colours and fonts. A single field and button at the end, like an email sign-up, can stay on the Show page and takes the Show button styles.

## Building a page

1. Do the brief, sort the page and mark `data-kind`.
2. Start from the matching file in `assets/templates/` if there is one.
3. Set the tokens: type pair, tone steps, up to three meaning colours. See `references/shared/type-and-colour.md`. On a Show page, use the brand's own colours and fonts when it has them.
4. Decide whether headings need a contrast move. Most do not.
5. Make images with `scripts/collage.py` if the page has any. See `references/shared/images.md`.
6. Add only the controls and motion your side allows. Check `references/shared/craft.md` before adding any animation. Write every label and message by `references/shared/writing.md`.
7. Run `python scripts/check.py page.html` and fix what it finds. Then look at the page yourself at desktop and phone width.
8. Run `node scripts/shoot.mjs page.html` to screenshot desktop and phone in light and dark, and to catch script errors and sideways scrolling. On Show pages add `--scroll`, since a full-page shot cannot show pinned sections. Look at the screenshots.
9. For sims, tools and anything else interactive, use every control and finish every task in a real browser, and check the numbers by hand. For Show pages, scroll the whole page slowly and quickly, and check every section at laptop and wide sizes. The scripts cannot tell you that something is wrong.

**Size the effort to the job.** A quick Use artifact skips steps 4 and 5 and goes straight to a clean result. Do not pull in the motion kit, collages or a design discussion for a small calculator.

**New projects:** on a real project with its own brand, show a small sample of each contrast move, plus plain headings with none, and let the user pick. Keep that choice for the rest of the project.

## Every pattern is optional

The patterns here came from specific pages where they worked. They show what good looks like. They are not a checklist.

Use a pattern only when the content calls for it, and treat a plain page as a good result. Before adding one, ask what it does for the visitor. If the answer is "it looks cool" and they will see it often, leave it out.

## Decisions for both sides

- **Sentence case by default.** Uppercase only on Show pills.
- **One voice per project.** Serif speaks and sans works, and they never mix inside one element. Heavy sans is the option for louder brands. A brand's own fonts win.
- **At most one contrast move.** Most headings need none. When one helps, set one word in the other typeface, or a handwritten face for an informal brand, once per heading.
- **Rounded everywhere.**
- **One bright button per view.** Rank comes from brightness alone, so one main action can stand out.
- **Sizes come from the steps.** Space, font size and timing use the tokens, never one-off values.
- **Motion is tied to the visitor.** It follows a press or the scroll position and stops when they stop.

## Decisions for Use pages

- **The interface never takes colour.** Content, images and data do. A background only moves in answer to something the user did.
- **Quiet buttons on solid surfaces.** Grey, no border, shadow or gradient.
- **One selection style.** The chosen item gets a rounded fill one step lighter, on tabs, menus, lists and search alike.
- **Status colours say one thing each.** Red is delete or error, green is done, yellow is check this. Pale tint to inform, solid fill only on the button that confirms a delete. See `references/shared/type-and-colour.md`.
- **Depth comes from tone.** Step through the surface colours before reaching for a shadow. Only things that float above content, like menus, get one.

## Decisions for Show pages

- **The surface decides the button, and pills stay pills.** Over media and dark sections, light and ghost pills. On light sections, solid and glass pills. Never a grey quiet button, so the page keeps one voice.
- **One bold thing per screen.** The image or the headline, not both shouting.
- **Media carries the page.** Without strong images or video, a calm page with strong type beats empty gradients.

## Banned on both

These read as AI-generated, because they are decoration pretending to be information.

- Em dashes. Use a comma, a colon or a new sentence.
- Small titles above headings, like "PLATFORM RATIONALE". Start with the heading.
- Highlight blocks behind heading words, whether solid, white or gradient. They look stuck on.
- Tiny numbered labels, unless the order really matters.
- Spaced-out mono labels and fake technical readouts, like "TRACK LOCK" or map coordinates used as decoration.
- Pulsing status dots when nothing is happening.
- Blinking cursors on text nobody can type in.
- Scrolling that keeps moving after the user stops.
- A green yes button next to a red no button.
- Disabled buttons. Keep them live and explain on press.
- `opacity` on text to make it softer. Use `--ink-soft`.
- Title Case on buttons, and the words "successfully", "please" and "click here".

## What is in here

| Path | Use |
| --- | --- |
| `references/brief.md` | The questions to ask before starting. Read first, every time. |
| `references/shared/` | Type and colour, writing, craft and timing, images. Both sides read these. |
| `references/use/` | `tool.md` and `read.md`. Use pages only. |
| `references/show/` | `stage.md`, `art-direction.md`, `brand.md` and `motion.md`. Show pages only. |
| `assets/tokens.css` | Shared fonts, colours and radii. Always start here. |
| `assets/controls.css` | Use parts: quiet buttons, selection, dropdowns, inputs, status, rows, sliders, readouts, lesson parts, sign-in shell, reading parts. |
| `assets/menu.js` | Keyboard, focus and placement for `.drop` menus. Use pages. |
| `assets/motion/motion.css`, `motion.js` | Show parts: sheets, reveals, parallax, beats, letters, glass pills, glass panels, cards. |
| `assets/show.css`, `show.js` | Show parts: brand layer, nav, openings, statement, product sequence, atmosphere band, mosaic, rows, chapters, closing, footer. |
| `assets/motion/demo.html` | Working example of every motion pattern. Read it to see the markup. |
| `assets/templates/` | Starting files for a tool, an article, a lesson and a Show page. Copy one instead of starting from nothing. |
| `assets/originals/` | Exact code from the TTM site the Show patterns came from. Check it when a pattern needs to match precisely. Its colours and fonts stay out. |
| `assets/image-examples/overview.png` | What the image tool can produce. |
| `scripts/collage.py` | Cut-outs, tints and backing shapes for images. |
| `scripts/ground.py` | Puts a render on white onto the page's ground colour, with no visible box. |
| `scripts/check.py` | Scans a page for the banned list, weak contrast in its tokens and brand layer, and banned words. |
| `scripts/shoot.mjs` | Screenshots a page at desktop and phone in light and dark, and reports script errors and sideways scrolling. `--scroll` adds a shot per screen of scrolling. Needs Node 22 and Chrome. |

For a single-file artifact, paste only the CSS and JS the page uses into the file, since artifacts cannot link to these files.
