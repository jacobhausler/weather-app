/**
 * Comprehensive tests for geocodingService.ts
 *
 * These are REAL tests that test actual functionality with real API calls.
 * No mocks, no placeholders - testing actual behavior.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  geocodeZip,
  clearGeocodeCache,
  getGeocodeCacheStats,
  type Coordinates,
  type GeocodingError,
} from './geocodingService.js';

// Helper to check if error is a GeocodingError
function isGeocodingError(error: unknown): error is GeocodingError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  );
}

describe('geocodingService', () => {
  // Clear cache before each test to ensure isolation
  beforeEach(() => {
    clearGeocodeCache();
  });

  // Clean up after each test
  afterEach(() => {
    clearGeocodeCache();
  });

  describe('geocodeZip - Valid ZIP Codes', () => {
    it('should geocode a valid ZIP code (75454 - Melissa, TX)', async () => {
      const result = await geocodeZip('75454');

      // Verify structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('lat');
      expect(result).toHaveProperty('lon');

      // Verify types
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Verify reasonable coordinates for Melissa, TX area
      // Melissa, TX is roughly at 33.28°N, 96.57°W
      expect(result.lat).toBeGreaterThan(33.0);
      expect(result.lat).toBeLessThan(34.0);
      expect(result.lon).toBeGreaterThan(-97.0);
      expect(result.lon).toBeLessThan(-96.0);

      // Verify coordinates are not NaN
      expect(result.lat).not.toBeNaN();
      expect(result.lon).not.toBeNaN();
    }, 15000);

    it('should geocode another valid ZIP code (75070 - McKinney, TX)', async () => {
      const result = await geocodeZip('75070');

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // McKinney, TX is roughly at 33.19°N, 96.61°W
      expect(result.lat).toBeGreaterThan(33.0);
      expect(result.lat).toBeLessThan(34.0);
      expect(result.lon).toBeGreaterThan(-97.0);
      expect(result.lon).toBeLessThan(-96.0);
    }, 15000);

    it('should geocode a third valid ZIP code (75035 - Frisco, TX)', async () => {
      const result = await geocodeZip('75035');

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Frisco, TX is roughly at 33.15°N, 96.82°W
      expect(result.lat).toBeGreaterThan(33.0);
      expect(result.lat).toBeLessThan(34.0);
      expect(result.lon).toBeGreaterThan(-97.0);
      expect(result.lon).toBeLessThan(-96.0);
    }, 15000);

    it('should geocode NYC ZIP code (10001 - Manhattan)', async () => {
      const result = await geocodeZip('10001');

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Manhattan is roughly at 40.75°N, 73.99°W
      expect(result.lat).toBeGreaterThan(40.0);
      expect(result.lat).toBeLessThan(41.0);
      expect(result.lon).toBeGreaterThan(-75.0);
      expect(result.lon).toBeLessThan(-73.0);
    }, 15000);

    it('should geocode a California ZIP code (90210 - Beverly Hills)', async () => {
      const result = await geocodeZip('90210');

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Beverly Hills is roughly at 34.09°N, 118.41°W
      expect(result.lat).toBeGreaterThan(34.0);
      expect(result.lat).toBeLessThan(35.0);
      expect(result.lon).toBeGreaterThan(-119.0);
      expect(result.lon).toBeLessThan(-118.0);
    }, 15000);

    it('should handle ZIP code with leading/trailing whitespace', async () => {
      const result = await geocodeZip('  75454  ');

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Should get same result as trimmed version
      expect(result.lat).toBeGreaterThan(33.0);
      expect(result.lat).toBeLessThan(34.0);
    }, 15000);
  });

  describe('geocodeZip - Invalid ZIP Code Format', () => {
    it('should reject 4-digit ZIP code', async () => {
      await expect(geocodeZip('1234')).rejects.toThrow();

      try {
        await geocodeZip('1234');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
          expect(error.message).toContain('Invalid ZIP code format');
          expect(error.message).toContain('5 digits');
        }
      }
    });

    it('should reject 6-digit ZIP code', async () => {
      await expect(geocodeZip('123456')).rejects.toThrow();

      try {
        await geocodeZip('123456');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
          expect(error.message).toContain('Invalid ZIP code format');
        }
      }
    });

    it('should reject alphabetic characters', async () => {
      await expect(geocodeZip('ABCDE')).rejects.toThrow();

      try {
        await geocodeZip('ABCDE');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
          expect(error.message).toContain('Invalid ZIP code format');
        }
      }
    });

    it('should reject mixed alphanumeric', async () => {
      await expect(geocodeZip('12A45')).rejects.toThrow();

      try {
        await geocodeZip('12A45');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
        }
      }
    });

    it('should reject special characters', async () => {
      await expect(geocodeZip('12-45')).rejects.toThrow();

      try {
        await geocodeZip('12-45');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
        }
      }
    });

    it('should reject empty string', async () => {
      await expect(geocodeZip('')).rejects.toThrow();

      try {
        await geocodeZip('');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
        }
      }
    });

    it('should reject whitespace only', async () => {
      await expect(geocodeZip('     ')).rejects.toThrow();

      try {
        await geocodeZip('     ');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.code).toBe('INVALID_ZIP');
        }
      }
    });
  });

  describe('geocodeZip - Edge Cases', () => {
    it('should handle ZIP code 00000 (special case)', async () => {
      // 00000 is not a real ZIP code - should fail
      await expect(geocodeZip('00000')).rejects.toThrow();

      try {
        await geocodeZip('00000');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          // Should be NO_RESULTS since API won't find it
          expect(['NO_RESULTS', 'API_ERROR', 'NETWORK_ERROR']).toContain(error.code);
        }
      }
    }, 15000);

    it('should handle ZIP code 99999 (likely invalid)', async () => {
      // 99999 is not a real US ZIP code
      await expect(geocodeZip('99999')).rejects.toThrow();

      try {
        await geocodeZip('99999');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          // Should be NO_RESULTS since API won't find it
          expect(['NO_RESULTS', 'API_ERROR', 'NETWORK_ERROR']).toContain(error.code);
        }
      }
    }, 15000);
  });

  describe('Coordinate Validation - US Bounds', () => {
    it('should return coordinates within US latitude bounds (24-72°N)', async () => {
      const result = await geocodeZip('75454');

      // US spans from approximately 24°N (Key West) to 72°N (Alaska)
      expect(result.lat).toBeGreaterThanOrEqual(24);
      expect(result.lat).toBeLessThanOrEqual(72);
    }, 15000);

    it('should return coordinates within US longitude bounds (-180 to -65°W)', async () => {
      const result = await geocodeZip('75454');

      // US spans from approximately -180°W (Alaska) to -65°W (Maine)
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(-65);
    }, 15000);

    it('should validate Alaska ZIP code coordinates (extreme north)', async () => {
      const result = await geocodeZip('99501'); // Anchorage, AK

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Anchorage is roughly at 61.2°N, 149.9°W
      expect(result.lat).toBeGreaterThan(60);
      expect(result.lat).toBeLessThan(62);
      expect(result.lon).toBeGreaterThan(-151);
      expect(result.lon).toBeLessThan(-148);

      // Within US bounds
      expect(result.lat).toBeGreaterThanOrEqual(24);
      expect(result.lat).toBeLessThanOrEqual(72);
    }, 15000);

    it('should validate Hawaii ZIP code coordinates (extreme west)', async () => {
      const result = await geocodeZip('96801'); // Hawaii ZIP

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Hawaii ZIP codes span a large area including remote islands
      // Latitude: roughly 18-26°N (main islands to Northwestern Hawaiian Islands)
      // Longitude: roughly -180 to -154°W (can extend to international date line)
      expect(result.lat).toBeGreaterThan(18);
      expect(result.lat).toBeLessThan(26);
      expect(result.lon).toBeGreaterThan(-181);
      expect(result.lon).toBeLessThan(-154);

      // Should be within overall US bounds
      expect(result.lat).toBeGreaterThanOrEqual(24);
      expect(result.lat).toBeLessThanOrEqual(72);
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(-65);
    }, 15000);

    it('should validate Maine ZIP code coordinates (extreme east)', async () => {
      const result = await geocodeZip('04401'); // Bangor, ME

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Bangor, ME is roughly at 44.8°N, 68.8°W
      expect(result.lat).toBeGreaterThan(44);
      expect(result.lat).toBeLessThan(45);
      expect(result.lon).toBeGreaterThan(-69);
      expect(result.lon).toBeLessThan(-68);

      // Within US bounds
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(-65);
    }, 15000);

    it('should validate Florida Keys ZIP code (extreme south)', async () => {
      const result = await geocodeZip('33040'); // Key West, FL

      expect(result).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lon).toBe('number');

      // Key West is roughly at 24.5°N, 81.8°W
      expect(result.lat).toBeGreaterThan(24);
      expect(result.lat).toBeLessThan(25);
      expect(result.lon).toBeGreaterThan(-82);
      expect(result.lon).toBeLessThan(-81);

      // Within US bounds
      expect(result.lat).toBeGreaterThanOrEqual(24);
    }, 15000);
  });

  describe('Caching Behavior', () => {
    it('should cache geocoding results', async () => {
      // Clear cache and get initial stats
      clearGeocodeCache();
      const initialStats = getGeocodeCacheStats();
      expect(initialStats.keys).toBe(0);

      // First call - should miss cache and fetch from API
      await geocodeZip('75454');

      const afterFirstCall = getGeocodeCacheStats();
      expect(afterFirstCall.keys).toBe(1);
      expect(afterFirstCall.misses).toBeGreaterThan(initialStats.misses);

      // Second call - should hit cache
      await geocodeZip('75454');

      const afterSecondCall = getGeocodeCacheStats();
      expect(afterSecondCall.keys).toBe(1);
      expect(afterSecondCall.hits).toBeGreaterThan(afterFirstCall.hits);
    }, 15000);

    it('should return same coordinates on cache hit', async () => {
      clearGeocodeCache();

      // First call
      const firstResult = await geocodeZip('75454');

      // Second call (should be cached)
      const secondResult = await geocodeZip('75454');

      // Should return exact same coordinates
      expect(secondResult.lat).toBe(firstResult.lat);
      expect(secondResult.lon).toBe(firstResult.lon);
    }, 15000);

    it('should cache multiple different ZIP codes independently', async () => {
      clearGeocodeCache();

      // Geocode three different ZIP codes
      const result1 = await geocodeZip('75454');
      const result2 = await geocodeZip('75070');
      const result3 = await geocodeZip('75035');

      // All should be cached
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(3);

      // Coordinates should be different
      expect(result1.lat).not.toBe(result2.lat);
      expect(result1.lat).not.toBe(result3.lat);
      expect(result2.lat).not.toBe(result3.lat);
    }, 15000);

    it('should serve from cache on subsequent calls (performance)', async () => {
      clearGeocodeCache();

      // First call - measures API call time
      const startFirst = Date.now();
      await geocodeZip('75454');
      const firstCallDuration = Date.now() - startFirst;

      // Second call - should be much faster (from cache)
      const startSecond = Date.now();
      await geocodeZip('75454');
      const secondCallDuration = Date.now() - startSecond;

      // Cache hit should be significantly faster (at least 10x)
      // This is a reasonable assumption for cache vs network
      expect(secondCallDuration).toBeLessThan(firstCallDuration / 10);
    }, 15000);

    it('should normalize ZIP codes for cache keys (whitespace)', async () => {
      clearGeocodeCache();

      // Geocode with different whitespace
      const result1 = await geocodeZip('75454');
      const result2 = await geocodeZip(' 75454 ');
      const result3 = await geocodeZip('  75454  ');

      // Should all be cached under the same key
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(1);

      // Should return same coordinates
      expect(result2.lat).toBe(result1.lat);
      expect(result2.lon).toBe(result1.lon);
      expect(result3.lat).toBe(result1.lat);
      expect(result3.lon).toBe(result1.lon);
    }, 15000);
  });

  describe('clearGeocodeCache', () => {
    it('should clear all cached entries', async () => {
      // Add some entries to cache
      await geocodeZip('75454');
      await geocodeZip('75070');
      await geocodeZip('75035');

      let stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(3);

      // Clear cache
      clearGeocodeCache();

      stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(0);
    }, 15000);

    it('should force new API calls after cache clear', async () => {
      // First call
      await geocodeZip('75454');

      const statsBeforeClear = getGeocodeCacheStats();
      const hitsBefore = statsBeforeClear.hits;

      // Clear cache
      clearGeocodeCache();

      // Call again - should miss cache and fetch from API
      await geocodeZip('75454');

      const statsAfterClear = getGeocodeCacheStats();
      // Hits should not have increased (because it was a miss)
      expect(statsAfterClear.hits).toBe(hitsBefore);
      // But we should have 1 key again
      expect(statsAfterClear.keys).toBe(1);
    }, 15000);
  });

  describe('getGeocodeCacheStats', () => {
    it('should return correct initial stats', () => {
      clearGeocodeCache();
      const stats = getGeocodeCacheStats();

      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');

      expect(stats.keys).toBe(0);
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
    });

    it('should track cache hits correctly', async () => {
      clearGeocodeCache();
      const initialStats = getGeocodeCacheStats();
      const initialHits = initialStats.hits;

      // First call - miss
      await geocodeZip('75454');

      // Second call - hit
      await geocodeZip('75454');

      const finalStats = getGeocodeCacheStats();
      expect(finalStats.hits).toBeGreaterThan(initialHits);
    }, 15000);

    it('should track cache misses correctly', async () => {
      clearGeocodeCache();
      const initialStats = getGeocodeCacheStats();
      const initialMisses = initialStats.misses;

      // First call - miss
      await geocodeZip('75454');

      const finalStats = getGeocodeCacheStats();
      expect(finalStats.misses).toBeGreaterThan(initialMisses);
    }, 15000);

    it('should track key count correctly', async () => {
      clearGeocodeCache();

      await geocodeZip('75454');
      expect(getGeocodeCacheStats().keys).toBe(1);

      await geocodeZip('75070');
      expect(getGeocodeCacheStats().keys).toBe(2);

      await geocodeZip('75035');
      expect(getGeocodeCacheStats().keys).toBe(3);

      // Calling existing ZIP shouldn't add new key
      await geocodeZip('75454');
      expect(getGeocodeCacheStats().keys).toBe(3);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle non-existent ZIP codes gracefully', async () => {
      // Using a valid format but non-existent ZIP
      await expect(geocodeZip('00001')).rejects.toThrow();

      try {
        await geocodeZip('00001');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          // Should be NO_RESULTS or API_ERROR
          expect(['NO_RESULTS', 'API_ERROR', 'NETWORK_ERROR']).toContain(error.code);
          expect(error.message).toBeTruthy();
        }
      }
    }, 15000);

    it('should provide meaningful error messages', async () => {
      try {
        await geocodeZip('ABC');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error.message).toContain('Invalid ZIP code format');
          expect(error.message).toContain('5 digits');
          expect(error.message).toContain('ABC');
        }
      }
    });

    it('should have proper error structure', async () => {
      try {
        await geocodeZip('1234');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
        if (isGeocodingError(error)) {
          expect(error).toHaveProperty('code');
          expect(error).toHaveProperty('message');
          expect(typeof error.code).toBe('string');
          expect(typeof error.message).toBe('string');
          expect(['INVALID_ZIP', 'API_ERROR', 'NO_RESULTS', 'NETWORK_ERROR']).toContain(error.code);
        }
      }
    });

    it('should not cache failed geocoding attempts', async () => {
      clearGeocodeCache();

      // Try to geocode invalid ZIP
      try {
        await geocodeZip('00001');
      } catch {
        // Expected to fail
      }

      // Cache should still be empty (no failed results cached)
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(0);
    }, 15000);
  });

  describe('Type Safety and Return Values', () => {
    it('should return proper Coordinates type', async () => {
      const result: Coordinates = await geocodeZip('75454');

      // TypeScript compilation ensures this, but also verify at runtime
      expect(result).toHaveProperty('lat');
      expect(result).toHaveProperty('lon');
      expect(Object.keys(result).length).toBe(2);
    }, 15000);

    it('should return finite numbers', async () => {
      const result = await geocodeZip('75454');

      expect(Number.isFinite(result.lat)).toBe(true);
      expect(Number.isFinite(result.lon)).toBe(true);
      expect(result.lat).not.toBeNaN();
      expect(result.lon).not.toBeNaN();
      expect(result.lat).not.toBe(Infinity);
      expect(result.lat).not.toBe(-Infinity);
      expect(result.lon).not.toBe(Infinity);
      expect(result.lon).not.toBe(-Infinity);
    }, 15000);

    it('should handle precision correctly', async () => {
      const result = await geocodeZip('75454');

      // Coordinates should have reasonable precision (not too many decimals)
      const latStr = result.lat.toString();
      const lonStr = result.lon.toString();

      // Should have decimal points
      expect(latStr).toContain('.');
      expect(lonStr).toContain('.');

      // Coordinates should be precise (typically 4-6 decimal places)
      expect(result.lat).not.toBe(Math.floor(result.lat));
      expect(result.lon).not.toBe(Math.floor(result.lon));
    }, 15000);
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests for same ZIP', async () => {
      clearGeocodeCache();

      // Make 5 concurrent requests for the same ZIP
      const promises = Array(5).fill(null).map(() => geocodeZip('75454'));
      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // All should have same coordinates
      const firstResult = results[0];
      results.forEach(result => {
        expect(result?.lat).toBe(firstResult?.lat);
        expect(result?.lon).toBe(firstResult?.lon);
      });

      // Should only have 1 cached entry
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(1);
    }, 15000);

    it('should handle multiple concurrent requests for different ZIPs', async () => {
      clearGeocodeCache();

      // Make concurrent requests for different ZIPs
      const zips = ['75454', '75070', '75035', '10001', '90210'];
      const promises = zips.map(zip => geocodeZip(zip));
      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // All should have valid coordinates
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result?.lat).toBe('number');
        expect(typeof result?.lon).toBe('number');
      });

      // All should be different
      const uniqueCoords = new Set(results.map(r => `${r?.lat},${r?.lon}`));
      expect(uniqueCoords.size).toBe(5);

      // Should have 5 cached entries
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(5);
    }, 20000);
  });

  describe('Real-World Scenario Tests', () => {
    it('should handle typical user flow: search multiple ZIPs and revisit', async () => {
      clearGeocodeCache();

      // User searches for home ZIP
      const home = await geocodeZip('75454');
      expect(home).toBeDefined();

      // User searches for work ZIP
      const work = await geocodeZip('75070');
      expect(work).toBeDefined();

      // User searches for another location
      const other = await geocodeZip('75035');
      expect(other).toBeDefined();

      // User returns to home ZIP (cache hit)
      const homeAgain = await geocodeZip('75454');
      expect(homeAgain.lat).toBe(home.lat);
      expect(homeAgain.lon).toBe(home.lon);

      // Should have 3 cached entries
      expect(getGeocodeCacheStats().keys).toBe(3);

      // Should have at least 1 cache hit
      expect(getGeocodeCacheStats().hits).toBeGreaterThan(0);
    }, 15000);

    it('should handle rapid repeated searches (stress test)', async () => {
      clearGeocodeCache();

      // Simulate rapid repeated searches (like user clicking refresh)
      const zip = '75454';
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const result = await geocodeZip(zip);
        expect(result).toBeDefined();
        expect(typeof result.lat).toBe('number');
      }

      // Should still only have 1 cached entry
      expect(getGeocodeCacheStats().keys).toBe(1);

      // Should have many cache hits (all but the first)
      expect(getGeocodeCacheStats().hits).toBeGreaterThanOrEqual(iterations - 1);
    }, 15000);

    it('should handle mixed valid and invalid requests', async () => {
      clearGeocodeCache();

      // Valid request
      const valid1 = await geocodeZip('75454');
      expect(valid1).toBeDefined();

      // Invalid request
      try {
        await geocodeZip('INVALID');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
      }

      // Another valid request
      const valid2 = await geocodeZip('75070');
      expect(valid2).toBeDefined();

      // Invalid format
      try {
        await geocodeZip('123');
      } catch (error) {
        expect(isGeocodingError(error)).toBe(true);
      }

      // Should only cache valid results
      const stats = getGeocodeCacheStats();
      expect(stats.keys).toBe(2);
    }, 15000);
  });
});
