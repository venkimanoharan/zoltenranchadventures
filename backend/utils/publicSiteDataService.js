const fs = require('fs/promises');
const path = require('path');
const { getBaseSettings, getClosedDatesInRange, getWeeklySchedule } = require('./scheduleService');
const { getPricingCatalog } = require('./pricingService');

const PUBLIC_SNAPSHOT_DAYS_AHEAD = Number(process.env.PUBLIC_SNAPSHOT_DAYS_AHEAD || 120);

function resolveSnapshotPath() {
  return path.join(__dirname, '..', '..', 'public', 'site-data.json');
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function buildPublicSiteDataSnapshot(db) {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + PUBLIC_SNAPSHOT_DAYS_AHEAD);

  const from = formatDate(startDate);
  const to = formatDate(endDate);

  const [settings, weekly, pricing, closed_dates] = await Promise.all([
    getBaseSettings(db),
    getWeeklySchedule(db),
    getPricingCatalog(db),
    getClosedDatesInRange(db, from, to),
  ]);

  return {
    generated_at: new Date().toISOString(),
    settings,
    weekly,
    pricing,
    closed_dates_range: { from, to },
    closed_dates,
  };
}

async function writePublicSiteDataSnapshot(db) {
  const payload = await buildPublicSiteDataSnapshot(db);
  await fs.writeFile(resolveSnapshotPath(), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

module.exports = {
  buildPublicSiteDataSnapshot,
  writePublicSiteDataSnapshot,
};