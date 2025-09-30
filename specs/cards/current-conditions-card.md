# Current Conditions + Daily Forecast Card Component Specification

## Purpose and Overview

Displays current weather conditions from the nearest observation station alongside today's forecast. Uses a grid layout with hierarchical nested cards to organize multiple data points including temperature, feels like, humidity, dewpoint, wind details, visibility, cloud cover, UV index, sunrise/sunset times, and detailed forecast text.

## Props/API Interface

```typescript
interface CurrentConditionsCardProps {
  currentConditions: CurrentConditions;
  todayForecast: TodayForecast;
  isLoading?: boolean;
  className?: string;
}

interface CurrentConditions {
  timestamp: string;           // ISO 8601 observation time
  temperature: number;         // Fahrenheit
  feelsLike: number;          // Heat index or wind chill
  humidity: number;            // Percentage (0-100)
  dewpoint: number;           // Fahrenheit
  windSpeed: number;          // mph
  windDirection: string;      // e.g., "NW", "South", "Variable"
  windGust?: number;          // mph (optional)
  visibility: number;         // miles
  cloudCover: number;         // Percentage (0-100)
  barometricPressure: number; // inches of mercury
  icon: string;               // NWS icon URL
  shortDescription: string;   // e.g., "Partly Cloudy"
  stationId: string;
  stationName: string;
}

interface TodayForecast {
  highTemp: number;           // Fahrenheit
  lowTemp: number;            // Fahrenheit (tonight's low)
  dayForecast: string;        // Detailed day forecast text
  nightForecast: string;      // Detailed night forecast text
  precipProbability: number;  // 0-100
  uvIndex?: number;           // 0-11+ (if available)
  sunrise: string;            // ISO 8601 timestamp
  sunset: string;             // ISO 8601 timestamp
}
```

## Layout and Visual Design

### Grid Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Current Conditions                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Current Weather     │  │  Today's Forecast    │        │
│  │                      │  │                      │        │
│  │  [Icon]    82°F      │  │  High: 85°F          │        │
│  │  Partly Cloudy       │  │  Low: 65°F (tonight) │        │
│  │  Feels like: 84°F    │  │  Precip: 20%         │        │
│  │                      │  │  UV Index: 7 (High)   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Atmospheric         │  │  Wind & Visibility   │        │
│  │                      │  │                      │        │
│  │  Humidity: 65%       │  │  Speed: 10 mph       │        │
│  │  Dewpoint: 68°F      │  │  Direction: NW       │        │
│  │  Pressure: 29.92 in  │  │  Gusts: 15 mph       │        │
│  │  Cloud Cover: 40%    │  │  Visibility: 10 mi   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────────────────────────────────────── │
│  │  Sun & Forecast Details                                │
│  │                                                         │
│  │  🌅 Sunrise: 7:15 AM    🌇 Sunset: 7:45 PM            │
│  │                                                         │
│  │  Today: Partly cloudy with a high near 85. Northwest   │
│  │  wind around 10 mph...                                 │
│  │                                                         │
│  │  Tonight: Mostly clear with a low around 65...         │
│  └─────────────────────────────────────────────────────── │
└─────────────────────────────────────────────────────────────┘
```

### Card Hierarchy

**Level 1**: Main card container
- **Level 2**: Four sub-cards in 2x2 grid
  1. Current Weather (top-left)
  2. Today's Forecast (top-right)
  3. Atmospheric Conditions (bottom-left)
  4. Wind & Visibility (bottom-right)
- **Level 3**: Full-width forecast details card (bottom)

### Styling Guidelines
- Consistent padding and spacing across sub-cards
- Visual hierarchy through font sizes and weights
- Icons for visual reinforcement of data points
- Color coding for UV index (Green/Yellow/Orange/Red)
- Muted colors for secondary information (feels like, dewpoint)
- Responsive grid that adapts to screen size

### Data Presentation

**Temperature Display**:
- Primary: Large, bold (e.g., 3rem font size)
- Feels Like: Smaller, muted, with "Feels like" prefix
- High/Low: Medium size, clear distinction

**Percentage Values**:
- Humidity: With droplet icon
- Cloud Cover: With cloud icon
- Precipitation: With umbrella/raindrop icon

**Wind Display**:
- Speed with wind icon
- Direction with compass arrow or abbreviation
- Gusts shown separately if present and different from base speed

**UV Index**:
- Numeric value with descriptive label
- Color-coded background:
  - 0-2: Low (green)
  - 3-5: Moderate (yellow)
  - 6-7: High (orange)
  - 8-10: Very High (red)
  - 11+: Extreme (purple)

## Data Requirements

### NWS API Endpoints

**Current Conditions**:
```
GET /stations/{stationId}/observations/latest
```

**Today's Forecast**:
```
GET /gridpoints/{office}/{gridX},{gridY}/forecast
```
- Extract first two periods (day and night)

**Sunrise/Sunset**:
- Calculate from coordinates using astronomical algorithms
- Or fetch from external API (e.g., sunrise-sunset.org)
- Cache daily (changes slowly)

### Data Transformation

1. **Current Conditions**:
   - Parse temperature values from metric to imperial if needed
   - Calculate feels-like if not provided (heat index or wind chill formulas)
   - Convert wind direction degrees to cardinal directions
   - Round values appropriately (temps to nearest degree, humidity to nearest %)

2. **Today's Forecast**:
   - Extract high from day period, low from night period
   - Parse precipitation probability from forecast text if not explicit
   - Combine day and night forecast text

3. **Missing Data Handling**:
   - Wind gusts: Only show if > wind speed
   - UV Index: Show "N/A" if not available
   - Pressure: Show if available from observation
   - Use fallback values or "—" for missing data

### Caching Strategy
- Current conditions: 10 minutes (server-side)
- Today's forecast: 1 hour (server-side)
- Sunrise/sunset: 24 hours (server-side)
- Client refreshes every 1 minute (fetches from server cache)

## User Interactions

### Hover States
- Sub-cards have subtle hover effect (optional)
- Data points may show tooltips with additional context

### Click Interactions
- Generally informational, no click interactions required
- Future enhancement: Click temperature to toggle units (F/C)
- Future enhancement: Click wind to show wind chill formula

### Tooltips
- Feels Like: Explain heat index or wind chill calculation
- UV Index: Provide sun safety recommendations
- Dewpoint: Explain comfort levels
- Barometric Pressure: Indicate rising/falling trend if available

## Responsive Behavior

### Desktop (≥1024px)
- 2x2 grid for four sub-cards
- Full-width forecast details card at bottom
- Comfortable spacing and large fonts

### Tablet (768px - 1023px)
- Maintain 2x2 grid, adjust spacing
- Slightly smaller fonts
- Reduce padding

### Mobile (<768px)
- **Option 1**: Stack all cards vertically (single column)
  - Current Weather
  - Today's Forecast
  - Atmospheric Conditions
  - Wind & Visibility
  - Sun & Forecast Details

- **Option 2**: 2 columns for top cards, stack bottom cards
  - Row 1: Current Weather | Today's Forecast
  - Row 2: Atmospheric Conditions (full width)
  - Row 3: Wind & Visibility (full width)
  - Row 4: Sun & Forecast Details (full width)

**Recommended**: Option 1 for simplicity and readability

## Accessibility Considerations

### Semantic HTML
```html
<section aria-label="Current weather conditions and forecast">
  <h2>Current Conditions</h2>
  <div class="grid">
    <article aria-label="Current weather">
      <h3>Current Weather</h3>
      <!-- Content -->
    </article>
    <article aria-label="Today's forecast">
      <h3>Today's Forecast</h3>
      <!-- Content -->
    </article>
    <!-- Additional cards -->
  </div>
</section>
```

### ARIA Labels
- Each sub-card: Descriptive label
- Temperature: "Current temperature 82 degrees Fahrenheit"
- Feels Like: "Feels like 84 degrees"
- Wind: "Wind from northwest at 10 miles per hour with gusts up to 15"
- UV Index: "UV index 7, high exposure level"

### Icon Alt Text
- Weather icon: Description of condition (e.g., "Partly cloudy sky")
- Sunrise/sunset icons: "Sunrise" and "Sunset"
- Data icons: Decorative (aria-hidden="true") if text label present

### Keyboard Navigation
- Focusable interactive elements only
- If tooltips present, accessible via keyboard
- Skip links for screen reader users (optional)

### Screen Reader Support
- Read data in logical order
- Group related information
- Announce units clearly ("degrees", "percent", "miles per hour")

### Color Considerations
- UV Index color coding supplemented with text labels
- Sufficient contrast for all text elements
- Test in both light and dark modes

## Loading States

### Initial Load
```
┌─────────────────────────────────────────────────────────────┐
│  Current Conditions                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```
- Skeleton screens for each sub-card
- Pulsing animation
- Maintain layout structure

### Refresh
- Non-interrupting refresh (no skeleton)
- Smooth data updates
- Optional: Timestamp showing last update

### Error State
- Display error in affected sub-card
- Other sub-cards continue to display if data available
- Retry button for failed sections

## Example Usage

```tsx
import { CurrentConditionsCard } from '@/components/weather/CurrentConditionsCard';
import { useWeatherData } from '@/hooks/useWeatherData';

function WeatherDashboard({ zipCode }: { zipCode: string }) {
  const { currentConditions, todayForecast, isLoading } = useWeatherData(zipCode);

  return (
    <CurrentConditionsCard
      currentConditions={currentConditions}
      todayForecast={todayForecast}
      isLoading={isLoading}
      className="mb-4"
    />
  );
}
```

## Edge Cases

1. **Missing Observations**:
   - Display "N/A" or "—" for missing data points
   - Provide message if observation is stale (> 1 hour old)

2. **No Gusts**:
   - Only show gust field if present and greater than wind speed

3. **Variable Wind**:
   - Display "Variable" instead of direction if wind < 3 mph

4. **Extreme Values**:
   - Very high UV index (11+): Show "Extreme" label
   - Zero visibility: Show "< 1 mi" or "Near zero"
   - High winds (> 50 mph): Highlight with warning color

5. **Stale Data**:
   - Show observation timestamp
   - Indicate if data is old (> 1 hour)

6. **Nighttime**:
   - Don't show UV index after sunset
   - Indicate current period (Day/Night)

7. **Unit Conversion**:
   - Ensure consistent unit system throughout
   - Support future toggle between Imperial/Metric

## Performance Considerations

- Memoize sub-card components
- Use React.memo for individual cards
- Avoid unnecessary re-renders
- Optimize icon loading
- Debounce tooltip interactions

## Testing Requirements

- Render with complete data
- Render with missing optional fields
- Render with extreme values
- Test responsive layouts at all breakpoints
- Verify grid layout behavior
- Test with screen reader
- Verify keyboard navigation (if interactive elements)
- Verify color contrast in both themes
- Test UV index color coding
- Test timestamp formatting
- Verify unit consistency
- Test error states for individual sub-cards
- Test loading states