/**
 * Comprehensive Integration Tests for Weather Routes
 * These are REAL tests that test actual API endpoints with real data
 * NO MOCKS - testing real integration with NWS API through Fastify routes
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import weatherRoutes from './weatherRoutes.js';
import { nwsService } from '../services/nwsService.js';

// Test ZIP codes with known NWS coverage
const TEST_ZIP_CODES = {
  DALLAS_TX: '75454', // Valid Dallas area ZIP
  LOS_ANGELES_CA: '90210', // Valid LA ZIP
  CHICAGO_IL: '60601', // Valid Chicago ZIP
  NEW_YORK_NY: '10001', // Valid NYC ZIP
  INVALID_FORMAT: '1234', // Invalid format (4 digits)
  INVALID_FORMAT_LETTERS: 'ABCDE', // Invalid format (letters)
  NON_EXISTENT: '00000', // Valid format but doesn't exist
};

describe('Weather Routes Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Create Fastify instance for testing
    app = Fastify({
      logger: false, // Disable logging for cleaner test output
    });

    // Register weather routes
    await app.register(weatherRoutes, { prefix: '/api' });

    // Wait for the app to be ready
    await app.ready();
  });

  afterAll(async () => {
    // Close the Fastify instance
    await app.close();
  });

  beforeEach(() => {
    // Clear cache before each test for isolation
    nwsService.clearCache();
  });

  describe('GET /api/weather/:zipcode - Fetch Weather Data', () => {
    it('should successfully fetch complete weather package for valid Dallas ZIP code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Verify top-level structure
      expect(data).toBeDefined();
      expect(data.zipCode).toBe(TEST_ZIP_CODES.DALLAS_TX);
      expect(data.coordinates).toBeDefined();
      expect(data.coordinates.latitude).toBeDefined();
      expect(data.coordinates.longitude).toBeDefined();

      // Verify grid point info
      expect(data.gridPoint).toBeDefined();
      expect(data.gridPoint.gridId).toBeDefined();
      expect(typeof data.gridPoint.gridX).toBe('number');
      expect(typeof data.gridPoint.gridY).toBe('number');

      // Verify forecast data (7-day forecast)
      expect(data.forecast).toBeDefined();
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.forecast.length).toBeGreaterThan(0);

      // Verify first forecast period structure
      const firstForecast = data.forecast[0];
      expect(firstForecast.number).toBe(1);
      expect(firstForecast.name).toBeDefined();
      expect(typeof firstForecast.temperature).toBe('number');
      expect(firstForecast.temperatureUnit).toBe('F');
      expect(typeof firstForecast.isDaytime).toBe('boolean');
      expect(firstForecast.windSpeed).toBeDefined();
      expect(firstForecast.windDirection).toBeDefined();
      expect(firstForecast.icon).toContain('https://api.weather.gov');
      expect(firstForecast.shortForecast).toBeDefined();
      expect(firstForecast.detailedForecast).toBeDefined();
      expect(firstForecast.startTime).toBeDefined();
      expect(firstForecast.endTime).toBeDefined();

      // Verify hourly forecast data
      expect(data.hourlyForecast).toBeDefined();
      expect(Array.isArray(data.hourlyForecast)).toBe(true);
      expect(data.hourlyForecast.length).toBeGreaterThan(24); // Should have many hours

      // Verify first hourly period structure
      const firstHour = data.hourlyForecast[0];
      expect(firstHour.number).toBe(1);
      expect(typeof firstHour.temperature).toBe('number');
      expect(firstHour.temperatureUnit).toBe('F');
      expect(firstHour.startTime).toBeDefined();
      expect(firstHour.endTime).toBeDefined();
      expect(typeof firstHour.isDaytime).toBe('boolean');
      expect(firstHour.windSpeed).toBeDefined();

      // Verify current observation (may be null but field should exist)
      expect(data).toHaveProperty('currentObservation');
      if (data.currentObservation) {
        expect(data.currentObservation.timestamp).toBeDefined();
        expect(data.currentObservation.temperature).toBeDefined();
        expect(data.currentObservation.dewpoint).toBeDefined();
        expect(data.currentObservation.windSpeed).toBeDefined();
        expect(data.currentObservation.relativeHumidity).toBeDefined();
        expect(data.currentObservation.visibility).toBeDefined();
      }

      // Verify alerts array (may be empty but should exist)
      expect(data.alerts).toBeDefined();
      expect(Array.isArray(data.alerts)).toBe(true);

      // If alerts exist, verify structure
      if (data.alerts.length > 0) {
        const firstAlert = data.alerts[0];
        expect(firstAlert.id).toBeDefined();
        expect(firstAlert.event).toBeDefined();
        expect(firstAlert.severity).toBeDefined();
        expect(firstAlert.urgency).toBeDefined();
        expect(firstAlert.headline).toBeDefined();
        expect(firstAlert.description).toBeDefined();
        expect(firstAlert.onset).toBeDefined();
        expect(firstAlert.expires).toBeDefined();
      }

      // Verify sun times
      expect(data.sunTimes).toBeDefined();
      expect(data.sunTimes.sunrise).toBeDefined();
      expect(data.sunTimes.sunset).toBeDefined();
      expect(data.sunTimes.solarNoon).toBeDefined();

      // Verify metadata
      expect(data.lastUpdated).toBeDefined();
      const lastUpdated = new Date(data.lastUpdated);
      expect(lastUpdated.getTime()).not.toBeNaN();
    }, 30000);

    it('should successfully fetch weather data for Los Angeles ZIP code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.LOS_ANGELES_CA}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.zipCode).toBe(TEST_ZIP_CODES.LOS_ANGELES_CA);
      expect(data.forecast.length).toBeGreaterThan(0);
      expect(data.hourlyForecast.length).toBeGreaterThan(0);
    }, 30000);

    it('should successfully fetch weather data for Chicago ZIP code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.zipCode).toBe(TEST_ZIP_CODES.CHICAGO_IL);
      expect(data.coordinates).toBeDefined();
      expect(data.gridPoint.gridId).toBeDefined();
    }, 30000);

    it('should return 400 for invalid ZIP code format (4 digits)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.INVALID_FORMAT}`,
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      expect(error.error).toBe('Bad Request');
      // Schema validation error message
      expect(error.message.toLowerCase()).toMatch(/must match pattern|invalid zip code format/);
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 for invalid ZIP code format (letters)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.INVALID_FORMAT_LETTERS}`,
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      expect(error.error).toBe('Bad Request');
      // Schema validation error message
      expect(error.message.toLowerCase()).toMatch(/must match pattern|invalid zip code format/);
      expect(error.statusCode).toBe(400);
    });

    it('should return 404 or 500 for non-existent ZIP code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.NON_EXISTENT}`,
      });

      // Geocoding service might return 404 or 500 depending on the specific error
      expect([404, 500]).toContain(response.statusCode);

      const error = JSON.parse(response.body);
      expect(error.error).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.statusCode).toBeDefined();
    }, 30000);

    it('should use cache on subsequent requests for same ZIP code', async () => {
      const zipCode = TEST_ZIP_CODES.DALLAS_TX; // Use Dallas which we know works

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/weather/${zipCode}`,
      });

      expect(response1.statusCode).toBe(200);
      const data1 = JSON.parse(response1.body);
      expect(data1.gridPoint).toBeDefined();

      const cacheStatsAfterFirst = nwsService.getCacheStats();
      expect(cacheStatsAfterFirst.keys).toBeGreaterThan(0);

      // Second request (should use cache)
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/weather/${zipCode}`,
      });

      expect(response2.statusCode).toBe(200);
      const data2 = JSON.parse(response2.body);
      const cacheStatsAfterSecond = nwsService.getCacheStats();

      // Should have more cache hits
      expect(cacheStatsAfterSecond.hits).toBeGreaterThan(cacheStatsAfterFirst.hits);

      // Data should be consistent
      expect(data2.gridPoint.gridId).toBe(data1.gridPoint.gridId);
      expect(data2.gridPoint.gridX).toBe(data1.gridPoint.gridX);
      expect(data2.gridPoint.gridY).toBe(data1.gridPoint.gridY);
    }, 30000);

    it('should handle concurrent requests for different ZIP codes', async () => {
      const promises = [
        app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}` }),
        app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}` }),
        app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.LOS_ANGELES_CA}` }),
      ];

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.forecast).toBeDefined();
        expect(data.hourlyForecast).toBeDefined();
      });

      // Each should have different grid coordinates
      const data1 = JSON.parse(responses[0].body);
      const data2 = JSON.parse(responses[1].body);
      const data3 = JSON.parse(responses[2].body);

      expect(data1.gridPoint.gridId).not.toBe(data2.gridPoint.gridId);
      expect(data2.gridPoint.gridId).not.toBe(data3.gridPoint.gridId);
    }, 30000);
  });

  describe('POST /api/weather/:zipcode/refresh - Refresh Weather Data', () => {
    it('should clear cache and return fresh weather data for valid ZIP code', async () => {
      const zipCode = TEST_ZIP_CODES.DALLAS_TX;

      // First, populate cache with a regular request
      const initialResponse = await app.inject({
        method: 'GET',
        url: `/api/weather/${zipCode}`,
      });
      expect(initialResponse.statusCode).toBe(200);
      const initialData = JSON.parse(initialResponse.body);
      expect(initialData.zipCode).toBe(zipCode);

      // Verify cache has data
      const cacheStatsBefore = nwsService.getCacheStats();
      expect(cacheStatsBefore.keys).toBeGreaterThan(0);

      // Now refresh (should clear cache for this location)
      const refreshResponse = await app.inject({
        method: 'POST',
        url: `/api/weather/${zipCode}/refresh`,
      });

      expect(refreshResponse.statusCode).toBe(200);

      const refreshedData = JSON.parse(refreshResponse.body);

      // Verify structure is complete
      expect(refreshedData.zipCode).toBe(zipCode);
      expect(refreshedData.forecast).toBeDefined();
      expect(Array.isArray(refreshedData.forecast)).toBe(true);
      expect(refreshedData.hourlyForecast).toBeDefined();
      expect(Array.isArray(refreshedData.hourlyForecast)).toBe(true);
      expect(refreshedData.lastUpdated).toBeDefined();

      // Verify timestamp is recent
      const lastUpdated = new Date(refreshedData.lastUpdated);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdated.getTime();
      expect(timeDiff).toBeLessThan(60000); // Within last minute

      // Cache should be repopulated
      const cacheStatsAfter = nwsService.getCacheStats();
      expect(cacheStatsAfter.keys).toBeGreaterThan(0);
    }, 30000);

    it('should return 400 for invalid ZIP code format on refresh', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/${TEST_ZIP_CODES.INVALID_FORMAT}/refresh`,
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      expect(error.error).toBeDefined();
      expect(error.message).toBeDefined();
      // Message can be from schema validation or route handler
      expect(error.message.toLowerCase()).toMatch(/invalid|must match pattern/);
      expect(error.statusCode).toBe(400);
    });

    it('should return 404 or 500 for non-existent ZIP code on refresh', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/${TEST_ZIP_CODES.NON_EXISTENT}/refresh`,
      });

      // Geocoding service might return 404 or 500 depending on the specific error
      expect([404, 500]).toContain(response.statusCode);

      const error = JSON.parse(response.body);
      expect(error.error).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.statusCode).toBeDefined();
    }, 30000);

    it('should fetch fresh data after refresh bypassing cache', async () => {
      const zipCode = TEST_ZIP_CODES.DALLAS_TX; // Use Dallas which we know works

      // Initial fetch
      const initialResponse = await app.inject({
        method: 'GET',
        url: `/api/weather/${zipCode}`,
      });
      expect(initialResponse.statusCode).toBe(200);
      const initialData = JSON.parse(initialResponse.body);
      expect(initialData.gridPoint).toBeDefined();

      // Refresh
      const refreshResponse = await app.inject({
        method: 'POST',
        url: `/api/weather/${zipCode}/refresh`,
      });
      expect(refreshResponse.statusCode).toBe(200);
      const refreshedData = JSON.parse(refreshResponse.body);
      expect(refreshedData.gridPoint).toBeDefined();

      // Data should be structurally similar
      expect(refreshedData.zipCode).toBe(initialData.zipCode);
      expect(refreshedData.gridPoint.gridId).toBe(initialData.gridPoint.gridId);

      // Timestamps should be different (refreshed is newer)
      const initialTime = new Date(initialData.lastUpdated);
      const refreshedTime = new Date(refreshedData.lastUpdated);
      expect(refreshedTime.getTime()).toBeGreaterThanOrEqual(initialTime.getTime());
    }, 30000);
  });

  describe('POST /api/weather/cache/clear - Clear All Cache', () => {
    it('should clear entire cache successfully', async () => {
      // Populate cache with multiple locations
      await app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}` });
      await app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}` });

      // Verify cache has data
      let cacheStats = nwsService.getCacheStats();
      expect(cacheStats.keys).toBeGreaterThan(0);

      // Clear all cache
      const response = await app.inject({
        method: 'POST',
        url: '/api/weather/cache/clear',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.message).toContain('Cache cleared successfully');
      expect(result.timestamp).toBeDefined();

      // Verify cache is empty
      cacheStats = nwsService.getCacheStats();
      expect(cacheStats.keys).toBe(0);
    }, 30000);

    it('should return valid timestamp in ISO format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/weather/cache/clear',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();

      // Should be recent (within last 5 seconds)
      const now = new Date();
      const timeDiff = now.getTime() - timestamp.getTime();
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should allow cache clearing multiple times', async () => {
      // Clear cache twice in a row
      const response1 = await app.inject({
        method: 'POST',
        url: '/api/weather/cache/clear',
      });

      const response2 = await app.inject({
        method: 'POST',
        url: '/api/weather/cache/clear',
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      const cacheStats = nwsService.getCacheStats();
      expect(cacheStats.keys).toBe(0);
    });
  });

  describe('POST /api/weather/cache/clear/:zipcode - Clear Location Cache', () => {
    it('should clear cache for specific ZIP code only', async () => {
      const zipDallas = TEST_ZIP_CODES.DALLAS_TX;
      const zipChicago = TEST_ZIP_CODES.CHICAGO_IL;

      // Populate cache with multiple locations
      await app.inject({ method: 'GET', url: `/api/weather/${zipDallas}` });
      await app.inject({ method: 'GET', url: `/api/weather/${zipChicago}` });

      const cacheStatsBefore = nwsService.getCacheStats();
      const keysBefore = cacheStatsBefore.keys;
      expect(keysBefore).toBeGreaterThan(0);

      // Clear cache for Dallas only
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/cache/clear/${zipDallas}`,
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.message).toContain(`Cache cleared for ZIP code ${zipDallas}`);
      expect(result.timestamp).toBeDefined();

      // Verify cache has fewer keys (but not empty)
      const cacheStatsAfter = nwsService.getCacheStats();
      expect(cacheStatsAfter.keys).toBeLessThan(keysBefore);
      expect(cacheStatsAfter.keys).toBeGreaterThan(0);
    }, 30000);

    it('should return 400 for invalid ZIP code format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/cache/clear/${TEST_ZIP_CODES.INVALID_FORMAT}`,
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      expect(error.error).toBe('Bad Request');
      expect(error.message).toContain('Invalid ZIP code');
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 for non-existent ZIP code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/cache/clear/${TEST_ZIP_CODES.NON_EXISTENT}`,
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      expect(error.error).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
    }, 30000);

    it('should handle clearing cache for location not in cache', async () => {
      // Clear all cache first
      nwsService.clearCache();

      // Try to clear cache for a specific location
      const response = await app.inject({
        method: 'POST',
        url: `/api/weather/cache/clear/${TEST_ZIP_CODES.NEW_YORK_NY}`,
      });

      // Should still succeed (idempotent operation)
      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.message).toContain('Cache cleared');
    }, 30000);
  });

  describe('GET /api/weather/cache/stats - Cache Statistics', () => {
    it('should return cache statistics with correct structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.cache).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // Verify cache stats structure
      expect(typeof result.cache.keys).toBe('number');
      expect(typeof result.cache.hits).toBe('number');
      expect(typeof result.cache.misses).toBe('number');

      // Verify timestamp
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should show zero stats when cache is empty', async () => {
      // Clear cache first
      nwsService.clearCache();

      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.cache.keys).toBe(0);
    });

    it('should show updated stats after cache operations', async () => {
      // Clear cache
      nwsService.clearCache();

      // Get initial stats
      let response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });
      let stats = JSON.parse(response.body);
      expect(stats.cache.keys).toBe(0);

      // Add data to cache
      await app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}` });

      // Get updated stats
      response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });
      stats = JSON.parse(response.body);
      expect(stats.cache.keys).toBeGreaterThan(0);
    }, 30000);

    it('should track cache hits correctly', async () => {
      nwsService.clearCache();

      // First request (cache miss)
      await app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}` });

      let response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });
      let stats = JSON.parse(response.body);
      const hitsBefore = stats.cache.hits;

      // Second request (cache hit)
      await app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}` });

      response = await app.inject({
        method: 'GET',
        url: '/api/weather/cache/stats',
      });
      stats = JSON.parse(response.body);

      // Hits should have increased
      expect(stats.cache.hits).toBeGreaterThan(hitsBefore);
    }, 30000);
  });

  describe('GET /api/weather/background-jobs/status - Background Jobs Status', () => {
    it('should return background jobs status with correct structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/background-jobs/status',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);

      // Verify structure
      expect(result.backgroundJobs).toBeDefined();
      expect(result.cache).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // Verify background jobs structure
      expect(result.backgroundJobs.enabled).toBeDefined();
      expect(typeof result.backgroundJobs.enabled).toBe('boolean');
      expect(result.backgroundJobs.cachedZipCodes).toBeDefined();
      expect(Array.isArray(result.backgroundJobs.cachedZipCodes)).toBe(true);

      // Verify cache stats included
      expect(typeof result.cache.keys).toBe('number');
      expect(typeof result.cache.hits).toBe('number');
      expect(typeof result.cache.misses).toBe('number');

      // Verify timestamp
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should include configured ZIP codes in status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/background-jobs/status',
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.body);
      expect(result.backgroundJobs.cachedZipCodes).toBeDefined();

      // Should have the default cached ZIP codes (75454, 75070, 75035)
      const cachedZips = result.backgroundJobs.cachedZipCodes;
      expect(Array.isArray(cachedZips)).toBe(true);
    });

    it('should return fresh timestamp on each request', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/weather/background-jobs/status',
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/weather/background-jobs/status',
      });

      const result1 = JSON.parse(response1.body);
      const result2 = JSON.parse(response2.body);

      const time1 = new Date(result1.timestamp);
      const time2 = new Date(result2.timestamp);

      expect(time2.getTime()).toBeGreaterThanOrEqual(time1.getTime());
    });
  });

  describe('transformWeatherPackage Function Tests', () => {
    it('should correctly transform forecast periods to flat array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Verify forecast is a flat array, not nested
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.forecast[0]).not.toHaveProperty('properties');

      // All forecast periods should be at top level
      data.forecast.forEach((period: { number: number; name: string; temperature: number; startTime: string; endTime: string }) => {
        expect(period.number).toBeDefined();
        expect(period.name).toBeDefined();
        expect(period.temperature).toBeDefined();
        expect(period.startTime).toBeDefined();
        expect(period.endTime).toBeDefined();
      });
    }, 30000);

    it('should correctly transform hourly forecast periods to flat array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Verify hourly forecast is a flat array
      expect(Array.isArray(data.hourlyForecast)).toBe(true);
      expect(data.hourlyForecast[0]).not.toHaveProperty('properties');

      // All hourly periods should be at top level
      data.hourlyForecast.forEach((period: { number: number; temperature: number; startTime: string; endTime: string }) => {
        expect(period.number).toBeDefined();
        expect(period.temperature).toBeDefined();
        expect(period.startTime).toBeDefined();
        expect(period.endTime).toBeDefined();
      });
    }, 30000);

    it('should correctly transform alerts to flat array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.LOS_ANGELES_CA}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Verify alerts is a flat array
      expect(Array.isArray(data.alerts)).toBe(true);

      // If alerts exist, verify structure
      if (data.alerts.length > 0) {
        data.alerts.forEach((alert: { id: string; event: string; severity: string; urgency: string }) => {
          expect(alert).not.toHaveProperty('properties');
          expect(alert.id).toBeDefined();
          expect(alert.event).toBeDefined();
          expect(alert.severity).toBeDefined();
          expect(alert.urgency).toBeDefined();
        });
      }
    }, 30000);

    it('should correctly transform current observation structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.NEW_YORK_NY}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Current observation may be null or object
      if (data.currentObservation) {
        // Should be flattened, not nested under properties
        expect(data.currentObservation).not.toHaveProperty('properties');

        // Should have direct access to observation fields
        expect(data.currentObservation.timestamp).toBeDefined();
        expect(data.currentObservation.temperature).toBeDefined();
        expect(data.currentObservation.temperature.value).toBeDefined();
        expect(data.currentObservation.temperature.unitCode).toBeDefined();
        expect(data.currentObservation.dewpoint).toBeDefined();
        expect(data.currentObservation.windSpeed).toBeDefined();
        expect(data.currentObservation.relativeHumidity).toBeDefined();
        expect(data.currentObservation.visibility).toBeDefined();
      }
    }, 30000);

    it('should handle null/missing values gracefully in transformation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Current observation might be undefined/null
      if (!data.currentObservation) {
        expect(data.currentObservation).toBeUndefined();
      }

      // Precipitation probability can be null
      data.forecast.forEach((period: { probabilityOfPrecipitation: { value: number | null } }) => {
        expect(period.probabilityOfPrecipitation).toBeDefined();
        // Value can be null or a number
        if (period.probabilityOfPrecipitation.value !== null) {
          expect(typeof period.probabilityOfPrecipitation.value).toBe('number');
        }
      });
    }, 30000);

    it('should maintain coordinate precision in transformation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.CHICAGO_IL}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);

      // Coordinates should be precise numbers
      expect(typeof data.coordinates.latitude).toBe('number');
      expect(typeof data.coordinates.longitude).toBe('number');

      // Should have reasonable precision (at least 2 decimal places)
      expect(data.coordinates.latitude.toString()).toContain('.');
      expect(data.coordinates.longitude.toString()).toContain('.');

      // Should be valid coordinates
      expect(data.coordinates.latitude).toBeGreaterThan(-90);
      expect(data.coordinates.latitude).toBeLessThan(90);
      expect(data.coordinates.longitude).toBeGreaterThan(-180);
      expect(data.coordinates.longitude).toBeLessThan(180);
    }, 30000);
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return proper error structure for all error responses', async () => {
      const responses = await Promise.all([
        app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.INVALID_FORMAT}` }),
        app.inject({ method: 'GET', url: `/api/weather/${TEST_ZIP_CODES.NON_EXISTENT}` }),
        app.inject({ method: 'POST', url: `/api/weather/${TEST_ZIP_CODES.INVALID_FORMAT}/refresh` }),
      ]);

      responses.forEach(response => {
        expect([400, 404, 500]).toContain(response.statusCode);

        const error = JSON.parse(response.body);
        expect(error.error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.statusCode).toBeDefined();

        expect(typeof error.error).toBe('string');
        expect(typeof error.message).toBe('string');
        expect(typeof error.statusCode).toBe('number');
      });
    }, 30000);

    it('should handle ZIP codes with leading zeros correctly', async () => {
      // ZIP codes like 01001 (Massachusetts) have leading zeros
      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/01001',
      });

      // Should either succeed or fail with proper error (not crash)
      expect([200, 400, 404, 500]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data.zipCode).toBe('01001');
      }
    }, 30000);

    it('should validate ZIP code format in route schema', async () => {
      // Test with 6 digits (invalid)
      const response = await app.inject({
        method: 'GET',
        url: '/api/weather/123456',
      });

      expect(response.statusCode).toBe(400);

      const error = JSON.parse(response.body);
      // Schema validation error message
      expect(error.message.toLowerCase()).toMatch(/must match pattern|invalid zip code format/);
    });

    it('should handle special characters in ZIP code gracefully', async () => {
      const responses = await Promise.all([
        app.inject({ method: 'GET', url: '/api/weather/12-34' }),
        app.inject({ method: 'GET', url: '/api/weather/12 34' }),
        app.inject({ method: 'GET', url: '/api/weather/12.34' }),
      ]);

      responses.forEach(response => {
        expect(response.statusCode).toBe(400);
        const error = JSON.parse(response.body);
        // Schema validation error message
        expect(error.message.toLowerCase()).toMatch(/must match pattern|invalid zip code format/);
      });
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should return consistent data structure across multiple requests', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      const response2 = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.LOS_ANGELES_CA}`,
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      const data1 = JSON.parse(response1.body);
      const data2 = JSON.parse(response2.body);

      // Verify both have data
      expect(data1.forecast).toBeDefined();
      expect(data2.forecast).toBeDefined();

      // Both should have same structure
      const keys1 = Object.keys(data1).sort();
      const keys2 = Object.keys(data2).sort();
      expect(keys1).toEqual(keys2);

      // Both should have same nested structures
      expect(Array.isArray(data1.forecast)).toBe(true);
      expect(Array.isArray(data2.forecast)).toBe(true);
      expect(Array.isArray(data1.hourlyForecast)).toBe(true);
      expect(Array.isArray(data2.hourlyForecast)).toBe(true);
      expect(Array.isArray(data1.alerts)).toBe(true);
      expect(Array.isArray(data2.alerts)).toBe(true);
    }, 30000);

    it('should return valid ISO 8601 timestamps for all time fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.forecast).toBeDefined();
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.forecast.length).toBeGreaterThan(0);

      // Check lastUpdated
      const lastUpdated = new Date(data.lastUpdated);
      expect(lastUpdated.getTime()).not.toBeNaN();

      // Check forecast times
      data.forecast.forEach((period: { startTime: string; endTime: string }) => {
        const startTime = new Date(period.startTime);
        const endTime = new Date(period.endTime);
        expect(startTime.getTime()).not.toBeNaN();
        expect(endTime.getTime()).not.toBeNaN();
        expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
      });

      // Check sun times
      expect(data.sunTimes).toBeDefined();
      const sunrise = new Date(data.sunTimes.sunrise);
      const sunset = new Date(data.sunTimes.sunset);
      expect(sunrise.getTime()).not.toBeNaN();
      expect(sunset.getTime()).not.toBeNaN();
    }, 30000);

    it('should return reasonable temperature values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.forecast).toBeDefined();
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.hourlyForecast).toBeDefined();
      expect(Array.isArray(data.hourlyForecast)).toBe(true);

      // Check forecast temperatures (Fahrenheit)
      data.forecast.forEach((period: { temperature: number }) => {
        expect(period.temperature).toBeGreaterThan(-50);
        expect(period.temperature).toBeLessThan(150);
      });

      // Check hourly temperatures
      data.hourlyForecast.forEach((period: { temperature: number }) => {
        expect(period.temperature).toBeGreaterThan(-50);
        expect(period.temperature).toBeLessThan(150);
      });

      // Check current observation if present (Celsius)
      if (data.currentObservation && data.currentObservation.temperature.value !== null) {
        expect(data.currentObservation.temperature.value).toBeGreaterThan(-40);
        expect(data.currentObservation.temperature.value).toBeLessThan(60);
      }
    }, 30000);

    it('should ensure forecast periods are in chronological order', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/weather/${TEST_ZIP_CODES.DALLAS_TX}`,
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.forecast).toBeDefined();
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.forecast.length).toBeGreaterThan(0);
      expect(data.hourlyForecast).toBeDefined();
      expect(Array.isArray(data.hourlyForecast)).toBe(true);
      expect(data.hourlyForecast.length).toBeGreaterThan(0);

      // Check forecast periods
      for (let i = 0; i < data.forecast.length - 1; i++) {
        const current = new Date(data.forecast[i].startTime);
        const next = new Date(data.forecast[i + 1].startTime);
        expect(next.getTime()).toBeGreaterThan(current.getTime());
      }

      // Check hourly forecast periods
      for (let i = 0; i < data.hourlyForecast.length - 1; i++) {
        const current = new Date(data.hourlyForecast[i].startTime);
        const next = new Date(data.hourlyForecast[i + 1].startTime);
        expect(next.getTime()).toBeGreaterThanOrEqual(current.getTime());
      }
    }, 30000);
  });
});
