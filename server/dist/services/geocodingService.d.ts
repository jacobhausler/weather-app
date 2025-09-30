/**
 * ZIP Code Geocoding Service
 *
 * Converts 5-digit US ZIP codes to latitude/longitude coordinates
 * using the free Zippopotam.us API with 24-hour caching.
 *
 * API: http://api.zippopotam.us/us/{zip-code}
 * - Free, no API key required
 * - Reliable and fast
 * - Returns ZIP code centroid coordinates
 */
interface Coordinates {
    lat: number;
    lon: number;
}
interface GeocodingError {
    code: 'INVALID_ZIP' | 'API_ERROR' | 'NO_RESULTS' | 'NETWORK_ERROR';
    message: string;
    originalError?: unknown;
}
/**
 * Converts a 5-digit US ZIP code to latitude/longitude coordinates
 *
 * Uses the Zippopotam.us API with 24-hour caching for performance.
 *
 * @param zipCode - 5-digit US ZIP code string
 * @returns Promise resolving to coordinates object with lat/lon
 * @throws GeocodingError with specific error code and message
 *
 * @example
 * ```typescript
 * try {
 *   const coords = await geocodeZip('75454');
 *   console.log(coords); // { lat: 33.2841, lon: -96.574 }
 * } catch (error) {
 *   console.error(error.message);
 * }
 * ```
 */
export declare function geocodeZip(zipCode: string): Promise<Coordinates>;
/**
 * Clears the geocoding cache (useful for testing)
 */
export declare function clearGeocodeCache(): void;
/**
 * Gets cache statistics
 */
export declare function getGeocodeCacheStats(): {
    keys: number;
    hits: number;
    misses: number;
};
export type { Coordinates, GeocodingError };
//# sourceMappingURL=geocodingService.d.ts.map