/* Scroll-linked motion kit. No dependencies.

   Scroll position becomes CSS custom properties, and CSS turns those into
   movement. Pages stay readable without this file: pinning only switches on
   once an element reads data-mode="live".

   Patterns, each opt-in by markup:
     .stack            sheets that arrive from a direction you set
     [data-reveal]     a section that builds in and fades out as it passes
     [data-parallax]   a layer that drifts slower than the page
     [data-beats]      a pinned section that steps through its content
     .letters          a headline that flips up letter by letter
     .btn              pointer-tracked glow
     html[data-smooth-wheel]  eased mouse wheel, off unless asked for */

(function () {
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const span = (v, a, b) => (b === a ? (v < a ? 0 : 1) : clamp01((v - a) / (b - a)));
  const smooth = (v, a, b) => {
    const t = span(v, a, b);
    return t * t * (3 - 2 * t);
  };
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -9 * t));

  /* Time-based, so it feels the same at 60Hz and 144Hz. A per-frame factor
     like `current += (target - current) * 0.1` runs at the screen's speed. */
  const damp = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setProp = (el, name, value) => el.style.setProperty(name, value.toFixed(4));

  /* One loop for everything. A painter returns true to ask for another frame. */
  const painters = new Set();
  let scheduled = false;
  let lastFrame = 0;

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(frame);
  }

  function frame(now) {
    scheduled = false;
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
    lastFrame = now;
    let again = false;
    for (const paint of painters) if (paint(dt)) again = true;
    if (again) schedule();
    else lastFrame = 0;
  }

  /* Skips work for elements far from the viewport. */
  function nearby(el, margin) {
    const state = { on: true };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        state.on = entries[0].isIntersecting;
        if (state.on) schedule();
      }, { rootMargin: margin + ' 0px' }).observe(el);
    }
    return state;
  }

  function trackProgress(track) {
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, track.offsetHeight - window.innerHeight);
    return clamp01(-rect.top / travel);
  }

  /* ===== Sheet stack =====
     Each sheet slides over the last from its data-from direction while the
     one underneath recedes. Timing matches the site: with three moves it lands
     on 0.05-0.24, 0.36-0.55 and 0.67-0.86 of the scroll, resting in between. */
  const DIRECTIONS = { bottom: [0, 1], top: [0, -1], left: [-1, 0], right: [1, 0] };

  function initStack(root) {
    const track = root.querySelector('.stack__track') || root;
    const sheets = [...root.querySelectorAll('.sheet')];
    if (sheets.length < 2) return;

    const count = sheets.length - 1;
    const step = 0.93 / count;
    const start = (i) => 0.05 + step * i;
    const fits = window.matchMedia('(min-width: 768px)');
    const near = nearby(track, '30%');
    const videos = sheets.map((sheet) => sheet.querySelector('video'));
    const playing = videos.map(() => null);
    const live = () => fits.matches && !reduced();

    root.style.setProperty('--count', sheets.length);
    sheets.forEach((sheet, i) => {
      const [dx, dy] = DIRECTIONS[sheet.dataset.from] || DIRECTIONS.bottom;
      const next = sheets[i + 1];
      const [nx, ny] = next ? DIRECTIONS[next.dataset.from] || DIRECTIONS.bottom : [0, 0];
      sheet.style.zIndex = i + 1;
      sheet.style.setProperty('--dx', i ? dx : 0);
      sheet.style.setProperty('--dy', i ? dy : 0);
      sheet.style.setProperty('--nx', nx);
      sheet.style.setProperty('--ny', ny);
    });

    const cover = (p, i) => outCubic(span(p, start(i), start(i) + step * 0.61));

    function syncVideo(i, show) {
      const video = videos[i];
      if (!video || playing[i] === show) return;
      playing[i] = show;
      if (show) video.play().catch(() => {});
      else video.pause();
    }

    function setMode() {
      root.dataset.mode = live() ? 'live' : 'static';
      schedule();
    }

    painters.add(() => {
      if (root.dataset.mode !== 'live' || !near.on) return false;
      const p = trackProgress(track);
      sheets.forEach((sheet, i) => {
        const arrive = i ? cover(p, i - 1) : 1;
        const leave = i < count ? cover(p, i) : 0;
        setProp(sheet, '--in', arrive);
        setProp(sheet, '--out', leave);
        syncVideo(i, arrive > 0.4 && leave < 0.55);
      });
      root.classList.toggle('stack--settled', p >= 1);
      return false;
    });

    /* Tabbing to a link on a hidden sheet scrolls that sheet into place. */
    root.addEventListener('focusin', (e) => {
      if (root.dataset.mode !== 'live') return;
      const i = sheets.findIndex((sheet) => sheet.contains(e.target));
      if (i < 0) return;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(0, track.offsetHeight - window.innerHeight);
      const at = i ? start(i - 1) + step * 0.8 : 0;
      window.scrollTo({ top: window.scrollY + rect.top + travel * at, behavior: 'instant' });
    });

    fits.addEventListener('change', setMode);
    setMode();
  }

  /* ===== Reveal =====
     Sections build in as they enter and fade as they leave. --reveal stays
     tied to position, so scrolling back up plays it in reverse. */
  function initReveal(el) {
    const near = nearby(el, '30%');
    painters.add(() => {
      if (!near.on) return false;
      if (reduced()) {
        el.style.setProperty('--reveal', '1');
        return false;
      }
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      /* The last section may never reach the usual finish line, so the reveal
         ends at the highest point it can actually scroll to. */
      const maxScroll = document.documentElement.scrollHeight - vh;
      const highest = rect.top + (maxScroll - window.scrollY);
      const finish = Math.max(vh * 0.26, highest);
      const enter = finish >= vh * 0.7 ? 1 : clamp01((vh * 0.78 - rect.top) / (vh * 0.78 - finish));
      const exit = clamp01((rect.bottom - vh * 0.12) / (vh * 0.35));
      setProp(el, '--reveal', Math.min(enter, exit));
      return false;
    });
  }

  /* ===== Parallax =====
     A short drift, not a full pan. The layer needs to be taller than its
     frame, and the range scales with how much spare height it has. */
  function initParallax(frameEl) {
    const layer = frameEl.querySelector('[data-parallax-layer]');
    if (!layer) return;
    const near = nearby(frameEl, '35%');
    let current = 0;

    painters.add((dt) => {
      if (!near.on || reduced()) return false;
      const rect = frameEl.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = clamp01((vh - rect.top) / (vh + rect.height));
      const range = Math.max(80, (layer.offsetHeight - frameEl.offsetHeight) * 0.42);
      const target = (0.5 - progress) * range;
      current = damp(current, target, 10.5, dt);
      layer.style.transform = 'translate3d(0,' + current.toFixed(1) + 'px,0)';
      return Math.abs(target - current) > 0.35;
    });
  }

  /* ===== Beats =====
     A pinned section that hands the frame from one beat to the next. The last
     beat holds, so the section never ends on an empty frame. */
  function beatT(q, i, count) {
    const pad = 0.04;
    const size = (1 - pad * 2) / count;
    const at = pad + i * size;
    const ramp = Math.min(0.14, size * 0.42);
    const up = i === 0 ? 1 : smooth(q, at, at + ramp);
    const down = i === count - 1 ? 0 : smooth(q, at + size - ramp * 0.45, at + size + ramp * 0.45);
    return { up, t: up * (1 - down) };
  }

  function initBeats(root) {
    const beats = [...root.querySelectorAll('[data-beat]')];
    if (!beats.length) return;
    const fits = window.matchMedia('(min-width: 768px)');
    const near = nearby(root, '30%');
    const curtain = root.dataset.curtain ? root.dataset.curtain.split(',').map(Number) : null;
    const counts = beats.map((beat) => [...beat.querySelectorAll('[data-count]')]);

    root.style.setProperty('--count', beats.length);

    function setMode() {
      root.dataset.mode = fits.matches && !reduced() ? 'live' : 'static';
      schedule();
    }

    painters.add(() => {
      if (root.dataset.mode !== 'live' || !near.on) return false;
      const q = trackProgress(root);
      setProp(root, '--q', q);
      if (curtain) setProp(root, '--slide', span(q, curtain[0], curtain[1]) + span(q, curtain[2], curtain[3]));
      beats.forEach((beat, i) => {
        const { up, t } = beatT(q, i, beats.length);
        setProp(beat, '--t', t);
        beat.style.setProperty('--reveal', t.toFixed(4));
        beat.dataset.on = t > 0.015 ? '1' : '0';
        /* Counts follow the way in only, so numbers never run backwards as they fade. */
        for (const el of counts[i]) {
          el.textContent = Math.round(outExpo(up) * Number(el.dataset.count)).toLocaleString('en-US');
        }
      });
      return false;
    });

    fits.addEventListener('change', setMode);
    setMode();
  }

  /* ===== Letters =====
     Splits a headline for the flip-up. The lead is divided by the length, so
     long headlines finish on time instead of ending half-revealed. */
  function initLetters(el) {
    const text = el.textContent.trim();
    const total = text.replace(/\s/g, '').length;
    let i = 0;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) {
        el.append(' ');
        return;
      }
      const word = document.createElement('span');
      word.className = 'letters__word';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of part) {
        const span = document.createElement('span');
        span.className = 'letters__ch';
        span.textContent = ch;
        span.style.setProperty('--i', i++);
        span.style.setProperty('--n', total);
        word.append(span);
      }
      el.append(word);
    });
    el.classList.add('letters--split');
  }

  /* ===== Button glow ===== */
  function initButtons() {
    document.addEventListener('pointermove', (e) => {
      const btn = e.target.closest && e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--pointer-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      btn.style.setProperty('--pointer-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    }, { passive: true });
  }

  /* ===== Smooth wheel =====
     Native wheel input moves in fixed steps, which makes scroll-linked motion
     look stepped. This eases toward each step instead. Rate 12 settles a
     100px wheel notch in about 0.4s. Below about 6 it starts to feel like the
     page keeps moving after you stop. */
  function canScroll(node, delta) {
    while (node && node !== document.body && node.nodeType === 1) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        const room = delta > 0
          ? node.scrollHeight - node.clientHeight - node.scrollTop
          : node.scrollTop;
        if (room > 0) return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function initSmoothWheel() {
    const html = document.documentElement;
    if (!html.hasAttribute('data-smooth-wheel')) return;
    if (reduced() || window.matchMedia('(pointer: coarse)').matches) return;

    const rate = Number(html.dataset.smoothWheel) || 12;
    let current = window.scrollY;
    let target = current;
    let running = false;
    let last = 0;

    const clampY = (y) => Math.max(0, Math.min(html.scrollHeight - window.innerHeight, y));

    function step(now) {
      if (!running) return;
      const dt = Math.min(0.05, Math.max(0, now - last) / 1000);
      last = now;
      current = damp(current, target, rate, dt);
      if (Math.abs(target - current) < 0.5) {
        current = target;
        running = false;
      }
      /* 'instant' stops a CSS scroll-behavior: smooth from fighting this. */
      window.scrollTo({ top: current, left: 0, behavior: 'instant' });
      if (running) requestAnimationFrame(step);
    }

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.defaultPrevented || canScroll(e.target, e.deltaY)) return;
      if (!running) current = target = window.scrollY;
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 18;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      target = clampY(target + delta);
      e.preventDefault();
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(step);
      }
    }, { passive: false });

    /* Keyboard and scrollbar drags stay native, so they cancel the easing. */
    const cancel = () => { running = false; };
    window.addEventListener('keydown', cancel);
    window.addEventListener('pointerdown', cancel);
  }

  function init() {
    document.querySelectorAll('.letters').forEach(initLetters);
    document.querySelectorAll('.stack').forEach(initStack);
    document.querySelectorAll('[data-reveal]').forEach(initReveal);
    document.querySelectorAll('[data-parallax]').forEach(initParallax);
    document.querySelectorAll('[data-beats]').forEach(initBeats);
    initButtons();
    initSmoothWheel();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
