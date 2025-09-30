/**
 * Sun Service - Calculates sunrise/sunset times using SunCalc library
 * Provides astronomical calculations for a given location and date
 */

import SunCalc from 'suncalc';

export interface SunTimes {
  sunrise: string; // ISO 8601 timestamp
  sunset: string; // ISO 8601 timestamp
  solarNoon: string; // ISO 8601 timestamp (sun at highest point)
  civilDawn: string; // ISO 8601 timestamp (civil twilight start)
  civilDusk: string; // ISO 8601 timestamp (civil twilight end)
}

/**
 * Calculate sun times for a given location and date
 * @param lat Latitude
 * @param lon Longitude
 * @param date Date for which to calculate (defaults to current date)
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object containing sunrise, sunset, and other sun times
 */
export function getSunTimes(
  lat: number,
  lon: number,
  date: Date = new Date(),
  _timezone?: string
): SunTimes {
  // Calculate sun times for the given location and date
  const times = SunCalc.getTimes(date, lat, lon);

  return {
    sunrise: times.sunrise.toISOString(),
    sunset: times.sunset.toISOString(),
    solarNoon: times.solarNoon.toISOString(),
    civilDawn: times.dawn.toISOString(),
    civilDusk: times.dusk.toISOString(),
  };
}

/**
 * Get today's sunrise and sunset times for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param _timezone IANA timezone string for the location (reserved for future use)
 * @returns Object with just sunrise and sunset times
 */
export function getTodaySunTimes(
  lat: number,
  lon: number,
  _timezone?: string
): Pick<SunTimes, 'sunrise' | 'sunset'> {
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
export function isDaylight(lat: number, lon: number): boolean {
  const now = new Date();
  const times = SunCalc.getTimes(now, lat, lon);
  return now >= times.sunrise && now <= times.sunset;
}
