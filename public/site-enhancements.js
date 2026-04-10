(function () {
  const STORAGE_KEY = 'zolten-site-language';
  const BUSINESS_SETTINGS_CACHE_KEY = 'zolten-business-settings';
  const BUSINESS_SETTINGS_CACHE_TTL_MS = 300000;
  const PUBLIC_SITE_DATA_CACHE_KEY = 'zolten-public-site-data';
  const PUBLIC_SITE_DATA_CACHE_TTL_MS = 300000;

  function buildCachePayload(value, ttlMs) {
    return {
      cachedAt: Date.now(),
      ttlMs,
      value,
    };
  }

  function readSessionCache(key, fallbackTtlMs = BUSINESS_SETTINGS_CACHE_TTL_MS) {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const ttlMs = Number(parsed.ttlMs || fallbackTtlMs);
      if (!parsed.cachedAt || (Date.now() - parsed.cachedAt) > ttlMs) {
        window.sessionStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (_error) {
      return null;
    }
  }

  function writeSessionCache(key, value, ttlMs = BUSINESS_SETTINGS_CACHE_TTL_MS) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(buildCachePayload(value, ttlMs)));
    } catch (_error) {
      // Ignore storage failures and continue without client caching.
    }
  }

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
      ctaBookNowEmoji: '📅 Book Now',
      homeMetaTitle: 'Zolten Ranch Adventures | Premium Equestrian Experiences',
      homeMetaDescription: 'Zolten Ranch Adventures offers premium horseback riding and ranch experiences for families in San Antonio, Texas.',
      homeOgTitle: 'Zolten Ranch Adventures',
      homeOgDescription: 'Premium horseback riding, petting zoo, and ranch adventures for families in San Antonio, Texas.',
      contactMetaTitle: 'Contact Us & Book Your Visit | Zolten Ranch Adventures - San Antonio, TX',
      contactMetaDescription: 'Contact Zolten Ranch Adventures in San Antonio, TX to book a visit, ask questions, or request event information.',
      contactOgTitle: 'Contact Zolten Ranch Adventures',
      contactOgDescription: 'Get in touch to plan your ranch adventure, private visit, or special event.',
      pricingMetaTitle: 'Pricing | Zolten Ranch Adventures',
      pricingMetaDescription: 'See live Zolten Ranch Adventures pricing for horseback riding, petting zoo visits, add-ons, and group discounts.',
      pricingOgTitle: 'Pricing at Zolten Ranch Adventures',
      pricingOgDescription: 'Explore current pricing for ranch experiences, add-ons, and group savings.',
      bookingMetaTitle: 'Trail Ride Booking | Zolten Ranch Adventures',
      bookingMetaDescription: 'Reserve your Zolten Ranch horseback riding adventure online with live pricing and availability.',
      bookingOgTitle: 'Book Your Ride at Zolten Ranch Adventures',
      bookingOgDescription: 'Choose your date, package, riders, and add-ons for a ranch adventure in San Antonio.',
      faqMetaTitle: 'FAQ | Zolten Ranch Adventures',
      faqMetaDescription: 'Find answers about horseback riding, the petting zoo, booking, pricing, and ranch events at Zolten Ranch Adventures.',
      faqOgTitle: 'Frequently Asked Questions | Zolten Ranch Adventures',
      faqOgDescription: 'Answers to the most common questions about visiting, booking, and planning your ranch experience.',
      eventsMetaTitle: 'Events & Parties | Zolten Ranch Adventures - San Antonio, TX',
      eventsMetaDescription: 'Host birthdays, school field trips, corporate events, and family gatherings at Zolten Ranch Adventures in San Antonio.',
      eventsOgTitle: 'Events at Zolten Ranch Adventures',
      eventsOgDescription: 'Make your celebration unforgettable at our ranch venue in San Antonio.',
      galleryMetaTitle: 'Photo Gallery | Zolten Ranch Adventures - San Antonio, TX',
      galleryMetaDescription: 'Explore photos of Zolten Ranch Adventures, including ranch spaces, animals, horseback rides, and visitors.',
      galleryOgTitle: 'Gallery - Zolten Ranch Adventures',
      galleryOgDescription: 'Browse photos of our ranch, friendly animals, and unforgettable guest experiences.',
      horseMetaTitle: 'Horseback Riding | Zolten Ranch Adventures - San Antonio, TX',
      horseMetaDescription: 'Experience scenic horseback riding trails at Zolten Ranch Adventures in San Antonio, TX. Great for beginners and experienced riders.',
      horseOgTitle: 'Horseback Riding at Zolten Ranch Adventures',
      horseOgDescription: 'Explore beautiful trails on gentle, well-trained horses with guided ranch rides for all skill levels.',
      pettingMetaTitle: 'Petting Zoo | Zolten Ranch Adventures - San Antonio, TX',
      pettingMetaDescription: 'Visit the Zolten Ranch Adventures petting zoo and meet friendly goats, sheep, rabbits, and more in San Antonio, TX.',
      pettingOgTitle: 'Petting Zoo at Zolten Ranch Adventures',
      pettingOgDescription: 'Interactive farm animal experiences for kids and families with friendly animals up close.',
      homeHeroTitle: 'CRAFTING AN EQUESTRIAN EXPERIENCE',
      homeHeroSubtitle: 'A Step-by-Step Guide to Unforgettable Adventures',
      homeHeroBody: 'Premium Horseback Riding, Petting Zoo, & Ranch Experiences for Families in San Antonio, Texas',
      homeHeroNote: 'Now booking family rides, private visits, and ranch experiences',
      homeTrustStarsTitle: '4.9/5 Stars',
      homeTrustStarsBody: '500+ Happy Guests',
      homeTrustQualityTitle: 'Premium Quality',
      homeTrustQualityBody: 'Best in Texas',
      homeTrustSavingsTitle: 'Small Group Savings',
      homeTrustSavingsBody: 'Automatic rider discounts',
      homeTrustFamilyTitle: 'Family Friendly',
      homeTrustFamilyBody: '15+ Years Experience',
      homeExperiencesTitle: 'Our Experiences',
      homeExperiencesBody: 'Discover the perfect adventure tailored to your needs and skill level',
      homeExperienceTrailTitle: 'Trail Riding',
      homeExperienceTrailBody: 'Experience scenic trails on well-trained horses. Perfect for all skill levels. 1-4 hour guided tours through beautiful Texas landscape.',
      homeExperienceCareTitle: 'Horse Care Lessons',
      homeExperienceCareBody: 'Learn proper horsemanship and animal care from certified instructors. Build confidence and connection with these magnificent animals.',
      homeExperienceFamilyTitle: 'Family Packages',
      homeExperienceFamilyBody: 'All-inclusive family experiences featuring trail rides, petting zoo access, riding lessons, and authentic ranch-style meals.',
      homeExperienceZooTitle: 'Petting Zoo',
      homeExperienceZooBody: 'Interactive farm animal experience perfect for children. Safe, supervised environment to learn about animal care and behavior.',
      homeExperienceEventsTitle: 'Special Events',
      homeExperienceEventsBody: 'Host your birthday parties, corporate team building, or family gatherings with completely customizable packages and dedicated staff.',
      homeExperienceToursTitle: 'Scenic Tours',
      homeExperienceToursBody: 'Explore 100+ acres of pristine Texas ranch landscape. Guided tours showcasing local wildlife and natural attractions year-round.',
      homeStoriesTitle: 'Guest Stories',
      homeStoriesBody: 'Real experiences from families who have created unforgettable memories with us',
      homeTestimonial1: '"The best family experience in years! Professional staff, beautiful horses, and amazing atmosphere. Our kids are still talking about it!"',
      homeTestimonial1Meta: 'Family of 4, San Antonio',
      homeTestimonial2: '"Perfect corporate retreat! The team was energized, bonded, and genuinely happy. Highly professional and accommodating to all needs."',
      homeTestimonial2Meta: 'Corporate Group, Austin',
      homeTestimonial3: '"We have been three times and keep coming back! Amazing petting zoo for our toddler and stunning trail rides. Worth every penny!"',
      homeTestimonial3Meta: 'Returning Guest, Houston',
      homeCtaTitle: 'Ready for Your Adventure?',
      homeCtaBody: 'Create lasting memories with your family and friends at Zolten Ranch Adventures',
      pricingHeroTitle: '💰 Transparent Pricing',
      pricingHeroBody: 'Premium experiences at fair prices. No hidden fees, no surprises.',
      pricingPackagesTitle: 'Trail Riding Packages',
      pricingPackagesBody: 'Choose the perfect adventure for your group',
      pricingAddOnsTitle: '🎁 Add-On Services',
      pricingAddOnsBody: 'Enhance your experience with these optional add-ons',
      pricingDiscountsTitle: '👥 Group Discounts',
      pricingDiscountsBody: 'Book for your group and save! The more people join, the bigger the discount.',
      pricingFaqTitle: '❓ Pricing Questions',
      pricingFaqBody: 'Common questions about our pricing',
      pricingQuestion1: 'Are there any hidden fees?',
      pricingAnswer1: 'No! All listed prices include the experience, guide, equipment, and basic refreshments. Any add-ons are clearly displayed upfront.',
      pricingQuestion2: 'Do you offer discounts for large groups?',
      pricingAnswer2: 'Yes. Group discounts are applied automatically based on the number of riders in your booking. Current discount tiers are shown above and stay synced with our booking checkout.',
      pricingQuestion3: "What's included in the price?",
      pricingAnswer3: 'Your price includes experienced guide, horse rental, all safety equipment, refreshments, and access to our facilities. See each package for specific inclusions.',
      pricingQuestion4: 'How far in advance should I book?',
      pricingAnswer4: 'You can book from 1-30 days in advance. For weekends and holidays, we recommend 2-3 weeks ahead for best availability.',
      pricingQuestion5: "What's your cancellation policy?",
      pricingAnswer5: 'Full refund for cancellations 7+ days before. 50% refund for cancellations within 7 days. Reschedules are free anytime.',
      pricingQuestion6: 'Do you offer gift certificates?',
      pricingAnswer6: 'Yes! Gift certificates are available in any amount and never expire. Perfect for any occasion. Call or book online.',
      pricingLoadingPackages: 'Loading live package pricing...',
      pricingLoadingAddOns: 'Loading add-ons...',
      pricingLoadingDiscounts: 'Loading group discounts...',
      pricingNoPackages: 'No package pricing is available right now.',
      pricingNoAddOns: 'No add-ons are active right now.',
      pricingNoDiscounts: 'No group discounts are configured right now.',
      pricingErrorPackages: 'Pricing could not be loaded right now.',
      pricingErrorAddOns: 'Add-ons could not be loaded right now.',
      pricingErrorDiscounts: 'Discounts could not be loaded right now.',
      pricingPerPersonHour: 'per person / {hours} hour|per person / {hours} hours',
      pricingPerRider: 'per rider',
      pricingPerBooking: 'per booking',
      pricingPeopleRange: '{min}+{max} People',
      pricingOffPercent: '{percent}% OFF',
      pricingAutoSavings: 'Automatic savings at checkout',
      pricingPackage1Title: 'Quick Ranch Ride',
      pricingPackage1Subtitle: 'Best for first-time riders',
      pricingPackage1Description: 'A relaxed introduction to the ranch with a scenic guided ride.',
      pricingPackage2Title: 'Classic Trail Ride',
      pricingPackage2Subtitle: 'Our most popular choice',
      pricingPackage2Description: 'Extra trail time for families and small groups who want the full ride.',
      pricingPackage4Title: 'Half-Day Adventure',
      pricingPackage4Subtitle: 'More ranch time, more memories',
      pricingPackage4Description: 'An extended ranch outing with extra stops and more time in the saddle.',
      pricingPackage8Title: 'Full-Day Ranch Experience',
      pricingPackage8Subtitle: 'The complete ranch day',
      pricingPackage8Description: 'Our longest experience with immersive riding and ranch access all day.',
      pricingFeature1a: 'Professional guide included',
      pricingFeature1b: 'Well-trained horses',
      pricingFeature1c: 'Safety helmet provided',
      pricingFeature1d: 'Beginner friendly',
      pricingFeature1e: 'Scenic 1-hour trail',
      pricingFeature2a: 'Expert guide included',
      pricingFeature2b: 'Premium horses',
      pricingFeature2c: 'Safety helmet provided',
      pricingFeature2d: 'Water available',
      pricingFeature2e: 'Beautiful 2-hour trail',
      pricingFeature4a: 'Experienced guide included',
      pricingFeature4b: 'Choice of horses',
      pricingFeature4c: 'Extended ranch route',
      pricingFeature4d: 'Photo opportunities',
      pricingFeature4e: 'Petting zoo access',
      pricingFeature8a: 'Personal guide included',
      pricingFeature8b: 'Extended trail access',
      pricingFeature8c: 'Petting zoo access',
      pricingFeature8d: 'Horse care lesson',
      pricingFeature8e: 'Ranch tour',
      bookingTitle: '🐎 Trail Ride Booking',
      bookingSubtitle: 'Reserve your adventure at Zolten Ranch',
      bookingStepInfo: 'Your Info',
      bookingStepDate: 'Date & Time',
      bookingStepDetails: 'Details',
      bookingStepReview: 'Review',
      bookingInfoTitle: '👤 Your Information',
      bookingNameLabel: 'Full Name',
      bookingEmailLabel: 'Email Address',
      bookingPhoneLabel: 'Phone Number',
      bookingAgeGroupLabel: 'Age Group',
      bookingNamePlaceholder: 'John Doe',
      bookingEmailPlaceholder: 'john@example.com',
      bookingPhonePlaceholder: '(555) 123-4567',
      bookingAgeSelect: 'Select your age group',
      bookingAgeChild: 'Child (5-12)',
      bookingAgeTeen: 'Teen (13-17)',
      bookingAgeAdult: 'Adult (18-65)',
      bookingAgeSenior: 'Senior (65+)',
      bookingDateTitle: '📅 Select Date & Time',
      bookingDateLabel: 'Preferred Date',
      bookingDateHint: 'Select a date 1-30 days in advance',
      bookingTimeLabel: 'Preferred Time',
      bookingTimeHint: 'Select a date to view available time slots',
      bookingDetailsTitle: '🐴 Experience Details',
      bookingDurationLabel: 'Duration',
      bookingDurationHintLoading: 'Loading package pricing...',
      bookingRidersLabel: 'Number of Riders',
      bookingExperienceLabel: 'Riding Experience',
      bookingExperienceSelect: 'Select your experience level',
      bookingExperienceBeginner: 'Beginner - First time',
      bookingExperienceIntermediate: 'Intermediate - Ridden before',
      bookingExperienceAdvanced: 'Advanced - Regular rider',
      bookingAddOnsLabel: 'Optional Add-Ons',
      bookingAddOnsHint: 'Choose any extras you want included in your booking.',
      bookingRequestsLabel: 'Special Requests or Dietary Needs',
      bookingRequestsPlaceholder: 'Tell us about any special accommodations you need...',
      bookingRequestsHint: 'Including any dietary restrictions for meals',
      bookingReviewTitle: '✅ Review Your Booking',
      bookingSummaryTitle: 'Booking Summary',
      bookingSummaryName: 'Name:',
      bookingSummaryEmail: 'Email:',
      bookingSummaryPhone: 'Phone:',
      bookingSummaryDateTime: 'Date & Time:',
      bookingSummaryDuration: 'Duration:',
      bookingSummaryRiders: 'Riders:',
      bookingSummaryPackage: 'Package:',
      bookingSummaryDiscount: 'Group Discount:',
      bookingSummaryAddOns: 'Add-Ons:',
      bookingSummaryTotal: 'Total Price:',
      bookingSummaryNone: 'None',
      bookingConfirmationTitle: '✓ Booking Confirmation',
      bookingConfirmationBody: 'We will send you a confirmation email with all the details and a link to reschedule if needed.',
      bookingPrev: '← Previous',
      bookingNext: 'Next →',
      bookingComplete: '🎟️ Complete Booking',
      bookingNoAddOns: 'No add-ons are available right now.',
      bookingAddOnPerRider: 'Charged per rider',
      bookingAddOnPerBooking: 'Charged once per booking',
      bookingDateClosed: 'This date is closed. Please choose another date.',
      bookingLoadDatesError: 'Unable to load unavailable dates right now.',
      bookingLoadPricingError: 'Unable to load pricing right now.',
      bookingLoadSettingsError: 'Booking is temporarily unavailable while the ranch schedule loads.',
      bookingAvailabilityError: 'Unable to check availability right now. Please try again in a moment.',
      bookingDateClosedStatus: '✗ Ranch is closed on this date. Please choose another day.',
      bookingAvailableSlots: '✓ {count} time slots available - Book now!',
      bookingLimitedSlots: '⚠ Only {count} time slots available - Book soon!',
      bookingNoSlots: '✗ All slots are at rider capacity for this date - Try another day/time',
      bookingAvailabilityLoadFailed: 'Availability could not be loaded. Please try again shortly.',
      bookingSlotRemaining: '{time} ({count} rider spots left)',
      bookingSlotFull: '{time} (Full)',
      bookingFillRequired: 'Please fill in {field}',
      bookingFillAllFields: 'all required fields',
      bookingEmailInvalid: 'Please enter a valid email address.',
      bookingSelectTime: 'Please select a booking time.',
      bookingConfirmed: '✓ Booking confirmed! Check your email for details.',
      bookingSubmitError: 'Error submitting booking: {message}',
      bookingDurationOption: '{hours} Hour|{hours} Hours',
      bookingDurationSummary: '{hours} hour|{hours} hours',
      bookingPerRiderPrice: '{price} per rider',
      bookingPackageFallback: '-',
      bookingPackageHintFallback: 'Choose the package that fits your visit best.',
      faqHeroTitle: '❓ Frequently Asked Questions',
      faqHeroBody: 'Find answers to common questions about our ranch experiences',
      faqFilterAll: 'All Questions',
      faqFilterBooking: 'Booking',
      faqFilterExperience: 'Experience',
      faqFilterSafety: 'Safety',
      faqFilterPricing: 'Pricing',
      faqBookingQuestion1: 'How do I make a booking?',
      faqBookingAnswer1: 'Booking is easy! Simply click the "Book Now" button on our website, fill in your information, select your preferred date and time, and choose your experience duration. You can book online anytime, and we will send you a confirmation email within an hour.',
      faqBookingQuestion2: 'When do I need to book in advance?',
      faqBookingAnswer2: 'We accept bookings from 1 day to 30 days in advance. For peak times (weekends and holidays), we recommend booking at least 2-3 weeks ahead to ensure availability. You can also call us for same-day availability.',
      faqBookingQuestion3: 'What payment methods do you accept?',
      faqBookingAnswer3: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. Payment is collected at the time of booking online, and you will receive a receipt immediately.',
      faqBookingQuestion4: 'Can I cancel or reschedule my booking?',
      faqBookingAnswer4: 'Yes! Cancellations made 7 days before your booking receive a full refund. Cancellations within 7 days receive a 50% refund. You can reschedule anytime at no charge by using the link in your confirmation email.',
      faqExperienceQuestion1: "What's the minimum age for trail riding?",
      faqExperienceAnswer1: 'Children as young as 5 years old can participate in our family-friendly trail rides if they can sit confidently on a horse. Children under 12 must be accompanied by an adult. We match horses carefully to each rider.',
      faqExperienceQuestion2: 'Do I need prior riding experience?',
      faqExperienceAnswer2: 'No experience necessary! Our horses are gentle and well-trained. We have beginner-friendly trails and our guides will teach you proper riding techniques. We have options for every level.',
      faqExperienceQuestion3: 'What should I wear?',
      faqExperienceAnswer3: '<p>Wear comfortable, sturdy clothing. We recommend:</p><ul><li>Long pants (no shorts or skirts)</li><li>Closed-toe shoes or boots with a heel</li><li>Layered clothing - it can feel cooler than expected</li><li>Sunscreen and a hat</li></ul><p>We provide helmets for safety.</p>',
      faqExperienceQuestion4: 'How long are the trail rides?',
      faqExperienceAnswer4: '<p>We offer flexible options:</p><ul><li><strong>1 Hour:</strong> Perfect for first-timers and younger children</li><li><strong>2 Hours:</strong> Great for families wanting a full experience</li><li><strong>Half Day (4 hours):</strong> Includes more ranch time</li><li><strong>Full Day (8 hours):</strong> Our most immersive experience</li></ul>',
      faqSafetyQuestion1: 'Is horseback riding safe?',
      faqSafetyAnswer1: 'Safety is our top priority! We use well-trained, gentle horses and provide safety helmets for all riders. Our guides lead every ride and explain everything clearly before you start.',
      faqSafetyQuestion2: 'What if I have physical limitations?',
      faqSafetyAnswer2: 'Please contact us before booking. We work with riders of different physical abilities and can discuss accommodations, suggest suitable experiences, and help plan a comfortable visit.',
      faqSafetyQuestion3: 'Can pregnant women ride?',
      faqSafetyAnswer3: 'We recommend speaking with your doctor before booking if you are pregnant. For safety, we usually avoid rides during the second and third trimester. Please contact us to discuss options.',
      faqPricingQuestion1: 'How much does a trail ride cost?',
      faqPricingAnswer1: 'Our pricing varies by duration, selected add-ons, and group size. The current package rates and automatic group discounts are always shown on our <a href="/pricing.html">pricing page</a> so the numbers stay aligned with checkout.',
      faqPricingQuestion2: 'Are there discounts for groups?',
      faqPricingAnswer2: 'Yes. Group discounts are applied automatically based on the number of riders in your booking. Current discount tiers are shown on our pricing page.',
      faqPricingQuestion3: 'Do you sell gift certificates?',
      faqPricingAnswer3: 'Absolutely! Gift certificates are perfect for any occasion. They are available in any amount and never expire. Purchase online or call us. The recipient can book any experience on our website.',
      faqGeneralQuestion: 'How can I contact you?',
      faqGeneralAnswer: '<p>We would love to hear from you!</p><ul><li><strong>Phone:</strong> <a href="tel:+12107694164" class="js-setting-phone">210-769-4164</a></li><li><strong>Email:</strong> <a href="mailto:info@zoltenranch.com" class="js-setting-contact-email">info@zoltenranch.com</a></li><li><strong>Hours:</strong> <span class="js-setting-daily-hours">Open Every Day 9:00 AM - 5:00 PM</span></li><li><strong>Location:</strong> San Antonio, TX</li></ul>'
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
      ctaBookNowEmoji: '📅 Reservar',
      homeMetaTitle: 'Zolten Ranch Adventures | Experiencias ecuestres premium',
      homeMetaDescription: 'Zolten Ranch Adventures ofrece paseos a caballo y experiencias de rancho premium para familias en San Antonio, Texas.',
      homeOgTitle: 'Zolten Ranch Adventures',
      homeOgDescription: 'Paseos a caballo, zoologico interactivo y aventuras de rancho premium para familias en San Antonio, Texas.',
      contactMetaTitle: 'Contactanos y reserva tu visita | Zolten Ranch Adventures - San Antonio, TX',
      contactMetaDescription: 'Contacta a Zolten Ranch Adventures en San Antonio, TX para reservar una visita, hacer preguntas o solicitar informacion para eventos.',
      contactOgTitle: 'Contacta a Zolten Ranch Adventures',
      contactOgDescription: 'Comunicate con nosotros para planear tu aventura de rancho, visita privada o evento especial.',
      pricingMetaTitle: 'Precios | Zolten Ranch Adventures',
      pricingMetaDescription: 'Consulta los precios en vivo de Zolten Ranch Adventures para paseos a caballo, zoologico interactivo, extras y descuentos para grupos.',
      pricingOgTitle: 'Precios en Zolten Ranch Adventures',
      pricingOgDescription: 'Explora los precios actuales de experiencias de rancho, extras y ahorros para grupos.',
      bookingMetaTitle: 'Reserva de paseo | Zolten Ranch Adventures',
      bookingMetaDescription: 'Reserva en linea tu aventura a caballo en Zolten Ranch con precios y disponibilidad en tiempo real.',
      bookingOgTitle: 'Reserva tu paseo en Zolten Ranch Adventures',
      bookingOgDescription: 'Elige tu fecha, paquete, jinetes y extras para una aventura de rancho en San Antonio.',
      faqMetaTitle: 'Preguntas frecuentes | Zolten Ranch Adventures',
      faqMetaDescription: 'Encuentra respuestas sobre paseos a caballo, zoologico interactivo, reservas, precios y eventos en Zolten Ranch Adventures.',
      faqOgTitle: 'Preguntas frecuentes | Zolten Ranch Adventures',
      faqOgDescription: 'Respuestas a las preguntas mas comunes sobre visitas, reservas y la planeacion de tu experiencia de rancho.',
      eventsMetaTitle: 'Eventos y fiestas | Zolten Ranch Adventures - San Antonio, TX',
      eventsMetaDescription: 'Organiza cumpleanos, excursiones escolares, eventos corporativos y reuniones familiares en Zolten Ranch Adventures en San Antonio.',
      eventsOgTitle: 'Eventos en Zolten Ranch Adventures',
      eventsOgDescription: 'Haz que tu celebracion sea inolvidable en nuestro lugar para eventos en el rancho de San Antonio.',
      galleryMetaTitle: 'Galeria de fotos | Zolten Ranch Adventures - San Antonio, TX',
      galleryMetaDescription: 'Explora fotos de Zolten Ranch Adventures, incluyendo espacios del rancho, animales, paseos a caballo y visitantes.',
      galleryOgTitle: 'Galeria - Zolten Ranch Adventures',
      galleryOgDescription: 'Mira fotos de nuestro rancho, animales amigables y experiencias inolvidables de nuestros visitantes.',
      horseMetaTitle: 'Paseos a caballo | Zolten Ranch Adventures - San Antonio, TX',
      horseMetaDescription: 'Disfruta senderos escenicos a caballo en Zolten Ranch Adventures en San Antonio, TX. Ideal para principiantes y jinetes con experiencia.',
      horseOgTitle: 'Paseos a caballo en Zolten Ranch Adventures',
      horseOgDescription: 'Explora hermosos senderos en caballos nobles y bien entrenados con paseos guiados para todos los niveles.',
      pettingMetaTitle: 'Zoologico interactivo | Zolten Ranch Adventures - San Antonio, TX',
      pettingMetaDescription: 'Visita el zoologico interactivo de Zolten Ranch Adventures y conoce cabras, ovejas, conejos y mas en San Antonio, TX.',
      pettingOgTitle: 'Zoologico interactivo en Zolten Ranch Adventures',
      pettingOgDescription: 'Experiencias interactivas con animales de granja para ninos y familias con encuentros cercanos y amigables.',
      homeHeroTitle: 'CREANDO UNA EXPERIENCIA ECUESTRE',
      homeHeroSubtitle: 'Una guia paso a paso para aventuras inolvidables',
      homeHeroBody: 'Paseos a caballo, zoologico interactivo y experiencias de rancho premium para familias en San Antonio, Texas',
      homeHeroNote: 'Reservas abiertas para paseos familiares, visitas privadas y experiencias de rancho',
      homeTrustStarsTitle: '4.9/5 Estrellas',
      homeTrustStarsBody: '500+ huespedes felices',
      homeTrustQualityTitle: 'Calidad premium',
      homeTrustQualityBody: 'De lo mejor en Texas',
      homeTrustSavingsTitle: 'Ahorro para grupos pequenos',
      homeTrustSavingsBody: 'Descuentos automaticos por jinetes',
      homeTrustFamilyTitle: 'Ideal para familias',
      homeTrustFamilyBody: '15+ anos de experiencia',
      homeExperiencesTitle: 'Nuestras experiencias',
      homeExperiencesBody: 'Descubre la aventura perfecta para tus necesidades y nivel',
      homeExperienceTrailTitle: 'Paseos por senderos',
      homeExperienceTrailBody: 'Recorre senderos escenicos en caballos bien entrenados. Ideal para todos los niveles. Tours guiados de 1 a 4 horas por hermosos paisajes de Texas.',
      homeExperienceCareTitle: 'Lecciones de cuidado del caballo',
      homeExperienceCareBody: 'Aprende equitacion y cuidado animal con instructores certificados. Gana confianza y conexion con estos magnificos animales.',
      homeExperienceFamilyTitle: 'Paquetes familiares',
      homeExperienceFamilyBody: 'Experiencias familiares todo incluido con paseos, acceso al zoologico interactivo, lecciones y comida estilo rancho.',
      homeExperienceZooTitle: 'Zoologico interactivo',
      homeExperienceZooBody: 'Una experiencia con animales de granja ideal para ninos. Ambiente seguro y supervisado para aprender sobre su cuidado y comportamiento.',
      homeExperienceEventsTitle: 'Eventos especiales',
      homeExperienceEventsBody: 'Celebra cumpleanos, eventos corporativos o reuniones familiares con paquetes personalizables y personal dedicado.',
      homeExperienceToursTitle: 'Tours escenicos',
      homeExperienceToursBody: 'Explora mas de 100 acres de paisaje texano con tours guiados que muestran fauna local y atractivos naturales todo el ano.',
      homeStoriesTitle: 'Historias de nuestros huespedes',
      homeStoriesBody: 'Experiencias reales de familias que crearon recuerdos inolvidables con nosotros',
      homeTestimonial1: '"La mejor experiencia familiar en anos. Personal profesional, caballos hermosos y un ambiente increible. Nuestros hijos siguen hablando de eso."',
      homeTestimonial1Meta: 'Familia de 4, San Antonio',
      homeTestimonial2: '"El retiro corporativo perfecto. El equipo salio con energia, unido y feliz. Muy profesionales y atentos a cada necesidad."',
      homeTestimonial2Meta: 'Grupo corporativo, Austin',
      homeTestimonial3: '"Ya hemos ido tres veces y seguimos regresando. El zoologico interactivo fue increible para nuestro pequeno y los paseos fueron espectaculares."',
      homeTestimonial3Meta: 'Visitante frecuente, Houston',
      homeCtaTitle: 'Listo para tu aventura?',
      homeCtaBody: 'Crea recuerdos duraderos con tu familia y amigos en Zolten Ranch Adventures',
      pricingHeroTitle: '💰 Precios transparentes',
      pricingHeroBody: 'Experiencias premium a precios justos. Sin cargos ocultos ni sorpresas.',
      pricingPackagesTitle: 'Paquetes de paseo',
      pricingPackagesBody: 'Elige la aventura perfecta para tu grupo',
      pricingAddOnsTitle: '🎁 Servicios adicionales',
      pricingAddOnsBody: 'Mejora tu experiencia con estos extras opcionales',
      pricingDiscountsTitle: '👥 Descuentos para grupos',
      pricingDiscountsBody: 'Reserva para tu grupo y ahorra. Mientras mas personas vengan, mayor sera el descuento.',
      pricingFaqTitle: '❓ Preguntas sobre precios',
      pricingFaqBody: 'Preguntas comunes sobre nuestros precios',
      pricingQuestion1: 'Hay cargos ocultos?',
      pricingAnswer1: 'No. Todos los precios publicados incluyen la experiencia, guia, equipo y refrigerios basicos. Cualquier extra se muestra claramente desde el inicio.',
      pricingQuestion2: 'Ofrecen descuentos para grupos grandes?',
      pricingAnswer2: 'Si. Los descuentos se aplican automaticamente segun la cantidad de jinetes en tu reserva. Los niveles actuales siempre coinciden con el proceso de reserva.',
      pricingQuestion3: 'Que incluye el precio?',
      pricingAnswer3: 'El precio incluye guia con experiencia, caballo, equipo de seguridad, refrigerios y acceso a nuestras instalaciones. Cada paquete muestra lo incluido.',
      pricingQuestion4: 'Con cuanta anticipacion debo reservar?',
      pricingAnswer4: 'Puedes reservar de 1 a 30 dias antes. Para fines de semana y dias festivos recomendamos apartar con 2 o 3 semanas de anticipacion.',
      pricingQuestion5: 'Cual es su politica de cancelacion?',
      pricingAnswer5: 'Reembolso completo para cancelaciones con 7 o mas dias de anticipacion. Reembolso del 50% dentro de los 7 dias. Reagendar no tiene costo.',
      pricingQuestion6: 'Ofrecen certificados de regalo?',
      pricingAnswer6: 'Si. Los certificados de regalo estan disponibles por cualquier monto y no vencen. Son ideales para cualquier ocasion.',
      pricingLoadingPackages: 'Cargando precios en vivo...',
      pricingLoadingAddOns: 'Cargando extras...',
      pricingLoadingDiscounts: 'Cargando descuentos para grupos...',
      pricingNoPackages: 'No hay paquetes disponibles en este momento.',
      pricingNoAddOns: 'No hay extras activos en este momento.',
      pricingNoDiscounts: 'No hay descuentos para grupos configurados ahora mismo.',
      pricingErrorPackages: 'No se pudieron cargar los precios en este momento.',
      pricingErrorAddOns: 'No se pudieron cargar los extras en este momento.',
      pricingErrorDiscounts: 'No se pudieron cargar los descuentos en este momento.',
      pricingPerPersonHour: 'por persona / {hours} hora|por persona / {hours} horas',
      pricingPerRider: 'por jinete',
      pricingPerBooking: 'por reserva',
      pricingPeopleRange: '{min}+{max} personas',
      pricingOffPercent: '{percent}% MENOS',
      pricingAutoSavings: 'Ahorro automatico al pagar',
      pricingPackage1Title: 'Paseo rapido por el rancho',
      pricingPackage1Subtitle: 'Ideal para principiantes',
      pricingPackage1Description: 'Una introduccion relajada al rancho con un paseo guiado y escenico.',
      pricingPackage2Title: 'Paseo clasico por sendero',
      pricingPackage2Subtitle: 'Nuestra opcion mas popular',
      pricingPackage2Description: 'Mas tiempo en el sendero para familias y grupos pequenos que quieren una experiencia completa.',
      pricingPackage4Title: 'Aventura de medio dia',
      pricingPackage4Subtitle: 'Mas tiempo de rancho, mas recuerdos',
      pricingPackage4Description: 'Una salida extendida por el rancho con paradas extra y mas tiempo montando.',
      pricingPackage8Title: 'Experiencia completa de rancho',
      pricingPackage8Subtitle: 'El dia completo en el rancho',
      pricingPackage8Description: 'Nuestra experiencia mas larga con paseo inmersivo y acceso al rancho todo el dia.',
      pricingFeature1a: 'Guia profesional incluido',
      pricingFeature1b: 'Caballos bien entrenados',
      pricingFeature1c: 'Casco de seguridad incluido',
      pricingFeature1d: 'Ideal para principiantes',
      pricingFeature1e: 'Sendero escenico de 1 hora',
      pricingFeature2a: 'Guia experto incluido',
      pricingFeature2b: 'Caballos premium',
      pricingFeature2c: 'Casco de seguridad incluido',
      pricingFeature2d: 'Agua disponible',
      pricingFeature2e: 'Hermoso recorrido de 2 horas',
      pricingFeature4a: 'Guia con experiencia incluido',
      pricingFeature4b: 'Eleccion de caballos',
      pricingFeature4c: 'Ruta extendida por el rancho',
      pricingFeature4d: 'Oportunidades para fotos',
      pricingFeature4e: 'Acceso al zoologico interactivo',
      pricingFeature8a: 'Guia personal incluido',
      pricingFeature8b: 'Acceso extendido a senderos',
      pricingFeature8c: 'Acceso al zoologico interactivo',
      pricingFeature8d: 'Leccion de cuidado del caballo',
      pricingFeature8e: 'Recorrido por el rancho',
      bookingTitle: '🐎 Reserva de paseo',
      bookingSubtitle: 'Reserva tu aventura en Zolten Ranch',
      bookingStepInfo: 'Tus datos',
      bookingStepDate: 'Fecha y hora',
      bookingStepDetails: 'Detalles',
      bookingStepReview: 'Revision',
      bookingInfoTitle: '👤 Tu informacion',
      bookingNameLabel: 'Nombre completo',
      bookingEmailLabel: 'Correo electronico',
      bookingPhoneLabel: 'Telefono',
      bookingAgeGroupLabel: 'Grupo de edad',
      bookingNamePlaceholder: 'Juan Perez',
      bookingEmailPlaceholder: 'juan@ejemplo.com',
      bookingPhonePlaceholder: '(555) 123-4567',
      bookingAgeSelect: 'Selecciona tu grupo de edad',
      bookingAgeChild: 'Nino (5-12)',
      bookingAgeTeen: 'Adolescente (13-17)',
      bookingAgeAdult: 'Adulto (18-65)',
      bookingAgeSenior: 'Adulto mayor (65+)',
      bookingDateTitle: '📅 Selecciona fecha y hora',
      bookingDateLabel: 'Fecha preferida',
      bookingDateHint: 'Selecciona una fecha entre 1 y 30 dias de anticipacion',
      bookingTimeLabel: 'Hora preferida',
      bookingTimeHint: 'Selecciona una fecha para ver horarios disponibles',
      bookingDetailsTitle: '🐴 Detalles de la experiencia',
      bookingDurationLabel: 'Duracion',
      bookingDurationHintLoading: 'Cargando precios del paquete...',
      bookingRidersLabel: 'Numero de jinetes',
      bookingExperienceLabel: 'Experiencia montando',
      bookingExperienceSelect: 'Selecciona tu nivel',
      bookingExperienceBeginner: 'Principiante - Primera vez',
      bookingExperienceIntermediate: 'Intermedio - Ya he montado',
      bookingExperienceAdvanced: 'Avanzado - Jinete frecuente',
      bookingAddOnsLabel: 'Extras opcionales',
      bookingAddOnsHint: 'Elige cualquier extra que quieras incluir en tu reserva.',
      bookingRequestsLabel: 'Solicitudes especiales o necesidades alimenticias',
      bookingRequestsPlaceholder: 'Cuéntanos si necesitas alguna adaptacion especial...',
      bookingRequestsHint: 'Incluye cualquier restriccion alimenticia para las comidas',
      bookingReviewTitle: '✅ Revisa tu reserva',
      bookingSummaryTitle: 'Resumen de la reserva',
      bookingSummaryName: 'Nombre:',
      bookingSummaryEmail: 'Correo:',
      bookingSummaryPhone: 'Telefono:',
      bookingSummaryDateTime: 'Fecha y hora:',
      bookingSummaryDuration: 'Duracion:',
      bookingSummaryRiders: 'Jinetes:',
      bookingSummaryPackage: 'Paquete:',
      bookingSummaryDiscount: 'Descuento grupal:',
      bookingSummaryAddOns: 'Extras:',
      bookingSummaryTotal: 'Precio total:',
      bookingSummaryNone: 'Ninguno',
      bookingConfirmationTitle: '✓ Confirmacion de reserva',
      bookingConfirmationBody: 'Te enviaremos un correo de confirmacion con todos los detalles y un enlace para reagendar si hace falta.',
      bookingPrev: '← Anterior',
      bookingNext: 'Siguiente →',
      bookingComplete: '🎟️ Completar reserva',
      bookingNoAddOns: 'No hay extras disponibles en este momento.',
      bookingAddOnPerRider: 'Se cobra por jinete',
      bookingAddOnPerBooking: 'Se cobra una vez por reserva',
      bookingDateClosed: 'Esta fecha esta cerrada. Elige otra fecha.',
      bookingLoadDatesError: 'No se pudieron cargar las fechas no disponibles.',
      bookingLoadPricingError: 'No se pudieron cargar los precios en este momento.',
      bookingLoadSettingsError: 'Las reservas no estan disponibles mientras cargamos el horario del rancho.',
      bookingAvailabilityError: 'No se pudo verificar la disponibilidad en este momento. Intentalo de nuevo pronto.',
      bookingDateClosedStatus: '✗ El rancho esta cerrado en esta fecha. Elige otro dia.',
      bookingAvailableSlots: '✓ {count} horarios disponibles - Reserva ahora',
      bookingLimitedSlots: '⚠ Solo quedan {count} horarios disponibles - Reserva pronto',
      bookingNoSlots: '✗ Todos los horarios alcanzaron la capacidad de jinetes para esta fecha. Prueba otro dia u hora.',
      bookingAvailabilityLoadFailed: 'No se pudo cargar la disponibilidad. Intentalo de nuevo en breve.',
      bookingSlotRemaining: '{time} ({count} lugares para jinetes disponibles)',
      bookingSlotFull: '{time} (Lleno)',
      bookingFillRequired: 'Completa {field}',
      bookingFillAllFields: 'todos los campos obligatorios',
      bookingEmailInvalid: 'Ingresa un correo electronico valido.',
      bookingSelectTime: 'Selecciona una hora para la reserva.',
      bookingConfirmed: '✓ Reserva confirmada. Revisa tu correo para ver los detalles.',
      bookingSubmitError: 'Error al enviar la reserva: {message}',
      bookingDurationOption: '{hours} Hora|{hours} Horas',
      bookingDurationSummary: '{hours} hora|{hours} horas',
      bookingPerRiderPrice: '{price} por jinete',
      bookingPackageFallback: '-',
      bookingPackageHintFallback: 'Elige el paquete que mejor se adapte a tu visita.',
      faqHeroTitle: '❓ Preguntas frecuentes',
      faqHeroBody: 'Encuentra respuestas a preguntas comunes sobre nuestras experiencias en el rancho',
      faqFilterAll: 'Todas las preguntas',
      faqFilterBooking: 'Reservas',
      faqFilterExperience: 'Experiencia',
      faqFilterSafety: 'Seguridad',
      faqFilterPricing: 'Precios',
      faqBookingQuestion1: 'Como hago una reserva?',
      faqBookingAnswer1: 'Reservar es facil. Solo haz clic en el boton de reservar, completa tu informacion, elige la fecha y hora que prefieras y selecciona la duracion de tu experiencia. Puedes reservar en linea en cualquier momento.',
      faqBookingQuestion2: 'Con cuanta anticipacion debo reservar?',
      faqBookingAnswer2: 'Aceptamos reservas entre 1 y 30 dias de anticipacion. Para fines de semana y dias festivos recomendamos reservar al menos con 2 o 3 semanas para asegurar disponibilidad.',
      faqBookingQuestion3: 'Que metodos de pago aceptan?',
      faqBookingAnswer3: 'Aceptamos las principales tarjetas de credito, PayPal y transferencias bancarias. El pago se realiza al momento de reservar en linea y recibes tu comprobante de inmediato.',
      faqBookingQuestion4: 'Puedo cancelar o reagendar mi reserva?',
      faqBookingAnswer4: 'Si. Las cancelaciones realizadas con 7 dias de anticipacion reciben reembolso completo. Dentro de 7 dias el reembolso es del 50%. Puedes reagendar sin costo usando el enlace del correo de confirmacion.',
      faqExperienceQuestion1: 'Cual es la edad minima para paseos por sendero?',
      faqExperienceAnswer1: 'Ninos desde los 5 anos pueden participar en nuestros paseos familiares si pueden sentarse con seguridad en el caballo. Los menores de 12 anos deben ir acompanados por un adulto. Elegimos el caballo adecuado para cada persona.',
      faqExperienceQuestion2: 'Necesito experiencia previa montando?',
      faqExperienceAnswer2: 'No necesitas experiencia. Nuestros caballos son nobles y bien entrenados. Tenemos senderos para principiantes y nuestros guias te explican todo. Hay opciones para todos los niveles.',
      faqExperienceQuestion3: 'Que debo usar?',
      faqExperienceAnswer3: '<p>Usa ropa comoda y resistente. Recomendamos:</p><ul><li>Pantalon largo (sin shorts ni faldas)</li><li>Zapatos cerrados o botas con tacon</li><li>Ropa en capas - puede sentirse mas fresco de lo esperado</li><li>Protector solar y sombrero</li></ul><p>Nosotros proporcionamos cascos.</p>',
      faqExperienceQuestion4: 'Cuanto duran los paseos?',
      faqExperienceAnswer4: '<p>Ofrecemos opciones flexibles:</p><ul><li><strong>1 Hora:</strong> Perfecta para principiantes y ninos pequenos</li><li><strong>2 Horas:</strong> Excelente para familias que quieren una experiencia completa</li><li><strong>Medio dia (4 horas):</strong> Incluye mas tiempo de rancho</li><li><strong>Dia completo (8 horas):</strong> Nuestra experiencia mas inmersiva</li></ul>',
      faqSafetyQuestion1: 'Es seguro montar a caballo?',
      faqSafetyAnswer1: 'La seguridad es nuestra prioridad. Usamos caballos mansos y bien entrenados y proporcionamos cascos para todos los jinetes. Nuestros guias lideran cada paseo y explican todo antes de comenzar.',
      faqSafetyQuestion2: 'Que pasa si tengo limitaciones fisicas?',
      faqSafetyAnswer2: 'Contactanos antes de reservar. Trabajamos con jinetes de distintas habilidades fisicas y podemos hablar sobre adaptaciones, experiencias adecuadas y una visita comoda.',
      faqSafetyQuestion3: 'Pueden montar las mujeres embarazadas?',
      faqSafetyAnswer3: 'Recomendamos consultar a tu medico antes de reservar si estas embarazada. Por seguridad normalmente evitamos paseos durante el segundo y tercer trimestre. Contactanos para revisar opciones.',
      faqPricingQuestion1: 'Cuanto cuesta un paseo por sendero?',
      faqPricingAnswer1: 'El precio depende de la duracion, los extras y el tamano del grupo. Las tarifas actuales y descuentos automaticos siempre aparecen en nuestra <a href="/pricing.html">pagina de precios</a>.',
      faqPricingQuestion2: 'Hay descuentos para grupos?',
      faqPricingAnswer2: 'Si. Los descuentos grupales se aplican automaticamente segun el numero de jinetes en tu reserva. Los niveles vigentes aparecen en la pagina de precios.',
      faqPricingQuestion3: 'Venden certificados de regalo?',
      faqPricingAnswer3: 'Claro. Los certificados de regalo son perfectos para cualquier ocasion. Estan disponibles por cualquier monto y no vencen. La persona puede reservar cualquier experiencia en nuestro sitio.',
      faqGeneralQuestion: 'Como puedo contactarlos?',
      faqGeneralAnswer: '<p>Nos encantara saber de ti.</p><ul><li><strong>Telefono:</strong> <a href="tel:+12107694164" class="js-setting-phone">210-769-4164</a></li><li><strong>Correo:</strong> <a href="mailto:info@zoltenranch.com" class="js-setting-contact-email">info@zoltenranch.com</a></li><li><strong>Horario:</strong> <span class="js-setting-daily-hours">Abierto todos los dias 9:00 AM - 5:00 PM</span></li><li><strong>Ubicacion:</strong> San Antonio, TX</li></ul>'
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

  function readBusinessSettingsCache() {
    const cached = readSessionCache(BUSINESS_SETTINGS_CACHE_KEY);
    if (!cached) return null;

    return {
      settings: cached.settings || null,
      weekly: Array.isArray(cached.weekly) ? cached.weekly : [],
    };
  }

  function writeBusinessSettingsCache(settings, weekly) {
    writeSessionCache(BUSINESS_SETTINGS_CACHE_KEY, { settings, weekly }, BUSINESS_SETTINGS_CACHE_TTL_MS);
  }

  async function fetchPublicSiteData(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = readSessionCache(PUBLIC_SITE_DATA_CACHE_KEY, PUBLIC_SITE_DATA_CACHE_TTL_MS);
      if (cached) return cached;
    }

    const response = await fetch('/site-data.json');
    if (!response.ok) {
      throw new Error('Failed to fetch public site data');
    }

    const payload = await response.json();
    writeSessionCache(PUBLIC_SITE_DATA_CACHE_KEY, payload, PUBLIC_SITE_DATA_CACHE_TTL_MS);
    return payload;
  }

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
    return 'en';
  }

  function setStoredLanguage(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'en');
    } catch (_error) {
      // Ignore storage failures and keep the site in English.
    }
  }

  function setupMobileNavigation() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    if (!nav || !navLinks) return;

    let container = nav.querySelector('.nav-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'nav-container';

      while (nav.firstChild) {
        container.appendChild(nav.firstChild);
      }

      nav.appendChild(container);
    }

    let button = container.querySelector('.mobile-menu-btn') || nav.querySelector('.mobile-menu-btn');
    const menuId = navLinks.id || 'site-mobile-menu';
    navLinks.id = menuId;

    let overlay = document.querySelector('.site-nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'site-nav-overlay';
      document.body.appendChild(overlay);
    }

    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-menu-btn';
      button.setAttribute('aria-label', 'Toggle navigation menu');
      button.setAttribute('aria-haspopup', 'true');
      container.appendChild(button);
    }

    button.setAttribute('aria-controls', menuId);

    const setMenuState = (isOpen) => {
      navLinks.classList.toggle('active', isOpen);
      navLinks.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.classList.toggle('nav-open', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '✕' : '☰';
    };

    const updateOffset = () => {
      const navHeight = Math.ceil(nav.getBoundingClientRect().height || nav.offsetHeight || 84);
      document.documentElement.style.setProperty('--site-nav-offset', `${navHeight}px`);
      if (window.innerWidth > 1024) {
        setMenuState(false);
      }
    };

    setMenuState(false);

    if (!button.dataset.siteNavManaged) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuState(!navLinks.classList.contains('active'));
      });
      button.dataset.siteNavManaged = 'true';
    }

    if (!overlay.dataset.siteNavManaged) {
      overlay.addEventListener('click', () => setMenuState(false));
      overlay.dataset.siteNavManaged = 'true';
    }

    if (!document.body.dataset.siteNavEscapeManaged) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          setMenuState(false);
        }
      });
      document.body.dataset.siteNavEscapeManaged = 'true';
    }

    window.addEventListener('resize', updateOffset, { passive: true });
    updateOffset();
  }

  function injectLanguageToggle() {
    document.querySelectorAll('.lang-toggle-slot, .lang-toggle').forEach((node) => {
      node.remove();
    });
  }

  function updateToggleState(lang) {
    return lang;
  }

  function applyDataI18n(lang) {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!key) return;
      const attributeName = node.getAttribute('data-i18n-attr');
      if (attributeName) {
        node.setAttribute(attributeName, t(lang, key));
        return;
      }
      node.textContent = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((node) => {
      const key = node.getAttribute('data-i18n-html');
      if (!key) return;
      node.innerHTML = t(lang, key);
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
    const cached = readBusinessSettingsCache();
    if (cached?.settings) {
      return cached;
    }

    try {
      const siteData = await fetchPublicSiteData();
      if (siteData?.settings) {
        const snapshotSettings = {
          settings: siteData.settings,
          weekly: siteData.weekly || [],
        };
        writeBusinessSettingsCache(snapshotSettings.settings, snapshotSettings.weekly);
        return snapshotSettings;
      }
    } catch (_error) {
      // Fall back to API routes when the generated site snapshot is not ready.
    }

    const response = await fetch('/api/settings?include_schedule=1');
    if (!response.ok) throw new Error('Failed to fetch settings');
    const payload = await response.json();
    const settings = payload.settings || payload;

    const weekly = payload.weekly || [];

    writeBusinessSettingsCache(settings, weekly);

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
    const normalized = 'en';
    setStoredLanguage(normalized);
    document.documentElement.lang = normalized;
    updateToggleState(normalized);
    applyDataI18n(normalized);
    applyLinkTranslations(normalized);
    applyTextTranslations(normalized);
    if (cachedBusinessSettings) {
      applyBusinessSettings(cachedBusinessSettings, cachedWeeklySchedule);
    }

    window.dispatchEvent(new CustomEvent('zolten:languagechange', {
      detail: { lang: normalized }
    }));
  }

  window.ZoltenSiteI18n = {
    getLanguage: getStoredLanguage,
    translate(key, replacements = {}, lang = getStoredLanguage()) {
      let value = t(lang, key);

      Object.entries(replacements).forEach(([replacementKey, replacementValue]) => {
        value = value.replaceAll(`{${replacementKey}}`, String(replacementValue));
      });

      return value;
    },
    applyLanguage
  };

  window.ZoltenSiteCache = {
    getSessionJson(key, ttlMs) {
      return readSessionCache(key, ttlMs);
    },
    setSessionJson(key, value, ttlMs) {
      writeSessionCache(key, value, ttlMs);
    }
  };

  window.ZoltenPublicData = {
    getSnapshot(forceRefresh = false) {
      return fetchPublicSiteData(forceRefresh);
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    injectLanguageToggle();
    setupMobileNavigation();
    applyLanguage('en');

    try {
      const { settings, weekly } = await fetchBusinessSettings();
      cachedBusinessSettings = settings;
      cachedWeeklySchedule = weekly;
      applyBusinessSettings(settings, weekly);
      applyLanguage('en');
    } catch (error) {
      console.error('Failed to apply site enhancements:', error);
    }
  });
})();