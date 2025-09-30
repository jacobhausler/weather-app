/**
 * NWS API Service - Handles all interactions with the National Weather Service API
 * Includes caching, error handling, and retry logic with exponential backoff
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import type {
  PointsResponse,
  ForecastResponse,
  HourlyForecastResponse,
  ObservationResponse,
  AlertResponse,
  StationsResponse,
  NWSApiError,
} from '../types/weather.types.js';

// Cache TTL values (in seconds)
const CACHE_TTL = {
  POINTS: 24 * 60 * 60, // 24 hours
  FORECAST: 60 * 60, // 1 hour
  HOURLY_FORECAST: 60 * 60, // 1 hour
  OBSERVATIONS: 10 * 60, // 10 minutes
  STATIONS: 7 * 24 * 60 * 60, // 7 days
  ALERTS: 0, // No caching for alerts
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_DELAY = 5000; // 5 seconds for 429 errors

export class NWSService {
  private client: AxiosInstance;
  private cache: NodeCache;
  private userAgent: string;

  constructor(userAgent: string = 'WeatherApp/1.0 (contact@example.com)') {
    this.userAgent = userAgent;
    this.cache = new NodeCache({ stdTTL: CACHE_TTL.FORECAST, checkperiod: 120 });

    this.client = axios.create({
      baseURL: 'https://api.weather.gov',
      timeout: 10000,
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/geo+json',
      },
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<NWSApiError>) => {
        if (error.response?.data) {
          const nwsError = error.response.data;
          throw new Error(
            `NWS API Error: ${nwsError.title} - ${nwsError.detail || 'No additional details'}`
          );
        }
        throw error;
      }
    );
  }

  /**
   * Generic API call method with retry logic and exponential backoff
   */
  private async makeRequest<T>(
    url: string,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.client.get<T>(url);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        // Handle rate limiting (429)
        if (axiosError.response?.status === 429) {
          if (attempt < retries - 1) {
            await this.delay(RATE_LIMIT_DELAY);
            continue;
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Handle 404 - resource not found
        if (axiosError.response?.status === 404) {
          throw new Error('Resource not found. The requested data is not available.');
        }

        // Handle 500+ server errors
        if (axiosError.response?.status && axiosError.response.status >= 500) {
          if (attempt < retries - 1) {
            await this.delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt));
            continue;
          }
          throw new Error('NWS API server error. Please try again later.');
        }

        // Last attempt or non-retryable error
        if (attempt === retries - 1) {
          throw new Error(
            `Failed to fetch data from NWS API: ${axiosError.message}`
          );
        }

        // Retry with exponential backoff
        await this.delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt));
      }
    }

    throw new Error('Request failed after all retries');
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Get data from cache or fetch from API
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch from API
    const data = await fetchFn();

    // Store in cache if TTL > 0
    if (ttl > 0) {
      this.cache.set(cacheKey, data, ttl);
    }

    return data;
  }

  /**
   * Get point data for coordinates
   */
  async getPointData(lat: number, lon: number): Promise<PointsResponse> {
    const cacheKey = this.getCacheKey('points', lat.toFixed(4), lon.toFixed(4));

    return this.getCachedOrFetch(cacheKey, CACHE_TTL.POINTS, async () => {
      const url = `/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
      return this.makeRequest<PointsResponse>(url);
    });
  }

  /**
   * Get 7-day forecast (12-hour periods)
   */
  async getForecast(
    gridId: string,
    gridX: number,
    gridY: number
  ): Promise<ForecastResponse> {
    const cacheKey = this.getCacheKey('forecast', gridId, String(gridX), String(gridY));

    return this.getCachedOrFetch(cacheKey, CACHE_TTL.FORECAST, async () => {
      const url = `/gridpoints/${gridId}/${gridX},${gridY}/forecast`;
      return this.makeRequest<ForecastResponse>(url);
    });
  }

  /**
   * Get hourly forecast
   */
  async getHourlyForecast(
    gridId: string,
    gridX: number,
    gridY: number
  ): Promise<HourlyForecastResponse> {
    const cacheKey = this.getCacheKey('hourly', gridId, String(gridX), String(gridY));

    return this.getCachedOrFetch(cacheKey, CACHE_TTL.HOURLY_FORECAST, async () => {
      const url = `/gridpoints/${gridId}/${gridX},${gridY}/forecast/hourly`;
      return this.makeRequest<HourlyForecastResponse>(url);
    });
  }

  /**
   * Get observation stations for a grid point
   */
  async getStations(
    gridId: string,
    gridX: number,
    gridY: number
  ): Promise<StationsResponse> {
    const cacheKey = this.getCacheKey('stations', gridId, String(gridX), String(gridY));

    return this.getCachedOrFetch(cacheKey, CACHE_TTL.STATIONS, async () => {
      const url = `/gridpoints/${gridId}/${gridX},${gridY}/stations`;
      return this.makeRequest<StationsResponse>(url);
    });
  }

  /**
   * Get latest observation from a station
   */
  async getLatestObservation(stationId: string): Promise<ObservationResponse> {
    const cacheKey = this.getCacheKey('observation', stationId);

    return this.getCachedOrFetch(cacheKey, CACHE_TTL.OBSERVATIONS, async () => {
      const url = `/stations/${stationId}/observations/latest`;
      return this.makeRequest<ObservationResponse>(url);
    });
  }

  /**
   * Get active alerts for a point
   */
  async getActiveAlerts(lat: number, lon: number): Promise<AlertResponse> {
    // No caching for alerts - always fetch fresh data
    const url = `/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
    return this.makeRequest<AlertResponse>(url);
  }

  /**
   * Get current conditions for a location
   * Fetches stations and then gets the latest observation from the nearest station
   */
  async getCurrentConditions(
    gridId: string,
    gridX: number,
    gridY: number
  ): Promise<ObservationResponse | null> {
    try {
      // Get list of stations
      const stationsData = await this.getStations(gridId, gridX, gridY);

      if (!stationsData.features || stationsData.features.length === 0) {
        console.warn('No observation stations found for this location');
        return null;
      }

      // Try to get observation from the first station
      const firstStation = stationsData.features[0];
      if (!firstStation?.properties?.stationIdentifier) {
        console.warn('Invalid station data received');
        return null;
      }

      const stationId = firstStation.properties.stationIdentifier;
      const observation = await this.getLatestObservation(stationId);

      return observation;
    } catch (error) {
      console.error('Error fetching current conditions:', error);
      // Return null instead of throwing - current conditions are not critical
      return null;
    }
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.flushAll();
  }

  /**
   * Clear cache for a specific location
   */
  clearLocationCache(lat: number, lon: number): void {
    const keys = this.cache.keys();
    const latStr = lat.toFixed(4);
    const lonStr = lon.toFixed(4);

    keys.forEach((key) => {
      if (key.includes(latStr) && key.includes(lonStr)) {
        this.cache.del(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { keys: number; hits: number; misses: number } {
    const stats = this.cache.getStats();
    return {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
    };
  }

  /**
   * Fetch and cache weather data for coordinates (background refresh)
   * Used by background jobs to pre-warm cache for configured locations
   */
  async prefetchWeatherData(lat: number, lon: number): Promise<void> {
    try {
      // Get point data
      const pointData = await this.getPointData(lat, lon);
      const { gridId, gridX, gridY } = pointData.properties;

      // Fetch all weather data in parallel to warm cache
      await Promise.allSettled([
        this.getForecast(gridId, gridX, gridY),
        this.getHourlyForecast(gridId, gridX, gridY),
        this.getCurrentConditions(gridId, gridX, gridY),
        this.getActiveAlerts(lat, lon),
      ]);
    } catch (error) {
      // Log error but don't throw - background refresh should be silent
      console.error(`Failed to prefetch weather data for ${lat},${lon}:`, error);
    }
  }
}

// Export singleton instance
export const nwsService = new NWSService();