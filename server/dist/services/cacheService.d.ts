/**
 * Cache TTL (Time To Live) configurations in seconds
 */
export declare const CacheTTL: {
    readonly POINTS: 86400;
    readonly FORECASTS: 3600;
    readonly OBSERVATIONS: 600;
    readonly STATION_METADATA: 604800;
    readonly ALERTS: 0;
};
/**
 * Cache data types for key generation
 */
export declare enum CacheDataType {
    POINTS = "points",
    FORECAST_7DAY = "forecast-7day",
    FORECAST_HOURLY = "forecast-hourly",
    OBSERVATION = "observation",
    STATION = "station",
    ZONE = "zone",
    ALERT = "alert",
    GEOCODE = "geocode"
}
/**
 * Cache statistics interface
 */
export interface CacheStats {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
}
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
export declare class CacheService {
    private cache;
    constructor();
    /**
     * Get value from cache
     * @param key Cache key
     * @returns Cached value or undefined if not found
     */
    get<T>(key: string): T | undefined;
    /**
     * Set value in cache with optional TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds (optional, uses default if not provided)
     * @returns Success boolean
     */
    set<T>(key: string, value: T, ttl?: number): boolean;
    /**
     * Delete value from cache
     * @param key Cache key
     * @returns Number of deleted entries
     */
    del(key: string): number;
    /**
     * Delete multiple keys from cache
     * @param keys Array of cache keys
     * @returns Number of deleted entries
     */
    delMultiple(keys: string[]): number;
    /**
     * Check if key exists in cache
     * @param key Cache key
     * @returns True if key exists
     */
    has(key: string): boolean;
    /**
     * Flush all cache entries
     */
    flush(): void;
    /**
     * Get cache statistics
     * @returns Cache statistics object
     */
    getStats(): CacheStats;
    /**
     * Get all cache keys
     * @returns Array of cache keys
     */
    keys(): string[];
    /**
     * Get TTL for a specific key
     * @param key Cache key
     * @returns TTL in seconds or undefined if key doesn't exist
     */
    getTtl(key: string): number | undefined;
    /**
     * Update TTL for a specific key
     * @param key Cache key
     * @param ttl New TTL in seconds
     * @returns Success boolean
     */
    setTtl(key: string, ttl: number): boolean;
    /**
     * Get multiple values from cache
     * @param keys Array of cache keys
     * @returns Object with key-value pairs (only existing keys)
     */
    getMultiple<T>(keys: string[]): Record<string, T>;
    /**
     * Set multiple values in cache
     * @param entries Array of objects with key, val, and optional ttl
     * @returns Success boolean
     */
    setMultiple<T>(entries: Array<{
        key: string;
        val: T;
        ttl?: number;
    }>): boolean;
    /**
     * Close cache and clear all entries
     */
    close(): void;
}
/**
 * Cache key generation utilities
 */
export declare class CacheKeyGenerator {
    /**
     * Generate cache key for geographic points data
     * @param lat Latitude
     * @param lon Longitude
     */
    static points(lat: number, lon: number): string;
    /**
     * Generate cache key for 7-day forecast
     * @param office NWS office code
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     */
    static forecast7Day(office: string, gridX: number, gridY: number): string;
    /**
     * Generate cache key for hourly forecast
     * @param office NWS office code
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     */
    static forecastHourly(office: string, gridX: number, gridY: number): string;
    /**
     * Generate cache key for current observations
     * @param stationId Weather station ID
     */
    static observation(stationId: string): string;
    /**
     * Generate cache key for station metadata
     * @param stationId Weather station ID
     */
    static station(stationId: string): string;
    /**
     * Generate cache key for zone metadata
     * @param zoneId Zone ID
     */
    static zone(zoneId: string): string;
    /**
     * Generate cache key for alerts (not typically cached, but provided for completeness)
     * @param lat Latitude
     * @param lon Longitude
     */
    static alert(lat: number, lon: number): string;
    /**
     * Generate cache key for geocode (ZIP to coordinates)
     * @param zipCode ZIP code
     */
    static geocode(zipCode: string): string;
    /**
     * Generate custom cache key
     * @param type Cache data type
     * @param identifier Unique identifier
     */
    static custom(type: string, identifier: string): string;
}
/**
 * Helper function to get appropriate TTL for data type
 * @param dataType Cache data type
 * @returns TTL in seconds
 */
export declare function getTTLForDataType(dataType: CacheDataType): number;
export declare const cacheService: CacheService;
export default cacheService;
//# sourceMappingURL=cacheService.d.ts.map