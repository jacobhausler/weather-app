/**
 * Test setup file for backend tests
 * Configures the testing environment for Node.js with Vitest
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.NWS_API_BASE_URL = 'https://api.weather.gov';
process.env.NWS_USER_AGENT = 'WeatherApp/1.0 (test@example.com)';
process.env.OPENWEATHER_API_KEY = 'test_api_key_12345';
process.env.CACHED_ZIP_CODES = '75454,75070,75035';
process.env.CACHE_POINTS_DURATION = '1440';
process.env.CACHE_FORECAST_DURATION = '60';
process.env.CACHE_OBSERVATIONS_DURATION = '10';
process.env.CACHE_METADATA_DURATION = '10080';
process.env.SERVER_REFRESH_INTERVAL = '5';

// Configure test timeouts
export const TEST_TIMEOUT = 30000; // 30 seconds for integration tests with real API calls

// Global test utilities
export const testHelpers = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Timeout waiting for condition');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },

  /**
   * Create a mock ZIP code for testing
   */
  getMockZipCode(): string {
    return '75454';
  },

  /**
   * Create mock coordinates for testing
   */
  getMockCoordinates(): { lat: number; lon: number } {
    return { lat: 33.1581, lon: -96.5989 };
  }
};
