/**
 * js/utils.js
 *
 * Module: Shared Utility Functions
 * Responsibility:
 *   - formatDate(isoString, lang)          — formats ISO date to locale-appropriate string
 *   - calculateAvailableSeats(voyage, registrations)
 *                                          — pure function: capacity − Σ confirmed seats
 *   - showToast(message, type)             — displays a Bootstrap toast notification
 *   - exportToCSV(rows, filename)          — generates UTF-8 BOM CSV and triggers download
 *   - generateId()                         — returns a Firebase push-style unique ID (client-side)
 *
 * Implementation: Task 5
 * Requirements: 7.2, 7.3, 7.5
 */

/**
 * Formats an ISO 8601 date string to a locale-appropriate display string.
 *
 * @param {string} isoString - ISO 8601 date string, e.g. "2024-03-15"
 * @param {string} [lang]    - Language code ("ar" or "fr"). Defaults to
 *                             localStorage.getItem("lang") || "ar"
 * @returns {string} Formatted date string, or empty string if isoString is falsy
 *
 * @example
 * formatDate("2024-03-15", "ar") // "١٥ مارس ٢٠٢٤"
 * formatDate("2024-03-15", "fr") // "15 mars 2024"
 */
function formatDate(isoString, lang) {
  if (!isoString) return "";

  const resolvedLang = lang || localStorage.getItem("lang") || "ar";
  const date = new Date(isoString);
  const options = { year: "numeric", month: "long", day: "numeric" };

  if (resolvedLang === "fr") {
    return date.toLocaleDateString("fr-FR", options);
  }

  // Default to Arabic (ar-TN)
  return date.toLocaleDateString("ar-TN", options);
}

/**
 * Displays a Bootstrap 5 toast notification.
 *
 * Creates a toast container (id="toast-container") if one does not already
 * exist, then appends a new toast element and shows it. The toast
 * auto-dismisses after 5 seconds.
 *
 * @param {string} message          - The message text to display in the toast
 * @param {"success"|"danger"|"warning"|"info"} [type="info"]
 *                                  - Bootstrap contextual colour for the toast header
 */
function showToast(message, type) {
  const toastType = type || "info";

  // Create container if it doesn't exist
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "position-fixed top-0 end-0 p-3";
    container.style.zIndex = "1100";
    document.body.appendChild(container);
  }

  // Build the toast element
  const toastId = "toast-" + generateId();
  const toastEl = document.createElement("div");
  toastEl.id = toastId;
  toastEl.className = "toast align-items-center text-bg-" + toastType + " border-0";
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML =
    '<div class="d-flex">' +
      '<div class="toast-body">' + message + '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto"' +
        ' data-bs-dismiss="toast" aria-label="Close"></button>' +
    '</div>';

  container.appendChild(toastEl);

  // Show via Bootstrap Toast API and remove from DOM after hiding
  const bsToast = new bootstrap.Toast(toastEl, { delay: 5000 });
  toastEl.addEventListener("hidden.bs.toast", function () {
    toastEl.remove();
  });
  bsToast.show();
}

/**
 * Generates a unique string ID suitable for use as a client-side push key.
 *
 * Uses a timestamp (base-36) combined with a random suffix to produce a
 * string of approximately 15 characters that is unique within a single
 * browser session.
 *
 * @returns {string} A unique identifier string (~15 characters)
 *
 * @example
 * generateId() // "lrz8k4f2a9b3c1d"
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculates the number of available seats for a voyage.
 *
 * Pure function: returns `voyage.capacity − Σ(seatsRequested for all
 * confirmed registrations of this voyage)`.
 *
 * @param {{ id: string, capacity: number }} voyage
 *   The voyage object. Must have `id` and `capacity` properties.
 * @param {Array<{ voyageId: string, status: string, seatsRequested: number }>} registrations
 *   Array of registration objects to evaluate.
 * @returns {number} Number of available seats, or 0 if voyage/registrations
 *   is null/undefined.
 *
 * @example
 * const voyage = { id: "v1", capacity: 30 };
 * const regs = [
 *   { voyageId: "v1", status: "confirmed", seatsRequested: 5 },
 *   { voyageId: "v1", status: "pending",   seatsRequested: 3 },
 *   { voyageId: "v2", status: "confirmed", seatsRequested: 2 },
 * ];
 * calculateAvailableSeats(voyage, regs); // 25
 */
function calculateAvailableSeats(voyage, registrations) {
  if (!voyage || !registrations) return 0;

  const confirmedSeats = registrations
    .filter(function (reg) {
      return reg.voyageId === voyage.id && reg.status === "confirmed";
    })
    .reduce(function (sum, reg) {
      return sum + (reg.seatsRequested || 0);
    }, 0);

  return voyage.capacity - confirmedSeats;
}

/**
 * Exports an array of registration objects to a UTF-8 BOM CSV file and
 * triggers a browser download.
 *
 * The generated CSV always includes a header row with the following columns
 * (in order): fullName, email, phone, passportNumber, seatsRequested,
 * status, createdAt.
 *
 * Values that contain commas or double-quote characters are wrapped in
 * double quotes; any internal double-quote characters are escaped by
 * doubling them (standard RFC 4180 CSV escaping).
 *
 * The file is encoded with a UTF-8 BOM (\uFEFF) so that Microsoft Excel
 * opens it correctly without character-encoding issues.
 *
 * @param {Array<{
 *   fullName: string,
 *   email: string,
 *   phone: string,
 *   passportNumber: string,
 *   seatsRequested: number,
 *   status: string,
 *   createdAt: number
 * }>|null} rows - Array of registration objects to export. If null or empty,
 *   only the header row is written.
 * @param {string} filename - Desired download filename, e.g.
 *   "registrations-voyage-name.csv"
 *
 * @example
 * exportToCSV(registrations, "registrations-paris-2024.csv");
 *
 * Requirements: 7.5
 */
function exportToCSV(rows, filename) {
  var HEADERS = [
    "fullName",
    "email",
    "phone",
    "passportNumber",
    "seatsRequested",
    "status",
    "createdAt"
  ];

  /**
   * Escapes a single cell value for CSV output.
   * Wraps the value in double quotes if it contains a comma, double quote,
   * or newline; doubles any internal double-quote characters.
   *
   * @param {*} value - The raw cell value
   * @returns {string} The escaped CSV cell string
   */
  function escapeCell(value) {
    var str = (value === null || value === undefined) ? "" : String(value);
    if (str.indexOf(",") !== -1 || str.indexOf('"') !== -1 || str.indexOf("\n") !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // Build header row
  var lines = [HEADERS.map(escapeCell).join(",")];

  // Build data rows
  var safeRows = rows || [];
  for (var i = 0; i < safeRows.length; i++) {
    var row = safeRows[i];
    var createdAtFormatted = row.createdAt
      ? new Date(row.createdAt).toLocaleString()
      : "";
    var cells = [
      escapeCell(row.fullName),
      escapeCell(row.email),
      escapeCell(row.phone),
      escapeCell(row.passportNumber),
      escapeCell(row.seatsRequested),
      escapeCell(row.status),
      escapeCell(createdAtFormatted)
    ];
    lines.push(cells.join(","));
  }

  // Prepend UTF-8 BOM for Excel compatibility
  var csvContent = "\uFEFF" + lines.join("\r\n");

  // Create blob and trigger download
  var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL to free memory
  URL.revokeObjectURL(url);
}
