# Backend API Documentation

## Overview

The Weather App backend provides a RESTful API for fetching weather data from the National Weather Service (NWS). The server implements intelligent caching, background refresh jobs, and comprehensive error handling to provide a reliable weather data service.

**Base URL**: `http://localhost:3001/api`

**Technology Stack**:
- Fastify (Node.js framework)
- TypeScript
- Axios (HTTP client)
- NodeCache (in-memory caching)
- node-cron (background jobs)

---

## Table of Contents

1. [Health Check Endpoints](#health-check-endpoints)
2. [Weather Data Endpoints](#weather-data-endpoints)
3. [Cache Management Endpoints](#cache-management-endpoints)
4. [Background Jobs Endpoints](#background-jobs-endpoints)
5. [Data Transformation Layer](#data-transformation-layer)
6. [Caching Implementation](#caching-implementation)
7. [Error Handling](#error-handling)
8. [Background Jobs](#background-jobs)

---

## Health Check Endpoints

### 1. GET /api/health

Basic health check endpoint to verify server is running.

**Request**:
```http
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T12:34:56.789Z",
  "uptime": 12345.67,
  "service": "weather-app-server",
  "version": "1.0.0"
}
```

**Response Fields**:
- `status` (string): Server status ("ok")
- `timestamp` (string): ISO 8601 timestamp of the response
- `uptime` (number): Server uptime in seconds
- `service` (string): Service name identifier
- `version` (string): Application version

**Status Codes**:
- `200` - Server is healthy and running

---

### 2. GET /api/health/detailed

Detailed health check with system information and memory usage.

**Request**:
```http
GET /api/health/detailed
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T12:34:56.789Z",
  "uptime": 12345.67,
  "service": "weather-app-server",
  "version": "1.0.0",
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "arch": "x64",
    "memory": {
      "heapUsed": "45 MB",
      "heapTotal": "64 MB",
      "rss": "98 MB",
      "external": "2 MB"
    }
  }
}
```

**Response Fields**:
- All fields from basic health check, plus:
- `system.nodeVersion` (string): Node.js runtime version
- `system.platform` (string): Operating system platform
- `system.arch` (string): System architecture
- `system.memory.heapUsed` (string): V8 heap memory used
- `system.memory.heapTotal` (string): V8 total heap memory
- `system.memory.rss` (string): Resident Set Size (total memory)
- `system.memory.external` (string): External memory (C++ objects)

**Status Codes**:
- `200` - Server is healthy and running

---

## Weather Data Endpoints

### 3. GET /api/weather/:zipcode

Fetch complete weather package for a ZIP code. This is the primary endpoint for retrieving weather data.

**Request**:
```http
GET /api/weather/75454
```

**Path Parameters**:
- `zipcode` (string, required): 5-digit US ZIP code (pattern: `^\d{5}$`)

**Response** (200 OK):
```typescript
{
  zipCode: string                      // "75454"
  coordinates: {
    latitude: number                   // 33.1951
    longitude: number                  // -96.6297
  }
  gridPoint: {
    gridId: string                     // "FWD"
    gridX: number                      // 78
    gridY: number                      // 102
    forecast: string                   // First period short forecast
    forecastHourly: string             // First hourly period short forecast
    observationStations: string        // Station ID URL
  }
  forecast: ForecastPeriod[]           // Array of 14 periods (7 days)
  hourlyForecast: HourlyForecast[]     // Array of ~156 hourly periods
  currentObservation?: Observation     // Current conditions (optional)
  alerts: Alert[]                      // Active weather alerts
  uvIndex?: UVIndex | null             // UV Index data (optional)
  sunTimes: SunTimes                   // Sunrise/sunset times
  lastUpdated: string                  // ISO 8601 timestamp
}
```

**Forecast Period Type**:
```typescript
interface ForecastPeriod {
  number: number                       // Period number (1-14)
  name: string                         // "Tonight", "Monday", etc.
  startTime: string                    // ISO 8601 timestamp
  endTime: string                      // ISO 8601 timestamp
  isDaytime: boolean                   // true for day, false for night
  temperature: number                  // Temperature value
  temperatureUnit: string              // "F" or "C"
  temperatureTrend?: string            // "rising", "falling", or null
  probabilityOfPrecipitation?: {
    value: number | null               // 0-100 percentage
  }
  windSpeed: string                    // "5 to 10 mph"
  windDirection: string                // "N", "NE", "E", etc.
  icon: string                         // NWS icon URL
  shortForecast: string                // "Partly Cloudy"
  detailedForecast: string             // Full text forecast
}
```

**Hourly Forecast Type**:
```typescript
interface HourlyForecast {
  number: number                       // Hour number
  startTime: string                    // ISO 8601 timestamp
  endTime: string                      // ISO 8601 timestamp
  isDaytime: boolean                   // Day or night
  temperature: number                  // Temperature
  temperatureUnit: string              // "F" or "C"
  probabilityOfPrecipitation?: {
    value: number | null               // 0-100 percentage
  }
  dewpoint: {
    value: number                      // Dewpoint temperature
    unitCode: string                   // "wmoUnit:degC"
  }
  relativeHumidity: {
    value: number                      // 0-100 percentage
  }
  windSpeed: string                    // "5 mph"
  windDirection: string                // "N", "NE", etc.
  icon: string                         // NWS icon URL
  shortForecast: string                // "Partly Cloudy"
}
```

**Observation Type**:
```typescript
interface Observation {
  timestamp: string                    // ISO 8601 timestamp
  temperature: {
    value: number | null               // Temperature in Celsius
    unitCode: string                   // "wmoUnit:degC"
  }
  dewpoint: {
    value: number | null               // Dewpoint in Celsius
    unitCode: string                   // "wmoUnit:degC"
  }
  windDirection: {
    value: number | null               // Wind direction in degrees (0-360)
  }
  windSpeed: {
    value: number | null               // Wind speed in km/h
    unitCode: string                   // "wmoUnit:km_h-1"
  }
  windGust: {
    value: number | null               // Wind gust in km/h
    unitCode: string                   // "wmoUnit:km_h-1"
  }
  barometricPressure: {
    value: number | null               // Pressure in Pascals
    unitCode: string                   // "wmoUnit:Pa"
  }
  visibility: {
    value: number | null               // Visibility in meters
    unitCode: string                   // "wmoUnit:m"
  }
  relativeHumidity: {
    value: number | null               // 0-100 percentage
  }
  heatIndex: {
    value: number | null               // Heat index in Celsius
    unitCode: string                   // "wmoUnit:degC"
  }
  windChill: {
    value: number | null               // Wind chill in Celsius
    unitCode: string                   // "wmoUnit:degC"
  }
  cloudLayers?: Array<{
    base: {
      value: number | null             // Cloud base height in meters
      unitCode: string                 // "wmoUnit:m"
    }
    amount: string                     // "FEW", "SCT", "BKN", "OVC"
  }>
}
```

**Alert Type**:
```typescript
interface Alert {
  id: string                           // Unique alert identifier
  areaDesc: string                     // Affected area description
  event: string                        // "Severe Thunderstorm Warning"
  headline: string                     // Alert headline
  description: string                  // Full alert description
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown'
  onset: string                        // ISO 8601 timestamp
  expires: string                      // ISO 8601 timestamp
  status: string                       // "Actual", "Test", etc.
  messageType: string                  // "Alert", "Update", "Cancel"
  category: string                     // "Met", "Health", etc.
}
```

**UV Index Type**:
```typescript
interface UVIndex {
  value: number                        // UV index value (0-11+)
  timestamp: string                    // ISO 8601 timestamp
  latitude: number                     // Latitude
  longitude: number                    // Longitude
}
```

**Sun Times Type**:
```typescript
interface SunTimes {
  sunrise: string                      // ISO 8601 timestamp
  sunset: string                       // ISO 8601 timestamp
  solarNoon: string                    // ISO 8601 timestamp
  civilDawn: string                    // ISO 8601 timestamp
  civilDusk: string                    // ISO 8601 timestamp
}
```

**Error Responses**:

**400 Bad Request** - Invalid ZIP code format:
```json
{
  "error": "Bad Request",
  "message": "Invalid ZIP code format. Must be 5 digits.",
  "statusCode": 400
}
```

**404 Not Found** - ZIP code not found:
```json
{
  "error": "Not Found",
  "message": "ZIP code 99999 not found. Please verify the ZIP code is valid.",
  "statusCode": 404
}
```

**404 Not Found** - Location outside coverage area:
```json
{
  "error": "Not Found",
  "message": "Weather data not available for this location. The location may be outside the United States.",
  "statusCode": 404
}
```

**500 Internal Server Error** - Failed to fetch data:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch forecast data. Please try again later.",
  "statusCode": 500
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request (bad ZIP format)
- `404` - Resource not found (invalid ZIP or location outside US)
- `500` - Server error (NWS API failure)

**Request Flow**:
1. Validate ZIP code format (5 digits)
2. Geocode ZIP to coordinates (cached)
3. Fetch NWS point data for grid coordinates (cached 24h)
4. Fetch forecast, hourly, observations, alerts in parallel
5. Calculate sunrise/sunset times
6. Fetch UV index (optional, from OpenWeatherMap)
7. Transform data to frontend format
8. Return complete weather package

**Caching Behavior**:
- Serves cached data if available
- Background refresh triggered for stale data
- Different TTLs for different data types (see [Caching Implementation](#caching-implementation))

---

### 4. POST /api/weather/:zipcode/refresh

Clear cache and fetch fresh weather data for a specific ZIP code. Forces immediate data refresh by clearing all cached data for the location.

**Request**:
```http
POST /api/weather/75454/refresh
```

**Path Parameters**:
- `zipcode` (string, required): 5-digit US ZIP code (pattern: `^\d{5}$`)

**Response** (200 OK):
Same as `GET /api/weather/:zipcode` - returns fresh weather data package.

**Error Responses**:
Same error responses as `GET /api/weather/:zipcode`.

**Status Codes**:
- `200` - Success
- `400` - Invalid request
- `404` - Resource not found
- `500` - Server error

**Request Flow**:
1. Validate ZIP code format
2. Geocode ZIP to coordinates
3. **Clear all cached data for location**
4. Fetch fresh point data from NWS
5. Fetch all weather data in parallel (no cache)
6. Calculate sun times and UV index
7. Return fresh weather package

**Notes**:
- Used by the manual refresh button in the UI
- Bypasses all caching for the specific location
- More expensive than regular GET endpoint
- Should be used sparingly to avoid rate limiting

---

## Cache Management Endpoints

### 5. GET /api/weather/cache/stats

Get cache statistics for monitoring and debugging.

**Request**:
```http
GET /api/weather/cache/stats
```

**Response** (200 OK):
```json
{
  "cache": {
    "keys": 42,
    "hits": 1234,
    "misses": 56
  },
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

**Response Fields**:
- `cache.keys` (number): Total number of cached entries
- `cache.hits` (number): Total cache hits since server start
- `cache.misses` (number): Total cache misses since server start
- `timestamp` (string): ISO 8601 timestamp

**Status Codes**:
- `200` - Success

**Notes**:
- Useful for monitoring cache performance
- Statistics reset when server restarts
- High hit/miss ratio indicates good caching efficiency

---

### 6. POST /api/weather/cache/clear

Clear all weather cache entries. Administrative endpoint for cache management.

**Request**:
```http
POST /api/weather/cache/clear
```

**Response** (200 OK):
```json
{
  "message": "Cache cleared successfully",
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

**Status Codes**:
- `200` - Success

**Notes**:
- Clears ALL cached data for ALL locations
- Next requests will fetch fresh data from NWS API
- Should be used with caution (forces refetch for all users)
- Useful for debugging or forcing global refresh

---

### 7. POST /api/weather/cache/clear/:zipcode

Clear cache for a specific ZIP code location.

**Request**:
```http
POST /api/weather/cache/clear/75454
```

**Path Parameters**:
- `zipcode` (string, required): 5-digit US ZIP code

**Response** (200 OK):
```json
{
  "message": "Cache cleared for ZIP code 75454",
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Bad Request",
  "message": "Invalid ZIP code",
  "statusCode": 400
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid ZIP code

**Notes**:
- Only clears cache entries for the specified location
- More targeted than full cache clear
- Does not refetch data (use `/refresh` endpoint for that)
- Clears: point data, forecast, hourly forecast, observations for the location

---

## Background Jobs Endpoints

### 8. GET /api/weather/background-jobs/status

Get status and configuration of background refresh jobs.

**Request**:
```http
GET /api/weather/background-jobs/status
```

**Response** (200 OK):
```json
{
  "backgroundJobs": {
    "enabled": true,
    "cachedZipCodes": ["75454", "75070", "75035"],
    "refreshInterval": "5 minutes",
    "schedule": "*/5 * * * *"
  },
  "cache": {
    "keys": 42,
    "hits": 1234,
    "misses": 56
  },
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

**Response Fields**:
- `backgroundJobs.enabled` (boolean): Whether jobs are running
- `backgroundJobs.cachedZipCodes` (string[]): ZIP codes being refreshed
- `backgroundJobs.refreshInterval` (string): Human-readable interval
- `backgroundJobs.schedule` (string): Cron schedule expression
- `cache`: Same as `/cache/stats` endpoint
- `timestamp` (string): ISO 8601 timestamp

**Status Codes**:
- `200` - Success

**Notes**:
- Shows current background job configuration
- Cached ZIP codes: 75454, 75070, 75035 (configurable)
- Refresh runs every 5 minutes
- Includes cache statistics for monitoring

---

## Data Transformation Layer

The backend transforms NWS API responses into a flattened, frontend-friendly format. This transformation happens in the `transformWeatherPackage` function in `weatherRoutes.ts`.

### Transformation Overview

**NWS API Structure** (nested properties):
```typescript
WeatherPackage {
  forecast: {
    properties: {
      periods: ForecastPeriod[]
    }
  }
  hourlyForecast: {
    properties: {
      periods: HourlyForecastPeriod[]
    }
  }
  alerts: {
    features: AlertFeature[]
  }
}
```

**Frontend Format** (flattened arrays):
```typescript
WeatherData {
  forecast: ForecastPeriod[]        // Direct array access
  hourlyForecast: HourlyForecast[]  // Direct array access
  alerts: Alert[]                   // Direct array access
}
```

### Key Transformations

1. **Forecast Data**: Extracts `properties.periods` array directly
2. **Hourly Forecast**: Extracts `properties.periods` array, includes dewpoint and humidity
3. **Current Observation**: Flattens nested observation structure, preserves unit codes
4. **Alerts**: Extracts `features` array, transforms to simpler Alert objects
5. **Grid Point**: Combines metadata from multiple sources into single object
6. **Coordinates**: Converts `{lat, lon}` to `{latitude, longitude}`
7. **UV Index**: Passes through if available, null otherwise
8. **Sun Times**: Passes through as-is

### Null Handling

The transformation layer handles missing or null values gracefully:

- `probabilityOfPrecipitation.value`: Defaults to `null` if missing
- `dewpoint.value`: Defaults to `0` with proper unit code
- `relativeHumidity.value`: Defaults to `0`
- `currentObservation`: Entire object is `undefined` if unavailable
- `uvIndex`: `null` if unavailable
- Alert `headline`: Empty string if missing

### Unit Code Preservation

All numeric values preserve their NWS unit codes:
- Temperature: `wmoUnit:degC` (metric from NWS)
- Wind Speed: `wmoUnit:km_h-1` (metric)
- Visibility: `wmoUnit:m` (meters)
- Pressure: `wmoUnit:Pa` (Pascals)

Frontend is responsible for unit conversion to Imperial if needed.

---

## Caching Implementation

The backend uses `node-cache` for in-memory caching of NWS API responses. Caching is implemented in `nwsService.ts`.

### Cache TTL Values

Different data types have different cache durations:

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Point Data | 24 hours | Grid coordinates rarely change |
| Forecast | 1 hour | Updated hourly by NWS |
| Hourly Forecast | 1 hour | Updated hourly by NWS |
| Observations | 10 minutes | Frequent updates available |
| Stations | 7 days | Station metadata is static |
| Alerts | No cache | Real-time data required |

### Cache Keys

Cache keys are namespaced with type prefix:

```typescript
// Format: "type:param1:param2:..."
"points:33.1951:-96.6297"
"forecast:FWD:78:102"
"hourly:FWD:78:102"
"observation:KDTO"
"stations:FWD:78:102"
```

### Cache Behavior

**Stale-While-Revalidate Pattern**:
- Serves cached data immediately if available
- Background refresh triggered if data is stale
- User never waits for fresh data (unless cache miss)

**Cache Invalidation**:
- Automatic: TTL expiration
- Manual: `/cache/clear` endpoints
- Location-specific: `/cache/clear/:zipcode`
- Full refresh: `/weather/:zipcode/refresh`

**Cache Statistics**:
- Tracks hits, misses, total keys
- Available via `/cache/stats` endpoint
- Resets on server restart

### Background Cache Warming

The background job service pre-warms the cache for configured ZIP codes:

- **ZIP Codes**: 75454, 75070, 75035
- **Frequency**: Every 5 minutes
- **Method**: `nwsService.prefetchWeatherData()`
- **Behavior**: Fetches all data in parallel, silent failures

This ensures frequently accessed locations always have fresh cached data.

---

## Error Handling

### Error Handling Strategy

The backend implements a multi-layered error handling approach:

1. **Request Validation**: JSON Schema validation on inputs
2. **Service Layer**: Try-catch with specific error types
3. **Retry Logic**: Exponential backoff for transient failures
4. **Graceful Degradation**: Non-critical failures don't block response
5. **Structured Errors**: Consistent error response format

### NWS API Error Handling

**Retry Configuration**:
```typescript
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1000ms  // 1 second
RATE_LIMIT_DELAY = 5000ms     // 5 seconds
```

**HTTP Status Code Handling**:

| Status Code | Behavior | Retry |
|-------------|----------|-------|
| 429 (Rate Limit) | Wait 5 seconds | Yes (up to 3x) |
| 404 (Not Found) | Throw "Resource not found" | No |
| 500+ (Server Error) | Exponential backoff | Yes (up to 3x) |
| Network Error | Exponential backoff | Yes (up to 3x) |

**Exponential Backoff**:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay

### Partial Failure Handling

The API uses `Promise.allSettled` for parallel requests, allowing graceful degradation:

**Critical Data** (must succeed):
- Forecast data
- Hourly forecast data

If critical data fails, returns 500 error.

**Non-Critical Data** (optional):
- Current observations
- Active alerts
- UV Index

If non-critical data fails:
- Logs warning
- Returns partial response
- Missing fields are `null` or empty arrays

### Error Response Format

All errors follow consistent structure:

```typescript
{
  error: string       // Error type: "Bad Request", "Not Found", etc.
  message: string     // Human-readable error message
  statusCode: number  // HTTP status code
}
```

### User-Facing Error Messages

Errors are translated to user-friendly messages:

**Geocoding Errors**:
- "ZIP code not found" → `404 Not Found`
- "Invalid ZIP format" → `400 Bad Request`

**NWS API Errors**:
- Grid point not found → `404 Not Found` (location outside US)
- Forecast fetch failed → `500 Internal Server Error`
- Rate limit exceeded → `500 Internal Server Error` (after retries)

**Generic Errors**:
- Unexpected errors → `500 Internal Server Error`
- Always includes request context (ZIP code) in logs

---

## Background Jobs

### Overview

The background job service maintains a warm cache for frequently accessed locations by periodically refreshing their weather data.

### Configuration

**Configured ZIP Codes**:
```typescript
const CACHED_ZIP_CODES = ['75454', '75070', '75035'];
```

**Refresh Schedule**:
```typescript
const REFRESH_CRON_SCHEDULE = '*/5 * * * *';  // Every 5 minutes
```

**Timezone**: `America/Chicago` (configurable via environment variable)

### Job Flow

**Startup**:
1. Initialize cron job
2. Perform immediate initial refresh (non-blocking)
3. Schedule recurring refresh every 5 minutes

**Each Refresh Cycle**:
1. Log start of cycle
2. For each configured ZIP code:
   - Geocode ZIP to coordinates
   - Call `nwsService.prefetchWeatherData(lat, lon)`
   - Prefetch runs in parallel for all ZIPs
3. Log completion with duration

**Prefetch Process** (per location):
1. Fetch point data (grids)
2. Fetch all weather data in parallel:
   - Forecast
   - Hourly forecast
   - Current conditions
   - Active alerts
3. Data stored in cache with appropriate TTLs
4. Failures logged but don't stop job

### Error Handling

**Graceful Failure**:
- Individual ZIP failures don't affect other ZIPs
- Errors logged to console with ZIP code context
- Job continues on next scheduled run
- Uses `Promise.allSettled` for parallel execution

**Logging**:
```
[Background] Starting scheduled refresh for cached ZIP codes
[Background] Starting refresh for ZIP 75454
[Background] Successfully refreshed ZIP 75454
[Background] Failed to refresh ZIP 99999: ZIP code not found
[Background] Completed refresh cycle in 2345ms
```

### Monitoring

**Status Endpoint**: `GET /api/weather/background-jobs/status`

Returns:
- Enabled status
- Configured ZIP codes
- Refresh interval
- Cron schedule
- Current cache statistics

### Benefits

1. **Fast Response Times**: Cached data always available for configured locations
2. **Reduced Latency**: Users get instant responses
3. **Rate Limit Protection**: Spreads API calls over time
4. **Reliability**: Continues working despite individual failures
5. **Predictable Load**: Regular 5-minute intervals

### Customization

To add/remove cached ZIP codes:

1. Edit `CACHED_ZIP_CODES` in `/server/src/services/backgroundJobs.ts`
2. Restart server
3. New ZIPs will be included in next refresh cycle

---

## API Best Practices

### Request Guidelines

1. **ZIP Code Format**: Always use 5-digit format (leading zeros required)
2. **Rate Limiting**: Avoid excessive refresh requests (use cached data)
3. **Error Handling**: Handle all error status codes appropriately
4. **Polling**: Use 1-minute client-side refresh interval (non-interrupting)
5. **Manual Refresh**: Only use `/refresh` endpoint on explicit user action

### Response Guidelines

1. **Check Status Code**: Always verify 200 before parsing response
2. **Null Handling**: Check for optional fields (`currentObservation`, `uvIndex`)
3. **Array Validation**: Verify arrays not empty before accessing
4. **Unit Conversion**: Convert metric units to Imperial as needed
5. **Timestamp Parsing**: Use ISO 8601 parsing for all timestamps

### Performance Optimization

1. **Cache Headers**: Backend serves cached data when available
2. **Parallel Requests**: Avoid sequential requests to same endpoint
3. **Background Refresh**: Leverage 5-minute background cache warming
4. **Minimal Refresh**: Only force refresh when truly needed
5. **Stale Data**: Accept slightly stale data for better performance

---

## Example Usage

### Fetch Weather Data

```javascript
// Fetch weather for ZIP code
const response = await fetch('/api/weather/75454');
const data = await response.json();

if (response.ok) {
  console.log('Current temp:', data.currentObservation?.temperature.value);
  console.log('Forecast:', data.forecast[0].shortForecast);
  console.log('Alerts:', data.alerts.length);
} else {
  console.error('Error:', data.message);
}
```

### Force Refresh

```javascript
// Manual refresh button
async function handleRefresh(zipCode) {
  const response = await fetch(`/api/weather/${zipCode}/refresh`, {
    method: 'POST'
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Fresh data received:', data.lastUpdated);
  } else {
    console.error('Refresh failed:', data.message);
  }
}
```

### Monitor Cache Performance

```javascript
// Check cache statistics
const response = await fetch('/api/weather/cache/stats');
const stats = await response.json();

const hitRate = (stats.cache.hits / (stats.cache.hits + stats.cache.misses) * 100).toFixed(1);
console.log(`Cache hit rate: ${hitRate}%`);
console.log(`Total cached entries: ${stats.cache.keys}`);
```

### Check Background Jobs

```javascript
// Monitor background job status
const response = await fetch('/api/weather/background-jobs/status');
const status = await response.json();

console.log('Cached ZIP codes:', status.backgroundJobs.cachedZipCodes);
console.log('Refresh interval:', status.backgroundJobs.refreshInterval);
console.log('Cache keys:', status.cache.keys);
```

---

## Appendix: HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid ZIP code format |
| 404 | Not Found | ZIP code not found or location outside US |
| 500 | Internal Server Error | NWS API failure, server error |

---

## Appendix: NWS API Requirements

All requests to NWS API include:

**User-Agent Header**:
```
User-Agent: WeatherApp/1.0 (contact@example.com)
```

**Base URL**: `https://api.weather.gov`

**Content Type**: `application/geo+json`

**Rate Limiting**:
- No official limit documented
- Implement exponential backoff
- Respect 429 responses (5 second delay)

---

## Additional Resources

- **NWS API Documentation**: https://www.weather.gov/documentation/services-web-api
- **Frontend Types**: `/src/types/weather.ts`
- **Backend Types**: `/server/src/types/weather.types.ts`
- **Service Implementation**: `/server/src/services/nwsService.ts`
- **Route Handlers**: `/server/src/routes/weatherRoutes.ts`
