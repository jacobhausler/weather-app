# Forecast Day Modal Component Specification

## Purpose and Overview

A modal dialog that displays comprehensive forecast information for a selected day from the 7-day forecast. Triggered by clicking on a day in the Seven-Day Forecast Card. Shows detailed weather information including extended forecast text, hourly breakdown, and all available meteorological data.

## Props/API Interface

```typescript
interface ForecastDayModalProps {
  day: DailyForecast | null;
  isOpen: boolean;
  onClose: () => void;
  hourlyData?: HourlyForecastData[]; // Optional: filtered hourly data for this day
  className?: string;
}

interface DailyForecast {
  date: string;              // ISO 8601 date
  dayOfWeek: string;         // e.g., "Monday"
  highTemp: number;          // Fahrenheit
  lowTemp: number;           // Fahrenheit
  dayIcon: string;           // NWS icon URL
  nightIcon: string;         // NWS icon URL
  shortForecast: string;     // e.g., "Partly Cloudy"
  nightShortForecast: string;
  precipProbability: number; // 0-100
  nightPrecipProbability: number;
  windSpeed: string;         // e.g., "10 to 15 mph"
  windDirection: string;     // e.g., "NW"
  nightWindSpeed: string;
  nightWindDirection: string;
  detailedForecast: string;  // Full day forecast text
  nightDetailedForecast: string; // Full night forecast text
  humidity?: number;         // If available
  dewpoint?: number;         // If available
}
```

## Layout and Visual Design

### Modal Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Monday, September 30                                    [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │      Daytime         │  │      Nighttime       │        │
│  │                      │  │                      │        │
│  │        ☀️            │  │        🌙            │        │
│  │    Partly Cloudy     │  │    Mostly Clear      │        │
│  │                      │  │                      │        │
│  │      High: 85°F      │  │      Low: 65°F       │        │
│  │      Precip: 20%     │  │      Precip: 10%     │        │
│  │    Wind: NW 10 mph   │  │    Wind: N 5 mph     │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Detailed Forecast                                     │ │
│  │                                                        │ │
│  │  Daytime: Partly cloudy with a high near 85.          │ │
│  │  Northwest wind around 10 mph. Chance of              │ │
│  │  precipitation is 20%.                                │ │
│  │                                                        │ │
│  │  Nighttime: Mostly clear with a low around 65.        │ │
│  │  North wind around 5 mph becoming calm in the         │ │
│  │  evening. Chance of precipitation is 10%.             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Hourly Breakdown (Optional)                           │ │
│  │                                                        │ │
│  │  12a  1a  2a  3a  4a  5a  6a  7a  8a  9a  10a  11a    │ │
│  │  70°  69°  68°  67°  66°  65°  66°  68°  72°  76°  80°│ │
│  │  🌙  🌙  🌙  🌙  🌙  🌙  🌙  ☀️  ☀️  ☀️  ☀️          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal Overlay
- Semi-transparent dark background (backdrop)
- Click outside to close (optional)
- Escape key to close
- Modal centered on screen
- Smooth fade-in animation

### Header
- **Date**: Full date display (e.g., "Monday, September 30, 2024")
- **Close button**: X icon in top-right corner
- Divider line below header

### Day/Night Cards (Side-by-side)
Two equal-width cards showing:

**Daytime Card**:
- Sun icon or "Daytime" label
- Weather icon (large, centered)
- Short forecast description
- High temperature (prominent)
- Precipitation probability
- Wind speed and direction

**Nighttime Card**:
- Moon icon or "Nighttime" label
- Weather icon (large, centered)
- Short forecast description
- Low temperature (prominent)
- Precipitation probability
- Wind speed and direction

### Detailed Forecast Section
- Full-width card below day/night cards
- Section heading: "Detailed Forecast"
- Two paragraphs:
  - **Daytime**: Full detailed forecast text
  - **Nighttime**: Full detailed forecast text
- Adequate line spacing for readability

### Hourly Breakdown (Optional)
- Full-width section at bottom
- Section heading: "Hourly Breakdown"
- Horizontal scrollable timeline of hours for the selected day
- Each hour shows:
  - Time label
  - Temperature
  - Weather icon (small)
  - Optional: Precipitation probability

### Styling Guidelines
- Modal max-width: ~600-700px
- Adequate padding and spacing
- Rounded corners on modal
- Shadow for depth perception
- Consistent typography hierarchy
- Weather icons sized appropriately
- Scrollable content if modal exceeds viewport height

## Data Requirements

### Data Sources
- **Primary**: `DailyForecast` object passed from Seven-Day Forecast Card
- **Optional**: Filtered `hourlyData` for the selected day (if displaying hourly breakdown)

### Data Processing
1. **Date Formatting**:
   - Convert ISO date to readable format: "Monday, September 30, 2024"
   - Handle "Today" and "Tomorrow" labels if applicable

2. **Temperature Display**:
   - High from day period
   - Low from night period
   - Format with degree symbol and unit

3. **Forecast Text**:
   - Day and night detailed forecasts
   - Preserve paragraph structure
   - Handle missing nighttime forecast (some APIs might not provide it)

4. **Hourly Data** (if included):
   - Filter hourly forecast for the selected date (midnight to midnight)
   - Format times appropriately
   - Extract temperature and icon for each hour

### Missing Data Handling
- If night forecast missing: Show only day forecast
- If specific fields unavailable: Display "N/A" or omit field
- Gracefully degrade if optional data not available

## User Interactions

### Opening Modal
- Triggered by clicking a day in Seven-Day Forecast Card
- Fade-in animation (200-300ms)
- Focus trap: Tab navigation stays within modal
- Initial focus on close button or modal container

### Closing Modal
Multiple methods:
1. Click close (X) button
2. Press Escape key
3. Click outside modal (on backdrop) - optional
4. Navigate with keyboard to close button and press Enter/Space

### Modal Behavior
- **Scrolling**:
  - Body scroll locked when modal open
  - Modal content scrollable if exceeds viewport
- **Focus management**:
  - Focus trapped within modal
  - Return focus to trigger element on close
- **Animations**:
  - Fade-in on open
  - Fade-out on close
  - Smooth transitions

### Hourly Breakdown (if present)
- Horizontal scroll if hours exceed width
- Snap scrolling for better UX (optional)
- Tap/click on hour for more details (future enhancement)

## Responsive Behavior

### Desktop (≥1024px)
- Modal at comfortable width (600-700px)
- Day/night cards side-by-side
- All content visible without much scrolling
- Hover states on interactive elements

### Tablet (768px - 1023px)
- Modal width adjusted for viewport
- Maintain side-by-side day/night cards if possible
- Reduce padding slightly
- Content may require scrolling

### Mobile (<768px)
- **Full-screen or near full-screen modal**
- **Vertical layout**: Stack day/night cards
  - Daytime card on top
  - Nighttime card below
- Reduced padding for compact display
- Touch-friendly close button
- Hourly breakdown with horizontal scroll
- Modal takes up most of viewport height

## Accessibility Considerations

### Semantic HTML
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-content">
    <h2 id="modal-title">Monday, September 30, 2024</h2>
    <button aria-label="Close forecast details">
      <X />
    </button>

    <div class="day-night-container">
      <section aria-label="Daytime forecast">
        <!-- Day content -->
      </section>
      <section aria-label="Nighttime forecast">
        <!-- Night content -->
      </section>
    </div>

    <section aria-label="Detailed forecast text">
      <!-- Detailed forecasts -->
    </section>
  </div>
</div>
```

### ARIA Attributes
- `role="dialog"` on modal container
- `aria-modal="true"` to indicate modal state
- `aria-labelledby` pointing to modal title
- `aria-describedby` for modal description (optional)
- Close button: Clear `aria-label`

### Focus Management
- Trap focus within modal while open
- Initial focus on close button or first focusable element
- Restore focus to trigger element on close
- Tab order follows logical reading order

### Keyboard Navigation
- **Escape**: Close modal
- **Tab**: Navigate through focusable elements
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons
- Focus visible indicators

### Screen Reader Support
- Announce modal opening: "Forecast details for Monday, September 30"
- Read content in logical order
- Announce close button clearly
- Provide context for each section
- Announce temperatures with "degrees" unit

### Color Considerations
- Sufficient contrast for all text on modal background
- Works in both light and dark modes
- Backdrop provides clear visual separation

## Loading States

### Modal Loading
If modal needs to fetch additional data on open:
```
┌─────────────────────────────────────────────────────────────┐
│  Monday, September 30                                    [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ⏳ Loading details...                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Centered spinner or loading message
- Close button still functional

### Normal State
- All data loaded before modal opens (preferred)
- Smooth content display

## Example Usage

```tsx
import { ForecastDayModal } from '@/components/weather/ForecastDayModal';
import { SevenDayForecastCard } from '@/components/weather/SevenDayForecastCard';
import { useState } from 'react';

function WeatherDashboard({ forecast, hourlyData }: Props) {
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  // Filter hourly data for selected day
  const selectedDayHourly = selectedDay
    ? hourlyData.filter(h => isSameDay(h.timestamp, selectedDay.date))
    : undefined;

  return (
    <>
      <SevenDayForecastCard
        forecast={forecast}
        onDayClick={setSelectedDay}
      />

      <ForecastDayModal
        day={selectedDay}
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        hourlyData={selectedDayHourly}
      />
    </>
  );
}
```

## Edge Cases

1. **Missing Night Forecast**:
   - Show only daytime card or
   - Display message "Night forecast unavailable"

2. **Same Temperature High/Low**:
   - Display as is, don't hide
   - Possible on certain days

3. **No Hourly Data**:
   - Omit hourly breakdown section entirely
   - Modal functions normally

4. **Very Long Forecast Text**:
   - Allow scrolling within modal
   - Consider max-height with scroll

5. **Modal While Mobile Keyboard Open**:
   - Handle viewport resize gracefully
   - Ensure close button always visible

6. **Rapid Open/Close**:
   - Prevent animation conflicts
   - Debounce if necessary

## Performance Considerations

- Lazy load modal component (React.lazy)
- Mount/unmount vs. show/hide (mount preferred for performance)
- Memoize modal content
- Optimize animations (use CSS transforms)
- Avoid re-rendering when modal closed
- Lightweight modal library or custom implementation

## Testing Requirements

- Open and close modal with various methods
- Test with complete and partial data
- Test with missing night forecast
- Test keyboard navigation (Tab, Escape)
- Test focus trap functionality
- Test focus restoration on close
- Test with screen reader
- Test responsive layouts at all breakpoints
- Verify day/night card stacking on mobile
- Test scrolling behavior (modal content and hourly breakdown)
- Verify backdrop click behavior
- Test animation smoothness
- Verify accessibility attributes
- Test with extremely long forecast text
- Test rapid open/close scenarios
- Verify body scroll lock when modal open