/**
 * VanillaModal — bootstrap.Modal API-compatible vanilla JS modal controller.
 *
 * Replaces bootstrap.Modal for the Dheyafa Tourism Website migration.
 * Exposes show() and hide() methods and fires the hidden.bs.modal event on close,
 * so existing code calling modal.show() / modal.hide() and listening for
 * "hidden.bs.modal" continues to work without modification.
 *
 * @param {HTMLElement} element - The modal root element (the backdrop + dialog wrapper)
 * @returns {{ show: Function, hide: Function }}
 */
function VanillaModal(element) {
  /** The element that had focus before the modal opened — restored on hide(). */
  var previouslyFocused = null;

  /** Selector for all focusable elements inside the modal. */
  var FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /**
   * Returns the list of currently focusable elements inside the modal.
   * @returns {HTMLElement[]}
   */
  function getFocusableElements() {
    return Array.prototype.slice.call(element.querySelectorAll(FOCUSABLE_SELECTOR));
  }

  /**
   * Handles keydown events while the modal is open:
   * - Escape → hide()
   * - Tab / Shift+Tab → cycle focus within the modal
   * @param {KeyboardEvent} event
   */
  function onKeyDown(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      event.preventDefault();
      hide();
      return;
    }

    if (event.key === 'Tab' || event.keyCode === 9) {
      var focusable = getFocusableElements();

      if (focusable.length === 0) {
        // No focusable elements — keep focus on the modal root itself.
        event.preventDefault();
        element.focus();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if focus is on the first element, wrap to the last.
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on the last element, wrap to the first.
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  /**
   * Handles click events on the modal root element.
   * Clicks directly on the backdrop (not on the inner dialog) close the modal.
   * @param {MouseEvent} event
   */
  function onBackdropClick(event) {
    if (event.target === element) {
      hide();
    }
  }

  /**
   * Opens the modal:
   * - Removes the `hidden` class so the element becomes visible
   * - Sets aria-hidden="false"
   * - Prevents body scroll
   * - Traps focus within the modal
   * - Saves the currently focused element so it can be restored on hide()
   */
  function show() {
    previouslyFocused = document.activeElement;

    element.classList.remove('hidden');
    element.setAttribute('aria-hidden', 'false');

    // Prevent background scroll.
    document.body.style.overflow = 'hidden';

    // Attach event listeners.
    document.addEventListener('keydown', onKeyDown);
    element.addEventListener('click', onBackdropClick);

    // Move focus into the modal: prefer the first focusable element,
    // fall back to the modal root (which must be focusable via tabindex="-1").
    var focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      // Ensure the root can receive programmatic focus.
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus();
    }
  }

  /**
   * Closes the modal:
   * - Adds the `hidden` class so the element is no longer visible
   * - Sets aria-hidden="true"
   * - Restores body scroll
   * - Removes event listeners
   * - Restores focus to the element that was focused before show() was called
   * - Dispatches the hidden.bs.modal CustomEvent on the modal element so that
   *   existing addEventListener("hidden.bs.modal", ...) listeners continue to work
   */
  function hide() {
    element.classList.add('hidden');
    element.setAttribute('aria-hidden', 'true');

    // Restore background scroll.
    document.body.style.overflow = '';

    // Remove event listeners.
    document.removeEventListener('keydown', onKeyDown);
    element.removeEventListener('click', onBackdropClick);

    // Restore focus to the previously focused element.
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
    previouslyFocused = null;

    // Fire the Bootstrap-compatible event so existing listeners keep working.
    element.dispatchEvent(new CustomEvent('hidden.bs.modal', { bubbles: true }));
  }

  return { show: show, hide: hide };
}
