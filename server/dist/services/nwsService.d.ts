/**
 * NWS API Service - Handles all interactions with the National Weather Service API
 * Includes caching, error handling, and retry logic with exponential backoff
 */
import type { PointsResponse, ForecastResponse, HourlyForecastResponse, ObservationResponse, AlertResponse, StationsResponse } from '../types/weather.types.js';
export declare class NWSService {
    private client;
    private cache;
    private userAgent;
    constructor(userAgent?: string);
    /**
     * Generic API call method with retry logic and exponential backoff
     */
    private makeRequest;
    /**
     * Utility method for delays
     */
    private delay;
    /**
     * Get cache key with prefix
     */
    private getCacheKey;
    /**
     * Get data from cache or fetch from API
     */
    private getCachedOrFetch;
    /**
     * Get point data for coordinates
     */
    getPointData(lat: number, lon: number): Promise<PointsResponse>;
    /**
     * Get 7-day forecast (12-hour periods)
     */
    getForecast(gridId: string, gridX: number, gridY: number): Promise<ForecastResponse>;
    /**
     * Get hourly forecast
     */
    getHourlyForecast(gridId: string, gridX: number, gridY: number): Promise<HourlyForecastResponse>;
    /**
     * Get observation stations for a grid point
     */
    getStations(gridId: string, gridX: number, gridY: number): Promise<StationsResponse>;
    /**
     * Get latest observation from a station
     */
    getLatestObservation(stationId: string): Promise<ObservationResponse>;
    /**
     * Get active alerts for a point
     */
    getActiveAlerts(lat: number, lon: number): Promise<AlertResponse>;
    /**
     * Get current conditions for a location
     * Fetches stations and then gets the latest observation from the nearest station
     */
    getCurrentConditions(gridId: string, gridX: number, gridY: number): Promise<ObservationResponse | null>;
    /**
     * Clear all cache entries
     */
    clearCache(): void;
    /**
     * Clear cache for a specific location
     */
    clearLocationCache(lat: number, lon: number): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        keys: number;
        hits: number;
        misses: number;
    };
    /**
     * Fetch and cache weather data for coordinates (background refresh)
     * Used by background jobs to pre-warm cache for configured locations
     */
    prefetchWeatherData(lat: number, lon: number): Promise<void>;
}
export declare const nwsService: NWSService;
//# sourceMappingURL=nwsService.d.ts.map