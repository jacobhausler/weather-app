/**
 * CacheService Usage Examples
 *
 * This file demonstrates how to use the CacheService in the weather app.
 * DO NOT import this file in production code - it's for reference only.
 */

import cacheService, {
  CacheKeyGenerator,
  CacheTTL,
  getTTLForDataType,
  CacheDataType
} from './cacheService.js';

// ============================================================================
// EXAMPLE 1: Caching NWS Points Data (24 hours)
// ============================================================================

async function fetchPointsData(lat: number, lon: number) {
  const cacheKey = CacheKeyGenerator.points(lat, lon);

  // Check cache first
  const cached = cacheService.get<unknown>(cacheKey);
  if (cached) {
    console.log('Cache hit for points data');
    return cached;
  }

  // Fetch from API
  console.log('Cache miss - fetching from NWS API');
  const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  const data = await response.json();

  // Cache with points TTL (24 hours)
  cacheService.set(cacheKey, data, CacheTTL.POINTS);

  return data;
}

// ============================================================================
// EXAMPLE 2: Caching Forecast Data (1 hour)
// ============================================================================

async function fetch7DayForecast(office: string, gridX: number, gridY: number) {
  const cacheKey = CacheKeyGenerator.forecast7Day(office, gridX, gridY);

  // Check cache first
  const cached = cacheService.get<unknown>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(
    `https://api.weather.gov/gridpoints/${office}/${gridX},${gridY}/forecast`
  );
  const data = await response.json();

  // Cache with forecast TTL (1 hour)
  cacheService.set(cacheKey, data, CacheTTL.FORECASTS);

  return data;
}

// ============================================================================
// EXAMPLE 3: Caching Current Observations (10 minutes)
// ============================================================================

async function fetchCurrentObservations(stationId: string) {
  const cacheKey = CacheKeyGenerator.observation(stationId);

  // Check cache first
  const cached = cacheService.get<unknown>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(
    `https://api.weather.gov/stations/${stationId}/observations/latest`
  );
  const data = await response.json();

  // Cache with observations TTL (10 minutes)
  cacheService.set(cacheKey, data, CacheTTL.OBSERVATIONS);

  return data;
}

// ============================================================================
// EXAMPLE 4: Caching Station Metadata (7 days)
// ============================================================================

async function fetchStationMetadata(stationId: string) {
  const cacheKey = CacheKeyGenerator.station(stationId);

  // Check cache first
  const cached = cacheService.get<unknown>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(
    `https://api.weather.gov/stations/${stationId}`
  );
  const data = await response.json();

  // Cache with station metadata TTL (7 days)
  cacheService.set(cacheKey, data, CacheTTL.STATION_METADATA);

  return data;
}

// ============================================================================
// EXAMPLE 5: Alerts - NO CACHING (Always fresh)
// ============================================================================

async function fetchAlerts(lat: number, lon: number) {
  // NOTE: Alerts are NOT cached - always fetch fresh
  // We still generate a key for consistency, but don't use it
  const response = await fetch(
    `https://api.weather.gov/alerts/active?point=${lat},${lon}`
  );
  const data = await response.json();

  // Do NOT cache alerts
  return data;
}

// ============================================================================
// EXAMPLE 6: Using getTTLForDataType Helper
// ============================================================================

function cacheWithAutoTTL(dataType: CacheDataType, key: string, value: unknown) {
  const ttl = getTTLForDataType(dataType);

  // Skip caching if TTL is 0 (like alerts)
  if (ttl === 0) {
    console.log('Skipping cache for data type with TTL=0');
    return;
  }

  cacheService.set(key, value, ttl);
}

// ============================================================================
// EXAMPLE 7: Batch Operations
// ============================================================================

function cacheMultipleForecasts() {
  const forecasts = [
    { office: 'ABQ', gridX: 45, gridY: 67, data: { /* forecast data */ } },
    { office: 'DFW', gridX: 23, gridY: 89, data: { /* forecast data */ } },
    { office: 'LAX', gridX: 12, gridY: 34, data: { /* forecast data */ } },
  ];

  const entries = forecasts.map(f => ({
    key: CacheKeyGenerator.forecast7Day(f.office, f.gridX, f.gridY),
    val: f.data,
    ttl: CacheTTL.FORECASTS
  }));

  cacheService.setMultiple(entries);
}

// ============================================================================
// EXAMPLE 8: Cache Statistics and Monitoring
// ============================================================================

function monitorCache() {
  const stats = cacheService.getStats();

  console.log('Cache Statistics:');
  console.log(`- Total keys: ${stats.keys}`);
  console.log(`- Cache hits: ${stats.hits}`);
  console.log(`- Cache misses: ${stats.misses}`);
  console.log(`- Hit rate: ${(stats.hits / (stats.hits + stats.misses) * 100).toFixed(2)}%`);
  console.log(`- Key size: ${stats.ksize} bytes`);
  console.log(`- Value size: ${stats.vsize} bytes`);
}

// ============================================================================
// EXAMPLE 9: Cache Invalidation
// ============================================================================

function invalidateForecastCache(office: string, gridX: number, gridY: number) {
  // Invalidate both 7-day and hourly forecasts
  const keys = [
    CacheKeyGenerator.forecast7Day(office, gridX, gridY),
    CacheKeyGenerator.forecastHourly(office, gridX, gridY)
  ];

  const deletedCount = cacheService.delMultiple(keys);
  console.log(`Invalidated ${deletedCount} forecast cache entries`);
}

// ============================================================================
// EXAMPLE 10: Custom Cache Keys
// ============================================================================

function cacheCustomData() {
  // For custom data not covered by the standard key generators
  const customKey = CacheKeyGenerator.custom('user-preferences', 'user123');

  const preferences = {
    units: 'imperial',
    theme: 'dark',
    favoriteZipCodes: ['75454', '75070', '75035']
  };

  // Cache for 1 day
  cacheService.set(customKey, preferences, 86400);
}

// ============================================================================
// EXAMPLE 11: Checking Cache Before Expensive Operations
// ============================================================================

async function getWeatherData(zipCode: string) {
  const geocodeKey = CacheKeyGenerator.geocode(zipCode);

  // Check if we have coordinates cached
  if (!cacheService.has(geocodeKey)) {
    console.log('Geocoding ZIP code...');
    // Perform expensive geocoding operation
    // ...
  } else {
    console.log('Using cached coordinates');
  }

  return cacheService.get(geocodeKey);
}

// ============================================================================
// BEST PRACTICES
// ============================================================================

/*
1. Always check cache before making API calls
2. Use appropriate TTL for each data type
3. Never cache alerts (security/safety critical)
4. Use batch operations when caching multiple items
5. Monitor cache statistics for optimization
6. Invalidate cache when data is known to be stale
7. Use typed cache keys with CacheKeyGenerator
8. Handle cache misses gracefully
9. Consider memory limits (max 1000 keys by default)
10. Use the singleton instance (cacheService) for consistency
*/

export {
  fetchPointsData,
  fetch7DayForecast,
  fetchCurrentObservations,
  fetchStationMetadata,
  fetchAlerts,
  cacheWithAutoTTL,
  cacheMultipleForecasts,
  monitorCache,
  invalidateForecastCache,
  cacheCustomData,
  getWeatherData
};