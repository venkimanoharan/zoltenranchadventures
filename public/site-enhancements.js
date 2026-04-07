(function () {
  const STORAGE_KEY = 'zolten-site-language';

  const TRANSLATIONS = {
    en: {
      navHome: 'Home',
      navExperiences: 'Experiences',
      navGallery: 'Gallery',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      navContact: 'Contact',
      navBook: 'Book Now',
      footerQuickLinks: 'Quick Links',
      footerContactInfo: 'Contact Info',
      footerHours: 'Hours',
      footerTagline: 'Creating unforgettable memories in the heart of Texas.',
      footerContact: 'Contact',
      footerBook: 'Book Now',
      footerFaq: 'FAQ',
      locationSummary: 'San Antonio, TX',
      allWeek: 'Monday - Sunday',
      closed: 'Closed',
      variesByDay: 'Varies by day',
      contactHeroTitle: 'Get In Touch',
      contactHeroSubtitle: "We're here to help plan your perfect ranch adventure",
      contactInfoTitle: 'Contact Information',
      contactVisitUs: 'Visit Us',
      contactDirections: 'Get Directions ->',
      contactCallUs: 'Call Us',
      contactEmailUs: 'Email Us',
      contactGeneralInquiries: 'General Inquiries:',
      contactBookings: 'Bookings & Reservations:',
      contactHoursTitle: 'Hours of Operation',
      contactOpenEveryDay: 'Open Every Day',
      contactFormTitle: 'Send Us a Message',
      contactFormIntro: "Fill out the form below and we'll get back to you as soon as possible!",
      contactFullName: 'Full Name *',
      contactEmailAddress: 'Email Address *',
      contactPhoneNumber: 'Phone Number',
      contactInterestedIn: "I'm Interested In *",
      contactSelectOption: 'Select an option',
      interestHorseback: 'Horseback Riding',
      interestPettingZoo: 'Petting Zoo Visit',
      interestBirthday: 'Birthday Party',
      interestCorporate: 'Corporate Event',
      interestSchool: 'School Field Trip',
      interestWedding: 'Wedding/Engagement',
      interestOther: 'Other Event',
      interestGeneral: 'General Question',
      contactPreferredDate: 'Preferred Date (if applicable)',
      contactMessage: 'Message *',
      contactMessagePlaceholder: 'Tell us about your plans or ask any questions...',
      contactSendMessage: 'Send Message',
      contactFindUs: 'Find Us',
      contactOpenMaps: 'Open in Google Maps ->',
      contactVisitAnytime: 'Visit Us Anytime',
      contactWeekdayHours: 'Monday - Friday',
      contactWeekendHours: 'Saturday - Sunday',
      contactHolidayHours: 'Holidays',
      contactFormSuccess: 'Thank you! Your message is being prepared. Your email client will open to send the message.',
      ctaBookAdventure: 'Book Your Adventure',
      ctaLearnMore: 'Learn More',
      ctaReserveToday: 'Reserve Your Spot Today',
      ctaBookVisit: 'Book Your Visit',
      ctaPlanVisit: 'Plan Your Visit',
      ctaBookRide: 'Book Your Ride',
      ctaPlanParty: 'Plan Your Party',
      ctaRequestInfo: 'Request Info',
      ctaBookFieldTrip: 'Book Field Trip',
      ctaPlanGathering: 'Plan Your Gathering',
      ctaWeddingInquiry: 'Wedding Inquiry',
      ctaGetQuote: 'Get Custom Quote',
      ctaBookEvent: 'Book Your Event',
      ctaStillQuestions: 'Still Have Questions?',
      ctaStillQuestionsBody: 'Our team is here to help! Contact us or book your adventure today.',
      ctaBookNowEmoji: '📅 Book Now'
    },
    es: {
      navHome: 'Inicio',
      navExperiences: 'Experiencias',
      navGallery: 'Galeria',
      navPricing: 'Precios',
      navFaq: 'Preguntas',
      navContact: 'Contacto',
      navBook: 'Reservar',
      footerQuickLinks: 'Enlaces rapidos',
      footerContactInfo: 'Informacion de contacto',
      footerHours: 'Horario',
      footerTagline: 'Creamos recuerdos inolvidables en el corazon de Texas.',
      footerContact: 'Contacto',
      footerBook: 'Reservar',
      footerFaq: 'Preguntas',
      locationSummary: 'San Antonio, TX',
      allWeek: 'Lunes a domingo',
      closed: 'Cerrado',
      variesByDay: 'Varia segun el dia',
      contactHeroTitle: 'Ponte en contacto',
      contactHeroSubtitle: 'Estamos aqui para ayudarte a planear tu aventura perfecta en el rancho',
      contactInfoTitle: 'Informacion de contacto',
      contactVisitUs: 'Visitanos',
      contactDirections: 'Como llegar ->',
      contactCallUs: 'Llamanos',
      contactEmailUs: 'Escribenos',
      contactGeneralInquiries: 'Consultas generales:',
      contactBookings: 'Reservas y apartados:',
      contactHoursTitle: 'Horario de atencion',
      contactOpenEveryDay: 'Abierto todos los dias',
      contactFormTitle: 'Envianos un mensaje',
      contactFormIntro: 'Completa el formulario y te responderemos lo antes posible.',
      contactFullName: 'Nombre completo *',
      contactEmailAddress: 'Correo electronico *',
      contactPhoneNumber: 'Telefono',
      contactInterestedIn: 'Me interesa *',
      contactSelectOption: 'Selecciona una opcion',
      interestHorseback: 'Cabalgata',
      interestPettingZoo: 'Visita al zoologico interactivo',
      interestBirthday: 'Fiesta de cumpleanos',
      interestCorporate: 'Evento corporativo',
      interestSchool: 'Excursion escolar',
      interestWedding: 'Boda o compromiso',
      interestOther: 'Otro evento',
      interestGeneral: 'Pregunta general',
      contactPreferredDate: 'Fecha preferida (si aplica)',
      contactMessage: 'Mensaje *',
      contactMessagePlaceholder: 'Cuentanos tus planes o haznos cualquier pregunta...',
      contactSendMessage: 'Enviar mensaje',
      contactFindUs: 'Encuentranos',
      contactOpenMaps: 'Abrir en Google Maps ->',
      contactVisitAnytime: 'Visitanos cuando quieras',
      contactWeekdayHours: 'Lunes a viernes',
      contactWeekendHours: 'Sabado y domingo',
      contactHolidayHours: 'Dias festivos',
      contactFormSuccess: 'Gracias. Tu mensaje se esta preparando y tu cliente de correo se abrira para enviarlo.',
      ctaBookAdventure: 'Reserva tu aventura',
      ctaLearnMore: 'Conoce mas',
      ctaReserveToday: 'Reserva tu lugar hoy',
      ctaBookVisit: 'Reserva tu visita',
      ctaPlanVisit: 'Planea tu visita',
      ctaBookRide: 'Reserva tu paseo',
      ctaPlanParty: 'Planea tu fiesta',
      ctaRequestInfo: 'Solicita informacion',
      ctaBookFieldTrip: 'Reserva excursion',
      ctaPlanGathering: 'Planea tu reunion',
      ctaWeddingInquiry: 'Consulta para boda',
      ctaGetQuote: 'Cotizacion personalizada',
      ctaBookEvent: 'Reserva tu evento',
      ctaStillQuestions: 'Todavia tienes preguntas?',
      ctaStillQuestionsBody: 'Nuestro equipo esta aqui para ayudarte. Contactanos o reserva tu aventura hoy.',
      ctaBookNowEmoji: '📅 Reservar'
    }
  };

  const LINK_LABELS = {
    '/': 'navHome',
    '/horseback-riding.html': 'navExperiences',
    '/gallery.html': 'navGallery',
    '/pricing.html': 'navPricing',
    '/faq.html': 'navFaq',
    '/contact.html': 'navContact',
    '/booking.html': 'navBook',
    'contact.html': 'navContact',
    'booking.html': 'navBook'
  };

  let cachedBusinessSettings = null;
  let cachedWeeklySchedule = [];

  const TEXT_KEYS = {
    'Quick Links': 'footerQuickLinks',
    'Contact Info': 'footerContactInfo',
    'Hours': 'footerHours',
    'Creating unforgettable memories in the heart of Texas.': 'footerTagline',
    'Book Your Adventure': 'ctaBookAdventure',
    'Learn More': 'ctaLearnMore',
    'Reserve Your Spot Today': 'ctaReserveToday',
    'Book Your Visit': 'ctaBookVisit',
    'Plan Your Visit': 'ctaPlanVisit',
    'Book Your Ride': 'ctaBookRide',
    'Plan Your Party': 'ctaPlanParty',
    'Request Info': 'ctaRequestInfo',
    'Book Field Trip': 'ctaBookFieldTrip',
    'Plan Your Gathering': 'ctaPlanGathering',
    'Wedding Inquiry': 'ctaWeddingInquiry',
    'Get Custom Quote': 'ctaGetQuote',
    'Book Your Event': 'ctaBookEvent',
    'Still Have Questions?': 'ctaStillQuestions',
    'Our team is here to help! Contact us or book your adventure today.': 'ctaStillQuestionsBody',
    '📅 Book Now': 'ctaBookNowEmoji'
  };

  function t(lang, key) {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  }

  function normalizeHref(href) {
    if (!href) return '';
    try {
      return new URL(href, window.location.origin).pathname;
    } catch (_error) {
      return href;
    }
  }

  function getStoredLanguage() {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'es' ? 'es' : 'en';
  }

  function setStoredLanguage(lang) {
    window.localStorage.setItem(STORAGE_KEY, lang === 'es' ? 'es' : 'en');
  }

  function injectLanguageToggle() {
    if (document.querySelector('.lang-toggle')) return;

    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');
    if (!navLinks && !nav) return;

    const slotTag = navLinks?.tagName === 'UL' ? 'li' : 'div';
    const slot = document.createElement(slotTag);
    slot.className = 'lang-toggle-slot';
    slot.innerHTML = [
      '<div class="lang-toggle" aria-label="Language toggle">',
      '  <button type="button" data-lang="en">EN</button>',
      '  <button type="button" data-lang="es">ES</button>',
      '</div>'
    ].join('');

    (navLinks || nav).appendChild(slot);
    slot.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => applyLanguage(button.dataset.lang || 'en'));
    });
  }

  function updateToggleState(lang) {
    document.querySelectorAll('.lang-toggle button').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.lang === lang);
    });
  }

  function applyDataI18n(lang) {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!key) return;
      node.textContent = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (!key) return;
      node.setAttribute('placeholder', t(lang, key));
    });
  }

  function applyLinkTranslations(lang) {
    document.querySelectorAll('a[href]').forEach((anchor) => {
      if (anchor.closest('.logo-container')) return;
      const key = LINK_LABELS[normalizeHref(anchor.getAttribute('href'))] || LINK_LABELS[anchor.getAttribute('href') || ''];
      if (!key) return;
      if (anchor.querySelector('img')) return;
      anchor.textContent = t(lang, key);
    });
  }

  function applyTextTranslations(lang) {
    document.querySelectorAll('a, button, h2, h3, h4, p, div, span').forEach((node) => {
      if (node.children.length > 0) return;
      const text = node.textContent.trim();
      const key = TEXT_KEYS[text];
      if (!key) return;
      node.textContent = t(lang, key);
    });
  }

  function formatTime(timeValue) {
    if (!timeValue) return '';
    const [hoursRaw, minutesRaw] = String(timeValue).slice(0, 5).split(':').map(Number);
    if (Number.isNaN(hoursRaw) || Number.isNaN(minutesRaw)) return String(timeValue).slice(0, 5);
    const suffix = hoursRaw >= 12 ? 'PM' : 'AM';
    const hours = hoursRaw % 12 || 12;
    const minutes = String(minutesRaw).padStart(2, '0');
    return `${hours}:${minutes} ${suffix}`;
  }

  function telHref(phone) {
    return `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;
  }

  function mailtoHref(email) {
    return `mailto:${email || ''}`;
  }

  function formatAddress(settings) {
    const cityStateZip = [settings.city, settings.state].filter(Boolean).join(', ') + (settings.postal_code ? ` ${settings.postal_code}` : '');
    return {
      html: [settings.street_address, cityStateZip.trim()].filter(Boolean).join('<br>'),
      inline: [settings.street_address, cityStateZip.trim()].filter(Boolean).join(', '),
      cityState: [settings.city, settings.state].filter(Boolean).join(', '),
      mapQuery: encodeURIComponent([settings.street_address, settings.city, settings.state, settings.postal_code].filter(Boolean).join(' '))
    };
  }

  function summarizeGroup(rows, lang) {
    if (!rows.length) return t(lang, 'closed');
    if (rows.every((row) => row.is_closed)) return t(lang, 'closed');

    const openRows = rows.filter((row) => !row.is_closed);
    const ranges = new Set(openRows.map((row) => `${String(row.open_time || '').slice(0, 5)}-${String(row.close_time || '').slice(0, 5)}`));
    if (ranges.size === 1) {
      const sample = openRows[0];
      return `${formatTime(sample.open_time)} - ${formatTime(sample.close_time)}`;
    }

    return t(lang, 'variesByDay');
  }

  async function fetchBusinessSettings() {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    const payload = await response.json();
    const settings = payload.settings || payload;

    let weekly = [];
    try {
      const weeklyResponse = await fetch('/api/settings/schedule/weekly');
      if (weeklyResponse.ok) {
        const weeklyPayload = await weeklyResponse.json();
        weekly = weeklyPayload.weekly || [];
      }
    } catch (_error) {
      weekly = [];
    }

    return { settings, weekly };
  }

  function applyBusinessSettings(settings, weekly) {
    const currentLang = getStoredLanguage();
    const address = formatAddress(settings);
    const weekdayRows = weekly.filter((row) => row.day_of_week >= 1 && row.day_of_week <= 5);
    const weekendRows = weekly.filter((row) => row.day_of_week === 0 || row.day_of_week === 6);
    const defaultHoursRange = `${formatTime(settings.open_time)} - ${formatTime(settings.close_time)}`;
    const weekdayHours = weekly.length ? summarizeGroup(weekdayRows, currentLang) : defaultHoursRange;
    const weekendHours = weekly.length ? summarizeGroup(weekendRows, currentLang) : defaultHoursRange;

    document.querySelectorAll('.js-setting-address').forEach((node) => {
      node.innerHTML = address.html;
    });

    document.querySelectorAll('.js-setting-inline-address').forEach((node) => {
      node.textContent = address.inline;
    });

    document.querySelectorAll('.js-setting-city-state').forEach((node) => {
      node.textContent = address.cityState || t(getStoredLanguage(), 'locationSummary');
    });

    document.querySelectorAll('.js-setting-location-label').forEach((node) => {
      node.textContent = address.cityState || t(getStoredLanguage(), 'locationSummary');
    });

    document.querySelectorAll('a.js-setting-map-link').forEach((node) => {
      node.setAttribute('href', `https://maps.google.com/?q=${address.mapQuery}`);
    });

    document.querySelectorAll('a.js-setting-phone').forEach((node) => {
      node.textContent = settings.contact_phone || '';
      node.setAttribute('href', telHref(settings.contact_phone));
    });

    document.querySelectorAll('a.js-setting-contact-email').forEach((node) => {
      node.textContent = settings.contact_email || '';
      node.setAttribute('href', mailtoHref(settings.contact_email));
    });

    document.querySelectorAll('a.js-setting-booking-email').forEach((node) => {
      node.textContent = settings.booking_email || settings.contact_email || '';
      node.setAttribute('href', mailtoHref(settings.booking_email || settings.contact_email || ''));
    });

    document.querySelectorAll('.js-setting-daily-hours').forEach((node) => {
      node.textContent = `${t(getStoredLanguage(), 'contactOpenEveryDay')} ${defaultHoursRange}`;
    });

    document.querySelectorAll('.js-setting-hours-note').forEach((node) => {
      node.textContent = settings.hours_note || '';
    });

    document.querySelectorAll('.js-setting-weekday-hours').forEach((node) => {
      node.textContent = weekdayHours;
    });

    document.querySelectorAll('.js-setting-weekend-hours').forEach((node) => {
      node.textContent = weekendHours;
    });

    document.querySelectorAll('.js-setting-holiday-hours').forEach((node) => {
      node.textContent = settings.holiday_hours || '';
    });

    document.querySelectorAll('.js-setting-footer-hours').forEach((node) => {
      node.innerHTML = `${t(currentLang, 'allWeek')}<br>${defaultHoursRange}`;
    });

    document.querySelectorAll('.js-setting-footer-bottom').forEach((node) => {
      const links = Array.from(node.querySelectorAll('a')).map((anchor) => anchor.outerHTML);
      node.innerHTML = `${address.cityState || t(getStoredLanguage(), 'locationSummary')} | ${links.join(' | ')}`;
    });
  }

  function applyLanguage(lang) {
    const normalized = lang === 'es' ? 'es' : 'en';
    setStoredLanguage(normalized);
    document.documentElement.lang = normalized;
    updateToggleState(normalized);
    applyDataI18n(normalized);
    applyLinkTranslations(normalized);
    applyTextTranslations(normalized);
    if (cachedBusinessSettings) {
      applyBusinessSettings(cachedBusinessSettings, cachedWeeklySchedule);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    injectLanguageToggle();
    const lang = getStoredLanguage();
    applyLanguage(lang);

    try {
      const { settings, weekly } = await fetchBusinessSettings();
      cachedBusinessSettings = settings;
      cachedWeeklySchedule = weekly;
      applyBusinessSettings(settings, weekly);
      applyLanguage(getStoredLanguage());
    } catch (error) {
      console.error('Failed to apply site enhancements:', error);
    }
  });
})();