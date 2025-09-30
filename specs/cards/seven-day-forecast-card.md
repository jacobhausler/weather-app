# Seven-Day Forecast Card Component Specification

## Purpose and Overview

Displays a 7-day weather forecast in a horizontal row layout. Each day shows combined day/night forecast information including high/low temperatures, weather icons, precipitation probability, and wind details. Clicking on any day opens a modal with comprehensive forecast details.

## Props/API Interface

```typescript
interface SevenDayForecastCardProps {
  forecast: DailyForecast[];
  isLoading?: boolean;
  onDayClick: (day: DailyForecast) => void;
  className?: string;
}

interface DailyForecast {
  date: string;              // ISO 8601 date
  dayOfWeek: string;         // e.g., "Monday", "Tue"
  highTemp: number;          // Fahrenheit
  lowTemp: number;           // Fahrenheit
  dayIcon: string;           // NWS icon URL
  nightIcon: string;         // NWS icon URL
  shortForecast: string;     // e.g., "Partly Cloudy"
  precipProbability: number; // 0-100
  windSpeed: string;         // e.g., "10 to 15 mph"
  windDirection: string;     // e.g., "NW", "South"
  detailedForecast: string;  // Full forecast text
  isDaytime: boolean;        // For first period only
}
```

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
   - Today: "Today" instead of day name
   - Tomorrow: "Tomorrow" instead of day name
2. **Weather Icon**: Primary icon (daytime or most representative)
3. **High Temperature**: Larger, bold font
4. **Low Temperature**: Smaller, muted color
5. **Precipitation Probability**: Display if > 0% (e.g., "20%")
6. **Wind Icon**: Small wind indicator
7. **Wind Speed**: Abbreviated format (e.g., "10 mph")

### Styling Guidelines
- Equal width columns for each day
- Vertical centering of content within cells
- Hover state: Subtle background change, cursor pointer
- Active/Focus state: Border highlight
- Card border and shadow consistent with other cards
- Adequate spacing between elements within each day

### Icon Handling
- Use NWS-provided weather icons from API response
- Fallback to generic weather icons if NWS icons fail to load
- Icons should be consistent size (e.g., 48x48px or 64x64px)
- Consider showing both day and night icons or toggling between them

## Data Requirements

### NWS API Endpoint
```
GET /gridpoints/{office}/{gridX},{gridY}/forecast
```

### Data Transformation
1. **Combine Day/Night Periods**: NWS returns separate periods for day and night
   - Group consecutive day/night periods into single day forecast
   - Extract high (from day period) and low (from night period)
   - Use day icon as primary, store night icon for modal

2. **Process 7 Days**:
   - If first period is nighttime, combine with next day's daytime
   - Ensure exactly 7 days are displayed
   - Handle edge case where forecast doesn't have full 7 days

3. **Format Data**:
   - Convert date strings to day-of-week labels
   - Parse temperature values (remove "°F")
   - Extract precipitation probability from detailed forecast if not in period
   - Parse wind speed and direction

### Caching Strategy
- Cache forecast data for 1 hour (server-side)
- Client refreshes every 1 minute (fetches from server cache)
- Stale data acceptable for up to 1 hour

## User Interactions

### Day Click
- Click on any day cell to open forecast detail modal
- Pass full `DailyForecast` object to modal
- Modal displays comprehensive information (see forecast-day-modal.md)
- Keyboard accessible: Enter/Space to activate

### Hover State
- Subtle background color change
- Cursor changes to pointer
- Optional: Show brief tooltip with short forecast text

### Touch Interaction (Mobile)
- Tap to open modal
- No hover state on touch devices
- Ensure adequate touch target size (min 44x44px)

## Responsive Behavior

### Desktop (≥1024px)
- 7 equal-width columns
- Full day names (e.g., "Monday")
- Comfortable spacing between elements
- Icons at full size (64x64px)

### Tablet (768px - 1023px)
- 7 equal-width columns (may be slightly narrower)
- Abbreviated day names (e.g., "Mon")
- Slightly reduced icon size (48x48px)
- Maintain readability

### Mobile (<768px)
- **Option 1**: Horizontal scroll with 7 columns
  - Each day maintains minimum width
  - Snap scrolling for better UX
  - Scroll indicators at edges

- **Option 2**: Show only 5 visible days with scroll
  - Horizontal scroll to see remaining days
  - Current day always visible

- **Option 3**: Compact 7-column layout
  - Very abbreviated labels ("M", "T", "W")
  - Smaller fonts and icons
  - Vertical stacking of info

**Recommended**: Option 1 with horizontal scroll and snap points

## Accessibility Considerations

### Semantic HTML
```html
<section aria-label="7-day weather forecast">
  <h2>7-Day Forecast</h2>
  <div role="list">
    <button role="listitem" aria-label="Monday: Partly cloudy, high 82, low 65, 20% chance of rain">
      <!-- Day content -->
    </button>
  </div>
</section>
```

### ARIA Labels
- Each day cell: Descriptive label with all key information
- Example: "Monday: Partly cloudy with high of 82 degrees and low of 65 degrees. 20% chance of precipitation. Wind from northwest at 10 miles per hour."
- Icon alt text should describe weather condition

### Keyboard Navigation
- Tab through each day in logical order (left to right)
- Arrow keys for navigation (optional enhancement)
- Enter/Space to open day detail modal
- Visible focus indicators

### Screen Reader Support
- Announce temperatures with "degrees" unit
- Announce precipitation with "percent" unit
- Announce complete forecast summary for each day
- Indicate which day is today/tomorrow

### Color Considerations
- Don't rely solely on color to convey information
- Ensure sufficient contrast for temperature text
- Precipitation percentage should be readable in both themes

## Loading States

### Initial Load
```
┌───────────────────────────────────────────────────────────┐
│  7-Day Forecast                                           │
├───────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
└───────────────────────────────────────────────────────────┘
```
- Skeleton screens with 7 placeholder day cells
- Pulsing animation on skeleton elements
- Maintain layout structure during loading

### Refresh
- Non-interrupting refresh (no skeleton replacement)
- Data updates smoothly without layout shift
- Optional: Subtle loading indicator in card header

### Error State
- Display error message in card
- Retry button
- Preserve card structure

## Example Usage

```tsx
import { SevenDayForecastCard } from '@/components/weather/SevenDayForecastCard';
import { ForecastDayModal } from '@/components/weather/ForecastDayModal';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useState } from 'react';

function WeatherDashboard({ zipCode }: { zipCode: string }) {
  const { forecast, isLoading } = useWeatherData(zipCode);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  return (
    <>
      <SevenDayForecastCard
        forecast={forecast}
        isLoading={isLoading}
        onDayClick={setSelectedDay}
        className="mb-4"
      />
      <ForecastDayModal
        day={selectedDay}
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
```

## Edge Cases

1. **Partial Data**: Fewer than 7 days available
   - Display available days only
   - Show message: "X-day forecast" instead of "7-day"

2. **First Period is Night**:
   - Combine with next day's daytime period
   - Ensure proper high/low assignment

3. **Missing Data Points**:
   - Precipitation: Default to 0% if not available
   - Wind: Show "Calm" if speed is 0 or missing
   - Icon: Use fallback generic icon

4. **Long Wind Descriptions**:
   - Truncate or abbreviate (e.g., "10 to 15 mph" → "10-15 mph")

5. **Temperature Extremes**:
   - Very high/low temps may need adjusted spacing
   - Consider showing warning icon for extreme temps

## Performance Considerations

- Memoize day cell components
- Use React.memo for individual day cells
- Lazy load icons (with loading placeholder)
- Optimize re-renders when unrelated state changes
- Debounce horizontal scroll events on mobile

## Testing Requirements

- Render with full 7 days of data
- Render with partial data (< 7 days)
- Render when first period is nighttime
- Test day click interaction and modal opening
- Test responsive layouts at all breakpoints
- Verify keyboard navigation
- Test with screen reader
- Verify "Today" and "Tomorrow" labels
- Test with missing optional data
- Test horizontal scrolling on mobile
- Verify color contrast in both themes
- Test icon loading and fallback behavior