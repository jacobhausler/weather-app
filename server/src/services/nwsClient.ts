import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

export interface NWSPointData {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    forecastGridData: string;
    observationStations: string;
    forecastZone: string;
    county: string;
    fireWeatherZone: string;
    timeZone: string;
    radarStation: string;
  };
}

export interface NWSForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string | null;
  probabilityOfPrecipitation: {
    unitCode: string;
    value: number | null;
  };
  dewpoint: {
    unitCode: string;
    value: number | null;
  };
  relativeHumidity: {
    unitCode: string;
    value: number | null;
  };
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface NWSForecast {
  properties: {
    updated: string;
    units: string;
    forecastGenerator: string;
    generatedAt: string;
    updateTime: string;
    validTimes: string;
    elevation: {
      unitCode: string;
      value: number;
    };
    periods: NWSForecastPeriod[];
  };
}

export interface NWSHourlyForecastPeriod {
  number: number;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string | null;
  probabilityOfPrecipitation: {
    unitCode: string;
    value: number | null;
  };
  dewpoint: {
    unitCode: string;
    value: number | null;
  };
  relativeHumidity: {
    unitCode: string;
    value: number | null;
  };
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface NWSHourlyForecast {
  properties: {
    updated: string;
    units: string;
    forecastGenerator: string;
    generatedAt: string;
    updateTime: string;
    validTimes: string;
    elevation: {
      unitCode: string;
      value: number;
    };
    periods: NWSHourlyForecastPeriod[];
  };
}

export interface NWSStation {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    stationIdentifier: string;
    name: string;
    timeZone: string;
    forecast: string;
    county: string;
    fireWeatherZone: string;
  };
}

export interface NWSStations {
  features: NWSStation[];
}

export interface NWSObservation {
  properties: {
    timestamp: string;
    textDescription: string;
    icon: string;
    presentWeather: Array<{
      intensity: string | null;
      modifier: string | null;
      weather: string;
      rawString: string;
    }>;
    temperature: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    dewpoint: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    windDirection: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    windSpeed: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    windGust: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    barometricPressure: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    seaLevelPressure: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    visibility: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    maxTemperatureLast24Hours: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    minTemperatureLast24Hours: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    precipitationLastHour: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    precipitationLast3Hours: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    precipitationLast6Hours: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    relativeHumidity: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    windChill: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    heatIndex: {
      unitCode: string;
      value: number | null;
      qualityControl: string;
    };
    cloudLayers: Array<{
      base: {
        unitCode: string;
        value: number | null;
      };
      amount: string;
    }>;
  };
}

export interface NWSAlert {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  } | null;
  properties: {
    id: string;
    areaDesc: string;
    geocode: {
      SAME: string[];
      UGC: string[];
    };
    affectedZones: string[];
    references: Array<{
      id: string;
      identifier: string;
      sender: string;
      sent: string;
    }>;
    sent: string;
    effective: string;
    onset: string;
    expires: string;
    ends: string | null;
    status: string;
    messageType: string;
    category: string;
    severity: string;
    certainty: string;
    urgency: string;
    event: string;
    sender: string;
    senderName: string;
    headline: string | null;
    description: string;
    instruction: string | null;
    response: string;
    parameters: {
      [key: string]: string[];
    };
  };
}

export interface NWSAlerts {
  features: NWSAlert[];
}

// ============================================================================
// Error Types
// ============================================================================

export class NWSApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'NWSApiError';
  }
}

export class NWSRateLimitError extends NWSApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'NWSRateLimitError';
  }
}

// ============================================================================
// NWS API Client
// ============================================================================

export class NWSClient {
  private client: AxiosInstance;
  private readonly baseURL = 'https://api.weather.gov';
  private readonly userAgent = 'WeatherApp/1.0 (contact@example.com)';
  private readonly maxRetries = 3;
  private readonly backoffDelays = [5000, 10000, 20000]; // 5s, 10s, 20s for 429 errors

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/geo+json',
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Sleep utility for backoff delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generic request handler with retry logic and exponential backoff
   */
  private async request<T>(
    endpoint: string,
    attempt: number = 0
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        // Handle 429 (Rate Limit) with exponential backoff
        if (status === 429) {
          if (attempt < this.backoffDelays.length) {
            const delay = this.backoffDelays[attempt];
            if (delay !== undefined) {
              console.warn(
                `Rate limit hit on ${endpoint}. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.backoffDelays.length})`
              );
              await this.sleep(delay);
              return this.request<T>(endpoint, attempt + 1);
            }
          }
          throw new NWSRateLimitError(
            `Rate limit exceeded after ${this.backoffDelays.length} retries`
          );
        }

        // Handle 5xx errors with retry logic
        if (status && status >= 500 && status < 600) {
          if (attempt < this.maxRetries) {
            const delay = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
            console.warn(
              `Server error ${status} on ${endpoint}. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`
            );
            await this.sleep(delay);
            return this.request<T>(endpoint, attempt + 1);
          } else {
            throw new NWSApiError(
              `Server error after ${this.maxRetries} retries: ${axiosError.message}`,
              status,
              axiosError.response?.data
            );
          }
        }

        // Handle 404 and other client errors
        if (status === 404) {
          throw new NWSApiError(
            `Resource not found: ${endpoint}`,
            404,
            axiosError.response?.data
          );
        }

        // Other HTTP errors
        throw new NWSApiError(
          `HTTP error ${status}: ${axiosError.message}`,
          status,
          axiosError.response?.data
        );
      }

      // Non-Axios errors
      throw new NWSApiError(
        `Unknown error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get point data (grid coordinates) from lat/lon
   * @param lat Latitude
   * @param lon Longitude
   * @returns Point data including grid coordinates
   */
  async getPointData(lat: number, lon: number): Promise<NWSPointData> {
    // Round to 4 decimal places for NWS API
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;
    return this.request<NWSPointData>(`/points/${roundedLat},${roundedLon}`);
  }

  /**
   * Get 7-day forecast
   * @param office Grid office identifier
   * @param gridX Grid X coordinate
   * @param gridY Grid Y coordinate
   * @returns 7-day forecast with day/night periods
   */
  async getForecast(
    office: string,
    gridX: number,
    gridY: number
  ): Promise<NWSForecast> {
    return this.request<NWSForecast>(
      `/gridpoints/${office}/${gridX},${gridY}/forecast`
    );
  }

  /**
   * Get hourly forecast
   * @param office Grid office identifier
   * @param gridX Grid X coordinate
   * @param gridY Grid Y coordinate
   * @returns Hourly forecast data
   */
  async getHourlyForecast(
    office: string,
    gridX: number,
    gridY: number
  ): Promise<NWSHourlyForecast> {
    return this.request<NWSHourlyForecast>(
      `/gridpoints/${office}/${gridX},${gridY}/forecast/hourly`
    );
  }

  /**
   * Get observation stations for a grid point
   * @param office Grid office identifier
   * @param gridX Grid X coordinate
   * @param gridY Grid Y coordinate
   * @returns List of nearby observation stations
   */
  async getStations(
    office: string,
    gridX: number,
    gridY: number
  ): Promise<NWSStations> {
    return this.request<NWSStations>(
      `/gridpoints/${office}/${gridX},${gridY}/stations`
    );
  }

  /**
   * Get latest observation from a station
   * @param stationId Station identifier (e.g., "KDFW")
   * @returns Latest observation data
   */
  async getLatestObservation(stationId: string): Promise<NWSObservation> {
    return this.request<NWSObservation>(
      `/stations/${stationId}/observations/latest`
    );
  }

  /**
   * Get active alerts for a point
   * @param lat Latitude
   * @param lon Longitude
   * @returns Active weather alerts
   */
  async getActiveAlerts(lat: number, lon: number): Promise<NWSAlerts> {
    // Round to 4 decimal places for NWS API
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;
    return this.request<NWSAlerts>(
      `/alerts/active?point=${roundedLat},${roundedLon}`
    );
  }

  /**
   * Get full weather data for a location (convenience method)
   * @param lat Latitude
   * @param lon Longitude
   * @returns Object containing all weather data
   */
  async getWeatherData(lat: number, lon: number) {
    // Get point data first
    const pointData = await this.getPointData(lat, lon);
    const { gridId, gridX, gridY } = pointData.properties;

    // Fetch all data in parallel
    const [forecast, hourlyForecast, stations, alerts] = await Promise.all([
      this.getForecast(gridId, gridX, gridY),
      this.getHourlyForecast(gridId, gridX, gridY),
      this.getStations(gridId, gridX, gridY),
      this.getActiveAlerts(lat, lon),
    ]);

    // Get latest observation from first station
    let observation: NWSObservation | null = null;
    if (stations.features.length > 0) {
      const firstStation = stations.features[0];
      if (firstStation?.properties?.stationIdentifier) {
        const stationId = firstStation.properties.stationIdentifier;
        try {
          observation = await this.getLatestObservation(stationId);
        } catch (error) {
          console.warn(`Failed to get observation from ${stationId}:`, error);
        }
      }
    }

    return {
      pointData,
      forecast,
      hourlyForecast,
      stations,
      observation,
      alerts,
    };
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default new NWSClient();