/* Verbatim from the TTM website (commit 4345179). Reference only. The EASE value below is the cause of the delayed scroll stop: do not reuse it. */

/* ===== Smooth wheel (script.js) ===== */
  (function initSmoothScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var current = window.scrollY;
    var target = current;
    var looping = false;
    var EASE = 0.01;

    function maxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function clampScroll(y) {
      return Math.max(0, Math.min(maxScroll(), y));
    }

    /* This eased wheel scroll is a sitewide feel, not just the pinned hero -
       every page gets the same slow, momentum-like deceleration once a
       scroll starts. It has no handoff to native scroll: that was tried
       (keying off a landmark section past the hero) and it made scrolling
       past that point feel abrupt by comparison, which read as worse than
       just keeping the one consistent feel everywhere. */
    function isInsideScrollable(node) {
      while (node && node !== document.documentElement) {
        if (node.nodeType === 1) {
          if (node.matches && node.matches('model-viewer, .viewer3d, [data-scroll-ignore]')) return true;
          var style = window.getComputedStyle(node);
          if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 2) {
            return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    }

    /* behavior:'instant' is required here - html has scroll-behavior:smooth
       for anchor-link jumps, which would otherwise make the browser layer
       its own smoothing on top of every per-frame position we set,
       fighting our easing and making the motion arrive late/erratic. */
    function setScroll(y) {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    }

    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        looping = false;
      }
      setScroll(current);
      if (looping) requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!looping) {
        looping = true;
        requestAnimationFrame(loop);
      }
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (isInsideScrollable(e.target)) return;

      if (!looping) current = target = window.scrollY;

      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 18;
      else if (e.deltaMode === 2) delta *= window.innerHeight;

      target = clampScroll(target + delta);
      e.preventDefault();
      startLoop();
    }, { passive: false });

    window.addEventListener('resize', function () {
      target = clampScroll(target);
    }, { passive: true });

    smoothScrollTo = function (y, opts) {
      var clamped = clampScroll(y);
      if (opts && opts.instant) {
        current = target = clamped;
        setScroll(current);
        return;
      }
      if (!looping) current = window.scrollY;
      target = clamped;
      startLoop();
    };
    window.__ttmSmoothScroll = smoothScrollTo;
  })();

/* ===== Sheet stack timing (script.js) ===== */
    function rawProgress() {
      var rect = track.getBoundingClientRect();
      var travel = Math.max(1, track.offsetHeight - window.innerHeight);
      return clamp01(-rect.top / travel);
    }

    function coverSpan(t, start, end) {
      if (t <= start) return 0;
      if (t >= end) return 1;
      return outCubic((t - start) / (end - start));
    }

    function coversFromProgress(t) {
      return {
        a: coverSpan(t, 0.05, 0.24),
        b: coverSpan(t, 0.36, 0.54),
        c: coverSpan(t, 0.66, 0.86)
      };
    }
    function paint() {
      if (pin) pin.scrollTop = 0;
      if (reduce.matches) {
        stack.style.setProperty('--cover-a', '1');
        stack.style.setProperty('--cover-b', '1');
        stack.style.setProperty('--cover-c', '1');
        return;
      }
      var covers = coversFromProgress(rawProgress());
      stack.style.setProperty('--cover-a', covers.a.toFixed(4));
      stack.style.setProperty('--cover-b', covers.b.toFixed(4));
      stack.style.setProperty('--cover-c', covers.c.toFixed(4));
      if (covers.c >= 0.995) stack.classList.add('film-stack--settled');
      else stack.classList.remove('film-stack--settled');
      if (active) syncVideos(covers.a, covers.b, covers.c);
    }

/* ===== Parallax (script.js) ===== */
  (function initFieldStripParallax() {
    var section = document.querySelector('.forge-strip--field');
    var photo = section && section.querySelector('.forge-strip__photo');
    if (!section || !photo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var target = 0;
    var current = 0;
    var ticking = false;
    var active = false;

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function computeTarget() {
      var rect = section.getBoundingClientRect();
      var view = window.innerHeight || 1;
      var travel = view + rect.height;
      if (travel <= 0) return 0;
      var progress = clamp((view - rect.top) / travel, 0, 1);
      var range = Math.max(80, (photo.offsetHeight - section.offsetHeight) * 0.42);
      return (0.5 - progress) * range;
    }

    function frameTick() {
      ticking = false;
      if (!active) return;
      target = computeTarget();
      current += (target - current) * 0.16;
      photo.style.transform = 'translate3d(0,' + current.toFixed(1) + 'px,0)';
      if (Math.abs(target - current) > 0.35) requestTick();
    }

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frameTick);
      }
    }

    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) requestTick();
        else ticking = false;
      }, { rootMargin: '35% 0px' }).observe(section);
    } else {
      active = true;
    }

    window.addEventListener('scroll', function () {
      if (active) requestTick();
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (active) requestTick();
    }, { passive: true });
    requestTick();
  })();

/* ===== Button glow (script.js) ===== */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--pointer-x', x + '%');
      btn.style.setProperty('--pointer-y', y + '%');
    });
  });

/* ===== Section reveal (home-stage.js) ===== */
  function chapterReveal(ch) {
    const vh = window.innerHeight;
    const rect = ch.getBoundingClientRect();
    const enter = clamp01((vh * 0.78 - rect.top) / (vh * 0.52));
    const exit = clamp01((rect.bottom - vh * 0.12) / (vh * 0.35));
    return Math.min(enter, exit);
  }

/* ===== Beats (home-stage.js) ===== */
function beatPhase(q, i, count) {
  const pad = 0.04;
  const size = (1 - pad * 2) / count;
  const at = pad + i * size;
  const ramp = Math.min(0.14, size * 0.42);
  return smooth(q, at, at + ramp) * (1 - smooth(q, at + size - ramp * 0.45, at + size + ramp * 0.45));
}
