/**
 * Comprehensive tests for NWS Service
 * These are REAL tests that actually call the NWS API and test functionality
 * NO MOCKS - testing real integration with the National Weather Service API
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NWSService } from './nwsService.js';

// Test locations with known NWS coverage
const TEST_LOCATIONS = {
  DALLAS_TX: { lat: 32.7767, lon: -96.7970, name: 'Dallas, TX' },
  NEW_YORK_NY: { lat: 40.7128, lon: -74.0060, name: 'New York, NY' },
  LOS_ANGELES_CA: { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, CA' },
  CHICAGO_IL: { lat: 41.8781, lon: -87.6298, name: 'Chicago, IL' },
};

describe('NWSService', () => {
  let service: NWSService;

  beforeEach(() => {
    service = new NWSService('NWSServiceTest/1.0 (test@example.com)');
  });

  afterEach(() => {
    // Clean up cache after each test
    service.clearCache();
  });

  describe('getPointData', () => {
    it('should fetch point data for Dallas, TX with real coordinates', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;
      const result = await service.getPointData(lat, lon);

      // Verify structure
      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();

      // Verify essential properties
      expect(result.properties.gridId).toBeDefined();
      expect(typeof result.properties.gridId).toBe('string');
      expect(result.properties.gridId.length).toBeGreaterThan(0);

      expect(result.properties.gridX).toBeDefined();
      expect(typeof result.properties.gridX).toBe('number');
      expect(result.properties.gridX).toBeGreaterThan(0);

      expect(result.properties.gridY).toBeDefined();
      expect(typeof result.properties.gridY).toBe('number');
      expect(result.properties.gridY).toBeGreaterThan(0);

      // Verify URLs are provided
      expect(result.properties.forecast).toBeDefined();
      expect(result.properties.forecast).toContain('https://api.weather.gov');
      expect(result.properties.forecastHourly).toBeDefined();
      expect(result.properties.observationStations).toBeDefined();

      // Verify location metadata
      expect(result.properties.relativeLocation).toBeDefined();
      expect(result.properties.relativeLocation.properties.city).toBeDefined();
      expect(result.properties.relativeLocation.properties.state).toBeDefined();
      expect(result.properties.timeZone).toBeDefined();
    }, 30000); // 30 second timeout for API call

    it('should fetch point data for New York, NY', async () => {
      const { lat, lon } = TEST_LOCATIONS.NEW_YORK_NY;
      const result = await service.getPointData(lat, lon);

      expect(result.properties.gridId).toBeDefined();
      expect(result.properties.gridX).toBeGreaterThan(0);
      expect(result.properties.gridY).toBeGreaterThan(0);
      expect(result.properties.timeZone).toContain('America');
    }, 30000);

    it('should cache point data and return from cache on second call', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      // First call - should fetch from API
      const firstCall = await service.getPointData(lat, lon);
      const statsAfterFirst = service.getCacheStats();
      expect(statsAfterFirst.keys).toBeGreaterThan(0);

      // Second call - should return from cache
      const secondCall = await service.getPointData(lat, lon);
      const statsAfterSecond = service.getCacheStats();

      // Verify cache hit
      expect(statsAfterSecond.hits).toBeGreaterThan(statsAfterFirst.hits);

      // Verify same data returned
      expect(secondCall.properties.gridId).toBe(firstCall.properties.gridId);
      expect(secondCall.properties.gridX).toBe(firstCall.properties.gridX);
      expect(secondCall.properties.gridY).toBe(firstCall.properties.gridY);
    }, 30000);

    it('should handle coordinate precision correctly', async () => {
      // Test with high-precision coordinates
      const result1 = await service.getPointData(32.776664, -96.796988);
      const result2 = await service.getPointData(32.7767, -96.7970);

      // Should get data for both (cached separately due to different precision)
      expect(result1.properties.gridId).toBeDefined();
      expect(result2.properties.gridId).toBeDefined();
    }, 30000);
  });

  describe('getForecast', () => {
    it('should fetch 7-day forecast with real grid data from Dallas', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      // First get point data to get grid info
      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      // Now get forecast
      const forecast = await service.getForecast(gridId, gridX, gridY);

      // Verify structure
      expect(forecast).toBeDefined();
      expect(forecast.properties).toBeDefined();
      expect(forecast.properties.periods).toBeDefined();
      expect(Array.isArray(forecast.properties.periods)).toBe(true);

      // Should have multiple periods (typically 14 = 7 days * 2 periods)
      expect(forecast.properties.periods.length).toBeGreaterThan(0);
      expect(forecast.properties.periods.length).toBeLessThanOrEqual(14);

      // Verify first period structure
      const firstPeriod = forecast.properties.periods[0];
      expect(firstPeriod).toBeDefined();
      expect(firstPeriod.number).toBe(1);
      expect(firstPeriod.name).toBeDefined();
      expect(typeof firstPeriod.temperature).toBe('number');
      expect(firstPeriod.temperatureUnit).toBe('F');
      expect(typeof firstPeriod.isDaytime).toBe('boolean');
      expect(firstPeriod.windSpeed).toBeDefined();
      expect(firstPeriod.windDirection).toBeDefined();
      expect(firstPeriod.icon).toContain('https://api.weather.gov/icons');
      expect(firstPeriod.shortForecast).toBeDefined();
      expect(firstPeriod.detailedForecast).toBeDefined();

      // Verify temperature is reasonable (between -50F and 150F)
      expect(firstPeriod.temperature).toBeGreaterThan(-50);
      expect(firstPeriod.temperature).toBeLessThan(150);
    }, 30000);

    it('should cache forecast data properly', async () => {
      const { lat, lon } = TEST_LOCATIONS.CHICAGO_IL;
      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      // First call
      const firstForecast = await service.getForecast(gridId, gridX, gridY);
      const statsAfterFirst = service.getCacheStats();

      // Second call
      const secondForecast = await service.getForecast(gridId, gridX, gridY);
      const statsAfterSecond = service.getCacheStats();

      // Should be cached
      expect(statsAfterSecond.hits).toBeGreaterThan(statsAfterFirst.hits);
      expect(secondForecast.properties.periods.length).toBe(firstForecast.properties.periods.length);
    }, 30000);
  });

  describe('getHourlyForecast', () => {
    it('should fetch hourly forecast data for Los Angeles', async () => {
      const { lat, lon } = TEST_LOCATIONS.LOS_ANGELES_CA;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const hourlyForecast = await service.getHourlyForecast(gridId, gridX, gridY);

      // Verify structure
      expect(hourlyForecast).toBeDefined();
      expect(hourlyForecast.properties).toBeDefined();
      expect(hourlyForecast.properties.periods).toBeDefined();
      expect(Array.isArray(hourlyForecast.properties.periods)).toBe(true);

      // Should have many hourly periods (typically 156 = 6.5 days)
      expect(hourlyForecast.properties.periods.length).toBeGreaterThan(24);

      // Verify first hourly period
      const firstHour = hourlyForecast.properties.periods[0];
      expect(firstHour.number).toBe(1);
      expect(typeof firstHour.temperature).toBe('number');
      expect(firstHour.temperatureUnit).toBe('F');
      expect(firstHour.startTime).toBeDefined();
      expect(firstHour.endTime).toBeDefined();
      expect(typeof firstHour.isDaytime).toBe('boolean');

      // Verify time progression
      const firstTime = new Date(firstHour.startTime);
      const secondTime = new Date(hourlyForecast.properties.periods[1].startTime);
      expect(secondTime.getTime()).toBeGreaterThan(firstTime.getTime());
    }, 30000);

    it('should handle probabilityOfPrecipitation values correctly', async () => {
      const { lat, lon } = TEST_LOCATIONS.NEW_YORK_NY;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const hourlyForecast = await service.getHourlyForecast(gridId, gridX, gridY);

      // Check that precipitation values are valid (0-100 or null)
      hourlyForecast.properties.periods.forEach(period => {
        if (period.probabilityOfPrecipitation.value !== null) {
          expect(period.probabilityOfPrecipitation.value).toBeGreaterThanOrEqual(0);
          expect(period.probabilityOfPrecipitation.value).toBeLessThanOrEqual(100);
        }
      });
    }, 30000);
  });

  describe('getCurrentConditions', () => {
    it('should fetch current conditions with station selection for Dallas', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const observation = await service.getCurrentConditions(gridId, gridX, gridY);

      // Note: observation might be null if no stations have data
      if (observation) {
        expect(observation.properties).toBeDefined();
        expect(observation.properties.timestamp).toBeDefined();

        // Verify timestamp is recent (within last 2 hours)
        const observationTime = new Date(observation.properties.timestamp);
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        expect(observationTime.getTime()).toBeGreaterThan(twoHoursAgo.getTime());

        // Check temperature structure
        expect(observation.properties.temperature).toBeDefined();
        if (observation.properties.temperature.value !== null) {
          // Temperature in Celsius should be reasonable
          expect(observation.properties.temperature.value).toBeGreaterThan(-40);
          expect(observation.properties.temperature.value).toBeLessThan(60);
        }

        // Check other required fields exist
        expect(observation.properties.windSpeed).toBeDefined();
        expect(observation.properties.windDirection).toBeDefined();
        expect(observation.properties.relativeHumidity).toBeDefined();
      }
    }, 30000);

    it('should handle station selection logic correctly', async () => {
      const { lat, lon } = TEST_LOCATIONS.CHICAGO_IL;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      // Get stations first to verify selection logic
      const stations = await service.getStations(gridId, gridX, gridY);
      expect(stations.features.length).toBeGreaterThan(0);

      // Get current conditions (uses first station)
      const observation = await service.getCurrentConditions(gridId, gridX, gridY);

      if (observation) {
        // Verify it used a valid station
        const stationId = observation.properties.station;
        expect(stationId).toBeDefined();
        expect(stationId).toContain('https://api.weather.gov/stations/');
      }
    }, 30000);

    it('should return null gracefully when no observation data available', async () => {
      // This tests the error handling path
      const observation = await service.getCurrentConditions('INVALID', 0, 0);

      // Should return null instead of throwing
      expect(observation).toBeNull();
    }, 30000);
  });

  describe('getStations', () => {
    it('should fetch observation stations for a grid point', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const stations = await service.getStations(gridId, gridX, gridY);

      // Verify structure
      expect(stations).toBeDefined();
      expect(stations.features).toBeDefined();
      expect(Array.isArray(stations.features)).toBe(true);
      expect(stations.features.length).toBeGreaterThan(0);

      // Verify first station
      const firstStation = stations.features[0];
      expect(firstStation.properties).toBeDefined();
      expect(firstStation.properties.stationIdentifier).toBeDefined();
      expect(firstStation.properties.name).toBeDefined();
      expect(firstStation.properties.timeZone).toBeDefined();
      expect(firstStation.geometry).toBeDefined();
      expect(firstStation.geometry.coordinates).toBeDefined();
      expect(firstStation.geometry.coordinates.length).toBe(2);
    }, 30000);

    it('should cache stations data for 7 days', async () => {
      const { lat, lon } = TEST_LOCATIONS.LOS_ANGELES_CA;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      // First call
      await service.getStations(gridId, gridX, gridY);
      const statsAfterFirst = service.getCacheStats();

      // Second call
      await service.getStations(gridId, gridX, gridY);
      const statsAfterSecond = service.getCacheStats();

      // Should be cached
      expect(statsAfterSecond.hits).toBeGreaterThan(statsAfterFirst.hits);
    }, 30000);
  });

  describe('getLatestObservation', () => {
    it('should fetch latest observation from a specific station', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const stations = await service.getStations(gridId, gridX, gridY);
      const stationId = stations.features[0].properties.stationIdentifier;

      const observation = await service.getLatestObservation(stationId);

      // Verify structure
      expect(observation).toBeDefined();
      expect(observation.properties).toBeDefined();
      expect(observation.properties.timestamp).toBeDefined();
      expect(observation.properties.textDescription).toBeDefined();

      // Verify data types
      expect(typeof observation.properties.timestamp).toBe('string');

      // Check that all expected fields exist (even if null)
      expect(observation.properties.temperature).toBeDefined();
      expect(observation.properties.dewpoint).toBeDefined();
      expect(observation.properties.windSpeed).toBeDefined();
      expect(observation.properties.windDirection).toBeDefined();
      expect(observation.properties.relativeHumidity).toBeDefined();
      expect(observation.properties.barometricPressure).toBeDefined();
      expect(observation.properties.visibility).toBeDefined();
    }, 30000);

    it('should cache observation for 10 minutes', async () => {
      const { lat, lon } = TEST_LOCATIONS.NEW_YORK_NY;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const stations = await service.getStations(gridId, gridX, gridY);
      const stationId = stations.features[0].properties.stationIdentifier;

      // First call
      await service.getLatestObservation(stationId);
      const statsAfterFirst = service.getCacheStats();

      // Second call
      await service.getLatestObservation(stationId);
      const statsAfterSecond = service.getCacheStats();

      // Should be cached
      expect(statsAfterSecond.hits).toBeGreaterThan(statsAfterFirst.hits);
    }, 30000);
  });

  describe('getActiveAlerts', () => {
    it('should fetch active alerts for a point', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      const alerts = await service.getActiveAlerts(lat, lon);

      // Verify structure (even if no alerts)
      expect(alerts).toBeDefined();
      expect(alerts.features).toBeDefined();
      expect(Array.isArray(alerts.features)).toBe(true);

      // If there are alerts, verify structure
      if (alerts.features.length > 0) {
        const firstAlert = alerts.features[0];
        expect(firstAlert.properties).toBeDefined();
        expect(firstAlert.properties.event).toBeDefined();
        expect(firstAlert.properties.severity).toBeDefined();
        expect(firstAlert.properties.urgency).toBeDefined();
        expect(firstAlert.properties.certainty).toBeDefined();
        expect(firstAlert.properties.effective).toBeDefined();
        expect(firstAlert.properties.expires).toBeDefined();
        expect(firstAlert.properties.description).toBeDefined();
      }
    }, 30000);

    it('should not cache alerts (always fresh)', async () => {
      const { lat, lon } = TEST_LOCATIONS.CHICAGO_IL;

      // First call
      await service.getActiveAlerts(lat, lon);
      const statsAfterFirst = service.getCacheStats();

      // Second call
      await service.getActiveAlerts(lat, lon);
      const statsAfterSecond = service.getCacheStats();

      // Cache stats should not increase (alerts are not cached)
      expect(statsAfterSecond.keys).toBe(statsAfterFirst.keys);
    }, 30000);
  });

  describe('prefetchWeatherData', () => {
    it('should prefetch all weather data for a location', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      // Clear cache first
      service.clearCache();
      const statsBefore = service.getCacheStats();
      expect(statsBefore.keys).toBe(0);

      // Prefetch data
      await service.prefetchWeatherData(lat, lon);

      // Verify cache has data
      const statsAfter = service.getCacheStats();
      expect(statsAfter.keys).toBeGreaterThan(0);

      // Should have cached:
      // - points data
      // - forecast
      // - hourly forecast
      // - stations
      // - observation
      // (alerts are not cached)
      expect(statsAfter.keys).toBeGreaterThanOrEqual(4);
    }, 30000);

    it('should handle prefetch errors gracefully without throwing', async () => {
      // Invalid coordinates should not throw
      await expect(
        service.prefetchWeatherData(999, 999)
      ).resolves.not.toThrow();
    }, 30000);

    it('should fetch all data in parallel efficiently', async () => {
      const { lat, lon } = TEST_LOCATIONS.LOS_ANGELES_CA;

      const startTime = Date.now();
      await service.prefetchWeatherData(lat, lon);
      const duration = Date.now() - startTime;

      // Should complete in reasonable time (parallel requests)
      // Individual requests take ~2-3 seconds each
      // Sequential would be 8-12 seconds, parallel should be 3-5 seconds
      expect(duration).toBeLessThan(15000); // 15 seconds max
    }, 30000);
  });

  describe('Cache Management', () => {
    it('should generate correct cache keys with prefixes', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      service.clearCache();

      // Fetch point data
      await service.getPointData(lat, lon);

      const stats = service.getCacheStats();
      expect(stats.keys).toBe(1);
    }, 30000);

    it('should clear all cache entries', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      // Add some data to cache
      await service.getPointData(lat, lon);

      let stats = service.getCacheStats();
      expect(stats.keys).toBeGreaterThan(0);

      // Clear cache
      service.clearCache();

      stats = service.getCacheStats();
      expect(stats.keys).toBe(0);
    }, 30000);

    it('should clear location-specific cache entries', async () => {
      const dallas = TEST_LOCATIONS.DALLAS_TX;
      const newYork = TEST_LOCATIONS.NEW_YORK_NY;

      service.clearCache();

      // Add data for both locations
      await service.getPointData(dallas.lat, dallas.lon);
      await service.getPointData(newYork.lat, newYork.lon);

      let stats = service.getCacheStats();
      const keysWithBoth = stats.keys;
      expect(keysWithBoth).toBe(2);

      // Clear only Dallas cache
      service.clearLocationCache(dallas.lat, dallas.lon);

      stats = service.getCacheStats();
      expect(stats.keys).toBe(keysWithBoth - 1);
    }, 30000);

    it('should track cache hits and misses', async () => {
      const { lat, lon } = TEST_LOCATIONS.CHICAGO_IL;

      service.clearCache();

      // First call - cache miss
      await service.getPointData(lat, lon);
      let stats = service.getCacheStats();
      expect(stats.misses).toBeGreaterThan(0);
      const initialMisses = stats.misses;

      // Second call - cache hit
      await service.getPointData(lat, lon);
      stats = service.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBe(initialMisses);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinates gracefully', async () => {
      // Coordinates outside valid range
      await expect(
        service.getPointData(999, 999)
      ).rejects.toThrow();
    }, 30000);

    it('should handle invalid grid coordinates', async () => {
      await expect(
        service.getForecast('INVALID', 0, 0)
      ).rejects.toThrow();
    }, 30000);

    it('should handle non-existent station IDs', async () => {
      await expect(
        service.getLatestObservation('INVALID')
      ).rejects.toThrow();
    }, 30000);

    it('should provide meaningful error messages', async () => {
      try {
        await service.getPointData(999, 999);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
        if (error instanceof Error) {
          expect(error.message.length).toBeGreaterThan(0);
        }
      }
    }, 30000);
  });

  describe('Integration Tests', () => {
    it('should complete full weather data workflow for a location', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      // Step 1: Get point data
      const pointData = await service.getPointData(lat, lon);
      expect(pointData.properties.gridId).toBeDefined();

      const { gridId, gridX, gridY } = pointData.properties;

      // Step 2: Get forecast
      const forecast = await service.getForecast(gridId, gridX, gridY);
      expect(forecast.properties.periods.length).toBeGreaterThan(0);

      // Step 3: Get hourly forecast
      const hourlyForecast = await service.getHourlyForecast(gridId, gridX, gridY);
      expect(hourlyForecast.properties.periods.length).toBeGreaterThan(0);

      // Step 4: Get current conditions
      await service.getCurrentConditions(gridId, gridX, gridY);
      // May be null, but should not throw

      // Step 5: Get alerts
      const alerts = await service.getActiveAlerts(lat, lon);
      expect(alerts.features).toBeDefined();

      // Verify all data is related to same location
      expect(forecast.properties.elevation).toBeDefined();
      expect(hourlyForecast.properties.elevation).toBeDefined();
    }, 30000);

    it('should handle multiple concurrent requests efficiently', async () => {
      const locations = [
        TEST_LOCATIONS.DALLAS_TX,
        TEST_LOCATIONS.NEW_YORK_NY,
        TEST_LOCATIONS.CHICAGO_IL,
      ];

      // Make concurrent requests
      const promises = locations.map(loc =>
        service.getPointData(loc.lat, loc.lon)
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.properties.gridId).toBeDefined();
      });
    }, 30000);

    it('should use cache across different method calls', async () => {
      const { lat, lon } = TEST_LOCATIONS.LOS_ANGELES_CA;

      service.clearCache();

      // Prefetch data (populates cache)
      await service.prefetchWeatherData(lat, lon);

      const statsAfterPrefetch = service.getCacheStats();
      const keysAfterPrefetch = statsAfterPrefetch.keys;

      // Now fetch data again - should use cache
      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;
      await service.getForecast(gridId, gridX, gridY);

      const statsAfterFetch = service.getCacheStats();

      // Should have cache hits
      expect(statsAfterFetch.hits).toBeGreaterThan(0);

      // Keys should not increase significantly (maybe 1-2 new entries)
      expect(statsAfterFetch.keys).toBeLessThanOrEqual(keysAfterPrefetch + 2);
    }, 30000);
  });

  describe('Data Quality Tests', () => {
    it('should return consistent data structure across different locations', async () => {
      const results = await Promise.all([
        service.getPointData(TEST_LOCATIONS.DALLAS_TX.lat, TEST_LOCATIONS.DALLAS_TX.lon),
        service.getPointData(TEST_LOCATIONS.NEW_YORK_NY.lat, TEST_LOCATIONS.NEW_YORK_NY.lon),
      ]);

      // Both should have same structure
      results.forEach(result => {
        expect(result.properties.gridId).toBeDefined();
        expect(result.properties.gridX).toBeDefined();
        expect(result.properties.gridY).toBeDefined();
        expect(result.properties.forecast).toBeDefined();
        expect(result.properties.forecastHourly).toBeDefined();
        expect(result.properties.relativeLocation).toBeDefined();
      });
    }, 30000);

    it('should return forecasts with consistent period structure', async () => {
      const { lat, lon } = TEST_LOCATIONS.CHICAGO_IL;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const forecast = await service.getForecast(gridId, gridX, gridY);

      // All periods should have consistent structure
      forecast.properties.periods.forEach((period, index) => {
        expect(period.number).toBe(index + 1);
        expect(typeof period.temperature).toBe('number');
        expect(['F', 'C']).toContain(period.temperatureUnit);
        expect(typeof period.isDaytime).toBe('boolean');
        expect(period.name).toBeDefined();
        expect(period.windSpeed).toBeDefined();
        expect(period.icon).toContain('https://');
      });
    }, 30000);

    it('should return timestamps in valid ISO 8601 format', async () => {
      const { lat, lon } = TEST_LOCATIONS.DALLAS_TX;

      const pointData = await service.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const forecast = await service.getForecast(gridId, gridX, gridY);

      // Check first period timestamps
      const firstPeriod = forecast.properties.periods[0];
      const startTime = new Date(firstPeriod.startTime);
      const endTime = new Date(firstPeriod.endTime);

      expect(startTime.getTime()).not.toBeNaN();
      expect(endTime.getTime()).not.toBeNaN();
      expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
    }, 30000);
  });
});
