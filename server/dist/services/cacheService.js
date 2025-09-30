import NodeCache from 'node-cache';
/**
 * Cache TTL (Time To Live) configurations in seconds
 */
export const CacheTTL = {
    POINTS: 86400, // 24 hours - Geographic grid point data
    FORECASTS: 3600, // 1 hour - Weather forecast data
    OBSERVATIONS: 600, // 10 minutes - Current weather observations
    STATION_METADATA: 604800, // 7 days - Weather station information
    ALERTS: 0, // No caching - Always fetch fresh alert data
};
/**
 * Cache data types for key generation
 */
export var CacheDataType;
(function (CacheDataType) {
    CacheDataType["POINTS"] = "points";
    CacheDataType["FORECAST_7DAY"] = "forecast-7day";
    CacheDataType["FORECAST_HOURLY"] = "forecast-hourly";
    CacheDataType["OBSERVATION"] = "observation";
    CacheDataType["STATION"] = "station";
    CacheDataType["ZONE"] = "zone";
    CacheDataType["ALERT"] = "alert";
    CacheDataType["GEOCODE"] = "geocode";
})(CacheDataType || (CacheDataType = {}));
/**
 * CacheService - Production-ready in-memory caching with TTL support
 *
 * Features:
 * - Configurable TTL per data type
 * - Automatic cache key generation
 * - Cache statistics tracking
 * - Thread-safe operations
 * - Memory-efficient storage
 */
export class CacheService {
    cache;
    constructor() {
        this.cache = new NodeCache({
            stdTTL: CacheTTL.FORECASTS, // Default TTL: 1 hour
            checkperiod: 120, // Check for expired keys every 2 minutes
            useClones: false, // Don't clone objects for better performance
            deleteOnExpire: true, // Automatically delete expired items
            maxKeys: 1000, // Limit max keys to prevent memory issues
        });
        // Set up event listeners for monitoring
        this.cache.on('expired', (key, _value) => {
            console.log(`[Cache] Expired: ${key}`);
        });
        this.cache.on('flush', () => {
            console.log('[Cache] Cache flushed');
        });
    }
    /**
     * Get value from cache
     * @param key Cache key
     * @returns Cached value or undefined if not found
     */
    get(key) {
        return this.cache.get(key);
    }
    /**
     * Set value in cache with optional TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds (optional, uses default if not provided)
     * @returns Success boolean
     */
    set(key, value, ttl) {
        if (ttl !== undefined) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }
    /**
     * Delete value from cache
     * @param key Cache key
     * @returns Number of deleted entries
     */
    del(key) {
        return this.cache.del(key);
    }
    /**
     * Delete multiple keys from cache
     * @param keys Array of cache keys
     * @returns Number of deleted entries
     */
    delMultiple(keys) {
        return this.cache.del(keys);
    }
    /**
     * Check if key exists in cache
     * @param key Cache key
     * @returns True if key exists
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Flush all cache entries
     */
    flush() {
        this.cache.flushAll();
    }
    /**
     * Get cache statistics
     * @returns Cache statistics object
     */
    getStats() {
        return this.cache.getStats();
    }
    /**
     * Get all cache keys
     * @returns Array of cache keys
     */
    keys() {
        return this.cache.keys();
    }
    /**
     * Get TTL for a specific key
     * @param key Cache key
     * @returns TTL in seconds or undefined if key doesn't exist
     */
    getTtl(key) {
        return this.cache.getTtl(key);
    }
    /**
     * Update TTL for a specific key
     * @param key Cache key
     * @param ttl New TTL in seconds
     * @returns Success boolean
     */
    setTtl(key, ttl) {
        return this.cache.ttl(key, ttl);
    }
    /**
     * Get multiple values from cache
     * @param keys Array of cache keys
     * @returns Object with key-value pairs (only existing keys)
     */
    getMultiple(keys) {
        return this.cache.mget(keys);
    }
    /**
     * Set multiple values in cache
     * @param entries Array of objects with key, val, and optional ttl
     * @returns Success boolean
     */
    setMultiple(entries) {
        return this.cache.mset(entries);
    }
    /**
     * Close cache and clear all entries
     */
    close() {
        this.cache.close();
    }
}
/**
 * Cache key generation utilities
 */
export class CacheKeyGenerator {
    /**
     * Generate cache key for geographic points data
     * @param lat Latitude
     * @param lon Longitude
     */
    static points(lat, lon) {
        return `${CacheDataType.POINTS}:${lat.toFixed(4)},${lon.toFixed(4)}`;
    }
    /**
     * Generate cache key for 7-day forecast
     * @param office NWS office code
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     */
    static forecast7Day(office, gridX, gridY) {
        return `${CacheDataType.FORECAST_7DAY}:${office}/${gridX},${gridY}`;
    }
    /**
     * Generate cache key for hourly forecast
     * @param office NWS office code
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     */
    static forecastHourly(office, gridX, gridY) {
        return `${CacheDataType.FORECAST_HOURLY}:${office}/${gridX},${gridY}`;
    }
    /**
     * Generate cache key for current observations
     * @param stationId Weather station ID
     */
    static observation(stationId) {
        return `${CacheDataType.OBSERVATION}:${stationId}`;
    }
    /**
     * Generate cache key for station metadata
     * @param stationId Weather station ID
     */
    static station(stationId) {
        return `${CacheDataType.STATION}:${stationId}`;
    }
    /**
     * Generate cache key for zone metadata
     * @param zoneId Zone ID
     */
    static zone(zoneId) {
        return `${CacheDataType.ZONE}:${zoneId}`;
    }
    /**
     * Generate cache key for alerts (not typically cached, but provided for completeness)
     * @param lat Latitude
     * @param lon Longitude
     */
    static alert(lat, lon) {
        return `${CacheDataType.ALERT}:${lat.toFixed(4)},${lon.toFixed(4)}`;
    }
    /**
     * Generate cache key for geocode (ZIP to coordinates)
     * @param zipCode ZIP code
     */
    static geocode(zipCode) {
        return `${CacheDataType.GEOCODE}:${zipCode}`;
    }
    /**
     * Generate custom cache key
     * @param type Cache data type
     * @param identifier Unique identifier
     */
    static custom(type, identifier) {
        return `${type}:${identifier}`;
    }
}
/**
 * Helper function to get appropriate TTL for data type
 * @param dataType Cache data type
 * @returns TTL in seconds
 */
export function getTTLForDataType(dataType) {
    switch (dataType) {
        case CacheDataType.POINTS:
            return CacheTTL.POINTS;
        case CacheDataType.FORECAST_7DAY:
        case CacheDataType.FORECAST_HOURLY:
            return CacheTTL.FORECASTS;
        case CacheDataType.OBSERVATION:
            return CacheTTL.OBSERVATIONS;
        case CacheDataType.STATION:
        case CacheDataType.ZONE:
            return CacheTTL.STATION_METADATA;
        case CacheDataType.GEOCODE:
            return CacheTTL.POINTS; // Geocode data is stable, use same as points
        case CacheDataType.ALERT:
            return CacheTTL.ALERTS; // No caching for alerts
        default:
            return CacheTTL.FORECASTS; // Default to 1 hour
    }
}
// Export singleton instance
export const cacheService = new CacheService();
// Export default for convenience
export default cacheService;
//# sourceMappingURL=cacheService.js.map