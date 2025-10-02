# NWS Icon Documentation Index

This directory contains comprehensive documentation for National Weather Service (NWS) weather icon codes and URL patterns.

## Documentation Files

### 1. NWS_ICON_CODES.md (Primary Reference)
**File:** `/workspaces/weather-app/specs/NWS_ICON_CODES.md`
**Size:** ~14 KB | 492 lines
**Purpose:** Complete technical reference guide

**Contents:**
- Icon URL format and patterns
- Split icon format (dual image) explanation
- Complete list of all 37 NWS icon codes with descriptions
- Code extraction examples (JavaScript/TypeScript)
- Meteorological context (METAR abbreviations, okta scale)
- API deprecation notice and status
- Testing and validation examples
- Usage examples from real API responses

**Use this when:**
- You need detailed technical information
- You're implementing icon parsing logic
- You want to understand the meteorological context
- You need code examples for extraction

---

### 2. NWS_ICON_MAPPING_TABLE.md (Quick Reference)
**File:** `/workspaces/weather-app/specs/NWS_ICON_MAPPING_TABLE.md`
**Size:** ~9 KB | 355 lines
**Purpose:** Quick lookup tables and mapping strategies

**Contents:**
- All 37 icon codes organized by category in table format
- Minimal icon set recommendations (10, 20, 37+ icons)
- Priority levels for icon replacement (Critical, Important, Useful, Rare)
- Fallback mapping strategies
- Icon implementation checklist template
- TypeScript icon mapper example code

**Use this when:**
- You need a quick code lookup
- You're planning an icon set (determining which icons to create)
- You need fallback logic suggestions
- You want ready-to-use mapping strategies

---

### 3. nws-icon-codes.json (Machine-Readable Data)
**File:** `/workspaces/weather-app/specs/nws-icon-codes.json`
**Size:** ~14 KB
**Format:** JSON
**Purpose:** Programmatic access to icon metadata

**Contents:**
- Complete icon definitions with metadata
- Category classifications
- Priority levels
- Commonality ratings (very-common, common, uncommon, rare)
- Day/night variant flags
- METAR abbreviation mappings
- URL pattern specifications
- Split icon format specifications

**Use this when:**
- You need to programmatically access icon data
- You're building automated icon mapping tools
- You want to filter icons by category or priority
- You need structured data for icon libraries

**Example usage:**
```typescript
import iconData from './specs/nws-icon-codes.json';

// Get all priority 1 (critical) icons
const criticalIcons = Object.values(iconData.icons)
  .filter(icon => icon.priority === 1);

// Get all icons in the precipitation category
const precipIcons = iconData.categories.precipitation.codes
  .map(code => iconData.icons[code]);
```

---

## Quick Facts

### Total Icon Codes
- **37 unique base condition codes**
- **35 codes** with day/night variants = 70 icons
- **2 codes** without variants (tornado, hurricane)
- **Grand total: 72 individual icons** needed for complete coverage

### Icon Categories

1. **Sky Conditions** (5 codes): skc, few, sct, bkn, ovc
2. **Windy Conditions** (5 codes): wind_skc, wind_few, wind_sct, wind_bkn, wind_ovc
3. **Rain** (3 codes): rain, rain_showers, rain_showers_hi
4. **Thunderstorms** (3 codes): tsra, tsra_sct, tsra_hi
5. **Snow & Ice** (3 codes): snow, sleet, fzra
6. **Mixed Precipitation** (5 codes): rain_snow, rain_sleet, snow_sleet, rain_fzra, snow_fzra
7. **Visibility** (4 codes): fog, dust, smoke, haze
8. **Severe Weather** (4 codes): blizzard, tornado, hurricane, tropical_storm
9. **Temperature Extremes** (2 codes): hot, cold

### URL Format

```
https://api.weather.gov/icons/{set}/{timeOfDay}/{condition}?size={size}
```

**Parameters:**
- `set`: land | marine
- `timeOfDay`: day | night
- `condition`: Icon code (with optional `,percentage` or split format)
- `size`: small | medium | large (query parameter)

### Split Icon Format

```
{condition1},{percentage1}/{condition2},{percentage2}
```

Represents two 6-hour segments within a 12-hour forecast period.

**Example:** `tsra_hi,20/tsra_hi,50`
- First 6 hours: Thunderstorms with 20% probability
- Second 6 hours: Thunderstorms with 50% probability

---

## Implementation Priorities

### Priority 1: Critical (8 codes)
Required for basic functionality:
```
skc, few, sct, bkn, ovc, rain, tsra, snow
```

### Priority 2: Important (12 codes)
Common conditions:
```
wind_skc, wind_few, wind_sct, wind_bkn, wind_ovc
rain_showers, rain_showers_hi, tsra_sct, tsra_hi
fog, sleet, fzra
```

### Priority 3: Useful (9 codes)
Less common but important:
```
rain_snow, rain_sleet, snow_sleet, rain_fzra, snow_fzra
dust, smoke, haze, blizzard
```

### Priority 4: Rare (5 codes)
Special/rare conditions:
```
tornado, hurricane, tropical_storm, hot, cold
```

---

## Recommended Reading Order

### For New Developers
1. Start with **ICON_DOCUMENTATION_INDEX.md** (this file) - overview
2. Read **NWS_ICON_MAPPING_TABLE.md** - quick reference and examples
3. Reference **NWS_ICON_CODES.md** - detailed technical information
4. Use **nws-icon-codes.json** - for programmatic access

### For Icon Design
1. **NWS_ICON_MAPPING_TABLE.md** - see priority levels and minimal sets
2. **nws-icon-codes.json** - filter by priority and category
3. **NWS_ICON_CODES.md** - understand meteorological context

### For Implementation
1. **nws-icon-codes.json** - import data into your codebase
2. **NWS_ICON_CODES.md** - code extraction examples
3. **NWS_ICON_MAPPING_TABLE.md** - fallback strategies

---

## API Status

**Current Status:** Deprecated but Active
**Timeline:** No replacement announced
**Official Statement:** "It won't officially go away without much ado and a formal replacement"

### Recommendation
Continue using the current icon URL system while planning for eventual migration:
- Abstract icon URL parsing into separate utilities
- Design icon mapping system to be easily updatable
- Monitor https://github.com/weather-gov/api for announcements

---

## Related Documentation

### In This Repository
- `/workspaces/weather-app/examples/NWS-API.md` - General NWS API documentation
- `/workspaces/weather-app/CLAUDE.md` - Project overview and architecture

### External Resources
- **NWS API Documentation:** https://www.weather.gov/documentation/services-web-api
- **Icons Endpoint:** https://api.weather.gov/icons
- **GitHub Discussions:** https://github.com/weather-gov/api/discussions
- **Deprecation Discussion:** https://github.com/weather-gov/api/discussions/557
- **Forecast Icons Page:** https://www.weather.gov/forecast-icons

---

## Contributing

If you find additional icon codes or updated information:

1. Update **nws-icon-codes.json** with new data
2. Update **NWS_ICON_CODES.md** with detailed information
3. Update **NWS_ICON_MAPPING_TABLE.md** with quick reference tables
4. Update this index file with new totals/categories

---

## Version History

### Version 1.0.0 (2025-10-02)
- Initial comprehensive documentation created
- 37 icon codes documented from official NWS API
- Complete URL patterns and split icon format documented
- Priority levels and categorization added
- Machine-readable JSON data file created

---

## Summary

This documentation suite provides everything needed to understand, map, and replace NWS weather icons:

- **492 lines** of detailed technical documentation
- **355 lines** of quick reference tables and mapping strategies
- **~450 lines** of structured JSON data
- **37 unique icon codes** fully documented
- **72 individual icons** cataloged (with day/night variants)
- **7 categories** of weather conditions
- **4 priority levels** for implementation planning

All documentation is current as of **October 2, 2025** based on the official NWS API endpoint at https://api.weather.gov/icons.
