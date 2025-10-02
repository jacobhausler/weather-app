# NWS Weather Icon URL Patterns & Condition Codes Reference

## Overview

This document provides a comprehensive reference for the National Weather Service (NWS) API weather icon system, including all condition codes, URL patterns, and mapping information needed for icon replacement projects.

**Last Updated:** 2025-10-02
**Source:** https://api.weather.gov/icons (Official NWS API)
**Status:** Icons endpoint marked as deprecated but still in active use with no replacement timeline

---

## Icon URL Format

### Standard Format
```
https://api.weather.gov/icons/{set}/{time_of_day}/{condition}?size={size}
```

### Parameters

- **set**: `land` or `marine`
- **time_of_day**: `day` or `night`
- **condition**: Weather condition code (see complete list below)
- **size** (optional query param): `small`, `medium`, `large`

### Examples

```
https://api.weather.gov/icons/land/day/skc?size=medium
https://api.weather.gov/icons/land/night/tsra?size=medium
https://api.weather.gov/icons/land/day/rain_showers_hi?size=medium
```

---

## Split Icon Format (Dual Image)

### Pattern
When weather conditions change during a forecast period, icons can be split:

```
{condition1},{percentage1}/{condition2},{percentage2}
```

### Examples

- `tsra_hi,20/tsra_hi,50` - Thunderstorms with 20% PoP transitioning to 50% PoP
- `sct,0/rain,40` - Scattered clouds (0% precip) transitioning to rain (40% precip)
- `few/tsra,30` - Few clouds transitioning to thunderstorms with 30% PoP

### Split Icon Rendering

The NWS uses `DualImage.php` to render split icons:
```
https://forecast.weather.gov/DualImage.php?i={icon1}&j={icon2}&ip={percent1}&jp={percent2}
```

Example:
```
https://forecast.weather.gov/DualImage.php?i=hi_ntsra&j=hi_ntsra&ip=20&jp=50
```

### Notes on Split Icons

- Represents two 6-hour segments within a 12-hour forecast period
- First part = earlier period, second part = later period
- Percentage indicates probability of precipitation (PoP)
- If no "/" present, weather is constant throughout the period

---

## Complete NWS Icon Code Reference

### Sky Condition Codes

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `skc` | Fair/clear (Sky Clear) | Yes |
| `few` | A few clouds (1-2 oktas) | Yes |
| `sct` | Partly cloudy (Scattered, 3-4 oktas) | Yes |
| `bkn` | Mostly cloudy (Broken, 5-7 oktas) | Yes |
| `ovc` | Overcast (8 oktas) | Yes |

**Okta Scale:** Cloud cover measured in eighths (0/8 = clear, 8/8 = overcast)

---

### Wind Conditions with Sky Cover

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `wind_skc` | Fair/clear and windy | Yes |
| `wind_few` | A few clouds and windy | Yes |
| `wind_sct` | Partly cloudy and windy | Yes |
| `wind_bkn` | Mostly cloudy and windy | Yes |
| `wind_ovc` | Overcast and windy | Yes |

---

### Precipitation Codes

#### Rain

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `rain` | Rain | Yes |
| `rain_showers` | Rain showers (high cloud cover) | Yes |
| `rain_showers_hi` | Rain showers (low cloud cover) | Yes |

#### Thunderstorms

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `tsra` | Thunderstorm (high cloud cover) | Yes |
| `tsra_sct` | Thunderstorm (medium cloud cover) | Yes |
| `tsra_hi` | Thunderstorm (low cloud cover) | Yes |

**Note:** `tsra` = Thunderstorms and Rain (METAR abbreviation)

#### Snow & Ice

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `snow` | Snow | Yes |
| `sleet` | Sleet (ice pellets) | Yes |
| `fzra` | Freezing rain | Yes |

**Note:** `fzra` = Freezing Rain (METAR abbreviation)

#### Mixed Precipitation

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `rain_snow` | Rain/snow mix | Yes |
| `rain_sleet` | Rain/sleet mix | Yes |
| `snow_sleet` | Snow/sleet mix | Yes |
| `rain_fzra` | Rain/freezing rain mix | Yes |
| `snow_fzra` | Freezing rain/snow mix | Yes |

---

### Visibility & Atmospheric Conditions

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `fog` | Fog/mist | Yes |
| `dust` | Dust | Yes |
| `smoke` | Smoke | Yes |
| `haze` | Haze | Yes |

---

### Severe Weather & Hazards

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `blizzard` | Blizzard conditions | Yes |
| `tornado` | Tornado | No |
| `hurricane` | Hurricane conditions | No |
| `tropical_storm` | Tropical storm conditions | No |

---

### Temperature Extremes

| Code | Description | Day/Night Variants |
|------|-------------|-------------------|
| `hot` | Hot | Day only |
| `cold` | Cold | Yes |

---

## Complete Icon Code Summary Table

Total: 37 unique base condition codes

### All Codes Alphabetically

```
blizzard          hot               skc
bkn               hurricane         sleet
cold              ovc               smoke
dust              rain              snow
few               rain_fzra         snow_fzra
fog               rain_showers      snow_sleet
fzra              rain_showers_hi   tornado
haze              rain_sleet        tropical_storm
                  rain_snow         tsra
wind_bkn          sct               tsra_hi
wind_few                            tsra_sct
wind_ovc
wind_sct
wind_skc
```

---

## Icon Code Categories

### By Weather Type

- **Clear/Cloudy:** skc, few, sct, bkn, ovc (5 codes)
- **Windy:** wind_skc, wind_few, wind_sct, wind_bkn, wind_ovc (5 codes)
- **Rain:** rain, rain_showers, rain_showers_hi (3 codes)
- **Thunderstorms:** tsra, tsra_sct, tsra_hi (3 codes)
- **Snow/Ice:** snow, sleet, fzra (3 codes)
- **Mixed Precip:** rain_snow, rain_sleet, snow_sleet, rain_fzra, snow_fzra (5 codes)
- **Visibility:** fog, dust, smoke, haze (4 codes)
- **Severe:** blizzard, tornado, hurricane, tropical_storm (4 codes)
- **Temperature:** hot, cold (2 codes)

---

## Usage in NWS API Responses

### Forecast Response Example

```json
{
  "periods": [
    {
      "number": 1,
      "name": "This Afternoon",
      "startTime": "2025-10-02T14:00:00-05:00",
      "endTime": "2025-10-02T18:00:00-05:00",
      "isDaytime": true,
      "temperature": 75,
      "temperatureUnit": "F",
      "windSpeed": "10 mph",
      "windDirection": "NW",
      "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
      "shortForecast": "Partly Cloudy",
      "detailedForecast": "Partly cloudy, with a high near 75..."
    }
  ]
}
```

### Hourly Forecast Response Example

```json
{
  "periods": [
    {
      "number": 1,
      "startTime": "2025-10-02T14:00:00-05:00",
      "endTime": "2025-10-02T15:00:00-05:00",
      "isDaytime": true,
      "temperature": 73,
      "temperatureUnit": "F",
      "temperatureTrend": null,
      "probabilityOfPrecipitation": {
        "unitCode": "wmoUnit:percent",
        "value": 20
      },
      "dewpoint": {
        "unitCode": "wmoUnit:degC",
        "value": 18
      },
      "relativeHumidity": {
        "unitCode": "wmoUnit:percent",
        "value": 65
      },
      "windSpeed": "10 mph",
      "windDirection": "NW",
      "icon": "https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium",
      "shortForecast": "Slight Chance Rain Showers",
      "detailedForecast": ""
    }
  ]
}
```

---

## Extracting Icon Codes from URLs

### JavaScript/TypeScript Example

```typescript
function extractIconCode(iconUrl: string): {
  set: string;
  timeOfDay: string;
  condition: string;
  percentage?: number;
  isSplit: boolean;
  splitCondition?: string;
  splitPercentage?: number;
} {
  // Example: https://api.weather.gov/icons/land/day/tsra_hi,20?size=medium
  const urlPattern = /\/icons\/([^\/]+)\/([^\/]+)\/([^\?]+)/;
  const match = iconUrl.match(urlPattern);

  if (!match) {
    throw new Error('Invalid icon URL format');
  }

  const [, set, timeOfDay, conditionPart] = match;

  // Check for split icon format
  if (conditionPart.includes('/')) {
    const [first, second] = conditionPart.split('/');
    const [condition1, percent1] = first.split(',');
    const [condition2, percent2] = second.split(',');

    return {
      set,
      timeOfDay,
      condition: condition1,
      percentage: percent1 ? parseInt(percent1) : undefined,
      isSplit: true,
      splitCondition: condition2,
      splitPercentage: percent2 ? parseInt(percent2) : undefined,
    };
  }

  // Single icon format
  const [condition, percentage] = conditionPart.split(',');

  return {
    set,
    timeOfDay,
    condition,
    percentage: percentage ? parseInt(percentage) : undefined,
    isSplit: false,
  };
}
```

---

## Icon Mapping Considerations

### When Replacing NWS Icons

1. **Day/Night Variants Required**
   - Most icons have separate day and night versions
   - Check `isDaytime` property in forecast periods
   - Extract `timeOfDay` from icon URL

2. **Cloud Cover Hierarchy**
   - skc < few < sct < bkn < ovc
   - Use this ordering for fallback logic

3. **Thunderstorm Cloud Cover Variants**
   - `tsra` = high cloud cover (mostly cloudy)
   - `tsra_sct` = medium cloud cover (partly cloudy)
   - `tsra_hi` = low cloud cover (mostly clear with storms)
   - Consider consolidating if icon set doesn't support all variants

4. **Rain Shower Variants**
   - `rain_showers` = high cloud cover
   - `rain_showers_hi` = low cloud cover
   - May map to same icon in simplified sets

5. **Percentage Modifiers**
   - Indicates probability of precipitation
   - Can be used to show intensity variations
   - Range: typically 0-100, commonly in 10% increments (10, 20, 30, etc.)

6. **Split Icons**
   - Represent changing conditions within period
   - Consider showing both icons or creating transition animations
   - Alternative: use dominant/higher percentage condition

---

## Meteorological Context

### METAR Abbreviations

Many NWS icon codes are based on METAR (Meteorological Aerodrome Report) abbreviations:

- **SKC** - Sky Clear
- **FEW** - Few clouds (1-2 oktas coverage)
- **SCT** - Scattered clouds (3-4 oktas coverage)
- **BKN** - Broken clouds (5-7 oktas coverage)
- **OVC** - Overcast (8 oktas coverage)
- **TSRA** - Thunderstorms and Rain
- **FZRA** - Freezing Rain

### Cloud Coverage (Oktas)

Cloud coverage is measured in oktas (eighths of the sky):

- **0 oktas** = Clear sky (SKC)
- **1-2 oktas** = Few clouds (FEW)
- **3-4 oktas** = Scattered clouds (SCT)
- **5-7 oktas** = Broken clouds (BKN)
- **8 oktas** = Overcast (OVC)

---

## API Deprecation Notice

### Current Status (as of 2025-10-02)

The `/icons` endpoints are **marked as deprecated** in the NWS API specification:

- `/icons`
- `/icons/{set}/{timeOfDay}/{first}`
- `/icons/{set}/{timeOfDay}/{first}/{second}`

### Important Notes

1. **Still in Active Use**: Despite deprecation marking, icons are actively used in official NWS applications
2. **No Timeline**: No official timeline for replacement or removal has been announced
3. **No Official Replacement**: API maintainers have indicated a future transition to "more generic values" but details are not yet available
4. **Safe to Use**: The maintainer stated: "It won't officially go away without much ado and a formal replacement"
5. **Monitor Changes**: Watch https://github.com/weather-gov/api for updates

### Recommendation

Continue using the current icon URL system while planning for eventual migration:

1. Abstract icon URL parsing into separate utilities
2. Design icon mapping system to be easily updatable
3. Monitor the weather-gov/api GitHub repository for announcements
4. Consider implementing custom icon solution that doesn't depend on NWS URLs

---

## Testing & Validation

### Icon Availability Check

```bash
# Check if icon endpoint is available
curl -s "https://api.weather.gov/icons" | jq .

# Test specific icon
curl -I "https://api.weather.gov/icons/land/day/skc?size=medium"
```

### Real Forecast Icon Examples

```bash
# Get real icon URLs from a forecast
curl -s "https://api.weather.gov/gridpoints/FWD/78,103/forecast" \
  | jq '.properties.periods[].icon'
```

---

## Additional Resources

### Official Documentation

- **NWS API Documentation:** https://www.weather.gov/documentation/services-web-api
- **Icons Endpoint:** https://api.weather.gov/icons
- **GitHub Discussions:** https://github.com/weather-gov/api/discussions
- **Deprecation Discussion:** https://github.com/weather-gov/api/discussions/557

### Related Pages

- **Forecast Icons Info:** https://www.weather.gov/forecast-icons
- **NDFD Icon/Weather Fields:** https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php

### Code Examples

See existing codebase implementation:
- `/workspaces/weather-app/examples/NWS-API.md` - General NWS API documentation
- Test files with icon URL examples in various components

---

## Quick Reference: Most Common Icons

### Top 10 Most Frequently Used

1. `skc` - Clear sky
2. `few` - Few clouds
3. `sct` - Partly cloudy
4. `bkn` - Mostly cloudy
5. `ovc` - Overcast
6. `rain` - Rain
7. `tsra` - Thunderstorms
8. `snow` - Snow
9. `fog` - Fog
10. `rain_showers` - Rain showers

---

## Version History

- **2025-10-02** - Initial comprehensive documentation created
  - Documented all 37 base condition codes
  - Added split icon format details
  - Included extraction examples
  - Added deprecation status information
  - Provided meteorological context
