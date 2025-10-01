/**
 * Sun Service - Calculates sunrise/sunset times using SunCalc library
 * Provides astronomical calculations for a given location and date
 */
import SunCalc from 'suncalc';
/**
 * Calculate sun times for a given location and date
 * @param lat Latitude
 * @param lon Longitude
 * @param date Date for which to calculate (defaults to current date)
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object containing sunrise, sunset, and other sun times
 */
export function getSunTimes(lat, lon, date = new Date(), _timezone) {
    // Calculate sun times for the given location and date
    const times = SunCalc.getTimes(date, lat, lon);
    // Helper function to safely convert Date to ISO string
    // At extreme latitudes, some times (like civil dawn/dusk) may be invalid (NaN)
    // during periods of midnight sun or polar night
    const safeToISO = (d) => {
        if (isNaN(d.getTime())) {
            // Return a marker for invalid times
            // This can happen at extreme latitudes where the sun doesn't reach
            // the required angle below the horizon
            return '';
        }
        return d.toISOString();
    };
    return {
        sunrise: safeToISO(times.sunrise),
        sunset: safeToISO(times.sunset),
        solarNoon: safeToISO(times.solarNoon),
        civilDawn: safeToISO(times.dawn),
        civilDusk: safeToISO(times.dusk),
    };
}
/**
 * Get today's sunrise and sunset times for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object with just sunrise and sunset times
 */
export function getTodaySunTimes(lat, lon, _timezone) {
    const times = getSunTimes(lat, lon, new Date(), _timezone);
    return {
        sunrise: times.sunrise,
        sunset: times.sunset,
    };
}
/**
 * Check if current time is during daylight hours
 * @param lat Latitude
 * @param lon Longitude
 * @returns true if current time is between sunrise and sunset
 */
export function isDaylight(lat, lon) {
    const now = new Date();
    const times = SunCalc.getTimes(now, lat, lon);
    return now >= times.sunrise && now <= times.sunset;
}
//# sourceMappingURL=sunService.js.map