# Requirements Document

## Introduction

This feature migrates the Dheyafa Tourism Website from Bootstrap 5.3 to Tailwind CSS. The website is a bilingual (Arabic/French) RTL-first tourism agency site with 12 HTML files spanning public-facing pages and an admin panel. The migration must preserve all existing functionality — navigation, Firebase-driven dynamic content, form validation, admin CRUD operations, modal dialogs, accordion components, and accessibility features — while replacing every Bootstrap class and JS dependency with Tailwind CSS equivalents and custom JavaScript where needed.

The site currently uses:
- Bootstrap 5.3 CSS + JS bundle (CDN)
- Custom `css/custom.css` with CSS custom properties and Bootstrap overrides
- Bootstrap JS components: collapsible navbar, modal dialogs (`bootstrap.Modal`), accordion (`accordion-*` classes + `show.bs.collapse` events)

After migration the site must use:
- Tailwind CSS (CDN play script or CLI build)
- A retained and updated `css/custom.css` for design tokens and non-utility styles
- Vanilla JS replacements for Bootstrap JS components

## Glossary

- **Tailwind_CSS**: A utility-first CSS framework where styles are applied via composable class names directly in HTML.
- **Bootstrap**: The CSS/JS component framework currently used by the site, to be fully removed.
- **Migration_System**: The combined set of HTML files, updated CSS, and replacement JS that constitutes the migrated website.
- **Public_Pages**: The six user-facing HTML files: `index.html`, `voyages.html`, `omra.html`, `voyage-detail.html`, `contact.html`, `404.html`.
- **Admin_Pages**: The six admin HTML files: `admin/index.html`, `admin/login.html`, `admin/achievements.html`, `admin/questions.html`, `admin/registrations.html`, `admin/voyages.html`.
- **Custom_CSS**: The file `css/custom.css` containing design tokens (CSS custom properties), component styles not expressible as Tailwind utilities, and RTL/LTR layout rules.
- **Bootstrap_JS_Component**: Any interactive UI element whose behaviour is driven by Bootstrap's JavaScript bundle — specifically the collapsible navbar, modal dialogs, and accordion.
- **Vanilla_JS_Replacement**: A plain JavaScript implementation that replicates the behaviour of a Bootstrap_JS_Component without requiring the Bootstrap JS bundle.
- **RTL_Layout**: Right-to-left text direction used for Arabic content, controlled by `html[dir="rtl"]`.
- **Design_Token**: A CSS custom property defined in `:root` (e.g. `--color-primary`, `--font-size-base`) that encodes a single design decision.
- **Touch_Target**: An interactive element whose clickable area must be at least 44 × 44 px per WCAG 2.5.5.
- **Accordion**: The collapsible question-group UI in `admin/questions.html` that uses Bootstrap's `accordion-*` classes and `show.bs.collapse` events.
- **Modal**: The create/edit dialog in `admin/achievements.html` and `admin/voyages.html` that uses `bootstrap.Modal`.

---

## Requirements

### Requirement 1: Remove Bootstrap Dependency

**User Story:** As a developer, I want Bootstrap CSS and JS completely removed from all HTML files, so that the site no longer loads Bootstrap assets and there are no residual Bootstrap class names or JS calls.

#### Acceptance Criteria

1. THE Migration_System SHALL remove the Bootstrap 5.3 CSS `<link>` tag from every HTML file.
2. THE Migration_System SHALL remove the Bootstrap 5.3 JS bundle `<script>` tag from every HTML file.
3. THE Migration_System SHALL remove all Bootstrap-specific class names (e.g. `navbar`, `navbar-expand-lg`, `collapse`, `navbar-collapse`, `container`, `row`, `col-*`, `btn`, `btn-*`, `card`, `card-body`, `d-none`, `d-flex`, `alert`, `alert-*`, `badge`, `spinner-border`, `modal`, `modal-*`, `accordion`, `accordion-*`, `table`, `table-*`, `form-control`, `form-select`, `form-label`, `invalid-feedback`, `mb-*`, `py-*`, `px-*`, `g-*`, `text-*`, `fw-*`, `display-*`, `visually-hidden`, `w-100`, `h-100`, `ms-*`, `me-*`, `mt-*`) from every HTML file.
4. IF a Bootstrap class name is found in any HTML file after migration, THEN THE Migration_System SHALL be considered non-compliant.

---

### Requirement 2: Integrate Tailwind CSS

**User Story:** As a developer, I want Tailwind CSS loaded in every HTML file, so that Tailwind utility classes are available for styling all elements.

#### Acceptance Criteria

1. THE Migration_System SHALL add the Tailwind CSS CDN `<script>` tag (Play CDN) to the `<head>` of every HTML file.
2. THE Migration_System SHALL configure Tailwind with a custom theme that maps the existing Design_Token values (primary colour `#1a6fa8`, accent colour `#c07a10`, font sizes, border radii) so that custom Tailwind classes like `text-primary` and `bg-accent` resolve to the correct values.
3. WHEN the Tailwind configuration is applied, THE Migration_System SHALL make the custom theme available to all HTML files without duplication by referencing a single shared configuration.
4. THE Migration_System SHALL enable RTL support in the Tailwind configuration so that `rtl:` variant classes function correctly.

---

### Requirement 3: Update Custom CSS

**User Story:** As a developer, I want `css/custom.css` updated to remove Bootstrap overrides and retain only styles that cannot be expressed as Tailwind utilities, so that the file is lean and non-conflicting.

#### Acceptance Criteria

1. THE Custom_CSS SHALL retain all CSS custom properties (Design_Tokens) defined in `:root`.
2. THE Custom_CSS SHALL remove all Bootstrap-specific selector overrides (e.g. `.btn-primary`, `.alert-success`, `.badge.bg-*`, `.navbar`, `.card`, `.form-control`, `.table`).
3. THE Custom_CSS SHALL retain component styles that cannot be expressed as Tailwind utilities: hero banner animations (`@keyframes heroZoom`), photo strip grid, skip-link positioning, `prefers-reduced-motion` rules, RTL margin flip utilities, and the `char-counter` state classes.
4. THE Custom_CSS SHALL retain all RTL/LTR layout utilities (`html[dir="rtl"]` rules, `.rtl`, `.ltr` classes).
5. THE Custom_CSS SHALL retain all status badge classes (`.status-pending`, `.status-confirmed`, `.status-cancelled`, `.status-active`, `.status-archived`) as they are applied dynamically by JavaScript.
6. THE Custom_CSS SHALL retain the `.badge-fully-booked` class as it is applied dynamically by JavaScript.
7. THE Custom_CSS SHALL retain the `.skip-link` styles for accessibility.

---

### Requirement 4: Migrate Public Page Layouts

**User Story:** As a visitor, I want all public pages to render correctly with Tailwind CSS, so that the visual appearance and layout are preserved or improved after migration.

#### Acceptance Criteria

1. WHEN a visitor loads any Public_Page, THE Migration_System SHALL render a responsive navigation bar with logo, nav links, and language toggle buttons that collapses to a hamburger menu on mobile viewports (< 1024 px).
2. WHEN a visitor loads `index.html`, THE Migration_System SHALL render the hero banner with a full-bleed background image, dark overlay, heading, subtitle, and two call-to-action buttons.
3. WHEN a visitor loads `index.html`, THE Migration_System SHALL render the photo gallery strip as a responsive grid of images.
4. WHEN a visitor loads `index.html`, THE Migration_System SHALL render the agency info section and the achievements section with cards loaded from Firebase.
5. WHEN a visitor loads `voyages.html` or `omra.html`, THE Migration_System SHALL render the page-level hero banner and the voyage/omra cards loaded from Firebase.
6. WHEN a visitor loads `voyage-detail.html`, THE Migration_System SHALL render the voyage detail card and the registration form side by side on desktop and stacked on mobile.
7. WHEN a visitor loads `contact.html`, THE Migration_System SHALL render the contact form with all fields, character counter, and success message.
8. WHEN a visitor loads `404.html`, THE Migration_System SHALL render the 404 error page with bilingual message and a link back to the homepage.
9. THE Migration_System SHALL render the shared footer with three columns (brand, contact, social) on all Public_Pages.

---

### Requirement 5: Migrate Admin Page Layouts

**User Story:** As an admin, I want all admin pages to render correctly with Tailwind CSS, so that I can manage voyages, registrations, questions, and achievements without visual regressions.

#### Acceptance Criteria

1. WHEN an admin loads `admin/login.html`, THE Migration_System SHALL render the centred login card with logo, email/password fields, and submit button.
2. WHEN an admin loads `admin/index.html`, THE Migration_System SHALL render the dashboard with three stat cards and four navigation link buttons.
3. WHEN an admin loads `admin/voyages.html`, THE Migration_System SHALL render the voyages management table with Edit and Archive action buttons and the Add Voyage button.
4. WHEN an admin loads `admin/registrations.html`, THE Migration_System SHALL render the registrations table with voyage filter dropdown, Confirm/Cancel action buttons, and Export CSV button.
5. WHEN an admin loads `admin/questions.html`, THE Migration_System SHALL render the questions accordion grouped by voyage with unread count badges.
6. WHEN an admin loads `admin/achievements.html`, THE Migration_System SHALL render the achievements table with Edit and Delete action buttons and the Add Achievement button.

---

### Requirement 6: Replace Bootstrap Navbar JS Component

**User Story:** As a visitor on a mobile device, I want the navigation menu to open and close when I tap the hamburger button, so that I can navigate the site without Bootstrap's JS bundle.

#### Acceptance Criteria

1. WHEN a visitor taps the hamburger button on a mobile viewport, THE Migration_System SHALL toggle the visibility of the navigation menu.
2. WHEN the navigation menu is open and a visitor taps the hamburger button again, THE Migration_System SHALL close the navigation menu.
3. WHEN a visitor taps a navigation link while the menu is open on mobile, THE Migration_System SHALL close the navigation menu.
4. THE Vanilla_JS_Replacement for the navbar SHALL NOT depend on the Bootstrap JS bundle.
5. THE Migration_System SHALL apply the Vanilla_JS_Replacement navbar toggle to all 12 HTML files.

---

### Requirement 7: Replace Bootstrap Modal JS Component

**User Story:** As an admin, I want the create/edit modal dialogs in the voyages and achievements pages to open and close correctly, so that I can manage records without Bootstrap's JS bundle.

#### Acceptance Criteria

1. WHEN an admin clicks the Add or Edit button on `admin/voyages.html` or `admin/achievements.html`, THE Migration_System SHALL open the modal dialog.
2. WHEN an admin clicks the Cancel button or the close (×) button inside the modal, THE Migration_System SHALL close the modal dialog.
3. WHEN the modal is open and an admin presses the Escape key, THE Migration_System SHALL close the modal dialog.
4. WHEN the modal is open, THE Migration_System SHALL trap focus within the modal and prevent interaction with the page behind it.
5. THE Vanilla_JS_Replacement for the modal SHALL expose `show()` and `hide()` methods so that existing JS code calling `achievementModal.show()`, `achievementModal.hide()`, `voyageModal.show()`, and `voyageModal.hide()` continues to work without modification.
6. THE Vanilla_JS_Replacement for the modal SHALL fire a `hidden.bs.modal` event on the modal element when the modal closes, so that existing `addEventListener("hidden.bs.modal", ...)` listeners continue to work.

---

### Requirement 8: Replace Bootstrap Accordion JS Component

**User Story:** As an admin, I want the questions accordion in `admin/questions.html` to expand and collapse correctly, so that I can view question groups without Bootstrap's JS bundle.

#### Acceptance Criteria

1. WHEN an admin clicks an accordion header button, THE Migration_System SHALL expand the corresponding accordion panel and collapse all other panels.
2. WHEN an accordion panel is expanded, THE Migration_System SHALL fire a `show.bs.collapse` event on the collapse element, so that the existing `addEventListener("show.bs.collapse", ...)` mark-as-read listener continues to work.
3. THE Vanilla_JS_Replacement for the accordion SHALL NOT depend on the Bootstrap JS bundle.
4. THE Migration_System SHALL apply the Vanilla_JS_Replacement accordion only to `admin/questions.html`.

---

### Requirement 9: Preserve Dynamic Class Application by JavaScript

**User Story:** As a developer, I want all CSS classes applied dynamically by JavaScript to remain functional after migration, so that runtime UI states (loading, error, hidden, validation) work correctly.

#### Acceptance Criteria

1. THE Migration_System SHALL ensure that the `d-none` hide/show pattern used throughout all JS scripts is replaced with a Tailwind-compatible equivalent (e.g. `hidden` class) AND all JS references to `classList.add("d-none")` and `classList.remove("d-none")` are updated to use the new class name.
2. THE Migration_System SHALL ensure that `is-invalid` class applied by validation JS to form inputs continues to trigger visible error styling via Custom_CSS or Tailwind utilities.
3. THE Migration_System SHALL ensure that `spinner-border` and `text-primary` classes used in loading spinners are replaced with Tailwind-equivalent spinner markup and classes.
4. THE Migration_System SHALL ensure that `badge` classes (`bg-danger`, `bg-success`, `bg-secondary`, `bg-primary`, `bg-info`, `bg-warning`) applied dynamically in JS strings are replaced with Tailwind utility classes in the JS string templates.
5. THE Migration_System SHALL ensure that `btn-*` classes applied dynamically in JS strings (e.g. `btn-outline-primary`, `btn-sm`, `btn-success`, `btn-outline-danger`) are replaced with Tailwind utility classes in the JS string templates.
6. THE Migration_System SHALL ensure that `card`, `card-body`, `card-title`, `card-text`, `card-footer`, `card-img-top` classes used in dynamically generated HTML strings are replaced with Tailwind utility classes.
7. THE Migration_System SHALL ensure that `alert`, `alert-danger`, `alert-warning`, `alert-success` classes used in dynamically generated HTML strings are replaced with Tailwind utility classes.
8. THE Migration_System SHALL ensure that `accordion-*` classes used in dynamically generated HTML strings in `admin/questions.html` are replaced with Tailwind utility classes.
9. THE Migration_System SHALL ensure that `table`, `table-hover`, `table-responsive` classes used in dynamically generated HTML strings are replaced with Tailwind utility classes.
10. THE Migration_System SHALL ensure that `fw-bold`, `text-muted`, `border-primary`, `border-top`, `pt-2`, `mt-1`, `mt-2`, `ms-2`, `me-1` utility classes used in dynamically generated HTML strings are replaced with Tailwind utility classes.

---

### Requirement 10: Preserve Accessibility Features

**User Story:** As a user with accessibility needs, I want all accessibility features to remain intact after migration, so that the site continues to meet WCAG 2.1 AA standards.

#### Acceptance Criteria

1. THE Migration_System SHALL preserve the skip-to-content link (`.skip-link`) on all Public_Pages and ensure it becomes visible on keyboard focus.
2. THE Migration_System SHALL preserve all `aria-*` attributes, `role` attributes, and `aria-live` regions on all HTML elements.
3. THE Migration_System SHALL ensure all interactive elements (buttons, links, inputs) maintain a minimum Touch_Target size of 44 × 44 px via Tailwind utilities or Custom_CSS.
4. THE Migration_System SHALL ensure all text meets a minimum contrast ratio of 4.5:1 against its background using the Design_Token colour values.
5. THE Migration_System SHALL preserve the `visually-hidden` pattern for screen-reader-only text (e.g. spinner labels) using a Tailwind `sr-only` class.
6. THE Migration_System SHALL preserve the `prefers-reduced-motion` media query in Custom_CSS.
7. THE Migration_System SHALL ensure all form inputs have associated `<label>` elements with matching `for`/`id` pairs.

---

### Requirement 11: Preserve Bilingual RTL/LTR Support

**User Story:** As an Arabic or French speaker, I want the site to display correctly in both RTL (Arabic) and LTR (French) modes after migration, so that language switching continues to work.

#### Acceptance Criteria

1. WHEN the language is set to Arabic, THE Migration_System SHALL render the page in RTL direction with correct text alignment and mirrored layout.
2. WHEN the language is set to French, THE Migration_System SHALL render the page in LTR direction with correct text alignment.
3. THE Migration_System SHALL preserve all `dir="ltr"` attributes on phone number and email inputs.
4. THE Migration_System SHALL preserve the RTL margin-flip utility rules in Custom_CSS (`html[dir="rtl"] .ms-auto`, etc.).
5. THE Migration_System SHALL configure Tailwind's `rtl:` variant so that directional utilities (padding, margin, text alignment) respond correctly to `html[dir="rtl"]`.

---

### Requirement 12: Preserve Firebase Integration and Functionality

**User Story:** As a developer, I want all Firebase-driven features to continue working after migration, so that dynamic content loading, form submissions, and admin operations are unaffected.

#### Acceptance Criteria

1. THE Migration_System SHALL NOT modify any Firebase SDK script tags or Firebase initialisation code in `js/firebase-init.js`.
2. THE Migration_System SHALL NOT modify any Firebase read/write logic in any HTML file's inline `<script>` blocks.
3. THE Migration_System SHALL NOT modify `js/auth-guard.js`, `js/i18n.js`, `js/utils.js`, or `js/validation.js`.
4. WHEN Firebase data is loaded and rendered into the DOM via JS string templates, THE Migration_System SHALL ensure the generated HTML uses Tailwind utility classes so that dynamically rendered cards, tables, badges, and alerts are styled correctly.

---

### Requirement 13: Preserve Visual Design Quality

**User Story:** As a visitor, I want the migrated site to look as good as or better than the Bootstrap version, so that the brand identity and user experience are maintained.

#### Acceptance Criteria

1. THE Migration_System SHALL preserve the colour palette defined by the Design_Tokens (primary `#1a6fa8`, accent `#c07a10`, success `#1e7e45`, danger `#b03a2e`).
2. THE Migration_System SHALL preserve the minimum body font size of 18 px and minimum heading size of 24 px.
3. THE Migration_System SHALL preserve the hero banner full-bleed background image with dark gradient overlay and zoom animation.
4. THE Migration_System SHALL preserve the card hover effect (box-shadow increase and upward translate).
5. THE Migration_System SHALL preserve the photo strip responsive grid layout.
6. THE Migration_System SHALL preserve the footer dark gradient background with three-column layout.
7. THE Migration_System SHALL preserve the navbar white background with bottom border and box shadow.

---

### Requirement 14: Responsive Layout Preservation

**User Story:** As a visitor on any device, I want the site to be fully responsive after migration, so that it works correctly on screens from 320 px wide upwards.

#### Acceptance Criteria

1. THE Migration_System SHALL implement responsive breakpoints equivalent to Bootstrap's `sm` (576 px), `md` (768 px), and `lg` (1024 px) using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
2. WHEN the viewport width is less than 1024 px, THE Migration_System SHALL collapse the navigation links into a hamburger menu.
3. WHEN the viewport width is less than 768 px, THE Migration_System SHALL stack multi-column layouts (cards, form + detail, footer columns) into a single column.
4. THE Migration_System SHALL ensure all buttons are full-width on mobile viewports (< 576 px) as per the existing Custom_CSS rule.
