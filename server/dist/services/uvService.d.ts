/**
 * UV Index Service - Fetches UV Index data from OpenWeatherMap One Call API
 * Free tier: 1,000 calls/day
 * Docs: https://openweathermap.org/api/one-call-3
 */
export interface UVIndexData {
    value: number;
    timestamp: string;
    latitude: number;
    longitude: number;
}
export declare class UVService {
    private client;
    private cache;
    private apiKey;
    private isEnabled;
    constructor(apiKey?: string);
    /**
     * Utility method for delays
     */
    private delay;
    /**
     * Get cache key for coordinates
     */
    private getCacheKey;
    /**
     * Check if UV Index service is enabled
     */
    isServiceEnabled(): boolean;
    /**
     * Fetch UV Index from OpenWeatherMap One Call API
     * Uses the current UV index from the "current" object
     */
    getUVIndex(lat: number, lon: number): Promise<UVIndexData | null>;
    /**
     * Clear cache for a specific location
     */
    clearLocationCache(lat: number, lon: number): void;
    /**
     * Clear all cache entries
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        keys: number;
        hits: number;
        misses: number;
    };
}
export declare const uvService: UVService;
//# sourceMappingURL=uvService.d.ts.map