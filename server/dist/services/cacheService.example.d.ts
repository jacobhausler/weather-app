/**
 * CacheService Usage Examples
 *
 * This file demonstrates how to use the CacheService in the weather app.
 * DO NOT import this file in production code - it's for reference only.
 */
import { CacheDataType } from './cacheService.js';
declare function fetchPointsData(lat: number, lon: number): Promise<any>;
declare function fetch7DayForecast(office: string, gridX: number, gridY: number): Promise<any>;
declare function fetchCurrentObservations(stationId: string): Promise<any>;
declare function fetchStationMetadata(stationId: string): Promise<any>;
declare function fetchAlerts(lat: number, lon: number): Promise<unknown>;
declare function cacheWithAutoTTL(dataType: CacheDataType, key: string, value: any): void;
declare function cacheMultipleForecasts(): void;
declare function monitorCache(): void;
declare function invalidateForecastCache(office: string, gridX: number, gridY: number): void;
declare function cacheCustomData(): void;
declare function getWeatherData(zipCode: string): Promise<unknown>;
export { fetchPointsData, fetch7DayForecast, fetchCurrentObservations, fetchStationMetadata, fetchAlerts, cacheWithAutoTTL, cacheMultipleForecasts, monitorCache, invalidateForecastCache, cacheCustomData, getWeatherData };
//# sourceMappingURL=cacheService.example.d.ts.map