import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseNWSIconUrl,
  getWeatherIconPath,
  getWeatherIconFromUrl,
  extractPrimaryCondition,
  getFallbackIcon,
  isWindVariant,
  getBaseCondition,
  getAllNWSCodes,
  getCodesByCategory,
  NWS_TO_ANIMATED_MAP,
  type IconMetadata,
} from './weatherIconMapper';

describe('weatherIconMapper', () => {
  // Track console warnings/errors
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('parseNWSIconUrl', () => {
    describe('valid single condition URLs', () => {
      it('should parse daytime icon URL without percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/skc?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
          percentage: undefined,
        });
      });

      it('should parse nighttime icon URL without percentage', () => {
        const url = 'https://api.weather.gov/icons/land/night/skc?size=small';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: false,
          percentage: undefined,
        });
      });

      it('should parse daytime icon URL with percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'tsra_hi',
          isDaytime: true,
          percentage: 20,
        });
      });

      it('should parse nighttime icon URL with percentage', () => {
        const url = 'https://api.weather.gov/icons/land/night/rain,60?size=large';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'rain',
          isDaytime: false,
          percentage: 60,
        });
      });

      it('should parse URL with zero percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/sct,0?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'sct',
          isDaytime: true,
          percentage: 0,
        });
      });

      it('should parse URL with 100 percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/rain,100?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'rain',
          isDaytime: true,
          percentage: 100,
        });
      });

      it('should parse URL without size parameter', () => {
        const url = 'https://api.weather.gov/icons/land/day/few';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'few',
          isDaytime: true,
          percentage: undefined,
        });
      });
    });

    describe('valid split condition URLs', () => {
      it('should parse split icon with both percentages', () => {
        const url = 'https://api.weather.gov/icons/land/day/sct,20/rain,40?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'rain',
          isDaytime: true,
          percentage: 40,
          splitCondition: 'sct',
          splitPercentage: 20,
        });
      });

      it('should parse split icon with no percentages', () => {
        const url = 'https://api.weather.gov/icons/land/night/bkn/tsra?size=small';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'tsra',
          isDaytime: false,
          percentage: undefined,
          splitCondition: 'bkn',
          splitPercentage: undefined,
        });
      });

      it('should parse split icon with first percentage only', () => {
        const url = 'https://api.weather.gov/icons/land/day/sct,30/rain?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'rain',
          isDaytime: true,
          percentage: undefined,
          splitCondition: 'sct',
          splitPercentage: 30,
        });
      });

      it('should parse split icon with second percentage only', () => {
        const url = 'https://api.weather.gov/icons/land/day/sct/rain,50?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'rain',
          isDaytime: true,
          percentage: 50,
          splitCondition: 'sct',
          splitPercentage: undefined,
        });
      });

      it('should use second condition as primary for split icons', () => {
        const url = 'https://api.weather.gov/icons/land/day/few,0/tsra_hi,70?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result.nwsCode).toBe('tsra_hi');
        expect(result.splitCondition).toBe('few');
      });

      it('should parse nighttime split icon', () => {
        const url = 'https://api.weather.gov/icons/land/night/ovc,10/snow,80?size=large';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'snow',
          isDaytime: false,
          percentage: 80,
          splitCondition: 'ovc',
          splitPercentage: 10,
        });
      });
    });

    describe('invalid URLs and edge cases', () => {
      it('should handle empty string', () => {
        const result = parseNWSIconUrl('');

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid NWS icon URL format:', '');
      });

      it('should handle malformed URL without icons path', () => {
        const url = 'https://api.weather.gov/invalid/path';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid NWS icon URL format:', url);
      });

      it('should handle URL with missing time of day', () => {
        const url = 'https://api.weather.gov/icons/land//skc?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('should handle URL with missing condition', () => {
        const url = 'https://api.weather.gov/icons/land/day/?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('should handle split icon with missing first condition', () => {
        const url = 'https://api.weather.gov/icons/land/day//rain,40?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid split icon format:', url);
      });

      it('should handle split icon with missing second condition', () => {
        const url = 'https://api.weather.gov/icons/land/day/sct,20/?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid split icon format:', url);
      });

      it('should handle split icon with only slash', () => {
        const url = 'https://api.weather.gov/icons/land/day//?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('should handle URL with only comma (no condition)', () => {
        const url = 'https://api.weather.gov/icons/land/day/,50?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid condition format:', url);
      });

      it('should handle non-NWS URL', () => {
        const url = 'https://example.com/weather/sunny';
        const result = parseNWSIconUrl(url);

        expect(result).toEqual({
          nwsCode: 'skc',
          isDaytime: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid NWS icon URL format:', url);
      });
    });

    describe('percentage parsing', () => {
      it('should parse single digit percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/rain,5?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result.percentage).toBe(5);
      });

      it('should parse three digit percentage', () => {
        const url = 'https://api.weather.gov/icons/land/day/rain,100?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result.percentage).toBe(100);
      });

      it('should handle non-numeric percentage gracefully', () => {
        const url = 'https://api.weather.gov/icons/land/day/rain,abc?size=medium';
        const result = parseNWSIconUrl(url);

        expect(result.percentage).toBeNaN();
      });
    });
  });

  describe('extractPrimaryCondition', () => {
    it('should extract condition from single condition URL', () => {
      const url = 'https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium';
      const result = extractPrimaryCondition(url);

      expect(result).toBe('tsra_hi');
    });

    it('should extract second condition from split icon URL', () => {
      const url = 'https://api.weather.gov/icons/land/day/sct,0/rain,40?size=medium';
      const result = extractPrimaryCondition(url);

      expect(result).toBe('rain');
    });

    it('should handle invalid URL', () => {
      const url = 'https://invalid.com/path';
      const result = extractPrimaryCondition(url);

      expect(result).toBe('skc');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should extract condition without percentage', () => {
      const url = 'https://api.weather.gov/icons/land/night/ovc?size=small';
      const result = extractPrimaryCondition(url);

      expect(result).toBe('ovc');
    });
  });

  describe('getFallbackIcon', () => {
    it('should return rainy icon for rain-related codes', () => {
      expect(getFallbackIcon('rain_heavy')).toBe('rainy-2.svg');
      expect(getFallbackIcon('light_rain')).toBe('rainy-2.svg');
      expect(getFallbackIcon('freezing_rain')).toBe('rainy-2.svg');
    });

    it('should return snowy icon for snow-related codes', () => {
      expect(getFallbackIcon('snow_heavy')).toBe('snowy-2.svg');
      expect(getFallbackIcon('light_snow')).toBe('snowy-2.svg');
      expect(getFallbackIcon('blowing_snow')).toBe('snowy-2.svg');
    });

    it('should return thunderstorm icon for thunder-related codes', () => {
      expect(getFallbackIcon('tsra_severe')).toBe('thunderstorms.svg');
      expect(getFallbackIcon('thunderstorm')).toBe('thunderstorms.svg');
    });

    it('should return cloudy icon for wind-related codes', () => {
      expect(getFallbackIcon('wind_gust')).toBe('cloudy-2-day.svg');
      expect(getFallbackIcon('windy')).toBe('cloudy-2-day.svg');
    });

    it('should return fog icon for visibility-related codes', () => {
      expect(getFallbackIcon('fog_dense')).toBe('fog.svg');
      expect(getFallbackIcon('haze_light')).toBe('fog.svg');
      expect(getFallbackIcon('smoke_heavy')).toBe('fog.svg');
    });

    it('should return default partly cloudy icon for unknown codes', () => {
      expect(getFallbackIcon('unknown')).toBe('cloudy-2-day.svg');
      expect(getFallbackIcon('xyz123')).toBe('cloudy-2-day.svg');
      expect(getFallbackIcon('')).toBe('cloudy-2-day.svg');
    });

    it('should handle mixed condition names', () => {
      expect(getFallbackIcon('rain_and_snow')).toBe('rainy-2.svg'); // rain matched first
      expect(getFallbackIcon('thunder_and_wind')).toBe('thunderstorms.svg'); // thunder matched first
    });
  });

  describe('getWeatherIconPath', () => {
    describe('mapped conditions', () => {
      it('should return day icon for daytime sky condition', () => {
        const result = getWeatherIconPath('skc', true);
        expect(result).toBe('/src/assets/weather-icons/animated/clear-day.svg');
      });

      it('should return night icon for nighttime sky condition', () => {
        const result = getWeatherIconPath('skc', false);
        expect(result).toBe('/src/assets/weather-icons/animated/clear-night.svg');
      });

      it('should return day thunderstorm icon', () => {
        const result = getWeatherIconPath('tsra_hi', true);
        expect(result).toBe('/src/assets/weather-icons/animated/isolated-thunderstorms-day.svg');
      });

      it('should return night thunderstorm icon', () => {
        const result = getWeatherIconPath('tsra_hi', false);
        expect(result).toBe('/src/assets/weather-icons/animated/isolated-thunderstorms-night.svg');
      });

      it('should return same icon for day/night when no variant exists', () => {
        const dayResult = getWeatherIconPath('rain', true);
        const nightResult = getWeatherIconPath('rain', false);

        expect(dayResult).toBe('/src/assets/weather-icons/animated/rainy-3.svg');
        expect(nightResult).toBe('/src/assets/weather-icons/animated/rainy-3.svg');
      });

      it('should handle wind variants correctly', () => {
        const result = getWeatherIconPath('wind_skc', true);
        expect(result).toBe('/src/assets/weather-icons/animated/clear-day.svg');
      });

      it('should handle snow conditions', () => {
        const result = getWeatherIconPath('snow', true);
        expect(result).toBe('/src/assets/weather-icons/animated/snowy-3.svg');
      });

      it('should handle severe weather', () => {
        const result = getWeatherIconPath('tornado', true);
        expect(result).toBe('/src/assets/weather-icons/animated/tornado.svg');
      });

      it('should handle visibility conditions', () => {
        const dayResult = getWeatherIconPath('haze', true);
        const nightResult = getWeatherIconPath('haze', false);

        expect(dayResult).toBe('/src/assets/weather-icons/animated/haze-day.svg');
        expect(nightResult).toBe('/src/assets/weather-icons/animated/haze-night.svg');
      });
    });

    describe('unmapped conditions', () => {
      it('should use fallback for unmapped code and log warning', () => {
        const result = getWeatherIconPath('unknown_code', true);

        expect(result).toBe('/src/assets/weather-icons/animated/cloudy-2-day.svg');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'No icon mapping found for NWS code: unknown_code. Using fallback.'
        );
      });

      it('should use rain fallback for unmapped rain code', () => {
        const result = getWeatherIconPath('heavy_rain', true);

        expect(result).toBe('/src/assets/weather-icons/animated/rainy-2.svg');
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('should use snow fallback for unmapped snow code', () => {
        const result = getWeatherIconPath('heavy_snow', false);

        expect(result).toBe('/src/assets/weather-icons/animated/snowy-2.svg');
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    describe('static vs animated parameter', () => {
      it('should use animated folder by default', () => {
        const result = getWeatherIconPath('skc', true);
        expect(result).toContain('/animated/');
      });

      it('should use animated folder when animated=true', () => {
        const result = getWeatherIconPath('skc', true, true);
        expect(result).toContain('/animated/');
      });

      it('should use static folder when animated=false', () => {
        const result = getWeatherIconPath('skc', true, false);
        expect(result).toBe('/src/assets/weather-icons/static/clear-day.svg');
        expect(result).toContain('/static/');
      });

      it('should apply animated parameter to fallback icons', () => {
        const result = getWeatherIconPath('unknown', true, false);
        expect(result).toContain('/static/');
      });
    });

    describe('all mapped NWS codes', () => {
      const testCases: Array<[string, boolean, string]> = [
        ['few', true, 'cloudy-1-day.svg'],
        ['few', false, 'cloudy-1-night.svg'],
        ['sct', true, 'cloudy-2-day.svg'],
        ['bkn', true, 'cloudy-3-day.svg'],
        ['ovc', true, 'cloudy.svg'],
        ['rain_showers', true, 'rainy-1-day.svg'],
        ['rain_showers_hi', true, 'rainy-2-day.svg'],
        ['tsra', true, 'thunderstorms.svg'],
        ['tsra_sct', true, 'scattered-thunderstorms-day.svg'],
        ['sleet', true, 'hail.svg'],
        ['fzra', true, 'rain-and-sleet-mix.svg'],
        ['rain_snow', true, 'rain-and-snow-mix.svg'],
        ['fog', true, 'fog.svg'],
        ['dust', true, 'dust.svg'],
        ['smoke', true, 'haze.svg'],
        ['blizzard', true, 'snowy-3.svg'],
        ['hurricane', true, 'hurricane.svg'],
        ['tropical_storm', true, 'tropical-storm.svg'],
        ['hot', true, 'clear-day.svg'],
        ['cold', true, 'frost.svg'],
      ];

      testCases.forEach(([code, isDaytime, expectedIcon]) => {
        it(`should map ${code} (${isDaytime ? 'day' : 'night'}) to ${expectedIcon}`, () => {
          const result = getWeatherIconPath(code, isDaytime);
          expect(result).toContain(expectedIcon);
        });
      });
    });
  });

  describe('getWeatherIconFromUrl', () => {
    it('should parse URL and return correct day icon path', () => {
      const url = 'https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium';
      const result = getWeatherIconFromUrl(url);

      expect(result).toBe('/src/assets/weather-icons/animated/isolated-thunderstorms-day.svg');
    });

    it('should parse URL and return correct night icon path', () => {
      const url = 'https://api.weather.gov/icons/land/night/skc?size=small';
      const result = getWeatherIconFromUrl(url);

      expect(result).toBe('/src/assets/weather-icons/animated/clear-night.svg');
    });

    it('should handle split icon URL correctly', () => {
      const url = 'https://api.weather.gov/icons/land/day/sct/rain,40?size=medium';
      const result = getWeatherIconFromUrl(url);

      expect(result).toBe('/src/assets/weather-icons/animated/rainy-3.svg');
    });

    it('should respect animated parameter', () => {
      const url = 'https://api.weather.gov/icons/land/day/few?size=medium';
      const result = getWeatherIconFromUrl(url, false);

      expect(result).toBe('/src/assets/weather-icons/static/cloudy-1-day.svg');
    });

    it('should handle invalid URL gracefully', () => {
      const url = 'https://invalid.com/path';
      const result = getWeatherIconFromUrl(url);

      expect(result).toBe('/src/assets/weather-icons/animated/clear-day.svg');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should work with various size parameters', () => {
      const urls = [
        'https://api.weather.gov/icons/land/day/rain?size=small',
        'https://api.weather.gov/icons/land/day/rain?size=medium',
        'https://api.weather.gov/icons/land/day/rain?size=large',
      ];

      urls.forEach((url) => {
        const result = getWeatherIconFromUrl(url);
        expect(result).toBe('/src/assets/weather-icons/animated/rainy-3.svg');
      });
    });
  });

  describe('isWindVariant', () => {
    it('should return true for wind variant codes', () => {
      expect(isWindVariant('wind_skc')).toBe(true);
      expect(isWindVariant('wind_few')).toBe(true);
      expect(isWindVariant('wind_sct')).toBe(true);
      expect(isWindVariant('wind_bkn')).toBe(true);
      expect(isWindVariant('wind_ovc')).toBe(true);
    });

    it('should return false for non-wind codes', () => {
      expect(isWindVariant('skc')).toBe(false);
      expect(isWindVariant('rain')).toBe(false);
      expect(isWindVariant('tsra')).toBe(false);
      expect(isWindVariant('snow')).toBe(false);
    });

    it('should return false for codes containing wind but not starting with wind_', () => {
      expect(isWindVariant('windy')).toBe(false);
      expect(isWindVariant('high_wind')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isWindVariant('')).toBe(false);
    });
  });

  describe('getBaseCondition', () => {
    it('should return base condition for wind variants', () => {
      expect(getBaseCondition('wind_skc')).toBe('skc');
      expect(getBaseCondition('wind_few')).toBe('few');
      expect(getBaseCondition('wind_sct')).toBe('sct');
      expect(getBaseCondition('wind_bkn')).toBe('bkn');
      expect(getBaseCondition('wind_ovc')).toBe('ovc');
    });

    it('should return same code for non-wind variants', () => {
      expect(getBaseCondition('skc')).toBe('skc');
      expect(getBaseCondition('rain')).toBe('rain');
      expect(getBaseCondition('tsra')).toBe('tsra');
      expect(getBaseCondition('snow')).toBe('snow');
    });

    it('should return same code for unmapped codes', () => {
      expect(getBaseCondition('unknown')).toBe('unknown');
      expect(getBaseCondition('')).toBe('');
    });
  });

  describe('getAllNWSCodes', () => {
    it('should return all 34 NWS codes', () => {
      const codes = getAllNWSCodes();
      expect(codes).toHaveLength(34);
    });

    it('should include all major condition types', () => {
      const codes = getAllNWSCodes();

      expect(codes).toContain('skc');
      expect(codes).toContain('rain');
      expect(codes).toContain('snow');
      expect(codes).toContain('tsra');
      expect(codes).toContain('fog');
      expect(codes).toContain('tornado');
    });

    it('should include all wind variants', () => {
      const codes = getAllNWSCodes();

      expect(codes).toContain('wind_skc');
      expect(codes).toContain('wind_few');
      expect(codes).toContain('wind_sct');
      expect(codes).toContain('wind_bkn');
      expect(codes).toContain('wind_ovc');
    });

    it('should match keys in NWS_TO_ANIMATED_MAP', () => {
      const codes = getAllNWSCodes();
      const mapKeys = Object.keys(NWS_TO_ANIMATED_MAP);

      expect(codes).toEqual(mapKeys);
    });
  });

  describe('getCodesByCategory', () => {
    it('should return all sky condition codes', () => {
      const codes = getCodesByCategory('sky');

      expect(codes).toHaveLength(5);
      expect(codes).toContain('skc');
      expect(codes).toContain('few');
      expect(codes).toContain('sct');
      expect(codes).toContain('bkn');
      expect(codes).toContain('ovc');
    });

    it('should return all wind codes', () => {
      const codes = getCodesByCategory('wind');

      expect(codes).toHaveLength(5);
      expect(codes).toContain('wind_skc');
      expect(codes).toContain('wind_few');
      expect(codes).toContain('wind_sct');
      expect(codes).toContain('wind_bkn');
      expect(codes).toContain('wind_ovc');
    });

    it('should return all precipitation codes', () => {
      const codes = getCodesByCategory('precipitation');

      expect(codes.length).toBeGreaterThan(10);
      expect(codes).toContain('rain');
      expect(codes).toContain('snow');
      expect(codes).toContain('tsra');
      expect(codes).toContain('sleet');
      expect(codes).toContain('rain_snow');
    });

    it('should return all visibility codes', () => {
      const codes = getCodesByCategory('visibility');

      expect(codes).toHaveLength(4);
      expect(codes).toContain('fog');
      expect(codes).toContain('dust');
      expect(codes).toContain('smoke');
      expect(codes).toContain('haze');
    });

    it('should return all severe weather codes', () => {
      const codes = getCodesByCategory('severe');

      expect(codes).toHaveLength(4);
      expect(codes).toContain('blizzard');
      expect(codes).toContain('tornado');
      expect(codes).toContain('hurricane');
      expect(codes).toContain('tropical_storm');
    });

    it('should return all temperature codes', () => {
      const codes = getCodesByCategory('temperature');

      expect(codes).toHaveLength(2);
      expect(codes).toContain('hot');
      expect(codes).toContain('cold');
    });

    it('should return empty array for non-existent category', () => {
      // TypeScript won't allow this normally, but testing runtime behavior
      const codes = getCodesByCategory('nonexistent' as any);
      expect(codes).toEqual([]);
    });
  });

  describe('NWS_TO_ANIMATED_MAP structure', () => {
    it('should have valid structure for all entries', () => {
      Object.entries(NWS_TO_ANIMATED_MAP).forEach(([code, mapping]) => {
        expect(mapping).toHaveProperty('day');
        expect(mapping).toHaveProperty('night');
        expect(mapping).toHaveProperty('fallback');
        expect(mapping).toHaveProperty('category');

        expect(typeof mapping.day).toBe('string');
        expect(typeof mapping.night).toBe('string');
        expect(typeof mapping.fallback).toBe('string');
        expect(['sky', 'wind', 'precipitation', 'visibility', 'severe', 'temperature']).toContain(
          mapping.category
        );

        // Wind variants should have baseCondition
        if (code.startsWith('wind_')) {
          expect(mapping).toHaveProperty('baseCondition');
          expect(typeof mapping.baseCondition).toBe('string');
        }
      });
    });

    it('should have .svg extension for all icon filenames', () => {
      Object.values(NWS_TO_ANIMATED_MAP).forEach((mapping) => {
        expect(mapping.day).toMatch(/\.svg$/);
        expect(mapping.night).toMatch(/\.svg$/);
        expect(mapping.fallback).toMatch(/\.svg$/);
      });
    });

    it('should have consistent wind variant base conditions', () => {
      expect(NWS_TO_ANIMATED_MAP.wind_skc?.baseCondition).toBe('skc');
      expect(NWS_TO_ANIMATED_MAP.wind_few?.baseCondition).toBe('few');
      expect(NWS_TO_ANIMATED_MAP.wind_sct?.baseCondition).toBe('sct');
      expect(NWS_TO_ANIMATED_MAP.wind_bkn?.baseCondition).toBe('bkn');
      expect(NWS_TO_ANIMATED_MAP.wind_ovc?.baseCondition).toBe('ovc');
    });

    it('should categorize all conditions correctly', () => {
      const categoryCounts = {
        sky: 5,
        wind: 5,
        precipitation: 14, // rain(3) + thunderstorm(3) + snow/ice(3) + mixed(5)
        visibility: 4,
        severe: 4,
        temperature: 2,
      };

      Object.entries(categoryCounts).forEach(([category, expectedCount]) => {
        const codes = getCodesByCategory(category as any);
        expect(codes).toHaveLength(expectedCount);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle URL with multiple slashes in condition', () => {
      const url = 'https://api.weather.gov/icons/land/day/sct//rain?size=medium';
      parseNWSIconUrl(url);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle URL with special characters in condition', () => {
      const url = 'https://api.weather.gov/icons/land/day/rain@#$?size=medium';
      const metadata = parseNWSIconUrl(url);

      expect(metadata.nwsCode).toBe('rain@#$');
    });

    it('should handle very long condition codes', () => {
      const longCode = 'a'.repeat(100);
      const result = getWeatherIconPath(longCode, true);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toContain('cloudy-2-day.svg');
    });

    it('should handle case-sensitive condition codes', () => {
      // NWS codes are lowercase, uppercase should not match
      getWeatherIconPath('SKC', true);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No icon mapping found for NWS code: SKC. Using fallback.'
      );
    });

    it('should handle undefined condition gracefully', () => {
      // These will throw since the functions expect strings, which is expected behavior
      // The functions are typed to require strings, so null/undefined at runtime would be a misuse
      const result = getWeatherIconPath('', true);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toContain('cloudy-2-day.svg');
    });

    it('should handle URLs with extra query parameters', () => {
      const url =
        'https://api.weather.gov/icons/land/day/rain,50?size=medium&extra=param&another=value';
      const result = parseNWSIconUrl(url);

      expect(result).toEqual({
        nwsCode: 'rain',
        isDaytime: true,
        percentage: 50,
      });
    });

    it('should handle URLs without protocol', () => {
      const url = '/icons/land/day/skc?size=medium';
      const result = parseNWSIconUrl(url);

      expect(result).toEqual({
        nwsCode: 'skc',
        isDaytime: true,
        percentage: undefined,
      });
    });
  });

  describe('real-world NWS URL examples', () => {
    const realWorldUrls: Array<[string, IconMetadata]> = [
      [
        'https://api.weather.gov/icons/land/day/skc?size=medium',
        { nwsCode: 'skc', isDaytime: true },
      ],
      [
        'https://api.weather.gov/icons/land/night/few?size=medium',
        { nwsCode: 'few', isDaytime: false },
      ],
      [
        'https://api.weather.gov/icons/land/day/sct,40?size=medium',
        { nwsCode: 'sct', isDaytime: true, percentage: 40 },
      ],
      [
        'https://api.weather.gov/icons/land/day/bkn/rain_showers,60?size=medium',
        {
          nwsCode: 'rain_showers',
          isDaytime: true,
          percentage: 60,
          splitCondition: 'bkn',
          splitPercentage: undefined,
        },
      ],
      [
        'https://api.weather.gov/icons/land/night/ovc,10/tsra,80?size=medium',
        {
          nwsCode: 'tsra',
          isDaytime: false,
          percentage: 80,
          splitCondition: 'ovc',
          splitPercentage: 10,
        },
      ],
      [
        'https://api.weather.gov/icons/land/day/wind_sct,0?size=medium',
        { nwsCode: 'wind_sct', isDaytime: true, percentage: 0 },
      ],
    ];

    realWorldUrls.forEach(([url, expected]) => {
      it(`should correctly parse: ${url}`, () => {
        const result = parseNWSIconUrl(url);
        expect(result).toEqual(expected);
      });
    });
  });
});
