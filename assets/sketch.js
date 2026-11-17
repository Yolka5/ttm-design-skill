/* Hand-drawn sketch style for SVG. No dependencies.

   <svg data-sketch viewBox="0 0 200 200">
     <path d="..." fill="#f5b971" stroke="#111" stroke-width="2.5"/>
     <circle cx="100" cy="100" r="30" fill="#fff" stroke="#111"/>
   </svg>

   Every shape inside is redrawn as a wobbly double line, and any fill is laid
   down a little off the line and a little bigger than it, like a marker
   colouring in quickly. The result is the same each time for the same shape.
   Options on the <svg> or on one shape:
     data-rough="1.4"  how far lines wander, in drawing units
     data-spill="3"    how far the fill slips off the line
     data-seed="7"     a different hand for the same drawing
   window.ttmSketch.draw(svg) redraws one after changing it. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SHAPES = 'path, circle, ellipse, rect, polygon, polyline, line';

  function rng(seed) {
    let s = (seed * 9301 + 49297) % 233280 || 1;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  }

  /* Smooth wander rather than jitter: a few slow sine waves with random phase. */
  function wander(rand, amp) {
    const waves = [0, 1, 2].map(() => ({ f: 0.02 + rand() * 0.06, p: rand() * Math.PI * 2, a: amp * (0.4 + rand() * 0.6) }));
    return (t) => waves.reduce((sum, w) => sum + Math.sin(t * w.f + w.p) * w.a, 0) / 1.6;
  }

  function sample(el) {
    let len = 0;
    try { len = el.getTotalLength(); } catch { return null; }
    if (!len) return null;
    const n = Math.max(14, Math.min(400, Math.round(len / 6)));
    const pts = [];
    for (let i = 0; i <= n; i++) { const p = el.getPointAtLength((i / n) * len); pts.push([p.x, p.y, (i / n) * len]); }
    return { pts, len };
  }

  function displace(pts, dx, dy) {
    return pts.map(([x, y, d], i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
      const o = dx(d);
      return [x - (ty / m) * o + dy(d) * 0.3, y + (tx / m) * o + dy(d) * 0.3];
    });
  }

  /* Catmull-Rom through the points, written as cubic curves. */
  function toPath(p, closed) {
    if (p.length < 2) return '';
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
      d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    }
    return closed ? d + 'Z' : d;
  }

  const num = (v, fallback) => (v == null || v === '' || isNaN(+v) ? fallback : +v);

  function drawShape(el, svg, index) {
    const got = sample(el);
    if (!got) return;
    const cs = getComputedStyle(el);
    const pick = (attr, css) => el.getAttribute(attr) || cs[css];
    const fill = pick('fill', 'fill');
    const stroke = pick('stroke', 'stroke');
    const width = num(el.getAttribute('stroke-width'), parseFloat(cs.strokeWidth) || 2);
    const rough = num(el.dataset.rough ?? svg.dataset.rough, 1.4);
    const spill = num(el.dataset.spill ?? svg.dataset.spill, 3);
    const seed = num(el.dataset.seed ?? svg.dataset.seed, 1) * 101 + index * 17;
    const rand = rng(seed);
    const closed = !/^(line|polyline)$/i.test(el.tagName) && !(el.tagName === 'path' && !/z\s*$/i.test(el.getAttribute('d') || ''));
    const group = document.createElementNS(NS, 'g');
    group.setAttribute('data-sketched', '');
    if (el.getAttribute('transform')) group.setAttribute('transform', el.getAttribute('transform'));

    if (fill && fill !== 'none' && !/rgba?\(0, 0, 0, 0\)|transparent/.test(fill)) {
      const ox = (rand() - 0.5) * spill * 1.6, oy = (rand() - 0.5) * spill * 1.6;
      const blob = displace(got.pts, wander(rand, spill * 0.9), wander(rand, spill)).map(([x, y]) => [x + ox, y + oy]);
      const f = document.createElementNS(NS, 'path');
      f.setAttribute('d', toPath(blob, true));
      f.setAttribute('fill', fill);
      group.appendChild(f);
    }
    if (stroke && stroke !== 'none') {
      for (let pass = 0; pass < 2; pass++) {
        const line = displace(got.pts, wander(rand, rough), wander(rand, rough));
        const s = document.createElementNS(NS, 'path');
        s.setAttribute('d', toPath(line, false));
        s.setAttribute('fill', 'none');
        s.setAttribute('stroke', stroke);
        s.setAttribute('stroke-width', (width * (pass ? 0.75 : 1)).toFixed(2));
        s.setAttribute('stroke-linecap', 'round');
        s.setAttribute('stroke-linejoin', 'round');
        if (pass) s.setAttribute('opacity', '0.85');
        group.appendChild(s);
      }
    }
    el.after(group);
    el.setAttribute('data-sketch-source', '');
    el.style.visibility = 'hidden';
  }

  function draw(svg) {
    svg.querySelectorAll('[data-sketched]').forEach((g) => g.remove());
    const shapes = [...svg.querySelectorAll(SHAPES)].filter((el) => !el.closest('defs, [data-sketched]'));
    shapes.forEach((el) => { el.style.visibility = ''; });
    shapes.forEach((el, i) => drawShape(el, svg, i));
  }

  function init() { document.querySelectorAll('svg[data-sketch]').forEach(draw); }
  window.ttmSketch = { draw, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
