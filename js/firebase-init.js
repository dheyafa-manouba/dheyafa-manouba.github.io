/**
 * js/firebase-init.js
 *
 * Module: Firebase Initialisation
 * Responsibility: Initialise the Firebase app with the project config and expose
 *   `db`   (firebase.database() — Firebase Realtime Database reference)
 *   `auth` (firebase.auth()     — Firebase Authentication instance)
 * as global variables for use by all other scripts.
 *
 * Must be loaded BEFORE all other scripts on every page.
 * Uses Firebase JS SDK v9 compat mode (loaded via CDN).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠️  BEFORE DEPLOYING — FILL IN YOUR FIREBASE CONFIG VALUES BELOW  ⚠️  ║
 * ║                                                                          ║
 * ║  1. Go to https://console.firebase.google.com                           ║
 * ║  2. Open your project → Project Settings → General → Your apps          ║
 * ║  3. Copy the firebaseConfig object and replace the three placeholder     ║
 * ║     values marked with TODO below:                                       ║
 * ║       • apiKey             → YOUR_API_KEY                                ║
 * ║       • messagingSenderId  → YOUR_MESSAGING_SENDER_ID                   ║
 * ║       • appId              → YOUR_APP_ID                                 ║
 * ║                                                                          ║
 * ║  The site will NOT connect to Firebase until these are filled in.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Implementation: Task 2
 * Requirements: 11.2
 */

const firebaseConfig = {
  apiKey: "AIzaSyBnbOZaBrRb1f8OyI9hFoZmejKJiYSQPFw",
  authDomain: "dheyafa-e858b.firebaseapp.com",
  databaseURL: "https://dheyafa-e858b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dheyafa-e858b",
  storageBucket: "dheyafa-e858b.firebasestorage.app",
  messagingSenderId: "951344150564",
  appId: "1:951344150564:web:1b948741a16631398340b1",
  measurementId: "G-VN9PRCW56B"
};

firebase.initializeApp(firebaseConfig);

// Global database and auth references used by all other scripts
const db   = firebase.database();
const auth = firebase.auth();
