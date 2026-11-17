/* Editor parts for Use pages. No dependencies. Pair with editor.css.

   Each part is opt-in by markup:
     [data-icon="name"]   an inline icon from the set below
     [data-tip="Label"]   a tooltip, with data-key="P" for its shortcut
     nav[data-outline="#doc"]  the outline rail for the headings inside #doc
     [data-dock]          the floating toolbar (see templates/editor.html)
     [data-etable]        hover handles on a table: drag rows and columns, menus
     [data-selbar]        a bar over selected text inside an editable area

   Events, so a page can act on choices:
     dock:change  { tool, option }      dock:prompt { text }
     selbar       { action, text }      etable:change { table, kind }
   window.ttmEditor.menu(anchor, items) opens a small menu anywhere. */
(function () {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ===== Icons ===== 24px grid, 1.6 stroke, round ends. */
  const ICONS = {
    pointer: '<path d="M5 3.5l13 6.2-5.6 1.8-2.1 5.7z"/>',
    hand: '<path d="M8 11V5.5a1.5 1.5 0 013 0V10m0-4.5v-1a1.5 1.5 0 013 0V10m0-4a1.5 1.5 0 013 0v5m0-2.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.6a6 6 0 01-4.9-2.6L5.6 15a1.6 1.6 0 012.4-2.1L8 13"/>',
    text: '<path d="M5 6.5V5h14v1.5M12 5v14m-3 0h6"/>',
    frame: '<path d="M8 4v16M16 4v16M4 8h16M4 16h16"/>',
    sticky: '<path d="M5 5h14v9l-5 5H5z"/><path d="M14 19v-5h5"/>',
    pencil: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 013 3L8 18.5z"/><path d="M13.5 7l3 3"/>',
    square: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/>',
    circle: '<circle cx="12" cy="12" r="7.5"/>',
    pill: '<rect x="3" y="7.5" width="18" height="9" rx="4.5"/>',
    diamond: '<path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12z"/>',
    roundrect: '<rect x="3.5" y="6" width="17" height="12" rx="3.5"/>',
    hexagon: '<path d="M8 4.5h8l4 7.5-4 7.5H8l-4-7.5z"/>',
    parallelogram: '<path d="M7 6h13l-3 12H4z"/>',
    cylinder: '<ellipse cx="12" cy="6.5" rx="6.5" ry="2.5"/><path d="M5.5 6.5v11c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-11"/>',
    drum: '<rect x="5" y="4.5" width="14" height="15" rx="2.5"/><path d="M15 4.5c-1.5 2-1.5 13 0 15"/>',
    note: '<path d="M5 4.5h14v11.5l-3.5 3.5H5z"/><path d="M15.5 19.5V16H19"/>',
    cloud: '<path d="M7.5 18.5a4 4 0 01-.4-8A5.5 5.5 0 0117.8 9a4.75 4.75 0 01-.3 9.5z"/>',
    person: '<circle cx="12" cy="7.5" r="3"/><path d="M6 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
    smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.8 14.2a4.2 4.2 0 006.4 0M9.3 9.8h.01M14.7 9.8h.01"/>',
    comment: '<path d="M5 18.5V7a2.5 2.5 0 012.5-2.5h9A2.5 2.5 0 0119 7v6.5a2.5 2.5 0 01-2.5 2.5H9z"/>',
    arrow: '<path d="M5 19L19 5m0 0h-8m8 0v8"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v2.5"/>',
    send: '<path d="M12 19V5m0 0l-6 6m6-6l6 6"/>',
    grip: '<circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none"/>',
    dotsrow: '<circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/>',
    more: '<circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    textsize: '<path d="M3.5 8V6.5h9V8M8 6.5v11m-2 0h4M14 12v-1h6.5v1m-3.25-1v6.5m-1.5 0h3"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20 16l-4.5-4.5L7 19"/>',
    checklist: '<rect x="4" y="5" width="5" height="5" rx="1.2"/><path d="M5.3 16.2l1.2 1.2 2.3-2.6M12 7.5h8M12 16.5h8"/>',
    toggle: '<rect x="4" y="4.5" width="16" height="15" rx="3"/><path d="M10.5 9.5l3 2.5-3 2.5"/>',
  };
  const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const paintIcons = (root = document) => root.querySelectorAll('[data-icon]:not([data-icon-done])').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
    el.dataset.iconDone = '';
  });

  /* ===== Tooltips =====
     A short wait before the first, then instant while moving along a toolbar. */
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  let tipTimer = 0, tipWarmUntil = 0, tipFor = null;

  function showTip(el) {
    const label = el.dataset.tip;
    if (!label) return;
    tipFor = el;
    const key = el.dataset.key ? ` <kbd>${el.dataset.key}</kbd>` : '';
    tip.innerHTML = `<span>${label}</span>${key}`;
    if (!tip.isConnected) document.body.appendChild(tip);
    const warm = Date.now() < tipWarmUntil;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      /* No label over an open menu or popover: it would cover the choices. */
      if (tipFor !== el || openMenu || el.getAttribute('aria-expanded') === 'true') return;
      const r = el.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      const above = r.top - t.height - 8;
      const top = above > 4 ? above : r.bottom + 8;
      const left = Math.min(Math.max(4, r.left + r.width / 2 - t.width / 2), innerWidth - t.width - 4);
      tip.style.top = top + 'px';
      tip.style.left = left + 'px';
      tip.toggleAttribute('data-instant', warm || reduced());
      tip.dataset.on = '1';
    }, warm ? 0 : 450);
  }

  function hideTip() {
    clearTimeout(tipTimer);
    if (tip.dataset.on === '1') tipWarmUntil = Date.now() + 700;
    tip.dataset.on = '0';
    tipFor = null;
  }

  document.addEventListener('pointerover', (e) => {
    if (!hoverable()) return;
    const el = e.target.closest('[data-tip]');
    if (el && el !== tipFor) showTip(el);
    if (!el && tipFor) hideTip();
  });
  document.addEventListener('focusin', (e) => { const el = e.target.closest?.('[data-tip]'); if (el && e.target.matches(':focus-visible')) showTip(el); });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  addEventListener('scroll', hideTip, { passive: true });

  /* ===== Pop menus ===== items: [{ label, danger, run }, 'sep', ...] */
  let openMenu = null;

  function closeMenu(focusBack = true) {
    if (!openMenu) return;
    const { el, anchor } = openMenu;
    el.hidden = true;
    anchor.setAttribute('aria-expanded', 'false');
    setTimeout(() => el.remove(), 200);
    openMenu = null;
    if (focusBack) anchor.focus({ preventScroll: true });
  }

  function menu(anchor, items, { byKeyboard = false } = {}) {
    const again = openMenu && openMenu.anchor === anchor;
    closeMenu(false);
    if (again) return;
    hideTip();
    const el = document.createElement('div');
    el.className = 'pop-menu';
    el.setAttribute('role', 'menu');
    el.hidden = true;
    for (const item of items) {
      if (item === 'sep') { el.insertAdjacentHTML('beforeend', '<div class="pop-menu__sep" role="separator"></div>'); continue; }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pop-menu__item' + (item.danger ? ' pop-menu__item--danger' : '');
      b.setAttribute('role', 'menuitem');
      b.tabIndex = -1;
      b.textContent = item.label;
      b.addEventListener('click', () => { closeMenu(); item.run?.(); });
      el.appendChild(b);
    }
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    const m = el.getBoundingClientRect();
    const below = r.bottom + 6 + m.height < innerHeight;
    const alignEnd = r.left + m.width > innerWidth - 8;
    el.style.top = (below ? r.bottom + 6 : r.top - 6 - m.height) + 'px';
    el.style.left = (alignEnd ? r.right - m.width : r.left) + 'px';
    el.style.setProperty('--from', `${below ? 'top' : 'bottom'} ${alignEnd ? 'right' : 'left'}`);
    el.toggleAttribute('data-instant', byKeyboard || reduced());
    anchor.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { el.hidden = false; });
    openMenu = { el, anchor };
    const list = [...el.querySelectorAll('.pop-menu__item')];
    if (byKeyboard) list[0]?.focus();
    el.addEventListener('keydown', (e) => {
      const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      if (e.key === 'Tab') closeMenu(false);
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (openMenu && !openMenu.el.contains(e.target) && !openMenu.anchor.contains(e.target)) closeMenu(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openMenu) { e.stopPropagation(); closeMenu(); } }, true);

  /* ===== Outline rail ===== */
  function initOutline(nav) {
    const doc = document.querySelector(nav.dataset.outline);
    if (!doc) return;
    const heads = [...doc.querySelectorAll('h2, h3')].filter((h) => h.textContent.trim());
    if (heads.length < 3) { nav.hidden = true; return; }
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const used = new Set();
    heads.forEach((h) => {
      if (!h.id) { let id = slug(h.textContent) || 'section', n = 2; while (used.has(id) || document.getElementById(id)) id = `${slug(h.textContent)}-${n++}`; h.id = id; }
      used.add(h.id);
    });
    nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Outline');
    const level = (h) => (h.tagName === 'H3' ? 3 : 2);
    nav.innerHTML =
      `<button class="outline__rail" type="button" aria-expanded="false" aria-label="Show the outline">${heads.map((h) => `<span class="outline__tick" data-level="${level(h)}"></span>`).join('')}</button>` +
      `<div class="outline__panel">${heads.map((h) => `<a class="outline__link" data-level="${level(h)}" href="#${h.id}"><span>${h.textContent.trim()}</span></a>`).join('')}</div>`;
    const rail = nav.querySelector('.outline__rail');
    const ticks = [...nav.querySelectorAll('.outline__tick')];
    const links = [...nav.querySelectorAll('.outline__link')];
    let closeTimer = 0;
    const open = (instant) => { clearTimeout(closeTimer); nav.toggleAttribute('data-instant', !!instant || reduced()); nav.setAttribute('data-open', ''); rail.setAttribute('aria-expanded', 'true'); };
    const close = () => { nav.removeAttribute('data-open'); rail.setAttribute('aria-expanded', 'false'); };

    nav.addEventListener('pointerenter', () => hoverable() && open(false));
    nav.addEventListener('pointerleave', () => { closeTimer = setTimeout(close, 180); });
    rail.addEventListener('click', () => (nav.hasAttribute('data-open') ? close() : (open(true), (links.find((l) => l.getAttribute('aria-current') === 'true') || links[0]).focus())));
    nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) close(); });
    nav.addEventListener('keydown', (e) => {
      const i = links.indexOf(document.activeElement);
      if (e.key === 'Escape') { close(); rail.focus(); }
      if (i < 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(links.length - 1, i + 1)].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); links[Math.max(0, i - 1)].focus(); }
    });
    links.forEach((a, i) => a.addEventListener('click', (e) => {
      e.preventDefault();
      heads[i].scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + heads[i].id);
      close();
    }));

    let current = -1, ticking = false;
    const spy = () => {
      ticking = false;
      const line = innerHeight * 0.3;
      let idx = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) idx = i; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) idx = heads.length - 1;
      if (idx === current) return;
      current = idx;
      ticks.forEach((t, i) => t.setAttribute('aria-current', String(i === idx)));
      links.forEach((l, i) => l.setAttribute('aria-current', String(i === idx)));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

  /* ===== Dock ===== */
  function initDock(dock) {
    const emit = (name, detail) => dock.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    const tools = [...dock.querySelectorAll('.dock__bar [data-tool]')];
    const pops = [...dock.querySelectorAll('.dock__pop')];
    const prompt = dock.querySelector('.dock__prompt');
    const ask = dock.querySelector('.dock__ask');
    const input = prompt?.querySelector('input');
    let tool = tools.find((t) => t.getAttribute('aria-pressed') === 'true')?.dataset.tool;

    const closePops = (except) => pops.forEach((p) => { if (p !== except) p.hidden = true; });
    const syncExpanded = () => tools.forEach((t) => t.dataset.pop && t.setAttribute('aria-expanded', String(!dock.querySelector('#' + t.dataset.pop).hidden)));

    function pick(t, { toggle = true } = {}) {
      tool = t.dataset.tool;
      tools.forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
      const pop = t.dataset.pop && dock.querySelector('#' + t.dataset.pop);
      closePops(pop);
      if (pop) pop.hidden = toggle ? !pop.hidden : false;
      syncExpanded();
      emit('dock:change', { tool, option: null });
    }

    tools.forEach((t) => t.addEventListener('click', () => pick(t)));

    pops.forEach((pop) => {
      const opts = [...pop.querySelectorAll('[data-option]')];
      opts.forEach((o) => o.addEventListener('click', () => {
        const attr = o.classList.contains('dock__swatch') ? 'aria-checked' : 'aria-pressed';
        opts.filter((x) => x.classList.contains('dock__swatch') === o.classList.contains('dock__swatch')).forEach((x) => x.setAttribute(attr, String(x === o)));
        emit('dock:change', { tool, option: o.dataset.option });
      }));
    });

    ask?.addEventListener('click', () => {
      if (!prompt) return;
      const show = prompt.hidden;
      closePops();
      syncExpanded();
      prompt.hidden = !show;
      ask.setAttribute('aria-pressed', String(show));
      if (show) input?.focus();
    });

    input?.addEventListener('input', () => prompt.toggleAttribute('data-ready', !!input.value.trim()));
    const send = () => {
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      emit('dock:prompt', { text });
      input.value = '';
      prompt.removeAttribute('data-ready');
    };
    prompt?.querySelector('.dock__send')?.addEventListener('click', send);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });

    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, [contenteditable="true"], select')) {
        if (e.key === 'Escape' && prompt && prompt.contains(e.target)) { prompt.hidden = true; ask?.setAttribute('aria-pressed', 'false'); ask?.focus(); }
        return;
      }
      if (e.key === 'Escape') { closePops(); syncExpanded(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = tools.find((x) => (x.dataset.key || '').toLowerCase() === e.key.toLowerCase());
      if (t) { e.preventDefault(); pick(t, { toggle: false }); }
    });

    document.addEventListener('pointerdown', (e) => { if (!dock.contains(e.target)) { closePops(); syncExpanded(); } });
  }

  /* ===== Editable table ===== */
  function initTable(wrap) {
    const table = wrap.querySelector('table');
    if (!table) return;
    const emit = (kind) => wrap.dispatchEvent(new CustomEvent('etable:change', { detail: { table, kind }, bubbles: true }));
    const grip = document.createElement('button');
    grip.type = 'button'; grip.className = 'etable__grip'; grip.dataset.icon = 'grip';
    grip.dataset.tip = 'Click for row options · drag to move';
    grip.setAttribute('aria-label', 'Row options');
    const colgrip = document.createElement('button');
    colgrip.type = 'button'; colgrip.className = 'etable__colgrip'; colgrip.dataset.icon = 'dotsrow';
    colgrip.dataset.tip = 'Click for column options · drag to move';
    colgrip.setAttribute('aria-label', 'Column options');
    const more = document.createElement('button');
    more.type = 'button'; more.className = 'etable__more'; more.dataset.icon = 'more';
    more.setAttribute('aria-label', 'Table options');
    wrap.append(grip, colgrip, more);
    paintIcons(wrap);

    let row = null, col = -1, dragging = null;
    const rows = () => [...table.rows];
    const bodyRows = () => [...table.tBodies[0].rows];
    const place = () => {
      const w = wrap.getBoundingClientRect();
      const t = table.getBoundingClientRect();
      more.style.top = (t.top - w.top + 4) + 'px';
      more.style.left = (t.right - w.left + 8) + 'px';
      if (row) {
        const r = row.getBoundingClientRect();
        grip.style.top = (r.top - w.top + Math.min(r.height, 44) / 2 - 11) + 'px';
        grip.style.left = (t.left - w.left - 22) + 'px';
      }
      const head = table.rows[0]?.cells[col];
      if (head) {
        const h = head.getBoundingClientRect();
        colgrip.style.top = (h.top - w.top - 5) + 'px';
        colgrip.style.left = (h.left - w.left + h.width / 2 - 11) + 'px';
      }
    };
    const setRow = (r) => { row = r && r.parentElement === table.tBodies[0] ? r : row; grip.toggleAttribute('data-on', !!row); place(); };
    const setCol = (i) => { col = i; colgrip.toggleAttribute('data-on', i >= 0); place(); };

    wrap.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const cell = e.target.closest('td, th');
      if (cell && table.contains(cell)) { if (cell.parentElement.parentElement === table.tBodies[0]) setRow(cell.parentElement); setCol(cell.cellIndex); }
    });
    wrap.addEventListener('pointerleave', () => { if (dragging || openMenu) return; grip.removeAttribute('data-on'); colgrip.removeAttribute('data-on'); });
    table.addEventListener('focusin', (e) => { const cell = e.target.closest('td, th'); if (cell) { if (cell.parentElement.parentElement === table.tBodies[0]) setRow(cell.parentElement); setCol(cell.cellIndex); } });
    addEventListener('resize', place);

    const moveCol = (from, to) => {
      if (to < 0 || to >= table.rows[0].cells.length || from === to) return;
      rows().forEach((r) => { const c = r.cells[from]; const ref = r.cells[to > from ? to + 1 : to]; r.insertBefore(c, ref || null); });
      setCol(to); emit('move-column');
    };
    const moveRow = (r, to) => {
      const list = bodyRows();
      const from = list.indexOf(r);
      if (to < 0 || to >= list.length || from === to) return;
      table.tBodies[0].insertBefore(r, to > from ? list[to].nextSibling : list[to]);
      setRow(r); emit('move-row');
    };

    /* One handle both opens a menu (a click) and moves (a drag past 4px). */
    function handle(btn, kind) {
      btn.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const start = { x: e.clientX, y: e.clientY };
        let moved = false;
        btn.setPointerCapture(e.pointerId);
        const onMove = (ev) => {
          if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 4) return;
          if (!moved) { moved = true; dragging = kind; hideTip(); closeMenu(false); markDrag(true); }
          if (kind === 'row') {
            const target = bodyRows().findIndex((r) => { const b = r.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
            const list = bodyRows();
            const to = target < 0 ? list.length - 1 : target > list.indexOf(row) ? target - 1 : target;
            moveRow(row, to);
          } else {
            const cells = [...table.rows[0].cells];
            const target = cells.findIndex((c) => { const b = c.getBoundingClientRect(); return ev.clientX < b.left + b.width / 2; });
            const to = target < 0 ? cells.length - 1 : target > col ? target - 1 : target;
            moveCol(col, to);
          }
        };
        const onUp = () => {
          btn.removeEventListener('pointermove', onMove);
          btn.removeEventListener('pointerup', onUp);
          btn.removeEventListener('pointercancel', onUp);
          if (moved) { markDrag(false); dragging = null; } else openFor(kind, btn, false);
        };
        btn.addEventListener('pointermove', onMove);
        btn.addEventListener('pointerup', onUp);
        btn.addEventListener('pointercancel', onUp);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' && !e.altKey) { e.preventDefault(); openFor(kind, btn, true); }
        if (e.altKey && kind === 'row' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveRow(row, bodyRows().indexOf(row) + (e.key === 'ArrowUp' ? -1 : 1)); }
        if (e.altKey && kind === 'col' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); moveCol(col, col + (e.key === 'ArrowLeft' ? -1 : 1)); }
      });
    }
    function markDrag(on) {
      if (dragging === 'row' || (!on && row)) row?.classList.toggle('is-dragging', on);
      if (dragging === 'col') rows().forEach((r) => r.cells[col]?.classList.toggle('is-col-dragging', on));
      if (!on) table.querySelectorAll('.is-col-dragging').forEach((c) => c.classList.remove('is-col-dragging'));
    }
    const blankRow = () => { const r = document.createElement('tr'); for (let i = 0; i < table.rows[0].cells.length; i++) { const td = document.createElement('td'); td.contentEditable = table.dataset.editable === 'false' ? 'false' : 'true'; r.appendChild(td); } return r; };
    function openFor(kind, btn, byKeyboard) {
      if (kind === 'row') {
        const r = row;
        menu(btn, [
          { label: 'Add row above', run: () => { r.before(blankRow()); place(); emit('add-row'); } },
          { label: 'Add row below', run: () => { r.after(blankRow()); place(); emit('add-row'); } },
          'sep',
          { label: 'Delete row', danger: true, run: () => { if (bodyRows().length > 1) { r.remove(); row = null; grip.removeAttribute('data-on'); emit('delete-row'); } } },
        ], { byKeyboard });
      } else {
        const c = col;
        const addCol = (offset) => { rows().forEach((r, i) => { const cell = document.createElement(i === 0 && r.parentElement.tagName === 'THEAD' ? 'th' : 'td'); cell.contentEditable = 'true'; if (cell.tagName === 'TH') cell.textContent = 'New column'; r.insertBefore(cell, r.cells[c + offset] || null); }); place(); emit('add-column'); };
        menu(btn, [
          { label: 'Add column left', run: () => addCol(0) },
          { label: 'Add column right', run: () => addCol(1) },
          'sep',
          { label: 'Delete column', danger: true, run: () => { if (table.rows[0].cells.length > 1) { rows().forEach((r) => r.cells[c]?.remove()); setCol(-1); emit('delete-column'); } } },
        ], { byKeyboard });
      }
    }
    handle(grip, 'row');
    handle(colgrip, 'col');
    more.addEventListener('click', (e) => menu(more, [
      { label: 'Copy as text', run: () => { const text = rows().map((r) => [...r.cells].map((c) => c.textContent.trim()).join('\t')).join('\n'); navigator.clipboard?.writeText(text).catch(() => {}); emit('copy'); } },
      'sep',
      { label: 'Delete table', danger: true, run: () => { emit('delete-table'); wrap.remove(); } },
    ], { byKeyboard: e.detail === 0 }));
    place();
  }

  /* ===== Selected-text bar ===== */
  function initSelbar(area) {
    const bar = (area.dataset.selbar && document.querySelector(area.dataset.selbar)) || area.querySelector('.selbar');
    if (!bar) return;
    bar.hidden = true;
    bar.setAttribute('role', 'toolbar');
    let timer = 0;
    const place = () => {
      const sel = getSelection();
      if (!sel.rangeCount || sel.isCollapsed || !area.contains(sel.anchorNode) || !area.contains(sel.focusNode)) { bar.hidden = true; return; }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (!r.width) { bar.hidden = true; return; }
      bar.hidden = false;
      const b = bar.getBoundingClientRect();
      const top = r.top - b.height - 10 > 8 ? r.top - b.height - 10 : r.bottom + 10;
      bar.style.top = top + 'px';
      bar.style.left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), innerWidth - b.width - 8) + 'px';
    };
    document.addEventListener('selectionchange', () => { clearTimeout(timer); timer = setTimeout(place, 60); });
    addEventListener('scroll', () => { if (!bar.hidden) place(); }, { passive: true });
    bar.addEventListener('mousedown', (e) => e.preventDefault());
    bar.querySelectorAll('[data-action]').forEach((b) => b.addEventListener('click', () => {
      const sel = getSelection();
      area.dispatchEvent(new CustomEvent('selbar', { detail: { action: b.dataset.action, text: sel.toString(), range: sel.rangeCount ? sel.getRangeAt(0) : null }, bubbles: true }));
    }));
  }

  function init() {
    paintIcons();
    document.querySelectorAll('nav[data-outline]').forEach(initOutline);
    document.querySelectorAll('[data-dock]').forEach(initDock);
    document.querySelectorAll('[data-etable]').forEach(initTable);
    document.querySelectorAll('[data-selbar]').forEach(initSelbar);
  }

  window.ttmEditor = { menu, icon, paintIcons, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
