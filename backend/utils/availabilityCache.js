const AVAILABILITY_CACHE_TTL_MS = Number(process.env.AVAILABILITY_CACHE_TTL_MS || 30000);

const availabilityCache = new Map();

function isFresh(entry) {
  return Boolean(entry?.cachedAt) && (Date.now() - entry.cachedAt) < AVAILABILITY_CACHE_TTL_MS;
}

function getCachedAvailability(date) {
  const key = String(date || '');
  const entry = availabilityCache.get(key);

  if (!isFresh(entry)) {
    availabilityCache.delete(key);
    return null;
  }

  return entry.payload;
}

function setCachedAvailability(date, payload) {
  availabilityCache.set(String(date || ''), {
    cachedAt: Date.now(),
    payload,
  });
}

function invalidateAvailabilityCache(date) {
  if (date) {
    availabilityCache.delete(String(date));
    return;
  }

  availabilityCache.clear();
}

module.exports = {
  getCachedAvailability,
  invalidateAvailabilityCache,
  setCachedAvailability,
};