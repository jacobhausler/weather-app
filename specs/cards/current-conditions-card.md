# Current Conditions + Daily Forecast Card Component Specification

## Purpose and Overview

Displays current weather conditions from the nearest observation station alongside today's and tonight's forecast. Uses a two-column grid layout with weather detail items to organize multiple data points including temperature, feels like, humidity, dewpoint, wind details, visibility, cloud cover, UV index, sunrise/sunset times, and detailed forecast text.

## Props/API Interface

```typescript
interface CurrentConditionsProps {
  observation?: Observation;
  todayForecast?: ForecastPeriod;
  tonightForecast?: ForecastPeriod;
  uvIndex?: UVIndex | null;
  sunTimes?: SunTimes;
}

interface Observation {
  timestamp: string;
  temperature: {
    value: number | null;    // Celsius
    unitCode: string;
  };
  dewpoint: {
    value: number | null;    // Celsius
    unitCode: string;
  };
  windDirection: {
    value: number | null;    // Degrees (0-360)
  };
  windSpeed: {
    value: number | null;    // Meters per second
    unitCode: string;
  };
  windGust: {
    value: number | null;    // Meters per second
    unitCode: string;
  };
  visibility: {
    value: number | null;    // Meters
    unitCode: string;
  };
  relativeHumidity: {
    value: number | null;    // Percentage (0-100)
  };
  heatIndex: {
    value: number | null;    // Celsius
    unitCode: string;
  };
  windChill: {
    value: number | null;    // Celsius
    unitCode: string;
  };
  cloudLayers?: Array<{
    base: {
      value: number | null;
      unitCode: string;
    };
    amount: string;          // e.g., "CLR", "SCT", "BKN", "OVC"
  }>;
}

interface ForecastPeriod {
  number: number;
  name: string;              // e.g., "Today", "Tonight"
  startTime: string;         // ISO 8601
  endTime: string;           // ISO 8601
  isDaytime: boolean;
  temperature: number;       // Fahrenheit (from NWS forecast)
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  icon: string;              // NWS icon URL
  shortForecast: string;     // e.g., "Partly Cloudy"
  detailedForecast: string;
}

interface UVIndex {
  value: number;             // 0-11+
  timestamp: string;         // ISO 8601
  latitude: number;
  longitude: number;
}

interface SunTimes {
  sunrise: string;           // ISO 8601
  sunset: string;            // ISO 8601
  solarNoon: string;         // ISO 8601
  civilDawn: string;         // ISO 8601
  civilDusk: string;         // ISO 8601
}
```

## Layout and Visual Design

### Grid Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Current Conditions                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Forecast                                           │   │
│  │  Partly cloudy with a high near 85. Northwest       │   │
│  │  wind around 10 mph...                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────┐  │
│  │  Current Weather             │  │  Weather Details   │  │
│  │                              │  │  (2-column grid)   │  │
│  │  [Icon]    82°F              │  │                    │  │
│  │  Partly Cloudy               │  │  ┌──────┬──────┐  │  │
│  │  Feels like: 84°F            │  │  │ Dew  │ Humid│  │  │
│  │                              │  │  ├──────┼──────┤  │  │
│  │  High: 85°F   Low: 65°F      │  │  │ Wind │ Gusts│  │  │
│  │                              │  │  ├──────┼──────┤  │  │
│  └──────────────────────────────┘  │  │ Vis  │ Cloud│  │  │
│                                     │  ├──────┼──────┤  │  │
│                                     │  │  Sunrise/    │  │  │
│                                     │  │   Sunset     │  │  │
│                                     │  └──────────────┘  │  │
│                                     └────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Icon] Tonight                                     │   │
│  │  Mostly clear - 65°F                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Card Hierarchy

**Level 1**: Main card container with header "Current Conditions"
- **Level 2**: Detailed forecast section (full-width, muted background, appears first)
- **Level 3**: Two-column responsive grid (`md:grid-cols-2`)
  1. Left column: Current weather display (icon, temperature, feels like, high/low)
  2. Right column: Weather detail items in 2-column grid
- **Level 4**: Tonight's forecast section (full-width, bordered card)

### Styling Guidelines
- Card uses shadcn/ui Card, CardHeader, CardTitle, and CardContent components
- Two-column responsive grid layout (`gap-6 md:grid-cols-2`)
- Weather detail items in bordered containers (`rounded-lg border p-3`)
- Visual hierarchy through font sizes: 5xl for temperature, sm for details
- Lucide React icons for visual reinforcement
- Color coding for UV index (text colors in light/dark mode)
- Muted foreground colors for secondary information
- Responsive grid that stacks on mobile

### Data Presentation

**Temperature Display**:
- Primary: `text-5xl font-bold` (82°F)
- Feels Like: `text-sm text-muted-foreground` only shown if different from current
- High/Low: `text-sm` with labels, shown together in flex layout

**Weather Detail Items**:
Each detail uses `WeatherDetailItem` component with:
- Icon (16x16 from Lucide React)
- Label (text-xs, muted)
- Value (text-sm, font-medium)
- Bordered card container

**Humidity Display**:
- Values are rounded to whole percent using `Math.round()` (e.g., 67% instead of 67.3%)

**Wind Display**:
- Combines direction and speed: "NW 10 mph"
- Gusts shown in separate item only if value > 0
- Direction converted from degrees to cardinal (16-point compass)

**UV Index**:
- Numeric value with one decimal place and descriptive label
- Color-coded text (not background):
  - 0-2: Low (green-600/400)
  - 3-5: Moderate (yellow-600/400)
  - 6-7: High (orange-600/400)
  - 8-10: Very High (red-600/400)
  - 11+: Extreme (purple-600/400)

## Data Requirements

### Data Sources

**Current Conditions (Observation)**:
- Provided by parent component from NWS `/stations/{stationId}/observations/latest`
- All values in metric units (Celsius, m/s, meters)
- All fields are nullable

**Today's and Tonight's Forecast**:
- Provided by parent component from NWS `/gridpoints/{office}/{gridX},{gridY}/forecast`
- First two periods: today (daytime) and tonight
- Temperature in Fahrenheit (as provided by NWS)

**UV Index**:
- Optional external data source (e.g., OpenWeatherMap API)
- Requires separate API integration
- May be null if not available

**Sunrise/Sunset (SunTimes)**:
- Calculated using SunCalc library from coordinates
- Or fetched from sunrise-sunset.org API
- Cached server-side for 24 hours

### Data Transformation and Unit Conversion

Component uses Zustand store (`useUnitStore`) for unit system preferences:
- Stores user preference: `imperial` or `metric`
- Persisted in localStorage as `unit-storage`

**Conversion Functions** (from `/src/stores/unitStore.ts`):

1. **Temperature Conversion**:
   ```typescript
   convertTemp(celsius: number, toSystem: UnitSystem): number
   // Imperial: (C × 9/5) + 32
   // Metric: unchanged (Celsius)
   ```

2. **Wind Speed Conversion**:
   ```typescript
   convertSpeed(metersPerSecond: number, toSystem: UnitSystem): number
   // Imperial: m/s × 2.237 (to mph)
   // Metric: m/s × 3.6 (to km/h)
   ```

3. **Distance/Visibility Conversion**:
   ```typescript
   convertDistance(meters: number, toSystem: UnitSystem): number
   // Imperial: meters × 0.000621371 (to miles)
   // Metric: meters / 1000 (to kilometers)
   ```

4. **Unit Label Functions**:
   ```typescript
   getTempUnit(system): string    // "°F" or "°C"
   getSpeedUnit(system): string   // "mph" or "km/h"
   getDistanceUnit(system): string // "mi" or "km"
   ```

**Feels Like Calculation**:
Component calculates feels-like temperature using:
```typescript
getFeelsLike(temp, heatIndex, windChill):
  if heatIndex > temp: return heatIndex
  if windChill < temp: return windChill
  return temp
```

**Wind Direction Conversion**:
Degrees (0-360) converted to 16-point compass:
```typescript
getWindDirection(degrees): string
// Returns: N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW
```

**Cloud Cover Display**:
- Uses first cloud layer's `amount` field
- Values: "CLR" (clear), "SCT" (scattered), "BKN" (broken), "OVC" (overcast)
- Displays as-is or "N/A" if not available

### Missing Data Handling
- All observation fields are nullable; component checks before display
- Shows "N/A" for missing values
- Feels like only shown if different from current temperature
- Wind gusts only shown if value > 0
- UV index and sun times conditionally rendered if provided
- Component returns null if both observation and forecast are missing

## User Interactions

### Current Implementation
- **Static Display**: Component is informational only, no interactive elements
- **Unit System**: User changes units via global toggle (persisted in Zustand store)
- **Automatic Updates**: Parent component handles data refresh cycle

### No Hover States or Tooltips
- Current implementation does not include hover effects
- No tooltips implemented
- Weather detail items are static bordered containers

### Future Enhancement Opportunities
- Add tooltips for additional context:
  - Feels Like: Explain heat index or wind chill calculation
  - UV Index: Provide sun safety recommendations
  - Dewpoint: Explain comfort levels
- Interactive unit toggle per data point (instead of global)
- Click-to-expand detailed information

## Responsive Behavior

### Implementation
Uses Tailwind CSS responsive classes with mobile-first design:

**Mobile (<768px)**:
- Single column layout (no grid)
- Current weather and detail items stack vertically
- Weather detail items grid maintains 2 columns (`grid-cols-2`)
- Full-width forecast and tonight sections

**Desktop (≥768px)**:
- Two-column layout activated: `md:grid-cols-2`
- Left: Current weather with icon and temperature
- Right: Weather detail items in 2-column grid
- Full-width forecast and tonight sections below

### Specific Breakpoints
- `gap-6`: 1.5rem gap between grid columns
- `md:grid-cols-2`: Two columns at 768px and above
- Weather detail items: Always 2-column grid (`grid-cols-2`)
- Text sizes and spacing automatically adjust with Tailwind utilities

## Accessibility Considerations

### Semantic HTML Structure
```html
<Card>
  <CardHeader>
    <CardTitle>Current Conditions</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Main grid layout -->
  </CardContent>
</Card>
```

### Current Implementation
- Uses semantic HTML5 elements via shadcn/ui Card components
- Weather icons have `alt` attribute with `shortForecast` text
- Text content includes labels and values clearly
- No ARIA labels currently implemented
- No keyboard navigation (static display)

### Accessibility Features
1. **Alt Text**: Weather forecast icons include descriptive alt text
2. **Text Labels**: Each weather detail has visible label (Dewpoint, Humidity, etc.)
3. **Color + Text**: UV index uses color coding plus text label ("7 (High)")
4. **Logical Reading Order**: Content flows naturally top-to-bottom, left-to-right
5. **Units Included**: All values include units in display ("82°F", "10 mph")

### Screen Reader Experience
- Reads "Current Conditions" heading first
- Detailed forecast text (appears first in content)
- Current temperature and conditions with icon alt text
- Feels like temperature (if shown)
- High/low temperatures with labels
- Weather details in grid order: Dewpoint, Humidity, Wind, Gusts, Visibility, Cloud Cover, Sunrise/Sunset (combined)
- Tonight's forecast with icon alt text

### Color Contrast
- Uses Tailwind's muted foreground colors for secondary text
- UV index colors tested for sufficient contrast in both themes:
  - Light mode: 600-level colors
  - Dark mode: 400-level colors
- Border colors adapt to light/dark theme

### Improvements for Future
- Add `aria-label` to main card section
- Add `role="region"` for landmark navigation
- Consider `aria-live="polite"` for automatic data updates
- Add descriptive labels for screen readers on detail items
- Implement keyboard navigation if interactive features added

## Loading States

### Current Implementation
Component does not manage loading states internally. Instead:
- Returns `null` if both `observation` and `todayForecast` are missing
- Parent component handles loading states before passing data
- No skeleton screens within this component

### Data Availability Handling
1. **No Data**: Component returns `null` (not rendered)
2. **Partial Data**: Component gracefully handles missing fields:
   - Shows "N/A" for missing observation values
   - Conditionally renders sections based on prop availability
   - UV index and sun times only shown if provided
   - Wind gusts only shown if value > 0

### Error States
- No error UI within component
- Parent component should handle API errors
- Component focuses solely on data display when available

## Example Usage

```tsx
import { CurrentConditions } from '@/components/CurrentConditions';
import { WeatherData } from '@/types/weather';

function WeatherDashboard({ weatherData }: { weatherData: WeatherData }) {
  const todayPeriod = weatherData.forecast.find(p => p.isDaytime);
  const tonightPeriod = weatherData.forecast.find(p => !p.isDaytime);

  return (
    <CurrentConditions
      observation={weatherData.currentObservation}
      todayForecast={todayPeriod}
      tonightForecast={tonightPeriod}
      uvIndex={weatherData.uvIndex}
      sunTimes={weatherData.sunTimes}
    />
  );
}
```

### Component Structure
```
CurrentConditions (Main Component)
├── Card (shadcn/ui)
│   ├── CardHeader
│   │   └── CardTitle: "Current Conditions"
│   └── CardContent
│       ├── Forecast section (muted background, appears first)
│       ├── Grid (2 columns on desktop)
│       │   ├── Left: Current weather display
│       │   └── Right: Weather details grid
│       └── Tonight section (bordered)

## Edge Cases

### Handled in Current Implementation

1. **Missing Observation Data**:
   - All observation fields checked for null
   - Displays "N/A" for missing values
   - Component gracefully handles partial data

2. **No Wind Gusts**:
   - Only renders gust item if `windGust.value > 0`
   - Conditionally rendered, not just hidden

3. **Null Wind Direction**:
   - Returns "N/A" if `windDirection.value` is null
   - No errors from undefined degrees

4. **Missing Forecasts**:
   - Component returns null if both observation and forecast missing
   - Tonight forecast section conditionally rendered
   - High/low only shown if both forecasts present

5. **Feels Like Same as Temperature**:
   - Only displays feels-like if different from current temp
   - Prevents redundant information

6. **Optional UV Index**:
   - Only renders UV index item if provided
   - Handles `undefined`, `null`, or missing values

7. **Optional Sun Times**:
   - Sunrise/sunset only shown if `sunTimes` prop provided
   - Combined into a single detail item showing both sunrise and sunset times

8. **Cloud Cover Variations**:
   - Uses first cloud layer's amount
   - Falls back to "N/A" if no cloud layers
   - Displays textual values (CLR, SCT, BKN, OVC) as-is

9. **Unit Conversion**:
   - All conversions use Zustand store's unit system
   - Consistent throughout component
   - Automatically updates when user changes preference

### Not Currently Handled

1. **Stale Data Indication**: No timestamp or age display
2. **Extreme Value Warnings**: No special styling for dangerous conditions
3. **Variable Wind Detection**: No special handling for low wind speeds
4. **Nighttime UV Filtering**: UV shown if provided, regardless of time
5. **Zero Visibility Formatting**: Displays exact converted value

## Performance Considerations

### Current Implementation
- **Pure Presentation Component**: No side effects or state management
- **Zustand Store Hook**: `useUnitStore()` hook used once per render
- **Inline Calculations**: Helper functions called inline (not memoized)
- **Conditional Rendering**: Sections conditionally rendered to avoid unnecessary DOM

### Performance Characteristics
- Lightweight component (~320 lines)
- No expensive computations
- Simple data transformations
- No network calls
- Re-renders when parent data or unit system changes

### Optimization Opportunities
- Memoize `WeatherDetailItem` and `UVIndexItem` with `React.memo`
- Memoize helper functions (`getWindDirection`, `getFeelsLike`, etc.)
- Consider `useMemo` for converted values if parent re-renders frequently
- Extract time formatting to separate utility

## Testing Requirements

### Unit Tests Needed
1. **Rendering with complete data**:
   - All observation fields present
   - Both forecast periods present
   - UV index and sun times provided

2. **Rendering with missing data**:
   - No observation (forecast only)
   - No forecast (observation only)
   - Missing optional fields (gusts, UV, sun times)
   - Null values in observation fields

3. **Unit conversion**:
   - Imperial system values
   - Metric system values
   - Verify correct unit labels displayed

4. **Edge cases**:
   - Feels-like same as temperature (not shown)
   - Wind gusts = 0 (not shown)
   - Null wind direction
   - Missing cloud layers

5. **Helper functions**:
   - `getWindDirection()` with various degrees
   - `getFeelsLike()` with different scenarios
   - `getUVIndexLabel()` for all ranges
   - `getUVIndexColor()` for all ranges

6. **Conditional rendering**:
   - Component returns null when no data
   - UV index section only shown when provided
   - Sun times section only shown when provided
   - Tonight forecast section only shown when provided

### Visual/Integration Tests
- Responsive layout at different breakpoints
- Light and dark theme rendering
- UV index color contrast
- Icon loading and alt text
- Grid layout behavior

## Implementation Details

### File Location
- **Component**: `/workspaces/weather-app/src/components/CurrentConditions.tsx`
- **Types**: `/workspaces/weather-app/src/types/weather.ts`
- **Unit Store**: `/workspaces/weather-app/src/stores/unitStore.ts`

### Dependencies
```json
{
  "react": "UI library",
  "lucide-react": "Icon components (Thermometer, Droplets, Wind, Eye, Cloud, Sun, Sunrise, Sunset)",
  "@/components/ui/card": "shadcn/ui Card components",
  "@/types/weather": "TypeScript type definitions",
  "@/stores/unitStore": "Zustand store for unit system and conversion utilities"
}
```

### Key Helper Functions
Located within the component file:

1. **getWindDirection(degrees: number | null): string**
   - Converts 0-360 degrees to 16-point compass direction
   - Returns "N/A" for null values

2. **getFeelsLike(temp: number, heatIndex: number | null, windChill: number | null): number**
   - Returns heat index if > temperature
   - Returns wind chill if < temperature
   - Otherwise returns temperature

3. **getUVIndexLabel(value: number): string**
   - Returns: Low (≤2), Moderate (3-5), High (6-7), Very High (8-10), Extreme (11+)

4. **getUVIndexColor(value: number): string**
   - Returns Tailwind color classes for UV index values
   - Includes both light and dark mode variants

### Sub-Components

1. **WeatherDetailItem**
   - Props: `icon`, `label`, `value`
   - Reusable bordered container for weather data points
   - 16x16 icon, label (text-xs), value (text-sm font-medium)

2. **UVIndexItem**
   - Props: `value`
   - Specialized detail item for UV index
   - Includes color coding and descriptive label
   - Format: "7.0 (High)" with color

### Data Flow
```
Parent Component
    ↓
WeatherData (from API)
    ↓
CurrentConditions Component
    ↓
useUnitStore() → Unit System Preference
    ↓
Conversion Functions → Converted Values
    ↓
Render UI with converted/formatted data
```

### State Management
- **No local state**: Pure presentation component
- **Zustand store**: Unit system preference accessed via `useUnitStore()`
- **Persistent storage**: Unit preference saved in localStorage as `unit-storage`

### Styling Approach
- **Tailwind CSS**: All styling via utility classes
- **shadcn/ui**: Card components with built-in theming
- **Responsive**: Mobile-first with `md:` breakpoint
- **Theme Support**: Automatic light/dark mode via Tailwind's `dark:` variants