# TTM-Design

A design skill for Claude that builds web pages that look designed rather than generated.

It starts every job by asking a few questions, then sorts the page into one of two kinds and follows only that kind's rules:

- **Use pages** are for working or reading: calculators, dashboards, settings, forms, articles, explainers and lessons. They are calm, clear and quick.
- **Show pages** are for making an impression: brand sites, product pages, launches and portfolios. They lead with strong pictures and tell a story as you scroll.

The two never mix on one page, and a checking script catches it when they do.

## Install

**Claude Code:** clone this repo into your skills folder.

```bash
git clone https://github.com/Yolka5/ttm-design-skill ~/.claude/skills/ttm-design
```

**Claude.ai:** download the repo as a zip and upload it under Settings, Capabilities, Skills.

Then ask Claude to build or restyle anything for the web. The skill loads by itself.

## What is in here

| Path | What it does |
| --- | --- |
| `SKILL.md` | The entry point: the brief, Use or Show, the shared decisions and the banned list. |
| `references/brief.md` | The questions to ask before any work. |
| `references/shared/` | Type and colour, writing, craft and timing, images. |
| `references/use/` | Tool and Read modes. |
| `references/show/` | Stage mode, art direction, brand and motion. |
| `assets/` | Tokens, controls, the motion kit, Show parts and starter templates. |
| `scripts/check.py` | Checks a page for the banned list, contrast and mixing. Python 3. |
| `scripts/shoot.mjs` | Screenshots a page at desktop and phone width. Node 22 and Chrome. |
| `scripts/collage.py`, `scripts/ground.py` | Image tools. Need Pillow, and OpenCV for collages. |

## Credits

- The Show patterns come from the Tomer Tamir Machinery website. Its own colours and fonts stay out of the library.
- `references/shared/craft.md` adapts Emil Kowalski's design engineering skill ([github.com/emilkowalski/skills](https://github.com/emilkowalski/skills), MIT).
- Principles were studied from NRK, Anduril and Scale. This project is not affiliated with any of them and copies none of their fonts, logos or artwork.

## License

MIT. See `LICENSE`.
