# Design Document: Bootstrap to Tailwind CSS Migration

## Overview

This document describes the technical design for migrating the Dheyafa Tourism Website from Bootstrap 5.3 to Tailwind CSS. The site is a bilingual (Arabic/French) RTL-first static website with 12 HTML files, Firebase Realtime Database integration, and an admin panel. The migration replaces every Bootstrap CSS class and JS dependency with Tailwind CSS utilities and vanilla JavaScript equivalents, while preserving all existing functionality, accessibility features, and visual design.

### Goals

- Remove Bootstrap 5.3 CSS and JS bundle from all 12 HTML files
- Integrate Tailwind CSS v4 Play CDN with a shared custom theme
- Replace Bootstrap JS components (navbar collapse, modal, accordion) with vanilla JS
- Update `css/custom.css` to remove Bootstrap overrides and retain only non-utility styles
- Update all dynamically generated HTML strings in inline `<script>` blocks to use Tailwind classes
- Preserve RTL/LTR bilingual support, accessibility features, and visual design quality

### Non-Goals

- Modifying Firebase SDK scripts or Firebase read/write logic
- Modifying `js/firebase-init.js`, `js/auth-guard.js`, `js/i18n.js`, `js/utils.js`, or `js/validation.js`
- Introducing a build step or bundler (migration uses CDN only)
- Changing any page's functionality, routing, or data model

---

## Architecture

The migrated site remains a zero-build-step static website. The only structural change is the CSS/JS framework layer:

```
Before:
  HTML files
    └── Bootstrap 5.3 CSS (CDN link)
    └── Bootstrap 5.3 JS bundle (CDN script)
    └── css/custom.css (Bootstrap overrides + design tokens)
    └── Inline <script> blocks (use bootstrap.Modal, bootstrap.Toast, data-bs-* attrs)

After:
  HTML files
    └── Tailwind CSS v4 Play CDN (single <script> tag)
    └── <style type="text/tailwindcss"> with @theme block (shared config)
    └── css/custom.css (design tokens + non-utility styles only)
    └── Inline <script> blocks (vanilla JS modal/accordion/navbar/toast)
    └── js/navbar.js (shared vanilla JS navbar toggle — new file)
    └── js/modal.js (shared vanilla JS modal — new file)
```

### Tailwind CSS Version Decision

The migration uses **Tailwind CSS v4** via the Play CDN (`@tailwindcss/browser@4`). This is the current stable version as of 2025. Key v4 differences from v3 that affect this migration:

- Configuration is CSS-first: custom theme tokens are defined in a `<style type="text/tailwindcss">` block using `@theme { }` instead of a `tailwind.config.js` file
- RTL support is built-in via the `rtl:` variant (no plugin needed)
- The `hidden` utility maps to `display: none` (equivalent to Bootstrap's `d-none`)
- `sr-only` is a built-in utility (equivalent to Bootstrap's `visually-hidden`)

### Shared Configuration Strategy

Because the site has no build step, the Tailwind `@theme` configuration must be duplicated across all 12 HTML files, or extracted to a shared mechanism. The chosen approach:

1. Create a new file `js/tailwind-config.js` that sets `window.tailwindConfig` before the Tailwind CDN script loads
2. Each HTML file includes `<script src="js/tailwind-config.js">` before the Tailwind CDN `<script>` tag
3. The Tailwind Play CDN reads `window.tailwindConfig` for v3-style config, or alternatively each file includes a `<style type="text/tailwindcss">` block with the `@theme` directive

**Decision**: Use a `<style type="text/tailwindcss">` block in each HTML file containing the `@theme` configuration. While this duplicates the block across 12 files, it is the most reliable approach with the v4 Play CDN and avoids external script ordering issues. The block is small (~30 lines) and identical across all files, making it easy to maintain.

---

## Components and Interfaces

### 1. Tailwind Theme Configuration Block

Each HTML file's `<head>` will contain:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style type="text/tailwindcss">
  @theme {
    --color-primary: #1ba3fdff;
    --color-primary-dark: #5f9cc5ff;
    --color-primary-light: #e8f4fd;
    --color-primary-mid: #cce5f6;
    --color-accent: #c07a10;
    --color-accent-dark: #a06208;
    --color-accent-light: #fef3e2;
    --color-success: #1e7e45;
    --color-danger: #b03a2e;
    --color-warning: #8a6d00;
    --color-text: #1c1c1e;
    --color-text-muted: #555558;
    --color-border: #d4dae2;
    --color-bg-alt: #f4f8fc;
    --color-bg-warm: #fffdf8;
    --font-size-base: 1.125rem;
    --font-size-sm: 1rem;
    --font-size-lg: 1.25rem;
    --border-radius: 0.5rem;
    --border-radius-lg: 0.875rem;
    --touch-target-min: 44px;
  }
</style>
```

This makes Tailwind utility classes like `text-primary`, `bg-accent`, `text-success`, `border-danger` available in all files.

### 2. Vanilla JS Navbar Toggle (`js/navbar.js`)

A new shared module that replaces Bootstrap's collapsible navbar JS component.

**Interface:**
```javascript
// Initialises navbar toggle for the current page.
// Must be called after DOMContentLoaded.
function initNavbar() { ... }
```

**Behaviour:**
- Finds the hamburger button (`.navbar-toggler`) and the nav menu (`#mainNav`)
- Toggles a `hidden` class on `#mainNav` when the button is clicked
- Closes the menu when any `<a>` inside `#mainNav` is clicked
- Sets `aria-expanded` on the button to reflect open/closed state
- On `lg:` breakpoint (≥ 1024 px), the menu is always visible (handled via Tailwind responsive classes on the element itself: `hidden lg:flex`)

**HTML structure after migration (navbar):**
```html
<nav class="bg-white border-b-2 border-primary-light shadow-sm" role="navigation">
  <div class="container mx-auto px-4 flex items-center justify-between min-h-[44px]">
    <a class="flex items-center gap-2 font-bold text-primary-dark text-lg min-h-[44px]" href="index.html">
      <img src="img/logo.png" alt="Dheyafa Tourism Logo" class="h-[42px] w-auto rounded-md">
      <span data-i18n="agency_name">ضيافة للسياحة</span>
    </a>
    <button class="navbar-toggler lg:hidden min-h-[44px] min-w-[44px] ..." aria-expanded="false" aria-label="Toggle navigation">
      <!-- hamburger icon -->
    </button>
    <div id="mainNav" class="hidden lg:flex flex-col lg:flex-row ...">
      <ul class="flex flex-col lg:flex-row ...">...</ul>
      <div class="flex gap-2 items-center">...</div>
    </div>
  </div>
</nav>
```

### 3. Vanilla JS Modal (`js/modal.js`)

A new shared module that replaces `bootstrap.Modal`.

**Interface:**
```javascript
/**
 * Creates a vanilla JS modal controller that is API-compatible with
 * bootstrap.Modal, exposing show() and hide() methods and firing
 * the hidden.bs.modal event on close.
 *
 * @param {HTMLElement} element - The modal root element
 * @returns {{ show: Function, hide: Function }}
 */
function VanillaModal(element) { ... }
```

**Behaviour:**
- `show()`: removes `hidden` class from the modal element, sets `aria-hidden="false"`, traps focus within the modal, prevents body scroll
- `hide()`: adds `hidden` class, sets `aria-hidden="true"`, restores focus to the trigger element, dispatches `new CustomEvent("hidden.bs.modal")` on the element
- Escape key closes the modal
- Clicking the backdrop closes the modal
- Focus trap: Tab/Shift+Tab cycles through focusable elements within the modal

**Usage in existing code (unchanged):**
```javascript
// Before (Bootstrap):
var achievementModal = new bootstrap.Modal(achievementModalEl);
achievementModal.show();
achievementModal.hide();

// After (VanillaModal — same API):
var achievementModal = new VanillaModal(achievementModalEl);
achievementModal.show();
achievementModal.hide();
```

The `hidden.bs.modal` event dispatch ensures existing `addEventListener("hidden.bs.modal", ...)` listeners continue to work without modification.

**HTML structure after migration (modal):**
```html
<div id="achievement-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50"
     role="dialog" aria-modal="true" aria-labelledby="achievement-modal-title" aria-hidden="true">
  <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
    <div class="flex items-center justify-between p-4 border-b border-border">
      <h2 class="text-lg font-semibold text-primary-dark" id="achievement-modal-title">...</h2>
      <button type="button" class="modal-close-btn min-h-[44px] min-w-[44px] ..." aria-label="Close">×</button>
    </div>
    <div class="p-4">...</div>
    <div class="flex justify-end gap-2 p-4 border-t border-border">...</div>
  </div>
</div>
```

### 4. Vanilla JS Accordion (`admin/questions.html` inline)

Replaces Bootstrap's accordion JS component. Implemented as inline script in `admin/questions.html` only.

**Behaviour:**
- Each accordion item has a header button and a collapsible panel
- Clicking a header: expands that panel (removes `hidden`), collapses all other panels (adds `hidden`)
- When a panel is expanded, dispatches `new CustomEvent("show.bs.collapse", { bubbles: true })` on the collapse element — this preserves the existing `addEventListener("show.bs.collapse", ...)` mark-as-read listener
- The first panel is expanded by default on load

**HTML structure after migration (accordion item):**
```html
<div class="accordion-item border border-border rounded-lg mb-2">
  <h2>
    <button class="accordion-button w-full flex items-center justify-between p-4 font-semibold text-start
                   bg-primary-light text-primary-dark rounded-t-lg"
            type="button" aria-expanded="true" aria-controls="accordion-group-{key}">
      {groupLabel}
      {badges}
    </button>
  </h2>
  <div id="accordion-group-{key}" class="accordion-collapse">
    <div class="p-4">{cards}</div>
  </div>
</div>
```

### 5. Vanilla JS Toast (replaces `showToast` in `js/utils.js`)

`js/utils.js` must NOT be modified (Requirement 12.3). However, `showToast` currently uses `bootstrap.Toast` and Bootstrap classes. Since `utils.js` cannot be modified, the approach is:

**Solution**: After the Tailwind migration, `showToast` in `utils.js` still references `bootstrap.Toast`. Since Bootstrap JS is removed, this will fail. The resolution is to override `showToast` in a new `js/toast.js` file that is loaded after `utils.js` on all pages. This override replaces the function with a vanilla JS implementation using Tailwind classes.

Wait — Requirement 12.3 says "SHALL NOT modify `js/utils.js`". The override approach (redefining `showToast` after loading `utils.js`) is valid since it does not modify the file itself.

**`js/toast.js` interface:**
```javascript
// Overrides showToast from utils.js with a vanilla JS implementation.
// Must be loaded after utils.js on all pages.
function showToast(message, type) { ... }
```

The toast container uses `fixed top-0 end-0 p-3 z-[1100]` (Tailwind) and individual toasts use appropriate color classes.

### 6. Updated `css/custom.css`

The file is restructured to:

**Retained sections:**
- `:root` CSS custom properties (all design tokens — unchanged)
- `@keyframes heroZoom` animation
- `.hero-banner`, `.hero-banner-bg`, `.hero-banner-overlay`, `.hero-banner-content` (complex positioning)
- `.page-hero`, `.page-hero-bg`, `.page-hero-overlay`, `.page-hero-content`
- `.photo-strip` grid and `.photo-strip-item` (CSS Grid with `auto-fill`)
- `.skip-link` (absolute positioning, focus reveal)
- `@media (prefers-reduced-motion: reduce)` block
- RTL margin-flip utilities: `html[dir="rtl"] .ms-auto`, `.me-auto`, `.ms-2`, `.me-2`, `.ms-3`, `.me-3`
- `.rtl` and `.ltr` direction classes
- `.char-counter`, `.char-counter.near-limit`, `.char-counter.at-limit`
- Status badge classes: `.status-pending`, `.status-confirmed`, `.status-cancelled`, `.status-active`, `.status-archived`
- `.badge-fully-booked`
- `.navbar-logo` and `.footer-logo` (specific sizing)
- `.section-divider` (gradient bar)
- `.about-section` (border styling)
- `.site-footer` and footer sub-classes (complex gradient background)
- `.footer-contact-item`, `.footer-icon`, `.footer-divider`, `.footer-copy`
- `is-invalid` styling for form inputs (used by validation.js)
- Focus indicator: `:focus-visible` outline

**Removed sections:**
- All Bootstrap component overrides: `.btn-primary`, `.btn-outline-primary`, `.btn-outline-light`, `.btn-accent`, `.btn-success`, `.btn-danger`, `.btn-lang`, `.alert-*`, `.badge.bg-*`, `.navbar`, `.navbar-brand`, `.navbar-nav .nav-link`, `.navbar-toggler`, `.card`, `.card-*`, `.table`, `.table th/td`, `.form-control`, `.invalid-feedback`, `.valid-feedback`, `.toast`, `.toast-header`

### 7. Dynamic HTML String Updates

All inline `<script>` blocks that build HTML strings using Bootstrap classes must be updated. The key mappings are:

| Bootstrap class | Tailwind equivalent |
|---|---|
| `d-none` | `hidden` |
| `d-flex` | `flex` |
| `spinner-border text-primary` | Custom spinner markup with Tailwind |
| `badge bg-danger` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-danger text-white` |
| `badge bg-success` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-success text-white` |
| `badge bg-secondary` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-gray-500 text-white` |
| `badge bg-primary` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-primary text-white` |
| `badge bg-info text-dark` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-sky-400 text-gray-900` |
| `badge bg-warning` | `inline-block px-2 py-1 text-sm font-semibold rounded bg-warning text-white` |
| `btn btn-sm btn-outline-primary me-1` | `inline-flex items-center px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white min-h-[44px]` |
| `btn btn-sm btn-success me-1` | `inline-flex items-center px-3 py-1 text-sm bg-success text-white rounded hover:bg-green-700 min-h-[44px]` |
| `btn btn-sm btn-outline-danger` | `inline-flex items-center px-3 py-1 text-sm border border-danger text-danger rounded hover:bg-danger hover:text-white min-h-[44px]` |
| `btn btn-sm btn-outline-warning` | `inline-flex items-center px-3 py-1 text-sm border border-warning text-warning rounded hover:bg-warning hover:text-white min-h-[44px]` |
| `card h-100` | `bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full` |
| `card-body` | `p-4` |
| `card-title` | `text-xl font-bold text-primary-dark mb-2` |
| `card-text` | `text-base text-text-muted` |
| `card-footer` | `bg-bg-alt border-t border-border rounded-b-xl px-4 py-3` |
| `card-img-top` | `w-full object-cover rounded-t-xl` |
| `alert alert-danger` | `p-4 rounded bg-red-50 border border-red-200 text-danger text-base` |
| `alert alert-warning` | `p-4 rounded bg-yellow-50 border border-yellow-200 text-warning text-base` |
| `alert alert-success` | `p-4 rounded bg-green-50 border border-green-200 text-success text-base` |
| `accordion-item` | `border border-border rounded-lg mb-2` |
| `accordion-button` | `w-full flex items-center justify-between p-4 font-semibold text-start ...` |
| `accordion-collapse collapse show` | `accordion-collapse` (visible) |
| `accordion-collapse collapse` | `accordion-collapse hidden` |
| `accordion-body` | `p-4` |
| `table table-hover` | `w-full text-base text-text` |
| `table-responsive` | `overflow-x-auto` |
| `fw-bold` | `font-bold` |
| `text-muted` | `text-text-muted` |
| `border-primary` | `border-primary` |
| `border-top pt-2` | `border-t border-border pt-2` |
| `mt-1` | `mt-1` |
| `mt-2` | `mt-2` |
| `ms-2` | `ms-2` (kept in custom.css RTL utilities) |
| `me-1` | `me-1` (kept in custom.css RTL utilities) |
| `visually-hidden` | `sr-only` |

---

## Data Models

This migration does not change any data models. Firebase Realtime Database schemas for `/voyages`, `/registrations`, `/questions`, and `/achievements` remain identical. The `js/validation.js` validation functions and their return types are unchanged.

The only "data" change is the mapping of Bootstrap class names to Tailwind class names in HTML attributes and JS string templates, as documented in the Components section above.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is a CSS/HTML migration. The core logic under test is structural: the presence or absence of specific class names and attributes across files. Property-based testing is applicable for the universal structural properties (e.g., "for any HTML file in the project, no Bootstrap class names should appear"), while specific behavioral properties (modal API, accordion events) are better tested as examples.

### Property 1: No Bootstrap class names in any HTML file

*For any* HTML file in the project, scanning its content for Bootstrap-specific class name patterns (e.g., `navbar`, `navbar-expand-lg`, `collapse`, `navbar-collapse`, `container`, `row`, `col-`, `btn-primary`, `btn-outline`, `card-body`, `d-none`, `d-flex`, `alert-`, `badge bg-`, `spinner-border`, `modal fade`, `accordion-`, `table-hover`, `form-control`, `form-select`, `form-label`, `invalid-feedback`, `mb-`, `py-`, `px-`, `g-`, `fw-bold`, `display-`, `visually-hidden`, `w-100`, `h-100`, `ms-`, `me-`, `mt-`) should return zero matches in class attribute values.

**Validates: Requirements 1.3, 1.4**

### Property 2: No Bootstrap d-none/classList calls in any file

*For any* file in the project (HTML or JS), the strings `classList.add("d-none")`, `classList.remove("d-none")`, `classList.contains("d-none")`, and `class="d-none"` should not appear.

**Validates: Requirements 9.1**

### Property 3: No Bootstrap class names in JS string templates

*For any* inline `<script>` block in any HTML file, scanning for Bootstrap class name patterns within string literals should return zero matches.

**Validates: Requirements 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10**

### Property 4: All interactive elements meet minimum touch target size

*For any* button, anchor, or input element in any HTML file, the element should have Tailwind classes or Custom_CSS rules that result in a computed `min-height` and `min-width` of at least 44px.

**Validates: Requirements 10.3**

### Property 5: All form inputs have associated labels

*For any* `<input>`, `<select>`, or `<textarea>` element with an `id` attribute in any HTML file, there should exist a `<label>` element with a `for` attribute matching that `id`.

**Validates: Requirements 10.7**

### Property 6: All aria-* and role attributes are preserved

*For any* element that had `aria-*` or `role` attributes in the original HTML, the migrated HTML should contain an element with the same `id` (or structural position) and the same `aria-*`/`role` attributes.

**Validates: Requirements 10.2**

### Property 7: Navbar toggle is present in all HTML files

*For any* HTML file in the project, the file should contain a hamburger button element with a `navbar-toggler` class (or equivalent selector used by `js/navbar.js`) and the `#mainNav` element.

**Validates: Requirements 6.5**

---

## Error Handling

### Bootstrap JS Removal — Toast Fallback

`js/utils.js` cannot be modified, but it references `bootstrap.Toast`. After Bootstrap JS is removed, calling `showToast()` from `utils.js` would throw a `ReferenceError`. The `js/toast.js` override (loaded after `utils.js`) redefines `showToast` as a global function using vanilla JS and Tailwind classes. This ensures all existing `showToast(message, type)` calls continue to work.

### Modal Close on Backdrop Click

The `VanillaModal` implementation attaches a click listener to the modal root element. Clicks on the backdrop (the root element itself, not its children) trigger `hide()`. This is detected by checking `event.target === modalElement`.

### Accordion First-Panel Auto-Open

On `loadQuestions()`, after rendering the accordion HTML, the first panel is expanded by default. The vanilla JS accordion initialisation must run after the accordion HTML is inserted into the DOM (i.e., after `accordionEl.insertAdjacentHTML` calls complete).

### Focus Trap Edge Cases

The `VanillaModal` focus trap handles:
- Modals with no focusable elements (focus stays on the modal root)
- Tab on the last focusable element wraps to the first
- Shift+Tab on the first focusable element wraps to the last

### RTL Direction on Page Load

`js/i18n.js` sets `document.documentElement.dir` immediately on script execution (before `DOMContentLoaded`). Tailwind's `rtl:` variant responds to the `dir` attribute on `<html>`, so RTL utilities apply correctly as soon as the DOM is rendered.

### `is-invalid` Styling Without Bootstrap

`js/validation.js` applies `is-invalid` to form inputs. Bootstrap's `.form-control.is-invalid` rule provided the red border. After removing Bootstrap, `css/custom.css` retains the `.form-control.is-invalid` rule (or a new `.is-invalid` rule targeting inputs) to preserve this behaviour. Since form inputs are now styled with Tailwind utilities, the `is-invalid` rule in `custom.css` must target the input directly:

```css
input.is-invalid,
select.is-invalid,
textarea.is-invalid {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(176, 58, 46, 0.12);
}
```

---

## Testing Strategy

### Overview

This migration is a structural transformation of HTML and CSS. The primary testing approach is:

1. **Structural tests** — verify Bootstrap artifacts are absent and Tailwind artifacts are present
2. **Behavioural unit tests** — verify vanilla JS components (navbar, modal, accordion) work correctly
3. **Visual smoke tests** — manual verification that pages render correctly in a browser

Property-based testing is applicable for the universal structural properties (Properties 1–7 above), where the "input" is each file in the project and the "property" is the absence of Bootstrap artifacts or presence of required attributes.

### Unit Tests

**Vanilla JS Modal (`js/modal.js`):**
- `show()` removes `hidden` class and sets `aria-hidden="false"`
- `hide()` adds `hidden` class, sets `aria-hidden="true"`, and dispatches `hidden.bs.modal` event
- Escape key triggers `hide()`
- Backdrop click triggers `hide()`
- Focus is trapped within the modal while open
- `show()` and `hide()` are callable methods on the returned object

**Vanilla JS Navbar (`js/navbar.js`):**
- Clicking the hamburger button toggles `hidden` on `#mainNav`
- Clicking a nav link while menu is open closes the menu
- `aria-expanded` is updated correctly on toggle

**Vanilla JS Accordion (inline in `admin/questions.html`):**
- Clicking a header expands that panel and collapses all others
- `show.bs.collapse` event is fired on the expanded panel's collapse element
- First panel is expanded on initial render

**`showToast` override (`js/toast.js`):**
- Creates a toast container if one does not exist
- Appends a toast element with the correct message and type
- Toast auto-dismisses after 5 seconds

### Property-Based Tests

Since this is a static HTML/CSS project with no test runner configured, property tests are implemented as Node.js scripts that parse HTML files using a DOM parser (e.g., `jsdom` or simple regex) and assert the structural properties.

**Property Test 1: No Bootstrap class names in HTML files**
- Input generator: iterate over all 12 HTML files
- Property: for each file, no class attribute value matches any Bootstrap class pattern
- Minimum iterations: 12 (one per file)
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 1: No Bootstrap class names in any HTML file`

**Property Test 2: No d-none references in any file**
- Input generator: iterate over all HTML and JS files
- Property: for each file, no occurrence of `d-none` string
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 2: No Bootstrap d-none/classList calls in any file`

**Property Test 3: No Bootstrap classes in JS string templates**
- Input generator: iterate over all HTML files, extract inline script content
- Property: for each script block, no Bootstrap class name patterns in string literals
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 3: No Bootstrap class names in JS string templates`

**Property Test 4: Touch target sizes**
- Input generator: iterate over all HTML files, extract button/anchor/input elements
- Property: each element has `min-h-[44px]` or equivalent Tailwind class, or is covered by Custom_CSS rule
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 4: All interactive elements meet minimum touch target size`

**Property Test 5: Form input label association**
- Input generator: iterate over all HTML files, extract input/select/textarea elements with id
- Property: for each input id, a matching label[for] exists in the same file
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 5: All form inputs have associated labels`

**Property Test 6: ARIA attribute preservation**
- Input generator: compare original and migrated HTML files element by element
- Property: for each element with aria-* or role in original, migrated version has same attributes
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 6: All aria-* and role attributes are preserved`

**Property Test 7: Navbar toggle presence**
- Input generator: iterate over all 12 HTML files
- Property: each file contains a `.navbar-toggler` button and `#mainNav` element
- Tag: `Feature: bootstrap-to-tailwind-migration, Property 7: Navbar toggle is present in all HTML files`

### Integration / Smoke Tests

- Load each of the 12 HTML pages in a browser and verify visual rendering
- Test language switching (AR ↔ FR) on each page
- Test mobile hamburger menu on a narrow viewport
- Test modal open/close on `admin/achievements.html` and `admin/voyages.html`
- Test accordion expand/collapse on `admin/questions.html`
- Test form submission and validation error display on `contact.html` and `voyage-detail.html`
- Test admin login flow on `admin/login.html`
- Verify Firebase data loads correctly on `index.html`, `voyages.html`, `omra.html`
