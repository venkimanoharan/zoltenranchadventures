const PACKAGE_DEFINITIONS = [
  {
    duration_hours: 1,
    code: 'quick-ride',
    title: 'Quick Ride',
    subtitle: 'Perfect for first-timers',
    description: '1-hour scenic trail ride with experienced guide',
    icon: '🐴',
    featured: false,
  },
  {
    duration_hours: 2,
    code: 'full-adventure',
    title: 'Full Adventure',
    subtitle: 'Most popular choice',
    description: 'Extended trail ride with refreshments',
    icon: '⭐',
    featured: true,
  },
  {
    duration_hours: 4,
    code: 'half-day',
    title: 'Half Day',
    subtitle: 'For adventure seekers',
    description: 'Deep ranch experience with extra ranch time',
    icon: '🌄',
    featured: false,
  },
  {
    duration_hours: 8,
    code: 'full-day',
    title: 'Full Day Pro',
    subtitle: 'Ultimate experience',
    description: 'Complete ranch immersion experience',
    icon: '🌅',
    featured: false,
  },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDuration(durationValue) {
  const duration = Number(durationValue);
  if (!Number.isFinite(duration)) return null;
  return Math.round(duration);
}

function parseAddOnIds(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry > 0);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((entry) => Number(entry.trim()))
      .filter((entry) => Number.isInteger(entry) && entry > 0);
  }

  return [];
}

function buildPackageCatalog(settings) {
  return PACKAGE_DEFINITIONS.map((definition) => ({
    ...definition,
    price_per_person: toNumber(settings[`package_price_${definition.duration_hours}h`], 0),
  }));
}

function findPackageForDuration(settings, durationHours) {
  const normalizedDuration = normalizeDuration(durationHours);
  if (!normalizedDuration) return null;
  return buildPackageCatalog(settings).find((pkg) => pkg.duration_hours === normalizedDuration) || null;
}

function findApplicableDiscount(groupDiscounts, riders) {
  return groupDiscounts.find((discount) => {
    const min = Number(discount.min_riders || 0);
    const max = discount.max_riders === null ? null : Number(discount.max_riders);
    return riders >= min && (max === null || riders <= max);
  }) || null;
}

async function getPricingCatalog(db) {
  const settingsResult = await db.query(
    `SELECT
       package_price_1h,
       package_price_2h,
       package_price_4h,
       package_price_8h
     FROM ranch_settings
     ORDER BY id DESC
     LIMIT 1`
  );

  if (settingsResult.rows.length === 0) {
    throw new Error('Pricing settings not found');
  }

  const [addOnsResult, discountsResult] = await Promise.all([
    db.query(
      `SELECT id, code, name, name_es, description, description_es, price, charge_type, icon, display_order, is_active
       FROM pricing_addons
       WHERE is_active = TRUE
       ORDER BY display_order ASC, id ASC`
    ),
    db.query(
      `SELECT id, min_riders, max_riders, discount_percent, description, description_es, display_order, is_active
       FROM group_discounts
       WHERE is_active = TRUE
       ORDER BY min_riders ASC, id ASC`
    )
  ]);

  const settings = settingsResult.rows[0];
  const packages = buildPackageCatalog(settings);

  return {
    packages,
    add_ons: addOnsResult.rows.map((row) => ({
      ...row,
      price: toNumber(row.price, 0),
    })),
    group_discounts: discountsResult.rows.map((row) => ({
      ...row,
      discount_percent: toNumber(row.discount_percent, 0),
    })),
  };
}

async function calculateBookingPricing(db, { durationHours, riders, addOnIds = [] }) {
  const catalog = await getPricingCatalog(db);
  const selectedPackage = catalog.packages.find((pkg) => pkg.duration_hours === normalizeDuration(durationHours));

  if (!selectedPackage) {
    throw new Error('Selected duration is not currently offered');
  }

  const safeRiders = Math.max(Number(riders) || 0, 1);
  const packageSubtotal = Number((selectedPackage.price_per_person * safeRiders).toFixed(2));
  const discount = findApplicableDiscount(catalog.group_discounts, safeRiders);
  const discountAmount = discount
    ? Number((packageSubtotal * (discount.discount_percent / 100)).toFixed(2))
    : 0;

  const selectedAddOns = catalog.add_ons.filter((addOn) => addOnIds.includes(addOn.id));
  const addOns = selectedAddOns.map((addOn) => {
    const quantity = addOn.charge_type === 'per_rider' ? safeRiders : 1;
    const total_price = Number((addOn.price * quantity).toFixed(2));
    return {
      ...addOn,
      quantity,
      total_price,
    };
  });

  const addOnsTotal = Number(addOns.reduce((sum, addOn) => sum + addOn.total_price, 0).toFixed(2));
  const total = Number((packageSubtotal - discountAmount + addOnsTotal).toFixed(2));

  return {
    package: selectedPackage,
    package_subtotal: packageSubtotal,
    discount,
    discount_amount: discountAmount,
    add_ons: addOns,
    add_ons_total: addOnsTotal,
    total,
  };
}

module.exports = {
  PACKAGE_DEFINITIONS,
  buildPackageCatalog,
  calculateBookingPricing,
  findPackageForDuration,
  getPricingCatalog,
  parseAddOnIds,
};
