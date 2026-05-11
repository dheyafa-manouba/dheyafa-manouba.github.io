/**
 * js/auth-guard.js
 *
 * Module: Admin Authentication Guard
 * Responsibility:
 *   - Sets Firebase Auth persistence to SESSION (tab-scoped, cleared on tab close).
 *   - Checks Firebase Auth state on every admin page via onAuthStateChanged.
 *   - Redirects unauthenticated users to /admin/login.html.
 *   - Reveals the admin page <body> (hidden by default) only after auth check passes.
 *   - Implements a 60-minute inactivity timer that resets on mousemove, keydown,
 *     and touchstart events; on expiry calls firebase.auth().signOut() and
 *     redirects to the login page.
 *
 * Must be loaded as the SECOND script on every admin page (after firebase-init.js).
 * Must NOT be included on admin/login.html.
 *
 * Requirements: 5.1, 5.4, 5.6
 */

(function () {
  "use strict";

  /** Duration of inactivity (in milliseconds) before the session is invalidated. */
  var INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

  /** @type {number|null} Handle returned by setTimeout for the inactivity timer. */
  var inactivityTimer = null;

  /**
   * Redirects the browser to the admin login page.
   * @returns {void}
   */
  function redirectToLogin() {
    window.location.href = "/admin/login.html";
  }

  /**
   * Resets the inactivity timer.
   * Clears any existing timeout and starts a new 60-minute countdown.
   * When the countdown expires, the current Firebase Auth session is signed out
   * and the user is redirected to the login page.
   * @returns {void}
   */
  function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function () {
      firebase
        .auth()
        .signOut()
        .then(function () {
          redirectToLogin();
        });
    }, INACTIVITY_TIMEOUT_MS);
  }

  /**
   * Starts listening for user activity events on the document.
   * Each event resets the inactivity timer.
   * @returns {void}
   */
  function startActivityListeners() {
    ["mousemove", "keydown", "touchstart"].forEach(function (eventName) {
      document.addEventListener(eventName, resetTimer);
    });
  }

  /**
   * Initialises the auth guard.
   * Sets Firebase Auth persistence to SESSION, then registers an
   * onAuthStateChanged listener that either redirects unauthenticated users
   * or reveals the page body and starts the inactivity timer.
   * @returns {void}
   */
  function init() {
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function () {
        firebase.auth().onAuthStateChanged(function (user) {
          if (!user) {
            // No authenticated user — redirect to login immediately.
            redirectToLogin();
          } else {
            // Authenticated — reveal the page body and start inactivity tracking.
            document.body.style.display = "";
            startActivityListeners();
            resetTimer();
          }
        });
      })
      .catch(function (error) {
        // If persistence cannot be set, fall back to checking auth state anyway.
        console.error("auth-guard: failed to set persistence", error);
        firebase.auth().onAuthStateChanged(function (user) {
          if (!user) {
            redirectToLogin();
          } else {
            document.body.style.display = "";
            startActivityListeners();
            resetTimer();
          }
        });
      });
  }

  // Kick off the guard as soon as this script is executed.
  init();
})();
