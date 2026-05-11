# AGENTS.md

## Repo Shape (What Matters)
- Static site (no build system, no package manager files, no test runner config in repo root).
- 12 HTML entrypoints: public pages at root (`index.html`, `voyages.html`, `omra.html`, `voyage-detail.html`, `contact.html`, `404.html`) and admin pages under `admin/`.
- Shared runtime code is plain browser JS in `js/` and shared styles in `css/custom.css`.

## Runtime Stack and Hard Constraints
- UI uses Tailwind via Play CDN (`@tailwindcss/browser@4`) embedded in each HTML file; there is no Tailwind build step.
- Firebase uses SDK v9 compat CDN scripts and global `firebase` APIs.
- `js/firebase-init.js` must load before scripts that access Firebase.
- On admin pages (except `admin/login.html`), `js/auth-guard.js` must be loaded immediately after `js/firebase-init.js`.
- `js/toast.js` intentionally overrides `showToast` from `js/utils.js`, so keep `utils.js` before `toast.js`.

## Script Wiring Conventions
- Public pages use collapsible nav: include `js/navbar.js` and call `initNavbar()` on `DOMContentLoaded`.
- Admin pages use auth-gated body reveal (`<body style="display:none">`) and rely on `auth-guard.js` to unhide after auth.
- `admin/login.html` must NOT include `js/auth-guard.js` (it performs its own auth redirect/login flow).
- Modal behavior in admin CRUD pages depends on `js/modal.js` (`VanillaModal`) and compatibility event `hidden.bs.modal`.

## i18n / Directionality
- Bilingual Arabic/French is centralized in `js/i18n.js` via `data-i18n` and `data-i18n-placeholder`.
- Language switching updates `document.documentElement.lang` and `dir`; do not hardcode one direction in shared components.
- Preserve `dir="ltr"` on phone/email fields where already used.

## Styling / Accessibility Rules Already Enforced in Code
- `css/custom.css` carries design tokens, non-utility component styles, RTL helpers, status badges, and accessibility behavior.
- Keep minimum touch target assumptions (44px) and skip-link behavior intact.
- Runtime visibility is Tailwind-style `hidden` (not legacy Bootstrap `d-none`).
- Validation flow expects `.is-invalid` styling from `css/custom.css`.

## Safe Verification for Changes
- No canonical CI commands are defined in this repo. Validate by opening affected HTML pages in a browser (or local static server) and exercising flows manually.
- For Firebase-backed flows, verify against expected RTDB paths used by pages: `voyages`, `registrations`, `questions`, `achievements`.

## Known Risk to Avoid
- `js/utils.js` still contains legacy Bootstrap toast implementation text; do not “fix” by removing it unless you keep `js/toast.js` override behavior and script order intact.
