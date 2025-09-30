/**
 * TypeScript type definitions for NWS API responses and weather data
 */
export interface NWSApiError {
    correlationId: string;
    title: string;
    type: string;
    status: number;
    detail?: string;
    instance?: string;
}
export interface PointsResponse {
    '@context': unknown;
    id: string;
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: {
        '@id': string;
        '@type': string;
        cwa: string;
        forecastOffice: string;
        gridId: string;
        gridX: number;
        gridY: number;
        forecast: string;
        forecastHourly: string;
        forecastGridData: string;
        observationStations: string;
        relativeLocation: {
            type: string;
            geometry: {
                type: string;
                coordinates: [number, number];
            };
            properties: {
                city: string;
                state: string;
                distance: {
                    unitCode: string;
                    value: number;
                };
                bearing: {
                    unitCode: string;
                    value: number;
                };
            };
        };
        forecastZone: string;
        county: string;
        fireWeatherZone: string;
        timeZone: string;
        radarStation: string;
    };
}
export interface ForecastPeriod {
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
export interface ForecastResponse {
    '@context': unknown;
    type: string;
    geometry: {
        type: string;
        coordinates: number[][][];
    };
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
        periods: ForecastPeriod[];
    };
}
export interface HourlyForecastPeriod {
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
export interface HourlyForecastResponse {
    '@context': unknown;
    type: string;
    geometry: {
        type: string;
        coordinates: number[][][];
    };
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
        periods: HourlyForecastPeriod[];
    };
}
export interface ObservationResponse {
    '@context': unknown;
    id: string;
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: {
        '@id': string;
        '@type': string;
        elevation: {
            unitCode: string;
            value: number;
        };
        station: string;
        timestamp: string;
        rawMessage: string;
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
export interface StationsResponse {
    '@context': unknown;
    type: string;
    features: Array<{
        id: string;
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number];
        };
        properties: {
            '@id': string;
            '@type': string;
            elevation: {
                unitCode: string;
                value: number;
            };
            stationIdentifier: string;
            name: string;
            timeZone: string;
            forecast: string;
            county: string;
            fireWeatherZone: string;
        };
    }>;
    observationStations: string[];
}
export interface AlertResponse {
    '@context': unknown;
    type: string;
    features: Array<{
        id: string;
        type: string;
        geometry: {
            type: string;
            coordinates: number[][] | number[][][] | null;
        };
        properties: {
            '@id': string;
            '@type': string;
            id: string;
            areaDesc: string;
            geocode: {
                SAME: string[];
                UGC: string[];
            };
            affectedZones: string[];
            references: Array<{
                '@id': string;
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
                AWIPSidentifier?: string[];
                WMOidentifier?: string[];
                NWSheadline?: string[];
                BLOCKCHANNEL?: string[];
                VTEC?: string[];
                eventEndingTime?: string[];
                expiredReferences?: string[];
            };
        };
    }>;
    title: string;
    updated: string;
}
export interface GeocodeResult {
    lat: number;
    lon: number;
    displayName: string;
    zipCode: string;
}
export interface WeatherPackage {
    location: {
        zipCode: string;
        coordinates: {
            lat: number;
            lon: number;
        };
        displayName: string;
        gridInfo: {
            gridId: string;
            gridX: number;
            gridY: number;
            forecastOffice: string;
        };
        timeZone: string;
    };
    forecast: ForecastResponse;
    hourlyForecast: HourlyForecastResponse;
    currentConditions: ObservationResponse | null;
    alerts: AlertResponse;
    metadata: {
        fetchedAt: string;
        cacheExpiry: string;
    };
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}
export interface ServerConfig {
    port: number;
    host: string;
    cachedZipCodes: string[];
    refreshInterval: number;
    userAgent: string;
    nwsApiBaseUrl: string;
    geocodingProvider: string;
}
//# sourceMappingURL=weather.types.d.ts.map