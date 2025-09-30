# Hourly Forecast Card Component Specification

## Purpose and Overview

Displays hourly weather forecast data using bar charts for visualization. Users can configure the time period (12, 24, 48 hours) and data type (temperature, precipitation, wind, humidity) through a split button box interface. Charts display mutually exclusive views with smooth transitions between data types.

## Props/API Interface

```typescript
interface HourlyForecastCardProps {
  hourlyData: HourlyForecastData[];
  isLoading?: boolean;
  className?: string;
}

interface HourlyForecastData {
  timestamp: string;           // ISO 8601 timestamp
  temperature: number;         // Fahrenheit
  dewpoint: number;           // Fahrenheit
  precipProbability: number;  // 0-100 percentage
  precipAmount?: number;      // Inches (if available)
  windSpeed: number;          // mph
  windDirection: string;      // e.g., "NW", "South"
  windGust?: number;          // mph (optional)
  relativeHumidity: number;   // 0-100 percentage
  icon: string;               // NWS icon URL
  shortForecast: string;      // e.g., "Partly Cloudy"
}

type TimePeriod = '12' | '24' | '48';
type DataType = 'temperature' | 'precipitation' | 'wind' | 'humidity';

interface ChartConfig {
  period: TimePeriod;
  dataType: DataType;
}
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

### Control Panel (Split Button Box)

**Time Period Selector** (Left group):
- Three buttons: `12h` | `24h` | `48h`
- Active button highlighted
- Mutually exclusive selection
- Default: 24h

**Data Type Selector** (Right group):
- Four buttons: `Temp` | `Precip` | `Wind` | `Humid`
- Active button highlighted
- Mutually exclusive selection
- Default: Temperature

**Layout**:
```
┌────────────────────────────────────────────────┐
│  12h    24h    48h  │  Temp  Precip  Wind  Humid │
│ [  ]   [██]   [  ]  │  [██]  [  ]   [  ]   [  ]  │
└────────────────────────────────────────────────┘
```

### Chart Visualizations

#### Temperature Chart
- **Y-axis**: Temperature in °F
- **X-axis**: Time labels (e.g., "12p", "1p", "2p")
- **Bars**: Vertical bars for each hour
- **Color gradient**: Cool-to-warm (blue → yellow → red)
- **Data labels**: Show temperature value on or above each bar
- **Hover**: Display time, temperature, and conditions

#### Precipitation Chart
- **Y-axis**: Precipitation probability (0-100%)
- **X-axis**: Time labels
- **Bars**: Vertical bars for each hour
- **Color**: Blue gradient based on probability
- **Secondary data**: Show precipitation amount if available (as annotation)
- **Hover**: Display time, probability, and amount

#### Wind Chart
- **Y-axis**: Wind speed in mph
- **X-axis**: Time labels
- **Bars**: Vertical bars for wind speed
- **Color**: Gradient based on wind speed (light → dark)
- **Direction indicators**: Arrow or text showing wind direction above/on bar
- **Gusts**: Show as dot or line above bar if present
- **Hover**: Display time, speed, direction, and gusts

#### Humidity Chart
- **Y-axis**: Relative humidity (0-100%)
- **X-axis**: Time labels
- **Bars**: Vertical bars for each hour
- **Color**: Teal/cyan gradient
- **Data labels**: Show percentage on or above each bar
- **Hover**: Display time, humidity, and dewpoint

### Styling Guidelines
- Use shadcn/ui chart components for consistent styling
- Responsive chart sizing
- Clear axis labels with appropriate units
- Grid lines for easier reading (subtle, not distracting)
- Smooth transitions when switching data types
- Color schemes that work in both light and dark modes
- Adequate bar width with small gaps for readability

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
- User preferences (period/dataType): localStorage (client-side)

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
- **Hover**: Show tooltip with detailed information
- **Touch**: Tap bar to show information (mobile)
- **Tooltip content**:
  - Time
  - Primary value (temp, precip, wind, humidity)
  - Secondary info (conditions, dewpoint, wind direction)
  - Weather icon (optional)

### Responsive Controls
- On narrow screens, buttons may wrap or reduce size
- Maintain usability of all controls
- Consider vertical stacking of control groups if needed

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
<section aria-label="Hourly weather forecast">
  <h2>Hourly Forecast</h2>
  <div role="group" aria-label="Time period selection">
    <button aria-label="12 hour forecast" aria-pressed="false">12h</button>
    <button aria-label="24 hour forecast" aria-pressed="true">24h</button>
    <button aria-label="48 hour forecast" aria-pressed="false">48h</button>
  </div>
  <div role="group" aria-label="Data type selection">
    <button aria-label="Temperature chart" aria-pressed="true">Temp</button>
    <button aria-label="Precipitation chart" aria-pressed="false">Precip</button>
    <button aria-label="Wind chart" aria-pressed="false">Wind</button>
    <button aria-label="Humidity chart" aria-pressed="false">Humidity</button>
  </div>
  <div role="img" aria-label="Temperature chart showing hourly forecast">
    <!-- Chart content -->
  </div>
</section>
```

### ARIA Labels
- Control buttons: Use `aria-pressed` to indicate active state
- Chart container: Describe chart type and content
- Data points: Provide text alternative for screen readers

### Keyboard Navigation
- Tab through control buttons
- Arrow keys to navigate between buttons in each group
- Enter/Space to activate button
- Focus indicators clearly visible
- Keyboard access to chart data points (if interactive)

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

### Initial Load
```
┌─────────────────────────────────────────────────────────────┐
│  Hourly Forecast                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [12h] [24h] [48h]  |  [Temp] [Precip] [Wind] [Humid] │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```
- Skeleton screen for chart area
- Controls enabled but chart loading
- Pulsing animation on skeleton

### Switching Views
- Smooth transition animation (fade or slide)
- Brief loading state if data needs processing
- Maintain control panel state

### Refresh
- Non-interrupting refresh
- Data updates smoothly without layout shift
- Optional: Subtle loading indicator

### Error State
- Display error message in chart area
- Retry button
- Keep controls functional

## Example Usage

```tsx
import { HourlyForecastCard } from '@/components/weather/HourlyForecastCard';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function WeatherDashboard({ zipCode }: { zipCode: string }) {
  const { hourlyData, isLoading } = useWeatherData(zipCode);
  const [chartConfig, setChartConfig] = useLocalStorage<ChartConfig>(
    'hourly-chart-config',
    { period: '24', dataType: 'temperature' }
  );

  return (
    <HourlyForecastCard
      hourlyData={hourlyData}
      isLoading={isLoading}
      config={chartConfig}
      onConfigChange={setChartConfig}
      className="mb-4"
    />
  );
}
```

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

## Performance Considerations

- Memoize chart component
- Use React.memo for control buttons
- Debounce chart rendering when switching views
- Lazy load chart library
- Optimize re-renders when unrelated state changes
- Cache processed chart data
- Virtualize bars for very long forecasts (48h+)

## Testing Requirements

- Render with different time periods (12h, 24h, 48h)
- Render with different data types
- Test switching between periods and types
- Test with missing data
- Test with extreme values
- Test responsive layouts at all breakpoints
- Verify control button interactions
- Test keyboard navigation
- Test with screen reader
- Verify chart tooltips/interactions
- Test localStorage persistence of preferences
- Verify color contrast in both themes
- Test chart accessibility features
- Test with insufficient data (< full period)
- Test date boundary crossing
- Verify time formatting and timezone handling