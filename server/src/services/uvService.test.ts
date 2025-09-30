/**
 * Comprehensive tests for UV Index Service
 * Tests real functionality including API calls, caching, retry logic, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { UVService, UVIndexData } from './uvService';

// Mock axios module before importing anything that uses it
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn((successHandler: any) => successHandler),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn((error: any) => error.isAxiosError === true),
    },
  };
});

const mockedAxios = vi.mocked(axios, true);

describe('UVService', () => {
  let service: UVService;
  const mockApiKey = 'test_api_key_12345';
  const testLat = 33.1581;
  const testLon = -96.5989;

  // Mock successful OpenWeatherMap API response
  const mockSuccessResponse = {
    data: {
      lat: testLat,
      lon: testLon,
      timezone: 'America/Chicago',
      timezone_offset: -21600,
      current: {
        dt: 1672531200, // 2023-01-01 00:00:00 UTC
        sunrise: 1672488000,
        sunset: 1672524000,
        temp: 72.5,
        feels_like: 70.2,
        pressure: 1013,
        humidity: 65,
        dew_point: 60.8,
        uvi: 7.5,
        clouds: 20,
        visibility: 10000,
        wind_speed: 5.2,
        wind_deg: 180,
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear cache between tests
    if (service) {
      service.clearCache();
    }
  });

  describe('isServiceEnabled', () => {
    it('should return true when API key is provided', () => {
      service = new UVService(mockApiKey);
      expect(service.isServiceEnabled()).toBe(true);
    });

    it('should return false when API key is undefined', () => {
      service = new UVService(undefined);
      expect(service.isServiceEnabled()).toBe(false);
    });

    it('should return false when API key is empty string', () => {
      service = new UVService('');
      expect(service.isServiceEnabled()).toBe(false);
    });

    it('should return false when API key is null', () => {
      service = new UVService(null as any);
      expect(service.isServiceEnabled()).toBe(false);
    });

    it('should log warning when initialized without API key', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service = new UVService(undefined);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('UV Index service disabled')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getUVIndex - with valid API key', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should fetch UV index data successfully', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(7.5);
      expect(result?.latitude).toBe(testLat);
      expect(result?.longitude).toBe(testLon);
      expect(result?.timestamp).toBe('2023-01-01T00:00:00.000Z');

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/onecall', {
        params: {
          lat: testLat.toFixed(4),
          lon: testLon.toFixed(4),
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });
    });

    it('should return correct UV index for different values', async () => {
      const testCases = [
        { uvi: 0, description: 'zero UV index' },
        { uvi: 3, description: 'low UV index' },
        { uvi: 5.5, description: 'moderate UV index' },
        { uvi: 8, description: 'high UV index' },
        { uvi: 11, description: 'extreme UV index' },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          ...mockSuccessResponse,
          data: {
            ...mockSuccessResponse.data,
            current: {
              ...mockSuccessResponse.data.current,
              uvi: testCase.uvi,
            },
          },
        };

        const mockGet = vi.fn().mockResolvedValue(mockResponse);
        (service as any).client.get = mockGet;

        // Clear cache for each test case
        service.clearCache();

        const result = await service.getUVIndex(testLat, testLon);
        expect(result?.value).toBe(testCase.uvi);
      }
    });

    it('should format coordinates to 4 decimal places in API call', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      const preciseLat = 33.158123456;
      const preciseLon = -96.598987654;

      await service.getUVIndex(preciseLat, preciseLon);

      expect(mockGet).toHaveBeenCalledWith('/onecall', {
        params: {
          lat: '33.1581',
          lon: '-96.5990',
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });
    });
  });

  describe('getUVIndex - without API key', () => {
    beforeEach(() => {
      service = new UVService(undefined);
    });

    it('should return null when service is disabled', async () => {
      const result = await service.getUVIndex(testLat, testLon);
      expect(result).toBeNull();
    });

    it('should not make API calls when service is disabled', async () => {
      const mockGet = vi.fn();
      (service as any).client.get = mockGet;

      await service.getUVIndex(testLat, testLon);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('Caching behavior', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should cache successful UV index data', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // First call - should hit API
      const result1 = await service.getUVIndex(testLat, testLon);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result1?.value).toBe(7.5);

      // Second call - should use cache
      const result2 = await service.getUVIndex(testLat, testLon);
      expect(mockGet).toHaveBeenCalledTimes(1); // Still 1, no new API call
      expect(result2?.value).toBe(7.5);

      // Results should be identical
      expect(result1).toEqual(result2);
    });

    it('should use separate cache entries for different coordinates', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      const lat1 = 33.1581;
      const lon1 = -96.5989;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      // First location
      await service.getUVIndex(lat1, lon1);
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second location - should make new API call
      await service.getUVIndex(lat2, lon2);
      expect(mockGet).toHaveBeenCalledTimes(2);

      // First location again - should use cache
      await service.getUVIndex(lat1, lon1);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should round coordinates to 4 decimals for cache key', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // These coordinates round to the same 4 decimal places
      await service.getUVIndex(33.15811, -96.59891);
      expect(mockGet).toHaveBeenCalledTimes(1);

      await service.getUVIndex(33.15814, -96.59894);
      expect(mockGet).toHaveBeenCalledTimes(1); // Still 1 - cache hit
    });

    it('should clear specific location cache', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // First call
      await service.getUVIndex(testLat, testLon);
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Clear cache for this location
      service.clearLocationCache(testLat, testLon);

      // Should make new API call
      await service.getUVIndex(testLat, testLon);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache entries', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      const lat1 = 33.1581;
      const lon1 = -96.5989;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      // Cache two locations
      await service.getUVIndex(lat1, lon1);
      await service.getUVIndex(lat2, lon2);
      expect(mockGet).toHaveBeenCalledTimes(2);

      // Clear all cache
      service.clearCache();

      // Both should make new API calls
      await service.getUVIndex(lat1, lon1);
      await service.getUVIndex(lat2, lon2);
      expect(mockGet).toHaveBeenCalledTimes(4);
    });

    it('should track cache statistics', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // Initial stats
      let stats = service.getCacheStats();
      expect(stats.keys).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // First call - cache miss
      await service.getUVIndex(testLat, testLon);
      stats = service.getCacheStats();
      expect(stats.keys).toBe(1);
      expect(stats.misses).toBe(1);

      // Second call - cache hit
      await service.getUVIndex(testLat, testLon);
      stats = service.getCacheStats();
      expect(stats.keys).toBe(1);
      expect(stats.hits).toBe(1);
    });
  });

  describe('Retry logic', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should retry on network errors with exponential backoff', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;

      const mockGet = vi
        .fn()
        .mockRejectedValueOnce(networkError) // First attempt fails
        .mockResolvedValueOnce(mockSuccessResponse); // Second attempt succeeds

      (service as any).client.get = mockGet;

      const startTime = Date.now();
      const result = await service.getUVIndex(testLat, testLon);
      const duration = Date.now() - startTime;

      expect(result).not.toBeNull();
      expect(result?.value).toBe(7.5);
      expect(mockGet).toHaveBeenCalledTimes(2);

      // Should have delayed for at least 1000ms (initial retry delay)
      expect(duration).toBeGreaterThanOrEqual(900); // Allow some margin
    });

    it('should implement exponential backoff for retries', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;

      const mockGet = vi
        .fn()
        .mockRejectedValueOnce(networkError) // First attempt fails
        .mockRejectedValueOnce(networkError) // Second attempt fails
        .mockResolvedValueOnce(mockSuccessResponse); // Third attempt succeeds (won't reach)

      (service as any).client.get = mockGet;

      // Spy on delay method to check backoff
      const delaySpy = vi.spyOn(service as any, 'delay');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(mockGet).toHaveBeenCalledTimes(2); // MAX_RETRIES = 2
      expect(result).toBeNull(); // Failed after all retries

      // Should have called delay once (before second attempt)
      expect(delaySpy).toHaveBeenCalledTimes(1);
      expect(delaySpy).toHaveBeenCalledWith(1000); // Initial delay

      consoleSpy.mockRestore();
    });

    it('should retry up to MAX_RETRIES times', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;

      const mockGet = vi.fn().mockRejectedValue(networkError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(2); // MAX_RETRIES = 2
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch UV Index after 2 attempts'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should NOT retry on 401 authentication errors', async () => {
      const authError = new Error('Unauthorized') as AxiosError;
      authError.isAxiosError = true;
      authError.response = {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi.fn().mockRejectedValue(authError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1); // No retry
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('UV Index fetch failed'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should NOT retry on 429 rate limit errors', async () => {
      const rateLimitError = new Error('Too Many Requests') as AxiosError;
      rateLimitError.isAxiosError = true;
      rateLimitError.response = {
        status: 429,
        data: {},
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi.fn().mockRejectedValue(rateLimitError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1); // No retry
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('UV Index fetch failed'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should retry on 500 server errors', async () => {
      const serverError = new Error('Internal Server Error') as AxiosError;
      serverError.isAxiosError = true;
      serverError.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(mockSuccessResponse);

      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(7.5);
      expect(mockGet).toHaveBeenCalledTimes(2); // Retried once
    });

    it('should retry on timeout errors', async () => {
      const timeoutError = new Error('Timeout') as AxiosError;
      timeoutError.isAxiosError = true;
      timeoutError.code = 'ECONNABORTED';

      const mockGet = vi
        .fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce(mockSuccessResponse);

      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(7.5);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling - graceful failure', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should return null on network failure', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;

      const mockGet = vi.fn().mockRejectedValue(networkError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null on invalid API key', async () => {
      const authError = new Error('Invalid API key') as AxiosError;
      authError.isAxiosError = true;
      authError.response = {
        status: 401,
        data: { message: 'Invalid API key' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi.fn().mockRejectedValue(authError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null when rate limit is exceeded', async () => {
      const rateLimitError = new Error('Rate limit exceeded') as AxiosError;
      rateLimitError.isAxiosError = true;
      rateLimitError.response = {
        status: 429,
        data: {},
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi.fn().mockRejectedValue(rateLimitError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null on malformed API response', async () => {
      const malformedResponse = {
        data: {
          // Missing required fields
          lat: testLat,
          lon: testLon,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockGet = vi.fn().mockResolvedValue(malformedResponse);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should throw error due to missing current.uvi field
      const result = await service.getUVIndex(testLat, testLon);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should log error messages for debugging', async () => {
      const networkError = new Error('Connection refused') as AxiosError;
      networkError.isAxiosError = true;
      networkError.message = 'Connection refused';

      const mockGet = vi.fn().mockRejectedValue(networkError);
      (service as any).client.get = mockGet;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.getUVIndex(testLat, testLon);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch UV Index after 2 attempts'),
        'Connection refused'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Axios interceptor configuration', () => {
    it('should configure axios client with correct base URL', () => {
      service = new UVService(mockApiKey);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.openweathermap.org/data/3.0',
          timeout: 5000,
          headers: {
            Accept: 'application/json',
          },
        })
      );
    });

    it('should setup response interceptor for error handling', () => {
      service = new UVService(mockApiKey);

      const mockInstance = mockedAxios.create.mock.results[0].value;
      expect(mockInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should handle UV index of 0', async () => {
      const zeroUVResponse = {
        ...mockSuccessResponse,
        data: {
          ...mockSuccessResponse.data,
          current: {
            ...mockSuccessResponse.data.current,
            uvi: 0,
          },
        },
      };

      const mockGet = vi.fn().mockResolvedValue(zeroUVResponse);
      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(0);
    });

    it('should handle very high UV index values', async () => {
      const highUVResponse = {
        ...mockSuccessResponse,
        data: {
          ...mockSuccessResponse.data,
          current: {
            ...mockSuccessResponse.data.current,
            uvi: 15.5,
          },
        },
      };

      const mockGet = vi.fn().mockResolvedValue(highUVResponse);
      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(15.5);
    });

    it('should handle extreme coordinate values', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // North Pole
      await service.getUVIndex(90, 0);
      expect(mockGet).toHaveBeenLastCalledWith('/onecall', {
        params: {
          lat: '90.0000',
          lon: '0.0000',
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });

      service.clearCache();

      // South Pole
      await service.getUVIndex(-90, 0);
      expect(mockGet).toHaveBeenLastCalledWith('/onecall', {
        params: {
          lat: '-90.0000',
          lon: '0.0000',
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });

      service.clearCache();

      // International Date Line
      await service.getUVIndex(0, 180);
      expect(mockGet).toHaveBeenLastCalledWith('/onecall', {
        params: {
          lat: '0.0000',
          lon: '180.0000',
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });
    });

    it('should handle negative coordinates correctly', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      await service.getUVIndex(-33.8688, 151.2093); // Sydney, Australia

      expect(mockGet).toHaveBeenCalledWith('/onecall', {
        params: {
          lat: '-33.8688',
          lon: '151.2093',
          appid: mockApiKey,
          exclude: 'minutely,hourly,daily,alerts',
        },
      });
    });

    it('should convert Unix timestamp to ISO string correctly', async () => {
      const testTimestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const timestampResponse = {
        ...mockSuccessResponse,
        data: {
          ...mockSuccessResponse.data,
          current: {
            ...mockSuccessResponse.data.current,
            dt: testTimestamp,
          },
        },
      };

      const mockGet = vi.fn().mockResolvedValue(timestampResponse);
      (service as any).client.get = mockGet;

      const result = await service.getUVIndex(testLat, testLon);

      expect(result).not.toBeNull();
      expect(result?.timestamp).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      service = new UVService(mockApiKey);
    });

    it('should handle multiple concurrent requests for same location', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      // Make 3 concurrent requests
      const promises = [
        service.getUVIndex(testLat, testLon),
        service.getUVIndex(testLat, testLon),
        service.getUVIndex(testLat, testLon),
      ];

      const results = await Promise.all(promises);

      // All should return valid results
      expect(results[0]).not.toBeNull();
      expect(results[1]).not.toBeNull();
      expect(results[2]).not.toBeNull();

      // API should be called at least once
      // (Depending on timing, might be 1-3 times before caching takes effect)
      expect(mockGet).toHaveBeenCalled();
    });

    it('should handle mixed success and failure scenarios', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      const lat1 = 33.1581;
      const lon1 = -96.5989;

      // First request succeeds
      const result1 = await service.getUVIndex(lat1, lon1);
      expect(result1).not.toBeNull();
      expect(result1?.value).toBe(7.5);

      // Simulate API failure for second location
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;
      mockGet.mockRejectedValueOnce(networkError);
      mockGet.mockRejectedValueOnce(networkError);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result2 = await service.getUVIndex(lat2, lon2);
      expect(result2).toBeNull();

      // First location should still be cached and work
      const result3 = await service.getUVIndex(lat1, lon1);
      expect(result3).not.toBeNull();
      expect(result3?.value).toBe(7.5);

      consoleSpy.mockRestore();
    });

    it('should properly cleanup resources', () => {
      service = new UVService(mockApiKey);

      // Add some data to cache
      const mockGet = vi.fn().mockResolvedValue(mockSuccessResponse);
      (service as any).client.get = mockGet;

      service.getUVIndex(testLat, testLon);

      // Clear cache
      service.clearCache();

      const stats = service.getCacheStats();
      expect(stats.keys).toBe(0);
    });
  });
});
