/**
 * js/toast.js
 *
 * Module: Vanilla JS Toast Override
 * Responsibility:
 *   - Redefines showToast(message, type) as a global function, overriding
 *     the Bootstrap-dependent implementation in js/utils.js.
 *   - Must be loaded AFTER js/utils.js on all pages.
 *
 * Implementation: Task 1.3
 * Requirements: 9.1, 9.3
 */

/**
 * Displays a toast notification using vanilla JS and Tailwind CSS utilities.
 *
 * Overrides the Bootstrap-dependent showToast defined in js/utils.js.
 * Creates a toast container (#toast-container) if one does not already exist,
 * then appends a new toast element styled with Tailwind colour utilities
 * matching the type parameter. The toast auto-dismisses after 5 seconds and
 * is removed from the DOM after dismissal.
 *
 * @param {string} message - The message text to display in the toast
 * @param {"success"|"danger"|"warning"|"info"} [type="info"]
 *   Contextual colour type for the toast background
 */
function showToast(message, type) {
  var toastType = type || "info";

  // Create container if it doesn't exist
  var container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    // Use Tailwind utilities for positioning; z-index set via inline style
    // because arbitrary Tailwind values (z-[1100]) require CDN processing
    container.className = "fixed top-0 end-0 p-3";
    container.style.zIndex = "1100";
    document.body.appendChild(container);
  }

  // Resolve Tailwind background colour classes by type
  var bgClass;
  switch (toastType) {
    case "success":
      bgClass = "bg-green-600 text-white";
      break;
    case "danger":
      bgClass = "bg-red-600 text-white";
      break;
    case "warning":
      bgClass = "bg-amber-500 text-white";
      break;
    case "info":
    default:
      bgClass = "bg-blue-600 text-white";
      break;
  }

  // Build the toast element
  var toastEl = document.createElement("div");
  toastEl.className =
    "flex items-center justify-between gap-4 min-w-[260px] max-w-sm " +
    "rounded-lg shadow-lg px-4 py-3 mb-2 text-sm font-medium " +
    bgClass;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  // Message span
  var msgSpan = document.createElement("span");
  msgSpan.textContent = message;

  // Close button
  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className =
    "shrink-0 inline-flex items-center justify-center w-6 h-6 rounded " +
    "opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", function () {
    dismiss(toastEl);
  });

  toastEl.appendChild(msgSpan);
  toastEl.appendChild(closeBtn);
  container.appendChild(toastEl);

  // Auto-dismiss after 5 seconds
  var timer = setTimeout(function () {
    dismiss(toastEl);
  }, 5000);

  // Cancel auto-dismiss if user manually closes before timeout
  closeBtn.addEventListener("click", function () {
    clearTimeout(timer);
  });
}

/**
 * Removes a toast element from the DOM with a brief fade-out transition.
 *
 * @param {HTMLElement} toastEl - The toast element to remove
 */
function dismiss(toastEl) {
  if (!toastEl || !toastEl.parentNode) return;
  toastEl.style.transition = "opacity 0.3s ease";
  toastEl.style.opacity = "0";
  setTimeout(function () {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
  }, 300);
}
