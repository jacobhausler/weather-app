# Alert Card Component Specification

## Purpose and Overview

Displays active weather alerts for the user's location based on county-level data from the NWS API. The card is conditionally rendered only when active alerts exist. Multiple alerts are displayed in a vertically stacked layout with severity-based visual styling to communicate urgency.

## Props/API Interface

```typescript
interface AlertCardProps {
  alerts: WeatherAlert[];
  isLoading?: boolean;
  className?: string;
}

interface WeatherAlert {
  id: string;
  type: string;              // e.g., "Tornado Warning", "Flash Flood Watch"
  headline: string;          // Brief alert headline
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  certainty: 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';
  description: string;       // Full alert description text
  instruction?: string;      // Safety instructions (if provided)
  effective: string;         // ISO 8601 timestamp
  expires: string;           // ISO 8601 timestamp
  onset?: string;            // ISO 8601 timestamp
  areaDesc: string;          // Geographic area description
}
```

## Layout and Visual Design

### Card Structure
- Outer container with appropriate padding and rounded corners
- Each alert rendered as a separate sub-card within the main card
- Alerts stacked vertically with consistent spacing
- No card displayed when `alerts` array is empty

### Individual Alert Layout
```
┌─────────────────────────────────────────┐
│ [ICON] Alert Type                       │
│        Headline Text                    │
│                                         │
│ Severity Badge | Urgency Badge          │
│                                         │
│ Description text wraps naturally and    │
│ provides full context of the alert...   │
│                                         │
│ [Safety Instructions if present]        │
│                                         │
│ Effective: [formatted date/time]        │
│ Expires: [formatted date/time]          │
└─────────────────────────────────────────┘
```

### Severity-Based Styling

**Extreme**
- Background: Red-tinted (e.g., `bg-red-50 dark:bg-red-950`)
- Border: Red accent (e.g., `border-red-500`)
- Icon: Warning triangle, red color
- Badge: Red background

**Severe**
- Background: Orange-tinted (e.g., `bg-orange-50 dark:bg-orange-950`)
- Border: Orange accent (e.g., `border-orange-500`)
- Icon: Warning triangle, orange color
- Badge: Orange background

**Moderate**
- Background: Yellow-tinted (e.g., `bg-yellow-50 dark:bg-yellow-950`)
- Border: Yellow accent (e.g., `border-yellow-500`)
- Icon: Alert circle, yellow color
- Badge: Yellow background

**Minor**
- Background: Blue-tinted (e.g., `bg-blue-50 dark:bg-blue-950`)
- Border: Blue accent (e.g., `border-blue-500`)
- Icon: Info circle, blue color
- Badge: Blue background

**Unknown**
- Background: Gray-tinted (e.g., `bg-gray-50 dark:bg-gray-950`)
- Border: Gray accent (e.g., `border-gray-500`)
- Icon: Alert circle, gray color
- Badge: Gray background

### Typography
- Alert Type: Bold, medium size (e.g., `font-semibold text-base`)
- Headline: Bold, slightly larger (e.g., `font-bold text-lg`)
- Description: Regular weight, readable line height
- Timestamps: Smaller, muted color (e.g., `text-sm text-muted-foreground`)
- Instructions: Italicized or distinct styling to emphasize importance

## Data Requirements

### NWS API Endpoint
```
GET /alerts/active?point={lat},{lon}
```

### Data Transformation
- Parse alert features from GeoJSON response
- Extract properties: `event`, `headline`, `severity`, `urgency`, `certainty`, `description`, `instruction`, `effective`, `expires`, `onset`, `areaDesc`
- Sort alerts by severity (Extreme → Severe → Moderate → Minor)
- Filter out expired alerts on the client side
- Format timestamps to user-friendly local time

### Caching Strategy
- **No caching** - Alerts are time-sensitive and should always be fresh
- Server should always fetch latest data for alerts endpoint
- Client refreshes alert data with general refresh cycle (1 minute)

## User Interactions

### Alert Expansion (Optional Enhancement)
- Initial state: Show headline and severity badges
- Collapsed: Description and instructions hidden
- Click to expand: Full description and instructions visible
- Icon changes to indicate expand/collapse state

### Dismissal (Future Feature)
- User can dismiss specific alerts
- Dismissed alerts stored in localStorage
- Dismissed alerts hidden until new alert with different ID appears

### Links
- If alert description contains URLs, render as clickable links
- Open external links in new tab with `rel="noopener noreferrer"`

## Responsive Behavior

### Desktop (≥1024px)
- Full width within main layout
- Description text allows for wider reading
- Badges displayed horizontally

### Tablet (768px - 1023px)
- Adjust padding for medium screens
- Maintain full alert information visibility
- Badges may wrap if needed

### Mobile (<768px)
- Reduce padding for compact display
- Stack badges vertically if horizontal space insufficient
- Ensure description text remains readable
- Timestamps may abbreviate format (e.g., "Today 3:45 PM")

## Accessibility Considerations

### Semantic HTML
- Use `<article>` or `<section>` for each alert
- Use appropriate heading levels (`<h3>` for alert type)
- Use `role="alert"` for extreme/severe alerts to trigger screen readers
- Use `aria-live="polite"` for moderate/minor alerts

### ARIA Labels
```html
<div role="alert" aria-labelledby="alert-headline-{id}" aria-describedby="alert-desc-{id}">
  <h3 id="alert-headline-{id}">{headline}</h3>
  <p id="alert-desc-{id}">{description}</p>
</div>
```

### Color Contrast
- Ensure text meets WCAG AA standards (4.5:1 for normal text)
- Don't rely solely on color to convey severity (use icons + text)
- Test color combinations in both light and dark modes

### Keyboard Navigation
- Focusable elements should have visible focus indicators
- If expandable, toggle with Enter/Space keys
- Tab order should follow logical reading order

### Screen Reader Support
- Announce severity level: "Extreme severity tornado warning"
- Provide context: "Weather alert effective until..."
- Read instructions clearly

## Loading States

### Initial Load
- Show skeleton placeholder with similar dimensions to actual alert card
- Pulsing animation on skeleton elements
- Avoid layout shift when data loads

### Refresh
- Non-interrupting refresh (no skeleton replacement)
- Subtle indicator that data is being updated (optional)
- Smooth transition when new alerts appear or existing ones disappear

### Error State
- Display error message if alerts endpoint fails
- Provide retry mechanism
- Don't prevent rest of app from functioning

## Example Usage

```tsx
import { AlertCard } from '@/components/weather/AlertCard';
import { useWeatherData } from '@/hooks/useWeatherData';

function WeatherDashboard({ zipCode }: { zipCode: string }) {
  const { alerts, isLoading } = useWeatherData(zipCode);

  // Only render if alerts exist
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <AlertCard
      alerts={alerts}
      isLoading={isLoading}
      className="mb-4"
    />
  );
}
```

## Edge Cases

1. **Multiple Severe Alerts**: Ensure all alerts are visible, not truncated
2. **Long Descriptions**: Implement text truncation with "Read more" if needed
3. **Expired Alerts**: Filter out on client side before rendering
4. **Missing Fields**: Gracefully handle missing optional fields (instruction, onset)
5. **Timezone Handling**: Convert UTC timestamps to user's local time
6. **Alert Updates**: Smoothly transition when alerts change during refresh

## Performance Considerations

- Memoize severity styling logic
- Use React.memo for individual alert components if rendering many alerts
- Avoid re-rendering when unrelated state changes
- Lazy load icon components if using icon library

## Testing Requirements

- Render with different severity levels
- Render with multiple simultaneous alerts
- Render with missing optional fields
- Verify proper sorting by severity
- Test timestamp formatting
- Test responsive breakpoints
- Verify accessibility with screen reader
- Test keyboard navigation
- Verify color contrast in both themes