import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import {
  NWSClient,
  NWSApiError,
  NWSRateLimitError,
  type NWSPointData,
  type NWSForecast,
  type NWSHourlyForecast,
  type NWSObservation,
  type NWSAlerts,
  type NWSStations,
} from './nwsClient';

// ============================================================================
// Test Data - Real coordinates for McKinney, TX (ZIP 75070)
// ============================================================================

const TEST_COORDS = {
  lat: 33.1981,
  lon: -96.6153,
  roundedLat: 33.1981, // Already at 4 decimal places
  roundedLon: -96.6153,
};

const REAL_COORDS = {
  lat: 33.1581,
  lon: -96.5989,
};

// Expected grid data for McKinney area (from NWS API)
const EXPECTED_GRID = {
  office: 'FWD', // Fort Worth office
  gridX: 78,
  gridY: 107,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sleep utility for testing delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock axios error
 */
const createAxiosError = (status: number, message: string, data?: unknown) => {
  const error: any = new Error(message);
  error.isAxiosError = true;
  error.response = {
    status,
    data,
    statusText: message,
    headers: {},
    config: {},
  };
  return error;
};

// ============================================================================
// Unit Tests
// ============================================================================

describe('NWSClient - Unit Tests', () => {
  let client: NWSClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create a mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
    };

    // Spy on axios.create to return our mock instance
    vi.spyOn(axios, 'create').mockReturnValue(mockAxiosInstance);

    // Create a new client (which will use our mocked axios.create)
    client = new NWSClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Classes', () => {
    it('should create NWSApiError with correct properties', () => {
      const error = new NWSApiError('Test error', 500, { detail: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NWSApiError);
      expect(error.name).toBe('NWSApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.response).toEqual({ detail: 'test' });
    });

    it('should create NWSRateLimitError with default message', () => {
      const error = new NWSRateLimitError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NWSApiError);
      expect(error).toBeInstanceOf(NWSRateLimitError);
      expect(error.name).toBe('NWSRateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
    });

    it('should create NWSRateLimitError with custom message', () => {
      const error = new NWSRateLimitError('Custom rate limit message');

      expect(error.message).toBe('Custom rate limit message');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('getPointData', () => {
    it('should round coordinates to 4 decimal places', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          properties: {
            gridId: 'FWD',
            gridX: 78,
            gridY: 107,
            forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
            forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
            forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
            observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
            forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
            county: 'https://api.weather.gov/zones/county/TXC085',
            fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
            timeZone: 'America/Chicago',
            radarStation: 'KFWS',
          },
        },
      });

      await client.getPointData(33.12345678, -96.98765432);

      // Should round to 33.1235, -96.9877
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/points/33.1235,-96.9877');
    });

    it('should handle coordinates that are already rounded', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          properties: {
            gridId: 'FWD',
            gridX: 78,
            gridY: 107,
            forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
            forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
            forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
            observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
            forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
            county: 'https://api.weather.gov/zones/county/TXC085',
            fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
            timeZone: 'America/Chicago',
            radarStation: 'KFWS',
          },
        },
      });

      await client.getPointData(33.1981, -96.6153);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/points/33.1981,-96.6153');
    });
  });

  describe('Error Handling', () => {
    it('should throw NWSApiError on 404', async () => {
      mockAxiosInstance.get.mockRejectedValue(
        createAxiosError(404, 'Not Found', { detail: 'Point not found' })
      );

      await expect(client.getPointData(0, 0)).rejects.toThrow(NWSApiError);
      await expect(client.getPointData(0, 0)).rejects.toThrow(
        'Resource not found: /points/0,0'
      );
    });

    it('should throw NWSApiError on 400 client error', async () => {
      mockAxiosInstance.get.mockRejectedValue(
        createAxiosError(400, 'Bad Request', { detail: 'Invalid coordinates' })
      );

      await expect(client.getPointData(999, 999)).rejects.toThrow(NWSApiError);
    });

    it('should throw NWSApiError on non-Axios errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network failure'));

      await expect(client.getPointData(33.1981, -96.6153)).rejects.toThrow(
        NWSApiError
      );
      await expect(client.getPointData(33.1981, -96.6153)).rejects.toThrow(
        'Unknown error: Network failure'
      );
    });

    it('should throw NWSApiError on unknown error type', async () => {
      mockAxiosInstance.get.mockRejectedValue('String error');

      await expect(client.getPointData(33.1981, -96.6153)).rejects.toThrow(
        NWSApiError
      );
      await expect(client.getPointData(33.1981, -96.6153)).rejects.toThrow(
        'Unknown error: String error'
      );
    });
  });

  describe('Retry Logic - 5xx Errors', () => {
    it('should retry on 500 error and succeed', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce(createAxiosError(500, 'Internal Server Error'))
        .mockRejectedValueOnce(createAxiosError(503, 'Service Unavailable'))
        .mockResolvedValueOnce({
          data: {
            properties: {
              gridId: 'FWD',
              gridX: 78,
              gridY: 107,
              forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
              forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
              forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
              observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
              forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
              county: 'https://api.weather.gov/zones/county/TXC085',
              fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
              timeZone: 'America/Chicago',
              radarStation: 'KFWS',
            },
          },
        });

      const startTime = Date.now();
      const result = await client.getPointData(33.1981, -96.6153);
      const duration = Date.now() - startTime;

      expect(result.properties.gridId).toBe('FWD');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      // Should have exponential backoff: 1s + 2s = 3s minimum
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    it('should fail after max retries on 500 errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(
        createAxiosError(500, 'Internal Server Error')
      );

      try {
        await client.getPointData(33.1981, -96.6153);
        // Should not reach here
        expect.fail('Expected to throw NWSApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(NWSApiError);
        expect((error as NWSApiError).message).toContain('Server error after 3 retries');
      }
    }, 10000);

    it('should retry on 502 Bad Gateway', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce(createAxiosError(502, 'Bad Gateway'))
        .mockResolvedValueOnce({
          data: {
            properties: {
              gridId: 'FWD',
              gridX: 78,
              gridY: 107,
              forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
              forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
              forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
              observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
              forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
              county: 'https://api.weather.gov/zones/county/TXC085',
              fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
              timeZone: 'America/Chicago',
              radarStation: 'KFWS',
            },
          },
        });

      const result = await client.getPointData(33.1981, -96.6153);
      expect(result.properties.gridId).toBe('FWD');
    });
  });

  describe('Retry Logic - 429 Rate Limit', () => {
    it('should retry on 429 with backoff delays', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce(createAxiosError(429, 'Too Many Requests'))
        .mockRejectedValueOnce(createAxiosError(429, 'Too Many Requests'))
        .mockResolvedValueOnce({
          data: {
            properties: {
              gridId: 'FWD',
              gridX: 78,
              gridY: 107,
              forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
              forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
              forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
              observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
              forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
              county: 'https://api.weather.gov/zones/county/TXC085',
              fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
              timeZone: 'America/Chicago',
              radarStation: 'KFWS',
            },
          },
        });

      const startTime = Date.now();
      const result = await client.getPointData(33.1981, -96.6153);
      const duration = Date.now() - startTime;

      expect(result.properties.gridId).toBe('FWD');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      // Should have backoff delays: 5s + 10s = 15s minimum
      expect(duration).toBeGreaterThanOrEqual(15000);
    }, 20000);

    it('should fail after max rate limit retries', async () => {
      mockAxiosInstance.get.mockRejectedValue(
        createAxiosError(429, 'Too Many Requests')
      );

      try {
        await client.getPointData(33.1981, -96.6153);
        // Should not reach here
        expect.fail('Expected to throw NWSRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(NWSRateLimitError);
        expect((error as NWSApiError).message).toContain('Rate limit exceeded after 3 retries');
      }
    }, 40000);
  });

  describe('HTTP Headers', () => {
    it('should include correct User-Agent header', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.weather.gov',
          headers: expect.objectContaining({
            'User-Agent': 'WeatherApp/1.0 (contact@example.com)',
            Accept: 'application/geo+json',
          }),
          timeout: 30000,
        })
      );
    });
  });

  describe('API Methods', () => {
    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });
    });

    it('should call getForecast with correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          properties: {
            updated: '2025-09-30T12:00:00+00:00',
            units: 'us',
            forecastGenerator: 'BaselineForecastGenerator',
            generatedAt: '2025-09-30T12:00:00+00:00',
            updateTime: '2025-09-30T12:00:00+00:00',
            validTimes: '2025-09-30T06:00:00+00:00/P7DT18H',
            elevation: {
              unitCode: 'wmoUnit:m',
              value: 200,
            },
            periods: [],
          },
        },
      });

      await client.getForecast('FWD', 78, 107);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/gridpoints/FWD/78,107/forecast');
    });

    it('should call getHourlyForecast with correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          properties: {
            updated: '2025-09-30T12:00:00+00:00',
            units: 'us',
            forecastGenerator: 'HourlyForecastGenerator',
            generatedAt: '2025-09-30T12:00:00+00:00',
            updateTime: '2025-09-30T12:00:00+00:00',
            validTimes: '2025-09-30T06:00:00+00:00/P7DT18H',
            elevation: {
              unitCode: 'wmoUnit:m',
              value: 200,
            },
            periods: [],
          },
        },
      });

      await client.getHourlyForecast('FWD', 78, 107);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/gridpoints/FWD/78,107/forecast/hourly');
    });

    it('should call getStations with correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          features: [],
        },
      });

      await client.getStations('FWD', 78, 107);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/gridpoints/FWD/78,107/stations');
    });

    it('should call getLatestObservation with correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          properties: {
            timestamp: '2025-09-30T12:00:00+00:00',
            textDescription: 'Partly Cloudy',
            icon: 'https://api.weather.gov/icons/land/day/sct',
            presentWeather: [],
            temperature: {
              unitCode: 'wmoUnit:degC',
              value: 25,
              qualityControl: 'V',
            },
            dewpoint: {
              unitCode: 'wmoUnit:degC',
              value: 15,
              qualityControl: 'V',
            },
            windDirection: {
              unitCode: 'wmoUnit:degree_(angle)',
              value: 180,
              qualityControl: 'V',
            },
            windSpeed: {
              unitCode: 'wmoUnit:km_h-1',
              value: 10,
              qualityControl: 'V',
            },
            windGust: {
              unitCode: 'wmoUnit:km_h-1',
              value: null,
              qualityControl: 'Z',
            },
            barometricPressure: {
              unitCode: 'wmoUnit:Pa',
              value: 101325,
              qualityControl: 'V',
            },
            seaLevelPressure: {
              unitCode: 'wmoUnit:Pa',
              value: 101325,
              qualityControl: 'V',
            },
            visibility: {
              unitCode: 'wmoUnit:m',
              value: 16093,
              qualityControl: 'V',
            },
            maxTemperatureLast24Hours: {
              unitCode: 'wmoUnit:degC',
              value: null,
              qualityControl: 'Z',
            },
            minTemperatureLast24Hours: {
              unitCode: 'wmoUnit:degC',
              value: null,
              qualityControl: 'Z',
            },
            precipitationLastHour: {
              unitCode: 'wmoUnit:mm',
              value: null,
              qualityControl: 'Z',
            },
            precipitationLast3Hours: {
              unitCode: 'wmoUnit:mm',
              value: null,
              qualityControl: 'Z',
            },
            precipitationLast6Hours: {
              unitCode: 'wmoUnit:mm',
              value: null,
              qualityControl: 'Z',
            },
            relativeHumidity: {
              unitCode: 'wmoUnit:percent',
              value: 60,
              qualityControl: 'V',
            },
            windChill: {
              unitCode: 'wmoUnit:degC',
              value: null,
              qualityControl: 'Z',
            },
            heatIndex: {
              unitCode: 'wmoUnit:degC',
              value: null,
              qualityControl: 'Z',
            },
            cloudLayers: [],
          },
        },
      });

      await client.getLatestObservation('KTKI');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/stations/KTKI/observations/latest');
    });

    it('should call getActiveAlerts with correct endpoint and rounded coords', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          features: [],
        },
      });

      await client.getActiveAlerts(33.12345678, -96.98765432);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/alerts/active?point=33.1235,-96.9877');
    });
  });

  describe('getWeatherData - Convenience Method', () => {
    it('should fetch all weather data in correct order', async () => {
      const mockPointData: NWSPointData = {
        properties: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 107,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
          forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
          forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
          county: 'https://api.weather.gov/zones/county/TXC085',
          fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
          timeZone: 'America/Chicago',
          radarStation: 'KFWS',
        },
      };

      const mockStations: NWSStations = {
        features: [
          {
            id: 'https://api.weather.gov/stations/KTKI',
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-96.5905, 33.1778] },
            properties: {
              stationIdentifier: 'KTKI',
              name: 'McKinney National Airport',
              timeZone: 'America/Chicago',
              forecast: 'https://api.weather.gov/zones/forecast/TXZ104',
              county: 'https://api.weather.gov/zones/county/TXC085',
              fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
            },
          },
        ],
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockPointData }) // getPointData
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } }) // getForecast
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } }) // getHourlyForecast
        .mockResolvedValueOnce({ data: mockStations }) // getStations
        .mockResolvedValueOnce({ data: { features: [] } }) // getActiveAlerts
        .mockResolvedValueOnce({ data: { properties: {} } }); // getLatestObservation

      const result = await client.getWeatherData(33.1981, -96.6153);

      expect(result).toHaveProperty('pointData');
      expect(result).toHaveProperty('forecast');
      expect(result).toHaveProperty('hourlyForecast');
      expect(result).toHaveProperty('stations');
      expect(result).toHaveProperty('observation');
      expect(result).toHaveProperty('alerts');

      expect(result.pointData.properties.gridId).toBe('FWD');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(6);
    });

    it('should handle missing observation gracefully', async () => {
      const mockPointData: NWSPointData = {
        properties: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 107,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
          forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
          forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
          county: 'https://api.weather.gov/zones/county/TXC085',
          fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
          timeZone: 'America/Chicago',
          radarStation: 'KFWS',
        },
      };

      const mockStations: NWSStations = {
        features: [
          {
            id: 'https://api.weather.gov/stations/KTKI',
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-96.5905, 33.1778] },
            properties: {
              stationIdentifier: 'KTKI',
              name: 'McKinney National Airport',
              timeZone: 'America/Chicago',
              forecast: 'https://api.weather.gov/zones/forecast/TXZ104',
              county: 'https://api.weather.gov/zones/county/TXC085',
              fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
            },
          },
        ],
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockPointData })
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } })
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } })
        .mockResolvedValueOnce({ data: mockStations })
        .mockResolvedValueOnce({ data: { features: [] } })
        .mockRejectedValueOnce(createAxiosError(500, 'Station unavailable'));

      const result = await client.getWeatherData(33.1981, -96.6153);

      expect(result.observation).toBeNull();
      expect(result.pointData).toBeDefined();
      expect(result.forecast).toBeDefined();
    });

    it('should handle empty stations list', async () => {
      const mockPointData: NWSPointData = {
        properties: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 107,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,107/forecast/hourly',
          forecastGridData: 'https://api.weather.gov/gridpoints/FWD/78,107',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,107/stations',
          forecastZone: 'https://api.weather.gov/zones/forecast/TXZ104',
          county: 'https://api.weather.gov/zones/county/TXC085',
          fireWeatherZone: 'https://api.weather.gov/zones/fire/TXZ104',
          timeZone: 'America/Chicago',
          radarStation: 'KFWS',
        },
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockPointData })
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } })
        .mockResolvedValueOnce({ data: { properties: { periods: [] } } })
        .mockResolvedValueOnce({ data: { features: [] } }) // Empty stations
        .mockResolvedValueOnce({ data: { features: [] } });

      const result = await client.getWeatherData(33.1981, -96.6153);

      expect(result.observation).toBeNull();
      expect(result.stations.features).toHaveLength(0);
    });
  });
});

// ============================================================================
// Integration Tests - Real NWS API Calls
// ============================================================================

describe('NWSClient - Integration Tests', () => {
  let client: NWSClient;

  beforeEach(() => {
    client = new NWSClient();
  });

  describe('Real API Calls', () => {
    it('should fetch real point data for McKinney, TX', async () => {
      const result = await client.getPointData(REAL_COORDS.lat, REAL_COORDS.lon);

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties.gridId).toBe('FWD');
      expect(result.properties.gridX).toBeTypeOf('number');
      expect(result.properties.gridY).toBeTypeOf('number');
      expect(result.properties.forecast).toContain('api.weather.gov');
      expect(result.properties.forecastHourly).toContain('api.weather.gov');
      expect(result.properties.observationStations).toContain('api.weather.gov');
      expect(result.properties.timeZone).toBe('America/Chicago');
    }, 30000);

    it('should fetch real 7-day forecast', async () => {
      // First get point data to get grid coordinates
      const pointData = await client.getPointData(REAL_COORDS.lat, REAL_COORDS.lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const result = await client.getForecast(gridId, gridX, gridY);

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties.periods).toBeInstanceOf(Array);
      expect(result.properties.periods.length).toBeGreaterThan(0);
      expect(result.properties.periods.length).toBeLessThanOrEqual(14); // 7 days × 2 periods

      const firstPeriod = result.properties.periods[0];
      expect(firstPeriod).toBeDefined();
      expect(firstPeriod?.number).toBeTypeOf('number');
      expect(firstPeriod?.name).toBeTypeOf('string');
      expect(firstPeriod?.temperature).toBeTypeOf('number');
      expect(firstPeriod?.temperatureUnit).toBe('F');
      expect(firstPeriod?.windSpeed).toBeTypeOf('string');
      expect(firstPeriod?.windDirection).toBeTypeOf('string');
      expect(firstPeriod?.shortForecast).toBeTypeOf('string');
      expect(firstPeriod?.detailedForecast).toBeTypeOf('string');
    }, 30000);

    it('should fetch real hourly forecast', async () => {
      const pointData = await client.getPointData(REAL_COORDS.lat, REAL_COORDS.lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const result = await client.getHourlyForecast(gridId, gridX, gridY);

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties.periods).toBeInstanceOf(Array);
      expect(result.properties.periods.length).toBeGreaterThan(0);

      const firstPeriod = result.properties.periods[0];
      expect(firstPeriod).toBeDefined();
      expect(firstPeriod?.startTime).toBeTypeOf('string');
      expect(firstPeriod?.temperature).toBeTypeOf('number');
      expect(firstPeriod?.temperatureUnit).toBe('F');
      expect(firstPeriod?.probabilityOfPrecipitation).toHaveProperty('value');
      expect(firstPeriod?.relativeHumidity).toHaveProperty('value');
      expect(firstPeriod?.windSpeed).toBeTypeOf('string');
    }, 30000);

    it('should fetch real observation stations', async () => {
      const pointData = await client.getPointData(REAL_COORDS.lat, REAL_COORDS.lon);
      const { gridId, gridX, gridY } = pointData.properties;

      const result = await client.getStations(gridId, gridX, gridY);

      expect(result).toBeDefined();
      expect(result.features).toBeInstanceOf(Array);
      expect(result.features.length).toBeGreaterThan(0);

      const firstStation = result.features[0];
      expect(firstStation).toBeDefined();
      expect(firstStation?.properties).toBeDefined();
      expect(firstStation?.properties.stationIdentifier).toBeTypeOf('string');
      expect(firstStation?.properties.name).toBeTypeOf('string');
      expect(firstStation?.geometry.coordinates).toBeInstanceOf(Array);
      expect(firstStation?.geometry.coordinates).toHaveLength(2);
    }, 30000);

    it('should fetch real latest observation', async () => {
      // Use a known reliable station (Dallas/Fort Worth International Airport)
      const result = await client.getLatestObservation('KDFW');

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties.timestamp).toBeTypeOf('string');
      expect(result.properties.textDescription).toBeTypeOf('string');
      expect(result.properties.temperature).toHaveProperty('value');
      expect(result.properties.temperature).toHaveProperty('unitCode');
      expect(result.properties.windSpeed).toHaveProperty('value');
      expect(result.properties.relativeHumidity).toHaveProperty('value');
    }, 30000);

    it('should fetch real active alerts', async () => {
      const result = await client.getActiveAlerts(REAL_COORDS.lat, REAL_COORDS.lon);

      expect(result).toBeDefined();
      expect(result.features).toBeInstanceOf(Array);
      // Alerts may or may not be present, but the structure should be correct
      if (result.features.length > 0) {
        const firstAlert = result.features[0];
        expect(firstAlert).toBeDefined();
        expect(firstAlert?.properties).toBeDefined();
        expect(firstAlert?.properties.event).toBeTypeOf('string');
        expect(firstAlert?.properties.headline).toBeDefined();
        expect(firstAlert?.properties.description).toBeTypeOf('string');
        expect(firstAlert?.properties.severity).toBeTypeOf('string');
        expect(firstAlert?.properties.urgency).toBeTypeOf('string');
      }
    }, 30000);

    it('should fetch complete weather data for location', async () => {
      const result = await client.getWeatherData(REAL_COORDS.lat, REAL_COORDS.lon);

      expect(result).toBeDefined();
      expect(result.pointData).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.hourlyForecast).toBeDefined();
      expect(result.stations).toBeDefined();
      expect(result.alerts).toBeDefined();

      // Observation may be null if station is unavailable
      if (result.observation) {
        expect(result.observation.properties.timestamp).toBeTypeOf('string');
      }

      expect(result.forecast.properties.periods.length).toBeGreaterThan(0);
      expect(result.hourlyForecast.properties.periods.length).toBeGreaterThan(0);
      expect(result.stations.features.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle invalid coordinates with 404 error', async () => {
      await expect(client.getPointData(0, 0)).rejects.toThrow(NWSApiError);
      await expect(client.getPointData(0, 0)).rejects.toThrow('Resource not found');
    }, 30000);

    it('should handle out-of-bounds coordinates', async () => {
      // Coordinates outside continental US should fail
      await expect(client.getPointData(0, 0)).rejects.toThrow(NWSApiError);
    }, 30000);

    it('should handle invalid station ID', async () => {
      await expect(client.getLatestObservation('INVALID')).rejects.toThrow(
        NWSApiError
      );
    }, 30000);
  });

  describe('Data Validation', () => {
    it('should return valid forecast period structure', async () => {
      const pointData = await client.getPointData(REAL_COORDS.lat, REAL_COORDS.lon);
      const { gridId, gridX, gridY } = pointData.properties;
      const forecast = await client.getForecast(gridId, gridX, gridY);

      const period = forecast.properties.periods[0];
      expect(period).toBeDefined();

      // Validate all required fields exist
      expect(period?.number).toBeDefined();
      expect(period?.name).toBeDefined();
      expect(period?.startTime).toBeDefined();
      expect(period?.endTime).toBeDefined();
      expect(period?.isDaytime).toBeDefined();
      expect(period?.temperature).toBeDefined();
      expect(period?.temperatureUnit).toBeDefined();
      expect(period?.windSpeed).toBeDefined();
      expect(period?.windDirection).toBeDefined();
      expect(period?.icon).toBeDefined();
      expect(period?.shortForecast).toBeDefined();
      expect(period?.detailedForecast).toBeDefined();

      // Validate types
      expect(typeof period?.isDaytime).toBe('boolean');
      expect(typeof period?.temperature).toBe('number');
    }, 30000);

    it('should return valid observation structure', async () => {
      const observation = await client.getLatestObservation('KDFW');

      // Validate all required fields exist
      expect(observation.properties.timestamp).toBeDefined();
      expect(observation.properties.temperature).toBeDefined();
      expect(observation.properties.dewpoint).toBeDefined();
      expect(observation.properties.windDirection).toBeDefined();
      expect(observation.properties.windSpeed).toBeDefined();
      expect(observation.properties.windGust).toBeDefined();
      expect(observation.properties.visibility).toBeDefined();
      expect(observation.properties.relativeHumidity).toBeDefined();

      // Validate structure
      expect(observation.properties.temperature).toHaveProperty('unitCode');
      expect(observation.properties.temperature).toHaveProperty('value');
      expect(observation.properties.temperature).toHaveProperty('qualityControl');
    }, 30000);
  });

  describe('Coordinate Rounding Integration', () => {
    it('should successfully fetch data with high-precision coordinates', async () => {
      // Test with coordinates that need rounding
      const result = await client.getPointData(33.1234567890, -96.9876543210);

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties.gridId).toBeDefined();
      expect(result.properties.gridX).toBeTypeOf('number');
      expect(result.properties.gridY).toBeTypeOf('number');
    }, 30000);
  });
});
