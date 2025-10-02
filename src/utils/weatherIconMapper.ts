/**
 * Weather Icon Mapper
 *
 * Maps NWS (National Weather Service) weather icon codes to custom animated weather icons.
 * Handles all 37 NWS condition codes with day/night variants and fallback logic.
 *
 * @module weatherIconMapper
 */

/**
 * Metadata extracted from NWS icon URL
 */
export interface IconMetadata {
  /** NWS condition code (e.g., 'skc', 'rain', 'tsra') */
  nwsCode: string;
  /** Whether this is a daytime icon */
  isDaytime: boolean;
  /** Probability of precipitation percentage (0-100), if present */
  percentage?: number;
  /** For split icons: the second condition code */
  splitCondition?: string;
  /** For split icons: the second condition's percentage */
  splitPercentage?: number;
}

/**
 * Icon mapping configuration for a specific NWS code
 */
export interface IconMapping {
  /** Filename for daytime icon */
  day: string;
  /** Filename for nighttime icon */
  night: string;
  /** Fallback icon filename (used when day/night variant not available) */
  fallback: string;
  /** Weather category for this icon */
  category: 'sky' | 'wind' | 'precipitation' | 'visibility' | 'severe' | 'temperature';
  /** Base condition code (for wind variants) */
  baseCondition?: string;
}

/**
 * Complete NWS to Animated Icon Mapping
 * Maps all 37 NWS condition codes to custom animated SVG filenames
 */
export const NWS_TO_ANIMATED_MAP: Record<string, IconMapping> = {
  // Sky Conditions (5 codes)
  skc: {
    day: 'clear-day.svg',
    night: 'clear-night.svg',
    fallback: 'clear-day.svg',
    category: 'sky',
  },
  few: {
    day: 'cloudy-1-day.svg',
    night: 'cloudy-1-night.svg',
    fallback: 'cloudy-1-day.svg',
    category: 'sky',
  },
  sct: {
    day: 'cloudy-2-day.svg',
    night: 'cloudy-2-night.svg',
    fallback: 'cloudy-2-day.svg',
    category: 'sky',
  },
  bkn: {
    day: 'cloudy-3-day.svg',
    night: 'cloudy-3-night.svg',
    fallback: 'cloudy-3-day.svg',
    category: 'sky',
  },
  ovc: {
    day: 'cloudy.svg',
    night: 'cloudy.svg',
    fallback: 'cloudy.svg',
    category: 'sky',
  },

  // Windy with Sky Conditions (5 codes)
  // Note: These use base condition + potential wind overlay logic
  wind_skc: {
    day: 'clear-day.svg', // Base icon, wind indication should be added via UI
    night: 'clear-night.svg',
    fallback: 'clear-day.svg',
    category: 'wind',
    baseCondition: 'skc',
  },
  wind_few: {
    day: 'cloudy-1-day.svg',
    night: 'cloudy-1-night.svg',
    fallback: 'cloudy-1-day.svg',
    category: 'wind',
    baseCondition: 'few',
  },
  wind_sct: {
    day: 'cloudy-2-day.svg',
    night: 'cloudy-2-night.svg',
    fallback: 'cloudy-2-day.svg',
    category: 'wind',
    baseCondition: 'sct',
  },
  wind_bkn: {
    day: 'cloudy-3-day.svg',
    night: 'cloudy-3-night.svg',
    fallback: 'cloudy-3-day.svg',
    category: 'wind',
    baseCondition: 'bkn',
  },
  wind_ovc: {
    day: 'cloudy.svg',
    night: 'cloudy.svg',
    fallback: 'cloudy.svg',
    category: 'wind',
    baseCondition: 'ovc',
  },

  // Rain (3 codes)
  rain: {
    day: 'rainy-3.svg',
    night: 'rainy-3.svg',
    fallback: 'rainy-3.svg',
    category: 'precipitation',
  },
  rain_showers: {
    day: 'rainy-1-day.svg',
    night: 'rainy-1-night.svg',
    fallback: 'rainy-1.svg',
    category: 'precipitation',
  },
  rain_showers_hi: {
    day: 'rainy-2-day.svg',
    night: 'rainy-2-night.svg',
    fallback: 'rainy-2.svg',
    category: 'precipitation',
  },

  // Thunderstorms (3 codes)
  tsra: {
    day: 'thunderstorms.svg',
    night: 'thunderstorms.svg',
    fallback: 'thunderstorms.svg',
    category: 'precipitation',
  },
  tsra_sct: {
    day: 'scattered-thunderstorms-day.svg',
    night: 'scattered-thunderstorms-night.svg',
    fallback: 'scattered-thunderstorms.svg',
    category: 'precipitation',
  },
  tsra_hi: {
    day: 'isolated-thunderstorms-day.svg',
    night: 'isolated-thunderstorms-night.svg',
    fallback: 'isolated-thunderstorms.svg',
    category: 'precipitation',
  },

  // Snow & Ice (3 codes)
  snow: {
    day: 'snowy-3.svg',
    night: 'snowy-3.svg',
    fallback: 'snowy-3.svg',
    category: 'precipitation',
  },
  sleet: {
    day: 'hail.svg',
    night: 'hail.svg',
    fallback: 'hail.svg',
    category: 'precipitation',
  },
  fzra: {
    day: 'rain-and-sleet-mix.svg',
    night: 'rain-and-sleet-mix.svg',
    fallback: 'rain-and-sleet-mix.svg',
    category: 'precipitation',
  },

  // Mixed Precipitation (5 codes)
  rain_snow: {
    day: 'rain-and-snow-mix.svg',
    night: 'rain-and-snow-mix.svg',
    fallback: 'rain-and-snow-mix.svg',
    category: 'precipitation',
  },
  rain_sleet: {
    day: 'rain-and-sleet-mix.svg',
    night: 'rain-and-sleet-mix.svg',
    fallback: 'rain-and-sleet-mix.svg',
    category: 'precipitation',
  },
  snow_sleet: {
    day: 'snow-and-sleet-mix.svg',
    night: 'snow-and-sleet-mix.svg',
    fallback: 'snow-and-sleet-mix.svg',
    category: 'precipitation',
  },
  rain_fzra: {
    day: 'rain-and-sleet-mix.svg',
    night: 'rain-and-sleet-mix.svg',
    fallback: 'rain-and-sleet-mix.svg',
    category: 'precipitation',
  },
  snow_fzra: {
    day: 'snow-and-sleet-mix.svg',
    night: 'snow-and-sleet-mix.svg',
    fallback: 'snow-and-sleet-mix.svg',
    category: 'precipitation',
  },

  // Visibility & Atmospheric (4 codes)
  fog: {
    day: 'fog.svg',
    night: 'fog.svg',
    fallback: 'fog.svg',
    category: 'visibility',
  },
  dust: {
    day: 'dust.svg',
    night: 'dust.svg',
    fallback: 'dust.svg',
    category: 'visibility',
  },
  smoke: {
    day: 'haze.svg',
    night: 'haze.svg',
    fallback: 'haze.svg',
    category: 'visibility',
  },
  haze: {
    day: 'haze-day.svg',
    night: 'haze-night.svg',
    fallback: 'haze.svg',
    category: 'visibility',
  },

  // Severe Weather (4 codes)
  blizzard: {
    day: 'snowy-3.svg', // Use heavy snow as blizzard representation
    night: 'snowy-3.svg',
    fallback: 'snowy-3.svg',
    category: 'severe',
  },
  tornado: {
    day: 'tornado.svg',
    night: 'tornado.svg',
    fallback: 'tornado.svg',
    category: 'severe',
  },
  hurricane: {
    day: 'hurricane.svg',
    night: 'hurricane.svg',
    fallback: 'hurricane.svg',
    category: 'severe',
  },
  tropical_storm: {
    day: 'tropical-storm.svg',
    night: 'tropical-storm.svg',
    fallback: 'tropical-storm.svg',
    category: 'severe',
  },

  // Temperature Extremes (2 codes)
  hot: {
    day: 'clear-day.svg', // Use clear day as hot representation
    night: 'clear-day.svg', // Hot is typically day-only
    fallback: 'clear-day.svg',
    category: 'temperature',
  },
  cold: {
    day: 'frost.svg',
    night: 'frost.svg',
    fallback: 'frost.svg',
    category: 'temperature',
  },
};

/**
 * Parses an NWS icon URL and extracts metadata
 *
 * @param url - NWS icon URL (e.g., "https://api.weather.gov/icons/land/day/tsra,40?size=medium")
 * @returns Extracted icon metadata
 *
 * @example
 * ```typescript
 * const metadata = parseNWSIconUrl("https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium");
 * // Returns: { nwsCode: 'tsra_hi', isDaytime: true, percentage: 20 }
 * ```
 *
 * @example
 * ```typescript
 * // Split icon example
 * const metadata = parseNWSIconUrl("https://api.weather.gov/icons/land/day/sct,0/rain,40?size=medium");
 * // Returns: { nwsCode: 'rain', isDaytime: true, percentage: 40, splitCondition: 'sct', splitPercentage: 0 }
 * ```
 */
export function parseNWSIconUrl(url: string): IconMetadata {
  // Pattern: /icons/{set}/{time_of_day}/{condition}?size={size}
  const urlPattern = /\/icons\/(?:[^/]+)\/([^/]+)\/([^?]+)/;
  const match = url.match(urlPattern);

  if (!match || !match[1] || !match[2]) {
    console.error('Invalid NWS icon URL format:', url);
    return {
      nwsCode: 'skc',
      isDaytime: true,
    };
  }

  const timeOfDay = match[1];
  const conditionPart = match[2];
  const isDaytime = timeOfDay === 'day';

  // Check for split icon format: condition1[,percentage1]/condition2[,percentage2]
  if (conditionPart.includes('/')) {
    const parts = conditionPart.split('/');
    const first = parts[0];
    const second = parts[1];

    if (!first || !second) {
      console.error('Invalid split icon format:', url);
      return { nwsCode: 'skc', isDaytime: true };
    }

    const [condition1, percent1] = first.split(',');
    const [condition2, percent2] = second.split(',');

    if (!condition1 || !condition2) {
      console.error('Invalid split icon conditions:', url);
      return { nwsCode: 'skc', isDaytime: true };
    }

    // For split icons, use the second condition (later period) as primary
    return {
      nwsCode: condition2,
      isDaytime,
      percentage: percent2 ? parseInt(percent2, 10) : undefined,
      splitCondition: condition1,
      splitPercentage: percent1 ? parseInt(percent1, 10) : undefined,
    };
  }

  // Single condition format: condition[,percentage]
  const parts = conditionPart.split(',');
  const condition = parts[0];
  const percentage = parts[1];

  if (!condition) {
    console.error('Invalid condition format:', url);
    return { nwsCode: 'skc', isDaytime: true };
  }

  return {
    nwsCode: condition,
    isDaytime,
    percentage: percentage ? parseInt(percentage, 10) : undefined,
  };
}

/**
 * Extracts the primary condition code from an NWS icon URL
 * Handles split icons by returning the second (later) condition
 *
 * @param url - NWS icon URL
 * @returns Primary condition code
 *
 * @example
 * ```typescript
 * extractPrimaryCondition("https://api.weather.gov/icons/land/day/sct,0/rain,40");
 * // Returns: "rain"
 * ```
 */
export function extractPrimaryCondition(url: string): string {
  const metadata = parseNWSIconUrl(url);
  return metadata.nwsCode;
}

/**
 * Gets the fallback icon filename for an unmapped NWS code
 * Uses category-based fallbacks for better user experience
 *
 * @param nwsCode - NWS condition code
 * @returns Fallback icon filename
 */
export function getFallbackIcon(nwsCode: string): string {
  // Try to determine category from code patterns
  if (nwsCode.includes('rain')) {
    return 'rainy-2.svg';
  }
  if (nwsCode.includes('snow')) {
    return 'snowy-2.svg';
  }
  if (nwsCode.includes('tsra') || nwsCode.includes('thunder')) {
    return 'thunderstorms.svg';
  }
  if (nwsCode.includes('wind')) {
    return 'cloudy-2-day.svg';
  }
  if (nwsCode.includes('fog') || nwsCode.includes('haze') || nwsCode.includes('smoke')) {
    return 'fog.svg';
  }

  // Ultimate fallback: partly cloudy
  return 'cloudy-2-day.svg';
}

/**
 * Gets the weather icon path for a given NWS code
 *
 * @param nwsCode - NWS condition code (e.g., 'skc', 'rain', 'tsra_hi')
 * @param isDaytime - Whether it's daytime
 * @param animated - Whether to use animated icons (currently only animated icons are supported)
 * @returns Path to the icon file
 *
 * @example
 * ```typescript
 * getWeatherIconPath('tsra_hi', true, true);
 * // Returns: "/src/assets/weather-icons/animated/isolated-thunderstorms-day.svg"
 * ```
 *
 * @example
 * ```typescript
 * getWeatherIconPath('skc', false, true);
 * // Returns: "/src/assets/weather-icons/animated/clear-night.svg"
 * ```
 */
export function getWeatherIconPath(
  nwsCode: string,
  isDaytime: boolean,
  animated = true
): string {
  const baseFolder = animated ? 'animated' : 'static';
  const mapping = NWS_TO_ANIMATED_MAP[nwsCode];

  if (!mapping) {
    console.warn(`No icon mapping found for NWS code: ${nwsCode}. Using fallback.`);
    const fallbackFilename = getFallbackIcon(nwsCode);
    return `/src/assets/weather-icons/${baseFolder}/${fallbackFilename}`;
  }

  // Select appropriate icon based on time of day
  const iconFilename = isDaytime ? mapping.day : mapping.night;

  return `/src/assets/weather-icons/${baseFolder}/${iconFilename}`;
}

/**
 * Gets the weather icon path from a full NWS icon URL
 * Convenience function that combines parsing and path generation
 *
 * @param nwsIconUrl - Full NWS icon URL
 * @param animated - Whether to use animated icons
 * @returns Path to the custom icon file
 *
 * @example
 * ```typescript
 * getWeatherIconFromUrl("https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium");
 * // Returns: "/src/assets/weather-icons/animated/isolated-thunderstorms-day.svg"
 * ```
 */
export function getWeatherIconFromUrl(nwsIconUrl: string, animated = true): string {
  const metadata = parseNWSIconUrl(nwsIconUrl);
  return getWeatherIconPath(metadata.nwsCode, metadata.isDaytime, animated);
}

/**
 * Checks if a wind variant icon should display a wind indicator
 *
 * @param nwsCode - NWS condition code
 * @returns True if this is a wind variant that should show wind indication
 *
 * @example
 * ```typescript
 * isWindVariant('wind_skc'); // Returns: true
 * isWindVariant('skc');      // Returns: false
 * ```
 */
export function isWindVariant(nwsCode: string): boolean {
  return nwsCode.startsWith('wind_');
}

/**
 * Gets the base condition code for wind variants
 *
 * @param nwsCode - NWS condition code (potentially a wind variant)
 * @returns Base condition code (e.g., 'wind_skc' -> 'skc')
 *
 * @example
 * ```typescript
 * getBaseCondition('wind_skc'); // Returns: 'skc'
 * getBaseCondition('skc');      // Returns: 'skc'
 * ```
 */
export function getBaseCondition(nwsCode: string): string {
  const mapping = NWS_TO_ANIMATED_MAP[nwsCode];
  return mapping?.baseCondition || nwsCode;
}

/**
 * Gets all available NWS condition codes
 *
 * @returns Array of all supported NWS condition codes
 */
export function getAllNWSCodes(): string[] {
  return Object.keys(NWS_TO_ANIMATED_MAP);
}

/**
 * Gets all NWS codes for a specific category
 *
 * @param category - Weather category
 * @returns Array of NWS codes in that category
 *
 * @example
 * ```typescript
 * getCodesByCategory('precipitation');
 * // Returns: ['rain', 'rain_showers', 'rain_showers_hi', 'tsra', ...]
 * ```
 */
export function getCodesByCategory(
  category: IconMapping['category']
): string[] {
  return Object.entries(NWS_TO_ANIMATED_MAP)
    .filter(([, mapping]) => mapping.category === category)
    .map(([code]) => code);
}
