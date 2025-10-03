# Weather Icon Component Specification

## Component Information

- **File**: `C:\Users\Jacob\code\weather-app\src\components\WeatherIcon.tsx`
- **Type Definition**: TypeScript interfaces defined in component file
- **Utility Module**: `C:\Users\Jacob\code\weather-app\src\utils\weatherIconMapper.ts`
- **Component Size**: ~82 lines
- **Dependencies**:
  - `react` (useState hook)
  - `@/utils/weatherIconMapper` (getWeatherIconFromUrl function)

## Purpose and Overview

Displays weather icons by converting NWS (National Weather Service) icon URLs to custom animated SVG weather icons. The component handles all icon mapping logic, error states with fallback icons, and provides a consistent interface for rendering weather icons across the application.

The component works in conjunction with the `weatherIconMapper` utility module which provides comprehensive mapping of 37 NWS condition codes to custom animated weather icons with day/night variants.

## Props/API Interface

```typescript
interface WeatherIconProps {
  /** Original NWS icon URL */
  nwsIconUrl: string;
  /** Text description for alt text */
  shortForecast?: string;
  /** Icon size: sm (40px), md (64px), lg (96px) */
  size?: 'sm' | 'md' | 'lg';
  /** Use animated vs static icons (default true) */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

### Prop Details

**Required Props**:
- `nwsIconUrl` (string): Full NWS icon URL from API (e.g., `"https://api.weather.gov/icons/land/day/tsra,40?size=medium"`)

**Optional Props**:
- `shortForecast` (string): Weather description text used for accessibility (alt text and aria-label)
  - Default: Falls back to `"Weather icon"` if not provided
- `size` ('sm' | 'md' | 'lg'): Predefined size options
  - `'sm'`: 40x40 pixels
  - `'md'`: 64x64 pixels (default)
  - `'lg'`: 96x96 pixels
- `animated` (boolean): Whether to use animated SVG icons
  - Default: `true`
  - Note: Static icons not currently implemented; animated icons used regardless
- `className` (string): Additional Tailwind CSS classes to apply to the img element
  - Default: `''`
  - Applied in addition to base classes: `object-contain ${className}`

## Icon Mapping Logic

### NWS URL Structure

NWS icon URLs follow this pattern:
```
https://api.weather.gov/icons/{set}/{time_of_day}/{condition}[,percentage][/{condition2}[,percentage2]]?size={size}
```

**Examples**:
- Single condition: `https://api.weather.gov/icons/land/day/tsra,40?size=medium`
- Split condition: `https://api.weather.gov/icons/land/day/sct,0/rain,40?size=medium`

### URL Parsing

The `parseNWSIconUrl()` function extracts:
1. **Time of day**: `day` or `night` → determines `isDaytime` boolean
2. **Condition code**: Primary weather condition (e.g., `tsra`, `rain`, `skc`)
3. **Percentage**: Optional precipitation probability (0-100)
4. **Split conditions**: For transitioning weather (uses second condition as primary)

**Split Icon Handling**:
- Format: `condition1[,percent1]/condition2[,percent2]`
- The **second condition** (later period) is used as primary
- First condition stored as `splitCondition` (currently not displayed)

### Icon Mapping Categories

The utility supports 37 NWS condition codes across 6 categories:

**1. Sky Conditions (5 codes)**:
- `skc` (Sky Clear): clear-day.svg / clear-night.svg
- `few` (Few Clouds): cloudy-1-day.svg / cloudy-1-night.svg
- `sct` (Scattered Clouds): cloudy-2-day.svg / cloudy-2-night.svg
- `bkn` (Broken Clouds): cloudy-3-day.svg / cloudy-3-night.svg
- `ovc` (Overcast): cloudy.svg (same day/night)

**2. Wind Variants (5 codes)**:
- `wind_skc`, `wind_few`, `wind_sct`, `wind_bkn`, `wind_ovc`
- Use same icons as base sky conditions
- `baseCondition` property stores original condition
- Note: Wind indication should be added via UI, not icon overlay

**3. Rain (3 codes)**:
- `rain` (Steady Rain): rainy-3.svg
- `rain_showers` (Rain Showers): rainy-1-day.svg / rainy-1-night.svg
- `rain_showers_hi` (Isolated Showers): rainy-2-day.svg / rainy-2-night.svg

**4. Thunderstorms (3 codes)**:
- `tsra` (Thunderstorms): thunderstorms.svg
- `tsra_sct` (Scattered Thunderstorms): scattered-thunderstorms-day.svg / scattered-thunderstorms-night.svg
- `tsra_hi` (Isolated Thunderstorms): isolated-thunderstorms-day.svg / isolated-thunderstorms-night.svg

**5. Snow & Ice (3 codes)**:
- `snow` (Snow): snowy-3.svg
- `sleet` (Sleet): hail.svg
- `fzra` (Freezing Rain): rain-and-sleet-mix.svg

**6. Mixed Precipitation (5 codes)**:
- `rain_snow`: rain-and-snow-mix.svg
- `rain_sleet`: rain-and-sleet-mix.svg
- `snow_sleet`: snow-and-sleet-mix.svg
- `rain_fzra`: rain-and-sleet-mix.svg
- `snow_fzra`: snow-and-sleet-mix.svg

**7. Visibility & Atmospheric (4 codes)**:
- `fog`: fog.svg
- `dust`: dust.svg
- `smoke`: haze.svg
- `haze`: haze-day.svg / haze-night.svg

**8. Severe Weather (4 codes)**:
- `blizzard`: snowy-3.svg (uses heavy snow)
- `tornado`: tornado.svg
- `hurricane`: hurricane.svg
- `tropical_storm`: tropical-storm.svg

**9. Temperature Extremes (2 codes)**:
- `hot`: clear-day.svg (hot is typically day-only)
- `cold`: frost.svg

### Icon Path Resolution

1. Parse NWS URL → extract `nwsCode` and `isDaytime`
2. Lookup code in `NWS_TO_ANIMATED_MAP`
3. Select `day` or `night` variant based on `isDaytime`
4. Construct path: `/weather-icons/{animated|static}/{filename}`
5. If code not found, use fallback logic

## Fallback Behavior

### Primary Fallback: Error State

When an icon fails to load:
1. `onError` handler triggered on img element
2. `hasError` state set to `true`
3. Icon path switches to: `/weather-icons/animated/cloudy.svg`
4. Console warning logged: `"Failed to load weather icon: {path}. Falling back to cloudy.svg"`
5. Prevents infinite error loop (only attempts fallback once via `hasError` check)

### Secondary Fallback: Unmapped Codes

When NWS code not in mapping (via `getFallbackIcon()` function):
1. Pattern-based detection attempts to match category:
   - Contains 'rain' → `rainy-2.svg`
   - Contains 'snow' → `snowy-2.svg`
   - Contains 'tsra' or 'thunder' → `thunderstorms.svg`
   - Contains 'wind' → `cloudy-2-day.svg`
   - Contains 'fog', 'haze', or 'smoke' → `fog.svg`
2. Ultimate fallback: `cloudy-2-day.svg` (partly cloudy)
3. Console warning logged: `"No icon mapping found for NWS code: {code}. Using fallback."`

### Invalid URL Fallback

When NWS URL format is invalid (via `parseNWSIconUrl()`):
1. Console error logged: `"Invalid NWS icon URL format: {url}"`
2. Returns metadata: `{ nwsCode: 'skc', isDaytime: true }`
3. Results in clear day icon being displayed

## Error Handling

### Image Load Errors

**Implementation**:
```typescript
const handleError = () => {
  if (!hasError) {
    console.warn(`Failed to load weather icon: ${iconPath}. Falling back to cloudy.svg`)
    setHasError(true)
  }
}
```

**Error Scenarios**:
1. Icon file missing from `/public/weather-icons/animated/`
2. Network error loading icon
3. Corrupted SVG file
4. Invalid file path

**Prevention**:
- `hasError` state prevents infinite fallback loop
- Always falls back to known-good icon (cloudy.svg)
- Lazy loading (`loading="lazy"`) reduces initial load failures

### URL Parsing Errors

**Handled Cases**:
- Missing path segments (no time of day or condition)
- Invalid split icon format (missing slash separator)
- Missing condition codes in split format
- Non-numeric percentage values

**Error Response**:
- Logs detailed console error with URL
- Returns safe default: `{ nwsCode: 'skc', isDaytime: true }`
- Allows component to render (graceful degradation)

## Accessibility

### Implementation

**Alt Text**:
- Uses `shortForecast` prop if provided (e.g., "Partly Cloudy")
- Falls back to generic "Weather icon" if not provided
- Applied via `alt` attribute on img element

**ARIA Label**:
- Uses `shortForecast` value via `aria-label` attribute
- Provides semantic description for screen readers
- Example: `aria-label="Scattered Thunderstorms"`

**Lazy Loading**:
- `loading="lazy"` attribute for performance
- Reduces initial page load time
- Images load as they enter viewport

**Explicit Dimensions**:
- `width` and `height` attributes prevent layout shift
- Improves Cumulative Layout Shift (CLS) score
- Consistent sizing across different network conditions

### Accessibility Best Practices

- Always provide `shortForecast` prop for meaningful alt text
- Icon serves as visual enhancement, not sole information source
- Weather description should also be available as text content
- Dark mode compatible (SVG icons work in both themes)

## Layout and Visual Design

### Size System

**Predefined Sizes**:
```typescript
const sizeMap = {
  sm: 40,  // Small - used in compact layouts
  md: 64,  // Medium (default) - primary use case
  lg: 96,  // Large - emphasis or hero sections
}
```

**Application**:
- Pixel values applied via both `width`/`height` attributes and inline styles
- Ensures consistent sizing across browsers
- `object-contain` class maintains aspect ratio

### Styling

**Base Classes**:
- `object-contain`: Maintains SVG aspect ratio within bounds
- Custom classes appended via `className` prop

**Inline Styles**:
```typescript
style={{
  width: `${pixelSize}px`,
  height: `${pixelSize}px`,
}}
```

**Why Both Attributes and Styles**:
- Attributes for semantic HTML and layout shift prevention
- Inline styles for guaranteed sizing (overrides potential CSS conflicts)

## Data Requirements

### NWS Icon URL Format

**Required**: Full NWS icon URL from API response

**Sources**:
- `/gridpoints/{office}/{gridX},{gridY}/forecast` → `periods[].icon`
- `/gridpoints/{office}/{gridX},{gridY}/forecast/hourly` → `periods[].icon`
- `/stations/{stationId}/observations/latest` → `icon` (may be null)

**Validation**:
- No client-side validation required
- Invalid URLs handled gracefully via fallback logic
- Empty/null URLs should be checked by parent component before rendering

## Usage Examples

### Basic Usage

```tsx
import { WeatherIcon } from '@/components/WeatherIcon';

function ForecastDay({ period }) {
  return (
    <div>
      <WeatherIcon
        nwsIconUrl={period.icon}
        shortForecast={period.shortForecast}
      />
      <p>{period.shortForecast}</p>
    </div>
  );
}
```

### Size Variants

```tsx
// Small icon (40x40) - compact layouts
<WeatherIcon
  nwsIconUrl={iconUrl}
  shortForecast="Sunny"
  size="sm"
/>

// Medium icon (64x64) - default, primary use
<WeatherIcon
  nwsIconUrl={iconUrl}
  shortForecast="Partly Cloudy"
  size="md"
/>

// Large icon (96x96) - hero sections
<WeatherIcon
  nwsIconUrl={iconUrl}
  shortForecast="Thunderstorms"
  size="lg"
/>
```

### With Custom Styling

```tsx
<WeatherIcon
  nwsIconUrl={iconUrl}
  shortForecast="Rain Showers"
  size="md"
  className="rounded-full shadow-lg"
/>
```

### Static Icons (Planned)

```tsx
// Note: Static icons not currently implemented
// Animated icons will be used regardless of this prop
<WeatherIcon
  nwsIconUrl={iconUrl}
  shortForecast="Clear Night"
  animated={false}
/>
```

## Edge Cases

### Current Handling

1. **Missing shortForecast**: Falls back to "Weather icon" for alt text
2. **Invalid NWS URL**: Parses as clear day (skc) icon, logs error
3. **Unmapped NWS code**: Uses pattern-based fallback icon, logs warning
4. **Icon load failure**: Falls back to cloudy.svg, logs warning
5. **Split condition URLs**: Uses second (later) condition as primary
6. **Null/undefined nwsIconUrl**: Will attempt to parse, likely fail gracefully
7. **Very long shortForecast**: No truncation, full text used for alt text
8. **Special characters in URL**: Handled by URL regex pattern matching
9. **Missing percentage in URL**: Optional, not required for mapping

### Not Handled (Parent Responsibility)

1. **Null icon URLs**: Parent should check and not render component
2. **Loading states**: No internal spinner or placeholder
3. **Network timeouts**: Relies on browser default timeout
4. **Icon file deployment**: Icons must exist in `/public/weather-icons/animated/`

## Performance Considerations

### Current Implementation

**Optimizations**:
- `loading="lazy"` attribute for deferred loading
- No unnecessary re-renders (props are primitive values or strings)
- Pure function utilities (no side effects in mapping logic)
- Single state variable (`hasError`) for error handling
- Direct icon path resolution (no async operations)

**SVG Benefits**:
- Small file sizes (typically 2-5 KB per icon)
- Scales without quality loss
- No runtime rendering overhead
- Browser caching friendly

**State Management**:
- Minimal state: only `hasError` boolean
- State only updates on error (rare occurrence)
- No effect hooks or subscriptions

### Optimization Opportunities

**Could Implement**:
- `React.memo()` wrapper if used in large lists
- Preloading critical icons (current conditions, first forecast day)
- Sprite sheet for all icons (single HTTP request)
- WebP fallback for broader browser support

**Not Recommended**:
- Memoizing `getWeatherIconFromUrl()` (already fast, pure function)
- Caching parsed URLs (negligible performance gain)
- Local state for icon path (complicates logic, minimal benefit)

## Weather Icon Utility Module

### Exported Functions

**Primary Functions**:
1. `getWeatherIconFromUrl(nwsIconUrl: string, animated?: boolean): string`
   - Main entry point for component
   - Combines parsing and path resolution
   - Returns: icon file path

2. `parseNWSIconUrl(url: string): IconMetadata`
   - Extracts metadata from NWS URL
   - Returns: `{ nwsCode, isDaytime, percentage?, splitCondition?, splitPercentage? }`

3. `getWeatherIconPath(nwsCode: string, isDaytime: boolean, animated?: boolean): string`
   - Maps code to icon filename
   - Returns: full icon path

**Helper Functions**:
1. `getFallbackIcon(nwsCode: string): string`
   - Pattern-based fallback for unmapped codes
   - Returns: fallback icon filename

2. `isWindVariant(nwsCode: string): boolean`
   - Checks if code is wind variant (starts with 'wind_')
   - Returns: boolean

3. `getBaseCondition(nwsCode: string): string`
   - Extracts base condition from wind variant
   - Example: 'wind_skc' → 'skc'

4. `extractPrimaryCondition(url: string): string`
   - Gets primary condition code from URL
   - Handles split icons (returns second condition)

**Utility Functions**:
1. `getAllNWSCodes(): string[]`
   - Returns array of all 37 supported codes

2. `getCodesByCategory(category: IconMapping['category']): string[]`
   - Filters codes by category
   - Categories: 'sky', 'wind', 'precipitation', 'visibility', 'severe', 'temperature'

### Type Definitions

```typescript
interface IconMetadata {
  nwsCode: string;           // NWS condition code
  isDaytime: boolean;        // Day or night
  percentage?: number;       // Precipitation probability
  splitCondition?: string;   // Second condition in split icons
  splitPercentage?: number;  // Second condition's percentage
}

interface IconMapping {
  day: string;               // Daytime icon filename
  night: string;             // Nighttime icon filename
  fallback: string;          // Fallback icon filename
  category: 'sky' | 'wind' | 'precipitation' | 'visibility' | 'severe' | 'temperature';
  baseCondition?: string;    // For wind variants
}
```

### Mapping Data Structure

```typescript
const NWS_TO_ANIMATED_MAP: Record<string, IconMapping>
```

- 37 condition codes mapped
- Each with day/night/fallback variants
- Categorized for filtering and analysis
- Wind variants include baseCondition reference

## Testing Requirements

### Component Tests

**Required Coverage**:
1. **Rendering**:
   - Renders with valid NWS URL
   - Displays correct icon for day condition
   - Displays correct icon for night condition
   - Applies correct size (sm/md/lg)
   - Applies custom className

2. **Accessibility**:
   - Uses shortForecast for alt text when provided
   - Falls back to "Weather icon" when shortForecast missing
   - Sets aria-label from shortForecast
   - Includes width and height attributes
   - Includes loading="lazy" attribute

3. **Error Handling**:
   - Falls back to cloudy.svg on image load error
   - Logs warning on error
   - Does not trigger infinite error loop
   - Handles invalid NWS URLs gracefully

4. **Size System**:
   - sm renders 40x40 pixels
   - md renders 64x64 pixels (default)
   - lg renders 96x96 pixels
   - Applies both attributes and inline styles

5. **Icon Mapping**:
   - Correctly maps common conditions (skc, rain, tsra)
   - Handles day/night variants
   - Handles split condition URLs
   - Uses fallback for unmapped codes

### Utility Module Tests

**Required Coverage**:
1. **URL Parsing**:
   - Parses single condition URLs
   - Parses split condition URLs
   - Extracts day/night correctly
   - Extracts percentages correctly
   - Handles invalid URL formats

2. **Icon Mapping**:
   - All 37 NWS codes map correctly
   - Day/night variants selected properly
   - Fallback logic works for unmapped codes
   - Wind variants use correct base icons

3. **Helper Functions**:
   - isWindVariant identifies wind codes
   - getBaseCondition extracts base from wind variants
   - getAllNWSCodes returns complete list
   - getCodesByCategory filters correctly

4. **Edge Cases**:
   - Missing URL components
   - Invalid percentages
   - Malformed split conditions
   - Unknown NWS codes

### Integration Tests

**Recommended**:
1. Test with real NWS API responses
2. Verify icons exist in public directory
3. Test lazy loading behavior
4. Verify accessibility with screen readers
5. Test dark mode compatibility

## Future Enhancements

### Planned

1. **Static Icons**: Implement non-animated variant
   - Add static SVG icons to `/public/weather-icons/static/`
   - Update `getWeatherIconPath()` to respect `animated` parameter

2. **Wind Overlay Indicators**: Visual indication for wind variants
   - Add optional wind indicator UI element
   - Detect wind variants via `isWindVariant()`
   - Display wind speed/direction if available

3. **Percentage Display**: Show precipitation probability
   - Extract percentage from parsed metadata
   - Optional prop to display percentage overlay
   - Position badge on icon corner

### Potential

1. **Icon Preloading**: Preload critical icons for faster rendering
2. **SVG Sprite Sheet**: Combine all icons into single request
3. **Animation Control**: Pause/play animation toggle
4. **Custom Icon Themes**: Support different icon sets
5. **Tooltip Integration**: Hover tooltip with condition details

## Related Components

**Used By**:
- `SevenDayForecast.tsx` - Daily forecast icons
- `CurrentConditions.tsx` - Current weather icon
- `HourlyForecast.tsx` - Hourly period icons
- `ForecastDayModal.tsx` - Detailed day forecast icon

**Dependencies**:
- None (standalone component)

**Utility Dependencies**:
- `@/utils/weatherIconMapper` - All icon mapping logic
