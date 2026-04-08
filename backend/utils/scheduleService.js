const SETTINGS_CACHE_TTL_MS = Number(process.env.SETTINGS_CACHE_TTL_MS || 300000);

const scheduleCache = {
  baseSettings: null,
  baseSettingsFetchedAt: 0,
  weeklySchedule: null,
  weeklyScheduleFetchedAt: 0,
};

function isCacheFresh(timestamp) {
  return Boolean(timestamp) && (Date.now() - timestamp) < SETTINGS_CACHE_TTL_MS;
}

function toMinutes(timeValue) {
  const raw = String(timeValue || '').slice(0, 8);
  const [h, m] = raw.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function withDefaults(base, overrides = {}) {
  return {
    ...base,
    open_time: overrides.open_time ?? base.open_time,
    close_time: overrides.close_time ?? base.close_time,
    max_bookings_per_hour: overrides.max_bookings_per_hour ?? base.max_bookings_per_hour,
    trail_price: overrides.trail_price ?? base.trail_price,
    is_closed: overrides.is_closed ?? false,
  };
}

function isTimeInWindow(timeValue, openTime, closeTime) {
  const minutes = toMinutes(timeValue);
  const openMinutes = toMinutes(openTime);
  const closeMinutes = toMinutes(closeTime);

  if (minutes === null || openMinutes === null || closeMinutes === null) {
    return false;
  }

  return minutes >= openMinutes && minutes < closeMinutes;
}

async function getBaseSettings(db, options = {}) {
  const { forceRefresh = false } = options;

  if (!forceRefresh && scheduleCache.baseSettings && isCacheFresh(scheduleCache.baseSettingsFetchedAt)) {
    return scheduleCache.baseSettings;
  }

  const result = await db.query('SELECT * FROM ranch_settings ORDER BY id DESC LIMIT 1');
  if (result.rows.length === 0) {
    throw new Error('Settings not found');
  }

  scheduleCache.baseSettings = result.rows[0];
  scheduleCache.baseSettingsFetchedAt = Date.now();

  return scheduleCache.baseSettings;
}

async function getWeeklySchedule(db, options = {}) {
  const { forceRefresh = false } = options;

  if (!forceRefresh && Array.isArray(scheduleCache.weeklySchedule) && isCacheFresh(scheduleCache.weeklyScheduleFetchedAt)) {
    return scheduleCache.weeklySchedule;
  }

  const result = await db.query('SELECT * FROM weekly_schedule ORDER BY day_of_week ASC');
  scheduleCache.weeklySchedule = result.rows;
  scheduleCache.weeklyScheduleFetchedAt = Date.now();
  return scheduleCache.weeklySchedule;
}

function invalidateScheduleCache() {
  scheduleCache.baseSettings = null;
  scheduleCache.baseSettingsFetchedAt = 0;
  scheduleCache.weeklySchedule = null;
  scheduleCache.weeklyScheduleFetchedAt = 0;
}

async function resolveEffectiveSettings(db, dateStr, options = {}) {
  const base = await getBaseSettings(db, options);
  let effective = withDefaults(base);
  let source = 'global';

  if (!dateStr) {
    return { ...effective, source };
  }

  const overrideResult = await db.query(
    'SELECT * FROM date_overrides WHERE override_date = $1 LIMIT 1',
    [dateStr]
  );

  if (overrideResult.rows.length > 0) {
    effective = withDefaults(effective, overrideResult.rows[0]);
    source = 'date_override';
    return { ...effective, source };
  }

  const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay();
  const weeklySchedule = await getWeeklySchedule(db, options);
  const weeklyMatch = weeklySchedule.find((row) => row.day_of_week === dayOfWeek);

  if (weeklyMatch) {
    effective = withDefaults(effective, weeklyMatch);
    source = 'weekly';
  }

  return { ...effective, source };
}

module.exports = {
  getBaseSettings,
  getWeeklySchedule,
  isTimeInWindow,
  invalidateScheduleCache,
  resolveEffectiveSettings,
};
