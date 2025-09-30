/**
 * Sun Service - Calculates sunrise/sunset times using SunCalc library
 * Provides astronomical calculations for a given location and date
 */
export interface SunTimes {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    civilDawn: string;
    civilDusk: string;
}
/**
 * Calculate sun times for a given location and date
 * @param lat Latitude
 * @param lon Longitude
 * @param date Date for which to calculate (defaults to current date)
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object containing sunrise, sunset, and other sun times
 */
export declare function getSunTimes(lat: number, lon: number, date?: Date, _timezone?: string): SunTimes;
/**
 * Get today's sunrise and sunset times for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object with just sunrise and sunset times
 */
export declare function getTodaySunTimes(lat: number, lon: number, _timezone?: string): Pick<SunTimes, 'sunrise' | 'sunset'>;
/**
 * Check if current time is during daylight hours
 * @param lat Latitude
 * @param lon Longitude
 * @returns true if current time is between sunrise and sunset
 */
export declare function isDaylight(lat: number, lon: number): boolean;
//# sourceMappingURL=sunService.d.ts.map