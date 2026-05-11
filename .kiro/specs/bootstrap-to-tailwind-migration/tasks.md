# Implementation Plan: Bootstrap to Tailwind CSS Migration

## Overview

This plan migrates the Dheyafa Tourism Website from Bootstrap 5.3 to Tailwind CSS v4 Play CDN. The migration proceeds in six phases: (1) shared infrastructure — new JS modules and updated CSS; (2) property-based test scaffolding; (3) public pages; (4) admin pages; (5) dynamic HTML string updates in inline scripts; (6) final cleanup and verification. Each task builds on the previous, ending with all 12 HTML files fully migrated, Bootstrap removed, and all vanilla JS replacements wired in.

## Tasks

- [x] 1. Create shared vanilla JS modules and update css/custom.css
  - [x] 1.1 Create `js/navbar.js` — vanilla JS navbar toggle
    - Write `initNavbar()` function that finds `.navbar-toggler` and `#mainNav`
    - Toggle `hidden` class on `#mainNav` when the hamburger button is clicked
    - Close the menu when any `<a>` inside `#mainNav` is clicked
    - Update `aria-expanded` on the button to reflect open/closed state
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 1.2 Create `js/modal.js` — vanilla JS modal (bootstrap.Modal API-compatible)
    - Write `VanillaModal(element)` constructor/factory returning `{ show, hide }`
    - `show()`: remove `hidden` class, set `aria-hidden="false"`, trap focus, prevent body scroll
    - `hide()`: add `hidden` class, set `aria-hidden="true"`, restore focus, dispatch `new CustomEvent("hidden.bs.modal")` on the element
    - Close on Escape key press and on backdrop click (`event.target === modalElement`)
    - Focus trap: Tab/Shift+Tab cycles through focusable elements; handle empty-focusable-list edge case
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 1.3 Create `js/toast.js` — vanilla JS `showToast` override
    - Redefine `showToast(message, type)` as a global function (loaded after `utils.js`)
    - Create `#toast-container` with `fixed top-0 end-0 p-3 z-[1100]` if it does not exist
    - Append a toast element styled with Tailwind colour utilities matching the `type` parameter
    - Auto-dismiss after 5 seconds; remove element from DOM after dismissal
    - _Requirements: 9.1, 9.3_

  - [x] 1.4 Update `css/custom.css` — remove Bootstrap overrides, retain non-utility styles
    - Remove all Bootstrap component selector overrides: `.btn-primary`, `.btn-outline-primary`, `.btn-outline-light`, `.btn-accent`, `.btn-success`, `.btn-danger`, `.btn-lang`, `.alert-*`, `.badge.bg-*`, `.navbar`, `.navbar-brand`, `.navbar-nav .nav-link`, `.navbar-toggler`, `.navbar-toggler-icon`, `.card`, `.card-*`, `.table`, `.table th`, `.table td`, `.form-control`, `.invalid-feedback`, `.valid-feedback`, `.toast`, `.toast-header`
    - Retain `:root` CSS custom properties block (all design tokens — unchanged)
    - Retain `@keyframes heroZoom`, `.hero-banner*`, `.page-hero*` (complex positioning)
    - Retain `.photo-strip` and `.photo-strip-item` (CSS Grid with `auto-fill`)
    - Retain `.skip-link` styles and `:focus-visible` outline
    - Retain `@media (prefers-reduced-motion: reduce)` block
    - Retain RTL margin-flip utilities (`html[dir="rtl"] .ms-auto`, `.me-auto`, `.ms-2`, `.me-2`, `.ms-3`, `.me-3`) and `.rtl`/`.ltr` classes
    - Retain `.char-counter`, `.char-counter.near-limit`, `.char-counter.at-limit`
    - Retain status badge classes: `.status-pending`, `.status-confirmed`, `.status-cancelled`, `.status-active`, `.status-archived`
    - Retain `.badge-fully-booked`, `.navbar-logo`, `.footer-logo`, `.section-divider`, `.about-section`
    - Retain `.site-footer` and all footer sub-classes (complex gradient)
    - Add `input.is-invalid, select.is-invalid, textarea.is-invalid` rule with `border-color: var(--color-danger)` and box-shadow (replaces Bootstrap's `.form-control.is-invalid`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.2_

- [ ] 2. Set up property-based test scaffolding
  - [ ] 2.1 Initialise Node.js test project and install dependencies
    - Create `tests/` directory with `package.json` (name: `migration-tests`, type: `module`)
    - Install `fast-check` (property testing), `jsdom` (HTML parsing), `node:fs`/`node:path` (file iteration)
    - Create `tests/helpers.js` with: `getAllHtmlFiles()` returning paths to all 12 HTML files, `parseHtml(filePath)` returning a jsdom `document`, `getInlineScriptContent(document)` returning concatenated inline script text
    - _Requirements: 1.3, 1.4, 9.1_

  - [ ]* 2.2 Write property test — Property 1: No Bootstrap class names in any HTML file
    - For each of the 12 HTML files, assert that no element's `class` attribute contains Bootstrap-specific patterns: `navbar-expand`, `collapse`, `navbar-collapse`, `container` (as standalone class), `row`, `col-`, `btn-primary`, `btn-outline`, `btn-success`, `btn-danger`, `btn-secondary`, `btn-lang`, `card-body`, `card-title`, `card-text`, `card-footer`, `card-img-top`, `d-none`, `d-flex`, `alert-`, `badge bg-`, `spinner-border`, `modal fade`, `accordion-`, `table-hover`, `form-control`, `form-select`, `form-label`, `invalid-feedback`, `mb-`, `py-`, `px-`, `g-`, `fw-bold`, `display-`, `visually-hidden`, `w-100`, `h-100`, `ms-`, `me-`, `mt-`
    - **Property 1: No Bootstrap class names in any HTML file**
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 2.3 Write property test — Property 2: No `d-none` references in any file
    - For each HTML and JS file, assert that the string `d-none` does not appear anywhere in the file content
    - **Property 2: No Bootstrap d-none/classList calls in any file**
    - **Validates: Requirements 9.1**

  - [ ]* 2.4 Write property test — Property 3: No Bootstrap classes in JS string templates
    - For each HTML file, extract all inline `<script>` block content and assert no Bootstrap class name patterns appear inside string literals
    - **Property 3: No Bootstrap class names in JS string templates**
    - **Validates: Requirements 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10**

  - [ ]* 2.5 Write property test — Property 5: All form inputs have associated labels
    - For each HTML file, find all `<input>`, `<select>`, `<textarea>` elements with an `id` attribute and assert a `<label for="...">` with a matching value exists in the same document
    - **Property 5: All form inputs have associated labels**
    - **Validates: Requirements 10.7**

  - [ ]* 2.6 Write property test — Property 6: All aria-* and role attributes are preserved
    - For each HTML file, compare the migrated file against the original (pre-migration snapshot stored in `tests/snapshots/`) and assert that every element that had `aria-*` or `role` attributes still has them
    - Create `tests/snapshots/` directory and copy original HTML files there before migration begins
    - **Property 6: All aria-* and role attributes are preserved**
    - **Validates: Requirements 10.2**

  - [ ]* 2.7 Write property test — Property 7: Navbar toggle present in all HTML files
    - For each of the 12 HTML files, assert the document contains an element with class `navbar-toggler` and an element with `id="mainNav"`
    - **Property 7: Navbar toggle is present in all HTML files**
    - **Validates: Requirements 6.5**

- [ ] 3. Checkpoint — run property tests against original files
  - Run `node --experimental-vm-modules node_modules/.bin/jest` (or equivalent) in `tests/` to confirm tests fail on the unmodified Bootstrap files (expected baseline failures). Ensure all tests are correctly detecting Bootstrap artifacts. Ask the user if questions arise.

- [x] 4. Migrate `index.html` (public homepage)
  - Replace Bootstrap CSS `<link>` with Tailwind v4 Play CDN `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4">` and add `<style type="text/tailwindcss">` `@theme` block with all design tokens
  - Remove Bootstrap JS bundle `<script>` and jQuery `<script>` tags
  - Add `<script src="js/navbar.js">` and `<script src="js/toast.js">` after `utils.js`
  - Add `initNavbar()` call in a `DOMContentLoaded` listener (or at end of body)
  - Replace navbar HTML: remove `navbar-expand-lg`, `collapse navbar-collapse`, `navbar-toggler` Bootstrap attrs (`data-bs-toggle`, `data-bs-target`); apply Tailwind classes per design spec; keep `.navbar-toggler` class for `js/navbar.js` selector; keep `#mainNav` id; add `hidden lg:flex` to the nav menu div
  - Replace hero section Bootstrap classes (`d-flex`, `flex-wrap`, `gap-3`, `justify-content-center`, `mt-3`, `btn btn-accent btn-lg`, `btn btn-outline-light btn-lg`) with Tailwind equivalents
  - Replace photo gallery section (`py-4 bg-alt` → Tailwind utilities; `.photo-strip` stays in custom.css)
  - Replace agency info section (`py-5 about-section`, `row`, `col-12 col-md-7`, `col-12 col-md-5`, `list-unstyled`, `mb-3`, `text-decoration-none text-primary-dark ltr`) with Tailwind utilities
  - Replace achievements section (`py-5`, `text-center py-4`, `spinner-border text-primary`, `visually-hidden`, `alert alert-danger d-none`, `row g-4`) with Tailwind equivalents; replace `d-none` with `hidden` in the element and in the inline script's `classList` calls
  - Replace footer HTML (`row g-4`, `col-12 col-md-4`, `text-center text-md-start`, `h6 text-white mb-3`) with Tailwind utilities; `.site-footer` and footer sub-classes remain in custom.css
  - Update inline script: replace `d-none` ↔ `hidden` in `classList.add/remove` calls; replace card HTML string (`card h-100`, `card-img-top`, `card-body`, `card-title`, `card-text`, `text-muted small`) with Tailwind class equivalents per design mapping table
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 4.2, 4.3, 4.4, 4.9, 6.1, 6.5, 9.1, 9.3, 9.6, 10.1, 10.2, 10.3, 10.5, 11.1, 13.1, 13.2, 13.3, 13.5, 13.6, 13.7, 14.1, 14.2, 14.3_

- [x] 5. Migrate `voyages.html` and `omra.html` (public listing pages)
  - Apply the same `<head>` changes as task 4 (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `navbar.js`, `toast.js`)
  - Replace navbar HTML with Tailwind classes (same pattern as task 4)
  - Replace page-hero section Bootstrap classes with Tailwind utilities (`.page-hero*` stays in custom.css)
  - Replace loading spinner (`spinner-border text-primary`, `visually-hidden`) with Tailwind spinner markup and `sr-only`
  - Replace error alert (`alert alert-danger d-none`) with Tailwind utility classes; update `classList` calls from `d-none` to `hidden`
  - Replace `row g-4` container with Tailwind grid classes
  - Replace footer HTML with Tailwind utilities (same pattern as task 4)
  - Update inline scripts in both files: replace `d-none` ↔ `hidden` in `classList` calls; replace card HTML strings (`card h-100`, `card-img-top`, `card-body`, `card-title`, `card-footer`, `btn btn-primary w-100`, `badge badge-fully-booked`, `text-muted text-center`) with Tailwind equivalents
  - _Requirements: 1.1, 1.2, 1.3, 4.5, 6.1, 6.5, 9.1, 9.3, 9.6, 9.7, 10.1, 10.3, 10.5, 13.4, 14.1, 14.2, 14.3_

- [x] 6. Migrate `voyage-detail.html` (detail + registration form)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `navbar.js`, `toast.js`, keep `validation.js`)
  - Replace navbar HTML with Tailwind classes
  - Replace main content layout: `container py-5`, `row g-4`, `col-12 col-lg-7`, `col-12 col-lg-5` → Tailwind grid/flex utilities
  - Replace loading spinner, error alert (`alert alert-danger d-none`), not-found alert (`alert alert-warning d-none`) with Tailwind equivalents; update `classList` calls from `d-none` to `hidden`
  - Replace detail content wrapper (`d-none` → `hidden`), voyage info card (`card mb-4`, `card-body`, `h4`) with Tailwind utilities
  - Replace registration card (`card`, `card-body`, `h4 mb-3`, `alert alert-warning d-none`, `mb-3`, `form-label`, `form-control`, `invalid-feedback`, `alert alert-danger d-none`, `alert alert-success d-none`, `btn btn-primary w-100`) with Tailwind utilities; keep `is-invalid` class on inputs (handled by custom.css rule added in task 1.4)
  - Replace footer HTML with Tailwind utilities
  - Update inline script: replace all `d-none` ↔ `hidden` in `classList` calls; replace `form-control` class references in `querySelectorAll` with the new input class selector used after migration
  - _Requirements: 1.1, 1.2, 1.3, 4.6, 6.1, 6.5, 9.1, 9.2, 10.1, 10.3, 10.5, 10.7, 14.1, 14.2, 14.3_

- [x] 7. Migrate `contact.html` (contact/question form)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `navbar.js`, `toast.js`, keep `validation.js`)
  - Replace navbar HTML with Tailwind classes
  - Replace main content layout (`container py-5`, `row justify-content-center`, `col-12 col-md-8 col-lg-6`) with Tailwind utilities
  - Replace success alert (`alert alert-success d-none`) with Tailwind utilities; update `classList` calls
  - Replace form fields: `mb-3`, `form-label`, `form-control`, `form-select`, `invalid-feedback`, `char-counter` (stays in custom.css), `btn btn-primary w-100` → Tailwind utilities; keep `is-invalid` class on inputs
  - Replace footer HTML with Tailwind utilities
  - Update inline script: replace `d-none` ↔ `hidden` in `classList` calls
  - _Requirements: 1.1, 1.2, 1.3, 4.7, 6.1, 6.5, 9.1, 9.2, 10.1, 10.3, 10.5, 10.7, 14.1, 14.2, 14.3_

- [x] 8. Migrate `404.html`
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `navbar.js`)
  - Replace navbar HTML with Tailwind classes
  - Replace main content (`container py-5`, `row justify-content-center`, `col-12 col-md-8 col-lg-6 text-center`, `display-1 fw-bold text-primary`, `h2 mt-2 mb-1`, `lead mb-3`, `h4 text-muted mb-1`, `text-muted mb-4`, `btn btn-primary btn-lg`) with Tailwind utilities
  - Replace footer HTML with Tailwind utilities
  - _Requirements: 1.1, 1.2, 1.3, 4.8, 6.1, 6.5, 10.1, 10.3, 14.1_

- [ ] 9. Checkpoint — verify public pages
  - Ensure all property tests pass for the 6 migrated public pages (Properties 1, 2, 3, 5, 6, 7). Ask the user if questions arise.

- [x] 10. Migrate `admin/login.html`
  - Apply `<head>` changes (Tailwind CDN, `@theme` block with `../css/custom.css` path, remove Bootstrap/jQuery)
  - No navbar toggle needed (login page has no collapsible nav); no `navbar.js` needed
  - Replace layout (`container py-5`, `row justify-content-center`, `col-12 col-sm-8 col-md-6 col-lg-4`) with Tailwind utilities
  - Replace branding block (`text-center mb-4`, `h3 mt-2`, `text-muted`) with Tailwind utilities
  - Replace error alert (`alert alert-danger d-none`) with Tailwind utilities; update `classList` calls from `d-none` to `hidden`
  - Replace form fields (`mb-3`, `form-label`, `form-control`, `btn btn-primary w-100`) with Tailwind utilities
  - Replace language toggle (`text-center mt-3`, `btn btn-lang`) with Tailwind utilities
  - Update inline script: replace `d-none` ↔ `hidden` in `classList` calls
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 9.1, 10.3, 10.7, 14.1_

- [x] 11. Migrate `admin/index.html` (admin dashboard)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `toast.js`)
  - Replace admin navbar HTML (`navbar navbar-expand-lg`, `container-fluid`, `navbar-brand`, `d-flex align-items-center gap-2`, `btn btn-lang`, `btn btn-danger btn-sm`) with Tailwind utilities; no hamburger toggle needed for admin navbar (simplified bar)
  - Replace stats row (`row g-3 mb-4`, `col-12 col-md-4`, `card text-center`, `card-body`, `display-4 fw-bold text-primary`, `card-text`) with Tailwind utilities
  - Replace nav links row (`row g-3`, `col-12 col-md-6 col-lg-3`, `btn btn-outline-primary w-100 py-3`, `badge bg-danger ms-1`) with Tailwind utilities; update `style.display` badge toggle to use `hidden` class
  - _Requirements: 1.1, 1.2, 1.3, 5.2, 9.1, 9.4, 10.3, 14.1_

- [x] 12. Migrate `admin/voyages.html` (voyages CRUD + modal)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `modal.js`, `toast.js`, keep `validation.js`)
  - Replace admin navbar HTML with Tailwind utilities
  - Replace page header (`d-flex justify-content-between align-items-center mb-3`, `h3`, `btn btn-primary`) with Tailwind utilities
  - Replace loading spinner (`spinner-border text-primary`, `visually-hidden`) with Tailwind spinner and `sr-only`
  - Replace table wrapper (`table-responsive d-none`, `table table-hover`) with Tailwind utilities; update `classList` calls from `d-none` to `hidden`
  - Replace no-voyages message (`d-none text-muted text-center py-4`) with Tailwind utilities
  - Replace modal HTML: remove `modal fade`, `modal-dialog modal-lg`, `modal-content`, `modal-header`, `modal-body`, `modal-footer`, `btn-close`, `data-bs-dismiss="modal"` attributes; apply Tailwind modal structure per design spec (`hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50`, inner panel classes); add `modal-close-btn` class to close buttons
  - Replace form fields inside modal (`row g-3`, `col-12 col-md-6`, `col-12 col-md-4`, `col-12`, `form-label`, `form-control`, `form-select`, `invalid-feedback`, `btn btn-secondary`, `btn btn-primary`) with Tailwind utilities; keep `is-invalid` class on inputs
  - Update inline script: replace `var voyageModal = new bootstrap.Modal(voyageModalEl)` with `var voyageModal = new VanillaModal(voyageModalEl)`; replace all `d-none` ↔ `hidden` in `classList` calls; replace badge and button HTML strings in `renderTable()` (`badge bg-success`, `badge bg-secondary`, `badge bg-info text-dark`, `badge bg-primary`, `btn btn-sm btn-outline-primary me-1`, `btn btn-sm btn-outline-warning`) with Tailwind equivalents per design mapping table
  - _Requirements: 1.1, 1.2, 1.3, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.4, 9.5, 9.9, 10.3, 10.5, 14.1_

- [x] 13. Migrate `admin/registrations.html` (registrations management)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `toast.js`)
  - Replace admin navbar HTML with Tailwind utilities
  - Replace page header (`d-flex justify-content-between align-items-center mb-3`, `h3`, `btn btn-success`) with Tailwind utilities
  - Replace voyage filter (`mb-3`, `form-label`, `form-select`) with Tailwind utilities
  - Replace loading spinner with Tailwind spinner and `sr-only`
  - Replace table wrapper (`table-responsive d-none`, `table table-hover`) with Tailwind utilities; update `classList` calls from `d-none` to `hidden`
  - Replace no-registrations message with Tailwind utilities
  - Update inline script: replace all `d-none` ↔ `hidden` in `classList` calls; replace badge HTML strings (`badge bg-secondary`, `badge bg-success`, `badge bg-danger`) and button HTML strings (`btn btn-sm btn-success me-1`, `btn btn-sm btn-outline-danger`) in `renderTable()` with Tailwind equivalents per design mapping table
  - _Requirements: 1.1, 1.2, 1.3, 5.4, 9.1, 9.4, 9.5, 9.9, 10.3, 10.5, 14.1_

- [x] 14. Migrate `admin/questions.html` (questions accordion)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `toast.js`)
  - Replace admin navbar HTML with Tailwind utilities
  - Replace page header (`d-flex justify-content-between align-items-center mb-4`, `h3 mb-0`, `badge bg-danger fs-6`) with Tailwind utilities; update `style.display` badge toggle to use `hidden` class
  - Replace loading spinner with Tailwind spinner and `sr-only`; update `classList` calls from `d-none` to `hidden`
  - Replace no-questions message with Tailwind utilities
  - Replace accordion container: remove `accordion d-none` Bootstrap classes; apply `hidden` for initial state; update `classList` calls
  - Update inline script `renderAccordion()`: replace all accordion HTML string templates — `accordion-item`, `accordion-header`, `accordion-button collapsed`, `accordion-collapse collapse show`, `accordion-collapse collapse`, `accordion-body`, `data-bs-toggle="collapse"`, `data-bs-target`, `data-bs-parent` — with Tailwind utility classes per design spec; implement vanilla JS accordion toggle logic (click header → expand panel, collapse others, dispatch `new CustomEvent("show.bs.collapse", { bubbles: true })` on the collapse element); replace card HTML strings (`card mb-2 border-primary`, `card-body`, `d-flex justify-content-between align-items-start`, `fw-bold`, `text-muted`, `mt-1`, `mt-2`, `border-top pt-2`, `badge bg-danger ms-2`, `badge bg-secondary ms-2`, `badge bg-primary ms-2 badge-unread`) with Tailwind equivalents; replace `d-none` ↔ `hidden` in all `classList` calls; update `markGroupAsRead()` to remove `fw-bold` → `font-bold` class from sender name elements
  - _Requirements: 1.1, 1.2, 1.3, 5.5, 8.1, 8.2, 9.1, 9.4, 9.8, 9.10, 10.3, 10.5, 14.1_

- [x] 15. Migrate `admin/achievements.html` (achievements CRUD + modal)
  - Apply `<head>` changes (Tailwind CDN, `@theme` block, remove Bootstrap/jQuery, add `modal.js`, `toast.js`)
  - Replace admin navbar HTML with Tailwind utilities
  - Replace page header with Tailwind utilities
  - Replace loading spinner with Tailwind spinner and `sr-only`; update `classList` calls from `d-none` to `hidden`
  - Replace table wrapper and table with Tailwind utilities
  - Replace no-achievements message with Tailwind utilities
  - Replace modal HTML: same pattern as task 12 — remove Bootstrap modal classes/attributes, apply Tailwind modal structure, add `modal-close-btn` class to close buttons
  - Replace form fields inside modal with Tailwind utilities; keep `is-invalid` class on inputs
  - Update inline script: replace `var achievementModal = new bootstrap.Modal(achievementModalEl)` with `var achievementModal = new VanillaModal(achievementModalEl)`; replace all `d-none` ↔ `hidden` in `classList` calls; replace button HTML strings in `loadAchievements()` (`btn btn-sm btn-outline-primary me-1`, `btn btn-sm btn-outline-danger`) with Tailwind equivalents
  - _Requirements: 1.1, 1.2, 1.3, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.5, 10.3, 10.5, 14.1_

- [ ] 16. Checkpoint — run all property tests
  - Run the full property test suite against all 12 migrated HTML files. All 7 properties should pass. Fix any remaining Bootstrap artifacts found by the tests. Ask the user if questions arise.

- [x] 17. Final wiring — add `js/navbar.js` and `js/toast.js` to all remaining pages and verify script order
  - Confirm every HTML file includes scripts in this order: Firebase SDKs → `firebase-init.js` → (auth-guard if admin) → `i18n.js` → `utils.js` → `toast.js` → `navbar.js` → (page-specific: `validation.js`, `modal.js`)
  - Confirm `initNavbar()` is called on `DOMContentLoaded` in every file that has a collapsible navbar
  - Confirm `VanillaModal` is instantiated in `admin/voyages.html` and `admin/achievements.html` replacing `bootstrap.Modal`
  - Confirm the vanilla accordion initialisation runs after `renderAccordion()` inserts HTML in `admin/questions.html`
  - _Requirements: 6.5, 7.5, 7.6, 8.3, 12.1, 12.2, 12.3_

- [x] 18. Final checkpoint — full verification
  - Ensure all property tests pass (Properties 1–7)
  - Verify no `bootstrap` references remain in any HTML file (search for `bootstrap.`, `data-bs-`, `cdn.jsdelivr.net/npm/bootstrap`)
  - Verify no jQuery `<script>` tags remain
  - Verify `js/firebase-init.js`, `js/auth-guard.js`, `js/i18n.js`, `js/utils.js`, `js/validation.js` are unmodified
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The `@theme` block is duplicated across all 12 HTML files — this is intentional (no build step)
- `js/utils.js` is NOT modified; `js/toast.js` overrides `showToast` by redefining it after `utils.js` loads
- `is-invalid` class on form inputs is preserved and styled via the new rule added to `css/custom.css` in task 1.4
- The `.navbar-toggler` class is kept on the hamburger button as the selector used by `js/navbar.js`
- Admin pages use a simplified navbar (no hamburger collapse) — `js/navbar.js` is not needed there
- Property tests in task 2 are designed to fail on the original Bootstrap files and pass after migration
- Each property test references a specific property from the design document for traceability
