# Hourly Forecast Card Component Specification

## Purpose and Overview

Displays hourly weather forecast data using bar charts for visualization. Users can configure the time period (12, 24, 48 hours) and data type (temperature, precipitation, wind, humidity) through a split button box interface. Charts display mutually exclusive views with smooth transitions between data types.

## Props/API Interface

```typescript
interface HourlyForecastProps {
  hourlyForecast: HourlyForecast[];
}

// From @/types/weather.ts
interface HourlyForecast {
  number: number;
  startTime: string;           // ISO 8601 timestamp
  endTime: string;
  isDaytime: boolean;
  temperature: number;         // Fahrenheit
  temperatureUnit: string;
  probabilityOfPrecipitation?: {
    value: number | null;      // 0-100 percentage
  }
  dewpoint: {
    value: number;             // Fahrenheit
    unitCode: string;
  }
  relativeHumidity: {
    value: number;             // 0-100 percentage
  }
  windSpeed: string;           // e.g., "10 mph"
  windDirection: string;       // e.g., "NW", "South"
  icon: string;                // NWS icon URL
  shortForecast: string;       // e.g., "Partly Cloudy"
}

type Period = '12' | '24' | '48';
type DataType = 'temperature' | 'precipitation' | 'wind' | 'humidity';
```

## Layout and Visual Design

### Card Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Hourly Forecast                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [12h] [24h] [48h]  |  [Temp] [Precip] [Wind] [Humid] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Temperature (°F)                     │  │
│  │  90│    ▄▄                                            │  │
│  │  85│   ▐██▌     ▄▄                                    │  │
│  │  80│ ▄▐██▌▄   ▐██▌                                    │  │
│  │  75│▐████████▐████▌                                   │  │
│  │  70│▐██████████████▌▄▄                                │  │
│  │  65│▐████████████████▌                                │  │
│  │    └─────────────────────────────────────────────────│  │
│  │     12p 1p 2p 3p 4p 5p 6p 7p 8p 9p 10p 11p 12a       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Control Panel

**Time Period Selector** (Select dropdown):
- shadcn/ui Select component with three options:
  - "12 Hours"
  - "24 Hours"
  - "48 Hours"
- Default: 24 Hours
- Width: 120px

**Data Type Selector** (Button group):
- Four buttons: `Temp` | `Precip` | `Wind` | `Humidity`
- Active button uses `default` variant, inactive use `outline` variant
- Size: `sm`
- Mutually exclusive selection
- Default: Temperature

**Layout**:
```
┌───────────────────────────────────────────────────────────┐
│ Hourly Forecast            [24 Hours ▼]  [Temp] [Precip]  │
│                                           [Wind] [Humidity]│
└───────────────────────────────────────────────────────────┘
```
- Responsive: Controls wrap on small screens
- Mobile: Vertical stack with period selector on top, data type buttons below

### Chart Visualizations

#### Temperature Chart
- **Y-axis**: Temperature with unit label (°F or °C based on unit system)
- **X-axis**: Time labels formatted as "ha" (e.g., "12PM", "1AM")
- **Bars**: Vertical bars with rounded top corners
- **Color**: Single color from `--chart-1` CSS variable
- **Unit conversion**: Supports both Imperial (°F) and Metric (°C)
- **Hover**: Tooltip displays time and temperature with unit
- **Legend**: Shows "Temperature"

#### Precipitation Chart
- **Y-axis**: Precipitation probability (0-100%)
- **X-axis**: Time labels formatted as "ha"
- **Bars**: Vertical bars with rounded top corners
- **Color**: Single color from `--chart-2` CSS variable
- **Data source**: `probabilityOfPrecipitation.value` (defaults to 0 if null)
- **Hover**: Tooltip displays time and probability percentage
- **Legend**: Shows "Precipitation"
- **Note**: Precipitation amount not currently displayed

#### Wind Chart
- **Y-axis**: Wind speed with unit label (mph or km/h based on unit system)
- **X-axis**: Time labels formatted as "ha"
- **Bars**: Vertical bars with rounded top corners
- **Color**: Single color from `--chart-3` CSS variable
- **Unit conversion**: Supports both Imperial (mph) and Metric (km/h)
- **Data parsing**: Extracts numeric value from windSpeed string (e.g., "10 mph" → 10)
- **Hover**: Tooltip displays time and wind speed with unit
- **Legend**: Shows "Wind Speed"
- **Note**: Wind direction and gusts not currently displayed on chart

#### Humidity Chart
- **Y-axis**: Relative humidity (0-100%)
- **X-axis**: Time labels formatted as "ha"
- **Bars**: Vertical bars with rounded top corners
- **Color**: Single color from `--chart-4` CSS variable
- **Data source**: `relativeHumidity.value`
- **Hover**: Tooltip displays time and humidity percentage
- **Legend**: Shows "Humidity"

### Styling Guidelines
- Uses Recharts library (not shadcn/ui chart components)
- Chart height: 300px
- ResponsiveContainer for width adaptation
- Clear axis labels with appropriate units (rotated label on Y-axis)
- CartesianGrid with "3 3" dash pattern and muted stroke
- Bar colors from CSS variables:
  - Temperature: `hsl(var(--chart-1))`
  - Precipitation: `hsl(var(--chart-2))`
  - Wind: `hsl(var(--chart-3))`
  - Humidity: `hsl(var(--chart-4))`
- Bars with rounded top corners: `radius={[4, 4, 0, 0]}`
- Tooltip with popover background and border styling
- Legend showing data type label
- Summary stats section below chart with min/max/avg values

## Data Requirements

### NWS API Endpoint
```
GET /gridpoints/{office}/{gridX},{gridY}/forecast/hourly
```

### Data Transformation

1. **Filter by Time Period**:
   - 12h: Next 12 hours from current time
   - 24h: Next 24 hours
   - 48h: Next 48 hours

2. **Format Timestamps**:
   - X-axis labels: "12p", "1a", "2a" format
   - Show date change indicator if crossing midnight
   - Group by date for 48h view (optional)

3. **Process Data**:
   - Extract relevant fields based on selected data type
   - Calculate min/max for Y-axis scaling
   - Handle missing values (interpolate or skip)

4. **Wind Direction**:
   - Convert degrees to cardinal directions
   - Simplify to 8 cardinal directions (N, NE, E, SE, S, SW, W, NW)

### Caching Strategy
- Hourly forecast data: 1 hour (server-side)
- Client refreshes every 1 minute (fetches from server cache)
- User preferences stored in localStorage (client-side):
  - Key `hourly-chart-dataType`: stores selected data type ('temperature' | 'precipitation' | 'wind' | 'humidity')
  - Key `hourly-chart-period`: stores selected period ('12' | '24' | '48')
  - Defaults: dataType='temperature', period='24'

## User Interactions

### Time Period Selection
- Click button to change time period
- Active state visually distinct
- Chart updates immediately with smooth transition
- Preference saved to localStorage

### Data Type Selection
- Click button to change data type
- Active state visually distinct
- Chart transitions smoothly (fade out/in or slide)
- Preference saved to localStorage

### Chart Interactions
- **Hover**: Recharts tooltip shows on hover
- **Touch**: Tap bar to show tooltip (mobile)
- **Tooltip content**:
  - Time label
  - Primary value with unit (formatted as "{value}{unit}")
  - Data type label (Temperature/Precipitation/Wind Speed/Humidity)
- **Tooltip styling**:
  - Background: `hsl(var(--popover))`
  - Border: `1px solid hsl(var(--border))`
  - Border radius: 6px
  - Text color: `hsl(var(--popover-foreground))`

### Responsive Controls
- Desktop: Controls display in single row (title | select + buttons)
- Mobile: Controls wrap with `flex-wrap` and stack vertically with `flex-col`
- Gap spacing: 3 (between control groups) and 2 (between buttons)
- Period selector maintains fixed width (120px)
- Data type buttons use `sm` size for compact display

## Responsive Behavior

### Desktop (≥1024px)
- Full-width chart with comfortable margins
- All time labels visible
- Control buttons at full size
- Tooltips on hover

### Tablet (768px - 1023px)
- Maintain chart width
- May reduce number of visible time labels
- Control buttons slightly smaller
- Tooltips on hover/tap

### Mobile (<768px)
- **Chart**: Full width with horizontal scroll if needed
- **Controls**: Stack vertically or wrap
  - Row 1: Time period buttons
  - Row 2: Data type buttons
- **Time labels**: Show fewer labels (every 2-3 hours)
- **Bars**: Maintain minimum width for touch targets
- **Tooltips**: Tap to show, tap elsewhere to hide

## Accessibility Considerations

### Semantic HTML
```html
<div class="card">
  <div class="card-header">
    <h3>Hourly Forecast</h3>
    <div>
      <select aria-label="Time period selection">
        <option value="12">12 Hours</option>
        <option value="24">24 Hours</option>
        <option value="48">48 Hours</option>
      </select>
      <div role="group" aria-label="Data type selection">
        <button aria-label="Temperature chart">Temp</button>
        <button aria-label="Precipitation chart">Precip</button>
        <button aria-label="Wind chart">Wind</button>
        <button aria-label="Humidity chart">Humidity</button>
      </div>
    </div>
  </div>
  <div class="card-content">
    <div class="responsive-container">
      <!-- Recharts BarChart -->
    </div>
    <div class="stats-section">
      <!-- Min/Max/Avg stats -->
    </div>
  </div>
</div>
```

### ARIA Labels
- Period selector: Use shadcn/ui Select component with built-in accessibility
- Data type buttons: Should include `aria-label` for full descriptions (currently not implemented)
- Active state: Indicated by `variant` prop (default vs outline)
- Chart container: Recharts provides some built-in accessibility features

### Keyboard Navigation
- Tab to select dropdown (shadcn/ui Select handles keyboard navigation)
- Tab through data type buttons
- Enter/Space to activate button
- Focus indicators from shadcn/ui components
- Chart data points: Recharts provides limited keyboard support

### Screen Reader Support
- Announce current selection when changing period/type
- Provide summary of chart data
- Alternative: Data table below chart for screen reader users
- Announce min/max values and trends

### Color Considerations
- Don't rely solely on color gradients
- Ensure sufficient contrast for bar borders
- Text labels on bars for clarity
- Test in both light and dark modes
- Consider color-blind friendly palettes

### Chart Accessibility
- Consider providing a data table view (toggleable)
- Text alternatives for visual chart elements
- Ensure chart library supports accessibility features

## Loading States

**Current Implementation**: The component does not implement loading states. It expects `hourlyForecast` data to be available when rendered.

**Potential Improvements**:
- Add `isLoading` prop to show skeleton state
- Display error state if data is unavailable
- Show loading indicator during data type/period switches
- Maintain controls functionality during loading

### Error Handling
- If `hourlyForecast` is empty, component may render empty chart
- No explicit error state UI currently implemented
- Stats calculations will fail on empty data (NaN values)

## Example Usage

```tsx
import { HourlyForecast } from '@/components/HourlyForecast';
import { useWeatherData } from '@/hooks/useWeatherData';

function WeatherDashboard({ zipCode }: { zipCode: string }) {
  const { hourlyForecast } = useWeatherData(zipCode);

  return (
    <HourlyForecast hourlyForecast={hourlyForecast} />
  );
}
```

**Note**: The component manages its own state internally using `useLocalStorage` hook for period and dataType preferences. Unit system is accessed from the global `unitStore`.

## Edge Cases

1. **Insufficient Data**:
   - If API returns < requested hours, show available data
   - Display message: "Showing X hours (limited data available)"

2. **Missing Values**:
   - Skip hours with missing critical data
   - Interpolate if only few values missing (with indicator)
   - Show gap in chart if extended missing data

3. **Extreme Values**:
   - Auto-scale Y-axis to accommodate range
   - Highlight unusual values (very high wind, extreme temps)

4. **Zero Precipitation**:
   - Show "0%" on bars or minimal bar height
   - Clarify "0% chance" vs "no data"

5. **Variable Wind**:
   - Show "VAR" or omit direction indicator if < 3 mph

6. **Time Zone Handling**:
   - Display times in user's local timezone
   - Indicate timezone if not obvious

7. **Date Boundaries**:
   - Show date change indicator when crossing midnight
   - Group by date for 48h view (optional)

8. **Long Forecasts**:
   - For 48h view, consider showing fewer bars or summarizing
   - Horizontal scroll if all bars don't fit

## Summary Statistics Section

A statistics panel is displayed below the chart showing:
- **Min**: Minimum value in the displayed period
- **Max**: Maximum value in the displayed period
- **Avg**: Average value (rounded to nearest integer)

**Layout**:
```
┌────────────────────────────────────────────┐
│         Min    │    Max    │    Avg        │
│         65°F   │    85°F   │    75°F       │
└────────────────────────────────────────────┘
```

**Styling**:
- Background: `bg-muted`
- Padding: `p-3`
- Border radius: `rounded-lg`
- Layout: `flex justify-around`
- Text size: `text-sm`
- Labels: `text-muted-foreground`
- Values: `font-semibold`

## Unit System Support

The component integrates with the global unit store (`@/stores/unitStore`) to support both Imperial and Metric systems:

**Temperature**:
- Imperial: Fahrenheit (°F)
- Metric: Celsius (°C)
- Conversion: `(°F - 32) × 5/9 = °C`

**Wind Speed**:
- Imperial: Miles per hour (mph)
- Metric: Kilometers per hour (km/h)
- Conversion: `mph × 1.60934 = km/h`

**Precipitation and Humidity**:
- Always displayed as percentages (%)
- No unit conversion needed

## Performance Considerations

- Uses `useLocalStorage` hook to persist user preferences
- Recharts library handles chart rendering and animations
- Data transformation occurs on each render (could be optimized with useMemo)
- ResponsiveContainer handles chart resizing automatically
- No virtualization implemented for 48-hour view

## Implementation Details

**Dependencies**:
- `recharts`: Chart library for bar charts
- `date-fns`: Time formatting (`format` function)
- `@/hooks/useLocalStorage`: Persisting user preferences
- `@/stores/unitStore`: Global unit system state
- `@/components/ui/card`: shadcn/ui Card components
- `@/components/ui/button`: shadcn/ui Button component
- `@/components/ui/select`: shadcn/ui Select component

**Key Functions**:
- `getPeriodData()`: Slices hourlyForecast array based on selected period
- `convertTemperature()`: Converts Fahrenheit to Celsius for metric system
- `parseWindSpeed()`: Extracts numeric value from wind speed string and converts units
- `formatChartData()`: Transforms hourly forecast data into Recharts-compatible format
- `getBarColor()`: Returns CSS variable for bar color based on data type
- `getDataTypeLabel()`: Returns full label for data type

**Component File**: `/workspaces/weather-app/src/components/HourlyForecast.tsx`

## Testing Requirements

- Render with different time periods (12h, 24h, 48h)
- Render with different data types (temperature, precipitation, wind, humidity)
- Test switching between periods and types
- Test localStorage persistence of preferences
- Test unit conversion (Imperial/Metric)
- Test with missing probabilityOfPrecipitation values
- Test with various wind speed string formats
- Test responsive layouts at all breakpoints
- Verify control interactions (select and buttons)
- Verify chart tooltips display correctly
- Test stats calculations (min, max, avg)
- Verify color scheme in both light and dark modes
- Test with insufficient data (< full period requested)
- Test time formatting with date-fns