function toMinutes(timeValue) {
  const raw = String(timeValue || '').slice(0, 8);
  const [h, m] = raw.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function withDefaults(base, overrides = {}) {
  return {
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

async function getBaseSettings(db) {
  const result = await db.query('SELECT * FROM ranch_settings ORDER BY id DESC LIMIT 1');
  if (result.rows.length === 0) {
    throw new Error('Settings not found');
  }
  return result.rows[0];
}

async function resolveEffectiveSettings(db, dateStr) {
  const base = await getBaseSettings(db);
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
  const weeklyResult = await db.query(
    'SELECT * FROM weekly_schedule WHERE day_of_week = $1 LIMIT 1',
    [dayOfWeek]
  );

  if (weeklyResult.rows.length > 0) {
    effective = withDefaults(effective, weeklyResult.rows[0]);
    source = 'weekly';
  }

  return { ...effective, source };
}

module.exports = {
  getBaseSettings,
  isTimeInWindow,
  resolveEffectiveSettings,
};
