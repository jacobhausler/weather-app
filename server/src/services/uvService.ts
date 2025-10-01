/**
 * UV Index Service - Fetches UV Index data from OpenWeatherMap One Call API
 * Free tier: 1,000 calls/day
 * Docs: https://openweathermap.org/api/one-call-3
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';

// Cache TTL: 1 hour (UV changes slowly during the day)
const CACHE_TTL = 60 * 60; // 1 hour in seconds

// Retry configuration
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000;

interface OneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number; // UV Index
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
  };
}

export interface UVIndexData {
  value: number;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export class UVService {
  private client: AxiosInstance;
  private cache: NodeCache;
  private apiKey: string | undefined;
  private isEnabled: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.isEnabled = !!apiKey;
    this.cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 });

    if (!this.isEnabled) {
      logger.warn(
        'UV Index service disabled: OPENWEATHER_API_KEY not configured. UV Index will not be available.'
      );
    }

    this.client = axios.create({
      baseURL: 'https://api.openweathermap.org/data/3.0',
      timeout: 5000,
      headers: {
        Accept: 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenWeatherMap API key');
        }
        if (error.response?.status === 429) {
          throw new Error('OpenWeatherMap rate limit exceeded');
        }
        throw error;
      }
    );
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get cache key for coordinates
   */
  private getCacheKey(lat: number, lon: number): string {
    return `uv:${lat.toFixed(4)}:${lon.toFixed(4)}`;
  }

  /**
   * Check if UV Index service is enabled
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Fetch UV Index from OpenWeatherMap One Call API
   * Uses the current UV index from the "current" object
   */
  async getUVIndex(lat: number, lon: number): Promise<UVIndexData | null> {
    // Return null if service is not enabled (no API key)
    if (!this.isEnabled || !this.apiKey) {
      return null;
    }

    const cacheKey = this.getCacheKey(lat, lon);

    // Check cache first
    const cached = this.cache.get<UVIndexData>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch from API with retry logic
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.get<OneCallResponse>('/onecall', {
          params: {
            lat: lat.toFixed(4),
            lon: lon.toFixed(4),
            appid: this.apiKey,
            exclude: 'minutely,hourly,daily,alerts', // Only get current data
          },
        });

        const uvData: UVIndexData = {
          value: response.data.current.uvi,
          timestamp: new Date(response.data.current.dt * 1000).toISOString(),
          latitude: lat,
          longitude: lon,
        };

        // Cache the result
        this.cache.set(cacheKey, uvData, CACHE_TTL);

        return uvData;
      } catch (error) {
        const axiosError = error as AxiosError;

        // Don't retry on auth errors or rate limits
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 429
        ) {
          logger.error('UV Index fetch failed:', axiosError.message);
          return null;
        }

        // Retry on other errors
        if (attempt < MAX_RETRIES - 1) {
          await this.delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt));
          continue;
        }

        // Final attempt failed
        logger.error(
          `Failed to fetch UV Index after ${MAX_RETRIES} attempts:`,
          axiosError.message
        );
        return null;
      }
    }

    return null;
  }

  /**
   * Clear cache for a specific location
   */
  clearLocationCache(lat: number, lon: number): void {
    const cacheKey = this.getCacheKey(lat, lon);
    this.cache.del(cacheKey);
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.flushAll();
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
}

// Export singleton instance
// API key will be loaded from environment variable
export const uvService = new UVService(process.env['OPENWEATHER_API_KEY']);
