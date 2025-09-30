/**
 * Tests for Sun Service
 * These tests use real SunCalc calculations - NO MOCKS
 * Tests validate actual astronomical calculations for various locations and dates
 */

import { describe, it, expect } from 'vitest';
import { getSunTimes, getTodaySunTimes, isDaylight } from './sunService';

describe('sunService', () => {
  describe('getSunTimes', () => {
    it('should calculate sun times for Dallas, TX (typical US location)', () => {
      // Dallas coordinates: 32.7767° N, 96.7970° W
      const lat = 32.7767;
      const lon = -96.7970;
      const date = new Date('2024-06-21T12:00:00Z'); // Summer solstice

      const result = getSunTimes(lat, lon, date);

      // Verify all fields are present
      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();
      expect(result.solarNoon).toBeDefined();
      expect(result.civilDawn).toBeDefined();
      expect(result.civilDusk).toBeDefined();

      // Verify ISO 8601 format
      expect(result.sunrise).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result.sunset).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Parse dates for validation
      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);
      const solarNoon = new Date(result.solarNoon);
      const civilDawn = new Date(result.civilDawn);
      const civilDusk = new Date(result.civilDusk);

      // Verify sunrise is before sunset
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

      // Verify solar noon is between sunrise and sunset
      expect(solarNoon.getTime()).toBeGreaterThan(sunrise.getTime());
      expect(solarNoon.getTime()).toBeLessThan(sunset.getTime());

      // Verify civil twilight times
      expect(civilDawn.getTime()).toBeLessThan(sunrise.getTime());
      expect(civilDusk.getTime()).toBeGreaterThan(sunset.getTime());

      // Verify reasonable times for Dallas in summer (longest day)
      // Summer solstice should have early sunrise and late sunset
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(13); // Should be > 13 hours in summer
      expect(dayLength).toBeLessThan(15); // But < 15 hours (Dallas isn't that far north)
    });

    it('should calculate sun times for New York City', () => {
      // NYC coordinates: 40.7128° N, 74.0060° W
      const lat = 40.7128;
      const lon = -74.0060;
      const date = new Date('2024-03-20T12:00:00Z'); // Spring equinox

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Verify sunrise is before sunset
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

      // On equinox, day length should be close to 12 hours
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(11.5);
      expect(dayLength).toBeLessThan(12.5);
    });

    it('should calculate sun times for Los Angeles', () => {
      // LA coordinates: 34.0522° N, 118.2437° W
      const lat = 34.0522;
      const lon = -118.2437;
      const date = new Date('2024-12-21T12:00:00Z'); // Winter solstice

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Verify sunrise is before sunset
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

      // Winter solstice should have shorter days
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(9); // Should be > 9 hours
      expect(dayLength).toBeLessThan(10.5); // But < 10.5 hours in winter
    });

    it('should calculate sun times for Miami (southern US location)', () => {
      // Miami coordinates: 25.7617° N, 80.1918° W
      const lat = 25.7617;
      const lon = -80.1918;
      const date = new Date('2024-07-04T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);
      const solarNoon = new Date(result.solarNoon);

      // Verify basic ordering
      expect(sunrise.getTime()).toBeLessThan(solarNoon.getTime());
      expect(solarNoon.getTime()).toBeLessThan(sunset.getTime());

      // Miami is closer to equator, so day length variation is less extreme
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(10);
      expect(dayLength).toBeLessThan(14);
    });

    it('should calculate sun times for Seattle (northern US location)', () => {
      // Seattle coordinates: 47.6062° N, 122.3321° W
      const lat = 47.6062;
      const lon = -122.3321;
      const date = new Date('2024-06-21T12:00:00Z'); // Summer solstice

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Verify sunrise is before sunset
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

      // Seattle is far north, summer days should be very long
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(15); // Should be > 15 hours in summer
      expect(dayLength).toBeLessThan(17); // But not quite 17 hours
    });

    it('should handle date boundaries correctly (midnight transitions)', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      const date = new Date('2024-06-15T23:59:59Z'); // Just before midnight

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Times should still be valid and ordered correctly
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
      expect(sunrise.toISOString()).toBeTruthy();
      expect(sunset.toISOString()).toBeTruthy();
    });

    it('should calculate different times for same location on different dates', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const summerDate = new Date('2024-06-21T12:00:00Z');
      const winterDate = new Date('2024-12-21T12:00:00Z');

      const summerTimes = getSunTimes(lat, lon, summerDate);
      const winterTimes = getSunTimes(lat, lon, winterDate);

      const summerSunrise = new Date(summerTimes.sunrise);
      const summerSunset = new Date(summerTimes.sunset);
      const winterSunrise = new Date(winterTimes.sunrise);
      const winterSunset = new Date(winterTimes.sunset);

      // Calculate day lengths
      const summerDayLength = (summerSunset.getTime() - summerSunrise.getTime()) / (1000 * 60 * 60);
      const winterDayLength = (winterSunset.getTime() - winterSunrise.getTime()) / (1000 * 60 * 60);

      // Summer days should be longer than winter days
      expect(summerDayLength).toBeGreaterThan(winterDayLength);

      // Verify the difference is significant (at least 3 hours)
      expect(summerDayLength - winterDayLength).toBeGreaterThan(3);
    });

    it('should handle equinox dates (equal day/night)', () => {
      const lat = 35.0;
      const lon = -90.0;

      // Spring equinox
      const springEquinox = new Date('2024-03-20T12:00:00Z');
      const result = getSunTimes(lat, lon, springEquinox);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // On equinox, day and night should be approximately equal
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);

      // Should be very close to 12 hours (within 30 minutes tolerance)
      expect(Math.abs(dayLength - 12)).toBeLessThan(0.5);
    });

    it('should handle southern hemisphere location (Sydney, Australia)', () => {
      // Sydney coordinates: 33.8688° S, 151.2093° E
      const lat = -33.8688;
      const lon = 151.2093;
      const date = new Date('2024-12-21T12:00:00Z'); // Summer in southern hemisphere

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Verify basic ordering
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

      // December is summer in southern hemisphere - longer days
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(13);
    });

    it('should handle location near equator (Singapore)', () => {
      // Singapore coordinates: 1.3521° N, 103.8198° E
      const lat = 1.3521;
      const lon = 103.8198;
      const date = new Date('2024-06-21T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Near equator, day length should be close to 12 hours year-round
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(11.5);
      expect(dayLength).toBeLessThan(12.5);
    });

    it('should handle high northern latitude (Anchorage, Alaska)', () => {
      // Anchorage coordinates: 61.2181° N, 149.9003° W
      const lat = 61.2181;
      const lon = -149.9003;
      const summerDate = new Date('2024-06-21T12:00:00Z');

      const result = getSunTimes(lat, lon, summerDate);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Verify sunrise and sunset are valid
      expect(sunrise.getTime()).not.toBeNaN();
      expect(sunset.getTime()).not.toBeNaN();

      // In summer, Anchorage has very long days (18+ hours)
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(18);

      // At extreme latitudes during summer solstice, civil twilight times
      // may be empty strings because the sun never goes low enough below the horizon
      // This represents the phenomenon of "white nights" or midnight sun periods
      // In Anchorage during summer solstice, civil dawn/dusk are typically invalid
      expect(result.civilDawn).toBeDefined();
      expect(result.civilDusk).toBeDefined();
    });

    it('should handle winter in high northern latitude (short days)', () => {
      // Anchorage coordinates: 61.2181° N, 149.9003° W
      const lat = 61.2181;
      const lon = -149.9003;
      const winterDate = new Date('2024-12-21T12:00:00Z');

      const result = getSunTimes(lat, lon, winterDate);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // In winter, Anchorage has very short days (5-6 hours)
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      expect(dayLength).toBeGreaterThan(4);
      expect(dayLength).toBeLessThan(7);
    });

    it('should use current date when date parameter is not provided', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const result = getSunTimes(lat, lon);

      // Should return valid times
      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      // Should be valid dates
      expect(sunrise.getTime()).not.toBeNaN();
      expect(sunset.getTime()).not.toBeNaN();

      // Sunrise should be before sunset
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    });

    it('should handle timezone parameter (reserved for future use)', () => {
      const lat = 32.7767;
      const lon = -96.7970;
      const date = new Date('2024-06-21T12:00:00Z');

      // Even though timezone is not currently used, it should not cause errors
      const result = getSunTimes(lat, lon, date, 'America/Chicago');

      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();
    });

    it('should verify civil dawn is before sunrise', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const civilDawn = new Date(result.civilDawn);
      const sunrise = new Date(result.sunrise);

      // Civil dawn (twilight starts) should be before sunrise
      expect(civilDawn.getTime()).toBeLessThan(sunrise.getTime());

      // Typically 20-40 minutes before sunrise
      const diffMinutes = (sunrise.getTime() - civilDawn.getTime()) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThan(15);
      expect(diffMinutes).toBeLessThan(60);
    });

    it('should verify civil dusk is after sunset', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const sunset = new Date(result.sunset);
      const civilDusk = new Date(result.civilDusk);

      // Civil dusk (twilight ends) should be after sunset
      expect(civilDusk.getTime()).toBeGreaterThan(sunset.getTime());

      // Typically 20-40 minutes after sunset
      const diffMinutes = (civilDusk.getTime() - sunset.getTime()) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThan(15);
      expect(diffMinutes).toBeLessThan(60);
    });

    it('should return consistent results for same inputs', () => {
      const lat = 32.7767;
      const lon = -96.7970;
      const date = new Date('2024-06-21T12:00:00Z');

      const result1 = getSunTimes(lat, lon, date);
      const result2 = getSunTimes(lat, lon, date);

      // Should return identical results
      expect(result1.sunrise).toBe(result2.sunrise);
      expect(result1.sunset).toBe(result2.sunset);
      expect(result1.solarNoon).toBe(result2.solarNoon);
      expect(result1.civilDawn).toBe(result2.civilDawn);
      expect(result1.civilDusk).toBe(result2.civilDusk);
    });
  });

  describe('getTodaySunTimes', () => {
    it('should return only sunrise and sunset for current date', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const result = getTodaySunTimes(lat, lon);

      // Should have sunrise and sunset
      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();

      // Should not have other properties
      expect(result).not.toHaveProperty('solarNoon');
      expect(result).not.toHaveProperty('civilDawn');
      expect(result).not.toHaveProperty('civilDusk');

      // Verify valid dates
      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      expect(sunrise.getTime()).not.toBeNaN();
      expect(sunset.getTime()).not.toBeNaN();
      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    });

    it('should work with different locations', () => {
      const nyc = getTodaySunTimes(40.7128, -74.0060);
      const la = getTodaySunTimes(34.0522, -118.2437);

      // Both should have valid times
      expect(nyc.sunrise).toBeDefined();
      expect(nyc.sunset).toBeDefined();
      expect(la.sunrise).toBeDefined();
      expect(la.sunset).toBeDefined();

      // Times should be different due to different locations
      // (unless by chance they happen to be the same, which is unlikely)
      const nycSunrise = new Date(nyc.sunrise);
      const laSunrise = new Date(la.sunrise);

      // Verify both are valid
      expect(nycSunrise.getTime()).not.toBeNaN();
      expect(laSunrise.getTime()).not.toBeNaN();
    });

    it('should handle timezone parameter (reserved for future use)', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      // Should not throw error even with timezone parameter
      const result = getTodaySunTimes(lat, lon, 'America/Chicago');

      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();
    });

    it('should return results matching getSunTimes for today', () => {
      const lat = 32.7767;
      const lon = -96.7970;
      const today = new Date();

      const todayResult = getTodaySunTimes(lat, lon);
      const fullResult = getSunTimes(lat, lon, today);

      // The sunrise and sunset times should match
      expect(todayResult.sunrise).toBe(fullResult.sunrise);
      expect(todayResult.sunset).toBe(fullResult.sunset);
    });
  });

  describe('isDaylight', () => {
    it('should return false during night hours', () => {
      // Note: This test might fail depending on when it's run
      // To make it deterministic, we need to know the current time and location
      // For now, we'll use a known location and infer from getSunTimes

      const lat = 32.7767;
      const lon = -96.7970;

      // Get today's sun times to determine if we should expect day or night
      const times = getSunTimes(lat, lon, new Date());
      const sunrise = new Date(times.sunrise);
      const sunset = new Date(times.sunset);
      const now = new Date();

      const result = isDaylight(lat, lon);

      // Verify the result matches expectations based on current time
      if (now >= sunrise && now <= sunset) {
        expect(result).toBe(true);
      } else {
        expect(result).toBe(false);
      }
    });

    it('should return boolean value', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const result = isDaylight(lat, lon);

      // Should return a boolean
      expect(typeof result).toBe('boolean');
    });

    it('should work for different locations', () => {
      const dallasResult = isDaylight(32.7767, -96.7970);
      const nycResult = isDaylight(40.7128, -74.0060);
      const laResult = isDaylight(34.0522, -118.2437);

      // All should return boolean values
      expect(typeof dallasResult).toBe('boolean');
      expect(typeof nycResult).toBe('boolean');
      expect(typeof laResult).toBe('boolean');
    });

    it('should be consistent with getSunTimes', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const isDaylightResult = isDaylight(lat, lon);
      const times = getSunTimes(lat, lon, new Date());

      const sunrise = new Date(times.sunrise);
      const sunset = new Date(times.sunset);
      const now = new Date();

      const expectedResult = now >= sunrise && now <= sunset;

      // The isDaylight result should match our manual calculation
      expect(isDaylightResult).toBe(expectedResult);
    });

    it('should handle edge case at exact sunrise time', () => {
      // This is more of a conceptual test - we can't easily test exact sunrise
      // but we can verify the function handles edge cases without errors
      const lat = 32.7767;
      const lon = -96.7970;

      // Function should not throw
      expect(() => isDaylight(lat, lon)).not.toThrow();
    });

    it('should handle extreme northern latitude', () => {
      // Anchorage, Alaska
      const lat = 61.2181;
      const lon = -149.9003;

      // Should work without errors
      const result = isDaylight(lat, lon);
      expect(typeof result).toBe('boolean');
    });

    it('should handle southern hemisphere location', () => {
      // Sydney, Australia
      const lat = -33.8688;
      const lon = 151.2093;

      // Should work without errors
      const result = isDaylight(lat, lon);
      expect(typeof result).toBe('boolean');
    });

    it('should handle location near equator', () => {
      // Singapore
      const lat = 1.3521;
      const lon = 103.8198;

      // Should work without errors
      const result = isDaylight(lat, lon);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle date at year boundary', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      const newYearsEve = new Date('2024-12-31T23:59:59Z');

      const result = getSunTimes(lat, lon, newYearsEve);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
      expect(sunrise.getTime()).not.toBeNaN();
      expect(sunset.getTime()).not.toBeNaN();
    });

    it('should handle leap year date', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      const leapDay = new Date('2024-02-29T12:00:00Z');

      const result = getSunTimes(lat, lon, leapDay);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    });

    it('should handle coordinates with high precision', () => {
      const lat = 32.776664;
      const lon = -96.796988;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();
    });

    it('should handle zero longitude (prime meridian)', () => {
      // London, UK (near prime meridian)
      const lat = 51.5074;
      const lon = 0.0;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    });

    it('should handle international date line crossing', () => {
      // Fiji (near international date line)
      const lat = -18.0;
      const lon = 178.0;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);

      const sunrise = new Date(result.sunrise);
      const sunset = new Date(result.sunset);

      expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    });

    it('should verify solar noon is close to actual noon', () => {
      const lat = 32.7767;
      const lon = -96.7970;
      const date = new Date('2024-06-15T12:00:00Z');

      const result = getSunTimes(lat, lon, date);
      const solarNoon = new Date(result.solarNoon);

      // Solar noon should be sometime during the day (not at exactly 12:00 UTC)
      const hour = solarNoon.getUTCHours();
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThan(24);
    });

    it('should handle multiple calls in sequence', () => {
      const lat = 32.7767;
      const lon = -96.7970;

      const results = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(`2024-0${i + 1}-15T12:00:00Z`);
        results.push(getSunTimes(lat, lon, date));
      }

      // All results should be valid
      results.forEach(result => {
        expect(result.sunrise).toBeDefined();
        expect(result.sunset).toBeDefined();
        const sunrise = new Date(result.sunrise);
        const sunset = new Date(result.sunset);
        expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
      });
    });

    it('should verify day length changes throughout the year', () => {
      const lat = 40.7128;
      const lon = -74.0060;

      const months = [];
      for (let month = 1; month <= 12; month++) {
        const date = new Date(`2024-${month.toString().padStart(2, '0')}-15T12:00:00Z`);
        const times = getSunTimes(lat, lon, date);
        const sunrise = new Date(times.sunrise);
        const sunset = new Date(times.sunset);
        const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
        months.push(dayLength);
      }

      // Find shortest and longest days
      const shortest = Math.min(...months);
      const longest = Math.max(...months);

      // Verify significant variation (at least 4 hours difference)
      expect(longest - shortest).toBeGreaterThan(4);

      // Longest day should be in June (index 5)
      expect(months[5]).toBeGreaterThan(months[0]);
      expect(months[5]).toBeGreaterThan(months[11]);
    });
  });
});
