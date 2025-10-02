# Alert Card Component Specification

## Component Information

- **File**: `/workspaces/weather-app/src/components/AlertCard.tsx`
- **Type Definition**: `/workspaces/weather-app/src/types/weather.ts` (Alert interface)
- **Component Size**: ~170 lines
- **Dependencies**:
  - `@/components/ui/card` (shadcn/ui)
  - `@/components/ui/badge` (shadcn/ui)
  - `@/components/ui/button` (shadcn/ui)
  - `lucide-react` (AlertTriangle, ChevronDown, ChevronUp icons)
  - `date-fns` (format function)
  - `react` (useState hook)

## Purpose and Overview

Displays active weather alerts for the user's location based on county-level data from the NWS API. The card is conditionally rendered only when active alerts exist. Multiple alerts are displayed in a vertically stacked layout with severity-based visual styling to communicate urgency.

## Props/API Interface

```typescript
interface AlertCardProps {
  alerts: Alert[];
}

interface Alert {
  id: string;
  areaDesc: string;          // Geographic area description
  event: string;             // e.g., "Tornado Warning", "Flash Flood Watch"
  headline: string;          // Brief alert headline
  description: string;       // Full alert description text
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  onset: string;             // ISO 8601 timestamp
  expires: string;           // ISO 8601 timestamp
  status: string;
  messageType: string;
  category: string;
}
```

**Note**: The component receives alerts via props. It does not use Zustand stores or manage loading states internally - the parent component is responsible for data fetching and state management.

**Component Structure**: The AlertCard component renders a list of SingleAlert sub-components. Each SingleAlert manages its own expanded/collapsed state independently using the `useState` hook.

## Layout and Visual Design

### Card Structure
- Outer container (`div` with `space-y-4` for vertical spacing)
- Each alert rendered as a separate `SingleAlert` sub-component
- Alerts stacked vertically with consistent 1rem spacing
- Returns `null` when `alerts` array is empty or undefined
- Each alert has independent expand/collapse state (default: collapsed)

### Individual Alert Layout

**Collapsed State (Default)**:
```
┌─────────────────────────────────────────┐
│ [⚠️ ICON] Headline Text                 │
│          Severity Badge | Urgency Badge │
│          Event Badge (outline)          │
│                                         │
│          Effective: [date/time]         │
│          Expires: [date/time]           │
│                                         │
│      [ ⌄ Show Details ]                 │
└─────────────────────────────────────────┘
```

**Expanded State**:
```
┌─────────────────────────────────────────┐
│ [⚠️ ICON] Headline Text                 │
│          Severity Badge | Urgency Badge │
│          Event Badge (outline)          │
│                                         │
│ Effective: [date/time]                  │
│ Expires: [date/time]                    │
│                                         │
│ Description text wraps naturally and    │
│ provides full context of the alert...   │
│                                         │
│ Areas: [area description]               │
│                                         │
│      [ ∧ Show Less ]                    │
└─────────────────────────────────────────┘
```

**Actual Layout Components**:
- `Card` with left border accent (`border-l-4 border-l-red-600 dark:border-l-red-400`)
- `CardHeader` contains icon, headline, badges, and timestamps (collapsed view)
- `CardContent` (conditionally rendered when expanded) contains timestamps, description, and area information
- Expand/collapse `Button` at bottom of card (`variant="ghost"`, `size="sm"`, full width)

### Severity-Based Styling

**Implementation Note**: All alerts use a red left border (`border-l-red-600 dark:border-l-red-400`) and red `AlertTriangle` icon. Severity is differentiated through badge colors only.

**Card Appearance**:
- Left Border: `border-l-4 border-l-red-600 dark:border-l-red-400` (all severities)
- Icon: `AlertTriangle` from lucide-react with red color (`text-red-600 dark:text-red-400`)
- Badge colors differentiate severity levels

**Severity Badge Colors** (via `getSeverityColor` function):
- **Extreme**: `bg-red-600 text-white hover:bg-red-700`
- **Severe**: `bg-orange-600 text-white hover:bg-orange-700`
- **Moderate**: `bg-yellow-600 text-white hover:bg-yellow-700`
- **Minor**: `bg-blue-600 text-white hover:bg-blue-700`
- **Unknown**: `bg-gray-600 text-white hover:bg-gray-700`

**Urgency Badge Colors** (via `getUrgencyColor` function):
- **Immediate**: `bg-red-500 text-white hover:bg-red-600`
- **Expected**: `bg-orange-500 text-white hover:bg-orange-600`
- **Future**: `bg-blue-500 text-white hover:bg-blue-600`
- **Past**: `bg-gray-500 text-white hover:bg-gray-600`
- **Unknown**: `bg-gray-400 text-white hover:bg-gray-500`

**Event Badge**: `variant="outline"` (gray outline style from shadcn/ui)

### Typography
- Headline: `CardTitle` with `text-xl` class
- Badges: Default Badge component typography
- Timestamps: `text-sm text-muted-foreground` with `<strong>` labels
- Description: `text-sm leading-relaxed whitespace-pre-line` (preserves line breaks)
- Area Description: `text-xs text-muted-foreground` with `<strong>` label

## Data Requirements

### NWS API Endpoint
```
GET /alerts/active?point={lat},{lon}
```

### Data Transformation
- Parse alert features from GeoJSON response
- Extract properties: `id`, `event`, `headline`, `severity`, `urgency`, `description`, `onset`, `expires`, `areaDesc`, `status`, `messageType`, `category`
- Format timestamps using `date-fns` `format()` function: `'MMM d, h:mm a'` (e.g., "Jan 15, 3:45 PM")
- Server-side sorting by severity (Extreme → Severe → Moderate → Minor)
- No client-side filtering of expired alerts in this component

### Caching Strategy
- **No caching** - Alerts are time-sensitive and should always be fresh
- Server should always fetch latest data for alerts endpoint
- Client refreshes alert data with general refresh cycle (1 minute)

## User Interactions

### Implemented

**Alert Expansion/Collapse**:
- Alerts start in collapsed state by default (showing headline, badges, and timestamps only)
- "Show Details" button expands to reveal full description and area
- "Show Less" button collapses back to summary view
- Each alert manages its own expanded/collapsed state independently
- Button includes chevron icon (ChevronDown/ChevronUp) for visual indication
- Click anywhere on the button to toggle state

**Keyboard Accessibility**:
- Expand/collapse button is keyboard accessible (standard button behavior)
- `aria-expanded` attribute reflects current state
- `aria-controls` attribute links button to content (using `alert-content-{index}` ID)
- Chevron icons use `aria-hidden="true"` (decorative only)

### Not Implemented
- Alert dismissal
- Automatic URL linkification in descriptions

## Responsive Behavior

**Implementation**: Uses Tailwind CSS flexbox with `flex-wrap` for responsive badge layout.

- Badges use `flex flex-wrap gap-2` to wrap on smaller screens
- Timestamps use `flex flex-wrap gap-x-4 gap-y-1` to wrap when needed
- Icon has `flex-shrink-0` to maintain size
- All layouts adapt naturally via Tailwind's responsive utilities
- No custom breakpoint-specific styling implemented

## Accessibility Considerations

**Current Implementation**: Comprehensive accessibility through semantic HTML, ARIA attributes, and keyboard support.

### Implemented
- Semantic HTML via shadcn/ui Card components
- `role="alert"` on each card for screen reader announcement
- `aria-live` attribute with dynamic values:
  - `"assertive"` for Extreme/Severe alerts (interrupts screen reader)
  - `"polite"` for Moderate/Minor/Unknown alerts (waits for pause)
- `aria-label` on each card provides full context: severity, event type
- Visual indicators beyond color: AlertTriangle icon for all alerts
- Text labels for severity/urgency (not color-only)
- `<strong>` tags for timestamp and area labels
- Dark mode support with appropriate contrast
- Explicit heading hierarchy: `<h3>` for alert headlines
- Keyboard accessible expand/collapse button
- `aria-expanded` attribute on button (true/false based on state)
- `aria-controls` attribute links button to content section
- Decorative icons marked with `aria-hidden="true"`

### Not Implemented
- Alert dismissal functionality

## Loading States

**Current Implementation**: Component does not handle loading or error states.

- Returns `null` when alerts array is empty or undefined
- No skeleton screens
- No loading indicators
- No error handling

**Note**: Loading and error states are managed by parent component.

## Example Usage

```tsx
import { AlertCard } from '@/components/AlertCard';
import { Alert } from '@/types/weather';

function WeatherDashboard() {
  const alerts: Alert[] = [
    {
      id: 'alert-123',
      areaDesc: 'Collin County',
      event: 'Severe Thunderstorm Warning',
      headline: 'Severe Thunderstorm Warning issued for Collin County',
      description: 'A severe thunderstorm capable of producing...',
      severity: 'Severe',
      urgency: 'Immediate',
      onset: '2025-01-15T15:30:00-06:00',
      expires: '2025-01-15T18:00:00-06:00',
      status: 'Actual',
      messageType: 'Alert',
      category: 'Met'
    }
  ];

  return <AlertCard alerts={alerts} />;
}
```

**Note**: Component automatically handles empty/null arrays by returning `null`.

## Edge Cases

**Current Handling**:

1. **Multiple Severe Alerts**: All rendered with vertical stacking (`space-y-4`)
2. **Long Descriptions**: Displayed in full with `whitespace-pre-line` for line breaks
3. **Expired Alerts**: No client-side filtering (assumes server filters)
4. **Missing Fields**: Uses optional chaining and conditional rendering for `areaDesc`
5. **Timezone Handling**: Timestamps displayed as received; formatted via `date-fns`
6. **Invalid Dates**: Try/catch in `formatAlertTime()` returns original string on error

## Performance Considerations

**Current Implementation**:
- No memoization
- No `React.memo` wrapper
- Helper functions (`getSeverityColor`, `getUrgencyColor`, `formatAlertTime`, `getAriaLive`) are pure functions defined outside component
- Uses static imports for icons from lucide-react (AlertTriangle, ChevronDown, ChevronUp)
- Each `SingleAlert` component maintains its own state via `useState`
- Expand/collapse state changes only trigger re-render of individual alert, not entire list

**Optimization Opportunities**:
- Could wrap `SingleAlert` in `React.memo` if re-rendering becomes an issue
- Could memoize color calculation functions (currently recalculated on each render)
- State management is already efficient (isolated to individual alerts)

## Testing Requirements

### Recommended Test Coverage
- Render with different severity levels (Extreme, Severe, Moderate, Minor, Unknown)
- Render with different urgency levels (Immediate, Expected, Future, Past, Unknown)
- Render with multiple simultaneous alerts
- Render with missing `areaDesc` field
- Test timestamp formatting (valid and invalid dates)
- Verify null/empty array returns null
- Verify color classes applied correctly for each severity/urgency
- Test responsive badge wrapping behavior
- Verify dark mode color variants
- **Test expansion/collapse behavior**:
  - Alerts start in collapsed state by default
  - Clicking "Show Details" expands to reveal description and area
  - Clicking "Show Less" collapses back to summary view
  - Each alert's state is independent (expanding one doesn't affect others)
  - Button text and icon change based on state
  - `aria-expanded` attribute updates correctly
- **Test accessibility attributes**:
  - Verify `role="alert"` on each card
  - Verify `aria-live` is "assertive" for Extreme/Severe, "polite" for others
  - Verify `aria-label` provides full context
  - Verify `aria-expanded` and `aria-controls` on button
  - Verify button is keyboard accessible

### Not Required (No Implementation)
- Sorting verification (handled server-side)
- Alert dismissal (not implemented)