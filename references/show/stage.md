# Stage mode

For Show pages: company and brand sites, product pages, launches, portfolios. The visitor arrives once and decides fast, so the page has to be felt before it is read. This is the only mode that is allowed to be loud, and it works because the loud moments are few.

Read this file first, then `art-direction.md` for images and video, `brand.md` for colour, type and voice, and `motion.md` for the scroll patterns. Start from `assets/templates/show.html`, with `assets/show.css` and the motion kit.

## Where the taste comes from

Mostly from the TTM website, plus two outside sources. Learn what each one does well, not how it looks.

- **TTM:** glass pills over video and images, and how they react to hover. Sheets that slide over each other like cards, each from its own direction. The order button that opens into a longer label. The full-bleed photo band that drifts as you scroll, with the copy in the empty part of the picture. Sections that build in as they arrive. A pinned product opening that steps through the parts of one product.
- **Anduril:** media first. The home page opens on video with no headline at all. Products are a mosaic of strong pictures, each with only its name. Product names are set huge and tight. Very few words anywhere. Chapters change by flat colour bands, from black to grey to off-white.
- **Scale:** one calm sentence in large light type, centred over dimmed media, then the page turns from dark to light. Confidence comes from size and space, not weight.

Leave behind what reads as AI-made or noisy: small titles above headings, numbered chapter counters, fake readouts and coordinates, loading percentages, pulsing dots, Title Case headlines, highlight blocks behind words, bullet lists in hero panels, and a nav dropdown with a dozen items.

## The page, top to bottom

A Show home page is a sequence of screens. Not every page needs every part, but the order holds.

1. **Nav.** The wordmark on the left, three to five links, one pill action on the right. Transparent over the opening, then it takes a dark glass background once the opening has passed. Group a long product list into an overview page instead of a giant dropdown. On phones, one menu button opens a full-screen sheet.
2. **Opening.** One screen. Pick one kind:
   - **Media opening:** full-bleed video or image, with no words or a single line. Use it when the footage is strong enough to speak.
   - **Statement opening:** one sentence in large type, centred, with the media dimmed behind it. Use it when the idea is the product.
   - **Product opening:** the product name huge, the product beside or under it, and one line.
   Never more than one sentence and two buttons.
3. **Story.** Three to five steps, one idea each: a headline, one or two sentences, up to two buttons. Two ways to tell it:
   - **Sheet stack:** full screens that slide over each other, each from its own direction. Best when every step has its own big picture or video.
   - **Product sequence:** `.s-seq`. The section pins, the copy sits on the page grid, and the product picture changes in place beside it: whole, inside, one part. Hairlines along the bottom fill as it moves, so it never feels stuck. Best for one product told through its parts.
4. **Proof.** What the brand has made. A mosaic of product tiles, each a strong image with its name and nothing else, linking to the product's own page. Or catalogue rows: a large name on the left, a wide image on the right, a hairline between rows.
5. **Atmosphere band.** A full-bleed photo that drifts as you scroll, with a short headline and one or two buttons in the empty part of the picture. Once or twice per page. This is where the brand gets to feel human.
6. **Chapters.** Everything else: team, careers, process, questions. Normal scrolling sections, each a different tone from the one before, so the change of colour marks the change of subject. Calmer than the story, still Show styling.
7. **Closing.** One clear action, large, on its own band.
8. **Footer.** Wordmark, link columns, small print. Quiet.

## Rhythm

- Alternate loud and quiet. A full-bleed media screen is followed by a calmer type screen, not by another full-bleed screen. A sheet stack counts as one loud unit.
- One bold thing per screen: the image or the headline, not both shouting.
- The words on a whole home page should fit on one printed page. If a screen needs a paragraph, it belongs on an inner page.
- Fix only one thing to the screen besides the nav. A fixed logo or chat button collides with content as sections pass under it.

## Layout

- Media runs full-bleed. Content sits on a wide grid, up to about 80rem, not the narrow article column.
- Text over media goes in the empty area of the picture, usually the left or bottom third, with a scrim that fades from that side. Centre text only for a statement.
- Use scale contrast: one huge thing per screen and everything else small. Avoid the middle sizes.
- Mosaic tiles: one large tile and several small ones, with tight even gaps. The image fills the tile, and the name sits bottom left in white on a soft bottom shade.
- On phones, stack the image above the text instead of putting text over the subject, and let sheets become normal sections. The kit does the second part by itself.

## Type

- One display face, set big and tight: line height 0.95 to 1.05, tracking about -0.02em at large sizes.
- Pick a weight that matches the voice: heavy for force (Anduril's product names), light for calm authority (Scale's statements). Avoid the medium weights in between at display size.
- Size display type against the viewport height as well as the width, or it collides with the image on short laptop screens. `--show-display` in `assets/show.css` does this.
- Headlines are one to six words. A statement can run to about twelve.
- Uppercase only on pills and on names that are written that way, like a model number.
- One contrast move per page at most: a handwritten word (TTM's "Change"), one word in the other typeface, or one word in the brand's accent colour.

## Buttons

- Pills only, from the motion kit. Over media and dark sections, `.btn--light` for the main action and `.btn--ghost` for the second. On light sections, `.btn--solid` and `.btn--glass`.
- One bright pill per screen.
- `.btn__more` opens a short label into a longer one on hover. Use it on the one action that matters most, like ordering.

## Use parts on a Show page

A spec table, an order form, a contact form or a calculator is Use work. Give it its own page, or a clearly separate block near the end, built by the Use rules in the brand's colours and fonts. A single field and a pill at the end, like an email sign-up, can stay.

## Without real media

Show pages need strong images. Use the user's own pictures, `scripts/collage.py` for cut-outs, or ask for some. If there are none, a calm page with strong type beats a stack of empty gradients, which always look like placeholders.

## Before calling it done

- Scroll the whole page slowly, then fast, then back up. Nothing should be blank, stuck or still moving after you stop.
- Check every screen at 1366 by 768, 1920 by 1080 and phone width. Text must stay off the subject and inside the screen at each.
- Check text contrast against the brightest part of the media behind it.
- Turn on reduced motion and check the page still reads top to bottom.
