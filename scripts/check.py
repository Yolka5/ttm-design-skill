#!/usr/bin/env python3
"""Check a page against the banned list. Prints each problem and exits 1 if any.

    python check.py page.html [more.html ...]

It catches what a script can see: banned patterns, banned words, colour
tokens whose text fails contrast, and parts from the wrong side of the library.
A page says its side with <html data-kind="use"> or <html data-kind="show">.
On a Show page, wrap a Use part such as an order form in an element with
data-use-part, and it is checked as Use. Taste, and whether the page works,
is still a human call. Run scripts/shoot.mjs for what only a browser can show.
"""
import re
import sys
from html.parser import HTMLParser

EM_DASH = "—"
SMALL_TITLE_CLASS = re.compile(r"eyebrow|kicker|overline|pretitle|preheading|tagline|section-label__tiny", re.I)
NOISE = re.compile(r"<(script|style)\b.*?</\1>", re.S | re.I)
RULE = re.compile(r"([^{}]+)\{([^{}]*)\}")
TEXT_BEFORE_HEADING = re.compile(
    r"<(p|span|div|small)\b([^>]*)>\s*([^<]{2,60}?)\s*</\1>\s*<h[1-3]\b", re.I
)
CSS_CHECKS = [
    (re.compile(r"transition\s*:\s*all\b"), "transition: all. Name the exact properties"),
    (re.compile(r"\bscale\(\s*0\s*\)"), "scale(0). Start from 0.95 with opacity 0"),
    (re.compile(r"@keyframes\s+[\w-]*(pulse|blink|ping)", re.I), "pulsing or blinking decoration"),
    (re.compile(r"\bease-in\b(?!-)"), "ease-in on an interface element. Use ease-out"),
]
BANNED_WORDS = [
    (re.compile(r"\bsuccessfully\b", re.I), '"successfully". The message already is the success'),
    (re.compile(r"\bplease\b", re.I), '"please". The interface is not asking a favour'),
    (re.compile(r"\bclick here\b", re.I), '"click here". Name where the link goes'),
]
# Text token on background token. Each pair must reach 4.5:1 in light and dark.
PAIRS = [
    ("ink", "surface-0"), ("ink", "surface-1"), ("ink", "surface-2"),
    ("ink-soft", "surface-0"), ("ink-soft", "surface-1"),
    ("on-main", "main"),
    ("on-meaning", "meaning-a"), ("on-meaning", "meaning-b"), ("on-meaning", "meaning-c"),
    ("on-danger", "danger"), ("on-success", "success"), ("on-warning", "warning"),
    ("danger-text", "danger-soft"), ("success-text", "success-soft"), ("warning-text", "warning-soft"),
    ("danger-text", "surface-0"), ("success-text", "surface-0"),
    # Show pages: the brand layer.
    ("brand-ink", "brand-bg"), ("brand-soft", "brand-bg"), ("brand-accent", "brand-bg"),
    ("brand-light-ink", "brand-light"), ("brand-light-soft", "brand-light"), ("brand-accent-deep", "brand-light"),
    ("brand-mid-ink", "brand-mid"),
]
# Parts that belong to one side only. Each entry: class or attribute test, what it is.
SHOW_ONLY = [
    (lambda c, a: "stack" in c or "sheet" in c, "sheet stack"),
    (lambda c, a: "data-beats" in a or "s-seq" in c, "pinned beats or product sequence"),
    (lambda c, a: "letters" in c, "letter reveal"),
    (lambda c, a: "btn" in c, "glass pill button"),
    (lambda c, a: "glass-panel" in c, "glass panel"),
    (lambda c, a: "card-row" in c, "tilted card row"),
    (lambda c, a: bool(c & {"s-open", "s-band", "s-mosaic", "s-tile", "s-statement-band", "s-close"}), "Show section"),
]
USE_ONLY = [
    (lambda c, a: bool(c & {"q-btn", "q-btn--main"}), "quiet button"),
    (lambda c, a: bool(c & {"stats", "stat__v"}), "stat readout"),
    (lambda c, a: bool(c & {"banner", "badge"}), "status banner or badge"),
    (lambda c, a: bool(c & {"rows", "row-item"}), "dense rows"),
    (lambda c, a: bool(c & {"picks", "pick", "seg"}), "tabs or segmented picker"),
    (lambda c, a: "ctl" in c or a.get("type") == "range", "slider"),
    (lambda c, a: "prose" in c, "narrow article column"),
]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SOFT_TEXT = re.compile(r"muted|soft|secondary|caption|hint|subtle|faded|dim", re.I)
SMALL_WORDS = {"a", "an", "and", "the", "of", "to", "in", "on", "for", "or", "at", "by", "with"}


class Parts(HTMLParser):
    """Collects visible text, the text of each button, and which side each
    element's parts belong to."""

    def __init__(self):
        super().__init__()
        self.text, self.buttons, self.disabled = [], [], 0
        self._button = None
        self.kind = None
        self.found = []          # (classes, attrs, inside a data-use-part block)
        self._open = []          # (tag, starts a use part)
        self._use_depth = 0

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag == "html":
            self.kind = (a.get("data-kind") or "").strip().lower() or None
        classes = set((a.get("class") or "").split())
        self.found.append((classes, a, self._use_depth > 0))
        if tag not in VOID:
            starts = "data-use-part" in a
            self._open.append((tag, starts))
            self._use_depth += starts
        if tag == "button" or (tag == "a" and classes & {"q-btn", "btn"}):
            self._button = []
            if tag == "button" and "disabled" in a:
                self.disabled += 1

    def handle_endtag(self, tag):
        for i in range(len(self._open) - 1, -1, -1):
            if self._open[i][0] == tag:
                for _, starts in self._open[i:]:
                    self._use_depth -= starts
                del self._open[i:]
                break
        if tag in ("button", "a") and self._button is not None:
            self.buttons.append(" ".join("".join(self._button).split()))
            self._button = None

    def handle_data(self, data):
        self.text.append(data)
        if self._button is not None:
            self._button.append(data)


def uppercase_classes(css):
    """Class names styled as small spaced-out capitals."""
    found = set()
    for selector, body in RULE.findall(css):
        if re.search(r"text-transform\s*:\s*uppercase", body) and re.search(r"letter-spacing", body):
            found.update(re.findall(r"\.([\w-]+)", selector))
    return found


def highlighted_heading_words(body, css):
    """Words inside a heading that sit on a background block."""
    filled = set()
    for selector, rule in RULE.findall(css):
        if re.search(r"background(-color|-image)?\s*:", rule):
            filled.update(re.findall(r"\.([\w-]+)", selector))
    for heading in re.findall(r"<h[1-6]\b[^>]*>(.*?)</h[1-6]>", body, re.S | re.I):
        for tag, attrs, text in re.findall(r"<(\w+)\b([^>]*)>([^<]*)</\1>", heading):
            classes = set(re.findall(r'class="([^"]*)"', attrs)[0].split()) if 'class="' in attrs else set()
            if tag.lower() == "mark" or classes & filled or "background" in attrs:
                yield text.strip()


def mono_label_rules(css):
    for selector, body in RULE.findall(css):
        if "monospace" in body or "mono" in body.lower():
            if re.search(r"text-transform\s*:\s*uppercase", body) and re.search(r"letter-spacing", body):
                yield selector.strip()


def luminance(hex_colour):
    h = hex_colour.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    channels = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    channels = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def token_sets(css):
    """Light tokens from plain :root, dark tokens from the dark-mode blocks on top."""
    var = re.compile(r"--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b")
    light, dark = {}, {}
    for selector, body in RULE.findall(css):
        sel = selector.strip()
        if re.fullmatch(r":root", sel.split("\n")[-1].strip()):
            light.update(dict(var.findall(body)))
    for block in re.findall(r"prefers-color-scheme:\s*dark\)\s*\{(.*?\})\s*\}", css, re.S):
        dark.update(dict(var.findall(block)))
    for selector, body in RULE.findall(css):
        if "data-theme='dark'" in selector or 'data-theme="dark"' in selector:
            dark.update(dict(var.findall(body)))
    return light, {**light, **dark} if dark else {}


def contrast_problems(css):
    light, dark = token_sets(css)
    for name, tokens in (("light", light), ("dark", dark)):
        for fg, bg in PAIRS:
            if fg in tokens and bg in tokens:
                c = contrast(tokens[fg], tokens[bg])
                if c < 4.5:
                    yield f"--{fg} on --{bg} is {c:.1f}:1 in {name} mode, under 4.5:1"


def opacity_on_text(css):
    for selector, body in RULE.findall(css):
        if re.search(r"(?<![-\w])opacity\s*:\s*0?\.\d", body) and SOFT_TEXT.search(selector) and not re.search(r"transition|::before|::after", selector):
            yield selector.strip()


def side_problems(parts, css):
    """Parts from the other side of the library, and Use timing rules."""
    if parts.kind not in ("use", "show"):
        return ['no page kind. Add data-kind="use" or data-kind="show" to <html>']
    problems, seen = [], set()
    for classes, attrs, in_use_part in parts.found:
        side = "use" if (parts.kind == "use" or in_use_part) else "show"
        wrong = SHOW_ONLY if side == "use" else USE_ONLY
        for test, name in wrong:
            if test(classes, attrs) and (side, name) not in seen:
                seen.add((side, name))
                where = "a Use part" if in_use_part else f"a {side.title()} page"
                problems.append(f"{name} on {where}. It belongs to the other side")
    if parts.kind == "use":
        parallax = sum(1 for c, a, _ in parts.found if "data-parallax" in a)
        if parallax > 1:
            problems.append(f"{parallax} parallax layers on a Use page. Read pages get one at most")
        for selector, body in RULE.findall(css):
            for m in re.finditer(r"transition[^;]*?(\d*\.?\d+)(ms|s)\b", body):
                ms = float(m.group(1)) * (1000 if m.group(2) == "s" else 1)
                if ms > 300 and "@media" not in selector:
                    problems.append(f"{int(ms)}ms transition on a Use page: {selector.strip()[:60]}. Keep interface motion under 300ms")
                    break
    return problems


def title_case(label):
    words = [w for w in re.findall(r"[A-Za-z][\w']*", label)]
    if len(words) < 2:
        return False
    rest = words[1:]
    # A capitalised small word mid-label is Title Case: "Order The Beaver".
    if any(w.lower() in SMALL_WORDS and w[0].isupper() for w in rest):
        return True
    # Otherwise it takes two capitalised words, so one proper name is fine: "Order the Beaver".
    big = [w for w in rest if w.lower() not in SMALL_WORDS]
    return len(big) >= 2 and all(w[0].isupper() and not w.isupper() for w in big)


def check(path):
    with open(path, encoding="utf8") as f:
        html = f.read()
    css = "\n".join(re.findall(r"<style\b[^>]*>(.*?)</style>", html, re.S | re.I))
    body = NOISE.sub("", html)
    problems = []

    parts = Parts()
    parts.feed(body)
    text = "".join(parts.text)
    count = text.count(EM_DASH)
    if count:
        problems.append(f"{count} em dash(es) in the text")

    small = uppercase_classes(css)
    for _, attrs, words in TEXT_BEFORE_HEADING.findall(body):
        classes = set(re.findall(r'class="([^"]*)"', attrs)[0].split()) if 'class="' in attrs else set()
        words = words.strip()
        if SMALL_TITLE_CLASS.search(attrs) or classes & small or (words.isupper() and len(words.split()) <= 6):
            problems.append(f'small title above a heading: "{words}"')

    for word in highlighted_heading_words(body, css):
        problems.append(f'highlight block behind a heading word: "{word}"')

    for selector in mono_label_rules(css):
        problems.append(f"spaced-out mono label: {selector}")

    for pattern, message in CSS_CHECKS:
        if pattern.search(css):
            problems.append(message)

    if re.search(r"<(span|div|small)\b[^>]*>\s*0[1-9]\s*</\1>", body):
        problems.append("tiny numbered label. Keep numbers for real sequences")

    for pattern, message in BANNED_WORDS:
        hits = len(pattern.findall(text))
        if hits:
            problems.append(f"{message} ({hits}x)")

    if parts.disabled:
        problems.append(f"{parts.disabled} disabled button(s). Keep them live and explain on press")

    for label in sorted({b for b in parts.buttons if title_case(b)}):
        problems.append(f'Title Case button: "{label}". Use sentence case')

    for selector in opacity_on_text(css):
        problems.append(f"opacity used to soften text: {selector}. Use --ink-soft")

    problems.extend(side_problems(parts, css))
    problems.extend(contrast_problems(css))
    return problems


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    failed = False
    for path in sys.argv[1:]:
        problems = check(path)
        print(f"{path}: {'clean' if not problems else str(len(problems)) + ' problem(s)'}")
        for problem in problems:
            print(f"  - {problem}")
        failed = failed or bool(problems)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
