/**
 * js/validation.js
 *
 * Module: Form Validation
 * Responsibility:
 *   - isWhitespaceOnly(str)               — returns true if string is empty or whitespace-only
 *   - isValidEmail(email)                 — returns true if email matches a valid format
 *   - isValidPhone(phone)                 — returns true if phone matches Tunisian format
 *   - validateRegistrationForm(formData)  — returns { valid: bool, errors: { field: message } }
 *       Required fields: fullName, phone, email, passportNumber, seatsRequested, voyageId
 *   - validateContactForm(formData)       — returns { valid: bool, errors: { field: message } }
 *       Required fields: senderName, phone, message (max 1000 chars)
 *   - validateVoyageForm(formData)        — returns { valid: bool, errors: { field: message } }
 *       Required fields: destination, departureDate, returnDate, price, capacity
 *
 * Implementation: Task 4
 * Requirements: 3.2, 4.2, 4.4, 6.4
 */

/**
 * Returns true if the given value is null, undefined, not a string,
 * an empty string, or a string containing only whitespace characters.
 *
 * @param {*} str - The value to check.
 * @returns {boolean} true if the value is blank/whitespace-only, false otherwise.
 */
function isWhitespaceOnly(str) {
  return typeof str !== "string" || str.trim() === "";
}

/**
 * Returns true if the given value is a syntactically valid email address.
 * Uses an RFC 5322-compatible pattern that requires a local part, an "@" symbol,
 * a domain, and a top-level domain — none of which may contain whitespace or "@".
 *
 * @param {*} email - The value to check.
 * @returns {boolean} true if the value looks like a valid email address, false otherwise.
 */
function isValidEmail(email) {
  if (isWhitespaceOnly(email)) return false;
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

/**
 * Returns true if the given value matches a Tunisian phone number format.
 *
 * Accepted formats:
 *   - 8-digit local number starting with 2, 3, 4, 5, 7, or 9
 *   - Optional country code prefix: +216 or 00216
 *   - Spaces and dashes are stripped before matching
 *
 * Examples of valid numbers:
 *   - 20123456
 *   - +216 20 123 456
 *   - 00216-20-123-456
 *
 * @param {*} phone - The value to check.
 * @returns {boolean} true if the value is a valid Tunisian phone number, false otherwise.
 */
function isValidPhone(phone) {
  if (isWhitespaceOnly(phone)) return false;
  // Strip all spaces and dashes, then validate
  var stripped = phone.replace(/[\s-]/g, "");
  var pattern = /^(\+216|00216)?[2-9]\d{7}$/;
  return pattern.test(stripped);
}

/**
 * Validates the client registration form data.
 *
 * Required fields: fullName, phone, email, passportNumber, seatsRequested, voyageId.
 * Also validates email format, phone format, and that seatsRequested is a positive integer.
 *
 * @param {Object} formData - An object containing the form field values.
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 *   valid  — true if all validations pass, false otherwise.
 *   errors — a map of field name → error message for every failing field.
 *
 * Requirements: 3.2
 */
function validateRegistrationForm(formData) {
  var errors = {};

  // fullName — required
  if (isWhitespaceOnly(formData.fullName)) {
    errors.fullName = typeof t === "function"
      ? t("err_required_full_name")
      : "Full name is required.";
  }

  // phone — required, then format
  if (isWhitespaceOnly(formData.phone)) {
    errors.phone = typeof t === "function"
      ? t("err_required_phone")
      : "Phone number is required.";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = typeof t === "function"
      ? t("err_invalid_phone")
      : "Please enter a valid phone number.";
  }

  // email — required, then format
  if (isWhitespaceOnly(formData.email)) {
    errors.email = typeof t === "function"
      ? t("err_required_email")
      : "Email address is required.";
  } else if (!isValidEmail(formData.email)) {
    errors.email = typeof t === "function"
      ? t("err_invalid_email")
      : "Please enter a valid email address.";
  }

  // passportNumber — required
  if (isWhitespaceOnly(formData.passportNumber)) {
    errors.passportNumber = typeof t === "function"
      ? t("err_required_passport")
      : "Passport number is required.";
  }

  // seatsRequested — required and must be a positive integer
  if (isWhitespaceOnly(String(formData.seatsRequested == null ? "" : formData.seatsRequested))) {
    errors.seatsRequested = typeof t === "function"
      ? t("err_required_seats")
      : "Number of seats is required.";
  } else {
    var seats = Number(formData.seatsRequested);
    if (!Number.isInteger(seats) || seats < 1) {
      errors.seatsRequested = typeof t === "function"
        ? t("err_required_seats")
        : "Number of seats must be a positive integer.";
    }
  }

  // voyageId — required
  if (isWhitespaceOnly(String(formData.voyageId == null ? "" : formData.voyageId))) {
    errors.voyageId = typeof t === "function"
      ? t("err_required_voyage")
      : "Voyage selection is required.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validates the client contact / question form data.
 *
 * Required fields: senderName, phone, message.
 * Also validates phone format and enforces a 1000-character limit on message.
 *
 * @param {Object} formData - An object containing the form field values.
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 *   valid  — true if all validations pass, false otherwise.
 *   errors — a map of field name → error message for every failing field.
 *
 * Requirements: 4.2, 4.4
 */
function validateContactForm(formData) {
  var errors = {};

  // senderName — required
  if (isWhitespaceOnly(formData.senderName)) {
    errors.senderName = typeof t === "function"
      ? t("err_required_sender_name")
      : "Sender name is required.";
  }

  // phone — required, then format
  if (isWhitespaceOnly(formData.phone)) {
    errors.phone = typeof t === "function"
      ? t("err_required_phone")
      : "Phone number is required.";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = typeof t === "function"
      ? t("err_invalid_phone")
      : "Please enter a valid phone number.";
  }

  // message — required, then length limit
  if (isWhitespaceOnly(formData.message)) {
    errors.message = typeof t === "function"
      ? t("err_required_message")
      : "Message is required.";
  } else if (typeof formData.message === "string" && formData.message.length > 1000) {
    errors.message = typeof t === "function"
      ? t("err_message_too_long")
      : "Message must not exceed 1000 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validates the admin voyage form data.
 *
 * Required fields: destination, departureDate, returnDate, price, capacity.
 * Also validates that price is a positive number and capacity is a positive integer.
 *
 * @param {Object} formData - An object containing the form field values.
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 *   valid  — true if all validations pass, false otherwise.
 *   errors — a map of field name → error message for every failing field.
 *
 * Requirements: 6.4
 */
function validateVoyageForm(formData) {
  var errors = {};

  // destination — required
  if (isWhitespaceOnly(formData.destination)) {
    errors.destination = typeof t === "function"
      ? t("err_required_destination")
      : "Destination is required.";
  }

  // departureDate — required
  if (isWhitespaceOnly(formData.departureDate)) {
    errors.departureDate = typeof t === "function"
      ? t("err_required_departure_date")
      : "Departure date is required.";
  }

  // returnDate — required
  if (isWhitespaceOnly(formData.returnDate)) {
    errors.returnDate = typeof t === "function"
      ? t("err_required_return_date")
      : "Return date is required.";
  }

  // price — required and must be a positive number
  if (isWhitespaceOnly(String(formData.price == null ? "" : formData.price))) {
    errors.price = typeof t === "function"
      ? t("err_required_price")
      : "Price is required.";
  } else {
    var price = Number(formData.price);
    if (isNaN(price) || price <= 0) {
      errors.price = typeof t === "function"
        ? t("err_required_price")
        : "Price must be a positive number.";
    }
  }

  // capacity — required and must be a positive integer
  if (isWhitespaceOnly(String(formData.capacity == null ? "" : formData.capacity))) {
    errors.capacity = typeof t === "function"
      ? t("err_required_capacity")
      : "Capacity is required.";
  } else {
    var capacity = Number(formData.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      errors.capacity = typeof t === "function"
        ? t("err_required_capacity")
        : "Capacity must be a positive integer.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}
