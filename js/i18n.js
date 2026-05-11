/**
 * js/i18n.js
 *
 * Module: Internationalisation (i18n) — Bilingual Translation
 * Responsibility:
 *   - Defines the `translations` object with `ar` (Arabic) and `fr` (French) keys
 *     covering all UI strings: navigation, buttons, form labels/placeholders,
 *     error messages, confirmation messages, status labels, and admin panel labels.
 *   - Exports `t(key)` helper: reads localStorage "lang" (default "ar") and returns
 *     the translation string for the given key.
 *   - Exports `setLanguage(lang)`: persists lang to localStorage, updates
 *     document.documentElement.lang and dir (rtl for ar, ltr for fr), and updates
 *     all [data-i18n] text content and [data-i18n-placeholder] placeholder attributes.
 *   - On every page load, calls setLanguage(localStorage.getItem("lang") || "ar").
 *
 * Implementation: Task 3
 * Requirements: 10.6, 10.7
 */

const translations = {
  ar: {
    // ── Navigation ──────────────────────────────────────────────────────────
    nav_home: "الرئيسية",
    nav_voyages: "الرحلات",
    nav_omra: "عمرة",
    nav_contact: "اتصل بنا",

    // ── Buttons ──────────────────────────────────────────────────────────────
    btn_register: "سجّل الآن",
    btn_fully_booked: "محجوز بالكامل",
    btn_view_details: "عرض التفاصيل",
    btn_sign_in: "تسجيل الدخول",
    btn_sign_out: "تسجيل الخروج",
    btn_save: "حفظ",
    btn_cancel: "إلغاء",
    btn_edit: "تعديل",
    btn_archive: "أرشفة",
    btn_delete: "حذف",
    btn_confirm: "تأكيد",
    btn_export_csv: "تصدير CSV",
    btn_add_voyage: "إضافة رحلة",
    btn_add_achievement: "إضافة إنجاز",
    btn_close: "إغلاق",
    btn_submit: "إرسال",

    // ── Form field labels ────────────────────────────────────────────────────
    form_full_name: "الاسم الكامل",
    form_phone: "رقم الهاتف",
    form_email: "البريد الإلكتروني",
    form_passport: "رقم جواز السفر",
    form_seats_requested: "عدد المقاعد المطلوبة",
    form_sender_name: "اسم المرسل",
    form_message: "الرسالة",
    form_voyage_select: "اختر الرحلة",
    form_voyage_optional: "-- اختياري --",
    form_destination: "الوجهة",
    form_type: "النوع",
    form_departure_date: "تاريخ المغادرة",
    form_return_date: "تاريخ العودة",
    form_duration_days: "المدة (بالأيام)",
    form_price: "السعر",
    form_capacity: "الطاقة الاستيعابية",
    form_description: "الوصف",
    form_itinerary: "البرنامج التفصيلي",
    form_included_services: "الخدمات المشمولة",
    form_title: "العنوان",
    form_date: "التاريخ",
    form_image_url: "رابط الصورة",
    form_password: "كلمة المرور",
    form_email_label: "البريد الإلكتروني",

    // ── Form placeholders ────────────────────────────────────────────────────
    ph_full_name: "أدخل اسمك الكامل",
    ph_phone: "أدخل رقم هاتفك",
    ph_email: "أدخل بريدك الإلكتروني",
    ph_passport: "أدخل رقم جواز سفرك",
    ph_seats: "عدد المقاعد",
    ph_sender_name: "أدخل اسمك",
    ph_message: "اكتب رسالتك هنا...",
    ph_destination: "مثال: إسطنبول، تركيا",
    ph_price: "السعر بالدينار التونسي",
    ph_capacity: "العدد الأقصى للمسافرين",
    ph_title: "عنوان الإنجاز",
    ph_description: "وصف مختصر",
    ph_image_url: "https://... (رابط الصورة)",
    ph_password: "أدخل كلمة المرور",

    // ── Error messages ───────────────────────────────────────────────────────
    err_required_full_name: "الاسم الكامل مطلوب",
    err_required_phone: "رقم الهاتف مطلوب",
    err_required_email: "البريد الإلكتروني مطلوب",
    err_required_passport: "رقم جواز السفر مطلوب",
    err_required_seats: "عدد المقاعد مطلوب",
    err_required_sender_name: "اسم المرسل مطلوب",
    err_required_message: "الرسالة مطلوبة",
    err_required_destination: "الوجهة مطلوبة",
    err_required_departure_date: "تاريخ المغادرة مطلوب",
    err_required_return_date: "تاريخ العودة مطلوب",
    err_required_price: "السعر مطلوب",
    err_required_capacity: "الطاقة الاستيعابية مطلوبة",
    err_required_voyage: "يرجى اختيار الرحلة",
    err_invalid_email: "البريد الإلكتروني غير صالح",
    err_invalid_phone: "رقم الهاتف غير صالح",
    err_message_too_long: "يجب ألا تتجاوز الرسالة 1000 حرف",
    err_not_enough_seats: "عدد المقاعد المتاحة غير كافٍ",
    err_firebase_unreachable: "تعذّر الاتصال بالخادم، يرجى المحاولة لاحقاً",
    err_login_wrong_password: "كلمة المرور غير صحيحة",
    err_login_user_not_found: "الحساب غير موجود",
    err_login_too_many_requests: "محاولات كثيرة جداً، يرجى الانتظار",
    err_login_generic: "حدث خطأ أثناء تسجيل الدخول",
    err_voyage_not_found: "الرحلة غير موجودة",

    // ── Confirmation messages ────────────────────────────────────────────────
    confirm_registration_success: "تم تسجيلك بنجاح، سنتواصل معك قريباً",
    confirm_question_success: "تم إرسال رسالتك بنجاح، سنردّ عليك عبر الهاتف",
    confirm_voyage_saved: "تم حفظ الرحلة بنجاح",
    confirm_achievement_saved: "تم حفظ الإنجاز بنجاح",
    confirm_archived: "تم الأرشفة بنجاح",
    confirm_deleted: "تم الحذف بنجاح",
    confirm_status_confirmed: "تم تأكيد التسجيل بنجاح",
    confirm_status_cancelled: "تم إلغاء التسجيل",
    confirm_marked_read: "تم تحديد السؤال كمقروء",

    // ── Status labels ────────────────────────────────────────────────────────
    status_pending: "قيد الانتظار",
    status_confirmed: "مؤكّد",
    status_cancelled: "ملغى",
    status_active: "نشط",
    status_archived: "مؤرشف",

    // ── Admin panel labels ───────────────────────────────────────────────────
    admin_dashboard: "لوحة التحكم",
    admin_voyages: "الرحلات",
    admin_registrations: "التسجيلات",
    admin_questions: "الأسئلة",
    admin_achievements: "الإنجازات",
    admin_logout: "تسجيل الخروج",
    admin_unread_questions: "أسئلة غير مقروءة",
    admin_total_voyages: "إجمالي الرحلات",
    admin_pending_registrations: "تسجيلات قيد الانتظار",
    admin_filter_by_voyage: "تصفية حسب الرحلة",
    admin_all_voyages: "جميع الرحلات",
    admin_general_questions: "أسئلة عامة",
    admin_no_questions: "لا توجد أسئلة",
    admin_no_voyages: "لا توجد رحلات",
    admin_no_registrations: "لا توجد تسجيلات",
    admin_no_achievements: "لا توجد إنجازات",
    admin_questions_title: "الأسئلة",
    admin_unread_badge: "غير مقروء",
    admin_question_from: "من",
    admin_question_phone: "الهاتف",
    admin_question_voyage: "الرحلة",
    admin_question_date: "التاريخ",
    admin_question_message: "الرسالة",
    admin_question_general: "عام",
    admin_question_count: "سؤال",
    btn_mark_read: "تحديد كمقروء",

    // ── Table column headers ─────────────────────────────────────────────────
    col_status: "الحالة",
    col_actions: "الإجراءات",
    col_registrations: "التسجيلات",
    col_created_at: "تاريخ الإنشاء",

    // ── Miscellaneous ────────────────────────────────────────────────────────
    agency_name: "ضيافة للسياحة",
    available_seats: "مقاعد متاحة",
    fully_booked: "محجوز بالكامل",
    seats_unit: "مقعد",
    days_unit: "يوم",
    price_unit: "د.ت",
    char_count_label: "حرف متبقٍّ",
    loading: "جارٍ التحميل...",
    page_not_found: "الصفحة غير موجودة",
    go_home: "العودة إلى الرئيسية",
    achievements_title: "إنجازاتنا",
    voyages_title: "رحلاتنا",
    omra_title: "باقات العمرة",
    contact_title: "اتصل بنا",
    login_title: "تسجيل دخول المشرف",
    hero_subtitle: "رحلات مميزة بأسعار تنافسية من منوبة وادي الليل",

    // ── Footer contact ───────────────────────────────────────────────────────
    footer_agency_full_name: "ضيافة للسياحة – فرع منوبة وادي الليل",
    footer_phone_label: "هاتف",
    footer_email_label: "البريد الإلكتروني",
    footer_facebook_label: "فيسبوك",
    footer_follow_us: "تابعنا",
    footer_contact_us: "تواصل معنا",
    footer_copy: "جميع الحقوق محفوظة"
  },

  fr: {
    // ── Navigation ──────────────────────────────────────────────────────────
    nav_home: "Accueil",
    nav_voyages: "Voyages",
    nav_omra: "Omra",
    nav_contact: "Contact",

    // ── Buttons ──────────────────────────────────────────────────────────────
    btn_register: "S'inscrire",
    btn_fully_booked: "Complet",
    btn_view_details: "Voir les détails",
    btn_sign_in: "Se connecter",
    btn_sign_out: "Se déconnecter",
    btn_save: "Enregistrer",
    btn_cancel: "Annuler",
    btn_edit: "Modifier",
    btn_archive: "Archiver",
    btn_delete: "Supprimer",
    btn_confirm: "Confirmer",
    btn_export_csv: "Exporter CSV",
    btn_add_voyage: "Ajouter un voyage",
    btn_add_achievement: "Ajouter une réalisation",
    btn_close: "Fermer",
    btn_submit: "Envoyer",

    // ── Form field labels ────────────────────────────────────────────────────
    form_full_name: "Nom complet",
    form_phone: "Numéro de téléphone",
    form_email: "Adresse e-mail",
    form_passport: "Numéro de passeport",
    form_seats_requested: "Nombre de places demandées",
    form_sender_name: "Nom de l'expéditeur",
    form_message: "Message",
    form_voyage_select: "Choisir un voyage",
    form_voyage_optional: "-- Optionnel --",
    form_destination: "Destination",
    form_type: "Type",
    form_departure_date: "Date de départ",
    form_return_date: "Date de retour",
    form_duration_days: "Durée (en jours)",
    form_price: "Prix",
    form_capacity: "Capacité",
    form_description: "Description",
    form_itinerary: "Itinéraire",
    form_included_services: "Services inclus",
    form_title: "Titre",
    form_date: "Date",
    form_image_url: "URL de l'image",
    form_password: "Mot de passe",
    form_email_label: "Adresse e-mail",

    // ── Form placeholders ────────────────────────────────────────────────────
    ph_full_name: "Entrez votre nom complet",
    ph_phone: "Entrez votre numéro de téléphone",
    ph_email: "Entrez votre adresse e-mail",
    ph_passport: "Entrez votre numéro de passeport",
    ph_seats: "Nombre de places",
    ph_sender_name: "Entrez votre nom",
    ph_message: "Écrivez votre message ici...",
    ph_destination: "Ex : Istanbul, Turquie",
    ph_price: "Prix en dinars tunisiens",
    ph_capacity: "Nombre maximum de voyageurs",
    ph_title: "Titre de la réalisation",
    ph_description: "Brève description",
    ph_image_url: "https://...",
    ph_password: "Entrez votre mot de passe",

    // ── Error messages ───────────────────────────────────────────────────────
    err_required_full_name: "Le nom complet est obligatoire",
    err_required_phone: "Le numéro de téléphone est obligatoire",
    err_required_email: "L'adresse e-mail est obligatoire",
    err_required_passport: "Le numéro de passeport est obligatoire",
    err_required_seats: "Le nombre de places est obligatoire",
    err_required_sender_name: "Le nom de l'expéditeur est obligatoire",
    err_required_message: "Le message est obligatoire",
    err_required_destination: "La destination est obligatoire",
    err_required_departure_date: "La date de départ est obligatoire",
    err_required_return_date: "La date de retour est obligatoire",
    err_required_price: "Le prix est obligatoire",
    err_required_capacity: "La capacité est obligatoire",
    err_required_voyage: "Veuillez sélectionner un voyage",
    err_invalid_email: "L'adresse e-mail est invalide",
    err_invalid_phone: "Le numéro de téléphone est invalide",
    err_message_too_long: "Le message ne doit pas dépasser 1000 caractères",
    err_not_enough_seats: "Nombre de places disponibles insuffisant",
    err_firebase_unreachable: "Impossible de contacter le serveur, veuillez réessayer plus tard",
    err_login_wrong_password: "Mot de passe incorrect",
    err_login_user_not_found: "Compte introuvable",
    err_login_too_many_requests: "Trop de tentatives, veuillez patienter",
    err_login_generic: "Une erreur est survenue lors de la connexion",
    err_voyage_not_found: "Voyage introuvable",

    // ── Confirmation messages ────────────────────────────────────────────────
    confirm_registration_success: "Votre inscription a été enregistrée avec succès, nous vous contacterons bientôt",
    confirm_question_success: "Votre message a été envoyé avec succès, nous vous répondrons par téléphone",
    confirm_voyage_saved: "Le voyage a été enregistré avec succès",
    confirm_achievement_saved: "La réalisation a été enregistrée avec succès",
    confirm_archived: "Archivage effectué avec succès",
    confirm_deleted: "Suppression effectuée avec succès",
    confirm_status_confirmed: "L'inscription a été confirmée avec succès",
    confirm_status_cancelled: "L'inscription a été annulée",
    confirm_marked_read: "La question a été marquée comme lue",

    // ── Status labels ────────────────────────────────────────────────────────
    status_pending: "En attente",
    status_confirmed: "Confirmé",
    status_cancelled: "Annulé",
    status_active: "Actif",
    status_archived: "Archivé",

    // ── Admin panel labels ───────────────────────────────────────────────────
    admin_dashboard: "Tableau de bord",
    admin_voyages: "Voyages",
    admin_registrations: "Inscriptions",
    admin_questions: "Questions",
    admin_achievements: "Réalisations",
    admin_logout: "Se déconnecter",
    admin_unread_questions: "Questions non lues",
    admin_total_voyages: "Total des voyages",
    admin_pending_registrations: "Inscriptions en attente",
    admin_filter_by_voyage: "Filtrer par voyage",
    admin_all_voyages: "Tous les voyages",
    admin_general_questions: "Questions générales",
    admin_no_questions: "Aucune question",
    admin_no_voyages: "Aucun voyage",
    admin_no_registrations: "Aucune inscription",
    admin_no_achievements: "Aucune réalisation",
    admin_questions_title: "Questions",
    admin_unread_badge: "Non lu",
    admin_question_from: "De",
    admin_question_phone: "Téléphone",
    admin_question_voyage: "Voyage",
    admin_question_date: "Date",
    admin_question_message: "Message",
    admin_question_general: "Général",
    admin_question_count: "question",
    btn_mark_read: "Marquer comme lu",

    // ── Table column headers ─────────────────────────────────────────────────
    col_status: "Statut",
    col_actions: "Actions",
    col_registrations: "Inscriptions",
    col_created_at: "Date de création",

    // ── Miscellaneous ────────────────────────────────────────────────────────
    agency_name: "Dheyafa Tourism",
    available_seats: "Places disponibles",
    fully_booked: "Complet",
    seats_unit: "place",
    days_unit: "jour",
    price_unit: "TND",
    char_count_label: "caractère(s) restant(s)",
    loading: "Chargement en cours...",
    page_not_found: "Page introuvable",
    go_home: "Retour à l'accueil",
    achievements_title: "Nos réalisations",
    voyages_title: "Nos voyages",
    omra_title: "Forfaits Omra",
    contact_title: "Contactez-nous",
    login_title: "Connexion administrateur",
    hero_subtitle: "Des voyages d'exception à des prix compétitifs depuis Manouba Oued Ellil",

    // ── Footer contact ───────────────────────────────────────────────────────
    footer_agency_full_name: "Dheyafa Tourism – Agence Manouba Oued Ellil",
    footer_phone_label: "Téléphone",
    footer_email_label: "E-mail",
    footer_facebook_label: "Facebook",
    footer_follow_us: "Suivez-nous",
    footer_contact_us: "Contactez-nous",
    footer_copy: "Tous droits réservés"
  }
};

/**
 * t(key)
 *
 * Returns the translation string for `key` in the currently active language.
 * Reads `localStorage.getItem("lang")` and defaults to "ar" if not set.
 * Falls back to returning the key itself if the translation is missing.
 *
 * @param {string} key - Translation key (e.g. "nav_home")
 * @returns {string} Translated string, or `key` if not found
 */
function t(key) {
  const lang = localStorage.getItem("lang") || "ar";
  return (translations[lang] && translations[lang][key]) || key;
}

/**
 * setLanguage(lang)
 *
 * Persists the chosen language, updates the document direction and lang
 * attribute, and re-renders all translated elements in the DOM.
 *
 * @param {string} lang - "ar" or "fr"; any other value defaults to "ar"
 */
function setLanguage(lang) {
  // Validate: only "ar" and "fr" are supported
  if (lang !== "ar" && lang !== "fr") {
    lang = "ar";
  }

  // Persist to localStorage
  localStorage.setItem("lang", lang);

  // Update <html> attributes for direction and language
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Update all elements with a [data-i18n] attribute (text content)
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Update all elements with a [data-i18n-placeholder] attribute (placeholder)
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  // Update language buttons active state in nav/admin bars
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    var isActive = (btn.textContent || "").trim().toLowerCase() === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// ── Auto-initialisation ──────────────────────────────────────────────────────
//
// 1. Immediately (before DOMContentLoaded) set the <html> lang and dir
//    attributes so the browser applies the correct text direction as early
//    as possible, avoiding a flash of wrong direction.
// 2. Once the DOM is ready, call setLanguage() in full so all [data-i18n]
//    and [data-i18n-placeholder] elements are translated.

(function () {
  var initialLang = localStorage.getItem("lang") || "ar";
  if (initialLang !== "ar" && initialLang !== "fr") {
    initialLang = "ar";
  }
  // Apply direction immediately (no DOM elements needed)
  document.documentElement.lang = initialLang;
  document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
})();

document.addEventListener("DOMContentLoaded", function () {
  setLanguage(localStorage.getItem("lang") || "ar");
});
