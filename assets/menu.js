/* Dropdown menus for .drop. Handles opening, keyboard, focus, placement and type-ahead.

   <div class="drop" data-drop>
     <button class="drop__trigger" type="button"><span class="drop__value">Kraken X60</span></button>
     <div class="drop__menu">
       <button class="drop__item" data-value="x60" aria-selected="true"><span class="drop__text">Kraken X60<span class="drop__desc">7,530 rpm</span></span></button>
       <div class="drop__sep"></div>
       ...
     </div>
   </div>

   A choice fires a 'change' event on .drop with detail { value, label }.
   Add class drop--actions for a menu of commands: items fire 'pick' and nothing stays selected. */
(() => {
  const menus = [];

  function setup(drop) {
    const trigger = drop.querySelector('.drop__trigger');
    const menu = drop.querySelector('.drop__menu');
    const actions = drop.classList.contains('drop--actions');
    const items = () => [...menu.querySelectorAll('.drop__item')];
    const valueEl = drop.querySelector('.drop__value');
    const id = 'drop-' + Math.random().toString(36).slice(2, 8);
    let typed = '', typedAt = 0;

    menu.id = menu.id || id;
    menu.setAttribute('role', actions ? 'menu' : 'listbox');
    trigger.setAttribute('aria-haspopup', actions ? 'menu' : 'listbox');
    trigger.setAttribute('aria-controls', menu.id);
    trigger.setAttribute('aria-expanded', 'false');
    for (const it of items()) {
      it.setAttribute('role', actions ? 'menuitem' : 'option');
      it.tabIndex = -1;
      if (!actions && !it.hasAttribute('aria-selected')) it.setAttribute('aria-selected', 'false');
    }

    const place = () => {
      menu.removeAttribute('data-side');
      menu.removeAttribute('data-align');
      const t = trigger.getBoundingClientRect();
      const h = Math.min(menu.scrollHeight, 288) + 8;
      if (innerHeight - t.bottom < h && t.top > innerHeight - t.bottom) menu.setAttribute('data-side', 'top');
      if (t.left + menu.offsetWidth > innerWidth - 8) menu.setAttribute('data-align', 'end');
    };

    const open = (byKeyboard) => {
      for (const m of menus) if (m !== api) m.close(false);
      drop.toggleAttribute('data-instant', !!byKeyboard);
      place();
      drop.setAttribute('data-open', '');
      trigger.setAttribute('aria-expanded', 'true');
      const start = items().find((i) => i.getAttribute('aria-selected') === 'true') || items()[0];
      if (byKeyboard && start) start.focus();
    };

    const close = (refocus = true) => {
      if (!drop.hasAttribute('data-open')) return;
      drop.removeAttribute('data-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (refocus) trigger.focus();
    };

    const choose = (it) => {
      if (actions) {
        drop.dispatchEvent(new CustomEvent('pick', { detail: { value: it.dataset.value, label: it.textContent.trim() } }));
      } else {
        for (const x of items()) x.setAttribute('aria-selected', String(x === it));
        const label = (it.querySelector('.drop__text')?.firstChild?.textContent || it.textContent).trim();
        if (valueEl) valueEl.textContent = label;
        drop.dispatchEvent(new CustomEvent('change', { detail: { value: it.dataset.value, label } }));
      }
      close();
    };

    const move = (dir) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      const next = dir === 'first' ? 0 : dir === 'last' ? list.length - 1 : (i + dir + list.length) % list.length;
      list[next]?.focus();
    };

    trigger.addEventListener('click', () => (drop.hasAttribute('data-open') ? close() : open(false)));
    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(true); }
    });
    menu.addEventListener('click', (e) => { const it = e.target.closest('.drop__item'); if (it) choose(it); });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Home') { e.preventDefault(); move('first'); }
      else if (e.key === 'End') { e.preventDefault(); move('last'); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') close(false);
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (document.activeElement.classList.contains('drop__item')) choose(document.activeElement); }
      else if (e.key.length === 1) {
        const now = Date.now();
        typed = now - typedAt > 600 ? e.key.toLowerCase() : typed + e.key.toLowerCase();
        typedAt = now;
        items().find((i) => i.textContent.trim().toLowerCase().startsWith(typed))?.focus();
      }
    });

    const api = { drop, close };
    menus.push(api);
  }

  document.addEventListener('pointerdown', (e) => {
    for (const m of menus) if (!m.drop.contains(e.target)) m.close(false);
  });

  const init = () => document.querySelectorAll('[data-drop]').forEach((d) => { if (!d.dataset.ready) { d.dataset.ready = '1'; setup(d); } });
  window.ttmMenus = { init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
