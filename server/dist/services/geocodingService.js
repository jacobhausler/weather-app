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
import axios from 'axios';
// @ts-ignore - NodeCache uses CommonJS and has issues with NodeNext module resolution
import NodeCache from 'node-cache';
// Constants
const ZIPPOPOTAM_API_BASE = 'http://api.zippopotam.us/us';
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
const ZIP_REGEX = /^\d{5}$/;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const USER_AGENT = 'WeatherApp/1.0 (HAUS Weather Station)';
// Cache instance
// @ts-ignore
const geocodeCache = new NodeCache({
    stdTTL: CACHE_TTL,
    checkperiod: 600, // Check for expired entries every 10 minutes
    useClones: false, // Performance optimization for simple objects
});
/**
 * Validates ZIP code format
 */
function isValidZipCode(zipCode) {
    return ZIP_REGEX.test(zipCode.trim());
}
/**
 * Creates a standardized error object
 */
function createError(code, message, originalError) {
    return { code, message, originalError };
}
/**
 * Fetches coordinates from Zippopotam.us API
 */
async function fetchFromZippopotamAPI(zipCode) {
    try {
        const url = `${ZIPPOPOTAM_API_BASE}/${zipCode}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENT,
            },
            timeout: REQUEST_TIMEOUT,
            validateStatus: (status) => status === 200 || status === 404,
        });
        // Handle 404 (ZIP not found)
        if (response.status === 404) {
            throw createError('NO_RESULTS', `ZIP code not found: ${zipCode}`);
        }
        const places = response.data?.places;
        if (!places || places.length === 0) {
            throw createError('NO_RESULTS', `No location data found for ZIP code: ${zipCode}`);
        }
        const firstPlace = places[0];
        if (!firstPlace) {
            throw createError('NO_RESULTS', `No valid location found for ZIP code: ${zipCode}`);
        }
        // Parse coordinates (they come as strings)
        const lat = parseFloat(firstPlace.latitude);
        const lon = parseFloat(firstPlace.longitude);
        // Validate coordinates are reasonable for US
        if (isNaN(lat) ||
            isNaN(lon) ||
            lat < 24 || // Southernmost US latitude (Key West area)
            lat > 72 || // Northernmost US latitude (Alaska)
            lon < -180 || // Western longitude boundary
            lon > -65 // Easternmost US longitude (Maine)
        ) {
            throw createError('API_ERROR', `Invalid coordinates returned for ZIP code: ${zipCode} (lat: ${lat}, lon: ${lon})`);
        }
        return {
            lat,
            lon,
        };
    }
    catch (error) {
        // Re-throw if already a GeocodingError
        if (error && typeof error === 'object' && 'code' in error) {
            throw error;
        }
        // Handle Axios errors
        if (axios.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                throw createError('NETWORK_ERROR', 'Zippopotam API request timed out', error);
            }
            if (!axiosError.response) {
                throw createError('NETWORK_ERROR', 'Unable to reach Zippopotam API', error);
            }
            throw createError('API_ERROR', `Zippopotam API returned status ${axiosError.response.status}`, error);
        }
        // Handle unknown errors
        throw createError('API_ERROR', 'Unexpected error during geocoding', error);
    }
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
export async function geocodeZip(zipCode) {
    // Normalize input
    const normalizedZip = zipCode.trim();
    // Validate ZIP code format
    if (!isValidZipCode(normalizedZip)) {
        throw createError('INVALID_ZIP', `Invalid ZIP code format. Must be 5 digits. Received: ${zipCode}`);
    }
    // Check cache first
    const cached = geocodeCache.get(normalizedZip);
    if (cached) {
        return cached;
    }
    // Fetch from API
    const coordinates = await fetchFromZippopotamAPI(normalizedZip);
    // Cache the result
    geocodeCache.set(normalizedZip, coordinates);
    return coordinates;
}
/**
 * Clears the geocoding cache (useful for testing)
 */
export function clearGeocodeCache() {
    geocodeCache.flushAll();
}
/**
 * Gets cache statistics
 */
export function getGeocodeCacheStats() {
    return {
        keys: geocodeCache.keys().length,
        hits: geocodeCache.getStats().hits,
        misses: geocodeCache.getStats().misses,
    };
}
//# sourceMappingURL=geocodingService.js.map