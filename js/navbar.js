/**
 * Vanilla JS navbar toggle — replaces Bootstrap's collapsible navbar JS.
 *
 * Usage: call initNavbar() after DOMContentLoaded on any page that has
 * a collapsible navigation bar. Safe to call on pages that don't have
 * the expected elements (e.g. admin pages without a collapsible nav).
 */

/**
 * Initialises the navbar toggle behaviour for the current page.
 *
 * - Finds `.navbar-toggler` (hamburger button) and `#mainNav` (nav menu).
 * - Toggles the `hidden` class on `#mainNav` when the button is clicked.
 * - Closes the menu when any `<a>` inside `#mainNav` is clicked.
 * - Keeps `aria-expanded` on the button in sync with the open/closed state.
 *
 * If either element is absent the function returns early without error,
 * making it safe to include on pages that have no collapsible nav.
 */
function initNavbar() {
  var toggler = document.querySelector('.navbar-toggler');
  var nav = document.getElementById('mainNav');
  var siteNavbar = document.querySelector('.site-navbar');

  // Guard: both elements must exist before attaching any listeners.
  if (!toggler || !nav) {
    return;
  }

  var mobileBreakpoint = window.matchMedia('(max-width: 639px)');
  var closeTimer = null;

  function isMobileView() {
    return window.innerWidth <= 639 && mobileBreakpoint.matches;
  }

  function syncTogglerVisibility() {
    if (isMobileView()) {
      toggler.style.display = 'flex';
      toggler.removeAttribute('aria-hidden');
      return;
    }

    toggler.style.display = 'none';
    toggler.setAttribute('aria-hidden', 'true');
  }

  /**
   * Opens or closes the nav menu and keeps aria-expanded in sync.
   * @param {boolean} open - true to open, false to close.
   */
  function setNavOpen(open) {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (!isMobileView()) {
      nav.classList.remove('hidden');
      nav.classList.remove('is-open');
      toggler.setAttribute('aria-expanded', 'false');
      return;
    }

    if (open) {
      nav.classList.remove('hidden');
      window.requestAnimationFrame(function () {
        nav.classList.add('is-open');
      });
    } else {
      nav.classList.remove('is-open');
      closeTimer = window.setTimeout(function () {
        nav.classList.add('hidden');
      }, 220);
    }
    toggler.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function syncDesktopState() {
    syncTogglerVisibility();

    if (!isMobileView()) {
      nav.classList.remove('hidden');
      nav.classList.remove('is-open');
      toggler.setAttribute('aria-expanded', 'false');
    } else if (toggler.getAttribute('aria-expanded') !== 'true') {
      nav.classList.add('hidden');
      nav.classList.remove('is-open');
    }
  }

  function handleScrollState() {
    if (!siteNavbar) {
      return;
    }
    if (window.scrollY > 14) {
      siteNavbar.classList.add('is-scrolled');
    } else {
      siteNavbar.classList.remove('is-scrolled');
    }
  }

  // Toggle the menu when the hamburger button is clicked.
  toggler.addEventListener('click', function () {
    // The menu is open when it does NOT have the `hidden` class.
    var isCurrentlyOpen = toggler.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isCurrentlyOpen);
  });

  // Close the menu when any nav link is clicked (e.g. same-page anchor).
  var navLinks = nav.querySelectorAll('a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      setNavOpen(false);
    });
  });

  document.addEventListener('click', function (event) {
    if (!isMobileView()) {
      return;
    }
    if (toggler.getAttribute('aria-expanded') !== 'true') {
      return;
    }
    if (!nav.contains(event.target) && !toggler.contains(event.target)) {
      setNavOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggler.getAttribute('aria-expanded') === 'true') {
      setNavOpen(false);
      toggler.focus();
    }
  });

  window.addEventListener('resize', syncDesktopState);
  window.addEventListener('scroll', handleScrollState, { passive: true });

  syncDesktopState();
  handleScrollState();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revealElements = document.querySelectorAll('.reveal-stagger');
    if (revealElements.length && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.18 });

      revealElements.forEach(function (item, index) {
        item.style.transitionDelay = (index * 70) + 'ms';
        observer.observe(item);
      });
    }
  }
}
