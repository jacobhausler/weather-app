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
export declare class NWSApiError extends Error {
    statusCode?: number | undefined;
    response?: unknown | undefined;
    constructor(message: string, statusCode?: number | undefined, response?: unknown | undefined);
}
export declare class NWSRateLimitError extends NWSApiError {
    constructor(message?: string);
}
export declare class NWSClient {
    private client;
    private readonly baseURL;
    private readonly userAgent;
    private readonly maxRetries;
    private readonly backoffDelays;
    constructor();
    /**
     * Sleep utility for backoff delays
     */
    private sleep;
    /**
     * Generic request handler with retry logic and exponential backoff
     */
    private request;
    /**
     * Get point data (grid coordinates) from lat/lon
     * @param lat Latitude
     * @param lon Longitude
     * @returns Point data including grid coordinates
     */
    getPointData(lat: number, lon: number): Promise<NWSPointData>;
    /**
     * Get 7-day forecast
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns 7-day forecast with day/night periods
     */
    getForecast(office: string, gridX: number, gridY: number): Promise<NWSForecast>;
    /**
     * Get hourly forecast
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns Hourly forecast data
     */
    getHourlyForecast(office: string, gridX: number, gridY: number): Promise<NWSHourlyForecast>;
    /**
     * Get observation stations for a grid point
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns List of nearby observation stations
     */
    getStations(office: string, gridX: number, gridY: number): Promise<NWSStations>;
    /**
     * Get latest observation from a station
     * @param stationId Station identifier (e.g., "KDFW")
     * @returns Latest observation data
     */
    getLatestObservation(stationId: string): Promise<NWSObservation>;
    /**
     * Get active alerts for a point
     * @param lat Latitude
     * @param lon Longitude
     * @returns Active weather alerts
     */
    getActiveAlerts(lat: number, lon: number): Promise<NWSAlerts>;
    /**
     * Get full weather data for a location (convenience method)
     * @param lat Latitude
     * @param lon Longitude
     * @returns Object containing all weather data
     */
    getWeatherData(lat: number, lon: number): Promise<{
        pointData: NWSPointData;
        forecast: NWSForecast;
        hourlyForecast: NWSHourlyForecast;
        stations: NWSStations;
        observation: NWSObservation | null;
        alerts: NWSAlerts;
    }>;
}
declare const _default: NWSClient;
export default _default;
//# sourceMappingURL=nwsClient.d.ts.map