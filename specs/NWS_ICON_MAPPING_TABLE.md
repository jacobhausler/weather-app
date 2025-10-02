# NWS Icon Code Mapping Table - Quick Reference

This is a quick reference companion to `NWS_ICON_CODES.md`. Use this for fast lookups when mapping NWS icons to custom icon sets.

---

## Complete Icon Code List (37 Total)

### Format
`code` - Description | Category | Day/Night

---

## Sky Conditions (5 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `skc` | Fair/clear (0 oktas) | Sky | Yes |
| `few` | A few clouds (1-2 oktas) | Sky | Yes |
| `sct` | Partly cloudy (3-4 oktas) | Sky | Yes |
| `bkn` | Mostly cloudy (5-7 oktas) | Sky | Yes |
| `ovc` | Overcast (8 oktas) | Sky | Yes |

---

## Windy with Sky Conditions (5 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `wind_skc` | Fair/clear and windy | Wind + Sky | Yes |
| `wind_few` | A few clouds and windy | Wind + Sky | Yes |
| `wind_sct` | Partly cloudy and windy | Wind + Sky | Yes |
| `wind_bkn` | Mostly cloudy and windy | Wind + Sky | Yes |
| `wind_ovc` | Overcast and windy | Wind + Sky | Yes |

---

## Rain (3 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `rain` | Rain | Precipitation | Yes |
| `rain_showers` | Rain showers (high cloud cover) | Precipitation | Yes |
| `rain_showers_hi` | Rain showers (low cloud cover) | Precipitation | Yes |

---

## Thunderstorms (3 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `tsra` | Thunderstorm (high cloud cover) | Precipitation | Yes |
| `tsra_sct` | Thunderstorm (medium cloud cover) | Precipitation | Yes |
| `tsra_hi` | Thunderstorm (low cloud cover) | Precipitation | Yes |

---

## Snow & Ice (3 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `snow` | Snow | Precipitation | Yes |
| `sleet` | Sleet (ice pellets) | Precipitation | Yes |
| `fzra` | Freezing rain | Precipitation | Yes |

---

## Mixed Precipitation (5 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `rain_snow` | Rain/snow mix | Precipitation | Yes |
| `rain_sleet` | Rain/sleet mix | Precipitation | Yes |
| `snow_sleet` | Snow/sleet mix | Precipitation | Yes |
| `rain_fzra` | Rain/freezing rain mix | Precipitation | Yes |
| `snow_fzra` | Freezing rain/snow mix | Precipitation | Yes |

---

## Visibility & Atmospheric (4 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `fog` | Fog/mist | Visibility | Yes |
| `dust` | Dust | Visibility | Yes |
| `smoke` | Smoke | Visibility | Yes |
| `haze` | Haze | Visibility | Yes |

---

## Severe Weather (4 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `blizzard` | Blizzard conditions | Severe | Yes |
| `tornado` | Tornado | Severe | No |
| `hurricane` | Hurricane conditions | Severe | No |
| `tropical_storm` | Tropical storm conditions | Severe | No |

---

## Temperature Extremes (2 codes)

| Code | Description | Category | Day/Night Variants |
|------|-------------|----------|--------------------|
| `hot` | Hot | Temperature | Day only |
| `cold` | Cold | Temperature | Yes |

---

## Icon Mapping Suggestions

### Minimal Icon Set (10 icons)

If you need to create a minimal icon set, prioritize these 10 most common conditions:

1. **clear** ← `skc`
2. **few-clouds** ← `few`
3. **partly-cloudy** ← `sct`
4. **mostly-cloudy** ← `bkn`
5. **overcast** ← `ovc`
6. **rain** ← `rain`, `rain_showers`, `rain_showers_hi`
7. **thunderstorm** ← `tsra`, `tsra_sct`, `tsra_hi`
8. **snow** ← `snow`
9. **fog** ← `fog`
10. **windy** ← all `wind_*` variants

### Recommended Icon Set (20 icons)

For better weather representation, include these additional icons:

11. **rain-snow-mix** ← `rain_snow`
12. **sleet** ← `sleet`, `rain_sleet`, `snow_sleet`
13. **freezing-rain** ← `fzra`, `rain_fzra`, `snow_fzra`
14. **dust** ← `dust`
15. **smoke** ← `smoke`
16. **haze** ← `haze`
17. **blizzard** ← `blizzard`
18. **tornado** ← `tornado`
19. **hurricane** ← `hurricane`, `tropical_storm`
20. **hot/cold** ← `hot`, `cold`

### Comprehensive Icon Set (37+ icons)

For complete coverage, create individual icons for each code plus day/night variants where applicable.

**Total icons needed:**
- 35 codes with day/night variants = 70 icons
- 2 codes without day/night variants = 2 icons
- **Grand total: 72 icons**

---

## Priority Levels for Icon Replacement

### Priority 1 - Critical (Required for basic functionality)

```
skc, few, sct, bkn, ovc
rain, tsra
snow
```

### Priority 2 - Important (Common conditions)

```
wind_skc, wind_few, wind_sct, wind_bkn, wind_ovc
rain_showers, rain_showers_hi
tsra_sct, tsra_hi
fog, sleet, fzra
```

### Priority 3 - Useful (Less common but important)

```
rain_snow, rain_sleet, snow_sleet
rain_fzra, snow_fzra
dust, smoke, haze
blizzard
```

### Priority 4 - Rare (Severe/special conditions)

```
tornado, hurricane, tropical_storm
hot, cold
```

---

## Fallback Mapping Strategy

When a specific icon variant isn't available, use these fallbacks:

### Cloud Cover Variants

```
tsra → tsra_sct → tsra_hi → tsra (default thunderstorm)
rain_showers → rain_showers_hi → rain (default rain)
```

### Mixed Precipitation

```
rain_snow → rain or snow (choose by temperature)
rain_sleet → rain or sleet
snow_sleet → snow or sleet
rain_fzra → rain or fzra
snow_fzra → snow or fzra
```

### Wind Conditions

```
wind_skc → skc + wind indicator
wind_few → few + wind indicator
wind_sct → sct + wind indicator
wind_bkn → bkn + wind indicator
wind_ovc → ovc + wind indicator
```

### Severe Weather

```
tornado → severe weather icon
hurricane → tropical_storm → severe weather icon
```

---

## Common Pattern Recognition

### URL Pattern Examples

```
Clear day:
https://api.weather.gov/icons/land/day/skc?size=medium

Partly cloudy night:
https://api.weather.gov/icons/land/night/sct?size=medium

Thunderstorms with 40% chance:
https://api.weather.gov/icons/land/day/tsra,40?size=medium

Split forecast (changing conditions):
https://api.weather.gov/icons/land/day/sct,0/rain,40?size=medium
```

### Extraction Pattern

```typescript
// Regular expression to parse icon URL
const iconPattern = /\/icons\/(?<set>\w+)\/(?<time>day|night)\/(?<condition>[^?]+)/;

// Split condition pattern
const splitPattern = /^(?<cond1>\w+)(?:,(?<pct1>\d+))?\/(?<cond2>\w+)(?:,(?<pct2>\d+))?$/;

// Single condition with percentage
const singlePattern = /^(?<cond>\w+)(?:,(?<pct>\d+))?$/;
```

---

## Icon Checklist Template

Use this checklist when implementing a custom icon set:

### Basic Icons (10)
- [ ] clear (day)
- [ ] clear (night)
- [ ] few clouds (day)
- [ ] few clouds (night)
- [ ] partly cloudy (day)
- [ ] partly cloudy (night)
- [ ] mostly cloudy (day)
- [ ] mostly cloudy (night)
- [ ] overcast (day)
- [ ] overcast (night)
- [ ] rain (day)
- [ ] rain (night)
- [ ] thunderstorm (day)
- [ ] thunderstorm (night)
- [ ] snow (day)
- [ ] snow (night)
- [ ] fog (day)
- [ ] fog (night)
- [ ] windy (day)
- [ ] windy (night)

### Extended Icons (20+)
- [ ] rain showers (day/night variants)
- [ ] thunderstorm variants (high/medium/low cloud cover)
- [ ] sleet (day/night)
- [ ] freezing rain (day/night)
- [ ] mixed precipitation (all types)
- [ ] dust (day/night)
- [ ] smoke (day/night)
- [ ] haze (day/night)
- [ ] blizzard (day/night)
- [ ] tornado
- [ ] hurricane/tropical storm
- [ ] hot (day)
- [ ] cold (day/night)

---

## Usage Examples

### TypeScript Icon Mapper

```typescript
type IconCode = 'skc' | 'few' | 'sct' | 'bkn' | 'ovc' | 'rain' | 'tsra' | 'snow' /* ... */;

interface IconMapping {
  code: IconCode;
  dayIcon: string;
  nightIcon: string;
  category: 'sky' | 'precipitation' | 'visibility' | 'severe' | 'temperature';
  fallback?: IconCode;
}

const iconMap: Record<IconCode, IconMapping> = {
  skc: {
    code: 'skc',
    dayIcon: 'clear-day.svg',
    nightIcon: 'clear-night.svg',
    category: 'sky',
  },
  few: {
    code: 'few',
    dayIcon: 'few-clouds-day.svg',
    nightIcon: 'few-clouds-night.svg',
    category: 'sky',
  },
  // ... continue for all 37 codes
};

function getCustomIcon(nwsCode: string, isDaytime: boolean): string {
  const mapping = iconMap[nwsCode as IconCode];
  if (!mapping) {
    // Fallback to default icon
    return isDaytime ? 'default-day.svg' : 'default-night.svg';
  }
  return isDaytime ? mapping.dayIcon : mapping.nightIcon;
}
```

---

## References

- **Complete Documentation:** See `NWS_ICON_CODES.md` for full details
- **NWS API:** https://api.weather.gov/icons
- **Icon List:** https://api.weather.gov/icons (JSON endpoint)
- **GitHub Discussions:** https://github.com/weather-gov/api/discussions/557
