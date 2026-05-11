# Requirements Document

## Introduction

This document defines the requirements for the **Dheyafa Tourism – Branch Manouba Oued Ellil** website. The website is a static, client-facing web application hosted on GitHub Pages, backed by Firebase Realtime Database (RTDB). It serves two audiences: **visitors/clients** who browse travel packages and register for voyages, and **administrators** who manage voyages, registrations, and client inquiries. The UI must be professional, accessible, and optimised for elderly users (large text, clear navigation, simple interactions).

**Technical Notes:**
- Firebase RTDB endpoint: `https://dheyafa-e858b-default-rtdb.europe-west1.firebasedatabase.app/`
- Admin authentication: Firebase Authentication (email/password)
- Supported languages: Arabic (primary) and French (secondary), with a language toggle on all public-facing pages

---

## Glossary

- **Website**: The complete static web application deployed on GitHub Pages.
- **Visitor**: An unauthenticated user browsing the public-facing pages.
- **Client**: A Visitor who submits a registration or question.
- **Admin**: An authenticated user with access to the administration panel.
- **Voyage**: A travel package (trip or Omra) offered by the agency, containing destination, dates, price, capacity, and description.
- **Omra_Package**: A specialised Voyage representing an Omra pilgrimage offering.
- **Registration**: A Client's submission expressing intent to join a specific Voyage, containing personal details.
- **Question**: A message submitted by a Client directed at the Admin, optionally linked to a specific Voyage.
- **Achievement**: A published record of a past trip, testimonial, or milestone that demonstrates the agency's track record.
- **Firebase_RTDB**: Firebase Realtime Database, the cloud-hosted NoSQL database used as the backend.
- **Admin_Panel**: The password-protected section of the Website accessible only to the Admin.
- **Registration_Status**: The lifecycle state of a Registration: `pending`, `confirmed`, or `cancelled`.
- **Capacity**: The maximum number of confirmed Registrations allowed for a Voyage.

---

## Requirements

### Requirement 1: Public Homepage and Agency Presentation

**User Story:** As a Visitor, I want to see the agency's identity, achievements, and key information on the homepage, so that I can trust the agency and understand what it offers.

#### Acceptance Criteria

1. THE Website SHALL display the agency logo (`img/logo.png`), the short brand name "Dheyafa Tourism", and contact information on every page in a persistent header.
2. THE Website SHALL display an Achievements section on the homepage listing past trips, milestones, and client testimonials managed by the Admin.
3. WHEN a Visitor loads the homepage, THE Website SHALL render all content within 3 seconds on a standard broadband connection.
4. THE Website SHALL use a minimum body font size of 18px and a minimum heading font size of 24px throughout all public-facing pages to support elderly Clients.
5. THE Website SHALL provide a navigation menu with clearly labelled links to: Home, Voyages, Omra Packages, and Contact.
6. WHEN a Visitor accesses the Website on a mobile device, THE Website SHALL render a responsive layout that remains fully usable on screens 320px wide and above.

---

### Requirement 2: Voyage and Omra Package Listing

**User Story:** As a Visitor, I want to browse available Voyages and Omra Packages with clear details, so that I can choose the trip that suits me.

#### Acceptance Criteria

1. THE Website SHALL display a Voyages page listing all active Voyages retrieved from Firebase_RTDB, each showing: destination, departure date, return date, price, and available seats.
2. THE Website SHALL display an Omra Packages page listing all active Omra_Packages retrieved from Firebase_RTDB, each showing: package name, departure date, duration in days, price, and available seats.
3. WHEN a Visitor selects a Voyage or Omra_Package, THE Website SHALL display a detail view containing the full description, itinerary, included services, and a Register button.
4. WHEN the available seats for a Voyage reach zero, THE Website SHALL display a "Fully Booked" indicator and disable the Register button for that Voyage.
5. WHEN Firebase_RTDB is unreachable, THE Website SHALL display a user-friendly error message instructing the Visitor to try again later.
6. THE Website SHALL sort Voyages and Omra_Packages by departure date in ascending order by default.

---

### Requirement 3: Client Registration for a Voyage

**User Story:** As a Client, I want to register my interest in a Voyage or Omra Package, so that the agency can contact me and confirm my booking.

#### Acceptance Criteria

1. WHEN a Client submits the registration form, THE Website SHALL collect and store in Firebase_RTDB: full name, phone number, email address, passport number, number of seats requested, and the identifier of the selected Voyage.
2. WHEN a Client submits the registration form with missing required fields (full name, phone number, email address, passport number, seats requested, Voyage identifier), THE Website SHALL display an inline validation error for each missing field and prevent submission.
3. WHEN a Client requests more seats than the current available seats for a Voyage, THE Website SHALL display an error message stating the number of available seats and prevent submission.
4. WHEN a registration is successfully saved to Firebase_RTDB, THE Website SHALL display a confirmation message to the Client containing the Voyage name and a summary of the submitted details.
5. THE Website SHALL assign a Registration_Status of `pending` to every new Registration at the time of creation.
6. WHEN a Client submits a registration form, THE Website SHALL complete the Firebase_RTDB write operation and display the confirmation message within 5 seconds under normal network conditions.

---

### Requirement 4: Client Question Submission

**User Story:** As a Client, I want to send a question to the agency, so that I can get information before deciding to register.

#### Acceptance Criteria

1. WHEN a Client submits the contact form, THE Website SHALL collect and store in Firebase_RTDB: sender name, phone number, message text, and optionally the identifier of a related Voyage.
2. WHEN a Client submits the contact form with a missing sender name, phone number, or message text, THE Website SHALL display an inline validation error for each missing field and prevent submission.
3. WHEN a Question is successfully saved to Firebase_RTDB, THE Website SHALL display a confirmation message acknowledging receipt and informing the Client that the agency will respond by phone.
4. THE Website SHALL limit the message text field to 1000 characters and display a live character counter to the Client.

---

### Requirement 5: Admin Authentication

**User Story:** As an Admin, I want to log in securely, so that only authorised personnel can access the administration panel.

#### Acceptance Criteria

1. THE Admin_Panel SHALL be accessible only after successful authentication via Firebase Authentication using email and password credentials.
2. WHEN an Admin submits incorrect credentials, THE Website SHALL display an error message and prevent access to the Admin_Panel.
3. WHEN an Admin successfully authenticates, THE Website SHALL redirect the Admin to the Admin_Panel dashboard.
4. WHEN an Admin session is inactive for 60 minutes, THE Website SHALL invalidate the session and redirect the Admin to the login page.
5. THE Website SHALL manage Admin credentials exclusively through Firebase Authentication; credentials SHALL NOT be stored in plain text in client-side code or Firebase_RTDB.
6. WHEN an unauthenticated user attempts to access any Admin_Panel URL directly, THE Website SHALL redirect the user to the login page.

---

### Requirement 6: Admin – Voyage Management

**User Story:** As an Admin, I want to create, update, and remove Voyages and Omra Packages, so that the public listing always reflects current offerings.

#### Acceptance Criteria

1. WHEN an Admin creates a new Voyage, THE Admin_Panel SHALL write the Voyage record to Firebase_RTDB with: destination, departure date, return date, price, capacity, description, itinerary, included services, and a status of `active`.
2. WHEN an Admin updates an existing Voyage, THE Admin_Panel SHALL overwrite the corresponding Firebase_RTDB record and reflect the changes on the public Voyages page within one page reload.
3. WHEN an Admin deletes a Voyage, THE Admin_Panel SHALL set the Voyage status to `archived` in Firebase_RTDB and remove it from the public listing without deleting historical Registration records linked to that Voyage.
4. WHEN an Admin submits a Voyage form with missing required fields (destination, departure date, return date, price, or capacity), THE Admin_Panel SHALL display an inline validation error for each missing field and prevent submission.
5. THE Admin_Panel SHALL display a list of all Voyages (active and archived) with their current Registration count and available seats.

---

### Requirement 7: Admin – Registration Management

**User Story:** As an Admin, I want to view and manage client registrations for each Voyage, so that I can confirm bookings and track capacity.

#### Acceptance Criteria

1. WHEN an Admin selects a Voyage in the Admin_Panel, THE Admin_Panel SHALL display all Registrations linked to that Voyage, showing: client name, phone number, email address, passport number, seats requested, Registration_Status, and submission timestamp.
2. WHEN an Admin changes a Registration_Status to `confirmed`, THE Admin_Panel SHALL update the record in Firebase_RTDB and decrement the available seats for the associated Voyage by the number of seats requested.
3. WHEN an Admin changes a Registration_Status to `cancelled`, THE Admin_Panel SHALL update the record in Firebase_RTDB and restore the available seats for the associated Voyage by the number of seats that were requested.
4. THE Admin_Panel SHALL prevent confirming a Registration if doing so would cause the total confirmed seats for the Voyage to exceed the Voyage Capacity.
5. WHERE the CSV export feature is enabled, THE Admin_Panel SHALL allow the Admin to export the Registration list for a selected Voyage as a CSV file containing all fields listed in criterion 1, encoded with UTF-8 BOM to ensure compatibility with Microsoft Excel.

---

### Requirement 8: Admin – Question Management

**User Story:** As an Admin, I want to view all submitted questions grouped by Voyage, so that I can respond to clients efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display all Questions retrieved from Firebase_RTDB, grouped by the associated Voyage (or listed under "General" if no Voyage is linked).
2. WHEN an Admin views a Question, THE Admin_Panel SHALL display: sender name, phone number, message text, associated Voyage name (if any), and submission timestamp.
3. THE Admin_Panel SHALL display the count of unread Questions on the Admin_Panel dashboard as a numeric badge.
4. WHEN an Admin opens a Question for the first time, THE Admin_Panel SHALL mark it as read in Firebase_RTDB and decrement the unread count badge.

---

### Requirement 9: Admin – Achievement Management

**User Story:** As an Admin, I want to publish and update agency achievements, so that the homepage always showcases accurate and current accomplishments.

#### Acceptance Criteria

1. WHEN an Admin creates an Achievement, THE Admin_Panel SHALL write the record to Firebase_RTDB with: title, description, date, and an optional image URL.
2. WHEN an Admin updates an Achievement, THE Admin_Panel SHALL overwrite the corresponding Firebase_RTDB record and reflect the change on the public homepage within one page reload.
3. WHEN an Admin deletes an Achievement, THE Admin_Panel SHALL remove the record from Firebase_RTDB and remove it from the public homepage within one page reload.

---

### Requirement 10: Accessibility and Usability for Elderly Clients

**User Story:** As an elderly Client, I want the website to be easy to read and navigate, so that I can use it independently without assistance.

#### Acceptance Criteria

1. THE Website SHALL maintain a colour contrast ratio of at least 4.5:1 between text and background on all public-facing pages, in compliance with WCAG 2.1 Level AA.
2. THE Website SHALL use interactive elements (buttons, links, form fields) with a minimum touch/click target size of 44×44 pixels.
3. THE Website SHALL provide descriptive placeholder text and visible labels for all form fields.
4. THE Website SHALL display all error and confirmation messages in a prominent, clearly visible location adjacent to the relevant form, using a font size of at least 16px.
5. THE Website SHALL avoid auto-playing media, flashing animations, or timed content that disappears without user interaction.
6. THE Website SHALL provide a language toggle on all public-facing pages allowing the Visitor to switch between Arabic and French; all visible text, labels, and messages SHALL update to the selected language without a full page reload.
7. THE Website SHALL default to Arabic as the display language on first load.

---

### Requirement 11: Static Hosting Compatibility

**User Story:** As a developer, I want the website to run entirely as a static application on GitHub Pages, so that no server-side runtime is required.

#### Acceptance Criteria

1. THE Website SHALL consist exclusively of HTML, CSS, and JavaScript/jQuery files with no server-side runtime dependencies.
2. THE Website SHALL load all Firebase_RTDB interactions through the Firebase JavaScript SDK via CDN, without requiring a build step.
3. THE Website SHALL function correctly when served from a GitHub Pages URL (e.g., `https://<username>.github.io/<repository>/`), including correct relative path resolution for all assets and navigation links.
4. IF a requested page URL is not found on GitHub Pages, THEN THE Website SHALL redirect the Visitor to the homepage using a `404.html` fallback page.

---

### Requirement 12: Website Visual Redesign

**User Story:** As a Visitor, I want the website to have a modern, lighter visual design with the agency logo and accurate contact information, so that the site feels professional and trustworthy.

#### Acceptance Criteria

1. THE Website SHALL display the agency logo image (`img/logo.png`) in the navbar on all public-facing pages.
2. THE Navbar SHALL display the short brand name "Dheyafa Tourism" instead of the full branch name.
3. THE Website SHALL apply a lighter colour palette using softer tones while maintaining WCAG 2.1 AA contrast ratios (≥ 4.5:1).
4. THE Footer SHALL display the agency phone number (+216 53 244 968), email address (ltrabelsi26@gmail.com), and a Facebook link (https://www.facebook.com/dheyafa.ouedellil) in addition to the agency name.
5. THE Navbar SHALL use an improved visual design with the logo, brand name, and navigation links clearly separated and visually balanced.
6. THE Footer SHALL use an improved multi-column layout presenting contact details and social links in a structured, readable format.
