# Forecast Day Modal Component Specification

## Purpose and Overview

A modal dialog that displays comprehensive forecast information for a selected period from the forecast. Triggered by clicking on a day in the Seven-Day Forecast Card. Shows detailed weather information for a single forecast period (either daytime or nighttime) including extended forecast text and all available meteorological data.

## Props/API Interface

```typescript
interface ForecastModalProps {
  period: ForecastPeriod | null;
  open: boolean;
  onClose: () => void;
}

interface ForecastPeriod {
  number: number;
  name: string;              // e.g., "Monday Night", "Tuesday"
  startTime: string;         // ISO 8601 timestamp
  endTime: string;           // ISO 8601 timestamp
  isDaytime: boolean;
  temperature: number;       // Temperature value
  temperatureUnit: string;   // "F" or "C"
  temperatureTrend?: string; // Optional: "rising" or "falling"
  probabilityOfPrecipitation?: {
    value: number | null;    // 0-100
  };
  windSpeed: string;         // e.g., "10 to 15 mph"
  windDirection: string;     // e.g., "NW"
  icon: string;              // NWS icon URL
  shortForecast: string;     // e.g., "Partly Cloudy"
  detailedForecast: string;  // Full forecast text
}
```

## Layout and Visual Design

### Modal Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Monday Night                                            [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🌙  65°F                                             │  │
│  │      (Trending rising)                               │  │
│  │      Mostly Clear                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Wind         │ │ Precipitation│ │ Day/Night    │       │
│  │ NW 10 mph    │ │ 10%          │ │ Night        │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Time Period                                           │ │
│  │  Monday, Sep 30, 6:00 PM - Tuesday, Oct 1, 6:00 AM    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Detailed Forecast                                     │ │
│  │                                                        │ │
│  │  Mostly clear with a low around 65. North wind        │ │
│  │  around 5 mph becoming calm in the evening.           │ │
│  │  Chance of precipitation is 10%.                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal Overlay
- Semi-transparent dark background (backdrop)
- Click outside to close
- Escape key to close
- Modal centered on screen
- Smooth fade-in animation
- Uses shadcn/ui Dialog component

### Header
- **Period Name**: The forecast period name (e.g., "Monday Night", "Tuesday", "This Afternoon")
- **Close button**: X icon in top-right corner (part of Dialog component)
- Divider line below header

### Weather Icon and Temperature Section
Horizontal layout with:
- **Weather Icon**: Large (96x96px) NWS icon showing forecast conditions
- **Temperature**: Large (4xl text) converted to user's unit preference (°F or °C)
  - Shows temperature trend if available (e.g., "Trending rising")
- **Short Forecast**: Description below temperature (e.g., "Mostly Clear")

### Weather Details Grid
3-column grid (responsive: 1 column on mobile, 3 on desktop) showing:

1. **Wind Card**:
   - Wind icon
   - Label: "Wind"
   - Value: Direction and speed (e.g., "NW 10 mph" or "NW 16 km/h")
   - Speed converted based on unit preference

2. **Precipitation Card** (conditionally rendered):
   - Droplets icon
   - Label: "Precipitation"
   - Value: Probability percentage (e.g., "10%")
   - Only shown if precipitation data exists and is not null

3. **Day/Night Card**:
   - Cloud icon
   - Label: "Day/Night"
   - Value: "Day" or "Night"

### Time Period Section
- Gray background card with padding
- Section heading: "Time Period"
- Formatted time range showing start and end times
- Format: "Monday, Sep 30, 6:00 PM - Tuesday, Oct 1, 6:00 AM"

### Detailed Forecast Section
- Section heading: "Detailed Forecast"
- Full forecast text from NWS API
- Single paragraph (not split by day/night)
- Adequate line spacing for readability

### Styling Guidelines
- Modal max-width: 2xl (672px)
- Max height: 80vh with vertical scrolling
- Adequate padding and spacing (space-y-6 between sections)
- Rounded corners on modal and detail cards
- Border on detail cards for definition
- Consistent typography hierarchy
- Weather icons sized 96x96px (h-24 w-24)
- Scrollable content if modal exceeds viewport height
- Muted colors for secondary text and icons
- Responsive grid layout

## Data Requirements

### Data Sources
- **Primary**: Single `ForecastPeriod` object from NWS forecast data
- **Unit Preferences**: Retrieved from Zustand unit store (imperial/metric)

### Data Processing
1. **Date/Time Formatting**:
   - Period name displayed as-is from NWS API (e.g., "Monday Night")
   - Start/End times formatted using date-fns: "EEEE, MMM d, h:mm a"
   - Handle invalid dates gracefully (return original string)

2. **Temperature Conversion**:
   - NWS provides temperature in Fahrenheit
   - Convert to Celsius if user preference is metric: `(°F - 32) × 5/9`
   - Round to nearest integer
   - Append appropriate unit symbol (°F or °C)

3. **Wind Speed Conversion**:
   - NWS provides wind speed as string (e.g., "10 mph", "5 to 10 mph")
   - Extract numeric value using regex
   - Convert to km/h if metric: `mph × 1.60934`
   - Replace speed value and unit in original string format
   - Return "N/A" if wind speed unavailable or invalid

4. **Temperature Trend** (optional):
   - Display if `temperatureTrend` field exists
   - Show as "Trending {trend}" (e.g., "Trending rising")

### Missing Data Handling
- If precipitation probability is null/undefined: Hide precipitation card entirely
- If temperature trend missing: Omit trend display
- If wind speed invalid: Display "N/A"
- Null period: Return null immediately (no rendering)

## User Interactions

### Opening Modal
- Triggered by clicking a forecast period in Seven-Day Forecast Card
- Controlled by `open` prop (boolean)
- Fade-in animation handled by shadcn/ui Dialog
- Focus management handled by Dialog component

### Closing Modal
Multiple methods:
1. Click close (X) button in dialog header
2. Press Escape key
3. Click outside modal (on backdrop)
4. All close actions trigger `onClose()` callback
5. Close action handled by `onOpenChange` in Dialog component

### Modal Behavior
- **Scrolling**:
  - Body scroll locked when modal open (Dialog default)
  - Modal content scrollable with max-height: 80vh
  - Overflow-y-auto on DialogContent
- **Focus management**:
  - Focus trapped within modal (Dialog default)
  - Return focus to trigger element on close (Dialog default)
- **Animations**:
  - Fade-in on open (Dialog default)
  - Fade-out on close (Dialog default)
  - Smooth transitions (Dialog default)

## Responsive Behavior

### Desktop (≥640px)
- Modal at 2xl width (672px max)
- Weather details in 3-column grid
- All content visible without much scrolling
- Hover states on close button

### Mobile (<640px)
- Modal width adjusted for viewport
- Weather details in single-column layout (grid-cols-1)
- Touch-friendly close button
- Modal remains centered with appropriate margins
- Vertical scrolling enabled for long content

## Accessibility Considerations

### Semantic HTML
Uses shadcn/ui Dialog component which provides:
- Proper ARIA attributes automatically
- Semantic HTML structure
- Focus management
- Keyboard navigation

### Component Structure
```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{period.name}</DialogTitle>
    </DialogHeader>
    <div className="space-y-6">
      {/* Icon and temperature section */}
      {/* Weather details grid */}
      {/* Time period section */}
      {/* Detailed forecast section */}
    </div>
  </DialogContent>
</Dialog>
```

### ARIA Attributes
- Provided automatically by shadcn/ui Dialog component
- `role="dialog"` on modal container
- `aria-modal="true"` to indicate modal state
- `aria-labelledby` pointing to DialogTitle
- Close button includes proper accessible label

### Focus Management
- Automatically handled by Dialog component
- Focus trapped within modal while open
- Returns focus to trigger element on close
- Tab order follows logical reading order

### Keyboard Navigation
- **Escape**: Close modal (Dialog default)
- **Tab**: Navigate through focusable elements (Dialog default)
- **Shift+Tab**: Navigate backwards (Dialog default)
- **Enter/Space**: Activate close button

### Screen Reader Support
- Dialog announces period name as title
- Weather icons have alt text (shortForecast)
- Labels provided for all data fields
- Logical content reading order
- Temperatures announced with unit

### Color Considerations
- Sufficient contrast for all text on modal background
- Works in both light and dark modes
- Uses muted-foreground for secondary text
- Border on detail cards for definition
- Backdrop provides clear visual separation

## Loading States

### Normal State
- All data loaded before modal opens
- Period data passed as prop
- No loading state needed within modal
- If period is null, modal returns null (no render)

## Example Usage

```tsx
import { ForecastModal } from '@/components/ForecastModal';
import { SevenDayForecastCard } from '@/components/SevenDayForecastCard';
import { useState } from 'react';
import { ForecastPeriod } from '@/types/weather';

function WeatherDashboard({ forecast }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod | null>(null);

  return (
    <>
      <SevenDayForecastCard
        forecast={forecast}
        onPeriodClick={setSelectedPeriod}
      />

      <ForecastModal
        period={selectedPeriod}
        open={!!selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
      />
    </>
  );
}
```

## Edge Cases

1. **Null Period**:
   - Component returns null immediately
   - No rendering occurs

2. **Missing Precipitation Data**:
   - Precipitation card not rendered
   - Only show if value exists and is not null

3. **Missing Temperature Trend**:
   - Omit trend display
   - Only temperature shown

4. **Invalid Wind Speed Format**:
   - Display "N/A" if regex match fails
   - Display original string if no match found

5. **Very Long Forecast Text**:
   - Modal scrolls vertically with max-height: 80vh
   - Content remains readable

6. **Invalid Date Strings**:
   - Try-catch around date formatting
   - Return original string if formatting fails

7. **Unit Conversion Edge Cases**:
   - Handle missing numeric values gracefully
   - Round all converted values to integers

## Performance Considerations

- Uses shadcn/ui Dialog component (lightweight, optimized)
- Modal remains mounted but hidden when closed (Dialog default)
- Early return when period is null
- Temperature and wind conversions performed inline (simple calculations)
- date-fns format function used for date formatting
- No heavy computations or data fetching within component
- Responsive grid uses Tailwind CSS (no JavaScript overhead)

## Testing Requirements

### Functional Testing
- Open and close modal with various methods (X button, Escape, backdrop click)
- Test with complete forecast period data
- Test with missing precipitation data (card hidden)
- Test with missing temperature trend (omitted)
- Test with invalid wind speed format (shows "N/A")
- Test with null period (no render)
- Test with extremely long forecast text (scrolls properly)

### Unit Conversion Testing
- Test temperature conversion (F to C)
- Test wind speed conversion (mph to km/h)
- Test unit display updates when preference changes
- Test with edge case values (0, negative, very large)

### Keyboard Navigation
- Test Escape key closes modal
- Test Tab navigation through elements
- Test Shift+Tab backwards navigation
- Test Enter/Space on close button

### Accessibility Testing
- Test with screen reader
- Verify ARIA attributes present
- Test focus trap functionality
- Test focus restoration on close
- Verify semantic heading structure

### Responsive Testing
- Test at mobile breakpoint (<640px) - single column grid
- Test at desktop breakpoint (≥640px) - 3 column grid
- Test scrolling behavior with long content
- Verify close button always accessible

### Date/Time Testing
- Test valid date formatting
- Test invalid date strings (fallback to original)
- Test time range display

### Visual Testing
- Verify backdrop click behavior
- Test animation smoothness
- Verify body scroll lock when modal open
- Test in light and dark modes
- Verify icon loading and display

## Implementation Details

### Dependencies
- **shadcn/ui Dialog**: Modal/dialog component
- **date-fns**: Date formatting (`format` function)
- **lucide-react**: Icons (Cloud, Droplets, Wind)
- **Zustand**: Unit preference state management

### Key Functions

#### Temperature Conversion
```typescript
const convertTemperature = (tempF: number) => {
  if (unitSystem === 'metric') {
    return Math.round(((tempF - 32) * 5) / 9)
  }
  return tempF
}
```

#### Wind Speed Conversion
```typescript
const convertWindSpeed = (windSpeed?: string) => {
  if (!windSpeed) return 'N/A'
  const match = windSpeed.match(/(\d+)/)
  if (!match || !match[1]) return windSpeed

  const speedMph = parseInt(match[1], 10)
  if (unitSystem === 'metric') {
    const speedKmh = Math.round(speedMph * 1.60934)
    return windSpeed.replace(/\d+/, speedKmh.toString()).replace('mph', 'km/h')
  }
  return windSpeed
}
```

#### Date Formatting
```typescript
const formatTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'EEEE, MMM d, h:mm a')
  } catch {
    return dateString
  }
}
```

### Component File Location
`/workspaces/weather-app/src/components/ForecastModal.tsx`

### Related Types
Defined in `/workspaces/weather-app/src/types/weather.ts`:
- `ForecastPeriod`: Main data interface for forecast periods
- Unit preferences from `/workspaces/weather-app/src/stores/unitStore.ts`