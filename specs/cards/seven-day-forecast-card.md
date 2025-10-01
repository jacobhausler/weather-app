# Seven-Day Forecast Card Component Specification

## Purpose and Overview

Displays a 7-day weather forecast in a horizontal row layout. Each day shows combined day/night forecast information including high/low temperatures, weather icons, precipitation probability, and wind details. Clicking on any day opens an internal modal with comprehensive forecast details.

## Props/API Interface

```typescript
interface SevenDayForecastProps {
  forecast: ForecastPeriod[];
}

// ForecastPeriod is defined in @/types/weather
interface ForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend?: string;
  probabilityOfPrecipitation?: {
    value: number | null;
  };
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}
```

## Dependencies and Imports

```typescript
// React
import { useState } from 'react'

// Types
import { ForecastPeriod } from '@/types/weather'

// UI Components (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Icons (Lucide React)
import { Droplets, Wind } from 'lucide-react'

// State Management
import { useUnitStore, getTempUnit } from '@/stores/unitStore'

// Sub-components
import { ForecastModal } from './ForecastModal'
```

### Key Dependencies
- **shadcn/ui**: Card components for layout structure
- **Lucide React**: Icons for precipitation and wind indicators
- **Zustand**: Unit system state management via `useUnitStore`
- **ForecastModal**: Internal modal component for detailed forecast view

## Layout and Visual Design

### Card Structure
```
┌───────────────────────────────────────────────────────────┐
│  7-Day Forecast                                           │
├───────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │Mon │ │Tue │ │Wed │ │Thu │ │Fri │ │Sat │ │Sun │        │
│  │ ☀️ │ │ ⛅ │ │ 🌧 │ │ ⛈ │ │ ☁️ │ │ ☀️ │ │ ⛅ │        │
│  │82°│ │78°│ │72°│ │75°│ │80°│ │85°│ │83°│        │
│  │65°│ │62°│ │58°│ │60°│ │63°│ │68°│ │66°│        │
│  │20%│ │40%│ │80%│ │60%│ │30%│ │10%│ │25%│        │
│  │ 🌬 │ │ 🌬 │ │ 🌬 │ │ 🌬 │ │ 🌬 │ │ 🌬 │ │ 🌬 │        │
│  │10mph│ │15mph│ │12mph│ │18mph│ │8mph│ │5mph│ │10mph│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
└───────────────────────────────────────────────────────────┘
```

### Individual Day Cell
Each day displays (top to bottom):
1. **Day Label**: Day of week (e.g., "Mon", "Tuesday")
   - Today: "Today" instead of day name (index 0)
   - Names are cleaned to remove " Night" and " Afternoon" suffixes
2. **Weather Icon**: Primary icon from day period (64x64px)
3. **Short Forecast**: Small muted text (e.g., "Partly Cloudy")
4. **Temperatures**:
   - High Temperature: Larger (text-lg), bold font
   - Low Temperature: Smaller (text-sm), muted color (from night period if available)
5. **Precipitation Probability**: Display if value exists (with Droplets icon)
6. **Wind Info**: Wind direction + speed (with Wind icon, text-[10px])

### Styling Guidelines
- Each day cell: `min-w-[140px]` with `flex flex-col items-center gap-2`
- Button wrapper with `rounded-lg border p-4`
- Hover state: `hover:bg-muted` with cursor pointer
- Card uses shadcn/ui Card components (Card, CardHeader, CardTitle, CardContent)
- Horizontal scroll container: `overflow-x-auto` with `flex gap-4 pb-2`
- Icons: Lucide React icons (Droplets, Wind) at size `h-3 w-3`

### Icon Handling
- Weather icons: NWS-provided from API response (`icon` field in ForecastPeriod)
- Icon size: 64x64px (`h-16 w-16`)
- Alt text: Uses `shortForecast` field for accessibility
- No fallback icons implemented (relies on NWS API reliability)

## Data Requirements

### NWS API Endpoint
```
GET /gridpoints/{office}/{gridX},{gridY}/forecast
```

Returns array of `ForecastPeriod` objects (passed directly as props).

### Data Transformation

The component performs the following transformations:

1. **Combine Day/Night Periods**:
   - Iterates through forecast array
   - Groups consecutive daytime periods with their following nighttime periods
   - Creates `DayForecast` objects: `{ day: ForecastPeriod, night?: ForecastPeriod }`
   - Skips standalone nighttime periods at start of forecast

2. **Limit to 7 Days**:
   - Takes first 7 grouped forecasts (`.slice(0, 7)`)
   - Displays fewer if less than 7 available

3. **Unit Conversion**:
   - **Temperature**: Converts from Fahrenheit (NWS default) to Celsius if metric system selected
     - Formula: `(tempF - 32) * 5 / 9`, rounded
   - **Wind Speed**: Converts from mph to km/h if metric system selected
     - Extracts numeric value from strings like "10 mph"
     - Formula: `speedMph * 1.60934`, rounded
     - Replaces "mph" with "km/h" in string

4. **Day Name Formatting**:
   - First day (index 0): Always displays "Today"
   - Other days: Cleans name by removing " Night" and " Afternoon" suffixes
   - Example: "Monday Night" → "Monday"

### Caching Strategy
- Cache forecast data for 1 hour (server-side)
- Client refreshes every 1 minute (fetches from server cache)
- Stale data acceptable for up to 1 hour

## User Interactions

### Internal State Management
The component manages its own modal state using React hooks:
- `selectedPeriod`: Stores clicked `ForecastPeriod` (initially null)
- `modalOpen`: Boolean state for modal visibility (initially false)

### Day Click
- Click on any day cell to open forecast detail modal
- Clicking sets `selectedPeriod` to the day's `ForecastPeriod` and sets `modalOpen` to true
- Modal component: `ForecastModal` (receives `period`, `open`, and `onClose` props)
- Modal displays comprehensive forecast information
- Keyboard accessible: Button elements support Enter/Space natively

### Hover State
- Background color change: `hover:bg-muted`
- Cursor changes to pointer (native button behavior)
- Smooth transition with `transition-colors` class

### Touch Interaction (Mobile)
- Tap to open modal (native button behavior)
- Touch target size: Min 140px wide × adequate height (exceeds 44px minimum)
- Horizontal scroll enabled via `overflow-x-auto` on container

## Responsive Behavior

### Implementation Approach
The component uses a **single responsive strategy** across all screen sizes:

- **Horizontal scroll layout**: All days rendered in flex row with `overflow-x-auto`
- **Fixed minimum width**: Each day cell maintains `min-w-[140px]`
- **Natural scrolling**: Native browser scroll behavior (no snap points)
- **Consistent design**: Same layout/spacing across all breakpoints
- **Icons**: Fixed size `h-16 w-16` (64x64px) on all devices
- **Day names**: Full cleaned names on all devices (e.g., "Monday", "Today")

### All Screen Sizes
- Container: `overflow-x-auto` with `flex gap-4 pb-2`
- Day cells: `min-w-[140px]` ensures readability and prevents cramping
- Horizontal scroll automatically appears when needed
- Touch-friendly scrolling on mobile devices
- No breakpoint-specific variations

## Accessibility Considerations

### Semantic HTML
```html
<Card>
  <CardHeader>
    <CardTitle>7-Day Forecast</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-2">
        <button onClick={handleClick} className="...">
          <!-- Day content -->
        </button>
      </div>
    </div>
  </CardContent>
</Card>
```

### Current Implementation
- **Button elements**: Native semantic buttons for each day cell
- **Alt text on images**: Uses `shortForecast` field (e.g., "Partly Cloudy")
- **No explicit ARIA labels**: Relies on visible text and image alt text
- **Icon labels**: Lucide icons (Droplets, Wind) are decorative, adjacent to text

### Keyboard Navigation
- **Tab navigation**: Native button tab order (left to right)
- **Activation**: Enter/Space to open modal (native button behavior)
- **Focus indicators**: Browser default focus styles (could be enhanced)
- **Modal**: ForecastModal handles its own keyboard interactions

### Screen Reader Considerations
**Current gaps** (opportunities for enhancement):
- No comprehensive ARIA labels summarizing all day information
- Temperature units announced only as "°" symbol + unit letter
- Precipitation and wind lack descriptive labels
- "Today" label not explicitly announced as current day

### Color Considerations
- Text contrast: Uses Tailwind's semantic colors (foreground/muted-foreground)
- Theme support: Works in both light and dark modes
- Information not color-dependent: All data has text labels
- Icons: Supplementary to text, not primary information source

## Loading States

### Current Implementation
**No loading states implemented in this component.**

The component expects the parent to handle loading states:
- Parent component should conditionally render the `SevenDayForecast` component only when data is available
- Parent typically uses skeleton/loading components during initial fetch
- Component renders immediately once `forecast` prop contains data

### Refresh Behavior
- Parent handles background refresh
- Component re-renders with updated data
- No visual loading indicators during refresh
- Smooth data updates without interruption

### Error Handling
**No error states in this component.**
- Parent component handles API errors
- Errors typically displayed in global error banner
- Component not rendered if forecast data unavailable

## Example Usage

```tsx
import { SevenDayForecast } from '@/components/SevenDayForecast';
import { useWeatherStore } from '@/stores/weatherStore';

function WeatherDashboard() {
  const { weatherData } = useWeatherStore();

  // Component only renders when forecast data is available
  if (!weatherData?.forecast) {
    return <div>Loading...</div>;
  }

  return (
    <SevenDayForecast forecast={weatherData.forecast} />
  );
}
```

**Key points:**
- Component manages its own modal state internally
- No `onDayClick` callback needed
- `ForecastModal` is rendered internally by the component
- Parent only needs to pass `forecast` array of `ForecastPeriod` objects
- Parent handles loading/error states before rendering component

## Edge Cases

### Handled by Implementation

1. **Partial Data**: Fewer than 7 days available
   - Displays all available grouped days up to 7
   - Title remains "7-Day Forecast" regardless of count
   - No special messaging for partial forecasts

2. **First Period is Night**:
   - Skipped during grouping loop
   - Only creates `DayForecast` objects starting with daytime periods
   - Nighttime-first scenarios handled gracefully

3. **Missing Night Period**:
   - `night` field is optional in `DayForecast` interface
   - Low temperature not displayed if night period missing
   - Only high temperature shown in this case

4. **Missing Precipitation Data**:
   - Only displays if `probabilityOfPrecipitation.value` exists and is not null
   - No "0%" display, icon omitted entirely if data missing

5. **Missing Wind Data**:
   - `convertWindSpeed()` returns "N/A" if `windSpeed` is falsy
   - Regex match failure returns original windSpeed string
   - Always displays wind info (doesn't conditionally hide)

### Not Currently Handled

1. **Long Wind Descriptions**:
   - No truncation or abbreviation
   - Text wrapping handled by container width (`text-[10px]`)

2. **Temperature Extremes**:
   - No special handling for extreme values
   - No warning icons or special styling

## Performance Considerations

### Current Implementation
- **No memoization**: Component re-renders on any prop change
- **No React.memo**: Day cells are inline button elements, not separate components
- **Direct iteration**: Maps over `sevenDays` array inline
- **State updates**: Two separate state variables (`selectedPeriod`, `modalOpen`)

### Optimization Opportunities
- Could memoize `groupedForecast` and `sevenDays` calculations
- Could extract day cell to separate memoized component
- Could combine modal state into single object
- Unit store subscription causes re-renders when unit system changes

## Testing Requirements

### Component Behavior Tests
- Render with full 14 periods (7 day/night pairs)
- Render with partial data (< 7 days)
- Render when first period is nighttime (should skip it)
- Test day click opens modal with correct period data
- Test modal close button functionality
- Verify "Today" label for first day (index 0)
- Verify day name cleaning (removes " Night", " Afternoon")

### Data Transformation Tests
- Verify day/night period grouping logic
- Test temperature conversion (F to C) when metric mode enabled
- Test wind speed conversion (mph to km/h) when metric mode enabled
- Test temperature display in imperial mode (no conversion)
- Test wind speed parsing from various formats

### Unit System Integration Tests
- Switch unit system and verify temperature updates
- Switch unit system and verify wind speed updates
- Verify temperature unit symbol changes (°F vs °C)
- Verify wind speed unit changes (mph vs km/h)

### Missing Data Tests
- Test with missing precipitation data (should not display)
- Test with missing night period (should only show high temp)
- Test with null precipitation values
- Test with missing/malformed wind speed strings

### UI/Visual Tests
- Verify horizontal scroll behavior on narrow viewports
- Verify all days have min-width of 140px
- Verify hover states on buttons
- Test in light and dark modes
- Verify icon sizes (64x64px)
- Verify Lucide icon rendering (Droplets, Wind)

### Integration Tests
- Test with real NWS API response data
- Verify NWS icon URLs load correctly
- Test modal interaction workflow end-to-end