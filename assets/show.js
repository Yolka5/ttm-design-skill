/* Show page nav: turns solid once the opening has passed, and runs the phone
   menu sheet. No dependencies. Pair with show.css.

   Markup: header.s-nav[data-s-nav] with a button[data-s-menu] and a
   div.s-nav__sheet[data-s-sheet] holding the links and a button[data-s-close].
   The opening screen gets [data-s-opening]. */
(function () {
  function init() {
    const nav = document.querySelector('[data-s-nav]');
    if (!nav) return;

    /* Solid once the opening has scrolled mostly out of view. */
    const opening = document.querySelector('[data-s-opening]');
    if (opening && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        nav.dataset.solid = e.intersectionRatio < 0.12 ? '1' : '0';
      }, { threshold: [0, 0.12, 0.5] });
      io.observe(opening);
    } else {
      nav.dataset.solid = '1';
    }

    const menu = nav.querySelector('[data-s-menu]');
    const sheet = document.querySelector('[data-s-sheet]');
    if (!menu || !sheet) return;
    const close = sheet.querySelector('[data-s-close]');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-expanded', 'false');

    const setOpen = (open) => {
      sheet.dataset.open = open ? '1' : '0';
      menu.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) (sheet.querySelector('a, button') || sheet).focus();
      else menu.focus();
    };

    menu.addEventListener('click', () => setOpen(true));
    if (close) close.addEventListener('click', () => setOpen(false));
    sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sheet.dataset.open === '1') setOpen(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
