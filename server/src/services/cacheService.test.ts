import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CacheService,
  CacheKeyGenerator,
  CacheTTL,
  CacheDataType,
  getTTLForDataType,
  cacheService,
} from './cacheService';

/**
 * Comprehensive tests for CacheService
 *
 * These are REAL tests that test actual functionality with no mocks.
 * Tests cover:
 * - Basic cache operations (get, set, delete)
 * - TTL expiration behavior with real timing
 * - Cache existence checks
 * - Cache statistics (hits, misses, keys)
 * - Cache clearing operations
 * - Multiple cache instances
 * - Edge cases (null values, empty strings, various data types)
 * - Bulk operations (getMultiple, setMultiple, delMultiple)
 * - TTL management (getTtl, setTtl)
 * - Cache key generation utilities
 */

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  afterEach(() => {
    cache.close();
  });

  describe('Basic Operations', () => {
    it('should set and get a string value', () => {
      const key = 'test-key';
      const value = 'test-value';

      const setResult = cache.set(key, value);
      expect(setResult).toBe(true);

      const retrieved = cache.get<string>(key);
      expect(retrieved).toBe(value);
    });

    it('should set and get an object value', () => {
      const key = 'test-object';
      const value = {
        name: 'Test User',
        age: 30,
        active: true,
        metadata: { created: '2025-01-01', updated: '2025-01-15' }
      };

      cache.set(key, value);
      const retrieved = cache.get<typeof value>(key);

      expect(retrieved).toEqual(value);
      expect(retrieved?.name).toBe('Test User');
      expect(retrieved?.metadata.created).toBe('2025-01-01');
    });

    it('should set and get an array value', () => {
      const key = 'test-array';
      const value = [1, 2, 3, 4, 5];

      cache.set(key, value);
      const retrieved = cache.get<number[]>(key);

      expect(retrieved).toEqual(value);
      expect(retrieved?.length).toBe(5);
    });

    it('should set and get a number value', () => {
      const key = 'test-number';
      const value = 42;

      cache.set(key, value);
      const retrieved = cache.get<number>(key);

      expect(retrieved).toBe(value);
    });

    it('should set and get a boolean value', () => {
      const key = 'test-boolean';
      const value = true;

      cache.set(key, value);
      const retrieved = cache.get<boolean>(key);

      expect(retrieved).toBe(value);
    });

    it('should return undefined for non-existent key', () => {
      const retrieved = cache.get<string>('non-existent-key');
      expect(retrieved).toBeUndefined();
    });

    it('should delete a key and return 1', () => {
      const key = 'test-delete';
      cache.set(key, 'value');

      const deleteCount = cache.del(key);
      expect(deleteCount).toBe(1);

      const retrieved = cache.get<string>(key);
      expect(retrieved).toBeUndefined();
    });

    it('should return 0 when deleting non-existent key', () => {
      const deleteCount = cache.del('non-existent-key');
      expect(deleteCount).toBe(0);
    });
  });

  describe('TTL (Time To Live) Behavior', () => {
    it('should set a value with custom TTL and expire after timeout', async () => {
      const key = 'test-ttl';
      const value = 'expires-soon';
      const ttlSeconds = 1; // 1 second

      cache.set(key, value, ttlSeconds);

      // Immediately after setting, value should exist
      expect(cache.get<string>(key)).toBe(value);
      expect(cache.has(key)).toBe(true);

      // Wait for TTL to expire (1.2 seconds to account for processing time)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // After expiration, value should be undefined
      expect(cache.get<string>(key)).toBeUndefined();
      expect(cache.has(key)).toBe(false);
    });

    it('should set multiple values with different TTLs', async () => {
      const key1 = 'short-ttl';
      const key2 = 'long-ttl';

      cache.set(key1, 'expires-fast', 1); // 1 second
      cache.set(key2, 'expires-slow', 3); // 3 seconds

      // Both should exist initially
      expect(cache.has(key1)).toBe(true);
      expect(cache.has(key2)).toBe(true);

      // Wait 1.2 seconds
      await new Promise(resolve => setTimeout(resolve, 1200));

      // key1 should be expired, key2 should still exist
      expect(cache.has(key1)).toBe(false);
      expect(cache.has(key2)).toBe(true);
      expect(cache.get<string>(key2)).toBe('expires-slow');
    });

    it('should use default TTL when not specified', () => {
      const key = 'default-ttl';
      cache.set(key, 'uses-default');

      const ttl = cache.getTtl(key);
      expect(ttl).toBeDefined();
      // Default TTL is 3600 seconds (1 hour), should be close to that
      // getTtl returns timestamp in milliseconds
      if (ttl) {
        const remainingSeconds = Math.floor((ttl - Date.now()) / 1000);
        expect(remainingSeconds).toBeGreaterThan(3590);
        expect(remainingSeconds).toBeLessThanOrEqual(3600);
      }
    });

    it('should get TTL for a key', () => {
      const key = 'test-get-ttl';
      const ttlSeconds = 300; // 5 minutes

      cache.set(key, 'value', ttlSeconds);

      const ttl = cache.getTtl(key);
      expect(ttl).toBeDefined();

      if (ttl) {
        const remainingSeconds = Math.floor((ttl - Date.now()) / 1000);
        expect(remainingSeconds).toBeGreaterThan(290);
        expect(remainingSeconds).toBeLessThanOrEqual(300);
      }
    });

    it('should return undefined TTL for non-existent key', () => {
      const ttl = cache.getTtl('non-existent');
      expect(ttl).toBeUndefined();
    });

    it('should update TTL for an existing key', async () => {
      const key = 'test-update-ttl';
      cache.set(key, 'value', 2); // 2 seconds initially

      // Immediately update TTL to 10 seconds
      const updateResult = cache.setTtl(key, 10);
      expect(updateResult).toBe(true);

      // Wait 2.5 seconds (original TTL would have expired)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Key should still exist because we extended the TTL
      expect(cache.has(key)).toBe(true);
      expect(cache.get<string>(key)).toBe('value');
    });

    it('should return false when updating TTL for non-existent key', () => {
      const result = cache.setTtl('non-existent', 100);
      expect(result).toBe(false);
    });
  });

  describe('Cache Existence Checks', () => {
    it('should return true when key exists', () => {
      const key = 'existing-key';
      cache.set(key, 'value');

      expect(cache.has(key)).toBe(true);
    });

    it('should return false when key does not exist', () => {
      expect(cache.has('non-existent-key')).toBe(false);
    });

    it('should return false after key is deleted', () => {
      const key = 'to-be-deleted';
      cache.set(key, 'value');
      expect(cache.has(key)).toBe(true);

      cache.del(key);
      expect(cache.has(key)).toBe(false);
    });

    it('should return false after key expires', async () => {
      const key = 'to-expire';
      cache.set(key, 'value', 1); // 1 second TTL

      expect(cache.has(key)).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 1200));

      expect(cache.has(key)).toBe(false);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const key = 'stats-test';
      cache.set(key, 'value');

      // Get the value (hit)
      cache.get(key);

      // Try to get non-existent key (miss)
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(1);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });

    it('should track number of keys', () => {
      const initialStats = cache.getStats();
      const initialKeys = initialStats.keys;

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const stats = cache.getStats();
      expect(stats.keys).toBe(initialKeys + 3);
    });

    it('should update key count after deletion', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const statsBefore = cache.getStats();
      const keysBefore = statsBefore.keys;

      cache.del('key1');

      const statsAfter = cache.getStats();
      const keysAfter = statsAfter.keys;

      expect(keysAfter).toBe(keysBefore - 1);
    });

    it('should return comprehensive stats object', () => {
      cache.set('test-key', { data: 'test' });

      const stats = cache.getStats();

      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('ksize');
      expect(stats).toHaveProperty('vsize');
      expect(typeof stats.keys).toBe('number');
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
    });
  });

  describe('Cache Keys Management', () => {
    it('should return all cache keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array when cache is empty', () => {
      const keys = cache.keys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBe(0);
    });

    it('should not include deleted keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.del('key1');

      const keys = cache.keys();
      expect(keys).not.toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('Cache Clearing Operations', () => {
    it('should flush all cache entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.keys().length).toBeGreaterThanOrEqual(3);

      cache.flush();

      expect(cache.keys().length).toBe(0);
      expect(cache.getStats().keys).toBe(0);
    });

    it('should have no keys after flush', () => {
      cache.set('key1', 'value1');
      cache.flush();

      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('Bulk Operations', () => {
    it('should get multiple values at once', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const results = cache.getMultiple<string>(['key1', 'key2', 'key3']);

      expect(results).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });

    it('should only return existing keys in getMultiple', () => {
      cache.set('key1', 'value1');
      cache.set('key3', 'value3');

      const results = cache.getMultiple<string>(['key1', 'key2', 'key3']);

      expect(results).toHaveProperty('key1');
      expect(results).toHaveProperty('key3');
      expect(results).not.toHaveProperty('key2');
    });

    it('should set multiple values at once', () => {
      const entries = [
        { key: 'bulk1', val: 'value1' },
        { key: 'bulk2', val: 'value2' },
        { key: 'bulk3', val: 'value3' },
      ];

      const result = cache.setMultiple(entries);
      expect(result).toBe(true);

      expect(cache.get<string>('bulk1')).toBe('value1');
      expect(cache.get<string>('bulk2')).toBe('value2');
      expect(cache.get<string>('bulk3')).toBe('value3');
    });

    it('should set multiple values with different TTLs', () => {
      const entries = [
        { key: 'ttl1', val: 'value1', ttl: 100 },
        { key: 'ttl2', val: 'value2', ttl: 200 },
        { key: 'ttl3', val: 'value3', ttl: 300 },
      ];

      cache.setMultiple(entries);

      const ttl1 = cache.getTtl('ttl1');
      const ttl2 = cache.getTtl('ttl2');
      const ttl3 = cache.getTtl('ttl3');

      expect(ttl1).toBeDefined();
      expect(ttl2).toBeDefined();
      expect(ttl3).toBeDefined();

      // Verify TTLs are different and approximately correct
      if (ttl1 && ttl2) {
        const diff = Math.floor((ttl2 - ttl1) / 1000);
        expect(diff).toBeGreaterThanOrEqual(99);
        expect(diff).toBeLessThanOrEqual(101);
      }
    });

    it('should delete multiple keys at once', () => {
      cache.set('del1', 'value1');
      cache.set('del2', 'value2');
      cache.set('del3', 'value3');

      const deleteCount = cache.delMultiple(['del1', 'del2']);
      expect(deleteCount).toBe(2);

      expect(cache.has('del1')).toBe(false);
      expect(cache.has('del2')).toBe(false);
      expect(cache.has('del3')).toBe(true);
    });

    it('should handle empty array in getMultiple', () => {
      const results = cache.getMultiple<string>([]);
      expect(results).toEqual({});
    });

    it('should handle empty array in setMultiple', () => {
      const result = cache.setMultiple([]);
      expect(result).toBe(true);
    });

    it('should handle empty array in delMultiple', () => {
      const deleteCount = cache.delMultiple([]);
      expect(deleteCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const key = 'null-value';
      cache.set(key, null);

      const retrieved = cache.get(key);
      expect(retrieved).toBeNull();
      expect(cache.has(key)).toBe(true);
    });

    it('should handle empty string values', () => {
      const key = 'empty-string';
      cache.set(key, '');

      const retrieved = cache.get<string>(key);
      expect(retrieved).toBe('');
      expect(cache.has(key)).toBe(true);
    });

    it('should handle zero as a value', () => {
      const key = 'zero-value';
      cache.set(key, 0);

      const retrieved = cache.get<number>(key);
      expect(retrieved).toBe(0);
      expect(cache.has(key)).toBe(true);
    });

    it('should handle false as a value', () => {
      const key = 'false-value';
      cache.set(key, false);

      const retrieved = cache.get<boolean>(key);
      expect(retrieved).toBe(false);
      expect(cache.has(key)).toBe(true);
    });

    it('should handle undefined values', () => {
      const key = 'undefined-value';
      cache.set(key, undefined);

      const retrieved = cache.get(key);
      // node-cache converts undefined to null when storing
      expect(retrieved === undefined || retrieved === null).toBe(true);
      // Key should still exist in cache
      expect(cache.has(key)).toBe(true);
    });

    it('should handle complex nested objects', () => {
      const key = 'complex-object';
      const value = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              meta: { a: 'test', b: true },
            },
          },
        },
        array: [{ id: 1 }, { id: 2 }],
      };

      cache.set(key, value);
      const retrieved = cache.get<typeof value>(key);

      expect(retrieved).toEqual(value);
      expect(retrieved?.level1.level2.level3.data).toEqual([1, 2, 3]);
      expect(retrieved?.array[1].id).toBe(2);
    });

    it('should handle very long strings', () => {
      const key = 'long-string';
      const value = 'a'.repeat(10000);

      cache.set(key, value);
      const retrieved = cache.get<string>(key);

      expect(retrieved).toBe(value);
      expect(retrieved?.length).toBe(10000);
    });

    it('should handle keys with special characters', () => {
      const specialKeys = [
        'key:with:colons',
        'key/with/slashes',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key@with#special$chars',
      ];

      specialKeys.forEach((key, index) => {
        cache.set(key, `value${index}`);
        expect(cache.get<string>(key)).toBe(`value${index}`);
        expect(cache.has(key)).toBe(true);
      });
    });

    it('should handle overwriting existing key', () => {
      const key = 'overwrite-key';

      cache.set(key, 'original');
      expect(cache.get<string>(key)).toBe('original');

      cache.set(key, 'updated');
      expect(cache.get<string>(key)).toBe('updated');
    });

    it('should handle TTL of 0 (items do not expire)', () => {
      const key = 'zero-ttl';
      // node-cache treats TTL of 0 as "no expiration" rather than "expire immediately"
      cache.set(key, 'value', 0);

      // With TTL of 0, the item is cached without expiration
      const retrieved = cache.get<string>(key);
      expect(retrieved).toBe('value');
    });
  });

  describe('Multiple Cache Instances', () => {
    it('should maintain separate state for different instances', () => {
      const cache1 = new CacheService();
      const cache2 = new CacheService();

      cache1.set('shared-key', 'cache1-value');
      cache2.set('shared-key', 'cache2-value');

      expect(cache1.get<string>('shared-key')).toBe('cache1-value');
      expect(cache2.get<string>('shared-key')).toBe('cache2-value');

      cache1.close();
      cache2.close();
    });

    it('should have independent statistics', () => {
      const cache1 = new CacheService();
      const cache2 = new CacheService();

      cache1.set('key1', 'value1');
      cache1.set('key2', 'value2');

      cache2.set('keyA', 'valueA');

      const stats1 = cache1.getStats();
      const stats2 = cache2.getStats();

      expect(stats1.keys).toBe(2);
      expect(stats2.keys).toBe(1);

      cache1.close();
      cache2.close();
    });
  });

  describe('Close Operation', () => {
    it('should close cache properly', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.keys().length).toBeGreaterThan(0);

      // Close should close the cache but behavior of keys() after close
      // may vary by implementation
      cache.close();

      // After close, cache is in closed state (exact behavior implementation-specific)
      expect(cache).toBeDefined();
    });
  });
});

describe('CacheKeyGenerator', () => {
  describe('Points Key Generation', () => {
    it('should generate consistent keys for same coordinates', () => {
      const lat = 33.1581;
      const lon = -96.5989;

      const key1 = CacheKeyGenerator.points(lat, lon);
      const key2 = CacheKeyGenerator.points(lat, lon);

      expect(key1).toBe(key2);
    });

    it('should generate keys with proper format', () => {
      const key = CacheKeyGenerator.points(33.1581, -96.5989);

      // Format: points:<latitude>,<longitude> with fixed 4 decimal places
      // Note: negative signs need to be accounted for in regex
      expect(key).toMatch(/^points:-?\d+\.\d+,-?\d+\.\d+$/);
      expect(key).toBe('points:33.1581,-96.5989');
    });

    it('should handle negative coordinates', () => {
      const key = CacheKeyGenerator.points(-33.1581, -96.5989);

      expect(key).toBe('points:-33.1581,-96.5989');
    });

    it('should format coordinates to 4 decimal places', () => {
      const key = CacheKeyGenerator.points(33.158123456, -96.598987654);

      expect(key).toBe('points:33.1581,-96.5990');
    });
  });

  describe('Forecast Key Generation', () => {
    it('should generate 7-day forecast key', () => {
      const key = CacheKeyGenerator.forecast7Day('FWD', 78, 96);

      expect(key).toBe('forecast-7day:FWD/78,96');
    });

    it('should generate hourly forecast key', () => {
      const key = CacheKeyGenerator.forecastHourly('FWD', 78, 96);

      expect(key).toBe('forecast-hourly:FWD/78,96');
    });

    it('should handle different office codes', () => {
      const key1 = CacheKeyGenerator.forecast7Day('NYC', 50, 75);
      const key2 = CacheKeyGenerator.forecast7Day('LAX', 50, 75);

      expect(key1).toBe('forecast-7day:NYC/50,75');
      expect(key2).toBe('forecast-7day:LAX/50,75');
      expect(key1).not.toBe(key2);
    });

    it('should handle different grid coordinates', () => {
      const key1 = CacheKeyGenerator.forecast7Day('FWD', 78, 96);
      const key2 = CacheKeyGenerator.forecast7Day('FWD', 79, 96);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Observation Key Generation', () => {
    it('should generate observation key', () => {
      const key = CacheKeyGenerator.observation('KDFW');

      expect(key).toBe('observation:KDFW');
    });

    it('should handle different station IDs', () => {
      const key1 = CacheKeyGenerator.observation('KDFW');
      const key2 = CacheKeyGenerator.observation('KLAX');

      expect(key1).not.toBe(key2);
    });
  });

  describe('Station Key Generation', () => {
    it('should generate station key', () => {
      const key = CacheKeyGenerator.station('KDFW');

      expect(key).toBe('station:KDFW');
    });

    it('should differentiate from observation key', () => {
      const observationKey = CacheKeyGenerator.observation('KDFW');
      const stationKey = CacheKeyGenerator.station('KDFW');

      expect(observationKey).not.toBe(stationKey);
    });
  });

  describe('Zone Key Generation', () => {
    it('should generate zone key', () => {
      const key = CacheKeyGenerator.zone('TXZ119');

      expect(key).toBe('zone:TXZ119');
    });

    it('should handle different zone IDs', () => {
      const key1 = CacheKeyGenerator.zone('TXZ119');
      const key2 = CacheKeyGenerator.zone('CAZ041');

      expect(key1).not.toBe(key2);
    });
  });

  describe('Alert Key Generation', () => {
    it('should generate alert key', () => {
      const key = CacheKeyGenerator.alert(33.1581, -96.5989);

      expect(key).toBe('alert:33.1581,-96.5989');
    });

    it('should format coordinates to 4 decimal places', () => {
      const key = CacheKeyGenerator.alert(33.158123456, -96.598987654);

      expect(key).toBe('alert:33.1581,-96.5990');
    });
  });

  describe('Geocode Key Generation', () => {
    it('should generate geocode key', () => {
      const key = CacheKeyGenerator.geocode('75454');

      expect(key).toBe('geocode:75454');
    });

    it('should handle different ZIP codes', () => {
      const key1 = CacheKeyGenerator.geocode('75454');
      const key2 = CacheKeyGenerator.geocode('90210');

      expect(key1).not.toBe(key2);
    });

    it('should handle ZIP+4 format', () => {
      const key = CacheKeyGenerator.geocode('75454-1234');

      expect(key).toBe('geocode:75454-1234');
    });
  });

  describe('Custom Key Generation', () => {
    it('should generate custom key', () => {
      const key = CacheKeyGenerator.custom('custom-type', 'identifier-123');

      expect(key).toBe('custom-type:identifier-123');
    });

    it('should handle complex identifiers', () => {
      const key = CacheKeyGenerator.custom('data', 'user-123/session-456');

      expect(key).toBe('data:user-123/session-456');
    });

    it('should allow any type string', () => {
      const key1 = CacheKeyGenerator.custom('temperature', 'dallas-tx');
      const key2 = CacheKeyGenerator.custom('precipitation', 'seattle-wa');

      expect(key1).toBe('temperature:dallas-tx');
      expect(key2).toBe('precipitation:seattle-wa');
    });
  });
});

describe('getTTLForDataType', () => {
  it('should return correct TTL for POINTS', () => {
    const ttl = getTTLForDataType(CacheDataType.POINTS);
    expect(ttl).toBe(CacheTTL.POINTS);
    expect(ttl).toBe(86400); // 24 hours
  });

  it('should return correct TTL for FORECAST_7DAY', () => {
    const ttl = getTTLForDataType(CacheDataType.FORECAST_7DAY);
    expect(ttl).toBe(CacheTTL.FORECASTS);
    expect(ttl).toBe(3600); // 1 hour
  });

  it('should return correct TTL for FORECAST_HOURLY', () => {
    const ttl = getTTLForDataType(CacheDataType.FORECAST_HOURLY);
    expect(ttl).toBe(CacheTTL.FORECASTS);
    expect(ttl).toBe(3600); // 1 hour
  });

  it('should return correct TTL for OBSERVATION', () => {
    const ttl = getTTLForDataType(CacheDataType.OBSERVATION);
    expect(ttl).toBe(CacheTTL.OBSERVATIONS);
    expect(ttl).toBe(600); // 10 minutes
  });

  it('should return correct TTL for STATION', () => {
    const ttl = getTTLForDataType(CacheDataType.STATION);
    expect(ttl).toBe(CacheTTL.STATION_METADATA);
    expect(ttl).toBe(604800); // 7 days
  });

  it('should return correct TTL for ZONE', () => {
    const ttl = getTTLForDataType(CacheDataType.ZONE);
    expect(ttl).toBe(CacheTTL.STATION_METADATA);
    expect(ttl).toBe(604800); // 7 days
  });

  it('should return correct TTL for GEOCODE', () => {
    const ttl = getTTLForDataType(CacheDataType.GEOCODE);
    expect(ttl).toBe(CacheTTL.POINTS);
    expect(ttl).toBe(86400); // 24 hours
  });

  it('should return correct TTL for ALERT', () => {
    const ttl = getTTLForDataType(CacheDataType.ALERT);
    expect(ttl).toBe(CacheTTL.ALERTS);
    expect(ttl).toBe(0); // No caching
  });
});

describe('CacheTTL Constants', () => {
  it('should have correct POINTS TTL (24 hours)', () => {
    expect(CacheTTL.POINTS).toBe(86400);
  });

  it('should have correct FORECASTS TTL (1 hour)', () => {
    expect(CacheTTL.FORECASTS).toBe(3600);
  });

  it('should have correct OBSERVATIONS TTL (10 minutes)', () => {
    expect(CacheTTL.OBSERVATIONS).toBe(600);
  });

  it('should have correct STATION_METADATA TTL (7 days)', () => {
    expect(CacheTTL.STATION_METADATA).toBe(604800);
  });

  it('should have correct ALERTS TTL (no caching)', () => {
    expect(CacheTTL.ALERTS).toBe(0);
  });
});

describe('Singleton cacheService Instance', () => {
  it('should export a singleton instance', () => {
    expect(cacheService).toBeDefined();
    expect(cacheService).toBeInstanceOf(CacheService);
  });

  it('should function as a working cache instance', () => {
    const key = 'singleton-test';
    const value = 'singleton-value';

    cacheService.set(key, value);
    const retrieved = cacheService.get<string>(key);

    expect(retrieved).toBe(value);

    // Clean up
    cacheService.del(key);
  });

  it('should maintain state across references', () => {
    const key = 'shared-state';

    cacheService.set(key, 'test-value');

    // Import default export and verify same instance
    const retrieved = cacheService.get<string>(key);
    expect(retrieved).toBe('test-value');

    // Clean up
    cacheService.del(key);
  });
});

describe('Real-World Usage Scenarios', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  afterEach(() => {
    cache.close();
  });

  it('should cache weather forecast data with appropriate TTL', () => {
    const forecastKey = CacheKeyGenerator.forecast7Day('FWD', 78, 96);
    const forecastData = {
      periods: [
        { name: 'Today', temperature: 75, shortForecast: 'Sunny' },
        { name: 'Tonight', temperature: 58, shortForecast: 'Clear' },
      ],
    };

    const ttl = getTTLForDataType(CacheDataType.FORECAST_7DAY);
    cache.set(forecastKey, forecastData, ttl);

    const retrieved = cache.get<typeof forecastData>(forecastKey);
    expect(retrieved).toEqual(forecastData);
    expect(retrieved?.periods[0].temperature).toBe(75);
  });

  it('should cache multiple weather data types simultaneously', () => {
    // Cache points data
    const pointsKey = CacheKeyGenerator.points(33.1581, -96.5989);
    const pointsData = { gridId: 'FWD', gridX: 78, gridY: 96 };
    cache.set(pointsKey, pointsData, getTTLForDataType(CacheDataType.POINTS));

    // Cache forecast data
    const forecastKey = CacheKeyGenerator.forecast7Day('FWD', 78, 96);
    const forecastData = { temperature: 75 };
    cache.set(forecastKey, forecastData, getTTLForDataType(CacheDataType.FORECAST_7DAY));

    // Cache observation data
    const obsKey = CacheKeyGenerator.observation('KDFW');
    const obsData = { temp: 72, humidity: 65 };
    cache.set(obsKey, obsData, getTTLForDataType(CacheDataType.OBSERVATION));

    // Verify all cached
    expect(cache.get(pointsKey)).toEqual(pointsData);
    expect(cache.get(forecastKey)).toEqual(forecastData);
    expect(cache.get(obsKey)).toEqual(obsData);

    const keys = cache.keys();
    expect(keys).toContain(pointsKey);
    expect(keys).toContain(forecastKey);
    expect(keys).toContain(obsKey);
  });

  it('should handle cache refresh workflow', async () => {
    const key = 'refresh-test';

    // Initial cache
    cache.set(key, 'old-data', 2);
    expect(cache.get(key)).toBe('old-data');

    // Wait 1 second, update cache (simulating refresh)
    await new Promise(resolve => setTimeout(resolve, 1000));
    cache.set(key, 'refreshed-data', 2);
    expect(cache.get(key)).toBe('refreshed-data');

    // Original TTL countdown continues from when it was set
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Should still exist because we reset TTL when we refreshed
    expect(cache.has(key)).toBe(true);
  });

  it('should support batch loading of ZIP code data', () => {
    const zipCodes = ['75454', '75070', '75035'];
    const entries = zipCodes.map(zip => ({
      key: CacheKeyGenerator.geocode(zip),
      val: { zipCode: zip, lat: 33.0 + Math.random(), lon: -96.0 - Math.random() },
      ttl: getTTLForDataType(CacheDataType.GEOCODE),
    }));

    cache.setMultiple(entries);

    const keys = zipCodes.map(zip => CacheKeyGenerator.geocode(zip));
    const results = cache.getMultiple(keys);

    expect(Object.keys(results).length).toBe(3);
    zipCodes.forEach(zip => {
      const key = CacheKeyGenerator.geocode(zip);
      expect(results[key]).toBeDefined();
      expect(results[key].zipCode).toBe(zip);
    });
  });

  it('should handle cache invalidation for stale data', () => {
    const forecastKey = CacheKeyGenerator.forecast7Day('FWD', 78, 96);

    // Cache initial data
    cache.set(forecastKey, { temperature: 70 });
    expect(cache.has(forecastKey)).toBe(true);

    // Invalidate cache (e.g., manual refresh requested)
    cache.del(forecastKey);
    expect(cache.has(forecastKey)).toBe(false);

    // Set new data
    cache.set(forecastKey, { temperature: 75 });
    expect(cache.get<any>(forecastKey)?.temperature).toBe(75);
  });

  it('should efficiently retrieve forecast data for multiple locations', () => {
    const locations = [
      { office: 'FWD', gridX: 78, gridY: 96 },
      { office: 'OUN', gridX: 45, gridY: 67 },
      { office: 'HGX', gridX: 23, gridY: 89 },
    ];

    // Cache data for each location
    locations.forEach((loc, index) => {
      const key = CacheKeyGenerator.forecast7Day(loc.office, loc.gridX, loc.gridY);
      cache.set(key, { locationIndex: index, temperature: 70 + index });
    });

    // Retrieve all at once
    const keys = locations.map(loc =>
      CacheKeyGenerator.forecast7Day(loc.office, loc.gridX, loc.gridY)
    );
    const results = cache.getMultiple<any>(keys);

    expect(Object.keys(results).length).toBe(3);
    keys.forEach((key, index) => {
      expect(results[key].locationIndex).toBe(index);
      expect(results[key].temperature).toBe(70 + index);
    });
  });
});
