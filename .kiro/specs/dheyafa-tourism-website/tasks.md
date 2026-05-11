# Implementation Plan: Dheyafa Tourism Website

## Overview

Implement a fully static, bilingual (Arabic/French) tourism website hosted on GitHub Pages, backed by Firebase Realtime Database and Firebase Authentication. The implementation proceeds in layers: shared foundation first, then public pages, then admin pages, then property-based tests. All code uses plain HTML, Bootstrap 5.3, jQuery 3.7, and Firebase JS SDK v9 compat mode — all via CDN, no build step.

---

## Tasks

- [x] 1. Set up project structure and shared foundation
  - Create all directories: `css/`, `js/`, `admin/`
  - Create placeholder files for every page listed in the file inventory
  - Create `css/custom.css` with base styles: minimum 18px body font, 24px headings, 44×44px touch targets, high-contrast colour palette (≥ 4.5:1 ratio), RTL/LTR layout utilities
  - _Requirements: 1.4, 10.1, 10.2, 11.1_

- [x] 2. Implement `js/firebase-init.js`
  - Initialise Firebase app with the project config (apiKey, authDomain, databaseURL pointing to `https://dheyafa-e858b-default-rtdb.europe-west1.firebasedatabase.app/`, projectId, storageBucket, messagingSenderId, appId)
  - Expose `db` (firebase.database()) and `auth` (firebase.auth()) as global variables
  - Use Firebase JS SDK v9 compat mode loaded via CDN
  - _Requirements: 11.2_

- [ ] 3. Implement `js/i18n.js` — bilingual translation module
  - [x] 3.1 Define the `translations` object with `ar` and `fr` keys covering all UI strings: navigation labels, button labels, form field labels and placeholders, error messages, confirmation messages, status labels, and admin panel labels
  - Ensure every key present in `ar` is also present in `fr` and vice versa
  - _Requirements: 10.6, 10.7_

  - [x] 3.2 Implement `t(key)` helper and `setLanguage(lang)` function
    - `t(key)` reads `localStorage.getItem("lang")` (defaulting to `"ar"`) and returns the translation string
    - `setLanguage(lang)` persists to localStorage, sets `document.documentElement.lang` and `dir` (rtl for ar, ltr for fr), and updates all `[data-i18n]` text content and `[data-i18n-placeholder]` placeholder attributes
    - On every page load, call `setLanguage(localStorage.getItem("lang") || "ar")` immediately
    - _Requirements: 10.6, 10.7_

  - [ ]* 3.3 Write property test for i18n — Property 18: Language toggle updates all translated elements
    - **Property 18: Language toggle updates all translated elements**
    - For any translation key present in both `ar` and `fr`, after `setLanguage("fr")`, `t(key)` returns the French string; after `setLanguage("ar")`, `t(key)` returns the Arabic string; the two values are different
    - **Validates: Requirements 10.6**

- [ ] 4. Implement `js/validation.js` — form validation module
  - [x] 4.1 Implement `isWhitespaceOnly(str)`, `isValidEmail(email)`, `isValidPhone(phone)` (Tunisian format) helper functions
    - _Requirements: 3.2, 4.2_

  - [x] 4.2 Implement `validateRegistrationForm(formData)` — returns `{valid, errors}`
    - Required fields: fullName, phone, email, passportNumber, seatsRequested, voyageId
    - Each missing or whitespace-only required field produces an error entry
    - _Requirements: 3.2_

  - [x] 4.3 Implement `validateContactForm(formData)` — returns `{valid, errors}`
    - Required fields: senderName, phone, message
    - Enforce 1000-character limit on message field
    - _Requirements: 4.2, 4.4_

  - [x] 4.4 Implement `validateVoyageForm(formData)` — returns `{valid, errors}`
    - Required fields: destination, departureDate, returnDate, price, capacity
    - _Requirements: 6.4_

  - [ ]* 4.5 Write property test for validation — Property 6: Form validation rejects submissions with missing required fields
    - **Property 6: Form validation rejects submissions with missing required fields**
    - For any form data where at least one required field is absent or whitespace-only, the validation function returns `valid: false` with an error entry for each missing field
    - **Validates: Requirements 3.2, 4.2, 6.4**

  - [ ]* 4.6 Write property test for validation — Property 9: Message length validation enforces 1000-character limit
    - **Property 9: Message length validation enforces 1000-character limit**
    - For any string with `length > 1000`, `validateContactForm` returns `valid: false` with an error on `message`; for any string with `length <= 1000`, no length error is returned for `message`
    - **Validates: Requirements 4.4**

- [ ] 5. Implement `js/utils.js` — shared utility functions
  - [x] 5.1 Implement `formatDate(isoString, lang)`, `showToast(message, type)`, `generateId()`, and `calculateAvailableSeats(voyage, registrations)` (pure function: `capacity − Σ confirmed seats`)
    - _Requirements: 7.2, 7.3_

  - [ ]* 5.2 Write property test for utils — Property 13: Confirming then cancelling a registration restores available seats
    - **Property 13: Confirming then cancelling a registration restores available seats**
    - For any voyage with `availableSeats >= seatsRequested`, after confirming (decrement) then cancelling (increment), `availableSeats` equals its original value
    - **Validates: Requirements 7.2, 7.3**

  - [x] 5.3 Implement `exportToCSV(rows, filename)` — generates UTF-8 BOM CSV and triggers browser download
    - Output must start with `\uFEFF` (UTF-8 BOM) for Excel compatibility
    - Include all registration fields: fullName, email, phone, passportNumber, seatsRequested, status, createdAt
    - _Requirements: 7.5_

  - [ ]* 5.4 Write property test for utils — Property 14: CSV export contains all registration fields and UTF-8 BOM
    - **Property 14: CSV export contains all registration fields and UTF-8 BOM**
    - For any non-empty array of registration objects, the string produced by `exportToCSV` starts with `\uFEFF` and contains each registration's fullName, email, phone, passportNumber, seatsRequested, status, and createdAt values
    - **Validates: Requirements 7.5**

- [x] 6. Implement `js/auth-guard.js` — admin authentication guard
  - Include `firebase.auth().onAuthStateChanged` listener; redirect to `/admin/login.html` if user is null
  - Set Firebase Auth persistence to `SESSION`
  - Implement 60-minute inactivity timer that resets on `mousemove`, `keydown`, `touchstart`; on expiry call `firebase.auth().signOut()` and redirect to login
  - All admin page `<body>` elements default to `display:none` and are revealed only after auth check passes
  - _Requirements: 5.1, 5.4, 5.6_

- [x] 7. Checkpoint — Ensure all shared JS modules are complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement shared HTML header/navigation partial and `404.html`
  - [x] 8.1 Create the reusable `<header>` block (duplicated across pages) containing: agency logo + name "Dheyafa Tourism – Branch Manouba Oued Ellil", navigation links (Home, Voyages, Omra, Contact) with `data-i18n` attributes, and language toggle button (AR/FR) that calls `setLanguage(lang)`
    - Minimum font sizes enforced via `custom.css`
    - _Requirements: 1.1, 1.5, 10.6_

  - [x] 8.2 Create `404.html` with a `<meta http-equiv="refresh" content="0;url=index.html">` redirect and a manual fallback link
    - _Requirements: 11.4_

- [ ] 9. Implement `index.html` — public homepage
  - [x] 9.1 Build the homepage with hero banner, agency info section, and Achievements section
    - On page load, read `/achievements` from Firebase RTDB and render each achievement card (title, description, date, optional image)
    - Apply `data-i18n` attributes to all static text; call `setLanguage` on load
    - Show a Bootstrap alert error message if RTDB is unreachable
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.5_

  - [ ]* 9.2 Write property test for achievement rendering — Property 17: Achievement record construction preserves all provided fields
    - **Property 17: Achievement record construction preserves all provided fields**
    - For any valid achievement form data (title, description, date, optional imageUrl), the constructed achievement record contains all provided fields with matching values
    - **Validates: Requirements 1.2, 9.1**

- [ ] 10. Implement `voyages.html` and `omra.html` — public voyage listing pages
  - [x] 10.1 Build `voyages.html`: on load, read `/voyages` from RTDB filtered by `type === "voyage"` and `status === "active"`, sort by `departureDate` ascending, and render voyage cards
    - Each card shows: destination, departure date, return date, price, available seats (or "Fully Booked" badge if `availableSeats <= 0`)
    - "View Details" button links to `voyage-detail.html?id={voyageId}`
    - Show RTDB error message if unreachable
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

  - [x] 10.2 Build `omra.html`: same pattern as `voyages.html` but filtered by `type === "omra"`
    - Each card shows: package name, departure date, duration in days, price, available seats
    - _Requirements: 2.2, 2.4, 2.5, 2.6_

  - [ ]* 10.3 Write property test for voyage card rendering — Property 1: Voyage card rendering contains all required fields
    - **Property 1: Voyage card rendering contains all required fields**
    - For any active voyage object, the HTML rendered by the card function contains destination (or package name), departure date, price, and available seats count
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 10.4 Write property test for voyage sorting — Property 4: Voyage list sorted by departure date
    - **Property 4: Voyage list sorted by departure date**
    - For any array of voyage objects with varying departure dates, after applying the default sort, each voyage's `departureDate` is ≤ the next voyage's `departureDate`
    - **Validates: Requirements 2.6**

  - [ ]* 10.5 Write property test for fully booked indicator — Property 3: Fully booked indicator when available seats reach zero
    - **Property 3: Fully booked indicator when available seats reach zero**
    - For any voyage where `availableSeats <= 0`, the rendered card displays a "fully booked" indicator and the register button is absent or disabled
    - **Validates: Requirements 2.4**

- [ ] 11. Implement `voyage-detail.html` — voyage detail view and registration form
  - [x] 11.1 On page load, parse `?id=` from the URL, read `/voyages/{id}` from RTDB, and render the full detail view: description, itinerary, included services, and a Register button (disabled with "Fully Booked" label if `availableSeats <= 0`)
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 11.2 Write property test for voyage detail rendering — Property 2: Voyage detail view contains all required fields
    - **Property 2: Voyage detail view contains all required fields**
    - For any voyage object, the HTML rendered by the detail view function contains description, itinerary, included services, and a register button element
    - **Validates: Requirements 2.3**

  - [x] 11.3 Implement the registration form with fields: Full Name, Phone, Email, Passport Number, Seats Requested
    - All fields have visible labels and `data-i18n-placeholder` attributes
    - On submit: run `validateRegistrationForm`, display inline `.invalid-feedback` errors for each invalid field
    - If validation passes, read current `availableSeats` from RTDB; if `seatsRequested > availableSeats`, show seat availability error
    - If seats are available, push registration record to `/registrations/{pushId}` with `status: "pending"` and all required fields, then show confirmation toast with voyage name and submitted details
    - Complete write and show confirmation within 5 seconds
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 11.4 Write property test for registration record construction — Property 5: Registration record construction preserves all form fields with pending status
    - **Property 5: Registration record construction preserves all form fields with pending status**
    - For any valid registration form data (fullName, email, phone, passportNumber, seatsRequested, voyageId, voyageName), the constructed record contains all fields with matching values and `status === "pending"`
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 11.5 Write property test for seat availability guard — Property 7: Seat availability guard rejects over-capacity requests
    - **Property 7: Seat availability guard rejects over-capacity requests**
    - For any voyage with a given `availableSeats` and any registration where `seatsRequested > availableSeats`, the seat availability check returns an error and the registration is not created
    - **Validates: Requirements 3.3, 7.4**

- [ ] 12. Implement `contact.html` — question submission form
  - [x] 12.1 Build the contact form with fields: Sender Name, Phone, Message (textarea with live character counter capped at 1000 chars), and an optional Voyage selector populated from RTDB
    - All fields have visible labels and `data-i18n` attributes
    - On submit: run `validateContactForm`, display inline errors for missing fields or message over 1000 chars
    - If valid, push question record to `/questions/{pushId}` with `isRead: false` and all provided fields, then show confirmation message
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 12.2 Write property test for question record construction — Property 8: Question record construction preserves all form fields
    - **Property 8: Question record construction preserves all form fields**
    - For any valid contact form data (senderName, phone, message, optional voyageId/voyageName), the constructed question record contains all provided fields with matching values and `isRead === false`
    - **Validates: Requirements 4.1**

- [x] 13. Checkpoint — Ensure all public pages render correctly and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement `admin/login.html` — admin authentication page
  - Build the login form with Email and Password fields, a Sign In button, and an error message area
  - On submit: call `firebase.auth().setPersistence(SESSION)` then `firebase.auth().signInWithEmailAndPassword(email, password)`
  - On success: redirect to `admin/index.html`
  - On failure: map Firebase error codes (`auth/wrong-password`, `auth/user-not-found`, `auth/too-many-requests`) to bilingual user-friendly messages and display them
  - Do NOT include `auth-guard.js` on this page
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 15. Implement `admin/index.html` — admin dashboard
  - Include `firebase-init.js` and `auth-guard.js` as first scripts; hide `<body>` by default
  - On load: read `/questions` from RTDB, count records where `isRead === false`, and display the count as a numeric badge
  - Display summary stats: total active voyages, total pending registrations
  - Provide navigation links to all admin sub-pages
  - _Requirements: 5.1, 5.6, 8.3_

- [ ] 16. Implement `admin/voyages.html` — voyage CRUD management
  - [x] 16.1 On load, read all voyages from `/voyages` (active and archived) and render a table showing: destination, type, departure date, status, registration count, available seats, and Edit/Archive action buttons
    - _Requirements: 6.5_

  - [x] 16.2 Implement the Create/Edit modal form with fields: Destination, Type (voyage|omra), Departure Date, Return Date, Duration Days, Price, Capacity, Description, Itinerary, Included Services
    - On save: run `validateVoyageForm`; display inline errors for missing required fields
    - For new voyages: push to `/voyages/{pushId}` with `status: "active"` and all required fields
    - For edits: update the existing `/voyages/{id}` record
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 16.3 Write property test for voyage record construction — Property 10: Voyage record construction sets required fields and active status
    - **Property 10: Voyage record construction sets required fields and active status**
    - For any valid voyage form data (destination, departureDate, returnDate, price, capacity, description, itinerary, includedServices, type), the constructed record contains all fields with matching values and `status === "active"`
    - **Validates: Requirements 6.1**

  - [x] 16.4 Implement the Archive action: set `/voyages/{id}/status` to `"archived"` in RTDB; the voyage disappears from the public listing on next page load without deleting linked registrations
    - _Requirements: 6.3_

  - [ ]* 16.5 Write property test for voyage archiving — Property 11: Archiving a voyage removes it from the active listing
    - **Property 11: Archiving a voyage removes it from the active listing**
    - For any voyage, after the archive operation sets `status` to `"archived"`, filtering the voyage collection by `status === "active"` does not include that voyage
    - **Validates: Requirements 6.3**

- [ ] 17. Implement `admin/registrations.html` — registration management
  - [x] 17.1 On load, read all voyages from RTDB and populate a voyage filter dropdown; read all registrations and render a filterable table with columns: Name, Phone, Email, Passport, Seats, Status, Created At, and action buttons (Confirm / Cancel)
    - _Requirements: 7.1_

  - [ ]* 17.2 Write property test for registration filtering — Property 12: Registration filter returns only registrations for the selected voyage
    - **Property 12: Registration filter returns only registrations for the selected voyage**
    - For any array of registrations and any `voyageId`, filtering by that `voyageId` returns only registrations where `registration.voyageId === voyageId`
    - **Validates: Requirements 7.1**

  - [x] 17.3 Implement the Confirm action: read current `availableSeats` for the voyage; if `availableSeats >= seatsRequested`, update `registration.status` to `"confirmed"` and decrement `availableSeats` in RTDB; otherwise show an error toast
    - Use a Firebase transaction to atomically update `availableSeats` and prevent double-confirmation
    - _Requirements: 7.2, 7.4_

  - [x] 17.4 Implement the Cancel action: update `registration.status` to `"cancelled"` and increment `availableSeats` by `seatsRequested` in RTDB
    - _Requirements: 7.3_

  - [ ]* 17.5 Write property test for CSV export — Property 14 (already covered in task 5.4; reference here for traceability)
    - Ensure `exportToCSV` is wired to the Export button on this page
    - **Validates: Requirements 7.5**

  - [x] 17.6 Implement CSV export button — calls `exportToCSV(registrations, filename)` from `utils.js` to download the registration list for the selected voyage as a UTF-8 BOM CSV file
    - _Requirements: 7.5_

- [ ] 18. Implement `admin/questions.html` — question management
  - [x] 18.1 On load, read all questions from `/questions` in RTDB and group them by `voyageId` (questions with null/undefined `voyageId` go into a "General" group); render each group as a collapsible section
    - _Requirements: 8.1, 8.2_

  - [ ]* 18.2 Write property test for question grouping — Property 15: Question grouping places each question in the correct group
    - **Property 15: Question grouping places each question in the correct group**
    - For any array of question objects, `groupByVoyage` places each question with a non-null `voyageId` into the group keyed by that `voyageId`, and each question with null/undefined `voyageId` into the `"general"` group; no question appears in more than one group
    - **Validates: Requirements 8.1**

  - [x] 18.3 Implement the mark-as-read behaviour: when an Admin opens a question for the first time (`isRead === false`), set `/questions/{id}/isRead` to `true` in RTDB and update the unread count badge on the dashboard
    - _Requirements: 8.4_

  - [ ]* 18.4 Write property test for unread count — Property 16: Marking a question as read decrements the unread count by exactly one
    - **Property 16: Marking a question as read decrements the unread count by exactly one**
    - For any collection of questions containing at least one unread question, after marking one unread question as read, the count of questions where `isRead === false` decreases by exactly 1
    - **Validates: Requirements 8.3, 8.4**

- [ ] 19. Implement `admin/achievements.html` — achievement CRUD management
  - [x] 19.1 On load, read all achievements from `/achievements` in RTDB and render a management table with Edit and Delete action buttons
    - _Requirements: 9.2, 9.3_

  - [x] 19.2 Implement the Create/Edit modal form with fields: Title, Description, Date, Image URL (optional)
    - On save: push new achievement to `/achievements/{pushId}` or overwrite existing record; changes reflect on the public homepage on next reload
    - _Requirements: 9.1, 9.2_

  - [x] 19.3 Implement the Delete action: remove the achievement record from `/achievements/{id}` in RTDB
    - _Requirements: 9.3_

- [x] 20. Checkpoint — Ensure all admin pages are functional and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Wire everything together and apply final polish
  - [x] 21.1 Verify all pages include `firebase-init.js` as the first script, followed by `i18n.js`, then page-specific scripts; admin pages additionally include `auth-guard.js` immediately after `firebase-init.js`
    - _Requirements: 5.6, 11.2_

  - [x] 21.2 Verify all static text elements across all pages carry `data-i18n` or `data-i18n-placeholder` attributes and that `setLanguage` is called on every page load
    - _Requirements: 10.6, 10.7_

  - [x] 21.3 Verify responsive layout on all public pages: test at 320px viewport width; ensure Bootstrap grid breakpoints and `custom.css` produce a usable layout
    - _Requirements: 1.6_

  - [x] 21.4 Verify all interactive elements (buttons, links, form fields) meet the 44×44px minimum touch target size defined in `custom.css`
    - _Requirements: 10.2_

  - [x] 21.5 Verify all error and confirmation messages are rendered adjacent to the relevant form using Bootstrap `.invalid-feedback` or `.alert` components at ≥ 16px font size, and that no auto-playing media or timed-disappearing content exists
    - _Requirements: 10.4, 10.5_

  - [x] 21.6 Verify all asset and navigation link paths resolve correctly when served from a GitHub Pages subdirectory URL
    - _Requirements: 11.3_

- [x] 22. Final checkpoint — Ensure all tests pass and the site is ready
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations each; tag format: `// Feature: dheyafa-tourism-website, Property N: <property_text>`
- All 18 correctness properties from the design document are covered by property test sub-tasks
- The CSV export task (17.6) is marked optional per project requirements
- Each task references specific requirements for full traceability
- Checkpoints at tasks 7, 13, 20, and 22 ensure incremental validation throughout the build
- The `auth-guard.js` body-hidden pattern (tasks 6 and 21.1) is the primary security mechanism for all admin pages

---

## Website Redesign Tasks

- [x] 23. Implement website visual redesign
  - [x] 23.1 Update `css/custom.css`: redesign navbar styles to use a light white/pale-blue background with coloured text, logo image sizing, and a subtle bottom border; update footer to a multi-column layout with contact details
    - _Requirements: 12.3, 12.5, 12.6_

  - [x] 23.2 Update all public HTML pages (`index.html`, `voyages.html`, `omra.html`, `voyage-detail.html`, `contact.html`): replace the navbar brand with the logo image (`img/logo.png`) and short name "Dheyafa Tourism"; update the footer to include phone, email, and Facebook link
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 23.3 Update `js/i18n.js`: change `agency_name` key in both `ar` and `fr` to "Dheyafa Tourism" (short name for navbar brand); add translation keys for footer contact labels
    - _Requirements: 12.2_

  - [x] 23.4 Update contact information across all pages: phone +216 53 244 968, email ltrabelsi26@gmail.com, Facebook https://www.facebook.com/dheyafa.ouedellil
    - _Requirements: 12.4_
